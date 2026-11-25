/**
 * Simple SITTEMP - Control Measures Module
 *
 * Tags drawn area shapes (polygon, rectangle, circle, freehand) as doctrinal
 * control measures and draws their labels, per FM 1-02.2 (INCL C1):
 *   - Area control measures (Table 5-4): PZ, LZ, DZ, HA, FARP â€” label "PZ WOLF"
 *     centered inside the area. HA is not in Table 5-4 and uses the same template.
 *   - Battle position (Table 5-5): name inside, echelon on the bottom edge.
 *   - Airspace coordinating zones (Table 5-23): ROZ, HIDACZ, AARROZ, UAROZ, WEZ,
 *     JEZ, MEZ, LOMEZ, HIMEZ, SHORAD EZ â€” block of function (A), unit (T),
 *     MIN ALT / MAX ALT (feet AGL or MSL), TIME FROM / TIME TO (DTG).
 *
 * Tags live in state.featureMeasures keyed by Terra Draw feature id (included in
 * undo snapshots). Labels are non-clickable Google Maps markers, runtime only.
 */

import { get } from './state.js';
import { ECHELON_LIST, escapeXml, haloFor } from './symbols.js';

export const AREA_MEASURES = [
    { key: 'PZ', name: 'PZ - pickup zone' },
    { key: 'LZ', name: 'LZ - landing zone' },
    { key: 'DZ', name: 'DZ - drop zone' },
    { key: 'HA', name: 'HA - holding area' },
    { key: 'FARP', name: 'FARP - fwd arming/refuel pt' },
    { key: 'BP', name: 'BP - battle position' },
];

export const AIRSPACE_ZONES = [
    { key: 'ROZ', name: 'ROZ - restricted operations zone' },
    { key: 'HIDACZ', name: 'HIDACZ - high-density ACZ' },
    { key: 'AARROZ', name: 'AARROZ - air refueling ROZ' },
    { key: 'UAROZ', name: 'UAROZ - unmanned aircraft ROZ' },
    { key: 'WEZ', name: 'WEZ - weapon engagement zone' },
    { key: 'JEZ', name: 'JEZ - joint engagement zone' },
    { key: 'MEZ', name: 'MEZ - missile engagement zone' },
    { key: 'LOMEZ', name: 'LOMEZ - low-altitude MEZ' },
    { key: 'HIMEZ', name: 'HIMEZ - high-altitude MEZ' },
    { key: 'SHORAD EZ', name: 'SHORAD EZ - SHORAD eng. zone' },
];

const ECHELON_GLYPH = {
    platoon: 'â€¢â€¢â€¢', company: 'I', battalion: 'II', regiment: 'III',
    brigade: 'X', division: 'XX', corps: 'XXX',
};

const _labels = {};   // featureId -> { main: Marker, ech: Marker|null }

function _isZone(fn) { return AIRSPACE_ZONES.some(function (z) { return z.key === fn; }); }

// ===== Label text =====

function _alt(v, ref) {
    if (v === '' || v === null || v === undefined || isNaN(+v)) return '';
    return Math.round(+v) + 'FT ' + (ref === 'MSL' ? 'MSL' : 'AGL');
}

/** Label lines for a measure (first line is the title). */
export function measureLines(m) {
    if (!m || !m.fn) return [];
    const name = (m.name || '').toUpperCase().trim();
    if (_isZone(m.fn)) {
        const lines = [m.fn];
        if (m.unit) lines.push(String(m.unit).toUpperCase());
        const mn = _alt(m.minAlt, m.minRef), mx = _alt(m.maxAlt, m.maxRef);
        if (mn) lines.push('MIN ALT: ' + mn);
        if (mx) lines.push('MAX ALT: ' + mx);
        if (m.timeFrom) lines.push('TIME FROM: ' + String(m.timeFrom).toUpperCase());
        if (m.timeTo) lines.push('TIME TO: ' + String(m.timeTo).toUpperCase());
        return lines;
    }
    if (m.fn === 'BP') return [name || 'BP'];
    return [(m.fn + ' ' + name).trim()];
}

/** One-line name for exports, e.g. "PZ WOLF" or "ROZ 11 ADA BDE". */
export function measureTitle(m) {
    if (!m || !m.fn) return '';
    if (_isZone(m.fn)) return (m.fn + ' ' + (m.unit || '')).trim().toUpperCase();
    if (m.fn === 'BP') return ('BP ' + (m.name || '')).trim().toUpperCase();
    return (m.fn + ' ' + (m.name || '')).trim().toUpperCase();
}

// ===== SVG =====

function _textSVG(lines, color, opts) {
    const fs = opts.fontSize;
    const lh = Math.round(fs * 1.25);
    const charW = fs * 0.62;                     // monospace advance
    const pad = 4;
    const w = Math.ceil(Math.max.apply(null, lines.map(function (l) { return l.length; })) * charW + pad * 2);
    const h = lines.length * lh + pad * 2;
    const anchor = opts.align === 'left' ? 'start' : 'middle';
    const x = opts.align === 'left' ? pad : w / 2;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';
    lines.forEach(function (l, i) {
        const bold = (i === 0 || opts.allBold) ? 'bold' : 'normal';
        const size = (i === 0 && opts.titleScale) ? fs * opts.titleScale : fs;
        svg += '<text x="' + x + '" y="' + (pad + lh * (i + 1) - lh * 0.25) + '" text-anchor="' + anchor + '"'
            + ' font-family="Consolas,Menlo,monospace" font-size="' + size + '" font-weight="' + bold + '"'
            + ' fill="' + color + '" stroke="' + haloFor(color) + '" stroke-width="3" stroke-linejoin="round" paint-order="stroke">'
            + escapeXml(l) + '</text>';
    });
    return { svg: svg + '</svg>', w: w, h: h };
}

// ===== Geometry =====

function _ring(featureId) {
    const draw = get('draw');
    let f = null;
    try { f = draw && draw.getSnapshotFeature(featureId); } catch (e) { /* gone */ }
    if (!f || !f.geometry || f.geometry.type !== 'Polygon') return null;
    return f.geometry.coordinates[0];
}

/** Area-weighted centroid of a [lng,lat] ring (falls back to vertex mean). */
export function ringCentroid(ring) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
        a += f; cx += (ring[j][0] + ring[i][0]) * f; cy += (ring[j][1] + ring[i][1]) * f;
    }
    if (Math.abs(a) < 1e-14) {
        let sx = 0, sy = 0;
        ring.forEach(function (p) { sx += p[0]; sy += p[1]; });
        return { lat: sy / ring.length, lng: sx / ring.length };
    }
    a *= 0.5;
    return { lat: cy / (6 * a), lng: cx / (6 * a) };
}

/** Point on the ring's bottom edge below the centroid (where the BP echelon sits). */
export function ringBottom(ring, lng) {
    let best = null;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const x1 = ring[j][0], y1 = ring[j][1], x2 = ring[i][0], y2 = ring[i][1];
        if ((x1 <= lng && x2 >= lng) || (x2 <= lng && x1 >= lng)) {
            const t = x2 === x1 ? 0 : (lng - x1) / (x2 - x1);
            const y = y1 + (y2 - y1) * t;
            if (best === null || y < best) best = y;
        }
    }
    if (best === null) best = Math.min.apply(null, ring.map(function (p) { return p[1]; }));
    return { lat: best, lng: lng };
}

// ===== Labels =====

function _color(featureId) {
    const fs = get('featureStyles'); const s = fs && fs[featureId];
    return (s && s.lineColor) ? s.lineColor : (get('lineColor') || '#000000');
}

function _icon(t) {
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(t.svg),
        scaledSize: new google.maps.Size(t.w, t.h),
        anchor: new google.maps.Point(t.w / 2, t.h / 2),
    };
}

function _setMarker(existing, pos, icon) {
    if (existing) { existing.setPosition(pos); existing.setIcon(icon); return existing; }
    return new google.maps.Marker({ position: pos, icon: icon, map: get('map'), clickable: false, zIndex: 60, optimized: false });
}

function _removeLabel(id) {
    const l = _labels[id];
    if (!l) return;
    l.main.setMap(null);
    if (l.ech) l.ech.setMap(null);
    delete _labels[id];
}

/** Create, move or remove the label for one feature. */
export function syncMeasureLabel(featureId) {
    const m = (get('featureMeasures') || {})[featureId];
    const ring = m && m.fn ? _ring(featureId) : null;
    if (!ring) { _removeLabel(featureId); return; }
    const color = _color(featureId);
    const zone = _isZone(m.fn);
    const lines = measureLines(m);
    const t = _textSVG(lines, color, zone ? { fontSize: 11, align: 'left', titleScale: 1.15 } : { fontSize: 14, align: 'center', allBold: true });
    const c = ringCentroid(ring);
    const l = _labels[featureId] || { main: null, ech: null };
    l.main = _setMarker(l.main, c, _icon(t));

    const glyph = m.fn === 'BP' ? ECHELON_GLYPH[m.echelon] : null;
    if (glyph) {
        const e = _textSVG([glyph], color, { fontSize: 13, align: 'center', allBold: true });
        l.ech = _setMarker(l.ech, ringBottom(ring, c.lng), _icon(e));
    } else if (l.ech) {
        l.ech.setMap(null);
        l.ech = null;
    }
    _labels[featureId] = l;
}

/** Bring every label in line with state.featureMeasures and current geometry. */
export function syncAllMeasureLabels() {
    const measures = get('featureMeasures') || {};
    Object.keys(_labels).forEach(function (id) { if (!measures[id]) _removeLabel(id); });
    Object.keys(measures).forEach(function (id) {
        if (!_ring(id)) { delete measures[id]; _removeLabel(id); }
        else syncMeasureLabel(id);
    });
}

/** Drop a feature's tag and label (feature deleted). */
export function forgetMeasure(featureId) {
    const measures = get('featureMeasures');
    if (measures) delete measures[featureId];
    _removeLabel(featureId);
}

// ===== Popover UI =====

function _row(section, label) {
    const row = document.createElement('div');
    row.className = 'popover-row';
    const lbl = document.createElement('span');
    lbl.className = 'popover-label';
    lbl.textContent = label;
    row.appendChild(lbl);
    section.appendChild(row);
    return row;
}

function _input(row, type, value, placeholder, width, onSet) {
    const inp = document.createElement('input');
    inp.type = type;
    inp.className = 'popover-num popover-text';
    if (width) inp.style.width = width + 'px';
    inp.value = value === undefined || value === null ? '' : value;
    if (placeholder) inp.placeholder = placeholder;
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') inp.blur(); });
    inp.addEventListener('change', function () { onSet(inp.value); });
    row.appendChild(inp);
    return inp;
}

function _select(row, options, value, onSet) {
    const sel = document.createElement('select');
    sel.className = 'popover-select';
    options.forEach(function (o) {
        if (o.group) {
            const g = document.createElement('optgroup');
            g.label = o.group;
            o.items.forEach(function (it) {
                const op = document.createElement('option');
                op.value = it.key; op.textContent = it.name;
                g.appendChild(op);
            });
            sel.appendChild(g);
        } else {
            const op = document.createElement('option');
            op.value = o.key; op.textContent = o.name;
            sel.appendChild(op);
        }
    });
    sel.value = value;
    sel.addEventListener('keydown', function (e) { e.stopPropagation(); });
    sel.addEventListener('change', function () { onSet(sel.value); });
    row.appendChild(sel);
    return sel;
}

/**
 * Append the control-measure section for a feature to the popover.
 * onChange() is called after edits (used to schedule an undo push).
 */
export function buildMeasureSection(popover, featureId, onChange) {
    const section = document.createElement('div');
    section.className = 'popover-vs popover-measure';
    popover.appendChild(section);
    const measures = get('featureMeasures');

    function commit() { syncMeasureLabel(featureId); if (onChange) onChange(); }
    function rerender() { section.innerHTML = ''; render(); }

    function render() {
        const m = measures[featureId];
        const head = document.createElement('div');
        head.className = 'popover-vs-head';
        head.innerHTML = '<span>Control measure</span>';
        section.appendChild(head);

        const typeRow = _row(section, 'Type');
        _select(typeRow, [
            { key: '', name: 'None' },
            { group: 'Area (FM 1-02.2 Tbl 5-4/5-5)', items: AREA_MEASURES },
            { group: 'Airspace (Tbl 5-23)', items: AIRSPACE_ZONES },
        ], m ? m.fn : '', function (v) {
            if (!v) { delete measures[featureId]; }
            else if (!measures[featureId]) { measures[featureId] = { fn: v, name: '', minRef: 'AGL', maxRef: 'AGL', echelon: 'none' }; }
            else { measures[featureId].fn = v; }
            commit();
            rerender();
        });
        if (!m) return;

        if (_isZone(m.fn)) {
            _input(_row(section, 'Unit'), 'text', m.unit, 'e.g. 11 ADA BDE', 130, function (v) { m.unit = v; commit(); });
            const refOpts = [{ key: 'AGL', name: 'AGL' }, { key: 'MSL', name: 'MSL' }];
            const minRow = _row(section, 'Min alt');
            _input(minRow, 'number', m.minAlt, 'ft', 70, function (v) { m.minAlt = v === '' ? '' : +v; commit(); });
            _select(minRow, refOpts, m.minRef || 'AGL', function (v) { m.minRef = v; commit(); });
            const maxRow = _row(section, 'Max alt');
            _input(maxRow, 'number', m.maxAlt, 'ft', 70, function (v) { m.maxAlt = v === '' ? '' : +v; commit(); });
            _select(maxRow, refOpts, m.maxRef || 'AGL', function (v) { m.maxRef = v; commit(); });
            _input(_row(section, 'From'), 'text', m.timeFrom, 'DTG e.g. 030001ZJUL26', 130, function (v) { m.timeFrom = v; commit(); });
            _input(_row(section, 'To'), 'text', m.timeTo, 'DTG', 130, function (v) { m.timeTo = v; commit(); });
        } else {
            _input(_row(section, 'Name'), 'text', m.name, 'e.g. WOLF', 130, function (v) { m.name = v; commit(); });
            if (m.fn === 'BP') {
                _select(_row(section, 'Echelon'), ECHELON_LIST, m.echelon || 'none', function (v) { m.echelon = v; commit(); });
            }
        }
    }
    render();
}
