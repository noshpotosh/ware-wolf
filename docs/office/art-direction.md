# Office — Painted-room art direction

**Status:** Main room system
**Decision:** [ADR 014](../decisions/014-painted-room-point-and-click.md)

The accepted room painting owns composition, perspective, materials, and
lighting. The founder’s office keeps warm timber, beige plaster, sage
accents, and restrained CRT green. Preserve the evolved-pixel finish and
readable silhouettes. Critical text belongs in accessible HTML.

The source reference is
`office/assets/reference/style-explorations/01-evolved-pixel.png`.
The runtime background is `office/assets/rooms/founders-office-background.png`:
the accepted edit with the standing founder removed. Preserve its 1774×887
canvas and aspect ratio. Render the whole composition, fitting image,
hotspots, and effects together in the same image-coordinate space.

Hit polygons trace selectable objects in that exact painting. Separate,
more detailed outline paths supply visible feedback, including the opening
in the mug handle. Pointer hover and keyboard
focus give warm silhouette feedback; inspect and pickup actions use stable
IDs. Highlights are drawn overlays, not separately generated furniture.
Changes to a hotspot must be checked at native size and smaller viewports.

Localized SVG/CSS effects follow painted surfaces. They must ignore pointer
input, pause when inspection or page visibility requires it, and respect
reduced motion. A small amount of amber light is enough; keep the room
readable while the artwork carries the detail. The plant remains static
in the accepted background. The shell uses an illustrated transparent founder
portrait with local-time status text. Its provenance is in `office/art-source/nosh-portrait.json`.

The mug’s removed state uses
`office/assets/rooms/founders-office-empty-desk.png`. Reveal only its defined
pickup patch, preserving the accepted background everywhere else. A new
painted state needs matching framing, recorded provenance, and visual review.
An AI edit is not a guarantee that unrelated pixels stayed identical.

Separate generated furniture, tiled floor assembly, atlas cut sheets, and
walking are retired from the main room workflow. The 128px prop canvas and
isometric grid rules describe earlier prototypes; they do not govern painted
room images. The old office raster kit has been archived and removed.
Godot’s independent assets remain in `game/`.

See [asset pipeline](asset-pipeline.md) for the retained files and provenance,
and [how to run](how-to-run.md) for acceptance checks.

## Consistency contract for every agent

Read this document, [the pipeline](asset-pipeline.md), and
[the prompt templates](art-prompts.md) before generating or integrating art.
The approved reference catalog is `office/art-source/style-reference.json`.
Open the actual reference images; filenames and prose are not substitutes.

### Reference hierarchy

1. The accepted founder-room background is the primary environment anchor.
2. The accepted Nosh portrait anchors character rendering and his identity.
3. The classic-adventure mockup anchors only its crisp computer highlight.
   The visual-novel mockup anchors only its dialogue/nameplate treatment.
4. The current implemented shell governs layout: compact inventory, detached circular portrait at the padded left
   screen edge, vertically centered with the inventory bar,
   Journal/Menu, local clock, and textured olive-charcoal void. Health and
   stamina arcs frame the portrait; currently both are static full previews.
   Mockup clocks, extra controls, and overflowing inventory portraits are not
   requirements. The dialogue portrait may extend above its speech panel.

Use the original approved anchor on every generation. A newly generated
variant is not automatically a reference for the next variant. This prevents
small deviations from accumulating across rooms. Explorations stay outside
runtime assets and never silently redefine the style.

### Visual invariants

- Pixel-painted finish: deliberate pixel clusters and stepped edges, detailed
  but controlled material texture. No smooth vector/cel rendering, 3D clay,
  painterly gouache, noisy sharpening, or automatic palette reduction.
- Match the anchor’s fixed isometric camera, visible wall faces, furniture
  scale, and thickness of wall caps and floor sides. New rooms can differ in
  dimensions and contents; they must feel photographed by the same camera.
- Warm walnut, cream plaster, restrained sage and brass; readable dark ink
  edges. Preserve material contrast rather than tinting everything amber.
- Window light and local CRT illumination have identifiable sources. New
  lighting scenarios are deliberate variants, not accidental color shifts.
- Repeated objects retain design, proportions, material, and relative scale.
  Attach the accepted object’s room reference alongside the main style anchor.
- Character variants preserve face, hair, clothing, proportions, and pixel
  treatment unless the brief explicitly changes one of those attributes.
- UI stays code-native except illustrated portraits/items. Fine brass frames,
  olive inset surfaces, readable cream text, and quiet texture support the
  room. Critical text and interaction labels never depend on generated text.

### Known failures to avoid

The rejected plant displacement warped the painting; do not revive it as a
cheap animation shortcut. The coarse room boundary clipped the floor; trace
its complete silhouette including the full underside. Heavy orange strokes
and blurred halos lost the preferred computer highlight’s crisp edge.
Separate generated furniture kits and chained style variants caused drift.
These are documented failure modes, not alternate approved approaches.

A style deviation requested by Nosh is an explicit exploration. Keep it
separate until Nosh selects it as a new anchor. Routine matching work may
proceed within the user’s existing authorization; this contract does not
require repeated permission for every asset or code change.
