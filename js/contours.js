/**
 * Simple SITTEMP - Contour Lines Module
 *
 * Map submenu → Contours → "Contour current view": fetches a ~100x100 elevation
 * grid for the view (~20 Elevation requests, shared fetch with viewsheds), traces
 * contour lines with marching squares, joins the segments into polylines, and
 * draws them as crisp google.maps.Polyline vectors (they stay sharp at any zoom).
 *
 * Each contour set has its own legend entry: interval (m), color, line width,
 * bold index line every 5th contour, elevation labels on index lines, remove.
 * Settings redraw from the cached grid without new requests. Configs are part of
 * undo snapshots; grids are cached in memory by id.
 */

import { get } from './state.js';
import { showToast } from './toolbar.js';
import { fetchElevations, elevationRequestCount } from './viewshed.js';
import { gridSpec, gridPoints, legendHost } from './elevation.js';
import { escapeXml } from './symbols.js';

export const CONTOUR_COLORS = ['#8B4513', '#000000', '#FFFFFF', '#FF0000', '#0000FF', '#FF8C00', '#00AA00', '#800080'];
const DEFAULTS = { interval: 20, color: '#8B4513', width: 1, index: true, labels: true };
const MAX_LEVELS = 250;
const INDEX_EVERY = 5;

let _sets = [];                 // { id, bounds, interval, color, width, index, labels, items, status, stats }
const _grids = new Map();       // id -> { rows, cols, elev, pts }
const _loading = new Map();
let _nextId = 1;
let _onChange = null;
let _changeTimer = null;

// ===== Marching squares =====

/**
 * Trace contour polylines for one level on a row-major grid (row 0 = north).
 * pts[i] = {lat,lng} for each grid sample. Returns arrays of {lat,lng}.
 */
export function traceLevel(elev, pts, rows, cols, level) {
    const segs = [];
    const P = function (key, i, j) {
        const a = elev[i], b = elev[j];
        const t = a === b ? 0.5 : (level - a) / (b - a);
        return { key: key, lat: pts[i].lat + (pts[j].lat - pts[i].lat) * t, lng: pts[i].lng + (pts[j].lng - pts[i].lng) * t };
    };
    for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
            const tl = r * cols + c, tr = tl + 1, bl = tl + cols, br = bl + 1;
            const idx = (elev[tl] >= level ? 8 : 0) | (elev[tr] >= level ? 4 : 0) | (elev[br] >= level ? 2 : 0) | (elev[bl] >= level ? 1 : 0);
            if (idx === 0 || idx === 15) continue;
            const T = function () { return P('h' + r + '_' + c, tl, tr); };
            const B = function () { return P('h' + (r + 1) + '_' + c, bl, br); };
            const L = function () { return P('v' + r + '_' + c, tl, bl); };
            const R = function () { return P('v' + r + '_' + (c + 1), tr, br); };
            const center = (elev[tl] + elev[tr] + elev[bl] + elev[br]) / 4 >= level;
            switch (idx) {
                case 1: case 14: segs.push([L(), B()]); break;
                case 2: case 13: segs.push([B(), R()]); break;
                case 3: case 12: segs.push([L(), R()]); break;
                case 4: case 11: segs.push([T(), R()]); break;
                case 6: case 9: segs.push([T(), B()]); break;
                case 7: case 8: segs.push([L(), T()]); break;
                case 5: // tr + bl high (saddle)
                    if (center) { segs.push([L(), T()]); segs.push([B(), R()]); }
                    else { segs.push([L(), B()]); segs.push([T(), R()]); }
                    break;
                case 10: // tl + br high (saddle)
                    if (center) { segs.push([T(), R()]); segs.push([L(), B()]); }
                    else { segs.push([L(), T()]); segs.push([B(), R()]); }
                    break;
            }
        }
    }
    return _chain(segs);
}

/** Join segments that share edge points into polylines. */
function _chain(segs) {
    const byKey = new Map();
    segs.forEach(function (s, i) {
        [s[0].key, s[1].key].forEach(function (k) {
            if (!byKey.has(k)) byKey.set(k, []);
            byKey.get(k).push(i);
        });
    });
    const used = new Uint8Array(segs.length);
    const lines = [];
    const nextFrom = function (key, fromSeg) {
        const list = byKey.get(key) || [];
        for (let n = 0; n < list.length; n++) if (list[n] !== fromSeg && !used[list[n]]) return list[n];
        return -1;
    };
    for (let i = 0; i < segs.length; i++) {
        if (used[i]) continue;
        used[i] = 1;
        const line = [segs[i][0], segs[i][1]];
        // extend forward
        let cur = i, key = segs[i][1].key;
        for (;;) {
            const n = nextFrom(key, cur);
            if (n < 0) break;
            used[n] = 1;
            const s = segs[n];
            const p = s[0].key === key ? s[1] : s[0];
            line.push(p); key = p.key; cur = n;
        }
        // extend backward
        cur = i; key = segs[i][0].key;
        for (;;) {
            const n = nextFrom(key, cur);
            if (n < 0) break;
            used[n] = 1;
            const s = segs[n];
            const p = s[0].key === key ? s[1] : s[0];
            line.unshift(p); key = p.key; cur = n;
        }
        lines.push(line.map(function (p) { return { lat: p.lat, lng: p.lng }; }));
    }
    return lines;
}

/** All contour lines for a grid: [{ level, index, path }]. */
export function buildContours(grid, interval, indexOn) {
    let min = Infinity, max = -Infinity;
    for (let i = 0; i < grid.elev.length; i++) { min = Math.min(min, grid.elev[i]); max = Math.max(max, grid.elev[i]); }
    const out = [];
    const first = Math.ceil(min / interval) * interval;
    let count = 0;
    for (let level = first; level <= max && count < MAX_LEVELS; level += interval, count++) {
        const isIndex = indexOn && Math.round(level / interval) % INDEX_EVERY === 0;
        traceLevel(grid.elev, grid.pts, grid.rows, grid.cols, level).forEach(function (path) {
            if (path.length >= 2) out.push({ level: level, index: isIndex, path: path });
        });
    }
    return { lines: out, min: min, max: max, levels: count, truncated: first + count * interval <= max };
}

// ===== Rendering =====

function _labelIcon(text, color, rot) {
    const fs = 11, w = text.length * 7 + 8, h = 16;
    const S = Math.ceil(Math.sqrt(w * w + h * h));
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '">'
        + '<g transform="rotate(' + rot + ' ' + S / 2 + ' ' + S / 2 + ')">'
        + '<text x="' + S / 2 + '" y="' + (S / 2 + 4) + '" text-anchor="middle" font-family="Arial,sans-serif" font-size="' + fs + '" font-weight="bold"'
        + ' fill="' + color + '" stroke="' + (color.toUpperCase() === '#FFFFFF' ? '#000' : '#fff') + '" stroke-width="3" paint-order="stroke">' + escapeXml(text) + '</text></g></svg>';
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(S, S), anchor: new google.maps.Point(S / 2, S / 2),
    };
}

function _clear(set) {
    (set.items || []).forEach(function (o) { o.setMap(null); });
    set.items = [];
}

function _draw(set) {
    const grid = _grids.get(set.id);
    if (!grid) return;
    _clear(set);
    const map = get('map');
    const res = buildContours(grid, Math.max(1, +set.interval || DEFAULTS.interval), set.index);
    const w = Math.max(0.5, +set.width || DEFAULTS.width);
    res.lines.forEach(function (ln) {
        set.items.push(new google.maps.Polyline({
            map: map, path: ln.path, clickable: false, zIndex: 30,
            strokeColor: set.color, strokeOpacity: 0.9, strokeWeight: ln.index ? w + 1.5 : w,
        }));
        // Elevation labels on index lines (or every line when index lines are off)
        if (set.labels && (ln.index || !set.index) && ln.path.length >= 12) {
            const k = Math.floor(ln.path.length / 2);
            const a = ln.path[Math.max(0, k - 2)], b = ln.path[Math.min(ln.path.length - 1, k + 2)];
            let rot = -Math.atan2(b.lat - a.lat, (b.lng - a.lng) * Math.cos(a.lat * Math.PI / 180)) * 180 / Math.PI;
            if (rot > 90) rot -= 180; if (rot < -90) rot += 180;
            set.items.push(new google.maps.Marker({
                map: map, position: ln.path[k], clickable: false, zIndex: 31, optimized: false,
                icon: _labelIcon(String(Math.round(ln.level)), set.color, rot),
            }));
        }
    });
    set.stats = { min: res.min, max: res.max, levels: res.levels, lines: res.lines.length, truncated: res.truncated };
    set.status = '';
    _renderLegend();
}

function _notify() {
    if (!_onChange) return;
    if (_changeTimer) clearTimeout(_changeTimer);
    _changeTimer = setTimeout(function () { _changeTimer = null; _onChange(); }, 300);
}

function _fetchGrid(set) {
    if (_loading.has(set.id)) return _loading.get(set.id);
    const id = set.id;
    const spec = gridSpec(set.bounds);
    const pts = gridPoints(set.bounds, spec.rows, spec.cols);
    const p = fetchElevations(pts.map(function (q) { return new google.maps.LatLng(q.lat, q.lng); }), function (f) {
        _sets.forEach(function (s) { if (s.id === id) s.status = 'Loading… ' + Math.round(f * 100) + '%'; });
        _renderLegend();
    }).then(function (elev) {
        const grid = { rows: spec.rows, cols: spec.cols, elev: Float64Array.from(elev), pts: pts };
        _grids.set(id, grid);
        _loading.delete(id);
        return grid;
    }, function (err) { _loading.delete(id); throw err; });
    _loading.set(id, p);
    return p;
}

async function _load(set) {
    if (_grids.has(set.id)) { _draw(set); return; }
    set.status = 'Loading… 0%';
    _renderLegend();
    try {
        await _fetchGrid(set);
        _sets.forEach(function (s) { if (s.id === set.id) _draw(s); });
    } catch (err) {
        const msg = String(err && err.message || err);
        showToast(msg === 'REQUEST_DENIED'
            ? 'Contours failed: the Elevation API is not enabled for this map key'
            : 'Contours failed (' + msg + ')');
        _remove(set, false);
    }
}

function _remove(set, notify) {
    _clear(set);
    _sets = _sets.filter(function (s) { return s !== set; });
    _renderLegend();
    if (notify !== false) _notify();
}

function _defaults() {
    const d = Object.assign({}, DEFAULTS);
    const iv = document.getElementById('contour-interval');
    const v = iv ? parseFloat(iv.value) : NaN;
    if (!isNaN(v) && v >= 1) d.interval = v;
    return d;
}

/** Contour the current map view. */
export function contourCurrentView() {
    const map = get('map');
    const b = map && map.getBounds();
    if (!b) return;
    const ne = b.getNorthEast(), sw = b.getSouthWest();
    if (sw.lng() > ne.lng()) { showToast('Cannot contour a view that crosses the 180° meridian'); return; }
    const bounds = { n: ne.lat(), s: sw.lat(), e: ne.lng(), w: sw.lng() };
    const spec = gridSpec(bounds);
    const set = Object.assign({ id: _nextId++, bounds: bounds, items: [], status: '', stats: null }, _defaults());
    _sets.push(set);
    const coarse = spec.spacing > 300 ? ' Coarse: ~' + Math.round(spec.spacing) + ' m between samples, zoom in for more detail.' : '';
    showToast('Generating contours (' + elevationRequestCount(spec.rows * spec.cols) + ' elevation requests).' + coarse, coarse ? 5000 : 2500);
    _load(set).then(_notify);
}

// ===== Undo =====

export function getContourConfigs() {
    return _sets.map(function (s) {
        return { id: s.id, bounds: s.bounds, interval: s.interval, color: s.color, width: s.width, index: s.index, labels: s.labels };
    });
}

export function restoreContours(configs) {
    _sets.forEach(_clear);
    _sets = (configs || []).map(function (c) {
        _nextId = Math.max(_nextId, c.id + 1);
        return Object.assign({}, DEFAULTS, c, { items: [], status: '', stats: null });
    });
    _sets.forEach(function (s) { _load(s); });
    _renderLegend();
}

// ===== KML =====

export function contoursKML() {
    let kml = '';
    _sets.forEach(function (s) {
        const grid = _grids.get(s.id);
        if (!grid) return;
        const res = buildContours(grid, Math.max(1, +s.interval || DEFAULTS.interval), s.index);
        const h = s.color.replace('#', '').toLowerCase();
        const color = 'ff' + h.slice(4, 6) + h.slice(2, 4) + h.slice(0, 2);
        res.lines.forEach(function (ln) {
            kml += '<Placemark><name>Contour ' + Math.round(ln.level) + ' m</name>'
                + '<Style><LineStyle><color>' + color + '</color><width>' + (ln.index ? s.width + 1.5 : s.width) + '</width></LineStyle></Style>'
                + '<LineString><coordinates>' + ln.path.map(function (p) { return p.lng.toFixed(6) + ',' + p.lat.toFixed(6) + ',0'; }).join(' ')
                + '</coordinates></LineString></Placemark>\n';
        });
    });
    return kml;
}

// ===== Legend =====

function _legendEl() {
    let el = document.getElementById('contour-legend');
    if (!el) {
        el = document.createElement('div');
        el.id = 'contour-legend';
        legendHost().appendChild(el);
    }
    return el;
}

function _renderLegend() {
    const el = _legendEl();
    el.innerHTML = '';
    el.style.display = _sets.length ? 'block' : 'none';
    _sets.forEach(function (set, idx) {
        const box = document.createElement('div');
        box.className = 'elev-entry';

        const head = document.createElement('div');
        head.className = 'elev-head';
        const title = document.createElement('span');
        title.textContent = 'Contours' + (_sets.length > 1 ? ' ' + (idx + 1) : '');
        const rm = document.createElement('button');
        rm.className = 'elev-remove';
        rm.textContent = '×';
        rm.title = 'Remove these contours';
        rm.addEventListener('click', function () { _remove(set); });
        head.appendChild(title); head.appendChild(rm);
        box.appendChild(head);

        if (set.status) {
            const st = document.createElement('div');
            st.className = 'elev-status';
            st.textContent = set.status;
            box.appendChild(st);
            el.appendChild(box);
            return;
        }
        const redraw = function () { _draw(set); _notify(); };

        // Interval + width
        const r1 = document.createElement('div');
        r1.className = 'elev-ctl';
        const iv = document.createElement('input');
        iv.type = 'number'; iv.min = 1; iv.step = 5; iv.value = set.interval;
        iv.className = 'popover-num elev-num'; iv.title = 'Contour interval (m)';
        iv.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') iv.blur(); });
        iv.addEventListener('change', function () { const v = parseFloat(iv.value); if (!isNaN(v) && v >= 1) { set.interval = v; redraw(); } });
        const ivl = document.createElement('span'); ivl.textContent = 'm';
        const wl = document.createElement('span'); wl.textContent = 'Width';
        const ws = document.createElement('input');
        ws.type = 'range'; ws.min = 0.5; ws.max = 4; ws.step = 0.5; ws.value = set.width;
        ws.className = 'popover-slider'; ws.title = 'Line width';
        ws.addEventListener('change', function () { set.width = +ws.value; redraw(); });
        r1.appendChild(iv); r1.appendChild(ivl); r1.appendChild(wl); r1.appendChild(ws);
        box.appendChild(r1);

        // Colors
        const r2 = document.createElement('div');
        r2.className = 'elev-ctl';
        const sws = document.createElement('div');
        sws.className = 'popover-swatches';
        CONTOUR_COLORS.forEach(function (c) {
            const sw = document.createElement('div');
            sw.className = 'popover-swatch' + (c === set.color ? ' active' : '');
            sw.style.backgroundColor = c;
            sw.title = c === '#8B4513' ? 'Brown (map standard)' : c;
            sw.addEventListener('click', function () { set.color = c; redraw(); });
            sws.appendChild(sw);
        });
        r2.appendChild(sws);
        box.appendChild(r2);

        // Index lines + labels
        const r3 = document.createElement('div');
        r3.className = 'elev-ctl';
        const mkCheck = function (label, title, checked, onSet) {
            const l = document.createElement('label');
            l.className = 'popover-check'; l.title = title;
            const cb = document.createElement('input');
            cb.type = 'checkbox'; cb.checked = checked;
            cb.addEventListener('change', function () { onSet(cb.checked); redraw(); });
            l.appendChild(cb); l.appendChild(document.createTextNode(' ' + label));
            return l;
        };
        r3.appendChild(mkCheck('Index (5th bold)', 'Every 5th contour drawn heavier', set.index, function (v) { set.index = v; }));
        r3.appendChild(mkCheck('Labels', 'Elevation labels on index contours', set.labels, function (v) { set.labels = v; }));
        box.appendChild(r3);

        if (set.stats) {
            const st = document.createElement('div');
            st.className = 'elev-status';
            st.textContent = 'Min ' + Math.round(set.stats.min) + ' · Max ' + Math.round(set.stats.max) + ' m · ' + set.stats.levels + ' levels'
                + (set.stats.truncated ? ' (capped, raise the interval)' : '');
            box.appendChild(st);
        }
        el.appendChild(box);
    });
}

// ===== Setup =====

export function setupContours(onChange) {
    _onChange = onChange;
    const btn = document.getElementById('contour-view-btn');
    if (btn) btn.addEventListener('click', contourCurrentView);
    const iv = document.getElementById('contour-interval');
    if (iv) iv.addEventListener('keydown', function (e) { e.stopPropagation(); });
    _renderLegend();
}
