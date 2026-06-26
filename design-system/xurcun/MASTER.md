# XURCUN — Design System (MASTER) · Source of Truth

> Built from the official **Xurcun Corporate Identity Guideline** (28-page brand book, 2023).
> Slogan: **"FOND OF QUALITY"**. Premium Azerbaijani dried-fruit / nuts / sweets / gift boutique.
> When building a page, check `design-system/xurcun/pages/[page].md` first; otherwise use this file.

---

## 1. Brand Colors (official palette)

### Primary (Birincil)
| Token | Hex | Pantone | Use |
|---|---|---|---|
| `--gold` | **#9D7C38** | PANTONE 8640C | Brand gold — logo, heading accents, CTA, lines, icons |
| `--ink` (black) | **#2E2A25** | PANTONE Black C | Warm near-black — text, dark sections, logo on light |
| `--cream` | **#EBE5D7** | (brand cream) | Signature background — pages, cards, hero |

> Note: the brand book's "Gold Foil" swatch lists an erroneous hex (#00B5CB = cyan, a print-foil placeholder). The **real, usable gold is #9D7C38**. Use a subtle gradient `#B8923F → #9D7C38 → #7E6228` only for premium gold-foil effects (badges, emblem).

### Secondary (İkincil) — accents only (category badges, seasonal, states)
| Token | Hex | Pantone |
|---|---|---|
| `--blue` | #003DA6 | PANTONE 293C |
| `--navy` | #00263A | PANTONE 539C |
| `--red` | #AA182C | PANTONE (crimson) |
| `--green` | #295135 | PANTONE 350C |

### Suggested neutral scale (derived, for UI)
`--cream-100 #F4F0E7` · `--cream-200 #EBE5D7` (base) · `--line #DAD2BE` (hairlines on cream) ·
`--ink #2E2A25` · `--ink-muted #4A453C` · `--white #FFFFFF`

```css
:root{
  --gold:#9D7C38; --gold-dark:#7E6228; --gold-light:#B8923F;
  --ink:#2E2A25; --ink-muted:#4A453C;
  --cream:#EBE5D7; --cream-100:#F4F0E7; --line:#DAD2BE; --white:#fff;
  --blue:#003DA6; --navy:#00263A; --red:#AA182C; --green:#295135;
}
```

---

## 2. Typography (official brand fonts)

| Role | Brand font | Web fallback (Google) | Notes |
|---|---|---|---|
| Display / Headings / Logo word | **Rufolo Regular** (elegant high-contrast serif) | **Cormorant Garamond** (or EB Garamond) | Rufolo is commercial; load licensed webfont if owned, else Cormorant Garamond is the closest free match |
| Body / UI / Labels | **Montserrat** | **Montserrat** (free) | On Google Fonts — use directly |
| Decorative accent (sparingly) | **Al Fresco Bold** (script) | **Pinyon Script** / **Great Vibes** | Only short flourishes (e.g. "Fond of Quality"), never body |

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Pinyon+Script&display=swap" rel="stylesheet">
```
```css
--font-display:"Rufolo","Cormorant Garamond",serif;
--font-body:"Montserrat",system-ui,sans-serif;
--font-script:"Al Fresco","Pinyon Script",cursive;
```
Type scale (catalog): H1 clamp(2.2rem,5vw,3.5rem) display · H2 1.75rem display · body 1rem Montserrat · label .8125rem Montserrat 500 uppercase tracking-wide.

---

## 3. Logo & Emblem
- Wordmark **XURCUN** (Rufolo serif) + ornamental diamond/quatrefoil emblem (Azerbaijani motif) + "FOND OF QUALITY" tagline.
- Versions: horizontal (emblem left + wordmark) and stacked (emblem top). Gold-on-cream is primary; black-on-cream and reversed (gold/white on dark) allowed.
- The emblem also works as a circular **badge** ("FOND OF QUALITY" around it) in gold, navy, red or green — good for category chips / seasonal tags.
- **Misuse (forbidden):** don't recolor to off-brand colors (e.g. bright red logo), don't outline-only on busy bg, don't distort/rotate, keep clear space = emblem half-width.

## 4. Pattern / Texture
- Signature **ornamental diamond tile** (emblem repeated) — gold-on-cream, gold-on-white, or tonal grey. Use as subtle section backgrounds, gift-box wrap, hero side panels, footer band — low opacity so text stays readable.

## 5. Photography
- Warm, rich, top-light studio food shots on dark wood / brass trays: pistachios, walnuts, dried apricots/figs/dates, baklava, chocolate, Turkish delight (lokum), gift boxes. Earthy, appetizing, premium.

---

## 6. Look & Feel — how the website should feel
- **Mood:** elegant, warm, premium, heritage-meets-modern. Cream canvas, gold detailing, deep charcoal text, generous whitespace, large serif headings, refined hairline dividers and ornamental motif accents.
- **Style:** premium minimal/editorial. For fast mobile QR-menu pages keep it flat + fast (no heavy glass/blur); reserve richer effects for the marketing homepage.
- **Motion:** gentle 150–300ms ease transitions; subtle hover lift on product cards; respect `prefers-reduced-motion`.

## 7. Component cues (catalog + QR menu)
- **Product card:** cream/white card, thin `--line` border, product photo, name in display serif, price in gold (`priceVisible`), small gold "Yeni" badge when `isNew`. Hover: subtle lift + gold border.
- **WhatsApp order button:** primary action on product detail. Gold (`--gold`) bg + charcoal text (or charcoal bg + gold text). Opens `wa.me` prefilled with product + variant + price + branch.
- **Category chip:** emblem-badge style; secondary colors allowed for variety/seasonal.
- **Header:** cream, gold logo, language switch (AZ/RU/EN/TR/AR), slim. **Footer:** charcoal band with gold pattern + branch list.

## 8. Pre-delivery checklist
- [ ] Icons = SVG (Lucide/Heroicons), never emojis
- [ ] `cursor-pointer` on all clickables; visible focus states
- [ ] Text contrast ≥ 4.5:1 (charcoal #2E2A25 on cream #EBE5D7 passes; gold text only on dark or at large sizes)
- [ ] Hover transitions 150–300ms; `prefers-reduced-motion` respected
- [ ] Responsive: 375 / 768 / 1024 / 1440
- [ ] RTL-ready for Arabic (AR) — logical CSS properties
- [ ] Fonts: load Montserrat + serif display; fallback if Rufolo / Al Fresco not licensed for web
