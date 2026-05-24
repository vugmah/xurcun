/* ─── Unified Tracking ───
   Combines Meta Pixel + Google Tag Manager + GA4 + Conversions API
   into one simple API. All events are sent to every active channel.
*/

import { trackMetaStandard, trackMetaCustom } from "./metaPixel";
import { trackGoogle } from "./googleTag";

/** Check if current page is admin (excluded from tracking) */
function isAdminPage(): boolean {
  return typeof window !== 'undefined' && window.location.hash.startsWith('#/admin');
}

export interface TrackOptions {
  /** Meta standard event name (PageView, ViewContent, Lead, Contact …) */
  metaEvent?: string;
  /** Meta custom event name (reservation_click, phone_click …) */
  metaCustom?: string;
  /** Google event name */
  googleEvent?: string;
  /** Extra parameters */
  params?: Record<string, unknown>;
}

let metaEnabled = true;
let googleEnabled = true;

export function setTrackingEnabled(opts: { meta?: boolean; google?: boolean }) {
  if (opts.meta !== undefined) metaEnabled = opts.meta;
  if (opts.google !== undefined) googleEnabled = opts.google;
}

export function isMetaEnabled() { return metaEnabled; }
export function isGoogleEnabled() { return googleEnabled; }

/** Send one event to every active channel (skipped on /#/admin pages) */
export function track(opts: TrackOptions) {
  if (isAdminPage()) return; // No tracking on admin pages
  const p = opts.params ?? {};

  if (metaEnabled) {
    if (opts.metaEvent) trackMetaStandard(opts.metaEvent, p);
    if (opts.metaCustom) trackMetaCustom(opts.metaCustom, p);
  }

  if (googleEnabled && opts.googleEvent) {
    trackGoogle(opts.googleEvent, p);
  }
}

/* ─── Convenience helpers for common actions ─── */

export function trackPageView() {
  track({ metaEvent: "PageView", googleEvent: "page_view" });
}

export function trackMenuView(tab: "food" | "beverage" | "shisha" | "all") {
  const eventMap: Record<string, { metaEvent: string; googleEvent: string; metaCustom?: string }> = {
    food: { metaEvent: "ViewContent", googleEvent: "food_menu_click", metaCustom: "food_menu_click" },
    beverage: { metaEvent: "ViewContent", googleEvent: "beverage_menu_click", metaCustom: "beverage_menu_click" },
    shisha: { metaEvent: "ViewContent", googleEvent: "shisha_menu_click", metaCustom: "shisha_menu_click" },
    all: { metaEvent: "ViewContent", googleEvent: "menu_click", metaCustom: "menu_click" },
  };
  const m = eventMap[tab];
  if (!m) return;
  track({
    metaEvent: m.metaEvent,
    metaCustom: m.metaCustom,
    googleEvent: m.googleEvent,
    params: { content_name: `${tab} menu`, content_category: "Menu" },
  });
}

export function trackReservation() {
  track({
    metaEvent: "Lead",
    metaCustom: "reservation_click",
    googleEvent: "reservation_click",
    params: { content_name: "Reservation", content_category: "Lead" },
  });
}

export function trackPhoneClick() {
  track({
    metaEvent: "Contact",
    metaCustom: "phone_click",
    googleEvent: "phone_click",
    params: { content_name: "Phone Call", content_category: "Contact" },
  });
}

export function trackWhatsAppClick() {
  track({
    metaEvent: "Contact",
    metaCustom: "whatsapp_click",
    googleEvent: "whatsapp_click",
    params: { content_name: "WhatsApp", content_category: "Contact" },
  });
}

export function trackInstagramClick() {
  track({
    metaCustom: "instagram_click",
    googleEvent: "instagram_click",
    params: { content_name: "Instagram", content_category: "Social" },
  });
}

export function trackMapsClick() {
  track({
    metaEvent: "Lead",
    metaCustom: "maps_click",
    googleEvent: "maps_click",
    params: { content_name: "Google Maps", content_category: "Lead" },
  });
}

export function trackGalleryView() {
  track({
    metaEvent: "ViewContent",
    metaCustom: "gallery_view",
    googleEvent: "gallery_view",
    params: { content_name: "Gallery", content_category: "Content" },
  });
}

export function trackLanguageChange(lang: string) {
  track({
    metaCustom: "language_change",
    googleEvent: "language_change",
    params: { content_name: "Language Change", content_category: "Interaction", language: lang },
  });
}

export function trackGoogleReview() {
  track({
    metaCustom: "google_review_click",
    googleEvent: "google_review_click",
    params: { content_name: "Google Review", content_category: "Review" },
  });
}

export function trackFacebookClick() {
  track({
    metaCustom: "facebook_click",
    googleEvent: "facebook_click",
    params: { content_name: "Facebook", content_category: "Social" },
  });
}

/* ─── QR Menu Tracking ─── */

export function trackQrPageView(tab: string, branch: string) {
  track({
    metaEvent: "ViewContent",
    metaCustom: "qr_menu_view",
    googleEvent: "qr_menu_view",
    params: { content_name: "QR Menu", content_category: "Menu", menu_tab: tab, branch: branch },
  });
}

export function trackQrTabClick(tab: string, branch: string) {
  track({
    metaEvent: "ViewContent",
    metaCustom: "qr_tab_click",
    googleEvent: "qr_tab_click",
    params: { content_name: tab, content_category: "Menu Tab", menu_tab: tab, branch: branch },
  });
}

export function trackQrCategoryClick(category: string, tab: string, branch: string) {
  track({
    metaEvent: "ViewContent",
    metaCustom: "qr_category_click",
    googleEvent: "qr_category_click",
    params: { content_name: category, content_category: "Menu Category", menu_tab: tab, branch: branch },
  });
}

export function trackQrProductClick(product: string, category: string, tab: string, branch: string) {
  track({
    metaEvent: "ViewContent",
    metaCustom: "qr_product_click",
    googleEvent: "qr_product_click",
    params: { content_name: product, content_category: category, menu_tab: tab, branch: branch },
  });
}

export function trackQrImageZoom(product: string, category: string, branch: string) {
  track({
    metaEvent: "ViewContent",
    metaCustom: "qr_image_zoom",
    googleEvent: "qr_image_zoom",
    params: { content_name: product, content_category: category, branch: branch },
  });
}

export function trackQrBackToTop(branch: string) {
  track({
    metaCustom: "qr_back_to_top",
    googleEvent: "qr_back_to_top",
    params: { branch: branch },
  });
}

export function trackQrLanguageChange(lang: string, branch: string) {
  track({
    metaCustom: "qr_language_change",
    googleEvent: "qr_language_change",
    params: { language: lang, branch: branch },
  });
}

export function trackQrReservationOpen(branch: string) {
  track({
    metaEvent: "Lead",
    metaCustom: "qr_reservation_open",
    googleEvent: "qr_reservation_open",
    params: { content_name: "QR Reservation", content_category: "Lead", branch: branch },
  });
}

export function trackContactSubmit() {
  track({
    metaEvent: "Contact",
    metaCustom: "contact_form_submit",
    googleEvent: "contact_form_submit",
    params: { content_name: "Contact Form", content_category: "Lead" },
  });
}

// Re-exports
export { trackMetaStandard, trackMetaCustom } from "./metaPixel";
export { trackGoogle, gtmEvent, ga4Event } from "./googleTag";
