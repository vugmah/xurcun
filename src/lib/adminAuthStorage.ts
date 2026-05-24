/**
 * Unified Admin Auth Storage
 *
 * Strategy:
 *   - WRITE to BOTH sessionStorage + localStorage (whichever works on the device)
 *   - READ from sessionStorage first (works in mobile Safari private mode),
 *     fallback to localStorage (desktop compatibility)
 *   - REMOVE from BOTH to ensure clean logout everywhere
 *
 * This solves the mobile Safari private browsing issue where localStorage
 * is unavailable, without breaking desktop which relies on localStorage.
 */

const ADMIN_KEY = "xurcun_admin_key";
const LAST_ACTIVITY_KEY = "xurcun_admin_last_activity";

// ─── Admin Key ───

export function getAdminKey(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_KEY) || localStorage.getItem(ADMIN_KEY);
  } catch {
    return null;
  }
}

export function setAdminKey(value: string): void {
  try { sessionStorage.setItem(ADMIN_KEY, value); } catch { /* ignore */ }
  try { localStorage.setItem(ADMIN_KEY, value); } catch { /* ignore */ }
}

export function removeAdminKey(): void {
  try { sessionStorage.removeItem(ADMIN_KEY); } catch { /* ignore */ }
  try { localStorage.removeItem(ADMIN_KEY); } catch { /* ignore */ }
}

// ─── Last Activity ───

export function getLastActivity(): string | null {
  try {
    return sessionStorage.getItem(LAST_ACTIVITY_KEY) || localStorage.getItem(LAST_ACTIVITY_KEY);
  } catch {
    return null;
  }
}

export function setLastActivity(value: string): void {
  try { sessionStorage.setItem(LAST_ACTIVITY_KEY, value); } catch { /* ignore */ }
  try { localStorage.setItem(LAST_ACTIVITY_KEY, value); } catch { /* ignore */ }
}

export function removeLastActivity(): void {
  try { sessionStorage.removeItem(LAST_ACTIVITY_KEY); } catch { /* ignore */ }
  try { localStorage.removeItem(LAST_ACTIVITY_KEY); } catch { /* ignore */ }
}

// ─── Legacy compatibility wrappers ───

/** @deprecated Use getAdminKey() directly */
export function safeGetItem(key: string): string | null {
  if (key === ADMIN_KEY) return getAdminKey();
  if (key === LAST_ACTIVITY_KEY) return getLastActivity();
  try { return sessionStorage.getItem(key) || localStorage.getItem(key); }
  catch { return null; }
}

/** @deprecated Use setAdminKey() or setLastActivity() directly */
export function safeSetItem(key: string, value: string): void {
  if (key === ADMIN_KEY) { setAdminKey(value); return; }
  if (key === LAST_ACTIVITY_KEY) { setLastActivity(value); return; }
  try { sessionStorage.setItem(key, value); } catch { /* ignore */ }
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

/** @deprecated Use removeAdminKey() or removeLastActivity() directly */
export function safeRemoveItem(key: string): void {
  if (key === ADMIN_KEY) { removeAdminKey(); return; }
  if (key === LAST_ACTIVITY_KEY) { removeLastActivity(); return; }
  try { sessionStorage.removeItem(key); } catch { /* ignore */ }
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}
