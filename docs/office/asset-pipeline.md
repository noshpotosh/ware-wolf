# Office — Painted-room asset pipeline

**Status:** Main room system under
[ADR 014](../decisions/014-painted-room-point-and-click.md).

The accepted PNG is the runtime asset. There is no sprite exporter, palette
reduction, tile assembly, atlas build, or ImageMagick dependency in this path.
Serve `office/` directly and run `npm test` for the active asset checks.

## Retained art and provenance

Paths below are relative to `office/`:

- `assets/rooms/founders-office-background.png`: accepted 1774×887 room.
- `assets/rooms/founders-office-empty-desk.png`: matching mug-removal state.
- `assets/reference/style-explorations/01-evolved-pixel.png`: original source
  reference, retained for provenance; it is not the runtime background.
- `art-source/founders-office-background.json`: source/runtime SHA-256,
  provider, edit prompt, dimensions, and review note.
- `art-source/founders-office-empty-desk.json`: equivalent record for the
  pickup state, sourced from the accepted room background.

The reference’s source hash is recorded in the background provenance JSON.
No earlier provider attribution is invented. Code-native SVG icons/textures
and the illustrated Nosh portrait live under
`assets/ui/`. The retired font bundle is not part of the current game.

## Authoring and verification

1. Preserve the accepted full-room framing and image dimensions. Store a new
   accepted state as a PNG with an explicit source/edit provenance record.
2. Define hotspots, pickup patches, and effect geometry in image pixels in
   `data/founders-office-adventure.json`. IDs are stable action/state keys.
3. Fit the background and overlays using one shared viewBox. A pickup reveals
   only its patch of the alternate image; the rest of the base stays intact.
4. Run `npm test`. It checks provenance hashes, dimensions, polygon bounds,
   pickup state assets, and persistence behavior. It requires Node, not an
   image generator, Phaser, or a browser installation.
5. Use the [browser checklist](how-to-run.md) to inspect silhouettes, effects,
   resizing, keyboard selection, and pickup/return state. Passing byte checks
   does not establish visual quality.

A regenerated edit is a new asset requiring review. Do not regenerate images
just to produce hover outlines or ambient animation; SVG/CSS handles those.

## Legacy retirement

On 2026-09-07, obsolete office raster art, atlas metadata, export recipes,
contact sheet, and screenshot baseline were archived before deletion.
The verified local backup is `/tmp/warewolf-office-legacy-art.tar.gz`, with
per-file SHA-256 records in `/tmp/warewolf-office-retirement.json`.
It includes untracked assets and the old `loft.html`, using repository-relative
paths. Inspect the archive with `tar -tzf`; extract into a separate directory
for recovery so newer work is not overwritten. `/tmp` is local recovery
storage, not durable project storage or a runtime dependency.

The old build, validation, contact-sheet, and visual-smoke tools and their npm
commands are retired. Old gameplay JS/CSS, room data, UI assets, the loft
entry point, and legacy tests have also been removed. Their verified local
backup is `/tmp/warewolf-office-legacy-systems.tar.gz`. The current room is
the only baseline; `npm test` runs all remaining tests.

This retirement changes no files in `game/` or `brand/`. Godot provenance may
still name an old office source path from which its preserved master was
copied; that path is historical, not a current rebuild dependency.

## Repeatable art work order

Before work, record the asset ID, purpose, type (new room / room state /
portrait / localized animation / UI), reference catalog version, exact
reference files, permitted changes, invariants, and intended display size.
Use the templates in [art-prompts.md](art-prompts.md). Include the references
as actual generator inputs, not just filenames mentioned in the prompt.

1. Generate one representative candidate before expanding a batch. For a
   new room use the founder room as style anchor; for an upgrade also supply
   the exact room being edited. Same-room states keep dimensions, camera,
   framing, and coordinates unchanged. New rooms define their own dimensions.
2. Save candidates under `docs/office/mockups/<round>/`, never over accepted
   assets. Store the full prompt, provider/tool and model when reported,
   supplied references and hashes, output dimensions/hash, and allowed delta.
   Do not invent a seed or model identifier the provider did not return.
3. Compare the candidate directly with the approved anchor, at native size
   and the actual in-game display size. Check camera/scale, pixel treatment,
   palette/materials, light direction, repeated-object identity, silhouette,
   alpha fringes, and UI readability. Record pass/fail plus specific evidence.
   Hash checks establish identity, not aesthetic consistency.
4. For a same-room edit, compare before/after outside the intended region.
   Prefer revealing only a local accepted patch. A full regenerated frame is
   not assumed unchanged elsewhere. If a patch cannot hide the drift cleanly,
   revise the candidate rather than compensating with unrelated scene edits.
5. Promote a reviewed candidate into a new versioned runtime filename when
   implementation is authorized. Add its provenance and reference-catalog
   linkage. Never overwrite the anchor to make a mismatching output pass.
6. Update scene geometry, masks, state patches, and asset tests together.
   Run `npm test`, then browser-check hover/focus, pickup/state changes,
   room remount, display resizing, and reduced motion where relevant.
   Inspect all floor edges after any exterior-mask change.
7. Deliver a short review record: what changed, references used, candidate
   selected, comparison evidence, checks passed, and known limitations.
   When crew review is used, Maeve reviews visual fit, Cal verifies behavior,
   and Reed checks code clarity under their existing persona instructions.

## Animation decision order

Use localized code overlays for light, CRT scanlines, and bubbles, following
the existing room-effects builders. Keep the source painting static wherever
possible; never animate the whole room to move a small object.

For actual moving silhouettes, first prepare an accepted clean background
patch plus an isolated foreground layer. Use a short sprite sequence only
when it produces better motion than a simple overlay. Every frame must share
canvas size, anchor, scale, palette, light direction, and occlusion rules.
Record frame order, duration, loop seam, and reduced-motion resting frame.
Review a full-speed loop and a frame contact sheet; reject edge shimmer,
texture crawling, floating bases, ghost silhouettes, and unwanted warping.
Generated frames are candidates, not an automatic animation pipeline.

Pause animation with panels/hidden tabs, remove it on room teardown, and
keep effects out of pointer hit testing. A rejected effect can stay static;
subtle animation is optional and must earn its place visually.

The versioned `art-source/style-reference.json` catalog pins approved reference
bytes, dimensions, and their specific roles. `npm test` detects missing or
replaced references. It cannot judge visual similarity; the comparison above
remains required. When Nosh selects a new anchor, record the reason and update
the catalog version, reference metadata, and related guidance together.
