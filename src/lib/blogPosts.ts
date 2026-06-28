// Xurcun blog — evergreen, SEO-focused articles. Fully multilingual
// (AZ/RU/EN/TR/AR). Content-in-code (no CMS). Slugs mirrored in
// api/lib/vite.ts (ROUTE_META) and api/boot.ts (sitemap).

export type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar';
export type L = { az: string; ru: string; en: string; tr: string; ar: string };
export type BlogSection = { h2: L; body: L[] };
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
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
