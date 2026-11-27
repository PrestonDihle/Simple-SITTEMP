/**
 * Simple SITTEMP - Task Organization Composition Symbols
 *
 * FM 1-02.2 (INCL C1) chapter 7, figure 7-1 / tables 7-1 and 7-2 / figure 7-2.
 * A rectangular frame with:
 *   B  - echelon of the headquarters, in a box centered on the top edge
 *   D  - task force: a wider box around the echelon box
 *   H  - designation (e.g. "TF1"), top left inside the frame
 *   K  - up to two combat effectiveness pies, top right inside the frame:
 *        effectiveness (ammunition / weapons / personnel) and selected status
 *        (personnel / ammunition / weapons / POL); each part is rated none,
 *        green, amber, red or black
 *   A  - rows of frameless subordinate unit symbols (table 7-1), any number per
 *        row, each optionally marked (+), (-) or (±) and with a lower echelon
 *        indicator above it; "(empty cell)" leaves a gap so units can be lined
 *        up in columns as in figure 7-2
 *
 * Placed as a map marker (_sittemp.type = 'task_org'); everything is stored on
 * the marker's _sittemp so undo/redo and saved maps keep it.
 */

import { escapeXml, ECHELON_LIST, buildEchelonMarks } from './symbols.js';

// Table 7-1 unit symbols, drawn frameless in a 36 x 20 box (sw = stroke width)
const G = {
    infantry: (c, sw) => X(2, 1, 34, 19, c, sw),
    mechanized_infantry: (c, sw) => X(2, 1, 34, 19, c, sw) + RR(8, 6, 20, 8, c, sw),
    mobile_infantry: (c, sw) => X(6, 5, 30, 15, c, sw) + RR(12, 0, 12, 5, c, sw)
        + [13, 18, 23].map((x) => `<circle cx="${x}" cy="18.3" r="1.5" fill="none" stroke="${c}" stroke-width="${sw * 0.7}"/>`).join(''),
    mountain_infantry: (c, sw) => X(2, 1, 34, 17, c, sw) + `<polygon points="13.5,19.5 18,12.5 22.5,19.5" fill="${c}"/>`,
    airborne_infantry: (c, sw) => X(4, 0, 32, 13, c, sw)
        + `<path d="M10,19.5 Q14,12.5 18,19.5 Q22,12.5 26,19.5" fill="none" stroke="${c}" stroke-width="${sw}"/>`,
    air_assault_infantry: (c, sw) => X(6, 4, 30, 15, c, sw) + T(18, 3.6, 'ASLT', 5.2, c) + BOW(18, 18, 4, 2.2, c),
    armor: (c, sw) => RR(6, 4, 24, 12, c, sw),
    armored_recon: (c, sw) => RR(6, 4, 24, 12, c, sw) + L(3, 19, 33, 1, c, sw),
    combined_arms: (c, sw) => RR(6, 3, 24, 14, c, sw) + L(10, 5, 26, 15, c, sw) + L(10, 15, 26, 5, c, sw),
    recon: (c, sw) => L(4, 18, 32, 2, c, sw),
    anti_tank: (c, sw) => `<path d="M8,19 L18,1 L28,19" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="miter"/>`,
    air_defense: (c, sw) => `<path d="M5,16 Q18,2 31,16" fill="none" stroke="${c}" stroke-width="${sw}"/>`,
    field_artillery: (c) => `<circle cx="18" cy="10" r="5" fill="${c}"/>`,
    engineer: (c, sw) => `<path d="M8,18 L8,5 L28,5 L28,18 M18,5 L18,18" fill="none" stroke="${c}" stroke-width="${sw}"/>`,
    air_recon: (c, sw) => BOW(18, 10, 9, 5, c) + L(5, 18, 31, 2, c, sw),
    attack_helicopter: (c) => T(18, 7, 'A', 8, c) + BOW(18, 14, 8, 4.5, c),
    assault_helicopter: (c) => T(18, 6.5, 'ASLT', 6.5, c) + BOW(18, 14, 8, 4.5, c),
    blank: () => '',
};

export const TASK_ORG_UNITS = [
    { key: 'infantry', name: 'Infantry' },
    { key: 'mechanized_infantry', name: 'Mechanized infantry' },
    { key: 'mobile_infantry', name: 'Mobile infantry (Stryker)' },
    { key: 'mountain_infantry', name: 'Mountain infantry' },
    { key: 'airborne_infantry', name: 'Airborne infantry' },
    { key: 'air_assault_infantry', name: 'Air assault infantry' },
    { key: 'armor', name: 'Armor tracked' },
    { key: 'armored_recon', name: 'Armored recon (cavalry)' },
    { key: 'combined_arms', name: 'Combined arms' },
    { key: 'recon', name: 'Recon (cavalry scout)' },
    { key: 'anti_tank', name: 'Anti-tank' },
    { key: 'air_defense', name: 'Air defense' },
    { key: 'field_artillery', name: 'Field artillery' },
    { key: 'engineer', name: 'Engineer' },
    { key: 'air_recon', name: 'Air recon (cavalry)' },
    { key: 'attack_helicopter', name: 'Attack helicopter' },
    { key: 'assault_helicopter', name: 'Assault / lift helicopter' },
    { key: 'blank', name: '(empty cell)' },
];

export const TASK_ORG_MODS = [
    { key: '', name: '—' },
    { key: '+', name: '(+) reinforced' },
    { key: '-', name: '(-) reduced' },
    { key: '±', name: '(±) both' },
];

// Effectiveness pie: three parts split at 12, 4 and 8 o'clock (table 7-2)
export const EFFECTIVENESS_PARTS = [
    { key: 'ammunition', name: 'Ammunition', a0: 150, a1: 270 },   // upper left
    { key: 'weapons', name: 'Weapons', a0: 270, a1: 390 },         // upper right
    { key: 'personnel', name: 'Personnel', a0: 30, a1: 150 },      // bottom
];
// Selected status pie: quadrants
export const STATUS_PARTS = [
    { key: 'personnel', name: 'Personnel', a0: 180, a1: 270 },     // top left
    { key: 'ammunition', name: 'Ammunition', a0: 270, a1: 360 },   // top right
    { key: 'weapons', name: 'Weapons', a0: 0, a1: 90 },            // bottom right
    { key: 'pol', name: 'POL', a0: 90, a1: 180 },                  // bottom left
];

function f(n) { return Math.round(n * 10) / 10; }
function L(x1, y1, x2, y2, c, sw) { return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`; }
function X(x1, y1, x2, y2, c, sw) { return L(x1, y1, x2, y2, c, sw) + L(x1, y2, x2, y1, c, sw); }
function RR(x, y, w, h, c, sw) { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="none" stroke="${c}" stroke-width="${sw}"/>`; }
function T(x, y, txt, size, c) {
    return `<text x="${x}" y="${f(y + size * 0.36)}" text-anchor="middle" font-family="Arial,sans-serif" font-size="${size}" font-weight="bold" fill="${c}">${escapeXml(txt)}</text>`;
}
// Bow tie (rotary wing): two filled triangles meeting at (cx, cy)
function BOW(cx, cy, half, hh, c) {
    return `<polygon points="${f(cx - half)},${f(cy - hh)} ${cx},${cy} ${f(cx - half)},${f(cy + hh)}" fill="${c}"/>`
        + `<polygon points="${f(cx + half)},${f(cy - hh)} ${cx},${cy} ${f(cx + half)},${f(cy + hh)}" fill="${c}"/>`;
}

/** A pie of radius r at (cx, cy) with the listed parts filled. */
// Rating for each pie part. Older maps stored true for a problem: shown as black.
export const RATINGS = [
    { key: '', name: 'None', color: '#ffffff' },
    { key: 'green', name: 'Green', color: '#2e9e44' },
    { key: 'amber', name: 'Amber', color: '#ffbf00' },
    { key: 'red', name: 'Red', color: '#e02020' },
    { key: 'black', name: 'Black', color: '#000000' },
];
function ratingColor(v) {
    if (v === true) return '#000000';
    const r = RATINGS.find(function (x) { return x.key === v; });
    return r && r.key ? r.color : null;
}

function pie(cx, cy, r, parts, filled, c, sw) {
    const pt = (a) => [f(cx + r * Math.cos(a * Math.PI / 180)), f(cy + r * Math.sin(a * Math.PI / 180))];
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff"/>`;
    parts.forEach(function (p) {
        const col = ratingColor(filled && filled[p.key]);
        if (!col) return;
        const a = pt(p.a0), b = pt(p.a1);
        s += `<path d="M${cx},${cy} L${a[0]},${a[1]} A${r},${r} 0 0,1 ${b[0]},${b[1]} Z" fill="${col}"/>`;
    });
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}"/>`;
    parts.forEach(function (p) { const a = pt(p.a0); s += L(cx, cy, a[0], a[1], c, sw * 0.8); });
    return s;
}

const CELL_W = 44, CELL_H = 38, GLYPH_W = 36, GLYPH_H = 20;

/** Icon for a task organization composition symbol: { svg, w, h, ax, ay } (anchor = frame center). */
export function taskOrgIcon(info, selected) {
    const c = info.color || '#000000';
    const sw = info.strokeWidth || 2;
    const gsw = Math.max(1.2, sw * 0.7);
    const units = Array.isArray(info.units) ? info.units : [];
    const perRow = Math.max(1, Math.min(8, +info.perRow || 4));
    const rows = Math.max(1, Math.ceil(units.length / perRow));
    const cols = Math.max(1, Math.min(perRow, Math.max(units.length, 1)));
    const H = String(info.h || '').toUpperCase().trim();
    const pies = (info.showEff ? 1 : 0) + (info.showStatus ? 1 : 0);
    const R = 10;
    const headerW = (H ? H.length * 7.6 + 10 : 0) + pies * (2 * R + 6) + 8;
    const frameW = Math.ceil(Math.max(cols * CELL_W + 12, headerW, 70));
    const headerH = (H || pies) ? 2 * R + 8 : 4;
    const frameH = Math.ceil(headerH + rows * CELL_H + 6);
    const ech = info.echelon && info.echelon !== 'none' ? info.echelon : '';
    const topH = info.taskForce ? 30 : (ech ? 18 : 0);
    const m = 3;
    const w = frameW + 2 * m, h = topH + frameH + 2 * m;
    const fx = m, fy = m + topH, cx = fx + frameW / 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
    // Frame (white so it reads over imagery)
    svg += `<rect x="${fx}" y="${fy}" width="${frameW}" height="${frameH}" fill="#ffffff" fill-opacity="0.9" stroke="${c}" stroke-width="${sw}"/>`;
    // D: task force box, wider, around the echelon box
    if (info.taskForce) {
        svg += `<rect x="${f(cx - 34)}" y="${m}" width="68" height="${topH}" fill="#ffffff" fill-opacity="0.9" stroke="${c}" stroke-width="${sw * 0.8}"/>`;
    }
    // B: echelon box on the top edge
    if (ech) {
        svg += `<rect x="${f(cx - 18)}" y="${fy - 18}" width="36" height="18" fill="#ffffff" stroke="${c}" stroke-width="${sw * 0.8}"/>`;
        svg += buildEchelonMarks(ech, cx, fy - 3, c);
    }
    // H: designation, top left
    if (H) {
        svg += `<text x="${fx + 6}" y="${fy + R + 9}" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="${c}">${escapeXml(H)}</text>`;
    }
    // K: combat effectiveness pies, top right
    let px = fx + frameW - 6 - R;
    const py = fy + R + 4;
    if (info.showStatus) { svg += pie(px, py, R, STATUS_PARTS, info.status, c, gsw); px -= 2 * R + 6; }
    if (info.showEff) { svg += pie(px, py, R, EFFECTIVENESS_PARTS, info.eff, c, gsw); }
    // A: unit rows
    units.forEach(function (u, i) {
        const r = Math.floor(i / perRow), k = i % perRow;
        const gridX = cx - cols * CELL_W / 2;                    // grid centered, cells left-aligned (figure 7-2)
        const gx = gridX + k * CELL_W + (CELL_W - GLYPH_W) / 2;
        const gy = fy + headerH + r * CELL_H + 15;
        const g = G[u.type] || G.infantry;
        svg += `<g transform="translate(${f(gx)},${f(gy)})">${g(c, gsw)}</g>`;
        if (u.ech && u.ech !== 'none') svg += buildEchelonMarks(u.ech, f(gx + GLYPH_W / 2), f(gy - 1), c);
        if (u.mod) svg += `<text x="${f(gx + GLYPH_W - 2)}" y="${f(gy + 2)}" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="${c}">(${escapeXml(u.mod)})</text>`;
    });
    if (selected) {
        svg += `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" fill="none" stroke="${c}" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.75"/>`;
    }
    svg += '</svg>';
    return { svg: svg, w: w, h: h, ax: w / 2, ay: fy + frameH / 2 };
}

/** Default content for a newly placed symbol. */
export function newTaskOrg(base) {
    return Object.assign({
        type: 'task_org', echelon: 'battalion', taskForce: false, h: '', perRow: 4,
        showEff: false, eff: {}, showStatus: false, status: {},
        units: [{ type: 'infantry', mod: '', ech: '' }, { type: 'armor', mod: '', ech: '' }],
    }, base);
}

// ===== Popover editor =====

function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
}
function row(section, label) {
    const r = el('div', 'popover-row');
    r.appendChild(el('span', 'popover-label', label));
    section.appendChild(r);
    return r;
}
function select(parent, options, value, onSet) {
    const s = el('select', 'popover-select');
    options.forEach(function (o) { const op = el('option', null, o.name); op.value = o.key; s.appendChild(op); });
    s.value = value;
    s.addEventListener('keydown', function (e) { e.stopPropagation(); });
    s.addEventListener('change', function () { onSet(s.value); });
    parent.appendChild(s);
    return s;
}
function check(parent, label, value, onSet) {
    const lb = el('label', 'taskorg-check');
    const cb = el('input'); cb.type = 'checkbox'; cb.checked = !!value;
    cb.addEventListener('change', function () { onSet(cb.checked); });
    lb.appendChild(cb); lb.appendChild(document.createTextNode(label));
    parent.appendChild(lb);
    return cb;
}

/** One pie part: its name and a swatch per rating (none, green, amber, red, black). */
function ratingRow(section, label, store, key, redraw) {
    const r = row(section, label);
    const wrap = el('div', 'popover-swatches');
    const cur = store[key] === true ? 'black' : (store[key] || '');
    RATINGS.forEach(function (rt) {
        const sw = el('div', 'popover-swatch taskorg-rating' + (rt.key === cur ? ' active' : '') + (rt.key ? '' : ' no-fill'));
        if (rt.key) sw.style.backgroundColor = rt.color;
        sw.title = rt.name;
        sw.addEventListener('click', function () {
            store[key] = rt.key;
            wrap.querySelectorAll('.popover-swatch').forEach(function (s) { s.classList.remove('active'); });
            sw.classList.add('active');
            redraw();
        });
        wrap.appendChild(sw);
    });
    r.appendChild(wrap);
}

/**
 * Append the task organization editor to the popover. redraw() rebuilds the
 * marker icon and schedules an undo push; refresh() rebuilds the popover (used
 * when units are added or removed).
 */
export function buildTaskOrgSection(popover, info, redraw, refresh) {
    const sec = el('div', 'popover-vs popover-measure taskorg-section');
    const head = el('div', 'popover-vs-head'); head.appendChild(el('span', null, 'Task organization'));
    sec.appendChild(head);

    select(row(sec, 'Echelon (B)'), ECHELON_LIST, info.echelon || 'none', function (v) { info.echelon = v; redraw(); });
    check(row(sec, 'Task force (D)'), '', info.taskForce, function (v) { info.taskForce = v; redraw(); });
    const hInp = el('input', 'popover-num popover-text'); hInp.type = 'text'; hInp.style.width = '130px';
    hInp.placeholder = 'e.g. TF1'; hInp.value = info.h || '';
    hInp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') hInp.blur(); });
    hInp.addEventListener('change', function () { info.h = hInp.value.toUpperCase().trim(); redraw(); });
    row(sec, 'Designation (H)').appendChild(hInp);

    // K: combat effectiveness
    const effRow = row(sec, 'Effectiveness (K)');
    check(effRow, 'show', info.showEff, function (v) { info.showEff = v; redraw(); refresh(); });
    if (info.showEff) {
        info.eff = info.eff || {};
        EFFECTIVENESS_PARTS.forEach(function (p) { ratingRow(sec, p.name, info.eff, p.key, redraw); });
    }
    const stRow = row(sec, 'Status pie (K)');
    check(stRow, 'show', info.showStatus, function (v) { info.showStatus = v; redraw(); refresh(); });
    if (info.showStatus) {
        info.status = info.status || {};
        STATUS_PARTS.forEach(function (p) { ratingRow(sec, p.name, info.status, p.key, redraw); });
    }

    // A: units
    const perInp = el('input', 'popover-num'); perInp.type = 'number'; perInp.min = 1; perInp.max = 8; perInp.style.width = '50px';
    perInp.value = info.perRow || 4;
    perInp.addEventListener('keydown', function (e) { e.stopPropagation(); });
    perInp.addEventListener('change', function () { const v = parseInt(perInp.value, 10); if (v >= 1 && v <= 8) { info.perRow = v; redraw(); } });
    row(sec, 'Units per row').appendChild(perInp);

    info.units = info.units || [];
    const lowerEch = [{ key: '', name: 'echelon —' }].concat(ECHELON_LIST.filter(function (e) { return e.key !== 'none'; }));
    info.units.forEach(function (u, i) {
        const r = el('div', 'popover-row taskorg-unit');
        select(r, TASK_ORG_UNITS, u.type, function (v) { u.type = v; redraw(); });
        select(r, TASK_ORG_MODS, u.mod || '', function (v) { u.mod = v; redraw(); });
        select(r, lowerEch, u.ech || '', function (v) { u.ech = v; redraw(); });
        const rm = el('button', 'popover-rot-btn', '×'); rm.title = 'Remove this unit';
        rm.addEventListener('click', function () { info.units.splice(i, 1); redraw(); refresh(); });
        r.appendChild(rm);
        sec.appendChild(r);
    });
    const add = el('button', 'popover-vs-add', '+ Add unit');
    add.addEventListener('click', function () { info.units.push({ type: 'infantry', mod: '', ech: '' }); redraw(); refresh(); });
    sec.appendChild(add);

    popover.appendChild(sec);
}
