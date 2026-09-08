# Office — How to run

The main system is a painted point-and-click app under
[ADR 014](../decisions/014-painted-room-point-and-click.md).

## Play

```bash
cd office
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765/`. The app starts at the command-table main
menu, creates or continues a company, opens the bedroom office, and navigates
to the house kitchen. Clicking the bedroom computer opens DesktopOS.

## Edit scene touches

```bash
cd office
npm run catalogue
```

Open `http://127.0.0.1:8766/`. The scene catalogue shows only approved
complete paintings. Select a scene to review its object masks, surface quads,
point anchors, and effect bindings. New object masks are cropped PNGs whose
pixel dimensions match their declared width and height.

The catalogue is a local write-enabled authoring tool. The ordinary static
server remains the playtest path. Use `?debug=scene` for the runtime's
read-only alignment overlay.

## Verify

```bash
cd office
npm test
```

Browser acceptance:

- Check the menu CRT stays on the painted screen and reduced motion removes
  the moving scan.
- Create or continue a company; confirm the save survives reload.
- Hover and keyboard-focus each bedroom object. Masks should match exactly,
  including the mug handle opening.
- Open DesktopOS from the bedroom computer and return to the scene.
- Collect and return the mug; confirm its patch and steam respond correctly.
- Open the bedroom door and enter the kitchen. Verify the animation can be
  skipped without blocking navigation.
- Inspect every kitchen target and use its left door to return.
- Open the compass map and navigate both ways.
- Resize throughout; painting, hotspots, masks, effects, and transitions must
  remain aligned.
- Confirm local time, Journal, Menu, focus return, hidden-tab pause, and
  reduced-motion behavior.
