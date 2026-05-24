/* ═══════════════════════════════════════════════
   Azerbaijan (Baku) time utilities — UTC+4
   Supports ?testTime=HH:mm override for testing
   Persists testTime in sessionStorage for SPA routing
   ═══════════════════════════════════════════════ */

const SESSION_KEY = "testTime";

/** Read testTime from URL (before hash AND after hash for hash routing).
 *  If found in URL → persists to sessionStorage.
 *  If NOT in URL  → falls back to sessionStorage.
 */
function resolveTestTime(): string | null {
  try {
    // 1. Check standard query params (before hash): ?testTime=10:00
    const urlParams = new URLSearchParams(window.location.search);
    const urlTest = urlParams.get("testTime");
    if (urlTest) {
      sessionStorage.setItem(SESSION_KEY, urlTest);
      return urlTest;
    }

    // 2. Check hash-based routing (/#/path?testTime=12:30)
    const hash = window.location.hash;
    if (hash && hash.includes("?")) {
      const hashParams = new URLSearchParams(hash.split("?")[1]);
      const hashTest = hashParams.get("testTime");
      if (hashTest) {
        sessionStorage.setItem(SESSION_KEY, hashTest);
        return hashTest;
      }
    }

    // 3. Fallback: sessionStorage (survives SPA hash navigation)
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

/** Clear stored testTime from sessionStorage */
export function clearTestTime() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

/** Get the currently active testTime string, or null if using real time */
export function getActiveTestTime(): string | null {
  return resolveTestTime();
}

/** True if a testTime override is currently active */
export function hasTestTimeOverride(): boolean {
  return resolveTestTime() !== null;
}

/** Current hour in Baku (UTC+4), 0–23 */
export function getBakuHour(): number {
  const test = resolveTestTime();
  if (test !== null) {
    const h = parseInt(test.split(":")[0], 10);
    if (!isNaN(h) && h >= 0 && h <= 23) return h;
  }
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bakuOffset = 4 * 60 * 60000;
  return new Date(utc + bakuOffset).getHours();
}

/** Current hour and minute in Baku as { hour, minute } */
export function getBakuTime(): { hour: number; minute: number } {
  const test = resolveTestTime();
  if (test !== null) {
    const parts = test.split(":");
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] || "0", 10);
    if (!isNaN(h) && h >= 0 && h <= 23 && !isNaN(m) && m >= 0 && m <= 59) {
      return { hour: h, minute: m };
    }
  }
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const bakuOffset = 4 * 60 * 60000;
  const baku = new Date(utc + bakuOffset);
  return { hour: baku.getHours(), minute: baku.getMinutes() };
}

/** True when current Baku time is ≥ 12:30 */
export function isAfterBreakfastHours(): boolean {
  const { hour, minute } = getBakuTime();
  return hour > 12 || (hour === 12 && minute >= 30);
}

function isHourLate(hour: number): boolean {
  return hour >= 23 || hour < 8;
}

/** True when current Baku time is ≥ 23:00 or < 08:00 (late-night snack menu).
 *  Checks URL first, then sessionStorage, then real Baku time. */
export function isLateNight(): boolean {
  // 1. Check URL (standard + hash routing)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlTest = urlParams.get("testTime");
    if (urlTest) {
      sessionStorage.setItem(SESSION_KEY, urlTest);
      return isHourLate(parseInt(urlTest.split(":")[0], 10));
    }
    const hash = window.location.hash;
    if (hash && hash.includes("?")) {
      const hashParams = new URLSearchParams(hash.split("?")[1]);
      const hashTest = hashParams.get("testTime");
      if (hashTest) {
        sessionStorage.setItem(SESSION_KEY, hashTest);
        return isHourLate(parseInt(hashTest.split(":")[0], 10));
      }
    }
  } catch { /* ignore */ }

  // 2. Check sessionStorage (survives SPA hash navigation)
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    const h = parseInt(stored.split(":")[0], 10);
    if (!isNaN(h) && h >= 0 && h <= 23) {
      return isHourLate(h);
    }
  }

  // 3. Real Baku time
  return isHourLate(getBakuHour());
}

const BREAKFAST_KEYWORDS = ["səhər", "breakfast", "kahvalti", "zavtrak", "sƏhər", "sƏHƏR"];

/** Check if a category is the breakfast category */
function isBreakfastCategory(catTitle: string | undefined): boolean {
  if (!catTitle) return false;
  const lower = catTitle.toLowerCase();
  return BREAKFAST_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Reorder categories: sort by sortOrder, then breakfast first before 12:30, breakfast last from 12:30 onward.
 *  Returns { categories: reordered[], defaultIndex: number }
 *  Does NOT hide or delete the breakfast category. */
export function reorderCategoriesForTime<T extends { title_az?: string; title?: string; name?: string; sortOrder?: number }>(
  categories: T[]
): { categories: T[]; defaultIndex: number } {
  if (!categories || categories.length === 0) {
    return { categories: [], defaultIndex: 0 };
  }

  // First: sort by sortOrder if present
  const sorted = [...categories].sort((a, b) => {
    const aOrder = (a as any).sortOrder ?? 0;
    const bOrder = (b as any).sortOrder ?? 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return 0;
  });

  const after12_30 = isAfterBreakfastHours();
  const breakfastIdx = sorted.findIndex((c) =>
    isBreakfastCategory(c.title_az || c.title || c.name)
  );

  // No breakfast category found → return sorted
  if (breakfastIdx === -1) {
    return { categories: sorted, defaultIndex: 0 };
  }

  // Before 12:30: breakfast stays first (sorted order)
  if (!after12_30) {
    return { categories: sorted, defaultIndex: 0 };
  }

  // From 12:30 onward: move breakfast to the end
  const breakfast = sorted[breakfastIdx];
  const rest = sorted.filter((_, i) => i !== breakfastIdx);
  const reordered = [...rest, breakfast];

  // Default category is the first non-breakfast category (index 0 of reordered)
  return { categories: reordered, defaultIndex: 0 };
}
