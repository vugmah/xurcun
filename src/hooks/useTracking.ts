import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackPageView } from "@/lib/tracking";
import { initTrackingAsync } from "@/lib/tracking/initTracking";

/** Check if current page is admin */
function isAdminPage(): boolean {
  return typeof window !== "undefined" && window.location.hash.startsWith("#/admin");
}

/** Initialize tracking on first mount (public pages only).
 *  Fetches tracking IDs from DB first, then loads scripts.
 *  This ensures IDs work on ALL devices, not just the admin's browser.
 */
export function useTrackingInit() {
  useEffect(() => {
    if (isAdminPage()) return;
    // Async: fetch from DB first, then load scripts
    initTrackingAsync().catch(() => {
      // Fallback: silently fail — tracking not critical
    });
  }, []);
}

/** Automatically fires PageView on route change (public pages only) */
export function useAutoPageView() {
  const location = useLocation();

  // Init tracking on mount
  useTrackingInit();

  useEffect(() => {
    if (isAdminPage()) return;
    trackPageView();
  }, [location.pathname]);
}

/** Hook that returns current tracking consent status */
export function useTrackingConsent() {
  const checkConsent = (): { meta: boolean; google: boolean } => {
    try {
      const raw = localStorage.getItem("xurcun_cookie_consent");
      if (!raw) return { meta: false, google: false };
      const c = JSON.parse(raw);
      return {
        meta: c.marketing === true,
        google: c.marketing === true || c.analytics === true,
      };
    } catch {
      return { meta: false, google: false };
    }
  };

  return checkConsent();
}
