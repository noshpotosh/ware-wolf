# House kitchen — bedroom-recipe recreate

**Status:** Mockup round only. Not approved for runtime. Current playable
kitchen remains `office/assets/rooms/house-kitchen-v3.png`.

**Date:** 2026-09-07  
**Goal:** Prove the bedroom house-room recipe keeps kitchen plates in sync
with the starting bedroom before replacing the accepted kitchen.

## Recipe used

Documented in `docs/office/art-prompts.md` under **House-room recipe**.

| Pass | File | Role |
| --- | --- | --- |
| 1 | `01-kitchen-concept.png` | Fresh kitchen; style god + bedroom DNA |
| 2 | `02-kitchen-layout-lock.png` | Edit: two doors + improvised workspaces |
| 3 | `03-kitchen-edge-match.png` | Edit: bedroom edge weight + chair cleanup |

`*-1774.png` files are Lanczos upscales of the 1280×720 generator outputs for
side-by-side review only. They are **not** native master plates.

`compare-bedroom-vs-kitchen-pass3.png` places the approved bedroom beside the
Pass 3 upscale at 1774×887.

## Reference stack

- Style god: `office/assets/rooms/founders-office-background.png`
- House DNA: `office/assets/rooms/founders-bedroom-v1.png`
- Provider this round: Cursor `GenerateImage` (built-in)

## Review notes

**What synced well**

- Same cutaway camera, cream plaster, walnut trim/floor, black void.
- Left-window blinds + warm daylight read as the same house.
- Left return door + right future door present with matching residential DNA.
- Table and counter workspaces present; kitchen still reads kitchen-first.
- Side-by-side strip feels like adjacent rooms, not cousins.

**What failed or drifted**

- Native canvas missed: generator returned **1280×720**, not **1774×887**.
  Bedroom recipe and runtime expect the larger master. Do not promote an
  upscale.
- Chair count: Pass 2/3 still overshot “exactly two chairs.”
- Counter workspace drifted toward a small desk instead of kitchen-counter
  surface with a tucked stool.
- Finish is slightly softer/painterly than the bedroom’s denser pixel
  clusters; Pass 3 only partly corrected it.
- Hood stayed metallic stainless rather than the warmer wood/hood language
  of the accepted kitchen-v3.

## Next step for a shippable plate

Re-run Pass 1–3 through the same reference roles on a provider that can emit
native **1774×887** (OpenAI Image API / prior built-in imagegen path used for
bedroom and kitchen-v3). Keep Cursor output as composition proof only.

Do not replace `house-kitchen-v3` until Nosh picks a native-res candidate.
