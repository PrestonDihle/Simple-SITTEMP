// Define the markerTypes object
const markerTypes = {

RECON_OP:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  
<path d='M0 64 L64 64 L32 0 L64 64 M32 0 L0 64 Z' />
</svg>`,


FIRES_OP:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  
<path d='M32 0 L64 64 L0 64 L32 0 M32 36 C44 36 44 54 32 54 C20 54 20 36 32 36 Z' />
</svg>`,

AT_MISSILE:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M44 48 L44 16 C44 8 38 0 32 0 C26 0 20 8 20 16 L20 48 M20 64 L32 42 L44 64 L32 42 L32 0 L32 42 Z' />
</svg>`,

ADA_MISSILE:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M44 48 L44 16 C44 8 38 0 32 0 C26 0 20 8 20 16 L20 48 M44 64 L20 64 C20 62 20 54 32 54 C44 54 44 62 44 64 M32 54 L32 0 Z' />
</svg>`,

MORTAR:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M42 16 L42 16 L32 0 L22 16 M32 64 C28 64 24 60 24 56 C24 52 26 48 32 48 C36 48 40 52 40 56 C40 60 36 64 32 64 M32 48 L32 0 Z' />
</svg>`,

HOWITZER:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M48 42 L48 6 M32 64 C28 64 24 60 24 56 C24 52 26 48 32 48 C36 48 40 52 40 56 C40 60 36 64 32 64 M32 48 L32 0 M16 8 L16 42 L16 24 L48 24 L16 24 Z' />
</svg>`,

TANK:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M52 64 L52 0 M12 16 L52 16 M12 0 L12 64 M52 48 L12 48 Z' />
</svg>`,

IFV:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M52 64 L52 0 M12 0 L12 64 M52 32 L32 0 L12 32 L32 64 Z' />
</svg>`,

ROTARY_ATTACK:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M36 24 L28 24 M38 28 L32 16 L26 28 M52 48 L12 24 L12 48 L52 24 Z' />
</svg>`,

RADAR:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M58 62 C58 62 56 64 48 64 C2 58 0 24 16 0 M50 16 L32 34 L32 22 L10 42' />
</svg>`,

GENERIC_ARTILLERY_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M64 10 L64 54 L0 54 L0 10 L64 10 M32 24 C42 24 42 40 32 40 C22 40 22 24 32 24 Z' />
</svg>`,

GENERIC_RECON_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M0 54 L64 54 L64 10 L0 10 L0 54 L64 10 Z' />
</svg>`,

GENERIC_INFANTRY_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M0 54 L64 54 L64 10 L0 10 L64 54 L0 10 L0 54 L64 10 Z' />
</svg>`,
GENERIC_ROTARY_AVIATION:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M64 10 L64 10 L64 54 L0 54 L0 10 L64 10 M16 40 L48 24 L48 40 L16 24 Z' />
</svg>`,
GENERIC_ARMOR_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M64 10 L64 10 L64 54 L0 54 L0 10 L64 10 M16 32 C16 28 18 22 32 22 C46 22 48 28 48 32 C48 36 46 42 32 42 C18 42 16 36 16 32 Z' />
</svg>`,

OPFOR_ARMOR_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M64 32 L32 64 L0 32 L32 0 L64 32 M16 32 C16 28 18 22 32 22 C46 22 48 28 48 32 C48 36 46 42 32 42 C18 42 16 36 16 32 Z' />
</svg>`,

OPFOR_ARTILERY_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M64 32 L32 64 L0 32 L32 0 L64 32 M22 32 C22 26 26 22 32 22 C38 22 42 26 42 32 C42 38 38 42 32 42 C26 42 22 38 22 32 Z' />
</svg>`,

OPFOR_ROTARY_AVIATION:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M64 32 L32 64 L0 32 L32 0 L64 32 M18 38 L18 26 L46 38 L46 26 Z' />
</svg>`,

OPFOR_INFANTRY_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
    stroke='currentcolor'
	stroke-width='6'
  fill='none'>
  <path d='M64 32 L32 64 L0 32 L32 0 L64 32 M16 48 L0 32 L16 16 L48 48 L64 32 L48 16 Z' />
</svg>`,

OPFOR_RECON_UNIT:
`<svg
  xmlns='http://www.w3.org/2000/svg'
  viewBox='0 0 64 64'
  width='64' height='64'
  stroke='currentcolor'
  stroke-width='6'
  fill='none'>
  <path d='M64 32 L32 64 L0 32 L32 0 L64 32 M16 48 L48 16 Z' />
</svg>`

};

// Make it available globally
if (typeof window !== 'undefined') {
    window.markerTypes = markerTypes;
}

// Also support module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = markerTypes;
}


