/* ─── Homepage text fields ────────────────────────────────────────────────
 * Single source of truth for every overridable text string on the public
 * HomePage. Overrides persist server-side in the `homepage_text` table, one
 * row per key (see api/routers/homepageText.ts). The `default` of each field
 * mirrors the in-code `S` constant in HomePage.tsx and is the SSR / no-JS /
 * empty-DB fallback.
 *
 * Framework-neutral (no React import) so both HomePage.tsx and api/boot.ts
 * can import it — exactly like homepageImageStore.ts.
 * ───────────────────────────────────────────────────────────────────────── */

export type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar';
export type L5 = Record<Lang, string>;

export interface HomepageTextField {
  key: string;
  group: 'hero' | 'values' | 'headings' | 'about' | 'luxe' | 'anniversary' | 'footer' | 'nav' | 'advanced';
  label: string;       // short AZ admin label
  multiline: boolean;  // true => textarea
  default: L5;
}

export const HOMEPAGE_TEXT_FIELDS: HomepageTextField[] = [
  // ── nav ──
  {
    key: 'nav_home', group: 'nav', label: 'Naviqasiya: Ana səhifə', multiline: false,
    default: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
  },
  {
    key: 'nav_catalog', group: 'nav', label: 'Naviqasiya: Kataloq', multiline: false,
    default: { az: 'Kataloq', ru: 'Каталог', en: 'Catalogue', tr: 'Katalog', ar: 'الكتالوج' },
  },
  {
    key: 'nav_gift', group: 'nav', label: 'Naviqasiya: Hədiyyəlik', multiline: false,
    default: { az: 'Hədiyyəlik', ru: 'Подарки', en: 'Gifts', tr: 'Hediyelik', ar: 'الهدايا' },
  },
  {
    key: 'nav_giftcard', group: 'nav', label: 'Naviqasiya: Hədiyyə Kartı', multiline: false,
    default: { az: 'Hədiyyə Kartı', ru: 'Подарочная карта', en: 'Gift Card', tr: 'Hediye Kartı', ar: 'بطاقة هدية' },
  },
  {
    key: 'nav_stores', group: 'nav', label: 'Naviqasiya: Mağazalar', multiline: false,
    default: { az: 'Mağazalar', ru: 'Магазины', en: 'Stores', tr: 'Mağazalar', ar: 'المتاجر' },
  },
  {
    key: 'nav_about', group: 'nav', label: 'Naviqasiya: Haqqımızda', multiline: false,
    default: { az: 'Haqqımızda', ru: 'О нас', en: 'About', tr: 'Hakkımızda', ar: 'من نحن' },
  },
  {
    key: 'nav_contact', group: 'nav', label: 'Naviqasiya: Əlaqə', multiline: false,
    default: { az: 'Əlaqə', ru: 'Контакты', en: 'Contact', tr: 'İletişim', ar: 'اتصل بنا' },
  },
  {
    key: 'nav_corp', group: 'nav', label: 'Naviqasiya: Korporativ', multiline: false,
    default: { az: 'Korporativ', ru: 'Корпоративным', en: 'Corporate', tr: 'Kurumsal', ar: 'الشركات' },
  },

  // ── hero ──
  {
    key: 'hero_script', group: 'hero', label: 'Hero: kursiv başlıq', multiline: false,
    default: { az: 'təbiətin ən seçmə dadları', ru: 'избранные вкусы природы', en: "nature's finest flavours", tr: 'doğanın en seçkin tatları', ar: 'أجود نكهات الطبيعة' },
  },
  {
    key: 'hero_h1a', group: 'hero', label: 'Hero: H1 birinci hissə', multiline: false,
    default: { az: 'Keyfiyyətə', ru: 'Fond of', en: 'Fond of', tr: 'Fond of', ar: 'Fond of' },
  },
  {
    key: 'hero_h1em', group: 'hero', label: 'Hero: H1 vurğulu hissə', multiline: false,
    default: { az: 'Vurğunuq!', ru: 'Quality', en: 'Quality', tr: 'Quality', ar: 'Quality' },
  },
  {
    key: 'hero_lead', group: 'hero', label: 'Hero: alt mətn (abzas)', multiline: true,
    default: {
      az: 'Seçmə quru meyvələr, qoz-fındıq, ləziz şirniyyatlar və əl işi premium hədiyyə qutuları — 2015-dən bəri Azərbaycanın zövqlü süfrəsi üçün.',
      ru: 'Отборные сухофрукты, орехи, изысканные сладости и премиальные подарочные наборы ручной работы — для изысканного стола Азербайджана с 2015 года.',
      en: 'Selected dried fruits, nuts, fine sweets and handcrafted premium gift boxes — for Azerbaijan’s refined table since 2015.',
      tr: 'Seçme kuru meyveler, çerezler, leziz tatlılar ve el yapımı premium hediye kutuları — 2015’ten beri Azerbaycan’ın zarif sofrası için.',
      ar: 'فواكه مجففة مختارة، مكسرات، حلويات فاخرة وعلب هدايا فاخرة مصنوعة يدويًا — لمائدة أذربيجان الراقية منذ 2015.',
    },
  },
  {
    key: 'cta_catalog', group: 'hero', label: 'Hero: düymə — Kataloqa bax', multiline: false,
    default: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
  },
  {
    key: 'cta_stores', group: 'hero', label: 'Hero: düymə — Mağazalar', multiline: false,
    default: { az: 'Mağazalar', ru: 'Магазины', en: 'Stores', tr: 'Mağazalar', ar: 'المتاجر' },
  },

  // ── values ──
  {
    key: 'v_natural', group: 'values', label: 'Dəyər: 100% Təbii', multiline: false,
    default: { az: '100% Təbii', ru: '100% натурально', en: '100% Natural', tr: '100% Doğal', ar: 'طبيعي 100%' },
  },
  {
    key: 'v_handmade', group: 'values', label: 'Dəyər: Əl işi hədiyyə qutuları', multiline: false,
    default: { az: 'Əl işi hədiyyə qutuları', ru: 'Подарки ручной работы', en: 'Handcrafted gift boxes', tr: 'El yapımı hediye kutuları', ar: 'علب هدايا يدوية' },
  },
  {
    key: 'v_stores', group: 'values', label: 'Dəyər: mağaza sayı', multiline: false,
    default: { az: '11 mağaza · Bakı', ru: '11 магазинов · Баку', en: '11 stores · Baku', tr: '11 mağaza · Bakü', ar: '11 متجرًا · باكو' },
  },
  {
    key: 'v_est', group: 'values', label: 'Dəyər: təsis ili', multiline: false,
    default: { az: 'Est. 2015', ru: 'С 2015', en: 'Est. 2015', tr: 'Est. 2015', ar: 'تأسس 2015' },
  },

  // ── headings ──
  {
    key: 'cat_label', group: 'headings', label: 'Kateqoriyalar: kiçik başlıq (istifadə olunmur)', multiline: false,
    default: { az: 'Kateqoriyalar', ru: 'Категории', en: 'Categories', tr: 'Kategoriler', ar: 'الفئات' },
  },
  {
    key: 'cat_title', group: 'headings', label: 'Kateqoriyalar: başlıq', multiline: false,
    default: { az: 'Kolleksiyanı kəşf et', ru: 'Откройте коллекцию', en: 'Discover the collection', tr: 'Koleksiyonu keşfet', ar: 'اكتشف المجموعة' },
  },
  {
    key: 'feat_label', group: 'headings', label: 'Seçilmişlər: kiçik başlıq (istifadə olunmur)', multiline: false,
    default: { az: 'Bestseller', ru: 'Хиты продаж', en: 'Bestsellers', tr: 'Çok satanlar', ar: 'الأكثر مبيعًا' },
  },
  {
    key: 'feat_title', group: 'headings', label: 'Seçilmişlər: başlıq', multiline: false,
    default: { az: 'Seçilmiş məhsullar', ru: 'Избранные товары', en: 'Featured products', tr: 'Öne çıkan ürünler', ar: 'منتجات مختارة' },
  },
  {
    key: 'stores_label', group: 'headings', label: 'Mağazalar: kiçik başlıq', multiline: false,
    default: { az: '11 filial · Bakı', ru: '11 филиалов · Баку', en: '11 branches · Baku', tr: '11 şube · Bakü', ar: '11 فرعًا · باكو' },
  },
  {
    key: 'stores_title', group: 'headings', label: 'Mağazalar: başlıq', multiline: false,
    default: { az: 'Mağazalarımız', ru: 'Наши магазины', en: 'Our stores', tr: 'Mağazalarımız', ar: 'متاجرنا' },
  },

  // ── luxe ──
  {
    key: 'luxe_tag', group: 'luxe', label: 'Lüks: kiçik başlıq', multiline: false,
    default: { az: 'İmza kolleksiya', ru: 'Фирменная коллекция', en: 'Signature collection', tr: 'İmza koleksiyon', ar: 'مجموعة مميزة' },
  },
  {
    key: 'luxe_h1a', group: 'luxe', label: 'Lüks: başlıq birinci hissə', multiline: false,
    default: { az: 'Hədiyyə vermək', ru: 'Дарить — это', en: 'Gifting is', tr: 'Hediye vermek', ar: 'الإهداء' },
  },
  {
    key: 'luxe_h1em', group: 'luxe', label: 'Lüks: başlıq vurğulu hissə', multiline: false,
    default: { az: 'bir incəsənətdir.', ru: 'искусство.', en: 'an art.', tr: 'bir sanattır.', ar: 'فنٌّ.' },
  },
  {
    key: 'luxe_p', group: 'luxe', label: 'Lüks: mətn (abzas)', multiline: true,
    default: {
      az: 'Əl işi ağac və dəri qutularda hazırlanan premium hədiyyə seçimlərimiz — korporativ təqdimatlar, bayramlar və xüsusi anlar üçün. Hər qutu Xurcun keyfiyyəti ilə imzalanır.',
      ru: 'Наши премиальные подарки в деревянных и кожаных коробках ручной работы — для корпоративных презентов, праздников и особых моментов. Каждая коробка отмечена качеством Xurcun.',
      en: 'Our premium gift selections in handcrafted wood and leather boxes — for corporate gifts, holidays and special moments. Every box is signed with Xurcun quality.',
      tr: 'El yapımı ahşap ve deri kutularda hazırlanan premium hediye seçimlerimiz — kurumsal sunumlar, bayramlar ve özel anlar için. Her kutu Xurcun kalitesiyle imzalanır.',
      ar: 'تشكيلات هدايانا الفاخرة في علب خشبية وجلدية مصنوعة يدويًا — للهدايا المؤسسية والأعياد والمناسبات الخاصة. كل علبة موقعة بجودة Xurcun.',
    },
  },
  {
    key: 'luxe_cta', group: 'luxe', label: 'Lüks: düymə', multiline: false,
    default: { az: 'Hədiyyə qutularına bax', ru: 'Подарочные наборы', en: 'View gift boxes', tr: 'Hediye kutularına bak', ar: 'تصفح علب الهدايا' },
  },

  // ── anniversary ──
  {
    key: 'anniv_label', group: 'anniversary', label: 'Yubiley: kiçik başlıq', multiline: false,
    default: { az: 'Yubiley', ru: 'Юбилей', en: 'Anniversary', tr: 'Yıldönümü', ar: 'الذكرى السنوية' },
  },
  {
    key: 'anniv_title', group: 'anniversary', label: 'Yubiley: başlıq', multiline: false,
    default: { az: 'Bir yerdə qeyd etdik', ru: 'Мы отпраздновали вместе', en: 'We celebrated together', tr: 'Birlikte kutladık', ar: 'احتفلنا معًا' },
  },
  {
    key: 'anniv_lead', group: 'anniversary', label: 'Yubiley: alt mətn (abzas)', multiline: true,
    default: {
      az: 'Qonaqlarımız və Xurcun ailəsi ilə unudulmaz bir axşam — keyfiyyətə olan vurğunluğumuzu birlikdə qeyd etdik.',
      ru: 'Незабываемый вечер с нашими гостями и семьёй Xurcun — мы вместе отметили нашу преданность качеству.',
      en: 'An unforgettable evening with our guests and the Xurcun family — celebrating our devotion to quality, together.',
      tr: 'Konuklarımız ve Xurcun ailesiyle unutulmaz bir akşam — kaliteye olan bağlılığımızı birlikte kutladık.',
      ar: 'أمسية لا تُنسى مع ضيوفنا وعائلة Xurcun — احتفلنا معًا بشغفنا بالجودة.',
    },
  },

  // ── advanced (tiny UI / a11y / alt) ──
  {
    key: 'yeni', group: 'advanced', label: 'Nişan: Yeni', multiline: false,
    default: { az: 'Yeni', ru: 'Новинка', en: 'New', tr: 'Yeni', ar: 'جديد' },
  },
  {
    key: 'call', group: 'advanced', label: 'Düymə: Zəng et', multiline: false,
    default: { az: 'Zəng et', ru: 'Позвонить', en: 'Call', tr: 'Ara', ar: 'اتصل' },
  },

  // ── footer ──
  {
    key: 'foot_about', group: 'footer', label: 'Footer: təsvir (abzas)', multiline: true,
    default: {
      az: 'Azərbaycanın premium quru meyvə, çərəz və hədiyyə butiki. 2015-dən bəri Keyfiyyətə Vurğunuq!',
      ru: 'Премиальный бутик сухофруктов, орехов и подарков Азербайджана. Fond of Quality — с 2015 года.',
      en: 'Azerbaijan’s premium dried fruit, nuts and gift boutique. Fond of Quality since 2015.',
      tr: 'Azerbaycan’ın premium kuru meyve, çerez ve hediye butiği. 2015’ten beri Fond of Quality.',
      ar: 'بوتيك أذربيجان الفاخر للفواكه المجففة والمكسرات والهدايا. Fond of Quality منذ 2015.',
    },
  },
  {
    key: 'foot_stores', group: 'footer', label: 'Footer: Mağazalar', multiline: false,
    default: { az: 'Mağazalar', ru: 'Магазины', en: 'Stores', tr: 'Mağazalar', ar: 'المتاجر' },
  },
  {
    key: 'foot_contact', group: 'footer', label: 'Footer: Əlaqə', multiline: false,
    default: { az: 'Əlaqə', ru: 'Контакты', en: 'Contact', tr: 'İletişim', ar: 'اتصل بنا' },
  },

  // ── advanced (a11y / alt) ──
  {
    key: 'skip', group: 'advanced', label: 'A11y: əsas məzmuna keç', multiline: false,
    default: { az: 'Əsas məzmuna keç', ru: 'К основному содержанию', en: 'Skip to content', tr: 'İçeriğe geç', ar: 'انتقل إلى المحتوى' },
  },
  {
    key: 'gift_alt', group: 'advanced', label: 'Alt mətn: hədiyyə qutusu şəkli', multiline: false,
    default: {
      az: 'Qızıl lentlə bağlanmış əl işi XURCUN hədiyyə qutusu',
      ru: 'Подарочная коробка XURCUN ручной работы с золотой лентой',
      en: 'Handcrafted XURCUN gift box tied with a gold ribbon',
      tr: 'Altın kurdeleli el yapımı XURCUN hediye kutusu',
      ar: 'علبة هدايا XURCUN مصنوعة يدويًا بشريط ذهبي',
    },
  },
  {
    key: 'aria_nav', group: 'advanced', label: 'A11y: naviqasiya aria etiketi', multiline: false,
    default: { az: 'Əsas naviqasiya', ru: 'Основная навигация', en: 'Main navigation', tr: 'Ana navigasyon', ar: 'التنقل الرئيسي' },
  },
  {
    key: 'aria_lang', group: 'advanced', label: 'A11y: dil seçimi aria etiketi', multiline: false,
    default: { az: 'Dil seçimi', ru: 'Выбор языка', en: 'Language', tr: 'Dil seçimi', ar: 'اختيار اللغة' },
  },

  // ── about ──
  {
    key: 'about_tag', group: 'about', label: 'Haqqımızda: kiçik başlıq', multiline: false,
    default: { az: 'Haqqımızda', ru: 'О нас', en: 'About us', tr: 'Hakkımızda', ar: 'من نحن' },
  },
  {
    key: 'about_title', group: 'about', label: 'Haqqımızda: başlıq', multiline: false,
    default: {
      az: 'Azərbaycanın dad imzası', ru: 'Вкус Азербайджана', en: 'Azerbaijan’s signature of taste',
      tr: 'Azerbaycan’ın lezzet imzası', ar: 'بصمة طعم أذربيجان',
    },
  },
  {
    key: 'about_p1', group: 'about', label: 'Haqqımızda: birinci abzas', multiline: true,
    default: {
      az: 'Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən təsis edilib — bu gün təbii quru meyvə, qoz-fındıq, ekzotik çaylar və şirniyyatların sürətlə böyüyən butik şəbəkəsidir.',
      ru: 'Xurcun основан в 2015 году Вугаром Магеррамовым — сегодня это быстрорастущая сеть бутиков натуральных сухофруктов, орехов, экзотических чаёв и сладостей.',
      en: 'Founded in 2015 by Vugar Maharramov, Xurcun is today a fast-growing chain of boutiques for natural dried fruits, nuts, exotic teas and sweets.',
      tr: '2015’te Vugar Maharramov tarafından kurulan Xurcun, bugün doğal kuru meyve, çerez, egzotik çaylar ve tatlıların hızla büyüyen butik zinciridir.',
      ar: 'تأسست Xurcun عام 2015 على يد فوغار محرموف، وهي اليوم سلسلة بوتيكات سريعة النمو للفواكه المجففة الطبيعية والمكسرات والشاي والحلويات.',
    },
  },
  {
    key: 'about_p2', group: 'about', label: 'Haqqımızda: ikinci abzas', multiline: true,
    default: {
      az: 'Bütün məhsullarımız orqanik və təbiidir, konservant yoxdur; qlütensiz seçimlər də mövcuddur. «Keyfiyyətə Vurğunuq!» sadəcə şüar deyil — hər qutuya qoyduğumuz vəddir. Qonaqlar Azərbaycanın dadını dünyaya aparmaq üçün Xurcun-u seçir.',
      ru: 'Вся наша продукция органическая и натуральная, без консервантов; есть и безглютеновые варианты. «Fond of Quality» — не просто слоган, а обещание в каждой коробке. Гости выбирают Xurcun, чтобы увезти вкус Азербайджана с собой.',
      en: 'All our products are organic and natural, with no preservatives, and gluten-free options too. “Fond of Quality” is not just a slogan — it is the promise in every box. Guests choose Xurcun to carry the taste of Azerbaijan home.',
      tr: 'Tüm ürünlerimiz organik ve doğaldır, koruyucu içermez; glutensiz seçenekler de vardır. “Fond of Quality” yalnızca bir slogan değil — her kutuya koyduğumuz sözdür. Misafirler Azerbaycan’ın lezzetini yanlarında götürmek için Xurcun’u seçer.',
      ar: 'جميع منتجاتنا عضوية وطبيعية وخالية من المواد الحافظة، مع خيارات خالية من الغلوتين. «Fond of Quality» ليس مجرد شعار — بل وعدٌ في كل علبة. يختار الضيوف Xurcun ليحملوا نكهة أذربيجان معهم.',
    },
  },
  {
    key: 'about_alt', group: 'advanced', label: 'Alt mətn: haqqımızda şəkli', multiline: false,
    default: {
      az: 'Xurcun mağazasında məhsulların tərəzidə çəkilməsi',
      ru: 'Взвешивание продукции в бутике Xurcun',
      en: 'Weighing products at a Xurcun boutique counter',
      tr: 'Xurcun mağazasında ürünlerin tartılması',
      ar: 'وزن المنتجات في متجر Xurcun',
    },
  },
  {
    key: 'about_sound', group: 'advanced', label: 'UI: səs üçün toxun', multiline: false,
    default: {
      az: 'Səs üçün toxunun',
      ru: 'Нажмите для звука',
      en: 'Tap for sound',
      tr: 'Ses için dokunun',
      ar: 'انقر للصوت',
    },
  },
];

export const HOMEPAGE_TEXT_DEFAULTS = HOMEPAGE_TEXT_FIELDS.map((f) => ({ key: f.key, ...f.default }));

export const TEXT_DEFAULT: Record<string, L5> = Object.fromEntries(
  HOMEPAGE_TEXT_FIELDS.map((f) => [f.key, f.default]),
);
