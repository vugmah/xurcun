/* ─── Meta Pixel (Facebook) Tracking ─── */

/** Check if pixel ID looks valid */
function isValidPixelId(pixelId: string): boolean {
  return !!pixelId && /^\d{10,}$/.test(pixelId.trim());
}

export function initMetaPixel(pixelId: string) {
  if (typeof window === "undefined") return;
  if (!isValidPixelId(pixelId)) return;
  if ((window as unknown as { __metaPixelLoaded?: boolean }).__metaPixelLoaded) return;

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

  const t = document.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";

  const s = document.getElementsByTagName("script")[0];
  s.parentNode?.insertBefore(t, s);

  // Initialise the pixel (PageView is handled by useAutoPageView)
  (w.fbq as (...a: unknown[]) => void)("init", pixelId);

  (window as unknown as { __metaPixelLoaded?: boolean }).__metaPixelLoaded = true;
}

/** Get canonical domain — ALWAYS https://xurcun.az */
function getDomain(): string {
  const fromGlobal = (window as unknown as Record<string, unknown>).__xurcun_DOMAIN__;
  if (typeof fromGlobal === "string" && fromGlobal.startsWith("https://")) {
    return fromGlobal;
  }
  return "https://xurcun.az";
}

/** Standard Meta event (PageView, ViewContent, Lead, Contact, …)
 *  ALL events use canonical HTTPS domain — NEVER protocol-suz */
export function trackMetaStandard(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  if (!w.fbq) return;

  const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const domain = getDomain();

  w.fbq("track", eventName, {
    content_name: "Xurcun",
    content_category: "Retail / Boutique",
    event_source_url: domain + window.location.pathname,
    ...params,
    page_path: window.location.pathname,
    page_title: document.title,
  }, { eventID: eventId });

  return eventId;
}

/** Custom Meta event (reservation_click, phone_click, …)
 *  ALL events use canonical HTTPS domain — NEVER protocol-suz */
export function trackMetaCustom(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: (...a: unknown[]) => void };
  if (!w.fbq) return;

  const eventId = `${eventName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const domain = getDomain();

  w.fbq("trackCustom", eventName, {
    content_name: "Xurcun",
    content_category: "Retail / Boutique",
    event_source_url: domain + window.location.pathname,
    ...params,
    page_path: window.location.pathname,
    page_title: document.title,
  }, { eventID: eventId });

  return eventId;
}

export function trackPageViewMeta() {
  trackMetaStandard("PageView");
}
