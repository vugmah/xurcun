import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { eq, and, asc, inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { getDb } from "../queries/connection";
import { menuCategories, menuItems, blogPosts } from "../../db/schema";

type App = Hono<{ Bindings: HttpBindings }>;

const SITE = "https://xurcun.az";
const LANGS = ["az", "ru", "en", "tr", "ar"] as const;

// Per-route <head> overrides for SPA-fallback routes. The static index.html carries
// the homepage meta; without this, every deep route (/catalog, /menu, …) was served
// with the homepage <title> and canonical=/ — telling Google they duplicate the home
// page. Homepage itself ("/") is served by serveStatic, so it keeps its static meta.
type RouteMeta = { title: string; desc?: string; h1: string; intro?: string; crumb?: string };

const ROUTE_META: Record<string, RouteMeta> = {
  "/catalog": {
    title: "Kataloq | Xurcun — Quru meyvə, çərəz & hədiyyə",
    desc: "Xurcun kataloqu — quru meyvə, qoz-fındıq, çərəz, lokum, şokolad və hədiyyə qutuları. Bəyəndiyinizi seçin, WhatsApp ilə sifariş edin.",
    h1: "Xurcun Kataloqu — quru meyvə, çərəz, lokum və hədiyyə",
    intro: "Premium quru meyvə, qoz-fındıq, çərəz, lokum, şokolad və əl işi hədiyyə qutuları. Bəyəndiyinizi seçin, WhatsApp ilə sifariş edin.",
    crumb: "Kataloq",
  },
  "/menu": {
    title: "Menyu | Xurcun — Quru meyvə, çərəz və hədiyyə",
    desc: "Xurcun QR menyusu — quru meyvə, qoz-fındıq, çərəz, lokum, şirniyyat və hədiyyə çeşidləri. Telefondan baxın, WhatsApp ilə sifariş edin.",
    h1: "Xurcun Menyu — quru meyvə, çərəz və hədiyyə",
    intro: "Mağaza menyusu — quru meyvə, qoz-fındıq, çərəz, lokum və şirniyyat çeşidləri. WhatsApp ilə sifariş edin.",
    crumb: "Menyu",
  },
  "/gift-card": {
    title: "Hədiyyə Kartı | Xurcun — premium hədiyyə həlli",
    desc: "Xurcun Hədiyyə Kartı — istədiyiniz balansı yükləyin, sevdiklərinizə premium kart hədiyyə edin. Bakıda 11 mağazada keçərlidir.",
    h1: "Xurcun Hədiyyə Kartı",
    intro: "Fiziki hədiyyə əvəzinə istədiyiniz balansı yükləyin və sevdiklərinizə premium Xurcun kartı hədiyyə edin — bütün mağazalarımızda keçərlidir.",
    crumb: "Hədiyyə Kartı",
  },
  "/about": {
    title: "Haqqımızda | Xurcun — 2015-dən bəri premium butik",
    desc: "Xurcun — 2015-ci ildə Vüqar Məhərrəmov tərəfindən təsis edilmiş premium quru meyvə, qoz-fındıq, çay, şirniyyat və əl işi hədiyyə butiki. Bakıda 11 mağaza.",
    h1: "Xurcun haqqında",
    intro: "Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən təsis edilib — bu gün təbii quru meyvə, qoz-fındıq, ekzotik çaylar, şirniyyat və əl işi hədiyyə qutularının Bakıda 11 mağazalı butik şəbəkəsidir. Slogan: Fond of Quality.",
    crumb: "Haqqımızda",
  },
  "/faq": {
    title: "Tez-tez verilən suallar | Xurcun",
    desc: "Xurcun haqqında tez-tez verilən suallar — nə satırıq, neçə mağaza, çatdırılma, hədiyyə qutuları, halal və qlütensiz seçimlər, sifariş.",
    h1: "Tez-tez verilən suallar",
    intro: "Xurcun haqqında ən çox soruşulan suallar: məhsullar, mağazalar, hədiyyə qutuları, çatdırılma və sifariş.",
    crumb: "FAQ",
  },
  "/corporate": {
    title: "Korporativ hədiyyə sorğusu | Xurcun",
    desc: "Korporativ və topdan hədiyyə sorğusu — loqolu premium hədiyyə qutuları. Müştəri, tərəfdaş və əməkdaşlar üçün. Xurcun, Bakı.",
    h1: "Korporativ hədiyyə sorğusu",
    intro: "Müştəri, tərəfdaş və əməkdaşlarınız üçün loqolu, fərdiləşdirilmiş premium hədiyyə qutuları. Sorğunuzu göndərin — sizinlə əlaqə saxlayaq.",
    crumb: "Korporativ",
  },
  "/blog": {
    title: "Blog | Xurcun — hədiyyə, xonça, şirniyyat bələdçisi",
    desc: "Xurcun blog — toy xonçası, bayram hədiyyələri, premium qutular, şokolad, paxlava və lokum haqqında bələdçilər.",
    h1: "Xurcun Blog",
    intro: "Hədiyyə, toy xonçası, premium qutular, şokolad, paxlava və lokum haqqında bələdçilər.",
    crumb: "Blog",
  },
  "/privacy": { title: "Məxfilik Siyasəti | Xurcun", h1: "Məxfilik Siyasəti — Xurcun", crumb: "Məxfilik Siyasəti" },
  "/cookie-policy": { title: "Cookie Siyasəti | Xurcun", h1: "Cookie Siyasəti — Xurcun", crumb: "Cookie Siyasəti" },
};

const SR_ONLY =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Mirror the client slug (ProductDetailPage.slugify) so /catalog/<slug> matches.
function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Rewrite title + canonical + og + the sr-only SEO shell (h1/intro) for a deep route.
function injectRouteMeta(html: string, pathname: string, meta: RouteMeta): string {
  const canonical = SITE + pathname;
  const title = escapeHtml(meta.title);
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${pathname.startsWith("/catalog/") ? "product" : "website"}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  if (meta.desc) {
    const desc = escapeHtml(meta.desc);
    out = out
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
  }
  const shell = `<!--seo-shell--><div style="${SR_ONLY}"><h1>${escapeHtml(meta.h1)}</h1>${meta.intro ? `<p>${escapeHtml(meta.intro)}</p>` : ""}</div><!--/seo-shell-->`;
  out = out.replace(/<!--seo-shell-->[\s\S]*?<!--\/seo-shell-->/, shell);
  return out;
}

// Point hreflang alternates at the CURRENT path (not always the homepage).
function injectHreflang(html: string, pathname: string): string {
  const base = SITE + pathname;
  let out = html;
  for (const l of LANGS) {
    out = out.replace(
      new RegExp(`(<link rel="alternate" hreflang="${l}" href=")[^"]*(")`),
      `$1${base}?lang=${l}$2`,
    );
  }
  return out.replace(/(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/, `$1${base}$2`);
}

function breadcrumbJsonLd(pathname: string, meta: RouteMeta): string {
  const items: { "@type": string; position: number; name: string; item: string }[] = [
    { "@type": "ListItem", position: 1, name: "Ana səhifə", item: `${SITE}/` },
  ];
  if (meta.crumb) items.push({ "@type": "ListItem", position: 2, name: meta.crumb, item: SITE + pathname });
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  })}</script>`;
}

// Static FAQPage schema (AZ) so non-JS AI crawlers can quote the answers.
const FAQ_QA: { q: string; a: string }[] = [
  { q: "Xurcun nə satır?", a: "Premium quru meyvə, qoz-fındıq, çərəz, ekzotik çaylar, şokolad, lokum, paxlava və əl işi hədiyyə qutuları." },
  { q: "Xurcun nə vaxt yaranıb?", a: "Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən Bakıda təsis edilib." },
  { q: "Neçə mağazanız var?", a: "Bakıda 11 mağazamız var — ticarət mərkəzləri, mərkəzi küçələr və Heydər Əliyev Hava Limanı daxil." },
  { q: "Məhsullar təbiidir, qlütensiz seçim var?", a: "Bəli, məhsullarımız təbii və konservantsızdır; qlütensiz seçimlər də mövcuddur." },
  { q: "Necə sifariş verə bilərəm?", a: "Kataloqdan bəyəndiyiniz məhsulları seçin və WhatsApp ilə bizə göndərin, ya da +994 50 212 18 11 nömrəsinə zəng edin." },
  { q: "Hədiyyə qutuları hazırlayırsınız?", a: "Bəli, korporativ təqdimatlar, bayramlar və xüsusi anlar üçün əl işi premium hədiyyə qutularımız var." },
];
const FAQ_JSONLD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_QA.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
})}</script>`;

// HowTo schema for the Gift Card page ("how it works" 4 steps) — rich result + AI.
const HOWTO_GIFTCARD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Xurcun Hədiyyə Kartı necə işləyir",
  description: "Xurcun Hədiyyə Kartını seçin, istədiyiniz balansı yükləyin, hədiyyə edin və Bakıdakı mağazalarda istifadə edin.",
  step: [
    { "@type": "HowToStep", position: 1, name: "Kartı seçin" },
    { "@type": "HowToStep", position: 2, name: "Balans yükləyin" },
    { "@type": "HowToStep", position: 3, name: "Hədiyyə edin" },
    { "@type": "HowToStep", position: 4, name: "Mağazada istifadə edin" },
  ],
})}</script>`;

type MenuItemRow = typeof menuItems.$inferSelect;

// Server-render the catalog: real product list (for non-JS AI crawlers) + ItemList/Product JSON-LD.
async function catalogShell(): Promise<{ listHtml: string; jsonLd: string }> {
  const db = getDb();
  const cats = await db
    .select()
    .from(menuCategories)
    .where(and(eq(menuCategories.menuType, "catalog"), eq(menuCategories.isActive, true)))
    .orderBy(asc(menuCategories.sortOrder), asc(menuCategories.id));
  const catIds = cats.map((c) => c.id);
  let items: MenuItemRow[] = [];
  if (catIds.length) {
    items = await db
      .select()
      .from(menuItems)
      .where(and(inArray(menuItems.categoryId, catIds), eq(menuItems.isActive, true)))
      .orderBy(asc(menuItems.sortOrder), asc(menuItems.id));
  }
  const nameOf = (it: MenuItemRow) => it.nameAz || it.nameEn || it.nameRu || it.nameTr || "";
  const priceVisible = (it: MenuItemRow) => it.priceVisible !== false && !!it.price;
  const li = items
    .map((it) => {
      const pr = priceVisible(it) ? ` — ${it.price} ₼` : "";
      const slug = slugify(it.nameEn || it.nameAz || "") || String(it.id);
      return `<li><a href="/catalog/${slug}">${escapeHtml(nameOf(it))}</a>${escapeHtml(pr)}</li>`;
    })
    .join("");
  const listHtml = li ? `<ul>${li}</ul>` : "";
  const elements = items.map((it, i) => {
    const product: Record<string, unknown> = {
      "@type": "Product",
      name: nameOf(it),
      brand: { "@type": "Brand", name: "Xurcun" },
    };
    if (priceVisible(it)) {
      product.offers = {
        "@type": "Offer",
        price: String(it.price).replace(/[^0-9.]/g, ""),
        priceCurrency: "AZN",
        availability: "https://schema.org/InStock",
      };
    }
    return { "@type": "ListItem", position: i + 1, item: product };
  });
  const jsonLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Xurcun Kataloq",
    itemListElement: elements,
  })}</script>`;
  return { listHtml, jsonLd };
}

// Look up a single catalog product by its URL slug (slugified EN/AZ name, or numeric id)
// and build per-product meta + a Product JSON-LD <script>, so non-JS crawlers/AI get the
// real product (title, description, price offer) instead of the generic catalog meta.
async function productShell(slug: string): Promise<{ meta: RouteMeta; jsonLd: string } | null> {
  const db = getDb();
  const cats = await db
    .select()
    .from(menuCategories)
    .where(and(eq(menuCategories.menuType, "catalog"), eq(menuCategories.isActive, true)));
  const catIds = cats.map((c) => c.id);
  if (!catIds.length) return null;
  const items = await db
    .select()
    .from(menuItems)
    .where(and(inArray(menuItems.categoryId, catIds), eq(menuItems.isActive, true)));
  const it =
    items.find((i) => slugify(i.nameEn || i.nameAz || "") === slug) ||
    items.find((i) => String(i.id) === slug);
  if (!it) return null;
  const cat = cats.find((c) => c.id === it.categoryId);
  const name = it.nameAz || it.nameEn || it.nameRu || it.nameTr || "";
  const catName = cat ? cat.titleAz || cat.titleEn || "" : "";
  const desc = (it.descAz || it.descEn || `${name} — Xurcun premium ${catName}`.trim()).slice(0, 300);
  const url = `${SITE}/catalog/${slug}`;
  const img = it.imageUrl ? (it.imageUrl.startsWith("http") ? it.imageUrl : SITE + it.imageUrl) : "";
  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: desc,
    brand: { "@type": "Brand", name: "Xurcun" },
    url,
  };
  if (img) product.image = [img];
  if (catName) product.category = catName;
  if (it.priceVisible !== false && it.price) {
    product.offers = {
      "@type": "Offer",
      price: String(it.price).replace(/[^0-9.]/g, ""),
      priceCurrency: "AZN",
      availability: "https://schema.org/InStock",
      url,
    };
  }
  return {
    meta: {
      title: `${name} | Xurcun${catName ? ` — ${catName}` : ""}`,
      desc: desc.slice(0, 160),
      h1: name,
      intro: desc.slice(0, 200),
      crumb: name,
    },
    jsonLd: `<script type="application/ld+json">${JSON.stringify(product)}</script>`,
  };
}

// Look up a single published blog post by slug and build per-post meta + a BlogPosting
// JSON-LD <script>, so non-JS crawlers/AI get the real post (title, description, body)
// instead of the generic /blog listing meta. Returns null if not found.
async function blogPostShell(slug: string): Promise<{ meta: RouteMeta; jsonLd: string } | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);
  const post = rows[0];
  if (!post) return null;
  const title = post.titleAz || post.titleEn || "";
  const desc = (post.descAz || post.descEn || "").slice(0, 300);
  const h1 = post.h1Az || post.h1En || title;
  const lead = post.leadAz || post.leadEn || desc;
  const url = `${SITE}/blog/${slug}`;
  const img = post.cover ? (post.cover.startsWith("http") ? post.cover : SITE + post.cover) : "";
  const article: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: h1 || title,
    description: desc,
    url,
    mainEntityOfPage: url,
    publisher: { "@type": "Organization", name: "Xurcun" },
  };
  if (post.date) {
    article.datePublished = post.date;
    article.dateModified = post.date;
  }
  if (img) article.image = [img];
  return {
    meta: {
      title,
      desc: desc.slice(0, 160),
      h1: h1 || title,
      intro: lead.slice(0, 200),
      crumb: title,
    },
    jsonLd: `<script type="application/ld+json">${JSON.stringify(article)}</script>`,
  };
}

// Build the per-route HTML for the SPA fallback. Unknown routes (no override and not
// /menu/<slug>) keep the homepage meta/shell — harmless, since they render the homepage.
async function buildRouteHtml(html: string, pathname: string): Promise<string> {
  let meta = ROUTE_META[pathname] ?? (pathname.startsWith("/menu/") ? ROUTE_META["/menu"] : pathname.startsWith("/catalog/") ? ROUTE_META["/catalog"] : pathname.startsWith("/blog/") ? ROUTE_META["/blog"] : null);
  if (!meta) return html;

  // Deep product page (/catalog/<slug>): resolve the real product for per-product meta + schema.
  let product: Awaited<ReturnType<typeof productShell>> = null;
  if (pathname.startsWith("/catalog/")) {
    try {
      product = await productShell(decodeURIComponent(pathname.slice("/catalog/".length)));
    } catch (err) {
      console.error("[ssr] product shell failed (serving catalog meta):", err);
    }
    if (product) meta = product.meta;
  }

  // Deep blog post (/blog/<slug>): resolve the real post for per-post meta + schema.
  let blogPost: Awaited<ReturnType<typeof blogPostShell>> = null;
  if (pathname.startsWith("/blog/")) {
    try {
      blogPost = await blogPostShell(decodeURIComponent(pathname.slice("/blog/".length)));
    } catch (err) {
      console.error("[ssr] blog shell failed (serving blog meta):", err);
    }
    if (blogPost) meta = blogPost.meta;
  }

  let out = injectRouteMeta(html, pathname, meta);
  out = injectHreflang(out, pathname);

  const extras: string[] = [];
  if (product) {
    // Home > Kataloq > Product breadcrumb (3 levels) + the Product itself.
    extras.push(`<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana səhifə", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Kataloq", item: `${SITE}/catalog` },
        { "@type": "ListItem", position: 3, name: meta.crumb, item: SITE + pathname },
      ],
    })}</script>`);
    extras.push(product.jsonLd);
  } else if (blogPost) {
    // Home > Blog > Post breadcrumb (3 levels) + the BlogPosting itself.
    extras.push(`<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana səhifə", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
        { "@type": "ListItem", position: 3, name: meta.crumb, item: SITE + pathname },
      ],
    })}</script>`);
    extras.push(blogPost.jsonLd);
  } else {
    extras.push(breadcrumbJsonLd(pathname, meta));
  }
  if (pathname === "/faq") extras.push(FAQ_JSONLD);
  if (pathname === "/gift-card") extras.push(HOWTO_GIFTCARD);
  if (pathname === "/catalog") {
    try {
      const { listHtml, jsonLd } = await catalogShell();
      if (listHtml) out = out.replace("</div><!--/seo-shell-->", `${listHtml}</div><!--/seo-shell-->`);
      extras.push(jsonLd);
    } catch (err) {
      console.error("[ssr] catalog shell failed (serving plain shell):", err);
    }
  }
  out = out.replace("</head>", `${extras.join("\n")}\n</head>`);
  return out;
}

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  app.use("*", serveStatic({ root: "./dist/public" }));

  // SPA fallback. Serve index.html for any client route (BrowserRouter paths like
  // /catalog, /menu) so crawlers and deep-links get 200 — NOT gated on the Accept
  // header (that previously returned 404 to Googlebot → pages unindexable). Only real
  // missing assets (have a file extension) or /api/* paths get a 404. Per-route <head>
  // is injected so each deep route gets its own title + self-referential canonical.
  app.notFound(async (c) => {
    const pathname = new URL(c.req.url).pathname;
    const isAsset = /\.[a-zA-Z0-9]+$/.test(pathname); // .js .css .png .ico .xml ...
    if (pathname.startsWith("/api") || isAsset) {
      return c.json({ error: "Not Found" }, 404);
    }
    // Known SPA routes return 200; unknown paths still serve the SPA shell (so
    // the in-app 404 page renders) but with a real 404 status, so stale/old URLs
    // don't linger as soft-404s (200 + wrong content) in search.
    const KNOWN = new Set([
      "/", "/catalog", "/menu", "/blog", "/about", "/faq",
      "/corporate", "/gift-card", "/privacy", "/cookie-policy",
    ]);
    const isKnown =
      KNOWN.has(pathname) ||
      pathname.startsWith("/catalog/") ||
      pathname.startsWith("/menu/") ||
      pathname.startsWith("/blog/") ||
      pathname.startsWith("/admin");
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(await buildRouteHtml(content, pathname), isKnown ? 200 : 404);
    } catch (err) {
      console.error("[static] Failed to serve index.html:", err);
      return c.text("Service temporarily unavailable. Please try again shortly.", 503);
    }
  });
}
