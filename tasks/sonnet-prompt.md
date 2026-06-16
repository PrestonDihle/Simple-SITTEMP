# Task: Implement 7 updates to Simple SITTEMP and push each to GitHub

You are working in the **Simple-SITTEMP** repository (a zero-build, single-page web
app for military situational templates over Google Maps). Work **autonomously**:
make all code changes, validate, commit, and push to GitHub **without asking for
approval or confirmation** at any step. Only stop if you hit a genuine blocker you
cannot resolve from the code itself.

## Repository & workflow rules

- Repo root contains: `index.html`, `style.css`, `app.js`, `js/` (ES modules:
  `state.js`, `toolbar.js`, `drawing.js`, `grid.js`, `symbols.js`, `export.js`),
  `symbols/`, `AI.md`, `README.md`.
- This is a **zero-build** project: no npm, no bundler, no framework, no test suite.
  Plain ES modules loaded by the browser. Do not introduce a build step or dependencies.
- **Git delivery:** Work directly on `main`. After completing **each** of the 7
  requirements below, make **one commit for that requirement** (7 commits total),
  then push to `origin/main`. Use clear messages, e.g.
  `Req 1: Turn UNCLASSIFIED USE ONLY warning modal green`. End each commit message with:
  ```
  Co-Authored-By: Claude <noreply@anthropic.com>
  ```
  Run the push after each commit (`git push origin main`). Do not use `--no-verify`.
- **Verification (you cannot fully run the app here — no browser environment):**
  The Google Maps API key is now hardcoded in `app.js`, so the map would load in a real
  browser, but you still have no browser to run or click through the app. After editing
  JS, run `node --check <file>` on every `.js` file you touched to catch syntax errors.
  Do a careful self-review of each change against the acceptance criteria. Do not claim a
  behavior works that you could not verify; if you could only static-check it, say so in
  your final summary.
- Match the existing code style (the codebase mixes `function`/`var` in older spots and
  `const`/arrow functions elsewhere — follow the conventions of the file you're editing).

## Recent repo change (context — don't redo it)

A merged PR ("Hardcode API key and remove advertisement banner") already changed the live
code, so the code differs from what older docs describe:
- The API-key dialog + `localStorage` flow is **gone**. `app.js` now calls
  `loadGoogleMaps(...)` with a **hardcoded key**, and the `#api-key-dialog` markup was
  removed from `index.html`. Do not reintroduce the key prompt.
- The ad banner is **gone**: `#banner-ad` was removed from `index.html`, its styles removed
  from `style.css`, and the screenshot-export ad-hiding reference in `js/export.js` adjusted.
- **`README.md` and `AI.md` are stale on both points** (they still mention the localStorage
  API-key prompt and the ad-banner / monetization placeholders). None of the 7 tasks below
  touch the API key or ads — just don't be confused by those stale docs, and fix them in the
  final docs step.

## Architecture facts you must know

- **State** lives in `js/state.js` via a reactive store: `get(key)`, `set(key, value)`,
  `update({...})`, `subscribe(keys, cb)`. Named palette colors are in the `COLORS`
  object. Style state keys: `lineColor`, `fillColor`, `fillOpacity`, `lineType`,
  `symbolStrokeWidth`, `symbolScale`, plus font keys.
- **Two separate object systems** (this is critical):
  1. **Terra Draw features** — polygons, rectangles, circles, linestrings, freehand.
     Selected feature id is tracked in state `selectedFeatureId` (set by Terra Draw
     `select`/`deselect` events in `js/drawing.js`). Terra Draw mode styles already use
     **function-based styles** in places (e.g. `lineStringOpacity` and
     `selectedLineStringColor` read per-feature data from `featureLineTypes`) — follow
     that same pattern to add per-feature color/opacity/stroke.
  2. **Google Maps markers** — equipment, units, enemy units, tactical tasks, stars,
     triangles, and text labels. Stored in the `markers` array. Each marker has
     `marker._sittemp` (its metadata: `type`, `key`, `color`, `strokeWidth`,
     `symbolScale`, `rotation`, `echelon`, `leftText`, `rightText`, `fill`,
     `fillOpacity`, text/font fields) and a `marker._selected` boolean set on click.
- **Symbol icons** are SVG data-URLs. `js/symbols.js` builds them: `equipmentSVG`,
  `unitSVG`, `enemyUnitSVG`, `tacticalTaskSVG`, and `buildSymbolWithLabels(svgInner,
  leftText, rightText, color, rotation, echelon)` which composes the symbol + labels +
  echelon into the final 150×(50+echelon) SVG.
- **Restyling a marker = regenerate its SVG and call `marker.setIcon(...)`.** There are
  working templates for this in `js/drawing.js`: `rotateSelectedMarker()` (rebuilds an
  equipment/unit/enemy/tactical icon with new rotation + scale) and
  `applyFontToSelectedText()` in `js/toolbar.js` (rebuilds a text marker). Generalize
  from these.
- **Undo/redo:** call `pushUndoState()` (exported from `js/drawing.js`) after any change
  that should be undoable. It snapshots Terra Draw features + markers + `featureLineTypes`.
  `restoreState()` rebuilds everything, so any new per-object style data you add **must be
  persisted in the snapshot and restored** (otherwise undo/redo will drop it). For markers,
  style data already lives in `_sittemp`, which the snapshot saves — so store new marker
  style on `_sittemp`. For Terra Draw features, store style in `feature.properties`
  (the snapshot copies `properties`), and extend `restoreState()` if needed.
- **Specialty line types** render as Google Maps `Polyline` overlays on top of a
  transparent Terra Draw line; overlays are tracked in `lineOverlays` (keyed by feature id)
  and `featureLineTypes`. `createLineOverlay()`, `applyLineType()`, and `changeLineType()`
  already exist in `js/drawing.js`.
- **The Style Panel** (right side, `#style-panel` in `index.html`) already holds the
  controls: Line Types list (`#line-type-list`), Line/Fill color swatches
  (`#line-color-swatches`, `#fill-color-swatches`), Opacity (`#opacity-slider`), Stroke
  (`#stroke-width-slider`), Scale (`#symbol-scale-slider`). It also contains an unused
  `#color-selection-indicator` ("Editing: ---") element — repurpose it.
- **Heads-up:** `AI.md` is **stale**. Its "Phase 7/8" claims post-creation color editing,
  cyan selection borders, and a `setMarkerSelected()` function already exist — **they do
  not** in the current refactored code. Treat #3/#4 below as net-new work, not tweaks.

---

## The 7 requirements

### Req 1 — Turn the "UNCLASSIFIED USE ONLY" warning modal from red to green
The target is the **startup warning modal** (`#classification-modal` in `index.html`,
whose `<h2>` reads "UNCLASSIFIED USE ONLY"), NOT the on-map top banner (that's already
green). In `style.css`, change the modal's red (`#CC0000`, hover `#990000`) to green:
- `#classification-modal .modal-content` border → green
- `#classification-modal .modal-content h2` color → green
- `#classification-modal .modal-content button` background → green, and its `:hover` → a
  darker green
Use the existing app green for consistency: base `#007a33`, darker hover e.g. `#005a26`.
**Acceptance:** the warning popup shows green text, green outline, and a green button; no
red remains on it.

### Req 2 — Add a "No Fill" option to the color palette
Let shapes be outline-only. In `js/toolbar.js` `buildColorSubmenu()`, add a **"No Fill"**
swatch to the **Fill** swatches row (render it distinctly — e.g. white with a red
diagonal slash or a checkerboard — and `title="No Fill"`). Selecting it represents a
transparent fill.
- Represent no-fill with a sentinel: set state `fillColor` to `'none'` (and/or a dedicated
  `noFill` flag — your choice, keep it consistent).
- In the Terra Draw polygon/rectangle/circle/freehand mode styles (and `updateDrawStyles`),
  when fill is `'none'`, render `fillOpacity: 0` (keep the outline visible). Make the fill
  style a function of the per-feature value if you implement Req 3 with per-feature props.
- Newly drawn shapes after choosing "No Fill" must have no fill; the outline still shows.
**Acceptance:** choosing "No Fill" then drawing a polygon yields an outline-only shape.
(Also works on a selected shape once Req 3 is in.)

### Req 3 — Live-edit a selected object's style after placement
Make **color, opacity, stroke width, scale, and line type apply to the currently selected
object in real time** — for shapes (polygon/rect/circle/linestring/freehand), equipment,
units, enemy units, and tactical tasks (also stars/triangles/text where the property
applies). Per your product owner's decision, the **right-side Style Panel must always
live-edit the current selection** (and so must the Req 4 popover — see below; both call the
same apply functions).

Implement a single set of "apply to current selection" functions (e.g. in `js/drawing.js`),
and call them from both the Style Panel controls and the popover:
- **Terra Draw features:** store style on `feature.properties` (e.g. `_lineColor`,
  `_fillColor`, `_fillOpacity`, `_strokeWidth`). Convert the relevant mode styles
  (`fillColor`, `fillOpacity`, `outlineColor`, `outlineWidth`, `lineStringColor`,
  `lineStringWidth`) to **functions** that read the per-feature property and fall back to
  the global state value — exactly like the existing `lineStringOpacity` function. To apply
  a change to the selected feature, update its properties and force a re-render (update
  feature properties via the Terra Draw API, or remove+re-add the feature; if you
  remove/re-add, guard against pushing a duplicate undo state). Line-type changes on a
  selected line already work via `changeLineType()` — keep that working.
- **Markers (equipment/unit/enemy/tactical):** color = symbol stroke color; stroke =
  `strokeWidth`; scale = `symbolScale`. Rebuild the icon from `_sittemp` (use
  `buildSymbolWithLabels` + the right `*SVG` builder) and `setIcon()` with recomputed
  `scaledSize`/`anchor` (mirror `rotateSelectedMarker`). Opacity doesn't apply to
  stroke-only symbols — skip it for them.
- **Stars/triangles:** apply color (stroke), fill, opacity, scale by regenerating the SVG.
- **Text:** color/font already live-update via `applyFontToSelectedText`; keep it.
- Persist all new style data so **undo/redo** restores it (markers via `_sittemp`; features
  via `properties` — extend `restoreState()`/overlay rebuild if required).
- When an object is selected, **sync the Style Panel controls** (swatches/sliders) to that
  object's current values, and show the `#color-selection-indicator` as `Editing: <type>`.
  Clear it on deselect.
- **Add a visible selection highlight** (none exists today). For markers, regenerate the
  icon with a highlight (e.g. a dashed bounding box / glow) when `_selected`, and remove it
  on deselect — add a helper like `setMarkerSelected(marker, isSelected)`. Terra Draw's
  select mode already draws its own selected styling. Ensure **mutual exclusion**: selecting
  a marker clears any selected Terra Draw feature and vice versa.
**Acceptance:** select a placed polygon → change line color/fill/opacity/stroke → it
updates immediately; select an equipment symbol → change color/stroke/scale → icon
regenerates; undo reverts the style change.

### Req 4 — Click an object to open a small action popover
When the user clicks a placed object (marker or Terra Draw feature), show a **small popover
menu anchored at that object** with, **at minimum**: **Delete**, and controls for **color,
opacity, stroke, scale, and text modification**. Both the popover and the Style Panel
live-edit the selection (they share the Req 3 apply functions).
- **Delete** removes the selected object (reuse `clearSelected()` logic) and closes the popover.
- **Text** opens an inline edit of the object's text: for symbols, edit the left/right
  labels (reuse the `#symbol-text-dialog` flow or an inline field); for text labels, edit
  the text content. Regenerate the icon after editing.
- **Color / Opacity / Stroke / Scale:** provide compact inline controls in the popover that
  call the same apply-to-selection functions. **Only show controls that apply** to the
  selected object's type (e.g. no opacity for stroke-only symbols; no line type for symbols;
  no scale for plain shapes).
- **Anchoring:** position the popover at the object's on-screen location. The clean way is a
  Google Maps `OverlayView` whose `getProjection().fromLatLngToContainerPixel(latLng)`
  converts the object's position to container pixels; position an absolutely-positioned
  `<div>` (appended in `#map-container`) there. Reposition/hide it on map pan/zoom as needed.
- Close the popover on: clicking empty map, pressing Esc, selecting another object, or a
  Delete action. Don't let it block map dragging.
**Acceptance:** clicking any placed shape/symbol/text opens a popover with at least
Delete + color/opacity/stroke/scale/text (filtered to what's relevant), and each control
edits the object live.

### Req 5 — Align symbol labels to the bottom of the symbol
In `js/symbols.js` `buildSymbolWithLabels()`, the left/right label `<text>` elements
currently use `y="${symY + 25}"` (near vertical center). Move them so the labels sit at the
**bottom edge of the 40×40 symbol area** (bottom ≈ `symY + symH` = `symY + 40`; pick a
baseline like `symY + 40` that keeps text within the SVG height of `50 + echelonH` without
clipping). Keep the `text-anchor` (`end` for left, `start` for right) and x positions.
Note this builder is shared by equipment, units, enemy units, **and tactical tasks**, so the
change applies to all of them — that's acceptable.
**Acceptance:** left/right labels on equipment, unit, and enemy-unit symbols render aligned
to the bottom of the symbol graphic, not its middle.

### Req 6 — MGRS "center on" input in the coordinate box
Add an input to the coordinate display (`#coord-display` in `index.html`, the Lat/Lon &
MGRS box) where the user types an MGRS coordinate and the map **recenters** on it.
- **Behavior:** on submit (button click or Enter), parse the MGRS and recenter the map
  with `map.setCenter(...)` / `panTo`. **Keep the current zoom** (do not change zoom). Do
  not drop a marker.
- Parse with the global `mgrs` lib: `mgrs.toPoint(str)` returns `[lng, lat]`. **Strip all
  spaces** from the input first (the display shows a spaced format like `11S NA 1234 5678`,
  but `toPoint` wants `11SNA12345678`). Wrap in try/catch; on invalid input show a toast
  (use `showToast` from `js/toolbar.js`) and don't move the map.
- **Important:** `#coord-display` has `pointer-events: none` in `style.css`. The new input
  + button must be interactive — give the new control its own wrapper with
  `pointer-events: auto` (don't remove `pointer-events:none` from the readout text, or
  mouse-move coordinate tracking under it could be affected). Style it to match the panel.
**Acceptance:** typing a valid MGRS (with or without spaces) and submitting recenters the
map on that point at the current zoom; invalid input shows a toast and does nothing.

### Req 7 — Move the left toolbar 1% to the right
In `style.css`, the toolbar is `#toolbar { left: 16px; }`. Shift it right by 1% of the
viewport width: `left: calc(16px + 1vw);`. The submenus use a fixed `.submenu { left: 58px; }`
that is independent of the toolbar — bump it by the same amount
(`left: calc(58px + 1vw);`) so the submenu-to-toolbar gap is preserved. Verify the
JS submenu positioning (`positionSubmenus`/`toggleSubmenu` in `js/toolbar.js`, which set
only `top`) still lines up.
**Acceptance:** the toolbar sits ~1vw further right; submenus still open flush beside it
without overlapping or gapping.

---

## Final steps (do these after the 7 commits)
1. **Update `AI.md` and `README.md`** to reflect reality. For `AI.md`: document that
   post-creation live editing, the click popover, the selection highlight, the No-Fill
   option, bottom-aligned labels, the MGRS go-to box, and the toolbar shift now exist, and
   remove/correct the stale Phase 7/8 claims about features that didn't actually exist
   before this work. For **both** files: correct the now-stale references to the removed
   API-key `localStorage` prompt (the key is hardcoded) and the removed ad banner /
   monetization placeholders. Commit + push this as a final commit.
2. **Final report:** summarize what you changed per requirement, which behaviors you
   verified vs. only static-checked (remember you cannot run the app here), and any
   follow-ups or risks (especially around undo/redo persistence of the new per-object style
   data, and the popover anchoring on pan/zoom).

Begin now. Implement Req 1 first, commit, push, then proceed through Req 7, then the final steps.
