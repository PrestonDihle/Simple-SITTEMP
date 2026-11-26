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
 * General purpose point (FM 1-02.2 INCL C1, figure 5-8 / table 5-6): an upright
 * rectangle with a V-shaped bottom whose tip marks the location.
 *   inside, top     A  - function (CP, LU, PP...), required by the FM
 *   inside, bottom  T1 - designation ("12", "RED")
 *   right, top      T  - controlling unit ("100MP DET")
 *   left            W / W1 - date-time group start / end
 *   above           H  - additional information ("MSR 5")
 */
export const GENERAL_POINTS = [
    { key: '', name: 'General point' },
    { key: 'CP', name: 'CP - checkpoint' },
    { key: 'CKP', name: 'CKP - checkpoint (NATO alt.)' },
    { key: 'CCP', name: 'CCP - casualty collection pt' },
    { key: 'ERP', name: 'ERP - engineer regulating pt' },
    { key: 'LU', name: 'LU - linkup point' },
    { key: 'PD', name: 'PD - point of departure' },
    { key: 'PP', name: 'PP - passage point' },
    { key: 'RLY', name: 'RLY - rally point' },
    { key: 'RP', name: 'RP - release point' },
    { key: 'SP', name: 'SP - start point' },
    { key: 'TCP', name: 'TCP - traffic control post' },
];

export function generalPointIcon(info, selected) {
    const color = info.color || '#000000';
    const sw = info.strokeWidth || 2;
    const up = function (v) { return String(v || '').toUpperCase().trim(); };
    const A = up(info.fn), T1 = up(info.text), T = up(info.unit), W = up(info.dtg), W1 = up(info.dtg2), H = up(info.info);
    const f = function (n) { return Math.round(n * 10) / 10; };
    const MONO = 6.9;                                    // advance of 11px monospace
    const halo = haloFor(color);
    const outText = function (x, y, txt, anchor) {
        return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + anchor + '" font-family="Consolas,Menlo,monospace" font-size="11" font-weight="bold"'
            + ' fill="' + color + '" stroke="' + halo + '" stroke-width="3" stroke-linejoin="round" paint-order="stroke">' + escapeXml(txt) + '</text>';
    };
    const inText = function (x, y, txt, size) {
        return '<text x="' + f(x) + '" y="' + f(y) + '" text-anchor="middle" font-family="Arial,sans-serif" font-size="' + size + '" font-weight="bold" fill="' + color + '">' + escapeXml(txt) + '</text>';
    };

    const FW = Math.max(30, Math.max(A.length * 8.6, T1.length * 7.6) + 10);   // frame width
    const FH = 36, TH = Math.min(18, FW * 0.5);                                // frame and tip heights
    const LW = (W || W1) ? Math.ceil(Math.max(W.length, W1.length) * MONO) + 6 : 0;
    const RW = T ? Math.ceil(T.length * MONO) + 6 : 0;
    const HH = H ? 15 : 0;
    const m = sw + 2;
    const x0 = m + LW, y0 = m + HH, cx = x0 + FW / 2;
    const w = Math.ceil(Math.max(x0 + FW + RW + m, cx + H.length * MONO / 2 + m)), h = Math.ceil(y0 + FH + TH + m);
    const tipY = y0 + FH + TH;

    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">'
        + '<path d="M' + f(x0) + ',' + f(y0) + ' H' + f(x0 + FW) + ' V' + f(y0 + FH) + ' L' + f(cx) + ',' + f(tipY) + ' L' + f(x0) + ',' + f(y0 + FH) + ' Z"'
        + ' fill="#ffffff" fill-opacity="0.85" stroke="' + color + '" stroke-width="' + sw + '" stroke-linejoin="miter"/>';
    if (A) svg += inText(cx, y0 + 15, A, A.length > 2 ? 11 : 12);
    if (T1) svg += inText(cx, y0 + 31, T1, 10);
    if (T) svg += outText(x0 + FW + 4, y0 + 12, T, 'start');
    if (W) svg += outText(x0 - 4, y0 + 12, W + (W1 ? ' -' : ''), 'end');
    if (W1) svg += outText(x0 - 4, y0 + 26, W1, 'end');
    if (H) svg += outText(cx, y0 - 4, H, 'middle');
    if (selected) {
        svg += '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" fill="none" stroke="' + color
            + '" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.75"/>';
    }
    svg += '</svg>';
    return { svg: svg, w: w, h: h, ax: cx, ay: tipY };
}
