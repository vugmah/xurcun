# Xurcun — Design System (MASTER)

> Brendin vahid mənbəyi (single source of truth). Yeni səhifə/komponent qurarkən
> əvvəlcə `design-system/pages/<page>.md` faylına bax; yoxdursa bu sənədi əsas götür.
>
> Brend: **Premium quru meyvə · çərəz · şirniyyat · əl işi hədiyyə qutuları** · Bakı · Est. 2015
> Slogan: **"Fond of Quality"**

---

## 1. Brend kimliyi

- Estetika: lüks butik, krem + qızıl, klassik serif başlıqlar, çoxdilli (AZ/RU/EN/TR/AR + RTL).
- Əsas (primary) mövzu **KREM**-dir — bütün public marketinq səhifələri buna uyğun olmalıdır.

---

## 2. Rəng palitrası

### Primary — Krem mövzu (ana səhifə, QR menyu) — `.xc`
| Rol | Token | Hex |
|-----|-------|-----|
| Qızıl (əsas) | `--gold` | `#9D7C38` |
| Qızıl (açıq, akssent) | `--gold-light` | `#C2A05A` |
| Qızıl (tünd, **kiçik mətn üçün**) | `--gold-dark` | `#7E6228` |
| Mürəkkəb (mətn) | `--ink` | `#2E2A25` |
| Mürəkkəb (yumşaq) | `--ink-soft` | `#3A352E` |
| Mürəkkəb (muted) | `--ink-muted` | `#6B6457` |
| Krem fon | `--cream-50` | `#F6F2E9` |
| Krem | `--cream` | `#EBE5D7` |
| Xətt/border | `--line` | `#D8CFB9` |
| WhatsApp yaşıl | `--wa` | `#1F4A34` |

### Secondary — Tünd mövzu (admin paneli)
| Rol | Hex |
|-----|-----|
| Fon | `#14110E` / sidebar `#100D0A` |
| Kart | `#111` · border `#222` / `white/10` |
| Qızıl akssent | `#C2A05A` *(= primary `--gold-light`)* |

> **Qayda:** Qızıl akssent hər yerdə **`#C2A05A`** olmalıdır. `#C9A96E` və `#D4A853` köhnə
> dəyərlərdir — yenilərində istifadə etmə.

### Kontrast qaydaları (WCAG AA)
- Açıq fonda **kiçik mətn** üçün qızıl = `--gold-dark #7E6228` (≈ 4.5:1+).
- `--gold #9D7C38` açıq fonda yalnız **böyük/dekorativ** mətndə (≈ 3.7:1).
- Tünd fonda `--gold-light #C2A05A` rahat keçir.

---

## 3. Tipografiya

| Rol | Şrift | İstifadə |
|-----|-------|----------|
| Display / başlıq | **Rufolo** (lokal woff) → fallback Cormorant Garamond | h1–h3, `.serif` |
| Body | **Montserrat** (public) / **Inter** (admin) | mətn |
| Script | **Pinyon Script** | hero alt-başlıq, footer akssent |
| Mono | JetBrains Mono | yalnız texniki/admin |
| Arabic (RTL) | **Amiri** (display) + **Cairo** (body) | `[dir="rtl"]` |

- Bütün şriftlər tək `<link>`-də yüklənir (`index.html`), Rufolo `@font-face` `index.css`-də (qlobal).
- `font-display: swap` hər yerdə.

---

## 4. Komponent tokenləri

- Radius: düymələr `999px` (pill) / kartlar `2–12px`; `--radius` shadcn üçün.
- Easing: `--ease: cubic-bezier(.22,.61,.36,1)`; keçidlər 150–300ms.
- Toxunma hədəfi: interaktiv elementlər **min 44×44px** (topbar utiliti ≥38px).
- Fokus: `:focus-visible` → 2px qızıl halqa (`--ember-gold` tünddə / `--gold` kremdə).

---

## 5. Accessibility / Performans checklist

- [x] `:focus-visible` qlobal fokus halqası (index.css + .xc)
- [x] Toxunma hədəfləri ≥44px (QR menyu, dil/nav)
- [x] `prefers-reduced-motion` (CSS animasiyaları + Lenis)
- [x] `<html lang/dir>` dil dəyişəndə yenilənir (RTL ərəb)
- [x] Şriftlər tək request, render-blocking @import yoxdur
- [x] Public şəkillərdə alt (logo təsviredici, dekorativ `alt=""`)
- [ ] Şəkillər WebP + `srcset` (gələcək)

---

## 6. Tamamlanmış brend birləşdirmələri

1. ✅ **Tünd → Krem public səhifələr** — Rezervasiya / Privacy / Cookie səhifələri
   krem brend mövzuya keçirildi (`#F6F2E9` fon, `#7E6228` başlıq, Rufolo, WA yaşılı
   `#1F4A34`). QR menyu yüklənmə fallback-i də krem oldu. `theme-color` → `#2E2A25`.
2. ✅ **Legacy `sections/` silindi** — 12 istifadəsiz tünd "thewoo" komponenti
   (Hero, Navigation, Gallery, FindUs, MenuPreview, Concept, Events, Contact, About,
   MenuPage, GoogleReviews, HomeScrollButton) + `Home.tsx` + `App.css` silindi.
   Yalnız `sections/SEO.tsx` qaldı (aktiv istifadədə). `#D4A853` ember-gold artıq yoxdur.
3. ✅ Səpələnmiş qızıl `#C9A96E` → brend `#C2A05A` (admin = home = vahid).

## 7. Qalan gələcək işlər
- [ ] Şəkillər WebP + `srcset` + lazy (performans).
- [ ] Admin paneli tünddür — qəsdən belədir (idarəetmə üçün), public-dən ayrı.
- [ ] Orphan ola biləcək lib faylları (məs. `aboutText.ts`) — silinmiş section-lardan
      sonra istifadəsiz qalmış ola bilər, yoxlanılmalı.
