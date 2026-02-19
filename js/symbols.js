/**
 * Simple SITTEMP - Symbol Definitions
 *
 * NATO APP-6 style equipment and unit SVG generators,
 * plus shape / line-type definition lists.
 */

// ===== Equipment Symbol SVGs =====
// NATO APP-6 equipment modifier icons — exact replicas of reference chart
// All symbols use a 350x350 viewBox with parameterized color and stroke width
export function equipmentSVG(key, color, strokeWidth) {
    color = color || '#FF0000';
    strokeWidth = strokeWidth || 2;
    const sw = strokeWidth * (350 / 40);
    const c = color;
    const svgs = {
        // Rifle
        rifle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="175" y1="350" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="75" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="225" y2="75" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Light Machine Gun
        light_machine_gun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="125" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="350" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="175" x2="225" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Medium Machine Gun
        medium_machine_gun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="125" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="350" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="150" x2="225" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="200" x2="225" y2="200" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Heavy Machine Gun
        heavy_machine_gun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="125" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="350" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="175" x2="225" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="125" x2="225" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="225" x2="225" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Grenade Launcher
        grenade_launcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="125" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="350" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <circle cx="175" cy="150" r="56" fill="none" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        // Anti-tank Rocket Launcher
        at_rocket_launcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="125" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="50" x2="125" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="50" x2="225" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="300" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Mortar
        mortar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="125" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <circle cx="175" cy="275" r="56" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="175" y1="220" x2="175" y2="5" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Howitzer
        howitzer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <circle cx="175" cy="305" r="43" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="175" y1="260" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="75" x2="125" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="75" x2="225" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Anti-tank Gun
        at_gun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="175" y1="300" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="75" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="75" x2="125" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="300" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="300" x2="125" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Air Defense Gun
        ad_gun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M125,350 Q175,250 225,350" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="300" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="75" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="75" x2="125" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Multiple Rocket Launcher
        multiple_rocket_launcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="175" y1="350" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="125" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="225" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="50" x2="125" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="50" x2="225" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="300" x2="125" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="150" x2="225" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Short Range Air Defense Missile Launcher
        shorad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M125,50 Q175,0 225,50" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M125,350 Q175,250 225,350" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="25" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="50" x2="125" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="150" x2="225" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Medium Range Air Defense Missile Launcher
        mrad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M125,50 Q175,0 225,50" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M125,350 Q175,250 225,350" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="25" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="50" x2="125" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="200" x2="125" y2="200" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="125" x2="225" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Long Range Air Defense Missile Launcher
        lrad: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M125,50 Q175,0 225,50" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M125,350 Q175,250 225,350" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="25" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="225" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="50" x2="125" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="150" x2="225" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="100" x2="225" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="200" x2="225" y2="200" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Anti-tank Missile Launcher
        at_missile_launcher: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M125,50 Q175,0 225,50" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="350" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="350" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="300" x2="175" y2="25" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="50" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="275" x2="125" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Armored Fighting Vehicle
        afv: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="75" y1="0" x2="75" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="275" y1="0" x2="275" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="75" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="200" x2="175" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="350" x2="275" y2="200" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="275" y1="150" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Armored Personnel Carrier
        apc: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="75" y1="0" x2="75" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="275" y1="0" x2="275" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="325" x2="275" y2="325" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="275" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="75" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Tank
        tank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="75" y1="0" x2="75" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="275" y1="0" x2="275" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="275" y1="75" x2="75" y2="75" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="275" x2="275" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Sensor
        sensor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M175,0 Q175,175 350,175" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M175,0 Q175,175 0,175" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M0,175 Q175,175 175,350" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M175,350 Q175,175 350,175" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Radar
        radar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M25,25 Q0,350 325,325" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="250" x2="175" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="200" x2="175" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="200" x2="250" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Antenna
        antenna: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="175" y1="350" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="100" x2="275" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="100" x2="75" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Helicopter
        helicopter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <polygon points="0,50 0,300 350,50 350,300 0,50" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Unmanned Aircraft
        uav: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <polygon points="0,125 175,175 350,125 175,250 0,125 0,125" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Autonomous Robot
        autonomous_robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <circle cx="25" cy="275" r="25" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
  <circle cx="175" cy="275" r="25" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
  <circle cx="325" cy="275" r="25" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
  <polygon points="25,250 150,175 175,250 200,175 325,250 175,75 25,250 25,250" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Directed Energy
        directed_energy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="125" y1="75" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="0" x2="225" y2="75" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="100" x2="225" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="125" x2="225" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="125" x2="225" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="150" x2="225" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="150" x2="225" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="175" x2="225" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="175" x2="175" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="225" x2="225" y2="250" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="250" x2="225" y2="250" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="250" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="275" x2="225" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="275" x2="225" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="300" x2="225" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="300" x2="175" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="100" x2="175" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Isolated Person
        isolated_person: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="175" y1="100" x2="275" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="100" x2="75" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <circle cx="175" cy="40" r="32" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
  <line x1="175" y1="350" x2="175" y2="75" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="350" x2="250" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Bridge (Vertical)
        bridge_v: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="50" y1="0" x2="100" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="50" x2="100" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="300" x2="50" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="250" y1="50" x2="300" y2="0" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="250" y1="50" x2="250" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="250" y1="300" x2="300" y2="350" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Bridge (Horizontal)
        bridge_h: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="50" y1="100" x2="0" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="50" y1="100" x2="300" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="300" y1="100" x2="350" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="50" y1="250" x2="0" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="50" y1="250" x2="300" y2="250" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="300" y1="250" x2="350" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Observation Post
        observation_post: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="175" y1="75" x2="75" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="275" x2="275" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="75" x2="275" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Reconnaissance Observation Post
        recon_op: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <polygon points="175,50 50,300 300,300 175,50 175,50" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <line x1="50" y1="300" x2="250" y2="200" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Forward Observer
        forward_observer: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <polygon points="175,50 50,300 300,300 175,50 175,50" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <circle cx="175" cy="225" r="35" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        // Sensor Observation Post
        sensor_op: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <polygon points="175,50 50,300 300,300 175,50 175,50" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <path d="M175,175 Q175,225 225,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M175,175 Q175,225 125,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M225,225 Q175,225 175,275" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M175,275 Q175,225 125,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Combat Outpost
        combat_outpost: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="175" y1="75" x2="75" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="275" x2="275" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="75" x2="275" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="200" y1="125" x2="225" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="175" x2="250" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="250" y1="225" x2="275" y2="200" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="150" y1="125" x2="125" y2="100" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="175" x2="100" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="225" x2="75" y2="200" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="275" x2="175" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="275" x2="225" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="300" x2="125" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
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
    // Row 1: Small Arms & Infantry Weapons
    { key: 'rifle', name: 'Rifle' },
    { key: 'light_machine_gun', name: 'LMG' },
    { key: 'medium_machine_gun', name: 'MMG' },
    { key: 'heavy_machine_gun', name: 'HMG' },
    { key: 'grenade_launcher', name: 'Grenade Lnchr' },
    { key: 'at_rocket_launcher', name: 'AT Rocket Lnchr' },
    // Row 2: Indirect Fire
    { key: 'mortar', name: 'Mortar' },
    { key: 'howitzer', name: 'Howitzer' },
    { key: 'at_gun', name: 'AT Gun' },
    { key: 'ad_gun', name: 'AD Gun' },
    { key: 'multiple_rocket_launcher', name: 'MRL' },
    { key: 'directed_energy', name: 'Directed Energy' },
    // Row 3: Air Defense / Missiles
    { key: 'shorad', name: 'SHORAD' },
    { key: 'mrad', name: 'MRAD' },
    { key: 'lrad', name: 'LRAD' },
    { key: 'at_missile_launcher', name: 'AT Missile Lnchr' },
    { key: 'sensor', name: 'Sensor' },
    { key: 'radar', name: 'Radar' },
    // Row 4: Vehicles
    { key: 'afv', name: 'AFV' },
    { key: 'apc', name: 'APC' },
    { key: 'tank', name: 'Tank' },
    { key: 'antenna', name: 'Antenna' },
    { key: 'helicopter', name: 'Helicopter' },
    { key: 'uav', name: 'UAV' },
    // Row 5: Special
    { key: 'autonomous_robot', name: 'Auton Robot' },
    { key: 'isolated_person', name: 'Isolated Person' },
    { key: 'bridge_v', name: 'Bridge (V)' },
    { key: 'bridge_h', name: 'Bridge (H)' },
    { key: 'observation_post', name: 'Obs Post' },
    { key: 'recon_op', name: 'Recon OP' },
    // Row 6: Observation Posts
    { key: 'forward_observer', name: 'Fwd Observer' },
    { key: 'sensor_op', name: 'Sensor OP' },
    { key: 'combat_outpost', name: 'Combat OP' },
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
    { key: 'flot_a', name: 'FLOT' },
    { key: 'low_wire', name: 'Low Wire Fence' },
    { key: 'single_concertina', name: 'Single Concertina' },
    { key: 'triple_concertina', name: 'Triple Concertina' },
    { key: 'atditch_a', name: 'AT Ditch' },
    { key: 'atditch_unfin', name: 'Unfinished AT Ditch' },
    { key: 'ap_mine', name: 'AP Mine' },
    { key: 'at_mine', name: 'AT Mine' },
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
 * Handles both legacy 40x40 viewBox (units) and new 350x350 viewBox (equipment).
 */
export function buildSymbolWithLabels(svgInner, leftText, rightText, color) {
    const totalWidth = 120;
    const totalHeight = 50;

    // Detect viewBox to determine how to scale the inner symbol
    const vbMatch = svgInner.match(/viewBox="0 0 (\d+) (\d+)"/);
    const vbW = vbMatch ? parseInt(vbMatch[1]) : 40;
    const vbH = vbMatch ? parseInt(vbMatch[2]) : 40;

    // Symbol display area: 40x40 centered in the middle of the output SVG
    const symW = 40;
    const symH = 40;
    const symX = 40; // left edge of symbol area
    const symY = 5;  // top edge of symbol area
    const scaleX = symW / vbW;
    const scaleY = symH / vbH;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;

    if (leftText) {
        svg += `<text x="38" y="30" text-anchor="end" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(leftText)}</text>`;
    }

    // Scale the inner SVG content to fit the 40x40 display area
    svg += `<g transform="translate(${symX}, ${symY}) scale(${scaleX}, ${scaleY})">${stripSvgWrapper(svgInner)}</g>`;

    if (rightText) {
        svg += `<text x="82" y="30" text-anchor="start" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(rightText)}</text>`;
    }

    svg += '</svg>';
    return svg;
}

export function getLinePreviewSVG(type) {
    const c = '#ccc';
    switch (type) {
        case 'solid':
            return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2"/></svg>`;
        case 'dashed':
            return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="6,4"/></svg>`;
        case 'dotted':
            return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="2,4"/></svg>`;
        case 'dashdot':
            return `<svg width="40" height="10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2" stroke-dasharray="8,3,2,3"/></svg>`;
        case 'flot_a':
            // Rightward-bulging arc (no base line) — matches original SVG
            return `<svg width="40" height="14"><path d="M5,1 Q15,7 5,13" fill="none" stroke="${c}" stroke-width="1.5"/><path d="M25,1 Q35,7 25,13" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`;
        case 'low_wire':
            // Horizontal line + picket diagonals (triangle/V shape) — matches original SVG
            return `<svg width="40" height="12"><line x1="0" y1="8" x2="40" y2="8" stroke="${c}" stroke-width="1.5"/><line x1="5" y1="8" x2="12" y2="2" stroke="${c}" stroke-width="1.5"/><line x1="5" y1="2" x2="12" y2="8" stroke="${c}" stroke-width="1.5"/><line x1="25" y1="8" x2="32" y2="2" stroke="${c}" stroke-width="1.5"/><line x1="25" y1="2" x2="32" y2="8" stroke="${c}" stroke-width="1.5"/></svg>`;
        case 'single_concertina':
            // Overlapping circles (coils) on a base line
            return `<svg width="40" height="14"><line x1="0" y1="10" x2="40" y2="10" stroke="${c}" stroke-width="1.5"/><circle cx="5" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="13" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="21" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="29" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="37" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.2"/></svg>`;
        case 'triple_concertina':
            // Overlapping circles (coils) between two parallel lines
            return `<svg width="40" height="14"><line x1="0" y1="1" x2="40" y2="1" stroke="${c}" stroke-width="1.5"/><line x1="0" y1="13" x2="40" y2="13" stroke="${c}" stroke-width="1.5"/><circle cx="5" cy="7" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="13" cy="7" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="21" cy="7" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="29" cy="7" r="5" fill="none" stroke="${c}" stroke-width="1.2"/><circle cx="37" cy="7" r="5" fill="none" stroke="${c}" stroke-width="1.2"/></svg>`;
        case 'atditch_a':
            // Rightward-pointing filled triangle (no base line) — matches original SVG
            return `<svg width="40" height="14"><polygon points="5,1 5,13 15,7" fill="${c}" stroke="${c}" stroke-width="1"/><polygon points="25,1 25,13 35,7" fill="${c}" stroke="${c}" stroke-width="1"/></svg>`;
        case 'atditch_unfin':
            // Rightward-pointing unfilled triangle (no base line) — matches original SVG
            return `<svg width="40" height="14"><polygon points="5,1 5,13 15,7" fill="none" stroke="${c}" stroke-width="1.5"/><polygon points="25,1 25,13 35,7" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`;
        case 'ap_mine':
            // Filled circle + chevron diagonals from right — matches original SVG
            return `<svg width="40" height="14"><circle cx="10" cy="7" r="5" fill="${c}"/><line x1="17" y1="2" x2="10" y2="7" stroke="${c}" stroke-width="2"/><line x1="17" y1="12" x2="10" y2="7" stroke="${c}" stroke-width="2"/><circle cx="30" cy="7" r="5" fill="${c}"/><line x1="37" y1="2" x2="30" y2="7" stroke="${c}" stroke-width="2"/><line x1="37" y1="12" x2="30" y2="7" stroke="${c}" stroke-width="2"/></svg>`;
        case 'at_mine':
            // Filled circle between two horizontal lines — matches original SVG
            return `<svg width="40" height="14"><line x1="0" y1="2" x2="40" y2="2" stroke="${c}" stroke-width="1.5"/><line x1="0" y1="12" x2="40" y2="12" stroke="${c}" stroke-width="1.5"/><circle cx="10" cy="7" r="4" fill="${c}"/><circle cx="30" cy="7" r="4" fill="${c}"/></svg>`;
        default: return '';
    }
}
