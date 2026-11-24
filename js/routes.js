/**
 * Simple SITTEMP - Flight Routes Module
 *
 * Shapes → Flight Route: click to place the SP, then ACPs; double-click places
 * the RP and finishes (Esc cancels). Each leg has its own ground speed (knots)
 * and altitude (feet AGL/MSL), defaulting to the previous leg's values.
 *
 * Per leg: magnetic heading (true course minus the route's declination, no wind
 * correction), grid azimuth (true course minus UTM grid convergence), distance
 * in NM and km, ETE and cumulative time. Shown as leg labels on the map and in a
 * route card panel with CSV / PDF export.
 *
 * Checkpoint symbols follow FM 1-02.2 (INCL C1): SP / RP use the point-control
 * template (Table 5-6), ACPs are circles (Table 5-23). A route can be marked as
 * an air corridor (AC, LLTR, MRR, SL, SC, SAAFR, TC, UA) with a width, which
 * draws the corridor edges between circles at each checkpoint plus the Table
 * 5-23 label and NAME / WIDTH / MIN ALT / MAX ALT / DTG block.
 *
 * Route data is part of undo snapshots; Google Maps overlays are runtime only.
 */

import { get, subscribe } from './state.js';
import { showToast } from './toolbar.js';
import { escapeXml } from './symbols.js';

const NM = 1852;
const FT = 0.3048;
const R_EARTH = 6371008.8;
const D2R = Math.PI / 180;

export const CORRIDOR_TYPES = [
    { key: 'AC', name: 'AC - air corridor' },
    { key: 'LLTR', name: 'LLTR - low-level transit route' },
    { key: 'MRR', name: 'MRR - minimum-risk route' },
    { key: 'SL', name: 'SL - safe lane' },
    { key: 'SC', name: 'SC - special corridor' },
    { key: 'SAAFR', name: 'SAAFR - std use Army acft flight route' },
    { key: 'TC', name: 'TC - transit corridor' },
    { key: 'UA', name: 'UA - unmanned aircraft corridor' },
];

const ROUTE_COLORS = ['#0000FF', '#000000', '#FF0000', '#00AA00', '#800080', '#FF8C00'];

let _routes = [];          // [{ data, ov }]
let _nextId = 1;
let _onChange = null;
let _changeTimer = null;
let _selectedId = null;
let _placing = null;

// ===== Math =====

function _dist(a, b) {
    const p1 = a.lat * D2R, p2 = b.lat * D2R, dp = p2 - p1, dl = (b.lng - a.lng) * D2R;
    const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}

function _bearing(a, b) {
    const p1 = a.lat * D2R, p2 = b.lat * D2R, dl = (b.lng - a.lng) * D2R;
    const y = Math.sin(dl) * Math.cos(p2);
    const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
    return (Math.atan2(y, x) / D2R + 360) % 360;
}

function _dest(p, brg, d) {
    const dd = d / R_EARTH, b = brg * D2R, p1 = p.lat * D2R, l1 = p.lng * D2R;
    const p2 = Math.asin(Math.sin(p1) * Math.cos(dd) + Math.cos(p1) * Math.sin(dd) * Math.cos(b));
    const l2 = l1 + Math.atan2(Math.sin(b) * Math.sin(dd) * Math.cos(p1), Math.cos(dd) - Math.sin(p1) * Math.sin(p2));
    return { lat: p2 / D2R, lng: l2 / D2R };
}

/** UTM grid convergence (deg, + when grid north is east of true north). */
export function gridConvergence(lat, lng) {
    const zone = Math.floor((lng + 180) / 6) + 1;
    const lng0 = (zone - 1) * 6 - 180 + 3;
    return Math.atan(Math.tan((lng - lng0) * D2R) * Math.sin(lat * D2R)) / D2R;
}

const _norm = (d) => ((d % 360) + 360) % 360;

/** Computed legs for a route's data. */
export function computeLegs(data) {
    const legs = [];
    let cum = 0, cumDist = 0;
    for (let i = 0; i < data.points.length - 1; i++) {
        const a = data.points[i], b = data.points[i + 1];
        const leg = data.legs[i] || {};
        const d = _dist(a, b);
        const tc = _bearing(a, b);
        const gs = +leg.gs > 0 ? +leg.gs : 0;
        const ete = gs > 0 ? (d / NM) / gs * 3600 : null;
        if (ete !== null && cum !== null) cum += ete; else cum = null;
        cumDist += d;
        legs.push({
            trueCourse: tc,
            magHeading: _norm(tc - (+data.declination || 0)),
            gridAz: _norm(tc - gridConvergence(a.lat, a.lng)),
            distM: d, distNM: d / NM, distKm: d / 1000, cumDistM: cumDist,
            gs: gs, alt: leg.alt, altRef: leg.altRef || 'AGL',
            eteSec: ete, cumSec: cum,
        });
    }
    return legs;
}

export function fmtTime(sec) {
    if (sec === null || sec === undefined || !isFinite(sec)) return '--';
    sec = Math.round(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const ss = String(s).padStart(2, '0');
    return h > 0 ? h + ':' + String(m).padStart(2, '0') + ':' + ss : m + ':' + ss;
}

function _fmtAz(deg) {
    if (get('angleUnit') === 'deg') return String(Math.round(deg) % 360).padStart(3, '0') + '°';
    return String(Math.round(deg * 6400 / 360) % 6400).padStart(4, '0');
}
function _azUnit() { return get('angleUnit') === 'deg' ? '°' : 'mils'; }
function _fmtHdg(deg) { return String(Math.round(deg) % 360 || 360).padStart(3, '0') + '°'; }

export function fmtMGRS(p) {
    try {
        const s = mgrs.forward([p.lng, p.lat], 4);
        const m = s.match(/^(\d{1,2}[A-Z])([A-Z]{2})(\d+)$/);
        if (!m) return s;
        const h = m[3].length / 2;
        return m[1] + ' ' + m[2] + ' ' + m[3].slice(0, h) + ' ' + m[3].slice(h);
    } catch (e) { return ''; }
}

/** Display label for checkpoint i of a route. */
export function cpLabel(data, i) {
    const n = data.points.length;
    if (i === 0) return 'SP';
    if (i === n - 1) return 'RP';
    return 'ACP ' + i;
}

// ===== SVG icons =====

function _svgIcon(svg, w, h, ax, ay) {
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(ax, ay),
    };
}

/** SP / RP: FM 1-02.2 Table 5-6 point template (box with V pointer to the location). */
function _spRpIcon(kind, name, color) {
    name = (name || '').toUpperCase();
    const w = Math.max(40, name.length * 7 + 12);
    const boxH = name ? 32 : 22;
    const h = boxH + 18;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">'
        + '<path d="M1.5,1.5 H' + (w - 1.5) + ' V' + boxH + ' L' + (w / 2) + ',' + (h - 1.5) + ' L1.5,' + boxH + ' Z" fill="#fff" stroke="' + color + '" stroke-width="2" stroke-linejoin="round"/>'
        + '<text x="' + (w / 2) + '" y="16" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + color + '">' + kind + '</text>'
        + (name ? '<text x="' + (w / 2) + '" y="28" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="' + color + '">' + escapeXml(name) + '</text>' : '')
        + '</svg>';
    return _svgIcon(svg, w, h, w / 2, h);
}

/** ACP: FM 1-02.2 Table 5-23 circle with "ACP" over the number. */
function _acpIcon(num, color) {
    const s = 34;
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + s + '" height="' + s + '">'
        + '<circle cx="17" cy="17" r="15.5" fill="#fff" stroke="' + color + '" stroke-width="2"/>'
        + '<text x="17" y="15" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="' + color + '">ACP</text>'
        + '<text x="17" y="26" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="' + color + '">' + num + '</text>'
        + '</svg>';
    return _svgIcon(svg, s, s, 17, 17);
}

function _textIcon(lines, color, opts) {
    opts = opts || {};
    const fs = opts.fontSize || 11;
    const lh = Math.round(fs * 1.25);
    const w = Math.ceil(Math.max.apply(null, lines.map(function (l) { return l.length; })) * fs * 0.62 + 8);
    const h = lines.length * lh + 6;
    const rot = opts.rotate || 0;
    const S = rot ? Math.ceil(Math.sqrt(w * w + h * h)) : 0;
    const W = rot ? S : w, H = rot ? S : h;
    const ox = (W - w) / 2, oy = (H - h) / 2;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '">'
        + '<g transform="rotate(' + rot + ' ' + (W / 2) + ' ' + (H / 2) + ') translate(' + ox + ' ' + oy + ')">';
    lines.forEach(function (l, i) {
        const anchor = opts.left ? 'start' : 'middle';
        const x = opts.left ? 4 : w / 2;
        svg += '<text x="' + x + '" y="' + (3 + lh * (i + 1) - lh * 0.22) + '" text-anchor="' + anchor + '" font-family="Consolas,Menlo,monospace"'
            + ' font-size="' + fs + '" font-weight="bold" fill="' + color + '" stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke">'
            + escapeXml(l) + '</text>';
    });
    svg += '</g></svg>';
    const ay = opts.above ? H + opts.above : H / 2;
    return _svgIcon(svg, W, H, W / 2, ay);
}

// ===== Overlays =====

function _clearOverlays(r) {
    if (!r.ov) return;
    r.ov.items.forEach(function (o) { o.setMap(null); });
    r.ov.listeners.forEach(function (l) { google.maps.event.removeListener(l); });
    r.ov = null;
}

function _altText(v, ref) {
    if (v === '' || v === null || v === undefined || isNaN(+v)) return '';
    return Math.round(+v) + 'FT ' + (ref === 'MSL' ? 'MSL' : 'AGL');
}

function _render(r) {
    _clearOverlays(r);
    const d = r.data, map = get('map'), color = d.color || '#0000FF';
    const items = [], listeners = [];
    const select = function () { selectRoute(d.id); };
    const pts = d.points.map(function (p) { return { lat: p.lat, lng: p.lng }; });
    const corridor = d.corridor && d.corridor.on;
    const halfW = corridor ? Math.max(1, (+d.corridor.width || 1200) * FT / 2) : 0;

    // Centerline (also the click target); faint when the corridor is drawn
    const line = new google.maps.Polyline({
        map: map, path: pts, strokeColor: color, strokeWeight: corridor ? 1 : 3,
        strokeOpacity: corridor ? 0.5 : 0.95, clickable: true, zIndex: 40,
        icons: corridor ? [] : [{ icon: { path: google.maps.SymbolPath.FORWARD_OPEN_ARROW, scale: 2.5, strokeColor: color }, offset: '50%', repeat: '0' }],
    });
    listeners.push(line.addListener('click', select));
    items.push(line);

    const legs = computeLegs(d);

    if (corridor) {
        // Corridor edges between circles at each checkpoint (FM 1-02.2 Table 5-23)
        for (let i = 0; i < pts.length - 1; i++) {
            const a = pts[i], b = pts[i + 1];
            const ab = _bearing(a, b), ba = _bearing(b, a);
            [[-90, 90], [90, -90]].forEach(function (s) {
                const edge = new google.maps.Polyline({
                    map: map, path: [_dest(a, ab + s[0], halfW), _dest(b, ba + s[1], halfW)],
                    strokeColor: color, strokeWeight: 2, strokeOpacity: 0.95, clickable: true, zIndex: 41,
                });
                listeners.push(edge.addListener('click', select));
                items.push(edge);
            });
        }
        pts.forEach(function (p) {
            const c = new google.maps.Circle({ map: map, center: p, radius: halfW, strokeColor: color, strokeWeight: 2,
                strokeOpacity: 0.95, fillOpacity: 0, clickable: true, zIndex: 41 });
            listeners.push(c.addListener('click', select));
            items.push(c);
        });
        // Corridor label on the longest leg, plus the NAME/WIDTH/ALT/DTG block above it
        let li = 0;
        legs.forEach(function (l, i) { if (l.distM > legs[li].distM) li = i; });
        if (legs.length) {
            const mid = _dest(pts[li], legs[li].trueCourse, legs[li].distM / 2);
            let rot = legs[li].trueCourse - 90;
            if (rot > 90) rot -= 180; if (rot < -90) rot += 180;
            const cname = (d.corridor.type + ' ' + (d.name || '')).trim().toUpperCase();
            items.push(new google.maps.Marker({ map: map, position: mid, clickable: false, zIndex: 62, optimized: false,
                icon: _textIcon([cname], color, { fontSize: 13, rotate: rot }) }));
            const block = ['NAME:       ' + (d.name || '').toUpperCase(), 'WIDTH:      ' + Math.round(+d.corridor.width || 0) + 'FT',
                'MIN ALT:    ' + _altText(d.corridor.minAlt, d.corridor.minRef), 'MAX ALT:    ' + _altText(d.corridor.maxAlt, d.corridor.maxRef),
                'DTG START:  ' + (d.corridor.dtgStart || '').toUpperCase(), 'DTG END:    ' + (d.corridor.dtgEnd || '').toUpperCase()];
            items.push(new google.maps.Marker({ map: map, position: mid, clickable: false, zIndex: 61, optimized: false,
                icon: _textIcon(block, color, { fontSize: 10, left: true, above: 28 }) }));
        }
    }

    // Leg labels: magnetic heading, distance, ETE
    legs.forEach(function (l, i) {
        const at = _dest(pts[i], l.trueCourse, l.distM * (corridor ? 0.3 : 0.5));
        const txt = _fmtHdg(l.magHeading) + 'M ' + l.distNM.toFixed(1) + 'NM ' + fmtTime(l.eteSec);
        items.push(new google.maps.Marker({ map: map, position: at, clickable: false, zIndex: 63, optimized: false,
            icon: _textIcon([txt], color, { fontSize: 10, above: corridor ? 0 : 6 }) }));
    });

    // Checkpoint markers (draggable)
    pts.forEach(function (p, i) {
        const n = pts.length;
        const icon = (i === 0 || i === n - 1) ? _spRpIcon(i === 0 ? 'SP' : 'RP', d.points[i].name, color) : _acpIcon(i, color);
        const mk = new google.maps.Marker({ map: map, position: p, icon: icon, draggable: true, clickable: true, zIndex: 70, optimized: false });
        listeners.push(mk.addListener('click', select));
        listeners.push(mk.addListener('drag', function (e) {
            line.setPath(d.points.map(function (q, j) { return j === i ? { lat: e.latLng.lat(), lng: e.latLng.lng() } : { lat: q.lat, lng: q.lng }; }));
        }));
        listeners.push(mk.addListener('dragend', function (e) {
            d.points[i].lat = e.latLng.lat();
            d.points[i].lng = e.latLng.lng();
            _render(r);
            if (_selectedId === d.id) _renderCard();
            _notify();
        }));
        items.push(mk);
    });

    r.ov = { items: items, listeners: listeners };
}

function _notify() {
    if (!_onChange) return;
    if (_changeTimer) clearTimeout(_changeTimer);
    _changeTimer = setTimeout(function () { _changeTimer = null; _onChange(); }, 300);
}

function _find(id) { return _routes.find(function (r) { return r.data.id === id; }); }

// ===== Placement =====

function _defaults() {
    let gs = 90, alt = 500, decl = 0;
    try {
        const s = JSON.parse(localStorage.getItem('sittemp_route_defaults') || '{}');
        if (+s.gs > 0) gs = +s.gs;
        if (s.alt !== undefined && !isNaN(+s.alt)) alt = +s.alt;
        if (!isNaN(+s.declination)) decl = +s.declination;
    } catch (e) { /* ignore */ }
    return { gs: gs, alt: alt, declination: decl };
}

function _saveDefaults(d) {
    try {
        const last = d.legs[d.legs.length - 1] || {};
        localStorage.setItem('sittemp_route_defaults', JSON.stringify({ gs: last.gs, alt: last.alt, declination: d.declination }));
    } catch (e) { /* ignore */ }
}

export function enterRoutePlacement() {
    exitRoutePlacement();
    const map = get('map');
    const draw = get('draw');
    if (draw && get('ready')) { try { draw.setMode('select'); } catch (e) { /* ignore */ } }
    const preview = new google.maps.Polyline({ map: map, path: [], strokeColor: '#0000FF', strokeWeight: 2, strokeOpacity: 0.8, clickable: false, zIndex: 80 });
    const dots = [];
    _placing = { points: [], preview: preview, dots: dots, listeners: [], key: null };
    map.setOptions({ disableDoubleClickZoom: true, draggableCursor: 'crosshair' });
    showToast('Click to place SP and ACPs. Double-click to place RP and finish. Esc cancels.', 4000);

    _placing.listeners.push(map.addListener('click', function (e) {
        const p = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        const pts = _placing.points;
        if (pts.length && _dist(pts[pts.length - 1], p) < 1) return;   // second click of a double-click
        pts.push(p);
        preview.setPath(pts);
        dots.push(new google.maps.Marker({ map: map, position: p, clickable: false, zIndex: 81,
            icon: { path: google.maps.SymbolPath.CIRCLE, scale: 4, fillColor: '#0000FF', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 1.5 } }));
    }));
    _placing.listeners.push(map.addListener('dblclick', function () { _finishPlacement(); }));
    _placing.key = function (e) {
        if (e.key === 'Escape') { exitRoutePlacement(); showToast('Route cancelled'); }
        if (e.key === 'Enter') _finishPlacement();
    };
    document.addEventListener('keydown', _placing.key);
}

export function exitRoutePlacement() {
    if (!_placing) return;
    _placing.preview.setMap(null);
    _placing.dots.forEach(function (m) { m.setMap(null); });
    _placing.listeners.forEach(function (l) { google.maps.event.removeListener(l); });
    document.removeEventListener('keydown', _placing.key);
    const map = get('map');
    if (map) map.setOptions({ disableDoubleClickZoom: false, draggableCursor: null });
    _placing = null;
}

export function isPlacingRoute() { return !!_placing; }

function _finishPlacement() {
    if (!_placing) return;
    const pts = _placing.points.slice();
    exitRoutePlacement();
    if (pts.length < 2) { showToast('A route needs at least an SP and an RP'); return; }
    const def = _defaults();
    const data = {
        id: _nextId++, name: '', color: '#0000FF', declination: def.declination,
        points: pts.map(function (p) { return { lat: p.lat, lng: p.lng, name: '' }; }),
        legs: pts.slice(1).map(function () { return { gs: def.gs, alt: def.alt, altRef: 'AGL' }; }),
        corridor: { on: false, type: 'SAAFR', width: 1200, minAlt: '', minRef: 'AGL', maxAlt: '', maxRef: 'AGL', dtgStart: '', dtgEnd: '' },
    };
    const r = { data: data, ov: null };
    _routes.push(r);
    _render(r);
    selectRoute(data.id);
    _notify();
    showToast('Route placed: ' + (pts.length - 2) + ' ACP' + (pts.length === 3 ? '' : 's'));
}

// ===== Selection / route card =====

export function selectRoute(id) {
    _selectedId = id;
    _renderCard();
}

function _cardEl() {
    let el = document.getElementById('route-card');
    if (!el) {
        el = document.createElement('div');
        el.id = 'route-card';
        (document.getElementById('map-container') || document.body).appendChild(el);
    }
    return el;
}

function _mk(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
}

function _inp(type, value, width, onSet, placeholder) {
    const i = _mk('input', 'rc-input');
    i.type = type;
    i.value = value === undefined || value === null ? '' : value;
    if (width) i.style.width = width + 'px';
    if (placeholder) i.placeholder = placeholder;
    i.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') i.blur(); });
    i.addEventListener('change', function () { onSet(i.value); });
    return i;
}

function _sel(options, value, onSet) {
    const s = _mk('select', 'rc-input');
    options.forEach(function (o) { const op = _mk('option', null, o.name); op.value = o.key; s.appendChild(op); });
    s.value = value;
    s.addEventListener('keydown', function (e) { e.stopPropagation(); });
    s.addEventListener('change', function () { onSet(s.value); });
    return s;
}

function _edited(r) {
    _render(r);
    _renderCard();
    _saveDefaults(r.data);
    _notify();
}

function _renderCard() {
    const el = _cardEl();
    const r = _find(_selectedId);
    el.innerHTML = '';
    if (!r) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    const d = r.data;
    const legs = computeLegs(d);
    const REF = [{ key: 'AGL', name: 'AGL' }, { key: 'MSL', name: 'MSL' }];

    // Header
    const head = _mk('div', 'rc-head');
    head.appendChild(_mk('span', 'rc-title', 'Route'));
    head.appendChild(_inp('text', d.name, 110, function (v) { d.name = v; _edited(r); }, 'name e.g. BLUE'));
    const sw = _mk('span', 'rc-swatches');
    ROUTE_COLORS.forEach(function (c) {
        const s = _mk('span', 'rc-swatch' + (c === d.color ? ' active' : ''));
        s.style.background = c;
        s.addEventListener('click', function () { d.color = c; _edited(r); });
        sw.appendChild(s);
    });
    head.appendChild(sw);
    const close = _mk('button', 'rc-close', '×');
    close.title = 'Close route card';
    close.addEventListener('click', function () { selectRoute(null); });
    head.appendChild(close);
    el.appendChild(head);

    // Declination + corridor toggle
    const row = _mk('div', 'rc-row');
    row.appendChild(_mk('span', 'rc-lbl', 'Declination'));
    row.appendChild(_inp('number', d.declination, 60, function (v) { const n = parseFloat(v); d.declination = isNaN(n) ? 0 : n; _edited(r); }));
    row.appendChild(_mk('span', 'rc-hint', '° (+E / −W)'));
    const cbl = _mk('label', 'rc-check');
    const cb = _mk('input'); cb.type = 'checkbox'; cb.checked = !!d.corridor.on;
    cb.addEventListener('change', function () { d.corridor.on = cb.checked; _edited(r); });
    cbl.appendChild(cb); cbl.appendChild(document.createTextNode(' Air corridor'));
    row.appendChild(cbl);
    el.appendChild(row);

    if (d.corridor.on) {
        const c = d.corridor;
        const r1 = _mk('div', 'rc-row');
        r1.appendChild(_sel(CORRIDOR_TYPES, c.type, function (v) { c.type = v; _edited(r); }));
        r1.appendChild(_mk('span', 'rc-lbl', 'Width'));
        r1.appendChild(_inp('number', c.width, 64, function (v) { const n = parseFloat(v); if (n > 0) c.width = n; _edited(r); }));
        r1.appendChild(_mk('span', 'rc-hint', 'ft'));
        el.appendChild(r1);
        const r2 = _mk('div', 'rc-row');
        r2.appendChild(_mk('span', 'rc-lbl', 'Min'));
        r2.appendChild(_inp('number', c.minAlt, 64, function (v) { c.minAlt = v === '' ? '' : +v; _edited(r); }, 'ft'));
        r2.appendChild(_sel(REF, c.minRef, function (v) { c.minRef = v; _edited(r); }));
        r2.appendChild(_mk('span', 'rc-lbl', 'Max'));
        r2.appendChild(_inp('number', c.maxAlt, 64, function (v) { c.maxAlt = v === '' ? '' : +v; _edited(r); }, 'ft'));
        r2.appendChild(_sel(REF, c.maxRef, function (v) { c.maxRef = v; _edited(r); }));
        el.appendChild(r2);
        const r3 = _mk('div', 'rc-row');
        r3.appendChild(_mk('span', 'rc-lbl', 'DTG'));
        r3.appendChild(_inp('text', c.dtgStart, 110, function (v) { c.dtgStart = v; _edited(r); }, 'start'));
        r3.appendChild(_inp('text', c.dtgEnd, 110, function (v) { c.dtgEnd = v; _edited(r); }, 'end'));
        el.appendChild(r3);
    }

    // Route card table
    const tbl = _mk('table', 'rc-table');
    const hdr = _mk('tr');
    ['CP', 'MGRS', 'Mag hdg', 'Grid az (' + _azUnit() + ')', 'NM', 'km', 'GS kt', 'Alt ft', '', 'ETE', 'Total', ''].forEach(function (h) { hdr.appendChild(_mk('th', null, h)); });
    tbl.appendChild(hdr);
    d.points.forEach(function (p, i) {
        const tr = _mk('tr');
        const cpCell = _mk('td', 'rc-cp');
        cpCell.appendChild(_mk('span', null, cpLabel(d, i)));
        if (i === 0 || i === d.points.length - 1) {
            cpCell.appendChild(_inp('text', p.name, 56, function (v) { p.name = v; _edited(r); }, 'name'));
        }
        tr.appendChild(cpCell);
        tr.appendChild(_mk('td', 'rc-mono', fmtMGRS(p)));
        if (i === 0) {
            for (let k = 0; k < 9; k++) tr.appendChild(_mk('td'));
        } else {
            const l = legs[i - 1], leg = d.legs[i - 1];
            tr.appendChild(_mk('td', 'rc-mono', _fmtHdg(l.magHeading)));
            tr.appendChild(_mk('td', 'rc-mono', _fmtAz(l.gridAz)));
            tr.appendChild(_mk('td', 'rc-mono', l.distNM.toFixed(1)));
            tr.appendChild(_mk('td', 'rc-mono', l.distKm.toFixed(1)));
            const gsTd = _mk('td'); gsTd.appendChild(_inp('number', leg.gs, 46, function (v) {
                const n = parseFloat(v); if (n > 0) leg.gs = n; _edited(r);
            })); tr.appendChild(gsTd);
            const altTd = _mk('td'); altTd.appendChild(_inp('number', leg.alt, 54, function (v) {
                leg.alt = v === '' ? '' : +v; _edited(r);
            })); tr.appendChild(altTd);
            const refTd = _mk('td'); refTd.appendChild(_sel(REF, leg.altRef || 'AGL', function (v) { leg.altRef = v; _edited(r); })); tr.appendChild(refTd);
            tr.appendChild(_mk('td', 'rc-mono', fmtTime(l.eteSec)));
            tr.appendChild(_mk('td', 'rc-mono', fmtTime(l.cumSec)));
        }
        const delTd = _mk('td');
        if (i > 0 && i < d.points.length - 1) {
            const x = _mk('button', 'rc-del', '×');
            x.title = 'Remove this ACP';
            x.addEventListener('click', function () {
                d.points.splice(i, 1);
                // Merge the two legs around the removed point; keep the inbound leg's values
                d.legs.splice(i, 1);
                _edited(r);
            });
            delTd.appendChild(x);
        }
        tr.appendChild(delTd);
        tbl.appendChild(tr);
    });
    const wrap = _mk('div', 'rc-table-wrap');
    wrap.appendChild(tbl);
    el.appendChild(wrap);

    // Totals + actions
    const last = legs[legs.length - 1];
    const foot = _mk('div', 'rc-row rc-foot');
    foot.appendChild(_mk('span', 'rc-total', 'Total ' + (last ? (last.cumDistM / NM).toFixed(1) + ' NM / ' + (last.cumDistM / 1000).toFixed(1) + ' km · ' + fmtTime(last.cumSec) : '')));
    foot.appendChild(_mk('span', 'rc-hint', 'Mag hdg = course, no wind'));
    const csv = _mk('button', 'rc-btn', 'CSV'); csv.addEventListener('click', function () { exportRouteCSV(d.id); });
    const pdf = _mk('button', 'rc-btn', 'PDF'); pdf.addEventListener('click', function () { exportRoutePDF(d.id); });
    const del = _mk('button', 'rc-btn rc-btn-danger', 'Delete route');
    del.addEventListener('click', function () { deleteRoute(d.id); });
    foot.appendChild(csv); foot.appendChild(pdf); foot.appendChild(del);
    el.appendChild(foot);
}

export function deleteRoute(id) {
    const r = _find(id);
    if (!r) return;
    _clearOverlays(r);
    _routes = _routes.filter(function (x) { return x !== r; });
    if (_selectedId === id) selectRoute(null);
    _notify();
    showToast('Route deleted');
}

// ===== Export =====

/** Route card rows: [header, ...rows] of strings. */
export function routeCardRows(data) {
    const legs = computeLegs(data);
    const rows = [['CP', 'Name', 'MGRS', 'Mag hdg', 'Grid az (' + _azUnit() + ')', 'Dist NM', 'Dist km', 'GS kt', 'Alt ft', 'Alt ref', 'ETE', 'Total']];
    data.points.forEach(function (p, i) {
        const l = i > 0 ? legs[i - 1] : null;
        const leg = i > 0 ? data.legs[i - 1] : null;
        rows.push([
            cpLabel(data, i), (p.name || '').toUpperCase(), fmtMGRS(p),
            l ? _fmtHdg(l.magHeading) : '', l ? _fmtAz(l.gridAz) : '',
            l ? l.distNM.toFixed(1) : '', l ? l.distKm.toFixed(1) : '',
            l ? String(l.gs) : '', leg && leg.alt !== '' && leg.alt !== undefined ? String(leg.alt) : '', leg ? (leg.altRef || 'AGL') : '',
            l ? fmtTime(l.eteSec) : '', l ? fmtTime(l.cumSec) : '',
        ]);
    });
    return rows;
}

function _download(name, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
}

function _fileName(d) { return 'route_' + ((d.name || 'unnamed').replace(/[^A-Za-z0-9_-]+/g, '_')); }

export function exportRouteCSV(id) {
    const r = _find(id); if (!r) return;
    const q = function (s) { s = String(s); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const lines = routeCardRows(r.data).map(function (row) { return row.map(q).join(','); });
    lines.unshift('Declination,' + (r.data.declination || 0) + ' deg (+E/-W)');
    lines.unshift('Route,' + q((r.data.name || '').toUpperCase()));
    _download(_fileName(r.data) + '.csv', lines.join('\r\n') + '\r\n', 'text/csv');
}

export function exportRoutePDF(id) {
    const r = _find(id); if (!r) return;
    if (!window.jspdf) { showToast('PDF library not loaded'); return; }
    const d = r.data;
    const pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });
    const rows = routeCardRows(d);
    const widths = [46, 70, 120, 50, 70, 50, 50, 44, 48, 44, 50, 56];
    let y = 40;
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14);
    pdf.text('ROUTE CARD' + (d.name ? ' - ' + d.name.toUpperCase() : ''), 36, y);
    y += 18;
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9);
    let sub = 'Declination ' + (d.declination || 0) + '° (+E/-W). Mag hdg = magnetic course, no wind correction.';
    if (d.corridor && d.corridor.on) {
        const c = d.corridor;
        sub += '  ' + c.type + ' ' + (d.name || '').toUpperCase() + ': width ' + c.width + 'FT, ' + (_altText(c.minAlt, c.minRef) || '-') + ' to ' + (_altText(c.maxAlt, c.maxRef) || '-')
            + (c.dtgStart ? ', ' + c.dtgStart.toUpperCase() + ' - ' + (c.dtgEnd || '').toUpperCase() : '');
    }
    pdf.text(sub, 36, y);
    y += 20;
    rows.forEach(function (row, ri) {
        let x = 36;
        pdf.setFont('courier', ri === 0 ? 'bold' : 'normal');
        pdf.setFontSize(ri === 0 ? 8 : 9);
        row.forEach(function (cell, ci) { pdf.text(String(cell), x + 2, y); x += widths[ci]; });
        pdf.setDrawColor(180); pdf.line(36, y + 5, x, y + 5);
        y += 17;
        if (y > 570) { pdf.addPage(); y = 40; }
    });
    const legs = computeLegs(d), last = legs[legs.length - 1];
    if (last) {
        pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
        pdf.text('Total ' + (last.cumDistM / NM).toFixed(1) + ' NM / ' + (last.cumDistM / 1000).toFixed(1) + ' km   Time ' + fmtTime(last.cumSec), 36, y + 8);
    }
    pdf.save(_fileName(d) + '.pdf');
}

/** KML Placemarks for all routes. */
export function routesKML() {
    let kml = '';
    _routes.forEach(function (r) {
        const d = r.data;
        const title = ((d.corridor && d.corridor.on ? d.corridor.type + ' ' : 'Route ') + (d.name || d.id)).toUpperCase();
        kml += '<Placemark>\n<name>' + escapeXml(title) + '</name>\n';
        kml += '<description>' + escapeXml(routeCardRows(d).map(function (row) { return row.join(' | '); }).join('\n')) + '</description>\n';
        kml += '<LineString><coordinates>\n';
        d.points.forEach(function (p) { kml += p.lng + ',' + p.lat + ',0\n'; });
        kml += '</coordinates></LineString>\n</Placemark>\n';
        d.points.forEach(function (p, i) {
            kml += '<Placemark><name>' + escapeXml((cpLabel(d, i) + ' ' + (p.name || '')).trim().toUpperCase()) + '</name>'
                + '<Point><coordinates>' + p.lng + ',' + p.lat + ',0</coordinates></Point></Placemark>\n';
        });
    });
    return kml;
}

// ===== Undo integration =====

export function getRouteConfigs() {
    return JSON.parse(JSON.stringify(_routes.map(function (r) { return r.data; })));
}

export function restoreRoutes(list) {
    _routes.forEach(_clearOverlays);
    _routes = (list || []).map(function (d) {
        _nextId = Math.max(_nextId, d.id + 1);
        return { data: JSON.parse(JSON.stringify(d)), ov: null };
    });
    _routes.forEach(_render);
    if (_selectedId !== null && !_find(_selectedId)) _selectedId = null;
    _renderCard();
}

/** Re-render labels/card when the angle unit changes. */
export function refreshRoutes() {
    _routes.forEach(_render);
    _renderCard();
}

export function setupRoutes(onChange) {
    _onChange = onChange;
    subscribe('angleUnit', refreshRoutes);
}
