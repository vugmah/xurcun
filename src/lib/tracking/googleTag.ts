/* ─── Google Tag Manager / GA4 / Google Ads Tracking ─── */

import { getTrackingSettingsWithDb } from "@/lib/trackingSettings";

/** Fire a Google Ads conversion (e.g. lead form submit).
 *  Sends gtag('event','conversion',{send_to:'AW-XXXX/<label>'}) using the
 *  Google Ads ID + conversion label from admin tracking settings. No-op when
 *  either is unset, so it's safe to call unconditionally on form success. */
export function googleAdsConversion(overrideLabel?: string) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (typeof w.gtag !== "function") return;

  const s = getTrackingSettingsWithDb();
  const adsId = s.googleAdsId?.trim();
  const label = (overrideLabel ?? s.googleAdsConversionLabel)?.trim();
  if (!adsId || !adsId.startsWith("AW-") || !label) return;

  w.gtag("event", "conversion", { send_to: `${adsId}/${label}` });
}

/** Push data-layer event (GTM) */
export function gtmEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  if (!w.dataLayer) return;

  w.dataLayer.push({
    event: eventName,
    gtm_tag: eventName,
    ...params,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

/** Track GA4 event */
export function ga4Event(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (!w.gtag) return;
  w.gtag("event", eventName, params);
}

/** Unified Google tracking: sends to both GTM dataLayer and GA4 */
export function trackGoogle(eventName: string, params: Record<string, unknown> = {}) {
  gtmEvent(eventName, params);
  ga4Event(eventName, params);
}
