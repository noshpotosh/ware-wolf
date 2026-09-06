# ADR 002 — Loft × visual-novel hybrid (v1)

**Status:** Active  
**Date:** 2026-09-06  
**Deciders:** Nosh + Fabrizio Cortell  
**Product shape:** Maeve Quinn  
**Amends:** [`001-virtual-office-scope.md`](001-virtual-office-scope.md)
(rooms, movement, talk surfaces); supports
[`../../decisions/007-honest-ai-studio-tycoon.md`](../../decisions/007-honest-ai-studio-tycoon.md)
(work readable in space)

## Decision

Keep the isometric loft as the body of the game. Add
**visual-novel panels** for short face-to-face beats. Do **not**
replace the loft with a full novel mode.

### Locked choices (v1)

| Topic | Call |
| --- | --- |
| Rooms | **Two only:** Founder’s Office ↔ shared loft |
| Who walks | **Player (founder) only** |
| Crew motion | Static poses; **reseat during room flash** only |
| Room transition | Brief flash (~150–300ms); swap room + seats |
| Desk OS | Opens from **Founder’s Office only** |
| Teams | Stays; **async work chat** (threads, presence) |
| VN panels | Face-to-face beats; portrait + short flavor lines |
| VN ↔ Teams | **Fully separate** in v1 (no scene sync notes) |
| VN triggers | Proximity + `E` **and** auto on blocker / ship |
| Story ambition | **Flavor lines only** — no scripted arc |
| Work state | Readable via **stations + props**, not pathfinding |

### Talk-surface contract

| Surface | Job |
| --- | --- |
| Loft body language | Presence + work props (desk, whiteboard, Away) |
| VN panel | Short scene; dismiss back to loft |
| Teams | Ongoing, searchable management chat |
| E-toast | Prop flavor only — never story or decisions |

VN never stores a competing message thread.

### Room jobs

| Room | Job |
| --- | --- |
| **Founder’s Office** | Private desk OS; quiet VN / decision beats |
| **Shared loft** | Crew desks + props; assigned / blocked / idle |

War Room / kitchenette / extra campus rooms are **out of v1**.

### Non-goals (v1)

- NPC walk cycles, pathfinding, mid-room slides
- Full VN routes, affection meters, CG galleries
- Writing VN beats into Teams threads
- Desk PC hotspots in the shared loft
- Three-or-more room graph

## Consequences

- Build order (one PR each): room graph + flash → station snap on
  enter → one VN panel → enforce Teams/VN boundary in UX
- Art budget stays on static props / portraits / idle poses
- ADR 007 still holds: player walks rooms to read the floor;
  crew “move” between flashes from work state
- Reopen when adding War Room or VN→Teams sync

## Related

- Meeting:
  [`../../meetings/2026-09-06-loft-vn-hybrid-steer.md`](../../meetings/2026-09-06-loft-vn-hybrid-steer.md)
