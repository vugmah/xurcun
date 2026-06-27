---
name: Xurcun
description: Premium dried fruit, nuts and handcrafted gift boutique — Fond of Quality
colors:
  gold: "#9D7C38"
  gold-light: "#C2A05A"
  gold-dark: "#7E6228"
  ink: "#2E2A25"
  ink-soft: "#3A352E"
  ink-muted: "#6B6457"
  cream: "#EBE5D7"
  cream-50: "#F6F2E9"
  cream-100: "#F1ECE0"
  line: "#D8CFB9"
  white: "#FFFFFF"
  on-gold: "#14110C"
  cream-text: "#E6DDCA"
  cream-text-soft: "#D8CDB4"
  cream-text-muted: "#C9BEA4"
  cream-text-faint: "#9C917B"
  whatsapp: "#1F4A34"
  whatsapp-on: "#EAF3EC"
typography:
  display:
    fontFamily: "Rufolo, Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(3rem, 7vw, 6rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Rufolo, Cormorant Garamond, serif"
    fontSize: "clamp(28px, 4vw, 44px)"
    fontWeight: 600
    lineHeight: 1.12
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 300
    lineHeight: 1.65
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.32em"
  script:
    fontFamily: "Pinyon Script, cursive"
    fontSize: "clamp(28px, 4vw, 40px)"
    lineHeight: 1
rounded:
  sm: "2px"
  card: "12px"
  control: "6px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "26px"
  section: "84px"
  wrap: "1200px"
  wrap-narrow: "760px"
components:
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.on-gold}"
    rounded: "{rounded.sm}"
    padding: "16px 34px"
  button-gold-hover:
    backgroundColor: "{colors.gold-light}"
    textColor: "{colors.on-gold}"
  button-ghost:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
    rounded: "{rounded.sm}"
    padding: "16px 30px"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "7px 14px"
  chip-active:
    backgroundColor: "{colors.cream-100}"
    textColor: "{colors.gold-dark}"
    rounded: "{rounded.pill}"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
  badge:
    backgroundColor: "{colors.cream-100}"
    textColor: "{colors.gold-dark}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  wa-button:
    backgroundColor: "{colors.whatsapp}"
    textColor: "#EAF3EC"
    rounded: "{rounded.pill}"
    padding: "7px 12px"
---

# Design System: Xurcun

## 1. Overview

**Creative North Star: "Qızıl Süfrə — The Gilded Table"**

Xurcun is a premium Azerbaijani boutique chain for dried fruit, nuts, exotic teas, sweets and handcrafted gift boxes (Baku, est. 2015). The interface should feel like the boutique itself: a cream-and-gold table where each product is presented with care. Warmth comes from the cream surface, the gilded accents and the serif voice — not from clutter. The classic serif wordmark and the diamond emblem carry the heritage; clean type and generous whitespace keep it contemporary, not nostalgic.

The system is **bilingual-first** (AZ / RU / EN / TR / AR with full RTL) and **mobile-first** on its highest-traffic surface (the QR menu). It alternates a light cream register (catalogue, about, stores) with deep ink sections (hero, gift, footer) so the gold reads as luxury on both.

This system explicitly rejects: the warm-neutral "AI cream + Inter" monoculture (the body font is Cairo/Montserrat, never Inter); dark-mode-by-default (the public brand is cream; only the admin panel is dark, on purpose); gradient text, glassmorphism-as-decoration, and the tiny tracked eyebrow above every section.

**Key Characteristics:**
- Cream surface, gold accent, ink depth — three committed roles.
- Classic serif display (Rufolo) paired with a clean humanist sans (Montserrat / Cairo for Arabic).
- Diamond emblem + "Fond of Quality" slogan are fixed brand assets — never altered or recolored.
- Restraint with confident brand moments: the gold CTA, the ornament divider, the framed photo.

## 2. Colors

A warm boutique palette: gold as the one accent, ink for depth and text, cream for the resting surface.

### Primary
- **Boutique Gold** (#9D7C38): the single brand accent — primary CTA fill, ornament lines, active states, emblem. Carries the "gilded" identity.
- **Gold Light** (#C2A05A): the accent on dark (ink) surfaces and the gold-button hover. Comfortable on ink at any size.
- **Gold Dark** (#7E6228): the accent for small text on light surfaces (eyebrows, badges, links) where the brighter gold would fail contrast.

### Neutral
- **Ink** (#2E2A25): primary text on cream, and the dark section surface (hero, gift, footer). The brand's near-black.
- **Ink Soft** (#3A352E) / **Ink Muted** (#6B6457): secondary and muted body text on cream.
- **Cream 50** (#F6F2E9): the default page surface. Cream (#EBE5D7) and Cream 100 (#F1ECE0) are deeper tints for cards and alternating sections; White (#FFFFFF) is the crispest card/chip surface.
- **Line** (#D8CFB9): hairline borders and dividers.
- **Cream text ramp** (#E6DDCA → #D8CDB4 → #C9BEA4 → #9C917B): cream text on the dark ink surface, bright to faint (lead copy → muted captions → copyright).

### Accent
- **WhatsApp Green** (#1F4A34): reserved exclusively for the WhatsApp order action on the QR menu. Never decorative.

### Named Rules
**The Gold-Dark Rule.** On cream, small text in gold must use `gold-dark #7E6228` (~4.5:1). The brighter `gold #9D7C38` is for large or decorative type only (~3.7:1).

**The On-Gold Rule.** Text on a gold fill (buttons, badges, active language, branch hover) uses `on-gold #14110C` (~4.8:1). `ink` on gold reaches only 3.65:1 and is forbidden there.

## 3. Typography

**Display Font:** Rufolo (local woff) with Cormorant Garamond, Georgia, serif fallback
**Body Font:** Montserrat (public) with system-ui fallback
**Script Font:** Pinyon Script (hero sub-line, footer flourish)
**Arabic / RTL:** Amiri (display) + Cairo (body); letter-spacing is reset to normal so Arabic letters join.

**Character:** A classic high-contrast serif against a clean geometric-humanist sans — heritage meeting clarity. The script font appears once or twice as a gilded flourish, never as body copy.

### Hierarchy
- **Display** (600, clamp 3–6rem, line-height 1): hero headline only. Ceiling 6rem; uses `text-wrap: balance`.
- **Headline** (600, clamp 28–44px, line-height 1.12): section titles (h2), about and gift headings.
- **Title** (600, ~21px, Rufolo): product names, branch names, footer card headings.
- **Body** (300–400, 15px, line-height 1.65): paragraphs and descriptions; cap line length 54–75ch, `text-wrap: pretty`.
- **Label** (400, 11px, letter-spacing 0.32em, uppercase): the eyebrow tag, footer headings, value strip.

### Named Rules
**The One-Flourish Rule.** Pinyon Script is a garnish: the hero sub-line and the menu footer, nowhere else. More than that and it reads as a wedding invitation, not a boutique.

**The Eyebrow-Cadence Rule.** The tracked uppercase label is voice only when it carries information (a stat, a named collection). Never place it above every section heading.

## 4. Elevation

Mostly flat with tonal layering: depth comes from alternating cream and ink surfaces and hairline `line` borders, not from shadows. Shadows appear only as a response to interaction.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 24px 50px rgba(46,42,37,0.13)`): on product/branch card hover only, paired with a 6–8px `translateY` rise.
- **Sticky header** (`box-shadow: 0 6px 30px rgba(46,42,37,0.07)` + `backdrop-filter: blur`): appears when the header shrinks on scroll.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadow is a hover/scroll response, never an ambient decoration. Backdrop-blur is reserved for the sticky header and chip bar — never for decorative glass cards.

## 5. Components

### Buttons
- **Shape:** sharp rectangle (2px radius) for hero CTAs; pill (999px) for menu actions and chips.
- **Primary (gold):** `gold` fill, `on-gold` text, 16px 34px, uppercase 0.2em tracking. Hover lifts to `gold-light` + `translateY(-2px)`; active scales 0.97.
- **Ghost:** transparent on ink, `cream` text, translucent cream border. Hover fills cream with ink text.
- Every tappable element confirms the press (`scale(0.96–0.97)`). Touch targets ≥44px (top-bar utilities ≥38px).

### Chips (QR menu category nav)
- **Style:** white fill, `line` border, pill, 12px. Horizontal scroll, sticky under the header.
- **State:** active chip → `cream-100` fill, `gold` border, `gold-dark` text (scroll-spy driven).

### Cards / Containers
- **Product card:** white surface, `line` border, 2px radius, 4/5 image; gold inner outline + lift on hover.
- **Menu card:** horizontal — 76px rounded (12px) thumbnail + info + price + WhatsApp button. A list, not a grid.
- **About frame:** photo with a thin offset gold outline (editorial depth), not a drop shadow.
- **Internal padding:** 18px (cards) / 32px (section wraps, 18px on mobile).

### Inputs / States
- **Focus:** `:focus-visible` → 2px gold ring, 2px offset (kept at specificity 0 so components can override).
- **Loading:** gold-topped spinner + label. **Empty / error:** centered emblem + message; the error state adds a gold-outline "retry" pill (distinct from genuine empty).
- **Images:** lazy below the fold, `onError` falls back to the emblem watermark; the hero is eager with `fetchpriority="high"`.

### Navigation
- Centered logo over an uppercase tracked nav (0.18em); sticky header shrinks and hides the nav row on scroll (full nav stays visible on mobile). Active language uses `aria-pressed`; a skip-to-content link precedes everything.

### Signature: The Ornament Divider
A spinning gold emblem flanked by two gold-to-transparent rules. The recurring brand motif between sections — used instead of an eyebrow. Honors `prefers-reduced-motion` (spin disabled).

### Motion
Brand-register motion: one hero video (muted, looped, poster fallback, paused under reduced-motion) and gentle staggered reveals (`opacity` + `translateY`, with a safety timeout so content never ships hidden). Easing `cubic-bezier(.22,.61,.36,1)`. No bounce, no elastic. Header shrink is the one deliberate layout-property transition.

## 6. Do's and Don'ts

### Do:
- **Do** keep the diamond emblem and the "Fond of Quality" slogan exactly as supplied — same shape, same gold, never recolored, stretched, or re-set.
- **Do** use `gold-dark #7E6228` for small gold text on cream and `on-gold #14110C` for text on any gold fill.
- **Do** pair Rufolo display with Montserrat body; swap to Amiri + Cairo (and reset letter-spacing) for Arabic / RTL.
- **Do** let real product, gift and store photography carry the design; the hero and gift sections must ship imagery, not the logo-in-a-frame.
- **Do** keep the page flat at rest; reserve shadow and backdrop-blur for hover and the sticky header.

### Don't:
- **Don't** use Inter (or the warm-neutral "AI cream + Inter" look) anywhere; the brand sans is Montserrat / Cairo.
- **Don't** put `ink` text on a gold fill (3.65:1) — it fails AA. Use `on-gold`.
- **Don't** ship dark mode for public pages; cream is the brand. Dark is the admin panel only, on purpose.
- **Don't** place the tracked uppercase eyebrow above every section — only where it carries real information.
- **Don't** use gradient text, decorative glassmorphism, bounce/elastic easing, or `border-left`/`border-right` colored stripes.
- **Don't** gate content visibility on a scroll reveal with no fallback; reveals enhance an already-visible default.
