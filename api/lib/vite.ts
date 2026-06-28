import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { eq, and, asc, inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { getDb } from "../queries/connection";
import { menuCategories, menuItems } from "../../db/schema";

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
  "/blog": {
    title: "Blog | Xurcun — hədiyyə, xonça, şirniyyat bələdçisi",
    desc: "Xurcun blog — toy xonçası, bayram hədiyyələri, premium qutular, şokolad, paxlava və lokum haqqında bələdçilər.",
    h1: "Xurcun Blog",
    intro: "Hədiyyə, toy xonçası, premium qutular, şokolad, paxlava və lokum haqqında bələdçilər.",
    crumb: "Blog",
  },
  "/blog/toy-xoncasi": {
    title: "Toy xonçası — premium hədiyyə xonçaları | Xurcun",
    desc: "Toy, nişan və hədiyyə xonçaları: necə hazırlanır, içində nə olur və Xurcun-dan premium xonça necə sifariş edilir. Bakıda 11 mağaza.",
    h1: "Toy xonçası — ənənə və zərafət bir arada",
    intro: "Toy və nişan üçün premium xonça: quru meyvə, qoz-fındıq, şokolad, lokum və paxlava ilə əl işi hazırlanır.",
    crumb: "Toy xonçası",
  },
  "/blog/bayram-hediyyeleri": {
    title: "Bayram hədiyyələri — Novruz, Ramazan, Yeni il | Xurcun",
    desc: "Bayramlar üçün premium hədiyyə ideyaları: quru meyvə, şokolad, lokum və paxlava qutuları. Xurcun-dan zövqlü bayram hədiyyələri, Bakı.",
    h1: "Bayram hədiyyələri — hər mərasim üçün zövqlü seçim",
    intro: "Novruz, Ramazan, Yeni il və doğum günü üçün premium quru meyvə, çərəz və şirniyyat qutuları.",
    crumb: "Bayram hədiyyələri",
  },
  "/blog/premium-hediyye-qutulari": {
    title: "Premium hədiyyəlik qutular | Xurcun — əl işi qutular",
    desc: "Əl işi premium hədiyyə qutuları — korporativ, bayram və şəxsi münasibətlər üçün. Quru meyvə, şokolad, lokum və paxlava ilə. Xurcun, Bakı.",
    h1: "Premium hədiyyəlik qutular",
    intro: "Əl işi premium hədiyyə dəstləri — korporativ təqdimatlar, bayramlar və xüsusi anlar üçün.",
    crumb: "Premium hədiyyəlik qutular",
  },
  "/blog/sokolad": {
    title: "Premium şokolad | Xurcun — süd və qara şokolad",
    desc: "Xurcun premium şokoladları — süd, qara və qarışıq çeşidlər. Hədiyyə üçün ideal şokolad qutuları. Bakıda 11 mağaza, WhatsApp ilə sifariş.",
    h1: "Premium şokolad seçimi",
    intro: "Keyfiyyətli kakao, zərif dad — gündəlik zövq və hədiyyə üçün premium şokolad çeşidi.",
    crumb: "Şokolad",
  },
  "/blog/paxlava": {
    title: "Paxlava | Xurcun — ənənəvi dad, premium keyfiyyət",
    desc: "Xurcun paxlavası — ənənəvi resept, seçmə qoz-fındıq və premium keyfiyyət. Bayram süfrələri və hədiyyə üçün. Bakıda 11 mağaza.",
    h1: "Paxlava — ənənəvi dad, premium keyfiyyət",
    intro: "Ənənəvi resept, seçmə qoz-fındıq və təbii tərkib — bayram süfrəsi və hədiyyə üçün paxlava.",
    crumb: "Paxlava",
  },
  "/blog/lokum": {
    title: "Lokum (rahat) | Xurcun — çeşidlər və hədiyyə",
    desc: "Xurcun lokumu — qoz, püstə və meyvəli çeşidlər. Hədiyyə üçün zərif lokum qutuları. Premium keyfiyyət, Bakıda 11 mağaza.",
    h1: "Lokum — zərif dad, rəngarəng çeşid",
    intro: "Qoz, püstə və meyvəli lokum çeşidi — zövq və hədiyyə üçün zərif təqdimat.",
    crumb: "Lokum",
  },
  "/blog/quru-meyve-faydalari": {
    title: "Quru meyvə və qoz-fındığın faydaları | Xurcun",
    desc: "Quru meyvə və qoz-fındıq niyə faydalıdır: vitaminlər, lif, enerji. Sağlam çərəz seçimi və gündəlik norma. Xurcun, Bakı.",
    h1: "Quru meyvə və qoz-fındığın faydaları",
    intro: "Quru meyvə və qoz-fındıq təbii enerji, vitamin və lif mənbəyidir — sağlam və dadlı çərəz seçimi.",
    crumb: "Quru meyvənin faydası",
  },
  "/blog/korporativ-hediyye": {
    title: "Korporativ hədiyyə bələdçisi | Xurcun — biznes hədiyyələri",
    desc: "Korporativ hədiyyələr: loqolu premium qutular, bayram dəstləri, çoxsaylı sifariş. Müştəri və əməkdaşlar üçün. Xurcun, Bakı, 11 mağaza.",
    h1: "Korporativ hədiyyə bələdçisi",
    intro: "Loqolu, fərdiləşdirilmiş premium korporativ hədiyyə qutuları — müştərilər, tərəfdaşlar və əməkdaşlar üçün.",
    crumb: "Korporativ hədiyyə",
  },
  "/privacy": { title: "Məxfilik Siyasəti | Xurcun", h1: "Məxfilik Siyasəti — Xurcun", crumb: "Məxfilik Siyasəti" },
  "/cookie-policy": { title: "Cookie Siyasəti | Xurcun", h1: "Cookie Siyasəti — Xurcun", crumb: "Cookie Siyasəti" },
};

const SR_ONLY =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Rewrite title + canonical + og + the sr-only SEO shell (h1/intro) for a deep route.
function injectRouteMeta(html: string, pathname: string, meta: RouteMeta): string {
  const canonical = SITE + pathname;
  const title = escapeHtml(meta.title);
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
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
      return `<li>${escapeHtml(nameOf(it))}${escapeHtml(pr)}</li>`;
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

// Build the per-route HTML for the SPA fallback. Unknown routes (no override and not
// /menu/<slug>) keep the homepage meta/shell — harmless, since they render the homepage.
async function buildRouteHtml(html: string, pathname: string): Promise<string> {
  const meta = ROUTE_META[pathname] ?? (pathname.startsWith("/menu/") ? ROUTE_META["/menu"] : null);
  if (!meta) return html;
  let out = injectRouteMeta(html, pathname, meta);
  out = injectHreflang(out, pathname);

  const extras: string[] = [breadcrumbJsonLd(pathname, meta)];
  if (pathname === "/faq") extras.push(FAQ_JSONLD);
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
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(await buildRouteHtml(content, pathname));
    } catch (err) {
      console.error("[static] Failed to serve index.html:", err);
      return c.text("Service temporarily unavailable. Please try again shortly.", 503);
    }
  });
}
