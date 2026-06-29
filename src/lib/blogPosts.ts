// Xurcun blog — evergreen, SEO-focused articles. Fully multilingual
// (AZ/RU/EN/TR/AR). Content-in-code (no CMS). Slugs mirrored in
// api/lib/vite.ts (ROUTE_META) and api/boot.ts (sitemap).

export type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar';
export type L = { az: string; ru: string; en: string; tr: string; ar: string };
export type BlogSection = { h2: L; body: L[]; image?: string; imageAlt?: L; gallery?: { src: string; alt: L }[] };
export type BlogPost = {
  slug: string;
  date: string;
  cover: string;
  title: L;
  desc: L;
  h1: L;
  lead: L;
  sections: BlogSection[];
};

// AZ is the source of truth; all 5 languages provided. pickL falls back to AZ.
export function pickL(m: L, lang: Lang): string {
  return (m as Record<string, string>)[lang] ?? m.az;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "toy-xoncasi",
    date: "2026-06-28",
    cover: "/images/home/gift.webp",
    title: {
      az: "Toy xonçası — premium hədiyyə xonçaları | Xurcun",
      ru: "Свадебная хонча — премиальные подарочные подносы | Xurcun",
      en: "Wedding xonça — premium gift trays | Xurcun",
      tr: "Düğün honçası — premium hediye tepsileri | Xurcun",
      ar: "صينية العرس (خونچا) — صواني هدايا فاخرة | Xurcun",
    },
    desc: {
      az: "Toy, nişan və hədiyyə xonçaları: necə hazırlanır, içində nə olur və Xurcun-dan premium xonça necə sifariş edilir. Bakıda 11 mağaza.",
      ru: "Свадебные и подарочные хончи: что внутри и как заказать премиальную хончу в Xurcun. 11 магазинов в Баку.",
      en: "Wedding and gift trays (xonça): what's inside and how to order a premium tray from Xurcun. 11 stores in Baku.",
      tr: "Düğün ve hediye honçaları: içinde ne var ve Xurcun'dan premium honça nasıl sipariş edilir. Bakü'de 11 mağaza.",
      ar: "صواني العرس والهدايا (خونچا): ماذا بداخلها وكيف تطلب صينية فاخرة من Xurcun. 11 متجرًا في باكو.",
    },
    h1: {
      az: "Toy xonçası — ənənə və zərafət bir arada",
      ru: "Свадебная хонча — традиция и изысканность",
      en: "Wedding xonça — tradition meets elegance",
      tr: "Düğün honçası — gelenek ve zarafet bir arada",
      ar: "صينية العرس — تقليد وأناقة معًا",
    },
    lead: {
      az: "Toy və nişan mərasimlərinin ən gözəl ənənələrindən biri olan xonça — qarşı tərəfə hörmət və zövqün ifadəsidir. Xurcun premium quru meyvə, qoz-fındıq, şokolad, lokum və paxlava ilə bəzədilmiş, əl işi xonçalar hazırlayır.",
      ru: "Хонча — одна из красивейших традиций свадеб и помолвок, выражение уважения и вкуса. Xurcun готовит хончи ручной работы с премиальными сухофруктами, орехами, шоколадом, лукумом и пахлавой.",
      en: "The xonça — one of the most beautiful wedding and engagement traditions — is an expression of respect and taste. Xurcun crafts handmade trays with premium dried fruit, nuts, chocolate, Turkish delight and baklava.",
      tr: "Düğün ve nişan törenlerinin en güzel geleneklerinden biri olan honça, karşı tarafa saygı ve zarafetin ifadesidir. Xurcun; premium kuru meyve, çerez, çikolata, lokum ve baklava ile süslenmiş el yapımı honçalar hazırlar.",
      ar: "صينية الخونچا — من أجمل تقاليد الأعراس والخطوبة — تعبير عن الاحترام والذوق الرفيع. تصنع Xurcun صواني يدوية مزيّنة بالفواكه المجففة الفاخرة والمكسرات والشوكولاتة والحلقوم والبقلاوة.",
    },
    sections: [
      {
        h2: { az: "Xonça nədir və niyə vacibdir?", ru: "Что такое хонча и почему она важна?", en: "What is a xonça and why does it matter?", tr: "Honça nedir ve neden önemlidir?", ar: "ما هي الخونچا ولماذا هي مهمة؟" },
        body: [
          { az: "Xonça — bəzədilmiş sini və ya qutuda təqdim olunan hədiyyə dəstidir. Azərbaycan toy adətlərində iki ailə arasında hörmət əlaməti kimi mübadilə olunur.", ru: "Хонча — это подарочный набор на украшенном подносе или в коробке. В азербайджанских свадебных традициях им обмениваются между семьями в знак уважения.", en: "A xonça is a gift set presented on a decorated tray or box. In Azerbaijani wedding customs it is exchanged between families as a sign of respect.", tr: "Honça, süslü bir tepsi veya kutuda sunulan hediye setidir. Azerbaycan düğün geleneklerinde iki aile arasında saygı nişanesi olarak değiş tokuş edilir.", ar: "الخونچا مجموعة هدايا تُقدَّم على صينية مزخرفة أو في علبة. وفي تقاليد الأعراس الأذربيجانية يُتبادل بين العائلتين تعبيرًا عن الاحترام." },
          { az: "Xonçanın görünüşü və içindəkilər ailənin zövqünü əks etdirir — buna görə keyfiyyət və zərafət əsasdır.", ru: "Внешний вид и содержимое хончи отражают вкус семьи — поэтому качество и изящество здесь главное.", en: "Its look and contents reflect the family's taste — so quality and elegance are key.", tr: "Honçanın görünümü ve içeriği ailenin zevkini yansıtır; bu yüzden kalite ve zarafet esastır.", ar: "مظهر الخونچا ومحتواها يعكسان ذوق العائلة، لذا تبقى الجودة والأناقة هما الأساس." },
        ],
      },
      {
        h2: { az: "Xurcun xonçalarının içində nə olur?", ru: "Что внутри хончей Xurcun?", en: "What's inside Xurcun trays?", tr: "Xurcun honçalarının içinde ne var?", ar: "ماذا يوجد داخل صواني Xurcun؟" },
        body: [
          { az: "Seçmə quru meyvələr, premium qoz-fındıq, ləziz şokoladlar, müxtəlif çeşid lokum və ənənəvi paxlava.", ru: "Отборные сухофрукты, премиальные орехи, изысканный шоколад, разные виды лукума и традиционная пахлава.", en: "Selected dried fruit, premium nuts, fine chocolate, assorted Turkish delight and traditional baklava.", tr: "Seçme kuru meyveler, premium çerezler, lezzetli çikolatalar, çeşitli lokumlar ve geleneksel baklava.", ar: "فواكه مجففة منتقاة، مكسرات فاخرة، شوكولاتة لذيذة، أنواع مختلفة من الحلقوم وبقلاوة تقليدية." },
          { az: "Hər xonça əl işi ilə, qızıl lent və zövqlü tərtibatla hazırlanır — istəyə görə tərkibini fərdiləşdirmək mümkündür.", ru: "Каждая хонча собирается вручную, с золотой лентой и изысканным оформлением — состав можно подобрать по желанию.", en: "Each tray is assembled by hand with a gold ribbon and elegant styling — the contents can be customised.", tr: "Her honça, altın kurdele ve zarif bir tasarımla elde hazırlanır; içeriği isteğe göre kişiselleştirilebilir.", ar: "تُجهَّز كل صينية يدويًا بشريط ذهبي وتنسيق أنيق، ويمكن تخصيص محتواها حسب الطلب." },
        ],
      },
      {
        h2: { az: "Necə sifariş etmək olar?", ru: "Как заказать?", en: "How to order?", tr: "Nasıl sipariş verilir?", ar: "كيف تطلب؟" },
        body: [
          { az: "Kataloqdan bəyəndiyiniz məhsulları seçib WhatsApp ilə sifariş edə, yaxud Bakıdakı 11 Xurcun mağazasından birinə yaxınlaşa bilərsiniz.", ru: "Выберите товары в каталоге и оформите заказ в WhatsApp или зайдите в один из 11 магазинов Xurcun в Баку.", en: "Pick products in the catalogue and order on WhatsApp, or visit one of Xurcun's 11 stores in Baku.", tr: "Katalogdan ürünleri seçip WhatsApp üzerinden sipariş verebilir ya da Bakü'deki 11 Xurcun mağazasından birine uğrayabilirsiniz.", ar: "اختر المنتجات من الكتالوج واطلب عبر واتساب، أو زُر أحد متاجر Xurcun الـ11 في باكو." },
          { az: "Korporativ və çoxsaylı sifarişlər üçün xüsusi tərtibat və endirim imkanları mövcuddur.", ru: "Для корпоративных и крупных заказов доступны индивидуальное оформление и скидки.", en: "Custom styling and discounts are available for corporate and bulk orders.", tr: "Kurumsal ve toplu siparişler için özel tasarım ve indirim imkânları mevcuttur.", ar: "تتوفر تصاميم خاصة وخصومات للطلبات المؤسسية والكميات الكبيرة." },
        ],
      },
    ],
  },
  {
    slug: "bayram-hediyyeleri",
    date: "2026-06-28",
    cover: "/images/home/gift.webp",
    title: {
      az: "Bayram hədiyyələri — Novruz, Ramazan, Yeni il | Xurcun",
      ru: "Праздничные подарки — Новруз, Рамазан, Новый год | Xurcun",
      en: "Holiday gifts — Novruz, Ramadan, New Year | Xurcun",
      tr: "Bayram hediyeleri — Nevruz, Ramazan, Yılbaşı | Xurcun",
      ar: "هدايا الأعياد — نوروز ورمضان ورأس السنة | Xurcun",
    },
    desc: {
      az: "Bayramlar üçün premium hədiyyə ideyaları: quru meyvə, şokolad, lokum və paxlava qutuları. Xurcun-dan zövqlü bayram hədiyyələri, Bakı.",
      ru: "Идеи премиальных подарков к праздникам: коробки с сухофруктами, шоколадом, лукумом и пахлавой. Xurcun, Баку.",
      en: "Premium holiday gift ideas: boxes with dried fruit, chocolate, Turkish delight and baklava. Xurcun, Baku.",
      tr: "Bayramlar için premium hediye fikirleri: kuru meyve, çikolata, lokum ve baklava kutuları. Xurcun, Bakü.",
      ar: "أفكار هدايا فاخرة للأعياد: علب فواكه مجففة وشوكولاتة وحلقوم وبقلاوة. Xurcun، باكو.",
    },
    h1: {
      az: "Bayram hədiyyələri — hər mərasim üçün zövqlü seçim",
      ru: "Праздничные подарки — со вкусом для любого случая",
      en: "Holiday gifts — a tasteful choice for every occasion",
      tr: "Bayram hediyeleri — her tören için zarif bir seçim",
      ar: "هدايا الأعياد — اختيار أنيق لكل مناسبة",
    },
    lead: {
      az: "Novruz, Ramazan, Yeni il və ya doğum günü — hər bayramın öz dadı var. Xurcun premium quru meyvə, çərəz və şirniyyatlardan ibarət, hər münasibətə uyğun hədiyyə qutuları təqdim edir.",
      ru: "Новруз, Рамазан, Новый год или день рождения — у каждого праздника свой вкус. Xurcun предлагает подарочные коробки из премиальных сухофруктов, снеков и сладостей на любой случай.",
      en: "Novruz, Ramadan, New Year or a birthday — every holiday has its flavour. Xurcun offers gift boxes of premium dried fruit, snacks and sweets for any occasion.",
      tr: "Nevruz, Ramazan, yılbaşı veya doğum günü — her bayramın kendine has bir tadı vardır. Xurcun; premium kuru meyve, çerez ve tatlılardan oluşan, her duruma uygun hediye kutuları sunar.",
      ar: "نوروز، رمضان، رأس السنة أو عيد ميلاد — لكل مناسبة نكهتها. تقدّم Xurcun علب هدايا من الفواكه المجففة الفاخرة والمكسرات والحلويات تناسب كل مناسبة.",
    },
    sections: [
      {
        h2: { az: "Novruz üçün", ru: "Для Новруза", en: "For Novruz", tr: "Nevruz için", ar: "لعيد نوروز" },
        body: [
          { az: "Novruz süfrəsinin yaraşığı — quru meyvə, qoz-fındıq, şəkərbura və paxlava. Xurcun bayram qutuları milli ənənəni premium keyfiyyətlə birləşdirir.", ru: "Украшение новрузского стола — сухофрукты, орехи, шекербура и пахлава. Праздничные коробки Xurcun сочетают традицию и премиальное качество.", en: "The Novruz table's pride — dried fruit, nuts, shakarbura and baklava. Xurcun holiday boxes blend tradition with premium quality.", tr: "Nevruz sofrasının süsü — kuru meyve, çerez, şekerbura ve baklava. Xurcun bayram kutuları geleneği premium kaliteyle birleştirir.", ar: "زينة مائدة نوروز — فواكه مجففة ومكسرات وشكربورا وبقلاوة. علب Xurcun للأعياد تمزج التقليد بالجودة الفاخرة." },
        ],
      },
      {
        h2: { az: "Ramazan və Yeni il üçün", ru: "Для Рамазана и Нового года", en: "For Ramadan and New Year", tr: "Ramazan ve yılbaşı için", ar: "لرمضان ورأس السنة" },
        body: [
          { az: "Ramazanda lokum, xurma və çay dəstləri; Yeni ildə isə şokolad və qarışıq hədiyyə qutuları ən çox seçilən variantlardır.", ru: "В Рамазан — лукум, финики и чайные наборы; на Новый год — шоколад и ассорти-коробки.", en: "In Ramadan — Turkish delight, dates and tea sets; for New Year — chocolate and assorted gift boxes.", tr: "Ramazan'da lokum, hurma ve çay setleri; yılbaşında ise çikolata ve karışık hediye kutuları en çok tercih edilenler.", ar: "في رمضان: حلقوم وتمر وأطقم شاي؛ وفي رأس السنة: شوكولاتة وعلب هدايا متنوعة." },
          { az: "Bütün qutular əl işi ilə bəzədilir və hədiyyə üçün hazır təqdim olunur.", ru: "Все коробки оформляются вручную и готовы к дарению.", en: "All boxes are decorated by hand and presented ready to gift.", tr: "Tüm kutular elde süslenir ve hediye için hazır sunulur.", ar: "تُزيَّن جميع العلب يدويًا وتُقدَّم جاهزة للإهداء." },
        ],
      },
      {
        h2: { az: "Korporativ bayram hədiyyələri", ru: "Корпоративные праздничные подарки", en: "Corporate holiday gifts", tr: "Kurumsal bayram hediyeleri", ar: "هدايا الأعياد المؤسسية" },
        body: [
          { az: "Şirkətlər üçün loqolu və xüsusi tərtibatlı korporativ hədiyyə qutuları hazırlayırıq. Çoxsaylı sifarişlərə xüsusi şərtlər tətbiq olunur.", ru: "Для компаний готовим корпоративные коробки с логотипом и индивидуальным оформлением. Для крупных заказов — особые условия.", en: "For companies we make corporate boxes with logo and custom styling. Special terms apply to bulk orders.", tr: "Şirketler için logolu ve özel tasarımlı kurumsal hediye kutuları hazırlıyoruz. Toplu siparişlere özel koşullar uygulanır.", ar: "نُعدّ للشركات علب هدايا مؤسسية بشعارها وبتصميم خاص. وتُطبَّق شروط خاصة على الطلبات بالجملة." },
        ],
      },
    ],
  },
  {
    slug: "premium-hediyye-qutulari",
    date: "2026-06-28",
    cover: "/brand/og-image.jpg",
    title: {
      az: "Premium hədiyyəlik qutular | Xurcun — əl işi qutular",
      ru: "Премиальные подарочные коробки | Xurcun — ручная работа",
      en: "Premium gift boxes | Xurcun — handcrafted boxes",
      tr: "Premium hediye kutuları | Xurcun — el yapımı kutular",
      ar: "علب هدايا فاخرة | Xurcun — علب مصنوعة يدويًا",
    },
    desc: {
      az: "Əl işi premium hədiyyə qutuları — korporativ, bayram və şəxsi münasibətlər üçün. Quru meyvə, şokolad, lokum və paxlava ilə. Xurcun, Bakı.",
      ru: "Премиальные подарочные коробки ручной работы — для корпоративных, праздничных и личных поводов. Xurcun, Баку.",
      en: "Handcrafted premium gift boxes — for corporate, holiday and personal occasions. Xurcun, Baku.",
      tr: "El yapımı premium hediye kutuları — kurumsal, bayram ve kişisel durumlar için. Xurcun, Bakü.",
      ar: "علب هدايا فاخرة مصنوعة يدويًا — للمناسبات المؤسسية والأعياد والمناسبات الشخصية. Xurcun، باكو.",
    },
    h1: {
      az: "Premium hədiyyəlik qutular",
      ru: "Премиальные подарочные коробки",
      en: "Premium gift boxes",
      tr: "Premium hediye kutuları",
      ar: "علب الهدايا الفاخرة",
    },
    lead: {
      az: "Hədiyyə vermək bir incəsənətdir. Xurcun-un əl işi qutu tərtibatlı premium hədiyyə dəstləri — korporativ təqdimatlar, bayramlar və xüsusi anlar üçün hazırlanır.",
      ru: "Дарить — это искусство. Премиальные подарочные наборы Xurcun ручной работы создаются для корпоративных подарков, праздников и особых моментов.",
      en: "Gifting is an art. Xurcun's handcrafted premium gift sets are made for corporate gifts, holidays and special moments.",
      tr: "Hediye vermek bir sanattır. Xurcun'un el yapımı premium hediye setleri; kurumsal hediyeler, bayramlar ve özel anlar için hazırlanır.",
      ar: "الإهداء فنّ. تُصنع مجموعات Xurcun الفاخرة يدويًا للهدايا المؤسسية والأعياد واللحظات المميزة.",
    },
    sections: [
      {
        h2: { az: "Kimlər üçün uyğundur?", ru: "Кому подойдёт?", en: "Who are they for?", tr: "Kimler için uygun?", ar: "لمن تناسب؟" },
        body: [
          { az: "Korporativ müştərilər, biznes tərəfdaşları, sevdikləriniz və ya özünüz üçün — hər zövqə uyğun ölçü və tərkib seçimi mövcuddur.", ru: "Корпоративным клиентам, партнёрам, близким или себе — есть выбор размеров и состава на любой вкус.", en: "Corporate clients, partners, loved ones or yourself — there's a size and composition for every taste.", tr: "Kurumsal müşteriler, iş ortakları, sevdikleriniz veya kendiniz için — her zevke uygun boyut ve içerik seçeneği vardır.", ar: "للعملاء المؤسسيين والشركاء والأحبّة أو لنفسك — تتوفر أحجام ومحتويات تناسب كل ذوق." },
        ],
      },
      {
        h2: { az: "Fərdiləşdirmə", ru: "Персонализация", en: "Personalisation", tr: "Kişiselleştirme", ar: "التخصيص" },
        body: [
          { az: "Qutunun içindəkiləri, ölçüsünü və tərtibatını istəyinizə görə seçə bilərsiniz. Korporativ sifarişlər üçün loqo və xüsusi dizayn mümkündür.", ru: "Содержимое, размер и оформление коробки выбираете вы. Для корпоративных заказов возможны логотип и индивидуальный дизайн.", en: "You choose the contents, size and styling. Logo and custom design are available for corporate orders.", tr: "Kutunun içeriğini, boyutunu ve tasarımını siz seçersiniz. Kurumsal siparişlerde logo ve özel tasarım mümkündür.", ar: "أنت من يختار المحتوى والحجم والتنسيق. ويمكن إضافة الشعار وتصميم خاص للطلبات المؤسسية." },
        ],
      },
      {
        h2: { az: "Sifariş", ru: "Заказ", en: "Ordering", tr: "Sipariş", ar: "الطلب" },
        body: [
          { az: "Kataloqa baxın, bəyəndiyinizi seçin və WhatsApp ilə sifariş edin — və ya Bakıdakı 11 mağazamızdan birinə gəlin.", ru: "Посмотрите каталог, выберите и закажите в WhatsApp — или зайдите в один из 11 магазинов в Баку.", en: "Browse the catalogue, choose and order on WhatsApp — or visit one of our 11 stores in Baku.", tr: "Kataloğa göz atın, seçin ve WhatsApp'tan sipariş verin — ya da Bakü'deki 11 mağazamızdan birine gelin.", ar: "تصفّح الكتالوج، اختر واطلب عبر واتساب — أو زُر أحد متاجرنا الـ11 في باكو." },
        ],
      },
    ],
  },
  {
    slug: "sokolad",
    date: "2026-06-28",
    cover: "/images/home/about.webp",
    title: {
      az: "Premium şokolad | Xurcun — süd və qara şokolad",
      ru: "Премиальный шоколад | Xurcun — молочный и тёмный",
      en: "Premium chocolate | Xurcun — milk and dark",
      tr: "Premium çikolata | Xurcun — sütlü ve bitter",
      ar: "شوكولاتة فاخرة | Xurcun — بالحليب وداكنة",
    },
    desc: {
      az: "Xurcun premium şokoladları — süd, qara və qarışıq çeşidlər. Hədiyyə üçün ideal şokolad qutuları. Bakıda 11 mağaza.",
      ru: "Премиальный шоколад Xurcun — молочный, тёмный и ассорти. Идеальные шоколадные коробки для подарка. 11 магазинов в Баку.",
      en: "Xurcun premium chocolate — milk, dark and assorted. Ideal chocolate gift boxes. 11 stores in Baku.",
      tr: "Xurcun premium çikolataları — sütlü, bitter ve karışık. Hediye için ideal çikolata kutuları. Bakü'de 11 mağaza.",
      ar: "شوكولاتة Xurcun الفاخرة — بالحليب وداكنة ومتنوعة. علب شوكولاتة مثالية للهدايا. 11 متجرًا في باكو.",
    },
    h1: {
      az: "Premium şokolad seçimi",
      ru: "Выбор премиального шоколада",
      en: "Premium chocolate selection",
      tr: "Premium çikolata seçkisi",
      ar: "تشكيلة الشوكولاتة الفاخرة",
    },
    lead: {
      az: "Keyfiyyətli kakao, zərif dad. Xurcun-un premium şokolad çeşidi — həm gündəlik zövq, həm də hədiyyə üçün mükəmməl seçimdir.",
      ru: "Качественное какао, утончённый вкус. Премиальный ассортимент шоколада Xurcun — и для удовольствия, и для подарка.",
      en: "Quality cocoa, refined taste. Xurcun's premium chocolate range is perfect for everyday pleasure and for gifting.",
      tr: "Kaliteli kakao, zarif bir tat. Xurcun'un premium çikolata çeşidi hem günlük keyif hem de hediye için mükemmel.",
      ar: "كاكاو عالي الجودة وطعم راقٍ. تشكيلة Xurcun الفاخرة من الشوكولاتة مثالية للمتعة اليومية وللإهداء.",
    },
    sections: [
      {
        h2: { az: "Çeşidlər", ru: "Виды", en: "Varieties", tr: "Çeşitler", ar: "الأنواع" },
        body: [
          { az: "Süd şokoladı, qara şokolad və qoz-fındıqlı qarışıqlar. Hər biri seçmə tərkib və zərif təqdimatla.", ru: "Молочный, тёмный шоколад и ассорти с орехами. Каждый — отборный состав и изящная подача.", en: "Milk chocolate, dark chocolate and nutty assortments. Each with selected ingredients and elegant presentation.", tr: "Sütlü çikolata, bitter çikolata ve çerezli karışımlar. Her biri seçme içerik ve zarif sunumla.", ar: "شوكولاتة بالحليب وشوكولاتة داكنة وتشكيلات بالمكسرات. كلٌّ منها بمكونات منتقاة وتقديم أنيق." },
        ],
      },
      {
        h2: { az: "Hədiyyə üçün şokolad", ru: "Шоколад в подарок", en: "Chocolate as a gift", tr: "Hediyelik çikolata", ar: "الشوكولاتة كهدية" },
        body: [
          { az: "Şokoladlar premium hədiyyə qutularının da əsas tərkib hissəsidir — bayram və korporativ hədiyyələr üçün ideal.", ru: "Шоколад — основа премиальных подарочных коробок: идеален для праздничных и корпоративных подарков.", en: "Chocolate is a core part of premium gift boxes — ideal for holiday and corporate gifts.", tr: "Çikolata, premium hediye kutularının da temel parçasıdır — bayram ve kurumsal hediyeler için ideal.", ar: "الشوكولاتة جزء أساسي من علب الهدايا الفاخرة — مثالية لهدايا الأعياد والهدايا المؤسسية." },
        ],
      },
    ],
  },
  {
    slug: "paxlava",
    date: "2026-06-28",
    cover: "/images/home/about.webp",
    title: {
      az: "Paxlava | Xurcun — ənənəvi dad, premium keyfiyyət",
      ru: "Пахлава | Xurcun — традиционный вкус, премиум",
      en: "Baklava | Xurcun — traditional taste, premium quality",
      tr: "Baklava | Xurcun — geleneksel lezzet, premium kalite",
      ar: "بقلاوة | Xurcun — طعم تقليدي وجودة فاخرة",
    },
    desc: {
      az: "Xurcun paxlavası — ənənəvi resept, seçmə qoz-fındıq və premium keyfiyyət. Bayram süfrələri və hədiyyə üçün. Bakıda 11 mağaza.",
      ru: "Пахлава Xurcun — традиционный рецепт, отборные орехи и премиальное качество. Для праздников и подарка. 11 магазинов в Баку.",
      en: "Xurcun baklava — traditional recipe, selected nuts and premium quality. For holiday tables and gifting. 11 stores in Baku.",
      tr: "Xurcun baklavası — geleneksel tarif, seçme çerez ve premium kalite. Bayram sofraları ve hediye için. Bakü'de 11 mağaza.",
      ar: "بقلاوة Xurcun — وصفة تقليدية ومكسرات منتقاة وجودة فاخرة. لموائد الأعياد والإهداء. 11 متجرًا في باكو.",
    },
    h1: {
      az: "Paxlava — ənənəvi dad, premium keyfiyyət",
      ru: "Пахлава — традиционный вкус, премиальное качество",
      en: "Baklava — traditional taste, premium quality",
      tr: "Baklava — geleneksel lezzet, premium kalite",
      ar: "البقلاوة — طعم تقليدي وجودة فاخرة",
    },
    lead: {
      az: "Paxlava — Azərbaycan və Şərq süfrələrinin baş tacı. Xurcun paxlavası ənənəvi resept əsasında, seçmə qoz-fındıq və keyfiyyətli tərkiblə hazırlanır.",
      ru: "Пахлава — украшение азербайджанского и восточного стола. Пахлава Xurcun готовится по традиционному рецепту из отборных орехов и качественных ингредиентов.",
      en: "Baklava is the crown of Azerbaijani and Eastern tables. Xurcun baklava is made to a traditional recipe with selected nuts and quality ingredients.",
      tr: "Baklava, Azerbaycan ve Doğu sofralarının baş tacıdır. Xurcun baklavası geleneksel tarifle, seçme çerez ve kaliteli içerikle hazırlanır.",
      ar: "البقلاوة تاج موائد أذربيجان والشرق. تُحضَّر بقلاوة Xurcun وفق وصفة تقليدية بمكسرات منتقاة ومكونات عالية الجودة.",
    },
    sections: [
      {
        h2: { az: "Niyə Xurcun paxlavası?", ru: "Почему пахлава Xurcun?", en: "Why Xurcun baklava?", tr: "Neden Xurcun baklavası?", ar: "لماذا بقلاوة Xurcun؟" },
        body: [
          { az: "Təbii tərkib, konservant yoxdur, seçmə qoz-fındıq və balanslı şirinlik — hər tikədə ənənəvi dad.", ru: "Натуральный состав, без консервантов, отборные орехи и сбалансированная сладость — традиционный вкус в каждом кусочке.", en: "Natural ingredients, no preservatives, selected nuts and balanced sweetness — traditional taste in every piece.", tr: "Doğal içerik, koruyucusuz, seçme çerez ve dengeli tatlılık — her dilimde geleneksel lezzet.", ar: "مكونات طبيعية بلا مواد حافظة، مكسرات منتقاة وحلاوة متوازنة — طعم تقليدي في كل قطعة." },
        ],
      },
      {
        h2: { az: "Bayram və hədiyyə üçün", ru: "Для праздника и подарка", en: "For holidays and gifting", tr: "Bayram ve hediye için", ar: "للأعياد والإهداء" },
        body: [
          { az: "Paxlava bayram süfrələrinin və hədiyyə xonçalarının ayrılmaz hissəsidir. Hədiyyə üçün hazır qutularda təqdim olunur.", ru: "Пахлава — неотъемлемая часть праздничного стола и подарочных хончей. Подаётся в готовых подарочных коробках.", en: "Baklava is essential to holiday tables and gift trays. It is presented in ready-to-gift boxes.", tr: "Baklava, bayram sofralarının ve hediye honçalarının ayrılmaz parçasıdır. Hediye için hazır kutularda sunulur.", ar: "البقلاوة جزء لا يتجزأ من موائد الأعياد وصواني الهدايا، وتُقدَّم في علب جاهزة للإهداء." },
        ],
      },
    ],
  },
  {
    slug: "lokum",
    date: "2026-06-28",
    cover: "/images/home/gift.webp",
    title: {
      az: "Lokum (rahat) | Xurcun — çeşidlər və hədiyyə",
      ru: "Лукум (рахат) | Xurcun — виды и подарок",
      en: "Turkish delight (lokum) | Xurcun — varieties & gifts",
      tr: "Lokum | Xurcun — çeşitler ve hediye",
      ar: "حلقوم (راحة) | Xurcun — أنواع وهدايا",
    },
    desc: {
      az: "Xurcun lokumu — qoz, püstə və meyvəli çeşidlər. Hədiyyə üçün zərif lokum qutuları. Premium keyfiyyət, Bakıda 11 mağaza.",
      ru: "Лукум Xurcun — с орехом, фисташкой и фруктами. Изящные коробки лукума в подарок. Премиум, 11 магазинов в Баку.",
      en: "Xurcun Turkish delight — walnut, pistachio and fruit varieties. Elegant gift boxes. Premium quality, 11 stores in Baku.",
      tr: "Xurcun lokumu — cevizli, fıstıklı ve meyveli çeşitler. Hediye için zarif lokum kutuları. Premium kalite, Bakü'de 11 mağaza.",
      ar: "حلقوم Xurcun — بالجوز والفستق وبالفواكه. علب حلقوم أنيقة للهدايا. جودة فاخرة، 11 متجرًا في باكو.",
    },
    h1: {
      az: "Lokum — zərif dad, rəngarəng çeşid",
      ru: "Лукум — нежный вкус, яркое разнообразие",
      en: "Turkish delight — delicate taste, colourful variety",
      tr: "Lokum — zarif lezzet, rengârenk çeşit",
      ar: "الحلقوم — طعم رقيق وتنوّع زاهٍ",
    },
    lead: {
      az: "Lokum (rahat) — yumşaq, ətirli və rəngarəng. Xurcun-un lokum çeşidi seçmə tərkib və zərif təqdimatla həm zövq, həm hədiyyə üçün uyğundur.",
      ru: "Лукум (рахат) — мягкий, ароматный и яркий. Ассортимент лукума Xurcun с отборным составом подходит и для удовольствия, и для подарка.",
      en: "Turkish delight (lokum) — soft, fragrant and colourful. Xurcun's range, with selected ingredients, suits both pleasure and gifting.",
      tr: "Lokum — yumuşak, hoş kokulu ve rengârenk. Xurcun'un lokum çeşidi seçme içerik ve zarif sunumla hem keyif hem hediye için uygundur.",
      ar: "الحلقوم — ناعم وعطري وزاهي الألوان. تشكيلة Xurcun من الحلقوم بمكونات منتقاة تناسب المتعة والإهداء معًا.",
    },
    sections: [
      {
        h2: { az: "Çeşidlər", ru: "Виды", en: "Varieties", tr: "Çeşitler", ar: "الأنواع" },
        body: [
          { az: "Qoz lokum, püstəli lokum və meyvəli variantlar — müxtəlif dad və rəng seçimi.", ru: "Лукум с орехом, с фисташкой и фруктовые варианты — разнообразие вкусов и цветов.", en: "Walnut, pistachio and fruit varieties — a range of tastes and colours.", tr: "Cevizli lokum, fıstıklı lokum ve meyveli çeşitler — farklı tat ve renk seçenekleri.", ar: "حلقوم بالجوز وبالفستق وأنواع بالفواكه — تنوّع في الطعم والألوان." },
        ],
      },
      {
        h2: { az: "Hədiyyə üçün lokum", ru: "Лукум в подарок", en: "Lokum as a gift", tr: "Hediyelik lokum", ar: "الحلقوم كهدية" },
        body: [
          { az: "Lokum premium hədiyyə qutularının və toy xonçalarının sevimli tərkib hissəsidir.", ru: "Лукум — любимая часть премиальных подарочных коробок и свадебных хончей.", en: "Turkish delight is a favourite part of premium gift boxes and wedding trays.", tr: "Lokum, premium hediye kutularının ve düğün honçalarının sevilen bir parçasıdır.", ar: "الحلقوم جزء محبوب من علب الهدايا الفاخرة وصواني الأعراس." },
        ],
      },
    ],
  },
  {
    slug: "quru-meyve-faydalari",
    date: "2026-06-28",
    cover: "/images/home/about.webp",
    title: {
      az: "Quru meyvə və qoz-fındığın faydaları | Xurcun",
      ru: "Польза сухофруктов и орехов | Xurcun",
      en: "Health benefits of dried fruit and nuts | Xurcun",
      tr: "Kuru meyve ve çerezin faydaları | Xurcun",
      ar: "فوائد الفواكه المجففة والمكسرات | Xurcun",
    },
    desc: {
      az: "Quru meyvə və qoz-fındıq niyə faydalıdır: vitaminlər, lif, enerji. Sağlam çərəz seçimi və gündəlik norma. Xurcun, Bakı.",
      ru: "Чем полезны сухофрукты и орехи: витамины, клетчатка, энергия. Здоровый перекус и суточная норма. Xurcun, Баку.",
      en: "Why dried fruit and nuts are good for you: vitamins, fibre, energy. A healthy snack and daily portion. Xurcun, Baku.",
      tr: "Kuru meyve ve çerez neden faydalıdır: vitaminler, lif, enerji. Sağlıklı atıştırmalık ve günlük porsiyon. Xurcun, Bakü.",
      ar: "لماذا الفواكه المجففة والمكسرات مفيدة: فيتامينات وألياف وطاقة. وجبة صحية وحصة يومية. Xurcun، باكو.",
    },
    h1: {
      az: "Quru meyvə və qoz-fındığın faydaları",
      ru: "Польза сухофруктов и орехов",
      en: "The health benefits of dried fruit and nuts",
      tr: "Kuru meyve ve çerezin faydaları",
      ar: "فوائد الفواكه المجففة والمكسرات",
    },
    lead: {
      az: "Quru meyvə və qoz-fındıq təbii enerji, vitamin və lif mənbəyidir. Düzgün seçilmiş çərəz həm dadlı, həm də sağlam alternativdir.",
      ru: "Сухофрукты и орехи — природный источник энергии, витаминов и клетчатки. Правильно подобранный перекус и вкусен, и полезен.",
      en: "Dried fruit and nuts are a natural source of energy, vitamins and fibre. A well-chosen snack is both tasty and healthy.",
      tr: "Kuru meyve ve çerez; doğal enerji, vitamin ve lif kaynağıdır. Doğru seçilmiş atıştırmalık hem lezzetli hem sağlıklıdır.",
      ar: "الفواكه المجففة والمكسرات مصدر طبيعي للطاقة والفيتامينات والألياف. والوجبة المختارة بعناية لذيذة وصحية معًا.",
    },
    sections: [
      {
        h2: { az: "Əsas faydalar", ru: "Основная польза", en: "Key benefits", tr: "Başlıca faydaları", ar: "أبرز الفوائد" },
        body: [
          { az: "Quru meyvələr lif, kalium və antioksidantlarla zəngindir; qoz-fındıq isə sağlam yağlar, zülal və maqnezium mənbəyidir.", ru: "Сухофрукты богаты клетчаткой, калием и антиоксидантами; орехи — источник полезных жиров, белка и магния.", en: "Dried fruit is rich in fibre, potassium and antioxidants; nuts provide healthy fats, protein and magnesium.", tr: "Kuru meyveler lif, potasyum ve antioksidan açısından zengindir; çerezler ise sağlıklı yağ, protein ve magnezyum kaynağıdır.", ar: "الفواكه المجففة غنية بالألياف والبوتاسيوم ومضادات الأكسدة؛ والمكسرات مصدر للدهون الصحية والبروتين والمغنيسيوم." },
        ],
      },
      {
        h2: { az: "Hansıları seçməli?", ru: "Что выбрать?", en: "What to choose?", tr: "Hangileri seçmeli?", ar: "ماذا تختار؟" },
        body: [
          { az: "Şəkər və konservant əlavə edilməmiş, təbii qurudulmuş məhsullara üstünlük verin. Xurcun çeşidi seçmə və təbiidir.", ru: "Отдавайте предпочтение натурально высушенным продуктам без добавленного сахара и консервантов. Ассортимент Xurcun отборный и натуральный.", en: "Prefer naturally dried products without added sugar or preservatives. Xurcun's range is selected and natural.", tr: "Şeker ve koruyucu eklenmemiş, doğal kurutulmuş ürünleri tercih edin. Xurcun çeşidi seçme ve doğaldır.", ar: "فضّل المنتجات المجففة طبيعيًا دون سكر مضاف أو مواد حافظة. تشكيلة Xurcun منتقاة وطبيعية." },
        ],
      },
      {
        h2: { az: "Gündəlik norma", ru: "Суточная норма", en: "Daily portion", tr: "Günlük porsiyon", ar: "الحصة اليومية" },
        body: [
          { az: "Gündə bir ovuc (təxminən 30 q) qoz-fındıq və bir neçə quru meyvə balanslı qida üçün kifayətdir.", ru: "Горсти орехов в день (около 30 г) и нескольких сухофруктов достаточно для сбалансированного питания.", en: "A handful of nuts a day (about 30 g) and a few pieces of dried fruit are enough for a balanced diet.", tr: "Günde bir avuç çerez (yaklaşık 30 g) ve birkaç kuru meyve dengeli beslenme için yeterlidir.", ar: "حفنة من المكسرات يوميًا (نحو 30 غرامًا) وبضع قطع من الفواكه المجففة تكفي لنظام غذائي متوازن." },
        ],
      },
    ],
  },
  {
    slug: "korporativ-hediyye",
    date: "2026-06-28",
    cover: "/brand/og-image.jpg",
    title: {
      az: "Korporativ hədiyyə bələdçisi | Xurcun — biznes hədiyyələri",
      ru: "Гид по корпоративным подаркам | Xurcun — бизнес-подарки",
      en: "Corporate gift guide | Xurcun — business gifts",
      tr: "Kurumsal hediye rehberi | Xurcun — iş hediyeleri",
      ar: "دليل الهدايا المؤسسية | Xurcun — هدايا الأعمال",
    },
    desc: {
      az: "Korporativ hədiyyələr: loqolu premium qutular, bayram dəstləri, çoxsaylı sifariş. Müştəri və əməkdaşlar üçün. Xurcun, Bakı, 11 mağaza.",
      ru: "Корпоративные подарки: премиальные коробки с логотипом, праздничные наборы, оптовые заказы. Для клиентов и сотрудников. Xurcun, Баку.",
      en: "Corporate gifts: premium boxes with your logo, holiday sets, bulk orders. For clients and staff. Xurcun, Baku, 11 stores.",
      tr: "Kurumsal hediyeler: logolu premium kutular, bayram setleri, toplu sipariş. Müşteriler ve çalışanlar için. Xurcun, Bakü.",
      ar: "هدايا مؤسسية: علب فاخرة بشعارك، أطقم للأعياد، طلبات بالجملة. للعملاء والموظفين. Xurcun، باكو، 11 متجرًا.",
    },
    h1: {
      az: "Korporativ hədiyyə bələdçisi",
      ru: "Гид по корпоративным подаркам",
      en: "Corporate gift guide",
      tr: "Kurumsal hediye rehberi",
      ar: "دليل الهدايا المؤسسية",
    },
    lead: {
      az: "Doğru korporativ hədiyyə brendinizi xatırladır və münasibətləri gücləndirir. Xurcun loqolu, fərdiləşdirilmiş premium qutular hazırlayır — müştərilər, tərəfdaşlar və əməkdaşlar üçün.",
      ru: "Правильный корпоративный подарок напоминает о вашем бренде и укрепляет отношения. Xurcun готовит премиальные коробки с логотипом и персонализацией — для клиентов, партнёров и сотрудников.",
      en: "The right corporate gift keeps your brand in mind and strengthens relationships. Xurcun makes premium, logo-branded, personalised boxes for clients, partners and staff.",
      tr: "Doğru kurumsal hediye markanızı hatırlatır ve ilişkileri güçlendirir. Xurcun; müşteriler, ortaklar ve çalışanlar için logolu, kişiselleştirilmiş premium kutular hazırlar.",
      ar: "الهدية المؤسسية المناسبة تُبقي علامتك في الأذهان وتقوّي العلاقات. تصنع Xurcun علبًا فاخرة بشعارك ومخصّصة للعملاء والشركاء والموظفين.",
    },
    sections: [
      {
        h2: { az: "Niyə korporativ hədiyyə?", ru: "Зачем корпоративные подарки?", en: "Why corporate gifts?", tr: "Neden kurumsal hediye?", ar: "لماذا الهدايا المؤسسية؟" },
        body: [
          { az: "Bayramlarda və əlamətdar günlərdə hədiyyə sadiqlik yaradır, brendi yaddaşda saxlayır və biznes münasibətlərini möhkəmləndirir.", ru: "Подарки к праздникам и значимым датам формируют лояльность, удерживают бренд в памяти и укрепляют деловые отношения.", en: "Gifts on holidays and milestones build loyalty, keep your brand memorable and strengthen business ties.", tr: "Bayramlarda ve önemli günlerde verilen hediyeler sadakat oluşturur, markayı akılda tutar ve iş ilişkilerini güçlendirir.", ar: "الهدايا في الأعياد والمناسبات تبني الولاء وتُبقي العلامة حاضرة وتعزّز علاقات العمل." },
        ],
      },
      {
        h2: { az: "Fərdiləşdirmə və loqo", ru: "Персонализация и логотип", en: "Personalisation and logo", tr: "Kişiselleştirme ve logo", ar: "التخصيص والشعار" },
        body: [
          { az: "Qutunun tərkibini, ölçüsünü, rəngini seçin; üzərinə şirkət loqonuzu və ya təbrik kartı əlavə edin.", ru: "Выберите состав, размер и цвет коробки; добавьте логотип компании или поздравительную открытку.", en: "Choose the contents, size and colour; add your company logo or a greeting card.", tr: "Kutunun içeriğini, boyutunu ve rengini seçin; şirket logonuzu veya tebrik kartı ekleyin.", ar: "اختر المحتوى والحجم واللون؛ وأضف شعار شركتك أو بطاقة تهنئة." },
        ],
      },
      {
        h2: { az: "Çoxsaylı sifariş", ru: "Оптовый заказ", en: "Bulk orders", tr: "Toplu sipariş", ar: "الطلب بالجملة" },
        body: [
          { az: "10-dan çox dəst üçün xüsusi qiymət və vaxtında çatdırılma. Sifariş üçün +994 50 212 18 11 və ya WhatsApp ilə əlaqə saxlayın.", ru: "Для заказов от 10 наборов — специальные цены и доставка в срок. Для заказа: +994 50 212 18 11 или WhatsApp.", en: "Special pricing and on-time delivery for 10+ sets. To order, contact +994 50 212 18 11 or WhatsApp.", tr: "10+ set için özel fiyat ve zamanında teslimat. Sipariş için +994 50 212 18 11 veya WhatsApp.", ar: "أسعار خاصة وتسليم في الوقت لطلبات 10 مجموعات فأكثر. للطلب: +994 50 212 18 11 أو واتساب." },
        ],
      },
    ],
  },
  {
    slug: "bayram-korporativ-hediyye",
    date: "2026-06-29",
    cover: "/images/blog/korporativ-cover.webp",
    title: {
      az: "Bayramlarda korporativ hədiyyələr — Azərbaycan bayram təqvimi | Xurcun",
      ru: "Корпоративные подарки к праздникам — календарь Азербайджана | Xurcun",
      en: "Corporate gifts for the holidays — Azerbaijan holiday calendar | Xurcun",
      tr: "Corporate gifts for the holidays — Azerbaijan holiday calendar | Xurcun",
      ar: "Corporate gifts for the holidays — Azerbaijan holiday calendar | Xurcun",
    },
    desc: {
      az: "Yeni il, Novruz, 8 Mart, Ramazan və Qurban bayramlarında müştəri və tərəfdaşlarınızı Xurcun premium şokolad, çərəz, quru meyvə və lokum qutuları ilə sevindirin. Brendləmə, toplu sifariş, Bakıda çatdırılma.",
      ru: "Радуйте клиентов и партнёров на Новый год, Новруз, 8 Марта, Рамазан и Гурбан премиальными наборами Xurcun: шоколад, орехи, сухофрукты, лукум. Брендирование, опт, доставка по Баку.",
      en: "Delight clients and partners for New Year, Novruz, 8 March, Ramadan and Gurban with Xurcun premium boxes of chocolate, nuts, dried fruit and Turkish delight. Branding, bulk orders, delivery across Baku.",
      tr: "Delight clients and partners for New Year, Novruz, 8 March, Ramadan and Gurban with Xurcun premium boxes of chocolate, nuts, dried fruit and Turkish delight. Branding, bulk orders, delivery across Baku.",
      ar: "Delight clients and partners for New Year, Novruz, 8 March, Ramadan and Gurban with Xurcun premium boxes of chocolate, nuts, dried fruit and Turkish delight. Branding, bulk orders, delivery across Baku.",
    },
    h1: {
      az: "Bayramlarda korporativ hədiyyələr — illik təqvim",
      ru: "Корпоративные подарки к праздникам — годовой календарь",
      en: "Corporate gifts for the holidays — a year-round calendar",
      tr: "Corporate gifts for the holidays — a year-round calendar",
      ar: "Corporate gifts for the holidays — a year-round calendar",
    },
    lead: {
      az: "Doğru zamanda göndərilən hədiyyə sadəcə jest deyil — müştəri və tərəfdaşla münasibətə investisiyadır. Azərbaycan bayram təqvimi il boyu belə fürsətlərlə zəngindir. Bu bələdçidə hansı bayramda hansı Xurcun qutusunun uyğun olduğunu və korporativ sifarişin necə işlədiyini topladıq.",
      ru: "Подарок в нужный момент — не просто жест, а инвестиция в отношения с клиентом и партнёром. Календарь праздников Азербайджана полон таких поводов круглый год. В этом гиде — какой набор Xurcun подходит к какому празднику и как работает корпоративный заказ.",
      en: "A gift sent at the right moment is more than a gesture — it is an investment in the relationship with a client or partner. Azerbaijan's holiday calendar is full of such occasions all year round. This guide maps which Xurcun box fits which holiday and how corporate ordering works.",
      tr: "A gift sent at the right moment is more than a gesture — it is an investment in the relationship with a client or partner. Azerbaijan's holiday calendar is full of such occasions all year round. This guide maps which Xurcun box fits which holiday and how corporate ordering works.",
      ar: "A gift sent at the right moment is more than a gesture — it is an investment in the relationship with a client or partner. Azerbaijan's holiday calendar is full of such occasions all year round. This guide maps which Xurcun box fits which holiday and how corporate ordering works.",
    },
    sections: [
      {
        h2: { az: "Niyə korporativ hədiyyə vacibdir?", ru: "Почему корпоративные подарки важны?", en: "Why corporate gifting matters", tr: "Why corporate gifting matters", ar: "Why corporate gifting matters" },
        body: [
          { az: "Korporativ hədiyyə brendi yaddaşda saxlayır, sədaqəti gücləndirir və yeni əməkdaşlığa qapı açır. Premium və zövqlü hədiyyə isə şirkətinizin keyfiyyət standartını birbaşa təmsil edir — alan tərəf onu açanda sizin diqqətinizi hiss edir.", ru: "Корпоративный подарок удерживает бренд в памяти, укрепляет лояльность и открывает дверь к новому сотрудничеству. А premium-подарок со вкусом напрямую отражает стандарт качества вашей компании — получатель чувствует ваше внимание.", en: "A corporate gift keeps your brand top of mind, strengthens loyalty and opens the door to new cooperation. A premium, tasteful gift directly represents your company's quality standard — the recipient feels your attention the moment they open it.", tr: "A corporate gift keeps your brand top of mind, strengthens loyalty and opens the door to new cooperation. A premium, tasteful gift directly represents your company's quality standard — the recipient feels your attention the moment they open it.", ar: "A corporate gift keeps your brand top of mind, strengthens loyalty and opens the door to new cooperation. A premium, tasteful gift directly represents your company's quality standard — the recipient feels your attention the moment they open it." },
        ],
      },
      {
        h2: { az: "Azərbaycan bayram təqvimi — hədiyyə fürsətləri", ru: "Календарь праздников Азербайджана — поводы для подарков", en: "Azerbaijan's holiday calendar — gifting occasions", tr: "Azerbaijan's holiday calendar — gifting occasions", ar: "Azerbaijan's holiday calendar — gifting occasions" },
        body: [
          { az: "Yeni il (1-2 yanvar) — ilin ən böyük korporativ hədiyyə mövsümü; ilsonu müştəri və tərəfdaş hədiyyələri burada cəmlənir. Novruz Bayramı (mart) — ən ənənəvi hədiyyə bayramı: xonça, şirniyyat, quru meyvə və qoz-fındıq mərkəzdədir. 8 Mart — qadın müştəri və əməkdaşlara zərif diqqət. Ramazan və Qurban bayramları — dini bayramlarda tərəfdaş və ailə hədiyyələri.", ru: "Новый год (1-2 января) — крупнейший сезон корпоративных подарков; здесь сосредоточены подарки клиентам и партнёрам в конце года. Новруз (март) — самый традиционный праздник подарков: хонча, сладости, сухофрукты и орехи в центре. 8 Марта — изысканное внимание к клиенткам и сотрудницам. Рамазан и Гурбан — подарки партнёрам и близким в религиозные праздники.", en: "New Year (1-2 January) is the biggest corporate gifting season, when year-end gifts to clients and partners concentrate. Novruz (March) is the most traditional gifting holiday, centred on the xonça tray, sweets, dried fruit and nuts. 8 March means an elegant gesture to female clients and staff. Ramadan and Gurban are religious holidays for partner and family gifts.", tr: "New Year (1-2 January) is the biggest corporate gifting season, when year-end gifts to clients and partners concentrate. Novruz (March) is the most traditional gifting holiday, centred on the xonça tray, sweets, dried fruit and nuts. 8 March means an elegant gesture to female clients and staff. Ramadan and Gurban are religious holidays for partner and family gifts.", ar: "New Year (1-2 January) is the biggest corporate gifting season, when year-end gifts to clients and partners concentrate. Novruz (March) is the most traditional gifting holiday, centred on the xonça tray, sweets, dried fruit and nuts. 8 March means an elegant gesture to female clients and staff. Ramadan and Gurban are religious holidays for partner and family gifts." },
          { az: "Dövlət bayramları (9 May, 28 May, 8-9 noyabr), peşə günləri (müəllim, həkim, bankçı və s.), eləcə də şirkət yubileyləri və mühüm müqavilələrin imzalanması da il boyu hədiyyə üçün gözəl səbəblərdir. Beləliklə, hədiyyə təqvimi yalnız 3-4 günlə məhdudlaşmır — il boyu davam edir.", ru: "Государственные праздники (9 мая, 28 мая, 8-9 ноября), профессиональные дни (учитель, врач, банкир и др.), а также юбилеи компании и подписание важных контрактов — отличные поводы для подарков круглый год. Календарь не ограничивается 3-4 днями — он работает весь год.", en: "State holidays (9 May, 28 May, 8-9 November), professional days (teacher, doctor, banker and more), as well as company anniversaries and the signing of important contracts are excellent year-round reasons to gift. The calendar is not limited to three or four days — it runs all year.", tr: "State holidays (9 May, 28 May, 8-9 November), professional days (teacher, doctor, banker and more), as well as company anniversaries and the signing of important contracts are excellent year-round reasons to gift. The calendar is not limited to three or four days — it runs all year.", ar: "State holidays (9 May, 28 May, 8-9 November), professional days (teacher, doctor, banker and more), as well as company anniversaries and the signing of important contracts are excellent year-round reasons to gift. The calendar is not limited to three or four days — it runs all year." },
        ],
        gallery: [
          { src: "/images/blog/korporativ-box-1.webp", alt: { az: "Premium Xurcun hədiyyə qutusu — açıq, içində quru meyvə və çərəz", ru: "Премиальный набор Xurcun — открытая коробка с сухофруктами и орехами", en: "Premium Xurcun gift box, open — dried fruit and nuts inside", tr: "Premium Xurcun gift box, open — dried fruit and nuts inside", ar: "Premium Xurcun gift box, open — dried fruit and nuts inside" } },
          { src: "/images/blog/korporativ-box-2.webp", alt: { az: "Xurcun hədiyyə qutusu çay süfrəsində — bayram ovqatı", ru: "Подарочный набор Xurcun за чаем — праздничное настроение", en: "Xurcun gift box with tea — a festive moment", tr: "Xurcun gift box with tea — a festive moment", ar: "Xurcun gift box with tea — a festive moment" } },
        ],
      },
      {
        h2: { az: "Bayrama görə qutu seçimi", ru: "Выбор набора под праздник", en: "Choosing a box by holiday", tr: "Choosing a box by holiday", ar: "Choosing a box by holiday" },
        body: [
          { az: "Yeni il üçün — premium şokolad assortisi və qarışıq quru meyvə-çərəz dəstləri. Novruz üçün — paxlava, şəkərbura ovqatı verən şirniyyat və zəngin quru meyvə qutuları. 8 Mart üçün — zərif şokolad və lokum qutuları. Ramazan və Qurban üçün — xurma, quru meyvə və lokum birləşmələri. Hər büdcə üçün kiçikdən böyüyə müxtəlif ölçülər mövcuddur.", ru: "На Новый год — премиальное ассорти шоколада и наборы сухофруктов с орехами. На Новруз — пахлава, праздничные сладости и богатые наборы сухофруктов. На 8 Марта — изящные наборы шоколада и лукума. На Рамазан и Гурбан — финики, сухофрукты и лукум. Размеры — от небольших до больших под любой бюджет.", en: "For New Year, a premium chocolate assortment and mixed dried-fruit-and-nut sets. For Novruz, baklava, festive sweets and rich dried-fruit boxes. For 8 March, elegant chocolate and Turkish delight boxes. For Ramadan and Gurban, dates, dried fruit and lokum. Sizes range from small to large to fit any budget.", tr: "For New Year, a premium chocolate assortment and mixed dried-fruit-and-nut sets. For Novruz, baklava, festive sweets and rich dried-fruit boxes. For 8 March, elegant chocolate and Turkish delight boxes. For Ramadan and Gurban, dates, dried fruit and lokum. Sizes range from small to large to fit any budget.", ar: "For New Year, a premium chocolate assortment and mixed dried-fruit-and-nut sets. For Novruz, baklava, festive sweets and rich dried-fruit boxes. For 8 March, elegant chocolate and Turkish delight boxes. For Ramadan and Gurban, dates, dried fruit and lokum. Sizes range from small to large to fit any budget." },
        ],
      },
      {
        h2: { az: "Korporativ sifarişin üstünlükləri", ru: "Преимущества корпоративного заказа", en: "The advantages of corporate ordering", tr: "The advantages of corporate ordering", ar: "The advantages of corporate ordering" },
        body: [
          { az: "Toplu sifarişdə əlverişli qiymət, qutuların şirkət loqosu və ya təbrik kartı ilə brendlənməsi, vahid dizayn və Bakı üzrə vaxtında çatdırılma — korporativ xidmətin əsas üstünlükləridir. Böyük sifarişlər üçün dəstin tərkibini büdcəyə uyğun fərdiləşdirmək mümkündür.", ru: "Выгодная цена при опте, брендирование наборов логотипом компании или поздравительной открыткой, единый дизайн и доставка по Баку в срок — ключевые преимущества корпоративного сервиса. Для крупных заказов состав набора можно адаптировать под бюджет.", en: "Favourable pricing on bulk orders, branding the boxes with your company logo or a greeting card, a unified design and on-time delivery across Baku are the core advantages of the corporate service. For large orders, the contents can be tailored to your budget.", tr: "Favourable pricing on bulk orders, branding the boxes with your company logo or a greeting card, a unified design and on-time delivery across Baku are the core advantages of the corporate service. For large orders, the contents can be tailored to your budget.", ar: "Favourable pricing on bulk orders, branding the boxes with your company logo or a greeting card, a unified design and on-time delivery across Baku are the core advantages of the corporate service. For large orders, the contents can be tailored to your budget." },
        ],
        gallery: [
          { src: "/images/blog/korporativ-brand-1.webp", alt: { az: "Xurcun brendli hədiyyə qutuları — korporativ qablaşdırma", ru: "Брендированные подарочные коробки Xurcun — корпоративная упаковка", en: "Branded Xurcun gift boxes — corporate packaging", tr: "Branded Xurcun gift boxes — corporate packaging", ar: "Branded Xurcun gift boxes — corporate packaging" } },
          { src: "/images/blog/korporativ-brand-2.webp", alt: { az: "Xurcun brendli hədiyyə çantası — butik", ru: "Фирменный подарочный пакет Xurcun — бутик", en: "Branded Xurcun gift bag — boutique", tr: "Branded Xurcun gift bag — boutique", ar: "Branded Xurcun gift bag — boutique" } },
        ],
      },
      {
        h2: { az: "Necə sifariş etmək olar?", ru: "Как сделать заказ?", en: "How to order", tr: "How to order", ar: "How to order" },
        body: [
          { az: "Bayramdan əvvəl say və büdcəni planlaşdırmaq tövsiyə olunur — xüsusən Yeni il və Novruz mövsümündə tələbat yüksək olur. Korporativ sorğunuzu saytımızdakı Korporativ səhifəsi vasitəsilə göndərə və ya +994 50 212 18 11 nömrəsi / WhatsApp ilə birbaşa əlaqə saxlaya bilərsiniz.", ru: "Рекомендуем планировать количество и бюджет заранее — особенно в сезон Нового года и Новруза, когда спрос высок. Отправьте корпоративный запрос через страницу «Корпоративным клиентам» на сайте или свяжитесь напрямую: +994 50 212 18 11 / WhatsApp.", en: "We recommend planning quantity and budget in advance — demand peaks especially during the New Year and Novruz season. Send your corporate request through the Corporate page on our site, or contact us directly at +994 50 212 18 11 / WhatsApp.", tr: "We recommend planning quantity and budget in advance — demand peaks especially during the New Year and Novruz season. Send your corporate request through the Corporate page on our site, or contact us directly at +994 50 212 18 11 / WhatsApp.", ar: "We recommend planning quantity and budget in advance — demand peaks especially during the New Year and Novruz season. Send your corporate request through the Corporate page on our site, or contact us directly at +994 50 212 18 11 / WhatsApp." },
        ],
      },
    ],
  },
  {
    slug: "bakida-hediyye-hara",
    date: "2026-06-29",
    cover: "/brand/og-image.jpg",
    title: {"az": "Bakıda hədiyyə hara almalı | Xurcun", "ru": "Где купить подарок в Баку | Xurcun", "en": "Where to buy a gift in Baku | Xurcun", "tr": "Bakü'de hediye nereden alınır | Xurcun", "ar": "أين تشتري هدية في باكو | Xurcun"},
    desc: {"az": "Bakıda yaxşı hədiyyə hara almalı? Premium hədiyyə qutuları, quru meyvə, çərəz və şirniyyat. Xurcun-un 11 mağazası və hava limanı filialı.", "ru": "Где купить хороший подарок в Баку? Премиальные подарочные коробки, сухофрукты, орехи и сладости. 11 магазинов Xurcun и филиал в аэропорту.", "en": "Where to buy a good gift in Baku? Premium gift boxes, dried fruit, nuts and sweets. Xurcun's 11 boutiques plus the airport store.", "tr": "Bakü'de iyi bir hediye nereden alınır? Premium hediye kutuları, kuru meyve, çerez ve tatlılar. Xurcun'un 11 mağazası ve havalimanı şubesi.", "ar": "أين تشتري هدية جيدة في باكو؟ علب هدايا فاخرة وفواكه مجففة ومكسرات وحلويات. 11 متجرًا من Xurcun وفرع في المطار."},
    h1: {"az": "Bakıda hədiyyə hara almalı — sakinlər və qonaqlar üçün bələdçi", "ru": "Где купить подарок в Баку — гид для местных и туристов", "en": "Where to buy a gift in Baku — a guide for locals and visitors", "tr": "Bakü'de hediye nereden alınır — yerliler ve misafirler için rehber", "ar": "أين تشتري هدية في باكو — دليل للمقيمين والزوار"},
    lead: {"az": "İstər doğum günü, istər toy, istərsə də Bakıdan aparılacaq bir xatirə olsun — yaxşı hədiyyə həm zövqlü görünməli, həm də səmimi olmalıdır. Xurcun premium quru meyvə, qoz-fındıq, şokolad, lokum və paxlava ilə bəzədilmiş əl işi hədiyyə qutuları təqdim edir; üstəlik Bakı boyunca 11 mağaza və hava limanı filialı ilə hara getsəniz, yaxınlıqda bir Xurcun var.", "ru": "День рождения, свадьба или сувенир из Баку на память — хороший подарок должен выглядеть со вкусом и быть искренним. Xurcun предлагает подарочные коробки ручной работы с премиальными сухофруктами, орехами, шоколадом, лукумом и пахлавой; а благодаря 11 магазинам по всему Баку и филиалу в аэропорту Xurcun всегда оказывается рядом.", "en": "A birthday, a wedding, or a keepsake to take home from Baku — a good gift should look tasteful and feel sincere. Xurcun offers handmade gift boxes filled with premium dried fruit, nuts, chocolate, Turkish delight and baklava; and with 11 boutiques across Baku plus an airport store, there is always a Xurcun close by.", "tr": "Bir doğum günü, bir düğün ya da Bakü'den götürülecek bir hatıra — iyi bir hediye hem zarif görünmeli hem de samimi olmalı. Xurcun; premium kuru meyve, çerez, çikolata, lokum ve baklava ile süslenmiş el yapımı hediye kutuları sunar; üstelik Bakü genelinde 11 mağaza ve havalimanı şubesiyle nereye giderseniz gidin yakınınızda bir Xurcun bulunur.", "ar": "عيد ميلاد أو حفل زفاف أو تذكار تأخذه معك من باكو — الهدية الجيدة يجب أن تبدو أنيقة وأن تكون صادقة. تقدّم Xurcun علب هدايا يدوية مليئة بالفواكه المجففة الفاخرة والمكسرات والشوكولاتة والحلقوم والبقلاوة؛ ومع 11 متجرًا في أنحاء باكو إضافةً إلى فرع في المطار، ستجد دائمًا متجر Xurcun قريبًا منك."},
    sections: [{"h2": {"az": "Hədiyyə qutuları və xonçalar — ən asan seçim", "ru": "Подарочные коробки и хончи — самый простой выбор", "en": "Gift boxes and trays — the easiest choice", "tr": "Hediye kutuları ve honçalar — en kolay seçim", "ar": "علب الهدايا والصواني — الخيار الأسهل"}, "body": [{"az": "Vaxtınız azdırsa və hər kəsin xoşuna gələ biləcək bir hədiyyə axtarırsınızsa, hazır hədiyyə qutusu ən etibarlı seçimdir. Xurcun qutuları seçmə quru meyvə, premium qoz-fındıq, şokolad, lokum və paxlava ilə əl işi şəklində tərtib olunur.", "ru": "Если времени мало, а подарок должен понравиться каждому, готовая подарочная коробка — самый надёжный вариант. Коробки Xurcun собираются вручную из отборных сухофруктов, премиальных орехов, шоколада, лукума и пахлавы.", "en": "If you are short on time and want a gift that pleases almost anyone, a ready gift box is the safest choice. Xurcun boxes are assembled by hand from selected dried fruit, premium nuts, chocolate, Turkish delight and baklava.", "tr": "Vaktiniz azsa ve hemen herkesin beğeneceği bir hediye arıyorsanız, hazır hediye kutusu en güvenli seçimdir. Xurcun kutuları; seçme kuru meyve, premium çerez, çikolata, lokum ve baklavadan elde hazırlanır.", "ar": "إذا كان وقتك ضيّقًا وتريد هدية تنال إعجاب الجميع تقريبًا، فإن علبة الهدايا الجاهزة هي الخيار الأكثر أمانًا. تُجهَّز علب Xurcun يدويًا من فواكه مجففة منتقاة ومكسرات فاخرة وشوكولاتة وحلقوم وبقلاوة."}, {"az": "Toy, nişan və ya rəsmi münasibətlər üçün bəzədilmiş xonçalar var; içindəkiləri və ölçünü büdcənizə uyğun seçə bilərsiniz. Beləcə həm kiçik bir diqqət, həm də təntənəli bir hədiyyə eyni yerdən tapılır.", "ru": "Для свадеб, помолвок и официальных поводов есть украшенные хончи; состав и размер можно подобрать под бюджет. Так и небольшой знак внимания, и торжественный подарок находятся в одном месте.", "en": "For weddings, engagements and formal occasions there are decorated trays; you can match the contents and size to your budget. That way both a small token and a grand gift come from the same place.", "tr": "Düğün, nişan ve resmi durumlar için süslü honçalar var; içeriği ve boyutu bütçenize göre seçebilirsiniz. Böylece hem küçük bir jest hem de görkemli bir hediye aynı yerden bulunur.", "ar": "وللأعراس والخطوبة والمناسبات الرسمية توجد صوانٍ مزخرفة؛ يمكنك اختيار المحتوى والحجم بما يناسب ميزانيتك. وهكذا تجد اللفتة البسيطة والهدية الفخمة في المكان نفسه."}]}, {"h2": {"az": "Quru meyvə, çərəz və şirniyyat — Bakıdan dadlı bir xatirə", "ru": "Сухофрукты, орехи и сладости — вкусный сувенир из Баку", "en": "Dried fruit, nuts and sweets — a tasty keepsake from Baku", "tr": "Kuru meyve, çerez ve tatlılar — Bakü'den lezzetli bir hatıra", "ar": "الفواكه المجففة والمكسرات والحلويات — تذكار لذيذ من باكو"}, "body": [{"az": "Bakıya gələn qonaqlar üçün ən gözəl hədiyyə — bölgənin dadını özü ilə aparmaqdır. Quru meyvə, qoz-fındıq və lokum həm uzun müddət saxlanılır, həm də səfərdə rahat daşınır.", "ru": "Для гостей Баку лучший подарок — увезти с собой вкус региона. Сухофрукты, орехи и лукум долго хранятся и удобно перевозятся в поездке.", "en": "For visitors to Baku, the finest gift is to take the taste of the region home. Dried fruit, nuts and Turkish delight keep well and travel easily.", "tr": "Bakü'ye gelen misafirler için en güzel hediye, bölgenin tadını yanında götürmektir. Kuru meyve, çerez ve lokum hem uzun süre saklanır hem de yolculukta rahat taşınır.", "ar": "بالنسبة لزوار باكو، أجمل هدية هي أن تأخذ نكهة المنطقة معك إلى الوطن. فالفواكه المجففة والمكسرات والحلقوم تُحفظ طويلًا وتسهل حملها في السفر."}, {"az": "İstədiyiniz çeşidləri seçib öz qarışığınızı yaratmaq da mümkündür — sevdiyiniz adamın zövqünə uyğun fərdi bir hədiyyə alınır. Bağlama və tərtibat da zövqlü olduğundan əlavə bəzəyə ehtiyac qalmır.", "ru": "Можно выбрать любимые позиции и составить собственную смесь — получится индивидуальный подарок под вкус близкого человека. Упаковка и оформление аккуратные, так что дополнительное украшение не нужно.", "en": "You can also pick your favourite items and build your own mix — a personal gift tuned to the recipient's taste. The packaging and presentation are tasteful, so no extra wrapping is needed.", "tr": "Dilediğiniz çeşitleri seçip kendi karışımınızı oluşturabilirsiniz — sevdiğiniz kişinin zevkine göre kişisel bir hediye olur. Ambalaj ve sunum da şık olduğundan ek bir süslemeye gerek kalmaz.", "ar": "ويمكنك أيضًا اختيار أصنافك المفضلة وتكوين خلطتك الخاصة — لتحصل على هدية شخصية تناسب ذوق من تحب. والتغليف والتنسيق أنيقان، فلا حاجة إلى زينة إضافية."}]}, {"h2": {"az": "Korporativ hədiyyələr və hara müraciət etmək", "ru": "Корпоративные подарки и куда обращаться", "en": "Corporate gifts and where to go", "tr": "Kurumsal hediyeler ve nereye başvurmalı", "ar": "الهدايا المؤسسية وأين تتوجه"}, "body": [{"az": "Şirkətlər üçün müştərilərə, tərəfdaşlara və komandaya verilən hədiyyələr brendin imicinin bir hissəsidir. Xurcun korporativ sifarişlər üçün vahid zövqdə tərtib olunmuş, çoxsaylı qutular hazırlayır; büdcə və say artdıqca xüsusi şərtlər mümkündür.", "ru": "Для компаний подарки клиентам, партнёрам и команде — часть имиджа бренда. Xurcun готовит корпоративные заказы в едином стиле большими партиями; при росте объёма возможны особые условия.", "en": "For companies, gifts to clients, partners and the team are part of the brand image. Xurcun prepares corporate orders styled consistently and in volume; special terms are possible as quantities grow.", "tr": "Şirketler için müşterilere, iş ortaklarına ve ekibe verilen hediyeler markanın imajının bir parçasıdır. Xurcun, kurumsal siparişleri tek bir tarzda ve çok sayıda hazırlar; adet arttıkça özel koşullar mümkündür.", "ar": "بالنسبة للشركات، تُعد الهدايا للعملاء والشركاء والفريق جزءًا من صورة العلامة التجارية. تُجهّز Xurcun الطلبات المؤسسية بأسلوب موحّد وبكميات كبيرة؛ ومع زيادة الكمية تتوفر شروط خاصة."}, {"az": "Almaq üçün Bakı boyunca 11 Xurcun mağazasından birinə yaxınlaşa, kataloqdan seçim edib WhatsApp ilə sifariş verə bilərsiniz. Şəhərdən ayrılarkən isə hava limanı filialı son anda alınan hədiyyə üçün rahat bir nöqtədir.", "ru": "Чтобы купить, зайдите в один из 11 магазинов Xurcun по Баку или выберите в каталоге и закажите в WhatsApp. А при отъезде филиал в аэропорту удобен для подарка в последнюю минуту.", "en": "To buy, visit one of Xurcun's 11 stores across Baku, or pick from the catalogue and order on WhatsApp. And when you are leaving the city, the airport store is a convenient spot for a last-minute gift.", "tr": "Satın almak için Bakü genelindeki 11 Xurcun mağazasından birine uğrayabilir ya da katalogdan seçip WhatsApp üzerinden sipariş verebilirsiniz. Şehirden ayrılırken de havalimanı şubesi, son dakika hediyesi için rahat bir noktadır.", "ar": "للشراء، زُر أحد متاجر Xurcun الـ11 في أنحاء باكو، أو اختر من الكتالوج واطلب عبر واتساب. وعند مغادرتك المدينة، يكون فرع المطار نقطة مريحة لهدية اللحظة الأخيرة."}]}],
  },
  {
    slug: "baku-suvenir-belecisi",
    date: "2026-06-29",
    cover: "/images/home/gift.webp",
    title: {"az": "Bakıdan nə aparmaq olar — suvenir bələdçisi | Xurcun", "ru": "Что привезти из Баку — гид по сувенирам | Xurcun", "en": "What to bring back from Baku — souvenir guide | Xurcun", "tr": "Bakü'den ne alınır — hediyelik rehberi | Xurcun", "ar": "ماذا تشتري من باكو — دليل الهدايا التذكارية | Xurcun"},
    desc: {"az": "Bakıdan aparmaq üçün ən gözəl suvenirlər: Azərbaycan quru meyvəsi, qoz-fındıq, paxlava, lokum, çay və əl işi hədiyyə qutuları. Hava limanı mağazaları.", "ru": "Лучшие сувениры из Баку: азербайджанские сухофрукты, орехи, пахлава, лукум, чай и подарочные коробки ручной работы. Бутики в аэропорту.", "en": "The best souvenirs from Baku: Azerbaijani dried fruit, nuts, baklava, Turkish delight, tea and handcrafted gift boxes. Airport boutiques too.", "tr": "Bakü'den alınacak en güzel hediyelikler: Azerbaycan kuru meyvesi, çerez, baklava, lokum, çay ve el yapımı hediye kutuları. Havalimanı mağazaları.", "ar": "أفضل الهدايا التذكارية من باكو: الفواكه المجففة الأذربيجانية والمكسرات والبقلاوة والحلقوم والشاي وعلب الهدايا اليدوية. بوتيكات المطار أيضًا."},
    h1: {"az": "Bakıdan nə aparmaq olar — suvenir bələdçisi", "ru": "Что привезти из Баку — гид по сувенирам", "en": "What to bring back from Baku — a souvenir guide", "tr": "Bakü'den ne alınır — hediyelik rehberi", "ar": "ماذا تشتري من باكو — دليل الهدايا التذكارية"},
    lead: {"az": "Bakıdan vətənə dönərkən sevdiklərinizə həm dadlı, həm də unudulmaz bir töhfə aparmaq istəyirsiniz. Magnit və açarlıqlardan kənara çıxın: Azərbaycanın əsl ləzzətləri — seçmə quru meyvə, qoz-fındıq, paxlava, lokum və ətirli çay — ən səmimi suvenirlərdir. Xurcun bütün bunları zövqlü, əl işi hədiyyə qutularında bir araya gətirir.", "ru": "Возвращаясь из Баку, хочется привезти близким нечто вкусное и запоминающееся. Выйдите за рамки магнитов и брелоков: настоящие азербайджанские лакомства — отборные сухофрукты, орехи, пахлава, лукум и ароматный чай — лучшие сувениры. Xurcun собирает всё это в изящные подарочные коробки ручной работы.", "en": "Heading home from Baku, you want to bring loved ones something both delicious and memorable. Go beyond magnets and keychains: Azerbaijan's real flavours — choice dried fruit, nuts, baklava, Turkish delight and fragrant tea — make the warmest souvenirs. Xurcun brings them together in tasteful, handcrafted gift boxes.", "tr": "Bakü'den evinize dönerken sevdiklerinize hem lezzetli hem unutulmaz bir armağan götürmek istersiniz. Magnet ve anahtarlığın ötesine geçin: Azerbaycan'ın gerçek lezzetleri — seçme kuru meyve, çerez, baklava, lokum ve mis kokulu çay — en içten hediyeliklerdir. Xurcun bunların tümünü zarif, el yapımı hediye kutularında bir araya getirir.", "ar": "عند عودتك من باكو، تودّ أن تحمل لأحبائك شيئًا لذيذًا ولا يُنسى في آنٍ واحد. تجاوز المغناطيس وسلاسل المفاتيح: نكهات أذربيجان الحقيقية — الفواكه المجففة المنتقاة والمكسرات والبقلاوة والحلقوم والشاي العطري — هي أصدق الهدايا التذكارية. وتجمعها Xurcun كلها في علب هدايا أنيقة مصنوعة يدويًا."},
    sections: [{"h2": {"az": "Aparmağa dəyər əsl Azərbaycan ləzzətləri", "ru": "Настоящие азербайджанские вкусы, которые стоит привезти", "en": "Authentic Azerbaijani flavours worth taking home", "tr": "Götürmeye değer gerçek Azerbaycan lezzetleri", "ar": "نكهات أذربيجانية أصيلة تستحق أن تحملها معك"}, "body": [{"az": "Quru meyvə və qoz-fındıq Azərbaycanın günəşli iqliminin dadını daşıyır — sarı və qara mövüc, ərik, gilas qaxı, eləcə də fındıq, qoz və püstə. Bunlar yüngül, uzun müddət qalan və bavul üçün ideal suvenirlərdir.", "ru": "Сухофрукты и орехи хранят вкус солнечного климата Азербайджана — светлый и тёмный изюм, курага, пастила из вишни, а также фундук, грецкий орех и фисташки. Лёгкие, долго хранятся и идеальны для чемодана.", "en": "Dried fruit and nuts carry the taste of Azerbaijan's sunny climate — golden and dark raisins, apricots, cherry pastille, plus hazelnuts, walnuts and pistachios. They're light, keep for a long time and travel beautifully.", "tr": "Kuru meyve ve çerezler, Azerbaycan'ın güneşli ikliminin tadını taşır — sarı ve siyah kuru üzüm, kayısı, vişne pestili, ayrıca fındık, ceviz ve antep fıstığı. Hafif, uzun süre dayanır ve bavul için idealdir.", "ar": "تحمل الفواكه المجففة والمكسرات طعم مناخ أذربيجان المشمس — زبيب فاتح وداكن، ومشمش، وقطايف الكرز، إضافة إلى البندق والجوز والفستق. إنها خفيفة، تدوم طويلًا، ومثالية للحقيبة."}, {"az": "Şirniyyat sevənlər üçün paxlava və rəngarəng lokum əvəzedilməzdir — qoz, püstə və gül ləçəkli növləri ilə. Bir də ətirli Azərbaycan çayı: armudu stəkanda dəmlənən bu çay özü ilə bütöv bir mehmannavazlıq mədəniyyətini hədiyyə kimi aparmağa imkan verir.", "ru": "Для сладкоежек незаменимы пахлава и разноцветный лукум — с орехами, фисташками и лепестками роз. А ещё ароматный азербайджанский чай: заваренный в стакане «армуду», он позволяет увезти в подарок целую культуру гостеприимства.", "en": "For those with a sweet tooth, baklava and colourful Turkish delight are irreplaceable — with walnuts, pistachios and rose petals. And fragrant Azerbaijani tea: brewed in the pear-shaped armudu glass, it lets you carry home an entire culture of hospitality as a gift.", "tr": "Tatlı sevenler için baklava ve rengârenk lokum vazgeçilmezdir — cevizli, antep fıstıklı ve gül yapraklı çeşitleriyle. Bir de mis kokulu Azerbaycan çayı: armudu bardakta demlenen bu çay, koca bir misafirperverlik kültürünü hediye olarak götürmenizi sağlar.", "ar": "ولمحبي الحلويات، تبقى البقلاوة والحلقوم الملون لا غنى عنهما — بالجوز والفستق وبتلات الورد. وكذلك الشاي الأذربيجاني العطري: المُحضَّر في كأس «أرمودو» الكمثري الشكل، يتيح لك أن تحمل ثقافة ضيافة كاملة هدية معك."}]}, {"h2": {"az": "Niyə əl işi hədiyyə qutusu seçmək daha yaxşıdır", "ru": "Почему лучше выбрать подарочную коробку ручной работы", "en": "Why a handcrafted gift box is the smarter choice", "tr": "Neden el yapımı hediye kutusu daha iyi bir seçim", "ar": "لماذا علبة الهدايا اليدوية خيار أذكى"}, "body": [{"az": "Tək-tək məhsul axtarmaq əvəzinə, hazır hədiyyə qutusu vaxtınıza qənaət edir və daha səliqəli görünür. Xurcun qutuları əl işi ilə yığılır: seçmə quru meyvə, çərəz və şirniyyat zövqlü tərtibatla bir araya gəlir.", "ru": "Вместо того чтобы искать товары по отдельности, готовая подарочная коробка экономит время и выглядит гораздо аккуратнее. Коробки Xurcun собираются вручную: отборные сухофрукты, орехи и сладости — в изящном оформлении.", "en": "Instead of hunting for items one by one, a ready gift box saves time and looks far neater. Xurcun boxes are assembled by hand: choice dried fruit, nuts and sweets brought together with elegant presentation.", "tr": "Ürünleri tek tek aramak yerine hazır bir hediye kutusu hem zaman kazandırır hem de çok daha derli toplu görünür. Xurcun kutuları elde hazırlanır: seçme kuru meyve, çerez ve tatlılar zarif bir sunumla bir araya gelir.", "ar": "بدلًا من البحث عن المنتجات واحدًا تلو الآخر، توفّر علبة الهدايا الجاهزة وقتك وتبدو أكثر أناقة بكثير. تُجهَّز علب Xurcun يدويًا: فواكه مجففة منتقاة ومكسرات وحلويات تجتمع بتقديم أنيق."}, {"az": "Belə bir qutu həm səyahət xatirəsi, həm də qayıtdıqdan sonra ailəyə və ya iş yoldaşlarına veriləcək hazır hədiyyədir. Tərkibi istəyə görə fərdiləşdirmək mümkündür — sifariş üçün Bakıdakı 11 Xurcun mağazasından birinə yaxınlaşa, yaxud WhatsApp ilə əlaqə saxlaya bilərsiniz.", "ru": "Такая коробка — и сувенир из поездки, и готовый подарок для семьи или коллег по возвращении. Состав можно подобрать по желанию — для заказа зайдите в один из 11 магазинов Xurcun в Баку или напишите в WhatsApp.", "en": "Such a box is both a travel memory and a ready gift for family or colleagues once you're back. The contents can be customised — to order, visit one of Xurcun's 11 stores in Baku or reach out on WhatsApp.", "tr": "Böyle bir kutu hem bir seyahat hatırası hem de döndüğünüzde aileye ya da iş arkadaşlarına verilecek hazır bir hediyedir. İçeriği isteğe göre kişiselleştirilebilir — sipariş için Bakü'deki 11 Xurcun mağazasından birine uğrayabilir ya da WhatsApp'tan yazabilirsiniz.", "ar": "هذه العلبة هي في آنٍ واحد ذكرى من رحلتك وهدية جاهزة للعائلة أو الزملاء بعد عودتك. ويمكن تخصيص محتواها حسب الرغبة — للطلب، زُر أحد متاجر Xurcun الـ11 في باكو أو تواصل عبر واتساب."}]}, {"h2": {"az": "Son anda? Hava limanı və şəhər mağazaları", "ru": "В последний момент? Магазины в аэропорту и в городе", "en": "Last minute? Airport and city boutiques", "tr": "Son dakika mı? Havalimanı ve şehir mağazaları", "ar": "في اللحظة الأخيرة؟ متاجر المطار والمدينة"}, "body": [{"az": "Uçuşa az qalıb və hələ hədiyyə almamısınızsa, narahat olmayın. Bakı şəhərindəki Xurcun mağazaları mərkəzi məkanlarda yerləşir və paketlənmiş, səfərə hazır qutular təklif edir — bir neçə dəqiqəyə seçim etmək mümkündür.", "ru": "Если до вылета мало времени, а подарок ещё не куплен — не переживайте. Магазины Xurcun в Баку расположены в центральных местах и предлагают упакованные, готовые к поездке коробки — выбор займёт пару минут.", "en": "If your flight is near and you still haven't bought gifts, don't worry. Xurcun stores around Baku sit in central locations and offer pre-packed, travel-ready boxes — you can choose in just a few minutes.", "tr": "Uçuşunuza az kaldıysa ve henüz hediye almadıysanız, endişelenmeyin. Bakü'deki Xurcun mağazaları merkezi konumlardadır ve paketlenmiş, yolculuğa hazır kutular sunar — seçim yapmak yalnızca birkaç dakika sürer.", "ar": "إذا اقترب موعد رحلتك ولم تشترِ الهدايا بعد، فلا تقلق. تقع متاجر Xurcun في مواقع مركزية بمدينة باكو وتوفّر علبًا معبأة جاهزة للسفر — يمكنك الاختيار في دقائق معدودة."}, {"az": "Vaxtınız lap azdırsa, məhsulları əvvəlcədən kataloqdan baxıb WhatsApp ilə sifariş verə bilərsiniz ki, qutu sizi gözləsin. Beləcə Azərbaycanın əsl dadını — keyfiyyətə vurğun bir markanın əlindən — özünüzlə evə apararsınız.", "ru": "Если времени совсем нет, посмотрите товары в каталоге заранее и закажите в WhatsApp, чтобы коробка уже ждала вас. Так вы увезёте домой настоящий вкус Азербайджана — от бренда, влюблённого в качество.", "en": "If time is really short, browse the catalogue in advance and order on WhatsApp so the box is waiting for you. That way you take home the real taste of Azerbaijan — from a brand that is fond of quality.", "tr": "Vaktiniz çok azsa, ürünlere katalogdan önceden bakıp WhatsApp'tan sipariş verebilirsiniz; böylece kutu sizi bekler. Böylelikle Azerbaycan'ın gerçek tadını — kaliteye vurgun bir markanın elinden — evinize götürürsünüz.", "ar": "وإن كان وقتك ضيقًا جدًا، تصفّح الكتالوج مسبقًا واطلب عبر واتساب لتكون العلبة بانتظارك. وهكذا تحمل معك إلى البيت طعم أذربيجان الحقيقي — من علامة شغوفة بالجودة."}]}],
  },
  {
    slug: "azerbaycan-quru-meyve-belecisi",
    date: "2026-06-29",
    cover: "/images/home/about.webp",
    title: {"az": "Quru meyvə və qoz-fındıq bələdçisi | Xurcun", "ru": "Гид по сухофруктам и орехам | Xurcun", "en": "Dried fruit & nuts buyer's guide | Xurcun", "tr": "Kuru meyve ve çerez rehberi | Xurcun", "ar": "دليل الفواكه المجففة والمكسرات | Xurcun"},
    desc: {"az": "Ərik, əncir, tut, qoz, fındıq, püstə, badam — Azərbaycan quru meyvə və qoz-fındıqlarını necə seçmək, dadmaq və hədiyyə etmək. Xurcun bələdçisi.", "ru": "Курага, инжир, тутовник, грецкий орех, фундук, фисташка, миндаль — как выбрать, дегустировать и дарить. Гид Xurcun.", "en": "Apricot, fig, mulberry, walnut, hazelnut, pistachio, almond — how to choose, taste and gift Azerbaijani dried fruit and nuts. A Xurcun guide.", "tr": "Kayısı, incir, dut, ceviz, fındık, antep fıstığı, badem — nasıl seçilir, tadılır ve hediye edilir. Xurcun rehberi.", "ar": "مشمش، تين، توت، جوز، بندق، فستق، لوز — كيف تختار وتتذوّق وتُهدي الفواكه المجففة والمكسرات. دليل Xurcun."},
    h1: {"az": "Azərbaycan quru meyvə və qoz-fındıq bələdçisi", "ru": "Гид по азербайджанским сухофруктам и орехам", "en": "A guide to Azerbaijani dried fruit and nuts", "tr": "Azerbaycan kuru meyve ve çerez rehberi", "ar": "دليل الفواكه المجففة والمكسرات الأذربيجانية"},
    lead: {"az": "Quru meyvə və qoz-fındıq Azərbaycan süfrəsinin əzəli bir parçasıdır — çayın yanında, bayram süfrəsində və ən zərif hədiyyələrdə. Bu bələdçidə əsas çeşidləri, keyfiyyəti necə ayırd etməyi və onları zövqlə necə hədiyyə etməyi Xurcun-un təcrübəsi ilə bölüşürük.", "ru": "Сухофрукты и орехи — неотъемлемая часть азербайджанского стола: к чаю, на праздник и в самых изысканных подарках. В этом гиде Xurcun делится знанием о главных сортах, признаках качества и о том, как красиво их дарить.", "en": "Dried fruit and nuts are an essential part of the Azerbaijani table — with tea, on festive occasions and in the most refined gifts. In this guide, Xurcun shares how to know the main varieties, how to judge quality and how to gift them with taste.", "tr": "Kuru meyve ve çerez, Azerbaycan sofrasının ayrılmaz bir parçasıdır; çayın yanında, bayram sofrasında ve en zarif hediyelerde. Bu rehberde Xurcun; başlıca çeşitleri, kaliteyi nasıl ayırt edeceğinizi ve onları nasıl zarafetle hediye edeceğinizi paylaşıyor.", "ar": "تُعدّ الفواكه المجففة والمكسرات جزءًا أصيلًا من المائدة الأذربيجانية — مع الشاي، وفي المناسبات، وفي أرقى الهدايا. في هذا الدليل تشارك Xurcun كيفية التعرّف على الأصناف الرئيسية، وتمييز الجودة، وتقديمها كهدية بذوق رفيع."},
    sections: [{"h2": {"az": "Çeşidlər: hər birinin öz xarakteri var", "ru": "Сорта: у каждого свой характер", "en": "Varieties: each has its own character", "tr": "Çeşitler: her birinin kendi karakteri var", "ar": "الأصناف: لكلٍّ منها طابعه الخاص"}, "body": [{"az": "Quru meyvələr arasında ərik (qaysı) bal kimi şirin və yumşaq, əncir incə dənəcikli və zərif, tut isə kərpic-şəkər tamı ilə seçilir. Hər biri çay süfrəsinə fərqli not gətirir.", "ru": "Среди сухофруктов курага медово-сладкая и мягкая, инжир — с нежными зёрнышками и тонким вкусом, а тутовник отличается сахаристой, почти карамельной нотой. Каждый добавляет к чаю свой оттенок.", "en": "Among dried fruit, apricot is honey-sweet and soft, fig has delicate seeds and a refined taste, while mulberry stands out with a sugary, almost caramel note. Each brings a different note to the tea table.", "tr": "Kuru meyveler arasında kayısı bal gibi tatlı ve yumuşaktır, incir ince çekirdekli ve zarif, dut ise şekerli, neredeyse karamel notasıyla öne çıkar. Her biri çay sofrasına farklı bir tat katar.", "ar": "بين الفواكه المجففة، المشمش حلو كالعسل وطريّ، والتين ذو بذور رقيقة ومذاق راقٍ، أما التوت فيتميّز بنكهة سكرية تقترب من الكراميل. كلٌّ منها يضيف لمسة مختلفة إلى مائدة الشاي."}, {"az": "Qoz-fındıqda qoz zəngin və yağlı, fındıq qovrulduqda ətirli, püstə yumşaq duzlu və canlı yaşıl, badam isə təmiz, balanslı dada malikdir. Birlikdə onlar mükəmməl bir qarışıq yaradır.", "ru": "Из орехов грецкий — насыщенный и маслянистый, фундук при обжарке ароматный, фисташка слегка солёная и ярко-зелёная, а миндаль — с чистым, сбалансированным вкусом. Вместе они образуют идеальную смесь.", "en": "Among nuts, walnut is rich and oily, hazelnut is fragrant when roasted, pistachio is gently salty and vivid green, and almond has a clean, balanced taste. Together they make a perfect mix.", "tr": "Çerezlerde ceviz zengin ve yağlıdır, fındık kavrulunca aromatiktir, antep fıstığı hafif tuzlu ve canlı yeşildir, badem ise temiz ve dengeli bir tada sahiptir. Bir arada mükemmel bir karışım oluştururlar.", "ar": "بين المكسرات، الجوز غنيّ ودسم، والبندق عطريّ عند تحميصه، والفستق مالح برفق وأخضر زاهٍ، واللوز ذو مذاق نقيّ متوازن. وهي معًا تصنع مزيجًا مثاليًا."}]}, {"h2": {"az": "Keyfiyyəti necə seçmək", "ru": "Как выбрать качество", "en": "How to choose quality", "tr": "Kaliteyi nasıl seçmeli", "ar": "كيف تختار الجودة"}, "body": [{"az": "Yaxşı quru meyvə təbii rəngə malik olur — həddən artıq parlaq və ya bərabər rəng çox vaxt emaldan xəbər verir. Yumşaq, elastik tekstura və təbii ətir tərçəkmənin düzgün aparıldığını göstərir.", "ru": "Хорошие сухофрукты имеют естественный цвет — слишком яркий или равномерный оттенок часто говорит об обработке. Мягкая, эластичная текстура и природный аромат указывают на правильную сушку.", "en": "Good dried fruit has a natural colour — an overly bright or uniform shade often signals heavy processing. A soft, elastic texture and natural aroma show the drying was done well.", "tr": "İyi kuru meyvenin rengi doğaldır; aşırı parlak veya tek düze bir ton çoğu zaman işlemden geçtiğine işaret eder. Yumuşak, esnek doku ve doğal koku, kurutmanın doğru yapıldığını gösterir.", "ar": "الفاكهة المجففة الجيدة لها لون طبيعي — واللون المفرط في اللمعان أو شديد التجانس كثيرًا ما يدل على معالجة كبيرة. القوام الطريّ المرن والرائحة الطبيعية يدلّان على تجفيف سليم."}, {"az": "Qoz-fındıqda təzəlik əsasdır: dənələr bütöv, qırışsız və acımış iyi olmadan olmalıdır. Püstə və qozun ləpəsi quru deyil, dolğun görünməlidir. Hava keçirməyən qablaşdırma təravəti qoruyur.", "ru": "В орехах главное — свежесть: ядра должны быть целыми, без сморщивания и прогорклого запаха. Ядра фисташки и грецкого ореха выглядят полными, а не сухими. Герметичная упаковка сохраняет свежесть.", "en": "With nuts, freshness is key: kernels should be whole, not shrivelled and without a rancid smell. Pistachio and walnut kernels should look plump, not dry. Airtight packaging keeps them fresh.", "tr": "Çerezlerde tazelik esastır: içler bütün, buruşmamış ve acımış kokusu olmadan olmalıdır. Antep fıstığı ve cevizin içi kuru değil, dolgun görünmelidir. Hava almayan ambalaj tazeliği korur.", "ar": "في المكسرات، الطزاجة هي الأساس: ينبغي أن تكون اللُّبّات كاملة وغير ذابلة وخالية من رائحة الزنخ. لُبّ الفستق والجوز يبدو ممتلئًا لا جافًّا. والتغليف المُحكم يحافظ على الطزاجة."}]}, {"h2": {"az": "Necə hədiyyə etmək", "ru": "Как дарить", "en": "How to gift them", "tr": "Nasıl hediye edilir", "ar": "كيف تُقدَّم كهدية"}, "body": [{"az": "Quru meyvə və qoz-fındıq hədiyyə kimi həm zərif, həm də mənalıdır. Rəng və tekstura baxımından bir-birini tamamlayan çeşidləri seçin — məsələn, qızılı ərik, tünd əncir, yaşıl püstə və açıq badam birlikdə gözəl görünür.", "ru": "Сухофрукты и орехи в подарок — это и изысканно, и со смыслом. Подбирайте сорта, которые дополняют друг друга по цвету и текстуре: золотистая курага, тёмный инжир, зелёная фисташка и светлый миндаль вместе смотрятся красиво.", "en": "Dried fruit and nuts make a gift that is both elegant and meaningful. Choose varieties that complement each other in colour and texture — golden apricot, dark fig, green pistachio and pale almond look beautiful together.", "tr": "Hediye olarak kuru meyve ve çerez hem zarif hem anlamlıdır. Renk ve doku açısından birbirini tamamlayan çeşitleri seçin: altın sarısı kayısı, koyu incir, yeşil antep fıstığı ve açık renk badem bir arada güzel durur.", "ar": "تُعدّ الفواكه المجففة والمكسرات هدية أنيقة وذات معنى في آنٍ واحد. اختر أصنافًا يكمّل بعضها بعضًا في اللون والقوام — المشمش الذهبي، والتين الداكن، والفستق الأخضر، واللوز الفاتح تبدو جميلة معًا."}, {"az": "Xurcun bu çeşidləri əl işi hədiyyə qutuları və xonçalarında, zövqlü tərtibatla birləşdirir. Kataloqdan seçib WhatsApp ilə sifariş edə və ya Bakıdakı 11 mağazadan birinə yaxınlaşa bilərsiniz.", "ru": "Xurcun объединяет эти сорта в подарочных коробках и хончах ручной работы с изысканным оформлением. Можно выбрать в каталоге и заказать в WhatsApp или зайти в один из 11 магазинов в Баку.", "en": "Xurcun brings these varieties together in handmade gift boxes and trays with elegant styling. You can choose from the catalogue and order on WhatsApp, or visit one of the 11 stores in Baku.", "tr": "Xurcun bu çeşitleri, zarif tasarımıyla el yapımı hediye kutuları ve honçalarda bir araya getirir. Katalogdan seçip WhatsApp üzerinden sipariş verebilir ya da Bakü'deki 11 mağazadan birine uğrayabilirsiniz.", "ar": "تجمع Xurcun هذه الأصناف في علب وصواني هدايا يدوية الصنع بتنسيق أنيق. يمكنك الاختيار من الكتالوج والطلب عبر واتساب، أو زيارة أحد المتاجر الـ11 في باكو."}]}],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
