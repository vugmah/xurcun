# The Woo White City — Görüş Özeti
**Tarix:** 19 May 2026  
**Mövzu:** Admin panel fix-ləri + SEO audit  
**Status:** 2 kritik bug düzəldildi, deploy edildi  

---

## 1. Bugün Düzəldilən Fix-lər

### 1.1 Admin MenuPage — Shisha/Nargile Görünmürdü
**Problem:** Admin paneldə Shisha tab-ı boş görünürdü  
**Səbəb:** `import("@/lib/menuData")` səhv faylı yükləyirdi (interface-lər olan fayl). `shishaData` isə `menuData.static.ts`-də idi.  
**Düzəliş:** `src/pages/admin/MenuPage.tsx`  
```diff
- import("@/lib/menuData")
+ import("@/lib/menuData.static")
```  
**Commit:** `acc2512`

### 1.2 MediaPage → Foto Təyin Etmə Görünmürdü
**Problem:** Media paneldən şəkil təyin edəndə menüdə görünmürdü, ama Menu Management-dən edəndə görünürdü  
**Səbəb:** `handleAssign` Supabase tam URL-ni `imageId` olaraq göndərirdi. `getImageUrl("https://.../abc.jpg")` → `/food-photos/https://.../abc.jpg.webp` (tamamilə pozulmuş URL)  
**Düzəliş:** `src/pages/admin/MediaPage.tsx`  
- `extractId()` funksiyası genişləndirildi — indi həm local `/food-photos/`, həm də Supabase URL-lərindən təmiz ID çıxarır
- `handleAssign` — `imageId`-ni `extractId()` ilə təmizləyir  
**Commit:** `3327ca2`

---

## 2. Aktiv Problemlər və Status-ları

| # | Problem | Status | Qeyd |
|---|---------|--------|------|
| 1 | Shisha/Nargile görünmürdü | ✅ Düzəldildi | `acc2512` — deploy edildi |
| 2 | MediaPage foto təyin etmə | ✅ Düzəldildi | `3327ca2` — deploy edildi |
| 3 | Supabase upload persistency | ⚠️ Naməlum | Bucket mövcudluğu + service_role key yoxlanmayıb |
| 4 | Build chunk 404-ləri | ⚠️ Aralıqlı | Cloudflare Purge Everything + empty commit lazım ola bilər |
| 5 | SPA SEO limitasiyası | ⏸️ Təxirə salındı | Prerender.io/SSR lazım — user təxirə saldı |

---

## 3. SEO Audit — Tapılan Eksikliklər

### 🔴 Kritik
1. **SPA HashRouter** — Google yalnız `/` görür, `/#/menu` görünmür → bütün menyu indekslənmir
2. **Semantic HTML yoxdur** — `<main>`, `<header>`, `<nav>`, `<footer>` heç biri istifadə edilməyib
3. **Canonical URL-lər gerçəkdə yoxdur** — `SEO.tsx` `https://thewoo.az/az/` yaradır (404 verir)
4. **Hreflang tag-ləri zərərli** — olmayan URL-lərə işarə edir
5. **`<noscript>` içəriyi yoxdur** — JS bağlı olanda səhifə boşdur

### 🟠 Orta
6. **Şəkil `alt` text-ləri boş** — `QRMenuPage.tsx`, `Gallery.tsx` bir çox yerdə `alt=""`
7. **Sitemap tək URL-dir** — yalnız ana səhifə var
8. **JSON-LD Menu schema yoxdur** — FoodEstablishment > menu
9. **Schema markup xətaları** — `acceptsReservations: "True"` (string, boolean olmalı), fake `reviewCount: 152`
10. **Google Search Console verification** — statik `index.html`-də yoxdur
11. **Facebook Domain Verification boş** — `content=""`
12. **Twitter Card duplicate** — `twitter:image` 2 dəfə təkrarlanıb

### 🟡 Aşağı
13. Breadcrumb HTML yoxdur (yalnız JSON-LD)
14. OG image cache MISS
15. `robots.txt`-də gərəksiz `/#/admin` sətirləri

---

## 4. Test Edilməsi Lazım Olanlar (Deploy-dan Sonra)

- [ ] Admin → Menu → Shisha tab — nargile elementləri görünür mü?
- [ ] Admin → Media → Təyin Et — şəkil təyin edəndə menüdə görünür mü?
- [ ] QR Menu / sayt — şəkillər düzgün yüklənir mi?
- [ ] Cloudflare Purge Everything (əgər 404 chunk xətası görünsə)

---

## 5. Sabah Davam Edilə Biləcək İşlər

### Plan A: SEO Təməl Fix-ləri
1. Semantic HTML əlavə etmək (`<main>`, `<header>`, `<nav>`, `<footer>`)
2. Canonical URL düzəltmək (yalnız `https://thewoo.az/`)
3. Hreflang tag-lərini düzəltmək/kaldırmaq
4. `<noscript>` əsas içərik əlavə etmək
5. `alt` text-lərini doldurmaq

### Plan B: SEO Zənginləşdirmə
1. Sitemap genişləndirmək
2. Menu schema (JSON-LD) əlavə etmək
3. `robots.txt` təmizləmək
4. Google Search Console verification statik əlavə etmək

### Plan C: Texniki İmkanlar
1. Supabase bucket yoxlanması (`media` bucket mövcuddur mu?)
2. `SUPABASE_SERVICE_KEY` formatı yoxlanması (`sb_secret_` prefix-i)
3. Prerender.io inteqrasiyası (əgər user istəsə)

---

## 6. Vacib Kontekst (Yadda Saxla)

### Texniki Stack
- React + Vite + Hono + tRPC + Drizzle ORM + Railway MySQL
- HashRouter SPA (`/#/menu`, `/#/admin`)
- Supabase storage (`SUPABASE_BUCKET=media`)
- Cloudflare proxy

### Tracking ID-lər (DB / Live)
- Meta Pixel: `988936886861215`
- GTM: `GTM-N5S76LX6`
- GA4: `G-389571119`
- Google Ads: `AW-9288635894`

### Foto Təyinat Açar Formatı
```
${tab}:${catTitleAz}:${itemNameAz}
```
Məsələn: `food:Şorbalar:Mercimek`

### Fayllar (Son Dəyişiklik)
| Fayl | Son Commit | Dəyişiklik |
|------|-----------|------------|
| `src/pages/admin/MenuPage.tsx` | `acc2512` | `import("@/lib/menuData.static")` |
| `src/pages/admin/MediaPage.tsx` | `3327ca2` | `extractId()` + `handleAssign` fix |

---

*Bu sənəd 19 May 2026 tarixində yaradılmışdır.*
