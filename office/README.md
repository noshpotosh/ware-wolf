# Warewolf Virtual Office

Internal isometric pixel office for Warewolf.

## Status

**Active shipping web client** (2026-09-06): honest AI studio
tycoon under
[`../docs/decisions/007-honest-ai-studio-tycoon.md`](../docs/decisions/007-honest-ai-studio-tycoon.md);
vehicle is Phaser 3 on this folder per
[`../docs/decisions/008-ai-studio-product-contract.md`](../docs/decisions/008-ai-studio-product-contract.md).
Desk OS stays DOM; loft canvas migrates to Phaser.

**Next product lock** (2026-09-06): loft × visual-novel hybrid —
Founder’s Office + shared loft, player-only walk, flash reseat for
crew, VN flavor panels separate from Teams. See
[`../docs/office/decisions/002-loft-vn-hybrid.md`](../docs/office/decisions/002-loft-vn-hybrid.md).

Plan complete through Phase 6 polish:

- Phase 0 — art + product lock
- Phase 1 — static shell + isometric loft
- Phase 2 — Nosh click-to-walk + camera follow
- Phase 3 — staff NPCs, walk-then-talk, living bubbler
- Phase 4 — desk desktop OS (Teams, Directory, Goals, Loft)
- Phase 5 — company bucks, goals, upgrades, office catalog + history
- Phase 6 — mute / reduced-motion / docs how-to-run

## Run

```bash
cd office
npm install
python3 -m http.server 8765
```

Open [http://127.0.0.1:8765](http://127.0.0.1:8765).

Phaser 3 owns the loft canvas; the desk OS stays DOM.

### Controls

- Click floor to walk
- Click a desk / prop / door to walk over, then interact
- `E` — interact when prompted (doors change rooms)
- `M` — mute / unmute UI blips
- Desk PC (Founder's Office only) → Teams, Directory, Goals, Loft
- `Esc` — close window / leave desk

`prefers-reduced-motion: reduce` snaps walks, disables character
bobbing, and shortens room-flash transitions. The camera fits the
full room, including walls, to the viewport.

## Visual implementation

The room uses a 64×32 logical isometric grid and a pixel-resolution canvas.
Cream walls, timber trim, a central checked rug, CRT desks, seated staff, and small
personal props follow the original art direction. Static room textures are
cached; characters and upgrade effects remain live. Desks are staggered
around an open center in both offices. Accepted runtime PNGs load from
`assets/furniture/` and `assets/characters/`. The reference PNGs are
never loaded as game backgrounds.

Teams and Directory use cream patterned wallpaper and dark beveled chrome.
Directory portraits match the crew sprites; names, roles, search,
presence, and conversations remain accessible HTML. Goals and Loft stay
available alongside the two original apps.

Run camera, pointer, and layout reachability checks with Node:

```bash
node office/tests/artDirection.test.mjs
```

Run that command from the repository root.

## Docs

- [Product scope ADR](../docs/office/decisions/001-virtual-office-scope.md)
- [Art direction](../docs/office/art-direction.md)
- [Asset pipeline](../docs/office/asset-pipeline.md)
- [How to run](../docs/office/how-to-run.md)

## Reference mocks

- [Starter office hero](assets/reference/starter-office-hero-mock.png) (style lock; wrong cast names)
- [Starter office + real crew](assets/reference/starter-office-hero-crew-mock.png) (correct-cast lock)
- [Pack Loft hero](assets/reference/pack-office-hero-mock.png)
- [Office decor upgrades sheet](assets/reference/office-decor-upgrades-sheet.png)
- [Crew outfit lineup](assets/reference/crew-outfit-lineup-mock.png)
- [Crew portraits sheet](assets/reference/crew-portraits-sheet.png) (Directory art lock)
- [Desk desktop OS](assets/reference/desk-desktop-os-mock.png)

### Implementation cut sheets (1× loft px)

- [Tile atlas](assets/reference/sheets/tile-atlas-sheet.png)
- [Furniture kit](assets/reference/sheets/furniture-kit-sheet.png)
- [Character sprites](assets/reference/sheets/character-sprites-sheet.png)
- [Upgrade overlays](assets/reference/sheets/upgrade-overlays-sheet.png)
