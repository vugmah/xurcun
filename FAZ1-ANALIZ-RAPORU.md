# Xurcun.com — Faz 1: Analiz ve Strateji Raporu

**Tarih:** 26 Haziran 2026
**Hazırlayan:** Claude (Cowork)
**Durum:** Onayınız bekleniyor — onaydan sonra Faz 2'ye geçilecek.

---

## 1. Özet (Kısa Versiyon)

Üç kaynağı inceledim. En önemli üç bulgu:

1. **`vugmah/xurcun` reposu aslında zaten `thewoo.az` motorunun bir kopyasıdır.** İçinde e-ticaret yok. Yani "e-ticareti sökmek" diye büyük bir iş yok — temel zaten bir katalog/QR menü motoru.
2. **Canlı `www.xurcun.com` sitesi bir Ticimax (hazır kiralık yazılım) sitesidir.** Kaynak kodu bizde değil, alınamaz. Bu siteyi sadece **ürün verisi ve marka kimliği** kaynağı olarak kullanacağız (kategoriler, ürün adları, görseller, fiyatlar).
3. **Teknoloji yığını konusunda proje notu ile gerçek kod çelişiyor.** Proje notu "PostgreSQL + Fastify" diyor; ama hem `thewoo.az` hem `vugmah/xurcun` gerçekte **MySQL + Hono + tRPC + Drizzle** kullanıyor. Bu, onayınız gereken ana karardır (bkz. Bölüm 6).

İyi haber: thewoo.az motoru zaten tam olarak ihtiyacımız olan şey — çok dilli ürün/kategori yönetimi, görsel yükleme, QR menü ve şube sistemi hazır. Sıfırdan yazmaya gerek yok.

---

## 2. Kaynak 1 — Canlı Site: `www.xurcun.com`

**Ne olduğu:** Ticimax altyapılı, hazır bir e-ticaret sitesi (Bakü, Azerbaycan). Para birimi Azerbaycan Manatı (₼). Diller: TR/AZ.

**Marka kimliği:** Kuru meyve, çerez, çikolata, lokum, baklava ve hediyelik kutular satan butik zinciri. Logo ve slogan SVG olarak `static.ticimax.cloud` üzerinde.

**Kategori hiyerarşisi (menüden):**

| Ana Kategori | Alt Kategori |
|---|---|
| ÇAY & BAHARAT | ÇAY |
| ÇEREZ | — |
| ÇİKOLATA | — |
| KURU MEYVE | — |
| LOKUM | — |
| BAKLAVA | — |
| HEDİYELİK | — |

→ **Çıkarım:** 2 seviyeli bir hiyerarşi var (Ana Kategori → Alt Kategori). Yeni şema bunu desteklemeli.

**Ürün sergileme mantığı:** Ürün kartında görsel, marka adı ("Xurcun"), ürün adı, fiyat (₼), varyantlar (örn. BOXFUL **S/M/L**, renk **BLACK/WOOD/WHITE**) ve e-ticaret butonları (Sepete Ekle, Favori, Azalt/Artır) var. Örnek ürünler: BOXFUL kutuları, KHANEDAN, SELECTION, EDITION, CARNAVAL, BAKHLAVA, CORNER.

→ **Çıkarım:** Ürünlerin **varyantı** (beden/renk) var — şema bunu modellemeli. Yeni katalogda **Sepete Ekle / fiyat / favori** butonları kaldırılacak.

**Önemli kısıt:** Bu site kapalı kaynak (Ticimax SaaS). Kodu kopyalayamayız. Sadece içeriğini (kategori/ürün/görsel) elle veya yarı-otomatik aktarabiliriz.

---

## 3. Kaynak 2 — `vugmah/xurcun` Reposu

**Beklenen:** Eski e-ticaret xurcun kodu.
**Gerçek:** Bu repo, `thewoo.az` motorunun **birebir kopyası** (sadece biraz daha eski). Aynı dosyalar (`api/`, `contracts/`, `db/schema.ts`, hatta `thewoo-chat-ozeti.pdf`), aynı yığın, aynı README ("restaurant and lounge website").

**Veritabanı şeması:** `thewoo.az` ile neredeyse aynı; tek fark daha eski olması (Türkçe/Arapça dil alanları ve `branches` tabloları henüz eklenmemiş).

→ **Çıkarım:** Bu repoyu temel almak yerine **doğrudan daha güncel olan `thewoo.az`'ı temel almalıyız.** `vugmah/xurcun`'da bizi ilgilendiren özel bir "ürün/kategori e-ticaret modeli" veya değerli statik asset **yok** — sadece thewoo.az'ın eski hali.

---

## 4. Kaynak 3 — `thewoo.az` Motoru (Asıl Temel)

Yığın: **React 19 + Vite + TypeScript + Tailwind** (önyüz), **Hono + tRPC + Drizzle ORM + MySQL** (arka uç). Tek Node süreci hem siteyi hem API'yi sunuyor. Railway'de yayında.

**En önemli tespit: Bu sistemde sipariş/sepet/ödeme zaten YOK.** `orders`, `cart`, `payment`, `checkout` diye tablo veya modül bulunamadı. Bu bir **menü/katalog CMS'i** — tam bizim hedefimize uygun. Yani "e-ticareti temizleme" işi çok hafif.

### Doğrudan kullanılabilecek modüller (yüksek değer)

| Modül | Dosya(lar) | Katalog için faydası |
|---|---|---|
| **Admin paneli kabuğu** | `src/pages/admin/AdminLayout.tsx` + sayfalar | Hazır yönetim arayüzü |
| **Admin giriş / yetki** | `src/lib/adminAuthStorage.ts`, `/api/admin/verify` | Başlık (header) tabanlı güvenli giriş |
| **Menü/Ürün yönetimi** | `api/routers/menu.ts`, `MenuPage.tsx` | Kategori + ürün CRUD (çok dilli) |
| **QR Menü + Şube** | `api/routers/branchMenu.ts`, `branch.ts`, `QRMenuPage.tsx` | Şube bazlı dinamik QR menü — **tam hedefimiz** |
| **Görsel/Medya** | `api/routers/media.ts`, `photos.ts`, `MediaPage.tsx` (Supabase) | Ürün görseli yükleme |
| **Çok dillilik** | Şemadaki `*_az/ru/en/tr/ar` alanları | AZ/RU/EN/TR hazır |
| **SEO yönetimi** | `api/routers/seo.ts`, `seoPages` tablosu | Sayfa bazlı SEO |
| **Güvenlik (CORS/CSP)** | `api/boot.ts` | Sıkı güvenlik başlıkları hazır |
| **Ayarlar** | `api/routers/settings.ts` | Anahtar/değer ayar deposu |

### Çıkarılacak / kullanılmayacak modüller (katalog için gereksiz)

Google Ads (`googleAds.ts` + 7 tablo), Meta CAPI (`metaCapi.ts`), Tracking (`tracking.ts`), Popup kampanyaları (`popup.ts`), AI Auditor/Insights, Mail/SMTP/cPanel (`mail.ts`, `cpanel.ts`), Rezervasyon (`ReservationPage.tsx`), Restoran rozet sistemi (isMeat/isFish/isHalal/isSpicy vb.).

→ Bunlar projeye gereksiz bağımlılık (over-fitting) getirir; almıyoruz.

---

## 5. Önerilen Sadeleştirilmiş Veritabanı Şeması (Drizzle)

thewoo.az'ın `menuCategories`/`menuItems` yapısını katalog diline uyarlıyorum. Ana eklemeler: **alt kategori** (parentId), **fiyat gizle/göster** (priceVisible), **varyantlar** ve **çoklu görsel**.

```
categories
  id, parentId (NULL = ana kategori, dolu = alt kategori), slug,
  titleAz, titleRu, titleEn, titleTr,
  imageUrl, sortOrder, isActive, isFeatured, createdAt, updatedAt

products            (eski "menuItems")
  id, categoryId, slug,
  nameAz, nameRu, nameEn, nameTr,
  descAz, descRu, descEn, descTr,
  basePrice (varchar, opsiyonel),
  priceVisible (boolean, default true)   ← fiyat gizle/göster opsiyonu
  imageUrl (ana görsel),
  sortOrder, isActive, isNew, isFeatured, createdAt, updatedAt

product_images       (galeri — çoklu görsel)
  id, productId, url, alt, sortOrder

product_variants     (beden/renk — örn. BOXFUL S/M/L, BLACK/WOOD)
  id, productId, nameAz, nameRu, nameEn, nameTr,
  price (opsiyonel), sku (opsiyonel), sortOrder, isActive

branches             (şube — QR için, thewoo.az'dan aynen)
  id, name, slug, qrSlug, address, phone, isActive

product_branches     (hangi ürün hangi şubede — QR menü filtresi)
  id, branchId, productId, isAvailable, branchPrice (opsiyonel)

media_assets         (genel görsel havuzu — aynen)
seo_pages            (SEO — aynen)
settings             (ayarlar — aynen)

admin_users          (RBAC — YENİ, bkz. not)
  id, email, passwordHash, role (admin/editor/viewer), isActive
```

**İlişki:** `categories (ana) → categories (alt) → products → variants/images`. QR menü: `branch → product_branches → products`.

**RBAC notu:** Şu anki thewoo.az tek bir `ADMIN_SECRET_KEY` ile çalışıyor (rol yok). Proje notunuz "rol tabanlı erişim (RBAC)" istiyor. Bunu `admin_users` tablosu + rol alanı ile ekleyebiliriz. Bu, mevcut motorun **üzerine eklenecek yeni bir özellik** — onaylarsanız Faz 3'te planlarım.

---

## 6. Onayınız Gereken Ana Karar: Teknoloji Yığını

Proje notunuzda **"PostgreSQL + Fastify/Prisma"** yazıyor. Ancak incelediğim gerçek kod tabanı **MySQL + Hono + tRPC + Drizzle** kullanıyor. İki yol var:

**A) Mevcut yığını koru (ÖNERİM):** MySQL + Hono + tRPC + Drizzle.
Artısı: thewoo.az kodunun %90'ı doğrudan kullanılır, hızlı ve düşük riskli. Eksisi: PostgreSQL değil MySQL.

**B) Proje notuna sadık kal:** PostgreSQL + Fastify'a taşı.
Artısı: İstediğiniz yığın. Eksisi: Admin panel, QR menü, auth dahil çoğu şeyi yeniden yazmak gerekir — çok daha uzun ve riskli; thewoo.az'dan "kopyala-uyarla" avantajı büyük ölçüde kaybolur.

Bu kararı bana bildirmenizi istiyorum; çünkü Faz 2'nin tüm kurulumu buna bağlı.

---

## 7. Faz 2 İçin Önerilen Adımlar (Onay Sonrası)

1. Temiz bir çalışma alanı (workspace) oluştur; `thewoo.az`'ı temel al.
2. Yukarıdaki sadeleştirilmiş şemayı `db/schema.ts` + `autoMigrate` olarak yaz.
3. Gereksiz modülleri (Google Ads, Meta CAPI, popup, AI, mail, rezervasyon) çıkar.
4. Admin paneli + auth + QR menü çekirdeğini taşı, bağımlılıkları kur.
5. Canlı siteden kategori/ürün verisini aktarmak için bir plan çıkar.

> Not: Terminal komutlarını (npm install, migration vb.) size **metin olarak** vereceğim; siz Integrated Terminal'de çalıştırıp sonucu bana ileteceksiniz.
```
```
```
```
**Lütfen şunları onaylayın:** (1) Yığın kararı (A mı B mi?), (2) Sadeleştirilmiş şema, (3) Çıkarılacak modül listesi. Onaydan sonra Faz 2 kodlamasına başlarım.
