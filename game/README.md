# Warewolf AI Studio — archived Godot P1 spike

**Status:** Archived (2026-09-06). Shipping vehicle is **Phaser 3**
on [`office/`](../office/) per
[ADR 008](../docs/decisions/008-ai-studio-product-contract.md).
Do **not** invest new feature work here. Keep the tree for
provenance / reference art only.

**Engine (historical):** Godot **4.7.2**  
**Slice (historical):** P1 loft walk-to-desk

**Active client:** [`../office/README.md`](../office/README.md)  
**Art for new work:** [`../docs/office/asset-pipeline.md`](../docs/office/asset-pipeline.md)
and [`../docs/office/how-to-run.md`](../docs/office/how-to-run.md).

Historical Godot art notes remain in
[`../docs/game-asset-pipeline.md`](../docs/game-asset-pipeline.md)
(archived spike only).

## Run (historical)

1. Install **Godot 4.7.2** stable (standard build, not .NET / Mono).
2. Import `game/project.godot` (not the repo root).
3. Play (`F5`). Window is 1280×720.

### Headless smoke (historical)

```bash
godot --headless --path game -s res://scripts/smoke_check.gd
godot --headless --path game -s res://scripts/animation_check.gd
```

Expect `SMOKE_OK` and `ANIMATION_OK`.

## What this spike proved

- Starter loft floor from tile PNGs
- Click/tap floor walk; Nosh idle/run sheet
- Desk opens a desktop HUD chrome
- Nearest-neighbor filtering; depth-sorted actors

## Layout

| Path | Role |
| --- | --- |
| `assets/` | Runtime PNGs from the P1 cut |
| `art-source/` | Editable source + provenance |
| `data/starter_loft.json` | 10×8 loft layout |
| `scenes/main.tscn` | Main scene |
| `scripts/` | Iso math, loft world, player, HUD |

No save, economy, or task provider (never reached P2 here).
