# Warewolf — Founder’s Office

The main room system is a **painted point-and-click room**. Cold load opens a
Warewolf title gate; **Enter office** reveals the room. It uses the
original evolved-pixel concept with the founder removed. Hover over the
computer, mug, or water cooler for a glow; click to inspect. Tab and
Enter/Space also work; Escape closes the inspection.

Pick up the mug from its inspection dialog. It appears in inventory and
disappears from the desk. Inspect the inventory mug to put it back.
“Leave office” unmounts the scene and opens a simple return screen; returning
rebuilds it from saved state. There is no second illustrated room yet.
Inventory survives reloads through localStorage (warewolf.adventure.v1).
Legacy simulated-time fields are ignored. The top-right clock shows the
computer’s actual local date and time, updating each second. There are no
time acceleration, waiting, or pause controls. Portrait status text follows
the local hour; the illustrated portrait itself is static.

The compact exploration shell has five inventory slots, an illustrated Nosh
portrait, and Journal/Menu buttons. Journal describes the current room and
mug state. Menu contains controls/help and Leave office. Inspecting an object
opens Nosh’s visual-novel speech banner, hiding the inventory until Continue
or Escape. The actual inventory save is preserved across these UI states.
The speaker banner currently supports Nosh’s observations; other characters
and branching conversations have not been added.

Localized SVG overlays animate the CRT phosphor, scan sweep and cursor,
warm sunlight through the blinds, and occasional bubbles inside the bottle.
The blinds themselves stay fixed. Geometry lives under effects in the room
JSON; construction is in js/roomEffects.js, timing in css/roomEffects.css.
Overlays ignore pointer input. Inspection and hidden tabs pause animations;
leaving removes them. Reduced-motion preferences keep the lighting steady
and hide the scan sweep and bubbles. The plant remains static in the
original accepted background.

```bash
cd office
python3 -m http.server 8765
```

Open [the office](http://127.0.0.1:8765). No npm install is needed for
the main room system. There is no walking or furniture assembly.

The accepted 1774×887 PNG loads directly. A shared SVG viewBox fits the
whole image and its invisible silhouette hotspots together, so there is
no per-object placement drift or separate generated highlight artwork.

To add an interaction, add a hit polygon and a separate detailed outline
path in image pixels to
`data/founders-office-adventure.json`. Its `id` is the stable action key;
`label` and `description` supply the current inspect dialog. The mug
outline preserves the opening in its handle independently of its hit area.
Pickup definitions
reference a matching empty-state image and a small image-coordinate patch.
Only that patch is revealed when collected; all other background pixels
remain the accepted original. State and persistence live separately in
js/adventureState.js. The current action and inventory icon are mug-specific;
generalize those when adding a second pickup. Additional rooms can reuse the
same image-coordinate convention and effect builders.

Checks: npm test. Browser acceptance: hover each object, click, dismiss
with Escape, Tab/Enter through the objects, and resize to check alignment.
Collect the mug, leave/return, reload, and put it back. Check that bubbles
stay inside the bottle and illumination aligns with the painted surfaces.

[Pivot decision](../docs/decisions/014-painted-room-point-and-click.md).
Image edit provenance: art-source/founders-office-background.json.
Mug removal provenance: art-source/founders-office-empty-desk.json.

## Code baseline

Only the current founder’s office is implemented. Build future mechanics
from this baseline when they are needed.

- `js/pointAndClick.js`: scene rendering, inspection, inventory UI, and shell.
- `js/startMenu.js`: cold-boot title gate before the painted room.
- `js/adventureState.js`: inventory save/load.
- `js/worldClock.js`: local date/time formatting and status.
- `js/roomEffects.js`: monitor, window light, and cooler effects.
- `data/founders-office-adventure.json`: this room’s artwork, hit targets,
  outlines, effect placement, and mug state patch.
- `css/pointAndClick.css` and `css/roomEffects.css`: shell and ambient styling.

Walking, pathfinding, NPC simulation, economy, upgrades, goals, desktop OS,
agent messaging, dialogue, and the Phaser renderer have been removed along
with their old data, UI assets, tests, and entry page. There is no legacy
runtime or engine dependency in this directory. The existing inventory save key is unchanged.

`npm test` runs every remaining test: accepted artwork/provenance, image
coordinates and pickup patches, entry dependencies, inventory persistence,
and local-clock formatting/save migration. Browser checks above cover visual acceptance.

Verified local recovery copies of retired tracked and untracked files live
at `/tmp/warewolf-office-legacy-art.tar.gz` and
`/tmp/warewolf-office-legacy-systems.tar.gz`. These are temporary backups,
not runtime dependencies or durable repository archives. Independent Godot
work in `game/` and company material in `brand/` remain outside this reset.

## Docs

- [Main room decision](../docs/decisions/014-painted-room-point-and-click.md)
- [Art direction](../docs/office/art-direction.md)
- [Asset pipeline](../docs/office/asset-pipeline.md)
- [How to run](../docs/office/how-to-run.md)

The textured olive-charcoal exterior uses a pixel-stepped room silhouette
traced from the accepted PNG, including the full floor sides. The source
image is unchanged; only the exterior void is clipped at render time.
The clock badge and inventory use subtle grain and inset brass frames.
The inventory portrait stays inside the bar, while the separate dialogue
portrait can rise above its banner.


## Computer desktop

Click the computer or activate it with Enter/Space to open the desktop.
Mail, Teams, Directory, and Documents open from shortcuts or the taskbar.
Window controls minimize/close or expand the single application view.
Back to office and Escape return focus to the computer; room effects pause
while the desktop is open. The desktop clock uses the same local time as
our room shell.

Directory supports name/role search, profile selection, and session-only
favorites. Message in Teams opens that person's local draft. Mail Reply
opens a draft to the Building Manager. Save draft stores these in browser
localStorage under warewolf.desktop.drafts.v1. Nothing is transmitted:
there is no Microsoft Teams connection, email service, or simulated reply.
Documents is an empty folder until a story calls for documents.

Implementation: js/desktopOS.js, js/desktopPeople.js, css/desktopOS.css.
The approved mockup supplies icons/portraits through SVG viewBox crops;
frames, wallpaper, controls and text are real DOM/CSS. Provenance is in
art-source/desktop-ui.json. The pixel font includes its OFL license.
