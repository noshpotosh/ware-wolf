# Meeting — Founder customization flow (ADR 014)

**Date:** 2026-09-07  
**Who:** Nosh (ask), Fabrizio Cortell (planning), Maeve Quinn (product)  
**Topic:** Character / founder customization screen and flow for the
painted point-and-click office  
**Vehicle:** [ADR 014](../decisions/014-painted-room-point-and-click.md)  
**Thesis:** [ADR 007](../decisions/007-honest-ai-studio-tycoon.md)

## What was asked

Nosh wants players to customize their character. Fabrizio and Maeve
shaped a flow that fits the current room system — not the retired
Phaser loft walk.

## Reality check

Under ADR 014 the founder is **removed from the room painting**.
There is no walk sprite. Identity lives in:

1. Shell portrait medallion (`#founder-avatar`)
2. VN dialogue portrait on inspect speech
3. Desktop Directory founder row
4. Shell / Directory display name

A look cannot appear in the painted room without a full re-paint.
Customization is shell/portrait identity, not in-room presence.

## Verdict

**Ship a bounded founder look — as whole portrait kits, not a
dress-up sim.**

Villain: Cosplay Avatar Creator that delays the first click on the
office. Kill layered mixers, morphs, and free color pickers for v1.

## Proposed flow

**Look → Studio → Confirm** (DOM overlay, one composition).

| Step | Job |
| --- | --- |
| Look | Pick one of **4 whole look kits**; preview = large dialogue portrait + medallion crop of the same art |
| Studio | Company name + founder display name (length-capped) |
| Confirm | Recap → **Open the office** |

**Entries**

- New game / first open: full identity pour before exploration
- Edit later: **Menu → Your look** and **Directory → You**
- Not from hotspots, Journal, Mail, or Teams

**Skip look** allowed (kit A = current Nosh portrait). Still land
Studio / Confirm so the studio gets a name.

## Art / data fence

- **Whole kits only** — one transparent portrait PNG per `lookId`
  (same file drives medallion, dialogue, Directory)
- Kit A = accepted `assets/ui/nosh-portrait.png`
- Provenance JSON per kit (same discipline as `nosh-portrait`)
- Persist on existing adventure save (`warewolf.adventure.v1` bump):

```text
founder: { lookId, displayName, companyName }
```

Missing fields migrate to kit A + `"Nosh"` + empty/Untitled company.
Inventory (mug) must survive look edits.

## Hard cuts (v1)

- Layered hair/outfit/skin pickers
- In-room founder figure / walk sprites
- Project pitch inside this flow
- Pronouns as a creator axis
- Unlockable / paid cosmetics
- Per-surface mismatched faces
- Crew outfit customization

## Open decisions for Nosh

1. Display name editable? (recommend **yes**)
2. Kit count at first ship: **4** or fewer (Fabrizio would ship
   default + 1–2 alternates if art is slow)
3. Company name visible in room chrome now, or save-only until
   heading copy exists?
4. Internal id stay `nosh` vs rename to `founder` when display name
   diverges?
5. When the player isn’t “Nosh,” do Directory crew stay Warewolf
   demo cast or fictionalize? (ADR 008 cast clause)
6. Force creator once per fresh adventure, or soft prompt with Skip?

## Build sequence (when greenlit)

1. Maeve: optional mock / copy lock against shell chrome
2. Art: kits B–D + provenance (or ship UI with kit A only + honest
   disabled slots)
3. Dex: DOM overlay + adventureState fields + wire medallion /
   dialogue / Directory
4. Cal: confirm consistency across three surfaces; reload; mug
   inventory intact
5. Reed: readability / naming pass

One concern per PR. No auto-merge.

## Copy samples (Maeve)

- Look: “Who’s behind the desk?”
- Support: “One look. Medallion, dialogue, and Directory stay honest.”
- Studio: “Name the studio”
- Confirm CTA: “Open the office”
- Skip: “Use the default look”
- Edit: “Your look”

## Status

**Proposal — not locked.** Waiting on Nosh’s open decisions before
Dex builds.
