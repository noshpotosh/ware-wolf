# ADR 014 — Painted rooms with point-and-click hotspots

**Status:** Locked — main room system
**Date:** 2026-09-07
**Decider:** Nosh

## Decision

Painted rooms are the main system in `office/`. Nosh explicitly retired the
separately generated office art workflow: consistency and assembly time made
it too costly. The founder’s office establishes the authoring convention.
Future room work follows that convention; additional rooms are not built by
this decision.

- Use an accepted complete room painting. The founder’s office uses the
  evolved-pixel concept with its standing founder removed, preserving the
  composition and visual detail of the accepted edit.
- Render the accepted PNG directly. Do not reconstruct the room from tiles,
  crop the composition, reduce its palette, or generate furniture just to
  reproduce the painting.
- Keep invisible hit polygons and detailed visible outline paths separate,
  both in image pixels. Hover and keyboard focus draw warm silhouette
  feedback. The mug outline retains the opening in its handle.
- Fit the image, hotspots, state patches, and effects together with one
  aspect ratio and coordinate system. Native size is 1:1; smaller viewports
  scale the whole composition uniformly.
- Interaction uses stable action IDs. The current room supports inspection,
  mug pickup/put-back, and persistence across remount/reload. Desktop OS,
  story integration, and additional illustrated rooms remain later work.
- Ambient effects and shell visuals use code-native SVG/CSS, respecting
  pause and reduced motion. The plant stays static in the accepted
  background. No generated animation frames are needed.
- The compact shell uses an illustrated founder portrait, inventory slots,
  Journal and Menu. Location and subtitle sit top left; actual local date
  and time sit top right. Simulated time and time controls are removed.
- Nosh’s object observations use a separate visual-novel nameplate and speech
  banner. Inventory is the default view; dialogue replaces it temporarily.
  The portrait is a generated transparent PNG with recorded provenance.
- `office/index.html` is the only entry point. Existing `game/` and `brand/`
  files are preserved outside the active web-game reset.

This supersedes ADR 008’s Phaser vehicle requirement for the main room
system, ADR 013’s separate-asset authoring direction as the main path,
ADR 010’s fixed prop-size requirement for painted rooms, and office ADR 002’s
walking requirement. ADR 007’s product thesis and ADR 008’s trust requirements
remain in force. The renderer uses SVG and DOM without an engine dependency.

## Art retirement and verification

Preserve both `office/assets/rooms/founders-office-background.png` and
`founders-office-empty-desk.png`, plus the original
`office/assets/reference/style-explorations/01-evolved-pixel.png`. Preserve
the two source/runtime provenance JSONs in `office/art-source/`.

The other obsolete office raster assets, generated metadata, recipes,
contact sheet, and screenshot baseline are retired. Archive tracked and
untracked retirement files before deletion. The verified local recovery copy
is `/tmp/warewolf-office-legacy-art.tar.gz`; per-file hashes live in
`/tmp/warewolf-office-retirement.json`. This local backup is not a durable
repository archive. Godot’s independent assets are outside the deletion set.

Nosh also requested a code reset to this single room. Remove walking,
pathfinding, NPC simulation, economy/upgrades, goals, desktop apps, agent
messaging, dialogue, the Phaser renderer, and their unused data/UI/tests.
Keep inspection, mug inventory, local clock, portrait state, and ambient
effects. Add new mechanics only when needed by the current game.

The removed source files have a verified local recovery archive at
`/tmp/warewolf-office-legacy-systems.tar.gz`. There is no retained legacy
runtime in `office/`. `npm test` runs every remaining test.

## Tradeoff

The accepted edited PNG is the exact runtime asset. Character removal is an
AI edit, not a guarantee of identical pixels outside the edit. The generated
mug-removal image is revealed only inside its pickup patch; the rest of the
accepted background remains unchanged. Provenance hashes and bounds checks
protect that contract, while visual quality still requires browser review.

Furniture cannot move independently. A different composition needs an
updated painting and matching traces. This system does not yet prove
arbitrary object movement, multi-room authoring, or large upgrade variants.

See the [asset pipeline](../office/asset-pipeline.md) and
[run guide](../office/how-to-run.md) for the current workflow.


## Approved desktop implementation

Nosh subsequently approved implementing the cream-and-charcoal desktop
mockups when clicking the computer. This is a new scoped desktop, not a
restoration of the retired gameplay systems. It includes Mail and Teams
local drafts, a searchable crew Directory, an empty Documents folder, and
return-to-office navigation. No external messaging service is connected.
The room shell and desktop both keep the existing local wall-clock time.
