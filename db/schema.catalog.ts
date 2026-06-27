// ═══════════════════════════════════════════════════════════════
// XURCUN — Sadeleştirilmiş Katalog + QR Menü Şeması (Drizzle / MySQL)
// ───────────────────────────────────────────────────────────────
// Amaç: Sepet/ödeme YOK. Müşteri QR veya link ile katalogu açar,
// ürüne tıklar, fiyatı görür ve WhatsApp ile siparişi mağazaya gönderir.
//
// Hiyerarşi: categories (ana) → categories (alt) → products
//            products → product_variants (beden/renk)
//            products → product_images (galeri)
// QR/Şube:   branches → product_branches → products
//
// Not: Bu dosya, mevcut motorun stiline (serial/varchar/int) uygun
// yazıldı. Faz 2'de eski db/schema.ts yerine bunu devreye alacağız.
// ═══════════════════════════════════════════════════════════════

import {
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  int,
  mysqlTable,
} from "drizzle-orm/mysql-core";

// ───────────────────────────────────────────────────────────────
// KATEGORİLER  (ana + alt — kendine referanslı parentId ile)
//   parentId = NULL  → ana kategori (örn. ÇAY & BAHARAT)
//   parentId = dolu  → alt kategori (örn. ÇAY)
// ───────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: serial("id"),
  parentId: int("parent_id"), // NULL = ana kategori
  slug: varchar("slug", { length: 140 }).notNull(), // URL: /kateqoriya/cay-baharat
  titleAz: varchar("title_az", { length: 200 }).notNull(),
  titleRu: varchar("title_ru", { length: 200 }),
  titleEn: varchar("title_en", { length: 200 }),
  titleTr: varchar("title_tr", { length: 200 }),
  imageUrl: text("image_url"), // kategori kapak görseli
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false), // ana sayfada öne çıkar
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ───────────────────────────────────────────────────────────────
// ÜRÜNLER
//   priceVisible = true → fiyat müşteriye görünür (varsayılan)
//   priceVisible = false → "Fiyat için sorun" gösterilir
// ───────────────────────────────────────────────────────────────
export const products = mysqlTable("products", {
  id: serial("id"),
  categoryId: int("category_id").notNull(), // alt kategoriye (yoksa ana) bağlanır
  slug: varchar("slug", { length: 160 }).notNull(), // URL: /mehsul/boxful-m-black
  nameAz: varchar("name_az", { length: 300 }).notNull(),
  nameRu: varchar("name_ru", { length: 300 }),
  nameEn: varchar("name_en", { length: 300 }),
  nameTr: varchar("name_tr", { length: 300 }),
  descAz: text("desc_az"),
  descRu: text("desc_ru"),
  descEn: text("desc_en"),
  descTr: text("desc_tr"),

  price: varchar("price", { length: 50 }), // örn. "220.00" — para birimi ayarlardan (₼)
  priceVisible: boolean("price_visible").default(true), // FİYAT GİZLE/GÖSTER
  unit: varchar("unit", { length: 50 }), // opsiyonel: "500 q", "ədəd" vb.

  imageUrl: text("image_url"), // ana görsel (kart için)
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  isNew: boolean("is_new").default(false), // "Yeni" rozeti
  isFeatured: boolean("is_featured").default(false), // öne çıkan
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ───────────────────────────────────────────────────────────────
// ÜRÜN GÖRSELLERİ  (çoklu görsel / galeri)
// ───────────────────────────────────────────────────────────────
export const productImages = mysqlTable("product_images", {
  id: serial("id"),
  productId: int("product_id").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  altAz: varchar("alt_az", { length: 200 }),
  altEn: varchar("alt_en", { length: 200 }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ───────────────────────────────────────────────────────────────
// ÜRÜN VARYANTLARI  (beden / renk — örn. BOXFUL S/M/L, BLACK/WOOD/WHITE)
//   price doluysa o varyantın kendi fiyatı geçerli; boşsa ürün fiyatı.
// ───────────────────────────────────────────────────────────────
export const productVariants = mysqlTable("product_variants", {
  id: serial("id"),
  productId: int("product_id").notNull(),
  nameAz: varchar("name_az", { length: 150 }).notNull(), // "L", "Qara dəri"
  nameRu: varchar("name_ru", { length: 150 }),
  nameEn: varchar("name_en", { length: 150 }),
  nameTr: varchar("name_tr", { length: 150 }),
  price: varchar("price", { length: 50 }), // opsiyonel fiyat override
  sku: varchar("sku", { length: 100 }), // opsiyonel stok kodu
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

// ───────────────────────────────────────────────────────────────
// ŞUBELER  (QR menü hedefi — her şubeye kendi WhatsApp numarası)
//   QR linki: https://xurcun.az/menu/<slug>
// ───────────────────────────────────────────────────────────────
export const branches = mysqlTable("branches", {
  id: serial("id"),
  name: varchar("name", { length: 200 }).notNull(), // "Port Baku Mall"
  slug: varchar("slug", { length: 100 }).notNull(), // QR yolu: port-baku
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  whatsappNumber: varchar("whatsapp_number", { length: 30 }), // sipariş WhatsApp (örn. 994502121811)
  mapUrl: varchar("map_url", { length: 500 }), // Google Maps linki
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ───────────────────────────────────────────────────────────────
// ÜRÜN ↔ ŞUBE  (hangi ürün hangi şubede var / şubeye özel fiyat)
//   Boş bırakılırsa: ürün tüm şubelerde geçerli kabul edilebilir.
// ───────────────────────────────────────────────────────────────
export const productBranches = mysqlTable("product_branches", {
  id: serial("id"),
  branchId: int("branch_id").notNull(),
  productId: int("product_id").notNull(),
  isAvailable: boolean("is_available").default(true),
  branchPrice: varchar("branch_price", { length: 50 }), // opsiyonel şube fiyatı
  isActive: boolean("is_active").default(true),
});

// ───────────────────────────────────────────────────────────────
// AYARLAR  (anahtar/değer — WhatsApp no, para birimi, sosyal linkler vb.)
//   Örn. key="whatsapp_number" value="994502121811"
//        key="currency"        value="₼"
// ───────────────────────────────────────────────────────────────
export const settings = mysqlTable("settings", {
  id: serial("id"),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ───────────────────────────────────────────────────────────────
// MEDYA HAVUZU  (admin'in yüklediği görseller — Supabase Storage)
// ───────────────────────────────────────────────────────────────
export const mediaAssets = mysqlTable("media_assets", {
  id: serial("id"),
  url: varchar("url", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 200 }),
  section: varchar("section", { length: 100 }), // "product", "category", "hero"
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ───────────────────────────────────────────────────────────────
// SEO  (sayfa + dil bazlı — motordan korunuyor)
// ───────────────────────────────────────────────────────────────
export const seoPages = mysqlTable("seo_pages", {
  id: serial("id"),
  path: varchar("path", { length: 255 }).notNull(), // "/menu/port-baku"
  lang: varchar("lang", { length: 10 }).notNull(), // "az","en","ru","tr"
  title: varchar("title", { length: 200 }),
  description: text("description"),
  ogTitle: varchar("og_title", { length: 200 }),
  ogDescription: text("og_description"),
  ogImage: varchar("og_image", { length: 500 }),
  keywords: text("keywords"),
  canonical: varchar("canonical", { length: 500 }),
  noIndex: boolean("no_index").default(false),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// ───────────────────────────────────────────────────────────────
// ADMIN KULLANICILAR  (RBAC — rol tabanlı erişim)
//   role: "admin" (tam yetki) | "editor" (ürün/kategori) | "viewer" (sadece görür)
//   Not: Mevcut motor tek ADMIN_SECRET_KEY ile çalışıyor; bu tablo
//   çok kullanıcılı RBAC için Faz 3'te devreye alınacak yeni eklentidir.
// ───────────────────────────────────────────────────────────────
export const adminUsers = mysqlTable("admin_users", {
  id: serial("id"),
  email: varchar("email", { length: 200 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 200 }),
  role: varchar("role", { length: 20 }).default("editor"), // admin | editor | viewer
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
