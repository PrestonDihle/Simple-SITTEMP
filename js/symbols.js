/**
 * Simple SITTEMP - Symbol Definitions
 *
 * NATO APP-6 style equipment and unit SVG generators,
 * plus shape / line-type definition lists.
 */

// ===== Equipment Symbol SVGs =====
// NATO APP-6 style equipment modifier icons (no enclosing frame)
// These are standalone symbols centered in a 40x40 viewBox
export function equipmentSVG(key, color) {
    color = color || '#FF0000';
    const svgs = {
        // --- Row 1: Small Arms ---
        // Rifle: diagonal line (barrel) with short perpendicular stock
        rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="8" y1="32" x2="30" y2="10" stroke="${color}" stroke-width="2.5"/>
            <line x1="27" y1="7" x2="33" y2="13" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Light MG: X-cross with small open circle at center
        light_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="6" y1="34" x2="34" y2="6" stroke="${color}" stroke-width="2.5"/>
            <line x1="6" y1="6" x2="34" y2="34" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="20" r="3.5" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Heavy MG: X-cross with filled square at center
        heavy_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="6" y1="34" x2="34" y2="6" stroke="${color}" stroke-width="2.5"/>
            <line x1="6" y1="6" x2="34" y2="34" stroke="${color}" stroke-width="2.5"/>
            <rect x="15" y="15" width="10" height="10" fill="${color}"/>
        </svg>`,
        // Grenade Launcher: vertical tube with short horizontal crossbar at top
        grenade_launcher: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="6" x2="20" y2="34" stroke="${color}" stroke-width="2.5"/>
            <line x1="12" y1="6" x2="28" y2="6" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Flame Thrower: vertical line with flame-like curves at top
        flame_thrower: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="36" x2="20" y2="18" stroke="${color}" stroke-width="2.5"/>
            <path d="M14 18 Q14 8 20 4 Q26 8 26 18" fill="none" stroke="${color}" stroke-width="2"/>
            <path d="M17 15 Q17 10 20 7 Q23 10 23 15" fill="none" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // AT Rifle: rifle with horizontal crossbar at base
        at_rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="8" y1="30" x2="30" y2="8" stroke="${color}" stroke-width="2.5"/>
            <line x1="27" y1="5" x2="33" y2="11" stroke="${color}" stroke-width="2.5"/>
            <line x1="8" y1="36" x2="32" y2="36" stroke="${color}" stroke-width="2.5"/>
        </svg>`,

        // --- Row 2: Mortars & Observation ---
        // Light Mortar: vertical tube with open circle at base
        light_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="4" x2="20" y2="24" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="30" r="6" fill="none" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Heavy Mortar: vertical tube with filled circle at base
        heavy_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="4" x2="20" y2="24" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="30" r="6" fill="${color}"/>
        </svg>`,
        // Recoilless Rifle: diagonal barrel with open circle at breech (lower-left)
        recoilless_rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="10" y1="30" x2="32" y2="8" stroke="${color}" stroke-width="2.5"/>
            <circle cx="10" cy="30" r="5" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Observation Post: "OP" text
        observation_post: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <text x="20" y="27" text-anchor="middle" fill="${color}" font-size="18" font-weight="bold" font-family="Arial,sans-serif">OP</text>
        </svg>`,
        // Artillery OP: open circle with vertical line above
        arty_op: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="26" r="8" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="4" x2="20" y2="18" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // ATGM: "ATGM" text
        at_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <text x="20" y="26" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold" font-family="Arial,sans-serif">ATGM</text>
        </svg>`,

        // --- Row 3: AT & AA Weapons, Aircraft ---
        // Anti-Tank Gun: diagonal barrel with filled circle at breech
        at_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="10" y1="30" x2="32" y2="8" stroke="${color}" stroke-width="2.5"/>
            <circle cx="10" cy="30" r="4" fill="${color}"/>
        </svg>`,
        // AA Gun: "AA" text with horizontal air-defense line below
        aa_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <text x="20" y="22" text-anchor="middle" fill="${color}" font-size="16" font-weight="bold" font-family="Arial,sans-serif">AA</text>
            <line x1="6" y1="30" x2="34" y2="30" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // SAM: "SAM" text with horizontal air-defense line below
        aa_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <text x="20" y="22" text-anchor="middle" fill="${color}" font-size="13" font-weight="bold" font-family="Arial,sans-serif">SAM</text>
            <line x1="6" y1="30" x2="34" y2="30" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Fixed Wing: fuselage, wings, tail
        fixed_wing: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="4" x2="20" y2="36" stroke="${color}" stroke-width="2.5"/>
            <line x1="4" y1="18" x2="36" y2="18" stroke="${color}" stroke-width="2.5"/>
            <line x1="12" y1="32" x2="28" y2="32" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Attack Helicopter: rotor, mast, fuselage ellipse, weapon stubs
        attack_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="4" y1="10" x2="36" y2="10" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="16" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="24" rx="11" ry="7" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="9" y1="23" x2="4" y2="23" stroke="${color}" stroke-width="2"/>
            <line x1="31" y1="23" x2="36" y2="23" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Utility Helicopter: rotor, mast, fuselage ellipse (no weapon stubs)
        utility_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="4" y1="10" x2="36" y2="10" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="10" x2="20" y2="16" stroke="${color}" stroke-width="2.5"/>
            <ellipse cx="20" cy="24" rx="11" ry="7" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,

        // --- Row 4: Vehicles & Artillery ---
        // Tank: track ellipse with gun barrel extending upward
        tank: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <ellipse cx="20" cy="26" rx="14" ry="7" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="19" x2="20" y2="6" stroke="${color}" stroke-width="3"/>
        </svg>`,
        // APC/IFV: track ellipse only
        armored_vehicle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <ellipse cx="20" cy="20" rx="14" ry="8" fill="none" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Howitzer/Field Artillery: filled circle
        howitzer: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="10" fill="${color}"/>
        </svg>`,
        // Rocket Artillery / MRL: three upward arrows
        rocket_arty: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="12" y1="36" x2="12" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="12" y1="12" x2="8" y2="18" stroke="${color}" stroke-width="2"/>
            <line x1="12" y1="12" x2="16" y2="18" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="36" x2="20" y2="6" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="6" x2="16" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="6" x2="24" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="28" y1="36" x2="28" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="28" y1="12" x2="24" y2="18" stroke="${color}" stroke-width="2"/>
            <line x1="28" y1="12" x2="32" y2="18" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Radar: parabolic dish with emitter dot
        radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M6 34 Q20 4 34 34" fill="none" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="26" r="3.5" fill="${color}"/>
        </svg>`,
        // AA Radar: radar dish + air-defense line below
        aa_radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M6 30 Q20 4 34 30" fill="none" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="22" r="3" fill="${color}"/>
            <line x1="6" y1="36" x2="34" y2="36" stroke="${color}" stroke-width="2.5"/>
        </svg>`,

        // --- Row 5: Specialty ---
        // Sniper: crosshair circle with cross
        sniper: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="10" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="6" x2="20" y2="34" stroke="${color}" stroke-width="2"/>
            <line x1="6" y1="20" x2="34" y2="20" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Mine/IED: diamond with "M" inside
        mine: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,4 36,20 20,36 4,20" fill="none" stroke="${color}" stroke-width="2.5"/>
            <text x="20" y="25" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold" font-family="Arial,sans-serif">M</text>
        </svg>`,
        // CBRN: inverted Y (trefoil simplified)
        cbrn: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="20" x2="20" y2="36" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="20" x2="8" y2="6" stroke="${color}" stroke-width="2.5"/>
            <line x1="20" y1="20" x2="32" y2="6" stroke="${color}" stroke-width="2.5"/>
            <circle cx="20" cy="20" r="3" fill="${color}"/>
        </svg>`,
        // Supply Point: circle with horizontal line through center
        supply: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="12" fill="none" stroke="${color}" stroke-width="2.5"/>
            <line x1="8" y1="20" x2="32" y2="20" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // Command Post: flag on a pole
        command_post: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="10" y1="36" x2="10" y2="4" stroke="${color}" stroke-width="2.5"/>
            <rect x="10" y="4" width="20" height="14" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Electronic Warfare: zigzag / lightning bolt
        electronic_warfare: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <path d="M4 32 L12 8 L20 28 L28 8 L36 32" fill="none" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // UAV/Drone: small fixed-wing silhouette with nose cone
        uav: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="8" x2="20" y2="34" stroke="${color}" stroke-width="2"/>
            <line x1="6" y1="22" x2="34" y2="22" stroke="${color}" stroke-width="2"/>
            <path d="M17 8 L20 2 L23 8" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // MANPADS: upward arrow with air-defense line below
        manpads: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <line x1="20" y1="6" x2="20" y2="28" stroke="${color}" stroke-width="2.5"/>
            <line x1="14" y1="12" x2="20" y2="6" stroke="${color}" stroke-width="2.5"/>
            <line x1="26" y1="12" x2="20" y2="6" stroke="${color}" stroke-width="2.5"/>
            <line x1="6" y1="36" x2="34" y2="36" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // ATGM Vehicle: ATGM text above track ellipse
        at_missile_veh: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <ellipse cx="20" cy="28" rx="13" ry="6" fill="none" stroke="${color}" stroke-width="2"/>
            <text x="20" y="16" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold" font-family="Arial,sans-serif">ATGM</text>
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
    { key: 'light_mg', name: 'Light MG' },
    { key: 'heavy_mg', name: 'Heavy MG' },
    { key: 'grenade_launcher', name: 'Grenade Lnchr' },
    { key: 'flame_thrower', name: 'Flame Thrwr' },
    { key: 'at_rifle', name: 'AT Rifle' },
    // Row 2: Mortars & Observation
    { key: 'light_mortar', name: 'Light Mortar' },
    { key: 'heavy_mortar', name: 'Heavy Mortar' },
    { key: 'recoilless_rifle', name: 'Recoilless' },
    { key: 'observation_post', name: 'Obs Post' },
    { key: 'arty_op', name: 'Arty OP' },
    { key: 'at_missile', name: 'ATGM' },
    // Row 3: AT & AA Weapons, Aircraft
    { key: 'at_gun', name: 'AT Gun' },
    { key: 'aa_gun', name: 'AA Gun' },
    { key: 'aa_missile', name: 'SAM' },
    { key: 'fixed_wing', name: 'Fixed Wing' },
    { key: 'attack_helo', name: 'Attack Helo' },
    { key: 'utility_helo', name: 'Utility Helo' },
    // Row 4: Vehicles & Artillery
    { key: 'tank', name: 'Tank' },
    { key: 'armored_vehicle', name: 'APC / IFV' },
    { key: 'howitzer', name: 'Howitzer' },
    { key: 'rocket_arty', name: 'Rocket Arty' },
    { key: 'radar', name: 'Radar' },
    { key: 'aa_radar', name: 'AD Radar' },
    // Row 5: Specialty
    { key: 'sniper', name: 'Sniper' },
    { key: 'mine', name: 'Mine / IED' },
    { key: 'cbrn', name: 'CBRN' },
    { key: 'supply', name: 'Supply Pt' },
    { key: 'command_post', name: 'Cmd Post' },
    { key: 'electronic_warfare', name: 'EW' },
    { key: 'uav', name: 'UAV' },
    { key: 'manpads', name: 'MANPADS' },
    { key: 'at_missile_veh', name: 'ATGM Veh' },
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
