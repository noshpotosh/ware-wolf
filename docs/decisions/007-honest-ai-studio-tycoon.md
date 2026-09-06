# ADR 007 — Honest AI studio tycoon

**Status:** Locked (vehicle / loft status amended by
[ADR 008](008-ai-studio-product-contract.md))  
**Date:** 2026-09-06  
**Deciders:** Nosh + Fabrizio Cortell  
**Meeting:** [`../meetings/2026-09-06-ai-studio-tycoon-pivot.md`](../meetings/2026-09-06-ai-studio-tycoon-pivot.md)

## Decision

1. **Active product direction:** explore an **honest AI studio
   tycoon** — a company-builder where the player runs a software
   studio, customizes the company, chooses projects, manages staff
   (hire/fire), sets goals and milestones, and dispatches work to AI
   employees/tools that attempt real tasks.
2. **Honesty is mandatory.** Players know AI is in the loop. We do
   **not** ship a stealth-AI con. Hide generated **source** from the
   player if we want; never hide the **nature of the labor**.
3. **Player sees state, not the repo.** Outcomes surface as build /
   test health, rewards, and failure/postmortem texture — not as a
   downloadable codebase in the default fantasy (CEO, not IDE).
4. **`office/` is the shipping web client.** The loft under
   [`office/`](../../office/) is the active client for this product.
   Engine and platform details live in
   [ADR 008](008-ai-studio-product-contract.md). Do not treat the
   archived Godot spike under [`game/`](../../game/) as the keep-
   building path.
5. **No build in this ADR.** This decision locks thesis and client
   home. Engine, platform, source-deletion policy, and build
   authorization live in
   [ADR 008](008-ai-studio-product-contract.md).

## Why

The loft answered a pack-HQ question first; the tycoon fantasy is
the product. Stealth AI would break trust when latency, cost, or
weird failures show up. Shipping from `office/` keeps one web
client instead of a second engine stack.

## Non-goals (this ADR)

- App Store launch plan
- Implementing the game in this ADR (see ADR 008 for vehicle)

## Amended by ADR 008

ADR 008 locks **Phaser 3** on `office/` as the shipping vehicle,
immediate source deletion, and related trust defaults. An earlier
Godot desktop-first vehicle lock was superseded when Nosh chose
web distribution and HTML/JS familiarity over Godot.

## Consequences

- Office docs and README mark the loft **active** (Phaser path)
- Product thesis here; contract and vehicle in ADR 008
- Implementation plan:
  [`../ai-studio-game-plan.md`](../ai-studio-game-plan.md)
