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
        // Tracked Radar — radar dish on tracked vehicle chassis
        tracked_radar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M50,25 Q0,300 275,250" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="200" x2="150" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="150" y1="150" x2="175" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="175" x2="250" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M75,275 Q25,300 75,325" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M225,275 Q275,300 225,325" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="275" x2="75" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="325" x2="75" y2="325" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Wheeled Radar — radar dish on wheeled vehicle chassis
        wheeled_radar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <circle cx="75" cy="300" r="25" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <circle cx="175" cy="300" r="25" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <circle cx="275" cy="300" r="25" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <path d="M50,25 Q0,300 275,250" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="200" x2="150" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="150" y1="150" x2="175" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="175" x2="250" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
    };
    return svgs[key] || svgs.rifle;
}

// ===== Unit Symbol SVGs =====
// NATO friendly rectangle frame with unit type modifier inside
// All symbols use a 350x350 viewBox matching the equipment symbol format
export function unitSVG(key, color, strokeWidth) {
    color = color || '#0000FF';
    strokeWidth = strokeWidth || 2;
    const c = color;
    const sw = strokeWidth * (350 / 40);
    const svgs = {
        // Aviation
        aviation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <polygon points="50,100 50,250 300,100 300,250 50,100" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Infantry
        infantry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="0" y1="300" x2="350" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="0" y1="50" x2="350" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Armor
        armor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <path d="M250,125 Q325,175 250,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M100,125 Q25,175 100,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="125" x2="250" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="225" x2="250" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Combined Arms
        combined_arms: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <path d="M250,125 Q325,175 250,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M100,125 Q25,175 100,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="125" x2="250" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="225" x2="250" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="125" x2="250" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="250" y1="125" x2="100" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Artillery
        artillery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <circle cx="175" cy="175" r="56" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        // Engineer
        engineers: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="75" y1="125" x2="75" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="125" x2="175" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="275" y1="125" x2="275" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="275" y1="125" x2="75" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // MI
        military_intel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="150" y1="225" x2="150" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="150" y1="125" x2="100" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="225" x2="50" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="50" y1="125" x2="50" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="225" x2="300" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="125" x2="300" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="265" y1="225" x2="265" y2="130" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // MP
        military_police: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="150" y1="225" x2="150" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="150" y1="125" x2="100" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="100" y1="225" x2="50" y2="125" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="50" y1="125" x2="50" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="125" x2="225" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <circle cx="250" cy="150" r="25" fill="none" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        // Cavalry
        cavalry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="0" y1="300" x2="350" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Signal
        signal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="175" y1="200" x2="175" y2="150" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="150" x2="350" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="200" x2="0" y2="50" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Air Defense
        air_defense: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <path d="M0,300 Q175,175 350,300" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // EW Jamming
        ew_jamming: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <path d="M0,100 Q25,50 50,100" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M50,100 Q75,150 100,100" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M100,100 Q125,50 150,100" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M150,100 Q175,150 200,100" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M200,100 Q225,50 250,100" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M250,100 Q275,150 300,100" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M300,100 Q325,50 350,100" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M0,125 Q25,75 50,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M50,125 Q75,175 100,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M100,125 Q125,75 150,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M150,125 Q175,175 200,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M200,125 Q225,75 250,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M250,125 Q275,175 300,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M300,125 Q325,75 350,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="175" x2="75" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="175" x2="75" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="75" y1="275" x2="125" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="125" y1="225" x2="75" y2="225" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="175" x2="200" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="200" y1="275" x2="225" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="175" x2="250" y2="275" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="250" y1="275" x2="275" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // CBRN
        cbrn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <path d="M100,275 Q100,125 250,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M250,275 Q250,125 100,125" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <circle cx="250" cy="140" r="16" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
  <circle cx="100" cy="140" r="14" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        // Medical
        medical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <polygon points="150,100 200,100 200,150 250,150 250,200 200,200 200,250 150,250 150,200 100,200 100,150 150,150 150,100" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Anti-Tank
        anti_tank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <rect x="0" y="50" width="350" height="250" fill="none" stroke="${c}" stroke-width="${sw}"/>
  <line x1="175" y1="50" x2="0" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="50" x2="350" y2="300" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
    };
    return svgs[key] || svgs.infantry;
}

// ===== Enemy Unit Symbol SVGs =====
// NATO enemy diamond frame with unit type modifier inside
// All symbols use a 350x350 viewBox matching the equipment/unit symbol format
export function enemyUnitSVG(key, color, strokeWidth) {
    color = color || '#FF0000';
    strokeWidth = strokeWidth || 2;
    const c = color;
    const sw = strokeWidth * (350 / 40);
    // Diamond frame: points at top-center, right-center, bottom-center, left-center
    const diamond = `<polygon points="175,10 340,175 175,340 10,175" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    const svgs = {
        aviation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <polygon points="80,130 80,220 270,130 270,220 80,130" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        infantry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <line x1="80" y1="270" x2="270" y2="80" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="80" y1="80" x2="270" y2="270" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        armor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <path d="M230,135 Q290,175 230,215" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M120,135 Q60,175 120,215" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="135" x2="230" y2="135" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="215" x2="230" y2="215" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        combined_arms: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <path d="M230,135 Q290,175 230,215" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M120,135 Q60,175 120,215" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="135" x2="230" y2="135" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="215" x2="230" y2="215" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="135" x2="230" y2="215" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="230" y1="135" x2="120" y2="215" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        artillery: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <circle cx="175" cy="175" r="45" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        engineers: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <line x1="110" y1="140" x2="110" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="140" x2="175" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="240" y1="140" x2="240" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="240" y1="140" x2="110" y2="140" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        military_intel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <line x1="155" y1="210" x2="155" y2="140" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="155" y1="140" x2="120" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="210" x2="85" y2="140" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="85" y1="140" x2="85" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="210" y1="210" x2="265" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="210" y1="140" x2="265" y2="140" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="238" y1="210" x2="238" y2="145" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        military_police: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <line x1="155" y1="210" x2="155" y2="140" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="155" y1="140" x2="120" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="210" x2="85" y2="140" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="85" y1="140" x2="85" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="210" y1="140" x2="210" y2="210" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <circle cx="235" cy="160" r="20" fill="none" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        cavalry: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <line x1="80" y1="270" x2="270" y2="80" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        signal: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <line x1="175" y1="195" x2="175" y2="155" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="155" x2="270" y2="270" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="195" x2="80" y2="80" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        air_defense: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <path d="M80,260 Q175,175 270,260" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        ew_jamming: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <path d="M80,120 Q95,90 110,120" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M110,120 Q125,150 140,120" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M140,120 Q155,90 170,120" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M170,120 Q185,150 200,120" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M200,120 Q215,90 230,120" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M230,120 Q245,150 260,120" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        cbrn: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <path d="M120,240 Q120,130 220,130" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M220,240 Q220,130 120,130" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <circle cx="220" cy="140" r="12" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
  <circle cx="120" cy="140" r="12" fill="${c}" stroke="${c}" stroke-width="${sw}"/>
</svg>`,
        medical: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <polygon points="160,120 190,120 190,150 220,150 220,200 190,200 190,230 160,230 160,200 130,200 130,150 160,150 160,120" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Anti-Tank
        anti_tank: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  ${diamond}
  <line x1="175" y1="80" x2="80" y2="270" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="175" y1="80" x2="270" y2="270" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
    };
    return svgs[key] || svgs.infantry;
}

// ===== Tactical Task Symbol SVGs =====
// NATO APP-6 tactical mission task graphics
// All symbols use a 350x350 viewBox with parameterized color and stroke width
export function tacticalTaskSVG(key, color, strokeWidth) {
    color = color || '#000000';
    strokeWidth = strokeWidth || 2;
    const sw = strokeWidth * (350 / 40);
    const c = color;
    const svgs = {
        // Delay — FM 3-90 Table 8-2 (Retrograde task symbols): arrow with D on shaft,
        // hook curve at tail (mirrored to point right per this app's rotation convention)
        delay: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M100,90 Q58,175 100,260" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="110" y1="175" x2="265" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="150" y="155" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="${c}" text-anchor="middle">D</text>
  <polygon points="265,175 215,140 215,210" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Seize — FM 3-90 Fig B-26: hooked/curved arrow with S on shaft, pointing at objective
        seize: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M50,110 C130,90 210,105 250,165" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="150" y="105" font-family="Arial,sans-serif" font-size="75" font-weight="bold" fill="${c}" text-anchor="middle">S</text>
  <polygon points="250,165 225,115 195,155" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Fix — FM 3-90 Fig B-16: line, F, zigzag ("broken" part of arrow), arrowhead
        fix: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="25" y1="175" x2="120" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="140" y="200" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="${c}" text-anchor="middle">F</text>
  <path d="M160,175 L180,140 L200,210 L220,140 L240,175" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="240" y1="175" x2="270" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="270,175 235,150 235,200" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Disrupt — FM 3-90 Fig B-13: vertical bar with three staggered arrows (D on center arrow)
        disrupt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="25" y1="175" x2="70" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="70" y1="105" x2="70" y2="245" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="70" y1="105" x2="280" y2="105" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="280,105 250,85 250,125" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <line x1="70" y1="175" x2="220" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="220,175 190,155 190,195" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <text x="130" y="160" font-family="Arial,sans-serif" font-size="70" font-weight="bold" fill="${c}" text-anchor="middle">D</text>
  <line x1="70" y1="245" x2="190" y2="245" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="190,245 160,225 160,265" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Block — FM 3-90 Fig B-2: line, B, perpendicular bar, arrowhead
        block: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="25" y1="175" x2="110" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="130" y="200" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="${c}" text-anchor="middle">B</text>
  <line x1="150" y1="175" x2="215" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="225" y1="95" x2="225" y2="255" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="225,150 290,175 225,200" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Attack by Fire — FM 3-90 Fig B-1: bracket-hook tail, straight arrow, no letter, no bar
        attack_by_fire: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M65,105 L105,150 L105,200 L65,245" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="105" y1="175" x2="265" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="265,175 215,140 215,210" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Breach — FM 3-90 Fig B-4: two parallel arms flanking the breach, each ending in an
        // outward arrowhead tick, joined by a vertical tail line, B near the tail
        breach: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <text x="40" y="200" font-family="Arial,sans-serif" font-size="70" font-weight="bold" fill="${c}" text-anchor="middle">B</text>
  <line x1="70" y1="110" x2="70" y2="250" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="70" y1="110" x2="260" y2="110" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="260" y1="110" x2="295" y2="80" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="70" y1="250" x2="260" y2="250" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="260" y1="250" x2="295" y2="280" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
</svg>`,
        // Clear — FM 3-90 Fig B-8: C on tail, three parallel arrows converging on a vertical bar
        clear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="25" y1="175" x2="60" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="90" y="200" font-family="Arial,sans-serif" font-size="70" font-weight="bold" fill="${c}" text-anchor="middle">C</text>
  <line x1="60" y1="110" x2="60" y2="240" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="60" y1="110" x2="270" y2="110" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="120" y1="175" x2="270" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="60" y1="240" x2="270" y2="240" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="280" y1="90" x2="280" y2="260" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="270,90 285,110 270,130" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <polygon points="270,155 285,175 270,195" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <polygon points="270,220 285,240 270,260" fill="${c}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
</svg>`,
        // Destroy — FM 3-90 Fig B-11: plain crossed X with D at center, no shaft
        destroy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="90" y1="90" x2="260" y2="260" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="260" y1="90" x2="90" y2="260" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="175" y="200" font-family="Arial,sans-serif" font-size="75" font-weight="bold" fill="${c}" text-anchor="middle">D</text>
</svg>`,
        // Follow and Assume — FM 3-90 Fig B-18: unit-box tail, dashed line, open double-chevron arrowhead
        follow_and_assume: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M55,130 L160,130 L200,175 L160,220 L55,220 Z" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <line x1="200" y1="175" x2="245" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${sw * 2.2} ${sw * 1.8}"/>
  <path d="M240,145 L275,175 L240,205" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M265,145 L300,175 L265,205" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
        // Follow and Support — FM 3-90 Fig B-19: unit-box tail, solid line, open single-chevron arrowhead
        follow_and_support: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M55,130 L160,130 L200,175 L160,220 L55,220 Z" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>
  <line x1="200" y1="175" x2="255" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M250,140 L295,175 L250,210" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
        // Isolate — FM 3-90 Fig B-21: circle of tangential arrowhead barbs around the enemy, with a gap
        isolate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M175,65 A110,110 0 1,1 172,65.01" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="175,65 195,80 165,90" fill="${c}"/>
  <polygon points="259,99 275,120 245,115" fill="${c}"/>
  <polygon points="285,175 275,205 255,180" fill="${c}"/>
  <polygon points="175,285 155,270 185,260" fill="${c}"/>
  <polygon points="91,251 75,230 105,235" fill="${c}"/>
</svg>`,
        // Neutralize — FM 3-90 Fig B-22: horizontal line with N, one diagonal dashed line crossing
        neutralize: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <line x1="60" y1="175" x2="160" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <text x="185" y="200" font-family="Arial,sans-serif" font-size="80" font-weight="bold" fill="${c}" text-anchor="middle">N</text>
  <line x1="210" y1="175" x2="290" y2="175" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <line x1="115" y1="270" x2="235" y2="80" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${sw * 1.8} ${sw * 1.5}"/>
</svg>`,
        // Occupy — FM 3-90 Fig B-23: area corner bracket with a stylized cursive-O loop and arrowhead
        occupy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M60,60 L60,290 M60,60 L300,60" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <path d="M225,150 A65,65 0 1,0 130,225" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="130,225 100,222 122,198" fill="${c}"/>
</svg>`,
        // Secure — FM 3-90 Fig B-25: near-full circle with a small arrowhead break, S beside it
        secure: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">
  <path d="M120,90 A100,100 0 1,1 95,240" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>
  <polygon points="95,240 65,232 90,208" fill="${c}"/>
  <text x="255" y="185" font-family="Arial,sans-serif" font-size="75" font-weight="bold" fill="${c}" text-anchor="middle">S</text>
</svg>`,
    };
    return svgs[key] || svgs.delay;
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
    { key: 'tracked_radar', name: 'Tracked Radar' },
    { key: 'wheeled_radar', name: 'Wheeled Radar' },
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
    { key: 'bridge_v', name: 'Bridge' },
    { key: 'observation_post', name: 'Obs Post' },
    { key: 'recon_op', name: 'Recon OP' },
    // Row 6: Observation Posts
    { key: 'forward_observer', name: 'Fwd Observer' },
    { key: 'sensor_op', name: 'Sensor OP' },
    { key: 'combat_outpost', name: 'Combat OP' },
];

export const UNIT_LIST = [
    { key: 'aviation', name: 'Aviation' },
    { key: 'infantry', name: 'Infantry' },
    { key: 'armor', name: 'Armor' },
    { key: 'combined_arms', name: 'Combined Arms' },
    { key: 'artillery', name: 'Artillery' },
    { key: 'engineers', name: 'Engineers' },
    { key: 'military_intel', name: 'MI' },
    { key: 'military_police', name: 'MP' },
    { key: 'cavalry', name: 'Cavalry' },
    { key: 'signal', name: 'Signal' },
    { key: 'air_defense', name: 'Air Defense' },
    { key: 'ew_jamming', name: 'EW Jamming' },
    { key: 'cbrn', name: 'CBRN' },
    { key: 'medical', name: 'Medical' },
    { key: 'anti_tank', name: 'Anti-Tank' },
];

export const ENEMY_UNIT_LIST = [
    { key: 'aviation', name: 'Aviation' },
    { key: 'infantry', name: 'Infantry' },
    { key: 'armor', name: 'Armor' },
    { key: 'combined_arms', name: 'Combined Arms' },
    { key: 'artillery', name: 'Artillery' },
    { key: 'engineers', name: 'Engineers' },
    { key: 'military_intel', name: 'MI' },
    { key: 'military_police', name: 'MP' },
    { key: 'cavalry', name: 'Cavalry' },
    { key: 'signal', name: 'Signal' },
    { key: 'air_defense', name: 'Air Defense' },
    { key: 'ew_jamming', name: 'EW Jamming' },
    { key: 'cbrn', name: 'CBRN' },
    { key: 'medical', name: 'Medical' },
    { key: 'anti_tank', name: 'Anti-Tank' },
];

export const TACTICAL_TASK_LIST = [
    { key: 'fix', name: 'Fix' },
    { key: 'disrupt', name: 'Disrupt' },
    { key: 'block', name: 'Block' },
    { key: 'delay', name: 'Delay' },
    { key: 'isolate', name: 'Isolate' },
    { key: 'neutralize', name: 'Neutralize' },
    { key: 'occupy', name: 'Occupy' },
    { key: 'secure', name: 'Secure' },
    { key: 'seize', name: 'Seize' },
    { key: 'attack_by_fire', name: 'ABF' },
    { key: 'breach', name: 'Breach' },
    { key: 'clear', name: 'Clear' },
    { key: 'destroy', name: 'Destroy' },
    { key: 'follow_and_assume', name: 'Follow & Assume' },
    { key: 'follow_and_support', name: 'Follow & Support' },
];

export const SHAPE_LIST = [
    { key: 'circle', name: 'Circle', icon: '<circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'rectangle', name: 'Rectangle', icon: '<rect x="3" y="6" width="22" height="16" fill="none" stroke="currentColor" stroke-width="2" rx="1"/>' },
    { key: 'polygon', name: 'Polygon', icon: '<polygon points="14,2 26,10 22,26 6,26 2,10" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'linestring', name: 'Line', icon: '<line x1="3" y1="25" x2="25" y2="3" stroke="currentColor" stroke-width="2"/>' },
    { key: 'freehand', name: 'Freehand', icon: '<path d="M3 20 Q8 5 14 15 T25 8" fill="none" stroke="currentColor" stroke-width="2"/>' },
    { key: 'star', name: 'Star', icon: '<polygon points="14,2 17,11 27,11 19,17 22,26 14,21 6,26 9,17 1,11 11,11" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
];

export const LINE_TYPES = [
    { key: 'solid', name: 'Solid' },
    { key: 'dashed', name: 'Dashed' },
    { key: 'dotted', name: 'Dotted' },
    { key: 'dashdot', name: 'Dash-Dot' },
    { key: 'flot_a', name: 'FLOT' },
    { key: 'low_wire', name: 'Low Wire' },
    { key: 'single_concertina', name: '1x Conc.' },
    { key: 'arrow', name: 'Arrow' },
    { key: 'atditch_a', name: 'AT Ditch' },
    { key: 'atditch_unfin', name: 'AT Unfin.' },
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

// NATO echelon definitions: marks drawn above the unit frame
export const ECHELON_LIST = [
    { key: 'none', name: 'None' },
    { key: 'platoon', name: 'Platoon (●●●)' },
    { key: 'company', name: 'Company (|)' },
    { key: 'battalion', name: 'Battalion (||)' },
    { key: 'regiment', name: 'Regiment (|||)' },
    { key: 'brigade', name: 'Brigade (X)' },
    { key: 'division', name: 'Division (XX)' },
    { key: 'corps', name: 'Corps (XXX)' },
];

/**
 * Build an SVG that includes the symbol + optional left/right text labels + echelon marks.
 * Handles both legacy 40x40 viewBox (units) and new 350x350 viewBox (equipment).
 */
export function buildSymbolWithLabels(svgInner, leftText, rightText, color, rotation, echelon) {
    const totalWidth = 150;
    const echelonH = (echelon && echelon !== 'none') ? 14 : 0;
    const totalHeight = 50 + echelonH;
    rotation = rotation || 0;

    // Detect viewBox to determine how to scale the inner symbol
    const vbMatch = svgInner.match(/viewBox="0 0 (\d+) (\d+)"/);
    const vbW = vbMatch ? parseInt(vbMatch[1]) : 40;
    const vbH = vbMatch ? parseInt(vbMatch[2]) : 40;

    // Symbol display area: 40x40 centered in the middle of the output SVG
    const symW = 40;
    const symH = 40;
    const symX = 55; // left edge of symbol area
    const symY = 5 + echelonH;  // top edge of symbol area (shifted down if echelon present)
    const scaleX = symW / vbW;
    const scaleY = symH / vbH;

    // Center of the symbol area (for rotation pivot)
    const symCX = symX + symW / 2; // 75
    const symCY = symY + symH / 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;

    // Draw echelon marks above the symbol
    if (echelon && echelon !== 'none') {
        svg += buildEchelonMarks(echelon, symCX, symY - 2, color);
    }

    if (leftText) {
        svg += `<text x="53" y="${symY + 40}" text-anchor="end" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(leftText)}</text>`;
    }

    // Scale the inner SVG content to fit the 40x40 display area, with optional rotation
    if (rotation !== 0) {
        svg += `<g transform="rotate(${rotation}, ${symCX}, ${symCY}) translate(${symX}, ${symY}) scale(${scaleX}, ${scaleY})">${stripSvgWrapper(svgInner)}</g>`;
    } else {
        svg += `<g transform="translate(${symX}, ${symY}) scale(${scaleX}, ${scaleY})">${stripSvgWrapper(svgInner)}</g>`;
    }

    if (rightText) {
        svg += `<text x="97" y="${symY + 40}" text-anchor="start" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(rightText)}</text>`;
    }

    svg += '</svg>';
    return svg;
}

function buildEchelonMarks(echelon, cx, baseY, color) {
    let marks = '';
    const sw = 1.5;
    switch (echelon) {
        case 'platoon': // three dots
            marks += `<circle cx="${cx - 8}" cy="${baseY - 5}" r="2" fill="${color}"/>`;
            marks += `<circle cx="${cx}" cy="${baseY - 5}" r="2" fill="${color}"/>`;
            marks += `<circle cx="${cx + 8}" cy="${baseY - 5}" r="2" fill="${color}"/>`;
            break;
        case 'company': // one vertical line
            marks += `<line x1="${cx}" y1="${baseY - 1}" x2="${cx}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            break;
        case 'battalion': // two vertical lines
            marks += `<line x1="${cx - 4}" y1="${baseY - 1}" x2="${cx - 4}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 4}" y1="${baseY - 1}" x2="${cx + 4}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            break;
        case 'regiment': // three vertical lines
            marks += `<line x1="${cx - 6}" y1="${baseY - 1}" x2="${cx - 6}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx}" y1="${baseY - 1}" x2="${cx}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 6}" y1="${baseY - 1}" x2="${cx + 6}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            break;
        case 'brigade': // one X
            marks += `<line x1="${cx - 5}" y1="${baseY - 1}" x2="${cx + 5}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 5}" y1="${baseY - 1}" x2="${cx - 5}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            break;
        case 'division': // two X's
            marks += `<line x1="${cx - 10}" y1="${baseY - 1}" x2="${cx - 2}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx - 2}" y1="${baseY - 1}" x2="${cx - 10}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 2}" y1="${baseY - 1}" x2="${cx + 10}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 10}" y1="${baseY - 1}" x2="${cx + 2}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            break;
        case 'corps': // three X's
            marks += `<line x1="${cx - 15}" y1="${baseY - 1}" x2="${cx - 7}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx - 7}" y1="${baseY - 1}" x2="${cx - 15}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx - 4}" y1="${baseY - 1}" x2="${cx + 4}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 4}" y1="${baseY - 1}" x2="${cx - 4}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 7}" y1="${baseY - 1}" x2="${cx + 15}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx + 15}" y1="${baseY - 1}" x2="${cx + 7}" y2="${baseY - 11}" stroke="${color}" stroke-width="${sw}"/>`;
            break;
    }
    return marks;
}

export function getLinePreviewSVG(type) {
    const c = '#ccc';
    const w = 20, vb = '0 0 40';
    switch (type) {
        case 'solid':
            return `<svg width="${w}" height="8" viewBox="${vb} 10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2.5"/></svg>`;
        case 'dashed':
            return `<svg width="${w}" height="8" viewBox="${vb} 10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2.5" stroke-dasharray="6,4"/></svg>`;
        case 'dotted':
            return `<svg width="${w}" height="8" viewBox="${vb} 10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2.5" stroke-dasharray="2,4"/></svg>`;
        case 'dashdot':
            return `<svg width="${w}" height="8" viewBox="${vb} 10"><line x1="0" y1="5" x2="40" y2="5" stroke="${c}" stroke-width="2.5" stroke-dasharray="8,3,2,3"/></svg>`;
        case 'flot_a':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><path d="M5,1 Q15,7 5,13" fill="none" stroke="${c}" stroke-width="2"/><path d="M25,1 Q35,7 25,13" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
        case 'low_wire':
            return `<svg width="${w}" height="8" viewBox="${vb} 12"><line x1="0" y1="8" x2="40" y2="8" stroke="${c}" stroke-width="2"/><line x1="5" y1="8" x2="12" y2="2" stroke="${c}" stroke-width="2"/><line x1="5" y1="2" x2="12" y2="8" stroke="${c}" stroke-width="2"/><line x1="25" y1="8" x2="32" y2="2" stroke="${c}" stroke-width="2"/><line x1="25" y1="2" x2="32" y2="8" stroke="${c}" stroke-width="2"/></svg>`;
        case 'single_concertina':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><line x1="0" y1="10" x2="40" y2="10" stroke="${c}" stroke-width="2"/><circle cx="5" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="13" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="21" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="29" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.5"/><circle cx="37" cy="6" r="5" fill="none" stroke="${c}" stroke-width="1.5"/></svg>`;
        case 'arrow':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><line x1="0" y1="7" x2="34" y2="7" stroke="${c}" stroke-width="2"/><polygon points="34,3 40,7 34,11" fill="${c}" stroke="${c}" stroke-width="1"/></svg>`;
        case 'atditch_a':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><polygon points="5,1 5,13 15,7" fill="${c}" stroke="${c}" stroke-width="1"/><polygon points="25,1 25,13 35,7" fill="${c}" stroke="${c}" stroke-width="1"/></svg>`;
        case 'atditch_unfin':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><polygon points="5,1 5,13 15,7" fill="none" stroke="${c}" stroke-width="2"/><polygon points="25,1 25,13 35,7" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
        case 'ap_mine':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><circle cx="10" cy="7" r="5" fill="${c}"/><line x1="17" y1="2" x2="10" y2="7" stroke="${c}" stroke-width="2.5"/><line x1="17" y1="12" x2="10" y2="7" stroke="${c}" stroke-width="2.5"/><circle cx="30" cy="7" r="5" fill="${c}"/><line x1="37" y1="2" x2="30" y2="7" stroke="${c}" stroke-width="2.5"/><line x1="37" y1="12" x2="30" y2="7" stroke="${c}" stroke-width="2.5"/></svg>`;
        case 'at_mine':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><line x1="0" y1="2" x2="40" y2="2" stroke="${c}" stroke-width="2"/><line x1="0" y1="12" x2="40" y2="12" stroke="${c}" stroke-width="2"/><circle cx="10" cy="7" r="4" fill="${c}"/><circle cx="30" cy="7" r="4" fill="${c}"/></svg>`;
        default: return '';
    }
}
