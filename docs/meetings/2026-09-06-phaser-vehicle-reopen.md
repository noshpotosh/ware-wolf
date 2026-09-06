# Meeting — Phaser replaces Godot as shipping vehicle

**Date:** 2026-09-06  
**Who:** Nosh (founder), Fabrizio Cortell (planning / recording)  
**Topic:** Reopen ADR 008 engine/client; unpark `office/` as web
client  
**Decision:** [`../decisions/008-ai-studio-product-contract.md`](../decisions/008-ai-studio-product-contract.md)
(amended); [`../decisions/007-honest-ai-studio-tycoon.md`](../decisions/007-honest-ai-studio-tycoon.md)
§4 amended

## What was said

Nosh wants the parked `office/` loft as the product client, with
**Phaser 3 instead of Godot**. Reasons: HTML/JS familiarity, and
shipping on the web to avoid App Store / Play cut. Fabrizio
accepted the vehicle flip and kept trust/cast/deletion locks.

## Calls

1. **Track:** parked `office/` becomes the shipping web client
   (not a Godot keep-building path).
2. **Engine:** **Phaser 3** owns the loft canvas; existing DOM
   desk OS (`desktopOs.js`) stays as overlay.
3. **Godot `game/`:** archived P1 spike — do not delete in the
   ADR PR; no new feature investment.
4. **ADR 007 thesis stays.** Reopen only engine/client/build-auth
   in ADR 008.

## Out of scope tonight

- Phaser install / loft spike (follow-up PR)
- Deleting `game/`
- Live agents, monetization, store packaging
- Rewriting desk OS into Phaser UI
