# Game asset pipeline

The main room system is painted backgrounds with image-coordinate hotspots
in [`office/`](../office/), locked by
[ADR 014](decisions/014-painted-room-point-and-click.md). Its accepted images,
provenance, and verification workflow live in the
[painted-room asset pipeline](office/asset-pipeline.md).

The remaining sections document preserved `game/` work under
[ADR 013](decisions/013-founder-room-godot-restart.md). They are not the main
room authoring workflow. The office retirement leaves Godot assets and tools
intact. Historical `office/assets/` source paths below identify where copies
originated; those obsolete office originals have been archived and removed.

## Godot founder room

- `game/art-source/office/`: committed masters and `exports.json`.
- `game/tools/export_office_art.py`: deterministic ImageMagick exporter.
- `game/assets/office/`: committed runtime PNGs, import settings, and
  SHA-256 provenance for each source/output pair.
- `game/resources/office/*.tres`: the runtime art catalog. Each typed
  resource owns texture, pixel dimensions, ground anchor, and footprint.
- `game/scenes/office/*.tscn`: reusable props and the assembled room.
  The room `.tscn` alone stores placement; native Godot saves and undo
  are the authoring workflow.

Art is exported with nearest sampling, binary alpha and no metadata.
PNG import is lossless, with mipmaps disabled and nearest filtering.
Resources use those native export sizes, without per-instance scaling.
The grid stays 128×64. Larger silhouettes can occupy multiple cells;
transparent padding is not used to force every object into one cell.

The desk’s tabletop items are independent Sprite2D scenes under its
`Tabletop` node: computer, keyboard, and coffee cup. Their root positions
are tabletop contacts, so moving the desk carries the arrangement while
each item remains independently editable. They have no floor collisions.

A prop root is its ground contact point. Its sprite offset derives from
`draw_size * ground_anchor`. The same root carries its collision diamond.
Props share one Y-sorted parent. Floor decorations disable collisions
and draw below furniture. Windows mount separately on a wall plane.
Floor/walls use repeatable materials over resizable native geometry.

Run `python3 game/tools/export_office_art.py` to rebuild. Run the checks
and screenshot command in [`game/README.md`](../game/README.md).
Generated source images are reviewed assets, not guaranteed pixel-perfect
or seamless outputs; compare the rendered room after each art change.

## Provenance and reference

The target is the existing evolved-pixel founder-office mock:
`office/assets/reference/style-explorations/01-evolved-pixel.png`.
It is never loaded by Godot. Desk, chair, plant, water cooler, and founder
masters were copied from the existing `office/assets/*/*-evolved-hd.png`
work on 2026-09-07. Their earlier provider/job attribution is not recorded
in that source kit; this slice does not invent it. The window comes from
`office/assets/furniture/window-evolved-flat.png`.

The new rug was generated with PixelLab Pro, job
`768b6c66-83b9-4ebe-b412-7a4ac7b08e9b`, at 256×128. Prompt: a transparent
2:1 isometric woven office rug with sage border, beige center, large sage
diamond motifs, subtle wool texture, and a continuous pattern, without
furniture, floor, text, or external shadows. The accepted export is the
full independent furnishing. PixelLab Pro also supplied walnut
(job `8fdbca78-e878-45d2-a489-6c7c81729d41`) and plaster
(job `84f16676-c161-4017-9845-e2aa39051ade`) as 256×256 material
masters exported at 128×128. Exact prompts and source origins live in
`game/art-source/office/sources.json`.

Follow-up workstation art uses a bare desk and keyboard isolated with
PixelLab Pro edits, plus newly generated standalone CRT and cup sprites.
Accepted job IDs and prompts are recorded in `sources.json`. The original
composite desk master remains for provenance, outside runtime loading.

The bare desk source has shallower diagonals than the room. The reusable
Godot desk scene applies an affine projection correction to its Sprite,
mapping the measured tabletop axes `(172, -58)` and `(80, 36)` to wall
slopes `-0.5` and `+0.5`. Vertical edges remain vertical. The source PNG
and exports stay unchanged; tabletop props are positioned separately.

For chair, plant, and water cooler, the export recipe enables
`remove_edge_matte`. It removes only bright, nearly neutral pixels at a
transparent boundary, preserving interior highlights and colored edges.
This avoids regenerating furniture that already matches the room. The
exporter test protects those distinctions and deterministic output.

All twelve assets are local runtime files;
no PixelLab connection is needed to run the room.

## Archived Godot spike notes

The remainder of this file documents the historical Godot
`art-source` → `assets` export path. Use it only when copying
provenance into `office/` or inspecting the archived spike.

### Choose the right asset (historical)

PNG is the lossless runtime image format. A sprite sheet is a PNG
containing multiple frames; an atlas contains named regions.

- Characters: transparent fixed-size frame sheets
- World tiles: **128×64** isometric diamonds (ADR 010)
- Furniture/props: **128×128** canvases
- Management UI for the active product is HTML/CSS in `office/`,
  not Godot Controls

### Source, export, runtime (historical)

- `game/art-source/`: editable source artwork and generation
  provenance
- `game/tools/export_*_art.gd`: deterministic source-to-runtime
  exports
- `game/assets/`: committed runtime PNGs and `.import` settings
- `game/.godot/`: disposable local import cache; never commit it

### Rebuild and verify (historical)

From the repository root with Godot 4.7.2 on PATH:

```bash
bash game/tools/export_art.sh
godot --headless --path game --script res://scripts/animation_check.gd
godot --headless --path game --script res://scripts/smoke_check.gd
```

`ART_OK` verifies imported texture settings for the archived spike.
It is not the active product build gate.
