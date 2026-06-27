# AGENTS.md — Xurcun (agent yaddaşı / iş jurnalı)

> **Hər yeni agent (Claude, Codex, …) ƏVVƏLCƏ bunu oxusun.** Agent-lər arasında paylaşılan
> yaddaş yoxdur — başqa sessiyanın gördüyü iş yalnız git tarixçəsində və bu faylda qalır.
> **Qayda: hər iş bitəndə aşağıdakı "İş jurnalı"na bir sətir əlavə et.**
>
> Əlaqəli sənədlər: `CLAUDE.md` (arxitektura/əmrlər), `DESIGN.md` (brend dizayn sistemi),
> `design-system/MASTER.md` (brend), `AGENT-BRIEF.md` (köhnə handoff — bəzi faktları köhnədir).

## 1. Layihə
**Xurcun** — Azərbaycanın premium **quru meyvə · qoz-fındıq · çərəz · lokum · şirniyyat ·
əl işi hədiyyə qutuları** butiki (Bakı, 11 mağaza, 2015-dən). Slogan: **"Fond of Quality"**.
Sahibi: **Vüqar Məhərrəmov** (qeyri-texniki — sadə izah ver).
**Restoran/lounge/qəlyan DEYİL** — köhnə "thewoo" şablonundan qalan restoran izləri silinir.

## 2. Domenlər
- **xurcun.az** — bu repo, əsas/canlı sayt (kataloq + QR menyu, e-ticarət yox: WhatsApp sifariş).
- **xurcun.com** — köhnə Ticimax e-mağaza; **artıq xurcun.az-a yönləndirilib** (sahib təsdiqlədi).
  Yalnız brend/məhsul referansı kimi istifadə olunur, kodu bizdə deyil.
- GSC: hər iki property **saxlanılır** (silmə Google-dan çıxarmır). Dəyişiklikdən sonra **re-index** lazımdır.

## 3. Canlı / deploy
- Canlı: **https://xurcun.az** (Railway). Repo: **github.com/vugmah/xurcun**.
- **`main`-ə push → GitHub Actions (`.github/workflows/deploy.yml`) → Railway** avtomatik deploy.
- Railway: project **xurcun** (`c799fd51-…`), service adı **`xurcun`** (url xurcun.az), env `production`.
- Deploy secret: **`RAILWAY_TOKEN`** (GitHub repo secret). ⚠️ Bir token çatda göründü — rotate məsləhətdir.
- Yoxlama: `gh run list --workflow=deploy.yml`; uğursuzluq loqu: `gh run view <id> --log-failed`.
- Admin: `/admin/login`, parol `VITE_ADMIN_PASSWORD` = `ADMIN_SECRET_KEY` (eyni olmalı, Railway-də).

## 4. Stack & əsas yollar
React 19 + Vite + TS + Tailwind · Hono + tRPC + Drizzle + **MySQL** · Railway. **BrowserRouter** (path-based).
Tək Node prosesi: `api/boot.ts` (CORS/CSP/upload/**sitemap**/tRPC + `autoMigrate()` idempotent cədvəl yaratma).
- Public: `src/pages/HomePage.tsx`, **`CatalogPage.tsx`** (shoppable /catalog), `QRMenuPage.tsx` (/menu/:branch).
- CSS: **`src/xurcun-base.css`** (tokenlərin TƏK MƏNBƏSİ + .xc primitivlər) → home/menu/catalog onu import edir.
- Admin: `src/pages/admin/*` (CatalogPage = kateqoriya/məhsul CRUD + alt-kateqoriya; CafeMenuPage = CatalogPage menuType="cafe"; QrPage; BranchesPage; SeoPage; …).
- Router-lər: `api/routers/*` (menu, catalog [storefront/categories/featured], branch, translate, seo, …).
- Brend asset: `public/brand/*`, `public/fonts/Rufolo*`, `public/videos/<slug>.mp4`, `public/images/home/*`.

## 5. Agent iş axını (vacib)
- **Branch-lar tez-tez ayrılır** (main başqa agentlər tərəfindən irəliləyir). Təmiz iş üçün
  **həmişə `git worktree add -b <branch> <wt> origin/main`** istifadə et (lokal dirty checkout-a toxunma).
- Yoxlama: **`npx tsc -b`** (sandbox-da `vite build` rollup-native xətası verir — kod xətası deyil).
  node_modules worktree-də yoxdursa: `ln -sfn <repo>/node_modules ./node_modules`.
- Deploy/SPA deep-link yoxlayanda `curl`-a **`-H "Accept: text/html"`** ver (yoxsa SPA fallback 404 qaytarır — yalançı).
- Dəyişiklik → kiçik fokuslu commit → PR (`gh pr create`) → `gh pr merge <n> --merge` → deploy izlə.
- İş bitəndə **bu faylın "İş jurnalı"na sətir əlavə et + commit et.**

## 6. İş jurnalı (yeni → köhnə; hər agent öz işini yazsın)
- **SEO köhnə restoran → butik:** index.html (artıq düzgün idi), `seoStore.ts` şablonları (home/menu/about),
  `SEO_PAGES`, `api/routers/seo.ts` autogen, sitemap-a **/catalog** əlavə, JSON-LD **Store** (Restaurant deyil).
- **CLAUDE.md** əlavə (arxitektura/əmrlər) — başqa agent.
- **Kafe QR** ayrı işlək link: `/menu/<slug>?type=cafe` (admin QrPage + QRMenuPage).
- **Shoppable /catalog** (PR #4): kateqoriya→alt-kateqoriya→məhsul + **miqdarlı səbət → WhatsApp**; admin alt-kateqoriya UI.
- **CI deploy fix:** servis adı `thewoo-white-city` → **`xurcun`**; `RAILWAY_TOKEN` secret təyin.
- **HashRouter → BrowserRouter** (crawlable path URL) — başqa agent (82ea7f9).
- **Dizayn sistemi:** `xurcun-base.css` extract (tokenlərin tək mənbəyi); **DESIGN.md** (Stitch formatı) + `.impeccable/design.json`.
- **Ana səhifə tam:** real **hero video** + hədiyyə/About **foto**; **Haqqımızda** bölməsi (təsisçi Vüqar Məhərrəmov);
  audit→harden→polish→critique (a11y, kontrast `--on-gold` 4.8:1, performans, RTL).
- **Şrift:** global body Inter → **Cairo** (çoxdilli/RTL); ana səhifə Rufolo + Montserrat.
- **Impeccable** dizayn skill-i quraşdırıldı (`.claude/skills/impeccable`, Claude Code).
- **Domen:** xurcun.com → xurcun.az redirect (sahib).

## 7. Açıq tapşırıqlar (TODO)
- [ ] **Kontent (sahib):** kataloq + kafe məhsulları (ad/qiymət/şəkil) admin-dən yüklə; café 2 filialda `hasCafe` aktiv.
- [ ] **Köhnə restoran legacy təmizliyi:** istifadəsiz `MenuPage` (admin, /admin/menu), `seoStore` ölü şablonları
      (food/beverage/shisha/snack), `api/seed*` restoran seed data, `menuData.static`, JsonLd.tsx (ölü). Render olunmur, amma repo təmizliyi.
- [ ] **RAILWAY_TOKEN rotate** (çatda göründü).
- [ ] **Mail (SMTP)** + **Google Ads** credential — konfiqurasiya tələb edir.
- [ ] GSC: xurcun.az-ı **re-index** et + sitemap təkrar göndər (restoran keşi getsin).
- [ ] (İstəyə görə) /catalog-a axtarış/filtr; reservation səhifəsi lazımdırsa qərar (butik üçün legacy ola bilər).
