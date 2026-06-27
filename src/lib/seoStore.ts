/* ─── SEO Settings Store ───
   Admin-editable SEO metadata with database persistence.
   Priority: DB saved settings > dynamic menu-based > auto-generated defaults
*/

import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import { getAdminKey } from "./adminAuthStorage";

/* ─── Vanilla tRPC client for imperative (non-hook) API calls ─── */
const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson as any,
      headers() {
        try {
          const adminKey = getAdminKey();
          return adminKey ? { "x-admin-key": adminKey } : {};
        } catch {
          return {};
        }
      },
    }),
  ],
});

export interface SeoPageSettings {
  titleAz: string; titleRu: string; titleEn: string; titleTr: string;
  descriptionAz: string; descriptionRu: string; descriptionEn: string; descriptionTr: string;
  keywordsAz: string; keywordsRu: string; keywordsEn: string; keywordsTr: string;
  ogTitleAz: string; ogTitleRu: string; ogTitleEn: string; ogTitleTr: string;
  ogDescriptionAz: string; ogDescriptionRu: string; ogDescriptionEn: string; ogDescriptionTr: string;
  ogImage: string;
}

export type SeoSettings = Record<string, SeoPageSettings>;

/* ─── Convert a seoSettings DB row to SeoPageSettings ─── */
export function dbRowToSeoSettings(row: any): SeoPageSettings {
  return {
    titleAz: row.titleAz ?? "",
    titleRu: row.titleRu ?? "",
    titleEn: row.titleEn ?? "",
    titleTr: row.titleTr ?? "",
    descriptionAz: row.descriptionAz ?? "",
    descriptionRu: row.descriptionRu ?? "",
    descriptionEn: row.descriptionEn ?? "",
    descriptionTr: row.descriptionTr ?? "",
    keywordsAz: row.keywordsAz ?? "",
    keywordsRu: row.keywordsRu ?? "",
    keywordsEn: row.keywordsEn ?? "",
    keywordsTr: row.keywordsTr ?? "",
    ogTitleAz: row.ogTitleAz ?? "",
    ogTitleRu: row.ogTitleRu ?? "",
    ogTitleEn: row.ogTitleEn ?? "",
    ogTitleTr: row.ogTitleTr ?? "",
    ogDescriptionAz: row.ogDescriptionAz ?? "",
    ogDescriptionRu: row.ogDescriptionRu ?? "",
    ogDescriptionEn: row.ogDescriptionEn ?? "",
    ogDescriptionTr: row.ogDescriptionTr ?? "",
    ogImage: row.ogImage ?? "https://xurcun.az/brand/logo-gold.png",
  };
}

/* ─── Convert SeoPageSettings to seoSettings DB upsert format ─── */
export function seoSettingsToDbRow(pageId: string, settings: Partial<SeoPageSettings>): any {
  return {
    page: pageId,
    titleAz: settings.titleAz ?? undefined,
    titleRu: settings.titleRu ?? undefined,
    titleEn: settings.titleEn ?? undefined,
    titleTr: settings.titleTr ?? undefined,
    descriptionAz: settings.descriptionAz ?? undefined,
    descriptionRu: settings.descriptionRu ?? undefined,
    descriptionEn: settings.descriptionEn ?? undefined,
    descriptionTr: settings.descriptionTr ?? undefined,
    keywordsAz: settings.keywordsAz ?? undefined,
    keywordsRu: settings.keywordsRu ?? undefined,
    keywordsEn: settings.keywordsEn ?? undefined,
    keywordsTr: settings.keywordsTr ?? undefined,
    ogTitleAz: settings.ogTitleAz ?? undefined,
    ogTitleRu: settings.ogTitleRu ?? undefined,
    ogTitleEn: settings.ogTitleEn ?? undefined,
    ogTitleTr: settings.ogTitleTr ?? undefined,
    ogDescriptionAz: settings.ogDescriptionAz ?? undefined,
    ogDescriptionRu: settings.ogDescriptionRu ?? undefined,
    ogDescriptionEn: settings.ogDescriptionEn ?? undefined,
    ogDescriptionTr: settings.ogDescriptionTr ?? undefined,
    ogImage: settings.ogImage ?? undefined,
  };
}

/* ─── Get settings from DB rows for a specific page ─── */
export function getPageSettingsFromDb(pageId: string, dbRows: any[]): SeoPageSettings | undefined {
  const row = dbRows.find((r) => r.page === pageId);
  if (!row) return undefined;
  return dbRowToSeoSettings(row);
}

/* ─── Auto-generate default SEO for a page ─── */
export function autoGenerateSeo(pageId: string): SeoPageSettings {
  const p = PAGE_TEMPLATES[pageId] || PAGE_TEMPLATES.home;
  return {
    titleAz: p.titleAz, titleRu: p.titleRu, titleEn: p.titleEn, titleTr: p.titleTr,
    descriptionAz: p.descAz, descriptionRu: p.descRu, descriptionEn: p.descEn, descriptionTr: p.descTr,
    keywordsAz: p.kwAz, keywordsRu: p.kwRu, keywordsEn: p.kwEn, keywordsTr: p.kwTr,
    ogTitleAz: p.titleAz, ogTitleRu: p.titleRu, ogTitleEn: p.titleEn, ogTitleTr: p.titleTr,
    ogDescriptionAz: p.descAz, ogDescriptionRu: p.descRu, ogDescriptionEn: p.descEn, ogDescriptionTr: p.descTr,
    ogImage: "https://xurcun.az/brand/logo-gold.png",
  };
}

/* ─── Page templates for auto-generation ─── */
const PAGE_TEMPLATES: Record<string, {
  titleAz: string; titleRu: string; titleEn: string; titleTr: string;
  descAz: string; descRu: string; descEn: string; descTr: string;
  kwAz: string; kwRu: string; kwEn: string; kwTr: string;
}> = {
  home: {
    titleAz: "Xurcun | Premium quru meyvə, qoz-fındıq, şirniyyat və hədiyyə butiki — Bakı",
    titleRu: "Xurcun | Премиальные сухофрукты, орехи, сладости и подарки — Баку",
    titleEn: "Xurcun | Premium dried fruit, nuts, sweets and gift boutique — Baku",
    titleTr: "Xurcun | Premium kuru meyve, çerez, tatlı ve hediye butiği — Bakü",
    descAz: "Xurcun — Azərbaycanın premium quru meyvə, qoz-fındıq, çərəz, şokolad, lokum, paxlava və əl işi hədiyyə qutuları butiki. 2015-dən bəri, Bakıda 11 mağaza. «Keyfiyyətə Vurğunuq!».",
    descRu: "Xurcun — премиальный бутик сухофруктов, орехов, сладостей, шоколада, лукума и подарочных наборов ручной работы. С 2015 года, 11 магазинов в Баку. «Fond of Quality».",
    descEn: "Xurcun is Azerbaijan's premium boutique for dried fruit, nuts, sweets, chocolate, Turkish delight and handcrafted gift boxes. Since 2015, 11 stores in Baku. Fond of Quality.",
    descTr: "Xurcun — Azerbaycan'ın premium kuru meyve, çerez, tatlı, çikolata, lokum ve el yapımı hediye kutuları butiği. 2015'ten beri, Bakü'de 11 mağaza. Fond of Quality.",
    kwAz: "quru meyvə bakı, qoz-fındıq, çərəz, lokum, paxlava, hədiyyə qutusu, şirniyyat, xurcun",
    kwRu: "сухофрукты баку, орехи, лукум, пахлава, подарочные наборы, сладости, xurcun",
    kwEn: "dried fruit baku, nuts, turkish delight, baklava, gift box, sweets, xurcun",
    kwTr: "kuru meyve baku, çerez, lokum, baklava, hediye kutusu, tatlı, xurcun",
  },
  menu: {
    titleAz: "Menyu | Xurcun — Quru meyvə, çərəz və hədiyyə",
    titleRu: "Меню | Xurcun — Сухофрукты, орехи и подарки",
    titleEn: "Menu | Xurcun — Dried fruit, nuts & gifts",
    titleTr: "Menü | Xurcun — Kuru meyve, çerez ve hediye",
    descAz: "Xurcun QR menyusu — quru meyvə, qoz-fındıq, çərəz, lokum, şirniyyat və hədiyyə çeşidləri. Telefondan baxın, WhatsApp ilə sifariş edin.",
    descRu: "QR-меню Xurcun — сухофрукты, орехи, лукум, сладости и подарочные наборы. Смотрите с телефона, заказывайте в WhatsApp.",
    descEn: "Xurcun QR menu — dried fruit, nuts, Turkish delight, sweets and gift selections. Browse from your phone, order on WhatsApp.",
    descTr: "Xurcun QR menüsü — kuru meyve, çerez, lokum, tatlı ve hediye çeşitleri. Telefondan göz atın, WhatsApp ile sipariş verin.",
    kwAz: "qr menyu, quru meyvə menyu, çərəz, lokum, hədiyyə, xurcun",
    kwRu: "qr меню, сухофрукты, орехи, лукум, подарки, xurcun",
    kwEn: "qr menu, dried fruit, nuts, turkish delight, gifts, xurcun",
    kwTr: "qr menü, kuru meyve, çerez, lokum, hediye, xurcun",
  },
  contact: {
    titleAz: "Əlaqə | Xurcun — Ünvan və Telefon",
    titleRu: "Контакты | Xurcun — Адрес и Телефон",
    titleEn: "Contact | Xurcun — Address & Phone",
    titleTr: "İletişim | Xurcun — Adres ve Telefon",
    descAz: "Xurcun ilə əlaqə — Bakıda 11 mağaza. E-poçt: info@xurcun.az. Telefon: +994 50 212 18 11. Suallar və sifariş üçün WhatsApp yazın.",
    descRu: "Связаться с Xurcun — 11 магазинов в Баку. Эл. почта: info@xurcun.az. Телефон: +994 50 212 18 11. Для вопросов и заказов пишите в WhatsApp.",
    descEn: "Contact Xurcun — 11 stores in Baku. Email: info@xurcun.az. Phone: +994 50 212 18 11. For questions and orders, message us on WhatsApp.",
    descTr: "Xurcun ile iletişim — Bakü'de 11 mağaza. E-posta: info@xurcun.az. Telefon: +994 50 212 18 11. Sorular ve sipariş için WhatsApp yazın.",
    kwAz: "əlaqə bakı, xurcun mağaza ünvanı, xurcun telefon, whatsapp sifariş",
    kwRu: "контакты баку, адрес магазина xurcun, телефон xurcun, заказ whatsapp",
    kwEn: "contact baku, xurcun store address, xurcun phone, whatsapp order",
    kwTr: "iletişim baku, xurcun mağaza adresi, xurcun telefon, whatsapp sipariş",
  },
  qr: {
    titleAz: "QR Menyu | Xurcun — Online Menyu",
    titleRu: "QR Меню | Xurcun — Онлайн Меню",
    titleEn: "QR Menu | Xurcun — Online Menu",
    titleTr: "QR Menü | Xurcun — Online Menü",
    descAz: "Xurcun QR menyu — telefonunuzdan məhsullara baxın, WhatsApp ilə sifariş edin. Bakıda 11 mağaza.",
    descRu: "QR-меню Xurcun — смотрите товары с телефона и заказывайте в WhatsApp. 11 магазинов в Баку.",
    descEn: "Xurcun QR menu — browse products from your phone and order on WhatsApp. 11 stores in Baku.",
    descTr: "Xurcun QR menü — telefonunuzdan ürünlere göz atın, WhatsApp ile sipariş verin. Bakü.de 11 mağaza.",
    kwAz: "qr menyu, online menyu, xurcun menyu",
    kwRu: "qr меню, онлайн меню, xurcun меню",
    kwEn: "qr menu, online menu, xurcun menu",
    kwTr: "qr menü, online menü, xurcun menü",
  },
  privacy: {
    titleAz: "Məxfilik Siyasəti | Xurcun",
    titleRu: "Политика конфиденциальности | Xurcun",
    titleEn: "Privacy Policy | Xurcun",
    titleTr: "Gizlilik Politikası | Xurcun",
    descAz: "Xurcun məxfilik siyasəti — şəxsi məlumatlarınızın qorunması, cookie istifadəsi və hüquqlarınız.",
    descRu: "Политика конфиденциальности Xurcun — защита ваших персональных данных, использование cookie и ваши права.",
    descEn: "Xurcun privacy policy — how we protect your personal data, cookie usage, and your rights.",
    descTr: "Xurcun gizlilik politikası — kişisel verilerinizin korunması, çerez kullanımı ve haklarınız.",
    kwAz: "məxfilik siyasəti, gizlilik, cookie siyasəti, xurcun",
    kwRu: "политика конфиденциальности, приватность, cookie, xurcun",
    kwEn: "privacy policy, data protection, cookie policy, xurcun",
    kwTr: "gizlilik politikası, veri koruma, çerez politikası, xurcun",
  },
  "cookie-policy": {
    titleAz: "Cookie Siyasəti | Xurcun",
    titleRu: "Политика использования cookies | Xurcun",
    titleEn: "Cookie Policy | Xurcun",
    titleTr: "Çerez Politikası | Xurcun",
    descAz: "Xurcun cookie siyasəti — saytda istifadə olunan cookie-lər, kateqoriyalar və razılıq idarəsi.",
    descRu: "Политика использования cookies Xurcun — cookies на сайте, категории и управление согласием.",
    descEn: "Xurcun cookie policy — cookies used on the site, categories, and consent management.",
    descTr: "Xurcun çerez politikası — sitede kullanılan çerezler, kategoriler ve izin yönetimi.",
    kwAz: "cookie siyasəti, cookie razılığı, xurcun",
    kwRu: "политика cookie, согласие cookie, xurcun",
    kwEn: "cookie policy, cookie consent, xurcun",
    kwTr: "çerez politikası, çerez izni, xurcun",
  },
};

export const SEO_PAGES = [
  { id: "home", labelAz: "Ana Səhifə", labelEn: "Homepage", labelRu: "Главная", labelTr: "Ana Sayfa" },
  { id: "catalog", labelAz: "Kataloq", labelEn: "Catalogue", labelRu: "Каталог", labelTr: "Katalog" },
  { id: "menu", labelAz: "QR Menyu", labelEn: "QR Menu", labelRu: "QR Меню", labelTr: "QR Menü" },
  { id: "about", labelAz: "Haqqımızda", labelEn: "About Us", labelRu: "О нас", labelTr: "Hakkımızda" },
  { id: "contact", labelAz: "Əlaqə", labelEn: "Contact", labelRu: "Контакты", labelTr: "İletişim" },
  { id: "qr", labelAz: "QR Menyu", labelEn: "QR Menu", labelRu: "QR Меню", labelTr: "QR Menü" },
  { id: "privacy", labelAz: "Məxfilik Siyasəti", labelEn: "Privacy Policy", labelRu: "Политика конфиденциальности", labelTr: "Gizlilik Politikası" },
  { id: "cookie-policy", labelAz: "Cookie Siyasəti", labelEn: "Cookie Policy", labelRu: "Политика cookies", labelTr: "Çerez Politikası" },
];

/* ───────────────────────────────────────────────────────────────
   DATABASE-BASED OPERATIONS (replaces localStorage)
   Uses vanilla tRPC proxy client for imperative API calls.
   ─────────────────────────────────────────────────────────────── */

/** Fetch all SEO settings from the database via tRPC. */
export async function getSeoSettings(): Promise<SeoSettings> {
  try {
    const rows = await trpcClient.seo.adminGetAll.query();
    const result: SeoSettings = {};
    for (const row of rows) {
      if (row.page) {
        result[row.page] = dbRowToSeoSettings(row);
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** Get merged SEO for a page: dbSettings > auto-generated */
export function getPageSeo(pageId: string, dbSettings?: SeoSettings): SeoPageSettings {
  const saved = dbSettings?.[pageId];
  const generated = autoGenerateSeo(pageId);
  if (!saved) return generated;
  // Merge: saved overrides generated for non-empty fields
  const merged = { ...generated };
  (Object.keys(saved) as (keyof SeoPageSettings)[]).forEach((key) => {
    const val = saved[key];
    if (val && String(val).trim().length > 0) {
      (merged as any)[key] = val;
    }
  });
  return merged;
}

/** Save (upsert) SEO settings for a single page via tRPC. */
export async function savePageSeo(pageId: string, settings: Partial<SeoPageSettings>): Promise<void> {
  try {
    await trpcClient.seo.upsertByPage.mutate(seoSettingsToDbRow(pageId, settings));
  } catch (err) {
    console.error("[seoStore] savePageSeo failed:", err);
    throw err;
  }
}

/** Save all SEO settings at once via tRPC (upserts each page). */
export async function saveAllSeo(settings: SeoSettings): Promise<void> {
  try {
    const entries = Object.entries(settings);
    await Promise.all(
      entries.map(([pageId, pageSettings]) =>
        trpcClient.seo.upsertByPage.mutate(seoSettingsToDbRow(pageId, pageSettings))
      )
    );
  } catch (err) {
    console.error("[seoStore] saveAllSeo failed:", err);
    throw err;
  }
}

/** Reset a page to auto-generated defaults by deleting its DB row. */
export async function resetPageSeo(pageId: string): Promise<void> {
  try {
    // Find the DB row for this page
    const row = await trpcClient.seo.getByPage.query({ page: pageId });
    if (row && row.id) {
      await trpcClient.seo.delete.mutate({ id: row.id });
    }
  } catch (err) {
    console.error("[seoStore] resetPageSeo failed:", err);
    throw err;
  }
}

/* ═══════════════════════════════════════════════════════════════
   DYNAMIC MENU-BASED SEO BUILDER
   Reads active menu products and builds natural SEO content.
   ═══════════════════════════════════════════════════════════════ */

import { alacarteData, beverageData, shishaData } from "./menuData.static";
import { getMenuEdit, isItemAvailableAtBranch } from "./menuStore";

interface DynamicSeoResult {
  descriptionAz: string; descriptionRu: string; descriptionEn: string; descriptionTr: string;
  keywordsAz: string; keywordsRu: string; keywordsEn: string; keywordsTr: string;
}

/** Build natural sentence fragments from item names — no stuffing */
function joinNames(names: string[], max: number, lang: string): string {
  const limited = names.slice(0, max);
  if (lang === "az") return limited.join(", ") + (names.length > max ? ` və daha ${names.length - max}+ çeşid` : "");
  if (lang === "ru") return limited.join(", ") + (names.length > max ? ` и ещё ${names.length - max}+ видов` : "");
  if (lang === "tr") return limited.join(", ") + (names.length > max ? ` ve ${names.length - max}+ çeşit daha` : "");
  return limited.join(", ") + (names.length > max ? ` and ${names.length - max}+ more varieties` : "");
}

/** Get active item names for a menu section, filtered by branch */
function getActiveItemNames(
  categories: typeof alacarteData,
  tab: "food" | "beverage" | "shisha",
  branchSlug: string,
  lang: string,
  maxItems: number
): string[] {
  const names: string[] = [];
  categories.forEach((cat) => {
    const catTitle = cat.title_az;
    (cat.items || []).forEach((item) => {
      const edit = getMenuEdit(tab, catTitle, item.name_az);
      // Check active
      if (edit?.is_active === false) return;
      // Check branch availability
      if (!isItemAvailableAtBranch(tab, branchSlug, catTitle, item.name_az)) return;
      // Get name in correct language
      const name = lang === "tr" && (item as any).name_tr
        ? (item as any).name_tr
        : lang === "ru" && item.name_ru
        ? item.name_ru
        : lang === "en" && item.name_en
        ? item.name_en
        : item.name_az;
      if (name && !names.includes(name)) names.push(name);
    });
  });
  return names.slice(0, maxItems);
}

/** Build dynamic SEO from actual menu data */
export function buildDynamicMenuSeo(
  pageId: string,
  branchSlug?: string,
  dbSettings?: SeoSettings
): Partial<DynamicSeoResult> {
  const branch = branchSlug || "white-city";
  const branchName = branch === "white-city" ? "White City" : "Seabreeze Marina";

  const foodNamesAz = getActiveItemNames(alacarteData, "food", branch, "az", 8);
  const foodNamesRu = getActiveItemNames(alacarteData, "food", branch, "ru", 8);
  const foodNamesEn = getActiveItemNames(alacarteData, "food", branch, "en", 8);
  const foodNamesTr = getActiveItemNames(alacarteData, "food", branch, "tr", 8);

  const bevNamesAz = getActiveItemNames(beverageData, "beverage", branch, "az", 6);
  const bevNamesRu = getActiveItemNames(beverageData, "beverage", branch, "ru", 6);
  const bevNamesEn = getActiveItemNames(beverageData, "beverage", branch, "en", 6);
  const bevNamesTr = getActiveItemNames(beverageData, "beverage", branch, "tr", 6);

  const shishaNamesAz = shishaData.hookahs
    .filter((h) => isItemAvailableAtBranch("shisha", branch, "Qəlyan cihazları", h.name_az))
    .map((h) => h.name_az).slice(0, 5);
  const shishaNamesRu = shishaData.hookahs
    .filter((h) => isItemAvailableAtBranch("shisha", branch, "Qəlyan cihazları", h.name_az))
    .map((h) => h.name_ru || h.name_az).slice(0, 5);
  const shishaNamesEn = shishaData.hookahs
    .filter((h) => isItemAvailableAtBranch("shisha", branch, "Qəlyan cihazları", h.name_az))
    .map((h) => h.name_en || h.name_az).slice(0, 5);
  const shishaNamesTr = shishaData.hookahs
    .filter((h) => isItemAvailableAtBranch("shisha", branch, "Qəlyan cihazları", h.name_az))
    .map((h) => (h as any).name_tr || h.name_az).slice(0, 5);

  const foodCatAz = alacarteData.map((c) => c.title_az).join(", ");
  const foodCatRu = alacarteData.map((c) => c.title_ru).join(", ");
  const foodCatEn = alacarteData.map((c) => c.title_en).join(", ");

  const bevCatAz = beverageData.map((c) => c.title_az).join(", ");
  const bevCatRu = beverageData.map((c) => c.title_ru).join(", ");
  const bevCatEn = beverageData.map((c) => c.title_en).join(", ");

  // Build page-specific descriptions
  if (pageId === "home" || pageId === "menu") {
    return {
      descriptionAz: `Xurcun ${branchName} — premium restoran və lounge. Menyumuzda: ${joinNames(foodNamesAz, 5, "az")}. Həmçinin ${joinNames(bevNamesAz, 4, "az")} və premium qəlyan.`,
      descriptionRu: `Xurcun ${branchName} — премиальный ресторан и лаунж. В меню: ${joinNames(foodNamesRu, 5, "ru")}. Также ${joinNames(bevNamesRu, 4, "ru")} и премиальный кальян.`,
      descriptionEn: `Xurcun ${branchName} — a premium restaurant and lounge. Our menu features: ${joinNames(foodNamesEn, 5, "en")}. Also ${joinNames(bevNamesEn, 4, "en")} and premium shisha.`,
      descriptionTr: `Xurcun ${branchName} — premium restoran ve lounge. Menümüzde: ${joinNames(foodNamesTr, 5, "tr")}. Ayrıca ${joinNames(bevNamesTr, 4, "tr")} ve premium nargile.`,
      keywordsAz: `xurcun ${branchName.toLowerCase()}, premium restoran baku, lounge bakı, ${foodCatAz.toLowerCase()}, ${joinNames(foodNamesAz.slice(0, 4), 4, "az").toLowerCase()}, qəlyan bakı, kokteyl bar`,
      keywordsRu: `xurcun ${branchName.toLowerCase()}, премиальный ресторан баку, лаунж баку, ${foodCatRu.toLowerCase()}, ${joinNames(foodNamesRu.slice(0, 4), 4, "ru").toLowerCase()}, кальян баку, коктейль бар`,
      keywordsEn: `xurcun ${branchName.toLowerCase()}, premium restaurant baku, lounge baku, ${foodCatEn.toLowerCase()}, ${joinNames(foodNamesEn.slice(0, 4), 4, "en").toLowerCase()}, shisha baku, cocktail bar`,
      keywordsTr: `xurcun ${branchName.toLowerCase()}, premium restoran baku, lounge baku, ${foodCatEn.toLowerCase()}, ${joinNames(foodNamesTr.slice(0, 4), 4, "tr").toLowerCase()}, nargile baku, kokteyl bar`,
    };
  }

  if (pageId === "food") {
    return {
      descriptionAz: `A La Carte menyumuz — ${foodCatAz}. Seçilmiş ləzzətlər: ${joinNames(foodNamesAz, 6, "az")}.`,
      descriptionRu: `Меню A La Carte — ${foodCatRu}. Избранные блюда: ${joinNames(foodNamesRu, 6, "ru")}.`,
      descriptionEn: `Our A La Carte menu — ${foodCatEn}. Selected dishes: ${joinNames(foodNamesEn, 6, "en")}.`,
      descriptionTr: `A La Carte menümüz — ${foodCatEn}. Seçilmiş lezzetler: ${joinNames(foodNamesTr, 6, "tr")}.`,
      keywordsAz: `a la carte bakı, yemek menyusu, azərbaycan mətbəxi, ${joinNames(foodNamesAz.slice(0, 5), 5, "az").toLowerCase()}, premium restoran`,
      keywordsRu: `a la carte баку, меню еды, азербайджанская кухня, ${joinNames(foodNamesRu.slice(0, 5), 5, "ru").toLowerCase()}, премиальный ресторан`,
      keywordsEn: `a la carte baku, food menu, azerbaijani cuisine, ${joinNames(foodNamesEn.slice(0, 5), 5, "en").toLowerCase()}, premium restaurant`,
      keywordsTr: `a la carte baku, yemek menüsü, azerbaycan mutfağı, ${joinNames(foodNamesTr.slice(0, 5), 5, "tr").toLowerCase()}, premium restoran`,
    };
  }

  if (pageId === "beverage") {
    return {
      descriptionAz: `İçki menyumuz — ${bevCatAz}. Seçilmiş içkilər: ${joinNames(bevNamesAz, 5, "az")}.`,
      descriptionRu: `Меню напитков — ${bevCatRu}. Избранные напитки: ${joinNames(bevNamesRu, 5, "ru")}.`,
      descriptionEn: `Our beverage menu — ${bevCatEn}. Selected drinks: ${joinNames(bevNamesEn, 5, "en")}.`,
      descriptionTr: `İçecek menümüz — ${bevCatEn}. Seçilmiş içecekler: ${joinNames(bevNamesTr, 5, "tr")}.`,
      keywordsAz: `kokteyl bar bakı, içki menyusu, şərab, ${joinNames(bevNamesAz.slice(0, 4), 4, "az").toLowerCase()}, premium içki`,
      keywordsRu: `коктейль бар баку, меню напитков, вино, ${joinNames(bevNamesRu.slice(0, 4), 4, "ru").toLowerCase()}, премиум напитки`,
      keywordsEn: `cocktail bar baku, beverage menu, wine, ${joinNames(bevNamesEn.slice(0, 4), 4, "en").toLowerCase()}, premium spirits`,
      keywordsTr: `kokteyl bar baku, içecek menüsü, şarap, ${joinNames(bevNamesTr.slice(0, 4), 4, "tr").toLowerCase()}, premium içecek`,
    };
  }

  if (pageId === "shisha") {
    return {
      descriptionAz: `Premium qəlyan təcrübəsi — ${joinNames(shishaNamesAz, 4, "az")}. Ən çox seçilən tütün çeşidlərimiz və xüsusi qarışıqlarımızla unudulmaz anlar.`,
      descriptionRu: `Премиальный кальян — ${joinNames(shishaNamesRu, 4, "ru")}. Незабываемые моменты с нашими популярными табаками и эксклюзивными миксами.`,
      descriptionEn: `Premium shisha experience — ${joinNames(shishaNamesEn, 4, "en")}. Unforgettable moments with our popular tobaccos and exclusive blends.`,
      descriptionTr: `Premium nargile deneyimi — ${joinNames(shishaNamesTr, 4, "tr")}. Popüler tütünlerimiz ve özel karışımlarımızla unutulmaz anlar.`,
      keywordsAz: `qəlyan bakı, premium qəlyan, hookah lounge, ${joinNames(shishaNamesAz.slice(0, 3), 3, "az").toLowerCase()}, nargile`,
      keywordsRu: `кальян баку, премиальный кальян, hookah lounge, ${joinNames(shishaNamesRu.slice(0, 3), 3, "ru").toLowerCase()}`,
      keywordsEn: `shisha baku, premium shisha, hookah lounge, ${joinNames(shishaNamesEn.slice(0, 3), 3, "en").toLowerCase()}`,
      keywordsTr: `nargile baku, premium nargile, hookah lounge, ${joinNames(shishaNamesTr.slice(0, 3), 3, "tr").toLowerCase()}`,
    };
  }

  if (pageId === "snack") {
    return {
      descriptionAz: `Snack menyu — saat 23:00-dan sonra aktiv. Sürətli və dadlı seçimlər: ${joinNames(foodNamesAz.filter((_, i) => i < 6), 5, "az")}.`,
      descriptionRu: `Снэк-меню — доступно после 23:00. Быстрые и вкусные закуски: ${joinNames(foodNamesRu.filter((_, i) => i < 6), 5, "ru")}.`,
      descriptionEn: `Snack menu — available after 23:00. Quick and tasty late-night bites: ${joinNames(foodNamesEn.filter((_, i) => i < 6), 5, "en")}.`,
      descriptionTr: `Snack menü — 23:00'ten sonra aktif. Hızlı ve lezzetli gece atıştırmalıkları: ${joinNames(foodNamesTr.filter((_, i) => i < 6), 5, "tr")}.`,
      keywordsAz: `snack menyu, gecə yeməkləri, late night menu, ${joinNames(foodNamesAz.slice(0, 4), 4, "az").toLowerCase()}`,
      keywordsRu: `снэк меню, ночные закуски, late night menu, ${joinNames(foodNamesRu.slice(0, 4), 4, "ru").toLowerCase()}`,
      keywordsEn: `snack menu, late night bites, late night food, ${joinNames(foodNamesEn.slice(0, 4), 4, "en").toLowerCase()}`,
      keywordsTr: `snack menü, gece yiyecekleri, late night menu, ${joinNames(foodNamesTr.slice(0, 4), 4, "tr").toLowerCase()}`,
    };
  }

  // QR / default
  return {
    descriptionAz: `Xurcun ${branchName} QR menyu — ${joinNames(foodNamesAz, 4, "az")}, ${joinNames(bevNamesAz, 3, "az")} və premium qəlyan sifariş edin.`,
    descriptionRu: `QR-меню Xurcun ${branchName} — закажите ${joinNames(foodNamesRu, 4, "ru")}, ${joinNames(bevNamesRu, 3, "ru")} и премиальный кальян.`,
    descriptionEn: `Xurcun ${branchName} QR menu — order ${joinNames(foodNamesEn, 4, "en")}, ${joinNames(bevNamesEn, 3, "en")} and premium shisha.`,
    descriptionTr: `Xurcun ${branchName} QR menü — ${joinNames(foodNamesTr, 4, "tr")}, ${joinNames(bevNamesTr, 3, "tr")} ve premium nargile sipariş edin.`,
    keywordsAz: `qr menyu, ${branchName.toLowerCase()}, ${joinNames(foodNamesAz.slice(0, 3), 3, "az").toLowerCase()}, qəlyan, kokteyl`,
    keywordsRu: `qr меню, ${branchName.toLowerCase()}, ${joinNames(foodNamesRu.slice(0, 3), 3, "ru").toLowerCase()}, кальян, коктейль`,
    keywordsEn: `qr menu, ${branchName.toLowerCase()}, ${joinNames(foodNamesEn.slice(0, 3), 3, "en").toLowerCase()}, shisha, cocktail`,
    keywordsTr: `qr menü, ${branchName.toLowerCase()}, ${joinNames(foodNamesTr.slice(0, 3), 3, "tr").toLowerCase()}, nargile, kokteyl`,
  };
}

/** Get final SEO for a page: manual (dbRows) > dynamic menu-based > static template */
export function getFinalPageSeo(
  pageId: string,
  branchSlug?: string,
  dbRows?: any[]
): SeoPageSettings {
  // Build dbSettings from dbRows if provided
  let dbSettings: SeoSettings | undefined;
  if (dbRows && dbRows.length > 0) {
    dbSettings = {};
    for (const row of dbRows) {
      if (row.page) {
        dbSettings[row.page] = dbRowToSeoSettings(row);
      }
    }
  }

  const manual = dbSettings?.[pageId];
  const dynamic = buildDynamicMenuSeo(pageId, branchSlug, dbSettings);
  const base = autoGenerateSeo(pageId);

  // Helper: prefer manual, then dynamic, then base
  const pick = (manualVal: string | undefined, dynamicVal: string | undefined, baseVal: string): string => {
    if (manualVal && manualVal.trim().length > 0) return manualVal.trim();
    if (dynamicVal && dynamicVal.trim().length > 0) return dynamicVal.trim();
    return baseVal;
  };

  return {
    titleAz: pick(manual?.titleAz, undefined, base.titleAz),
    titleRu: pick(manual?.titleRu, undefined, base.titleRu),
    titleEn: pick(manual?.titleEn, undefined, base.titleEn),
    titleTr: pick(manual?.titleTr, undefined, base.titleTr),
    descriptionAz: pick(manual?.descriptionAz, dynamic.descriptionAz, base.descriptionAz),
    descriptionRu: pick(manual?.descriptionRu, dynamic.descriptionRu, base.descriptionRu),
    descriptionEn: pick(manual?.descriptionEn, dynamic.descriptionEn, base.descriptionEn),
    descriptionTr: pick(manual?.descriptionTr, dynamic.descriptionTr, base.descriptionTr),
    keywordsAz: pick(manual?.keywordsAz, dynamic.keywordsAz, base.keywordsAz),
    keywordsRu: pick(manual?.keywordsRu, dynamic.keywordsRu, base.keywordsRu),
    keywordsEn: pick(manual?.keywordsEn, dynamic.keywordsEn, base.keywordsEn),
    keywordsTr: pick(manual?.keywordsTr, dynamic.keywordsTr, base.keywordsTr),
    ogTitleAz: pick(manual?.ogTitleAz, undefined, base.ogTitleAz),
    ogTitleRu: pick(manual?.ogTitleRu, undefined, base.ogTitleRu),
    ogTitleEn: pick(manual?.ogTitleEn, undefined, base.ogTitleEn),
    ogTitleTr: pick(manual?.ogTitleTr, undefined, base.ogTitleTr),
    ogDescriptionAz: pick(manual?.ogDescriptionAz, dynamic.descriptionAz, base.ogDescriptionAz),
    ogDescriptionRu: pick(manual?.ogDescriptionRu, dynamic.descriptionRu, base.ogDescriptionRu),
    ogDescriptionEn: pick(manual?.ogDescriptionEn, dynamic.descriptionEn, base.ogDescriptionEn),
    ogDescriptionTr: pick(manual?.ogDescriptionTr, dynamic.descriptionTr, base.ogDescriptionTr),
    ogImage: pick(manual?.ogImage, undefined, base.ogImage),
  };
}
