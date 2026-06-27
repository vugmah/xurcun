import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { getDb, getPool } from "./queries/connection";
import { menuCategories, menuItems, photos, seoSettings, photoAssignments, branches } from "../db/schema";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { eq, asc } from "drizzle-orm";

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

const app: any = new Hono<{ Bindings: HttpBindings }>();

// CORS — allow the public domain only
app.use('*', async (c: any, next: any) => {
  const origin = c.req.header('origin');
  const isDev = process.env.NODE_ENV !== 'production';
  const allowedOrigins = [
    'https://xurcun.az',
    'https://www.xurcun.az',
    ...(isDev ? ['http://localhost:5173', 'http://localhost:3000'] : []),
  ];
  if (origin && allowedOrigins.includes(origin)) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Credentials', 'true');
  }
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, x-requested-with');
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  await next();
});

// Security Headers
(app as any).use('*', async (c: any, next: any) => { await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'SAMEORIGIN');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  // CSP for public site
  if (!c.req.path.startsWith('/api/') && !c.req.path.startsWith('/admin')) {
    c.header("Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net https://static.cloudflareinsights.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: blob: https:; " +
      "font-src 'self' data: https://fonts.gstatic.com; " +
      "connect-src 'self' https://*.railway.app https://www.google-analytics.com https://graph.facebook.com https://cloudflareinsights.com https://static.cloudflareinsights.com; " +
      "frame-src https://www.google.com https://maps.google.com https://www.google-analytics.com; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );
  }
});

// Body limit: 10MB max upload
app.use(bodyLimit({ maxSize: 10 * 1024 * 1024 }));

import { uploadLimiter } from "./middleware/rateLimit";

// File upload endpoint (admin only - protected by x-admin-key header + rate limit)
app.post("/api/upload", async (c) => {
  // Rate limiting
  const ip = c.req.header("x-forwarded-for") || "unknown";
  const rateResult = uploadLimiter.check(`upload-${ip}`);
  if (!rateResult.allowed) {
    return c.json({ error: `Rate limited. Retry after ${rateResult.retryAfter}s` }, 429);
  }

  const adminKey = c.req.header("x-admin-key");
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    return c.json({ error: "Server misconfiguration" }, 500);
  }
  if (!adminKey || adminKey !== secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return c.json({ error: "No file provided" }, 400);
  }

  // File type validation (MIME + extension) — images + short web videos
  const imageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const videoMimeTypes = ["video/mp4", "video/webm", "video/quicktime"];
  const allowedMimeTypes = [...imageMimeTypes, ...videoMimeTypes];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".mov"];

  if (!allowedMimeTypes.includes(file.type)) {
    return c.json({ error: "Invalid file type. Only images (JPEG/PNG/WebP/GIF) or videos (MP4/WebM/MOV) allowed." }, 400);
  }

  const originalName = file.name.toLowerCase();
  const ext = path.extname(originalName);
  if (!allowedExtensions.includes(ext)) {
    return c.json({ error: "Invalid file extension." }, 400);
  }

  // Block dangerous extensions
  const dangerousExts = [".php", ".js", ".exe", ".sh", ".bat", ".html", ".svg"];
  if (dangerousExts.includes(ext)) {
    return c.json({ error: "Dangerous file type rejected." }, 400);
  }

  // File size limit — images 5MB, videos up to the 10MB body cap
  const isVideo = videoMimeTypes.includes(file.type);
  const maxSize = (isVideo ? 9.5 : 5) * 1024 * 1024;
  if (file.size > maxSize) {
    return c.json({
      error: isVideo
        ? "Video too large. Max ~9MB — please use a short, compressed clip."
        : "File too large. Max 5MB.",
    }, 400);
  }

  // Sanitize filename - remove any path traversal
  await mkdir(UPLOAD_DIR, { recursive: true });

  const timestamp = Date.now();
  const safeExt = ext.replace(/^\./, "");
  const filename = `xurcun_${timestamp}.${safeExt}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Ensure filepath is inside UPLOAD_DIR
  if (!filepath.startsWith(UPLOAD_DIR)) {
    return c.json({ error: "Invalid file path." }, 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  /* ─── Try Supabase Storage first (persistent cloud storage) ─── */
  if (env.supabaseUrl && env.supabaseServiceKey) {
    try {
      const { createClient } = require("@supabase/supabase-js");
      const sb = createClient(env.supabaseUrl, env.supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: upData, error: upError } = await sb.storage
        .from(env.supabaseBucket)
        .upload(`menu/${filename}`, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!upError && upData) {
        const { data: urlData } = sb.storage
          .from(env.supabaseBucket)
          .getPublicUrl(`menu/${filename}`);
        return c.json({
          success: true,
          filename,
          url: urlData.publicUrl,
          size: file.size,
          source: "supabase",
        });
      }
      /* Upload succeeded but no data returned */
      return c.json({ success: false, error: "Upload returned no data" }, 500);
    } catch (supaErr: any) {
      console.error("[Upload] Supabase error:", supaErr);
      return c.json({ success: false, error: supaErr.message || "Upload failed" }, 500);
    }
  }

  /* ─── Local-disk fallback (when Supabase isn't configured) ───
     NOTE: on Railway the container filesystem is ephemeral — files written
     here survive until the next redeploy. For permanent storage either
     configure Supabase (SUPABASE_URL/SERVICE_KEY/BUCKET) or mount a Railway
     volume at the `uploads/` path. This fallback keeps the admin usable. */
  try {
    await writeFile(filepath, buffer);
    return c.json({
      success: true,
      filename,
      url: `/uploads/${filename}`,
      size: file.size,
      source: "local",
    });
  } catch (diskErr: any) {
    console.error("[Upload] Local disk error:", diskErr);
    return c.json({ success: false, error: diskErr.message || "Upload failed" }, 500);
  }
});

// Serve uploaded files
app.get("/uploads/*", async (c) => {
  const filepath = path.join(UPLOAD_DIR, c.req.path.replace("/uploads/", ""));
  try {
    const file = await readFile(filepath);
    const ext = path.extname(filepath).toLowerCase();
    const contentType =
      ext === ".png" ? "image/png" :
      ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
      ext === ".webp" ? "image/webp" :
      ext === ".gif" ? "image/gif" : "application/octet-stream";
    return new Response(file, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

// Sitemap.xml endpoint — real crawlable URLs (BrowserRouter, path-based routing).
// Branch menu pages (/menu/<slug>) can be appended here once branch slugs are
// queried; for now the canonical public routes are listed.
app.get("/sitemap.xml", async (c) => {
  const today = new Date().toISOString().split("T")[0];

  const routes = [
    { loc: "https://xurcun.az/", priority: "1.0", changefreq: "weekly" },
    { loc: "https://xurcun.az/catalog", priority: "0.9", changefreq: "weekly" },
    { loc: "https://xurcun.az/menu", priority: "0.9", changefreq: "weekly" },
    { loc: "https://xurcun.az/privacy", priority: "0.3", changefreq: "yearly" },
    { loc: "https://xurcun.az/cookie-policy", priority: "0.3", changefreq: "yearly" },
  ];

  // Per-branch QR-menu pages (/menu/<slug>) — one crawlable URL per active store.
  // Best-effort: a DB failure must not break the sitemap; fall back to static routes.
  try {
    const db = getDb();
    const rows = await db
      .select({ slug: branches.slug })
      .from(branches)
      .where(eq(branches.isActive, true))
      .orderBy(asc(branches.sortOrder));
    for (const b of rows) {
      if (b.slug) routes.push({ loc: `https://xurcun.az/menu/${b.slug}`, priority: "0.7", changefreq: "weekly" });
    }
  } catch (err) {
    console.error("[sitemap] branch fetch failed (serving static routes only):", err);
  }

  const urls = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${r.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

// Robots.txt endpoint
app.get("/robots.txt", (c) => {
  const baseUrl = "https://xurcun.az";
  const content = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${baseUrl}/sitemap.xml\n`;
  return new Response(content, {
    headers: { "Content-Type": "text/plain" },
  });
});

// ═══════════════════════════════════════════════════════════════════
// MIGRATION ENGINE — Single source of truth for all table creation
// Uses getPool().execute() (mysql2/promise) — NEVER db.execute()
// ═══════════════════════════════════════════════════════════════════

/** Helper: safely create a table with proper error logging */
async function createTable(name: string, ddl: string): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.execute(ddl);
    console.log(`[MIGRATE] Table "${name}" verified/created`);
    return true;
  } catch (err: any) {
    const msg = err.message || String(err);
    // "already exists" is NOT an error — log as info
    if (msg.includes("already exists") || msg.includes("Duplicate") || msg.includes("EXIST")) {
      console.log(`[MIGRATE] Table "${name}" already exists — OK`);
      return true;
    }
    console.error(`[MIGRATE] FAILED to create table "${name}":`, msg);
    return false;
  }
}

/** Helper: safely add a column if it doesn't exist */
async function addColumn(table: string, col: string, def: string): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    console.log(`[MIGRATE] Column "${table}.${col}" added`);
    return true;
  } catch (err: any) {
    const msg = err.message || String(err);
    if (msg.includes("already exists") || msg.includes("Duplicate")) {
      return true; // expected
    }
    console.error(`[MIGRATE] Column "${table}.${col}" add failed:`, msg);
    return false;
  }
}

/** Helper: safely create an index if it doesn't exist */
async function createIndex(table: string, idxName: string, cols: string): Promise<boolean> {
  try {
    const pool = getPool();
    await pool.execute(`CREATE INDEX ${idxName} ON ${table} (${cols})`);
    console.log(`[MIGRATE] Index "${idxName}" on ${table} created`);
    return true;
  } catch (err: any) {
    const msg = err.message || String(err);
    if (msg.includes("already exists") || msg.includes("Duplicate")) {
      console.log(`[MIGRATE] Index "${idxName}" already exists — OK`);
      return true;
    }
    console.error(`[MIGRATE] Index "${idxName}" create failed:`, msg);
    return false;
  }
}

/** Single migration lifecycle — runs once on startup, idempotent */
(async function autoMigrate() {
  console.log("[MIGRATE] === Migration engine starting ===");

  // ── 1. photos (must exist before photo_assignments references it) ──
  await createTable("photos", `
    CREATE TABLE IF NOT EXISTS photos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      url VARCHAR(500) NOT NULL,
      alt VARCHAR(200),
      alt_az VARCHAR(200),
      alt_ru VARCHAR(200),
      alt_en VARCHAR(200),
      section VARCHAR(100),
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  // ── 2. photo_assignments ──
  await createTable("photo_assignments", `
    CREATE TABLE IF NOT EXISTS photo_assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tab VARCHAR(50) NOT NULL,
      cat_title_az VARCHAR(200) NOT NULL,
      item_name_az VARCHAR(300) NOT NULL,
      branch_slug VARCHAR(100) DEFAULT '',
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_assignment (tab, cat_title_az, item_name_az, branch_slug)
    )`);
  // image_id: the Drizzle schema selects this column, but the original CREATE TABLE
  // omitted it → menu.updateItem 500'd with "Unknown column 'image_id'". Backfill it.
  await addColumn("photo_assignments", "image_id", "VARCHAR(100)");

  // ── 3. menu_items (base table) ──
  await createTable("menu_items", `
    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name_az VARCHAR(300) NOT NULL,
      name_ru VARCHAR(300) NOT NULL,
      name_en VARCHAR(300) NOT NULL,
      price VARCHAR(50),
      desc_az TEXT,
      desc_ru TEXT,
      desc_en TEXT,
      sort_order INT DEFAULT 0,
      is_featured BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  // menu_items: ensure all columns exist (backward compat)
  await addColumn("menu_items", "image_url", "TEXT");
  await addColumn("menu_items", "image_alt_az", "TEXT");
  await addColumn("menu_items", "image_alt_ru", "TEXT");
  await addColumn("menu_items", "image_alt_en", "TEXT");
  await addColumn("menu_items", "is_new", "BOOLEAN DEFAULT false");
  await addColumn("menu_items", "is_meat", "BOOLEAN DEFAULT false");
  await addColumn("menu_items", "is_fish", "BOOLEAN DEFAULT false");
  await addColumn("menu_items", "is_vegetarian", "BOOLEAN DEFAULT false");
  await addColumn("menu_items", "is_halal", "BOOLEAN DEFAULT false");

  // ── 4. menu_categories (with all columns) ──
  await createTable("menu_categories", `
    CREATE TABLE IF NOT EXISTS menu_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      menu_type VARCHAR(50),
      title_az VARCHAR(200),
      title_ru VARCHAR(200),
      title_en VARCHAR(200),
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      is_featured BOOLEAN DEFAULT false
    )`);
  // Ensure columns exist (backward compat)
  await addColumn("menu_categories", "menu_type", "VARCHAR(50) DEFAULT NULL");
  await addColumn("menu_categories", "title_az", "VARCHAR(200) DEFAULT NULL");
  await addColumn("menu_categories", "title_ru", "VARCHAR(200) DEFAULT NULL");
  await addColumn("menu_categories", "title_en", "VARCHAR(200) DEFAULT NULL");
  await addColumn("menu_categories", "sort_order", "INT DEFAULT 0");
  await addColumn("menu_categories", "is_active", "BOOLEAN DEFAULT true");
  await addColumn("menu_categories", "is_featured", "BOOLEAN DEFAULT false");

  // ── 5. branches ──
  await createTable("branches", `
    CREATE TABLE IF NOT EXISTS branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(100) NOT NULL,
      address TEXT,
      phone VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

  // Seed real Xurcun branches (idempotent by slug; only base columns —
  // extended columns whatsapp/map/video/has_cafe/sort are added later in 7c)
  try {
    const pool = getPool();
    // remove legacy TheWoo template defaults if still present
    await pool.execute(
      `DELETE FROM branches WHERE (slug = 'white-city' AND address = 'Baku, White City') OR slug = 'seabreeze'`,
    );
    const XB: [string, string, string, string | null][] = [
      ["Port Baku Mall", "port-baku", "Üzeyir Hacıbəyov 57, Bakı", "+994777170070"],
      ["Crescent Mall", "crescent-mall", "Neftçilər pr. 68, Bakı", null],
      ["Sea Breeze", "sea-breeze", "Sea Breeze Resort, Nardaran", null],
      ["Gənclik Mall", "genclik", "Fətəli Xan Xoyski 38, Bakı", "+994502123574"],
      ["Səməd Vurğun", "semed-vurgun", "Səməd Vurğun 81, Bakı", "+994502123549"],
      ["Azadlıq prospekti", "azadliq", "Azadlıq pr. 119, Bakı", "+994502123547"],
      ["Hüseyn Cavid", "huseyn-cavid", "Hüseyn Cavid pr. 47K, Bakı", "+994502123548"],
      ["Xətai", "xetai", "İzzət Orucov 16, Bakı", "+994122121811"],
      ["Hava Limanı — Coffee", "airport", "Heydər Əliyev Hava Limanı, Terminal 1", "+994502123515"],
      ["Hava Limanı — Duty Free", "airport-dutyfree", "Heydər Əliyev Hava Limanı (GYD)", null],
      ["White City", "white-city", "1-ci Yaşıl Ada küç., Bakı", "+994502123599"],
    ];
    for (const [name, slug, address, phone] of XB) {
      const [r] = await pool.execute(`SELECT id FROM branches WHERE slug = ? LIMIT 1`, [slug]);
      if (!(r as any[]).length) {
        await pool.execute(
          `INSERT INTO branches (name, slug, address, phone, is_active) VALUES (?, ?, ?, ?, true)`,
          [name, slug, address, phone],
        );
      }
    }
    console.log("[MIGRATE] Xurcun branches ensured (11)");
  } catch (err: any) {
    console.error("[MIGRATE] Branch seed error:", err.message || err);
  }

  // ── 6. menu_item_branches ──
  await createTable("menu_item_branches", `
    CREATE TABLE IF NOT EXISTS menu_item_branches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      branch_id INT NOT NULL,
      menu_item_id INT NOT NULL,
      branch_price VARCHAR(50),
      is_available BOOLEAN DEFAULT true,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

  // ── 7. menu_items icon columns (backward compat) ──
  await addColumn("menu_items", "is_spicy", "BOOLEAN DEFAULT false");
  await addColumn("menu_items", "is_gluten_free", "BOOLEAN DEFAULT false");
  await addColumn("menu_items", "is_sugar_free", "BOOLEAN DEFAULT false");
  await addColumn("menu_items", "is_snack", "BOOLEAN DEFAULT false");

  // ── 7b. PERFORMANCE INDEXES (critical for getMenu N+1 fix) ──
  await createIndex("menu_categories", "idx_menu_categories_type", "menu_type");
  await createIndex("menu_categories", "idx_menu_categories_active", "is_active");
  await createIndex("menu_items", "idx_menu_items_category_id", "category_id");
  await createIndex("menu_items", "idx_menu_items_active", "is_active");
  await createIndex("menu_items", "idx_menu_items_sort", "sort_order, id");

  // ── 7c. XURCUN CATALOG ADAPTATION (additive, idempotent) ──
  // Categories: sub-category support + TR/AR titles (clone lacked them)
  await addColumn("menu_categories", "parent_id", "INT");
  await addColumn("menu_categories", "title_tr", "VARCHAR(200)");
  await addColumn("menu_categories", "title_ar", "VARCHAR(200)");
  // Timestamps: schema (Drizzle) selects these, but the original CREATE TABLE
  // omitted them → storefront query 500'd with "Unknown column". Backfill them.
  await addColumn("menu_categories", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await addColumn("menu_categories", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  // Items: TR/AR name + description (clone lacked them)
  await addColumn("menu_items", "name_tr", "VARCHAR(300)");
  await addColumn("menu_items", "name_ar", "VARCHAR(300)");
  await addColumn("menu_items", "desc_tr", "TEXT");
  await addColumn("menu_items", "desc_ar", "TEXT");
  // Items: price visibility + unit + minimum order
  await addColumn("menu_items", "price_visible", "BOOLEAN DEFAULT true");
  await addColumn("menu_items", "unit", "VARCHAR(50)");
  await addColumn("menu_items", "min_order", "VARCHAR(50)");
  // Branches: per-branch WhatsApp, maps, store video, cafe flag, sort
  await addColumn("branches", "whatsapp_number", "VARCHAR(30)");
  await addColumn("branches", "map_url", "VARCHAR(500)");
  await addColumn("branches", "video_url", "VARCHAR(500)");
  await addColumn("branches", "has_cafe", "BOOLEAN DEFAULT false");
  await addColumn("branches", "sort_order", "INT DEFAULT 0");
  // Product images (gallery)
  await createTable("product_images", `
    CREATE TABLE IF NOT EXISTS product_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      url VARCHAR(500) NOT NULL,
      alt_az VARCHAR(200),
      alt_en VARCHAR(200),
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await createIndex("product_images", "idx_product_images_item", "item_id");
  // Product variants (size / color)
  await createTable("product_variants", `
    CREATE TABLE IF NOT EXISTS product_variants (
      id INT AUTO_INCREMENT PRIMARY KEY,
      item_id INT NOT NULL,
      name_az VARCHAR(150) NOT NULL,
      name_ru VARCHAR(150),
      name_en VARCHAR(150),
      name_tr VARCHAR(150),
      name_ar VARCHAR(150),
      price VARCHAR(50),
      sku VARCHAR(100),
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true
    )`);
  await createIndex("product_variants", "idx_product_variants_item", "item_id");
  await createIndex("menu_categories", "idx_menu_categories_parent", "parent_id");

  // ── 7d. XURCUN CATALOG CATEGORIES (real categories from xurcun.com) ──
  // Idempotent: only inserts a category if it does not already exist.
  // Does NOT touch restaurant ("food"/"beverage"/…) categories — those are a
  // different menu_type and never show on the catalog/QR menu.
  try {
    const pool = getPool();
    // [titleAz, titleRu, titleEn, titleTr, titleAr, sortOrder]
    const CATS: [string, string, string, string, string, number][] = [
      ["Quru meyvə", "Сухофрукты", "Dried Fruit", "Kuru Meyve", "فواكه مجففة", 10],
      ["Çərəz", "Орехи и снеки", "Nuts & Snacks", "Çerez", "مكسرات", 20],
      ["Çay və Ədviyyat", "Чай и специи", "Tea & Spices", "Çay & Baharat", "شاي وتوابل", 30],
      ["Şokolad", "Шоколад", "Chocolate", "Çikolata", "شوكولاتة", 40],
      ["Lokum", "Лукум", "Turkish Delight", "Lokum", "ملبن", 50],
      ["Paxlava", "Пахлава", "Baklava", "Baklava", "بقلاوة", 60],
      ["Hədiyyəlik", "Подарки", "Gifts", "Hediyelik", "هدايا", 70],
    ];
    for (const [az, ru, en, tr, ar, sort] of CATS) {
      const [r] = await pool.execute(
        `SELECT id FROM menu_categories WHERE menu_type='catalog' AND title_az=? AND parent_id IS NULL LIMIT 1`,
        [az],
      );
      if (!(r as any[]).length) {
        await pool.execute(
          `INSERT INTO menu_categories
             (menu_type, parent_id, title_az, title_ru, title_en, title_tr, title_ar, sort_order, is_active, is_featured)
           VALUES ('catalog', NULL, ?, ?, ?, ?, ?, ?, true, false)`,
          [az, ru, en, tr, ar, sort],
        );
      }
    }
    // "Çay" — sub-category of "Çay və Ədviyyat" (mirrors xurcun.com hierarchy)
    const [pr] = await pool.execute(
      `SELECT id FROM menu_categories WHERE menu_type='catalog' AND title_az=? AND parent_id IS NULL LIMIT 1`,
      ["Çay və Ədviyyat"],
    );
    const parentId = (pr as any[])[0]?.id;
    if (parentId) {
      const [sr] = await pool.execute(
        `SELECT id FROM menu_categories WHERE menu_type='catalog' AND title_az=? AND parent_id=? LIMIT 1`,
        ["Çay", parentId],
      );
      if (!(sr as any[]).length) {
        await pool.execute(
          `INSERT INTO menu_categories
             (menu_type, parent_id, title_az, title_ru, title_en, title_tr, title_ar, sort_order, is_active, is_featured)
           VALUES ('catalog', ?, ?, ?, ?, ?, ?, ?, true, false)`,
          [parentId, "Çay", "Чай", "Tea", "Çay", "شاي", 10],
        );
      }
    }
    console.log("[MIGRATE] Xurcun catalog categories ensured (7 + 1 sub)");
  } catch (err: any) {
    console.error("[MIGRATE] Catalog category seed error:", err.message || err);
  }

  // ── 8. SEO SETTINGS — per-page multilingual SEO ──
  // DROP old table (may have legacy columns: title, description, keywords, lang)
  // then recreate with clean per-language-only schema
  try {
    const pool = getPool();
    await pool.execute("DROP TABLE IF EXISTS seo_settings");
    console.log("[MIGRATE] Dropped old seo_settings table (will recreate clean)");
  } catch (err: any) {
    console.log("[MIGRATE] seo_settings drop note:", err.message);
  }
  await createTable("seo_settings", `
    CREATE TABLE IF NOT EXISTS seo_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page VARCHAR(100) NOT NULL,
      og_image VARCHAR(500),
      title_az VARCHAR(200),
      description_az TEXT,
      keywords_az TEXT,
      og_title_az VARCHAR(200),
      og_description_az TEXT,
      title_ru VARCHAR(200),
      description_ru TEXT,
      keywords_ru TEXT,
      og_title_ru VARCHAR(200),
      og_description_ru TEXT,
      title_en VARCHAR(200),
      description_en TEXT,
      keywords_en TEXT,
      og_title_en VARCHAR(200),
      og_description_en TEXT,
      title_tr VARCHAR(200),
      description_tr TEXT,
      keywords_tr TEXT,
      og_title_tr VARCHAR(200),
      og_description_tr TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  // Backward compat: add per-language columns if they don't exist
  await addColumn("seo_settings", "title_az", "VARCHAR(200)");
  await addColumn("seo_settings", "description_az", "TEXT");
  await addColumn("seo_settings", "keywords_az", "TEXT");
  await addColumn("seo_settings", "og_title_az", "VARCHAR(200)");
  await addColumn("seo_settings", "og_description_az", "TEXT");
  await addColumn("seo_settings", "title_ru", "VARCHAR(200)");
  await addColumn("seo_settings", "description_ru", "TEXT");
  await addColumn("seo_settings", "keywords_ru", "TEXT");
  await addColumn("seo_settings", "og_title_ru", "VARCHAR(200)");
  await addColumn("seo_settings", "og_description_ru", "TEXT");
  await addColumn("seo_settings", "title_en", "VARCHAR(200)");
  await addColumn("seo_settings", "description_en", "TEXT");
  await addColumn("seo_settings", "keywords_en", "TEXT");
  await addColumn("seo_settings", "og_title_en", "VARCHAR(200)");
  await addColumn("seo_settings", "og_description_en", "TEXT");
  await addColumn("seo_settings", "title_tr", "VARCHAR(200)");
  await addColumn("seo_settings", "description_tr", "TEXT");
  await addColumn("seo_settings", "keywords_tr", "TEXT");
  await addColumn("seo_settings", "og_title_tr", "VARCHAR(200)");
  await addColumn("seo_settings", "og_description_tr", "TEXT");

  // ── 9. SEO PAGES ──
  // DROP old broken table (TEXT cols with bad UNIQUE KEY) and recreate with proper VARCHAR types
  try {
    const pool = getPool();
    await pool.execute(`DROP TABLE IF EXISTS seo_pages`);
    console.log("[MIGRATE] Dropped old seo_pages table (will recreate)");
  } catch (err: any) {
    console.log("[MIGRATE] seo_pages drop note:", err.message || err);
  }
  await createTable("seo_pages", `
    CREATE TABLE IF NOT EXISTS seo_pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      path VARCHAR(255) NOT NULL,
      lang VARCHAR(10) NOT NULL DEFAULT 'az',
      title VARCHAR(200),
      description TEXT,
      og_title VARCHAR(200),
      og_description TEXT,
      og_image VARCHAR(500),
      keywords TEXT,
      canonical VARCHAR(500),
      no_index BOOLEAN DEFAULT false,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_seo (path, lang)
    )`);

  // ── 10. POPUP CAMPAIGNS ──
  await createTable("popup_campaigns", `
    CREATE TABLE IF NOT EXISTS popup_campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(300),
      content TEXT,
      image_url VARCHAR(500),
      cta_text VARCHAR(100),
      cta_link VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      start_date TIMESTAMP NULL,
      end_date TIMESTAMP NULL,
      start_hour INT DEFAULT NULL,
      end_hour INT DEFAULT NULL,
      branch VARCHAR(50),
      lang VARCHAR(10),
      frequency INT DEFAULT 1,
      delay INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  // ── 11. POPUP VIEWS ──
  await createTable("popup_views", `
    CREATE TABLE IF NOT EXISTS popup_views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      campaign_id INT NOT NULL,
      session_id VARCHAR(100),
      viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  // ── 12. POPUP CLICKS ──
  await createTable("popup_clicks", `
    CREATE TABLE IF NOT EXISTS popup_clicks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      campaign_id INT NOT NULL,
      session_id VARCHAR(100),
      clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  // ── 13. SHISHA seeding (if categories empty) ──
  try {
    const pool = getPool();
    const [shishaCatCount] = await pool.execute(
      `SELECT COUNT(*) as c FROM menu_categories WHERE menu_type = 'shisha'`
    );
    if (Number((shishaCatCount as any)?.[0]?.c || 0) === 0) {
      // Insert categories
      await pool.execute(`INSERT INTO menu_categories
        (menu_type, title_az, title_ru, title_en, sort_order, is_active, is_featured) VALUES
        ('shisha', 'Nargile Cihazlari', 'Kalyan Ustroystva', 'Shisha Devices', 10, true, false),
        ('shisha', 'Nargile - Klassik', 'Kalyan - Klassicheskiy', 'Shisha - Classic', 20, true, false),
        ('shisha', 'Nargile - Premium', 'Kalyan - Premium', 'Shisha - Premium', 30, true, false),
        ('shisha', 'Nargile - Xususi', 'Kalyan - Osobiy', 'Shisha - Special', 40, true, false)`);

      const [catRows] = await pool.execute(
        `SELECT id, title_az FROM menu_categories WHERE menu_type = 'shisha' ORDER BY sort_order`
      );
      const cats = (catRows as any[]) || [];
      const deviceCat = cats.find((c: any) => c.title_az && c.title_az.includes('Cihaz'));
      const classicCat = cats.find((c: any) => c.title_az && c.title_az.includes('Klassik'));
      const premiumCat = cats.find((c: any) => c.title_az && c.title_az.includes('Premium'));
      const specialCat = cats.find((c: any) => c.title_az && c.title_az.includes('Xususi'));

      if (deviceCat) {
        await pool.execute(`INSERT INTO menu_items
          (category_id, name_az, name_ru, name_en, price, sort_order, is_active, is_featured) VALUES
          (?, 'Wookah', 'Wookah', 'Wookah', '100', 10, true, true),
          (?, 'Hooky', 'Hooky', 'Hooky', '85', 20, true, false),
          (?, 'Quasar', 'Quasar', 'Quasar', '75', 30, true, false)`,
          [deviceCat.id, deviceCat.id, deviceCat.id]);
        console.log("[MIGRATE] Shisha devices seeded (Wookah/Hooky/Quasar)");
      }
      if (classicCat) {
        await pool.execute(`INSERT INTO menu_items
          (category_id, name_az, name_ru, name_en, price, sort_order, is_active) VALUES
          (?, 'Al Fakher - Iki Alma', 'Al Fakher - Dvoynoe Yabloko', 'Al Fakher - Double Apple', NULL, 10, true),
          (?, 'Al Fakher - Nane', 'Al Fakher - Myata', 'Al Fakher - Mint', NULL, 20, true),
          (?, 'Al Fakher - Ciyelek', 'Al Fakher - Klubnika', 'Al Fakher - Strawberry', NULL, 30, true),
          (?, 'Al Fakher - Uzum', 'Al Fakher - Vinograd', 'Al Fakher - Grape', NULL, 40, true),
          (?, 'Al Fakher - Limon', 'Al Fakher - Limon', 'Al Fakher - Lemon', NULL, 50, true)`,
          [classicCat.id, classicCat.id, classicCat.id, classicCat.id, classicCat.id]);
      }
      if (premiumCat) {
        await pool.execute(`INSERT INTO menu_items
          (category_id, name_az, name_ru, name_en, price, desc_az, desc_ru, desc_en, sort_order, is_active) VALUES
          (?, 'Must Have - Magic', 'Must Have - Medzhik', 'Must Have - Magic', NULL, 'Ananas, marakuya', 'Ananas, marakuya', 'Pineapple, passion fruit', 10, true),
          (?, 'Must Have - Ice', 'Must Have - Ays', 'Must Have - Ice', NULL, 'Super soyuq efekt', 'Super kholodnyy effekt', 'Super cold effect', 20, true),
          (?, 'Black Burn - La', 'Black Burn - La', 'Black Burn - La', NULL, 'Mix meyveli', 'Miks fruktovyy', 'Mixed fruity', 30, true),
          (?, 'Chabacco - Strong Chill', 'Chabacco - Strong Chill', 'Chabacco - Strong Chill', NULL, NULL, NULL, NULL, 40, true),
          (?, 'Darkside - Supernova', 'Darkside - Supernova', 'Darkside - Supernova', NULL, 'Nar, tut', 'Granat, chernika', 'Pomegranate, blueberry', 50, true)`,
          [premiumCat.id, premiumCat.id, premiumCat.id, premiumCat.id, premiumCat.id]);
      }
      if (specialCat) {
        await pool.execute(`INSERT INTO menu_items
          (category_id, name_az, name_ru, name_en, price, desc_az, desc_ru, desc_en, sort_order, is_active, is_featured) VALUES
          (?, 'Woo Special Mix', 'Woo Speshl Miks', 'Woo Special Mix', NULL, 'Nargile ustasinin xususi mixi', 'Spetsialnyy miks mastera kalyana', 'Master special mix', 10, true, true),
          (?, 'Portagal Bas', 'Apelsinovaya chasha', 'Orange Bowl', NULL, 'Taze portagal uzerinde', 'Na svezhem apelsine', 'On fresh orange', 20, true, false),
          (?, 'Ananas Bas', 'Ananasovaya chasha', 'Pineapple Bowl', NULL, 'Taze ananas uzerinde', 'Na svezhem ananase', 'On fresh pineapple', 30, true, false),
          (?, 'Karpuz Bas', 'Arbuznaya chasha', 'Watermelon Bowl', NULL, 'Taze karpuz uzerinde', 'Na svezhem arbuzhe', 'On fresh watermelon', 40, true, false)`,
          [specialCat.id, specialCat.id, specialCat.id, specialCat.id]);
      }
      console.log("[MIGRATE] Shisha data seeded: 4 categories, 3 devices + flavors");
    }
  } catch (err: any) {
    console.error("[MIGRATE] Shisha seed error:", err.message || err);
  }

  // ── 14. DB warmup ──
  try {
    const pool = getPool();
    await pool.execute(`SELECT 1 FROM menu_items LIMIT 1`);
    console.log("[MIGRATE] DB warmup complete");
  } catch (err: any) {
    console.error("[MIGRATE] DB warmup failed:", err.message || err);
  }

  console.log("[MIGRATE] === Migration engine complete ===");
})();

// Health check endpoint (MUST come BEFORE tRPC and catch-all routes)
app.get("/health", (c) => c.json({ status: "ok", service: "xurcun", time: Date.now() }, 200));

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
// NOTE: /admin and /admin/* are served by the SPA (BrowserRouter) via the
// static-file notFound fallback in serveStaticFiles — no redirect needed.

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
