# Maeve — Ehlenbach's Liquid section map

**Date:** 2026-09-06  
**Owner:** Maeve Quinn  
**Branch:** `cursor/ehlenbachs-liquid-map-15f4`  
**Concern:** Mocks → Shopify OS 2.0 section inventory only

## Context

Client approved the cozy mocks. Nosh/Fabrizio locked Shopify
(ADR 011). Dex needs named Liquid sections before scaffolding —
not another pretty PNG essay.

## What shipped

- `docs/clients/ehlenbachs/liquid-section-map.md` — templates,
  sections/blocks, hero allow/ban, tokens, nav IA, product card
  fields, ops-notice placement, light motion hooks
- `shopify-build.md` + pack README pointed at the map for bets 1–3

## Section inventory (short)

- **Shared:** Header · Footer · Cart drawer · Announcement banner
  (under nav, optional)
- **`index`:** Home Hero → Meet Us Story
- **`collection`:** Shop Intro → Category Filters → Product Grid
- **`page.visit`:** Visit Hero → Visit Hours Strip

## Still client-open (does not block scaffold)

Photography · wordmark · Sissy nav weight · shipping/hours chrome
shape · Gift Baskets top-nav vs Shop category · next creative
(PDP vs gift builder). Dex can scaffold; merchants fill art once
photos land.

## Not this PR

- Theme code, catalog, PDP map, checkout, apps, game/office

— Maeve
