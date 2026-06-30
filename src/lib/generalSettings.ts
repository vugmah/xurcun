/* ─── General Settings Store ───
   Single source of truth for all global/admin settings.
   Priority: localStorage > env vars > defaults
*/

const STORAGE_KEY = "xurcun_general_settings_v1";

export interface BranchItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  mapsUrl: string;
  whatsapp: string;
  isActive: boolean;
}

export interface GeneralSettings {
  // Site
  siteName: string;
  brandName: string;
  defaultLanguage: string;
  // Contact
  phone: string;
  whatsapp: string;
  email: string;
  // Social
  instagramUrl: string;
  facebookUrl: string;
  // Branches
  whiteCityAddress: string;
  whiteCityMapsUrl: string;
  whiteCityWhatsapp: string;
  // SEO
  googleSiteVerification: string;
  googleReviewUrl: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  // Tracking
  gtmId: string;
  ga4MeasurementId: string;
  googleAdsId: string;
  googleAdsConversionLabel: string;
  metaPixelId: string;
  metaDomainVerificationCode: string;
  // Mail Server
  webmailUrl: string;
  mailImapHost: string;
  mailImapPort: string;
  mailSmtpHost: string;
  mailSmtpPort: string;
  // Branches (JSON string)
  branchesJson: string;
}

const DEFAULTS: GeneralSettings = {
  siteName: "Xurcun White City",
  brandName: "Xurcun",
  defaultLanguage: "az",
  phone: "+994502130555",
  whatsapp: "994502130555",
  email: "info@xurcun.az",
  instagramUrl: "https://www.instagram.com/xurcunwhitecity",
  facebookUrl: "https://www.facebook.com/xurcunwhitecity",
  whiteCityAddress: "1-ci Yaşıl Ada Küçəsi, White City, Bakı",
  whiteCityMapsUrl: "https://maps.app.goo.gl/XeTM3L1AkT3h1Pjj6?g_st=ic",
  whiteCityWhatsapp: "994502130555",
  googleSiteVerification: "",
  googleReviewUrl: "",
  defaultSeoTitle: "Xurcun | Premium quru meyvə, çərəz və hədiyyə butiki — Bakı",
  defaultSeoDescription: "Xurcun — 2015-ci ildən Bakıda premium quru meyvə, qoz-fındıq, şirniyyat və əl işi hədiyyə qutuları butik şəbəkəsi. Keyfiyyətə Vurğunuq!",
  gtmId: "",
  ga4MeasurementId: "",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  metaPixelId: "",
  metaDomainVerificationCode: "",
  webmailUrl: "https://webmail.xurcun.az",
  mailImapHost: "mail.xurcun.az",
  mailImapPort: "993",
  mailSmtpHost: "mail.xurcun.az",
  mailSmtpPort: "465",
  branchesJson: JSON.stringify([
    { id: "wc", name: "Xurcun White City", slug: "white-city", address: "1-ci Yasil Ada Kucəsi, White City, Baki", mapsUrl: "https://maps.app.goo.gl/XeTM3L1AkT3h1Pjj6?g_st=ic", whatsapp: "994502130555", isActive: true },
  ]),
};

function getEnv(key: string): string {
  return import.meta.env?.[key]?.trim() || "";
}

function loadSettings(): GeneralSettings {
  let saved: Partial<GeneralSettings> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch { /* ignore */ }

  const s = { ...DEFAULTS };

  // localStorage overrides
  (Object.keys(saved) as (keyof GeneralSettings)[]).forEach((k) => {
    if (saved[k] !== undefined && saved[k] !== "") (s as any)[k] = saved[k];
  });

  // Env overrides (lowest priority after defaults)
  const envMap: Record<string, keyof GeneralSettings> = {
    VITE_SITE_NAME: "siteName",
    VITE_BRAND_NAME: "brandName",
    VITE_PHONE: "phone",
    VITE_WHATSAPP: "whatsapp",
    VITE_EMAIL: "email",
    VITE_INSTAGRAM_URL: "instagramUrl",
    VITE_FACEBOOK_URL: "facebookUrl",
    VITE_WHITE_CITY_ADDRESS: "whiteCityAddress",
    VITE_WHITE_CITY_MAPS: "whiteCityMapsUrl",
    VITE_WHITE_CITY_WHATSAPP: "whiteCityWhatsapp",
    VITE_GOOGLE_SITE_VERIFICATION: "googleSiteVerification",
    VITE_GOOGLE_REVIEW_URL: "googleReviewUrl",
    VITE_GTM_ID: "gtmId",
    VITE_GA4_MEASUREMENT_ID: "ga4MeasurementId",
    VITE_GOOGLE_ADS_ID: "googleAdsId",
    VITE_META_PIXEL_ID: "metaPixelId",
    VITE_WEBMAIL_URL: "webmailUrl",
    VITE_MAIL_IMAP_HOST: "mailImapHost",
    VITE_MAIL_IMAP_PORT: "mailImapPort",
    VITE_MAIL_SMTP_HOST: "mailSmtpHost",
    VITE_MAIL_SMTP_PORT: "mailSmtpPort",
  };

  Object.entries(envMap).forEach(([envKey, settingKey]) => {
    const envVal = getEnv(envKey);
    if (envVal && (s as any)[settingKey] === DEFAULTS[settingKey]) {
      (s as any)[settingKey] = envVal;
    }
  });

  return s;
}

export function getGeneralSettings(): GeneralSettings {
  return loadSettings();
}

export function saveGeneralSettings(patch: Partial<GeneralSettings>) {
  const current = loadSettings();
  const next = { ...current, ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function resetGeneralSettings() {
  localStorage.removeItem(STORAGE_KEY);
}

// Backwards compat: tracking settings now read from general settings
/* ─── Branch helpers ─── */
export function getBranches(): BranchItem[] {
  try {
    const s = getGeneralSettings();
    const parsed = JSON.parse(s.branchesJson);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* ignore */ }
  return JSON.parse(DEFAULTS.branchesJson);
}

export function saveBranches(branches: BranchItem[]) {
  saveGeneralSettings({ branchesJson: JSON.stringify(branches) });
}

export function getActiveBranches(): BranchItem[] {
  return getBranches().filter((b) => b.isActive);
}

export function getBranchBySlug(slug: string): BranchItem | undefined {
  return getBranches().find((b) => b.slug === slug);
}

export function getTrackingSettingsCompat(): Pick<GeneralSettings, "gtmId" | "ga4MeasurementId" | "googleAdsId" | "metaPixelId" | "googleSiteVerification"> {
  const s = loadSettings();
  return {
    gtmId: s.gtmId,
    ga4MeasurementId: s.ga4MeasurementId,
    googleAdsId: s.googleAdsId,
    metaPixelId: s.metaPixelId,
    googleSiteVerification: s.googleSiteVerification,
  };
}
