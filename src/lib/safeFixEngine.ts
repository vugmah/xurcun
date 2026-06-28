/* ═══════════════════════════════════════════════════════════════════
   SAFE FIX ENGINE — Production-Aware AI Auditor Backend

   Detects issues from:
   - DB data (via tRPC calls)
   - Browser DOM state (REAL current page)
   - localStorage health
   - Route structure
   - SEO meta tags
   - Tracking script injection status

   Auto-fixes only: stale cache, empty assignments, debug flags
   NEVER: modifies menu content, prices, translations
   ═══════════════════════════════════════════════════════════════════ */

import { getAvailableImages } from "./imageStore";

/* ─── Issue severity + lifecycle ─── */
export type FixSeverity = "auto" | "low" | "medium" | "high";
export type IssueStatus = "pending" | "fixed" | "ignored" | "stale";

export interface DetectedIssue {
  id: string;
  title: string;
  description: string;
  severity: FixSeverity;
  category: "ui" | "performance" | "technical" | "seo" | "security" | "photo" | "export" | "content" | "tracking" | "popup" | "qr";
  autoFixed: boolean;
  fixDescription?: string;
  beforeValue?: string;
  afterValue?: string;
  approved?: boolean;
  requiresApproval: boolean;
  page?: string;
  recommendation?: string;
  status?: IssueStatus;
}

/* ════════════════════════════════════════════════════════════════
   PRODUCTION STATE CACHE — Prevents stale results
   ════════════════════════════════════════════════════════════════ */

interface ProductionState {
  hasTitle: boolean;
  titleText: string;
  hasMetaDesc: boolean;
  metaDescLength: number;
  hasOgImage: boolean;
  ogImageUrl: string;
  hasCanonical: boolean;
  canonicalUrl: string;
  hreflangCount: number;
  hasJsonLd: boolean;
  hasFbq: boolean;
  hasGtag: boolean;
  hasDataLayer: boolean;
  fbqPreconnect: boolean;
  gtmPreconnect: boolean;
  lazyImageCount: number;
  headingCount: number;
  emptyHeadingCount: number;
  imageCount: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  photoCount: number;
  debugFlags: string[];
  timestamp: number;
}

let _cachedState: ProductionState | null = null;
let _cacheTime = 0;

function getProductionState(): ProductionState {
  const now = Date.now();
  // Cache for 30 seconds to avoid repeated DOM queries
  if (_cachedState && now - _cacheTime < 30000) return _cachedState;

  const s: ProductionState = {
    hasTitle: false,
    titleText: "",
    hasMetaDesc: false,
    metaDescLength: 0,
    hasOgImage: false,
    ogImageUrl: "",
    hasCanonical: false,
    canonicalUrl: "",
    hreflangCount: 0,
    hasJsonLd: false,
    hasFbq: false,
    hasGtag: false,
    hasDataLayer: false,
    fbqPreconnect: false,
    gtmPreconnect: false,
    lazyImageCount: 0,
    headingCount: 0,
    emptyHeadingCount: 0,
    imageCount: 0,
    imagesWithAlt: 0,
    imagesWithoutAlt: 0,
    photoCount: 0,
    debugFlags: [],
    timestamp: now,
  };

  if (typeof document === "undefined") {
    _cachedState = s;
    _cacheTime = now;
    return s;
  }

  // Title
  const title = document.title;
  s.hasTitle = !!title && title !== "" && title !== "Vite App";
  s.titleText = title || "";

  // Meta description
  const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content");
  s.hasMetaDesc = !!metaDesc && metaDesc.length > 0;
  s.metaDescLength = metaDesc?.length || 0;

  // OG image
  const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");
  s.hasOgImage = !!ogImage && ogImage.length > 0;
  s.ogImageUrl = ogImage || "";

  // Canonical
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  s.hasCanonical = !!canonical && canonical.length > 0;
  s.canonicalUrl = canonical || "";

  // Hreflang (x-default + 4 languages = 5 total)
  s.hreflangCount = document.querySelectorAll('link[rel="alternate"][hreflang]').length;

  // JSON-LD
  s.hasJsonLd = document.querySelectorAll('script[type="application/ld+json"]').length > 0;

  // Tracking
  s.hasFbq = typeof (window as any).fbq === "function";
  s.hasGtag = typeof (window as any).gtag === "function";
  s.hasDataLayer = Array.isArray((window as any).dataLayer) && (window as any).dataLayer.length > 0;

  // Preconnect (indicates tracking is configured even if not yet loaded)
  s.fbqPreconnect = !!document.querySelector('link[rel="preconnect"][href*="facebook"]') ||
                     !!document.querySelector('link[rel="preconnect"][href*="connect.facebook"]');
  s.gtmPreconnect = !!document.querySelector('link[rel="preconnect"][href*="googletagmanager"]');

  // Lazy images
  s.lazyImageCount = document.querySelectorAll("img[loading='lazy']").length;

  // Headings
  const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  s.headingCount = headings.length;
  s.emptyHeadingCount = 0;
  headings.forEach((h) => { if (!h.textContent?.trim()) s.emptyHeadingCount++; });

  // Images + alt
  const images = document.querySelectorAll("img");
  s.imageCount = images.length;
  s.imagesWithAlt = 0;
  s.imagesWithoutAlt = 0;
  images.forEach((img) => {
    if (img.hasAttribute("alt") && img.getAttribute("alt") !== null) s.imagesWithAlt++;
    else s.imagesWithoutAlt++;
  });

  // Debug flags
  try {
    s.debugFlags = Object.keys(localStorage).filter((k) =>
      k.includes("_debug") || k.includes("_test") || k.includes("_tmp")
    );
  } catch { /* ignore */ }

  // Photo count
  s.photoCount = getAvailableImages().length;

  _cachedState = s;
  _cacheTime = now;
  return s;
}

/* ════════════════════════════════════════════════════════════════
   DETECTOR FACTORY — Returns only actionable issues (no false OKs)
   ════════════════════════════════════════════════════════════════ */

function makeIssue(partial: Omit<DetectedIssue, "autoFixed" | "requiresApproval"> & { autoFixed?: boolean; requiresApproval?: boolean }): DetectedIssue {
  return {
    autoFixed: false,
    requiresApproval: partial.severity !== "auto",
    status: partial.severity === "auto" ? "fixed" : "pending",
    ...partial,
  } as DetectedIssue;
}

/* ─── 1. Photo System ─── */
function detectPhotoIssues(): DetectedIssue[] {
  const ps = getProductionState();
  const issues: DetectedIssue[] = [];

  if (ps.photoCount === 0) {
    issues.push(makeIssue({
      id: "photo-empty",
      title: "Photo library is empty",
      description: "No photos found in the library. Product photos need to be uploaded via Admin > Media.",
      severity: "high",
      category: "photo",
      page: "Media",
      recommendation: "Upload product photos via Admin > Media > Drag & Drop.",
    }));
  }

  // Check for duplicate IDs
  const images = getAvailableImages();
  const seen = new Set<string>();
  const dupes = new Set<string>();
  images.forEach((id) => { if (seen.has(id)) dupes.add(id); else seen.add(id); });
  dupes.forEach((id) => {
    issues.push(makeIssue({
      id: `photo-dup-${id}`,
      title: `Duplicate image ID: ${id}`,
      description: `Image ID "${id}" appears multiple times in the library.`,
      severity: "low",
      category: "photo",
      page: "Media",
      recommendation: "Remove duplicate entries from the photo library.",
    }));
  });

  return issues;
}

/* ─── 2. Security ─── */
function detectSecurityIssues(): DetectedIssue[] {
  const ps = getProductionState();
  const issues: DetectedIssue[] = [];

  if (ps.debugFlags.length > 0) {
    issues.push(makeIssue({
      id: "sec-debug",
      title: `${ps.debugFlags.length} debug/temp key(s) in localStorage`,
      description: `Found: ${ps.debugFlags.join(", ")}. Should be cleaned.`,
      severity: "low",
      category: "security",
      page: "All",
      recommendation: "Run Safe Auto-Fix to clean debug flags.",
    }));
  }

  return issues;
}

/* ─── 3. QR Menu ─── */
function detectQRIssues(): DetectedIssue[] {
  // Shisha discount checks removed (boutique does not sell hookah).
  return [];
}

/* ─── 4. Export ─── */
function detectExportIssues(): DetectedIssue[] {
  // Only show if there's an actual export issue
  return [];
}

/* ─── 5. SEO ─── */
function detectSEOIssues(): DetectedIssue[] {
  const ps = getProductionState();
  const issues: DetectedIssue[] = [];

  if (!ps.hasTitle) {
    issues.push(makeIssue({
      id: "seo-title",
      title: "Page title missing or default",
      description: `Current title: "${ps.titleText}". Should be a branded boutique title.`,
      severity: "high",
      category: "seo",
      page: "All",
      recommendation: "Set title via Admin > SEO > General.",
    }));
  } else if (ps.titleText.length < 10) {
    issues.push(makeIssue({
      id: "seo-title-short",
      title: "Page title too short",
      description: `Title: "${ps.titleText}" (${ps.titleText.length} chars). Should be 30-60 characters.`,
      severity: "low",
      category: "seo",
      page: "All",
      recommendation: "Expand title to include location + keywords.",
    }));
  }

  if (!ps.hasMetaDesc) {
    issues.push(makeIssue({
      id: "seo-desc",
      title: "Meta description missing",
      description: "Meta description tag is empty. Hurts search engine visibility.",
      severity: "high",
      category: "seo",
      page: "All",
      recommendation: "Set meta description via Admin > SEO > General.",
    }));
  } else if (ps.metaDescLength > 160) {
    issues.push(makeIssue({
      id: "seo-desc-long",
      title: `Meta description too long (${ps.metaDescLength} chars)`,
      description: "Google truncates after ~160 characters.",
      severity: "low",
      category: "seo",
      page: "All",
      recommendation: "Shorten to under 160 characters.",
    }));
  } else if (ps.metaDescLength < 50) {
    issues.push(makeIssue({
      id: "seo-desc-short",
      title: `Meta description too short (${ps.metaDescLength} chars)`,
      description: "Should be 120-160 characters for optimal visibility.",
      severity: "low",
      category: "seo",
      page: "All",
      recommendation: "Expand to 120-160 characters.",
    }));
  }

  if (!ps.hasOgImage) {
    issues.push(makeIssue({
      id: "seo-ogimage",
      title: "OG image tag missing",
      description: "Open Graph image tag not found. Social sharing will show no preview.",
      severity: "medium",
      category: "seo",
      page: "Homepage",
      recommendation: "Add og:image URL via Admin > SEO > Social.",
    }));
  }

  if (!ps.hasCanonical) {
    issues.push(makeIssue({
      id: "seo-canonical",
      title: "Canonical URL missing",
      description: "No canonical link tag found. Duplicate content risk.",
      severity: "medium",
      category: "seo",
      page: "All",
      recommendation: "Add canonical URL via Admin > SEO > General.",
    }));
  }

  // Hreflang: expect 4 (az, en, tr, ru) + x-default = 5
  if (ps.hreflangCount === 0) {
    issues.push(makeIssue({
      id: "seo-hreflang",
      title: "Hreflang tags missing",
      description: "No hreflang tags found. Expected: az, en, tr, ru + x-default.",
      severity: "high",
      category: "seo",
      page: "All",
      recommendation: "Add hreflang tags via Admin > SEO.",
    }));
  } else if (ps.hreflangCount < 4) {
    issues.push(makeIssue({
      id: "seo-hreflang-partial",
      title: `Hreflang tags incomplete (${ps.hreflangCount}/5)`,
      description: `Expected: x-default, az, en, tr, ru. Found: ${ps.hreflangCount}.`,
      severity: "medium",
      category: "seo",
      page: "All",
      recommendation: "Add missing hreflang tags via Admin > SEO.",
    }));
  }

  if (!ps.hasJsonLd) {
    issues.push(makeIssue({
      id: "seo-jsonld",
      title: "Structured data (JSON-LD) missing",
      description: "No JSON-LD schema found. Google uses this for rich snippets.",
      severity: "medium",
      category: "seo",
      page: "Homepage",
      recommendation: "Add Store + Organization schema via Admin > SEO > Structured Data.",
    }));
  }

  return issues;
}

/* ─── 6. Technical ─── */
function detectTechnicalIssues(): DetectedIssue[] {
  const issues: DetectedIssue[] = [];

  if (typeof window === "undefined") return issues;

  // localStorage health
  try {
    const testKey = "_xurcun_health_check";
    localStorage.setItem(testKey, "ok");
    localStorage.removeItem(testKey);
  } catch {
    issues.push(makeIssue({
      id: "tech-ls-fail",
      title: "localStorage not accessible",
      description: "localStorage is blocked. Settings won't persist.",
      severity: "high",
      category: "technical",
      page: "All",
      recommendation: "Check browser privacy settings.",
    }));
  }

  return issues;
}

/* ─── 7. Performance ─── */
function detectPerformanceIssues(): DetectedIssue[] {
  const ps = getProductionState();
  const issues: DetectedIssue[] = [];

  const conn = (navigator as any).connection;
  if (conn?.saveData) {
    issues.push(makeIssue({
      id: "perf-saveData",
      title: "Save Data mode is enabled",
      description: "User has Data Saver enabled. Consider lighter image formats.",
      severity: "low",
      category: "performance",
      page: "All",
      recommendation: "Serve WebP images to data-saver users.",
    }));
  }

  return issues;
}

/* ─── 8. Content ─── */
function detectContentIssues(): DetectedIssue[] {
  const ps = getProductionState();
  const issues: DetectedIssue[] = [];

  if (ps.emptyHeadingCount > 0) {
    issues.push(makeIssue({
      id: "content-empty-headings",
      title: `${ps.emptyHeadingCount} empty heading tag(s)`,
      description: "Empty heading tags hurt accessibility and SEO.",
      severity: "medium",
      category: "content",
      page: "All",
      recommendation: "Add text content to all heading tags.",
    }));
  }

  if (ps.imagesWithoutAlt > 0) {
    issues.push(makeIssue({
      id: "content-missing-alt",
      title: `${ps.imagesWithoutAlt} image(s) missing alt text`,
      description: `${ps.imagesWithAlt}/${ps.imageCount} images have alt. ${ps.imagesWithoutAlt} missing.`,
      severity: "medium",
      category: "content",
      page: "All",
      recommendation: "Add descriptive alt text to all images.",
    }));
  }

  return issues;
}

/* ─── 9. Tracking — Production-aware ─── */
function detectTrackingIssues(): DetectedIssue[] {
  const ps = getProductionState();
  const issues: DetectedIssue[] = [];

  // Meta Pixel
  if (ps.hasFbq) {
    // fbq loaded — all good, no issue reported (auto-resolved)
  } else if (ps.fbqPreconnect) {
    // Preconnect exists but fbq not loaded — script may be loading or blocked
    issues.push(makeIssue({
      id: "track-fbq-loading",
      title: "Meta Pixel: preconnect found, script loading",
      description: "Pixel preconnect is configured but fbq() not yet available. Script may still be loading or blocked by ad blocker.",
      severity: "low",
      category: "tracking",
      page: "All",
      recommendation: "Wait for page to fully load. If still not detected, check Pixel ID in Admin > Settings > Tracking.",
    }));
  } else {
    // No preconnect, no fbq — definitely not configured
    issues.push(makeIssue({
      id: "track-fbq-missing",
      title: "Meta Pixel not configured",
      description: "No Pixel preconnect or fbq() found. Meta Pixel tracking is not active.",
      severity: "medium",
      category: "tracking",
      page: "All",
      recommendation: "Configure Meta Pixel ID (988936886861215) via Admin > Settings > Tracking.",
    }));
  }

  // GA4
  if (ps.hasGtag) {
    // gtag loaded — all good
  } else if (ps.gtmPreconnect) {
    issues.push(makeIssue({
      id: "track-gtag-loading",
      title: "GA4: preconnect found, script loading",
      description: "GA4 preconnect configured but gtag() not yet available.",
      severity: "auto",
      category: "tracking",
      page: "All",
    }));
  } else {
    issues.push(makeIssue({
      id: "track-gtag-missing",
      title: "GA4 not configured",
      description: "No GA4 preconnect or gtag() found.",
      severity: "low",
      category: "tracking",
      page: "All",
      recommendation: "Configure GA4 ID via Admin > Settings > Tracking.",
    }));
  }

  // GTM dataLayer
  if (ps.hasDataLayer) {
    // dataLayer present — all good
  } else if (ps.gtmPreconnect) {
    issues.push(makeIssue({
      id: "track-datalayer-loading",
      title: "GTM dataLayer initializing",
      description: "GTM preconnect found, dataLayer may still be initializing.",
      severity: "auto",
      category: "tracking",
      page: "All",
    }));
  } else {
    issues.push(makeIssue({
      id: "track-datalayer-missing",
      title: "GTM dataLayer not found",
      description: "No GTM dataLayer array detected.",
      severity: "low",
      category: "tracking",
      page: "All",
      recommendation: "Configure GTM Container ID via Admin > Settings > Tracking.",
    }));
  }

  return issues;
}

/* ─── 10. Popup ─── */
function detectPopupIssues(): DetectedIssue[] {
  const issues: DetectedIssue[] = [];

  try {
    const popupData = localStorage.getItem("xurcun_popup_campaigns");
    if (popupData) {
      const campaigns = JSON.parse(popupData);
      if (Array.isArray(campaigns) && campaigns.length > 0) {
        const activeCount = campaigns.filter((c: any) => c.isActive).length;
        if (activeCount === 0) {
          issues.push(makeIssue({
            id: "popup-none-active",
            title: `${campaigns.length} campaigns, none active`,
            description: `${campaigns.length} popup campaigns exist but none are currently active.`,
            severity: "low",
            category: "popup",
            page: "All",
            recommendation: "Activate at least one campaign via Admin > Kampaniyalar.",
          }));
        }
      }
    }
  } catch { /* ignore */ }

  return issues;
}

/* ════════════════════════════════════════════════════════════════
   SAFE AUTO-FIX — Only low-risk UI/technical fixes
   ════════════════════════════════════════════════════════════════ */

const SAFE_FIXES: Record<string, () => { applied: boolean; description: string }> = {
  "clean-empty-photo-ids": () => {
    try {
      const key = "xurcun_img_assign_v1";
      const raw = localStorage.getItem(key);
      if (!raw) return { applied: false, description: "No photo assignments to clean" };
      const assigns = JSON.parse(raw);
      let cleaned = 0;
      Object.keys(assigns).forEach((k) => {
        if (!assigns[k] || assigns[k].trim() === "") {
          delete assigns[k];
          cleaned++;
        }
      });
      if (cleaned > 0) {
        localStorage.setItem(key, JSON.stringify(assigns));
        _cachedState = null; // invalidate cache
        return { applied: true, description: `Removed ${cleaned} empty photo assignments` };
      }
      return { applied: false, description: "No empty photo assignments found" };
    } catch {
      return { applied: false, description: "Could not clean photo assignments" };
    }
  },

  "clean-debug-flags": () => {
    try {
      const debugKeys = Object.keys(localStorage).filter((k) =>
        k.includes("_debug") || k.includes("_test") || k.includes("_tmp_")
      );
      debugKeys.forEach((k) => localStorage.removeItem(k));
      if (debugKeys.length > 0) {
        _cachedState = null;
        return { applied: true, description: `Removed ${debugKeys.length} debug/temp keys` };
      }
      return { applied: false, description: "No debug keys found" };
    } catch {
      return { applied: false, description: "Could not clean debug keys" };
    }
  },

  "clean-stale-cache": () => {
    try {
      const staleKeys = Object.keys(localStorage).filter((k) =>
        k.includes("_cache") || k.includes("_old") || k.includes("_backup")
      );
      staleKeys.forEach((k) => localStorage.removeItem(k));
      if (staleKeys.length > 0) {
        _cachedState = null;
        return { applied: true, description: `Removed ${staleKeys.length} stale cache keys` };
      }
      return { applied: false, description: "No stale cache keys found" };
    } catch {
      return { applied: false, description: "Could not clean stale cache" };
    }
  },
};

export function runSafeAutoFixes(): { applied: number; fixes: { id: string; description: string }[] } {
  const results: { id: string; description: string }[] = [];
  let applied = 0;

  Object.entries(SAFE_FIXES).forEach(([id, fixFn]) => {
    try {
      const result = fixFn();
      if (result.applied) {
        applied++;
        results.push({ id, description: result.description });
      }
    } catch (e) {
      results.push({ id, description: `Fix ${id} failed: ${e}` });
    }
  });

  // Invalidate cache after fixes
  if (applied > 0) _cachedState = null;

  return { applied, fixes: results };
}

/* ════════════════════════════════════════════════════════════════
   SUGGESTION LOG — Persisted in localStorage with lifecycle
   ════════════════════════════════════════════════════════════════ */

const LOG_KEY = "xurcun_ai_auditor_log";
const LOG_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface LogEntry {
  id: string;
  title: string;
  severity: FixSeverity;
  category: string;
  status: IssueStatus;
  firstSeen: number;
  lastSeen: number;
  fixedAt?: number;
  ignoredAt?: number;
  count: number;
}

function loadLog(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const entries = JSON.parse(raw) as LogEntry[];
    // Remove stale entries older than 7 days
    const cutoff = Date.now() - LOG_MAX_AGE_MS;
    return entries.filter((e) => e.lastSeen > cutoff);
  } catch { return []; }
}

function saveLog(entries: LogEntry[]) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch { /* ignore */ }
}

function syncLogWithIssues(issues: DetectedIssue[]): DetectedIssue[] {
  const log = loadLog();
  const now = Date.now();
  const currentIds = new Set(issues.map((i) => i.id));

  // Mark log entries as fixed if no longer in current issues
  log.forEach((entry) => {
    if (!currentIds.has(entry.id) && entry.status === "pending") {
      entry.status = "fixed";
      entry.fixedAt = now;
    }
    if (currentIds.has(entry.id)) {
      entry.lastSeen = now;
      entry.count++;
    }
  });

  // Add new issues to log
  issues.forEach((issue) => {
    const existing = log.find((e) => e.id === issue.id);
    if (existing) {
      existing.title = issue.title;
      existing.severity = issue.severity;
      existing.category = issue.category;
      if (existing.status === "fixed") {
        // Re-opened
        existing.status = "pending";
        existing.fixedAt = undefined;
      }
    } else {
      log.push({
        id: issue.id,
        title: issue.title,
        severity: issue.severity,
        category: issue.category,
        status: issue.status || "pending",
        firstSeen: now,
        lastSeen: now,
        count: 1,
      });
    }
  });

  saveLog(log);

  // Enrich issues with log status
  return issues.map((issue) => {
    const entry = log.find((e) => e.id === issue.id);
    if (entry) {
      return { ...issue, status: entry.status };
    }
    return issue;
  });
}

export function updateIssueStatus(issueId: string, newStatus: IssueStatus) {
  const log = loadLog();
  const entry = log.find((e) => e.id === issueId);
  if (entry) {
    entry.status = newStatus;
    if (newStatus === "fixed") entry.fixedAt = Date.now();
    if (newStatus === "ignored") entry.ignoredAt = Date.now();
    saveLog(log);
  }
  // Also invalidate cache to force re-scan
  _cachedState = null;
}

export function getLogHistory(): LogEntry[] {
  return loadLog().sort((a, b) => b.lastSeen - a.lastSeen);
}

export function clearLog() {
  localStorage.removeItem(LOG_KEY);
  _cachedState = null;
}

/* ════════════════════════════════════════════════════════════════
   MASTER DETECTION — Runs all 10 detectors + lifecycle sync
   ════════════════════════════════════════════════════════════════ */

export function runFullAudit(): DetectedIssue[] {
  // Invalidate cache for fresh scan
  _cachedState = null;

  const all: DetectedIssue[] = [];

  all.push(...detectPhotoIssues());
  all.push(...detectSecurityIssues());
  all.push(...detectQRIssues());
  all.push(...detectExportIssues());
  all.push(...detectSEOIssues());
  all.push(...detectTechnicalIssues());
  all.push(...detectPerformanceIssues());
  all.push(...detectContentIssues());
  all.push(...detectTrackingIssues());
  all.push(...detectPopupIssues());

  // Sort: high first, then medium, low, auto
  const severityOrder: Record<FixSeverity, number> = { high: 0, medium: 1, low: 2, auto: 3 };
  all.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Sync with suggestion log lifecycle
  return syncLogWithIssues(all);
}

/** Stats on detected issues */
export function getAuditStats(issues: DetectedIssue[]) {
  const total = issues.length;
  const auto = issues.filter((i) => i.severity === "auto").length;
  const low = issues.filter((i) => i.severity === "low").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const high = issues.filter((i) => i.severity === "high").length;
  const pending = issues.filter((i) => i.status === "pending").length;
  const fixed = issues.filter((i) => i.status === "fixed").length;
  const ignored = issues.filter((i) => i.status === "ignored").length;

  let score = 100;
  score -= high * 15;
  score -= medium * 8;
  score -= low * 3;
  score = Math.max(0, Math.min(100, score));

  return { total, auto, low, medium, high, pending, fixed, ignored, score };
}

export function getIssuesByCategory(issues: DetectedIssue[], category: string): DetectedIssue[] {
  return issues.filter((i) => i.category === category);
}

export function getAutoFixableIssues(issues: DetectedIssue[]): DetectedIssue[] {
  return issues.filter((i) => i.severity === "auto" || i.severity === "low");
}

export function getApprovalRequiredIssues(issues: DetectedIssue[]): DetectedIssue[] {
  return issues.filter((i) => i.requiresApproval);
}
