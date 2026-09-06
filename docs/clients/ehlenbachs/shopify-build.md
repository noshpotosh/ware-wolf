# Ehlenbach's — Shopify build plan

**Platform:** Shopify Online Store 2.0 (Liquid) — locked in
[`../../decisions/011-ehlenbachs-shopify.md`](../../decisions/011-ehlenbachs-shopify.md)  
**Design contract:** Maeve mock pack (Home · Shop · Visit Us)  
**Status:** Client approved mocks; platform locked Shopify

---

## Verdict (build shape)

Custom Liquid theme that *looks like the mocks*, on Shopify
checkout. Not Dawn-with-a-logo. Not Hydrogen.

**Success moment:** Preview storefront feels like the chalet;
visitor can browse cheese and open Visit Us without drowning in
shipping notices.

---

## Map mocks → Shopify

| Mock | Shopify surface |
| --- | --- |
| Homepage hero + story strip | `index` template — hero section + story section |
| Shop browse | `collection` template + collection list / “All” |
| Visit us (Sissy) | `page` template (Visit) — full-bleed + hours strip |
| Gift Baskets nav | Collection or menu link (client still picks weight) |
| Product cards | Collection grid; PDP is the *next* mock/build bet |

Theme tokens: wood, dairy cream, cheddar gold, sparse barn red.
Expressive serif for brand/headlines — not Inter/Roboto.

---

## PR-sized bets (ordered)

1. **Shopify shell + design tokens**  
   Dev store, theme repo/scaffold, fonts/colors, base layout
   (header/footer). No full catalog dump required.

2. **Homepage + Visit page sections**  
   Brand-led heroes per mocks. Hours / shipping live in quiet
   utility or footer — never the first viewport.

3. **Collection / Shop browse**  
   Category filters + restrained product cards (photo, name,
   price, Add). Match mock density; no filter-sidebar theater.

4. **Catalog migration slice**  
   Import a real subset (cheddars, curds, smoked, blues, sausage,
   1–2 baskets). Metafields for gift message / ice pack as needed.

5. **Product detail (after Maeve PDP mock or tight Maeve pass)**  
   One honest PDP — not a gift-basket builder yet.

6. **Cutover**  
   Payments, shipping rules (incl. heat guidance as policy page /
   cart notice), domain, redirects from old URLs.

Skip until later: custom basket builder apps, loyalty, wholesale
portal, headless.

---

## Risks to watch

| Risk | Guard |
| --- | --- |
| Stock theme drift → corporate bland | Maeve signs off preview vs mocks before catalog slog |
| Shipping/heat warnings creep back into hero | Section allow-list; Cal checks first viewport |
| App sprawl for gift baskets | Prefer products/collections + line-item props first |
| Full catalog boil-the-ocean | Bet 4 is a *subset*; expand after look is locked |

---

## Open client questions (still)

Still needed from the mock pack — platform does not answer them:

1. Real photography vs stand-ins  
2. Wordmark keep / redraw  
3. Sissy nav weight  
4. Shipping/hours chrome shape  
5. Gift baskets: top nav vs Shop category  
6. Next creative: PDP vs gift-basket builder  

---

## Crew

| Who | Job |
| --- | --- |
| Maeve | Section inventory for Liquid; PDP mock when we pull that bet |
| Dex | Theme + store config on Shopify |
| Cal | First-viewport / cozy-vs-template adversarial pass on preview |
| Reed | Theme code readability when Dex's slice is behavior-green |
| Fabrizio | Keep bets scoped; no kitchen-sink “launch everything” PR |
