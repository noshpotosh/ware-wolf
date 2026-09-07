# Docs

One map. Not a pile of READMEs.

| Path | What lives here |
| --- | --- |
| [`culture.md`](culture.md) | Culture + principles |
| [`coding-standards.md`](coding-standards.md) | How we write code |
| [`pr-discipline.md`](pr-discipline.md) | Scoped PRs + who merges |
| [`brand.md`](brand.md) | Name, logo, visual system |
| [`decisions/007-honest-ai-studio-tycoon.md`](decisions/007-honest-ai-studio-tycoon.md) | Active product thesis |
| [`decisions/008-ai-studio-product-contract.md`](decisions/008-ai-studio-product-contract.md) | P0 trust contract; vehicle superseded by ADR 014 |
| [`decisions/010-128px-world-art-standard.md`](decisions/010-128px-world-art-standard.md) | Historical loft grid; painted rooms follow ADR 014 |
| [`decisions/011-ehlenbachs-shopify.md`](decisions/011-ehlenbachs-shopify.md) | Ehlenbach's redesign ships on Shopify (Liquid) |
| [`decisions/012-ehlenbachs-shopify-basic-customize.md`](decisions/012-ehlenbachs-shopify-basic-customize.md) | Ehlenbach's: Basic plan + customize-first theme |
| [`ai-studio-game-plan.md`](ai-studio-game-plan.md) | Historical Phaser implementation plan under ADR 008 |
| [`../office/`](../office/) | Main painted-room web client — see [`../office/README.md`](../office/README.md) |
| [`office/`](office/) | Painted-room art direction, pipeline, and run guide |
| [`office/art-direction.md`](office/art-direction.md) | Shared art consistency contract and reference hierarchy |
| [`office/asset-pipeline.md`](office/asset-pipeline.md) | Art work orders, provenance, animation, and acceptance checks |
| [`office/art-prompts.md`](office/art-prompts.md) | Copyable agent briefs and generation templates |
| [`../office/art-source/style-reference.json`](../office/art-source/style-reference.json) | Versioned approved images, hashes, and reference scopes |
| [`office/decisions/002-loft-vn-hybrid.md`](office/decisions/002-loft-vn-hybrid.md) | Historical loft × VN contract; walking superseded by ADR 014 |
| [`game-asset-pipeline.md`](game-asset-pipeline.md) | Main office pipeline link + preserved Godot pipeline |
| [`../game/`](../game/) | Preserved Godot founder room — see [`../game/README.md`](../game/README.md) |
| [`decisions/013-founder-room-godot-restart.md`](decisions/013-founder-room-godot-restart.md) | Preserved Godot assembly slice; main system now ADR 014 |
| [`decisions/014-painted-room-point-and-click.md`](decisions/014-painted-room-point-and-click.md) | Main painted-room system and legacy art retirement |
| [`meetings/`](meetings/) | Meeting / conversation summaries |
| [`decisions/`](decisions/) | Locked calls (ADRs-lite) |
| [`core-memories/`](core-memories/) | Memorable / crazy moments (agents write proactively) |
| [`clients/`](clients/) | Client packs (briefs + mockups + build plans) — e.g. [`ehlenbachs/`](clients/ehlenbachs/) |
| [`../brand/`](../brand/) | Logo image assets |

The main room system uses painted backgrounds and image-coordinate
hotspots: [ADR 014](decisions/014-painted-room-point-and-click.md).
Run it from [`office/`](../office/). The Phaser loft is retired;
Godot work remains preserved in `game/`.

## Rules of the house

- **Root `README.md`** = company front door only.
- **Doctrine** stays in `docs/*.md` — update in place, don't spawn twins.
- **PRs** = one concern each; **Nosh or Fabrizio** merges to `main` (see `pr-discipline.md`).
- **Meetings** = what we talked about (context, debate, open threads).
- **Decisions** = what we locked (short, dated, final).
- **Core memories** = scars and trophies — high bar, proactive, not a daily diary.
- No `README.md` inside every subfolder. This index is the map.
- If a note isn't a meeting, decision, or real memory, it probably doesn't need a new file — edit doctrine instead.
