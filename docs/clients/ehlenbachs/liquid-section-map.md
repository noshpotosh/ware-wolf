# Ehlenbach's — Liquid section map

**For:** Dex (Shopify Online Store 2.0 theme scaffold)  
**From:** Maeve Quinn  
**Date:** 2026-09-06  
**Contract:** Approved mocks in [`mockups/`](mockups/) +
[`README.md`](README.md)  
**Platform:** ADR 011 — custom Liquid theme (not Dawn cosplay,
not Hydrogen)

Scaffold sections from the **English names** below. Settings and
blocks are the merchant-editable slots. Keep first viewports
hero-clean — that is the villain this map defeats.

---

## Template inventory

| Template | File | Sections (order) |
| --- | --- | --- |
| Homepage | `templates/index.json` | Home Hero → Meet Us Story |
| Shop / browse | `templates/collection.json` | Shop Intro → Category Filters → Product Grid |
| Visit Us | `templates/page.visit.json` | Visit Hero → Visit Hours Strip |
| Shared layout | `layout/theme.liquid` | Announcement Banner (optional, under nav) → Header → `{{ content_for_layout }}` → Footer → Cart Drawer |

Gift Baskets: same `collection` template as Shop until the client
locks a dedicated builder. Point the nav link at a Gift Baskets
collection (or Shop category — **client-open**).

---

## Shared chrome

### Header (`sections/header.liquid`)

| Setting / block | Type | Notes |
| --- | --- | --- |
| Brand wordmark | image + alt *or* text | Hero-level on home/visit when overlaid; solid wood bar on shop |
| Overlay mode | select: `transparent` / `solid-wood` | Transparent on full-bleed heroes; solid wood on cream pages |
| Main menu | link list | Shop · Gift Baskets? · Visit Us · Cart |
| Cart icon | boolean + icon | Count badge uses barn red sparingly |
| Active link style | — | Cheddar-gold underline (Visit mock) |

**Not in header:** hours, shipping heat copy, promo stickers.

### Footer (`sections/footer.liquid`)

| Setting / block | Type | Notes |
| --- | --- | --- |
| Utility links | link list | Shipping notes · Hours · Contact |
| Address / phone | text | Quiet; mirrors Visit strip facts |
| SEO town list | richtext (optional) | Madison / Waunakee / Sun Prairie — **footer only** |
| Copyright | text | Family shop line |

### Cart drawer (`snippets/cart-drawer.liquid` or section)

Minimal: line items, subtotal, Checkout CTA. Heat / ice-pack
reminders may appear **here** or on a Shipping notes page — never
in the hero. Theme JS hook later: cart count tick on Shop Add.

### Announcement banner (`sections/announcement-banner.liquid`)

| Setting | Type | Notes |
| --- | --- | --- |
| Enable | boolean | Default **off** |
| Message | text | Seasonal only (holiday hours, heat season) |
| Link | URL (optional) | → Shipping notes page |

**Placement:** slim strip **under** the header — never above the
brand, never inside a hero section. Prefer footer utility when the
message is evergreen.

---

## `index` — Homepage

### Home Hero (`sections/home-hero.liquid`)

**Mock:** `ehlenbachs-01-homepage-hero.png`  
**Job:** One breath of brand + place; shop or plan a visit.

| Setting | Type | Mock default |
| --- | --- | --- |
| Background image | image | Full-bleed chalet counter / cheese |
| Brand title | text | Ehlenbach's Cheese Chalet |
| Headline | text | Wisconsin cheese, the family way. |
| Supporting sentence | textarea | Family-owned in DeForest for 58 years — aged cheddars, fresh curds, and gifts worth the drive. |
| Primary CTA label | text | Shop cheese |
| Primary CTA link | URL | `/collections/all` (or Shop) |
| Secondary CTA label | text | Plan your visit |
| Secondary CTA link | URL | `/pages/visit` |

**Blocks:** none required. One composition — no card grid, no
stats.

**Layout:** Left-aligned copy; leave cheese photography open on
the right. Mobile stacks: brand → headline → sentence → full-width
CTAs.

### Meet Us Story (`sections/meet-us-story.liquid`)

**Job:** Place + Sissy tease after the hero. Second viewport.

| Setting | Type | Mock default |
| --- | --- | --- |
| Background | color / image | Light wood grain |
| Heading | text | Meet us in DeForest |
| Accent rule | color | Barn red (sparse) |
| Story image | image | Sissy + chalet exterior |
| Image link | URL (optional) | Visit page |

**Blocks (optional later):** none for v1 — one heading + one image.

---

## `collection` — Shop browse

### Shop Intro (`sections/shop-intro.liquid`)

**Mock:** `ehlenbachs-02-shop-browse.png`  
**Job:** Name the shop job; show place product (cellar / wheels).

| Setting | Type | Mock default |
| --- | --- | --- |
| Heading | text | Shop Wisconsin Cheese |
| Supporting sentence | text | 230+ kinds — from squeaky curds to 21-year cheddar |
| Banner image | image | Letterbox aging-room / wheels |

Not a full-bleed brand hero. Cream field; wood header above.

### Category Filters (`sections/category-filters.liquid`)

| Setting | Type | Notes |
| --- | --- | --- |
| Filter menu | link list *or* collection list | All · Cheddar · Curds · Smoked · Blues · Gift Baskets · Summer Sausage |
| Active underline | — | Barn red (sparse) |

Horizontal row. Mobile: horizontal scroll. **No filter sidebar.**

### Product Grid (`sections/product-grid.liquid`)

Shopify collection products. Cards are allowed **here only** —
they are the shop interaction container.

#### Product card fields

| Field | Source | Notes |
| --- | --- | --- |
| Photo | featured image | Rustic / food photography |
| Name | product title | Warm serif |
| Price | `price` | Single price for v1 |
| Add | quick-add button | Label: **Add**; cheddar gold |
| URL | product URL | Whole card clickable except Add |

Desktop ~4 columns; mobile 2. Thin wood border on cream — keep
density like the mock. No badges, sale stickers, or rating stars
in v1 unless the client insists later.

---

## `page.visit` — Visit Us

Assign this template to the Visit page in admin.

### Visit Hero (`sections/visit-hero.liquid`)

**Mock:** `ehlenbachs-03-visit-us.png`  
**Job:** Sissy + chalet as the landmark; directions or call.

| Setting | Type | Mock default |
| --- | --- | --- |
| Background image | image | Full-bleed exterior + Sissy |
| Headline | text | Come say hi to Sissy. |
| Supporting sentence | textarea | Family-owned for 58 years — minutes north of Madison off I-90. Open 7 days. |
| Primary CTA label | text | Get directions |
| Primary CTA link | URL | Google Maps / Apple Maps |
| Secondary CTA label | text | Call the shop |
| Secondary CTA link | URL | `tel:` |

Brand wordmark stays in header (hero-level signal). Hours detail
belongs in the strip below — the supporting line may say “Open 7
days” as atmosphere, not a schedule table.

### Visit Hours Strip (`sections/visit-hours-strip.liquid`)

**Job:** Operational facts **after** the first viewport.

| Block type | Fields |
| --- | --- |
| Hours | label + lines (e.g. Mon–Thu 8–7 / Fri–Sun 8–8) |
| Address | label + street + city |
| Phone | label + number (`tel:` link) |
| Tagline | italic short line (e.g. Specialty blues and smoked cheeses made on site.) |

Background: light wood. Four columns desktop; stack mobile.
**Never** promote this strip into the hero section.

---

## Hero allow-list / ban list

Applies to **Home Hero** and **Visit Hero** (first viewport).

### Allow

- Brand (wordmark / title) at hero weight
- One headline
- One short supporting sentence
- One CTA group (primary + optional secondary)
- One dominant full-bleed place photo

### Ban

- Hours tables or exception banners
- Shipping / heat / ice-pack warnings
- Login / account modals
- Promo stickers, floating badges, info chips
- Stat strips, “230+” as a hero metric chip (subtitle on Shop Intro is fine)
- Product grids or cards
- Address blocks, schedule snippets, “this week” callouts
- Stacked alert towers above the brand

Cal checks preview first viewport against this list.

---

## Design tokens (theme settings → CSS variables)

Expose in `config/settings_schema.json` and map to `:root`.

| Token | CSS variable | Role |
| --- | --- | --- |
| Wood (dark) | `--color-wood` | Header solid bar, borders, structure |
| Wood (light grain) | `--color-wood-light` | Story / hours strip backgrounds |
| Dairy cream | `--color-dairy-cream` | Page fields, hero/nav text on photos |
| Cheddar gold | `--color-cheddar-gold` | Primary CTAs, active underline, flourishes |
| Barn red | `--color-barn-red` | Sparse: active filter, cart dot, accent rule |
| Ink / brown | `--color-ink` | Body and headings on cream |

| Type | CSS variable | Guidance |
| --- | --- | --- |
| Display / brand | `--font-display` | Warm serif or soft slab (e.g. Fraunces) |
| Body | `--font-body` | Readable warm serif or humanist |
| UI labels | `--font-ui` | Optional clean sans for HOURS / nav utilities |

**Hard avoid:** purple gradients · cream+terracotta AI-default ·
dark-mode “premium” · Inter / Roboto / Arial stacks · corporate
blue SaaS.

Atmosphere = real photography settings on sections — not abstract
gradients as the main idea.

---

## Nav IA

| Item | Recommendation | Status |
| --- | --- | --- |
| Shop | Top-level → All / primary collection | Locked (mocks) |
| Gift Baskets | Top-level **or** category under Shop | **Client-open** — mocks show top-level; prefer collection link until builder exists |
| Visit Us | Top-level peer to Shop | Locked (mocks); Sissy weight **client-open** if they want quieter |
| Cart | Icon → drawer | Locked |

Do not add Account / Login to the primary row for v1.

---

## Where operational notices live

| Notice type | Placement |
| --- | --- |
| Evergreen shipping / heat | Footer utility link → Shipping notes **page** (or policy) |
| Cart-relevant (ice pack) | Cart drawer line / note — not homepage |
| Seasonal hours exception | Slim **Announcement Banner** under nav, or Visit Hours Strip update |
| Daily hours / address / phone | Visit Hours Strip + footer echo |

**Never** first viewport. Prefer quiet chrome over banner theater.

---

## Motion (theme JS hooks — later)

Do not over-build in bet 1. Name the hooks; ship polish after
shell looks like the mocks.

| Hook | Behavior |
| --- | --- |
| `hero-settle` | Soft fade + slight scale-down of full-bleed photo on load |
| `cta-warm` | Cheddar button fills/darkens on hover; text link gold underline draws L→R |
| `shop-add` | Add pulses gold once; cart count ticks — no confetti |

Optional later: gentle parallax on Meet Us Story image.

---

## Out of scope (this map)

| Item | When |
| --- | --- |
| PDP / product detail sections | Next Maeve pass (bet 5) |
| Checkout chrome | Shopify hosted; do not theme-fight it |
| Apps (loyalty, wholesale, basket builder) | After catalog slice; prefer products + line-item props first |
| Full catalog import | Bet 4 |
| Domain / cutover | Bet 6 |

---

## Dex handoff checklist (bets 1–3)

1. Theme scaffold + tokens + Header / Footer / Cart Drawer  
2. `index` (Home Hero + Meet Us Story) + `page.visit` (Visit Hero + Hours Strip)  
3. `collection` (Shop Intro + Category Filters + Product Grid)

Maeve signs off preview vs mocks before catalog slog. Cal owns
first-viewport ban-list check.
