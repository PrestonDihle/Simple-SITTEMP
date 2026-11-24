/**
 * Simple SITTEMP - Viewshed Module
 *
 * Viewsheds attached to placed symbol markers:
 *   - Range fan: instant geometric sector/circle from range, azimuth and arc.
 *   - Terrain mask (optional): line-of-sight along radial rays using the Google
 *     Maps Elevation service; only the ground the observer can see is shaded.
 *
 * Config lives in marker._sittemp.viewshed (so it rides along in undo snapshots).
 * Map overlays (marker._vs) and computed masks (_maskCache) are runtime-only.
 * Azimuths are stored in degrees from true north; the UI shows mils or degrees.
 */

import { get, set } from './state.js';
import { showToast } from './toolbar.js';

const EARTH_R = 6371008.8;          // mean Earth radius (m)
const REFRACTION_K = 0.13;          // standard atmospheric refraction coefficient
const SAMPLES_PER_RAY = 128;        // elevation samples along each ray
const LOCATIONS_PER_REQUEST = 512;  // Elevation service per-request limit
const MAX_CONCURRENT = 3;
const MAX_CACHE = 40;

export const MILS_PER_DEG = 6400 / 360;

export const VIEWSHED_DEFAULTS = {
    range: 3000,      // meters
    azimuth: 0,       // degrees, true north
    arc: 360,         // degrees (360 = full circle)
    obsHeight: 2,     // meters above ground at the observer
    tgtHeight: 2,     // meters above ground at the target
    color: '#FF8C00',
    opacity: 0.3,     // fill opacity
    lineWidth: 2,     // outline thickness (px)
    lineOpacity: 0.9, // outline opacity
    lineType: 'solid', // 'solid' | 'dashed' | 'dotted'
    terrain: false,
};

export const VIEWSHED_LINE_TYPES = [
    { key: 'solid', name: 'Solid' },
    { key: 'dashed', name: 'Dashed' },
    { key: 'dotted', name: 'Dotted' },
];

/** Outline style with defaults filled in (older saved viewsheds lack these fields). */
function _lineStyle(vs) {
    const w = +vs.lineWidth;
    const op = +vs.lineOpacity;
    return {
        width: Math.max(1, Math.min(10, isNaN(w) ? VIEWSHED_DEFAULTS.lineWidth : w)),
        opacity: Math.max(0, Math.min(1, (vs.lineOpacity === undefined || isNaN(op)) ? VIEWSHED_DEFAULTS.lineOpacity : op)),
        type: ['solid', 'dashed', 'dotted'].indexOf(vs.lineType) !== -1 ? vs.lineType : 'solid',
    };
}

/**
 * google.maps.Polyline options for the fan outline. Polygons can't draw dashed
 * edges, so the outline is a separate polyline; dashes/dots use repeated symbols.
 */
function _outlineOptions(vs) {
    const s = _lineStyle(vs);
    if (s.type === 'solid') {
        return { strokeColor: vs.color, strokeOpacity: s.opacity, strokeWeight: s.width, icons: [] };
    }
    let icon, repeat;
    if (s.type === 'dashed') {
        const dash = Math.max(3, s.width * 2);   // half-length of each dash in px
        icon = { path: 'M 0,-1 0,1', strokeColor: vs.color, strokeOpacity: s.opacity, strokeWeight: s.width, scale: dash };
        repeat = (dash * 4) + 'px';
    } else {
        icon = { path: google.maps.SymbolPath.CIRCLE, fillColor: vs.color, fillOpacity: s.opacity, strokeWeight: 0, scale: Math.max(1, s.width / 2) };
        repeat = Math.max(5, s.width * 3) + 'px';
    }
    return { strokeColor: vs.color, strokeOpacity: 0, strokeWeight: s.width, icons: [{ icon: icon, offset: '0', repeat: repeat }] };
}

const VS_COLORS = ['#FF8C00', '#FF0000', '#0000FF', '#00AA00', '#800080', '#000000', '#FFFFFF', '#808080'];

const _maskCache = new Map();   // key -> array of rings [[lat,lng], ...]
const _inFlight = new Map();    // key -> Promise
let _elevationService = null;
let _elevationDenied = false;

// ===== Geometry =====

function destPoint(lat, lng, bearingDeg, dist) {
    const d = dist / EARTH_R;
    const b = bearingDeg * Math.PI / 180;
    const p1 = lat * Math.PI / 180;
    const l1 = lng * Math.PI / 180;
    const p2 = Math.asin(Math.sin(p1) * Math.cos(d) + Math.cos(p1) * Math.sin(d) * Math.cos(b));
    const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(d) * Math.cos(p1), Math.cos(d) - Math.sin(p1) * Math.sin(p2));
    return { lat: p2 * 180 / Math.PI, lng: ((l2 * 180 / Math.PI) + 540) % 360 - 180 };
}

function _norm(vs) {
    return {
        range: Math.max(50, Math.min(50000, +vs.range || VIEWSHED_DEFAULTS.range)),
        azimuth: (((+vs.azimuth || 0) % 360) + 360) % 360,
        arc: Math.max(1, Math.min(360, +vs.arc || 360)),
        obsHeight: Math.max(0, +vs.obsHeight || 0),
        tgtHeight: Math.max(0, +vs.tgtHeight || 0),
    };
}

/** Outline of the range fan (closed path of {lat,lng}). */
export function fanPath(pos, vs) {
    const v = _norm(vs);
    const path = [];
    if (v.arc >= 360) {
        for (let a = 0; a < 360; a += 3) path.push(destPoint(pos.lat, pos.lng, a, v.range));
        return path;
    }
    const start = v.azimuth - v.arc / 2;
    const steps = Math.max(2, Math.ceil(v.arc / 2));
    path.push({ lat: pos.lat, lng: pos.lng });
    for (let i = 0; i <= steps; i++) path.push(destPoint(pos.lat, pos.lng, start + v.arc * i / steps, v.range));
    path.push({ lat: pos.lat, lng: pos.lng });
    return path;
}

function _closed(path) {
    if (!path.length) return path;
    const a = path[0], b = path[path.length - 1];
    return (a.lat === b.lat && a.lng === b.lng) ? path : path.concat([a]);
}

function _posOf(marker) {
    const p = marker.getPosition();
    return { lat: p.lat(), lng: p.lng() };
}

function maskKey(pos, vs) {
    const v = _norm(vs);
    return [pos.lat.toFixed(5), pos.lng.toFixed(5), v.range, v.azimuth.toFixed(2), v.arc.toFixed(2), v.obsHeight, v.tgtHeight].join('|');
}

// ===== Terrain mask =====

function _getElevations(locations) {
    if (!_elevationService) _elevationService = new google.maps.ElevationService();
    return new Promise(function (resolve, reject) {
        let attempt = 0;
        function go() {
            _elevationService.getElevationForLocations({ locations: locations }, function (results, status) {
                if (status === 'OK' && results && results.length === locations.length) {
                    resolve(results.map(function (r) { return r.elevation; }));
                } else if ((status === 'OVER_QUERY_LIMIT' || status === 'UNKNOWN_ERROR') && attempt < 6) {
                    attempt++;
                    setTimeout(go, 400 * Math.pow(2, attempt));
                } else {
                    reject(new Error(status || 'ELEVATION_ERROR'));
                }
            });
        }
        go();
    });
}

async function _computeMask(pos, vs, onProgress) {
    const v = _norm(vs);
    const full = v.arc >= 360;
    const rays = Math.max(12, Math.min(120, Math.round(v.arc / 3)));
    const width = v.arc / rays;
    const start = full ? 0 : v.azimuth - v.arc / 2;
    const spacing = v.range / (SAMPLES_PER_RAY - 1);

    // Sample points for every ray, flattened; observer point first on each ray.
    const angles = [];
    const pts = [];
    for (let i = 0; i < rays; i++) {
        const a = start + (i + 0.5) * width;
        angles.push(a);
        for (let j = 0; j < SAMPLES_PER_RAY; j++) {
            const p = j === 0 ? pos : destPoint(pos.lat, pos.lng, a, j * spacing);
            pts.push(new google.maps.LatLng(p.lat, p.lng));
        }
    }

    // Fetch elevations in batches with limited concurrency.
    const batches = [];
    for (let k = 0; k < pts.length; k += LOCATIONS_PER_REQUEST) batches.push(k);
    const elev = new Array(pts.length);
    let done = 0;
    let next = 0;
    async function worker() {
        while (next < batches.length) {
            const k = batches[next++];
            const chunk = pts.slice(k, k + LOCATIONS_PER_REQUEST);
            const res = await _getElevations(chunk);
            for (let n = 0; n < res.length; n++) elev[k + n] = res[n];
            done++;
            if (onProgress) onProgress(done / batches.length);
        }
    }
    const workers = [];
    for (let w = 0; w < Math.min(MAX_CONCURRENT, batches.length); w++) workers.push(worker());
    await Promise.all(workers);

    // Line of sight along each ray, with Earth curvature and refraction.
    const rings = [];
    const curv = (1 - REFRACTION_K) / (2 * EARTH_R);
    for (let i = 0; i < rays; i++) {
        const base = i * SAMPLES_PER_RAY;
        const h0 = elev[base] + v.obsHeight;
        let maxSlope = -Infinity;
        const visible = [true];
        for (let j = 1; j < SAMPLES_PER_RAY; j++) {
            const d = j * spacing;
            const drop = d * d * curv;
            const ground = elev[base + j] - drop - h0;
            visible.push((ground + v.tgtHeight) / d >= maxSlope);
            maxSlope = Math.max(maxSlope, ground / d);
        }
        // Merge visible runs into wedge segments
        const a0 = angles[i] - width / 2, a1 = angles[i] + width / 2;
        let j = 0;
        while (j < SAMPLES_PER_RAY) {
            if (!visible[j]) { j++; continue; }
            let k = j;
            while (k + 1 < SAMPLES_PER_RAY && visible[k + 1]) k++;
            const rIn = Math.max(0, (j - 0.5) * spacing);
            const rOut = Math.min(v.range, (k + 0.5) * spacing);
            const ring = [];
            if (rIn === 0) {
                ring.push(pos);
            } else {
                ring.push(destPoint(pos.lat, pos.lng, a0, rIn));
            }
            ring.push(destPoint(pos.lat, pos.lng, a0, rOut));
            ring.push(destPoint(pos.lat, pos.lng, a1, rOut));
            if (rIn > 0) ring.push(destPoint(pos.lat, pos.lng, a1, rIn));
            rings.push(ring.map(function (p) { return [+p.lat.toFixed(6), +p.lng.toFixed(6)]; }));
            j = k + 1;
        }
    }
    return rings;
}

function _requestMask(marker) {
    const vs = marker._sittemp.viewshed;
    const pos = _posOf(marker);
    const key = maskKey(pos, vs);
    if (_maskCache.has(key)) return Promise.resolve(_maskCache.get(key));
    if (_inFlight.has(key)) return _inFlight.get(key);

    _setStatus(marker, 'Computing… 0%');
    const p = _computeMask(pos, vs, function (f) {
        _setStatus(marker, 'Computing… ' + Math.round(f * 100) + '%');
    }).then(function (rings) {
        _maskCache.set(key, rings);
        if (_maskCache.size > MAX_CACHE) _maskCache.delete(_maskCache.keys().next().value);
        _inFlight.delete(key);
        return rings;
    }, function (err) {
        _inFlight.delete(key);
        throw err;
    });
    _inFlight.set(key, p);
    return p;
}

function _setStatus(marker, text) {
    marker._vsStatus = text;
    const el = document.getElementById('vs-status');
    if (el && el._marker === marker) el.textContent = text;
}

// ===== Overlays =====

/** Remove a marker's viewshed overlays and listeners from the map. */
export function clearViewshedOverlays(marker) {
    const o = marker && marker._vs;
    if (!o) return;
    o.fan.setMap(null);
    o.outline.setMap(null);
    o.mask.setMap(null);
    o.listeners.forEach(function (l) { google.maps.event.removeListener(l); });
    marker._vs = null;
}

/** Create/update overlays for a marker from marker._sittemp.viewshed. */
export function syncViewshed(marker) {
    const vs = marker && marker._sittemp && marker._sittemp.viewshed;
    if (!vs || !marker.getMap()) { clearViewshedOverlays(marker); return; }
    const map = get('map');
    const pos = _posOf(marker);

    if (!marker._vs) {
        const common = { map: map, clickable: false };
        marker._vs = {
            fan: new google.maps.Polygon(Object.assign({ zIndex: 4, strokeWeight: 0 }, common)),
            outline: new google.maps.Polyline(Object.assign({ zIndex: 5 }, common)),
            mask: new google.maps.Polygon(Object.assign({ zIndex: 3, strokeWeight: 0 }, common)),
            listeners: [],
        };
        marker._vs.listeners.push(marker.addListener('drag', function () {
            if (!marker._vs) return;
            const path = fanPath(_posOf(marker), marker._sittemp.viewshed);
            marker._vs.fan.setPath(path);
            marker._vs.outline.setPath(_closed(path));
            marker._vs.mask.setPaths([]);
        }));
        marker._vs.listeners.push(marker.addListener('dragend', function () { syncViewshed(marker); }));
    }

    const o = marker._vs;
    const opacity = Math.max(0, Math.min(1, vs.opacity !== undefined ? +vs.opacity : VIEWSHED_DEFAULTS.opacity));
    const path = fanPath(pos, vs);
    o.fan.setOptions({
        strokeWeight: 0,
        fillColor: vs.color,
        fillOpacity: vs.terrain ? 0 : opacity,
    });
    o.fan.setPath(path);
    o.outline.setOptions(_outlineOptions(vs));
    o.outline.setPath(_closed(path));
    o.mask.setOptions({ fillColor: vs.color, fillOpacity: opacity });

    if (!vs.terrain) {
        o.mask.setPaths([]);
        _setStatus(marker, '');
        return;
    }
    if (_elevationDenied) {
        o.mask.setPaths([]);
        _setStatus(marker, 'Elevation API unavailable');
        return;
    }

    const key = maskKey(pos, vs);
    const cached = _maskCache.get(key);
    if (cached) {
        o.mask.setPaths(cached.map(function (r) { return r.map(function (p) { return { lat: p[0], lng: p[1] }; }); }));
        _setStatus(marker, 'Terrain mask on');
        return;
    }
    o.mask.setPaths([]);
    _requestMask(marker).then(function () {
        // Only draw if this marker still wants this exact mask
        if (marker._vs && marker._sittemp.viewshed && marker._sittemp.viewshed.terrain &&
            maskKey(_posOf(marker), marker._sittemp.viewshed) === key) {
            syncViewshed(marker);
        }
    }, function (err) {
        const msg = String(err && err.message || err);
        if (msg === 'REQUEST_DENIED') {
            _elevationDenied = true;
            showToast('Terrain mask failed: the Elevation API is not enabled for this map key');
        } else {
            showToast('Terrain mask failed (' + msg + ')');
        }
        _setStatus(marker, 'Failed: ' + msg);
    });
}

// ===== Popover UI =====

function _angleUnit() {
    return get('angleUnit') === 'deg' ? 'deg' : 'mils';
}
function _toDisplay(deg) {
    return _angleUnit() === 'mils' ? Math.round(deg * MILS_PER_DEG) : Math.round(deg * 10) / 10;
}
function _fromDisplay(val) {
    const n = parseFloat(val);
    if (isNaN(n)) return null;
    return _angleUnit() === 'mils' ? n / MILS_PER_DEG : n;
}

/**
 * Append the viewshed section for `marker` to the popover.
 * onChange() is called after any edit (used to schedule an undo push).
 */
export function buildViewshedSection(popover, marker, onChange) {
    const section = document.createElement('div');
    section.className = 'popover-vs';
    popover.appendChild(section);

    function rerender() {
        section.innerHTML = '';
        render();
    }
    function commit() {
        syncViewshed(marker);
        if (onChange) onChange();
    }

    function render() {
        const vs = marker._sittemp.viewshed;
        if (!vs) {
            const add = document.createElement('button');
            add.className = 'popover-vs-add';
            add.textContent = '+ Add viewshed';
            add.addEventListener('click', function () {
                marker._sittemp.viewshed = Object.assign({}, VIEWSHED_DEFAULTS);
                commit();
                rerender();
            });
            section.appendChild(add);
            return;
        }

        const head = document.createElement('div');
        head.className = 'popover-vs-head';
        head.innerHTML = '<span>Viewshed</span>';
        const rm = document.createElement('button');
        rm.className = 'popover-vs-remove';
        rm.textContent = 'Remove';
        rm.addEventListener('click', function () {
            delete marker._sittemp.viewshed;
            commit();
            rerender();
        });
        head.appendChild(rm);
        section.appendChild(head);

        function numRow(label, value, unitText, onSet, opts) {
            const row = document.createElement('div');
            row.className = 'popover-row';
            const lbl = document.createElement('span');
            lbl.className = 'popover-label';
            lbl.textContent = label;
            const inp = document.createElement('input');
            inp.type = 'number';
            inp.className = 'popover-num';
            inp.value = value;
            if (opts && opts.step) inp.step = opts.step;
            if (opts && opts.min !== undefined) inp.min = opts.min;
            inp.addEventListener('change', function () { onSet(inp.value); commit(); });
            inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
            row.appendChild(lbl);
            row.appendChild(inp);
            if (unitText) {
                const u = document.createElement('span');
                u.className = 'popover-unit';
                u.textContent = unitText;
                row.appendChild(u);
            }
            section.appendChild(row);
            return row;
        }

        numRow('Range', Math.round(vs.range), 'm', function (v) {
            const n = parseFloat(v); if (!isNaN(n) && n > 0) vs.range = Math.min(50000, n);
        }, { step: 100, min: 50 });

        const unit = _angleUnit();
        const azRow = numRow('Az', _toDisplay(vs.azimuth), null, function (v) {
            const d = _fromDisplay(v); if (d !== null) vs.azimuth = ((d % 360) + 360) % 360;
        }, { step: unit === 'mils' ? 50 : 1 });
        const toggle = document.createElement('button');
        toggle.className = 'popover-unit-toggle';
        toggle.textContent = unit === 'mils' ? 'mils' : 'deg';
        toggle.title = 'Switch between mils (6400) and degrees';
        toggle.addEventListener('click', function () {
            const nextUnit = _angleUnit() === 'mils' ? 'deg' : 'mils';
            set('angleUnit', nextUnit);
            try { localStorage.setItem('sittemp_angle_unit', nextUnit); } catch (e) { /* ignore */ }
            rerender();
        });
        azRow.appendChild(toggle);

        numRow('Arc', _toDisplay(vs.arc), unit === 'mils' ? 'mils' : 'deg', function (v) {
            const d = _fromDisplay(v); if (d !== null && d > 0) vs.arc = Math.min(360, d);
        }, { step: unit === 'mils' ? 100 : 5, min: 1 });

        numRow('Obs ht', vs.obsHeight, 'm', function (v) {
            const n = parseFloat(v); if (!isNaN(n) && n >= 0) vs.obsHeight = n;
        }, { step: 1, min: 0 });
        numRow('Tgt ht', vs.tgtHeight, 'm', function (v) {
            const n = parseFloat(v); if (!isNaN(n) && n >= 0) vs.tgtHeight = n;
        }, { step: 1, min: 0 });

        // Terrain mask toggle
        const tRow = document.createElement('div');
        tRow.className = 'popover-row';
        const tLbl = document.createElement('label');
        tLbl.className = 'popover-check';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = !!vs.terrain;
        cb.addEventListener('change', function () { vs.terrain = cb.checked; commit(); });
        tLbl.appendChild(cb);
        tLbl.appendChild(document.createTextNode(' Terrain mask'));
        tRow.appendChild(tLbl);
        const status = document.createElement('span');
        status.id = 'vs-status';
        status.className = 'popover-vs-status';
        status._marker = marker;
        status.textContent = marker._vsStatus || '';
        tRow.appendChild(status);
        section.appendChild(tRow);

        // Color swatches
        const cRow = document.createElement('div');
        cRow.className = 'popover-row';
        cRow.innerHTML = '<span class="popover-label">Color</span>';
        const sws = document.createElement('div');
        sws.className = 'popover-swatches';
        VS_COLORS.forEach(function (c) {
            const sw = document.createElement('div');
            sw.className = 'popover-swatch' + (c === vs.color ? ' active' : '');
            sw.style.backgroundColor = c;
            sw.addEventListener('click', function () {
                sws.querySelectorAll('.popover-swatch').forEach(function (s) { s.classList.remove('active'); });
                sw.classList.add('active');
                vs.color = c;
                commit();
            });
            sws.appendChild(sw);
        });
        cRow.appendChild(sws);
        section.appendChild(cRow);

        function sliderRow(label, title, min, max, step, value, fmt, onSet) {
            const row = document.createElement('div');
            row.className = 'popover-row';
            row.title = title;
            const lbl = document.createElement('span');
            lbl.className = 'popover-label';
            lbl.textContent = label;
            const sl = document.createElement('input');
            sl.type = 'range'; sl.className = 'popover-slider';
            sl.min = min; sl.max = max; sl.step = step; sl.value = value;
            const val = document.createElement('span');
            val.className = 'popover-val';
            val.textContent = fmt(value);
            sl.addEventListener('input', function () {
                const v = parseFloat(sl.value);
                onSet(v);
                val.textContent = fmt(v);
                commit();
            });
            row.appendChild(lbl);
            row.appendChild(sl);
            row.appendChild(val);
            section.appendChild(row);
        }
        const pct = function (v) { return Math.round(v * 100) + '%'; };
        const ls = _lineStyle(vs);

        // Fill (shaded area) opacity
        sliderRow('Fill', 'Opacity of the shaded fan / visible terrain', 0, 1, 0.05, vs.opacity, pct,
            function (v) { vs.opacity = v; });

        // Outline: thickness, opacity, line type (independent of the symbol's own stroke)
        sliderRow('Width', 'Outline thickness', 1, 10, 1, ls.width, function (v) { return Math.round(v) + 'px'; },
            function (v) { vs.lineWidth = v; });
        sliderRow('Line', 'Outline opacity', 0, 1, 0.05, ls.opacity, pct,
            function (v) { vs.lineOpacity = v; });

        const tyRow = document.createElement('div');
        tyRow.className = 'popover-row';
        tyRow.innerHTML = '<span class="popover-label">Style</span>';
        const tyGroup = document.createElement('div');
        tyGroup.className = 'popover-seg';
        VIEWSHED_LINE_TYPES.forEach(function (t) {
            const b = document.createElement('button');
            b.className = 'popover-seg-btn' + (t.key === ls.type ? ' active' : '');
            b.textContent = t.name;
            b.addEventListener('click', function () {
                tyGroup.querySelectorAll('.popover-seg-btn').forEach(function (x) { x.classList.remove('active'); });
                b.classList.add('active');
                vs.lineType = t.key;
                commit();
            });
            tyGroup.appendChild(b);
        });
        tyRow.appendChild(tyGroup);
        section.appendChild(tyRow);
    }

    render();
}

/** Restore the saved angle-unit preference (call once at startup). */
export function initViewshedPrefs() {
    try {
        const u = localStorage.getItem('sittemp_angle_unit');
        if (u === 'deg' || u === 'mils') set('angleUnit', u);
    } catch (e) { /* ignore */ }
}

// ===== KML =====

function _kmlColor(hex, opacity) {
    const h = (hex || '#FF8C00').replace('#', '').toLowerCase();
    const a = Math.round(Math.max(0, Math.min(1, opacity)) * 255).toString(16).padStart(2, '0');
    return a + h.slice(4, 6) + h.slice(2, 4) + h.slice(0, 2);
}

function _kmlRing(points) {
    let s = '<Polygon><outerBoundaryIs><LinearRing><coordinates>\n';
    points.forEach(function (p) { s += p.lng + ',' + p.lat + ',0\n'; });
    s += points[0].lng + ',' + points[0].lat + ',0\n';
    return s + '</coordinates></LinearRing></outerBoundaryIs></Polygon>\n';
}

/** KML Placemark(s) for a marker's viewshed, or '' if it has none. */
export function viewshedKML(marker, name) {
    const vs = marker._sittemp && marker._sittemp.viewshed;
    if (!vs) return '';
    const pos = _posOf(marker);
    const opacity = vs.opacity !== undefined ? vs.opacity : VIEWSHED_DEFAULTS.opacity;
    // KML has no dashed lines, so line type is not exported; width and opacity are.
    const ls = _lineStyle(vs);
    const line = _kmlColor(vs.color, ls.opacity);
    let kml = '';

    kml += '<Placemark>\n<name>' + name + ' range fan</name>\n';
    kml += '<Style><LineStyle><color>' + line + '</color><width>' + ls.width + '</width></LineStyle>'
        + '<PolyStyle><color>' + _kmlColor(vs.color, vs.terrain ? 0 : opacity) + '</color></PolyStyle></Style>\n';
    kml += _kmlRing(fanPath(pos, vs));
    kml += '</Placemark>\n';

    const rings = vs.terrain ? _maskCache.get(maskKey(pos, vs)) : null;
    if (rings && rings.length) {
        kml += '<Placemark>\n<name>' + name + ' visible terrain</name>\n';
        kml += '<Style><LineStyle><width>0</width></LineStyle><PolyStyle><color>' + _kmlColor(vs.color, opacity)
            + '</color><outline>0</outline></PolyStyle></Style>\n<MultiGeometry>\n';
        rings.forEach(function (r) { kml += _kmlRing(r.map(function (p) { return { lat: p[0], lng: p[1] }; })); });
        kml += '</MultiGeometry>\n</Placemark>\n';
    }
    return kml;
}
