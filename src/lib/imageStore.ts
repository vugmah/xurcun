/* ═══════════════════════════════════════════════════════════
   IMAGE STORE — Product photo assignment system
   SINGLE SOURCE OF TRUTH: Database/API
   
   localStorage is used ONLY for:
   - Temporary optimistic UI (brief flash while API saves)
   - Never read as source of truth
   - Never merged with DB data
   - Cleared on every fresh page load
   
   Cross-device rule:
   - All devices/browsers read from SAME DB via API
   - No browser-specific assignment state
   - No localStorage fallback for assignment reads
   ═══════════════════════════════════════════════════════════ */

const IMG_ASSIGN_KEY = "xurcun_img_assign_v1";

/* ─── In-memory cache for DB assignments (populated from API on load) ───
   This is the ONLY source of truth for assignment reads.
   It starts empty and is filled by syncAssignments() from API response. */
let dbAssignments: Record<string, { imageId: string; imageUrl: string }> = {};

/** DEPRECATED: Static fallback removed. DB is the single source of truth.
 *  All photos are served from the DB photos table via API.
 *  This array is kept empty to prevent stale fallback usage. */
const AVAILABLE_IMAGES: string[] = [];

export function getAvailableImages(): string[] {
  return [...AVAILABLE_IMAGES];
}

/** Get image URL — returns WebP with JPG fallback */
export function getImageUrl(imageId: string): string {
  return `/food-photos/${imageId}.webp`;
}

export function getImageJpgUrl(imageId: string): string {
  return `/food-photos/${imageId}.jpg`;
}

export function getThumbUrl(imageId: string): string {
  return `/food-photos/thumbs/${imageId}.jpg`;
}

/** Normalize string for key matching — handles AZ char differences, case */
export function normalize(s: string): string {
  return s.toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/[^a-z0-9]/g, "");
}

/** Assignment key: "tab:catTitle:itemNameAz" */
function makeKey(tab: string, catTitle: string, itemNameAz: string): string {
  return `${tab}:${catTitle}:${itemNameAz}`;
}

function resolveAssignedUrl(assignment: { imageId: string; imageUrl: string } | undefined): string | null {
  if (!assignment) return null;
  const directUrl = assignment.imageUrl || assignment.imageId;
  if (!directUrl) return null;
  if (directUrl.startsWith("http://") || directUrl.startsWith("https://") || directUrl.startsWith("/") || directUrl.startsWith("data:")) {
    return directUrl;
  }
  if (/\.(webp|jpe?g|png|gif)(\?|#|$)/i.test(directUrl)) {
    return `/food-photos/${directUrl}`;
  }
  return getImageUrl(directUrl);
}

/* ═══════════════════════════════════════════════════════════
   DB ASSIGNMENTS — SOURCE OF TRUTH
   All reads go through dbAssignments (populated from API).
   localStorage is NEVER read for assignment state.
   ═══════════════════════════════════════════════════════════ */

/** Sync DB assignments into memory (REPLACES — does not merge with localStorage) */
export function syncAssignments(assignments: Record<string, { imageId: string; imageUrl: string }>) {
  dbAssignments = {};
  for (const [key, val] of Object.entries(assignments)) {
    dbAssignments[key] = {
      imageId: val.imageId,
      imageUrl: val.imageUrl,
    };
  }
}

/** Get assigned image — reads ONLY from DB cache (source of truth)
 *  Falls back to normalized key match for AZ character differences */
export function getAssignedImage(tab: string, catTitle: string, itemNameAz: string): string | null {
  // Exact match first
  const key = makeKey(tab, catTitle, itemNameAz);
  const exactUrl = resolveAssignedUrl(dbAssignments[key]);
  if (exactUrl) return exactUrl;
  // Normalized fallback (handles Səhər yeməkləri vs SƏHƏR YEMƏYİ)
  const nKey = `${tab}:${normalize(catTitle)}:${normalize(itemNameAz)}`;
  for (const [dbKey, assignment] of Object.entries(dbAssignments)) {
    const parts = dbKey.split(":");
    if (parts.length >= 3) {
      const dbNKey = `${parts[0]}:${normalize(parts[1])}:${normalize(parts.slice(2).join(":"))}`;
      if (dbNKey === nKey) return resolveAssignedUrl(assignment);
    }
  }
  return null;
}

/** Get all assignments — returns ONLY DB assignments (source of truth) */
export function getAllAssignments(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(dbAssignments).map(([key, val]) => [key, val.imageId])
  );
}

/** Get assigned imageIds (for unassigned calculation) */
export function getAssignedImageIds(): Set<string> {
  return new Set(Object.values(dbAssignments).map((assignment) => assignment.imageId));
}

/** Get all unassigned images */
export function getUnassignedImages(): string[] {
  const assigned = getAssignedImageIds();
  return AVAILABLE_IMAGES.filter((id) => !assigned.has(id));
}

/** Get product key from assignment key */
export function parseAssignmentKey(key: string): { tab: string; catTitle: string; itemNameAz: string } | null {
  const parts = key.split(":");
  if (parts.length < 3) return null;
  return { tab: parts[0], catTitle: parts[1], itemNameAz: parts.slice(2).join(":") };
}

/* ═══════════════════════════════════════════════════════════
   LOCALSTORAGE — OPTIMISTIC UI ONLY
   Used for instant visual feedback while API saves.
   NEVER read as source of truth. Cleared on page load.
   ═══════════════════════════════════════════════════════════ */

/** Write optimistic assignment to localStorage (visual feedback only) */
export function writeOptimisticAssignment(tab: string, catTitle: string, itemNameAz: string, imageId: string | null) {
  try {
    const raw = localStorage.getItem(IMG_ASSIGN_KEY) || "{}";
    const assigns = JSON.parse(raw);
    const key = makeKey(tab, catTitle, itemNameAz);
    if (imageId) {
      assigns[key] = imageId;
    } else {
      delete assigns[key];
    }
    localStorage.setItem(IMG_ASSIGN_KEY, JSON.stringify(assigns));
  } catch { /* Safari private mode */ }
}

/** Read optimistic assignments (for admin UI flash only, not for display logic) */
export function readOptimisticAssignments(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(IMG_ASSIGN_KEY) || "{}");
  } catch { return {}; }
}

/** Clear all optimistic assignments */
export function clearOptimisticAssignments() {
  try { localStorage.removeItem(IMG_ASSIGN_KEY); } catch { /* Safari private */ }
}

/* ─── Backwards compat: old function names redirect to optimistic-only ─── */

/** @deprecated Use writeOptimisticAssignment() for UI feedback. display uses DB only. */
export function assignImage(tab: string, catTitle: string, itemNameAz: string, imageId: string | null) {
  writeOptimisticAssignment(tab, catTitle, itemNameAz, imageId);
}

/** @deprecated Use writeOptimisticAssignment(null) for UI feedback. display uses DB only. */
export function removeAssignment(tab: string, catTitle: string, itemNameAz: string) {
  writeOptimisticAssignment(tab, catTitle, itemNameAz, null);
}

/** @deprecated Use readOptimisticAssignments() for UI flash only. */
export function readAssignments(): Record<string, string> {
  return readOptimisticAssignments();
}

/** @deprecated Use clearOptimisticAssignments() */
export function clearAllAssignments() {
  clearOptimisticAssignments();
}

/** @deprecated Use getAssignedImage() which reads DB only. */
export function getAssignedImageWithFallback(tab: string, catTitle: string, itemNameAz: string): { webp: string | null; jpg: string | null } {
  const webp = getAssignedImage(tab, catTitle, itemNameAz);
  const key = makeKey(tab, catTitle, itemNameAz);
  const dbId = dbAssignments[key]?.imageId;
  return { webp, jpg: dbId ? getImageJpgUrl(dbId) : null };
}
