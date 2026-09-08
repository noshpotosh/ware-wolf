# Office — Painted scenes

`office/index.html` is the main Office game. It uses complete painted scenes
with small SVG/DOM touches in the same image-coordinate space.

## What is here

- A painted command-table main menu with an accessible HTML menu and CRT
  surface effect.
- Character-first company creation.
- The complete painted bedroom office.
- The complete painted house kitchen.
- A compass office map connecting the playable rooms.
- Exact object-mask highlights, hotspot polygons, point and surface effects,
  a mug state patch, and a bedroom-door transition.
- DesktopOS on the bedroom computer.

The bedroom and kitchen are not assembled from furniture pieces. Their
accepted paintings are the runtime art.

## Play

```bash
cd office
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765/`.

Pointer and keyboard input both work. Tab selects objects, Enter or Space
activates them, and Escape closes conversations and panels. Inventory,
company setup, and the current room persist in `warewolf.adventure.v1`.

The bedroom computer opens DesktopOS. Mail and Teams keep local drafts,
Directory supports search and session favorites, and Documents is an empty
local folder. Nothing is transmitted to external services. Desktop drafts use
`warewolf.desktop.drafts.v1`.

## Scene catalogue

```bash
cd office
npm run catalogue
```

Open `http://127.0.0.1:8766/`.

The catalogue lists only whole approved paintings. Select a scene to preview
its annotations and add or adjust:

- cropped alpha masks for object highlights;
- four-corner surfaces for CRT or glow effects;
- point anchors for steam or glow effects.

Select a touch and drag it over the painting. Surface annotations expose one
handle per corner. The numeric fields update with the drag; **Save Touch**
writes the new coordinates. Zoom from 50% to 600% for precise placement.

It writes the owning scene definition and mask PNGs only. Use
`http://127.0.0.1:8765/?debug=scene` for the runtime alignment overlay.

## Structure

- `data/scene-catalog.json`: approved whole-scene catalogue.
- `data/office-map.json`: playable rooms and reciprocal connections.
- `data/founders-office-adventure.json`: bedroom interactions and states.
- `data/house-kitchen-adventure.json`: kitchen interactions.
- `data/main-menu-scene.json`: menu annotations and effect bindings.
- `js/pointAndClick.js`: room shell, interaction, inventory, and navigation.
- `js/sceneAnnotations.js`: validation, fitting, and debug overlay.
- `js/sceneGeometry.js`: contain/cover fitting and surface projection.
- `js/sceneEffects.js`: CRT, steam, and glow presets.
- `js/officeGraph.js`: office-map validation.
- `js/desktopOS.js`, `desktopPeople.js`, `desktopArt.js`: DesktopOS.
- `tools/scene-catalogue/`: focused local scene-touch editor.

## Verify

```bash
cd office
npm test
```

Then check the menu CRT, company setup, bedroom masks and effects, DesktopOS,
mug pickup, animated kitchen transition, kitchen targets, map navigation,
reload persistence, responsive alignment, hidden-tab pause, and reduced
motion.

See [ADR 014](../docs/decisions/014-painted-room-point-and-click.md), the
[art direction](../docs/office/art-direction.md), the
[pipeline](../docs/office/asset-pipeline.md), and the
[run guide](../docs/office/how-to-run.md).
