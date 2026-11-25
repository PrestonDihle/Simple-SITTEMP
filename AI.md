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
    databox.js         # "Data box" labels: side lengths / area, circle r / C / A, line segment lengths
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
- **Line Types:** Solid, Dashed, Dotted, Dash-Dot, FLOT, Low Wire, 1x Concertina, Arrow, AT Ditch, AT Ditch (unfinished), AP Mine, AT Mine. Chosen per shape in the object popover ("Line type" grid) for lines, polygons, rectangles, circles and freehand shapes (`LINE_TYPE_SHAPES`); not for stars or flight routes. Picking a type applies its default color (`LINE_TYPE_COLORS` in symbols.js)
- **Select Mode:** Click to select, drag to move, delete selected features
- **Color Picker:** Line colors (Green, Blue, Red, Purple, Orange, Black, White, Grey, Yellow). Labels drawn in light colors (yellow, white) get a dark outline via `haloFor()` in symbols.js
- **Fill Colors:** Same set, plus "No Fill" swatch (sentinel `fillColor: 'none'` → `fillOpacity: 0`)
- **Transparency Slider:** 0-100% opacity for fill

### Return to Select
- After placing a symbol, tactical task, shape (Terra Draw `finish`), star, triangle or flight route, `returnToSelect()` switches back to the Select tool and clears the submenu highlight

### Live Style Editing
- The right-side Style Panel was removed; all styling is per object in the object popover. Selecting an object sets `selectionInfo`, which the popover reads for current values
- Popover color swatches, opacity, stroke and scale apply to the selected object in real time and also become the defaults for the next object drawn (`lineColor`, `fillColor`, `fillOpacity`, `symbolStrokeWidth`, `symbolScale` clamped to 3×)
- Per-feature style overrides stored in `featureStyles` state object; undo/redo restores them
- Mutual exclusion: selecting a Terra Draw feature deselects all markers and vice versa
- Marker selection shown with a dashed-border highlight on the SVG icon

### Object Style Popover (Req 4)
- Clicking any placed object opens a small popover beside it (right of its on-screen box, or left if there's no room; vertically centered, kept on screen; `popoverPlacement()`), so it doesn't cover the object
- Contains: Delete button + line color and stroke for everything; fill color + opacity for polygons, rectangles, circles, freehand, stars and triangles; line opacity (`featureStyles[id].lineOpacity`, also applied to pattern overlays) for lines; scale for markers
- Positioned via Google Maps OverlayView `fromLatLngToContainerPixel()`
- Closes on Esc, map click, or when a new object is selected

### Military Symbols
- **Equipment (24+):** Rifle, Machine Gun, Grenade Launcher, Flame Thrower, AT Rifle, Recoilless Rifle, Mortar, Howitzer, Gun, Rocket Launcher, Missile Launcher, SSM, AT Gun, AD Gun, SAM, ATGM, Tank, APC, Radar, Fixed Wing, Rotary Wing, UAV, Observation Post, Electronic Warfare
- **Friendly Units (toolbar "Friendly Units"):** Infantry, Armor, Armored Infantry, Artillery, Engineers, Aviation, Military Intelligence, Military Police, Reconnaissance, Signal, Electronic Warfare. Default colors when placed (`SYMBOL_DEFAULT_COLORS` in state.js): friendly units blue, enemy units red, equipment black; tactical tasks use the current line color
- **Enemy Units, Tactical Tasks** — additional symbol sets
- Each symbol: SVG graphic + optional left text (20 char, bottom of symbol area) + optional right text (20 char, bottom of symbol area)
- Symbols are selectable, draggable, deletable; scale/color editable in real time

### Viewsheds (`js/viewshed.js`)
- Equipment, unit, and enemy-unit popovers have "+ Add viewshed"; up to three per symbol (`MAX_VIEWSHEDS`), each with its own settings and default color (orange, yellow, blue); all move and rotate with the symbol
- Parameters: range (m), azimuth + arc (mils/degrees toggle, preference saved in localStorage `sittemp_angle_unit`; stored internally as degrees from true north), observer height, target height, color, fill opacity, and outline width / opacity / line type (solid, dashed, dotted) independent of the symbol's stroke. The outline is a separate `google.maps.Polyline` (polygons can't dash); dashes and dots are repeated polyline icons
- Range fan is drawn instantly (geometric sector/circle). "Terrain mask" checkbox runs line-of-sight using `google.maps.ElevationService`: up to 120 radial rays × 128 samples, batched 512 locations/request (~30 requests for 360°), with Earth curvature + refraction (k = 0.13); only visible ground is shaded
- Config is stored in `marker._sittemp.viewsheds` (array, in undo snapshots; a legacy single `viewshed` object is migrated by `getViewsheds()`); overlays (`marker._vs`, one per viewshed) and computed masks (in-memory cache keyed by position + params) are runtime-only
- Requires the Elevation API to be enabled on the Maps key; on REQUEST_DENIED the mask is disabled for the session with a toast
- KML export writes the range fan and, when computed, the visible-terrain MultiGeometry

### Control Measures (`js/measures.js`)
- Popover of any polygon / rectangle / circle / freehand has a "Control measure" section: Type + fields
- CBRN / CBRNE contaminated area (Table 5-28): inverted triangle with the agent letter (B, C, N, R; CBRNE also E for explosive) over the contamination mark, optional name below. Choosing it sets the shape to a black outline and 35% yellow fill (Terra Draw can't draw the FM hatching)
- Area (FM 1-02.2 INCL C1 Tables 5-4/5-5): PZ, LZ, DZ, HA, FARP → label "PZ WOLF" at the area centroid; BP → name inside plus echelon glyph (I, II, X…) on the bottom edge (its white halo stands in for the doctrinal gap). HA is not in Table 5-4 and uses the same template
- Airspace (Table 5-23): ROZ, HIDACZ, AARROZ, UAROZ, WEZ, JEZ, MEZ, LOMEZ, HIMEZ, SHORAD EZ → block: function, unit (T), MIN/MAX ALT in feet AGL or MSL, TIME FROM/TO (DTG)
- Tags in `state.featureMeasures[featureId]` (in undo snapshots); labels are non-clickable markers that follow Terra Draw `change` update/delete events and the outline color
- KML: tagged features export with the measure as the Placemark name and the label block as description
- Not implemented: BP planned/prepared (dashed) variants — Terra Draw polygons can't dash; coordinating altitude (not in the extract)

### Data Box (`js/databox.js`)
- "Data box" checkbox in the object popover for circles, rectangles, polygons and lines (`DATA_BOX_TYPES`; not freehand). Replaces the old Measure tool, which was removed
- Polygon / rectangle: each side's length at its midpoint + "Area …" just below the centroid (below any control-measure label). Circle: "r / C / A" at the center (radius from Terra Draw `radiusKilometers` when present, else mean vertex distance; C = 2πr, A = πr²). Line: each segment's length
- Geodesic: haversine distances and spherical-excess ring area. Units: m below 1 km, else km (2 decimals under 10 km); m² below 0.1 km², else km²
- Labels are non-clickable markers in the shape's line color with `haloFor()` outlines; they follow Terra Draw update events and line-color changes; `state.featureDataBoxes` is in undo snapshots; deleting the shape drops its data box

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
- **Training-area quick links** (below the MGRS input): JMRC, NTC (= `DEFAULT_CENTER`), JRTC, JPMRC buttons; coordinates in `data-lat`/`data-lng` on the buttons in index.html, wired in `setupMGRSGoto()`; center at `DEFAULT_ZOOM`
- MGRS grid overlay with easting/northing labels
- Three scale options: 1:50K (1km), 1:100K, 1:250K
- Grid controls live in the Map submenu "MGRS Grid" section (`#grid-toggle` switch, `#grid-color`, `#grid-weight`); the old floating box at the top-left was removed. Dynamic update on pan/zoom
- Right-click to copy MGRS to clipboard with toast notification

### Export Features
- **KML Export:** All placed entities as .kml file (no base map)
- **PDF Export:** choose a shape (Paper: Letter 8.5×11, Tabloid 11×17, Arch C 18×24; Shape: 1:1, 4:3, 16:9, Free), then portrait/landscape (not for 1:1/Free), then frame the print area on the map: a box that can be moved, resized from its corners (ratio locked except Free) and rotated in place, with the map locked and outside area dimmed (`startPrintArea()` in export.js). The area fills the page edge to edge; paper shapes print on that paper, other shapes on a custom page with an 11 in long side. Capture scale aims for 150 dpi on the page (2×–4×), then the capture is cropped to the box
- **Screenshot:** PNG with the same flow plus a "Full view" option (whole screen, no box); framed PNGs are sized for an 11 in long side at 150 dpi
- Interstitial ad placeholder (5-second countdown) before KML export only. Exports hide the toolbar, coordinate box, submenus, object popover and route card

### UI Features
- Left-side vertical toolbar, offset `calc(16px + 1vw)` from left edge
- Sub-menus offset `calc(58px + 1vw)` from left edge
- Toolbar hover labels: a floating `#toolbar-tooltip` placed beside the hovered button from its `data-tooltip` (a CSS ::after label was clipped by the scrolling toolbar)
- Classification warning modal on first load (green — UNCLASSIFIED USE ONLY)
- No right-side Style Panel: `#right-rail` holds only the coordinate box; styling lives in the object popover

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
- `buildSymbolWithLabels()` generates a W×(50+echelonH) SVG data-URL, where W comes from `symbolIconLayout(left, right, rotation)`: the 40 px symbol plus just enough room on each side for that side's label (min 3 px, 9 px when rotated off-axis). Markers are anchored on the symbol center (`symX + 20`), so the click/selection box hugs the symbol and its labels (it used to be a fixed 150 px)
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
- [x] Coordinate display in `#right-rail` (the Style Panel that used to stack under it was removed)
- [x] Symbol placement with left/right text labels (bottom of symbol area, `symY+40`)
- [x] Symbol echelon markers: none, team (Ø), squad (●), section (●●), platoon, company, battalion, regiment, brigade, division, corps (`ECHELON_LIST`; BP labels use the same set)
- [x] Text labels (place anywhere, font styling)
- [x] No Fill swatch in fill color palette
- [x] Live style editing for selected objects (Req 3)
  - [x] Color/opacity/stroke/scale apply to selected object in real time
  - [x] Object popover shows the selected object's current values
  - [x] Mutual exclusion between Terra Draw and marker selection
  - [x] Dashed-border highlight on selected markers
  - [x] Undo/redo includes per-feature style overrides
- [x] Object style popover (Req 4)
  - [x] Delete button always present
  - [x] Filtered controls: line color, fill color/opacity (shapes), stroke width, scale (markers)
  - [x] Positioned via Google Maps OverlayView
  - [x] Closes on Esc, map click, or new selection
- [x] Undo/redo (50-state stack) for Terra Draw features + markers + styles
- [x] KML export, PDF export (paper or shape + orientation + framed print area), Screenshot (PNG, framed or full view)
- [x] Keyboard shortcuts: R/Shift+R rotate, Ctrl+Z undo, Ctrl+Y redo, Delete clear
- [x] Rotation (R/Shift+R or popover ⟲/⟳, 15° steps) applies to equipment, unit, enemy unit and tactical task symbols (`isRotatable()`); an attached viewshed azimuth turns with the symbol
- [x] Scale limits: `SYMBOL_MAX_SCALE` = 3× for symbols, `TASK_MAX_SCALE` = 20× for tactical tasks (popover slider). Tactical task stroke goes down to `TASK_MIN_STROKE` = 0.1 in 0.1 steps (other symbols 1–10); a task's hairline stroke does not become the default for other symbols

## Known Limitations & Gotchas
- Terra Draw CDN versions pinned: terra-draw@1.24.2, terra-draw-google-maps-adapter@1.3.1
- MGRS grid overlay can be performance-heavy at low zoom; auto-hides based on zoom level + scale
- MGRS grid uses approximate lat/lon spacing (not true UTM grid lines); acceptable for planning use
- html2canvas may not perfectly capture Google Maps tiles due to CORS restrictions
- PDF export quality depends on html2canvas rendering; Google Maps tiles may appear blank
- Specialty line types render as Google Maps Polylines over the Terra Draw feature (for area shapes, along the closed outline). The base line is hidden via `_featureLineOpacity` (lines) or `_featureOutlineWidth` = 0 (areas) when `featureLineTypes[id]` is not solid; overlays use the feature's own color and stroke width and are rebuilt by `_rebuildLineOverlay()` on color/width change, edit and undo
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
- [ ] PDF export: shape → orientation → print-area box (move, resize, rotate, Esc cancels) produces a page of the chosen size
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
