# Faz 2 — Modül Aktarım və Uyğunlaşdırma Planı

**Prinsip:** thewoo.az motorunun menyu, media və QR menyu modullarını **olduğu kimi götür**, yalnız Xurcun kataloquna uyğunlaşdır. Sıfırdan yazmırıq.

---

## 1. MENYU SİSTEMİ → KATALOQ  (tam götür + uyğunlaşdır)

**Mənbə:** `api/routers/menu.ts` · `src/pages/admin/MenuPage.tsx` (2239 sətir) · cədvəllər `menu_categories`, `menu_items`

**Olduğu kimi qalır:**
- CRUD məntiqi: createCategory / updateCategory / deleteCategory / createItem / updateItem / deleteItem
- Çoxdilli sahələr (AZ/RU/EN/TR/AR), sortOrder, isActive, isFeatured, isNew
- Admin idarəetmə arayüzü (MenuPage) — cədvəl, redaktə formu, sürüklə-sırala

**Uyğunlaşdırma (Xurcun üçün dəyişiklik):**
| thewoo.az | Xurcun |
|---|---|
| `menu_categories` | `categories` + **parentId** (ana → alt kateqoriya: Çay & Ədviyyat → Çay) |
| `menu_items` | `products` |
| (qiymət sadə) | + **priceVisible** (qiymət gizlət/göstər) |
| (variant yox) | + **product_variants** (S/M/L, rəng) |
| (tək şəkil) | + **product_images** (qalereya) |
| restoran nişanları (isMeat/isHalal/isSpicy…) | **silinir** — kataloqa lazım deyil |
| "Menu" sözü | "Kataloq / Məhsul" |

---

## 2. MEDIA SİSTEMİ  (tam götür — dəyişiklik yox)

**Mənbə:** `api/routers/media.ts` · `src/pages/admin/MediaPage.tsx` (1802 sətir)
**Götürülür:** uploadImage / deleteImage / listImages / status — Supabase Storage yükləmə, MIME yoxlaması, rate-limit, `x-admin-key`.
**Dəyişiklik:** yalnız brendləşmə (Xurcun). Funksiya eyni qalır.

---

## 3. QR MENYU + FİLİAL  (olduğu kimi götür + kafe menyu əlavə)

**Mənbə:** `api/routers/branch.ts` · `api/routers/branchMenu.ts` (264 sətir) · `src/pages/QRMenuPage.tsx` (1610 sətir) · cədvəllər `branches`, `menu_item_branches`

**Olduğu kimi qalır:**
- `getBranches`, `getBranchBySlug` — filial siyahısı və slug ilə açılış
- `getMenuByBranch` — filiala görə menyu (QR skan olunanda)
- `updateMenuItemBranch` — hansı məhsul hansı filialda
- QR route: `/menu/:branchSlug` → QRMenuPage (mobil, sürətli)
- Filial sahələri: ad, slug, ünvan, **Google Maps URL**, **filiala özəl WhatsApp** (artıq mövcuddur — "Seabreeze WhatsApp")

**Uyğunlaşdırma / əlavə:**
- Filiala **mağaza videosu** sahəsi (artıq `public/videos/` hazırdır)
- **menuType**: `katalog` | `kafe` — mağaza içi kofe shop-lar üçün ayrıca menyu (içkilər/desertlər). QR: `/menu/<filial>` və `/menu/<filial>/kafe`
- WhatsApp sifariş düyməsi (səbət yox)

---

## 4. SAXLANILAN MODULLAR (silinmir!)

SEO (çoxdilli) · Tracking & Pixel (GA4, GTM, Google Ads Conversion, Meta Pixel, Meta CAPI, Meta/Google verification) · Google Ads · Popup kampaniyalar · AI Auditor/Insights · Mail (SMTP/IMAP) + Inbox · Ayarlar.
**Yalnız silinən:** səbət/checkout/ödəniş (motorda onsuz da yoxdur).

---

## 5. STACK (təsdiqlənmiş)
React 19 + Vite + TypeScript + Tailwind (ön) · Hono + tRPC + Drizzle + **MySQL** (arxa) · Railway. Tək Node prosesi (`api/boot.ts`). `motion` animasiya. Rufolo (AZ-tam) + Montserrat fontları.

---

## 6. ADDIM-ADDIM İCRA SIRASI

1. **Şema:** `db/schema.ts` → katalog şeması (categories+parentId, products+priceVisible, product_images, product_variants, branches+menuType+video+whatsapp, product_branches) + `autoMigrate` yenilənir.
2. **Backend:** `menu.ts`→`catalog.ts` uyğunlaşdırılır; `media.ts`, `branch.ts`, `branchMenu.ts` götürülür; tracking/seo/ads/meta/popup/mail saxlanılır.
3. **Admin:** MenuPage→katalog (variant/qiymət gizlət/çoxdilli/şəkil qalereya); MediaPage olduğu kimi; filial+QR+kafe menyu; SEO/Tracking/Ads səhifələri saxlanılır.
4. **Frontend (katalog):** premium dizayn (mockup) → React komponentlərə; QRMenuPage uyğunlaşdırılır; WhatsApp sifariş axını.
5. **Məzmun:** kateqoriya/məhsul/filial məlumatları + şəkillər/videolar.

> Komandalar (npm install, migration, git) **mətn olaraq** veriləcək; siz Integrated Terminal-də işə salacaqsınız.

---

**Təsdiq üçün:** Bu aktarım planı uyğundurmu? Təsdiqləsəniz **Addım 1 (şema)** ilə kodlamaya başlayıram.
