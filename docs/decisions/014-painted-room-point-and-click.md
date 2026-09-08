# ADR 014 — Painted scenes with point-and-click touches

**Status:** Locked — main scene system
**Date:** 2026-09-07
**Decider:** Nosh

## Decision

Office uses complete painted scenes. A scene painting owns its composition,
perspective, furniture, materials, and lighting. We do not rebuild accepted
paintings from separate furniture pieces, upgrade sockets, tiles, or layers.

Small interactive touches sit over the painting in the same image-coordinate
space:

- forgiving hotspot polygons for input;
- cropped alpha masks for exact hover and keyboard-focus silhouettes;
- four-corner surfaces for effects on angled screens;
- points for effects such as steam or light;
- optional state patches and short transition frames.

The scene catalogue contains only approved whole paintings. It links each
painting to its runtime definition and provenance. The catalogue editor may
add or adjust annotations and effect bindings, but it is not a furniture
workbench, room assembler, image generator, or upgrade editor.

This keeps the accepted visual quality of a painting while allowing the CRT,
steam, object highlights, and bedroom-door transition to feel alive. All
touches scale with the scene through one contain or cover transform and must
respect pause and reduced motion.

## Current scenes

- The command-table main menu uses one complete text-free painting. Accessible
  HTML supplies the title and controls. A projective CRT effect attaches to
  the painted monitor.
- The bedroom office uses the accepted complete bedroom painting. Its
  computer and mug are inspectable, the mug can be collected, and its door
  opens into the kitchen.
- The house kitchen uses the accepted complete kitchen painting. Its work
  surfaces and kettle are inspectable, its left door returns to the bedroom,
  and its far door remains reserved.
- The office map remains the shared navigation view for playable rooms.
- DesktopOS remains the computer interaction reached from the bedroom CRT.

## Runtime and persistence

`office/index.html` is the only game entry point. The renderer uses SVG and
DOM without a game engine. Stable action IDs drive inspection, pickup, and
navigation. Inventory, company setup, and current room persist in the existing
version-one local save. DesktopOS keeps its separate local drafts.

The compact shell retains the founder portrait, inventory, Journal, Menu,
local clock, and compass map. Walking, pathfinding, NPC simulation, economy,
purchasable upgrades, furniture assembly, and simulated time remain out of
scope.

## Art and verification

Every runtime painting and generated transition asset keeps provenance under
`office/art-source/`. New paintings use the approved references in
`office/art-source/style-reference.json`; candidates do not become anchors
automatically. Critical text remains accessible HTML rather than generated
pixels.

Verify image hashes and dimensions, hotspot and mask bounds, effect
annotations, reciprocal map connections, keyboard input, responsive
alignment, reduced motion, persistence, and DesktopOS entry. Run `npm test`
and complete the browser checks in the run guide.

## Tradeoff

Changing furniture inside a finished scene generally means commissioning a
new complete painting. We accept that cost because it preserves visual
cohesion and removes a much larger authoring and runtime system. Local
interactivity remains cheap when it can be expressed as a mask, surface,
point, state patch, or short transition.

This supersedes ADR 008's Phaser vehicle requirement, ADR 013's separate-asset
authoring direction as the main path, ADR 010's fixed prop-size requirement
for painted scenes, and office ADR 002's walking requirement. ADR 007's
product thesis and ADR 008's trust requirements remain in force.
