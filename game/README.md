# Warewolf — Founder’s Office

A fresh **Godot 4.7.2** room slice focused on art and scene assembly.
[Restart decision](../docs/decisions/013-founder-room-godot-restart.md).

Open `game/project.godot` in Godot and press **F5**. The entire office
fits the window. Hover over the **computer** for a silhouette outline
and pointing-hand cursor. **F1** shows placement guides; **H** hides
labels. The room has no character while we develop the interior.
Clicking an outlined computer emits a reusable `clicked` signal;
actions and dialogue can connect to it next.

## Assemble the room

1. Open `scenes/office/founder_office.tscn` in the 2D editor.
2. Select a prop under `Props` and move its root node. Its position is
   its ground contact, so artwork, collision, and depth move together.
3. Drag another scene from `scenes/office/` into `Props` to add a prop.
   Use `desk.tscn`, `chair.tscn`, `plant.tscn`, `water-cooler.tscn`,
   or `rug.tscn`. Duplicate with **Ctrl+D**.
4. Toggle **Show Footprint** in the Inspector to inspect grounding.
   Select `Shell` and enable **Show Grid** for the 128×64 floor grid.
5. Save with **Ctrl+S**, then run. The `.tscn` is the placement source
   of truth; there is no second JSON layout to keep synchronized.

The desk is now bare. Its `Tabletop` child holds **Computer**, **Keyboard**,
and **CoffeeCup** as independent scene instances. Select any of those
nodes and drag it or edit its Position; moving the Desk moves the entire
arrangement. To reuse an item, drag its `.tscn` onto a desk’s `Tabletop`.
These are native editor operations; runtime dragging is not enabled.

The reusable desk scene corrects the source art’s shallow perspective to
the room’s 2:1 wall slopes. Keep its root unskewed and unrotated for flush
wall placement. `scripts/office/desk.gd` applies this correction only to
the desk artwork; tabletop items stay upright and independently movable.

Use native **Transform → Position** for precise placement. One full
cell along either floor axis is `(64, 32)` or `(-64, 32)` pixels.
For finer arrangement use the editor’s 16×8 pixel snap setting.
Keep prop root scale at `(1, 1)` and rotation at `0`; art size belongs
in its resource. The guides describe collision footprints; this slice
allows intentional overlaps and does not auto-pack furniture.

Select `Shell` to change **Room Size**, **Wall Height**, or materials.
**Wall Thickness** controls the timber caps and exposed plaster ends.
Floor edges reuse the wood material with darker shading.
After resizing, reposition props inside the new bounds. The camera
fits the new shell when the scene runs. `window.tscn` is a separate
fitting for the left wall; move its root along that wall and vertically
for mounting height. Its child carries the projection shear; the window
uses the original flat artwork without added frame returns or sill.

## Add or change artwork

Each `resources/office/*.tres` is an `OfficePropArt` resource. It owns
texture, display size, normalized ground anchor, and footprint in cells.
Editing shared art updates every instance; **Make Unique** first when
an instance needs a different variant. A rug has **Floor Decoration**
enabled, which keeps it below props and disables its collision.

To add a prop, create an `OfficePropArt` resource and a scene inherited
from `scenes/office/prop.tscn`; assign the resource in the Inspector.
To export new art, save its master as `art-source/office/<id>.png`.
Add an entry to `exports.json` with `id` and `size: [width, height]`;
use `trim: false` for full-bleed materials. Trimming defaults on. The
exporter forces those exact dimensions, so choose a size matching the
source aspect ratio. Run the exporter, then set the art resource’s
`draw_size` to the same size.

No renderer changes are needed. See the
[asset pipeline](../docs/game-asset-pipeline.md) for source provenance,
export recipes, and the baseline art contract.

## Verify

With Godot 4.7.2 available as `godot`:

```bash
godot --headless --editor --path game --import
godot --headless --path game --script res://tests/office_check.gd
godot --headless --path game --script res://tests/hover_check.gd
python3 -m unittest discover -s game/tests -p 'test_*.py'
```

Expect `OFFICE_CHECK_OK`, `HOVER_CHECK_OK`, and the Python test to pass.
Checks cover scene save/reload, separate tabletop placement, resource
refresh, pixel-accurate hover, transformed sprites, and matte cleanup.
Run `hover_check.gd` without `--headless` to also verify rendered outline
pixels and that highlighting preserves the original artwork colors.

Rebuild the committed PNGs with Python 3 and ImageMagick:

```bash
python3 game/tools/export_office_art.py
```

Capture a 1280×720 runtime frame (requires a display, not `--headless`):

```bash
godot --path game --script res://tools/capture_office.gd \
  -- /tmp/founder-office.png
```

Add `--hover` after the screenshot path to capture the highlighted
computer. To make another Sprite2D interactive, attach a `HoverTarget`
node, point `sprite_path` at that sprite, and connect its `clicked`
signal. The root’s `HoverPicker` selects a target, applies the outline,
and restores the original material when the pointer leaves.

The previous walk-to-desk spike remains at `scenes/main.tscn` for
reference. Its historical scripts, assets, and checks are separate
from this new slice. Existing Phaser work remains in `office/`.

## Main office

The project now opens `scenes/office/main_room.tscn`. Press **Tab** to
switch between the main room and founder's office. F1 shows assembly guides;
H hides the overlay. All five computers share the silhouette hover behavior.

Edit `scenes/office/main_office.tscn` to place the room's five workstations,
central rug, chairs, plants, wall decorations, and coffee area. The room uses
an 11×10 shell. No characters are placed during this interior pass.

`scenes/office/workstation.tscn` is the shared desk assembly. Edit it to
update every main-room desk. Enable **Editable Children** on a workstation
instance to move its computer, keyboard, cup, or lamp individually in Godot.
The founder's existing desk arrangement remains independent.

The floor plan follows the mockup's zones using the existing 2:1 grid;
the floor uses an editable stepped polygon with angled front corners.
Edit Shell → Floor Outline in grid cells to adjust its silhouette.

Validate with Godot's `--headless --path game --script
res://tests/main_room_check.gd`. Capture with `res://tools/capture_office.gd`
and arguments `-- /tmp/main-office.png --main-room` (requires rendering).
