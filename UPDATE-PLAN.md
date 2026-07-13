# Simple SITTEMP — Update Plan (2026-07-11)

Implementation plan for two confirmed issues plus follow-on findings from a code review.
Written to be executed start-to-finish by an AI coding agent with no other context.
Verified against `main` at aa19e8b ("Docs: Update AI.md and README.md for all 7 new features").
Follow the repository workflow rules in `tasks/sonnet-prompt.md` (zero-build, work on `main`,
one commit per task, push after each, `node --check` every touched JS file).

## How to run and verify the app

- Zero-build static site. Serve the repo root: `python -m http.server 8749`, open `http://localhost:8749`.
- A Google Maps API key is hardcoded in `app.js:29`; the map may or may not load, but **all UI chrome (toolbar, submenus, style panel, coordinate display) renders without the map**, which is enough to verify both fixes.
- Click "I Understand" on the classification modal first (it blocks the view once per browser session).
- The tactical task palette: left toolbar → the arrow-into-bar icon ("Tactical Tasks") opens `#submenu-tactical-tasks`.

---

## Task 1 — Fix overlap: MGRS coordinate window vs. Line Types (style) panel

### Root cause
Two independently absolute-positioned boxes share the right edge with unrelated offsets:

- `#coord-display` (`style.css:712`): `top: 10px; right: 10px;` — now contains three rows (Lat/Lon, MGRS, and the "Go to MGRS..." input row added by Req 6), intrinsic height ≈ 77 px, so its bottom edge sits at ≈ 87 px.
- `#style-panel` (`style.css:587`): `right: 10px; top: calc(60px + 2vh);` — top edge ≈ 71–75 px on typical windows.

Measured overlap: **~13–16 px at every viewport size** (e.g. 16 px at 1100×550). The panel's `calc(60px + 2vh)` was tuned for the old two-row coordinate box and was never tied to the box's actual height, so the Req 6 input row pushed them into permanent collision. Do not just bump the constant — make the layout structural.

### Fix (structural)
Stack both boxes in one right-side rail so the panel always clears the coordinate display:

1. **index.html** — wrap the two existing elements (keep their ids; `js/export.js:129` hides them by id during capture):
   ```html
   <div id="right-rail">
       <div id="coord-display"> ... existing content ... </div>
       <div id="style-panel"> ... existing content ... </div>
   </div>
   ```
   Note: in the current file `#style-panel` appears *before* `#coord-display`; move them so `#coord-display` is first inside the rail.

2. **style.css**
   ```css
   #right-rail {
       position: absolute;
       top: 10px;
       right: 10px;
       bottom: 10px;
       display: flex;
       flex-direction: column;
       align-items: flex-end;
       gap: 8px;
       z-index: 1001;
       pointer-events: none;   /* rail must not block map interaction */
   }
   ```
   - `#coord-display`: remove `position/top/right/z-index`; keep `pointer-events: none`. The nested `.mgrs-goto-row` already re-enables interaction via inline `pointer-events: auto` — verify the Go-to-MGRS input and button remain clickable after the change.
   - `#style-panel`: remove `position/top/right/z-index`; add `pointer-events: auto;` and, so it never runs off-screen on short windows: `flex: 0 1 auto; min-height: 0; overflow-y: auto;`.

### Verify
- Serve the app; in DevTools run:
  `document.getElementById('coord-display').getBoundingClientRect().bottom < document.getElementById('style-panel').getBoundingClientRect().top` → must be `true` (before the fix this fails by ~13–16 px).
- Repeat at viewport 1280×720, 1100×550, and with DevTools zoom/emulated DPR changes. No overlap in any case; style panel scrolls internally when the window is short.
- Confirm the Go-to-MGRS input/button still accept clicks and typing, map pan/zoom still works in the empty area left of the rail, swatches/sliders still clickable, and PNG export still hides both boxes (`js/export.js:129` uses the same ids).
- Hard-refresh (Ctrl+F5) when re-testing — the local server serves cached copies otherwise.

---

## Task 2 — Correct tactical task graphics to approved US Army symbology (FM 3-90 / ADP 1-02)

All 15 graphics live in **one function**: `tacticalTaskSVG(key, color, strokeWidth)` in `js/symbols.js` (~line 560). Every consumer (submenu previews in `js/toolbar.js` `buildTacticalTasksSubmenu`, placed markers, rotation/scale/label rebuilds in `js/drawing.js`) calls this function, so geometry fixes are confined to `js/symbols.js`.

**Contract to preserve** (do not change):
- Signature `tacticalTaskSVG(key, color, strokeWidth)`; keys in `TACTICAL_TASK_LIST` unchanged.
- Each SVG: `viewBox="0 0 350 350"`, stroke width `sw = strokeWidth * (350/40)`, color `c` parameterized.
- The symbol is later squeezed into a 40×40 box by `buildSymbolWithLabels()` — use the full 350×350 canvas, keep content visually centered, and keep line weights consistent between symbols.

### Step 2a — Obtain ground-truth figures (mandatory, do this first)
The current SVGs were drawn from memory and several are wrong. Do **not** redraw from your own memory either — work from the official figures:

1. Search armypubs.army.mil for **"FM 3-90 Tactics"** (1 May 2023) and **"ADP 1-02 Terms and Military Symbols"**. Both are public PDFs.
2. Download the PDF(s) to the scratchpad directory (ask the user for permission to download if the harness requires it).
3. Each tactical mission task section in FM 3-90 opens with a figure of its graphic ("Tactical mission graphic"); ADP 1-02 has a consolidated tactical mission task table. Use the `Read` tool with the `pages` parameter to view those pages **visually** and transcribe the exact geometry of each graphic before writing any SVG.
4. If armypubs is unreachable, fall back to the FM 3-90 Appendix B mirror at globalsecurity.org (`/military/library/policy/army/fm/3-90/appb.htm`) opened in the browser tool so figures are visible.

### Step 2b — Per-symbol corrections
"HIGH" = confirmed defect and confirmed correct form; implement as stated. "VERIFY" = current version is wrong or doubtful; take exact geometry from the figure.

| Key | Current rendering | Problem | Approved form (confidence) |
|---|---|---|---|
| `block` | Arrow into vertical bar **with horizontal caps** at both ends | Caps are not doctrinal | Arrow terminating at a **plain** line perpendicular to it. Delete the two cap `<line>`s. (HIGH) |
| `fix` | Straight arrow + letter "F" + bar at tip | No letter, no bar in doctrine | Arrow whose **shaft middle is a jagged zigzag** ("the broken part of the arrow"), straight tail and head segments. (HIGH) |
| `disrupt` | Single arrow + letter "D" + Z-cut | Wrong composition | Vertical line on the friendly side with **three parallel arrows of staggered lengths** extending from it toward the enemy (center arrow longest/points at target). No letter. (VERIFY details in figure) |
| `delay` | Arrow + chevron + bar | Non-doctrinal composite | Take from figure. (VERIFY — current form is not the approved graphic) |
| `seize` | Arrow + letter "S" into circle | Letter is wrong; circle placement doubtful | Arrow with a **small circle at its tail**, arrowhead pointing at the objective; no letter. (VERIFY circle placement/arc in figure) |
| `neutralize` | Arrow + letter "N" + Z-cut | Wrong composition | Two crossed diagonal lines (an X) placed over the target — check figure for arrowhead placement on line ends; no letter, no shaft. (VERIFY) |
| `destroy` | Arrow with X over the shaft | Doubtful | Crossed lines over the target; confirm whether arrow shaft is part of the graphic and how it differs from neutralize/interdict. (VERIFY) |
| `occupy` | Circle + tick + letter "O" | Letter is wrong | Area oval with entering-arrow composition per figure (FM notes an "X" element with no significance). (VERIFY) |
| `secure` | Two arcs + arrowhead + letter "S" | Letter is wrong | Enclosing arrow bent around the area, arrowhead closing the loop; no letter. (VERIFY arc form) |
| `isolate` | Full sawtooth starburst circle | Wrong | Circle drawn as a bent arrow around the enemy with a **portion of the circumference jagged/sawtooth**; arrowhead present. (VERIFY) |
| `clear` | Arrow + three diagonal slashes | Wrong | **Bar (limit of advance) connected to three parallel arrows** pointing into it. (VERIFY exact arrangement) |
| `breach` | Arrow crossing a broken vertical line | Doubtful | Arrow passing between two "arms" that flank the breach area (arms extend the depth of the obstacle). (VERIFY arm orientation) |
| `attack_by_fire` | Diagonal arrow with bar at tip | Wrong | Straight arrow pointing at the target with an **open "V" (chevron) tail** at its base; no bar at tip. (HIGH) |
| `follow_and_assume` | Dashed arrow + box with letter "A" | Letters/dashes wrong | Large **outlined (double-line) arrow with an open box at the tail** (box goes around the followed unit); no letter, not dashed. (VERIFY fill/outline details) |
| `follow_and_support` | Dashed arrow + box with letter "S" | Letters/dashes wrong | Same family as follow-and-assume but distinguished per figure (typically the filled variant). (VERIFY) |

General rules: no alphabetic letters on any of these 15 graphics; arrows oriented left→right (toward enemy) to match the existing rotation convention; all geometry parameterized on `${c}` and `${sw}` exactly like the current code.

### Step 2c — Verify
1. Serve the app, open the Tactical Tasks submenu, and screenshot the grid (browser tool). Compare each icon side-by-side against the doctrine figures.
2. Place each symbol on the map; test rotate (R / Shift+R), Scale slider, color change (must re-render via `updateMarkerColor`/`buildSymbolWithLabels` path), and left/right labels.
3. Run a KML export with a few tasks placed — confirm no errors in the console.

---

## Task 3 — Additional findings (recommended, do after Tasks 1–2)

1. **Exposed Google Maps API key** — `app.js:29` hardcodes a live API key in a public GitHub repo. Do not commit new keys. Recommend: restrict the key to the GitHub Pages referrer in Google Cloud Console, or restore the localStorage prompt flow described in `AI.md`. At minimum flag this to the repo owner in the PR description.
2. **Toolbar clipping on short viewports** — `#toolbar` (`style.css:105`, now at `left: calc(16px + 1vw)`) is vertically centered with ~14 buttons (~560 px tall); below ~600 px viewport height the top/bottom buttons are unreachable. Add `max-height: calc(100vh - 20px); overflow-y: auto;` to `#toolbar`.
3. **Classification banner collision** — `#classification-banner` (centered) and `#mgrs-controls` (left: 70px, width ≈ 312px) collide below ~900 px viewport width. Low priority; consider moving the banner or making `#mgrs-controls` wrap.
4. **Duplicate lists** — `ENEMY_UNIT_LIST` is an exact copy of `UNIT_LIST` in `js/symbols.js`. Replace with `export const ENEMY_UNIT_LIST = UNIT_LIST;` or derive it.
5. **Docs drift** — `AI.md` and `README.md` describe an older UI (color submenu, 10 toolbar buttons, 24 equipment symbols, MGRS scale options). Update after Tasks 1–2 land.

## Commit guidance
- Follow `tasks/sonnet-prompt.md`: work directly on `main` of this repo, one commit per task, push to `origin/main` after each (note: `simple-sittemp/` is its own git repo, separate from the Desktop repo that contains it).
- Update `AI.md` "Current State" section as part of each commit.
