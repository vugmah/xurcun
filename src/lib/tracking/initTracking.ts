/* ─── Initialize Tracking Scripts ───
   Loads GTM container, GA4 config, and Meta Pixel on public pages only.
   Admin pages are automatically excluded (checked by isAdminPage in track()).

   Canonical domain: ALL tracking platforms receive https://xurcun.az
   NEVER protocol-suz domain (xurcun.az or www.xurcun.az).

   Usage: call initTracking() once on app mount.
*/

import { getTrackingSettings, loadTrackingSettingsFromDb, getTrackingSettingsWithDb } from "@/lib/trackingSettings";

let initialized = false;

/** Get canonical domain — ALWAYS returns https://xurcun.az */
function getCanonicalDomain(): string {
  // Prefer build-time constant from index.html, fallback to safe default
  const fromGlobal = (window as unknown as Record<string, unknown>).__xurcun_DOMAIN__;
  if (typeof fromGlobal === "string" && fromGlobal.startsWith("https://")) {
    return fromGlobal;
  }
  // Hard-coded canonical — NEVER use window.location.origin (may differ)
  return "https://xurcun.az";
}

/** Inject a script tag into <head> if not already present */
function injectScript(src: string, id?: string) {
  if (typeof document === "undefined") return;
  if (id && document.getElementById(id)) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  if (id) s.id = id;
  document.head.appendChild(s);
}

/** Inject inline script */
function injectInlineScript(code: string, id?: string) {
  if (typeof document === "undefined") return;
  if (id && document.getElementById(id)) return;
  const s = document.createElement("script");
  s.textContent = code;
  if (id) s.id = id;
  document.head.appendChild(s);
}

/** Initialize Google Tag Manager */
function initGTM(gtmId: string) {
  if (!gtmId || !gtmId.startsWith("GTM-")) return;

  // dataLayer
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  injectScript(
    `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
    `xurcun-gtm-${gtmId}`
  );

  // noscript iframe fallback (for browsers with JS disabled)
  const noscriptId = `xurcun-gtm-ns-${gtmId}`;
  if (!document.getElementById(noscriptId)) {
    const ns = document.createElement("noscript");
    ns.id = noscriptId;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.cssText = "display:none;visibility:hidden";
    ns.appendChild(iframe);
    document.body.insertBefore(ns, document.body.firstChild);
  }
}

/** Initialize GA4 (via gtag) */
function initGA4(ga4Id: string) {
  if (!ga4Id || !ga4Id.startsWith("G-")) return;

  // gtag function
  const w = window as unknown as { dataLayer?: Record<string, unknown>[]; gtag?: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function (...args: unknown[]) {
    w.dataLayer!.push(args as unknown as Record<string, unknown>);
  };
  w.gtag("js", new Date());
  w.gtag("config", ga4Id);

  injectScript(
    `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`,
    `xurcun-ga4-${ga4Id}`
  );
}

/** Initialize Google Ads */
function initGoogleAds(awId: string) {
  if (!awId || !awId.startsWith("AW-")) return;
  // Google Ads uses the same gtag as GA4 — just add the config
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  if (!w.gtag) {
    // gtag not ready yet, inject it first
    const w2 = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w2.dataLayer = w2.dataLayer || [];
    w2.dataLayer.push(["js", new Date()] as any);
    w2.dataLayer.push(["config", awId] as any);
  } else {
    w.gtag("config", awId);
  }
}

/** Initialize Meta Pixel — ALWAYS uses canonical HTTPS domain */
function initMetaPixelScript(pixelId: string, domainVerificationCode?: string) {
  if (!pixelId || pixelId.length < 5) return;
  if ((window as unknown as { __metaPixelLoaded?: boolean }).__metaPixelLoaded) return;

  const domain = getCanonicalDomain();

  // Set domain verification meta tag if available
  if (domainVerificationCode) {
    const metaEl = document.getElementById("meta-domain-verification-tag");
    if (metaEl) metaEl.setAttribute("content", domainVerificationCode);
  }

  const w = window as unknown as Record<string, unknown>;

  w.fbq = function (...args: unknown[]) {
    const fbq = w.fbq as unknown as { queue: unknown[]; callMethod?: (...a: unknown[]) => void };
    fbq.queue.push(args);
    if (fbq.callMethod) fbq.callMethod(...args);
  };

  const fbq = w.fbq as unknown as {
    queue: unknown[];
    callMethod?: (...a: unknown[]) => void;
    load: boolean;
    version: string;
    push: (f: unknown) => void;
  };
  fbq.queue = [];
  fbq.load = true;
  fbq.version = "2.0";
  fbq.push = (f: unknown) => {
    fbq.callMethod = f as (...a: unknown[]) => void;
  };

  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  s.onload = () => {
    // Init with canonical HTTPS domain — NEVER protocol-suz
    (w.fbq as (...a: unknown[]) => void)("init", pixelId, {
      external_id: undefined, // let Meta auto-generate
      // event_source_url will be canonical domain in all track calls
    });
    // NOTE: PageView is intentionally NOT fired here.
    // useAutoPageView() in useTracking.ts handles PageView for both
    // initial mount and route changes — single source of truth.
  };
  document.head.appendChild(s);

  (window as unknown as { __metaPixelLoaded?: boolean }).__metaPixelLoaded = true;
}

/** Check if current page is admin */
function isAdminPage(): boolean {
  return typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
}

/** Main init — call once on app mount. Loads scripts based on admin settings. */
export function initTracking() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  if (isAdminPage()) return; // Never track admin

  initialized = true;

  const settings = getTrackingSettings();

  if (settings.gtmId) initGTM(settings.gtmId);
  if (settings.ga4MeasurementId) initGA4(settings.ga4MeasurementId);
  if (settings.googleAdsId) initGoogleAds(settings.googleAdsId);
  // Meta Pixel managed by GTM — app direct init disabled to avoid duplicate
  // if (settings.metaPixelId) initMetaPixelScript(settings.metaPixelId, settings.metaDomainVerificationCode);
}

/** Async init — fetches settings from DB first, then loads scripts.
 *  Use this instead of sync initTracking() for production.
 *  This ensures tracking IDs work on ALL devices (not just admin's browser).
 */
export async function initTrackingAsync() {
  if (initialized) return;
  if (typeof window === "undefined") return;
  if (isAdminPage()) return; // Never track admin

  // Try DB first (most recent admin settings), fall back to localStorage
  const settings = await loadTrackingSettingsFromDb();

  initialized = true;

  // Debug: expose settings for browser console inspection
  (window as unknown as Record<string, unknown>).__xurcun_TRACKING_DEBUG__ = {
    settings,
    timestamp: new Date().toISOString(),
  };

  if (settings.gtmId) initGTM(settings.gtmId);
  if (settings.ga4MeasurementId) initGA4(settings.ga4MeasurementId);
  if (settings.googleAdsId) initGoogleAds(settings.googleAdsId);
  // Meta Pixel managed by GTM — app direct init disabled to avoid duplicate
  // if (settings.metaPixelId) initMetaPixelScript(settings.metaPixelId, settings.metaDomainVerificationCode);
}

/** Re-init when settings change (call after admin saves new IDs) */
export function reinitTracking() {
  initialized = false;
  initTracking();
}

function clearTrackingDbCache() {
  // no-op — placeholder for future cache invalidation
}

/** Re-init async — clears cache and reloads from DB */
export async function reinitTrackingAsync() {
  clearTrackingDbCache();
  initialized = false;
  await initTrackingAsync();
}
