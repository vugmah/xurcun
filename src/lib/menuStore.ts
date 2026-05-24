// Shared menu data store: seed (deployed) + localStorage (per-browser overlay).
// All views (admin, homepage, QR menu) read from the same merged source.
//
// Data priority:
// 1. localStorage edits (per-browser overlay, applies instantly)
// 2. DEPLOYED_EDITS seed (shared across all browsers, baked into build)
// 3. API data (if backend connected)
// 4. static menuData.ts fallback
//
// FOR CROSS-DEVICE QR VISIBILITY:
// Admin edits must be exported to menuEditsSeed.ts and redeployed.
// localStorage alone is NOT enough — it only works on the same browser.

import { DEPLOYED_EDITS, DEPLOYED_BRANCH_EDITS } from "./menuEditsSeed";
import { alacarteData, beverageData, shishaData } from "./menuData.static";

export type TabType = 'food' | 'beverage' | 'shisha'

/** Return the correct mutable data array for a tab.
 *  Shisha is normalised from { hookahs: [...] } → [{ title_az, items }].
 */
function getTargetArray(tab: TabType | string): any[] {
  if (tab === "food") return alacarteData;
  if (tab === "beverage") return beverageData;
  /* shisha: wrap flat hookahs array into a synthetic category */
  return shishaData ? [{ id: "shisha", title_az: "Qəlyan", title_en: "Shisha", title_tr: "Nargile", title_ru: "Кальян", items: (shishaData as any).hookahs || [] }] : [];
}

const STORAGE_KEY = 'xurcun_menu_edits_v2'
const SCHEMA_VERSION = 'v2' // bump this whenever edit schema changes

export type QrLayoutMode = "auto" | "card" | "list";

export interface MenuEdit {
  is_new?: boolean
  is_meat?: boolean
  is_fish?: boolean
  is_vegetarian?: boolean
  is_halal?: boolean
  is_gluten_free?: boolean
  is_sugar_free?: boolean
  is_spicy?: boolean
  is_snack?: boolean
  price?: string | null
  image_url?: string
  image_alt_az?: string
  image_alt_ru?: string
  image_alt_en?: string
  name_az?: string
  name_ru?: string
  name_en?: string
  name_tr?: string
  desc_az?: string
  desc_ru?: string
  desc_en?: string
  desc_tr?: string
  is_active?: boolean
  qr_layout_mode?: QrLayoutMode
}

export interface BranchItemEdit {
  is_available?: boolean
  branch_price?: string
}

/* ─── key: tab::catTitle::itemNameAz ─── */
function itemKey(tab: TabType, catTitle: string, itemNameAz: string): string {
  return `${tab}::${catTitle}::${itemNameAz}`
}

/* ─── key: tab::BRANCH::branchSlug::catTitle::itemNameAz ─── */
function branchItemKey(tab: TabType, branchSlug: string, catTitle: string, itemNameAz: string): string {
  return `${tab}::BRANCH::${branchSlug}::${catTitle}::${itemNameAz}`
}

/* ═══════════════════════════════════════════════
   STATIC DATA LOOKUP — find item in bundled menuData
   ═══════════════════════════════════════════════ */

const staticDataMap: Record<TabType, any[]> = {
  food: alacarteData,
  beverage: beverageData,
  shisha: getTargetArray("shisha"),
};

/** Find a static item's original fields (image_url, is_new, etc.) */
function findStaticItem(tab: TabType, catTitle: string, itemNameAz: string): Record<string, any> | null {
  const cats = staticDataMap[tab];
  if (!cats) return null;
  for (const cat of cats) {
    const catTitleAz = cat.title_az || cat.titleAz || "";
    // Shisha: catTitle might be "Qəlyan cihazları" but static is synthetic
    if (tab === "shisha" || catTitleAz === catTitle) {
      for (const it of cat.items || []) {
        const itNameAz = it.name_az || it.nameAz || "";
        if (itNameAz === itemNameAz) {
          return it;
        }
      }
    }
  }
  return null;
}

/* ─── Read only localStorage (per-browser) ─── */
function getLocalEdits(): Record<string, MenuEdit> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || '{}';
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch { return {} }
}

// Cached merged edits to avoid repeated computation
let _mergedCache: Record<string, MenuEdit> | null = null;
let _localCacheRaw = '';

/** Get ALL edits: deployed seed + localStorage overlay
 *  Priority: localStorage > deployed seed > nothing
 *  This ensures cross-device consistency for QR menus.
 */
export function getAllEdits(): Record<string, MenuEdit> {
  const local = getLocalEdits();
  const localRaw = JSON.stringify(local);

  // If localStorage hasn't changed, return cached merge
  if (_mergedCache && _localCacheRaw === localRaw) {
    return _mergedCache;
  }

  // Merge: seed first, then localStorage overrides
  const merged = { ...DEPLOYED_EDITS, ...local };

  _localCacheRaw = localRaw;
  _mergedCache = merged;
  return merged;
}

/** Invalidate caches (call after saving edits) */
function invalidateCache() {
  _mergedCache = null;
  _localCacheRaw = '';
}

/** Save a partial edit for one item (localStorage cache — will be migrated to DB API) */
export function saveMenuEdit(tab: TabType, catTitle: string, itemNameAz: string, patch: Partial<MenuEdit>) {
  try {
    invalidateCache()
    const all = getLocalEdits()
    const key = itemKey(tab, catTitle, itemNameAz)
    all[key] = { ...all[key], ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    invalidateCache()
  } catch { /* Safari private mode or quota exceeded */ }
}

/** Read merged edit for one item (seed + localStorage) */
export function getMenuEdit(tab: TabType, catTitle: string, itemNameAz: string): MenuEdit | null {
  return getAllEdits()[itemKey(tab, catTitle, itemNameAz)] || null
}

/** Get one boolean field */
export function getEditField(tab: TabType, catTitle: string, itemNameAz: string, field: keyof MenuEdit): boolean {
  const edit = getMenuEdit(tab, catTitle, itemNameAz)
  return (edit && (edit[field] as boolean)) || false
}

/** ════════════════════════════════════════════════════════════
 *  DEPRECATED: getBadges() removed — localStorage is NOT source-of-truth.
 *  Use DB-driven badge data instead:
 *    - Admin:  trpc.menu.adminList.useQuery() → item.badges[]
 *    - Public: trpc.menu.getMenu.useQuery()    → item.badges[]
 *    - AI:     trpc.badges.getPublic.useQuery() → approvedBadges
 *  
 *  For emergency fallback (static data only), use getItemEdits() directly.
 *  ════════════════════════════════════════════════════════════ */
export function getBadges(_tab: TabType, _catTitle: string, _itemNameAz: string, isDessert?: boolean) {
  /* getBadges() always returns FALSE — badges now come exclusively from DB.
   * MenuBadges component receives badge data via `itemData` prop from DB query.
   * This function remains as a no-op for backward compatibility only. */
  if (isDessert) {
    return { is_new: false, is_gluten_free: false, is_sugar_free: false };
  }
  return { is_new: false, is_meat: false, is_fish: false, is_vegetarian: false, is_halal: false, is_spicy: false };
}

/** Toggle one boolean field */
export function toggleEditField(tab: TabType, catTitle: string, itemNameAz: string, field: keyof MenuEdit) {
  const edit = getMenuEdit(tab, catTitle, itemNameAz) || {}
  const current = (edit[field] as boolean) || false
  saveMenuEdit(tab, catTitle, itemNameAz, { [field]: !current } as Partial<MenuEdit>)
}

/* ═══════════════════════════════════════════════
   BRANCH-SPECIFIC EDIT HELPERS
   ═══════════════════════════════════════════════ */

/** Get merged branch edits: deployed seed + localStorage overlay */
function getAllBranchEdits(): Record<string, BranchItemEdit> {
  const local = getLocalEdits();
  // Filter out branch keys and merge with seed
  const branchEdits: Record<string, BranchItemEdit> = { ...DEPLOYED_BRANCH_EDITS };
  Object.keys(local).forEach((key) => {
    if (key.includes('::BRANCH::')) {
      branchEdits[key] = local[key] as unknown as BranchItemEdit;
    }
  });
  return branchEdits;
}

/** Save branch-specific availability + price for one item (localStorage only) */
export function saveBranchItemEdit(
  tab: TabType,
  branchSlug: string,
  catTitle: string,
  itemNameAz: string,
  patch: Partial<BranchItemEdit>
) {
  try {
    invalidateCache()
    const all = getLocalEdits()
    const key = branchItemKey(tab, branchSlug, catTitle, itemNameAz)
    const existing = (all as any)[key] || {}
    ;(all as any)[key] = { ...existing, ...patch }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    invalidateCache()
  } catch { /* Safari private mode or quota exceeded */ }
}

/** Read merged branch edit for one item (seed + localStorage) */
export function getBranchItemEdit(
  tab: TabType,
  branchSlug: string,
  catTitle: string,
  itemNameAz: string
): BranchItemEdit | null {
  const key = branchItemKey(tab, branchSlug, catTitle, itemNameAz)
  // Check deployed seed first, then localStorage overlay
  const local = getLocalEdits();
  const localEdit = (local as any)[key];
  if (localEdit) return localEdit;
  return (DEPLOYED_BRANCH_EDITS as any)[key] || null;
}

/** Check if item is available at a specific branch */
export function isItemAvailableAtBranch(
  tab: TabType,
  branchSlug: string,
  catTitle: string,
  itemNameAz: string
): boolean {
  /* 1. Check GENERAL status first — if passive, hide EVERYWHERE */
  const generalEdit = getItemEdits(tab, catTitle, itemNameAz)
  if (generalEdit.is_active === false) return false
  
  /* 2. Check BRANCH-SPECIFIC status */
  const branchEdit = getBranchItemEdit(tab, branchSlug, catTitle, itemNameAz)
  return branchEdit?.is_available ?? true
}

/** Check ONLY general status (for admin UI) */
export function isItemGenerallyActive(tab: TabType, catTitle: string, itemNameAz: string): boolean {
  const edit = getItemEdits(tab, catTitle, itemNameAz)
  return edit.is_active !== false
}

/** Get branch-specific price for an item */
export function getBranchPrice(
  tab: TabType,
  branchSlug: string,
  catTitle: string,
  itemNameAz: string,
  basePrice: string | null
): string | null {
  const edit = getBranchItemEdit(tab, branchSlug, catTitle, itemNameAz)
  return edit?.branch_price || basePrice || null
}

/* ═══════════════════════════════════════════════
   GENERAL HELPERS
   ═══════════════════════════════════════════════ */

/** DEPRECATED: localStorage overlay removed — database is single source of truth.
 *  Pass-through: returns categories unchanged. Admin edits now save via API (trpc.menu.updateItem).
 */
export function applyMenuEdits(_tab: TabType, categories: any[]): any[] {
  /* Database is source of truth — no localStorage overlay */
  return categories;
}

/** Merge helper: edit value → static value → undefined */
function mergeField(editVal: any, staticVal: any): any {
  if (editVal !== undefined && editVal !== null) return editVal;
  if (staticVal !== undefined && staticVal !== null) return staticVal;
  return undefined;
}

/* ─── Read all edited fields for one item (merged: seed + localStorage + static data) ─── */
export function getItemEdits(tab: TabType, catTitle: string, itemNameAz: string): MenuEdit & { is_active?: boolean } {
  const edit = getMenuEdit(tab, catTitle, itemNameAz) || {}
  const staticItem = findStaticItem(tab, catTitle, itemNameAz) || {}
  return {
    is_new: mergeField(edit.is_new, staticItem.is_new ?? staticItem.isNew),
    is_meat: mergeField(edit.is_meat, staticItem.is_meat ?? staticItem.isMeat),
    is_fish: mergeField(edit.is_fish, staticItem.is_fish ?? staticItem.isFish),
    is_vegetarian: mergeField(edit.is_vegetarian, staticItem.is_vegetarian ?? staticItem.isVegetarian),
    is_halal: mergeField(edit.is_halal, staticItem.is_halal ?? staticItem.isHalal),
    is_spicy: mergeField(edit.is_spicy, staticItem.is_spicy ?? staticItem.isSpicy),
    is_snack: mergeField(edit.is_snack, staticItem.is_snack ?? staticItem.isSnack),
    is_gluten_free: mergeField(edit.is_gluten_free, staticItem.is_gluten_free ?? staticItem.isGlutenFree),
    is_sugar_free: mergeField(edit.is_sugar_free, staticItem.is_sugar_free ?? staticItem.isSugarFree),
    price: mergeField(edit.price, staticItem.price),
    image_url: mergeField(edit.image_url, staticItem.image_url ?? staticItem.imageUrl),
    image_alt_az: mergeField(edit.image_alt_az, staticItem.image_alt_az ?? staticItem.imageAltAz),
    image_alt_ru: mergeField(edit.image_alt_ru, staticItem.image_alt_ru ?? staticItem.imageAltRu),
    image_alt_en: mergeField(edit.image_alt_en, staticItem.image_alt_en ?? staticItem.imageAltEn),
    name_az: mergeField(edit.name_az, staticItem.name_az ?? staticItem.nameAz),
    name_ru: mergeField(edit.name_ru, staticItem.name_ru ?? staticItem.nameRu),
    name_en: mergeField(edit.name_en, staticItem.name_en ?? staticItem.nameEn),
    name_tr: mergeField(edit.name_tr, staticItem.name_tr ?? staticItem.nameTr),
    desc_az: mergeField(edit.desc_az, staticItem.desc_az ?? staticItem.descAz),
    desc_ru: mergeField(edit.desc_ru, staticItem.desc_ru ?? staticItem.descRu),
    desc_en: mergeField(edit.desc_en, staticItem.desc_en ?? staticItem.descEn),
    desc_tr: mergeField(edit.desc_tr, staticItem.desc_tr ?? staticItem.descTr),
    is_active: mergeField(edit.is_active, staticItem.is_active ?? staticItem.isActive),
  }
}

/** Count total edits for UI */
export function getEditCount(): number {
  return Object.keys(getAllEdits()).length
}

/** Clear all local edits */
export function clearEdits() {
  try {
    invalidateCache()
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* Safari private mode */ }
}

/* ═══════════════════════════════════════════════
   CATEGORY-LEVEL SETTINGS (qr_layout_mode)
   Stored as: tab::CATLAYOUT::catTitle
   ═══════════════════════════════════════════════ */

function catLayoutKey(tab: TabType, catTitle: string): string {
  return `${tab}::CATLAYOUT::${catTitle}`;
}

/** Get QR layout mode for a category
 *  DB is source of truth, localStorage is cache */
export function getCategoryLayout(tab: TabType, catTitle: string): QrLayoutMode {
  // 1. Try DB (settings) first
  try {
    const dbLayouts = JSON.parse(sessionStorage.getItem("CATLAYOUT_DB") || "{}");
    const dbKey = catLayoutKey(tab, catTitle);
    const dbVal = dbLayouts[dbKey];
    if (dbVal === "card" || dbVal === "list" || dbVal === "auto") return dbVal;
  } catch { /* ignore */ }

  // 2. Fallback to localStorage
  const all = getLocalEdits();
  const key = catLayoutKey(tab, catTitle);
  const val = all[key]?.qr_layout_mode;
  if (val === "card" || val === "list") return val;
  return "auto";
}

/** Save QR layout mode for a category to DB + localStorage */
export function setCategoryLayout(tab: TabType, catTitle: string, mode: QrLayoutMode) {
  invalidateCache();
  const all = getLocalEdits();
  const key = catLayoutKey(tab, catTitle);
  if (!all[key]) all[key] = {};
  (all[key] as MenuEdit).qr_layout_mode = mode;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  invalidateCache();
}

/** Load category layouts from DB settings into sessionStorage cache */
export function syncCategoryLayoutsFromDB(settings: Record<string, string>) {
  try {
    const dbLayouts: Record<string, string> = {};
    for (const [key, val] of Object.entries(settings)) {
      if (key.startsWith("CATLAYOUT::")) {
        dbLayouts[key] = val;
      }
    }
    sessionStorage.setItem("CATLAYOUT_DB", JSON.stringify(dbLayouts));
  } catch { /* Safari private mode */ }
}

/** Get the settings key for a category layout */
export function getCategoryLayoutSettingKey(tab: TabType, catTitle: string): string {
  return `CATLAYOUT::${tab}::${catTitle}`;
}

/** Determine effective layout: "card" or "list" (auto resolved) */
export function getEffectiveLayout(
  tab: TabType,
  catTitle: string,
  items: { image_url?: string; imageUrl?: string; is_active?: boolean }[]
): "card" | "list" {
  const mode = getCategoryLayout(tab, catTitle);
  if (mode === "card") return "card";
  if (mode === "list") return "list";
  // Auto: count items with images
  const total = items.length || 1;
  const withImg = items.filter((it) => {
    const img = it.image_url || it.imageUrl;
    return img && img.trim() !== "";
  }).length;
  return withImg >= total / 2 ? "card" : "list";
}

/** Collect ALL product data: static + localStorage → comprehensive seed */
function collectAllProductEdits(): Record<string, MenuEdit> {
  const result: Record<string, MenuEdit> = {};

  // Start with static data for all products
  const allTabs: TabType[] = ["food", "beverage", "shisha"];
  for (const tab of allTabs) {
    const cats = staticDataMap[tab];
    if (!cats) continue;
    for (const cat of cats) {
      const catTitle = cat.title_az || cat.titleAz || "";
      for (const item of cat.items || []) {
        const itemNameAz = item.name_az || item.nameAz || "";
        if (!itemNameAz) continue;
        const key = itemKey(tab, catTitle, itemNameAz);
        const edit: MenuEdit = {};
        // Only include fields that have non-default values
        if (item.image_url || item.imageUrl) edit.image_url = item.image_url || item.imageUrl;
        if (item.is_new || item.isNew) edit.is_new = true;
        if (item.is_meat || item.isMeat) edit.is_meat = true;
        if (item.is_fish || item.isFish) edit.is_fish = true;
        if (item.is_vegetarian || item.isVegetarian) edit.is_vegetarian = true;
        if (item.is_halal || item.isHalal) edit.is_halal = true;
        if (item.is_spicy || item.isSpicy) edit.is_spicy = true;
        if (item.is_snack || item.isSnack) edit.is_snack = true;
        if (item.price) edit.price = item.price;
        if (item.desc_az || item.descAz) edit.desc_az = item.desc_az || item.descAz;
        if (item.desc_ru || item.descRu) edit.desc_ru = item.desc_ru || item.descRu;
        if (item.desc_en || item.descEn) edit.desc_en = item.desc_en || item.descEn;
        if (item.desc_tr || item.descTr) edit.desc_tr = item.desc_tr || item.descTr;
        if (Object.keys(edit).length > 0) {
          result[key] = edit;
        }
      }
    }
  }

  // Overlay localStorage edits (they take priority)
  const local = getLocalEdits();
  Object.entries(local).forEach(([key, value]) => {
    if (!key.includes("::BRANCH::")) {
      result[key] = { ...result[key], ...(value as MenuEdit) };
    }
  });

  return result;
}

function collectAllBranchEdits(): Record<string, BranchItemEdit> {
  const result: Record<string, BranchItemEdit> = {};
  // Start with deployed seed
  Object.entries(DEPLOYED_BRANCH_EDITS).forEach(([key, val]) => {
    result[key] = val;
  });
  // Overlay localStorage
  const local = getLocalEdits();
  Object.entries(local).forEach(([key, value]) => {
    if (key.includes("::BRANCH::")) {
      result[key] = value as unknown as BranchItemEdit;
    }
  });
  return result;
}

/* ═══════════════════════════════════════════════
   ADD NEW ITEMS (admin-created products)
   Pushed DIRECTLY into alacarteData/beverageData
   so ALL consumers see them immediately.
   ═══════════════════════════════════════════════ */

const NEW_ITEMS_KEY = "xurcun_new_items";

/** Get the raw data array for a tab — uses centralised getTargetArray */
function getRawData(tab: TabType) {
  return getTargetArray(tab);
}

export function addNewItem(tab: TabType, catTitle: string, item: {
  name_az: string; name_en: string; name_tr: string; name_ru: string;
  desc_az?: string; desc_en?: string; desc_tr?: string; desc_ru?: string;
  price: string; is_available?: boolean; badges?: string[];
}) {
  const data = getRawData(tab);
  const cat = data.find((c: any) => c.title_az === catTitle);
  if (!cat) return;
  if (!cat.items) cat.items = [];
  cat.items.push(item as any);
  /* Also persist to localStorage for page reloads */
  try {
    const all: Record<string, any[]> = JSON.parse(localStorage.getItem(NEW_ITEMS_KEY) || "{}")
    const key = `${tab}::${catTitle}`;
    if (!all[key]) all[key] = [];
    all[key].push(item);
    localStorage.setItem(NEW_ITEMS_KEY, JSON.stringify(all));
  } catch { /* Safari private mode */ }
  invalidateCache();
}

export function deleteNewItem(tab: TabType, catTitle: string, itemNameAz: string) {
  const data = getRawData(tab);
  const cat = data.find((c: any) => c.title_az === catTitle);
  if (cat && cat.items) {
    cat.items = cat.items.filter((i: any) => i.name_az !== itemNameAz);
  }
  try {
    const all: Record<string, any[]> = JSON.parse(localStorage.getItem(NEW_ITEMS_KEY) || "{}")
    const key = `${tab}::${catTitle}`;
    if (all[key]) {
      all[key] = all[key].filter(i => i.name_az !== itemNameAz);
      if (all[key].length === 0) delete all[key];
      localStorage.setItem(NEW_ITEMS_KEY, JSON.stringify(all));
    }
  } catch { /* Safari private mode */ }
  invalidateCache();
}

/** Restore admin-created items from localStorage on app load */
export function restoreNewItems() {
  try {
    const all: Record<string, any[]> = JSON.parse(localStorage.getItem(NEW_ITEMS_KEY) || "{}")
    Object.entries(all).forEach(([key, items]) => {
      const [tab, catTitle] = key.split("::");
      const data = getTargetArray(tab);
      const cat = data.find((c: any) => c.title_az === catTitle);
      if (cat) {
        if (!cat.items) cat.items = [];
        /* Only add items not already present */
        items.forEach((item: any) => {
          if (!cat.items!.some((i: any) => i.name_az === item.name_az)) {
            cat.items!.push(item);
          }
        });
      }
    });
  } catch { /* ignore */ }
}

/** mergeNewItems is now a no-op — data is already in the source arrays */
export function mergeNewItems(_tab: TabType, categories: any[]): any[] {
  return categories;
}

/* ═══════════════════════════════════════════════
   ADD NEW CATEGORIES (admin-created categories)
   Pushed DIRECTLY into alacarteData/beverageData
   ═══════════════════════════════════════════════ */

const NEW_CATEGORIES_KEY = "xurcun_new_categories";

export function addNewCategory(tab: TabType, name: string, titles?: { title_az: string; title_en: string; title_tr: string; title_ru: string }) {
  const target = getTargetArray(tab);
  if (!target) return false;
  /* Don't duplicate */
  if (target.some((c: any) => c.title_az === name)) return false;
  const newCat = {
    title_az: titles?.title_az || name,
    title_en: titles?.title_en || name,
    title_tr: titles?.title_tr || name,
    title_ru: titles?.title_ru || name,
    items: [] as any[],
  };
  target.push(newCat as any);
  /* Persist to localStorage for page reloads */
  try {
    const all: Record<string, any[]> = JSON.parse(localStorage.getItem(NEW_CATEGORIES_KEY) || "{}");
    const key = tab;
    if (!all[key]) all[key] = [];
    all[key].push(newCat);
    localStorage.setItem(NEW_CATEGORIES_KEY, JSON.stringify(all));
  } catch { /* Safari private mode */ }
  invalidateCache();
  return true;
}

export function deleteNewCategory(tab: TabType, catTitle: string, catId?: string) {
  const target = getTargetArray(tab);
  if (!target) return false;
  /* Try ID-based lookup first (if catId provided), fallback to title */
  const idx = catId
    ? target.findIndex((c: any) => c.id === catId)
    : target.findIndex((c: any) => c.title_az === catTitle);
  if (idx < 0) return false;
  target.splice(idx, 1);
  /* Remove from localStorage */
  try {
    const all: Record<string, any[]> = JSON.parse(localStorage.getItem(NEW_CATEGORIES_KEY) || "{}");
    const key = tab;
    if (all[key]) {
      all[key] = all[key].filter((c: any) => c.title_az !== catTitle);
      if (all[key].length === 0) delete all[key];
      localStorage.setItem(NEW_CATEGORIES_KEY, JSON.stringify(all));
    }
    /* Also remove any products that were in this category */
    const itemsAll: Record<string, any[]> = JSON.parse(localStorage.getItem(NEW_ITEMS_KEY) || "{}");
    const itemKey = `${tab}::${catTitle}`;
    if (itemsAll[itemKey]) {
      delete itemsAll[itemKey];
      localStorage.setItem(NEW_ITEMS_KEY, JSON.stringify(itemsAll));
    }
  } catch { /* Safari private mode */ }
  invalidateCache();
  return true;
}

/** Restore admin-created categories from localStorage on app load */
export function restoreNewCategories() {
  try {
    const all: Record<string, any[]> = JSON.parse(localStorage.getItem(NEW_CATEGORIES_KEY) || "{}");
    Object.entries(all).forEach(([tabKey, categories]) => {
      const target = getTargetArray(tabKey);
      if (!target) return;
      categories.forEach((cat: any) => {
        if (!target.some((c: any) => c.title_az === cat.title_az)) {
          target.push({ ...cat, items: cat.items || [] });
        }
      });
    });
  } catch { /* ignore */ }
}

/* ═══════════════════════════════════════════════
   EDIT CATEGORY NAMES (admin-edited category titles)
   Stored per tab::oldTitle → { title_az, title_en, title_tr, title_ru }
   Also migrates all localStorage keys that reference the old title.
   ═══════════════════════════════════════════════ */

const CATEGORY_EDITS_KEY = "xurcun_category_edits";

/** Migrate all localStorage keys that reference oldCatTitle to newCatTitle */
function migrateEditKeys(tab: TabType, oldCatTitle: string, newCatTitle: string) {
  try {
    const all = getLocalEdits();
    let changed = false;
    const newAll: Record<string, any> = {};

    Object.entries(all).forEach(([key, value]) => {
      /* Pattern: tab::catTitle::itemName  OR  tab::BRANCH::*::catTitle::itemName  OR  tab::CATLAYOUT::catTitle */
      const parts = key.split("::");
      if (parts[0] !== tab) {
        newAll[key] = value;
        return;
      }
      if (parts.length >= 3 && parts[1] === oldCatTitle) {
        /* Item edit: tab::catTitle::itemNameAz */
        parts[1] = newCatTitle;
        newAll[parts.join("::")] = value;
        changed = true;
      } else if (parts.length >= 5 && parts[1] === "BRANCH" && parts[3] === oldCatTitle) {
        /* Branch edit: tab::BRANCH::slug::catTitle::itemNameAz */
        parts[3] = newCatTitle;
        newAll[parts.join("::")] = value;
        changed = true;
      } else if (parts.length === 3 && parts[1] === "CATLAYOUT" && parts[2] === oldCatTitle) {
        /* Category layout: tab::CATLAYOUT::catTitle */
        parts[2] = newCatTitle;
        newAll[parts.join("::")] = value;
        changed = true;
      } else {
        newAll[key] = value;
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAll));
      invalidateCache();
    }
  } catch { /* Safari private mode */ }
}

/** Edit category by its permanent ID. Titles can change — IDs never do. */
export function editCategoryName(tab: TabType, catId: string, titles: { title_az: string; title_en: string; title_tr: string; title_ru: string }) {
  const target = getTargetArray(tab);
  if (!target) return false;

  /* ═══ FIND BY PERMANENT ID — NEVER by title ═══ */
  const cat = target.find((c: any) => c.id === catId);
  if (!cat) {
    console.error(`[editCategoryName] Category not found: id="${catId}" in ${tab}`);
    return false;
  }

  /* Don't duplicate title */
  if (titles.title_az !== cat.title_az && target.some((c: any) => c.title_az === titles.title_az && c !== cat)) return false;

  const oldTitle = cat.title_az;

  /* Update category in live data */
  cat.title_az = titles.title_az;
  cat.title_en = titles.title_en;
  cat.title_tr = titles.title_tr;
  cat.title_ru = titles.title_ru;
  (cat as any).titleAz = titles.title_az;
  (cat as any).titleEn = titles.title_en;
  (cat as any).titleTr = titles.title_tr;
  (cat as any).titleRu = titles.title_ru;

  /* Persist by ID — titles can change, IDs never do */
  try {
    const all: Record<string, Record<string, any>> = JSON.parse(localStorage.getItem(CATEGORY_EDITS_KEY) || "{}");
    all[`${tab}::${catId}`] = { ...titles, _id: catId };
    localStorage.setItem(CATEGORY_EDITS_KEY, JSON.stringify(all));
  } catch { /* Safari private mode */ }

  /* Migrate product/branch localStorage keys that reference the old title */
  if (titles.title_az !== oldTitle) {
    migrateEditKeys(tab, oldTitle, titles.title_az);
  }

  invalidateCache();
  return true;
}

/** Restore category edits on app load. Matches by permanent ID. */
export function restoreCategoryEdits() {
  try {
    const all: Record<string, Record<string, any>> = JSON.parse(localStorage.getItem(CATEGORY_EDITS_KEY) || "{}");
    Object.entries(all).forEach(([key, titles]) => {
      const [tab, catId] = key.split("::");
      const target = getTargetArray(tab);
      if (!target) return;
      /* Find by PERMANENT ID */
      const cat = target.find((c: any) => c.id === catId);
      if (cat) {
        cat.title_az = titles.title_az;
        cat.title_en = titles.title_en;
        cat.title_tr = titles.title_tr;
        cat.title_ru = titles.title_ru;
        (cat as any).titleAz = titles.title_az;
        (cat as any).titleEn = titles.title_en;
        (cat as any).titleTr = titles.title_tr;
        (cat as any).titleRu = titles.title_ru;
      }
    });
  } catch (err) { console.error("[restoreCategoryEdits]", err); }
}

/** Export ALL product data (static + localStorage) as TypeScript seed code */
export function exportSeedCode(): string {
  const itemEdits = collectAllProductEdits();
  const branchEdits = collectAllBranchEdits();

  if (Object.keys(itemEdits).length === 0 && Object.keys(branchEdits).length === 0) {
    return "// No data to export.";
  }

  const itemJson = JSON.stringify(itemEdits, null, 2);
  const branchJson = JSON.stringify(branchEdits, null, 2);

  return `import type { MenuEdit, BranchItemEdit } from "./menuStore";

export const DEPLOYED_EDITS: Record<string, MenuEdit> = ${itemJson};

export const DEPLOYED_BRANCH_EDITS: Record<string, BranchItemEdit> = ${branchJson};
`;
}
