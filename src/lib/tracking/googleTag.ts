/* ─── Google Tag Manager / GA4 / Google Ads Tracking ─── */

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
