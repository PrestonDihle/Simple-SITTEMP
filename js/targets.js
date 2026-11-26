/**
 * Simple SITTEMP - Point Symbols (point target, general purpose point)
 *
 * Point target (FM 1-02.2, fire support point target): a cross with the target
 * number at its upper right, e.g. "AB1001". Placed as a map marker from the
 * Shapes menu; the number is stored in marker._sittemp.text (also its KML name).
 *
 * Linear targets are tags on drawn lines and live in measures.js (fn 'LT').
 */

import { escapeXml, haloFor } from './symbols.js';

/**
 * Icon for a point target. Returns { svg, w, h, ax, ay } in unscaled pixels,
 * where (ax, ay) is the center of the cross (the target location).
 */
export function pointTargetIcon(info, selected) {
    const color = info.color || '#000000';
    const sw = info.strokeWidth || 2;
    const label = String(info.text || '').toUpperCase().trim();
    const arm = 12, pad = 3;
    const textW = label ? Math.ceil(label.length * 8.2) + 6 : 0;
    const cx = arm + pad, cy = label ? arm + pad + 8 : arm + pad;
    const w = cx + arm + pad + textW, h = cy + arm + pad;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">'
        // halo so the cross reads on any imagery
        + '<path d="M' + (cx - arm) + ',' + cy + ' H' + (cx + arm) + ' M' + cx + ',' + (cy - arm) + ' V' + (cy + arm) + '"'
        + ' stroke="' + haloFor(color) + '" stroke-width="' + (sw + 3) + '" stroke-linecap="round" opacity="0.8"/>'
        + '<path d="M' + (cx - arm) + ',' + cy + ' H' + (cx + arm) + ' M' + cx + ',' + (cy - arm) + ' V' + (cy + arm) + '"'
        + ' stroke="' + color + '" stroke-width="' + sw + '" stroke-linecap="round"/>';
    if (label) {
        svg += '<text x="' + (cx + 5) + '" y="' + (cy - 5) + '" font-family="Consolas,Menlo,monospace" font-size="13" font-weight="bold"'
            + ' fill="' + color + '" stroke="' + haloFor(color) + '" stroke-width="3" paint-order="stroke">' + escapeXml(label) + '</text>';
    }
    if (selected) {
        svg += '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="none" stroke="' + color
            + '" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.75"/>';
    }
    svg += '</svg>';
    return { svg: svg, w: w, h: h, ax: cx, ay: cy };
}


/**
 * General purpose point (FM 1-02.2 ch. 5 point control measures): an inverted
 * teardrop whose tip marks the location. The function abbreviation (CKP, LU,
 * PP...) goes inside; the designation (e.g. "5") goes inside when there is no
 * abbreviation, otherwise to the right of the teardrop.
 */
export const GENERAL_POINTS = [
    { key: '', name: 'General point' },
    { key: 'CKP', name: 'CKP - checkpoint' },
    { key: 'CCP', name: 'CCP - casualty collection pt' },
    { key: 'ECP', name: 'ECP - entry control point' },
    { key: 'LU', name: 'LU - linkup point' },
    { key: 'PP', name: 'PP - passage point' },
    { key: 'RLY', name: 'RLY - rally point' },
    { key: 'RP', name: 'RP - release point' },
    { key: 'SP', name: 'SP - start point' },
    { key: 'TCP', name: 'TCP - traffic control point' },
];

export function generalPointIcon(info, selected) {
    const color = info.color || '#000000';
    const sw = info.strokeWidth || 2;
    const fn = String(info.fn || '').toUpperCase();
    const des = String(info.text || '').toUpperCase().trim();
    const inside = fn || des;
    const outside = fn ? des : '';
    const R = Math.max(13, inside.length * 4.4 + 4);   // head radius grows for 3-letter codes
    const pad = 3, cx = R + pad + sw, cy = R + pad + sw, tipY = cy + R * 1.9;
    const outW = outside ? Math.ceil(outside.length * 8.2) + 8 : 0;
    const w = Math.ceil(cx + R + pad + sw + outW), h = Math.ceil(tipY + pad + sw);
    // Teardrop: circle head with tangents meeting at the tip
    const a = Math.asin(R / (tipY - cy));               // half-angle at the tip
    const tx = R * Math.cos(a), ty = R * Math.sin(a);   // tangent points relative to the center
    const f = function (n) { return Math.round(n * 10) / 10; };
    const d = 'M' + cx + ',' + f(tipY) + ' L' + f(cx - tx) + ',' + f(cy + ty)
        + ' A' + f(R) + ',' + f(R) + ' 0 1,1 ' + f(cx + tx) + ',' + f(cy + ty) + ' Z';
    const fs = inside.length > 2 ? 10 : 12;
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">'
        + '<path d="' + d + '" fill="#ffffff" fill-opacity="0.85" stroke="' + color + '" stroke-width="' + sw + '" stroke-linejoin="round"/>';
    if (inside) {
        svg += '<text x="' + cx + '" y="' + f(cy + fs * 0.36) + '" text-anchor="middle" font-family="Arial,sans-serif" font-size="' + fs + '" font-weight="bold" fill="' + color + '">' + escapeXml(inside) + '</text>';
    }
    if (outside) {
        svg += '<text x="' + f(cx + R + pad + 4) + '" y="' + f(cy + 4.5) + '" font-family="Consolas,Menlo,monospace" font-size="13" font-weight="bold"'
            + ' fill="' + color + '" stroke="' + haloFor(color) + '" stroke-width="3" paint-order="stroke">' + escapeXml(outside) + '</text>';
    }
    if (selected) {
        svg += '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="none" stroke="' + color
            + '" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.75"/>';
    }
    svg += '</svg>';
    return { svg: svg, w: w, h: h, ax: cx, ay: tipY };
}
