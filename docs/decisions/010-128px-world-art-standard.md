# ADR 010 — 128px world art standard

**Status:** Locked  
**Date:** 2026-09-06  
**Deciders:** Nosh (call)

## Decision

1. **World art authoring size is 128.** Floor diamonds are
   **128×64**. Furniture and loft props are **128×128** square
   canvases (subject sits on the diamond footprint).
2. **Runtime matches authoring for new world art.** Display
   **128×64** floors and **128×128** props 1:1 with nearest
   filtering. The archived Godot spike used `IsoMath` at those
   sizes; the active Phaser client in `office/` may still run a
   64×32 logical grid while atlas art is scaled to fit — migrate
   tile constants when PixelLab 128 assets become the loft floor.
3. **Viewport fit stays 1280×720.** The starter loft remains fully
   visible without pan (camera zoom or fit-to-view), not by
   soft-scaling authored pixels into mush.
4. **Characters follow next.** Current Nosh motion (~48×96 cells)
   is temporarily scaled ×2 in the loft so silhouettes match the
   new tile. A later art pass regenerates crew at the 128 world
   scale; that is not this ADR.
5. **UI chrome is separate.** Desktop OS atlases keep their own
   cell sizes; this ADR does not resize HUD art.

## Why

Nosh preferred 128 as the loft standard over the prior mixed
64/128 PixelLab kit. Art direction already allowed 2× authoring
for crispness; locking 128 removes ambiguity and matches what we
want to see on screen.

## Consequences

- Update [`../office/art-direction.md`](../office/art-direction.md)
  and [`../game-asset-pipeline.md`](../game-asset-pipeline.md).
- Regenerate loft tiles and furniture at 128; retire 64×64 prop
  canvases for new world art.
- Do not invent a second “logical 64 / display 128” pipeline —
  one size in files, one size in `IsoMath`.
