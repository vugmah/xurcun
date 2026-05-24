/* ═══════════════════════════════════════════
   Shisha Discount Store — branch-specific
   Each branch can have its own discount config:
   - enabled:   ON/OFF
   - percent:   0-100 (default 50)
   - activeFrom: "HH:mm" (default "13:00")
   - activeUntil: "HH:mm" (default "18:00")
   ═══════════════════════════════════════════ */

const STORAGE_KEY = "xurcun_shisha_discount_v2";

export interface ShishaDiscountConfig {
  enabled: boolean;
  percent: number;       // 0–100
  activeFrom: string;    // "HH:mm" e.g. "13:00"
  activeUntil: string;   // "HH:mm" e.g. "18:00"
}

const DEFAULTS: Record<string, ShishaDiscountConfig> = {
  "white-city":       { enabled: false, percent: 50, activeFrom: "13:00", activeUntil: "18:00" },
  "seabreeze-marina": { enabled: false, percent: 50, activeFrom: "13:00", activeUntil: "18:00" },
};

/** Parse "HH:mm" → minutes since midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  return h * 60 + m;
}

/** Migrate old v1 data (single activeUntil → activeFrom/activeUntil) */
function migrateV1(): void {
  try {
    const old = localStorage.getItem("xurcun_shisha_discount_v1");
    if (!old) return;
    const parsed = JSON.parse(old) as Record<string, any>;
    const migrated: Record<string, ShishaDiscountConfig> = {};
    for (const [slug, cfg] of Object.entries(parsed)) {
      migrated[slug] = {
        enabled: cfg.enabled ?? false,
        percent: cfg.percent ?? 50,
        activeFrom: "13:00",
        activeUntil: cfg.activeUntil ?? "18:00",
      };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem("xurcun_shisha_discount_v1");
  } catch { /* ignore */ }
}

function loadAll(): Record<string, ShishaDiscountConfig> {
  migrateV1();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

export function getShishaDiscount(branchSlug: string): ShishaDiscountConfig {
  const all = loadAll();
  return all[branchSlug] || { ...DEFAULTS["white-city"] };
}

export function saveShishaDiscount(branchSlug: string, config: ShishaDiscountConfig) {
  const all = loadAll();
  all[branchSlug] = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function getAllShishaDiscounts(): Record<string, ShishaDiscountConfig> {
  return loadAll();
}

/** Check if discount is currently active for a branch (based on Baku time UTC+4).
 *  Returns { active, from, until } so callers can display the time range even when inactive. */
export function getShishaDiscountStatus(branchSlug: string, testTime?: string): {
  active: boolean;
  from: string;
  until: string;
  percent: number;
  enabled: boolean;
} {
  const cfg = getShishaDiscount(branchSlug);

  // Parse current time (Baku UTC+4 or test override)
  let hour: number, minute: number;
  if (testTime) {
    const parts = testTime.split(":");
    hour = parseInt(parts[0], 10);
    minute = parseInt(parts[1] || "0", 10);
  } else {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const baku = new Date(utc + 4 * 60 * 60000);
    hour = baku.getHours();
    minute = baku.getMinutes();
  }

  const nowMinutes = hour * 60 + minute;
  const fromMinutes = toMinutes(cfg.activeFrom);
  const untilMinutes = toMinutes(cfg.activeUntil);

  // Handle overnight ranges (e.g., 22:00 → 02:00)
  let inRange: boolean;
  if (fromMinutes <= untilMinutes) {
    // Same-day range: 13:00 → 18:00
    inRange = nowMinutes >= fromMinutes && nowMinutes < untilMinutes;
  } else {
    // Overnight range: 22:00 → 02:00
    inRange = nowMinutes >= fromMinutes || nowMinutes < untilMinutes;
  }

  const active = cfg.enabled && cfg.percent > 0 && inRange;

  return {
    active,
    from: cfg.activeFrom,
    until: cfg.activeUntil,
    percent: cfg.percent,
    enabled: cfg.enabled,
  };
}

/** Legacy check — delegates to getShishaDiscountStatus */
export function isShishaDiscountActiveNow(branchSlug: string, testTime?: string): boolean {
  return getShishaDiscountStatus(branchSlug, testTime).active;
}

/** Calculate discounted price */
export function applyShishaDiscount(price: number | string | null, branchSlug: string, testTime?: string): {
  original: string | null;
  discounted: string | null;
  active: boolean;
  percent: number;
  from: string;
  until: string;
} {
  if (!price || price === null || price === undefined) {
    return { original: null, discounted: null, active: false, percent: 0, from: "", until: "" };
  }

  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice) || numPrice <= 0) {
    return { original: null, discounted: null, active: false, percent: 0, from: "", until: "" };
  }

  const status = getShishaDiscountStatus(branchSlug, testTime);

  if (!status.active || status.percent <= 0) {
    return { original: null, discounted: String(numPrice), active: false, percent: 0, from: status.from, until: status.until };
  }

  const discounted = Math.round(numPrice * (100 - status.percent)) / 100;
  return {
    original: String(numPrice),
    discounted: String(discounted),
    active: true,
    percent: status.percent,
    from: status.from,
    until: status.until,
  };
}

/** Format discount banner text with time range */
export function formatDiscountBanner(percent: number, from: string, until: string, lang: string): string {
  switch (lang) {
    case "az":
      return `${percent}% endirim — ${from}-dan ${until}-a qədər`;
    case "tr":
      return `%${percent} indirim — ${from} - ${until} arası`;
    case "ru":
      return `Скидка ${percent}% — с ${from} до ${until}`;
    default:
      return `${percent}% discount — ${from} to ${until}`;
  }
}

/** Format inactive / upcoming banner text */
export function formatDiscountInactive(from: string, until: string, lang: string): string {
  switch (lang) {
    case "az":
      return `${from}–${until} arası endirim vaxtı`;
    case "tr":
      return `${from}–${until} arası indirim saatleri`;
    case "ru":
      return `Часы скидок: ${from}–${until}`;
    default:
      return `Discount hours: ${from}–${until}`;
  }
}
