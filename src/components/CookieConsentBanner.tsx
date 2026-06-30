import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import {
  loadConsent,
  hasConsentDecision,
  acceptAllConsent,
  rejectAllConsent,
  saveCustomConsent,
  updateGoogleConsent,
  getDefaultConsent,
  type ConsentState,
} from "@/lib/consent";
import { setTrackingEnabled } from "@/lib/tracking";
import { reinitTrackingAsync } from "@/lib/tracking/initTracking";

type BannerView = "main" | "customize";

export function CookieConsentBanner() {
  const { t, lang } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<BannerView>("main");
  const [consent, setConsent] = useState<ConsentState>(getDefaultConsent());

  useEffect(() => {
    // Check if already decided
    if (!hasConsentDecision()) {
      setVisible(true);
      return;
    }

    // Already decided — apply saved consent
    const saved = loadConsent();
    if (saved) {
      applyConsent(saved);
    }
  }, []);

  function applyConsent(state: ConsentState) {
    updateGoogleConsent(state);
    setTrackingEnabled({
      google: true, // GTM always loads, consent mode controls data
      meta: state.marketing,
    });
    // Re-run tracking init now that consent flags are set. The Meta Pixel script
    // is gated on isMarketingAllowed() inside initTracking, so it loads only when
    // marketing consent is granted and stays off otherwise. Idempotent: GTM/GA
    // re-init is dedup-guarded and the pixel has its own __metaPixelLoaded guard.
    reinitTrackingAsync().catch(() => {});
  }

  function handleAcceptAll() {
    const state = acceptAllConsent();
    applyConsent(state);
    setVisible(false);
  }

  function handleReject() {
    const state = rejectAllConsent();
    applyConsent(state);
    setVisible(false);
  }

  function handleSaveCustom() {
    const state = saveCustomConsent(consent);
    applyConsent(state);
    setVisible(false);
  }

  if (!visible) return null;

  const texts = {
    az: {
      title: "Cookie istifadəsi",
      desc: "Saytımızın düzgün işləməsi və təcrübənizi yaxşılaşdırmaq üçün cookie və tracking alətlərindən istifadə edirik.",
      acceptAll: "Hamısını qəbul et",
      reject: "Rədd et",
      customize: "Tənzimlə",
      save: "Yadda saxla",
      back: "Geri",
      necessary: "Zəruri",
      necessaryDesc: "Saytın əsas funksiyaları üçün tələb olunur.",
      analytics: "Analitika",
      analyticsDesc: "Sayt istifadəsini ölçmək və təkmilləşdirmək.",
      marketing: "Marketinq",
      marketingDesc: "Google Ads və Meta remarketing reklamları.",
    },
    ru: {
      title: "Использование cookies",
      desc: "Мы используем cookie и инструменты отслеживания для корректной работы сайта и улучшения вашего опыта.",
      acceptAll: "Принять все",
      reject: "Отклонить",
      customize: "Настроить",
      save: "Сохранить",
      back: "Назад",
      necessary: "Необходимые",
      necessaryDesc: "Требуются для основных функций сайта.",
      analytics: "Аналитика",
      analyticsDesc: "Измерение использования сайта и улучшение.",
      marketing: "Маркетинг",
      marketingDesc: "Ремаркетинг Google Ads и Meta.",
    },
    en: {
      title: "Cookie Usage",
      desc: "We use cookies and tracking tools for the proper functioning of our site and to improve your experience.",
      acceptAll: "Accept all",
      reject: "Reject",
      customize: "Customize",
      save: "Save",
      back: "Back",
      necessary: "Necessary",
      necessaryDesc: "Required for the site's core functions.",
      analytics: "Analytics",
      analyticsDesc: "Measure site usage and improve.",
      marketing: "Marketing",
      marketingDesc: "Google Ads and Meta remarketing.",
    },
    tr: {
      title: "Çerez kullanımı",
      desc: "Sitemizin düzgün çalışması ve deneyiminizi iyileştirmek için çerez ve takip araçları kullanıyoruz.",
      acceptAll: "Tümünü kabul et",
      reject: "Reddet",
      customize: "Özelleştir",
      save: "Kaydet",
      back: "Geri",
      necessary: "Gerekli",
      necessaryDesc: "Sitenin temel işlevleri için gereklidir.",
      analytics: "Analitik",
      analyticsDesc: "Site kullanımını ölçme ve iyileştirme.",
      marketing: "Pazarlama",
      marketingDesc: "Google Ads ve Meta yeniden pazarlama.",
    },
    ar: {
      title: "استخدام ملفات تعريف الارتباط",
      desc: "نستخدم ملفات تعريف الارتباط وأدوات التتبّع لتشغيل الموقع بشكل صحيح ولتحسين تجربتك.",
      acceptAll: "قبول الكل",
      reject: "رفض",
      customize: "تخصيص",
      save: "حفظ",
      back: "رجوع",
      necessary: "ضرورية",
      necessaryDesc: "مطلوبة للوظائف الأساسية للموقع.",
      analytics: "التحليلات",
      analyticsDesc: "قياس استخدام الموقع وتحسينه.",
      marketing: "التسويق",
      marketingDesc: "إعلانات Google Ads وMeta لإعادة التسويق.",
    },
  };

  const txt = texts[lang as keyof typeof texts] ?? texts.az;

  if (view === "customize") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[9999] bg-[#0A0A0A]/98 backdrop-blur-md border-t border-[#333]">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <h3 className="text-white text-base font-medium mb-4">{txt.title}</h3>

          {/* Necessary — always on, disabled */}
          <div className="flex items-start gap-3 mb-3 p-3 rounded-lg bg-[#111]">
            <div className="mt-0.5">
              <span className="inline-block w-9 h-5 bg-green-400 rounded-full relative">
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{txt.necessary}</p>
              <p className="text-white/40 text-xs">{txt.necessaryDesc}</p>
            </div>
          </div>

          {/* Analytics */}
          <div className="flex items-start gap-3 mb-3 p-3 rounded-lg bg-[#111]">
            <button
              onClick={() => setConsent((c) => ({ ...c, analytics: !c.analytics }))}
              className="mt-0.5"
            >
              <span className={`inline-block w-9 h-5 rounded-full relative transition-colors duration-200 ${consent.analytics ? "bg-green-400" : "bg-white/20"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-out ${consent.analytics ? "translate-x-4" : "translate-x-0"}`} />
              </span>
            </button>
            <div>
              <p className="text-white text-sm font-medium">{txt.analytics}</p>
              <p className="text-white/40 text-xs">{txt.analyticsDesc}</p>
            </div>
          </div>

          {/* Marketing */}
          <div className="flex items-start gap-3 mb-4 p-3 rounded-lg bg-[#111]">
            <button
              onClick={() => setConsent((c) => ({ ...c, marketing: !c.marketing }))}
              className="mt-0.5"
            >
              <span className={`inline-block w-9 h-5 rounded-full relative transition-colors duration-200 ${consent.marketing ? "bg-green-400" : "bg-white/20"}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-out ${consent.marketing ? "translate-x-4" : "translate-x-0"}`} />
              </span>
            </button>
            <div>
              <p className="text-white text-sm font-medium">{txt.marketing}</p>
              <p className="text-white/40 text-xs">{txt.marketingDesc}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setView("main")} className="px-4 py-2 text-xs text-white/50 hover:text-white/80 transition-colors">
              {txt.back}
            </button>
            <button onClick={handleSaveCustom} className="px-5 py-2 bg-[#C9A96E] hover:bg-[#B8985E] active:scale-[0.97] text-[#0A0A0A] text-xs font-medium rounded-md transition-[background-color,transform] duration-150 ease-out ml-auto">
              {txt.save}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] bg-[#0A0A0A]/98 backdrop-blur-md border-t border-[#333]">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <h3 className="text-white text-base font-medium mb-1">{txt.title}</h3>
        <p className="text-white/50 text-xs mb-4 leading-relaxed">{txt.desc}</p>
        {/* Stacks full-width on mobile (≥44px tap targets); Accept/Reject given
            equal visual weight per EU cookie guidance, Customize as tertiary. */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
          <button onClick={handleAcceptAll} className="min-h-[44px] px-5 py-2.5 flex items-center justify-center bg-[#C9A96E] hover:bg-[#B8985E] active:scale-[0.97] text-[#0A0A0A] text-sm font-medium rounded-md transition-[background-color,transform] duration-150 ease-out">
            {txt.acceptAll}
          </button>
          <button onClick={handleReject} className="min-h-[44px] px-5 py-2.5 flex items-center justify-center bg-[#1A1A1A] hover:bg-[#222] active:scale-[0.97] text-white text-sm font-medium rounded-md border border-[#333] transition-[background-color,transform] duration-150 ease-out">
            {txt.reject}
          </button>
          <button onClick={() => setView("customize")} className="min-h-[44px] px-5 py-2.5 flex items-center justify-center text-white/60 hover:text-white text-sm transition-colors">
            {txt.customize}
          </button>
        </div>
      </div>
    </div>
  );
}
