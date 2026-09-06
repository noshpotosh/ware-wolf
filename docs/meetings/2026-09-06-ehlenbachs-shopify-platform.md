# Fabrizio — Ehlenbach's platform lock (Shopify)

**Date:** 2026-09-06  
**Owner:** Fabrizio Cortell  
**Branch:** `cursor/ehlenbachs-shopify-lock-15f4`  
**Concern:** Platform decision + Shopify-shaped build plan only

## Context

Client loved Maeve's redesign mocks (Home · Shop · Visit Us).
Nosh notes the build plan will use **Shopify**.

## Verdict

**Ship Shopify.** Right tool for a small WI cheese shop with real
cart/shipping needs. Kill custom storefront and Hydrogen for v1 —
the failure mode is a bland theme, not the platform.

## Locked

- ADR 011 — Shopify Online Store 2.0 (Liquid) custom theme
- Build plan: `docs/clients/ehlenbachs/shopify-build.md`
- Mocks remain the product contract; ops notices stay out of hero

## Next (not this PR)

1. Merge mock pack (PR #42) when ready  
2. Maeve: Liquid section map from mocks  
3. Dex: bet 1 — Shopify shell + design tokens on a preview store  
4. Still collect open client questions (photo, wordmark, Sissy, etc.)

## Not this PR

- Theme code, catalog import, DNS, live cutover
- Replacing or regenerating mockup PNGs
