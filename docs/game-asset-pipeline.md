# World art pipeline (Phaser active / Godot archived)

**Active shipping client:** Phaser 3 under [`office/`](../office/).
Author and ship loft art through
[`office/asset-pipeline.md`](office/asset-pipeline.md) and
[`office/art-direction.md`](office/art-direction.md).

**Archived:** the Godot P1 spike under [`game/`](../game/) and the
export scripts below. Keep them for provenance. Do not add new
Godot feature art unless a later ADR reopens that vehicle.

## Active contract (Phaser / `office/`)

- Classic 2:1 isometric projection
- World authoring target: **128×64** floors / **128×128** props
  ([ADR 010](decisions/010-128px-world-art-standard.md))
- Nearest-neighbor filtering; no image smoothing
- Desk OS stays DOM CSS/HTML; loft sprites load from
  `office/assets/`
- Runtime atlases currently live as cropped sheets under
  `office/assets/{characters,furniture}/` (see `office/js/sprites.js`)

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
