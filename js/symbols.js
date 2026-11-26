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
// Geometry follows FM 1-02.2 (INCL C1, 23 Jan 2025), Chapter 6, Table 6-1
// "Tactical mission task symbols". Delay, withdraw, withdraw under pressure and
// retire follow chapter 5 Table 5-12 and ambush Table 5-11. Tasks are drawn pointing right (this app's
// rotation convention). All symbols use a 350x350 viewBox with parameterized
// color and stroke width.
export function tacticalTaskSVG(key, color, strokeWidth) {
    color = color || '#000000';
    strokeWidth = strokeWidth || 2;
    const sw = strokeWidth * (350 / 40);
    const c = color;
    const RAD = Math.PI / 180;
    const f1 = (n) => Math.round(n * 10) / 10;

    // Stroked path (no fill)
    // Stroked path (no fill). `extra` attributes override the defaults rather than
    // repeating them: a duplicated attribute makes the SVG invalid XML, and the map
    // (which draws symbols as SVG images) then shows nothing.
    const P = (d, extra) => {
        const attrs = { fill: 'none', stroke: c, 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
        (extra || '').replace(/([\w-]+)="([^"]*)"/g, function (m, k, v) { attrs[k] = v; return m; });
        return '<path d="' + d + '"' + Object.keys(attrs).map(function (k) { return ' ' + k + '="' + attrs[k] + '"'; }).join('') + '/>';
    };
    // Letter centered on (x, y)
    const T = (x, y, txt, size) => {
        size = size || 75;
        return `<text x="${x}" y="${f1(y + size * 0.36)}" font-family="Arial,sans-serif" font-size="${size}" font-weight="bold" fill="${c}" text-anchor="middle">${txt}</text>`;
    };
    // Point at angle a (deg, screen coords: 0 = right, 90 = down) on circle (cx, cy, r)
    const pt = (cx, cy, r, a) => [f1(cx + r * Math.cos(a * RAD)), f1(cy + r * Math.sin(a * RAD))];
    // Open (line) arrowhead with tip at (x, y) pointing toward angle a
    const openHead = (x, y, a, len, spread) => {
        len = len || 40;
        spread = spread || 30;
        const b1 = pt(x, y, -len, a - spread), b2 = pt(x, y, -len, a + spread);
        return P(`M${b1[0]},${b1[1]} L${x},${y} L${b2[0]},${b2[1]}`);
    };
    // Filled arrowhead with tip at (x, y) pointing toward angle a
    const fillHead = (x, y, a, len) => {
        len = len || 45;
        const b1 = pt(x, y, -len, a - 26), b2 = pt(x, y, -len, a + 26);
        return `<polygon points="${x},${y} ${b1[0]},${b1[1]} ${b2[0]},${b2[1]}" fill="${c}" stroke="${c}" stroke-width="${f1(sw * 0.5)}" stroke-linejoin="round"/>`;
    };
    // Clockwise arc on circle (cx, cy, r) from angle a0 to a1 (degrees)
    const arc = (cx, cy, r, a0, a1) => {
        const s = pt(cx, cy, r, a0), e = pt(cx, cy, r, a1);
        const sweep = ((a1 - a0) % 360 + 360) % 360;
        return `M${s[0]},${s[1]} A${r},${r} 0 ${sweep > 180 ? 1 : 0},1 ${e[0]},${e[1]}`;
    };
    // Direction of travel at angle a on a clockwise arc
    const tangentCW = (a) => a + 90;
    const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350" width="350" height="350">${inner}</svg>`;

    // Shared open-circle geometry for isolate / occupy / secure: gap on the left,
    // drawn clockwise from ~10 o'clock to ~8 o'clock, letter outside on the right.
    const CX = 160, CY = 175, CR = 105, A0 = 205, A1 = 150;
    const arcEnd = pt(CX, CY, CR, A1);

    // Retrograde template: hook from (HX, Y - 120) round the left to (HX, Y), shaft along y = Y
    const retro = (letter) => {
        const HX = 95, Y = 235, END = 330, LX = 205;
        const half = letter.length * 22 + 10;              // half-width of the break for the letter
        return P(`M${HX},${Y - 120} A60,60 0 0,0 ${HX},${Y}`) +
            P(`M${HX},${Y} L${LX - half},${Y} M${LX + half},${Y} L${END},${Y}`) +
            T(LX, Y, letter, 64) +
            openHead(END, Y, 0, 40);
    };

    const builders = {
        // Retrograde tasks (FM 1-02.2 Table 5-12): half-circle hook at the rear joined
        // to the end of the shaft, letter in a break in the shaft, open arrowhead.
        // Mirrored from the FM drawing (which points left) to point right.
        delay: () => retro('D'),
        withdraw: () => retro('W'),
        withdraw_under_pressure: () => retro('WP'),
        retire: () => retro('R'),

        // Ambush (FM 1-02.2 Table 5-11): arc bulging toward the kill zone, hatched
        // with lines parallel to the arrow on its inner side, arrow from the arc's apex
        ambush: () => {
            const ax = 90, ay = 175, ar = 120, a0 = 65;
            const chordX = f1(ax + ar * Math.cos(a0 * RAD));
            let s = P(arc(ax, ay, ar, -a0, a0));
            [88, 112, 136, 158, 192, 214, 238, 262].forEach((y) => {
                const xe = f1(ax + Math.sqrt(ar * ar - (y - ay) * (y - ay)));
                s += P(`M${chordX},${y} L${xe},${y}`, `stroke-width="${f1(sw * 0.6)}"`);
            });
            return s + P(`M${ax + ar},175 L315,175`) + openHead(315, 175, 0, 45);
        },

        // Attack by fire — bracket tail, arrow from its midpoint, open arrowhead, no letter
        attack_by_fire: () => P('M85,85 L135,140 L135,210 L85,265') +
            P('M135,175 L290,175') +
            openHead(290, 175, 0, 45),

        // Block — line, B, line ending at a perpendicular bar; no arrowhead
        block: () => P('M30,175 L120,175') +
            T(165, 175, 'B', 80) +
            P('M210,175 L275,175') +
            P('M275,80 L275,270'),

        // Breach — B left of a bracket; arms end in ticks angled inward
        breach: () => T(45, 210, 'B', 70) +
            P('M90,95 L90,255') +
            P('M90,95 L265,95 L305,135') +
            P('M90,255 L265,255 L305,215'),

        // Clear — three parallel arrows (C on the center one) ending at a bar
        clear: () => P('M40,90 L280,90') + openHead(280, 90, 0, 38) +
            P('M40,175 L125,175') + T(165, 175, 'C', 75) + P('M205,175 L280,175') + openHead(280, 175, 0, 38) +
            P('M40,260 L280,260') + openHead(280, 260, 0, 38) +
            P('M295,60 L295,290'),

        // Destroy — X broken at the center around D
        destroy: () => P('M70,70 L132,132 M218,218 L280,280 M280,70 L218,132 M132,218 L70,280') +
            T(175, 175, 'D', 80),

        // Disrupt — stem to a bar; three filled-head arrows, top longest, D on the center arrow
        disrupt: () => P('M20,175 L85,175') +
            P('M85,90 L85,260') +
            P('M85,90 L275,90') + fillHead(315, 90, 0) +
            P('M85,175 L130,175') + T(165, 175, 'D', 70) + P('M200,175 L245,175') + fillHead(285, 175, 0) +
            P('M85,260 L230,260') + fillHead(270, 260, 0),

        // Fix — line, F, zigzag, filled arrowhead
        fix: () => P('M20,175 L60,175') +
            T(92, 175, 'F', 75) +
            P('M125,175 L148,175 L172,120 L198,230 L224,120 L248,175 L268,175') +
            fillHead(318, 175, 0, 50),

        // Follow and assume — empty pointed frame (unit), dashed line, outlined double chevron
        follow_and_assume: () => P('M30,125 L145,125 L190,175 L145,225 L30,225 Z') +
            P('M190,175 L262,175', `stroke-dasharray="${f1(sw * 1.4)} ${f1(sw * 1.2)}" stroke-linecap="butt"`) +
            P('M250,128 L275,128 L322,175 L275,222 L250,222 L297,175 Z'),

        // Follow and support — empty notched pointed frame (unit), solid line, open arrowhead
        follow_and_support: () => P('M20,125 L145,125 L190,175 L145,225 L20,225 L55,175 Z') +
            P('M190,175 L315,175') +
            openHead(315, 175, 0, 48),

        // Isolate — open circle ringed by outlined triangles standing on the circle and
        // pointing outward, arrowhead at the open end, I outside
        isolate: () => {
            const r = 92;
            let s = P(arc(CX, CY, r, A0, A1));
            [228, 258, 288, 318, 48, 78, 108].forEach((a) => {
                const b1 = pt(CX, CY, r, a - 9), b2 = pt(CX, CY, r, a + 9), tip = pt(CX, CY, r + 38, a);
                s += P(`M${b1[0]},${b1[1]} L${tip[0]},${tip[1]} L${b2[0]},${b2[1]} Z`, `stroke-width="${f1(sw * 0.6)}"`);
            });
            const e = pt(CX, CY, r, A1);
            // Head on the arc's direction of travel, arms spread wide enough to clear the arc
            return s + openHead(e[0], e[1], tangentCW(A1), 50, 38) + T(318, 175, 'I', 70);
        },

        // Neutralize — line broken by N, crossed by a dashed diagonal (also broken at N)
        neutralize: () => P('M25,175 L130,175 M220,175 L325,175') +
            T(175, 175, 'N', 75) +
            P('M45,275 L135,206 M215,144 L305,75', `stroke-dasharray="${f1(sw * 1.4)} ${f1(sw * 1.2)}" stroke-linecap="butt"`),

        // Occupy — open circle ending in an X at the lower-left, O outside
        occupy: () => {
            const t = tangentCW(A1);
            const x1a = pt(arcEnd[0], arcEnd[1], 38, t + 45), x1b = pt(arcEnd[0], arcEnd[1], -38, t + 45);
            const x2a = pt(arcEnd[0], arcEnd[1], 38, t - 45), x2b = pt(arcEnd[0], arcEnd[1], -38, t - 45);
            return P(arc(CX, CY, CR, A0, A1)) +
                P(`M${x1a[0]},${x1a[1]} L${x1b[0]},${x1b[1]} M${x2a[0]},${x2a[1]} L${x2b[0]},${x2b[1]}`) +
                T(310, 175, 'O', 60);
        },

        // Secure — open circle with an open arrowhead at the lower-left end, S outside
        secure: () => P(arc(CX, CY, CR, A0, A1)) +
            openHead(arcEnd[0], arcEnd[1], tangentCW(A1), 52, 38) +
            T(310, 175, 'S', 70),

        // Seize — empty circle (unit), curved arrow with S, open arrowhead at the objective
        seize: () => `<circle cx="85" cy="120" r="58" fill="none" stroke="${c}" stroke-width="${sw}"/>` +
            P('M143,120 C215,115 262,165 278,265') +
            openHead(278, 265, 82, 45) +
            T(200, 72, 'S', 62),
    };
    return wrap((builders[key] || builders.delay)());
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

export const ENEMY_UNIT_LIST = UNIT_LIST;

export const TACTICAL_TASK_LIST = [
    { key: 'fix', name: 'Fix' },
    { key: 'disrupt', name: 'Disrupt' },
    { key: 'block', name: 'Block' },
    { key: 'delay', name: 'Delay' },
    { key: 'withdraw', name: 'Withdraw' },
    { key: 'withdraw_under_pressure', name: 'Withdraw Under Pressure' },
    { key: 'retire', name: 'Retire' },
    { key: 'ambush', name: 'Ambush' },
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
    { key: 'star', name: 'Decision Point', icon: '<polygon points="14,2 17,11 27,11 19,17 22,26 14,21 6,26 9,17 1,11 11,11" fill="none" stroke="currentColor" stroke-width="1.5"/>' },
    { key: 'general_point', name: 'Point', icon: '<path d="M8 3 H20 V17 L14 25 L8 17 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="miter"/>' },
    { key: 'point_target', name: 'Point Target', icon: '<path d="M11 6 V22 M3 14 H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="14" y="9" font-size="7" font-weight="bold" font-family="Arial" fill="currentColor" stroke="none">AB</text>' },
    { key: 'flight_route', name: 'Flight Route', icon: '<polyline points="4,23 12,12 18,17 25,5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="17" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1,20 h6 v3 l-3,3 l-3,-3 z" fill="none" stroke="currentColor" stroke-width="1.2"/>' },
];

/** Outline color that keeps text readable: dark behind light colors (yellow, white), white otherwise. */
export function haloFor(color) {
    const h = String(color || '#000000').replace('#', '');
    if (h.length < 6) return '#ffffff';
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#000000' : '#ffffff';
}

// Default line color applied when a line type is chosen
export const LINE_TYPE_COLORS = {
    solid: '#000000', dashed: '#000000', dotted: '#000000', dashdot: '#000000',
    flot_a: '#0000FF',
    low_wire: '#000000',
    single_concertina: '#00AA00', atditch_a: '#00AA00', atditch_unfin: '#00AA00',
    ap_mine: '#00AA00', at_mine: '#00AA00',
    arrow: '#000000',
};

export const LINE_TYPES = [
    { key: 'solid', name: 'Solid' },
    { key: 'dashed', name: 'Dashed' },
    { key: 'dotted', name: 'Dotted' },
    { key: 'dashdot', name: 'Dash-Dot' },
    { key: 'flot_a', name: 'FLOT' },
    { key: 'strong_point', name: 'Strong Pt' },
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
    { key: 'team', name: 'Team (Ø)' },
    { key: 'squad', name: 'Squad (●)' },
    { key: 'section', name: 'Section (●●)' },
    { key: 'platoon', name: 'Platoon (●●●)' },
    { key: 'company', name: 'Company (|)' },
    { key: 'battalion', name: 'Battalion (||)' },
    { key: 'regiment', name: 'Regiment (|||)' },
    { key: 'brigade', name: 'Brigade (X)' },
    { key: 'division', name: 'Division (XX)' },
    { key: 'corps', name: 'Corps (XXX)' },
];

/**
 * Layout of a symbol icon: the 40 px symbol plus just enough room on each side
 * for that side's label. Returns { width, symX } where symX is the symbol's left
 * edge; the marker is anchored on the symbol center (symX + 20), so the icon's
 * click/selection box hugs the symbol and its labels. Rotated symbols get a few
 * extra pixels so their corners aren't clipped.
 */
export function symbolIconLayout(leftText, rightText, rotation) {
    const CHAR_W = 6.2;   // generous advance for 10 px Arial (labels are often capitals)
    const minSide = (rotation || 0) % 90 !== 0 ? 9 : 3;
    const lw = Math.max(minSide, leftText ? String(leftText).length * CHAR_W + 4 : 0);
    const rw = Math.max(minSide, rightText ? String(rightText).length * CHAR_W + 4 : 0);
    return { width: Math.ceil(lw + 40 + rw), symX: Math.ceil(lw) };
}

/**
 * Build an SVG that includes the symbol + optional left/right text labels + echelon marks.
 * Handles both legacy 40x40 viewBox (units) and new 350x350 viewBox (equipment).
 */
/**
 * Mirror a symbol's inner SVG left-right within its viewBox (width vbW), keeping
 * any letters readable: each <text> is mirrored back around its own x.
 */
function flipInner(inner, vbW) {
    const unflipped = inner.replace(/<text x="([\d.]+)"/g, function (m, x) {
        return '<text transform="translate(' + (2 * parseFloat(x)) + ',0) scale(-1,1)" x="' + x + '"';
    });
    return '<g transform="translate(' + vbW + ',0) scale(-1,1)">' + unflipped + '</g>';
}

export function buildSymbolWithLabels(svgInner, leftText, rightText, color, rotation, echelon, flip) {
    const layout = symbolIconLayout(leftText, rightText, rotation);
    const totalWidth = layout.width;
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
    const symX = layout.symX; // left edge of symbol area
    const symY = 5 + echelonH;  // top edge of symbol area (shifted down if echelon present)
    const scaleX = symW / vbW;
    const scaleY = symH / vbH;

    // Center of the symbol area (for rotation pivot)
    const symCX = symX + symW / 2;
    const symCY = symY + symH / 2;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`;

    // Draw echelon marks above the symbol
    if (echelon && echelon !== 'none') {
        svg += buildEchelonMarks(echelon, symCX, symY - 2, color);
    }

    if (leftText) {
        svg += `<text x="${symX - 2}" y="${symY + 40}" text-anchor="end" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(leftText)}</text>`;
    }

    // Scale the inner SVG content to fit the 40x40 display area, with optional
    // left-right flip (applied first, in the symbol's own frame) and rotation
    let inner = stripSvgWrapper(svgInner);
    if (flip) inner = flipInner(inner, vbW);
    if (rotation !== 0) {
        svg += `<g transform="rotate(${rotation}, ${symCX}, ${symCY}) translate(${symX}, ${symY}) scale(${scaleX}, ${scaleY})">${inner}</g>`;
    } else {
        svg += `<g transform="translate(${symX}, ${symY}) scale(${scaleX}, ${scaleY})">${inner}</g>`;
    }

    if (rightText) {
        svg += `<text x="${symX + symW + 2}" y="${symY + 40}" text-anchor="start" fill="${color}" font-size="10" font-family="Arial,sans-serif">${escapeXml(rightText)}</text>`;
    }

    svg += '</svg>';
    return svg;
}

function buildEchelonMarks(echelon, cx, baseY, color) {
    let marks = '';
    const sw = 1.5;
    switch (echelon) {
        case 'team': // circle with a diagonal slash (Ø)
            marks += `<circle cx="${cx}" cy="${baseY - 6}" r="4" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
            marks += `<line x1="${cx - 6}" y1="${baseY - 0.5}" x2="${cx + 6}" y2="${baseY - 11.5}" stroke="${color}" stroke-width="${sw}"/>`;
            break;
        case 'squad': // one dot
            marks += `<circle cx="${cx}" cy="${baseY - 5}" r="2" fill="${color}"/>`;
            break;
        case 'section': // two dots
            marks += `<circle cx="${cx - 4}" cy="${baseY - 5}" r="2" fill="${color}"/>`;
            marks += `<circle cx="${cx + 4}" cy="${baseY - 5}" r="2" fill="${color}"/>`;
            break;
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
        case 'strong_point':
            return `<svg width="${w}" height="8" viewBox="${vb} 14"><line x1="0" y1="10" x2="40" y2="10" stroke="${c}" stroke-width="2"/>${[3, 11, 19, 27, 35].map(function (x) { return '<line x1="' + x + '" y1="10" x2="' + x + '" y2="3" stroke="' + c + '" stroke-width="1.5"/>'; }).join('')}</svg>`;
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
