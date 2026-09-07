# ADR 012 — Ehlenbach's Shopify: Basic + customize-first

**Status:** Locked  
**Date:** 2026-09-07  
**Deciders:** Nosh + Fabrizio (client constraints talk)  
**Amends:** [`011-ehlenbachs-shopify.md`](011-ehlenbachs-shopify.md)
(platform still Shopify; build *intensity* and plan tier locked here)

## Decision

1. **Shopify plan tier: Basic** (annual if the client will commit).
   Not Grow/Advanced/Plus unless volume later justifies fee math.
2. **Payments: Shopify Payments** — avoid the third-party gateway
   surcharge on Basic.
3. **Theme path: customize-first.** Start from a clean Online Store
   2.0 theme (or minimal Dawn fork) and restyle hard to Maeve’s
   mocks + [`liquid-section-map.md`](../clients/ehlenbachs/liquid-section-map.md).
   Full from-scratch theme only if customize-first cannot hit the
   cozy contract without fighting the base theme.
4. **No app sprawl for v1.** Gift baskets = products/collections
   (+ line-item properties). No loyalty, wholesale portal, or
   custom basket-builder apps on day one.
5. **Cost framing for the client:** platform rent is cheap; the
   real bread is build + training. Shopify wins because they have
   **no dedicated web staff** — hosted checkout, 24/7 platform
   support, admin they can run themselves.

## Why

- Small cheese shop: monthly Shopify Basic (~$29–39) is not the
  budget risk. Overbuilding the theme or stacking apps is.
- “Need support / no dedicated staff” favors a hosted commerce
  platform over a cheaper brochure builder *or* a custom stack
  Warewolf would have to babysit.
- Cozy ≠ every Liquid file written from zero. Maeve’s mocks are
  the product contract; cheapest honest path that matches them
  wins (KISS).

## Consequences

- Dex bet 1 = theme shell + tokens + shared chrome, aimed at
  mocks — not Hydrogen, not Plus, not app theater.
- Client-facing plan lives in
  [`../clients/ehlenbachs/shopify-build.md`](../clients/ehlenbachs/shopify-build.md).
- Reopen this ADR only if Basic blocks a hard requirement or
  customize-first fails Maeve’s sign-off vs mocks.
