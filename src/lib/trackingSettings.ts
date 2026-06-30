/* ─── Tracking Settings Store ───
   Admin-editable tracking IDs with localStorage persistence.
   Priority: admin localStorage > env vars > empty
   Empty = tag not loaded.
*/

const STORAGE_KEY = "xurcun_tracking_settings_v1";

export interface TrackingSettings {
  gtmId: string;
  ga4MeasurementId: string;
  googleAdsId: string;
  /** Google Ads conversion label — the part after the slash in
   *  send_to: AW-XXXX/<label>. Fires the lead conversion on contact submit. */
  googleAdsConversionLabel: string;
  metaPixelId: string;
  metaDomainVerificationCode: string;
  googleSiteVerification: string;
}

const DEFAULTS: TrackingSettings = {
  gtmId: "",
  ga4MeasurementId: "",
  googleAdsId: "",
  googleAdsConversionLabel: "",
  metaPixelId: "",
  metaDomainVerificationCode: "",
  googleSiteVerification: "",
};

const ENV_KEYS: Record<keyof TrackingSettings, string> = {
  gtmId: "VITE_GTM_CONTAINER_ID",
  ga4MeasurementId: "VITE_GA4_MEASUREMENT_ID",
  googleAdsId: "VITE_GOOGLE_ADS_CONVERSION_ID",
  googleAdsConversionLabel: "VITE_GOOGLE_ADS_CONVERSION_LABEL",
  metaPixelId: "VITE_META_PIXEL_ID",
  metaDomainVerificationCode: "VITE_META_DOMAIN_VERIFICATION",
  googleSiteVerification: "VITE_GOOGLE_SITE_VERIFICATION",
};

/** Fallback env keys — checked if primary is empty */
const ENV_FALLBACKS: Partial<Record<keyof TrackingSettings, string>> = {
  gtmId: "VITE_GTM_ID",
  googleAdsId: "VITE_GOOGLE_ADS_ID",
};

/** Read raw localStorage value (no env fallback) */
export function getRawTrackingSettings(): TrackingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TrackingSettings>;
      return { ...DEFAULTS, ...parsed };
    }
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

/** Read effective settings: localStorage > env > empty */
export function getTrackingSettings(): TrackingSettings {
  const saved = getRawTrackingSettings();
  const settings = { ...DEFAULTS };

  (Object.keys(ENV_KEYS) as (keyof TrackingSettings)[]).forEach((key) => {
    // Priority: saved localStorage value > primary env var > fallback env var > empty
    const savedVal = saved[key]?.trim();
    if (savedVal) {
      settings[key] = savedVal;
    } else {
      const envVal = import.meta.env?.[ENV_KEYS[key]]?.trim();
      if (envVal) {
        settings[key] = envVal;
      } else if (ENV_FALLBACKS[key]) {
        const fallbackVal = import.meta.env?.[ENV_FALLBACKS[key]!]?.trim();
        if (fallbackVal) settings[key] = fallbackVal;
      }
    }
  });

  return settings;
}

/** Save settings to localStorage */
export function saveTrackingSettings(settings: Partial<TrackingSettings>) {
  const current = getRawTrackingSettings();
  const next = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Check if any tracking ID is configured */
export function hasTrackingSettings(): boolean {
  const s = getTrackingSettings();
  return !!s.gtmId || !!s.ga4MeasurementId || !!s.googleAdsId || !!s.metaPixelId;
}

/** Get a single tracking ID */
export function getTrackingId(key: keyof TrackingSettings): string {
  return getTrackingSettings()[key];
}

/** ─── DB-backed tracking settings ───
 *  Admin panel saves to DB via tracking.upsert API.
 *  Frontend fetches from DB on first load, merges with localStorage.
 *  This ensures tracking IDs work on ALL devices, not just the admin's browser.
 */

let dbCache: TrackingSettings | null = null;
let dbCacheTime = 0;
const CACHE_TTL = 60000; // 60 second TTL

/** Fetch tracking settings from DB via HTTP API (vanilla fetch — no React hooks) */
export async function loadTrackingSettingsFromDb(): Promise<TrackingSettings> {
  try {
    // Use relative URL — works on any domain (custom or Railway)
    const res = await fetch("/api/trpc/tracking.getPublic");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const rows = json?.result?.data?.json;

    if (rows && typeof rows === "object" && Object.keys(rows).length > 0) {
      const db: Partial<TrackingSettings> = {};
      const keyMap: Record<string, keyof TrackingSettings> = {
        gtm_container_id: "gtmId",
        ga4_measurement_id: "ga4MeasurementId",
        google_ads_id: "googleAdsId",
        google_ads_conversion_label: "googleAdsConversionLabel",
        meta_pixel_id: "metaPixelId",
        meta_domain_verification: "metaDomainVerificationCode",
        google_site_verification: "googleSiteVerification",
      };
      for (const [rawKey, mappedKey] of Object.entries(keyMap)) {
        const val = (rows as Record<string, string>)[rawKey];
        if (val && val !== "gtm-id-placeholder" && val !== "ga-id-placeholder" && val !== "aw-id-placeholder" && val !== "pixel-id-placeholder") {
          db[mappedKey] = val;
        }
      }
      // Merge: DB values override localStorage, localStorage overrides empty
      const ls = getTrackingSettings();
      dbCache = { ...ls, ...db };
      dbCacheTime = Date.now();
      return dbCache;
    }
  } catch {
    /* DB read failed — fall back to localStorage */
  }
  return getTrackingSettings();
}

/** Get settings with DB cache (sync — uses cached DB values if available) */
export function getTrackingSettingsWithDb(): TrackingSettings {
  if (dbCache && Date.now() - dbCacheTime < CACHE_TTL) {
    return dbCache;
  }
  return getTrackingSettings();
}

/** Clear DB cache (call after admin saves new settings) */
export function clearTrackingDbCache() {
  dbCache = null;
  dbCacheTime = 0;
}
