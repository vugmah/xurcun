import { useLanguage } from "@/lib/LanguageContext";
import SEO from "@/sections/SEO";

export default function PrivacyPage() {
  const { lang } = useLanguage();

  const content: Record<string, { title: string; body: string }> = {
    az: {
      title: "Məxfilik Siyasəti",
      body: `Xurcun White City olaraq məxfiliyinizi qoruyuruq.

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
    },
    ru: {
      title: "Политика конфиденциальности",
      body: `Xurcun White City ценит вашу конфиденциальность.

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
    },
    en: {
      title: "Privacy Policy",
      body: `Xurcun White City values your privacy.

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
    },
  };

  const c = content[lang] ?? content.en;

  return (
    <>
      <SEO page="privacy" />
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
