/**
 * Simple SITTEMP - Slope Analysis Module
 *
 * Colors the parts of a drawn area (polygon / rectangle / circle / freehand)
 * whose slope falls in up to three user-defined ranges, e.g. 10-20% yellow,
 * 20-40% orange, 40%+ red. Ground outside every range is left clear.
 *
 * The same ~100x100 elevation grid as elevation shading is fetched (~20 Elevation
 * API requests). Slope percent (rise / run x 100) is computed at each grid point
 * with central differences, upsampled with bilinear interpolation, classified
 * into the ranges (first matching range wins), clipped to the shape and shown as
 * a GroundOverlay.
 *
 * Range edits redraw from the cached grid (no new requests). Slope configs are
 * part of undo snapshots; the last ranges used are remembered for new analyses.
 */

import { get } from './state.js';
import { showToast } from './toolbar.js';
import { fetchElevations, elevationRequestCount } from './viewshed.js';
import { gridSpec, gridPoints, legendHost } from './elevation.js';

const UPSAMPLE = 4;
const MAX_CANVAS = 1200;
const DEFAULT_OPACITY = 0.6;
const STORE_KEY = 'sittemp_slope_ranges';
export const MAX_RANGES = 3;

// max: null means "and steeper"
export const DEFAULT_RANGES = [
    { on: true, min: 10, max: 20, color: '#ffd400' },
    { on: true, min: 20, max: 40, color: '#ff8c00' },
    { on: true, min: 40, max: null, color: '#d7191c' },
];

let _slopes = [];               // { id, ring:[[lat,lng]...], bounds, ranges, opacity, overlay, status, stats }
const _grids = new Map();       // id -> { rows, cols, slope: Float64Array }
const _loading = new Map();     // id -> Promise of grid
let _nextId = 1;
let _onChange = null;
let _changeTimer = null;

// ===== Math =====

const D2R = Math.PI / 180;
const M_PER_DEG = 111320;
function mercY(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * D2R / 2)); }

function hexToRgb(h) {
    h = String(h || '#000000').replace('#', '');
    return [parseInt(h.slice(0, 2), 16) || 0, parseInt(h.slice(2, 4), 16) || 0, parseInt(h.slice(4, 6), 16) || 0];
}

function boundsOfRing(ring) {
    const b = { n: -90, s: 90, e: -180, w: 180 };
    ring.forEach(function (p) {
        b.n = Math.max(b.n, p[0]); b.s = Math.min(b.s, p[0]);
        b.e = Math.max(b.e, p[1]); b.w = Math.min(b.w, p[1]);
    });
    return b;
}

function pointInRing(lat, lng, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const yi = ring[i][0], xi = ring[i][1], yj = ring[j][0], xj = ring[j][1];
        if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
}

/**
 * Slope percent at each grid point from a row-major elevation grid (north row
 * first). lats[r] is the latitude of row r; lngStep the column spacing in degrees.
 */
export function slopeGrid(elev, rows, cols, lats, lngStep) {
    const out = new Float64Array(rows * cols);
    for (let r = 0; r < rows; r++) {
        const rU = Math.max(0, r - 1), rD = Math.min(rows - 1, r + 1);
        const dy = (lats[rU] - lats[rD]) * M_PER_DEG;               // north-south run (m)
        const dxCell = lngStep * M_PER_DEG * Math.cos(lats[r] * D2R); // east-west cell size (m)
        for (let c = 0; c < cols; c++) {
            const cL = Math.max(0, c - 1), cR = Math.min(cols - 1, c + 1);
            const dzdx = dxCell > 0 && cR > cL ? (elev[r * cols + cR] - elev[r * cols + cL]) / (dxCell * (cR - cL)) : 0;
            const dzdy = dy > 0 ? (elev[rU * cols + c] - elev[rD * cols + c]) / dy : 0;
            out[r * cols + c] = Math.sqrt(dzdx * dzdx + dzdy * dzdy) * 100;
        }
    }
    return out;
}

/** Active, valid ranges in order. */
function _activeRanges(ranges) {
    return (ranges || []).filter(function (g) {
        return g && g.on && !isNaN(+g.min) && (g.max === null || g.max === '' || +g.max > +g.min);
    }).map(function (g) {
        return { min: +g.min, max: (g.max === null || g.max === '') ? Infinity : +g.max, rgb: hexToRgb(g.color), src: g };
    });
}

/** Index into the active ranges for a slope value, or -1. */
function _classify(active, s) {
    for (let k = 0; k < active.length; k++) {
        if (s >= active[k].min && s < active[k].max) return k;
    }
    return -1;
}

export function rangeLabel(g) {
    const hasMax = !(g.max === null || g.max === '' || isNaN(+g.max));
    return hasMax ? (+g.min) + '–' + (+g.max) + '%' : '> ' + (+g.min) + '%';
}

// ===== Rendering =====

function renderSlope(sl, grid) {
    const rows = grid.rows, cols = grid.cols, slope = grid.slope;
    const b = sl.bounds;
    const active = _activeRanges(sl.ranges);

    // Stats from grid points inside the area
    const pts = gridPoints(b, rows, cols);
    const counts = active.map(function () { return 0; });
    let total = 0, max = 0, sum = 0;
    for (let i = 0; i < pts.length; i++) {
        if (!pointInRing(pts[i].lat, pts[i].lng, sl.ring)) continue;
        const s = slope[i];
        total++; sum += s; if (s > max) max = s;
        const k = _classify(active, s);
        if (k >= 0) counts[k]++;
    }

    const W = Math.min(MAX_CANVAS, cols * UPSAMPLE);
    const H = Math.min(MAX_CANVAS, rows * UPSAMPLE);
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(W, H);
    for (let py = 0; py < H; py++) {
        const gy = py / (H - 1) * (rows - 1);
        const r0 = Math.min(rows - 2, Math.floor(gy)), ty = gy - r0;
        for (let px = 0; px < W; px++) {
            const gx = px / (W - 1) * (cols - 1);
            const c0 = Math.min(cols - 2, Math.floor(gx)), tx = gx - c0;
            const i00 = r0 * cols + c0;
            const s = (slope[i00] * (1 - tx) + slope[i00 + 1] * tx) * (1 - ty)
                + (slope[i00 + cols] * (1 - tx) + slope[i00 + cols + 1] * tx) * ty;
            const k = _classify(active, s);
            if (k < 0) continue;                     // leave transparent
            const o = (py * W + px) * 4, rgb = active[k].rgb;
            img.data[o] = rgb[0]; img.data[o + 1] = rgb[1]; img.data[o + 2] = rgb[2]; img.data[o + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);

    // Clip to the area shape
    const yN = mercY(b.n), yS = mercY(b.s);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    sl.ring.forEach(function (p, i) {
        const x = (p[1] - b.w) / (b.e - b.w) * W;
        const y = (yN - mercY(p[0])) / (yN - yS) * H;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    const cover = new Map();
    active.forEach(function (a, k) { cover.set(a.src, total ? counts[k] / total : 0); });
    return { url: canvas.toDataURL('image/png'), stats: { max: max, mean: total ? sum / total : 0, cover: cover } };
}

// ===== Lifecycle =====

function _notify() {
    if (!_onChange) return;
    if (_changeTimer) clearTimeout(_changeTimer);
    _changeTimer = setTimeout(function () { _changeTimer = null; _onChange(); }, 300);
}

function _draw(sl) {
    const grid = _grids.get(sl.id);
    if (!grid) return;
    const out = renderSlope(sl, grid);
    sl.stats = out.stats;
    if (sl.overlay) sl.overlay.setMap(null);
    sl.overlay = new google.maps.GroundOverlay(out.url,
        { north: sl.bounds.n, south: sl.bounds.s, east: sl.bounds.e, west: sl.bounds.w },
        { opacity: sl.opacity, clickable: false, map: get('map') });
    sl.status = '';
    _renderLegend();
}

function _fetchGrid(sl) {
    if (_loading.has(sl.id)) return _loading.get(sl.id);
    const id = sl.id, b = sl.bounds;
    const spec = gridSpec(b);
    const gp = gridPoints(b, spec.rows, spec.cols);
    const pts = gp.map(function (p) { return new google.maps.LatLng(p.lat, p.lng); });
    const p = fetchElevations(pts, function (f) {
        _slopes.forEach(function (s) { if (s.id === id) s.status = 'Loading… ' + Math.round(f * 100) + '%'; });
        _renderLegend();
    }).then(function (elev) {
        const lats = [];
        for (let r = 0; r < spec.rows; r++) lats.push(gp[r * spec.cols].lat);
        const lngStep = (b.e - b.w) / (spec.cols - 1);
        const grid = { rows: spec.rows, cols: spec.cols, slope: slopeGrid(elev, spec.rows, spec.cols, lats, lngStep) };
        _grids.set(id, grid);
        _loading.delete(id);
        return grid;
    }, function (err) { _loading.delete(id); throw err; });
    _loading.set(id, p);
    return p;
}

async function _load(sl) {
    if (_grids.has(sl.id)) { _draw(sl); return; }
    sl.status = 'Loading… 0%';
    _renderLegend();
    try {
        await _fetchGrid(sl);
        _slopes.forEach(function (s) { if (s.id === sl.id) _draw(s); });
    } catch (err) {
        const msg = String(err && err.message || err);
        showToast(msg === 'REQUEST_DENIED'
            ? 'Slope analysis failed: the Elevation API is not enabled for this map key'
            : 'Slope analysis failed (' + msg + ')');
        _remove(sl, false);
    }
}

function _remove(sl, notify) {
    if (sl.overlay) sl.overlay.setMap(null);
    _slopes = _slopes.filter(function (s) { return s !== sl; });
    _renderLegend();
    if (notify !== false) _notify();
}

function _cloneRanges(r) {
    return (r || []).slice(0, MAX_RANGES).map(function (g) {
        return { on: g.on !== false, min: +g.min || 0, max: (g.max === null || g.max === '' || isNaN(+g.max)) ? null : +g.max, color: g.color || '#ff0000' };
    });
}

function _savedRanges() {
    try {
        const v = JSON.parse(localStorage.getItem(STORE_KEY));
        if (Array.isArray(v) && v.length) {
            const r = _cloneRanges(v);
            while (r.length < MAX_RANGES) r.push(Object.assign({}, DEFAULT_RANGES[r.length], { on: false }));
            return r;
        }
    } catch (e) { /* ignore */ }
    return _cloneRanges(DEFAULT_RANGES);
}

function _rememberRanges(r) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(r)); } catch (e) { /* ignore */ }
}

/** Run slope analysis on a Terra Draw polygon feature (polygon, rectangle, circle, freehand). */
export function slopeFeature(featureId) {
    const draw = get('draw');
    let feature = null;
    try { feature = draw && draw.getSnapshotFeature(featureId); } catch (e) { /* ignore */ }
    if (!feature || feature.geometry.type !== 'Polygon') { showToast('Select a polygon, rectangle or circle for slope analysis'); return; }
    const ring = feature.geometry.coordinates[0].map(function (c) { return [c[1], c[0]]; });
    const bounds = boundsOfRing(ring);
    if (bounds.e - bounds.w <= 0 || bounds.n - bounds.s <= 0) { showToast('Area is too small for slope analysis'); return; }
    if (bounds.e - bounds.w > 180) { showToast('Area is too large for slope analysis'); return; }
    const spec = gridSpec(bounds);
    const sl = { id: _nextId++, ring: ring, bounds: bounds, ranges: _savedRanges(), opacity: DEFAULT_OPACITY, overlay: null, status: '', stats: null };
    _slopes.push(sl);
    const reqs = elevationRequestCount(spec.rows * spec.cols);
    const coarse = spec.spacing > 300 ? ' Coarse: ~' + Math.round(spec.spacing) + ' m between samples, so slopes are averaged. Use a smaller area for detail.' : '';
    showToast('Calculating slope (' + reqs + ' elevation requests).' + coarse, coarse ? 5000 : 2500);
    _load(sl).then(_notify);
}

// ===== Undo integration =====

export function getSlopeConfigs() {
    return _slopes.map(function (s) {
        return { id: s.id, ring: s.ring, ranges: _cloneRanges(s.ranges), opacity: s.opacity };
    });
}

export function restoreSlopes(configs) {
    _slopes.forEach(function (s) { if (s.overlay) s.overlay.setMap(null); });
    _slopes = (configs || []).map(function (c) {
        _nextId = Math.max(_nextId, c.id + 1);
        return { id: c.id, ring: c.ring, bounds: boundsOfRing(c.ring), ranges: _cloneRanges(c.ranges),
            opacity: c.opacity, overlay: null, status: '', stats: null };
    });
    _slopes.forEach(function (s) { _load(s); });
    _renderLegend();
}

// ===== Legend =====

function _legendEl() {
    let el = document.getElementById('slope-legend');
    if (!el) {
        el = document.createElement('div');
        el.id = 'slope-legend';
        legendHost().appendChild(el);
    }
    return el;
}

function _num(value, placeholder, title, onSet) {
    const inp = document.createElement('input');
    inp.type = 'number'; inp.min = 0; inp.step = 1;
    inp.className = 'popover-num slope-num';
    inp.value = value === null || value === undefined ? '' : value;
    inp.placeholder = placeholder;
    inp.title = title;
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
    inp.addEventListener('change', function () { onSet(inp.value); });
    return inp;
}

function _renderLegend() {
    const el = _legendEl();
    el.innerHTML = '';
    el.style.display = _slopes.length ? 'block' : 'none';
    _slopes.forEach(function (sl, idx) {
        const box = document.createElement('div');
        box.className = 'elev-entry';

        const head = document.createElement('div');
        head.className = 'elev-head';
        const title = document.createElement('span');
        title.textContent = 'Slope ' + (_slopes.length > 1 ? (idx + 1) + ' ' : '') + '(%)';
        const rm = document.createElement('button');
        rm.className = 'elev-remove';
        rm.textContent = '×';
        rm.title = 'Remove this slope analysis';
        rm.addEventListener('click', function () { _remove(sl); });
        head.appendChild(title);
        head.appendChild(rm);
        box.appendChild(head);

        if (sl.status) {
            const st = document.createElement('div');
            st.className = 'elev-status';
            st.textContent = sl.status;
            box.appendChild(st);
            el.appendChild(box);
            return;
        }

        const changed = function () { _rememberRanges(sl.ranges); _draw(sl); _notify(); };

        // One row per range: on/off, min %, max % (blank = and steeper), color, share of area
        sl.ranges.forEach(function (g, k) {
            const row = document.createElement('div');
            row.className = 'elev-ctl slope-range' + (g.on ? '' : ' off');
            const cb = document.createElement('input');
            cb.type = 'checkbox'; cb.checked = !!g.on;
            cb.title = 'Show range ' + (k + 1);
            cb.addEventListener('change', function () { g.on = cb.checked; changed(); });
            const col = document.createElement('input');
            col.type = 'color'; col.value = g.color;
            col.className = 'slope-color';
            col.title = 'Range ' + (k + 1) + ' color';
            col.addEventListener('change', function () { g.color = col.value; changed(); });
            const minI = _num(g.min, 'min', 'Slope at or above this percent', function (v) {
                const n = parseFloat(v);
                if (!isNaN(n) && n >= 0) { g.min = n; changed(); } else _renderLegend();
            });
            const dash = document.createElement('span');
            dash.textContent = '–';
            const maxI = _num(g.max, 'max', 'Slope below this percent (blank = and steeper)', function (v) {
                const n = parseFloat(v);
                if (v === '') { g.max = null; changed(); }
                else if (!isNaN(n) && n > g.min) { g.max = n; changed(); }
                else { showToast('Max must be greater than min'); _renderLegend(); }
            });
            const pct = document.createElement('span');
            pct.textContent = '%';
            const cov = document.createElement('span');
            cov.className = 'slope-cover';
            const share = sl.stats && sl.stats.cover.get(g);
            cov.textContent = share !== undefined ? Math.round(share * 100) + '% of area' : '';
            row.appendChild(cb); row.appendChild(col); row.appendChild(minI); row.appendChild(dash);
            row.appendChild(maxI); row.appendChild(pct); row.appendChild(cov);
            box.appendChild(row);
        });

        const oRow = document.createElement('div');
        oRow.className = 'elev-ctl';
        const oLbl = document.createElement('span');
        oLbl.textContent = 'Opacity';
        const op = document.createElement('input');
        op.type = 'range'; op.min = 0.1; op.max = 1; op.step = 0.05; op.value = sl.opacity;
        op.className = 'popover-slider';
        op.addEventListener('input', function () {
            sl.opacity = parseFloat(op.value);
            if (sl.overlay) sl.overlay.setOpacity(sl.opacity);
            _notify();
        });
        oRow.appendChild(oLbl); oRow.appendChild(op);
        box.appendChild(oRow);

        if (sl.stats) {
            const st = document.createElement('div');
            st.className = 'elev-status';
            st.textContent = 'Mean ' + Math.round(sl.stats.mean) + '% · Max ' + Math.round(sl.stats.max) + '%';
            box.appendChild(st);
        }
        el.appendChild(box);
    });
}

// ===== Setup =====

/** onChange() is called after edits (undo push). */
export function setupSlope(onChange) {
    _onChange = onChange;
    _renderLegend();
}
