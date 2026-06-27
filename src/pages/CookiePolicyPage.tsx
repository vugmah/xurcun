import { useLanguage } from "@/lib/LanguageContext";
import SEO from "@/sections/SEO";

export default function CookiePolicyPage() {
  const { lang } = useLanguage();

  const content: Record<string, { title: string; body: string }> = {
    az: {
      title: "Cookie Siyasəti",
      body: `Xurcun White City cookie və oxşar texnologiyalardan istifadə edir.

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
    },
    ru: {
      title: "Политика использования cookies",
      body: `Xurcun White City использует cookie и аналогичные технологии.

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
    },
    en: {
      title: "Cookie Policy",
      body: `Xurcun White City uses cookies and similar technologies.

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
    },
    tr: {
      title: "Çerez Politikası",
      body: `Xurcun White City çerezleri ve benzer teknolojileri kullanır.

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
    },
    ar: {
      title: "سياسة ملفات تعريف الارتباط",
      body: `يستخدم Xurcun White City ملفات تعريف الارتباط والتقنيات المشابهة.

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
  };

  const c = content[lang] ?? content.en;

  return (
    <>
      <SEO page="cookie-policy" />
    <div className="min-h-screen bg-[#F6F2E9] text-[#2E2A25] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl text-[#7E6228] mb-8" style={{ fontFamily: 'Rufolo, "Cormorant Garamond", serif', fontWeight: 600 }}>{c.title}</h1>
        <div className="font-body text-sm text-[#3A352E] leading-relaxed whitespace-pre-line">
          {c.body}
        </div>
      </div>
    </div>
    </>
  );
}
