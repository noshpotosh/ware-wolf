# Office — How to run

The painted point-and-click office is the main room system under
[ADR 014](../decisions/014-painted-room-point-and-click.md).
Serve the folder over HTTP; opening `index.html` with `file://` cannot reliably
load ES modules and room JSON.

```bash
cd office
python3 -m http.server 8765
```

Open [the office](http://127.0.0.1:8765). No npm install, Phaser, image export,
or Godot process is required for this page.

Cold load shows the Warewolf title gate. Choose **Enter office** to reveal the
painted room and exploration shell.

Hover an object or focus it with Tab. Click or press Enter/Space to inspect;
Escape closes the dialog. Collect the mug, inspect it in inventory to return
it, and use Leave office / return to exercise room remounting. The current
return screen is not a second illustrated room. There is no walking.

The top-right clock shows the computer’s actual local date and time.
Inventory saves automatically; the clock is not stored or simulated.
Journal opens a room note reflecting whether the mug is collected. Menu
opens help and the Leave office action. Object inspection uses Nosh’s
speech banner, temporarily replacing the compact inventory view.

## Verify

```bash
cd office
npm test
```

`npm test` runs all remaining tests for the painted room, dependencies,
accepted PNGs and provenance, inventory, and clock rollover/persistence.
There is no legacy runtime or legacy test command.

Browser acceptance:

- Check pointer and keyboard selection on the painted silhouettes. Detailed
  outlines should match the art, including the opening in the mug handle.
- Resize the window: the whole image, hotspots, and lighting stay aligned.
- Collect/return the mug, leave/return, and reload to check inventory state.
- Check the empty patch only changes the mug area.
- Check CRT effects and cooler bubbles stay on their painted surfaces.
- Check the plant stays static in the original background.
- Confirm local time matches the computer clock. Open Journal and Menu,
  then close them with Escape; verify focus returns to the opening button.
- Check inspection, hidden tabs, and reduced-motion preferences pause or
  simplify animation as intended.

The former loft entry point, renderer, gameplay systems, and unused UI
assets have been removed. Independent Godot work has its own instructions
in [`game/README.md`](../../game/README.md).
