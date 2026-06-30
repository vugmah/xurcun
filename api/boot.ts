import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { getDb, getPool } from "./queries/connection";
import { menuCategories, menuItems, photos, seoSettings, photoAssignments, branches, blogPosts, faqItems } from "../db/schema";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { eq, asc, and, inArray } from "drizzle-orm";
import { clientIp, verifyAdminKey } from "./lib/adminAuth";

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
      "frame-ancestors 'self'; " +
      "form-action 'self';"
    );
  }
});

// ── Legacy migration redirects (301) ──
// The previous xurcun.az was a Ticimax shop; Google still has /en/category/*,
// /product/*, /login etc. indexed. 301 them to the new site to preserve crawl
// equity and kill soft-404s. Also fold www → apex so both don't get indexed.
app.use("*", async (c: any, next: any) => {
  const host = (c.req.header("host") || "").toLowerCase();
  if (host.startsWith("www.")) {
    const u = new URL(c.req.url);
    return c.redirect(`https://xurcun.az${u.pathname}${u.search}`, 301);
  }
  const p = new URL(c.req.url).pathname;
  if (!p.startsWith("/api") && !p.startsWith("/admin") && !p.startsWith("/uploads")) {
    if (p === "/login" || p === "/login/") return c.redirect("/", 301);
    if (/^\/(en|ru|tr|ar)(\/|$)/.test(p) ||
        /^\/(category|catygory|categories|product|products)(\/|$)/.test(p)) {
      return c.redirect("/catalog", 301);
    }
  }
  await next();
});

// Body limit: 10MB max upload
app.use(bodyLimit({ maxSize: 10 * 1024 * 1024 }));

import { uploadLimiter } from "./middleware/rateLimit";

// Admin-key verification — lets the client login validate the key server-side
// (constant-time, via verifyAdminKey) instead of comparing against a build-time
// VITE_ constant that would otherwise be inlined into the public JS bundle.
app.get("/api/admin/verify", (c) => {
  if (!verifyAdminKey(c.req.header("x-admin-key"))) {
    return c.json({ ok: false }, 401);
  }
  return c.json({ ok: true });
});

// File upload endpoint (admin only - protected by x-admin-key header + rate limit)
app.post("/api/upload", async (c) => {
  // Rate limiting (keyed on the real Cloudflare client IP)
  const ip = clientIp((n) => c.req.header(n));
  const rateResult = uploadLimiter.check(`upload-${ip}`);
  if (!rateResult.allowed) {
    return c.json({ error: `Rate limited. Retry after ${rateResult.retryAfter}s` }, 429);
  }

  // Constant-time admin-key check
  if (!verifyAdminKey(c.req.header("x-admin-key"))) {
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
  // Contain the path inside UPLOAD_DIR — block ../ traversal.
  const rel = decodeURIComponent(c.req.path.replace(/^\/uploads\//, ""));
  const filepath = path.resolve(UPLOAD_DIR, rel);
  if (filepath !== UPLOAD_DIR && !filepath.startsWith(UPLOAD_DIR + path.sep)) {
    return c.json({ error: "File not found" }, 404);
  }
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
    { loc: "https://xurcun.az/about", priority: "0.6", changefreq: "monthly" },
    { loc: "https://xurcun.az/faq", priority: "0.5", changefreq: "monthly" },
    { loc: "https://xurcun.az/corporate", priority: "0.7", changefreq: "monthly" },
    { loc: "https://xurcun.az/gift-card", priority: "0.7", changefreq: "monthly" },
    { loc: "https://xurcun.az/blog", priority: "0.6", changefreq: "weekly" },
  ];

  // Per-post blog pages (/blog/<slug>) — one crawlable URL per published post.
  // Best-effort: a DB failure must not break the sitemap; fall back to static routes.
  try {
    const db = getDb();
    const rows = await db
      .select({ slug: blogPosts.slug })
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(asc(blogPosts.sortOrder));
    for (const b of rows) {
      if (b.slug) routes.push({ loc: `https://xurcun.az/blog/${b.slug}`, priority: "0.6", changefreq: "monthly" });
    }
  } catch (err) {
    console.error("[sitemap] blog posts fetch failed (serving static routes only):", err);
  }

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

  // Per-product catalog pages (/catalog/<slug>) — one crawlable URL per active
  // product so Google discovers product pages via the sitemap (not just manually).
  try {
    const db = getDb();
    const cats = await db
      .select({ id: menuCategories.id })
      .from(menuCategories)
      .where(and(eq(menuCategories.menuType, "catalog"), eq(menuCategories.isActive, true)));
    const catIds = cats.map((c) => c.id);
    if (catIds.length) {
      const items = await db
        .select({ nameEn: menuItems.nameEn, nameAz: menuItems.nameAz })
        .from(menuItems)
        .where(and(inArray(menuItems.categoryId, catIds), eq(menuItems.isActive, true)));
      const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      const seen = new Set<string>();
      for (const it of items) {
        const slug = slugify(String(it.nameEn || it.nameAz || ""));
        if (slug && !seen.has(slug)) {
          seen.add(slug);
          routes.push({ loc: `https://xurcun.az/catalog/${slug}`, priority: "0.7", changefreq: "weekly" });
        }
      }
    }
  } catch (err) {
    console.error("[sitemap] catalog products fetch failed:", err);
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

// llms.txt — concise, quotable brand summary for AI crawlers (AEO/GEO).
app.get("/llms.txt", (c) => {
  const content = `# Xurcun Chain of Boutiques
> Premium Azerbaijani boutique chain for dried fruit, nuts, exotic teas, sweets,
> chocolate, Turkish delight, baklava and handcrafted gift boxes.
> Founded 2015 in Baku by Vugar Maharramov. 11 stores. Slogan: "Fond of Quality".
> Languages: Azerbaijani, Russian, English, Turkish, Arabic. Currency: AZN.

## Key pages
- [Home](https://xurcun.az/): brand overview, store list, contact
- [Catalogue](https://xurcun.az/catalog): products by category, order via WhatsApp
- [About](https://xurcun.az/about): company story and facts
- [FAQ](https://xurcun.az/faq): common questions and answers
- [QR Menu](https://xurcun.az/menu): in-store product menu

## Facts
- Founded: 2015. Founder: Vugar Maharramov. Stores: 11 (Baku).
- Contact: +994 50 212 18 11, info@xurcun.az
- Categories: Dried Fruit, Nuts & Snacks, Tea & Spices, Chocolate, Turkish Delight, Baklava, Gifts
- Products are natural, preservative-free; gluten-free options available.
- Locations include: Port Baku Mall, Ganjlik Mall, Crescent Mall, Sea Breeze,
  Səməd Vurğun, Azadlıq, Hüseyn Cavid, Khatai, White City, Heydar Aliyev Airport.
`;
  return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
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

  // ── 5b. blog_posts (DB-backed Blog CMS) ──
  await createTable("blog_posts", `
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(160) NOT NULL UNIQUE,
      date VARCHAR(10) NOT NULL,
      cover VARCHAR(500), video VARCHAR(500),
      title_az VARCHAR(300), title_ru VARCHAR(300), title_en VARCHAR(300), title_tr VARCHAR(300), title_ar VARCHAR(300),
      desc_az TEXT, desc_ru TEXT, desc_en TEXT, desc_tr TEXT, desc_ar TEXT,
      h1_az VARCHAR(300), h1_ru VARCHAR(300), h1_en VARCHAR(300), h1_tr VARCHAR(300), h1_ar VARCHAR(300),
      lead_az TEXT, lead_ru TEXT, lead_en TEXT, lead_tr TEXT, lead_ar TEXT,
      sections JSON, sort_order INT DEFAULT 0, published BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  await createIndex("blog_posts", "idx_blog_posts_pub_sort", "published, sort_order");

  // Seed blog posts from the content-in-code source (idempotent by slug).
  try {
    const pool = getPool();
    const { BLOG_POSTS } = await import("../src/lib/blogPosts");
    let idx = 0;
    for (const p of BLOG_POSTS) {
      const [r] = await pool.execute(`SELECT id FROM blog_posts WHERE slug = ? LIMIT 1`, [p.slug]);
      if (!(r as any[]).length) {
        await pool.execute(
          `INSERT INTO blog_posts
             (slug, date, cover, video,
              title_az, title_ru, title_en, title_tr, title_ar,
              desc_az, desc_ru, desc_en, desc_tr, desc_ar,
              h1_az, h1_ru, h1_en, h1_tr, h1_ar,
              lead_az, lead_ru, lead_en, lead_tr, lead_ar,
              sections, sort_order, published)
           VALUES (?, ?, ?, ?,  ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?,  ?, ?, ?, ?, ?,  ?, ?, true)`,
          [
            p.slug, p.date, p.cover ?? null, p.video ?? null,
            p.title.az, p.title.ru, p.title.en, p.title.tr, p.title.ar,
            p.desc.az, p.desc.ru, p.desc.en, p.desc.tr, p.desc.ar,
            p.h1.az, p.h1.ru, p.h1.en, p.h1.tr, p.h1.ar,
            p.lead.az, p.lead.ru, p.lead.en, p.lead.tr, p.lead.ar,
            JSON.stringify(p.sections), idx,
          ],
        );
      }
      idx++;
    }
    console.log(`[MIGRATE] Blog seed ensured (${BLOG_POSTS.length})`);
  } catch (err: any) {
    console.error("[MIGRATE] Blog seed error:", err.message || err);
  }

  // ── 5c. faq_items (DB-backed FAQ CMS) ──
  await createTable("faq_items", `
    CREATE TABLE IF NOT EXISTS faq_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question_az VARCHAR(500), question_ru VARCHAR(500), question_en VARCHAR(500), question_tr VARCHAR(500), question_ar VARCHAR(500),
      answer_az TEXT, answer_ru TEXT, answer_en TEXT, answer_tr TEXT, answer_ar TEXT,
      sort_order INT DEFAULT 0, published BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  await createIndex("faq_items", "idx_faq_items_pub_sort", "published, sort_order");

  // Seed FAQ items from the content-in-code source (idempotent by question_az).
  // FAQ array is a private const in src/pages/FaqPage.tsx, copied verbatim here.
  try {
    const pool = getPool();
    const FAQ_SEED: { q: Record<string, string>; a: Record<string, string> }[] = [
      {
        q: { az: 'Xurcun nə satır?', ru: 'Что продаёт Xurcun?', en: 'What does Xurcun sell?', tr: 'Xurcun ne satıyor?', ar: 'ماذا تبيع Xurcun؟' },
        a: {
          az: 'Premium quru meyvə, qoz-fındıq, çərəz, ekzotik çaylar, şokolad, lokum, paxlava və əl işi hədiyyə qutuları.',
          ru: 'Премиальные сухофрукты, орехи, снеки, экзотические чаи, шоколад, лукум, пахлаву и подарочные наборы ручной работы.',
          en: 'Premium dried fruit, nuts, snacks, exotic teas, chocolate, Turkish delight, baklava and handcrafted gift boxes.',
          tr: 'Premium kuru meyve, çerez, atıştırmalık, egzotik çaylar, çikolata, lokum, baklava ve el yapımı hediye kutuları.',
          ar: 'فواكه مجففة فاخرة، مكسرات، وجبات خفيفة، شاي، شوكولاتة، حلقوم، بقلاوة وعلب هدايا مصنوعة يدويًا.',
        },
      },
      {
        q: { az: 'Xurcun nə vaxt yaranıb?', ru: 'Когда основан Xurcun?', en: 'When was Xurcun founded?', tr: 'Xurcun ne zaman kuruldu?', ar: 'متى تأسست Xurcun؟' },
        a: {
          az: 'Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən Bakıda təsis edilib.',
          ru: 'Xurcun основан в 2015 году Вугаром Магеррамовым в Баку.',
          en: 'Xurcun was founded in 2015 by Vugar Maharramov in Baku.',
          tr: 'Xurcun 2015 yılında Vugar Maharramov tarafından Bakü’de kuruldu.',
          ar: 'تأسست Xurcun عام 2015 على يد ووقار محرّموف في باكو.',
        },
      },
      {
        q: { az: 'Neçə mağazanız var?', ru: 'Сколько у вас магазинов?', en: 'How many stores do you have?', tr: 'Kaç mağazanız var?', ar: 'كم عدد متاجركم؟' },
        a: {
          az: 'Bakıda 11 mağazamız var — ticarət mərkəzləri, mərkəzi küçələr və Heydər Əliyev Hava Limanı daxil.',
          ru: 'У нас 11 магазинов в Баку — в торговых центрах, на центральных улицах и в аэропорту имени Гейдара Алиева.',
          en: 'We have 11 stores in Baku — including malls, central streets and Heydar Aliyev International Airport.',
          tr: 'Bakü’de 11 mağazamız var — alışveriş merkezleri, merkezi caddeler ve Haydar Aliyev Havalimanı dahil.',
          ar: 'لدينا 11 متجرًا في باكو — تشمل المراكز التجارية والشوارع الرئيسية ومطار حيدر علييف الدولي.',
        },
      },
      {
        q: { az: 'Məhsullar təbiidir, qlütensiz seçim var?', ru: 'Продукция натуральная, есть ли без глютена?', en: 'Are products natural, any gluten-free options?', tr: 'Ürünler doğal mı, glutensiz seçenek var mı?', ar: 'هل المنتجات طبيعية وهل هناك خيارات خالية من الغلوتين؟' },
        a: {
          az: 'Bəli, məhsullarımız təbii və konservantsızdır; qlütensiz seçimlər də mövcuddur.',
          ru: 'Да, наша продукция натуральная и без консервантов; есть и безглютеновые варианты.',
          en: 'Yes, our products are natural and preservative-free; gluten-free options are also available.',
          tr: 'Evet, ürünlerimiz doğal ve koruyucusuzdur; glutensiz seçenekler de mevcuttur.',
          ar: 'نعم، منتجاتنا طبيعية وخالية من المواد الحافظة، وتتوفر خيارات خالية من الغلوتين.',
        },
      },
      {
        q: { az: 'Necə sifariş verə bilərəm?', ru: 'Как я могу сделать заказ?', en: 'How can I order?', tr: 'Nasıl sipariş verebilirim?', ar: 'كيف يمكنني الطلب؟' },
        a: {
          az: 'Kataloqdan bəyəndiyiniz məhsulları seçin və WhatsApp ilə bizə göndərin, ya da +994 50 212 18 11 nömrəsinə zəng edin.',
          ru: 'Выберите товары в каталоге и отправьте нам список в WhatsApp, или позвоните по номеру +994 50 212 18 11.',
          en: 'Pick the products you like in the catalogue and send us the list on WhatsApp, or call +994 50 212 18 11.',
          tr: 'Katalogdan beğendiğiniz ürünleri seçin ve listeyi WhatsApp ile bize gönderin ya da +994 50 212 18 11’i arayın.',
          ar: 'اختر المنتجات من الكتالوج وأرسل القائمة عبر واتساب، أو اتصل بالرقم ‎+994 50 212 18 11.',
        },
      },
      {
        q: { az: 'Hədiyyə qutuları hazırlayırsınız?', ru: 'Делаете ли вы подарочные наборы?', en: 'Do you make gift boxes?', tr: 'Hediye kutuları hazırlıyor musunuz?', ar: 'هل تصنعون علب هدايا؟' },
        a: {
          az: 'Bəli, korporativ təqdimatlar, bayramlar və xüsusi anlar üçün əl işi premium hədiyyə qutularımız var.',
          ru: 'Да, у нас есть премиальные подарочные наборы ручной работы для корпоративных подарков, праздников и особых случаев.',
          en: 'Yes, we offer handcrafted premium gift boxes for corporate gifts, holidays and special occasions.',
          tr: 'Evet, kurumsal hediyeler, bayramlar ve özel anlar için el yapımı premium hediye kutularımız var.',
          ar: 'نعم، نقدّم علب هدايا فاخرة مصنوعة يدويًا للهدايا المؤسسية والأعياد والمناسبات الخاصة.',
        },
      },
    ];
    let fidx = 0;
    for (const f of FAQ_SEED) {
      const [r] = await pool.execute(`SELECT id FROM faq_items WHERE question_az = ? LIMIT 1`, [f.q.az]);
      if (!(r as any[]).length) {
        await pool.execute(
          `INSERT INTO faq_items
             (question_az, question_ru, question_en, question_tr, question_ar,
              answer_az, answer_ru, answer_en, answer_tr, answer_ar,
              sort_order, published)
           VALUES (?, ?, ?, ?, ?,  ?, ?, ?, ?, ?,  ?, true)`,
          [
            f.q.az, f.q.ru, f.q.en, f.q.tr, f.q.ar,
            f.a.az, f.a.ru, f.a.en, f.a.tr, f.a.ar,
            fidx,
          ],
        );
      }
      fidx++;
    }
    console.log(`[MIGRATE] FAQ seed ensured (${FAQ_SEED.length})`);
  } catch (err: any) {
    console.error("[MIGRATE] FAQ seed error:", err.message || err);
  }

  // ── 5d. homepage_text (DB-backed Homepage Text CMS) ──
  await createTable("homepage_text", `
    CREATE TABLE IF NOT EXISTS homepage_text (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(64) NOT NULL UNIQUE,
      value_az TEXT, value_ru TEXT, value_en TEXT, value_tr TEXT, value_ar TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);

  // Seed homepage text from the shared source (idempotent by key).
  try {
    const pool = getPool();
    const { HOMEPAGE_TEXT_DEFAULTS } = await import("../src/lib/homepageTextStore");
    for (const d of HOMEPAGE_TEXT_DEFAULTS) {
      const [r] = await pool.execute(`SELECT id FROM homepage_text WHERE \`key\` = ? LIMIT 1`, [d.key]);
      if (!(r as any[]).length) {
        await pool.execute(
          `INSERT INTO homepage_text
             (\`key\`, value_az, value_ru, value_en, value_tr, value_ar)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [d.key, d.az, d.ru, d.en, d.tr, d.ar],
        );
      }
    }
    console.log(`[MIGRATE] Homepage text seed ensured (${HOMEPAGE_TEXT_DEFAULTS.length})`);
  } catch (err: any) {
    console.error("[MIGRATE] Homepage text seed error:", err.message || err);
  }

  // ── 5e. page_text (DB-backed generic Page Text CMS) ──
  await createTable("page_text", `
    CREATE TABLE IF NOT EXISTS page_text (
      id INT AUTO_INCREMENT PRIMARY KEY,
      page VARCHAR(40) NOT NULL,
      \`key\` VARCHAR(80) NOT NULL,
      value_az TEXT, value_ru TEXT, value_en TEXT, value_tr TEXT, value_ar TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY page_text_page_key (page, \`key\`)
    )`);

  // Seed page text from the shared source (idempotent by page + key).
  try {
    const pool = getPool();
    const { PAGE_TEXT_SEED } = await import("../src/lib/pageTextStore");
    for (const d of PAGE_TEXT_SEED) {
      const [r] = await pool.execute(
        `SELECT id FROM page_text WHERE page = ? AND \`key\` = ? LIMIT 1`,
        [d.page, d.key],
      );
      if (!(r as any[]).length) {
        await pool.execute(
          `INSERT INTO page_text
             (page, \`key\`, value_az, value_ru, value_en, value_tr, value_ar)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [d.page, d.key, d.az, d.ru, d.en, d.tr, d.ar],
        );
      }
    }
    console.log(`[MIGRATE] Page text seed ensured (${PAGE_TEXT_SEED.length})`);
  } catch (err: any) {
    console.error("[MIGRATE] Page text seed error:", err.message || err);
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
  await addColumn("branches", "google_review_url", "VARCHAR(500)");
  await addColumn("branches", "tripadvisor_url", "VARCHAR(500)");
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

  // ── Orders + order items (admin order tracking) ──
  await createTable("orders", `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      status VARCHAR(20) NOT NULL DEFAULT 'new',
      source VARCHAR(20) DEFAULT 'manual',
      customer_name VARCHAR(200),
      customer_phone VARCHAR(50),
      note TEXT,
      total VARCHAR(50),
      lang VARCHAR(5) DEFAULT 'az',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
  await createIndex("orders", "idx_orders_status", "status");
  await createTable("order_items", `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      item_id INT,
      name VARCHAR(200) NOT NULL,
      qty INT NOT NULL DEFAULT 1,
      price VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
  await createIndex("order_items", "idx_order_items_order", "order_id");

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

// Catch-all error handler so a thrown handler never crashes the request.
app.onError((err: any, c: any) => {
  console.error("[server] Unhandled route error:", err?.stack || err);
  if (c.req.path.startsWith("/api")) {
    return c.json({ error: "Internal Server Error" }, 500);
  }
  return c.text("Something went wrong. Please try again shortly.", 500);
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  // Keep the process alive on stray errors instead of crashing the whole server.
  process.on("unhandledRejection", (reason) => {
    console.error("[server] Unhandled promise rejection:", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("[server] Uncaught exception:", err);
  });
  // Drain the DB pool cleanly on redeploy so Railway's connection cap isn't leaked.
  const shutdown = async (sig: string) => {
    console.log(`[server] ${sig} received — draining DB pool and exiting.`);
    try { await getPool().end(); } catch { /* pool already closed */ }
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
