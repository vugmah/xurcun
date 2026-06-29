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
  video?: string; // optional hero video (cover used as poster)
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
    cover: "/images/gv-ribbons.webp",
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
    cover: "/images/gv-giftbox.webp",
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
    cover: "/images/gv-chocolate.webp",
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
    cover: "/images/gv-mix2.webp",
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
    cover: "/images/gv-mix.webp",
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
    cover: "/images/gv-driedfruit.webp",
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
    cover: "/images/blog/korporativ-box-1.webp",
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
    cover: "/images/blog/korporativ-brand-1.webp",
    title: {"az": "Bakıda hədiyyə hara almalı | Xurcun", "ru": "Где купить подарок в Баку | Xurcun", "en": "Where to buy a gift in Baku | Xurcun", "tr": "Bakü'de hediye nereden alınır | Xurcun", "ar": "أين تشتري هدية في باكو | Xurcun"},
    desc: {"az": "Bakıda yaxşı hədiyyə hara almalı? Premium hədiyyə qutuları, quru meyvə, çərəz və şirniyyat. Xurcun-un 11 mağazası və hava limanı filialı.", "ru": "Где купить хороший подарок в Баку? Премиальные подарочные коробки, сухофрукты, орехи и сладости. 11 магазинов Xurcun и филиал в аэропорту.", "en": "Where to buy a good gift in Baku? Premium gift boxes, dried fruit, nuts and sweets. Xurcun's 11 boutiques plus the airport store.", "tr": "Bakü'de iyi bir hediye nereden alınır? Premium hediye kutuları, kuru meyve, çerez ve tatlılar. Xurcun'un 11 mağazası ve havalimanı şubesi.", "ar": "أين تشتري هدية جيدة في باكو؟ علب هدايا فاخرة وفواكه مجففة ومكسرات وحلويات. 11 متجرًا من Xurcun وفرع في المطار."},
    h1: {"az": "Bakıda hədiyyə hara almalı — sakinlər və qonaqlar üçün bələdçi", "ru": "Где купить подарок в Баку — гид для местных и туристов", "en": "Where to buy a gift in Baku — a guide for locals and visitors", "tr": "Bakü'de hediye nereden alınır — yerliler ve misafirler için rehber", "ar": "أين تشتري هدية في باكو — دليل للمقيمين والزوار"},
    lead: {"az": "İstər doğum günü, istər toy, istərsə də Bakıdan aparılacaq bir xatirə olsun — yaxşı hədiyyə həm zövqlü görünməli, həm də səmimi olmalıdır. Xurcun premium quru meyvə, qoz-fındıq, şokolad, lokum və paxlava ilə bəzədilmiş əl işi hədiyyə qutuları təqdim edir; üstəlik Bakı boyunca 11 mağaza və hava limanı filialı ilə hara getsəniz, yaxınlıqda bir Xurcun var.", "ru": "День рождения, свадьба или сувенир из Баку на память — хороший подарок должен выглядеть со вкусом и быть искренним. Xurcun предлагает подарочные коробки ручной работы с премиальными сухофруктами, орехами, шоколадом, лукумом и пахлавой; а благодаря 11 магазинам по всему Баку и филиалу в аэропорту Xurcun всегда оказывается рядом.", "en": "A birthday, a wedding, or a keepsake to take home from Baku — a good gift should look tasteful and feel sincere. Xurcun offers handmade gift boxes filled with premium dried fruit, nuts, chocolate, Turkish delight and baklava; and with 11 boutiques across Baku plus an airport store, there is always a Xurcun close by.", "tr": "Bir doğum günü, bir düğün ya da Bakü'den götürülecek bir hatıra — iyi bir hediye hem zarif görünmeli hem de samimi olmalı. Xurcun; premium kuru meyve, çerez, çikolata, lokum ve baklava ile süslenmiş el yapımı hediye kutuları sunar; üstelik Bakü genelinde 11 mağaza ve havalimanı şubesiyle nereye giderseniz gidin yakınınızda bir Xurcun bulunur.", "ar": "عيد ميلاد أو حفل زفاف أو تذكار تأخذه معك من باكو — الهدية الجيدة يجب أن تبدو أنيقة وأن تكون صادقة. تقدّم Xurcun علب هدايا يدوية مليئة بالفواكه المجففة الفاخرة والمكسرات والشوكولاتة والحلقوم والبقلاوة؛ ومع 11 متجرًا في أنحاء باكو إضافةً إلى فرع في المطار، ستجد دائمًا متجر Xurcun قريبًا منك."},
    sections: [{"h2": {"az": "Hədiyyə qutuları və xonçalar — ən asan seçim", "ru": "Подарочные коробки и хончи — самый простой выбор", "en": "Gift boxes and trays — the easiest choice", "tr": "Hediye kutuları ve honçalar — en kolay seçim", "ar": "علب الهدايا والصواني — الخيار الأسهل"}, "body": [{"az": "Vaxtınız azdırsa və hər kəsin xoşuna gələ biləcək bir hədiyyə axtarırsınızsa, hazır hədiyyə qutusu ən etibarlı seçimdir. Xurcun qutuları seçmə quru meyvə, premium qoz-fındıq, şokolad, lokum və paxlava ilə əl işi şəklində tərtib olunur.", "ru": "Если времени мало, а подарок должен понравиться каждому, готовая подарочная коробка — самый надёжный вариант. Коробки Xurcun собираются вручную из отборных сухофруктов, премиальных орехов, шоколада, лукума и пахлавы.", "en": "If you are short on time and want a gift that pleases almost anyone, a ready gift box is the safest choice. Xurcun boxes are assembled by hand from selected dried fruit, premium nuts, chocolate, Turkish delight and baklava.", "tr": "Vaktiniz azsa ve hemen herkesin beğeneceği bir hediye arıyorsanız, hazır hediye kutusu en güvenli seçimdir. Xurcun kutuları; seçme kuru meyve, premium çerez, çikolata, lokum ve baklavadan elde hazırlanır.", "ar": "إذا كان وقتك ضيّقًا وتريد هدية تنال إعجاب الجميع تقريبًا، فإن علبة الهدايا الجاهزة هي الخيار الأكثر أمانًا. تُجهَّز علب Xurcun يدويًا من فواكه مجففة منتقاة ومكسرات فاخرة وشوكولاتة وحلقوم وبقلاوة."}, {"az": "Toy, nişan və ya rəsmi münasibətlər üçün bəzədilmiş xonçalar var; içindəkiləri və ölçünü büdcənizə uyğun seçə bilərsiniz. Beləcə həm kiçik bir diqqət, həm də təntənəli bir hədiyyə eyni yerdən tapılır.", "ru": "Для свадеб, помолвок и официальных поводов есть украшенные хончи; состав и размер можно подобрать под бюджет. Так и небольшой знак внимания, и торжественный подарок находятся в одном месте.", "en": "For weddings, engagements and formal occasions there are decorated trays; you can match the contents and size to your budget. That way both a small token and a grand gift come from the same place.", "tr": "Düğün, nişan ve resmi durumlar için süslü honçalar var; içeriği ve boyutu bütçenize göre seçebilirsiniz. Böylece hem küçük bir jest hem de görkemli bir hediye aynı yerden bulunur.", "ar": "وللأعراس والخطوبة والمناسبات الرسمية توجد صوانٍ مزخرفة؛ يمكنك اختيار المحتوى والحجم بما يناسب ميزانيتك. وهكذا تجد اللفتة البسيطة والهدية الفخمة في المكان نفسه."}]}, {"h2": {"az": "Quru meyvə, çərəz və şirniyyat — Bakıdan dadlı bir xatirə", "ru": "Сухофрукты, орехи и сладости — вкусный сувенир из Баку", "en": "Dried fruit, nuts and sweets — a tasty keepsake from Baku", "tr": "Kuru meyve, çerez ve tatlılar — Bakü'den lezzetli bir hatıra", "ar": "الفواكه المجففة والمكسرات والحلويات — تذكار لذيذ من باكو"}, "body": [{"az": "Bakıya gələn qonaqlar üçün ən gözəl hədiyyə — bölgənin dadını özü ilə aparmaqdır. Quru meyvə, qoz-fındıq və lokum həm uzun müddət saxlanılır, həm də səfərdə rahat daşınır.", "ru": "Для гостей Баку лучший подарок — увезти с собой вкус региона. Сухофрукты, орехи и лукум долго хранятся и удобно перевозятся в поездке.", "en": "For visitors to Baku, the finest gift is to take the taste of the region home. Dried fruit, nuts and Turkish delight keep well and travel easily.", "tr": "Bakü'ye gelen misafirler için en güzel hediye, bölgenin tadını yanında götürmektir. Kuru meyve, çerez ve lokum hem uzun süre saklanır hem de yolculukta rahat taşınır.", "ar": "بالنسبة لزوار باكو، أجمل هدية هي أن تأخذ نكهة المنطقة معك إلى الوطن. فالفواكه المجففة والمكسرات والحلقوم تُحفظ طويلًا وتسهل حملها في السفر."}, {"az": "İstədiyiniz çeşidləri seçib öz qarışığınızı yaratmaq da mümkündür — sevdiyiniz adamın zövqünə uyğun fərdi bir hədiyyə alınır. Bağlama və tərtibat da zövqlü olduğundan əlavə bəzəyə ehtiyac qalmır.", "ru": "Можно выбрать любимые позиции и составить собственную смесь — получится индивидуальный подарок под вкус близкого человека. Упаковка и оформление аккуратные, так что дополнительное украшение не нужно.", "en": "You can also pick your favourite items and build your own mix — a personal gift tuned to the recipient's taste. The packaging and presentation are tasteful, so no extra wrapping is needed.", "tr": "Dilediğiniz çeşitleri seçip kendi karışımınızı oluşturabilirsiniz — sevdiğiniz kişinin zevkine göre kişisel bir hediye olur. Ambalaj ve sunum da şık olduğundan ek bir süslemeye gerek kalmaz.", "ar": "ويمكنك أيضًا اختيار أصنافك المفضلة وتكوين خلطتك الخاصة — لتحصل على هدية شخصية تناسب ذوق من تحب. والتغليف والتنسيق أنيقان، فلا حاجة إلى زينة إضافية."}]}, {"h2": {"az": "Korporativ hədiyyələr və hara müraciət etmək", "ru": "Корпоративные подарки и куда обращаться", "en": "Corporate gifts and where to go", "tr": "Kurumsal hediyeler ve nereye başvurmalı", "ar": "الهدايا المؤسسية وأين تتوجه"}, "body": [{"az": "Şirkətlər üçün müştərilərə, tərəfdaşlara və komandaya verilən hədiyyələr brendin imicinin bir hissəsidir. Xurcun korporativ sifarişlər üçün vahid zövqdə tərtib olunmuş, çoxsaylı qutular hazırlayır; büdcə və say artdıqca xüsusi şərtlər mümkündür.", "ru": "Для компаний подарки клиентам, партнёрам и команде — часть имиджа бренда. Xurcun готовит корпоративные заказы в едином стиле большими партиями; при росте объёма возможны особые условия.", "en": "For companies, gifts to clients, partners and the team are part of the brand image. Xurcun prepares corporate orders styled consistently and in volume; special terms are possible as quantities grow.", "tr": "Şirketler için müşterilere, iş ortaklarına ve ekibe verilen hediyeler markanın imajının bir parçasıdır. Xurcun, kurumsal siparişleri tek bir tarzda ve çok sayıda hazırlar; adet arttıkça özel koşullar mümkündür.", "ar": "بالنسبة للشركات، تُعد الهدايا للعملاء والشركاء والفريق جزءًا من صورة العلامة التجارية. تُجهّز Xurcun الطلبات المؤسسية بأسلوب موحّد وبكميات كبيرة؛ ومع زيادة الكمية تتوفر شروط خاصة."}, {"az": "Almaq üçün Bakı boyunca 11 Xurcun mağazasından birinə yaxınlaşa, kataloqdan seçim edib WhatsApp ilə sifariş verə bilərsiniz. Şəhərdən ayrılarkən isə hava limanı filialı son anda alınan hədiyyə üçün rahat bir nöqtədir.", "ru": "Чтобы купить, зайдите в один из 11 магазинов Xurcun по Баку или выберите в каталоге и закажите в WhatsApp. А при отъезде филиал в аэропорту удобен для подарка в последнюю минуту.", "en": "To buy, visit one of Xurcun's 11 stores across Baku, or pick from the catalogue and order on WhatsApp. And when you are leaving the city, the airport store is a convenient spot for a last-minute gift.", "tr": "Satın almak için Bakü genelindeki 11 Xurcun mağazasından birine uğrayabilir ya da katalogdan seçip WhatsApp üzerinden sipariş verebilirsiniz. Şehirden ayrılırken de havalimanı şubesi, son dakika hediyesi için rahat bir noktadır.", "ar": "للشراء، زُر أحد متاجر Xurcun الـ11 في أنحاء باكو، أو اختر من الكتالوج واطلب عبر واتساب. وعند مغادرتك المدينة، يكون فرع المطار نقطة مريحة لهدية اللحظة الأخيرة."}]}],
  },
  {
    slug: "baku-suvenir-belecisi",
    date: "2026-06-29",
    cover: "/images/gv-nuts2.webp",
    title: {"az": "Bakıdan nə aparmaq olar — suvenir bələdçisi | Xurcun", "ru": "Что привезти из Баку — гид по сувенирам | Xurcun", "en": "What to bring back from Baku — souvenir guide | Xurcun", "tr": "Bakü'den ne alınır — hediyelik rehberi | Xurcun", "ar": "ماذا تشتري من باكو — دليل الهدايا التذكارية | Xurcun"},
    desc: {"az": "Bakıdan aparmaq üçün ən gözəl suvenirlər: Azərbaycan quru meyvəsi, qoz-fındıq, paxlava, lokum, çay və əl işi hədiyyə qutuları. Hava limanı mağazaları.", "ru": "Лучшие сувениры из Баку: азербайджанские сухофрукты, орехи, пахлава, лукум, чай и подарочные коробки ручной работы. Бутики в аэропорту.", "en": "The best souvenirs from Baku: Azerbaijani dried fruit, nuts, baklava, Turkish delight, tea and handcrafted gift boxes. Airport boutiques too.", "tr": "Bakü'den alınacak en güzel hediyelikler: Azerbaycan kuru meyvesi, çerez, baklava, lokum, çay ve el yapımı hediye kutuları. Havalimanı mağazaları.", "ar": "أفضل الهدايا التذكارية من باكو: الفواكه المجففة الأذربيجانية والمكسرات والبقلاوة والحلقوم والشاي وعلب الهدايا اليدوية. بوتيكات المطار أيضًا."},
    h1: {"az": "Bakıdan nə aparmaq olar — suvenir bələdçisi", "ru": "Что привезти из Баку — гид по сувенирам", "en": "What to bring back from Baku — a souvenir guide", "tr": "Bakü'den ne alınır — hediyelik rehberi", "ar": "ماذا تشتري من باكو — دليل الهدايا التذكارية"},
    lead: {"az": "Bakıdan vətənə dönərkən sevdiklərinizə həm dadlı, həm də unudulmaz bir töhfə aparmaq istəyirsiniz. Magnit və açarlıqlardan kənara çıxın: Azərbaycanın əsl ləzzətləri — seçmə quru meyvə, qoz-fındıq, paxlava, lokum və ətirli çay — ən səmimi suvenirlərdir. Xurcun bütün bunları zövqlü, əl işi hədiyyə qutularında bir araya gətirir.", "ru": "Возвращаясь из Баку, хочется привезти близким нечто вкусное и запоминающееся. Выйдите за рамки магнитов и брелоков: настоящие азербайджанские лакомства — отборные сухофрукты, орехи, пахлава, лукум и ароматный чай — лучшие сувениры. Xurcun собирает всё это в изящные подарочные коробки ручной работы.", "en": "Heading home from Baku, you want to bring loved ones something both delicious and memorable. Go beyond magnets and keychains: Azerbaijan's real flavours — choice dried fruit, nuts, baklava, Turkish delight and fragrant tea — make the warmest souvenirs. Xurcun brings them together in tasteful, handcrafted gift boxes.", "tr": "Bakü'den evinize dönerken sevdiklerinize hem lezzetli hem unutulmaz bir armağan götürmek istersiniz. Magnet ve anahtarlığın ötesine geçin: Azerbaycan'ın gerçek lezzetleri — seçme kuru meyve, çerez, baklava, lokum ve mis kokulu çay — en içten hediyeliklerdir. Xurcun bunların tümünü zarif, el yapımı hediye kutularında bir araya getirir.", "ar": "عند عودتك من باكو، تودّ أن تحمل لأحبائك شيئًا لذيذًا ولا يُنسى في آنٍ واحد. تجاوز المغناطيس وسلاسل المفاتيح: نكهات أذربيجان الحقيقية — الفواكه المجففة المنتقاة والمكسرات والبقلاوة والحلقوم والشاي العطري — هي أصدق الهدايا التذكارية. وتجمعها Xurcun كلها في علب هدايا أنيقة مصنوعة يدويًا."},
    sections: [{"h2": {"az": "Aparmağa dəyər əsl Azərbaycan ləzzətləri", "ru": "Настоящие азербайджанские вкусы, которые стоит привезти", "en": "Authentic Azerbaijani flavours worth taking home", "tr": "Götürmeye değer gerçek Azerbaycan lezzetleri", "ar": "نكهات أذربيجانية أصيلة تستحق أن تحملها معك"}, "body": [{"az": "Quru meyvə və qoz-fındıq Azərbaycanın günəşli iqliminin dadını daşıyır — sarı və qara mövüc, ərik, gilas qaxı, eləcə də fındıq, qoz və püstə. Bunlar yüngül, uzun müddət qalan və bavul üçün ideal suvenirlərdir.", "ru": "Сухофрукты и орехи хранят вкус солнечного климата Азербайджана — светлый и тёмный изюм, курага, пастила из вишни, а также фундук, грецкий орех и фисташки. Лёгкие, долго хранятся и идеальны для чемодана.", "en": "Dried fruit and nuts carry the taste of Azerbaijan's sunny climate — golden and dark raisins, apricots, cherry pastille, plus hazelnuts, walnuts and pistachios. They're light, keep for a long time and travel beautifully.", "tr": "Kuru meyve ve çerezler, Azerbaycan'ın güneşli ikliminin tadını taşır — sarı ve siyah kuru üzüm, kayısı, vişne pestili, ayrıca fındık, ceviz ve antep fıstığı. Hafif, uzun süre dayanır ve bavul için idealdir.", "ar": "تحمل الفواكه المجففة والمكسرات طعم مناخ أذربيجان المشمس — زبيب فاتح وداكن، ومشمش، وقطايف الكرز، إضافة إلى البندق والجوز والفستق. إنها خفيفة، تدوم طويلًا، ومثالية للحقيبة."}, {"az": "Şirniyyat sevənlər üçün paxlava və rəngarəng lokum əvəzedilməzdir — qoz, püstə və gül ləçəkli növləri ilə. Bir də ətirli Azərbaycan çayı: armudu stəkanda dəmlənən bu çay özü ilə bütöv bir mehmannavazlıq mədəniyyətini hədiyyə kimi aparmağa imkan verir.", "ru": "Для сладкоежек незаменимы пахлава и разноцветный лукум — с орехами, фисташками и лепестками роз. А ещё ароматный азербайджанский чай: заваренный в стакане «армуду», он позволяет увезти в подарок целую культуру гостеприимства.", "en": "For those with a sweet tooth, baklava and colourful Turkish delight are irreplaceable — with walnuts, pistachios and rose petals. And fragrant Azerbaijani tea: brewed in the pear-shaped armudu glass, it lets you carry home an entire culture of hospitality as a gift.", "tr": "Tatlı sevenler için baklava ve rengârenk lokum vazgeçilmezdir — cevizli, antep fıstıklı ve gül yapraklı çeşitleriyle. Bir de mis kokulu Azerbaycan çayı: armudu bardakta demlenen bu çay, koca bir misafirperverlik kültürünü hediye olarak götürmenizi sağlar.", "ar": "ولمحبي الحلويات، تبقى البقلاوة والحلقوم الملون لا غنى عنهما — بالجوز والفستق وبتلات الورد. وكذلك الشاي الأذربيجاني العطري: المُحضَّر في كأس «أرمودو» الكمثري الشكل، يتيح لك أن تحمل ثقافة ضيافة كاملة هدية معك."}]}, {"h2": {"az": "Niyə əl işi hədiyyə qutusu seçmək daha yaxşıdır", "ru": "Почему лучше выбрать подарочную коробку ручной работы", "en": "Why a handcrafted gift box is the smarter choice", "tr": "Neden el yapımı hediye kutusu daha iyi bir seçim", "ar": "لماذا علبة الهدايا اليدوية خيار أذكى"}, "body": [{"az": "Tək-tək məhsul axtarmaq əvəzinə, hazır hədiyyə qutusu vaxtınıza qənaət edir və daha səliqəli görünür. Xurcun qutuları əl işi ilə yığılır: seçmə quru meyvə, çərəz və şirniyyat zövqlü tərtibatla bir araya gəlir.", "ru": "Вместо того чтобы искать товары по отдельности, готовая подарочная коробка экономит время и выглядит гораздо аккуратнее. Коробки Xurcun собираются вручную: отборные сухофрукты, орехи и сладости — в изящном оформлении.", "en": "Instead of hunting for items one by one, a ready gift box saves time and looks far neater. Xurcun boxes are assembled by hand: choice dried fruit, nuts and sweets brought together with elegant presentation.", "tr": "Ürünleri tek tek aramak yerine hazır bir hediye kutusu hem zaman kazandırır hem de çok daha derli toplu görünür. Xurcun kutuları elde hazırlanır: seçme kuru meyve, çerez ve tatlılar zarif bir sunumla bir araya gelir.", "ar": "بدلًا من البحث عن المنتجات واحدًا تلو الآخر، توفّر علبة الهدايا الجاهزة وقتك وتبدو أكثر أناقة بكثير. تُجهَّز علب Xurcun يدويًا: فواكه مجففة منتقاة ومكسرات وحلويات تجتمع بتقديم أنيق."}, {"az": "Belə bir qutu həm səyahət xatirəsi, həm də qayıtdıqdan sonra ailəyə və ya iş yoldaşlarına veriləcək hazır hədiyyədir. Tərkibi istəyə görə fərdiləşdirmək mümkündür — sifariş üçün Bakıdakı 11 Xurcun mağazasından birinə yaxınlaşa, yaxud WhatsApp ilə əlaqə saxlaya bilərsiniz.", "ru": "Такая коробка — и сувенир из поездки, и готовый подарок для семьи или коллег по возвращении. Состав можно подобрать по желанию — для заказа зайдите в один из 11 магазинов Xurcun в Баку или напишите в WhatsApp.", "en": "Such a box is both a travel memory and a ready gift for family or colleagues once you're back. The contents can be customised — to order, visit one of Xurcun's 11 stores in Baku or reach out on WhatsApp.", "tr": "Böyle bir kutu hem bir seyahat hatırası hem de döndüğünüzde aileye ya da iş arkadaşlarına verilecek hazır bir hediyedir. İçeriği isteğe göre kişiselleştirilebilir — sipariş için Bakü'deki 11 Xurcun mağazasından birine uğrayabilir ya da WhatsApp'tan yazabilirsiniz.", "ar": "هذه العلبة هي في آنٍ واحد ذكرى من رحلتك وهدية جاهزة للعائلة أو الزملاء بعد عودتك. ويمكن تخصيص محتواها حسب الرغبة — للطلب، زُر أحد متاجر Xurcun الـ11 في باكو أو تواصل عبر واتساب."}]}, {"h2": {"az": "Son anda? Hava limanı və şəhər mağazaları", "ru": "В последний момент? Магазины в аэропорту и в городе", "en": "Last minute? Airport and city boutiques", "tr": "Son dakika mı? Havalimanı ve şehir mağazaları", "ar": "في اللحظة الأخيرة؟ متاجر المطار والمدينة"}, "body": [{"az": "Uçuşa az qalıb və hələ hədiyyə almamısınızsa, narahat olmayın. Bakı şəhərindəki Xurcun mağazaları mərkəzi məkanlarda yerləşir və paketlənmiş, səfərə hazır qutular təklif edir — bir neçə dəqiqəyə seçim etmək mümkündür.", "ru": "Если до вылета мало времени, а подарок ещё не куплен — не переживайте. Магазины Xurcun в Баку расположены в центральных местах и предлагают упакованные, готовые к поездке коробки — выбор займёт пару минут.", "en": "If your flight is near and you still haven't bought gifts, don't worry. Xurcun stores around Baku sit in central locations and offer pre-packed, travel-ready boxes — you can choose in just a few minutes.", "tr": "Uçuşunuza az kaldıysa ve henüz hediye almadıysanız, endişelenmeyin. Bakü'deki Xurcun mağazaları merkezi konumlardadır ve paketlenmiş, yolculuğa hazır kutular sunar — seçim yapmak yalnızca birkaç dakika sürer.", "ar": "إذا اقترب موعد رحلتك ولم تشترِ الهدايا بعد، فلا تقلق. تقع متاجر Xurcun في مواقع مركزية بمدينة باكو وتوفّر علبًا معبأة جاهزة للسفر — يمكنك الاختيار في دقائق معدودة."}, {"az": "Vaxtınız lap azdırsa, məhsulları əvvəlcədən kataloqdan baxıb WhatsApp ilə sifariş verə bilərsiniz ki, qutu sizi gözləsin. Beləcə Azərbaycanın əsl dadını — keyfiyyətə vurğun bir markanın əlindən — özünüzlə evə apararsınız.", "ru": "Если времени совсем нет, посмотрите товары в каталоге заранее и закажите в WhatsApp, чтобы коробка уже ждала вас. Так вы увезёте домой настоящий вкус Азербайджана — от бренда, влюблённого в качество.", "en": "If time is really short, browse the catalogue in advance and order on WhatsApp so the box is waiting for you. That way you take home the real taste of Azerbaijan — from a brand that is fond of quality.", "tr": "Vaktiniz çok azsa, ürünlere katalogdan önceden bakıp WhatsApp'tan sipariş verebilirsiniz; böylece kutu sizi bekler. Böylelikle Azerbaycan'ın gerçek tadını — kaliteye vurgun bir markanın elinden — evinize götürürsünüz.", "ar": "وإن كان وقتك ضيقًا جدًا، تصفّح الكتالوج مسبقًا واطلب عبر واتساب لتكون العلبة بانتظارك. وهكذا تحمل معك إلى البيت طعم أذربيجان الحقيقي — من علامة شغوفة بالجودة."}]}],
  },
  {
    slug: "azerbaycan-quru-meyve-belecisi",
    date: "2026-06-29",
    cover: "/images/gv-nuts.webp",
    title: {"az": "Quru meyvə və qoz-fındıq bələdçisi | Xurcun", "ru": "Гид по сухофруктам и орехам | Xurcun", "en": "Dried fruit & nuts buyer's guide | Xurcun", "tr": "Kuru meyve ve çerez rehberi | Xurcun", "ar": "دليل الفواكه المجففة والمكسرات | Xurcun"},
    desc: {"az": "Ərik, əncir, tut, qoz, fındıq, püstə, badam — Azərbaycan quru meyvə və qoz-fındıqlarını necə seçmək, dadmaq və hədiyyə etmək. Xurcun bələdçisi.", "ru": "Курага, инжир, тутовник, грецкий орех, фундук, фисташка, миндаль — как выбрать, дегустировать и дарить. Гид Xurcun.", "en": "Apricot, fig, mulberry, walnut, hazelnut, pistachio, almond — how to choose, taste and gift Azerbaijani dried fruit and nuts. A Xurcun guide.", "tr": "Kayısı, incir, dut, ceviz, fındık, antep fıstığı, badem — nasıl seçilir, tadılır ve hediye edilir. Xurcun rehberi.", "ar": "مشمش، تين، توت، جوز، بندق، فستق، لوز — كيف تختار وتتذوّق وتُهدي الفواكه المجففة والمكسرات. دليل Xurcun."},
    h1: {"az": "Azərbaycan quru meyvə və qoz-fındıq bələdçisi", "ru": "Гид по азербайджанским сухофруктам и орехам", "en": "A guide to Azerbaijani dried fruit and nuts", "tr": "Azerbaycan kuru meyve ve çerez rehberi", "ar": "دليل الفواكه المجففة والمكسرات الأذربيجانية"},
    lead: {"az": "Quru meyvə və qoz-fındıq Azərbaycan süfrəsinin əzəli bir parçasıdır — çayın yanında, bayram süfrəsində və ən zərif hədiyyələrdə. Bu bələdçidə əsas çeşidləri, keyfiyyəti necə ayırd etməyi və onları zövqlə necə hədiyyə etməyi Xurcun-un təcrübəsi ilə bölüşürük.", "ru": "Сухофрукты и орехи — неотъемлемая часть азербайджанского стола: к чаю, на праздник и в самых изысканных подарках. В этом гиде Xurcun делится знанием о главных сортах, признаках качества и о том, как красиво их дарить.", "en": "Dried fruit and nuts are an essential part of the Azerbaijani table — with tea, on festive occasions and in the most refined gifts. In this guide, Xurcun shares how to know the main varieties, how to judge quality and how to gift them with taste.", "tr": "Kuru meyve ve çerez, Azerbaycan sofrasının ayrılmaz bir parçasıdır; çayın yanında, bayram sofrasında ve en zarif hediyelerde. Bu rehberde Xurcun; başlıca çeşitleri, kaliteyi nasıl ayırt edeceğinizi ve onları nasıl zarafetle hediye edeceğinizi paylaşıyor.", "ar": "تُعدّ الفواكه المجففة والمكسرات جزءًا أصيلًا من المائدة الأذربيجانية — مع الشاي، وفي المناسبات، وفي أرقى الهدايا. في هذا الدليل تشارك Xurcun كيفية التعرّف على الأصناف الرئيسية، وتمييز الجودة، وتقديمها كهدية بذوق رفيع."},
    sections: [{"h2": {"az": "Çeşidlər: hər birinin öz xarakteri var", "ru": "Сорта: у каждого свой характер", "en": "Varieties: each has its own character", "tr": "Çeşitler: her birinin kendi karakteri var", "ar": "الأصناف: لكلٍّ منها طابعه الخاص"}, "body": [{"az": "Quru meyvələr arasında ərik (qaysı) bal kimi şirin və yumşaq, əncir incə dənəcikli və zərif, tut isə kərpic-şəkər tamı ilə seçilir. Hər biri çay süfrəsinə fərqli not gətirir.", "ru": "Среди сухофруктов курага медово-сладкая и мягкая, инжир — с нежными зёрнышками и тонким вкусом, а тутовник отличается сахаристой, почти карамельной нотой. Каждый добавляет к чаю свой оттенок.", "en": "Among dried fruit, apricot is honey-sweet and soft, fig has delicate seeds and a refined taste, while mulberry stands out with a sugary, almost caramel note. Each brings a different note to the tea table.", "tr": "Kuru meyveler arasında kayısı bal gibi tatlı ve yumuşaktır, incir ince çekirdekli ve zarif, dut ise şekerli, neredeyse karamel notasıyla öne çıkar. Her biri çay sofrasına farklı bir tat katar.", "ar": "بين الفواكه المجففة، المشمش حلو كالعسل وطريّ، والتين ذو بذور رقيقة ومذاق راقٍ، أما التوت فيتميّز بنكهة سكرية تقترب من الكراميل. كلٌّ منها يضيف لمسة مختلفة إلى مائدة الشاي."}, {"az": "Qoz-fındıqda qoz zəngin və yağlı, fındıq qovrulduqda ətirli, püstə yumşaq duzlu və canlı yaşıl, badam isə təmiz, balanslı dada malikdir. Birlikdə onlar mükəmməl bir qarışıq yaradır.", "ru": "Из орехов грецкий — насыщенный и маслянистый, фундук при обжарке ароматный, фисташка слегка солёная и ярко-зелёная, а миндаль — с чистым, сбалансированным вкусом. Вместе они образуют идеальную смесь.", "en": "Among nuts, walnut is rich and oily, hazelnut is fragrant when roasted, pistachio is gently salty and vivid green, and almond has a clean, balanced taste. Together they make a perfect mix.", "tr": "Çerezlerde ceviz zengin ve yağlıdır, fındık kavrulunca aromatiktir, antep fıstığı hafif tuzlu ve canlı yeşildir, badem ise temiz ve dengeli bir tada sahiptir. Bir arada mükemmel bir karışım oluştururlar.", "ar": "بين المكسرات، الجوز غنيّ ودسم، والبندق عطريّ عند تحميصه، والفستق مالح برفق وأخضر زاهٍ، واللوز ذو مذاق نقيّ متوازن. وهي معًا تصنع مزيجًا مثاليًا."}]}, {"h2": {"az": "Keyfiyyəti necə seçmək", "ru": "Как выбрать качество", "en": "How to choose quality", "tr": "Kaliteyi nasıl seçmeli", "ar": "كيف تختار الجودة"}, "body": [{"az": "Yaxşı quru meyvə təbii rəngə malik olur — həddən artıq parlaq və ya bərabər rəng çox vaxt emaldan xəbər verir. Yumşaq, elastik tekstura və təbii ətir tərçəkmənin düzgün aparıldığını göstərir.", "ru": "Хорошие сухофрукты имеют естественный цвет — слишком яркий или равномерный оттенок часто говорит об обработке. Мягкая, эластичная текстура и природный аромат указывают на правильную сушку.", "en": "Good dried fruit has a natural colour — an overly bright or uniform shade often signals heavy processing. A soft, elastic texture and natural aroma show the drying was done well.", "tr": "İyi kuru meyvenin rengi doğaldır; aşırı parlak veya tek düze bir ton çoğu zaman işlemden geçtiğine işaret eder. Yumuşak, esnek doku ve doğal koku, kurutmanın doğru yapıldığını gösterir.", "ar": "الفاكهة المجففة الجيدة لها لون طبيعي — واللون المفرط في اللمعان أو شديد التجانس كثيرًا ما يدل على معالجة كبيرة. القوام الطريّ المرن والرائحة الطبيعية يدلّان على تجفيف سليم."}, {"az": "Qoz-fındıqda təzəlik əsasdır: dənələr bütöv, qırışsız və acımış iyi olmadan olmalıdır. Püstə və qozun ləpəsi quru deyil, dolğun görünməlidir. Hava keçirməyən qablaşdırma təravəti qoruyur.", "ru": "В орехах главное — свежесть: ядра должны быть целыми, без сморщивания и прогорклого запаха. Ядра фисташки и грецкого ореха выглядят полными, а не сухими. Герметичная упаковка сохраняет свежесть.", "en": "With nuts, freshness is key: kernels should be whole, not shrivelled and without a rancid smell. Pistachio and walnut kernels should look plump, not dry. Airtight packaging keeps them fresh.", "tr": "Çerezlerde tazelik esastır: içler bütün, buruşmamış ve acımış kokusu olmadan olmalıdır. Antep fıstığı ve cevizin içi kuru değil, dolgun görünmelidir. Hava almayan ambalaj tazeliği korur.", "ar": "في المكسرات، الطزاجة هي الأساس: ينبغي أن تكون اللُّبّات كاملة وغير ذابلة وخالية من رائحة الزنخ. لُبّ الفستق والجوز يبدو ممتلئًا لا جافًّا. والتغليف المُحكم يحافظ على الطزاجة."}]}, {"h2": {"az": "Necə hədiyyə etmək", "ru": "Как дарить", "en": "How to gift them", "tr": "Nasıl hediye edilir", "ar": "كيف تُقدَّم كهدية"}, "body": [{"az": "Quru meyvə və qoz-fındıq hədiyyə kimi həm zərif, həm də mənalıdır. Rəng və tekstura baxımından bir-birini tamamlayan çeşidləri seçin — məsələn, qızılı ərik, tünd əncir, yaşıl püstə və açıq badam birlikdə gözəl görünür.", "ru": "Сухофрукты и орехи в подарок — это и изысканно, и со смыслом. Подбирайте сорта, которые дополняют друг друга по цвету и текстуре: золотистая курага, тёмный инжир, зелёная фисташка и светлый миндаль вместе смотрятся красиво.", "en": "Dried fruit and nuts make a gift that is both elegant and meaningful. Choose varieties that complement each other in colour and texture — golden apricot, dark fig, green pistachio and pale almond look beautiful together.", "tr": "Hediye olarak kuru meyve ve çerez hem zarif hem anlamlıdır. Renk ve doku açısından birbirini tamamlayan çeşitleri seçin: altın sarısı kayısı, koyu incir, yeşil antep fıstığı ve açık renk badem bir arada güzel durur.", "ar": "تُعدّ الفواكه المجففة والمكسرات هدية أنيقة وذات معنى في آنٍ واحد. اختر أصنافًا يكمّل بعضها بعضًا في اللون والقوام — المشمش الذهبي، والتين الداكن، والفستق الأخضر، واللوز الفاتح تبدو جميلة معًا."}, {"az": "Xurcun bu çeşidləri əl işi hədiyyə qutuları və xonçalarında, zövqlü tərtibatla birləşdirir. Kataloqdan seçib WhatsApp ilə sifariş edə və ya Bakıdakı 11 mağazadan birinə yaxınlaşa bilərsiniz.", "ru": "Xurcun объединяет эти сорта в подарочных коробках и хончах ручной работы с изысканным оформлением. Можно выбрать в каталоге и заказать в WhatsApp или зайти в один из 11 магазинов в Баку.", "en": "Xurcun brings these varieties together in handmade gift boxes and trays with elegant styling. You can choose from the catalogue and order on WhatsApp, or visit one of the 11 stores in Baku.", "tr": "Xurcun bu çeşitleri, zarif tasarımıyla el yapımı hediye kutuları ve honçalarda bir araya getirir. Katalogdan seçip WhatsApp üzerinden sipariş verebilir ya da Bakü'deki 11 mağazadan birine uğrayabilirsiniz.", "ar": "تجمع Xurcun هذه الأصناف في علب وصواني هدايا يدوية الصنع بتنسيق أنيق. يمكنك الاختيار من الكتالوج والطلب عبر واتساب، أو زيارة أحد المتاجر الـ11 في باكو."}]}],
  },
  {
    slug: "yeni-il-hediyyeleri",
    date: "2026-06-29",
    cover: "/images/home/hero.webp",
    title: {"az": "Yeni il hədiyyə ideyaları | Xurcun", "ru": "Идеи новогодних подарков | Xurcun", "en": "New Year gift ideas | Xurcun", "tr": "Yılbaşı hediye fikirleri | Xurcun", "ar": "أفكار هدايا رأس السنة | Xurcun"},
    desc: {"az": "Yeni il və qış bayramları üçün premium hədiyyə ideyaları: quru meyvə, qoz-fındıq, şokolad və lokum qutuları, korporativ hədiyyələr. Xurcun, Bakı.", "ru": "Идеи премиальных подарков на Новый год: коробки с сухофруктами, орехами, шоколадом и лукумом, корпоративные подарки. Xurcun, Баку.", "en": "Premium New Year and winter holiday gift ideas: dried fruit, nut, chocolate and lokum boxes, plus corporate gifts. Xurcun, Baku.", "tr": "Yılbaşı ve kış bayramları için premium hediye fikirleri: kuru meyve, çerez, çikolata ve lokum kutuları, kurumsal hediyeler. Xurcun, Bakü.", "ar": "أفكار هدايا فاخرة لرأس السنة وأعياد الشتاء: علب فواكه مجففة ومكسرات وشوكولاتة وحلقوم وهدايا للشركات. Xurcun، باكو."},
    h1: {"az": "Yeni il hədiyyə ideyaları — qış bayramlarına zövqlü hazırlıq", "ru": "Идеи новогодних подарков — со вкусом встречаем зимние праздники", "en": "New Year gift ideas — a tasteful way to greet the winter holidays", "tr": "Yılbaşı hediye fikirleri — kış bayramlarına zarif bir hazırlık", "ar": "أفكار هدايا رأس السنة — استقبال أنيق لأعياد الشتاء"},
    lead: {"az": "Yeni il yaxınlaşır və sevdiklərinizə nə bağışlamaq sualı yenidən gündəmə gəlir. Xurcun premium quru meyvə, qoz-fındıq, şokolad və lokumdan ibarət, qış bayramlarının ab-havasını əks etdirən əl işi hədiyyə qutuları təqdim edir — istər ailə üçün, istər korporativ təbriklər üçün.", "ru": "Новый год всё ближе, и снова встаёт вопрос, что подарить близким. Xurcun предлагает подарочные коробки ручной работы из премиальных сухофруктов, орехов, шоколада и лукума, передающие атмосферу зимних праздников — и для семьи, и для корпоративных поздравлений.", "en": "The New Year is drawing near, and the question of what to give your loved ones returns once more. Xurcun offers handmade gift boxes of premium dried fruit, nuts, chocolate and lokum that capture the spirit of the winter holidays — whether for family or corporate greetings.", "tr": "Yılbaşı yaklaşıyor ve sevdiklerinize ne hediye edeceğiniz sorusu yeniden gündeme geliyor. Xurcun; premium kuru meyve, çerez, çikolata ve lokumdan oluşan, kış bayramlarının ruhunu yansıtan el yapımı hediye kutuları sunar — ister aile için, ister kurumsal kutlamalar için.", "ar": "يقترب رأس السنة، ويعود سؤال ماذا تهدي لأحبائك من جديد. تقدّم Xurcun علب هدايا يدوية من الفواكه المجففة الفاخرة والمكسرات والشوكولاتة والحلقوم تعكس أجواء أعياد الشتاء — سواء للعائلة أو لتهاني الشركات."},
    sections: [{"h2": {"az": "Ailə və dostlar üçün premium hədiyyə qutuları", "ru": "Премиальные подарочные коробки для семьи и друзей", "en": "Premium gift boxes for family and friends", "tr": "Aile ve dostlar için premium hediye kutuları", "ar": "علب هدايا فاخرة للعائلة والأصدقاء"}, "body": [{"az": "Yeni il süfrəsinə yaraşan ən gözəl hədiyyə — seçmə quru meyvə, premium qoz-fındıq, ləziz şokolad və müxtəlif çeşid lokumla bəzədilmiş qutudur. Hər qutu zövqlə tərtib olunur və açan anda bayram ovqatı yaradır.", "ru": "Лучший подарок к новогоднему столу — коробка с отборными сухофруктами, премиальными орехами, изысканным шоколадом и разными видами лукума. Каждая коробка оформлена со вкусом и создаёт праздничное настроение с первого взгляда.", "en": "The finest gift for the New Year table is a box of selected dried fruit, premium nuts, fine chocolate and assorted lokum. Each box is styled with care and sets a festive mood the moment it is opened.", "tr": "Yılbaşı sofrasına en güzel hediye; seçme kuru meyve, premium çerez, lezzetli çikolata ve çeşitli lokumlarla hazırlanmış bir kutudur. Her kutu zarafetle tasarlanır ve açıldığı an bayram havası yaratır.", "ar": "أجمل هدية لمائدة رأس السنة هي علبة من الفواكه المجففة المنتقاة والمكسرات الفاخرة والشوكولاتة اللذيذة وأنواع مختلفة من الحلقوم. تُنسَّق كل علبة بعناية وتمنح أجواء العيد من لحظة فتحها."}, {"az": "Hədiyyənin ölçüsünü və tərkibini büdcənizə və zövqünüzə uyğun seçə bilərsiniz — kiçik diqqət hədiyyəsindən tutmuş zəngin bayram dəstinə qədər.", "ru": "Размер и состав подарка можно подобрать под ваш бюджет и вкус — от небольшого знака внимания до богатого праздничного набора.", "en": "You can choose the size and contents to suit your budget and taste — from a small token of attention to a rich festive set.", "tr": "Hediyenin boyutunu ve içeriğini bütçenize ve zevkinize göre seçebilirsiniz — küçük bir incelikten zengin bir bayram setine kadar.", "ar": "يمكنك اختيار حجم الهدية ومحتواها بما يناسب ميزانيتك وذوقك — من لفتة بسيطة إلى طقم احتفالي غني."}]}, {"h2": {"az": "Korporativ Yeni il hədiyyələri", "ru": "Корпоративные новогодние подарки", "en": "Corporate New Year gifts", "tr": "Kurumsal yılbaşı hediyeleri", "ar": "هدايا الشركات لرأس السنة"}, "body": [{"az": "Əməkdaşlara, müştərilərə və tərəfdaşlara verilən Yeni il hədiyyəsi şirkətinizin zövqünü və qayğısını əks etdirir. Xurcun korporativ sifarişlər üçün vahid dizaynda, çoxsaylı premium hədiyyə qutuları hazırlayır.", "ru": "Новогодний подарок сотрудникам, клиентам и партнёрам отражает вкус и заботу вашей компании. Xurcun готовит партии премиальных подарочных коробок в едином оформлении под корпоративные заказы.", "en": "A New Year gift for employees, clients and partners reflects your company's taste and care. Xurcun prepares batches of premium gift boxes in a unified design for corporate orders.", "tr": "Çalışanlara, müşterilere ve iş ortaklarına verilen yılbaşı hediyesi şirketinizin zevkini ve özenini yansıtır. Xurcun, kurumsal siparişler için tek bir tasarımda çok sayıda premium hediye kutusu hazırlar.", "ar": "تعكس هدية رأس السنة للموظفين والعملاء والشركاء ذوق شركتك واهتمامها. تُجهّز Xurcun دفعات من علب الهدايا الفاخرة بتصميم موحّد للطلبات المؤسسية."}, {"az": "Çoxsaylı sifarişlər üçün xüsusi tərtibat və loqonuzun əlavə olunması mümkündür. Detallar və say üçün bizimlə əvvəlcədən əlaqə saxlamağınız tövsiyə olunur.", "ru": "Для крупных заказов возможны индивидуальное оформление и нанесение вашего логотипа. Детали и количество рекомендуем согласовать заранее.", "en": "Custom styling and adding your logo are possible for bulk orders. We recommend agreeing on the details and quantity in advance.", "tr": "Toplu siparişler için özel tasarım ve logonuzun eklenmesi mümkündür. Ayrıntıları ve adedi önceden görüşmenizi öneririz.", "ar": "يمكن تخصيص التصميم وإضافة شعارك للطلبات الكبيرة. ننصح بالاتفاق على التفاصيل والكمية مسبقًا."}]}, {"h2": {"az": "Necə və nə vaxt sifariş etməli?", "ru": "Как и когда заказать?", "en": "How and when to order?", "tr": "Nasıl ve ne zaman sipariş verilir?", "ar": "كيف ومتى تطلب؟"}, "body": [{"az": "Kataloqdan bəyəndiyiniz məhsulları seçib WhatsApp ilə sifariş edə, yaxud Bakıdakı 11 Xurcun mağazasından birinə, o cümlədən hava limanı filialına yaxınlaşa bilərsiniz.", "ru": "Выберите понравившиеся товары в каталоге и оформите заказ в WhatsApp или зайдите в один из 11 магазинов Xurcun в Баку, включая филиал в аэропорту.", "en": "Pick the products you like in the catalogue and order on WhatsApp, or visit one of Xurcun's 11 stores in Baku, including the airport branch.", "tr": "Katalogdan beğendiğiniz ürünleri seçip WhatsApp üzerinden sipariş verebilir ya da havalimanı şubesi dahil Bakü'deki 11 Xurcun mağazasından birine uğrayabilirsiniz.", "ar": "اختر المنتجات التي تعجبك من الكتالوج واطلب عبر واتساب، أو زُر أحد متاجر Xurcun الـ11 في باكو، بما في ذلك فرع المطار."}, {"az": "Yeni il ərəfəsi sifarişlərin ən sıx olduğu dövrdür — istədiyiniz tərtibat və çatdırılma vaxtına çatmaq üçün hədiyyələrinizi əvvəlcədən planlaşdırmağınızı tövsiyə edirik.", "ru": "Канун Нового года — самый загруженный период по заказам, поэтому советуем планировать подарки заранее, чтобы успеть с нужным оформлением и сроком.", "en": "The run-up to New Year is the busiest period for orders, so we recommend planning your gifts in advance to secure the styling and timing you want.", "tr": "Yılbaşı arifesi siparişlerin en yoğun olduğu dönemdir; istediğiniz tasarıma ve teslim zamanına yetişmek için hediyelerinizi önceden planlamanızı öneririz.", "ar": "تُعدّ فترة ما قبل رأس السنة الأكثر ازدحامًا بالطلبات، لذا ننصح بالتخطيط لهداياك مسبقًا لضمان التصميم والموعد الذي ترغب به."}]}],
  },
  {
    slug: "hediyye-qutusu-secimi",
    date: "2026-06-29",
    cover: "/images/blog/korporativ-box-2.webp",
    title: {"az": "Hədiyyə qutusu necə seçilir | Xurcun", "ru": "Как выбрать подарочную коробку | Xurcun", "en": "How to choose a gift box | Xurcun", "tr": "Hediye kutusu nasıl seçilir | Xurcun", "ar": "كيف تختار علبة الهدية | Xurcun"},
    desc: {"az": "Hədiyyə qutusu seçim bələdçisi: münasibətə, büdcəyə və tərkibə görə düzgün qutu, fərdiləşdirmə və təqdimat məsləhətləri. Xurcun, Bakı.", "ru": "Гид по выбору подарочной коробки: подбор по поводу, бюджету и составу, персонализация и оформление. Xurcun, Баку.", "en": "A guide to choosing a gift box: by occasion, budget and contents, plus personalization and presentation tips. Xurcun, Baku.", "tr": "Hediye kutusu seçim rehberi: vesileye, bütçeye ve içeriğe göre seçim, kişiselleştirme ve sunum ipuçları. Xurcun, Bakü.", "ar": "دليل اختيار علبة الهدية: حسب المناسبة والميزانية والمحتوى، مع نصائح التخصيص والتقديم. Xurcun، باكو."},
    h1: {"az": "Hədiyyə qutusu necə seçilir — addım-addım bələdçi", "ru": "Как выбрать подарочную коробку — пошаговый гид", "en": "How to choose the perfect gift box — a step-by-step guide", "tr": "Mükemmel hediye kutusu nasıl seçilir — adım adım rehber", "ar": "كيف تختار علبة الهدية المثالية — دليل خطوة بخطوة"},
    lead: {"az": "Doğru hədiyyə qutusu yalnız gözəl görünmür — alanın zövqünə, münasibətə və büdcənizə uyğun gəlir. Bu bələdçidə Xurcun-un premium quru meyvə, qoz-fındıq, şokolad və lokum qutularını münasibətə, büdcəyə və tərkibə görə necə seçəcəyinizi, həmçinin fərdiləşdirmə və təqdimat incəliklərini izah edirik.", "ru": "Правильная подарочная коробка не просто красиво выглядит — она подходит вкусу получателя, поводу и вашему бюджету. В этом гиде мы объясняем, как выбрать коробки Xurcun с премиальными сухофруктами, орехами, шоколадом и лукумом по поводу, бюджету и составу, а также тонкости персонализации и оформления.", "en": "The right gift box does more than look beautiful — it fits the recipient's taste, the occasion and your budget. In this guide we explain how to choose Xurcun's premium dried fruit, nut, chocolate and Turkish delight boxes by occasion, budget and contents, plus the finer points of personalization and presentation.", "tr": "Doğru hediye kutusu sadece güzel görünmez — alıcının zevkine, vesileye ve bütçenize uyar. Bu rehberde, Xurcun'un premium kuru meyve, çerez, çikolata ve lokum kutularını vesileye, bütçeye ve içeriğe göre nasıl seçeceğinizi, ayrıca kişiselleştirme ve sunum inceliklerini anlatıyoruz.", "ar": "علبة الهدية المناسبة لا تكتفي بالمظهر الجميل — بل تلائم ذوق المُهدى إليه والمناسبة وميزانيتك. في هذا الدليل نوضّح كيف تختار علب Xurcun الفاخرة من الفواكه المجففة والمكسرات والشوكولاتة والحلقوم حسب المناسبة والميزانية والمحتوى، إضافةً إلى دقائق التخصيص والتقديم."},
    sections: [{"h2": {"az": "Münasibətə görə seçim: toy, ad günü, korporativ", "ru": "Выбор по поводу: свадьба, день рождения, корпоратив", "en": "Choosing by occasion: wedding, birthday, corporate", "tr": "Vesileye göre seçim: düğün, doğum günü, kurumsal", "ar": "الاختيار حسب المناسبة: زفاف، عيد ميلاد، شركات"}, "body": [{"az": "Toy və nişan üçün zərif, klassik tərtibat — qızıl lent və ənənəvi şirniyyatla — uyğundur; ad günü üçün isə alanın sevdiyi dadlara köklənmiş, daha şən və rəngarəng qutu seçmək olar. Münasibət qutunun ölçüsünü, rəngini və tərkibini müəyyən edir.", "ru": "Для свадьбы и помолвки подойдёт изящное классическое оформление — золотая лента и традиционные сладости; для дня рождения можно выбрать более яркую и весёлую коробку, ориентированную на любимые вкусы получателя. Повод определяет размер, цвет и состав коробки.", "en": "For a wedding or engagement, an elegant, classic styling — gold ribbon and traditional sweets — works best; for a birthday you can pick a brighter, more playful box tuned to the recipient's favourite flavours. The occasion sets the box's size, colour and contents.", "tr": "Düğün ve nişan için zarif, klasik bir tasarım — altın kurdele ve geleneksel tatlılar — uygundur; doğum günü için ise alıcının sevdiği tatlara göre daha canlı ve neşeli bir kutu seçebilirsiniz. Vesile; kutunun boyutunu, rengini ve içeriğini belirler.", "ar": "للزفاف والخطوبة يناسب التنسيق الأنيق الكلاسيكي — شريط ذهبي وحلويات تقليدية؛ أما لعيد الميلاد فيمكن اختيار علبة أكثر حيويةً ومرحًا تتمحور حول النكهات المفضّلة للمُهدى إليه. المناسبة هي التي تحدّد حجم العلبة ولونها ومحتواها."}, {"az": "Korporativ hədiyyələrdə ardıcıllıq və zövq vacibdir — eyni dizaynda çoxsaylı qutular, istəyə görə şirkət rəngləri və loqo ilə. Xurcun korporativ sifarişlər üçün xüsusi tərtibat və çoxsaylı qutu hazırlayır.", "ru": "В корпоративных подарках важны единообразие и вкус — множество коробок в одном дизайне, при желании в цветах компании и с логотипом. Xurcun готовит индивидуальное оформление и крупные партии для корпоративных заказов.", "en": "For corporate gifts, consistency and taste matter — many boxes in one design, optionally in company colours and with a logo. Xurcun prepares custom styling and bulk quantities for corporate orders.", "tr": "Kurumsal hediyelerde tutarlılık ve zarafet önemlidir — aynı tasarımda çok sayıda kutu, istenirse şirket renkleri ve logoyla. Xurcun, kurumsal siparişler için özel tasarım ve toplu üretim hazırlar.", "ar": "في هدايا الشركات يهمّ الاتساق والذوق — علب عديدة بتصميم واحد، وعند الرغبة بألوان الشركة وشعارها. تُجهّز Xurcun تصاميم خاصة وكميات كبيرة للطلبات المؤسسية."}]}, {"h2": {"az": "Büdcəyə və tərkibə görə: şirniyyat, quru meyvə, yoxsa qarışıq?", "ru": "По бюджету и составу: сладости, сухофрукты или микс?", "en": "By budget and contents: sweets, dried fruit or mixed?", "tr": "Bütçeye ve içeriğe göre: tatlı, kuru meyve mi yoksa karışık mı?", "ar": "حسب الميزانية والمحتوى: حلويات، فواكه مجففة، أم مزيج؟"}, "body": [{"az": "Büdcənizi əvvəlcədən müəyyən edin: qutunun ölçüsü, tərkibi və qablaşdırması buna uyğunlaşdırılır. Kiçik, zərif bir qutu da, geniş premium dəst də eyni zövqlə hazırlana bilər — fərq miqdarda və seçilən məhsullardadır.", "ru": "Определите бюджет заранее: размер, состав и упаковка коробки подбираются под него. И небольшая изящная коробка, и обширный премиальный набор могут быть собраны с одинаковым вкусом — разница в объёме и выборе продуктов.", "en": "Decide your budget up front: the box's size, contents and packaging are tailored to it. A small, elegant box and a generous premium set can both be assembled with the same care — the difference is in quantity and the products chosen.", "tr": "Bütçenizi önceden belirleyin: kutunun boyutu, içeriği ve ambalajı buna göre ayarlanır. Küçük, zarif bir kutu da geniş bir premium set de aynı özenle hazırlanabilir — fark miktarda ve seçilen ürünlerdedir.", "ar": "حدّد ميزانيتك مسبقًا: يُضبط حجم العلبة ومحتواها وتغليفها وفقًا لها. يمكن تجهيز علبة صغيرة أنيقة أو طقم فاخر واسع بالعناية نفسها — والفرق في الكمية والمنتجات المختارة."}, {"az": "Tərkibi alanın zövqünə görə seçin: şirniyyatsevərlər üçün şokolad, lokum və paxlava; sağlam seçim istəyənlər üçün quru meyvə və qoz-fındıq; qərarsız qalanda isə hər ikisini birləşdirən qarışıq qutu ən etibarlı variantdır.", "ru": "Состав выбирайте по вкусу получателя: для сладкоежек — шоколад, лукум и пахлава; для тех, кто предпочитает полезное, — сухофрукты и орехи; а если сомневаетесь, самый надёжный вариант — микс, объединяющий и то, и другое.", "en": "Choose contents by the recipient's taste: chocolate, Turkish delight and baklava for those with a sweet tooth; dried fruit and nuts for a wholesome choice; and when in doubt, a mixed box combining both is the safest bet.", "tr": "İçeriği alıcının zevkine göre seçin: tatlı sevenler için çikolata, lokum ve baklava; daha sağlıklı bir seçim isteyenler için kuru meyve ve çerez; kararsız kaldığınızda ise her ikisini birleştiren karışık kutu en güvenli seçimdir.", "ar": "اختر المحتوى حسب ذوق المُهدى إليه: الشوكولاتة والحلقوم والبقلاوة لمحبّي الحلويات؛ والفواكه المجففة والمكسرات لمن يفضّل خيارًا صحيًا؛ وعند التردّد تبقى العلبة المختلطة التي تجمع الاثنين هي الخيار الأضمن."}]}, {"h2": {"az": "Fərdiləşdirmə və təqdimat: detallar fərq yaradır", "ru": "Персонализация и оформление: детали решают всё", "en": "Personalization and presentation: details make the difference", "tr": "Kişiselleştirme ve sunum: ayrıntılar fark yaratır", "ar": "التخصيص والتقديم: التفاصيل تصنع الفرق"}, "body": [{"az": "Kiçik toxunuşlar hədiyyəni unudulmaz edir: əl yazısı kart, alanın adı, lent rəngi və ya mövsümə uyğun tərtibat. Xurcun-da qutunun tərkibini və görünüşünü istəyinizə görə fərdiləşdirmək mümkündür.", "ru": "Маленькие штрихи делают подарок незабываемым: открытка от руки, имя получателя, цвет ленты или сезонное оформление. В Xurcun состав и вид коробки можно персонализировать по вашему желанию.", "en": "Small touches make a gift unforgettable: a handwritten card, the recipient's name, a ribbon colour or seasonal styling. At Xurcun the box's contents and look can be personalized to your wishes.", "tr": "Küçük dokunuşlar hediyeyi unutulmaz kılar: el yazısı bir kart, alıcının adı, kurdele rengi ya da mevsime uygun bir tasarım. Xurcun'da kutunun içeriği ve görünümü isteğinize göre kişiselleştirilebilir.", "ar": "اللمسات الصغيرة تجعل الهدية لا تُنسى: بطاقة بخط اليد، اسم المُهدى إليه، لون شريط أو تنسيق موسمي. في Xurcun يمكن تخصيص محتوى العلبة ومظهرها حسب رغبتك."}, {"az": "Təqdimat da əhəmiyyətlidir: möhkəm qutu, səliqəli qablaşdırma və zərif lent ilk təəssüratı formalaşdırır. Bəyəndiyiniz qutunu kataloqdan seçib WhatsApp ilə sifariş edə və ya Bakıdakı 11 Xurcun mağazasından birinə yaxınlaşa bilərsiniz.", "ru": "Оформление тоже важно: прочная коробка, аккуратная упаковка и изящная лента создают первое впечатление. Понравившуюся коробку можно выбрать в каталоге и заказать в WhatsApp или зайти в один из 11 магазинов Xurcun в Баку.", "en": "Presentation matters too: a sturdy box, neat packaging and an elegant ribbon shape the first impression. You can pick the box you like from the catalogue and order on WhatsApp, or visit one of Xurcun's 11 stores in Baku.", "tr": "Sunum da önemlidir: sağlam bir kutu, özenli ambalaj ve zarif bir kurdele ilk izlenimi belirler. Beğendiğiniz kutuyu katalogdan seçip WhatsApp üzerinden sipariş edebilir ya da Bakü'deki 11 Xurcun mağazasından birine uğrayabilirsiniz.", "ar": "التقديم مهمّ أيضًا: علبة متينة وتغليف أنيق وشريط راقٍ تصنع الانطباع الأول. يمكنك اختيار العلبة التي تعجبك من الكتالوج والطلب عبر واتساب، أو زيارة أحد متاجر Xurcun الـ11 في باكو."}]}],
  },
  {
    slug: "aeroportdan-hediyye",
    date: "2026-06-29",
    cover: "/images/blog/korporativ-brand-2.webp",
    title: {"az": "Bakı aeroportundan hədiyyə — Xurcun", "ru": "Подарки из аэропорта Баку — Xurcun", "en": "Gifts from Baku Airport — Xurcun", "tr": "Bakü havalimanından hediye — Xurcun", "ar": "هدايا من مطار باكو — Xurcun"},
    desc: {"az": "Bakı aeroportundan son dəqiqə hədiyyələri: əsl Azərbaycan quru meyvəsi, çərəz, şirniyyat və hədiyyə qutuları. Xurcun Terminal 1 və Duty Free.", "ru": "Подарки из аэропорта Баку в последнюю минуту: азербайджанские сухофрукты, орехи, сладости и подарочные коробки. Xurcun в Терминале 1 и Duty Free.", "en": "Last-minute gifts from Baku airport: authentic Azerbaijani dried fruit, nuts, sweets and gift boxes. Xurcun in Terminal 1 and Duty Free.", "tr": "Bakü havalimanından son dakika hediyeleri: Azerbaycan kuru meyvesi, çerez, tatlı ve hediye kutuları. Terminal 1 ve Duty Free'de Xurcun.", "ar": "هدايا اللحظة الأخيرة من مطار باكو: فواكه مجففة ومكسرات وحلويات وعلب هدايا أذربيجانية. Xurcun في الصالة 1 والسوق الحرة."},
    h1: {"az": "Bakı aeroportundan hədiyyə — uçuşdan əvvəl son seçim", "ru": "Подарки из аэропорта Баку — последний выбор перед вылетом", "en": "Gifts from Baku airport — your last stop before the flight", "tr": "Bakü havalimanından hediye — uçuştan önce son seçim", "ar": "هدايا من مطار باكو — محطتك الأخيرة قبل الإقلاع"},
    lead: {"az": "Heydər Əliyev Beynəlxalq Aeroportunda təyyarəyə minmədən əvvəl hələ də sevdiklərinizə hədiyyə tapmaq imkanınız var. Xurcun-un aeroport butikləri — Terminal 1-dəki kofe nöqtəsi və Duty Free — əsl Azərbaycan dadını: seçmə quru meyvə, qoz-fındıq, şirniyyat və hazır hədiyyə qutularını bir addım uzaqlıqda təqdim edir.", "ru": "В Международном аэропорту Гейдара Алиева у вас ещё есть время найти подарок близким перед посадкой. Бутики Xurcun в аэропорту — кофе-точка в Терминале 1 и Duty Free — предлагают настоящий вкус Азербайджана: отборные сухофрукты, орехи, сладости и готовые подарочные коробки в одном шаге от вас.", "en": "At Heydar Aliyev International Airport you still have time to find a gift for your loved ones before boarding. Xurcun's airport boutiques — the coffee point in Terminal 1 and Duty Free — bring the authentic taste of Azerbaijan within reach: selected dried fruit, nuts, sweets and ready-made gift boxes.", "tr": "Haydar Aliyev Uluslararası Havalimanı'nda uçağa binmeden önce sevdiklerinize hediye bulmaya hâlâ vaktiniz var. Xurcun'un havalimanı butikleri — Terminal 1'deki kahve noktası ve Duty Free — Azerbaycan'ın gerçek lezzetini bir adım ötenize getiriyor: seçme kuru meyve, çerez, tatlı ve hazır hediye kutuları.", "ar": "في مطار حيدر علييف الدولي، لا يزال أمامك وقت لإيجاد هدية لأحبائك قبل الصعود إلى الطائرة. بوتيكات Xurcun في المطار — نقطة القهوة في الصالة 1 والسوق الحرة — تضع طعم أذربيجان الأصيل في متناولك: فواكه مجففة منتقاة ومكسرات وحلويات وعلب هدايا جاهزة."},
    sections: [{"h2": {"az": "Aeroportda Xurcun-u harada tapmaq olar?", "ru": "Где найти Xurcun в аэропорту?", "en": "Where to find Xurcun at the airport?", "tr": "Havalimanında Xurcun nerede?", "ar": "أين تجد Xurcun في المطار؟"}, "body": [{"az": "Heydər Əliyev Beynəlxalq Aeroportunda Xurcun-un iki nöqtəsi var: Terminal 1-dəki kofe butiki və Duty Free zonasındakı satış nöqtəsi. Hər ikisi uçuşdan əvvəl rahat dayanıb hədiyyə seçmək üçün əlçatandır.", "ru": "В Международном аэропорту Гейдара Алиева у Xurcun две точки: кофе-бутик в Терминале 1 и точка продаж в зоне Duty Free. Обе удобно расположены, чтобы спокойно выбрать подарок перед вылетом.", "en": "Heydar Aliyev International Airport has two Xurcun points: a coffee boutique in Terminal 1 and a sales point in the Duty Free zone. Both are easy to reach for a calm gift pick before your flight.", "tr": "Haydar Aliyev Uluslararası Havalimanı'nda Xurcun'un iki noktası var: Terminal 1'deki kahve butiği ve Duty Free bölgesindeki satış noktası. İkisi de uçuştan önce rahatça hediye seçmek için kolay ulaşılır.", "ar": "يضمّ مطار حيدر علييف الدولي نقطتين لـ Xurcun: بوتيك القهوة في الصالة 1 ونقطة بيع في منطقة السوق الحرة. كلتاهما سهلتا الوصول لاختيار هدية بهدوء قبل رحلتك."}, {"az": "Beləliklə, son anda təyyarəyə tələsərkən belə, əsl yerli ləzzəti özünüzlə aparmaq və ya bir fincan qəhvə ilə gözləmə vaxtınızı xoş keçirmək mümkündür.", "ru": "Так что даже спеша на посадку в последний момент, вы можете взять с собой настоящие местные вкусы или скоротать время ожидания за чашкой кофе.", "en": "So even when you're rushing to board at the last moment, you can take genuine local flavours with you — or spend the wait over a cup of coffee.", "tr": "Böylece son anda uçağa yetişmeye çalışırken bile gerçek yerel lezzetleri yanınıza alabilir ya da bekleme vaktinizi bir fincan kahveyle geçirebilirsiniz.", "ar": "وهكذا، حتى وأنت تسرع للحاق بالطائرة في اللحظة الأخيرة، يمكنك أن تأخذ معك نكهات محلية أصيلة أو تقضي وقت الانتظار مع فنجان قهوة."}]}, {"h2": {"az": "Səyahətçi üçün ən yaxşı suvenirlər", "ru": "Лучшие сувениры для путешественника", "en": "The best souvenirs for a traveller", "tr": "Yolcu için en iyi hediyelikler", "ar": "أفضل التذكارات للمسافر"}, "body": [{"az": "Azərbaycandan aparıla biləcək ən gözəl suvenirlər süfrəyə aiddir: seçmə quru meyvələr, premium qoz-fındıq, ənənəvi paxlava, müxtəlif çeşid lokum və ləziz şokoladlar. Bunlar həm yüngül, həm də uzun səfərə davamlıdır.", "ru": "Лучшие сувениры из Азербайджана — со вкусом: отборные сухофрукты, премиальные орехи, традиционная пахлава, разные виды лукума и изысканный шоколад. Они и лёгкие, и хорошо переносят долгую дорогу.", "en": "The finest souvenirs from Azerbaijan are edible: selected dried fruit, premium nuts, traditional baklava, assorted Turkish delight and fine chocolate. They are light and travel well over a long journey.", "tr": "Azerbaycan'dan götürülecek en güzel hediyelikler sofralık olanlardır: seçme kuru meyve, premium çerez, geleneksel baklava, çeşitli lokum ve lezzetli çikolata. Hem hafiftirler hem de uzun yolculuğa dayanıklı.", "ar": "أجمل التذكارات من أذربيجان هي ما يُؤكل: فواكه مجففة منتقاة ومكسرات فاخرة وبقلاوة تقليدية وأنواع من الحلقوم وشوكولاتة لذيذة. فهي خفيفة وتتحمّل رحلات السفر الطويلة."}, {"az": "Bağlamada gəlin: hazır hədiyyə qutuları zövqlə tərtib olunub, açmağa hazırdır — evdə gözləyən sevdiklərinizə Bakının dadını aparmaq üçün ideal seçimdir.", "ru": "А главное — готовые подарочные коробки оформлены со вкусом и готовы к вручению: идеальный способ привезти вкус Баку тем, кто ждёт вас дома.", "en": "Best of all, the ready-made gift boxes come tastefully arranged and ready to give — an ideal way to carry the taste of Baku to those waiting for you at home.", "tr": "En güzeli, hazır hediye kutuları zevkle düzenlenmiş ve sunulmaya hazırdır — Bakü'nün tadını sizi evde bekleyenlere götürmenin ideal yolu.", "ar": "والأجمل أن علب الهدايا الجاهزة منسّقة بذوق ومستعدّة للإهداء — طريقة مثالية لتحمل طعم باكو إلى من ينتظرونك في البيت."}]}, {"h2": {"az": "Uçuşdan əvvəl rahat hədiyyə seçimi", "ru": "Удобный выбор подарка перед вылетом", "en": "An easy gift choice before your flight", "tr": "Uçuştan önce kolay hediye seçimi", "ar": "اختيار هدية مريح قبل رحلتك"}, "body": [{"az": "Vaxtınız azdırsa, hazır qutulardan birini götürmək kifayətdir — heç bir əvvəlcədən planlaşdırma tələb olunmur. Müxtəlif ölçülər həm kiçik diqqət, həm də daha böyük hədiyyə üçün uyğundur.", "ru": "Если времени мало, достаточно взять одну из готовых коробок — никакого планирования заранее. Разные размеры подойдут и для небольшого знака внимания, и для более крупного подарка.", "en": "If you're short on time, simply grab one of the ready-made boxes — no planning ahead required. Different sizes suit both a small gesture and a larger gift.", "tr": "Vaktiniz azsa hazır kutulardan birini almanız yeterli — önceden plan yapmaya gerek yok. Farklı boyutlar hem küçük bir jest hem de daha büyük bir hediye için uygundur.", "ar": "إن كان وقتك ضيقًا، يكفي أن تأخذ إحدى العلب الجاهزة — دون أي تخطيط مسبق. الأحجام المختلفة تناسب اللفتة الصغيرة والهدية الأكبر على حدّ سواء."}, {"az": "Aeroportda görmədiyiniz çeşidlər üçün isə şəhərdəki butiklərimiz və WhatsApp sifarişi həmişə əlçatandır — Xurcun Bakıda 11 mağaza ilə xidmətinizdədir.", "ru": "А за ассортиментом, которого нет в аэропорту, всегда доступны наши городские бутики и заказ в WhatsApp — Xurcun к вашим услугам с 11 магазинами в Баку.", "en": "And for selections you don't see at the airport, our city boutiques and WhatsApp ordering are always available — Xurcun is at your service with 11 stores across Baku.", "tr": "Havalimanında bulamadığınız çeşitler için şehirdeki butiklerimiz ve WhatsApp siparişi her zaman erişilebilir — Xurcun, Bakü'deki 11 mağazasıyla hizmetinizde.", "ar": "وللأصناف التي لا تجدها في المطار، تبقى بوتيكاتنا في المدينة وطلب واتساب متاحة دائمًا — Xurcun في خدمتك بـ11 متجرًا في أنحاء باكو."}]}],
  },
  {
    slug: "xurcun-10-illik",
    date: "2025-12-01",
    cover: "/images/anniversary.webp",
    video: "/videos/anniversary.mp4",
    title: {"az": "Xurcun 10 yaşında — 2015-dən bəri keyfiyyətə vurğunuq | Xurcun", "ru": "Xurcun — 10 лет: верность качеству с 2015 года | Xurcun", "en": "Xurcun turns 10 — fond of quality since 2015 | Xurcun", "tr": "Xurcun 10 yaşında — 2015'ten beri kaliteye tutku | Xurcun", "ar": "Xurcun تحتفل بعشر سنوات — شغفٌ بالجودة منذ 2015 | Xurcun"},
    desc: {"az": "Xurcun 10 illik yubileyini qeyd etdi (2015–2025). Bir mağazadan Bakıda 11 butikə uzanan yol və «Keyfiyyətə Vurğunuq» fəlsəfəsi. Yubiley videosu.", "ru": "Xurcun отметил 10-летие (2015–2025): путь от одного магазина до 11 бутиков в Баку и философия «Верность качеству». Юбилейное видео.", "en": "Xurcun celebrated its 10th anniversary (2015–2025): from one shop to 11 boutiques in Baku and the “Fond of Quality” philosophy. Anniversary video.", "tr": "Xurcun 10. yılını kutladı (2015–2025): tek mağazadan Bakü'de 11 butiğe uzanan yol ve “Kaliteye Tutku” felsefesi. Yıl dönümü videosu.", "ar": "احتفلت Xurcun بمرور 10 سنوات (2015–2025): من متجر واحد إلى 11 بوتيكًا في باكو وفلسفة «شغفٌ بالجودة». فيديو الذكرى."},
    h1: {"az": "Xurcun 10 yaşında — bir onillik keyfiyyət", "ru": "Xurcun — 10 лет: десятилетие качества", "en": "Xurcun turns 10 — a decade of quality", "tr": "Xurcun 10 yaşında — bir on yıllık kalite", "ar": "Xurcun تُتمّ عامها العاشر — عقدٌ من الجودة"},
    lead: {"az": "2025-ci ilin sonunda Xurcun 10 illik yubileyini qeyd etdi. 2015-ci ildə Vüqar Məhərrəmovun bir mağaza ilə başladığı yol bu gün Bakıda 11 butikə — o cümlədən hava limanı filialına — çevrilib. Şüarımız dəyişməyib: Keyfiyyətə Vurğunuq.", "ru": "В конце 2025 года Xurcun отметил своё 10-летие. Путь, начатый Вугаром Магеррамовым в 2015 году с одного магазина, сегодня вырос до 11 бутиков в Баку, включая филиал в аэропорту. Наш девиз неизменен: верность качеству.", "en": "At the end of 2025, Xurcun celebrated its 10th anniversary. The journey Vugar Maharramov began in 2015 with a single shop has grown into 11 boutiques across Baku — including an airport branch. Our motto hasn't changed: Fond of Quality.", "tr": "2025'in sonunda Xurcun 10. yılını kutladı. Vugar Maharramov'un 2015'te tek mağazayla başladığı yol, bugün Bakü'de havalimanı şubesi dahil 11 butiğe ulaştı. Sloganımız değişmedi: Kaliteye Tutku.", "ar": "في نهاية عام 2025 احتفلت Xurcun بذكراها العاشرة. الرحلة التي بدأها ووغار محرّموف عام 2015 بمتجر واحد أصبحت اليوم 11 بوتيكًا في باكو، منها فرعٌ في المطار. وشعارنا لم يتغيّر: شغفٌ بالجودة."},
    sections: [
      {
        h2: {"az": "2015-dən bu günə: bir mağazadan şəbəkəyə", "ru": "От одного магазина к сети", "en": "From one shop to a chain", "tr": "Tek mağazadan zincire", "ar": "من متجر واحد إلى سلسلة"},
        body: [{"az": "Xurcun 2015-ci ildə premium quru meyvə, qoz-fındıq və şirniyyat təklif edən kiçik bir mağaza kimi yarandı. İlk gündən məqsəd sadə idi: ən yaxşı keyfiyyəti zövqlü təqdimatla birləşdirmək.", "ru": "Xurcun начинался в 2015 году как небольшой магазин премиальных сухофруктов, орехов и сладостей. С первого дня цель была проста: соединить лучшее качество с изысканной подачей.", "en": "Xurcun began in 2015 as a small shop offering premium dried fruit, nuts and sweets. From day one the goal was simple: combine the best quality with elegant presentation.", "tr": "Xurcun, 2015'te premium kuru meyve, çerez ve tatlı sunan küçük bir mağaza olarak başladı. İlk günden amaç basitti: en iyi kaliteyi zarif bir sunumla buluşturmak.", "ar": "بدأت Xurcun عام 2015 كمتجر صغير يقدّم الفواكه المجففة الفاخرة والمكسرات والحلويات. ومنذ اليوم الأول كان الهدف بسيطًا: الجمع بين أفضل جودة وتقديم أنيق."}, {"az": "İllər ərzində çeşid genişləndi — şokolad, lokum, paxlava, ekzotik çaylar və əl işi hədiyyə qutuları əlavə olundu. Bu gün Xurcun Bakının tanınan milli brendlərindən biridir.", "ru": "С годами ассортимент расширился — добавились шоколад, лукум, пахлава, экзотические чаи и подарочные наборы ручной работы. Сегодня Xurcun — один из узнаваемых национальных брендов Баку.", "en": "Over the years the range grew — chocolate, Turkish delight, baklava, exotic teas and handcrafted gift boxes were added. Today Xurcun is one of Baku's recognised national brands.", "tr": "Yıllar içinde çeşitler arttı — çikolata, lokum, baklava, egzotik çaylar ve el yapımı hediye kutuları eklendi. Bugün Xurcun, Bakü'nün tanınan ulusal markalarından biridir.", "ar": "ومع مرور السنين توسّعت التشكيلة — أُضيفت الشوكولاتة والحلقوم والبقلاوة والشاي الفاخر وعلب الهدايا اليدوية. واليوم تُعدّ Xurcun من العلامات الوطنية المعروفة في باكو."}],
      },
      {
        h2: {"az": "10 illik yubiley necə qeyd olundu", "ru": "Как отметили 10-летие", "en": "How we marked 10 years", "tr": "10. yılı nasıl kutladık", "ar": "كيف احتفلنا بالعقد الأول"},
        body: [{"az": "Yubiley münasibətilə komandamız, müştərilərimiz və tərəfdaşlarımızla birlikdə xüsusi bir an yaşadıq. Yuxarıdakı video bu qeydin ab-havasını əks etdirir.", "ru": "По случаю юбилея мы вместе с командой, клиентами и партнёрами пережили особенный момент. Видео выше передаёт атмосферу праздника.", "en": "To mark the anniversary, we shared a special moment with our team, customers and partners. The video above captures the spirit of the celebration.", "tr": "Yıl dönümü vesilesiyle ekibimiz, müşterilerimiz ve iş ortaklarımızla özel bir an yaşadık. Yukarıdaki video bu kutlamanın havasını yansıtıyor.", "ar": "بمناسبة الذكرى عشنا لحظة مميزة مع فريقنا وعملائنا وشركائنا. ويعكس الفيديو أعلاه أجواء هذا الاحتفال."}, {"az": "Bu 10 il yalnız bizim deyil — bizə güvənən hər bir müştərinin nailiyyətidir.", "ru": "Эти 10 лет — достижение не только наше, но и каждого клиента, который нам доверял.", "en": "These 10 years are an achievement not only ours, but of every customer who trusted us.", "tr": "Bu 10 yıl yalnızca bizim değil, bize güvenen her müşterinin başarısıdır.", "ar": "هذه السنوات العشر ليست إنجازنا وحدنا، بل إنجاز كل عميل وثق بنا."}],
      },
      {
        h2: {"az": "Təşəkkür və qarşıdakı illər", "ru": "Благодарность и будущее", "en": "Thank you, and what's next", "tr": "Teşekkür ve gelecek", "ar": "شكرًا وما هو قادم"},
        body: [{"az": "10 il boyu bizə etibar etdiyiniz üçün təşəkkür edirik. Hər bayram süfrəsi, hər hədiyyə və hər toy xonçasında yanınızda olmaq bizim üçün qürurdur.", "ru": "Спасибо за доверие на протяжении 10 лет. Быть рядом на каждом праздничном столе, в каждом подарке и каждой свадебной хонче — для нас гордость.", "en": "Thank you for your trust over these 10 years. Being part of every holiday table, every gift and every wedding xonça is our pride.", "tr": "10 yıl boyunca güvendiğiniz için teşekkür ederiz. Her bayram sofrasında, her hediyede ve her düğün honçasında yanınızda olmak bizim için gurur kaynağı.", "ar": "شكرًا لثقتكم على مدى عشر سنوات. ووجودنا في كل مائدة عيد وكل هدية وكل صينية عرس هو مصدر فخر لنا."}, {"az": "Qarşıdakı illərdə də eyni vədlə davam edirik — keyfiyyətdən güzəştə getmədən. Bizi Bakıdakı 11 butikimizdə və ya WhatsApp ilə tapa bilərsiniz.", "ru": "В следующие годы продолжим с тем же обещанием — без компромиссов в качестве. Нас можно найти в 11 бутиках в Баку или через WhatsApp.", "en": "In the years ahead we continue with the same promise — no compromise on quality. Find us at our 11 boutiques in Baku or on WhatsApp.", "tr": "Önümüzdeki yıllarda da aynı sözle devam ediyoruz — kaliteden ödün vermeden. Bize Bakü'deki 11 butiğimizden ya da WhatsApp'tan ulaşabilirsiniz.", "ar": "وفي السنوات القادمة نواصل بالوعد نفسه — دون أي تنازل عن الجودة. تجدوننا في بوتيكاتنا الـ11 في باكو أو عبر واتساب."}],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
