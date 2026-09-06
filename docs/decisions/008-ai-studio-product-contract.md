# ADR 008 — AI studio product contract (P0)

**Status:** Locked (engine/client reopened 2026-09-06)  
**Date:** 2026-09-06  
**Deciders:** Nosh + Fabrizio Cortell  
**Meeting:** [`../meetings/2026-09-06-ai-studio-p0-contract.md`](../meetings/2026-09-06-ai-studio-p0-contract.md)  
**Reopen meeting:** [`../meetings/2026-09-06-phaser-vehicle-reopen.md`](../meetings/2026-09-06-phaser-vehicle-reopen.md)  
**Thesis:** [`007-honest-ai-studio-tycoon.md`](007-honest-ai-studio-tycoon.md)  
**Plan:** [`../ai-studio-game-plan.md`](../ai-studio-game-plan.md)

## Decision

1. **Player promise.** This is an honest AI studio tycoon — a game
   about running a software studio. Players know AI is the labor.
   They receive verified build state, consequences, and rewards.
   It is not a coding service and must be described that way
   wherever it is sold or pitched.
2. **Engine and client.** Shipping vehicle is **Phaser 3** inside
   [`office/`](../../office/). Desktop-first UX target remains
   **1280×720**. Click and tap share one interaction path;
   management controls stay touch-safe. The loft canvas is Phaser;
   the desk OS stays DOM (`desktopOs.js` and related). Distribution
   is **web** (no App Store / Play requirement for the first ship).
3. **Build authorization.** This ADR authorizes Phaser work on
   `office/` as the active client. It does not authorize live-agent
   backend, monetization, or store packaging.
4. **Cast.** Warewolf crew names and personas stay **internal
   demo cast only**. Public builds use fictional role archetypes
   unless a later lock makes the crew part of the public brand.
5. **Source deletion.** Generated source is **deleted immediately**
   after task completion or expiry. Players never receive it. No
   short retry window that keeps source around.
6. **First project type.** First supported live and simulated
   project type is **greenfield web-app** only.
7. **Live-agent cost.** Hard **per-session** cost ceiling. Exact
   dollar amount is a named constant locked before **P5**. The
   web client never holds provider credentials and never
   executes generated code.
8. **Retained evidence.** Keep only structured game state:
   - User-approved brief and milestones
   - Task-state transitions
   - Passing and failing check **counts**
   - Sanitized blocker and outcome summaries
   - Agent cost and elapsed game or wall time
   - Reward and progression events  
   Do **not** retain generated source, secrets, or raw logs.

## Why

ADR 007 locked the thesis. An earlier version of this ADR chose
Godot 4.7.2 desktop-first. Nosh reopened the engine clause for
HTML/JS familiarity and web distribution without store cut.
Trust, cast, source deletion, first project type, and evidence
boundary stay locked. [`game/`](../../game/) remains an archived
Godot P1 spike, not the keep-building path.

## Non-goals (this ADR)

- Migrating the full loft into Phaser in this ADR (that is build
  work after the lock)
- Deleting the Godot `game/` tree
- Exact `$` session cost (name before P5)
- App Store / phone layout commitment
- Multiple project types, currencies, or life-sim staff systems
- Keeping or selling generated source
- Rewriting the desk OS into Phaser UI

## Consequences

- Implementation plan follows ADR 008; Phaser loft work may start
  after this reopen merges
- ADR 007 thesis remains; loft is the shipping web client
- Godot `game/` is archived reference / provenance only
- Game API / disposable workers (P5+) must enforce deletion and
  the evidence list above
