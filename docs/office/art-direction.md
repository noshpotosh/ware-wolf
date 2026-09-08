# Office — Painted-scene art direction

**Status:** Main scene system
**Decision:** [ADR 014](../decisions/014-painted-room-point-and-click.md)

The complete accepted painting owns the scene. Do not decompose it into
furniture, tiles, upgrade sockets, or separately generated replacements.
Interactivity is a restrained overlay: masks, surfaces, points, state patches,
and short transitions.

## Approved anchors

The approved references are listed in
`office/art-source/style-reference.json`. Open the actual images before art
work; filenames and prose are not substitutes.

1. `founders-office-background.png` anchors pixel treatment, camera,
   materials, light, and architectural thickness.
2. `founders-bedroom-v1.png` is the accepted starting-room composition.
3. `house-kitchen-v3.png` is the accepted second-room composition.
4. `main-menu-command-table.png` is the accepted title-scene painting.
5. The Nosh portrait anchors his identity and character rendering.
6. The classic-adventure and visual-novel mockups only anchor their stated UI
   treatments.

A new candidate never becomes the next reference automatically. Nosh selects
new anchors explicitly, and the reference catalogue records the choice.

## Visual invariants

- Detailed pixel-painted finish with deliberate clusters and stepped edges.
- One fixed isometric camera, consistent furniture scale, wall caps, and floor
  thickness across rooms.
- Warm walnut, cream plaster, restrained sage and brass, with readable dark
  edges and identifiable light sources.
- No smooth vector/cel rendering, 3D clay, painterly gouache, noisy
  sharpening, or automatic palette reduction.
- Critical text and controls remain code-native and accessible.
- UI uses fine brass frames, olive inset surfaces, cream text, and quiet
  texture without competing with the painting.

## Interactive touches

Everything uses the painting's native pixel coordinates.

- Hotspot polygons are generous input regions.
- Object annotations use cropped alpha-mask PNGs for exact silhouettes.
- Surface annotations list top-left, top-right, bottom-right, bottom-left
  corners for effects such as CRT content.
- Point annotations place emitters such as steam.
- State patches reveal only the changed area of a separately reviewed
  full-scene edit.
- Transition frames use a fixed transparent canvas and do not replace the
  scene-authoring model.

Effects ignore pointer input, pause with inspection or hidden tabs, and
respect reduced motion. Keep them subtle enough that the painting stays in
charge.

## Known failures

Separately generated furniture introduced scale, camera, and palette drift,
then demanded assembly tooling to repair the drift. Tiny asset kits and
chained style variants made it worse. Do not revive that path.

The rejected plant displacement warped the painting. The earlier coarse room
boundary clipped the floor. Heavy orange highlights and blurred halos lost
the crisp object edge. Check all masks and silhouettes at native size and at
smaller viewports.
