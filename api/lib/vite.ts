import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { eq, and, asc, inArray } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { getDb } from "../queries/connection";
import { menuCategories, menuItems, blogPosts, faqItems } from "../../db/schema";

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

// Crawlers (and Google Ads' language check) read the served HTML before JS runs, so a
// ?lang=en|ru|tr|ar deep route must arrive in that language — not the AZ default. These
// mirror ROUTE_META for each supported non-AZ language; buildRouteHtml picks by ?lang=,
// falling back to AZ when a route/lang is missing.
const ROUTE_META_I18N: Record<string, Record<string, RouteMeta>> = {
  en: {
    "/catalog": { title: "Catalog | Xurcun — Dried Fruit, Nuts & Gifts", desc: "Xurcun catalog — dried fruit, nuts, sweets, Turkish delight, chocolate and gift boxes. Pick what you like and order via WhatsApp.", h1: "Xurcun Catalog — dried fruit, nuts, sweets & gifts", intro: "Premium dried fruit, nuts, sweets, Turkish delight, chocolate and handmade gift boxes. Pick what you like and order via WhatsApp.", crumb: "Catalog" },
    "/menu": { title: "Menu | Xurcun — Dried Fruit, Nuts & Gifts", desc: "Xurcun QR menu — dried fruit, nuts, sweets, Turkish delight and gift selections. Browse on your phone, order via WhatsApp.", h1: "Xurcun Menu — dried fruit, nuts & gifts", intro: "In-store menu — dried fruit, nuts, sweets and Turkish delight selections. Order via WhatsApp.", crumb: "Menu" },
    "/gift-card": { title: "Gift Card | Xurcun — a premium gift solution", desc: "Xurcun Gift Card — load any balance and gift a premium card to your loved ones. Valid at 11 stores across Baku.", h1: "Xurcun Gift Card", intro: "Instead of a physical gift, load any balance and give your loved ones a premium Xurcun card — valid at all our stores.", crumb: "Gift Card" },
    "/about": { title: "About | Xurcun — a premium boutique since 2015", desc: "Xurcun — a premium dried fruit, nuts, tea, sweets and handmade gift boutique founded in 2015 by Vugar Maharramov. 11 stores in Baku.", h1: "About Xurcun", intro: "Founded in 2015 by Vugar Maharramov, Xurcun is today a chain of 11 boutiques in Baku for natural dried fruit, nuts, exotic teas, sweets and handmade gift boxes. Slogan: Fond of Quality.", crumb: "About" },
    "/faq": { title: "Frequently asked questions | Xurcun", desc: "FAQ about Xurcun — what we sell, how many stores, delivery, gift boxes, halal and gluten-free options, ordering.", h1: "Frequently asked questions", intro: "The most common questions about Xurcun: products, stores, gift boxes, delivery and ordering.", crumb: "FAQ" },
    "/corporate": { title: "Corporate gift request | Xurcun", desc: "Corporate and wholesale gift request — logo-branded premium gift boxes for clients, partners and employees. Xurcun, Baku.", h1: "Corporate gift request", intro: "Logo-branded, personalized premium gift boxes for your clients, partners and employees. Send your request and we'll get in touch.", crumb: "Corporate" },
    "/blog": { title: "Blog | Xurcun — gift, tray & sweets guide", desc: "Xurcun blog — guides on wedding trays, holiday gifts, premium boxes, chocolate, baklava and Turkish delight.", h1: "Xurcun Blog", intro: "Guides on gifts, wedding trays, premium boxes, chocolate, baklava and Turkish delight.", crumb: "Blog" },
    "/privacy": { title: "Privacy Policy | Xurcun", h1: "Privacy Policy — Xurcun", crumb: "Privacy Policy" },
    "/cookie-policy": { title: "Cookie Policy | Xurcun", h1: "Cookie Policy — Xurcun", crumb: "Cookie Policy" },
  },
  ru: {
    "/catalog": { title: "Каталог | Xurcun — сухофрукты, орехи и подарки", desc: "Каталог Xurcun — сухофрукты, орехи, сладости, лукум, шоколад и подарочные наборы. Выберите понравившееся и закажите в WhatsApp.", h1: "Каталог Xurcun — сухофрукты, орехи, сладости и подарки", intro: "Премиальные сухофрукты, орехи, сладости, лукум, шоколад и подарочные наборы ручной работы. Выберите понравившееся и закажите в WhatsApp.", crumb: "Каталог" },
    "/menu": { title: "Меню | Xurcun — сухофрукты, орехи и подарки", desc: "QR-меню Xurcun — сухофрукты, орехи, сладости, лукум и подарочные наборы. Смотрите с телефона, заказывайте в WhatsApp.", h1: "Меню Xurcun — сухофрукты, орехи и подарки", intro: "Меню магазина — сухофрукты, орехи, сладости и лукум. Заказывайте в WhatsApp.", crumb: "Меню" },
    "/gift-card": { title: "Подарочная карта | Xurcun — премиальный подарок", desc: "Подарочная карта Xurcun — пополните на любую сумму и подарите близким премиальную карту. Действует в 11 магазинах Баку.", h1: "Подарочная карта Xurcun", intro: "Вместо физического подарка пополните карту на любую сумму и подарите близким премиальную карту Xurcun — действует во всех наших магазинах.", crumb: "Подарочная карта" },
    "/about": { title: "О нас | Xurcun — премиальный бутик с 2015 года", desc: "Xurcun — премиальный бутик сухофруктов, орехов, чая, сладостей и подарков ручной работы, основанный в 2015 году Вугаром Магеррамовым. 11 магазинов в Баку.", h1: "О Xurcun", intro: "Основанный в 2015 году Вугаром Магеррамовым, Xurcun сегодня — сеть из 11 бутиков в Баку с натуральными сухофруктами, орехами, экзотическими чаями, сладостями и подарочными наборами ручной работы. Слоган: Fond of Quality.", crumb: "О нас" },
    "/faq": { title: "Часто задаваемые вопросы | Xurcun", desc: "Частые вопросы о Xurcun — что мы продаём, сколько магазинов, доставка, подарочные наборы, халяльные и безглютеновые опции, заказ.", h1: "Часто задаваемые вопросы", intro: "Самые частые вопросы о Xurcun: товары, магазины, подарочные наборы, доставка и заказ.", crumb: "Вопросы" },
    "/corporate": { title: "Корпоративный подарок | Xurcun", desc: "Корпоративные и оптовые подарки — премиальные наборы с логотипом для клиентов, партнёров и сотрудников. Xurcun, Баку.", h1: "Корпоративный подарочный запрос", intro: "Премиальные подарочные наборы с логотипом для ваших клиентов, партнёров и сотрудников. Отправьте запрос — мы свяжемся с вами.", crumb: "Корпоративным" },
    "/blog": { title: "Блог | Xurcun — гид по подаркам и сладостям", desc: "Блог Xurcun — гиды по свадебным подносам, праздничным подаркам, премиальным наборам, шоколаду, пахлаве и лукуму.", h1: "Блог Xurcun", intro: "Гиды по подаркам, свадебным подносам, премиальным наборам, шоколаду, пахлаве и лукуму.", crumb: "Блог" },
    "/privacy": { title: "Политика конфиденциальности | Xurcun", h1: "Политика конфиденциальности — Xurcun", crumb: "Конфиденциальность" },
    "/cookie-policy": { title: "Политика Cookie | Xurcun", h1: "Политика Cookie — Xurcun", crumb: "Cookie" },
  },
  tr: {
    "/catalog": { title: "Katalog | Xurcun — Kuru Meyve, Kuruyemiş & Hediye", desc: "Xurcun kataloğu — kuru meyve, kuruyemiş, tatlı, lokum, çikolata ve hediye kutuları. Beğendiğinizi seçin, WhatsApp ile sipariş verin.", h1: "Xurcun Kataloğu — kuru meyve, kuruyemiş, tatlı ve hediye", intro: "Premium kuru meyve, kuruyemiş, tatlı, lokum, çikolata ve el yapımı hediye kutuları. Beğendiğinizi seçin, WhatsApp ile sipariş verin.", crumb: "Katalog" },
    "/menu": { title: "Menü | Xurcun — Kuru Meyve, Kuruyemiş & Hediye", desc: "Xurcun QR menüsü — kuru meyve, kuruyemiş, tatlı, lokum ve hediye çeşitleri. Telefondan bakın, WhatsApp ile sipariş verin.", h1: "Xurcun Menü — kuru meyve, kuruyemiş ve hediye", intro: "Mağaza menüsü — kuru meyve, kuruyemiş, tatlı ve lokum çeşitleri. WhatsApp ile sipariş verin.", crumb: "Menü" },
    "/gift-card": { title: "Hediye Kartı | Xurcun — premium hediye çözümü", desc: "Xurcun Hediye Kartı — istediğiniz bakiyeyi yükleyin, sevdiklerinize premium bir kart hediye edin. Bakü'deki 11 mağazada geçerli.", h1: "Xurcun Hediye Kartı", intro: "Fiziksel hediye yerine istediğiniz bakiyeyi yükleyin ve sevdiklerinize premium Xurcun kartı hediye edin — tüm mağazalarımızda geçerli.", crumb: "Hediye Kartı" },
    "/about": { title: "Hakkımızda | Xurcun — 2015'ten beri premium butik", desc: "Xurcun — 2015 yılında Vügar Meherremov tarafından kurulan premium kuru meyve, kuruyemiş, çay, tatlı ve el yapımı hediye butiği. Bakü'de 11 mağaza.", h1: "Xurcun hakkında", intro: "2015 yılında Vügar Meherremov tarafından kurulan Xurcun, bugün Bakü'de doğal kuru meyve, kuruyemiş, egzotik çaylar, tatlılar ve el yapımı hediye kutularının 11 mağazalı butik zinciridir. Slogan: Fond of Quality.", crumb: "Hakkımızda" },
    "/faq": { title: "Sıkça sorulan sorular | Xurcun", desc: "Xurcun hakkında SSS — ne satıyoruz, kaç mağaza, teslimat, hediye kutuları, helal ve glutensiz seçenekler, sipariş.", h1: "Sıkça sorulan sorular", intro: "Xurcun hakkında en sık sorulan sorular: ürünler, mağazalar, hediye kutuları, teslimat ve sipariş.", crumb: "SSS" },
    "/corporate": { title: "Kurumsal hediye talebi | Xurcun", desc: "Kurumsal ve toptan hediye talebi — müşteriler, iş ortakları ve çalışanlar için logolu premium hediye kutuları. Xurcun, Bakü.", h1: "Kurumsal hediye talebi", intro: "Müşterileriniz, iş ortaklarınız ve çalışanlarınız için logolu, kişiselleştirilmiş premium hediye kutuları. Talebinizi gönderin, size ulaşalım.", crumb: "Kurumsal" },
    "/blog": { title: "Blog | Xurcun — hediye, tepsi ve tatlı rehberi", desc: "Xurcun blog — düğün tepsisi, bayram hediyeleri, premium kutular, çikolata, baklava ve lokum rehberleri.", h1: "Xurcun Blog", intro: "Hediye, düğün tepsisi, premium kutular, çikolata, baklava ve lokum rehberleri.", crumb: "Blog" },
    "/privacy": { title: "Gizlilik Politikası | Xurcun", h1: "Gizlilik Politikası — Xurcun", crumb: "Gizlilik" },
    "/cookie-policy": { title: "Çerez Politikası | Xurcun", h1: "Çerez Politikası — Xurcun", crumb: "Çerez" },
  },
  ar: {
    "/catalog": { title: "الكتالوج | Xurcun — فواكه مجففة ومكسرات وهدايا", desc: "كتالوج Xurcun — فواكه مجففة، مكسرات، حلويات، راحة، شوكولاتة وعلب هدايا. اختر ما يعجبك واطلب عبر واتساب.", h1: "كتالوج Xurcun — فواكه مجففة ومكسرات وحلويات وهدايا", intro: "فواكه مجففة ومكسرات وحلويات وراحة وشوكولاتة وعلب هدايا يدوية فاخرة. اختر ما يعجبك واطلب عبر واتساب.", crumb: "الكتالوج" },
    "/menu": { title: "القائمة | Xurcun — فواكه مجففة ومكسرات وهدايا", desc: "قائمة Xurcun عبر رمز QR — فواكه مجففة، مكسرات، حلويات، راحة وتشكيلة هدايا. تصفّح من هاتفك واطلب عبر واتساب.", h1: "قائمة Xurcun — فواكه مجففة ومكسرات وهدايا", intro: "قائمة المتجر — فواكه مجففة، مكسرات، حلويات وراحة. اطلب عبر واتساب.", crumb: "القائمة" },
    "/gift-card": { title: "بطاقة هدية | Xurcun — حل هدية فاخر", desc: "بطاقة هدية Xurcun — اشحن أي رصيد وأهدِ أحبّاءك بطاقة فاخرة. صالحة في 11 متجرًا في باكو.", h1: "بطاقة هدية Xurcun", intro: "بدلاً من هدية مادية، اشحن أي رصيد وأهدِ أحبّاءك بطاقة Xurcun الفاخرة — صالحة في جميع متاجرنا.", crumb: "بطاقة هدية" },
    "/about": { title: "من نحن | Xurcun — بوتيك فاخر منذ 2015", desc: "Xurcun — بوتيك فاخر للفواكه المجففة والمكسرات والشاي والحلويات وعلب الهدايا اليدوية، تأسس عام 2015 على يد وقار محرّموف. 11 متجرًا في باكو.", h1: "عن Xurcun", intro: "تأسّس Xurcun عام 2015 على يد وقار محرّموف، وهو اليوم سلسلة من 11 بوتيكًا في باكو للفواكه المجففة الطبيعية والمكسرات والشاي والحلويات وعلب الهدايا اليدوية. الشعار: Fond of Quality.", crumb: "من نحن" },
    "/faq": { title: "الأسئلة الشائعة | Xurcun", desc: "الأسئلة الشائعة عن Xurcun — ماذا نبيع، عدد المتاجر، التوصيل، علب الهدايا، خيارات حلال وخالية من الغلوتين، الطلب.", h1: "الأسئلة الشائعة", intro: "أكثر الأسئلة شيوعًا عن Xurcun: المنتجات، المتاجر، علب الهدايا، التوصيل والطلب.", crumb: "الأسئلة" },
    "/corporate": { title: "طلب هدايا للشركات | Xurcun", desc: "طلب هدايا للشركات والجملة — علب هدايا فاخرة تحمل شعارك للعملاء والشركاء والموظفين. Xurcun، باكو.", h1: "طلب هدايا للشركات", intro: "علب هدايا فاخرة مخصّصة تحمل شعارك لعملائك وشركائك وموظفيك. أرسل طلبك وسنتواصل معك.", crumb: "الشركات" },
    "/blog": { title: "المدونة | Xurcun — دليل الهدايا والحلويات", desc: "مدونة Xurcun — أدلة حول صواني الأعراس، هدايا الأعياد، العلب الفاخرة، الشوكولاتة، البقلاوة والراحة.", h1: "مدونة Xurcun", intro: "أدلة حول الهدايا وصواني الأعراس والعلب الفاخرة والشوكولاتة والبقلاوة والراحة.", crumb: "المدونة" },
    "/privacy": { title: "سياسة الخصوصية | Xurcun", h1: "سياسة الخصوصية — Xurcun", crumb: "الخصوصية" },
    "/cookie-policy": { title: "سياسة ملفات تعريف الارتباط | Xurcun", h1: "سياسة ملفات تعريف الارتباط — Xurcun", crumb: "ملفات الارتباط" },
  },
};

// RTL languages need dir="rtl" on <html>; others just get the lang attribute.
const HTML_DIR: Record<string, string> = { ar: "rtl" };

// Localized "Home" label for the breadcrumb JSON-LD root item.
const HOME_LABEL: Record<string, string> = { az: "Ana səhifə", en: "Home", ru: "Главная", tr: "Ana Sayfa", ar: "الرئيسية" };

// Localized 2nd-level breadcrumb labels for deep product/blog pages.
const SECTION_CRUMB: Record<string, { catalog: string; blog: string }> = {
  az: { catalog: "Kataloq", blog: "Blog" },
  en: { catalog: "Catalog", blog: "Blog" },
  ru: { catalog: "Каталог", blog: "Блог" },
  tr: { catalog: "Katalog", blog: "Blog" },
  ar: { catalog: "الكتالوج", blog: "المدونة" },
};

// Pick the route meta for a path + language: translated when available, else AZ.
function getRouteMeta(pathname: string, lang: string): RouteMeta | null {
  const key = ROUTE_META[pathname]
    ? pathname
    : pathname.startsWith("/menu/")
      ? "/menu"
      : pathname.startsWith("/catalog/")
        ? "/catalog"
        : pathname.startsWith("/blog/")
          ? "/blog"
          : null;
  if (!key) return null;
  if (lang !== "az" && ROUTE_META_I18N[lang]?.[key]) return ROUTE_META_I18N[lang][key];
  return ROUTE_META[key] ?? null;
}

// Set <html lang>(+dir for RTL) to the served language so crawlers detect it correctly.
function applyHtmlLang(html: string, lang: string): string {
  const dir = HTML_DIR[lang];
  return html.replace(/<html lang="[^"]*"[^>]*>/, `<html lang="${lang}"${dir ? ` dir="${dir}"` : ""}>`);
}

const SR_ONLY =
  "position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Mirror the client slug (ProductDetailPage.slugify) so /catalog/<slug> matches.
function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// OpenGraph locale per language (matches index.html's static og:locale set).
const OG_LOCALE: Record<string, string> = { az: "az_AZ", en: "en_US", ru: "ru_RU", tr: "tr_TR", ar: "ar_AE" };

// Rewrite title + canonical + og + <html lang> + the sr-only SEO shell (h1/intro) for a
// deep route. For non-AZ langs the canonical/og:url become self-referential ?lang= URLs.
function injectRouteMeta(html: string, pathname: string, meta: RouteMeta, lang: string): string {
  const canonical = SITE + pathname + (lang !== "az" ? `?lang=${lang}` : "");
  const title = escapeHtml(meta.title);
  let out = applyHtmlLang(html, lang)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${pathname.startsWith("/catalog/") ? "product" : "website"}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${OG_LOCALE[lang] ?? "az_AZ"}$2`)
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

// Point hreflang alternates at the CURRENT path (not always the homepage). AZ is the
// clean canonical URL; other langs use ?lang=; x-default is the clean URL — matching the
// canonical scheme and sitemap.xml.
function injectHreflang(html: string, pathname: string): string {
  const base = SITE + pathname;
  let out = html;
  for (const l of LANGS) {
    out = out.replace(
      new RegExp(`(<link rel="alternate" hreflang="${l}" href=")[^"]*(")`),
      `$1${l === "az" ? base : `${base}?lang=${l}`}$2`,
    );
  }
  return out.replace(/(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/, `$1${base}$2`);
}

// Per-language homepage <head>. The homepage ("/") is served by serveStatic as the
// static AZ index.html, so a crawler hitting xurcun.az/?lang=en (e.g. a Google Ads
// landing-page language check) would otherwise see Azerbaijani — an unsupported ad
// language — and disapprove the ad. Rewriting <html lang>/title/description/OG for the
// requested language makes the served page match ?lang= before any JS runs.
type HomeMeta = { htmlLang: string; dir?: string; ogLocale: string; title: string; desc: string };
const HOME_I18N: Record<string, HomeMeta> = {
  en: {
    htmlLang: "en",
    ogLocale: "en_US",
    title: "Xurcun | Premium Dried Fruit, Nuts & Gifts — Baku",
    desc: "Xurcun — Baku's premium boutique for dried fruit, nuts, sweets, chocolate, Turkish delight, baklava and handmade gift boxes. 11 stores across Baku.",
  },
  ru: {
    htmlLang: "ru",
    ogLocale: "ru_RU",
    title: "Xurcun | Премиум сухофрукты, орехи и подарки — Баку",
    desc: "Xurcun — премиальный бутик сухофруктов, орехов, сладостей, шоколада, лукума, пахлавы и подарочных наборов ручной работы. 11 магазинов в Баку.",
  },
  tr: {
    htmlLang: "tr",
    ogLocale: "tr_TR",
    title: "Xurcun | Premium Kuru Meyve, Kuruyemiş & Hediye — Bakü",
    desc: "Xurcun — Bakü'nün premium kuru meyve, kuruyemiş, tatlı, çikolata, lokum, baklava ve el yapımı hediye kutuları butiği. Bakü'de 11 mağaza.",
  },
  ar: {
    htmlLang: "ar",
    dir: "rtl",
    ogLocale: "ar_AE",
    title: "Xurcun | فواكه مجففة ومكسرات وهدايا فاخرة — باكو",
    desc: "Xurcun — بوتيك فاخر في باكو للفواكه المجففة والمكسرات والحلويات والشوكولاتة والراحة والبقلاوة وعلب الهدايا اليدوية. 11 متجرًا في باكو.",
  },
};

// Rewrite the homepage <head> for a supported ?lang= (en/ru/tr/ar). AZ is the static
// default and never passes through here. Only touches language signals — html lang/dir,
// title, description, OG/Twitter title+description, og:locale, and self-canonical.
function injectHomeLang(html: string, lang: string): string {
  const t = HOME_I18N[lang];
  if (!t) return html;
  const title = escapeHtml(t.title);
  const desc = escapeHtml(t.desc);
  const canonical = `${SITE}/?lang=${lang}`;
  return html
    .replace(/<html lang="[^"]*"[^>]*>/, `<html lang="${t.htmlLang}"${t.dir ? ` dir="${t.dir}"` : ""}>`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
    .replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${t.ogLocale}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`)
    // Organization JSON-LD description (raw string, not HTML-escaped — it's JSON).
    .replace(
      "Azərbaycanın premium quru meyvə, qoz-fındıq, çərəz, şokolad, lokum, paxlava və əl işi hədiyyə qutuları butiki. 2015-dən bəri.",
      t.desc,
    );
}

function breadcrumbJsonLd(pathname: string, meta: RouteMeta, lang: string): string {
  const q = lang !== "az" ? `?lang=${lang}` : "";
  const items: { "@type": string; position: number; name: string; item: string }[] = [
    { "@type": "ListItem", position: 1, name: HOME_LABEL[lang] ?? HOME_LABEL.az, item: `${SITE}/${q}` },
  ];
  if (meta.crumb) items.push({ "@type": "ListItem", position: 2, name: meta.crumb, item: SITE + pathname + q });
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  })}</script>`;
}

// Static FAQPage schema so non-JS AI crawlers can quote the answers. AZ is the default;
// EN is used for every non-AZ language so a localized page never carries AZ schema (this
// is only the fallback — the live path reads the DB per-language via faqShell).
const FAQ_QA: { q: string; a: string }[] = [
  { q: "Xurcun nə satır?", a: "Premium quru meyvə, qoz-fındıq, çərəz, ekzotik çaylar, şokolad, lokum, paxlava və əl işi hədiyyə qutuları." },
  { q: "Xurcun nə vaxt yaranıb?", a: "Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən Bakıda təsis edilib." },
  { q: "Neçə mağazanız var?", a: "Bakıda 11 mağazamız var — ticarət mərkəzləri, mərkəzi küçələr və Heydər Əliyev Hava Limanı daxil." },
  { q: "Məhsullar təbiidir, qlütensiz seçim var?", a: "Bəli, məhsullarımız təbii və konservantsızdır; qlütensiz seçimlər də mövcuddur." },
  { q: "Necə sifariş verə bilərəm?", a: "Kataloqdan bəyəndiyiniz məhsulları seçin və WhatsApp ilə bizə göndərin, ya da +994 50 212 18 11 nömrəsinə zəng edin." },
  { q: "Hədiyyə qutuları hazırlayırsınız?", a: "Bəli, korporativ təqdimatlar, bayramlar və xüsusi anlar üçün əl işi premium hədiyyə qutularımız var." },
];
const FAQ_QA_EN: { q: string; a: string }[] = [
  { q: "What does Xurcun sell?", a: "Premium dried fruit, nuts, snacks, exotic teas, chocolate, Turkish delight, baklava and handmade gift boxes." },
  { q: "When was Xurcun founded?", a: "Xurcun was founded in Baku in 2015 by Vugar Maharramov." },
  { q: "How many stores do you have?", a: "We have 11 stores in Baku — including malls, central streets and Heydar Aliyev International Airport." },
  { q: "Are the products natural, are there gluten-free options?", a: "Yes, our products are natural and preservative-free; gluten-free options are also available." },
  { q: "How can I order?", a: "Pick the products you like from the catalog and send them to us on WhatsApp, or call +994 50 212 18 11." },
  { q: "Do you make gift boxes?", a: "Yes, we make handmade premium gift boxes for corporate gifting, holidays and special occasions." },
];
function faqFallbackJsonLd(lang: string): string {
  const qa = lang === "az" ? FAQ_QA : FAQ_QA_EN;
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  })}</script>`;
}

// HowTo schema for the Gift Card page ("how it works" 4 steps) — rich result + AI, per language.
const HOWTO_I18N: Record<string, { name: string; description: string; steps: [string, string, string, string] }> = {
  az: { name: "Xurcun Hədiyyə Kartı necə işləyir", description: "Xurcun Hədiyyə Kartını seçin, istədiyiniz balansı yükləyin, hədiyyə edin və Bakıdakı mağazalarda istifadə edin.", steps: ["Kartı seçin", "Balans yükləyin", "Hədiyyə edin", "Mağazada istifadə edin"] },
  en: { name: "How the Xurcun Gift Card works", description: "Choose a Xurcun Gift Card, load any balance, gift it, and use it at our stores in Baku.", steps: ["Choose the card", "Load a balance", "Give it as a gift", "Use it in store"] },
  ru: { name: "Как работает подарочная карта Xurcun", description: "Выберите подарочную карту Xurcun, пополните на любую сумму, подарите и используйте в наших магазинах в Баку.", steps: ["Выберите карту", "Пополните баланс", "Подарите", "Используйте в магазине"] },
  tr: { name: "Xurcun Hediye Kartı nasıl çalışır", description: "Bir Xurcun Hediye Kartı seçin, istediğiniz bakiyeyi yükleyin, hediye edin ve Bakü'deki mağazalarımızda kullanın.", steps: ["Kartı seçin", "Bakiye yükleyin", "Hediye edin", "Mağazada kullanın"] },
  ar: { name: "كيف تعمل بطاقة هدية Xurcun", description: "اختر بطاقة هدية Xurcun، اشحن أي رصيد، أهدها، واستخدمها في متاجرنا في باكو.", steps: ["اختر البطاقة", "اشحن رصيدًا", "قدّمها هدية", "استخدمها في المتجر"] },
};
function howtoGiftCardJsonLd(lang: string): string {
  const t = HOWTO_I18N[lang] ?? HOWTO_I18N.az;
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: t.name,
    description: t.description,
    step: t.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s })),
  })}</script>`;
}

// Localized ItemList name for the /catalog schema.
const CATALOG_LIST_NAME: Record<string, string> = { az: "Xurcun Kataloq", en: "Xurcun Catalog", ru: "Каталог Xurcun", tr: "Xurcun Katalog", ar: "كتالوج Xurcun" };

type MenuItemRow = typeof menuItems.$inferSelect;

// Server-render the catalog: real product list (for non-JS AI crawlers) + ItemList/Product JSON-LD.
async function catalogShell(lang: string): Promise<{ listHtml: string; jsonLd: string }> {
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
  const nameOf = (it: MenuItemRow) => {
    const byLang: Record<string, string | null | undefined> = { az: it.nameAz, en: it.nameEn, ru: it.nameRu, tr: it.nameTr };
    return byLang[lang] || it.nameEn || it.nameAz || it.nameRu || it.nameTr || "";
  };
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
    name: CATALOG_LIST_NAME[lang] ?? CATALOG_LIST_NAME.az,
    itemListElement: elements,
  })}</script>`;
  return { listHtml, jsonLd };
}

// Look up a single catalog product by its URL slug (slugified EN/AZ name, or numeric id)
// and build per-product meta + a Product JSON-LD <script>, so non-JS crawlers/AI get the
// real product (title, description, price offer) instead of the generic catalog meta.
async function productShell(slug: string, lang: string): Promise<{ meta: RouteMeta; jsonLd: string } | null> {
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
  // Prefer the requested language's field; for non-AZ fall back to EN (a supported ad
  // language) before AZ, so a ?lang= product page isn't detected as Azerbaijani.
  const byLang: Record<string, string | null | undefined> = { az: it.nameAz, en: it.nameEn, ru: it.nameRu, tr: it.nameTr };
  const name = byLang[lang] || it.nameEn || it.nameAz || it.nameRu || it.nameTr || "";
  const catName = cat ? (lang === "az" ? cat.titleAz || cat.titleEn : cat.titleEn || cat.titleAz) || "" : "";
  const desc = ((lang === "az" ? it.descAz || it.descEn : it.descEn || it.descAz) || `${name} — Xurcun premium ${catName}`.trim()).slice(0, 300);
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
async function blogPostShell(slug: string, lang: string): Promise<{ meta: RouteMeta; jsonLd: string } | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1);
  const post = rows[0];
  if (!post) return null;
  // Blog rows only carry AZ + EN; for non-AZ langs prefer EN so the page isn't AZ.
  const title = (lang === "az" ? post.titleAz || post.titleEn : post.titleEn || post.titleAz) || "";
  const desc = ((lang === "az" ? post.descAz || post.descEn : post.descEn || post.descAz) || "").slice(0, 300);
  const h1 = (lang === "az" ? post.h1Az || post.h1En : post.h1En || post.h1Az) || title;
  const lead = (lang === "az" ? post.leadAz || post.leadEn : post.leadEn || post.leadAz) || desc;
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

// Build the FAQPage JSON-LD from published faq_items in the requested language, so non-JS
// crawlers/AI get the live DB answers. For non-AZ langs, fall back to EN (then AZ) so the
// schema isn't Azerbaijani. Returns null on empty/failure → caller falls back to faqFallbackJsonLd.
async function faqShell(lang: string): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(faqItems)
    .where(eq(faqItems.published, true))
    .orderBy(asc(faqItems.sortOrder), asc(faqItems.id));
  if (!rows.length) return null;
  const q2 = (r: typeof rows[number]): string => {
    const by: Record<string, string | null | undefined> = { az: r.questionAz, en: r.questionEn, ru: r.questionRu, tr: r.questionTr };
    return (lang === "az" ? r.questionAz : by[lang] || r.questionEn || r.questionAz) || "";
  };
  const a2 = (r: typeof rows[number]): string => {
    const by: Record<string, string | null | undefined> = { az: r.answerAz, en: r.answerEn, ru: r.answerRu, tr: r.answerTr, ar: r.answerAr };
    return (lang === "az" ? r.answerAz : by[lang] || r.answerEn || r.answerAz) || "";
  };
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: rows.map((q) => ({
      "@type": "Question",
      name: q2(q),
      acceptedAnswer: { "@type": "Answer", text: a2(q) },
    })),
  })}</script>`;
}

// Build the per-route HTML for the SPA fallback. Unknown routes (no override and not
// /menu/<slug>) keep the homepage meta/shell — harmless, since they render the homepage.
async function buildRouteHtml(html: string, pathname: string, lang: string): Promise<string> {
  let meta = getRouteMeta(pathname, lang);
  // Unknown route: still set <html lang> for non-AZ so it isn't detected as Azerbaijani.
  if (!meta) return lang !== "az" ? applyHtmlLang(html, lang) : html;

  const q = lang !== "az" ? `?lang=${lang}` : "";
  const section = SECTION_CRUMB[lang] ?? SECTION_CRUMB.az;
  const homeItem = { "@type": "ListItem", position: 1, name: HOME_LABEL[lang] ?? HOME_LABEL.az, item: `${SITE}/${q}` };

  // Deep product page (/catalog/<slug>): resolve the real product for per-product meta + schema.
  let product: Awaited<ReturnType<typeof productShell>> = null;
  if (pathname.startsWith("/catalog/")) {
    try {
      product = await productShell(decodeURIComponent(pathname.slice("/catalog/".length)), lang);
    } catch (err) {
      console.error("[ssr] product shell failed (serving catalog meta):", err);
    }
    if (product) meta = product.meta;
  }

  // Deep blog post (/blog/<slug>): resolve the real post for per-post meta + schema.
  let blogPost: Awaited<ReturnType<typeof blogPostShell>> = null;
  if (pathname.startsWith("/blog/")) {
    try {
      blogPost = await blogPostShell(decodeURIComponent(pathname.slice("/blog/".length)), lang);
    } catch (err) {
      console.error("[ssr] blog shell failed (serving blog meta):", err);
    }
    if (blogPost) meta = blogPost.meta;
  }

  let out = injectRouteMeta(html, pathname, meta, lang);
  out = injectHreflang(out, pathname);

  const extras: string[] = [];
  if (product) {
    // Home > Catalog > Product breadcrumb (3 levels) + the Product itself.
    extras.push(`<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        homeItem,
        { "@type": "ListItem", position: 2, name: section.catalog, item: `${SITE}/catalog${q}` },
        { "@type": "ListItem", position: 3, name: meta.crumb, item: SITE + pathname + q },
      ],
    })}</script>`);
    extras.push(product.jsonLd);
  } else if (blogPost) {
    // Home > Blog > Post breadcrumb (3 levels) + the BlogPosting itself.
    extras.push(`<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        homeItem,
        { "@type": "ListItem", position: 2, name: section.blog, item: `${SITE}/blog${q}` },
        { "@type": "ListItem", position: 3, name: meta.crumb, item: SITE + pathname + q },
      ],
    })}</script>`);
    extras.push(blogPost.jsonLd);
  } else {
    extras.push(breadcrumbJsonLd(pathname, meta, lang));
  }
  if (pathname === "/faq") {
    let faqLd: string | null = null;
    try {
      faqLd = await faqShell(lang);
    } catch (err) {
      console.error("[ssr] faq shell failed (serving static FAQ schema):", err);
    }
    extras.push(faqLd ?? faqFallbackJsonLd(lang));
  }
  if (pathname === "/gift-card") extras.push(howtoGiftCardJsonLd(lang));
  if (pathname === "/catalog") {
    try {
      const { listHtml, jsonLd } = await catalogShell(lang);
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

  // Language-aware homepage. "/" is otherwise served by serveStatic as the raw AZ
  // index.html, so xurcun.az/?lang=en|ru|tr|ar would reach crawlers (and Google Ads'
  // landing-page language check) as Azerbaijani. Rewrite the <head> for the requested
  // language here, before serveStatic serves the file. AZ / no param falls through.
  app.get("/", async (c, next) => {
    const lang = c.req.query("lang");
    if (!lang || !HOME_I18N[lang]) return next();
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(injectHomeLang(content, lang));
    } catch (err) {
      console.error("[static] Failed to serve localized homepage:", err);
      return next();
    }
  });

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
    // Serve the requested language (?lang=) so deep routes reach crawlers in that
    // language, not the AZ default. Unknown values fall back to AZ.
    const langParam = c.req.query("lang");
    const lang = langParam && (LANGS as readonly string[]).includes(langParam) ? langParam : "az";
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(await buildRouteHtml(content, pathname, lang), isKnown ? 200 : 404);
    } catch (err) {
      console.error("[static] Failed to serve index.html:", err);
      return c.text("Service temporarily unavailable. Please try again shortly.", 503);
    }
  });
}
