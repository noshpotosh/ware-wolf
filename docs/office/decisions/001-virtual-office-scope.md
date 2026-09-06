# ADR 001 — Virtual office product scope

**Status:** Active as shipping web client (vehicle amended by
[`../../decisions/008-ai-studio-product-contract.md`](../../decisions/008-ai-studio-product-contract.md))  
**Date:** 2026-09-05  
**Deciders:** Nosh + Fabrizio Cortell  
**Reopen note:** 2026-09-06 — loft unparked; Phaser 3 owns the
canvas, DOM desk OS stays (ADR 007 §4 / ADR 008).  
**Reopen note:** 2026-09-06 — rooms, movement, and talk surfaces
amended by
[`002-loft-vn-hybrid.md`](002-loft-vn-hybrid.md)
(Founder’s Office + loft; player-only walk; VN panels; desk OS in
founder office only).

## Decision

Build an internal **Warewolf Virtual Office** under
[`office/`](../../office/). Day-one was vanilla HTML; shipping
vehicle is now **Phaser 3** for the loft canvas with DOM desk OS
(ADR 008).

### Locked choices

| Topic | Call |
| --- | --- |
| Player avatar | **Nosh** |
| Starter staff | Fabrizio, Maeve, Dex, Cal, Reed (+ Nosh = 6 desks) |
| Art | Isometric pixel, cozy living office |
| Economy | **Company bucks** earned by completing **team goals/deadlines** |
| Desk PC | Opens a **fake desktop OS** |
| Launch apps | **Teams**, **Directory**, **Goals**, **Loft** |
| Agent chat | Local persona message bus in Teams; **live Cursor delivery later** |
| Persistence | `localStorage` for bucks/goals/office/upgrades/mute |
| Quality bar | Production-quality internal tool; no corner-cutting |

### Staff data contract (shared)

Floor NPCs and Employee Directory share one source of truth (later: `office/data/staff.json`):

- `id`, `displayName`, `role`, `about`, `avatarAsset`, `deskId`
- Presence is derived from desk occupancy (Available / Away), not stored as a separate manual flag for v1

### Non-goals (for now)

- React/Vue/Svelte / bundler-required app
- Real Cursor agent message delivery (local persona bus is in; remote later)
- Multiplayer / accounts / server
- Full HR needs/hunger sim

## Consequences

- Phase 0 locks art + scope before movement code
- Maeve owns visual feel; Dex implements tiny slices; Cal breaks flows; Reed gates readability
- Office doctrine lives under `docs/office/`; one link from root README when the shell exists
