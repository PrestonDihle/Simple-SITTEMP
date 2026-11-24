# AI.md - Simple SITTEMP AI Agent Working Memory

## Project Summary
Simple SITTEMP (Situational Template) is a zero-build, single-page web application for interactive military mapping. It allows users to place NATO-standard military symbols, draw tactical overlays, and work with MGRS (Military Grid Reference System) coordinates on a Google Maps base layer. Designed for Army and Marine Corps units (ground and aviation) as a lightweight, browser-based alternative to heavier C2 systems for mission planning situational templates.

**Repository:** https://github.com/PrestonDihle/Simple-SITTEMP
**Hosting:** GitHub Pages (static site, no backend)
**Default Location:** Fort Irwin / National Training Center (NTC) — 35.2625, -116.6800

## Technology Stack

| Library | Version | Purpose | CDN |
|---------|---------|---------|-----|
| Google Maps JavaScript API | v3 | Base map, terrain, satellite imagery | Hardcoded API key in app.js |
| Terra Draw | 1.24.2 | Drawing/shape interactions (polygon, rect, circle, line, freehand, select) | `https://unpkg.com/terra-draw@1.24.2/dist/terra-draw.umd.js` |
| Terra Draw Google Maps Adapter | 1.3.1 | Connects Terra Draw to Google Maps | `https://unpkg.com/terra-draw-google-maps-adapter@1.3.1/dist/terra-draw-google-maps-adapter.umd.js` |
| mgrs (proj4js/mgrs) | 2.1.0 | Lat/lon ↔ MGRS conversion | `https://unpkg.com/mgrs@2.1.0/dist/mgrs.js` |
| html2canvas | 1.4.1 | Screenshot/PDF capture | `https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js` |
| jsPDF | 2.5.2 | PDF generation | `https://unpkg.com/jspdf@2.5.2/dist/jspdf.umd.min.js` |

## File Structure

```
Simple-SITTEMP/
  index.html          # Main application entry point
  style.css            # Application styles
  app.js               # App bootstrap: loads Google Maps, wires up modules
  js/
    state.js           # Reactive state store (get/set/subscribe/update)
    drawing.js         # Terra Draw init, shape activation, undo/redo, live-style editing, popover
    toolbar.js         # Toolbar UI, submenus, color/style panel, keyboard shortcuts
    symbols.js         # SVG generation for equipment/unit/enemy/tactical/star/text symbols
    grid.js            # MGRS grid overlay, coordinate display, MGRS goto input
    export.js          # KML, PDF, and screenshot export
    viewshed.js        # Range fans + terrain-masked viewsheds attached to symbols; shared fetchElevations()
    elevation.js       # Elevation band shading for drawn areas or the current view
    measures.js        # Control-measure tags (PZ/LZ/DZ/HA/FARP/BP, airspace zones) on drawn areas
    routes.js          # Flight routes (SP/ACP/RP), air corridors, route card, CSV/PDF
    contours.js        # Vector contour lines for the current view (marching squares)
  README.md            # Human-facing documentation
  AI.md                # This file - AI agent working memory
  LICENSE              # MIT License
  .gitignore
```

## Feature Specification

### Map Features
- Google Maps base layer (satellite, terrain, roadmap)
- Default center: Fort Irwin/NTC (35.2625, -116.6800)
- Standard Google Maps controls (zoom, layers, my location)

### Drawing Features (via Terra Draw)
- **Shapes:** Circle, Triangle, Rectangle, Polygon, LineString, Five-Point Star, Freehand
- **Line Types:** Solid, Dashed, Dotted, Dash-Dot, Mine Belt, Wire Obstacle, Tank Ditch
- **Select Mode:** Click to select, drag to move, delete selected features
- **Color Picker:** Line colors (Green, Blue, Red, Purple, Orange, Black, White, Grey)
- **Fill Colors:** Same set, plus "No Fill" swatch (sentinel `fillColor: 'none'` → `fillOpacity: 0`)
- **Transparency Slider:** 0-100% opacity for fill

### Live Style Editing
- Selecting any object (Terra Draw feature or Google Maps marker) syncs the Style Panel controls to that object's current values and shows "Editing: \<type\>" in `#color-selection-indicator`
- Color swatches, opacity slider, stroke slider, and scale slider all apply to the selected object in real time
- Per-feature style overrides stored in `featureStyles` state object; undo/redo restores them
- Mutual exclusion: selecting a Terra Draw feature deselects all markers and vice versa
- Marker selection shown with a dashed-border highlight on the SVG icon

### Object Style Popover (Req 4)
- Clicking any placed object opens a small popover anchored to its map position
- Contains: Delete button + contextual controls (line color, fill color/opacity for shapes, stroke width, scale for markers)
- Positioned via Google Maps OverlayView `fromLatLngToContainerPixel()`
- Closes on Esc, map click, or when a new object is selected

### Military Symbols
- **Equipment (24+):** Rifle, Machine Gun, Grenade Launcher, Flame Thrower, AT Rifle, Recoilless Rifle, Mortar, Howitzer, Gun, Rocket Launcher, Missile Launcher, SSM, AT Gun, AD Gun, SAM, ATGM, Tank, APC, Radar, Fixed Wing, Rotary Wing, UAV, Observation Post, Electronic Warfare
- **Units (11):** Infantry, Armor, Armored Infantry, Artillery, Engineers, Aviation, Military Intelligence, Military Police, Reconnaissance, Signal, Electronic Warfare
- **Enemy Units, Tactical Tasks** — additional symbol sets
- Each symbol: SVG graphic + optional left text (20 char, bottom of symbol area) + optional right text (20 char, bottom of symbol area)
- Symbols are selectable, draggable, deletable; scale/color editable in real time

### Viewsheds (`js/viewshed.js`)
- Equipment, unit, and enemy-unit popovers have "+ Add viewshed"; the viewshed moves with its symbol
- Parameters: range (m), azimuth + arc (mils/degrees toggle, preference saved in localStorage `sittemp_angle_unit`; stored internally as degrees from true north), observer height, target height, color, fill opacity, and outline width / opacity / line type (solid, dashed, dotted) independent of the symbol's stroke. The outline is a separate `google.maps.Polyline` (polygons can't dash); dashes and dots are repeated polyline icons
- Range fan is drawn instantly (geometric sector/circle). "Terrain mask" checkbox runs line-of-sight using `google.maps.ElevationService`: up to 120 radial rays × 128 samples, batched 512 locations/request (~30 requests for 360°), with Earth curvature + refraction (k = 0.13); only visible ground is shaded
- Config is stored in `marker._sittemp.viewshed` (in undo snapshots); overlays (`marker._vs`) and computed masks (in-memory cache keyed by position + params) are runtime-only
- Requires the Elevation API to be enabled on the Maps key; on REQUEST_DENIED the mask is disabled for the session with a toast
- KML export writes the range fan and, when computed, the visible-terrain MultiGeometry

### Control Measures (`js/measures.js`)
- Popover of any polygon / rectangle / circle / freehand has a "Control measure" section: Type + fields
- Area (FM 1-02.2 INCL C1 Tables 5-4/5-5): PZ, LZ, DZ, HA, FARP → label "PZ WOLF" at the area centroid; BP → name inside plus echelon glyph (I, II, X…) on the bottom edge (its white halo stands in for the doctrinal gap). HA is not in Table 5-4 and uses the same template
- Airspace (Table 5-23): ROZ, HIDACZ, AARROZ, UAROZ, WEZ, JEZ, MEZ, LOMEZ, HIMEZ, SHORAD EZ → block: function, unit (T), MIN/MAX ALT in feet AGL or MSL, TIME FROM/TO (DTG)
- Tags in `state.featureMeasures[featureId]` (in undo snapshots); labels are non-clickable markers that follow Terra Draw `change` update/delete events and the outline color
- KML: tagged features export with the measure as the Placemark name and the label block as description
- Not implemented: BP planned/prepared (dashed) variants — Terra Draw polygons can't dash; coordinating altitude (not in the extract)

### Flight Routes (`js/routes.js`)
- Shapes submenu → Flight Route: click SP, ACPs; double-click places RP and finishes (Enter also finishes, Esc cancels). Double-click zoom is disabled while placing
- Checkpoint symbols per FM 1-02.2: SP/RP = Table 5-6 point template (box + V pointer), ACP = Table 5-23 circle; markers are draggable
- Per leg (`data.legs[i]`, inbound to checkpoint i+1): ground speed (kt), altitude (ft) + AGL/MSL, defaulting from the last route (localStorage `sittemp_route_defaults`, which also stores declination)
- Computed: magnetic heading = true course − declination (+E), no wind correction; grid azimuth = true course − UTM grid convergence (shown in mils or degrees per `angleUnit`); NM and km; ETE and cumulative time
- Leg labels on the map ("034°M 4.4NM 2:54"); route card panel (`#route-card`, bottom center) with editable name, color, declination, GS/alt per leg, SP/RP names, remove-ACP, totals, CSV and PDF (jsPDF) export, delete
- Air corridor option: type AC/LLTR/MRR/SL/SC/SAAFR/TC/UA, width (ft), min/max alt (AGL/MSL), DTG start/end → corridor edges between circles of radius width/2 at each checkpoint, rotated "SAAFR BLUE" label on the longest leg, and the NAME/WIDTH/MIN ALT/MAX ALT/DTG block
- Route data is in undo snapshots (`routes`); KML export writes each route as a LineString plus checkpoint Points

### Contour Lines (`js/contours.js`)
- Map submenu → Contours: interval (m, default 20) + "Contour current view". Separate from elevation shading; each run costs its own ~20 Elevation requests (`fetchElevations` from viewshed.js, `gridSpec`/`gridPoints` from elevation.js)
- Marching squares on the ~100×100 grid (saddles resolved by the cell-center average), segments joined into polylines by shared edge keys, drawn as non-clickable `google.maps.Polyline`s so they stay crisp at any zoom; capped at 250 levels
- Legend entry (`#contour-legend`, stacked with `#elev-legend` in `#map-legends` bottom-left): interval, width, 8 colors (brown default), index lines (every 5th contour, +1.5 px), elevation labels on index lines (rotated along the line), remove
- Configs (`contours`) in undo snapshots; grids cached by id. KML export writes each contour as a styled LineString

### Elevation Shading (`js/elevation.js`)
- Sources: "Shade elevation" button in the popover of polygon / rectangle / circle / freehand features, or Map submenu → Elevation → "Shade current view" (band interval input there sets the default)
- Fixed bands in meters, flat fills (no contour lines). Five palettes (`PALETTES`): Muted, Soft, Classic, Bold, Dark (white peaks), stretched from the lowest to the highest band inside the area, so the top band is always the peak color; colors are not comparable between separate shadings. Default palette picker in Map submenu (localStorage `sittemp_elev_palette`); per-shading picker in the legend
- ~100×100 grid (≈20 Elevation requests), rows spaced evenly in Web Mercator so the GroundOverlay lines up; bilinear upsample ×4 (max 1200 px), clipped to the shape on a canvas; warns when samples are > 300 m apart
- Legend (`#elev-legend`, bottom-left, inside `#map-container` so PDF/PNG capture it): per-shading interval input, opacity slider, palette picker, min/max, band list, × to remove
- Shade configs are in undo snapshots (`elevationShades`); fetched grids are cached in memory by shade id, so undo/redo and interval changes don't re-query
- A shading is a snapshot of the area when created; moving or deleting the source shape does not change it. Not included in KML export

### MGRS Features
- Real-time cursor coordinate display (Lat/Lon + MGRS) in upper-right
- **MGRS Center-On Input:** text field + Go button in `#coord-display`; strips spaces, calls `mgrs.toPoint()`, calls `map.setCenter()` preserving zoom, error-toasts on invalid input
- MGRS grid overlay with easting/northing labels
- Three scale options: 1:50K (1km), 1:100K, 1:250K
- Grid color/weight selection, dynamic update on pan/zoom
- Right-click to copy MGRS to clipboard with toast notification

### Export Features
- **KML Export:** All placed entities as .kml file (no base map)
- **PDF Export:** Full map view + grid + entities, page sizes: 8.5x11, 11x17, 18x24
- **Screenshot:** PNG download
- Interstitial ad placeholder (5-second countdown) before KML/PDF exports

### UI Features
- Left-side vertical toolbar, offset `calc(16px + 1vw)` from left edge
- Sub-menus offset `calc(58px + 1vw)` from left edge
- Tooltips on hover for all toolbar icons
- Classification warning modal on first load (green — UNCLASSIFIED USE ONLY)
- Right-side Style Panel: Line Types + Colors + opacity/stroke/scale sliders + selection indicator

## Architectural Decisions

### Why Google Maps
Military users are familiar with it. Excellent terrain/satellite imagery with global coverage including remote training areas.

### Why Terra Draw
Abstracts drawing logic, provides robust built-in modes (polygon, rectangle, circle, linestring, freehand, select), supports function-based per-feature styling, works with Google Maps via terra-draw-google-maps-adapter.

### Why No Build Step
Target users are military planners on government computers with limited software installation privileges. Zero-build approach means the app can be hosted on GitHub Pages, shared as a URL, or run from a local file.

### Per-Feature Styles Architecture
Terra Draw supports function-based styles (e.g., `fillColor: function(feature){...}`). All style mode options in `initTerraDraw()` use module-level functions that read from the `featureStyles` state object keyed by feature ID, falling back to global state. This enables real-time, per-feature style editing without a remove/re-add cycle.

### Two Object Systems
1. **Terra Draw features** — polygon, rectangle, circle, linestring, freehand — tracked by `selectedFeatureId` in state
2. **Google Maps markers** — equipment, units, enemy units, tactical tasks, stars, triangles, text — stored in `markers[]` array with `_sittemp` metadata and `_selected` flag

Mutual exclusion between the two systems is enforced: selecting one clears any selection in the other.

### State Store
`js/state.js` provides `get(key)`, `set(key, value)`, `update({...})`, and `subscribe(keys, cb)`. All cross-module communication goes through state to avoid tight coupling.

## Key Library API Patterns

### Terra Draw Initialization (UMD globals: `terraDraw`, `terraDrawGoogleMapsAdapter`)
```javascript
const { TerraDraw, TerraDrawPolygonMode, ... } = terraDraw;
const { TerraDrawGoogleMapsAdapter } = terraDrawGoogleMapsAdapter;

// Must wait for Google Maps projection_changed before creating TerraDraw
map.addListener('projection_changed', () => {
  const draw = new TerraDraw({
    adapter: new TerraDrawGoogleMapsAdapter({ map, lib: google.maps, coordinatePrecision: 9 }),
    modes: [ /* function-based styles for all modes */ ]
  });
  draw.start();
  draw.on('ready', () => { draw.setMode('select'); });
});
```

### Function-Based Terra Draw Styles
```javascript
// Module-level functions read featureStyles[feature.id], falling back to global state
function _featureFillColor(feature) {
    var fs = get('featureStyles'); var s = fs && fs[feature.id];
    var fc = (s && s.fillColor !== undefined) ? s.fillColor : get('fillColor');
    return (fc === 'none') ? '#000000' : (fc || '#000000');
}
new TerraDrawPolygonMode({ styles: { fillColor: _featureFillColor, /* ... */ } })
```

### MGRS Conversion (UMD global: `mgrs`)
```javascript
const mgrsString = mgrs.forward([lng, lat], 4); // 4 = 10m precision
const [lng, lat] = mgrs.toPoint(mgrsStringNoSpaces);
```

### Symbol Placement Pattern
- User clicks equipment/unit from submenu → dialog prompts for left/right text labels + echelon
- `buildSymbolWithLabels()` generates a 150×(50+echelonH) SVG data-URL
- Left/right text labels rendered at `symY + 40` (bottom of the 40px symbol area)
- Placed as `google.maps.Marker` with `_sittemp` metadata; added to `state.markers[]`
- Marker click → `_syncPanelToMarker()` + `_showPopoverForMarker()` (Req 3 + 4)

### OverlayView for Popover Positioning
```javascript
var overlay = new google.maps.OverlayView();
overlay.draw = function () { _overlayProjection = overlay.getProjection(); };
overlay.setMap(map);
// Then: projection.fromLatLngToContainerPixel(latLng) → {x, y}
```

## Current State

### Completed Features
- [x] Project structure and modules (state.js, drawing.js, toolbar.js, symbols.js, grid.js, export.js)
- [x] Google Maps base layer with hardcoded API key
- [x] Terra Draw integration with function-based per-feature styles
- [x] Toolbar UI (left side with tooltips), offset `calc(16px + 1vw)` from left
- [x] Sub-menus offset `calc(58px + 1vw)` from left
- [x] Classification warning modal (green, UNCLASSIFIED USE ONLY)
- [x] Coordinate display (Lat/Lon + MGRS) + MGRS center-on input
- [x] MGRS grid overlay (toggle, color, weight, scale)
- [x] Right-click MGRS copy to clipboard
- [x] Shapes (circle, rectangle, polygon, linestring, freehand, star, triangle)
- [x] Line types (solid, dashed, dotted, dash-dot, mine belt, wire obstacle, tank ditch)
- [x] 24+ equipment symbols, 11 unit symbols, enemy units, 15 tactical tasks (geometry matched to FM 1-02.2 INCL C1, Table 6-1; Delay is not in that table and keeps its FM 3-90 form)
- [x] Coordinate display and Style Panel stacked in `#right-rail` (flex column) so they never overlap regardless of viewport height
- [x] Symbol placement with left/right text labels (bottom of symbol area, `symY+40`)
- [x] Symbol echelon markers
- [x] Text labels (place anywhere, font styling)
- [x] No Fill swatch in fill color palette
- [x] Live style editing for selected objects (Req 3)
  - [x] Color/opacity/stroke/scale apply to selected object in real time
  - [x] Style Panel syncs to selected object's values
  - [x] `#color-selection-indicator` shows "Editing: \<type\>"
  - [x] Mutual exclusion between Terra Draw and marker selection
  - [x] Dashed-border highlight on selected markers
  - [x] Undo/redo includes per-feature style overrides
- [x] Object style popover (Req 4)
  - [x] Delete button always present
  - [x] Filtered controls: line color, fill color/opacity (shapes), stroke width, scale (markers)
  - [x] Positioned via Google Maps OverlayView
  - [x] Closes on Esc, map click, or new selection
- [x] Undo/redo (50-state stack) for Terra Draw features + markers + styles
- [x] KML export, PDF export (Letter/Tabloid/Arch C), Screenshot (PNG)
- [x] Keyboard shortcuts: R/Shift+R rotate, Ctrl+Z undo, Ctrl+Y redo, Delete clear

## Known Limitations & Gotchas
- Terra Draw CDN versions pinned: terra-draw@1.24.2, terra-draw-google-maps-adapter@1.3.1
- MGRS grid overlay can be performance-heavy at low zoom; auto-hides based on zoom level + scale
- MGRS grid uses approximate lat/lon spacing (not true UTM grid lines); acceptable for planning use
- html2canvas may not perfectly capture Google Maps tiles due to CORS restrictions
- PDF export quality depends on html2canvas rendering; Google Maps tiles may appear blank
- Specialty line types render as Google Maps Polylines on top of Terra Draw lines; the base Terra Draw line is made transparent via `_featureLineOpacity` when `featureLineTypes[id]` is set
- Triangle shape uses standard polygon mode (user manually places 3 points)
- Five-point star is placed as a Google Maps marker, not a Terra Draw feature
- Military symbols (equipment/units) are Google Maps markers with a separate selection system from Terra Draw features
- Per-feature styles stored in `featureStyles` state object (keyed by feature ID), not in Terra Draw feature properties
- Object popover position is set once on open; it does not track the object if the map is panned while the popover is open
- UMD globals: `terraDraw` (core), `terraDrawGoogleMapsAdapter` (adapter), `mgrs` (MGRS conversion)
- Circular ES module imports between `drawing.js` and `toolbar.js` work because all cross-module calls occur inside event handlers, not at module init time

## Testing Checklist
- [ ] Map loads and centers on Fort Irwin/NTC
- [ ] Classification warning modal appears (green) on first load
- [ ] Coordinate display updates in real time (both lat/lon and MGRS)
- [ ] MGRS goto input: type a valid MGRS, press Go → map centers; invalid → error toast
- [ ] Right-click copies MGRS to clipboard with toast confirmation
- [ ] All toolbar buttons visible with tooltips; toolbar offset from left edge
- [ ] Select mode allows clicking and dragging features
- [ ] Polygon, Rectangle, Circle, LineString, and Freehand drawing modes work
- [ ] No Fill swatch renders fill-transparent shapes
- [ ] Color picker changes the color of newly drawn features
- [ ] Transparency slider adjusts opacity of newly drawn features
- [ ] All equipment and unit symbols can be placed with left/right labels and echelon
- [ ] Symbol left/right labels appear at the bottom of the symbol area
- [ ] Placed symbols are draggable and deletable
- [ ] MGRS grid overlay toggles and renders at all scales
- [ ] Undo reverses the last action; Redo re-applies it
- [ ] Clear Selected deletes selected features; Delete key also works
- [ ] KML export downloads a valid .kml file
- [ ] PDF export produces a PDF at the selected page size
- [ ] Screenshot downloads a PNG
- [ ] Select a polygon → Style Panel shows "Editing: Polygon"; swatches sync to polygon's colors
- [ ] Change line/fill color of selected polygon → polygon updates immediately
- [ ] Change opacity/stroke of selected polygon → polygon updates immediately
- [ ] Select equipment symbol → popover appears at symbol location
- [ ] Popover Delete button removes the object
- [ ] Popover line color swatch changes symbol color in real time
- [ ] Popover scale slider resizes the marker in real time
- [ ] Popover closes on Esc, map click, or selecting another object
- [ ] Undo after color/style change → object reverts to previous values
