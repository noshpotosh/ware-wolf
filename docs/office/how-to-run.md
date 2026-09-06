# Virtual Office — How to run

**Active shipping web client** (Phaser 3 + DOM desk OS). See
[`../decisions/008-ai-studio-product-contract.md`](../decisions/008-ai-studio-product-contract.md).

Serve the `office/` folder over HTTP. Browsers block ES module
`fetch` from `file://`. Install Phaser once, then serve:

```bash
cd office
npm install
python3 -m http.server 8765
```

Open http://127.0.0.1:8765.

## What you should see

- Starts in the Founder's Office (private desk PC)
- Door / `E` travels to the shared loft with a brief flash
- Shared loft has crew desks, bubbler, coffee, whiteboard
- Door back returns to the Founder's Office (desk PC again)
- Nosh (amber jacket) walks on click
- Staff idle at desks and occasionally visit the bubbler
- Clicking a staff desk walks Nosh over, then opens talk toast
- Desk PC opens only in the Founder's Office: Teams, Directory,
  Goals, Loft
- Teams presence follows desk occupancy (Away while at the bubbler)
- Loft shop sells upgrades and larger loft sizes; history is listed
  in Loft

## Accessibility

- Desktop windows are keyboard-closable with Escape
- Mute button / `M` toggles UI blips
- `prefers-reduced-motion: reduce` snaps travel, camera, and shortens
  room-flash transitions
