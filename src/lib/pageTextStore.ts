/* ─── Generic page text fields ─────────────────────────────────────────────
 * Single source of truth for every overridable text string on a set of
 * hardcoded public pages (About, Corporate, Gift Card, Privacy, Cookie).
 * Overrides persist server-side in the `page_text` table, one row per
 * (page, key) pair (see api/routers/pageText.ts). The `default` of each field
 * mirrors the in-code `S` / `content` constant on the matching public page and
 * is the SSR / no-JS / empty-DB fallback.
 *
 * Framework-neutral (no React import) so both the public pages and
 * api/boot.ts can import it — exactly like homepageTextStore.ts.
 * ───────────────────────────────────────────────────────────────────────── */

export type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar';
export type L5 = Record<Lang, string>;
export type PageKey = 'about' | 'corporate' | 'giftcard' | 'privacy' | 'cookie';

export interface PageTextField {
  key: string;
  group: string;       // e.g. nav / intro / facts / form / messages / seo / section
  label: string;       // short AZ admin label
  multiline: boolean;  // true => textarea
  default: L5;
}

export const PAGE_TEXT: Record<PageKey, PageTextField[]> = {
  // ═══════════════════════════════════════════════════════════════════════
  // ABOUT — mirrors src/pages/AboutPage.tsx `S`
  // ═══════════════════════════════════════════════════════════════════════
  about: [
    {
      key: 'home', group: 'nav', label: 'Naviqasiya: Ana səhifə', multiline: false,
      default: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
    },
    {
      key: 'catalog', group: 'nav', label: 'Düymə: Kataloqa bax', multiline: false,
      default: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
    },
    {
      key: 'tag', group: 'intro', label: 'Kiçik başlıq', multiline: false,
      default: { az: 'Haqqımızda', ru: 'О нас', en: 'About us', tr: 'Hakkımızda', ar: 'من نحن' },
    },
    {
      key: 'h1', group: 'intro', label: 'Başlıq (H1)', multiline: false,
      default: {
        az: 'Azərbaycanın dad imzası', ru: 'Вкус Азербайджана', en: 'Azerbaijan’s signature of taste',
        tr: 'Azerbaycan’ın lezzet imzası', ar: 'بصمة طعم أذربيجان',
      },
    },
    {
      key: 'p1', group: 'intro', label: 'Birinci abzas', multiline: true,
      default: {
        az: 'Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən təsis edilib — bu gün təbii quru meyvə, qoz-fındıq, ekzotik çaylar, şirniyyat və əl işi hədiyyə qutularının sürətlə böyüyən butik şəbəkəsidir. Bakıda 11 mağaza.',
        ru: 'Xurcun основан в 2015 году Вугаром Магеррамовым — сегодня это быстрорастущая сеть бутиков натуральных сухофруктов, орехов, экзотических чаёв, сладостей и подарков ручной работы. 11 магазинов в Баку.',
        en: 'Founded in 2015 by Vugar Maharramov, Xurcun is today a fast-growing chain of boutiques for natural dried fruit, nuts, exotic teas, sweets and handcrafted gift boxes. 11 stores in Baku.',
        tr: '2015’te Vugar Maharramov tarafından kurulan Xurcun, bugün doğal kuru meyve, çerez, egzotik çaylar, tatlı ve el yapımı hediye kutularının hızla büyüyen butik zinciridir. Bakü’de 11 mağaza.',
        ar: 'تأسست Xurcun عام 2015 على يد ووقار محرّموف، وهي اليوم سلسلة بوتيكات سريعة النمو للفواكه المجففة الطبيعية والمكسرات والشاي والحلويات وعلب الهدايا المصنوعة يدويًا. 11 متجرًا في باكو.',
      },
    },
    {
      key: 'p2', group: 'intro', label: 'İkinci abzas', multiline: true,
      default: {
        az: 'Bütün məhsullarımız təbii və konservantsızdır; qlütensiz seçimlər də mövcuddur. «Keyfiyyətə Vurğunuq!» sadəcə şüar deyil — hər qutuya qoyduğumuz vəddir. Qonaqlar Azərbaycanın dadını dünyaya aparmaq üçün Xurcun-u seçir.',
        ru: 'Вся наша продукция натуральная, без консервантов; есть и безглютеновые варианты. «Fond of Quality» — не просто слоган, а обещание в каждой коробке. Гости выбирают Xurcun, чтобы увезти вкус Азербайджана с собой.',
        en: 'All our products are natural, with no preservatives, and gluten-free options too. “Fond of Quality” is not just a slogan — it is the promise in every box. Guests choose Xurcun to carry the taste of Azerbaijan home.',
        tr: 'Tüm ürünlerimiz doğaldır, koruyucu içermez; glutensiz seçenekler de vardır. “Fond of Quality” yalnızca bir slogan değil — her kutuya koyduğumuz sözdür. Misafirler Azerbaycan’ın lezzetini götürmek için Xurcun’u seçer.',
        ar: 'جميع منتجاتنا طبيعية وخالية من المواد الحافظة، مع خيارات خالية من الغلوتين. «Fond of Quality» ليس مجرد شعار — بل وعدٌ في كل علبة. يختار الضيوف Xurcun ليحملوا نكهة أذربيجان معهم.',
      },
    },
    {
      key: 'facts_title', group: 'facts', label: 'Faktlar: başlıq', multiline: false,
      default: { az: 'Bir baxışda', ru: 'Кратко', en: 'At a glance', tr: 'Bir bakışta', ar: 'لمحة سريعة' },
    },
    {
      key: 'f_year', group: 'facts', label: 'Fakt: il', multiline: false,
      default: { az: '2015-dən bəri', ru: 'С 2015 года', en: 'Since 2015', tr: '2015’ten beri', ar: 'منذ 2015' },
    },
    {
      key: 'f_stores', group: 'facts', label: 'Fakt: mağazalar', multiline: false,
      default: { az: 'Bakıda 11 mağaza', ru: '11 магазинов в Баку', en: '11 stores in Baku', tr: 'Bakü’de 11 mağaza', ar: '11 متجرًا في باكو' },
    },
    {
      key: 'f_natural', group: 'facts', label: 'Fakt: təbii', multiline: false,
      default: { az: '100% təbii, konservantsız', ru: '100% натурально, без консервантов', en: '100% natural, no preservatives', tr: '%100 doğal, koruyucusuz', ar: 'طبيعي 100٪ بدون مواد حافظة' },
    },
    {
      key: 'f_gift', group: 'facts', label: 'Fakt: hədiyyə qutuları', multiline: false,
      default: { az: 'Əl işi hədiyyə qutuları', ru: 'Подарки ручной работы', en: 'Handcrafted gift boxes', tr: 'El yapımı hediye kutuları', ar: 'علب هدايا يدوية' },
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // CORPORATE — mirrors src/pages/CorporatePage.tsx `S`
  // ═══════════════════════════════════════════════════════════════════════
  corporate: [
    {
      key: 'tag', group: 'intro', label: 'Kiçik başlıq', multiline: false,
      default: { az: 'Korporativ', ru: 'Корпоративным', en: 'Corporate', tr: 'Kurumsal', ar: 'الشركات' },
    },
    {
      key: 'h1', group: 'intro', label: 'Başlıq (H1)', multiline: false,
      default: { az: 'Korporativ hədiyyə sorğusu', ru: 'Запрос корпоративных подарков', en: 'Corporate gift inquiry', tr: 'Kurumsal hediye talebi', ar: 'طلب هدايا الشركات' },
    },
    {
      key: 'lead', group: 'intro', label: 'Alt mətn (abzas)', multiline: true,
      default: {
        az: 'Müştəri, tərəfdaş və əməkdaşlarınız üçün loqolu, fərdiləşdirilmiş premium hədiyyə qutuları. Formu doldurun — sizinlə əlaqə saxlayaq.',
        ru: 'Премиальные подарочные коробки с логотипом и персонализацией для клиентов, партнёров и сотрудников. Заполните форму — мы свяжемся с вами.',
        en: 'Premium, logo-branded, personalised gift boxes for your clients, partners and staff. Fill in the form and we will get back to you.',
        tr: 'Müşterileriniz, ortaklarınız ve çalışanlarınız için logolu, kişiselleştirilmiş premium hediye kutuları. Formu doldurun, size dönelim.',
        ar: 'علب هدايا فاخرة بشعاركم ومخصّصة لعملائكم وشركائكم وموظفيكم. املأ النموذج وسنتواصل معكم.',
      },
    },
    {
      key: 'name', group: 'form', label: 'Form: Ad sahəsi', multiline: false,
      default: { az: 'Ad, soyad *', ru: 'Имя, фамилия *', en: 'Full name *', tr: 'Ad soyad *', ar: 'الاسم الكامل *' },
    },
    {
      key: 'company', group: 'form', label: 'Form: Şirkət sahəsi', multiline: false,
      default: { az: 'Şirkət', ru: 'Компания', en: 'Company', tr: 'Şirket', ar: 'الشركة' },
    },
    {
      key: 'phone', group: 'form', label: 'Form: Telefon sahəsi', multiline: false,
      default: { az: 'Telefon', ru: 'Телефон', en: 'Phone', tr: 'Telefon', ar: 'الهاتف' },
    },
    {
      key: 'email', group: 'form', label: 'Form: E-poçt sahəsi', multiline: false,
      default: { az: 'E-poçt *', ru: 'E-mail *', en: 'Email *', tr: 'E-posta *', ar: 'البريد الإلكتروني *' },
    },
    {
      key: 'occasion', group: 'form', label: 'Form: Münasibət sahəsi', multiline: false,
      default: { az: 'Münasibət (bayram, yubiley…)', ru: 'Повод (праздник, юбилей…)', en: 'Occasion (holiday, anniversary…)', tr: 'Vesile (bayram, yıldönümü…)', ar: 'المناسبة (عيد، ذكرى…)' },
    },
    {
      key: 'qty', group: 'form', label: 'Form: Say sahəsi', multiline: false,
      default: { az: 'Təxmini say', ru: 'Примерное количество', en: 'Approx. quantity', tr: 'Yaklaşık adet', ar: 'الكمية التقريبية' },
    },
    {
      key: 'message', group: 'form', label: 'Form: Mesaj sahəsi', multiline: false,
      default: { az: 'Mesaj *', ru: 'Сообщение *', en: 'Message *', tr: 'Mesaj *', ar: 'الرسالة *' },
    },
    {
      key: 'send', group: 'form', label: 'Form: Göndər düyməsi', multiline: false,
      default: { az: 'Sorğunu göndər', ru: 'Отправить запрос', en: 'Send inquiry', tr: 'Talebi gönder', ar: 'إرسال الطلب' },
    },
    {
      key: 'sending', group: 'form', label: 'Form: Göndərilir', multiline: false,
      default: { az: 'Göndərilir…', ru: 'Отправка…', en: 'Sending…', tr: 'Gönderiliyor…', ar: 'جارٍ الإرسال…' },
    },
    {
      key: 'ok', group: 'messages', label: 'Mesaj: uğurlu', multiline: true,
      default: { az: 'Təşəkkürlər! Sorğunuz alındı, tezliklə əlaqə saxlayacağıq.', ru: 'Спасибо! Запрос получен, мы скоро свяжемся с вами.', en: 'Thank you! Your inquiry was received — we will be in touch soon.', tr: 'Teşekkürler! Talebiniz alındı, en kısa sürede dönüş yapacağız.', ar: 'شكرًا! تم استلام طلبك وسنتواصل معك قريبًا.' },
    },
    {
      key: 'err', group: 'messages', label: 'Mesaj: xəta', multiline: true,
      default: { az: 'Xəta baş verdi. Yenidən cəhd edin və ya WhatsApp ilə yazın.', ru: 'Произошла ошибка. Попробуйте снова или напишите в WhatsApp.', en: 'Something went wrong. Please try again or message us on WhatsApp.', tr: 'Bir hata oluştu. Tekrar deneyin ya da WhatsApp’tan yazın.', ar: 'حدث خطأ. حاول مرة أخرى أو راسلنا على واتساب.' },
    },
    {
      key: 'whatsapp', group: 'form', label: 'Form: WhatsApp linki', multiline: false,
      default: { az: 'və ya WhatsApp ilə yazın', ru: 'или напишите в WhatsApp', en: 'or message us on WhatsApp', tr: 'veya WhatsApp’tan yazın', ar: 'أو راسلنا على واتساب' },
    },
    {
      key: 'home', group: 'nav', label: 'Naviqasiya: Ana səhifə', multiline: false,
      default: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // GIFTCARD — mirrors src/pages/GiftCardPage.tsx `S`
  //   + src/components/GiftCardSection.tsx `S` (no key collisions)
  // ═══════════════════════════════════════════════════════════════════════
  giftcard: [
    // ── from GiftCardPage.tsx ──
    {
      key: 'home', group: 'nav', label: 'Naviqasiya: Ana səhifə', multiline: false,
      default: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
    },
    {
      key: 'title', group: 'seo', label: 'SEO: başlıq', multiline: true,
      default: {
        az: 'Hədiyyə Kartı | Xurcun — premium hədiyyə həlli',
        ru: 'Подарочная карта | Xurcun — премиальный подарок',
        en: 'Gift Card | Xurcun — the premium gift solution',
        tr: 'Hediye Kartı | Xurcun — premium hediye çözümü',
        ar: 'بطاقة هدايا | Xurcun — حل الهدية الفاخر',
      },
    },
    {
      key: 'desc', group: 'seo', label: 'SEO: təsvir', multiline: true,
      default: {
        az: 'Xurcun Hədiyyə Kartı — istədiyiniz balansı yükləyin, sevdiklərinizə premium kart hədiyyə edin. Bakıdakı 11 mağazada keçərlidir. WhatsApp ilə sifariş.',
        ru: 'Подарочная карта Xurcun — загрузите любой баланс и подарите близким премиальную карту. Действует в 11 магазинах Баку. Заказ в WhatsApp.',
        en: 'Xurcun Gift Card — load any balance and gift a premium card to your loved ones. Valid at 11 stores in Baku. Order on WhatsApp.',
        tr: 'Xurcun Hediye Kartı — istediğiniz bakiyeyi yükleyin, sevdiklerinize premium kart hediye edin. Bakü\'deki 11 mağazada geçerli.',
        ar: 'بطاقة هدايا Xurcun — اشحن أي رصيد وأهدِ أحباءك بطاقة فاخرة. صالحة في 11 متجرًا في باكو. اطلب عبر واتساب.',
      },
    },
    // ── from GiftCardSection.tsx ──
    {
      key: 'tag', group: 'section', label: 'Bölmə: kiçik başlıq', multiline: false,
      default: { az: 'HƏDİYYƏ KARTI', ru: 'ПОДАРОЧНАЯ КАРТА', en: 'GIFT CARD', tr: 'HEDİYE KARTI', ar: 'بطاقة هدية' },
    },
    {
      key: 'h2', group: 'section', label: 'Bölmə: başlıq (H2)', multiline: false,
      default: { az: 'Xurcun Hədiyyə Kartı', ru: 'Подарочная карта Xurcun', en: 'Xurcun Gift Card', tr: 'Xurcun Hediye Kartı', ar: 'بطاقة هدايا Xurcun' },
    },
    {
      key: 'lead', group: 'section', label: 'Bölmə: alt mətn (abzas)', multiline: true,
      default: {
        az: 'Fiziki hədiyyə əvəzinə istədiyiniz balansı yükləyin və sevdiklərinizə premium Xurcun kartı hədiyyə edin. Bütün mağazalarımızda keçərlidir.',
        ru: 'Вместо обычного подарка загрузите любой баланс и подарите близким премиальную карту Xurcun. Действует во всех наших магазинах.',
        en: 'Instead of a physical gift, load any balance and give your loved ones a premium Xurcun card. Valid in all our stores.',
        tr: 'Fiziki hediye yerine istediğiniz bakiyeyi yükleyin ve sevdiklerinize premium Xurcun kartı hediye edin. Tüm mağazalarımızda geçerlidir.',
        ar: 'بدلاً من هدية تقليدية، اشحن أي رصيد وأهدِ أحباءك بطاقة Xurcun الفاخرة. صالحة في جميع متاجرنا.',
      },
    },
    {
      key: 's1', group: 'section', label: 'Addım 1', multiline: false,
      default: { az: 'Kartı seçin', ru: 'Выберите карту', en: 'Choose the card', tr: 'Kartı seçin', ar: 'اختر البطاقة' },
    },
    {
      key: 's2', group: 'section', label: 'Addım 2', multiline: false,
      default: { az: 'Balans yükləyin', ru: 'Загрузите баланс', en: 'Load a balance', tr: 'Bakiye yükleyin', ar: 'اشحن الرصيد' },
    },
    {
      key: 's3', group: 'section', label: 'Addım 3', multiline: false,
      default: { az: 'Hədiyyə edin', ru: 'Подарите', en: 'Give as a gift', tr: 'Hediye edin', ar: 'قدّمها هدية' },
    },
    {
      key: 's4', group: 'section', label: 'Addım 4', multiline: false,
      default: { az: 'Mağazada istifadə', ru: 'Используйте в магазине', en: 'Use in store', tr: 'Mağazada kullanın', ar: 'استخدمها في المتجر' },
    },
    {
      key: 'cta', group: 'section', label: 'Düymə: WhatsApp sifariş', multiline: false,
      default: { az: 'WhatsApp ilə sifariş', ru: 'Заказать в WhatsApp', en: 'Order on WhatsApp', tr: "WhatsApp'tan sipariş", ar: 'اطلب عبر واتساب' },
    },
    {
      key: 'note', group: 'section', label: 'Qeyd', multiline: false,
      default: { az: '11 mağazada mövcuddur', ru: 'Доступно в 11 магазинах', en: 'Available at 11 stores', tr: '11 mağazada mevcut', ar: 'متوفرة في 11 متجرًا' },
    },
    {
      key: 'waMsg', group: 'section', label: 'WhatsApp mesajı', multiline: true,
      default: {
        az: 'Salam! Xurcun Hədiyyə Kartı haqqında məlumat almaq istəyirəm.',
        ru: 'Здравствуйте! Хочу узнать о подарочной карте Xurcun.',
        en: 'Hello! I would like information about the Xurcun Gift Card.',
        tr: 'Merhaba! Xurcun Hediye Kartı hakkında bilgi almak istiyorum.',
        ar: 'مرحبًا! أود الحصول على معلومات حول بطاقة هدايا Xurcun.',
      },
    },
    {
      key: 'sound', group: 'section', label: 'A11y: səs düyməsi', multiline: false,
      default: { az: 'Səsi aç / bağla', ru: 'Включить / выключить звук', en: 'Toggle sound', tr: 'Sesi aç / kapat', ar: 'كتم / تشغيل الصوت' },
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // PRIVACY — mirrors src/pages/PrivacyPage.tsx `content` (title + body)
  // ═══════════════════════════════════════════════════════════════════════
  privacy: [
    {
      key: 'title', group: 'section', label: 'Başlıq', multiline: false,
      default: {
        az: 'Məxfilik Siyasəti',
        ru: 'Политика конфиденциальности',
        en: 'Privacy Policy',
        tr: 'Gizlilik Politikası',
        ar: 'سياسة الخصوصية',
      },
    },
    {
      key: 'body', group: 'section', label: 'Mətn', multiline: true,
      default: {
        az: `Xurcun White City olaraq məxfiliyinizi qoruyuruq.

Toplanan məlumatlar:
- IP ünvanı (təhlükəsizlik və analytics məqsədləri ilə, hash edilmiş formada)
- Brauzer tipi və versiyası
- Səhifə baxışları və klikləmələr (analytics məqsədilə)

İstifadə olunan alətlər:
- Google Analytics 4 — sayt istifadəsini ölçmək üçün
- Google Ads — remarketing reklamları üçün
- Meta Pixel — Facebook/Instagram remarketing üçün

Hüquqlarınız:
- Cookie razılığınızı istənilən vaxt dəyişə bilərsiniz
- Brauzerinizdən cookie-ləri silə bilərsiniz
- Google Ads Personalization səhifəsindən remarketing-i söndürə bilərsiniz

Əlaqə: info@xurcun.az`,
        ru: `Xurcun White City ценит вашу конфиденциальность.

Собираемые данные:
- IP-адрес (в хешированной форме, для безопасности и аналитики)
- Тип и версия браузера
- Просмотры страниц и клики (для аналитики)

Используемые инструменты:
- Google Analytics 4 — для измерения использования сайта
- Google Ads — для ремаркетинговых реклам
- Meta Pixel — для ремаркетинга на Facebook/Instagram

Ваши права:
- Вы можете изменить согласие на cookies в любое время
- Вы можете удалить cookies в браузере
- Вы можете отключить ремаркетинг на странице Google Ads Personalization

Контакт: info@xurcun.az`,
        en: `Xurcun White City values your privacy.

Data collected:
- IP address (hashed, for security and analytics)
- Browser type and version
- Page views and clicks (for analytics)

Tools used:
- Google Analytics 4 — to measure site usage
- Google Ads — for remarketing advertisements
- Meta Pixel — for Facebook/Instagram remarketing

Your rights:
- You can change your cookie consent at any time
- You can delete cookies from your browser
- You can opt out of remarketing via Google Ads Personalization page

Contact: info@xurcun.az`,
        tr: `Xurcun White City olarak gizliliğinize önem veriyoruz.

Toplanan veriler:
- IP adresi (güvenlik ve analiz için hashlenmiş biçimde)
- Tarayıcı türü ve sürümü
- Sayfa görüntülemeleri ve tıklamalar (analiz için)

Kullanılan araçlar:
- Google Analytics 4 — site kullanımını ölçmek için
- Google Ads — yeniden pazarlama reklamları için
- Meta Pixel — Facebook/Instagram yeniden pazarlama için

Haklarınız:
- Çerez onayınızı istediğiniz zaman değiştirebilirsiniz
- Çerezleri tarayıcınızdan silebilirsiniz
- Google Ads Kişiselleştirme sayfasından yeniden pazarlamayı kapatabilirsiniz

İletişim: info@xurcun.az`,
        ar: `في Xurcun White City نحرص على خصوصيتك.

البيانات التي يتم جمعها:
- عنوان IP (بصيغة مُجزّأة، لأغراض الأمان والتحليلات)
- نوع المتصفح وإصداره
- مشاهدات الصفحات والنقرات (لأغراض التحليلات)

الأدوات المستخدمة:
- Google Analytics 4 — لقياس استخدام الموقع
- Google Ads — لإعلانات إعادة التسويق
- Meta Pixel — لإعادة التسويق على Facebook/Instagram

حقوقك:
- يمكنك تغيير موافقتك على ملفات تعريف الارتباط في أي وقت
- يمكنك حذف ملفات تعريف الارتباط من متصفحك
- يمكنك إلغاء إعادة التسويق من صفحة تخصيص إعلانات Google

للتواصل: info@xurcun.az`,
      },
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // COOKIE — mirrors src/pages/CookiePolicyPage.tsx `content` (title + body)
  // ═══════════════════════════════════════════════════════════════════════
  cookie: [
    {
      key: 'title', group: 'section', label: 'Başlıq', multiline: false,
      default: {
        az: 'Cookie Siyasəti',
        ru: 'Политика использования cookies',
        en: 'Cookie Policy',
        tr: 'Çerez Politikası',
        ar: 'سياسة ملفات تعريف الارتباط',
      },
    },
    {
      key: 'body', group: 'section', label: 'Mətn', multiline: true,
      default: {
        az: `Xurcun White City cookie və oxşar texnologiyalardan istifadə edir.

Cookie kateqoriyaları:

1. Zəruri (Necessary)
   - Saytın əsas funksiyaları üçün tələb olunur
   - Bu cookie-lər söndürülə bilməz

2. Analitika (Analytics)
   - Google Analytics 4 ilə sayt istifadəsini ölçür
   - İstifadəçi davranışlarını anonim şəkildə təhlil edir

3. Marketinq (Marketing)
   - Google Ads remarketing
   - Meta (Facebook/Instagram) Pixel
   - Bu cookie-lər yalnız razılıq verildikdə aktivləşir

Razılıq idarəsi:
- "Hamısını qəbul et" — bütün cookie-lər aktiv
- "Rədd et" — yalnız zəruri cookie-lər
- "Tənzimlə" — kateqoriya kateqoriya seçim

Razılığınızı dəyişmək:
Brauzerinizin cookie tənzimləmələrindən və ya saytın alt hissəsindəki cookie bannerindən istifadə edin.

Əlaqə: info@xurcun.az`,
        ru: `Xurcun White City использует cookie и аналогичные технологии.

Категории cookie:

1. Необходимые (Necessary)
   - Требуются для основных функций сайта
   - Эти cookie нельзя отключить

2. Аналитика (Analytics)
   - Измеряет использование сайта через Google Analytics 4
   - Анонимно анализирует поведение пользователей

3. Маркетинг (Marketing)
   - Ремаркетинг Google Ads
   - Meta (Facebook/Instagram) Pixel
   - Эти cookie активируются только при согласии

Управление согласием:
- "Принять все" — все cookie активны
- "Отклонить" — только необходимые cookie
- "Настроить" — выбор по категориям

Изменение согласия:
Используйте настройки cookie вашего браузера или баннер cookie в нижней части сайта.

Контакт: info@xurcun.az`,
        en: `Xurcun White City uses cookies and similar technologies.

Cookie categories:

1. Necessary
   - Required for the site's core functions
   - These cookies cannot be disabled

2. Analytics
   - Measures site usage via Google Analytics 4
   - Anonymously analyzes user behavior

3. Marketing
   - Google Ads remarketing
   - Meta (Facebook/Instagram) Pixel
   - These cookies only activate with consent

Consent management:
- "Accept all" — all cookies active
- "Reject" — only necessary cookies
- "Customize" — category by category selection

Changing consent:
Use your browser's cookie settings or the cookie banner at the bottom of the site.

Contact: info@xurcun.az`,
        tr: `Xurcun White City çerezleri ve benzer teknolojileri kullanır.

Çerez kategorileri:

1. Gerekli (Necessary)
   - Sitenin temel işlevleri için gereklidir
   - Bu çerezler devre dışı bırakılamaz

2. Analiz (Analytics)
   - Google Analytics 4 ile site kullanımını ölçer
   - Kullanıcı davranışını anonim olarak analiz eder

3. Pazarlama (Marketing)
   - Google Ads yeniden pazarlama
   - Meta (Facebook/Instagram) Pixel
   - Bu çerezler yalnızca onay verildiğinde etkinleşir

Onay yönetimi:
- "Hepsini kabul et" — tüm çerezler aktif
- "Reddet" — yalnızca gerekli çerezler
- "Özelleştir" — kategori kategori seçim

Onayınızı değiştirmek:
Tarayıcınızın çerez ayarlarını veya sitenin alt kısmındaki çerez bannerını kullanın.

İletişim: info@xurcun.az`,
        ar: `يستخدم Xurcun White City ملفات تعريف الارتباط والتقنيات المشابهة.

فئات ملفات تعريف الارتباط:

1. الضرورية (Necessary)
   - مطلوبة للوظائف الأساسية للموقع
   - لا يمكن تعطيل هذه الملفات

2. التحليلات (Analytics)
   - تقيس استخدام الموقع عبر Google Analytics 4
   - تحلل سلوك المستخدم بشكل مجهول

3. التسويق (Marketing)
   - إعادة التسويق عبر Google Ads
   - بكسل Meta (Facebook/Instagram)
   - تُفعّل هذه الملفات فقط عند الموافقة

إدارة الموافقة:
- "قبول الكل" — جميع الملفات مفعّلة
- "رفض" — الملفات الضرورية فقط
- "تخصيص" — اختيار فئة بفئة

تغيير موافقتك:
استخدم إعدادات ملفات تعريف الارتباط في متصفحك أو شريط ملفات تعريف الارتباط أسفل الموقع.

للتواصل: info@xurcun.az`,
      },
    },
  ],
};

export function defaultsForPage(page: PageKey): Record<string, L5> {
  return Object.fromEntries(PAGE_TEXT[page].map((f) => [f.key, f.default]));
}

export const PAGE_TEXT_SEED = (Object.keys(PAGE_TEXT) as PageKey[]).flatMap((page) =>
  PAGE_TEXT[page].map((f) => ({ page, key: f.key, ...f.default })),
);
