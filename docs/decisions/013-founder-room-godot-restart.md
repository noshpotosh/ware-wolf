# ADR 013 — Founder’s office restart in Godot

**Status:** Active for this slice
**Date:** 2026-09-07
**Decider:** Nosh

**Follow-up:** [ADR 014](014-painted-room-point-and-click.md) replaces
asset composition with a painted-room experiment in `office/`. This
Godot implementation is preserved as the earlier approach.

## Decision

Nosh explicitly chose “Restart Godot in game/” for a fresh vertical
slice: one founder’s office matching the evolved-pixel reference.
The work proves assets, placement, and easy scene assembly.

- `game/` is the active home for this slice, using Godot 4.7.2.
- Native Godot scenes store placements. Reusable prop scenes share
  typed art resources with textures, ground anchors, and footprints.
- The 128×64 isometric world grid remains. This slice amends ADR 010’s
  fixed 128×128 prop canvas requirement: a prop’s exported bounds match
  its silhouette and visual size, including multi-cell furniture.
  Runtime uses those exported dimensions at 1:1 before camera fitting.
- Floor and wall geometry must resize independently of artwork.
  Room mockups remain references, never flattened runtime backgrounds.
- Walking, simulation, and desk OS are outside this slice.
  The founder is removed from the room during interior development.
- Nosh’s follow-up introduces a point-and-click interaction probe:
  computer silhouette hover highlighting and a click signal for future
  actions. Desk, computer, keyboard, and cup remain separate assets.

This supersedes ADR 008’s prohibition on new Godot work for this slice.
It does not migrate or delete the existing Phaser application or settle
future distribution. Its uncommitted work remains separate.

## Evidence to keep

A rendered room, a native saved-scene roundtrip, footprint and anchor
checks, and deterministic source-to-runtime art exports. Future assets
should reuse the same prop scene without adding renderer branches.

## Main-room extension — 2026-09-07

Nosh requested the shared main office from the supplied five-desk mockup.
It reuses the Godot room shell and prop kit, adds a reusable workstation
assembly, and keeps both interiors editable as separate native scenes.
Tab switches rooms during the interior preview; characters remain absent.
