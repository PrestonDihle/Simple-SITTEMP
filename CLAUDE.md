# Simple SITTEMP - AI Agent Context

## What is this project?

Simple SITTEMP (Situational Template) is an interactive military mapping tool built as a zero-build single-page web application on top of Google Maps. It allows users to place NATO-standard military symbols, draw tactical overlays, and work with MGRS (Military Grid Reference System) coordinates. The map defaults to Fort Irwin / National Training Center (NTC).

## Architecture

This is a vanilla HTML/CSS/JS app with no build system, no framework, and no package manager. Just open `index.html` in a browser.

### File Map

| File | Role | Notes |
|---|---|---|
| `index.html` | Entry point, UI structure | Loads Google Maps API, all scripts, and styles |
| `script.js` | Core app logic | Map init, marker/shape/text management, drawing manager, measurement, clipboard, context menu |
| `markerTypes.js` | Military symbol definitions | 18 SVG symbols using `currentcolor` for dynamic coloring. Exports `markerTypes` object globally |
| `mgrs_functions.js` | MGRS utilities | Grid drawing, coordinate display, MGRS search/navigation, formatting helpers |
| `mgrs.js` | Third-party MGRS library | UMD module from proj4js. Provides `mgrs.forward()` and `mgrs.toPoint()`. Do not edit. |
| `styles.css` | All styles | Layout, controls, coordinate display, context menu, grid labels |

### Dependencies

- **Google Maps JavaScript API** (loaded via CDN with `drawing` and `geometry` libraries)
- **Proj4js** (loaded via CDN for coordinate transformations)
- **mgrs.js** (local, vendored third-party library)

No npm, no node_modules, no bundler.

## Key Concepts

### Military Symbols (`markerTypes.js`)

Symbols are defined as SVG template strings in a `markerTypes` object. Each uses `currentcolor` as the stroke color, which gets replaced at runtime with the user's selected color. Two categories:

- **Friendly (rectangle frame):** RECON_OP, FIRES_OP, AT_MISSILE, ADA_MISSILE, MORTAR, HOWITZER, TANK, IFV, ROTARY_ATTACK, RADAR, GENERIC_ARTILLERY_UNIT, GENERIC_RECON_UNIT, GENERIC_INFANTRY_UNIT, GENERIC_ROTARY_AVIATION, GENERIC_ARMOR_UNIT
- **OPFOR (diamond frame):** OPFOR_ARMOR_UNIT, OPFOR_ARTILERY_UNIT, OPFOR_ROTARY_AVIATION, OPFOR_INFANTRY_UNIT, OPFOR_RECON_UNIT

To add a new symbol: add an entry to the `markerTypes` object in `markerTypes.js`. The key becomes the type identifier, the value is an SVG string. Buttons are auto-generated from this object in `createMarkerButtons()`.

### MGRS Coordinate System

The app heavily integrates MGRS:
- Real-time coordinate display (Lat/Lon + MGRS) as the mouse moves
- Configurable precision: 100km, 10km, 1km, 100m, 10m, 1m
- MGRS grid overlay drawn on the map with easting/northing labels
- Search: enter an MGRS coordinate to navigate to it
- Right-click to copy MGRS at any point

### Global State (in `script.js`)

```
map                    - Google Maps instance
markers[]              - All placed markers
shapes[]               - All drawn shapes (polylines, rectangles, circles, polygons)
textOverlays[]         - All text overlays (each has a { marker, overlay } pair)
measureMarkers[]       - Temporary markers for distance measurement
selectedMarkerType     - Currently selected symbol type (string key into markerTypes)
selectedColor          - Currently selected color (string)
selectedLineType       - Currently selected line type (string key into lineTypeDefinitions)
selectedLineWeight     - Currently selected stroke weight (integer)
selectedMarker         - Currently clicked/selected marker (for deletion)
selectedShape          - Currently clicked/selected shape (for deletion/modification)
selectedTextOverlay    - Currently clicked/selected text overlay (for deletion)
drawingManager         - Google Maps DrawingManager instance
measureMode            - Boolean toggle for measurement mode
mgrsDisplayPrecision   - Integer 0-5 for MGRS display precision
lineTypeDefinitions    - Object mapping line type names to functions that return polyline options
```

Each shape in `shapes[]` also carries custom properties:
```
shape._originalStrokeWeight  - The user's chosen stroke weight (restored on deselect)
shape._originalStrokeOpacity - The line's stroke opacity (0 for icon-only lines like dashed)
shape._originalIcons         - The icons[] array (restored on deselect)
shape._lineType              - The line type string key (e.g. 'dashed', 'mine-belt')
shape._strokeColor           - The line's color
```

### Tactical Line Types (`lineTypeDefinitions` in `script.js`)

Seven line types are available, defined as functions returning Google Maps Polyline options:
- **solid** — Standard solid line
- **dashed** — Dashed line using icon sequences (`strokeOpacity: 0` + dash icons)
- **dotted** — Dotted line using circle icons
- **dash-dot** — Alternating dash and dot pattern
- **mine-belt** — Solid line with "M" mine symbols at intervals (MIL-STD-2525)
- **wire-obstacle** — Solid line with perpendicular tick marks
- **tank-ditch** — Solid line with triangular serrations

To add a new line type: add an entry to `lineTypeDefinitions`. The key becomes the option value, the function receives `(color, weight)` and returns `{strokeColor, strokeOpacity, strokeWeight, icons[]}`. Also add a matching `<option>` in the `#lineTypeSelector` in `index.html`.

### Post-Placement Modification

Selecting a shape (click it) then changing color, line type, or thickness updates the selected shape in-place via `applyPropertiesToShape()`. The UI controls sync to reflect the selected shape's current properties via `updateLineControlsFromShape()`.

### Drawing Manager

Google Maps DrawingManager handles shape creation (polyline, rectangle, circle, polygon). When a marker is drawn:
- If `selectedMarkerType` is set, it creates a custom SVG marker via `addCustomMarker()`
- Otherwise it creates a default Google Maps marker

Shapes are stored in `shapes[]` and support click-to-select, modify, and delete.

## Known Issues

1. **Duplicate declaration:** `mgrsDisplayPrecision` is declared in both `script.js` (line 17) and `mgrs_functions.js` (line 282)
2. **Invalid CSS:** `margin: left;` in `styles.css` line 12 is not valid CSS
3. **Font size typo:** In `index.html`, the 40px `<option>` displays as "38px"
4. **No persistence:** All work is lost on page refresh - no save/load/export functionality
5. **No undo/redo**

## Conventions

- No build step - all changes are immediately testable by refreshing `index.html`
- SVG symbols use `currentcolor` for the stroke so color can be swapped at runtime
- Google Maps API key must be set in `index.html` (replace `KEY` in the script src)
- All JS is vanilla ES6+ (let/const, template literals, arrow functions) - no modules, no imports
- CSS uses simple class/ID selectors, no preprocessor
- The app is entirely client-side with no backend
