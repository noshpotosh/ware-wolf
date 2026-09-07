# Office art work orders and prompt templates

These templates implement [the art contract](art-direction.md) and
[the pipeline](asset-pipeline.md). Replace bracketed fields before use.
The historical prompts below are retained as history, not generation defaults.

## Shared prefix — attach images as inputs

> Create [asset type] for the same pixel-painted adventure as reference A,
> the accepted founder office. Reference B is [exact edit target / accepted
> character / recurring object]. Match A’s pixel clusters, edge treatment,
> camera elevation and wall angles, object scale, warm walnut and cream
> materials, sage accents, and grounded lighting. This belongs in the same
> game, not a reinterpretation in a new style. No added UI, labels, characters,
> or objects beyond the brief. Allowed change: [specific delta]. Preserve:
> [explicit invariants]. Output: [dimensions, alpha requirement, framing].

## New room

> Design [room purpose and contents] using reference A as the visual anchor.
> Keep its camera and material/rendering language. Room dimensions/layout may
> change according to [brief]. Include full wall thickness and floor sides.
> Keep interactable silhouettes legible at [display size]. Do not add a
> walking character. This is a complete painted environment, not a sprite kit.

## Existing room upgrade or object state

> Edit reference B only: [change]. Keep its exact canvas, framing, furniture
> positions, light direction, and every unrelated object. Reconstruct only
> [revealed region] where necessary. Do not redesign the room or improve
> unrelated details. The approved reference A remains the style authority.

## Portrait / expression

> Reference B is the identity anchor. Change only [expression or pose].
> Preserve face, hair, age, clothing, proportions, pixel treatment, and light.
> Transparent background; no lettering, frame, scene, or baked UI. Preserve
> [canvas and bust anchor] across all requested expressions.

## Animated object frames — only after choosing a layer approach

> Animate only [isolated object] from the approved object reference B.
> Motion: [precise movement]. Fixed canvas [size], anchor [x,y], camera,
> palette, lighting, and stationary base. Sequence [frame count/order] with
> [timing and loop intent]. Transparent surroundings. No texture changes or
> unrelated motion. Return a consistent sequence, not separate redesigns.

## Agent handoff — copy into a task

> Follow docs/office/art-direction.md, asset-pipeline.md, and art-prompts.md.
> Open the approved images in office/art-source/style-reference.json.
> Task: [asset and purpose]. Allowed delta: [changes]. Preserve: [invariants].
> Deliver [mockups only / reviewed runtime integration]. Start with one
> candidate, compare directly against the approved references, and record
> provenance plus visual and runtime verification. Do not promote this
> candidate into a new style anchor or revive retired systems.

---

# Historical office art prompts — September 2026

These prompts record the retired separate-sprite prototype. Their output
paths below are historical: the obsolete office raster kit was backed up and
removed under [ADR 014](../decisions/014-painted-room-point-and-click.md).
Do not use these historical prompts as the active generation plan.
Current painted-room provenance lives in the JSON records linked from
the [asset pipeline](asset-pipeline.md). Godot keeps its independent copies.

## Desk

Output: `office/assets/furniture/desk-crt.png`.

References: `sheets/furniture-kit-sheet.png` and
`starter-office-hero-crew-mock.png`.

Prompt:

> Create one isolated production game sprite, transparent alpha background,
> no text, no sheet, no labels. References are STYLE guides. A cozy finely
> detailed PIXEL ART wooden office desk with chunky beige CRT computer with
> dark green terminal, keyboard, small ceramic sage mug and black task lamp.
> NO CHAIR, NO PERSON, NO PLANTS. Match the exact lovely warm amber brown
> pixel art wood grain and chunky black outlines of the reference assets,
> crisp pixel clusters, no vector-flat appearance. Orthographic classic 2:1
> isometric camera, top face has corners roughly at left (12%,47%), back
> (62%,22%), right (92%,37%), front (42%,62%). Desk front apron and left
> wooden drawer pedestal visible, brown drawer fronts with brass pulls,
> right legs, monitor rises above back desktop. Lamp at back left, CRT
> center, mug right. Full sprite alone centered with generous transparent
> margins, no grounding floor tile, no cast ground shadow outside the
> furniture. Aim for a native game sprite at approximately 128 pixels wide
> x 128 pixels tall, enlarged nearest-neighbor in the output, limited warm
> 24-color pixel palette. Reference 1 is furniture silhouette/material
> reference; reference 2 is quality/style target. This is runtime furniture
> replacing primitive polygons, not another mood board. Save PNG with real
> transparency.

## Props

Output: `office/assets/furniture/loft-props.png`.

References: the same furniture sheet and starter crew mock.

Prompt:

> One PRODUCTION PIXEL ART GAME PROP ATLAS on real transparent alpha
> background. Exactly SIX isolated objects in regular 3 columns by 2 rows,
> equal cells with generous clear margins, no overlap, NO LABELS NO TEXT
> NO SHEET PANELS. Orthographic 2:1 isometric camera and lovely detailed
> warm pixel clusters matching references, dark ink outlines, restrained
> warm brown ochre cream teal palette, no smooth vector art. Row1 column1:
> classic cream water cooler with big blue water jug red and blue taps.
> Row1 column2: small dark wood coffee station cabinet with black drip
> coffee machine, glass carafe and two ceramic cream mugs. Row1 column3:
> freestanding wooden framed cream office noticeboard with little pinned
> notes, no legible text, two feet. Row2 column1: empty dark charcoal rolling
> office chair, three-quarter rear view, back of chair faces viewer, desk
> would be behind the chair toward upper left, five wheeled star feet,
> chunky upholstered square back. Row2 column2: leafy indoor fern in
> terracotta pot. Row2 column3: empty upgraded sage green rolling office
> chair in same orientation as other chair, higher upholstered back, arm
> rests. Each complete object no cast shadow or ground plane outside the
> sprite. Crisp sprite texture designed for game native 32-64 pixels wide
> by 48-64 pixels high, enlargement pixelated nearest neighbor. Output
> ideally1536x1024. References are style guides only. These will be used
> individually in runtime game cells. Transparent background genuinely
> clear, not baked checkerboard.

## Crew

Output: `office/assets/characters/crew-idle.png`.

Reference: `starter-office-hero-crew-mock.png`.

The initial atlas established six complete figures, three columns by two
rows, in this order: Nosh (amber hoodie), Fabrizio (blue grey overshirt),
Maeve (sage sweater, long brown hair), Dex (teal hoodie, glasses), Cal
(brick sweater), Reed (navy cardigan, glasses). All face three-quarter
left. The generator returned a baked checkerboard on the first atlas;
that version is not used by the app.

Final accepted cutout prompt, applied to that atlas:

> Make a transparent-background cutout PNG of these six characters. Remove
> the checkerboard. Use the transparent background output feature.
> Background must be transparent, all six people intact. No checkerboard
> in output pixels.

## Portraits

Output: `office/assets/characters/crew-portraits.png`.

References: `desk-desktop-os-mock.png` and the generated crew atlas.

Prompt:

> One 3 columns x 2 rows portrait atlas, SIX perfectly square
> head-and-shoulders portraits touching edges with no gutters, each cell
> independent opaque warm muted tan background. NO text NO borders. Match
> portrait pixel art technique from the Employee Directory mock first
> reference: detailed readable dark 1px ink lines, expressive human faces,
> lovely pixel clusters, native portrait resolution around96x96 per cell,
> not vector polygon people. Use second reference ONLY to match
> identity/outfits. All face the camera in slight three-quarter view, heads
> and shoulders fill about85% of each square, hair fully in frame. Top left
> Nosh short dark hair amber hoodie; top middle Fabrizio short dark brown
> hair blue grey overshirt; top right Maeve long wavy dark brown hair sage
> green sweater small gold earrings; bottom left Dex messy black hair
> round glasses teal hoodie; bottom middle Cal short dark hair brick red
> sweater; bottom right Reed neatly parted brown hair glasses navy
> cardigan. Each avatar is a separate square, equally sized, no seams or
> objects crossing cell boundaries. Final image should be landscape3:2
> containing six squares. This is a runtime Directory portrait atlas. Do
> not draw UI around them. Cute warm serious retro game pixel art closely
> matching Maeve's illustrated portrait in first reference.

## Integration

`office/js/sprites.js` names source rectangles for the accepted artwork.
The renderer samples sprites into the logical room canvas without image
smoothing. Portraits use a 96×96 canvas. Idle figures are clipped at the
chair when seated; they remain separate from furniture while walking.

The generated sources are larger than the runtime pixels. They are art
sources, not guaranteed pixel-perfect atlases at their original size.

## Office polish — September 2026

PixelLab generated `office/assets/tiles/floor-rug-woven.png` at
128×64 with transparent background. Job:
`5b5ba27c-1621-4ab2-90bc-2898145ba04c`. The accepted rug replaces the
pale fringe of the previous checked rug with a continuous brown sewn
border and muted sage/tan pattern. It remains a single floor furnishing
scaled to the central island, with nearest-neighbor filtering.

Prompt: a rectangular woven office rug in classic 2:1 isometric
projection, muted sage and tan checks, dark warm brown sewn border,
clean edges, no fringe, tassels, white pixels, or outside highlights.

PixelLab edited the existing Cal conversation bust, preserving its
face, pose, shirt, canvas, and transparency while changing the hair
to tousled chestnut brown to match the established crew atlas. Job:
`194ad7be-d1db-43d2-9474-b36d71292ecf`. Accepted output:
`office/assets/characters/vn-busts/cal-rook-polished.png`. The original
bust is retained. Other Directory portraits and crew sprites already
share the established outfit, hair, and glasses cues.

Walls, timber trim, window, and inset doors use code-native geometry
in `office/js/wallDraw.js`, with shared perimeter math for door
picking in `office/js/loftDecor.js`. No generated wall atlas is needed.
Seated staff reuse the established atlas with cropped lower bodies,
mirrored faces toward their monitors, and chair/person/desk depth order.
Walking figures retain their complete silhouette.

## Cozy wall materials and fittings — September 2026

PixelLab generated these 128×128 source assets for the warm plaster,
walnut timber, framed artwork, books, and greenery in the office mocks:

- `tiles/wall-plaster-warm.png`: evenly distributed low-contrast
  limewash grain, full-bleed repeating material. Job
  `4801efa9-7346-49fb-b14c-0a3940a462c0`. An earlier blank-centered
  sample was rejected.
- `furniture/door-timber.png`: frontal walnut door, recessed panels,
  sage glass, brass handle. Job
  `50a556fa-0413-4dcf-abf3-abbc647890fe`.
- `furniture/window-timber.png`: timber frame and sill, leafy view,
  small sill plant. Job `29884c77-f19a-431c-869d-d64a402be2c1`.
- `furniture/wall-shelf-books.png`: walnut shelf, muted books, and
  trailing pothos. Job `7c4c8c9b-f5e0-4e0b-8c19-ed23dbc7e767`.
- `furniture/wall-landscape.png`: framed sage hills and gold sky.
  Job `1f230e4b-b7d7-42aa-9588-0a963b83dc85`.
- `furniture/wall-sconce.png`: brass fitting and warm opal globe.
  Job `0898a54a-1ddb-4ef0-80ad-43857d8de43f`.

Prompts requested frontal, isolated artwork without lettering, walls,
or floors. The plaster prompt requested uniform tileable texture
without borders or large blank areas. Runtime crops omit transparent
margins and unwanted side rails on the door. Window and painting
interiors receive opaque sky backing where generated art is transparent.

`wallArt.js` records source crops and maps artwork onto the same angled
planes used by walls and door picking. `wallDraw.js` bakes the plaster,
trim, and doors. `wallDecorDraw.js` creates separate raised décor objects
with timber return faces and silhouette shadows. The shelf has room
for upright books and foliage; the window has a projecting wooden sill.
Generated textures use nearest filtering and are replaced on room change.
The source mockups remain reference-only. Desk plaques use code-native
wood-colored frames and live text so names stay readable and editable.
