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
  };

  const c = content[lang] ?? content.en;

  return (
    <>
      <SEO page="cookie-policy" />
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl text-[#C9A96E] mb-8">{c.title}</h1>
        <div className="font-body text-sm text-white/70 leading-relaxed whitespace-pre-line">
          {c.body}
        </div>
      </div>
    </div>
    </>
  );
}
