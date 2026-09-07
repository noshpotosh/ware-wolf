# Ehlenbach's — Shopify go plan

**Client:** Ehlenbach's Cheese Chalet (small WI shop, no dedicated
web staff)  
**Platform:** Shopify Online Store 2.0 — ADR
[`011`](../../decisions/011-ehlenbachs-shopify.md) +
[`012`](../../decisions/012-ehlenbachs-shopify-basic-customize.md)  
**Design:** Approved mocks + Liquid section map  
**Status:** V2 Home, Shop, and Visit implemented locally; preview pending

---

## One-line verdict

**Shopify Basic + Shopify Payments + customize-first theme** that
looks like Maeve’s chalet mocks. Hosted support for a shop that
cannot hire a webmaster — without burning bread on Plus, Hydrogen,
or app piles.

---

## Why Shopify (for *this* client)

| Constraint | Call |
| --- | --- |
| Small business / watch the bread | Basic plan; customize-first theme; no app sprawl |
| No dedicated staff / need support | Hosted cart, checkout, payments; Shopify Help; admin they can learn |
| Cozy brand (approved V2 direction) | Restyle to wood / dairy cream / cheddar gold — not Dawn-stock bland |
| Google Ads / Shopping | Clean **primary** product images (white/neutral) for the feed; lifestyle OK on site |

**Not the job:** cheapest possible monthly website. **The job:**
sell cheese online + look like the chalet + not invent an IT dept.

**Dex handoff (bets 1–3):** section names, settings, hero
allow/ban list, tokens, and nav IA live in
[`liquid-section-map.md`](liquid-section-map.md). Scaffold from
that map — do not invent sections from the PNGs alone.

---

## Money (client-plain)

| Bucket | What | Notes |
| --- | --- | --- |
| Platform rent | Shopify **Basic** (~$29/mo annual / ~$39 monthly) | Pocket vs staff time |
| Cards | Shopify Payments (~2.9% + 30¢ online) | Use Shopify Payments — avoid Basic’s extra % on third-party gateways |
| Build | Warewolf theme + setup + training | Real bread — scope protects this |
| Apps | **$0 target for v1** | Baskets = collections/products first |

Photography and wordmark decisions still affect art cost, not
platform choice.

---

## Design → build contract

| Artifact | Role |
| --- | --- |
| [`README.md`](README.md) + [`mockups/v2/`](mockups/v2/) | Current look & feel lock |
| [`liquid-section-map.md`](liquid-section-map.md) | Dex section names / hero allow-ban (this pack) |
| This go plan | Intensity, tier, bet order, cost rules |

Tokens: wood, dairy cream, cheddar gold, sparse barn red.
Expressive serif — not Inter/Roboto. Hours/shipping **never** in
the hero.

---

## Theme intensity (ADR 012)

1. **Default:** customize-first — clean OS 2.0 base, restyle to
   mocks / liquid map.
2. **Escalate** to more custom Liquid only where the base theme
   fights the cozy contract (Maeve call).
3. **Never** Hydrogen / headless for v1.

---

## PR-sized bets (go order)

### Bet 1 — Theme shell + tokens *(now)*
- Theme folder in-repo (scaffold Dex can push to a Shopify preview
  when credentials exist)
- Design tokens + Header / Footer / Cart drawer stubs
- Follow liquid map shared chrome
- **No** full catalog

### Bet 2 — Homepage + Visit
- `Home Hero`, `Meet Us Story`, `Visit Hero`, `Visit Hours Strip`
- Maeve preview sign-off vs mocks

### Bet 3 — Shop collection
- `Shop Intro`, `Category Filters`, `Product Grid`
- Sample products only if needed for the grid

### Bet 4 — Catalog slice
- Real subset: cheddars, curds, smoked, blues, sausage, 1–2 baskets
- Gift message / ice pack as line-item props or metafields — not apps

### Bet 5 — PDP
- After Maeve’s PDP pass (or tight Maeve review)

### Bet 6 — Cutover
- Payments live, shipping/heat as policy + cart note, domain,
  redirects, client admin training

**Skip until later:** basket builder apps, loyalty, wholesale,
Plus, headless.

---

## Google Ads / images (client already asked)

- **Site:** cozy / lifestyle product photos OK (and preferred)
- **Shopping / Ads primary (`image_link`):** clean white/neutral
  still best practice — separate job from the storefront gallery
- Do not bleach the whole site white because Ads exists

---

## Open client questions (scaffold-safe)

1. Real photography vs stand-ins  
2. Wordmark keep / redraw  
3. Sissy nav weight  
4. Shipping/hours chrome (footer utility vs slim seasonal banner)  
5. Gift Baskets top-nav vs Shop category  
6. Next creative: PDP vs gift-basket builder  

Dex scaffolds without waiting; art lock waits on 1–2.

---

## Crew

| Who | Now |
| --- | --- |
| Fabrizio | Scope / cost lock (this plan); one concern per PR |
| Maeve | Liquid map shipped; sign-off vs mocks on preview; PDP when that bet |
| Dex | Theme shell + bets 1–3 from the liquid map |
| Cal | First-viewport ban-list when preview exists |
| Reed | Theme readability after Cal |

---

## Success for “going”

Preview storefront (or in-repo theme preview) shows chalet tokens +
header/footer that could become the mocks — not a stock purple SaaS
template. Client can be told: *Basic plan, no apps yet, build in
slices.*
