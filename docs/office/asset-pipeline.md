# Virtual Office — Asset pipeline

**Status:** Active for Phaser loft (`office/`)  
**Date:** 2026-09-05  
**Vehicle:** Phaser 3 + DOM desk OS ([ADR 008](../decisions/008-ai-studio-product-contract.md))

## Folders

```
office/assets/
  reference/           # mocks, moodboards (not loaded by the game)
  reference/sheets/    # loft-scale cut guides / atlases (still not loaded)
  tiles/               # floor, walls
  furniture/           # desks, chairs, bubbler, upgrades
  characters/          # Nosh + staff sprites / portraits
  ui/                  # desktop icons, window chrome if raster
  audio/               # later
```

`reference/sheets/` holds **implementation cut guides** at 1× loft px
(sprite atlas layout with pipeline filenames). Humans and Dex use them
to cut runtime PNGs into `tiles/`, `furniture/`, and `characters/`.
The game must not load anything under `reference/`.

## Naming

Use kebab-case. Include role in the name.

Target pipeline names from the cut sheets:

- `tiles/floor-carpet.png`
- `tiles/floor-island.png`
- `tiles/floor-wood-border.png`
- `furniture/desk-basic.png`
- `furniture/chair-basic.png`
- `furniture/chair-better.png`
- `furniture/monitor-crt.png`
- `furniture/desk-nosh-mat.png`
- `furniture/bubbler.png`
- `furniture/coffee.png`
- `furniture/whiteboard.png`
- `furniture/plant-desk.png`
- `furniture/lamp-desk.png`
- `furniture/amber-neon.png`
- `characters/nosh-idle.png`
- `characters/fabrizio-idle.png`
- `characters/maeve-idle.png`
- `characters/dex-idle.png`
- `characters/cal-idle.png`
- `characters/reed-idle.png`
- `characters/nosh-walk-1.png`
- `characters/nosh-walk-2.png`

Also still valid later:

- `characters/maeve-portrait.png`
- `ui/icon-teams.png`
- `ui/icon-directory.png`

## Grid contract

- Isometric diamond **64×32** logical tile
- Export sprites with transparent backgrounds (PNG)
- Keep a 1px ink outline where it helps silhouette
- Prefer atlases later; individual PNGs are OK for Phase 1–2

## UI text

Teams + Directory body text should be **HTML/CSS**, not baked into pixel bitmaps — readability wins (house principle #1).

## Reference vs runtime

Files in `reference/` (including `reference/sheets/`) are for humans
and cut guides. Runtime code must not depend on them.

## Current runtime art

The September UI fidelity pass adds accepted art to `furniture/` and
`characters/`: a CRT desk, six furniture/plant props, six crew figures,
and six portraits. Source rectangles and asset loading live in
`office/js/sprites.js`; the game waits for these assets and its local font
before drawing. Sprite and portrait scaling uses nearest-neighbor sampling.

Generation prompts and provenance: [art-prompts.md](art-prompts.md).
The desktop icons and wallpaper are code-native SVG pixel artwork under
`office/assets/ui/`. Pixelify Sans is bundled under `assets/fonts/`, with
its SIL Open Font License beside it. Runtime needs no remote font service.
