# Fabrizio — Ehlenbach's Shopify go plan (Basic + customize-first)

**Date:** 2026-09-07  
**Owner:** Fabrizio Cortell  
**Branch:** `cursor/ehlenbachs-shopify-plan-15f4`  
**Concern:** Cost/support intensity lock + go-plan writeup only

## Context

Client is a small shop: watch the bread, need support, no
dedicated web staff. We already locked Shopify (ADR 011) and
Maeve’s mocks. Talk-through: keep Shopify; lock **how hard** we
build.

## Locked

- ADR 012 — Shopify **Basic** + Shopify Payments +
  **customize-first** theme; no v1 app sprawl
- Go plan rewritten in `docs/clients/ehlenbachs/shopify-build.md`
- Bet 1 (theme shell) starts after / beside this plan — Dex

## Not this PR

- Theme code (Dex, separate branch/PR)
- Liquid section map body (Maeve, PR #54)
- Catalog, cutover, PDP

## Next

Dex bet 1 against liquid map + this go plan. Maeve signs off
preview vs mocks before catalog slog.
