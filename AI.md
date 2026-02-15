# AI.md - Simple SITTEMP AI Agent Working Memory

## Project Summary
Simple SITTEMP (Situational Template) is a zero-build, single-page web application for interactive military mapping. It allows users to place NATO-standard military symbols, draw tactical overlays, and work with MGRS (Military Grid Reference System) coordinates on a Google Maps base layer. Designed for Army and Marine Corps units (ground and aviation) as a lightweight, browser-based alternative to heavier C2 systems for mission planning situational templates.

**Repository:** https://github.com/PrestonDihle/Simple-SITTEMP
**Hosting:** GitHub Pages (static site, no backend)
**Default Location:** Fort Irwin / National Training Center (NTC) — 35.2625, -116.6800

## Technology Stack

| Library | Version | Purpose | CDN |
|---------|---------|---------|-----|
| Google Maps JavaScript API | v3 | Base map, terrain, satellite imagery | Loaded dynamically with user API key |
| Terra Draw | 1.24.2 | Drawing/shape interactions (polygon, rect, circle, line, freehand, select) | `https://unpkg.com/terra-draw@1.24.2/dist/terra-draw.umd.js` |
| Terra Draw Google Maps Adapter | 1.3.1 | Connects Terra Draw to Google Maps | `https://unpkg.com/terra-draw-google-maps-adapter@1.3.1/dist/terra-draw-google-maps-adapter.umd.js` |
| mgrs (proj4js/mgrs) | 2.1.0 | Lat/lon to MGRS conversion | `https://unpkg.com/mgrs@2.1.0/dist/mgrs.js` |
| html2canvas | 1.4.1 | Screenshot/PDF capture | `https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js` |
| jsPDF | 2.5.2 | PDF generation | `https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js` |

## File Structure

```
Simple-SITTEMP/
  index.html          # Main application entry point
  style.css            # Application styles
  app.js               # Main application logic
  symbols/
    equipment/         # SVG files for equipment symbols (inline in app.js)
    units/             # SVG files for unit symbols (inline in app.js)
  README.md            # Human-facing documentation
  AI.md                # This file - AI agent working memory
  LICENSE              # MIT License
  .gitignore           # Ignore config.js, node_modules, etc.
```

## Feature Specification

### Map Features
- Google Maps base layer (satellite, terrain, roadmap)
- Default center: Fort Irwin/NTC (35.2625, -116.6800)
- Red 3px border around map container
- Standard Google Maps controls (zoom, layers, my location)

### Drawing Features (via Terra Draw)
- **Shapes:** Circle, Triangle, Rectangle, Polygon, LineString, Five-Point Star, Freehand
- **Line Types:** Solid, Dashed, Dotted, Dash-Dot, Mine Belt, Wire Obstacle, Tank Ditch
- **Select Mode:** Click to select, drag to move, delete selected features
- **Color Picker:** Line colors (Green, Blue, Red, Purple, Orange, Black, White, Grey)
- **Fill Colors:** Same set as line colors
- **Transparency Slider:** 0-100% opacity for fill and stroke

### Military Symbols
- **Equipment (18):** Rifle, Light MG, Heavy MG, Light Mortar, Heavy Mortar, Observation Post, Artillery OP, Anti-Tank Missile, Anti-Tank Gun, Anti-Aircraft Gun, Anti-Aircraft Missile, Fixed Wing, Attack Helo, Utility Helo, Tank, Armored Vehicle, Radar, AA Radar
- **Units (11):** Infantry, Armor, Armored Infantry, Artillery, Engineers, Aviation, Military Intelligence, Military Police, Reconnaissance, Signal, Electronic Warfare
- Each symbol: SVG graphic + optional left text (20 char) + optional right text (20 char)
- Symbols are selectable, draggable, deletable

### MGRS Features
- Real-time cursor coordinate display (Lat/Lon + MGRS) in upper-right
- MGRS grid overlay with easting/northing labels
- Three scale options: 1:50K (1km), 1:100K, 1:250K
- Grid color selection, dynamic update on pan/zoom
- Right-click to copy MGRS to clipboard with toast notification

### Export Features
- **KML Export:** All placed entities as .kml file (no base map)
- **PDF Export:** Full map view + grid + entities, page sizes: 8.5x11, 11x17, 18x24
- **Screenshot:** PNG download, ad banner hidden during capture
- Interstitial ad placeholder (5-second countdown) before KML/PDF exports

### UI Features
- Left-side vertical toolbar (10 buttons, 48x48px, dark background)
- Tooltips on hover for all toolbar icons
- Sub-menus for Shapes, Equipment, Units, Color
- Classification warning modal on first load (sessionStorage)
- Text placement mode with click-to-place

### Monetization
- Banner ad placeholder (728x90px, bottom center)
- Interstitial ad placeholder before exports
- Screenshot hides ads during capture
- Clearly marked `<!-- AD INTEGRATION POINT -->` comments

## Architectural Decisions

### Why Google Maps
Military users are familiar with it. Excellent terrain/satellite imagery with global coverage including remote training areas. Supports overlay and marker APIs needed for military symbol placement and grid overlays.

### Why Terra Draw
Abstracts drawing logic, provides robust built-in modes (polygon, rectangle, circle, linestring, freehand, select), supports custom styling, works with Google Maps via terra-draw-google-maps-adapter. Eliminates need for low-level drawing interaction code.

### Why No Build Step
Target users are military planners on government computers with limited software installation privileges. Zero-build approach means the app can be hosted on GitHub Pages, shared as a URL, or run from a local file.

### Why MGRS
MGRS is the standard military grid reference system used by NATO forces. Every military map product includes MGRS grids and every Soldier/Marine is trained to read them.

### Why MIT License
Maximizes adoption. Military users, contractors, and open-source contributors can all use and modify freely.

## Key Library API Patterns

### Terra Draw Initialization (UMD globals: `terraDraw`, `terraDrawGoogleMapsAdapter`)
```javascript
// Must destructure from UMD globals
const { TerraDraw, TerraDrawPolygonMode, ... } = terraDraw;
const { TerraDrawGoogleMapsAdapter } = terraDrawGoogleMapsAdapter;

// Must wait for Google Maps projection_changed before creating TerraDraw
map.addListener('projection_changed', () => {
  const draw = new TerraDraw({
    adapter: new TerraDrawGoogleMapsAdapter({ map, lib: google.maps, coordinatePrecision: 9 }),
    modes: [ /* ... all modes ... */ ]
  });
  draw.start();
  // CRITICAL: Must wait for 'ready' event before calling setMode
  draw.on('ready', () => { draw.setMode('select'); });
});
```

### MGRS Conversion (UMD global: `mgrs`)
```javascript
// Via CDN, the global `mgrs` object has:
const mgrsString = mgrs.forward([lng, lat], 5); // 5 = 1m precision
const [lng, lat] = mgrs.toPoint(mgrsString);
```

### Symbol Placement Pattern
- User clicks equipment/unit from submenu
- Terra Draw set to 'select' mode (non-drawing)
- Google Maps click listener attached
- On map click, dialog prompts for left/right text labels
- SVG marker (with labels) placed as Google Maps Marker
- Markers tracked in `state.markers[]`, separate from Terra Draw features
- Markers are draggable and deletable (click to select, Clear Selected to delete)

## Current State

### Completed
- [x] Project structure created
- [x] AI.md created
- [x] README.md created
- [x] LICENSE created
- [x] .gitignore created

### Phase 1: Foundation
- [x] index.html with Google Maps initialization (Fort Irwin/NTC default)
- [x] Terra Draw integration with Google Maps adapter
- [x] Toolbar UI (left side, 10 buttons with tooltips)
- [x] Coordinate display (upper right, real-time lat/lon + MGRS)
- [x] Classification warning modal (sessionStorage)
- [x] style.css (dark military theme)
- [x] app.js (main application logic)
- [x] API key prompt (localStorage) for Google Maps

### Phase 2: Drawing
- [x] Shapes sub-menu with Terra Draw modes (circle, rectangle, polygon, linestring, freehand)
- [x] Select mode for selecting/moving/deleting (via TerraDrawSelectMode)
- [x] Color picker (8 line colors + 8 fill colors)
- [x] Transparency/opacity slider (0-100%)
- [x] Line type selection (solid, dashed, dotted, dash-dot, mine belt, wire obstacle, tank ditch)
- [x] Undo/redo system (50-state stack)

### Phase 3: Military Symbols
- [x] 18 equipment SVGs (inline SVG functions)
- [x] 11 unit SVGs (inline SVG functions)
- [x] Equipment and Units sub-menus with icon previews
- [x] Symbol placement with optional left/right text labels (20 char max)
- [x] Symbol selection, dragging, deletion via Google Maps Markers

### Phase 4: MGRS Grid Overlay
- [x] MGRS grid line calculation and rendering (approximate lat/lon grid)
- [x] Easting/northing labels along edges
- [x] Scale selection (1:50K 1km, 1:100K 10km, 1:250K 100km)
- [x] Grid color selection (black, grey, red, blue)
- [x] Right-click to copy MGRS with toast notification

### Phase 5: Export and Polish
- [x] KML export (Terra Draw features + markers)
- [x] PDF export with page size selection (Letter, Tabloid, Arch C)
- [x] Screenshot (PNG) with ad banner hidden during capture
- [x] Interstitial ad placeholder (5-second countdown)
- [x] Ad banner placeholder (728x90 bottom center)
- [x] AD INTEGRATION POINT comments in HTML

### Phase 6: Specialty Features
- [x] Mine belt line rendering (via Google Maps IconSequence)
- [x] Wire obstacle line rendering
- [x] Tank ditch line rendering
- [x] Triangle shape (via polygon mode with 3-point instruction)
- [x] Five-point star shape (as Google Maps marker)

### Phase 7: Post-Creation Color Editing
- [x] Per-feature color properties stamped on creation (`_lineColor`, `_fillColor`, `_fillOpacity`, `_lineType`)
- [x] Function-based Terra Draw styling (reads per-feature colors, falls back to global state)
- [x] Color picker applies to selected objects in real-time (Terra Draw features and Google Maps markers)
- [x] Selection indicator banner ("Editing: Polygon") in color submenu
- [x] Color picker syncs to selected object's current colors on selection
- [x] Mutual exclusion: selecting a Terra Draw feature deselects markers and vice versa
- [x] Line overlay recoloring for specialty line types (dashed, dotted, mine belt, etc.)
- [x] Star marker stores fillColor/fillOpacity separately from stroke color
- [x] `_suppressUndoPush` flag prevents double undo states during remove/add cycles
- [x] `restoreState()` rebuilds line overlays for features with `_lineType` property

### Phase 8: Bug Fixes from Testing
- [x] Rectangle editing maintains rectangular constraints (uses `resizable: 'opposite'` only, no vertex dragging)
- [x] Freehand shapes support vertex editing (midpoints, draggable, deletable)
- [x] Marker selection visually indicated with cyan dashed border via `setMarkerSelected()` function
- [x] Color editing works for equipment/units/stars/text — cyan highlight persists after color change
- [x] Text labels have transparent background (no white rect)
- [x] Specialty lines: base Terra Draw line made transparent (`rgba(0,0,0,0)`) when `_lineType` is set
- [x] Specialty line overlays sync path on feature drag/edit via `change` event handler

## Known Limitations & Gotchas
- Google Maps API key required (not included in repo, user must provide via localStorage prompt)
- Terra Draw CDN versions pinned: terra-draw@1.24.2, terra-draw-google-maps-adapter@1.3.1
- MGRS grid overlay can be performance-heavy at low zoom; auto-hides based on zoom level + scale
- MGRS grid uses approximate lat/lon spacing (not true UTM grid lines); acceptable for planning use
- html2canvas may not perfectly capture Google Maps tiles due to CORS restrictions
- PDF export quality depends on html2canvas rendering; Google Maps tiles may appear blank
- Specialty line types render as Google Maps Polylines on top of Terra Draw lines; the base Terra Draw line is made transparent via function-based styling when `_lineType` is set
- Triangle shape uses standard polygon mode (user manually places 3 points); no automatic 3-vertex constraint
- Five-point star is placed as a Google Maps marker, not a Terra Draw feature
- Military symbols (equipment/units) are Google Maps markers, not Terra Draw features; they use a separate selection system (click to select → cyan dashed border appears, then Clear Selected to delete)
- `setMarkerSelected(marker, isSelected)` regenerates the SVG icon with/without a cyan dashed border; must be called at every selection state change
- Color editing uses remove/add cycle for Terra Draw features (updates properties, then re-adds); a `_suppressUndoPush` flag prevents duplicate undo states during this cycle
- Per-feature colors are stored in feature.properties (`_lineColor`, `_fillColor`, `_fillOpacity`, `_lineType`); Terra Draw mode styles use functions to read these
- Undo/redo captures full state snapshots; may be memory-intensive with many features
- Terra Draw `projection_changed` listener is required before init; if Google Maps loads slowly, there may be a brief delay
- UMD globals: `terraDraw` (core), `terraDrawGoogleMapsAdapter` (adapter), `mgrs` (MGRS conversion)

## Testing Checklist
- [ ] Map loads and centers on Fort Irwin/NTC
- [ ] Classification warning modal appears on first load
- [ ] Coordinate display updates in real time (both lat/lon and MGRS)
- [ ] Right-click copies MGRS to clipboard with toast confirmation
- [ ] All 10 toolbar buttons are visible and show tooltips on hover
- [ ] Select mode allows clicking and dragging features
- [ ] Polygon, Rectangle, Circle, LineString, and Freehand drawing modes work
- [ ] Color picker changes the color of newly drawn features
- [ ] Transparency slider adjusts opacity of newly drawn features
- [ ] All 18 equipment symbols can be placed on the map
- [ ] All 11 unit symbols can be placed on the map
- [ ] Symbol placement prompts for left/right text labels (20 char max)
- [ ] Placed symbols are draggable and deletable
- [ ] MGRS grid overlay renders at 1:50K, 1:100K, and 1:250K scales
- [ ] MGRS grid color is changeable
- [ ] Undo reverses the last action
- [ ] Redo re-applies the last undone action
- [ ] Clear Selected deletes selected features
- [ ] KML export downloads a valid .kml file with all placed features
- [ ] PDF export produces a PDF at the selected page size
- [ ] Screenshot downloads a PNG without the ad banner
- [ ] Interstitial ad placeholder (countdown) appears before KML/PDF export
- [ ] Ad banner placeholder is visible at the bottom center
- [ ] Line types render correctly (solid, dashed, dotted, dash-dot)
- [ ] Specialty line types render correctly (mine belt, wire obstacle, tank ditch)
- [ ] Text placement mode allows clicking to place text labels on the map
- [ ] Select a polygon → open Color picker → "Editing: Polygon" indicator appears
- [ ] Change line color of selected polygon → polygon updates immediately
- [ ] Change fill color of selected polygon → polygon fill updates
- [ ] Change opacity of selected polygon → polygon opacity updates
- [ ] Select equipment symbol → change color → SVG icon regenerates
- [ ] Select text label → change color → text color updates
- [ ] Select star → change fill color and opacity → star updates
- [ ] Select dashed line → change color → both Terra Draw line and overlay polyline update
- [ ] After editing, draw new shape → uses current picker colors
- [ ] Undo after color change → object reverts to previous color
- [ ] Color picker swatches sync to selected object's colors when clicking it
