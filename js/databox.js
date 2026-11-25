/**
 * Simple SITTEMP - Data Box Module
 *
 * "Data box" checkbox in the object popover for circles, rectangles, polygons
 * and lines. When on, labels on the map show:
 *   - polygon / rectangle: the length of each side (at its midpoint) and the area
 *   - circle: radius, circumference and area (at the center)
 *   - line: the length of each segment
 * Lengths and areas are geodesic (spherical Earth). Labels follow the shape when
 * it is moved or edited and use the shape's outline color.
 *
 * Which features have a data box is stored in state.featureDataBoxes (undo
 * snapshots); the label markers are runtime only.
 */

import { get } from './state.js';
import { escapeXml, haloFor } from './symbols.js';
import { ringCentroid } from './measures.js';

const R = 6371008.8;
const D2R = Math.PI / 180;

export const DATA_BOX_TYPES = ['circle', 'rectangle', 'polygon', 'linestring'];

const _labels = {};   // featureId -> [google.maps.Marker]

// ===== Geometry (pure) =====

/** Great-circle distance in meters between [lng, lat] points. */
export function distance(a, b) {
    const p1 = a[1] * D2R, p2 = b[1] * D2R, dp = p2 - p1, dl = (b[0] - a[0]) * D2R;
    const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Area in m² of a closed [lng, lat] ring on a sphere. */
export function ringArea(ring) {
    let sum = 0;
    for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i], b = ring[i + 1];
        sum += (b[0] - a[0]) * D2R * (2 + Math.sin(a[1] * D2R) + Math.sin(b[1] * D2R));
    }
    return Math.abs(sum * R * R / 2);
}

export function fmtDist(m) {
    if (Math.round(m) < 1000) return Math.round(m) + ' m';   // 999.7 m reads as 1.00 km, not 1000 m
    return (m / 1000).toFixed(m < 10000 ? 2 : 1) + ' km';
}

export function fmtArea(m2) {
    if (Math.round(m2) < 100000) return Math.round(m2).toLocaleString('en-US') + ' m²';
    return (m2 / 1e6).toFixed(m2 < 1e7 ? 2 : 1) + ' km²';
}

function _mid(a, b) { return { lat: (a[1] + b[1]) / 2, lng: (a[0] + b[0]) / 2 }; }

function _closedRing(coords) {
    const a = coords[0], b = coords[coords.length - 1];
    return (a[0] === b[0] && a[1] === b[1]) ? coords : coords.concat([a]);
}

/**
 * Labels for a feature: [{ pos: {lat,lng}, lines: [..], kind: 'edge'|'area'|'circle' }].
 * `mode` is the Terra Draw mode (circle / rectangle / polygon / linestring).
 */
export function dataBoxLabels(feature, mode) {
    const g = feature && feature.geometry;
    if (!g) return [];
    const out = [];
    if (g.type === 'LineString') {
        for (let i = 0; i < g.coordinates.length - 1; i++) {
            const a = g.coordinates[i], b = g.coordinates[i + 1];
            out.push({ pos: _mid(a, b), lines: [fmtDist(distance(a, b))], kind: 'edge' });
        }
        return out;
    }
    if (g.type !== 'Polygon') return out;
    const ring = _closedRing(g.coordinates[0]);

    if (mode === 'circle') {
        // Center = vertex mean; radius from Terra Draw if present, else mean vertex distance
        const pts = ring.slice(0, -1);
        const c = [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
        const props = feature.properties || {};
        const r = props.radiusKilometers ? props.radiusKilometers * 1000
            : pts.reduce((s, p) => s + distance(c, p), 0) / pts.length;
        out.push({
            pos: { lat: c[1], lng: c[0] },
            lines: ['r ' + fmtDist(r), 'C ' + fmtDist(2 * Math.PI * r), 'A ' + fmtArea(Math.PI * r * r)],
            kind: 'circle',
        });
        return out;
    }

    for (let i = 0; i < ring.length - 1; i++) {
        const a = ring[i], b = ring[i + 1];
        out.push({ pos: _mid(a, b), lines: [fmtDist(distance(a, b))], kind: 'edge' });
    }
    const cen = ringCentroid(ring);
    out.push({ pos: cen, lines: ['Area ' + fmtArea(ringArea(ring))], kind: 'area' });
    return out;
}

// ===== Rendering =====

function _icon(lines, color, kind) {
    const fs = kind === 'edge' ? 11 : 12;
    const lh = Math.round(fs * 1.25);
    const w = Math.ceil(Math.max.apply(null, lines.map(function (l) { return l.length; })) * fs * 0.62 + 8);
    const h = lines.length * lh + 6;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">';
    lines.forEach(function (l, i) {
        svg += '<text x="' + (w / 2) + '" y="' + (3 + lh * (i + 1) - lh * 0.22) + '" text-anchor="middle"'
            + ' font-family="Consolas,Menlo,monospace" font-size="' + fs + '" font-weight="bold" fill="' + color + '"'
            + ' stroke="' + haloFor(color) + '" stroke-width="3" stroke-linejoin="round" paint-order="stroke">' + escapeXml(l) + '</text>';
    });
    svg += '</svg>';
    // Area labels sit just below the center so a control-measure label at the center stays readable
    const ay = kind === 'area' ? -8 : h / 2;
    return {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
        scaledSize: new google.maps.Size(w, h),
        anchor: new google.maps.Point(w / 2, ay),
    };
}

function _remove(id) {
    (_labels[id] || []).forEach(function (m) { m.setMap(null); });
    delete _labels[id];
}

function _feature(id) {
    const draw = get('draw');
    try { return draw && draw.getSnapshotFeature(id); } catch (e) { return null; }
}

/** Create, update or remove the data box labels for one feature. */
export function syncDataBox(featureId) {
    _remove(featureId);
    if (!(get('featureDataBoxes') || {})[featureId]) return;
    const f = _feature(featureId);
    if (!f) return;
    const mode = (f.properties && f.properties.mode) || f.geometry.type.toLowerCase();
    const fs = (get('featureStyles') || {})[featureId] || {};
    const color = fs.lineColor || get('lineColor') || '#000000';
    const map = get('map');
    _labels[featureId] = dataBoxLabels(f, mode).map(function (l) {
        return new google.maps.Marker({ map: map, position: l.pos, clickable: false, zIndex: 58, optimized: false, icon: _icon(l.lines, color, l.kind) });
    });
}

/** Bring every data box in line with state and current geometry. */
export function syncAllDataBoxes() {
    const on = get('featureDataBoxes') || {};
    Object.keys(_labels).forEach(function (id) { if (!on[id]) _remove(id); });
    Object.keys(on).forEach(function (id) {
        if (!_feature(id)) { delete on[id]; _remove(id); }
        else syncDataBox(id);
    });
}

/** Drop a feature's data box (feature deleted). */
export function forgetDataBox(featureId) {
    const on = get('featureDataBoxes');
    if (on) delete on[featureId];
    _remove(featureId);
}

/** Popover row: "Data box" checkbox. onChange() schedules an undo push. */
export function buildDataBoxRow(popover, featureId, onChange) {
    const row = document.createElement('div');
    row.className = 'popover-row popover-databox';
    const lbl = document.createElement('label');
    lbl.className = 'popover-check';
    lbl.title = 'Show side lengths and area (circles: radius, circumference, area; lines: segment lengths)';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = !!(get('featureDataBoxes') || {})[featureId];
    cb.addEventListener('change', function () {
        const on = get('featureDataBoxes');
        if (cb.checked) on[featureId] = true; else delete on[featureId];
        syncDataBox(featureId);
        if (onChange) onChange();
    });
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(' Data box'));
    row.appendChild(lbl);
    popover.appendChild(row);
}
