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
  "/gift-card": {
    title: "Hədiyyə Kartı | Xurcun — premium hədiyyə həlli",
    desc: "Xurcun Hədiyyə Kartı — istədiyiniz balansı yükləyin, sevdiklərinizə premium kart hədiyyə edin. Bakıda 11 mağazada keçərlidir.",
    h1: "Xurcun Hədiyyə Kartı",
    intro: "Fiziki hədiyyə əvəzinə istədiyiniz balansı yükləyin və sevdiklərinizə premium Xurcun kartı hədiyyə edin — bütün mağazalarımızda keçərlidir.",
    crumb: "Hədiyyə Kartı",
  },
  "/blog/bakida-hediyye-hara": {
    title: "Bakıda hədiyyə hara almalı | Xurcun",
    desc: "Bakıda yaxşı hədiyyə hara almalı? Premium hədiyyə qutuları, quru meyvə, çərəz və şirniyyat. Xurcun-un 11 mağazası və hava limanı filialı.",
    h1: "Bakıda hədiyyə hara almalı — sakinlər və qonaqlar üçün bələdçi",
    intro: "İstər doğum günü, istər toy, istərsə də Bakıdan aparılacaq bir xatirə olsun — yaxşı hədiyyə həm zövqlü görünməli, həm də səmimi olmalıdır. Xurcun premium qur…",
    crumb: "Bakıda hədiyyə",
  },
  "/blog/baku-suvenir-belecisi": {
    title: "Bakıdan nə aparmaq olar — suvenir bələdçisi | Xurcun",
    desc: "Bakıdan aparmaq üçün ən gözəl suvenirlər: Azərbaycan quru meyvəsi, qoz-fındıq, paxlava, lokum, çay və əl işi hədiyyə qutuları. Hava limanı mağazaları.",
    h1: "Bakıdan nə aparmaq olar — suvenir bələdçisi",
    intro: "Bakıdan vətənə dönərkən sevdiklərinizə həm dadlı, həm də unudulmaz bir töhfə aparmaq istəyirsiniz. Magnit və açarlıqlardan kənara çıxın: Azərbaycanın əsl ləz…",
    crumb: "Suvenir bələdçisi",
  },
  "/blog/azerbaycan-quru-meyve-belecisi": {
    title: "Quru meyvə və qoz-fındıq bələdçisi | Xurcun",
    desc: "Ərik, əncir, tut, qoz, fındıq, püstə, badam — Azərbaycan quru meyvə və qoz-fındıqlarını necə seçmək, dadmaq və hədiyyə etmək. Xurcun bələdçisi.",
    h1: "Azərbaycan quru meyvə və qoz-fındıq bələdçisi",
    intro: "Quru meyvə və qoz-fındıq Azərbaycan süfrəsinin əzəli bir parçasıdır — çayın yanında, bayram süfrəsində və ən zərif hədiyyələrdə. Bu bələdçidə əsas çeşidləri,…",
    crumb: "Quru meyvə bələdçisi",
  },
  "/blog/yeni-il-hediyyeleri": {
    title: "Yeni il hədiyyə ideyaları | Xurcun",
    desc: "Yeni il və qış bayramları üçün premium hədiyyə ideyaları: quru meyvə, qoz-fındıq, şokolad və lokum qutuları, korporativ hədiyyələr. Xurcun, Bakı.",
    h1: "Yeni il hədiyyə ideyaları — qış bayramlarına zövqlü hazırlıq",
    intro: "Yeni il yaxınlaşır və sevdiklərinizə nə bağışlamaq sualı yenidən gündəmə gəlir. Xurcun premium quru meyvə, qoz-fındıq, şokolad və lokumdan ibarət, qış bayram…",
    crumb: "Yeni il hədiyyələri",
  },
  "/blog/hediyye-qutusu-secimi": {
    title: "Hədiyyə qutusu necə seçilir | Xurcun",
    desc: "Hədiyyə qutusu seçim bələdçisi: münasibətə, büdcəyə və tərkibə görə düzgün qutu, fərdiləşdirmə və təqdimat məsləhətləri. Xurcun, Bakı.",
    h1: "Hədiyyə qutusu necə seçilir — addım-addım bələdçi",
    intro: "Doğru hədiyyə qutusu yalnız gözəl görünmür — alanın zövqünə, münasibətə və büdcənizə uyğun gəlir. Bu bələdçidə Xurcun-un premium quru meyvə, qoz-fındıq, şoko…",
    crumb: "Hədiyyə qutusu seçimi",
  },
  "/blog/aeroportdan-hediyye": {
    title: "Bakı aeroportundan hədiyyə — Xurcun",
    desc: "Bakı aeroportundan son dəqiqə hədiyyələri: əsl Azərbaycan quru meyvəsi, çərəz, şirniyyat və hədiyyə qutuları. Xurcun Terminal 1 və Duty Free.",
    h1: "Bakı aeroportundan hədiyyə — uçuşdan əvvəl son seçim",
    intro: "Heydər Əliyev Beynəlxalq Aeroportunda təyyarəyə minmədən əvvəl hələ də sevdiklərinizə hədiyyə tapmaq imkanınız var. Xurcun-un aeroport butikləri — Terminal 1…",
    crumb: "Aeroportdan hədiyyə",
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
  "/blog/bayram-korporativ-hediyye": {
    title: "Bayramlarda korporativ hədiyyələr — Azərbaycan bayram təqvimi | Xurcun",
    desc: "Yeni il, Novruz, 8 Mart, Ramazan və Qurban bayramlarında müştəri və tərəfdaşlarınızı Xurcun premium şokolad, çərəz, quru meyvə və lokum qutuları ilə sevindirin. Brendləmə, toplu sifariş, Bakıda çatdırılma.",
    h1: "Bayramlarda korporativ hədiyyələr — illik təqvim",
    intro: "Hansı bayramda hansı Xurcun qutusunun uyğun olduğu və korporativ sifarişin necə işlədiyi — illik hədiyyə təqvimi bələdçisi.",
    crumb: "Bayram korporativ hədiyyə",
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

// Build the per-route HTML for the SPA fallback. Unknown routes (no override and not
// /menu/<slug>) keep the homepage meta/shell — harmless, since they render the homepage.
async function buildRouteHtml(html: string, pathname: string): Promise<string> {
  let meta = ROUTE_META[pathname] ?? (pathname.startsWith("/menu/") ? ROUTE_META["/menu"] : pathname.startsWith("/catalog/") ? ROUTE_META["/catalog"] : null);
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
