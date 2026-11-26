/**
 * Simple SITTEMP - Fire Support Targets
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

