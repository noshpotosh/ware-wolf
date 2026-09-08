# Office — Painted-scene pipeline

**Status:** Main scene system under
[ADR 014](../decisions/014-painted-room-point-and-click.md).

Runtime art is a small set of approved complete paintings plus optional masks,
state patches, and transition frames. There is no furniture library, room
assembly, atlas build, palette reducer, image generator, or engine dependency.

## Scene catalogue

`office/data/scene-catalog.json` is the art catalogue. Each entry records:

- a stable scene ID and player-facing label;
- one approved complete painting;
- its runtime definition and provenance;
- native dimensions, fit mode, kind, and search tags.

Run the local catalogue editor with:

```bash
cd office
npm run catalogue
```

Open `http://127.0.0.1:8766/`. The editor previews every approved painting
and its current annotations. It can add or update:

- cropped object masks and their bounds;
- four-corner surfaces with CRT or glow effects;
- point anchors with steam or glow effects.

The editor writes only the selected scene definition and mask PNGs below
`office/assets/interaction-masks/`. Mask PNG dimensions must exactly match
their declared width and height. Scene and annotation validation runs before a
definition is saved.

Select an existing touch to drag it over the painting. Object masks and point
anchors move as a unit. Surface annotations expose four corner handles and
can also move as a unit. Dragging updates the numeric form as a draft; use
**Save Touch** to write the new coordinates.
Zoom controls range from 50% to 600%; the painting and overlay share the same
scrollable canvas, so drag coordinates remain accurate at every zoom level.

Use `?debug=scene` in the game for a read-only overlay with current masks,
hotspots, points, and surface handles.

## New complete painting

1. Write one work order: purpose, permitted change, invariants, native canvas,
   and required approved references.
2. Generate or edit one candidate from the original approved anchors.
3. Keep candidates under `docs/office/mockups/<scene>/` with prompt and job
   metadata.
4. Review the entire painting at native size for camera, scale, materials,
   lighting, seams, silhouettes, and accidental text.
5. Copy the accepted PNG to a versioned runtime path.
6. Record source/runtime hashes, dimensions, provider, model, prompt, and
   acceptance reason under `office/art-source/`.
7. Add one scene-catalogue entry and its runtime definition.
8. Add interactive touches only where the product needs them.

Do not generate furniture separately to recreate the accepted painting. A
room-wide edit produces another full-scene candidate.

## Masks and effects

An object mask is a tightly cropped PNG whose alpha matches the visible object.
Keep the handle opening in the coffee mug and similarly meaningful holes in
other objects. The hotspot remains a separate forgiving polygon.

A surface is four scene-space corners in clockwise TL, TR, BR, BL order. The
runtime maps a clean local effect rectangle onto those corners. Use this for
the main-menu and bedroom CRTs.

A point is one scene-space coordinate for a small emitter. The bedroom coffee
steam is the current example.

Effects are code-native presets in `office/js/sceneEffects.js`. Add a new
preset only when an existing effect cannot express a product need.

## State patches and transitions

The mug removal uses a separately reviewed full-scene edit but reveals only a
small feathered patch. The bedroom door uses one reviewed open-door scene
patch and six fixed-canvas transparent frames. Reduced motion or missing
transition assets skips animation and preserves navigation.

## Acceptance

Run `npm test`. In the browser, verify pointer and keyboard interaction,
native and small viewport alignment, map navigation, reload persistence,
pause/reduced motion, the main-menu CRT, the bedroom CRT and steam, the door
transition, the kitchen, and DesktopOS.
