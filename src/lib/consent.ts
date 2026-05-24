/**
 * Cookie Consent + Google Consent Mode v2
 * Manages user consent for Necessary / Analytics / Marketing
 */

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = "cookie_consent";

export function getDefaultConsent(): ConsentState {
  return { necessary: true, analytics: false, marketing: false };
}

export function loadConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function saveConsent(state: ConsentState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Check if consent has been decided */
export function hasConsentDecision(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/** Google Consent Mode v2 — update consent state */
export function updateGoogleConsent(state: ConsentState): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (!w.gtag) return;

  w.gtag("consent", "update", {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
    functionality_storage: "granted", // always needed
    security_storage: "granted", // always needed
    personalization_storage: state.marketing ? "granted" : "denied",
  });
}

/** Default Google Consent Mode v2 (denied everything) */
export function setDefaultGoogleConsent(): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (!w.gtag) return;

  w.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    personalization_storage: "denied",
    wait_for_update: 500,
  });
}

/** Check if marketing consent is granted */
export function isMarketingAllowed(): boolean {
  const c = loadConsent();
  return c?.marketing === true;
}

/** Check if analytics consent is granted */
export function isAnalyticsAllowed(): boolean {
  const c = loadConsent();
  return c?.analytics === true;
}

/** Accept all consent */
export function acceptAllConsent(): ConsentState {
  const state: ConsentState = { necessary: true, analytics: true, marketing: true };
  saveConsent(state);
  updateGoogleConsent(state);
  return state;
}

/** Reject all (except necessary) */
export function rejectAllConsent(): ConsentState {
  const state: ConsentState = { necessary: true, analytics: false, marketing: false };
  saveConsent(state);
  updateGoogleConsent(state);
  return state;
}

/** Save custom consent */
export function saveCustomConsent(state: ConsentState): ConsentState {
  saveConsent(state);
  updateGoogleConsent(state);
  return state;
}
