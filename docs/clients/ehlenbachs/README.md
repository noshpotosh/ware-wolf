# Ehlenbach's Cheese Chalet — redesign mockups

**Client:** [Ehlenbach's Cheese Chalet](https://ehlenbachscheese.com)  
**Location:** DeForest, WI (near Madison)  
**Prepared by:** Warewolf (Maeve Quinn, product & design)  
**Date:** 2026-09-06  
**Status:** Direction + mockups for founder → client review

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

## Page set (3 screens — this PR-sized bet)

Cut vanity pages. These three sell the redesign:

1. **Homepage** — brand-led full-bleed hero + one story strip
2. **Shop / browse** — category browse with product cards *only*
   where shopping interaction needs them
3. **Visit us** — Sissy + hours + directions (the landmark is the
   story; Product Detail can wait until the client green-lights)

---

## Mockups

| File | What it shows |
| --- | --- |
| [`mockups/ehlenbachs-01-homepage-hero.png`](mockups/ehlenbachs-01-homepage-hero.png) | First viewport: **Ehlenbach's Cheese Chalet** as hero-level brand, one headline, one sentence, Shop / Visit CTAs over full-bleed chalet cheese counter. Story strip peeks: “Meet us in DeForest” + Sissy. |
| [`mockups/ehlenbachs-02-shop-browse.png`](mockups/ehlenbachs-02-shop-browse.png) | Shop job only: warm cream field, category filters, restrained product cards (photo, name, price, Add). No filter sidebar theater. |
| [`mockups/ehlenbachs-03-visit-us.png`](mockups/ehlenbachs-03-visit-us.png) | Visit / About: full-bleed exterior with Sissy the Cow, “Come say hi to Sissy,” directions + call CTAs; hours/address strip below. |

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
5. **Gift baskets:** Own top-nav item (as mocked) or a category
   inside Shop?
6. **Next mock after approval:** Product detail page, or gift-basket
   builder — which sells more for them?

---

## Out of scope (this bet)

- Live site build / theme migration
- Product detail page mock
- Checkout / account flows
- Game or Warewolf office product work

---

## How to use these with the client

Show the three PNGs in order (Home → Shop → Visit). Speak the
villain once: *“Your cheese and your family are the story — the
site should feel like the chalet, not like a shipping bulletin.”*
Collect answers to the open questions; then we lock art direction
for build.
