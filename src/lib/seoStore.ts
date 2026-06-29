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
  titleAr?: string; descriptionAr?: string; keywordsAr?: string; ogTitleAr?: string; ogDescriptionAr?: string;
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
    titleAr: p.titleAr, descriptionAr: p.descAr, keywordsAr: p.kwAr, ogTitleAr: p.titleAr, ogDescriptionAr: p.descAr,
    ogImage: "https://xurcun.az/brand/logo-gold.png",
  };
}

/* ─── Page templates for auto-generation ─── */
const PAGE_TEMPLATES: Record<string, {
  titleAz: string; titleRu: string; titleEn: string; titleTr: string;
  descAz: string; descRu: string; descEn: string; descTr: string;
  kwAz: string; kwRu: string; kwEn: string; kwTr: string;
  titleAr: string; descAr: string; kwAr: string;
}> = {
  home: {
    titleAz: "Xurcun | Premium quru meyvə, çərəz & hədiyyə — Bakı",
    titleRu: "Xurcun | Сухофрукты, орехи, сладости и подарки — Баку",
    titleEn: "Xurcun | Premium dried fruit, nuts & gifts — Baku",
    titleTr: "Xurcun | Premium kuru meyve, çerez & hediye — Bakü",
    descAz: "Xurcun — Azərbaycanın premium quru meyvə, qoz-fındıq, çərəz, şokolad, lokum, paxlava və əl işi hədiyyə qutuları butiki. 2015-dən bəri, Bakıda 11 mağaza. «Keyfiyyətə Vurğunuq!».",
    descRu: "Xurcun — премиальный бутик сухофруктов, орехов, сладостей, шоколада, лукума и подарочных наборов ручной работы. С 2015 года, 11 магазинов в Баку. «Fond of Quality».",
    descEn: "Xurcun is Azerbaijan's premium boutique for dried fruit, nuts, sweets, chocolate, Turkish delight and handcrafted gift boxes. Since 2015, 11 stores in Baku. Fond of Quality.",
    descTr: "Xurcun — Azerbaycan'ın premium kuru meyve, çerez, tatlı, çikolata, lokum ve el yapımı hediye kutuları butiği. 2015'ten beri, Bakü'de 11 mağaza. Fond of Quality.",
    kwAz: "quru meyvə bakı, qoz-fındıq, çərəz, lokum, paxlava, hədiyyə qutusu, şirniyyat, xurcun",
    kwRu: "сухофрукты баку, орехи, лукум, пахлава, подарочные наборы, сладости, xurcun",
    kwEn: "dried fruit baku, nuts, turkish delight, baklava, gift box, sweets, xurcun",
    kwTr: "kuru meyve baku, çerez, lokum, baklava, hediye kutusu, tatlı, xurcun",
    titleAr: "Xurcun | فواكه مجففة ومكسرات وهدايا فاخرة — باكو", descAr: "Xurcun — بوتيك أذربيجاني فاخر للفواكه المجففة والمكسرات والحلويات والشوكولاتة والحلقوم وعلب الهدايا اليدوية. منذ 2015، 11 متجرًا في باكو. Fond of Quality.", kwAr: "فواكه مجففة باكو, مكسرات, حلقوم, بقلاوة, علبة هدايا, حلويات, xurcun",
  },
  catalog: {
    titleAz: "Kataloq | Xurcun — Quru meyvə, çərəz & hədiyyə",
    titleRu: "Каталог | Xurcun — Сухофрукты, орехи и подарки",
    titleEn: "Catalogue | Xurcun — Dried fruit, nuts & gifts",
    titleTr: "Katalog | Xurcun — Kuru meyve, çerez ve hediye",
    descAz: "Xurcun kataloqu — quru meyvə, qoz-fındıq, çərəz, lokum, şokolad və hədiyyə qutuları. Bəyəndiyinizi seçin, WhatsApp ilə sifariş edin.",
    descRu: "Каталог Xurcun — сухофрукты, орехи, лукум, шоколад и подарочные наборы. Выбирайте и заказывайте в WhatsApp.",
    descEn: "Xurcun catalogue — dried fruit, nuts, Turkish delight, chocolate and gift boxes. Pick what you like and order on WhatsApp.",
    descTr: "Xurcun kataloğu — kuru meyve, çerez, lokum, çikolata ve hediye kutuları. Beğendiğinizi seçin, WhatsApp ile sipariş verin.",
    kwAz: "kataloq, quru meyvə kataloqu, çərəz, lokum, hədiyyə, xurcun bakı",
    kwRu: "каталог, сухофрукты, орехи, лукум, подарки, xurcun баку",
    kwEn: "catalogue, dried fruit, nuts, turkish delight, gifts, xurcun baku",
    kwTr: "katalog, kuru meyve, çerez, lokum, hediye, xurcun baku",
    titleAr: "الكتالوج | Xurcun — فواكه مجففة ومكسرات وهدايا", descAr: "كتالوج Xurcun — فواكه مجففة ومكسرات وحلقوم وشوكولاتة وعلب هدايا. اختر ما يعجبك واطلب عبر واتساب.", kwAr: "كتالوج, فواكه مجففة, مكسرات, حلقوم, هدايا, xurcun باكو",
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
    titleAr: "القائمة | Xurcun — فواكه مجففة ومكسرات وهدايا", descAr: "قائمة Xurcun عبر QR — فواكه مجففة ومكسرات وحلقوم وحلويات وعلب هدايا. تصفّح من هاتفك واطلب عبر واتساب.", kwAr: "قائمة QR, فواكه مجففة, مكسرات, حلقوم, هدايا, xurcun",
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
    titleAr: "اتصل بنا | Xurcun — العنوان والهاتف", descAr: "تواصل مع Xurcun — 11 متجرًا في باكو. البريد: info@xurcun.az. الهاتف: +994 50 212 18 11. للأسئلة والطلبات راسلنا على واتساب.", kwAr: "اتصال باكو, عنوان متجر xurcun, هاتف xurcun, طلب واتساب",
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
    titleAr: "قائمة QR | Xurcun — قائمة إلكترونية", descAr: "قائمة Xurcun عبر QR — تصفّح المنتجات من هاتفك واطلب عبر واتساب. 11 متجرًا في باكو.", kwAr: "قائمة QR, قائمة إلكترونية, قائمة xurcun",
  },
  about: {
    titleAz: "Haqqımızda | Xurcun — 2015-dən bəri premium butik",
    titleRu: "О нас | Xurcun — премиальный бутик с 2015 года",
    titleEn: "About Us | Xurcun — premium boutique since 2015",
    titleTr: "Hakkımızda | Xurcun — 2015'ten beri premium butik",
    descAz: "Xurcun — 2015-ci ildə Vüqar Məhərrəmov tərəfindən təsis edilmiş premium quru meyvə, qoz-fındıq, çay, şirniyyat və əl işi hədiyyə butiki. Bakıda 11 mağaza. Fond of Quality.",
    descRu: "Xurcun — премиальный бутик сухофруктов, орехов, чая, сладостей и подарков ручной работы, основан в 2015 году Вугаром Магеррамовым. 11 магазинов в Баку. Fond of Quality.",
    descEn: "Xurcun — a premium boutique for dried fruit, nuts, tea, sweets and handcrafted gifts, founded in 2015 by Vugar Maharramov. 11 stores in Baku. Fond of Quality.",
    descTr: "Xurcun — 2015'te Vugar Maharramov tarafından kurulan premium kuru meyve, çerez, çay, tatlı ve el yapımı hediye butiği. Bakü'de 11 mağaza. Fond of Quality.",
    kwAz: "xurcun haqqında, xurcun tarixi, premium butik bakı, vüqar məhərrəmov",
    kwRu: "о xurcun, история xurcun, премиальный бутик баку",
    kwEn: "about xurcun, xurcun story, premium boutique baku",
    kwTr: "xurcun hakkında, xurcun hikayesi, premium butik baku",
    titleAr: "من نحن | Xurcun — بوتيك فاخر منذ 2015", descAr: "Xurcun — بوتيك فاخر للفواكه المجففة والمكسرات والشاي والحلويات والهدايا اليدوية، تأسس عام 2015 على يد ووغار محرّموف. 11 متجرًا في باكو. Fond of Quality.", kwAr: "عن xurcun, قصة xurcun, بوتيك فاخر باكو",
  },
  faq: {
    titleAz: "Tez-tez verilən suallar | Xurcun",
    titleRu: "Часто задаваемые вопросы | Xurcun",
    titleEn: "FAQ | Xurcun",
    titleTr: "Sıkça Sorulan Sorular | Xurcun",
    descAz: "Xurcun haqqında tez-tez verilən suallar — məhsullar, mağazalar, hədiyyə qutuları, qlütensiz seçimlər, çatdırılma və sifariş.",
    descRu: "Часто задаваемые вопросы о Xurcun — товары, магазины, подарочные наборы, безглютеновые опции, доставка и заказ.",
    descEn: "Frequently asked questions about Xurcun — products, stores, gift boxes, gluten-free options, delivery and ordering.",
    descTr: "Xurcun hakkında sıkça sorulan sorular — ürünler, mağazalar, hediye kutuları, glutensiz seçenekler, teslimat ve sipariş.",
    kwAz: "xurcun suallar, faq, hədiyyə qutusu sifariş, qlütensiz, xurcun bakı",
    kwRu: "xurcun вопросы, faq, заказ подарка, без глютена",
    kwEn: "xurcun faq, gift box order, gluten free, xurcun baku",
    kwTr: "xurcun sss, hediye kutusu sipariş, glutensiz",
    titleAr: "الأسئلة الشائعة | Xurcun", descAr: "أسئلة شائعة عن Xurcun — المنتجات والمتاجر وعلب الهدايا والخيارات الخالية من الغلوتين والتوصيل والطلب.", kwAr: "أسئلة xurcun, طلب علبة هدايا, خالٍ من الغلوتين, xurcun باكو",
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
    titleAr: "سياسة الخصوصية | Xurcun", descAr: "سياسة خصوصية Xurcun — كيف نحمي بياناتك الشخصية، واستخدام ملفات تعريف الارتباط، وحقوقك.", kwAr: "سياسة الخصوصية, حماية البيانات, سياسة الكوكيز, xurcun",
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
    titleAr: "سياسة ملفات تعريف الارتباط | Xurcun", descAr: "سياسة الكوكيز في Xurcun — الكوكيز المستخدمة على الموقع وفئاتها وإدارة الموافقة.", kwAr: "سياسة الكوكيز, موافقة الكوكيز, xurcun",
  },
};

export const SEO_PAGES = [
  { id: "home", labelAz: "Ana Səhifə", labelEn: "Homepage", labelRu: "Главная", labelTr: "Ana Sayfa" },
  { id: "catalog", labelAz: "Kataloq", labelEn: "Catalogue", labelRu: "Каталог", labelTr: "Katalog" },
  { id: "menu", labelAz: "QR Menyu", labelEn: "QR Menu", labelRu: "QR Меню", labelTr: "QR Menü" },
  { id: "about", labelAz: "Haqqımızda", labelEn: "About Us", labelRu: "О нас", labelTr: "Hakkımızda" },
  { id: "faq", labelAz: "FAQ", labelEn: "FAQ", labelRu: "FAQ", labelTr: "SSS" },
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
   DYNAMIC SEO BUILDER (boutique)
   Natural boutique SEO copy per page — dried fruit, nuts, sweets,
   gift boxes. No restaurant/menu data (that was a thewoo leftover).
   ═══════════════════════════════════════════════════════════════ */

interface DynamicSeoResult {
  descriptionAz: string; descriptionRu: string; descriptionEn: string; descriptionTr: string;
  keywordsAz: string; keywordsRu: string; keywordsEn: string; keywordsTr: string;
}

/** Build dynamic SEO — boutique product positioning. */
export function buildDynamicMenuSeo(
  pageId: string,
  branchSlug?: string,
  _dbSettings?: SeoSettings
): Partial<DynamicSeoResult> {
  const branch = branchSlug || "white-city";
  const branchName = branch === "white-city" ? "White City" : "Seabreeze Marina";

  if (pageId === "home" || pageId === "menu" || pageId === "catalog") {
    return {
      descriptionAz: `Xurcun ${branchName} — premium quru meyvə, qoz-fındıq, çərəz, şokolad, lokum, paxlava və əl işi hədiyyə qutuları butiki. Bakıda keyfiyyətə vurğunuq.`,
      descriptionRu: `Xurcun ${branchName} — бутик премиальных сухофруктов, орехов, снеков, шоколада, лукума, пахлавы и подарочных наборов ручной работы в Баку.`,
      descriptionEn: `Xurcun ${branchName} — a premium boutique of dried fruit, nuts, snacks, chocolate, Turkish delight, baklava and handcrafted gift boxes in Baku.`,
      descriptionTr: `Xurcun ${branchName} — Bakü'de premium kuru meyve, kuruyemiş, çerez, çikolata, lokum, baklava ve el yapımı hediye kutuları butiği.`,
      keywordsAz: `xurcun ${branchName.toLowerCase()}, quru meyvə bakı, çərəz bakı, qoz-fındıq, hədiyyə qutusu bakı, lokum, paxlava, şokolad butik`,
      keywordsRu: `xurcun ${branchName.toLowerCase()}, сухофрукты баку, орехи баку, подарочные наборы баку, лукум, пахлава, шоколад бутик`,
      keywordsEn: `xurcun ${branchName.toLowerCase()}, dried fruit baku, nuts baku, gift box baku, turkish delight, baklava, chocolate boutique`,
      keywordsTr: `xurcun ${branchName.toLowerCase()}, kuru meyve baku, kuruyemiş baku, hediye kutusu, lokum, baklava, çikolata butik`,
    };
  }

  // Other pages defer to manual DB SEO / static base templates.
  return {};
}

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
