/**
 * Simple SITTEMP - Symbol Definitions
 *
 * NATO APP-6 style equipment and unit SVG generators,
 * plus shape / line-type definition lists.
 */

// ===== Equipment Symbol SVGs =====
// NATO APP-6 style equipment symbols rendered as simple SVGs
export function equipmentSVG(key, color) {
    color = color || '#FF0000';
    const svgs = {
        rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="12" y1="28" x2="28" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="22" y1="12" x2="28" y2="12" stroke="${color}" stroke-width="2"/>
        </svg>`,
        light_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="10" y1="28" x2="30" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="10" y1="12" x2="30" y2="28" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="20" r="2" fill="${color}"/>
        </svg>`,
        heavy_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="10" y1="28" x2="30" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="10" y1="12" x2="30" y2="28" stroke="${color}" stroke-width="2"/>
            <rect x="16" y="16" width="8" height="8" fill="${color}"/>
        </svg>`,
        light_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="30" r="4" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        heavy_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="30" r="4" fill="${color}"/>
        </svg>`,
        observation_post: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="28" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold">OP</text>
        </svg>`,
        arty_op: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="22" r="5" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="12" x2="20" y2="17" stroke="${color}" stroke-width="2"/>
        </svg>`,
        at_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="28" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold">ATM</text>
        </svg>`,
        at_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="28" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold">ATG</text>
        </svg>`,
        aa_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="24" text-anchor="middle" fill="${color}" font-size="11" font-weight="bold">AA</text>
            <line x1="14" y1="30" x2="26" y2="30" stroke="${color}" stroke-width="2"/>
        </svg>`,
        aa_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="24" text-anchor="middle" fill="${color}" font-size="9" font-weight="bold">SAM</text>
            <line x1="14" y1="30" x2="26" y2="30" stroke="${color}" stroke-width="2"/>
        </svg>`,
        fixed_wing: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="30" stroke="${color}" stroke-width="2"/>
            <line x1="10" y1="20" x2="30" y2="20" stroke="${color}" stroke-width="2"/>
            <line x1="14" y1="28" x2="26" y2="28" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        attack_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="22" rx="8" ry="5" fill="none" stroke="${color}" stroke-width="1.5"/>
            <line x1="10" y1="17" x2="30" y2="17" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="12" x2="20" y2="17" stroke="${color}" stroke-width="2"/>
        </svg>`,
        utility_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="22" rx="8" ry="5" fill="none" stroke="${color}" stroke-width="1.5"/>
            <line x1="10" y1="17" x2="30" y2="17" stroke="${color}" stroke-width="2"/>
        </svg>`,
        tank: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="24" rx="10" ry="5" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="19" x2="20" y2="12" stroke="${color}" stroke-width="2"/>
        </svg>`,
        armored_vehicle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="24" rx="10" ry="5" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <path d="M14 28 Q20 10 26 28" fill="none" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="22" r="2" fill="${color}"/>
        </svg>`,
        aa_radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>
            <path d="M14 28 Q20 10 26 28" fill="none" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="22" r="2" fill="${color}"/>
            <line x1="14" y1="32" x2="26" y2="32" stroke="${color}" stroke-width="2"/>
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
    { key: 'rifle', name: 'Rifle' },
    { key: 'light_mg', name: 'Light MG' },
    { key: 'heavy_mg', name: 'Heavy MG' },
    { key: 'light_mortar', name: 'Light Mortar' },
    { key: 'heavy_mortar', name: 'Heavy Mortar' },
    { key: 'observation_post', name: 'Obs Post' },
    { key: 'arty_op', name: 'Arty OP' },
    { key: 'at_missile', name: 'AT Missile' },
    { key: 'at_gun', name: 'AT Gun' },
    { key: 'aa_gun', name: 'AA Gun' },
    { key: 'aa_missile', name: 'AA Missile' },
    { key: 'fixed_wing', name: 'Fixed Wing' },
    { key: 'attack_helo', name: 'Attack Helo' },
    { key: 'utility_helo', name: 'Utility Helo' },
    { key: 'tank', name: 'Tank' },
    { key: 'armored_vehicle', name: 'Armored Veh' },
    { key: 'radar', name: 'Radar' },
    { key: 'aa_radar', name: 'AA Radar' },
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
