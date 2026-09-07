# Ehlenbach's Cheese Chalet — Shopify theme (bet 1)

**Path:** `clients/ehlenbachs/theme/`  
**Platform:** Shopify Online Store 2.0 (Liquid) — ADR 011 / 012  
**Slice:** Theme shell + design tokens + shared chrome stubs  
**Not this PR:** Homepage polish (bet 2), collection grid (bet 3),
catalog import, apps, Hydrogen

---

## What shipped

| Area | Files |
| --- | --- |
| Tokens | `settings_schema.json` → `:root` CSS vars via `css-variables` |
| Layout | `theme.liquid`: Header → Announcement → main → Footer → Cart |
| Chrome | `header`, `footer`, `announcement-banner` (off), cart drawer |
| Home stubs | `home-hero`, `meet-us-story` + `templates/index.json` |
| Install shape | Thin product / collection / page / cart / 404 via `page-stub` |

CSS tokens: `--color-wood`, `--color-dairy-cream`,
`--color-cheddar-gold`, `--color-barn-red`, `--color-ink`, fonts.

Hero allow/ban from the liquid map applies: **hours and shipping
never go in the hero.**

---

## Design contract (read before filling stubs)

- Liquid map:
  [`liquid-section-map.md`](../../../docs/clients/ehlenbachs/liquid-section-map.md)
- Mocks + README:
  [`docs/clients/ehlenbachs/`](../../../docs/clients/ehlenbachs/)
- Go / build plan:
  [`shopify-build.md`](../../../docs/clients/ehlenbachs/shopify-build.md)

Tokens: wood, dairy cream, cheddar gold, sparse barn red.
Display font: warm serif (Fraunces via theme font picker) — not
Inter / Roboto.

---

## Preview on a Shopify store

Live store credentials are **out of band** — not in this repo or
Cloud Agent env. Someone with shop access runs:

```bash
# Once: Shopify CLI + auth to the preview shop
npm install -g @shopify/cli @shopify/theme
shopify auth login

# From this theme folder
cd clients/ehlenbachs/theme
shopify theme push --unpublished --theme "Ehlenbachs shell"
# or live preview:
shopify theme dev
```

Notes:

- Use a **development / unpublished** theme on Basic — do not
  overwrite production until bet 6 cutover.
- `shopify theme check` is useful before push.
- Without CLI login / store credentials, push cannot run here.

---

## Merchant settings to set after push

1. Theme settings → Colors / Typography (chalet defaults)
2. Header → overlay mode (`transparent` on home; `solid-wood` on
   shop later), main menu link list
3. Announcement banner → leave disabled unless seasonal
4. Upload real photography into Home Hero / Meet Us when art lands

---

## Next bets (do not stuff this PR)

2. Homepage + Visit visual fill vs mocks  
3. Shop collection sections  
4. Catalog slice
