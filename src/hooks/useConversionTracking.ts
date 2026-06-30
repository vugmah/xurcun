import { useEffect } from "react";
import {
  trackPhoneClick,
  trackWhatsAppClick,
  trackMapsClick,
  trackInstagramClick,
  trackFacebookClick,
} from "@/lib/tracking";

/** Global click delegation → conversion events.
 *
 *  Wires the existing Meta/Google tracking helpers to every relevant link on the
 *  public site in ONE place (instead of per-component onClick handlers), so new
 *  pages get tracking for free. The helpers themselves are already safe:
 *  - track() skips /admin pages and respects the marketing-consent flag
 *    (metaEnabled), and trackMetaStandard/Custom no-op when fbq isn't loaded.
 *  So this listener never fires Meta events without consent.
 *
 *  Mapped events:
 *   tel:            → Contact   (phone_click)
 *   wa.me/whatsapp  → Contact   (whatsapp_click)  — WhatsApp FAB, gift card, catalog orders
 *   google maps     → Lead      (maps_click)
 *   instagram.com   → (custom)  instagram_click
 *   facebook.com    → (custom)  facebook_click
 */
export function useConversionTracking() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = (anchor.getAttribute("href") || "").toLowerCase();
      if (!href) return;

      if (href.startsWith("tel:")) {
        trackPhoneClick();
      } else if (href.includes("wa.me") || href.includes("whatsapp")) {
        trackWhatsAppClick();
      } else if (
        href.includes("maps.app.goo.gl") ||
        href.includes("google.com/maps") ||
        href.includes("goo.gl/maps")
      ) {
        trackMapsClick();
      } else if (href.includes("instagram.com")) {
        trackInstagramClick();
      } else if (href.includes("facebook.com")) {
        trackFacebookClick();
      }
    }

    // Capture phase so the event is recorded even if the handler navigates away.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}
