/**
 * Simple SITTEMP - Symbol Definitions
 *
 * NATO APP-6 style equipment and unit SVG generators,
 * plus shape / line-type definition lists.
 */

// ===== Equipment Symbol SVGs =====
// NATO APP-6 style equipment symbols rendered as simple SVGs
// All hostile equipment uses an upward-pointing triangle frame
export function equipmentSVG(key, color) {
    color = color || '#FF0000';
    // Standard hostile triangle frame: vertex at top, base at bottom
    const tri = `<polygon points="20,2 38,38 2,38" fill="none" stroke="${color}" stroke-width="2.5"/>`;
    const svgs = {
        // --- Row 1: Small Arms ---
        // Rifle: diagonal line (barrel) with short perpendicular stock at upper-right end
        rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="12" y1="30" x2="28" y2="14" stroke="${color}" stroke-width="2"/>
            <line x1="25" y1="11" x2="31" y2="17" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Light MG: X-cross (two diagonal lines) with small open circle at center
        light_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="11" y1="30" x2="29" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="11" y1="12" x2="29" y2="30" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="21" r="2.5" fill="none" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // Heavy MG: X-cross with filled square at center
        heavy_mg: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="11" y1="30" x2="29" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="11" y1="12" x2="29" y2="30" stroke="${color}" stroke-width="2"/>
            <rect x="16.5" y="17.5" width="7" height="7" fill="${color}"/>
        </svg>`,
        // Grenade Launcher: vertical line (tube) with short horizontal crossbar at top
        grenade_launcher: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="12" x2="20" y2="32" stroke="${color}" stroke-width="2"/>
            <line x1="15" y1="12" x2="25" y2="12" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Flame Thrower: vertical line with flame-like curves at top
        flame_thrower: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="32" x2="20" y2="18" stroke="${color}" stroke-width="2"/>
            <path d="M16 18 Q16 10 20 8 Q24 10 24 18" fill="none" stroke="${color}" stroke-width="1.8"/>
            <path d="M18 16 Q18 12 20 11 Q22 12 22 16" fill="none" stroke="${color}" stroke-width="1.2"/>
        </svg>`,
        // AT Rifle: rifle symbol with horizontal crossbar (recoilless indicator)
        at_rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="12" y1="30" x2="28" y2="14" stroke="${color}" stroke-width="2"/>
            <line x1="25" y1="11" x2="31" y2="17" stroke="${color}" stroke-width="2"/>
            <line x1="13" y1="32" x2="27" y2="32" stroke="${color}" stroke-width="2"/>
        </svg>`,

        // --- Row 2: Mortars & Observation ---
        // Light Mortar: vertical tube line with open circle at base
        light_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="11" x2="20" y2="26" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="30" r="4" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Heavy Mortar: vertical tube line with filled circle at base
        heavy_mortar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="11" x2="20" y2="26" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="30" r="4" fill="${color}"/>
        </svg>`,
        // Recoilless Rifle: rifle diagonal with open circle at breech end (lower-left)
        recoilless_rifle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="12" y1="30" x2="28" y2="14" stroke="${color}" stroke-width="2"/>
            <circle cx="12" cy="30" r="3" fill="none" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // Observation Post: "OP" text centered in triangle
        observation_post: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <text x="20" y="29" text-anchor="middle" fill="${color}" font-size="14" font-weight="bold" font-family="Arial,sans-serif">OP</text>
        </svg>`,
        // Artillery OP: open circle (target) with vertical line extending above it
        arty_op: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <circle cx="20" cy="24" r="5" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="12" x2="20" y2="19" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // ATGM (Anti-Tank Guided Missile): "ATGM" text in triangle
        at_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <text x="20" y="29" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold" font-family="Arial,sans-serif">ATGM</text>
        </svg>`,

        // --- Row 3: AT & AA Weapons, Aircraft ---
        // Anti-Tank Gun: diagonal barrel with small filled circle at breech
        at_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="12" y1="30" x2="28" y2="14" stroke="${color}" stroke-width="2.5"/>
            <circle cx="12" cy="30" r="2.5" fill="${color}"/>
        </svg>`,
        // AA Gun: "AA" text with horizontal line below (air defense indicator)
        aa_gun: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <text x="20" y="25" text-anchor="middle" fill="${color}" font-size="12" font-weight="bold" font-family="Arial,sans-serif">AA</text>
            <line x1="12" y1="30" x2="28" y2="30" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // SAM (Surface-to-Air Missile): "SAM" text with horizontal line below
        aa_missile: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <text x="20" y="25" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold" font-family="Arial,sans-serif">SAM</text>
            <line x1="12" y1="30" x2="28" y2="30" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Fixed Wing: fuselage (vertical line), wings (horizontal line), tail (shorter horizontal)
        fixed_wing: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="10" x2="20" y2="32" stroke="${color}" stroke-width="2"/>
            <line x1="10" y1="20" x2="30" y2="20" stroke="${color}" stroke-width="2"/>
            <line x1="15" y1="29" x2="25" y2="29" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // Attack Helicopter: rotor (horizontal line), mast (short vertical), fuselage (ellipse), weapon stubs
        attack_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="10" y1="14" x2="30" y2="14" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="14" x2="20" y2="18" stroke="${color}" stroke-width="2"/>
            <ellipse cx="20" cy="23" rx="8" ry="5" fill="none" stroke="${color}" stroke-width="1.5"/>
            <line x1="12" y1="22" x2="9" y2="22" stroke="${color}" stroke-width="1.5"/>
            <line x1="28" y1="22" x2="31" y2="22" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // Utility Helicopter: rotor (horizontal line), mast, fuselage (ellipse) — no weapon stubs
        utility_helo: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="10" y1="14" x2="30" y2="14" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="14" x2="20" y2="18" stroke="${color}" stroke-width="2"/>
            <ellipse cx="20" cy="23" rx="8" ry="5" fill="none" stroke="${color}" stroke-width="1.5"/>
        </svg>`,

        // --- Row 4: Vehicles & Artillery ---
        // Tank: track ellipse with gun barrel (vertical line) extending upward
        tank: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <ellipse cx="20" cy="25" rx="10" ry="5" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="20" x2="20" y2="12" stroke="${color}" stroke-width="2.5"/>
        </svg>`,
        // APC/IFV (Armored Vehicle): track ellipse only, no gun barrel
        armored_vehicle: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <ellipse cx="20" cy="25" rx="10" ry="5" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Howitzer/Field Artillery: filled circle (artillery dot)
        howitzer: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <circle cx="20" cy="24" r="6" fill="${color}"/>
        </svg>`,
        // Rocket Artillery / MRL: three upward-pointing arrow lines
        rocket_arty: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="14" y1="32" x2="14" y2="16" stroke="${color}" stroke-width="1.8"/>
            <line x1="14" y1="16" x2="11" y2="20" stroke="${color}" stroke-width="1.5"/>
            <line x1="14" y1="16" x2="17" y2="20" stroke="${color}" stroke-width="1.5"/>
            <line x1="20" y1="32" x2="20" y2="12" stroke="${color}" stroke-width="1.8"/>
            <line x1="20" y1="12" x2="17" y2="16" stroke="${color}" stroke-width="1.5"/>
            <line x1="20" y1="12" x2="23" y2="16" stroke="${color}" stroke-width="1.5"/>
            <line x1="26" y1="32" x2="26" y2="16" stroke="${color}" stroke-width="1.8"/>
            <line x1="26" y1="16" x2="23" y2="20" stroke="${color}" stroke-width="1.5"/>
            <line x1="26" y1="16" x2="29" y2="20" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // Radar: parabolic dish curve with small filled circle (emitter)
        radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <path d="M12 30 Q20 10 28 30" fill="none" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="24" r="2.5" fill="${color}"/>
        </svg>`,
        // AA Radar: radar dish + horizontal air-defense line below
        aa_radar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <path d="M12 27 Q20 10 28 27" fill="none" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="22" r="2.5" fill="${color}"/>
            <line x1="12" y1="32" x2="28" y2="32" stroke="${color}" stroke-width="2"/>
        </svg>`,

        // --- Row 5: Specialty ---
        // Sniper: crosshair (vertical + horizontal lines forming a cross) with circle
        sniper: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <circle cx="20" cy="22" r="6" fill="none" stroke="${color}" stroke-width="1.5"/>
            <line x1="20" y1="13" x2="20" y2="31" stroke="${color}" stroke-width="1.5"/>
            <line x1="11" y1="22" x2="29" y2="22" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // Mine/IED: "M" centered in a small diamond inside the triangle
        mine: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <polygon points="20,12 28,22 20,32 12,22" fill="none" stroke="${color}" stroke-width="1.5"/>
            <text x="20" y="26" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold" font-family="Arial,sans-serif">M</text>
        </svg>`,
        // CBRN/Chemical: inverted "Y" shape (NBC trefoil simplified)
        cbrn: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="22" x2="20" y2="32" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="22" x2="12" y2="13" stroke="${color}" stroke-width="2"/>
            <line x1="20" y1="22" x2="28" y2="13" stroke="${color}" stroke-width="2"/>
            <circle cx="20" cy="22" r="2" fill="${color}"/>
        </svg>`,
        // Supply Point: open circle with horizontal line through center
        supply: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <circle cx="20" cy="23" r="7" fill="none" stroke="${color}" stroke-width="2"/>
            <line x1="13" y1="23" x2="27" y2="23" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // Command Post: flag shape (small rectangle on a vertical pole)
        command_post: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="15" y1="32" x2="15" y2="12" stroke="${color}" stroke-width="2"/>
            <rect x="15" y="12" width="12" height="8" fill="none" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // Electronic Warfare: lightning bolt / zigzag pattern
        electronic_warfare: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <path d="M12 28 L16 14 L20 24 L24 14 L28 28" fill="none" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // UAV/Drone: simplified fixed-wing silhouette, smaller and without tail
        uav: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="14" x2="20" y2="30" stroke="${color}" stroke-width="1.5"/>
            <line x1="11" y1="22" x2="29" y2="22" stroke="${color}" stroke-width="1.5"/>
            <path d="M18 14 L20 10 L22 14" fill="none" stroke="${color}" stroke-width="1.5"/>
        </svg>`,
        // MANPADS (Man-Portable Air-Defense System): single upward arrow with horizontal air-defense line
        manpads: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <line x1="20" y1="12" x2="20" y2="28" stroke="${color}" stroke-width="2"/>
            <line x1="16" y1="16" x2="20" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="24" y1="16" x2="20" y2="12" stroke="${color}" stroke-width="2"/>
            <line x1="12" y1="32" x2="28" y2="32" stroke="${color}" stroke-width="2"/>
        </svg>`,
        // ATGM Vehicle: ATGM text with track ellipse
        at_missile_veh: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            ${tri}
            <ellipse cx="20" cy="27" rx="9" ry="4" fill="none" stroke="${color}" stroke-width="1.5"/>
            <text x="20" y="20" text-anchor="middle" fill="${color}" font-size="8" font-weight="bold" font-family="Arial,sans-serif">ATGM</text>
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
