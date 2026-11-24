/**
 * Simple SITTEMP - Elevation Shading Module
 *
 * Shades an area with fixed elevation bands (meters). The area is either a drawn
 * polygon / rectangle / circle / freehand shape, or the current map view.
 *
 * A ~100x100 grid of elevations is fetched from the Google Maps Elevation service
 * (~20 requests), upsampled with bilinear interpolation, classified into bands of
 * a fixed interval, colored with one of five palettes (Muted, Soft, Classic, Bold,
 * Dark) stretched from the lowest to the highest band in the area, clipped to the
 * shape, and shown as a GroundOverlay. Bands are flat fills with no contour lines.
 * Grid rows are spaced evenly in Web Mercator so the image lines up with the map.
 *
 * Shade configs (area, interval, opacity) are part of undo snapshots; fetched
 * grids are cached in memory by shade id so undo/redo and interval changes don't
 * re-query the service.
 */

import { get } from './state.js';
import { showToast } from './toolbar.js';
import { fetchElevations, elevationRequestCount } from './viewshed.js';

const TARGET_POINTS = 10000;   // ~100 x 100 grid
const MIN_DIM = 10;
const MAX_DIM = 300;
const UPSAMPLE = 4;
const MAX_CANVAS = 1200;
export const DEFAULT_INTERVAL = 50;   // meters
const DEFAULT_OPACITY = 0.55;

// Color palettes, muted → bold, plus a dark theme. Stops run low → peak and are
// stretched across the bands present in each shaded area.
export const PALETTES = [
    { key: 'muted', name: 'Muted', stops: ['#6f7d6a', '#959a7e', '#b4ad92', '#cbc2b0', '#e4dfd6'] },
    { key: 'soft', name: 'Soft', stops: ['#9fcfae', '#cfe5ad', '#f2e3a6', '#e9c39d', '#d9a88f', '#f7efe8'] },
    { key: 'classic', name: 'Classic', stops: ['#4f9a5e', '#86c07a', '#d6e29a', '#e8c27a', '#c98e52', '#946748', '#ffffff'] },
    { key: 'bold', name: 'Bold', stops: ['#006837', '#1a9850', '#a6d96a', '#fee08b', '#f46d43', '#d73027', '#7f0000'] },
    { key: 'dark', name: 'Dark (white peaks)', stops: ['#0b1026', '#1b2a55', '#2d4f86', '#4f86ad', '#93bfd0', '#d6e8ee', '#ffffff'] },
];
export const DEFAULT_PALETTE = 'classic';

let _shades = [];               // { id, ring:[[lat,lng]...], bounds:{n,s,e,w}, interval, opacity, overlay, status, stats }
const _grids = new Map();       // id -> { rows, cols, elev: Float64Array }
let _nextId = 1;
let _onChange = null;
let _changeTimer = null;

// ===== Math helpers =====

const D2R = Math.PI / 180;
function mercY(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * D2R / 2)); }
function invMercY(y) { return (2 * Math.atan(Math.exp(y)) - Math.PI / 2) / D2R; }

function hexToRgb(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const _RGB = {};
PALETTES.forEach(function (p) { _RGB[p.key] = p.stops.map(hexToRgb); });

/** RGB at position t (0 = low, 1 = peak) on a palette. */
export function paletteColor(key, t) {
    const stops = _RGB[key] || _RGB[DEFAULT_PALETTE];
    t = Math.max(0, Math.min(1, t));
    const x = t * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(x)), f = x - i;
    const a = stops[i], b = stops[i + 1];
    return [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * f); });
}

/** RGB for a band, stretched so the lowest band in the area is the first stop and the highest the peak. */
export function bandColor(key, band, minBand, maxBand) {
    const t = maxBand > minBand ? (band - minBand) / (maxBand - minBand) : 0.5;
    return paletteColor(key, t);
}

/** Grid dimensions for a bounds box, keeping cells roughly square on the ground. */
export function gridSpec(bounds) {
    const midLat = (bounds.n + bounds.s) / 2;
    const wM = Math.max(1, (bounds.e - bounds.w) * 111320 * Math.cos(midLat * D2R));
    const hM = Math.max(1, (bounds.n - bounds.s) * 111320);
    const aspect = wM / hM;
    const cols = Math.max(MIN_DIM, Math.min(MAX_DIM, Math.round(Math.sqrt(TARGET_POINTS * aspect))));
    const rows = Math.max(MIN_DIM, Math.min(MAX_DIM, Math.round(TARGET_POINTS / cols)));
    return { rows: rows, cols: cols, spacing: Math.max(wM / (cols - 1), hM / (rows - 1)) };
}

/** Grid sample points (row-major, north row first) as {lat,lng}. */
export function gridPoints(bounds, rows, cols) {
    const yN = mercY(bounds.n), yS = mercY(bounds.s);
    const pts = [];
    for (let r = 0; r < rows; r++) {
        const lat = invMercY(yN - (yN - yS) * r / (rows - 1));
        for (let c = 0; c < cols; c++) {
            pts.push({ lat: lat, lng: bounds.w + (bounds.e - bounds.w) * c / (cols - 1) });
        }
    }
    return pts;
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

// ===== Rendering =====

/**
 * Render a shade's grid into a PNG data URL. Returns { url, stats } where stats
 * lists the min/max elevation and the band indices present inside the area.
 */
export function renderShade(shade, grid) {
    const rows = grid.rows, cols = grid.cols, elev = grid.elev;
    const interval = Math.max(1, +shade.interval || DEFAULT_INTERVAL);
    const b = shade.bounds;

    // Stats from grid points inside the area
    const pts = gridPoints(b, rows, cols);
    let min = Infinity, max = -Infinity;
    const bandSet = new Set();
    for (let i = 0; i < pts.length; i++) {
        if (!pointInRing(pts[i].lat, pts[i].lng, shade.ring) && !shade.isView) continue;
        const e = elev[i];
        if (e < min) min = e;
        if (e > max) max = e;
        bandSet.add(Math.floor(e / interval));
    }
    if (min === Infinity) { min = Math.min.apply(null, elev); max = Math.max.apply(null, elev); }

    const W = Math.min(MAX_CANVAS, cols * UPSAMPLE);
    const H = Math.min(MAX_CANVAS, rows * UPSAMPLE);
    const bands = new Int32Array(W * H);
    for (let py = 0; py < H; py++) {
        const gy = py / (H - 1) * (rows - 1);
        const r0 = Math.min(rows - 2, Math.floor(gy)), ty = gy - r0;
        for (let px = 0; px < W; px++) {
            const gx = px / (W - 1) * (cols - 1);
            const c0 = Math.min(cols - 2, Math.floor(gx)), tx = gx - c0;
            const i00 = r0 * cols + c0;
            const e = (elev[i00] * (1 - tx) + elev[i00 + 1] * tx) * (1 - ty)
                + (elev[i00 + cols] * (1 - tx) + elev[i00 + cols + 1] * tx) * ty;
            bands[py * W + px] = Math.floor(e / interval);
        }
    }

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(W, H);
    const palette = shade.palette || DEFAULT_PALETTE;
    const minBand = Math.floor(min / interval), maxBand = Math.floor(max / interval);
    const colorCache = new Map();
    for (let p = 0; p < W * H; p++) {
        const band = bands[p];
        let rgb = colorCache.get(band);
        if (!rgb) { rgb = bandColor(palette, band, minBand, maxBand); colorCache.set(band, rgb); }
        img.data[p * 4] = rgb[0];
        img.data[p * 4 + 1] = rgb[1];
        img.data[p * 4 + 2] = rgb[2];
        img.data[p * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    // Clip to the area shape (no-op for the map-view rectangle)
    if (!shade.isView) {
        const yN = mercY(b.n), yS = mercY(b.s);
        ctx.globalCompositeOperation = 'destination-in';
        ctx.beginPath();
        shade.ring.forEach(function (p, i) {
            const x = (p[1] - b.w) / (b.e - b.w) * W;
            const y = (yN - mercY(p[0])) / (yN - yS) * H;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }

    const bandList = Array.from(bandSet).sort(function (a, c) { return c - a; });
    return { url: canvas.toDataURL('image/png'), stats: { min: min, max: max, bands: bandList, interval: interval, palette: palette, minBand: minBand, maxBand: maxBand } };
}

// ===== Shade lifecycle =====

function _notify() {
    if (!_onChange) return;
    if (_changeTimer) clearTimeout(_changeTimer);
    _changeTimer = setTimeout(function () { _changeTimer = null; _onChange(); }, 300);
}

function _draw(shade) {
    const grid = _grids.get(shade.id);
    if (!grid) return;
    const out = renderShade(shade, grid);
    shade.stats = out.stats;
    if (shade.overlay) shade.overlay.setMap(null);
    shade.overlay = new google.maps.GroundOverlay(out.url,
        { north: shade.bounds.n, south: shade.bounds.s, east: shade.bounds.e, west: shade.bounds.w },
        { opacity: shade.opacity, clickable: false, map: get('map') });
    shade.status = '';
    _renderLegend();
}

const _loading = new Map();      // id -> Promise of grid

function _fetchGrid(shade) {
    if (_loading.has(shade.id)) return _loading.get(shade.id);
    const id = shade.id;
    const spec = gridSpec(shade.bounds);
    const pts = gridPoints(shade.bounds, spec.rows, spec.cols).map(function (p) { return new google.maps.LatLng(p.lat, p.lng); });
    const p = fetchElevations(pts, function (f) {
        _shades.forEach(function (s) { if (s.id === id) s.status = 'Loading… ' + Math.round(f * 100) + '%'; });
        _renderLegend();
    }).then(function (elev) {
        const grid = { rows: spec.rows, cols: spec.cols, elev: Float64Array.from(elev) };
        _grids.set(id, grid);
        _loading.delete(id);
        return grid;
    }, function (err) { _loading.delete(id); throw err; });
    _loading.set(id, p);
    return p;
}

async function _load(shade) {
    if (_grids.has(shade.id)) { _draw(shade); return; }
    shade.status = 'Loading… 0%';
    _renderLegend();
    try {
        await _fetchGrid(shade);
        // Draw whichever object currently represents this id (undo may have replaced it)
        _shades.forEach(function (s) { if (s.id === shade.id) _draw(s); });
    } catch (err) {
        const msg = String(err && err.message || err);
        showToast(msg === 'REQUEST_DENIED'
            ? 'Elevation shading failed: the Elevation API is not enabled for this map key'
            : 'Elevation shading failed (' + msg + ')');
        _remove(shade, false);
    }
}

function _add(ring, isView) {
    const bounds = boundsOfRing(ring);
    if (bounds.e - bounds.w <= 0 || bounds.n - bounds.s <= 0) { showToast('Area is too small to shade'); return; }
    if (bounds.e - bounds.w > 180) { showToast('Area is too large to shade'); return; }
    const spec = gridSpec(bounds);
    const shade = {
        id: _nextId++, ring: ring, bounds: bounds, isView: !!isView,
        interval: _defaultInterval(), palette: _defaultPalette(), opacity: DEFAULT_OPACITY, overlay: null, status: '', stats: null,
    };
    _shades.push(shade);
    const reqs = elevationRequestCount(spec.rows * spec.cols);
    const coarse = spec.spacing > 300 ? ' Coarse: ~' + Math.round(spec.spacing) + ' m between samples, zoom in for more detail.' : '';
    showToast('Shading elevation (' + reqs + ' elevation requests).' + coarse, coarse ? 5000 : 2500);
    _load(shade).then(_notify);
}

function _remove(shade, notify) {
    if (shade.overlay) shade.overlay.setMap(null);
    _shades = _shades.filter(function (s) { return s !== shade; });
    // Grid stays cached so undoing the removal doesn't re-query the service
    _renderLegend();
    if (notify !== false) _notify();
}

function _defaultPalette() {
    const sel = document.getElementById('elev-palette');
    const v = sel ? sel.value : null;
    return PALETTES.some(function (p) { return p.key === v; }) ? v : DEFAULT_PALETTE;
}

/** Palette <select> whose options show a small gradient preview. */
function _paletteSelect(value, onSet) {
    const sel = document.createElement('select');
    sel.className = 'popover-select elev-palette-select';
    PALETTES.forEach(function (p) {
        const op = document.createElement('option');
        op.value = p.key; op.textContent = p.name;
        sel.appendChild(op);
    });
    sel.value = value;
    const paint = function () {
        const p = PALETTES.find(function (x) { return x.key === sel.value; }) || PALETTES[0];
        sel.style.borderLeft = '14px solid ' + p.stops[Math.floor(p.stops.length / 2)];
        sel.style.backgroundImage = 'linear-gradient(to right, ' + p.stops.join(',') + ')';
        sel.style.backgroundSize = '100% 3px';
        sel.style.backgroundRepeat = 'no-repeat';
        sel.style.backgroundPosition = 'bottom';
    };
    paint();
    sel.addEventListener('keydown', function (e) { e.stopPropagation(); });
    sel.addEventListener('change', function () { paint(); onSet(sel.value); });
    return sel;
}

function _defaultInterval() {
    const inp = document.getElementById('elev-interval');
    const v = inp ? parseFloat(inp.value) : NaN;
    return (!isNaN(v) && v >= 1) ? v : DEFAULT_INTERVAL;
}

/** Shade the area of a Terra Draw polygon feature (polygon, rectangle, circle, freehand). */
export function shadeFeature(featureId) {
    const draw = get('draw');
    let feature = null;
    try { feature = draw && draw.getSnapshotFeature(featureId); } catch (e) { /* ignore */ }
    if (!feature || feature.geometry.type !== 'Polygon') { showToast('Select a polygon, rectangle or circle to shade'); return; }
    const ring = feature.geometry.coordinates[0].map(function (c) { return [c[1], c[0]]; });
    _add(ring, false);
}

/** Shade the current map view. */
export function shadeCurrentView() {
    const map = get('map');
    const b = map && map.getBounds();
    if (!b) return;
    const ne = b.getNorthEast(), sw = b.getSouthWest();
    if (sw.lng() > ne.lng()) { showToast('Cannot shade a view that crosses the 180° meridian'); return; }
    const n = ne.lat(), s = sw.lat(), e = ne.lng(), w = sw.lng();
    _add([[n, w], [n, e], [s, e], [s, w]], true);
}

// ===== Undo integration =====

/** Serializable shade configs for undo snapshots. */
export function getShadeConfigs() {
    return _shades.map(function (s) {
        return { id: s.id, ring: s.ring, isView: s.isView, interval: s.interval, palette: s.palette, opacity: s.opacity };
    });
}

/** Replace all shades with the given configs (from an undo snapshot). */
export function restoreShades(configs) {
    _shades.forEach(function (s) { if (s.overlay) s.overlay.setMap(null); });
    _shades = (configs || []).map(function (c) {
        _nextId = Math.max(_nextId, c.id + 1);
        return { id: c.id, ring: c.ring, bounds: boundsOfRing(c.ring), isView: !!c.isView,
            interval: c.interval, palette: c.palette || DEFAULT_PALETTE, opacity: c.opacity, overlay: null, status: '', stats: null };
    });
    _shades.forEach(function (s) { _load(s); });
    _renderLegend();
}

// ===== Legend =====

function _legendEl() {
    let el = document.getElementById('elev-legend');
    if (!el) {
        el = document.createElement('div');
        el.id = 'elev-legend';
        const container = document.getElementById('map-container') || document.body;
        container.appendChild(el);
    }
    return el;
}

function _fmt(m) { return Math.round(m).toLocaleString('en-US'); }

function _renderLegend() {
    const el = _legendEl();
    el.innerHTML = '';
    el.style.display = _shades.length ? 'block' : 'none';
    _shades.forEach(function (shade, idx) {
        const box = document.createElement('div');
        box.className = 'elev-entry';

        const head = document.createElement('div');
        head.className = 'elev-head';
        const title = document.createElement('span');
        title.textContent = 'Elevation ' + (_shades.length > 1 ? (idx + 1) + ' ' : '') + '(m)';
        const rm = document.createElement('button');
        rm.className = 'elev-remove';
        rm.textContent = '×';
        rm.title = 'Remove this shading';
        rm.addEventListener('click', function () { _remove(shade); });
        head.appendChild(title);
        head.appendChild(rm);
        box.appendChild(head);

        if (shade.status) {
            const st = document.createElement('div');
            st.className = 'elev-status';
            st.textContent = shade.status;
            box.appendChild(st);
            el.appendChild(box);
            return;
        }

        // Interval + opacity controls
        const ctl = document.createElement('div');
        ctl.className = 'elev-ctl';
        const inp = document.createElement('input');
        inp.type = 'number'; inp.min = 1; inp.step = 10; inp.value = shade.interval;
        inp.className = 'popover-num elev-num';
        inp.title = 'Band interval (m)';
        inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
        inp.addEventListener('change', function () {
            const v = parseFloat(inp.value);
            if (!isNaN(v) && v >= 1) { shade.interval = v; _draw(shade); _notify(); }
        });
        const lbl = document.createElement('span');
        lbl.textContent = 'm bands';
        const sl = document.createElement('input');
        sl.type = 'range'; sl.min = 0.1; sl.max = 1; sl.step = 0.05; sl.value = shade.opacity;
        sl.className = 'popover-slider';
        sl.title = 'Opacity';
        sl.addEventListener('input', function () {
            shade.opacity = parseFloat(sl.value);
            if (shade.overlay) shade.overlay.setOpacity(shade.opacity);
            _notify();
        });
        ctl.appendChild(inp); ctl.appendChild(lbl); ctl.appendChild(sl);
        box.appendChild(ctl);

        // Palette picker (redraws from the cached grid, no new requests)
        const pRow = document.createElement('div');
        pRow.className = 'elev-ctl';
        pRow.appendChild(_paletteSelect(shade.palette || DEFAULT_PALETTE, function (v) {
            shade.palette = v; _draw(shade); _notify();
        }));
        box.appendChild(pRow);

        const st = shade.stats;
        if (st) {
            const mm = document.createElement('div');
            mm.className = 'elev-status';
            mm.textContent = 'Min ' + _fmt(st.min) + ' · Max ' + _fmt(st.max);
            box.appendChild(mm);

            const list = document.createElement('div');
            list.className = 'elev-bands';
            const n = st.bands.length;
            const compact = n > 14;
            const labelEvery = compact ? Math.max(2, Math.ceil(n / 8)) : 1;
            st.bands.forEach(function (band, i) {
                const row = document.createElement('div');
                row.className = 'elev-band' + (compact ? ' compact' : '');
                const sw = document.createElement('span');
                sw.className = 'elev-swatch';
                const rgb = bandColor(st.palette, band, st.minBand, st.maxBand);
                sw.style.background = 'rgb(' + rgb.join(',') + ')';
                row.appendChild(sw);
                // Label every Nth band; label the last band too unless that would crowd the previous label
                if (i % labelEvery === 0 || (i === n - 1 && i % labelEvery >= 2)) {
                    const t = document.createElement('span');
                    t.textContent = _fmt(band * st.interval) + '–' + _fmt((band + 1) * st.interval);
                    row.appendChild(t);
                }
                list.appendChild(row);
            });
            box.appendChild(list);
        }
        el.appendChild(box);
    });
}

// ===== Setup =====

/** Wire the Map submenu controls. onChange() is called after edits (undo push). */
export function setupElevationShading(onChange) {
    _onChange = onChange;
    const btn = document.getElementById('elev-shade-view');
    if (btn) btn.addEventListener('click', shadeCurrentView);
    const inp = document.getElementById('elev-interval');
    if (inp) inp.addEventListener('keydown', function (e) { e.stopPropagation(); });

    // Default palette for new shadings (remembered between visits)
    const holder = document.getElementById('elev-palette-holder');
    if (holder) {
        let saved = DEFAULT_PALETTE;
        try { saved = localStorage.getItem('sittemp_elev_palette') || DEFAULT_PALETTE; } catch (e) { /* ignore */ }
        const sel = _paletteSelect(PALETTES.some(function (p) { return p.key === saved; }) ? saved : DEFAULT_PALETTE, function (v) {
            try { localStorage.setItem('sittemp_elev_palette', v); } catch (e) { /* ignore */ }
        });
        sel.id = 'elev-palette';
        holder.appendChild(sel);
    }
    _renderLegend();
}
