import { useState, useEffect } from "react";
import { setTrackingEnabled } from "@/lib/tracking";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";

const CONSENT_KEY = "xurcun_cookie_consent";

interface ConsentState {
  marketing: boolean;
  analytics: boolean;
  decided: boolean;
}

function loadConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { marketing: false, analytics: false, decided: false };
}

function saveConsent(c: ConsentState) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
}

export function useCookieConsent() {
  const [consent, setConsentState] = useState<ConsentState>(loadConsent);

  const setConsent = (c: ConsentState) => {
    saveConsent(c);
    setConsentState(c);
    setTrackingEnabled({
      meta: c.marketing,
      google: c.marketing || c.analytics,
    });
  };

  useEffect(() => {
    setTrackingEnabled({
      meta: consent.marketing,
      google: consent.marketing || consent.analytics,
    });
  }, [consent.marketing, consent.analytics]);

  return { consent, setConsent };
}

export default function CookieConsent() {
  const { consent, setConsent } = useCookieConsent();
  const [visible, setVisible] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!consent.decided) setVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [consent.decided]);

  if (!visible || consent.decided) return null;

  const acceptAll = () => {
    setConsent({ marketing: true, analytics: true, decided: true });
    setVisible(false);
  };

  const acceptSelected = () => {
    setConsent({ marketing, analytics, decided: true });
    setVisible(false);
  };

  const rejectAll = () => {
    setConsent({ marketing: false, analytics: false, decided: true });
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] bg-[#111] border-t border-[#C9A96E]/30 p-5 md:p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-5 h-5 text-[#C9A96E] mt-0.5 shrink-0" />
          <div>
            <h3 className="text-white text-sm font-medium mb-1">Cookie Tercihleri</h3>
            <p className="text-white/50 text-xs max-w-2xl">
              Size daha iyi bir deneyim sunmak icin cokere ve izleme teknolojileri kullaniyoruz. Marketing cokeleri Meta Pixel ve Google Ads icin gereklidir. Analitik cokeleri site performansini olcmek icin kullanilir.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Switch checked={analytics} onCheckedChange={setAnalytics} />
            <span className="text-white/70 text-sm">Analitik (GA4)</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={marketing} onCheckedChange={setMarketing} />
            <span className="text-white/70 text-sm">Marketing (Meta Pixel, Google Ads)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A] font-medium"
            onClick={acceptAll}
          >
            Tumunu Kabul Et
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-[#333] text-white/70 hover:text-white hover:bg-white/5"
            onClick={acceptSelected}
          >
            Secilenleri Kabul Et
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/40 hover:text-white"
            onClick={rejectAll}
          >
            Reddet
          </Button>
        </div>
      </div>
    </div>
  );
}
