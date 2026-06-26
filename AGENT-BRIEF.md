# Xurcun — Agent Devir-Teslim Brifinqi (Handoff)

> Yeni agent: bu faylı oxu, sonra `design-system/xurcun/` qovluğundakı mockup-ları aç (hədəf dizayn).
> Bütün dəyişikliklər **yalnız bu repoda** (`/Users/vm/Desktop/webdesign/xurcun`). thewoo.az repo-suna **TOXUNMA** — yalnız oxu (referans).

## 1. Layihə nədir
`www.xurcun.com` (premium Azərbaycan quru meyvə / qoz / şirniyyat / hədiyyə butiki, 11 mağaza, Bakı) üçün **katalog + QR menyu** saytı. E-ticarət YOX (səbət/ödəniş yox). Sahibi: Vügar Maharramov (qeyri-texniki — sadə izah, terminal komandalarını mətn olaraq ver).

## 2. Canlı / deploy
- Canlı: **https://xurcun-production.up.railway.app** (health: `/health`)
- Repo: **github.com/vugmah/xurcun**, branch `main` → Railway **avtomatik deploy** (push edəndə).
- Railway: project "xurcun" (id `c799fd51-554e-45cc-b3a8-2fd11b74c035`), app service `c80ad938-...`, MySQL `23c4c30e-...`, env `production` `cff8264c-...`.
- Deploy axını (sahib özü edir): `git add -A && git commit -m "..." && git push origin main` (lazım olsa əvvəl `rm -f .git/index.lock`). Sandbox-da `vite build` rollup-native xətası verir (mac node_modules / linux) — KOD xətası deyil, Railway təmiz build edir. Yoxlama üçün `npx tsc -b` istifadə et.
- Admin login: `/#/admin/login`. Parol = **`VITE_ADMIN_PASSWORD`** (build-time, koda gömülür) və **`ADMIN_SECRET_KEY`** (server) — **EYNİ dəyər olmalı**, ikisi də Railway-də təyin olunub.

## 3. Stack & əsas yollar
React 19 + Vite + TS + Tailwind (ön) · Hono + tRPC + Drizzle + **MySQL** (arxa) · Railway. Tək Node prosesi: `api/boot.ts` (CORS/CSP/upload/sitemap/tRPC handler + `autoMigrate()` — cədvəl yaratma TƏK MƏNBƏ, idempotent; sütun əlavə edəndə həm `db/schema.ts` həm `autoMigrate`).
- Public ana səhifə: `src/pages/HomePage.tsx` + brend CSS `src/xurcun-home.css` (krem/qızıl, Rufolo font).
- Admin: `src/pages/admin/*` — AdminLayout (qruplu menyu, qızıl #C2A05A, real logo), DashboardPage, **CatalogPage** (kateqoriya+məhsul CRUD, çoxdilli tablar, AI tərcümə düyməsi, qiymət gizlət), BranchesPage (filial CRUD), QrPage (real QR, `qrcode` paketi), CafeMenuPage (=CatalogPage menuType="cafe").
- Routerlər: `api/routers/` — menu (katalog), catalog (şəkil/variant + public `categories`/`featured`), branch (filial CRUD), branchMenu, translate (OpenAI+Anthropic, açar settings/env-dən), seo, tracking, googleAds, metaCapi, popup, media, mail, ...
- Brend asset-ləri: `public/brand/logo-gold.png`, `emblem-gold.png`; `public/fonts/Rufolo*.woff` (AZ-tam: ə/Ə/İ sintez edilib); `public/videos/<slug>.mp4` (11 filial); `public/images/branches/<slug>.jpg`.
- HƏDƏF DİZAYN: `design-system/xurcun/admin-mockup.html` (admin), `mockup.html` (ana səhifə), `MASTER.md` (brend: qızıl #9D7C38, mürəkkəb #2E2A25, krem #EBE5D7).

## 4. BİTMİŞ
- Şema + autoMigrate (katalog: parentId, priceVisible, unit, product_images, product_variants, branch genişləndirmə, **TR/AR sütunları** menu_items/categories-ə əlavə edildi — klon köhnə idi).
- Backend katalog/branch/translate routerləri. AI tərcümə (2 provayder, açar settings cədvəlindən və ya env).
- 11 filial DB-yə seed (slug bazlı idempotent). Ana səhifə filialları **DB-dən** gəlir.
- Ana səhifə 5 dil (AZ/RU/EN/TR/AR) + Ərəb RTL (Amiri/Cairo fontları). Dil avtomatik aşkarlanır (cihaz dili).
- Ana səhifə kateqoriya + öne çıxan məhsullar **DB-dən** (catalog.categories/featured), boşsa statik fallback.
- Admin mockup-a uyğun qurulub: qruplu menyu, Dashboard, Mağazalar, QR Menyu, Kafe Menyu, Kataloq. "shisha" silinib.
- SEO: index.html `@graph` = Organization + WebSite + 11 Store + Breadcrumb (real GBP ünvanları, telefonlar, White City geo).

## 5. QALAN İŞLƏR (prioritet sırası ilə)
1. **Məhsul ŞƏKİL yükləmə** — CatalogPage formunda yalnız "Şəkil URL" var. `media` routeri (Supabase upload, `/api/upload`, x-admin-key) var; formaya şəkil seç/yüklə inteqrasiya et. Supabase env (SUPABASE_URL/SERVICE_KEY/BUCKET) lazımdır.
2. **Filial VİDEO yükləmə** — BranchesPage-də yalnız "Video URL" var, upload yox.
3. **product_images + product_variants UI** — backend (catalog router) hazır; CatalogPage formasına qalereya + variant redaktoru əlavə et.
4. **QRMenuPage** (`src/pages/QRMenuPage.tsx`, public `/menu/:slug`) hələ RESTORAN şablonudur — kataloq/kafe menyusuna uyğunlaşdır (DB-dən branchMenu/katalog oxusun).
5. **Kafe menyu** məzmunu (menuType="cafe" kateqoriyalar) + QR `/menu/<slug>/kafe` route-u.
6. Ana səhifə hero/seksiya **şəkilləri** idarəolunan (admin) etmək.
7. 5 dilli məhsul MƏZMUNU — tərcümələri agent ÜCRƏTSİZ edir (API açarı lazım deyil), admin tablarına yapışdırılır.

## 6. Gotcha-lar / qaydalar
- `admin-mockup.html` işləyən admin DEYİL — yalnız dizayn önizləməsi. Real admin React-dədir.
- Brend fontu Rufolo Azərbaycan `ə/Ə/İ` hərflərini ehtiva ETMİR → `public/fonts/`-dakı woff-lar artıq yamanıb (e/E/I-dən sintez). Yeni font gələrsə yenidən yama (script: əvvəlki sessiyada `fonttools` ilə).
- Filial telefonları: bir neçəsi GBP-dən təsdiqli; tam siyahı üçün sahibdən soruş.
- Hər dəyişiklikdən sonra `npx tsc -b` (exit 0) yoxla, sonra sahibə git push komandalarını ver.
- Memory-də (xurcun-project, xurcun-owner, xurcun-deploy) tam kontekst var.

## 7. Növbəti addım (tövsiyə)
Sahib "uçtan uca" axını istəyir: admin → ana səhifə. Bu artıq filial + kateqoriya + öne çıxan məhsul üçün işləyir. **İlk gör:** sahib Kataloq-dan məhsul əlavə edib ana səhifədə görünüb-görünmədiyini yoxlasın; sonra **şəkil yükləmə (madde 1)** ilə davam et.
