/**
 * Simple SITTEMP - Define Area / Target Tagging Module
 *
 * Tags drawn area shapes (polygon, rectangle, circle, freehand) as doctrinal
 * control measures and draws their labels, per FM 1-02.2 (INCL C1):
 *   - Area control measures (Table 5-4): PZ, LZ, DZ, HA, FARP â€” label "PZ WOLF"
 *     centered inside the area. HA is not in Table 5-4 and uses the same template.
 *   - Battle position (Table 5-5): name inside, echelon on the bottom edge.
 *     Strong point uses the same label on a 'strong_point' outline (outward ticks).
 *   - Airspace coordinating zones (Table 5-23): ROZ, HIDACZ, AARROZ, UAROZ, WEZ,
 *     JEZ, MEZ, LOMEZ, HIMEZ, SHORAD EZ â€” block of function (A), unit (T),
 *     MIN ALT / MAX ALT (feet AGL or MSL), TIME FROM / TIME TO (DTG).
 *
 *   - Intelligence / targeting areas: NAI (named area of interest) and TAI
 *     (target area of interest), labeled "NAI 1" / "TAI 3" centered inside.
 *   - Linear target (fire support) on drawn lines: target number above the
 *     line's midpoint and a short perpendicular tick at each end.
 *
 * Tags live in state.featureMeasures keyed by Terra Draw feature id (included in
 * undo snapshots). Labels are non-clickable Google Maps markers, runtime only.
 */

import { get } from './state.js';
import { ECHELON_LIST, escapeXml, haloFor } from './symbols.js';
import { applyStyleToSelected, changeLineType } from './drawing.js';

export const AREA_MEASURES = [
    { key: 'AO', name: 'AO - area of operations' },
    { key: 'OBJ', name: 'OBJ - objective' },
    { key: 'KZ', name: 'Kill zone' },
    { key: 'PZ', name: 'PZ - pickup zone' },
    { key: 'LZ', name: 'LZ - landing zone' },
    { key: 'DZ', name: 'DZ - drop zone' },
    { key: 'HA', name: 'HA - holding area' },
    { key: 'FARP', name: 'FARP - fwd arming/refuel pt' },
    { key: 'BP', name: 'BP - battle position' },
    { key: 'SP', name: 'Strong point' },
    { key: 'CBRN', name: 'CBRN - contaminated area' },
];

// Fire support areas (FM 1-02.2 Table 5-24)
export const FIRES_AREAS = [
    { key: 'PAA', name: 'PAA - position area for artillery' },
];

// CBRN contaminated area (FM 1-02.2 Table 5-28): agent letter in an inverted
// triangle over the contamination mark.
const CBRN_AGENTS = [
    { key: 'B', name: 'B - biological' },
    { key: 'C', name: 'C - chemical' },
    { key: 'N', name: 'N - nuclear' },
    { key: 'R', name: 'R - radiological' },
];
function _isCbrn(fn) { return fn === 'CBRN'; }

/** Inverted-triangle CBRN marker with the agent letter, plus an optional name below. */
/**
 * One arc of the contamination mark: a quarter ellipse that leaves the top of one
 * dot heading across (side = 1 starts at the left dot) and ends heading down
 * past the other dot. Drawn as the standard cubic approximation (k = 0.5523).
 */
function _cbrnArc(cx, dy, dx, side, color) {
    const f = function (n) { return Math.round(n * 10) / 10; };
    const sx = cx - side * (dx - 3.3), sy = dy - 2.2;     // start: upper inner edge of the dot
    const ex = cx + side * 6.5, ey = dy + 8.8;            // end: below and past the other dot
    const k = 0.5523;
    return '<path d="M' + f(sx) + ',' + f(sy) + ' C' + f(sx + (ex - sx) * k) + ',' + f(sy) + ' ' + f(ex) + ',' + f(ey - (ey - sy) * k) + ' ' + f(ex) + ',' + f(ey) + '"'
        + ' fill="none" stroke="' + color + '" stroke-width="1.3"/>';
}

function _cbrnIcon(agent, name, color) {
    // Proportions follow FM 1-02.2 tables 5-27 / 5-28: a wide, flat inverted
    // triangle; the agent letter near the top; below it two solid dots, each the
    // start of a quarter-circle arc that runs over the top and down past the other
    // dot, so the two arcs cross in the middle.
    const TW = 72, TH = 42, top = 3;
    const w = Math.max(TW + 8, name.length * 9 + 10), h = name ? top + TH + 20 : top + TH + 4;
    const cx = w / 2, dy = top + 18, dx = 10.5;
    const f = function (n) { return Math.round(n * 10) / 10; };
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">'
        + '<path d="M' + f(cx - TW / 2) + ',' + top + ' L' + f(cx + TW / 2) + ',' + top + ' L' + f(cx) + ',' + (top + TH) + ' Z" fill="#ffffff" stroke="' + color + '" stroke-width="2.5" stroke-linejoin="miter"/>'
        + '<text x="' + f(cx) + '" y="' + (top + 12.5) + '" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="' + color + '">' + escapeXml(agent) + '</text>'
        // contamination mark: two dots, each with an arc crossing over to the other side
        + '<circle cx="' + f(cx - dx) + '" cy="' + dy + '" r="3.4" fill="' + color + '"/>'
        + '<circle cx="' + f(cx + dx) + '" cy="' + dy + '" r="3.4" fill="' + color + '"/>'
        + _cbrnArc(cx, dy, dx, 1, color) + _cbrnArc(cx, dy, dx, -1, color);
    if (name) {
        svg += '<text x="' + f(cx) + '" y="' + (top + TH + 16) + '" text-anchor="middle" font-family="Consolas,Menlo,monospace" font-size="12" font-weight="bold"'
            + ' fill="' + color + '" stroke="' + haloFor(color) + '" stroke-width="3" paint-order="stroke">' + escapeXml(name) + '</text>';
    }
    svg += '</svg>';
    return { svg: svg, w: w, h: h };
}

export const INTEL_AREAS = [
    { key: 'NAI', name: 'NAI - named area of interest' },
    { key: 'TAI', name: 'TAI - target area of interest' },
];

// Named lines (FM 1-02.2 INCL C1 figure 5-9 / table 5-8). Templates:
//   'pl'       - phase line: "PL NAME" just beyond both ends
//   'line'     - function (T1) + controlling HQ (T2) on top of the line just inside
//                both ends, DTG (W - W1) below it there, and the optional phase
//                line name "PL NAME" beyond both ends
//   'boundary' - echelon on the line with a unit on each side (figure 5-6)
//   'target'   - linear target: number above the midpoint, end ticks (table 5-25)
// dash: drawn dashed in every status (PLD, CFL).
export const LINE_MEASURES = [
    { key: 'PL', name: 'PL - phase line', label: 'pl', group: 'maneuver' },
    { key: 'BOUNDARY', name: 'Boundary', label: 'boundary', group: 'maneuver' },
    { key: 'LD', name: 'LD - line of departure', label: 'line', group: 'maneuver' },
    { key: 'LD/LC', name: 'LD/LC - line of dep./contact', label: 'line', group: 'maneuver' },
    { key: 'LOA', name: 'LOA - limit of advance', label: 'line', group: 'maneuver' },
    { key: 'FCL', name: 'FCL - final coordination line', label: 'line', group: 'maneuver' },
    { key: 'PLD', name: 'PLD - probable line of deploy.', label: 'line', group: 'maneuver', dash: true },
    { key: 'RL', name: 'RL - release line', label: 'line', group: 'maneuver' },
    { key: 'FSCL', name: 'FSCL - fire support coord. line', label: 'line', group: 'fires' },
    { key: 'CFL', name: 'CFL - coordinated fire line', label: 'line', group: 'fires', dash: true },
    { key: 'RFL', name: 'RFL - restrictive fire line', label: 'line', group: 'fires' },
    { key: 'LT', name: 'Linear target', label: 'target', group: 'fires' },
];
function _lineDef(fn) { return LINE_MEASURES.find(function (x) { return x.key === fn; }) || null; }
function _isLineMeasure(fn) { return LINE_MEASURES.some(function (x) { return x.key === fn; }); }

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
    team: 'Ø', squad: '•', section: '••',
    platoon: '•••', company: 'I', battalion: 'II', regiment: 'III',
    brigade: 'X', division: 'XX', corps: 'XXX',
};

const _labels = {};   // featureId -> { main: Marker, ech: Marker|null, ticks: Polyline[] }

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
    if (m.fn === 'SP') return [name || 'SP'];
    if (m.fn === 'KZ') return name ? ['KILL ZONE', name] : ['KILL ZONE'];
    if (m.fn === 'PAA') {
        // Table 5-24: unit (T) with the DTG (W - W1) below it; "PAA" sits on the outline
        const lines = [];
        if (m.unit) lines.push(String(m.unit).toUpperCase().trim());
        const w = String(m.dtg || '').toUpperCase().trim(), w1 = String(m.dtg2 || '').toUpperCase().trim();
        if (w) lines.push(w + (w1 ? ' -' : ''));
        if (w1) lines.push(w1);
        return lines;
    }
    if (m.fn === 'LT') return [name || 'LINEAR TGT'];
    if (_isCbrn(m.fn)) return [(m.fn + ' ' + (m.agent || 'C') + ' ' + name).trim()];
    return [(m.fn + ' ' + name).trim()];
}

/** One-line name for exports, e.g. "PZ WOLF" or "ROZ 11 ADA BDE". */
export function measureTitle(m) {
    if (!m || !m.fn) return '';
    if (_isZone(m.fn)) return (m.fn + ' ' + (m.unit || '')).trim().toUpperCase();
    if (m.fn === 'BP') return ('BP ' + (m.name || '')).trim().toUpperCase();
    if (m.fn === 'SP') return ('STRONG POINT ' + (m.name || '')).trim().toUpperCase();
    if (m.fn === 'KZ') return ('KILL ZONE ' + (m.name || '')).trim().toUpperCase();
    if (m.fn === 'PAA') return ('PAA ' + (m.unit || '')).trim().toUpperCase();
    if (m.fn === 'LT') return ('LINEAR TGT ' + (m.name || '')).trim().toUpperCase();
    if (m.fn === 'BOUNDARY') return ('BOUNDARY ' + [m.unit, m.unit2].filter(Boolean).join(' / ')).trim().toUpperCase();
    if (m.fn === 'PL') return ('PL ' + (m.name || '')).trim().toUpperCase();
    if (_lineDef(m.fn) && _lineDef(m.fn).label === 'line') {
        return (m.fn + ' ' + (m.unit || '') + (m.name ? ' (PL ' + m.name + ')' : '')).replace(/\s+/g, ' ').trim().toUpperCase();
    }
    if (_isCbrn(m.fn)) return (m.fn + ' ' + (m.agent || '') + ' ' + (m.name || '')).replace(/\s+/g, ' ').trim().toUpperCase();
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
    if (opts.boxed) {
        svg += '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="#ffffff" fill-opacity="0.85" stroke="' + color + '" stroke-width="1.5"/>';
    }
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

function _geom(featureId) {
    const draw = get('draw');
    let f = null;
    try { f = draw && draw.getSnapshotFeature(featureId); } catch (e) { /* gone */ }
    return f && f.geometry ? f.geometry : null;
}

function _ring(featureId) {
    const g = _geom(featureId);
    return g && g.type === 'Polygon' ? g.coordinates[0] : null;
}

function _line(featureId) {
    const g = _geom(featureId);
    return g && g.type === 'LineString' && g.coordinates.length >= 2 ? g.coordinates : null;
}

/** Geometry a tag needs: the line for linear targets, the ring for areas. */
function _shapeFor(featureId, m) {
    return m && _isLineMeasure(m.fn) ? _line(featureId) : _ring(featureId);
}

const M_PER_DEG = 111320;

/** Point halfway along a [lng,lat] line, plus the line's length in meters. */
export function lineMidpoint(coords) {
    const k = Math.cos(coords[0][1] * Math.PI / 180);
    const seg = [];
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
        const dx = (coords[i][0] - coords[i - 1][0]) * k * M_PER_DEG, dy = (coords[i][1] - coords[i - 1][1]) * M_PER_DEG;
        const d = Math.sqrt(dx * dx + dy * dy);
        seg.push(d); total += d;
    }
    let half = total / 2;
    for (let i = 0; i < seg.length; i++) {
        if (half <= seg[i] || i === seg.length - 1) {
            const t = seg[i] ? Math.min(1, half / seg[i]) : 0;
            const a = coords[i], b = coords[i + 1];
            return { lat: a[1] + (b[1] - a[1]) * t, lng: a[0] + (b[0] - a[0]) * t, length: total };
        }
        half -= seg[i];
    }
    return { lat: coords[0][1], lng: coords[0][0], length: total };
}

/** Short perpendicular tick paths ({lat,lng} pairs) at both ends of a [lng,lat] line. */
function _endTicks(coords, lenM) {
    const k = Math.cos(coords[0][1] * Math.PI / 180);
    function tick(end, next) {
        const dx = (next[0] - end[0]) * k, dy = next[1] - end[1];
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const px = -dy / d, py = dx / d;          // unit perpendicular in ground space
        const h = lenM / 2 / M_PER_DEG;
        return [{ lat: end[1] + py * h, lng: end[0] + px * h / k }, { lat: end[1] - py * h, lng: end[0] - px * h / k }];
    }
    const n = coords.length;
    return [tick(coords[0], coords[1]), tick(coords[n - 1], coords[n - 2])];
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

/**
 * Points on the outline straight above, below, left and right of the centroid
 * (top, bottom, left, right), for labels that sit on the outline (PAA).
 */
export function ringEdgePoints(ring, c) {
    let top = null, bottom = null, left = null, right = null;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const x1 = ring[j][0], y1 = ring[j][1], x2 = ring[i][0], y2 = ring[i][1];
        if ((x1 <= c.lng && x2 >= c.lng) || (x2 <= c.lng && x1 >= c.lng)) {
            const y = x2 === x1 ? Math.max(y1, y2) : y1 + (y2 - y1) * (c.lng - x1) / (x2 - x1);
            if (y >= c.lat && (top === null || y > top)) top = y;
            if (y <= c.lat && (bottom === null || y < bottom)) bottom = y;
        }
        if ((y1 <= c.lat && y2 >= c.lat) || (y2 <= c.lat && y1 >= c.lat)) {
            const x = y2 === y1 ? Math.min(x1, x2) : x1 + (x2 - x1) * (c.lat - y1) / (y2 - y1);
            if (x <= c.lng && (left === null || x < left)) left = x;
            if (x >= c.lng && (right === null || x > right)) right = x;
        }
    }
    const pts = [];
    if (top !== null) pts.push({ lat: top, lng: c.lng });
    if (bottom !== null) pts.push({ lat: bottom, lng: c.lng });
    if (left !== null) pts.push({ lat: c.lat, lng: left });
    if (right !== null) pts.push({ lat: c.lat, lng: right });
    return pts;
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

function _clearList(list) { (list || []).forEach(function (x) { if (x) x.setMap(null); }); }

function _removeLabel(id) {
    const l = _labels[id];
    if (!l) return;
    if (l.main) l.main.setMap(null);
    if (l.ech) l.ech.setMap(null);
    _clearList(l.ticks);
    _clearList(l.ends);
    _clearList(l.inner);
    delete _labels[id];
}

/** Create, move or remove the label for one feature. */
export function syncMeasureLabel(featureId) {
    const m = (get('featureMeasures') || {})[featureId];
    const shape = m && m.fn ? _shapeFor(featureId, m) : null;
    if (!shape) { _removeLabel(featureId); return; }
    const color = _color(featureId);
    if (_isLineMeasure(m.fn)) { _syncLineLabel(featureId, m, shape, color); return; }
    const ring = shape;
    const zone = _isZone(m.fn);
    const lines = measureLines(m);
    const t = _isCbrn(m.fn)
        ? _cbrnIcon(m.agent || 'C', (m.name || '').toUpperCase().trim(), color)
        : _textSVG(lines.length ? lines : [' '], color, zone ? { fontSize: 11, align: 'left', titleScale: 1.15 }
            : { fontSize: m.fn === 'KZ' ? 12 : 14, align: 'center', allBold: true, boxed: m.fn === 'KZ' });
    const c = ringCentroid(ring);
    const l = _labels[featureId] || { main: null, ech: null };
    l.main = _setMarker(l.main, c, _icon(t));

    // PAA: "PAA" on the outline at the top, bottom, left and right (its halo stands
    // in for the gap the FM leaves in the line)
    if (m.fn === 'PAA') {
        const pt = _textSVG(['PAA'], color, { fontSize: 11, align: 'center', allBold: true });
        l.ends = _syncMarkers(l.ends, ringEdgePoints(ring, c).map(function (p) { return { pos: p, icon: _icon(pt) }; }));
    } else if (l.ends && l.ends.length) {
        l.ends = _syncMarkers(l.ends, []);
    }

    const glyph = (m.fn === 'BP' || m.fn === 'SP') ? ECHELON_GLYPH[m.echelon] : null;
    if (glyph) {
        const e = _textSVG([glyph], color, { fontSize: 13, align: 'center', allBold: true });
        l.ech = _setMarker(l.ech, ringBottom(ring, c.lng), _icon(e));
    } else if (l.ech) {
        l.ech.setMap(null);
        l.ech = null;
    }
    _labels[featureId] = l;
}

// Web Mercator y in the same units as radians of longitude (screen y grows downward when negated)
function _mercY(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)); }

/** Screen-space unit direction (x right, y down) from [lng,lat] a to b. */
function _screenDir(a, b) {
    const dx = (b[0] - a[0]) * Math.PI / 180, dy = -(_mercY(b[1]) - _mercY(a[1]));
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / d, y: dy / d };
}

/** Icon anchored so the label sits just beyond a line end, on the side the line points to. */
function _endIcon(t, out) {
    const icon = _icon(t), GAP = 6;
    let ax, ay;
    if (Math.abs(out.x) >= Math.abs(out.y)) {             // mostly horizontal: beside the end
        ax = out.x > 0 ? -GAP : t.w + GAP; ay = t.h / 2;
    } else {                                               // mostly vertical: above / below the end
        ax = t.w / 2; ay = out.y > 0 ? -GAP : t.h + GAP;
    }
    icon.anchor = new google.maps.Point(ax, ay);
    return icon;
}

/** "PL NAME" shown beyond both ends ([] when there is none). */
export function lineEndLines(m) {
    const def = _lineDef(m.fn);
    const name = (m.name || '').toUpperCase().trim();
    if (!def) return [];
    if (def.label === 'pl') return [('PL ' + name).trim()];
    if (def.label === 'line' && name) return ['PL ' + name];
    return [];
}

/** Function + controlling HQ (above the line) and DTG lines (below), inside both ends. */
export function lineInnerLines(m) {
    const def = _lineDef(m.fn);
    if (!def || def.label !== 'line') return { top: [], bottom: [] };
    const up = function (v) { return String(v || '').toUpperCase().trim(); };
    const w = up(m.dtg), w1 = up(m.dtg2);
    const bottom = [];
    if (w) bottom.push(w + (w1 ? ' -' : ''));
    if (w1) bottom.push(w1);
    return { top: [(m.fn + ' ' + up(m.unit)).trim()], bottom: bottom };
}

/**
 * Icon placed at a line end so the text box sits just inside the end (along the
 * inward screen direction u) on one side of the line. side = 1 is the "top" of the
 * line (up on screen; left for a vertical line), -1 the other side.
 */
export function insideOffset(w, h, u, side) {
    let n = { x: u.y, y: -u.x };                                   // a perpendicular
    if (n.y > 0.05 || (Math.abs(n.y) <= 0.05 && n.x > 0)) n = { x: -n.x, y: -n.y };   // point it up (or left)
    n = { x: n.x * side, y: n.y * side };
    const along = (Math.abs(u.x) * w + Math.abs(u.y) * h) / 2 + 6;
    const across = (Math.abs(n.x) * w + Math.abs(n.y) * h) / 2 + 2;
    return { x: u.x * along + n.x * across, y: u.y * along + n.y * across };   // box center relative to the end
}

function _insideIcon(t, u, side) {
    const c = insideOffset(t.w, t.h, u, side);
    const icon = _icon(t);
    icon.anchor = new google.maps.Point(t.w / 2 - c.x, t.h / 2 - c.y);
    return icon;
}

function _syncMarkers(list, specs) {
    list = list || [];
    specs.forEach(function (sp, i) { list[i] = _setMarker(list[i], sp.pos, sp.icon); });
    for (let i = specs.length; i < list.length; i++) if (list[i]) list[i].setMap(null);
    list.length = specs.length;
    return list;
}

function _syncLineLabel(featureId, m, coords, color) {
    const def = _lineDef(m.fn);
    const l = _labels[featureId] || {};
    if (l.ech) { l.ech.setMap(null); l.ech = null; }
    const n = coords.length;
    const mid = lineMidpoint(coords);
    const endPts = [{ lat: coords[0][1], lng: coords[0][0] }, { lat: coords[n - 1][1], lng: coords[n - 1][0] }];
    const outDirs = [_screenDir(coords[1], coords[0]), _screenDir(coords[n - 2], coords[n - 1])];
    const inDirs = [_screenDir(coords[0], coords[1]), _screenDir(coords[n - 1], coords[n - 2])];

    // Middle: linear target number above the line, or boundary echelon + units
    let midIcon = null;
    if (def.label === 'target') {
        const t = _textSVG(measureLines(m), color, { fontSize: 13, align: 'center', allBold: true });
        midIcon = _icon(t);
        midIcon.anchor = new google.maps.Point(t.w / 2, t.h + 2);   // sit just above the line
    } else if (def.label === 'boundary') {
        midIcon = _icon(_boundarySVG(m, color, _screenDir(coords[0], coords[n - 1])));
    }
    if (midIcon) l.main = _setMarker(l.main, { lat: mid.lat, lng: mid.lng }, midIcon);
    else if (l.main) { l.main.setMap(null); l.main = null; }

    // Beyond both ends: "PL AMBER"
    const endLines = lineEndLines(m);
    const endT = endLines.length ? _textSVG(endLines, color, { fontSize: 12, align: 'center', allBold: true }) : null;
    l.ends = _syncMarkers(l.ends, endT ? endPts.map(function (p, i) { return { pos: p, icon: _endIcon(endT, outDirs[i]) }; }) : []);

    // Inside both ends: function + HQ on top of the line, DTG below it
    const inner = lineInnerLines(m);
    const topT = inner.top.length ? _textSVG(inner.top, color, { fontSize: 13, align: 'center', allBold: true }) : null;
    const botT = inner.bottom.length ? _textSVG(inner.bottom, color, { fontSize: 10, align: 'center', allBold: true }) : null;
    const innerSpecs = [];
    endPts.forEach(function (p, i) {
        if (topT) innerSpecs.push({ pos: p, icon: _insideIcon(topT, inDirs[i], 1) });
        if (botT) innerSpecs.push({ pos: p, icon: _insideIcon(botT, inDirs[i], -1) });
    });
    l.inner = _syncMarkers(l.inner, innerSpecs);

    // Linear target end ticks
    if (def.label === 'target') {
        const tickLen = Math.max(20, Math.min(400, mid.length * 0.06));
        const sw = Math.max(2, ((get('featureStyles') || {})[featureId] || {}).strokeWidth || get('symbolStrokeWidth') || 2);
        l.ticks = l.ticks || [];
        _endTicks(coords, tickLen).forEach(function (p, i) {
            if (l.ticks[i]) { l.ticks[i].setPath(p); l.ticks[i].setOptions({ strokeColor: color, strokeWeight: sw }); }
            else l.ticks[i] = new google.maps.Polyline({ path: p, strokeColor: color, strokeWeight: sw, strokeOpacity: 1, clickable: false, zIndex: 59, map: get('map') });
        });
    } else { _clearList(l.ticks); l.ticks = []; }
    _labels[featureId] = l;
}

/**
 * Boundary label: echelon glyph on the line with a unit on each side. A mostly
 * horizontal line puts unit 1 above and unit 2 below; a mostly vertical one puts
 * unit 1 left and unit 2 right. The glyph gets a halo that stands in for the gap.
 */
function _boundarySVG(m, color, dir) {
    const glyph = ECHELON_GLYPH[m.echelon] || '';
    const u1 = (m.unit || '').toUpperCase().trim(), u2 = (m.unit2 || '').toUpperCase().trim();
    const fs = 13, cw = fs * 0.62, halo = haloFor(color);
    const txt = function (x, y, s, anchor) {
        return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '" font-family="Consolas,Menlo,monospace" font-size="' + fs + '" font-weight="bold"'
            + ' fill="' + color + '" stroke="' + halo + '" stroke-width="3" stroke-linejoin="round" paint-order="stroke">' + escapeXml(s) + '</text>';
    };
    const gw = Math.max(cw * 2, glyph.length * cw) + 8;
    let w, h, body;
    if (Math.abs(dir.x) >= Math.abs(dir.y)) {
        w = Math.ceil(Math.max(gw, u1.length * cw, u2.length * cw) + 8); h = 60;
        const cx = w / 2;
        body = (u1 ? txt(cx, 14, u1, 'middle') : '') + (glyph ? txt(cx, 35, glyph, 'middle') : '') + (u2 ? txt(cx, 56, u2, 'middle') : '');
    } else {
        const l1 = Math.ceil(u1.length * cw), l2 = Math.ceil(u2.length * cw), side = Math.max(l1, l2) + 6;
        w = Math.ceil(side * 2 + gw); h = 22;
        const cx = w / 2;
        body = (u1 ? txt(cx - gw / 2, 16, u1, 'end') : '') + (glyph ? txt(cx, 16, glyph, 'middle') : '') + (u2 ? txt(cx + gw / 2, 16, u2, 'start') : '');
    }
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>', w: w, h: h };
}

/** Bring every label in line with state.featureMeasures and current geometry. */
export function syncAllMeasureLabels() {
    const measures = get('featureMeasures') || {};
    Object.keys(_labels).forEach(function (id) { if (!measures[id]) _removeLabel(id); });
    Object.keys(measures).forEach(function (id) {
        if (!_shapeFor(id, measures[id])) { delete measures[id]; _removeLabel(id); }
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
 * Append the "Define area" section (or, for lines, "Define target") for a
 * feature to the popover. onChange() is called after edits (undo push).
 */
export function buildMeasureSection(popover, featureId, onChange, kind) {
    const isLine = kind === 'line';
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
        head.innerHTML = '<span>' + (isLine ? 'Define line' : 'Define area') + '</span>';
        section.appendChild(head);

        const typeRow = _row(section, 'Type');
        _select(typeRow, isLine ? [
            { key: '', name: 'None' },
            { group: 'Maneuver (FM 1-02.2 ch. 5)', items: LINE_MEASURES.filter(function (x) { return x.group === 'maneuver'; }) },
            { group: 'Fire support', items: LINE_MEASURES.filter(function (x) { return x.group === 'fires'; }) },
        ] : [
            { key: '', name: 'None' },
            { group: 'Intelligence / targeting', items: INTEL_AREAS },
            { group: 'Area (FM 1-02.2 Tbl 5-4/5-5)', items: AREA_MEASURES },
            { group: 'Fire support (Tbl 5-24)', items: FIRES_AREAS },
            { group: 'Airspace (Tbl 5-23)', items: AIRSPACE_ZONES },
        ], m ? m.fn : '', function (v) {
            if (!v) { delete measures[featureId]; }
            else if (!measures[featureId]) { measures[featureId] = { fn: v, name: '', minRef: 'AGL', maxRef: 'AGL', echelon: 'none' }; }
            else { measures[featureId].fn = v; }
            // PLD and CFL are always dashed (table 5-8); a strong point is a battle
            // position outline with outward ticks (table 5-5)
            const autoType = (_lineDef(v) && _lineDef(v).dash) ? 'dashed' : (v === 'SP' ? 'strong_point' : null);
            if (autoType && changeLineType(autoType) !== false) {
                // Keep the open popover's line-type grid in step with the new type
                popover.querySelectorAll('.popover-lt-item').forEach(function (it) {
                    it.classList.toggle('active', it.dataset.lineType === autoType);
                });
            }
            if (_isCbrn(v)) {
                const mm = measures[featureId];
                const allowed = CBRN_AGENTS.map(function (a) { return a.key; });
                if (allowed.indexOf(mm.agent) === -1) mm.agent = 'C';
                // Contaminated areas: black outline, yellow fill (Terra Draw can't draw FM hatching)
                applyStyleToSelected('lineColor', '#000000');
                applyStyleToSelected('fillColor', '#FFFF00');
                applyStyleToSelected('fillOpacity', 0.35);
            }
            commit();
            rerender();
        });
        if (!m) return;

        const ldef = _lineDef(m.fn);
        if (ldef) {
            if (ldef.label === 'boundary') {
                _select(_row(section, 'Echelon'), ECHELON_LIST, m.echelon || 'none', function (v) { m.echelon = v; commit(); });
                _input(_row(section, 'Unit 1'), 'text', m.unit, 'above / left, e.g. 1-66', 130, function (v) { m.unit = v; commit(); });
                _input(_row(section, 'Unit 2'), 'text', m.unit2, 'below / right, e.g. 2-66', 130, function (v) { m.unit2 = v; commit(); });
            } else if (ldef.label === 'line') {
                _input(_row(section, 'Phase line'), 'text', m.name, 'optional, e.g. JADE', 130, function (v) { m.name = v; commit(); });
                _input(_row(section, 'Unit'), 'text', m.unit, 'controlling HQ, e.g. 23ID', 130, function (v) { m.unit = v; commit(); });
                _input(_row(section, 'DTG from'), 'text', m.dtg, 'e.g. 110800ZMAY26', 130, function (v) { m.dtg = v; commit(); });
                _input(_row(section, 'DTG to'), 'text', m.dtg2, 'optional', 130, function (v) { m.dtg2 = v; commit(); });
            } else if (ldef.label === 'target') {
                _input(_row(section, 'Target #'), 'text', m.name, 'e.g. AB1002', 130, function (v) { m.name = v; commit(); });
            } else {
                _input(_row(section, 'Name'), 'text', m.name, m.fn === 'PL' ? 'e.g. AMBER' : 'optional', 130, function (v) { m.name = v; commit(); });
            }
            return;
        }

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
            if (_isCbrn(m.fn)) {
                _select(_row(section, 'Agent'), CBRN_AGENTS, m.agent || 'C', function (v) { m.agent = v; commit(); });
            }
            if (m.fn === 'PAA') {
                _input(_row(section, 'Unit'), 'text', m.unit, 'e.g. 3BCT', 130, function (v) { m.unit = v; commit(); });
                _input(_row(section, 'DTG from'), 'text', m.dtg, 'e.g. 051030ZAPR26', 130, function (v) { m.dtg = v; commit(); });
                _input(_row(section, 'DTG to'), 'text', m.dtg2, 'optional', 130, function (v) { m.dtg2 = v; commit(); });
                return;
            }
            const ph = _isCbrn(m.fn) ? 'optional' : (m.fn === 'NAI' || m.fn === 'TAI') ? 'e.g. 1' : m.fn === 'KZ' ? 'e.g. B' : m.fn === 'OBJ' ? 'e.g. FIVE' : 'e.g. WOLF';
            _input(_row(section, 'Name'), 'text', m.name, ph, 130, function (v) { m.name = v; commit(); });
            if (m.fn === 'BP' || m.fn === 'SP') {
                _select(_row(section, 'Echelon'), ECHELON_LIST, m.echelon || 'none', function (v) { m.echelon = v; commit(); });
            }
        }
    }
    render();
}
