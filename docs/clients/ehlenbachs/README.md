# Ehlenbach's Cheese Chalet — redesign mockups

**Client:** [Ehlenbach's Cheese Chalet](https://ehlenbachscheese.com)  
**Location:** DeForest, WI (near Madison)  
**Prepared by:** Warewolf (Maeve Quinn, product & design)  
**Date:** 2026-09-06 (brief) · round-2 mocks 2026-09-07  
**Status:** Client approved mocks · inspiration pack round 2
(PDP / gift baskets / cart) · Shopify Basic + customize-first
(ADR 011/012) · Go plan in [`shopify-build.md`](shopify-build.md) ·
Liquid section map is the Dex handoff
([`liquid-section-map.md`](liquid-section-map.md))

---

## The bet

Make the site feel like walking into the chalet — warm wood,
Wisconsin dairy pride, family shop — not like a dated corporate
e-commerce template with shipping notices shouting over the brand.

**Success moment:** A visitor lands, knows *who* this is in one
breath, feels the place, and either shops cheese or plans a visit
to see Sissy. Operational noise (hours exceptions, heat shipping
warnings) lives *after* the story, or in quiet utility chrome —
never in the hero.

**Villain defeated:** Cluttered first viewport + weak brand signal.

---

## Visual direction

| Token | Direction |
| --- | --- |
| Wood | Warm walnut / pine beams — structure and nav warmth |
| Dairy cream | Soft cream page fields (not flat white, not yellowed) |
| Cheddar gold | Primary CTAs, active states, aged-cheddar accents |
| Barn red | Sparse — active category, holiday note, or landmark cue |
| Light | Soft Midwest daylight; never dark-mode “premium” |

**Avoid (hard):** Purple gradients · cream + terracotta AI-default ·
dark mode · corporate blue SaaS · Inter / Roboto / Arial stacks ·
hero card spam · floating badges on photos.

**Typography (build guidance):** Expressive warm display serif or
soft slab for the brand and headlines (e.g. Fraunces / similar).
Readable warm body serif or humanist for copy. Brand wordmark must
outweigh the marketing headline on branded pages.

**Atmosphere:** Real chalet / cheese / Wisconsin place photography —
not abstract gradients as the main idea.

---

## Page set

**Round 1 (approved):** Homepage · Shop browse · Visit us.

**Round 2 (inspiration pack):** Product detail · Gift baskets ·
Cart drawer. Same visual DNA; cut vanity (no mobile/About fourth
unless it sharpens a later bet).

---

## Mockups

| File | What it shows |
| --- | --- |
| [`mockups/ehlenbachs-01-homepage-hero.png`](mockups/ehlenbachs-01-homepage-hero.png) | First viewport: **Ehlenbach's Cheese Chalet** as hero-level brand, one headline, one sentence, Shop / Visit CTAs over full-bleed chalet cheese counter. Story strip peeks: “Meet us in DeForest” + Sissy. |
| [`mockups/ehlenbachs-02-shop-browse.png`](mockups/ehlenbachs-02-shop-browse.png) | Shop job only: warm cream field, category filters, restrained product cards (photo, name, price, Add). No filter sidebar theater. |
| [`mockups/ehlenbachs-03-visit-us.png`](mockups/ehlenbachs-03-visit-us.png) | Visit / About: full-bleed exterior with Sissy the Cow, “Come say hi to Sissy,” directions + call CTAs; hours/address strip below. |
| [`mockups/ehlenbachs-04-product-detail.png`](mockups/ehlenbachs-04-product-detail.png) | **Inspiration pack round 2 — PDP:** Aged Cheddar — 2 Year; large cozy cheese photo + one Add CTA; ice-pack / gift-message as quiet utility lines (no related grid). |
| [`mockups/ehlenbachs-05-gift-baskets.png`](mockups/ehlenbachs-05-gift-baskets.png) | **Round 2 — Gift baskets:** Collection page — atmospheric basket photo strip + three gift-worthy baskets (cards only for shop interaction). |
| [`mockups/ehlenbachs-06-cart-drawer.png`](mockups/ehlenbachs-06-cart-drawer.png) | **Round 2 — Cart drawer:** Quiet warm drawer over shop; ice pack + gift message as subtle notes; one Checkout CTA — no shipping-alert tower. |

### Hero budget (homepage & visit)

Allowed in the first viewport:

- Brand (hero-level)
- One headline
- One short supporting sentence
- One CTA group
- One dominant full-bleed image

Not allowed: hours banners, shipping heat warnings, login modals,
promo stickers, stat strips, product grids, floating badges.

---

## Motion ideas (for later build — 2–3 intentional)

1. **Hero settle** — soft fade + slight scale-down of the full-bleed
   photo on load (presence, not bounce).
2. **CTA warm** — cheddar-gold button fills / darkens on hover; text
   link gets a thin gold underline that draws left→right.
3. **Shop add** — product card “Add” briefly pulses gold and a tiny
   cart count ticks up (one honest feedback beat — no confetti).

Optional later: story strip image gently parallax on scroll (keep
subtle; this is a cheese shop, not a fashion lookbook).

---

## Mobile + desktop

| Surface | Note |
| --- | --- |
| Desktop | One composition per viewport; brand dominates; nav stays thin and secondary. |
| Mobile | Same hero budget stacked: brand → headline → sentence → CTAs full-width. Category filters become a horizontal scroll row. Product grid → 2 columns. Visit hours stack under the hero — still not in the first breath if it crowds Sissy. |
| Shared | Operational notices collapse into a small “Shipping & hours” link or footer utility — never a stacked alert tower above the brand. |

---

## Copy tone (client-facing)

Warm, plainspoken, Wisconsin-proud. Short sentences. Family and
place before SEO keyword salad. Lead with cheese and the chalet;
save “Madison / Waunakee / Sun Prairie” lists for footer SEO if
needed — not the homepage story.

Suggested homepage line (in mock):  
*Wisconsin cheese, the family way.*

Suggested visit line (in mock):  
*Come say hi to Sissy.*

---

## Open questions for the client

1. **Photography:** Can we use (or shoot) real chalet interior,
   counter cheese, and Sissy exterior? Mocks use evocative stand-ins.
2. **Brand wordmark:** Keep the current logo lockup, redraw a warm
   serif wordmark, or both (logo mark + type)?
3. **Sissy prominence:** Homepage story strip only, or also a Visit
   nav item as primary as Shop? (Mocks assume Visit is a peer.)
4. **Operational notices:** Prefer a quiet “Shipping notes” drawer /
   footer vs. a slim seasonal banner under the nav (never in the
   hero)?
5. **Gift baskets:** Own top-nav item (as mocked in round 2) or a
   category inside Shop?
6. **Gift-basket builder:** Static featured baskets (as mocked) vs
   a builder flow later — which sells more for them?

---

## Out of scope (this bet)

- Live site build / theme migration
- Checkout / account flows (cart drawer is inspiration only)
- Gift-basket *builder* UI
- Game or Warewolf office product work

---

## Build handoff

Platform and scoped bets:
[`shopify-build.md`](shopify-build.md) · ADR 011.  
Implementable Liquid templates/sections for Dex:
[`liquid-section-map.md`](liquid-section-map.md).

---

## How to use these with the client

**Round 1:** Home → Shop → Visit. Speak the villain once: *“Your
cheese and your family are the story — the site should feel like
the chalet, not like a shipping bulletin.”*

**Round 2:** PDP → Gift baskets → Cart drawer. Same DNA deeper in
the shop path — buy a cheese, give a basket, checkout without
noise. Collect answers to the open questions; then lock art
direction for build.
