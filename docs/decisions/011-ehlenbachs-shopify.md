# ADR 011 — Ehlenbach's Cheese Chalet builds on Shopify

**Status:** Locked  
**Date:** 2026-09-06  
**Deciders:** Nosh (call)  
**Recorded:** Fabrizio Cortell  
**Design pack:** [`../clients/ehlenbachs/`](../clients/ehlenbachs/)
(mockups in PR #42 / pack README when merged)

## Decision

1. **Ehlenbach's Cheese Chalet redesign ships on Shopify** —
   Online Store (hosted cart, checkout, catalog), not a custom
   storefront stack and not headless-by-default.
2. **Theme path:** custom **Online Store 2.0 (Liquid)** theme
   shaped to Maeve's cozy chalet mocks — warm wood / dairy cream /
   cheddar gold. Do **not** ship stock Dawn-looking corporate
   bland, and do **not** jump to Hydrogen / headless unless a
   later founder call reopens this.
3. **Mocks stay the product contract.** Homepage, Shop/collection,
   and Visit Us must match the approved direction; operational
   notices stay out of the hero.
4. **Build in scoped PR-sized bets** (see
   [`../clients/ehlenbachs/shopify-build.md`](../clients/ehlenbachs/shopify-build.md)).
   Catalog + theme shell before gift-basket theater or app sprawl.

## Why

- This is a small family shop selling cheese, sausage, and gifts
  online + in-store. Shopify owns cart, payments, shipping tools,
  and ops the client already understands better than a bespoke
  stack.
- Client approved the cozy mockups. The risk is not "can Shopify
  sell cheese" — it is "does the theme still feel like the
  chalet." Liquid OS 2.0 is enough to hit that if we custom-theme
  it.
- Hydrogen / headless adds hosting, auth, and maintenance cost
  with no clear win for this catalog size. Kill it for v1.

## Consequences

- Dex builds Shopify theme / store config — not a greenfield
  Next.js shop.
- Maeve maps mock sections → Shopify templates/sections before
  build starts.
- Cheese shipping heat notes, ice packs, gift messages, and hours
  become theme sections / product options / metafields — never
  hero banners that recreate the old site's villain.
- Domain / DNS cutover and catalog migration are separate bets
  after the theme proves the look on a Shopify preview store.
