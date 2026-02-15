/**
 * Simple SITTEMP - Symbol Definitions
 *
 * NATO APP-6 style equipment and unit SVG generators,
 * plus shape / line-type definition lists.
 */

// ===== Equipment Symbol SVGs =====
// NATO APP-6 equipment modifier icons — exact replicas of reference chart
// Standalone symbols centered in a 40x40 viewBox, no enclosing frame
export function equipmentSVG(key, color) {
    color = color || '#FF0000';
    const svgs = {
        // --- Row 1: Small Arms ---
        // Rifle: diagonal barrel lower-left to upper-right, short perpendicular stock at upper end
        rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="8" y1="32" x2="30" y2="10" stroke="${color}" stroke-width="2.5"/>
            <line x1="27" y1="7" x2="33" y2="13" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Machine Gun: simple X-cross (two diagonal lines)
        machine_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="6" y1="34" x2="34" y2="6" stroke="${color}" stroke-width="2.5"/>
            <line x1="6" y1="6" x2="34" y2="34" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Grenade Launcher: vertical line with short horizontal crossbar at top
        grenade_launcher: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="6" x2="20" y2="34" stroke="${color}" stroke-width="2.5"/>
            <line x1="12" y1="6" x2="28" y2="6" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Flame Thrower: vertical line with teardrop/flame shape at top
        flame_thrower: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="36" x2="20" y2="18" stroke="${color}" stroke-width="2.5"/>
            <path d="M14 18 Q14 8 20 4 Q26 8 26 18" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Antitank Rifle: rifle symbol with horizontal line across bottom
        at_rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="8" y1="30" x2="30" y2="8" stroke="${color}" stroke-width="2.5"/>
            <line x1="27" y1="5" x2="33" y2="11" stroke="${color}" stroke-width="2.5"/>
            <line x1="6" y1="36" x2="34" y2="36" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Recoilless Rifle: diagonal barrel with open circle at breech (lower-left)
        recoilless_rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="12" y1="30" x2="32" y2="10" stroke="${color}" stroke-width="2.5"/>
            <circle cx="10" cy="31" r="5" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,

        // --- Row 2: Indirect Fire ---
        // Mortar: vertical tube with open circle at base (baseplate)
        mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="4" x2="20" y2="24" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="30" r="6" fill="none" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Howitzer: large filled circle (solid dot)
        howitzer: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="10" fill="${color}"/>
        </svg>`,
        // Gun: single thick diagonal line (barrel) from lower-left to upper-right
        gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="8" y1="32" x2="32" y2="8" stroke="${color}" stroke-width="3"/>
        </svg>`,
        // Rocket Launcher: single vertical shaft with upward-pointing arrowhead
        rocket_launcher: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="36" x2="20" y2="8" stroke="${color}" stroke-width="2.5"/>
            <line x1="13" y1="15" x2="20" y2="8" stroke="${color}" stroke-width="2.5"/>
            <line x1="27" y1="15" x2="20" y2="8" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Missile Launcher: vertical shaft with arrowhead and small fins at base
        missile_launcher: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="36" x2="20" y2="8" stroke="${color}" stroke-width="2.5"/>
            <line x1="13" y1="15" x2="20" y2="8" stroke="${color}" stroke-width="2.5"/>
            <line x1="27" y1="15" x2="20" y2="8" stroke="${color}" stroke-width="2.5"/>
            <line x1="13" y1="36" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
            <line x1="27" y1="36" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // SSM (Surface-to-Surface Missile): text label "SSM"
        ssm: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <text x="20" y="26" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold" font-family="Arial,sans-serif">SSM</text>
        </svg>`,

        // --- Row 3: Antitank / Air Defense ---
        // Antitank Gun: diagonal barrel with filled circle at breech (lower-left)
        at_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="12" y1="30" x2="32" y2="10" stroke="${color}" stroke-width="2.5"/>
            <circle cx="10" cy="31" r="4" fill="${color}"/>
        </svg>`,
        // Air Defense Gun: vertical barrel pointing upward from a horizontal base
        ad_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="4" x2="20" y2="28" stroke="${color}" stroke-width="2.5"/>
            <line x1="8" y1="36" x2="32" y2="36" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="28" x2="8" y2="36" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="28" x2="32" y2="36" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // SAM (Surface-to-Air Missile): upward arrow (missile) with horizontal air defense line at base
        sam: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="4" x2="20" y2="28" stroke="${color}" stroke-width="2.5"/>
            <line x1="13" y1="11" x2="20" y2="4" stroke="${color}" stroke-width="2.5"/>
            <line x1="27" y1="11" x2="20" y2="4" stroke="${color}" stroke-width="2.5"/>
            <line x1="6" y1="36" x2="34" y2="36" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // ATGM (Anti-Tank Guided Missile): horizontal arrow pointing right with tail fins
        atgm: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="4" y1="20" x2="30" y2="20" stroke="${color}" stroke-width="2.5"/>
            <line x1="30" y1="20" x2="24" y2="14" stroke="${color}" stroke-width="2.5"/>
            <line x1="30" y1="20" x2="24" y2="26" stroke="${color}" stroke-width="2.5"/>
            <line x1="4" y1="14" x2="4" y2="26" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Tank: track ellipse with vertical gun barrel extending upward
        tank: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <ellipse cx="20" cy="26" rx="14" ry="7" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="19" x2="20" y2="6" stroke="${color}" stroke-width="3"/>
        </svg>`,
        // APC (Armored Personnel Carrier): track ellipse only, no gun
        apc: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <ellipse cx="20" cy="20" rx="14" ry="8" fill="none" stroke="${color}" stroke-width="2.5"/>
        </svg>`,

        // --- Row 4: Support / Aircraft ---
        // Radar: parabolic dish arc with small filled emitter dot
        radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M6 34 Q20 4 34 34" fill="none" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="26" r="3.5" fill="${color}"/>
        </svg>`,
        // Fixed Wing: vertical fuselage, horizontal wings, smaller horizontal tail
        fixed_wing: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="4" x2="20" y2="36" stroke="${color}" stroke-width="2.5"/>
            <line x1="4" y1="18" x2="36" y2="18" stroke="${color}" stroke-width="2.5"/>
            <line x1="12" y1="32" x2="28" y2="32" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Rotary Wing: horizontal rotor, vertical mast, fuselage ellipse
        rotary_wing: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="4" y1="10" x2="36" y2="10" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="16" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="24" rx="11" ry="7" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // UAV: smaller fixed-wing shape with pointed nose
        uav: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="8" x2="20" y2="34" stroke="${color}" stroke-width="2"/>
            <line x1="6" y1="22" x2="34" y2="22" stroke="${color}" stroke-width="2"/>
            <path d="M17 8 L20 2 L23 8" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Observation Post: eye-shaped symbol (two arcs)
        observation_post: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M4 20 Q20 4 36 20 Q20 36 4 20 Z" fill="none" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="20" r="4" fill="${color}"/>
        </svg>`,
        // Electronic Warfare: zigzag lightning bolt pattern
        electronic_warfare: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M4 32 L12 8 L20 28 L28 8 L36 32" fill="none" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
    };
    return svgs[key] || svgs.rifle;
}

// ===== Unit Symbol SVGs =====
// NATO friendly rectangle frame with unit type modifier inside
export function unitSVG(key, color) {
    color = color || '#0000FF';
    const frame = `<rect x="2" y="6" width="36" height="24" fill="none" stroke="${color}" stroke-width="2.5" rx="1"/>`;
    const modifiers = {
        infantry: `${frame}<line x1="6" y1="10" x2="34" y2="26" stroke="${color}" stroke-width="2"/><line x1="34" y1="10" x2="6" y2="26" stroke="${color}" stroke-width="2"/>`,
        armor: `${frame}<ellipse cx="20" cy="18" rx="12" ry="7" fill="none" stroke="${color}" stroke-width="2"/>`,
        armored_infantry: `${frame}<ellipse cx="20" cy="18" rx="12" ry="7" fill="none" stroke="${color}" stroke-width="1.5"/><line x1="10" y1="12" x2="30" y2="24" stroke="${color}" stroke-width="1.5"/><line x1="30" y1="12" x2="10" y2="24" stroke="${color}" stroke-width="1.5"/>`,
        artillery: `${frame}<circle cx="20" cy="18" r="5" fill="${color}"/>`,
        engineers: `${frame}<text x="20" y="23" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold">E</text>`,
        aviation: `${frame}<path d="M10 18 L20 10 L30 18" fill="none" stroke="${color}" stroke-width="2"/>`,
        military_intel: `${frame}<text x="20" y="23" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">MI</text>`,
        military_police: `${frame}<text x="20" y="23" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold">MP</text>`,
        recon: `${frame}<line x1="6" y1="26" x2="34" y2="10" stroke="${color}" stroke-width="2"/>`,
        signal: `${frame}<path d="M12 24 L16 12 L24 24 L28 12" fill="none" stroke="${color}" stroke-width="2"/>`,
        electronic_warfare: `${frame}<path d="M10 24 L14 12 L22 24 L26 12" fill="none" stroke="${color}" stroke-width="1.5"/><line x1="30" y1="12" x2="30" y2="24" stroke="${color}" stroke-width="1.5"/>`,
    };
    const inner = modifiers[key] || modifiers.infantry;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="36" viewBox="0 0 40 36">${inner}</svg>`;
}

// ===== Definition Lists =====

export const EQUIPMENT_LIST = [
    // Row 1: Small Arms
    { key: 'rifle', name: 'Rifle' },
    { key: 'machine_gun', name: 'Machine Gun' },
    { key: 'grenade_launcher', name: 'Grenade Lnchr' },
    { key: 'flame_thrower', name: 'Flame Thrower' },
    { key: 'at_rifle', name: 'AT Rifle' },
    { key: 'recoilless_rifle', name: 'Recoilless' },
    // Row 2: Indirect Fire
    { key: 'mortar', name: 'Mortar' },
    { key: 'howitzer', name: 'Howitzer' },
    { key: 'gun', name: 'Gun' },
    { key: 'rocket_launcher', name: 'Rocket Lnchr' },
    { key: 'missile_launcher', name: 'Missile Lnchr' },
    { key: 'ssm', name: 'SSM' },
    // Row 3: Antitank / Air Defense
    { key: 'at_gun', name: 'AT Gun' },
    { key: 'ad_gun', name: 'AD Gun' },
    { key: 'sam', name: 'SAM' },
    { key: 'atgm', name: 'ATGM' },
    { key: 'tank', name: 'Tank' },
    { key: 'apc', name: 'APC' },
    // Row 4: Support / Aircraft
    { key: 'radar', name: 'Radar' },
    { key: 'fixed_wing', name: 'Fixed Wing' },
    { key: 'rotary_wing', name: 'Rotary Wing' },
    { key: 'uav', name: 'UAV' },
    { key: 'observation_post', name: 'Obs Post' },
    { key: 'electronic_warfare', name: 'EW' },
];

export const UNIT_LIST = [
    { key: 'infantry', name: 'Infantry' },
    { key: 'armor', name: 'Armor' },
    { key: 'armored_infantry', name: 'Armored Inf' },
    { key: 'artillery', name: 'Artillery' },
    { key: 'engineers', name: 'Engineers' },
    { key: 'aviation', name: 'Aviation' },
    { key: 'military_intel', name: 'Mil Intel' },
    { key: 'military_police', name: 'Mil Police' },
    { key: 'recon', name: 'Recon' },
    { key: 'signal', name: 'Signal' },
    { key: 'electronic_warfare', name: 'EW' },
];

export const SHAPE_LIST = [
    { key: 'circle', name: 'Circle', icon: '<circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'rectangle', name: 'Rectangle', icon: '<rect x="3" y="6" width="22" height="16" fill="none" stroke="currentColor" stroke-width="2" rx="1"/>' },
    { key: 'polygon', name: 'Polygon', icon: '<polygon points="14,2 26,10 22,26 6,26 2,10" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'linestring', name: 'Line', icon: '<line x1="3" y1="25" x2="25" y2="3" stroke="currentColor" stroke-width="2"/>' },
    { key: 'freehand', name: 'Freehand', icon: '<path d="M3 20 Q8 5 14 15 T25 8" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'triangle', name: 'Triangle', icon: '<polygon points="14,3 26,25 2,25" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'star', name: 'Star', icon: '<polygon points="14,2 17,11 27,11 19,17 22,26 14,21 6,26 9,17 1,11 11,11" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
];

export const LINE_TYPES = [
    { key: 'solid', name: 'Solid' },
    { key: 'dashed', name: 'Dashed' },
    { key: 'dotted', name: 'Dotted' },
    { key: 'dashdot', name: 'Dash-Dot' },
    { key: 'minebelt', name: 'Mine Belt' },
    { key: 'wire', name: 'Wire Obstacle' },
    { key: 'tankditch', name: 'Tank Ditch' },
];

// ===== SVG Utility Helpers =====

function stripSvgWrapper(svgString) {
    return svgString.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '');
}

export function escapeXml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build an SVG that includes the symbol + optional left/right text labels.
 */
export function buildSymbolWithLabels(svgInner, leftText, rightText, color) {
    const totalWidth = 120;
    const totalHeight = 50;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;

    if (leftText) {
        svg += `<text x="38" y="30" text-anchor="end" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(leftText)}</text>`;
    }

    svg += `<g transform="translate(40, 5)">${stripSvgWrapper(svgInner)}</g>`;

    if (rightText) {
        svg += `<text x="82" y="30" text-anchor="start" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(rightText)}</text>`;
    }

    svg += '</svg>';
    return svg;
}

export function getLinePreviewSVG(type) {
    const c = '#ccc';
    switch (type) {
        case 'solid':    return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2"/></svg>`;
        case 'dashed':   return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="6,4"/></svg>`;
        case 'dotted':   return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="2,4"/></svg>`;
        case 'dashdot':  return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="8,3,2,3"/></svg>`;
        case 'minebelt': return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2"/><circle cx="10" cy="5" r="3" fill="${c}"/><circle cx="30" cy="5" r="3" fill="${c}"/></svg>`;
        case 'wire':     return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2"/><circle cx="10" cy="5" r="3" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="30" cy="5" r="3" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`;
        case 'tankditch':return `<svg width="40" height="10"><polygon points="0,8 5,2 10,8 15,2 20,8 25,2 30,8 35,2 40,8" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`;
        default: return '';
    }
}
