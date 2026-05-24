/* ═══════════════════════════════════════════
   PRINT UTILITY FUNCTIONS
   Memoized calculations for print preview.
   ═══════════════════════════════════════════ */

import type { PrintLang } from "./printConfig";
import { getZoneForCategory, getCatNumber } from "./printConfig";
import { getItemEdits, getBranchItemEdit, isItemAvailableAtBranch } from "./menuStore";
import { getCategoryTitle, getItemName, getItemDesc } from "./menuData";

/* ─── Simple LRU cache for expensive computations ─── */
class LruCache<K, V> {
  private map = new Map<K, V>();
  constructor(private max: number) {}
  get(k: K): V | undefined { return this.map.get(k); }
  set(k: K, v: V) {
    if (this.map.size >= this.max && !this.map.has(k)) {
      this.map.delete(this.map.keys().next().value);
    }
    this.map.set(k, v);
  }
  clear() { this.map.clear(); }
}

/* ─── Cache key builder ─── */
function cacheKey(parts: (string | number | undefined)[]) {
  return parts.filter(Boolean).join("|");
}

/* ─── Cached translation resolvers ─── */
const nameCache = new LruCache<string, string>(200);
const descCache = new LruCache<string, string | undefined>(200);
const catTitleCache = new LruCache<string, string>(50);
const zoneCache = new LruCache<string, number>(50);

export function resolveItemNameCached(item: any, lang: PrintLang): string {
  const key = cacheKey([lang, item?.name_az, item?.name_tr, item?.name_en]);
  const cached = nameCache.get(key);
  if (cached !== undefined) return cached;
  const result = getItemName(item, lang);
  nameCache.set(key, result);
  return result;
}

export function resolveItemDescCached(item: any, lang: PrintLang): string | undefined {
  const key = cacheKey([lang, item?.desc_az, item?.desc_tr, item?.desc_en]);
  const cached = descCache.get(key);
  if (cached !== undefined) return cached;
  const result = getItemDesc(item, lang);
  descCache.set(key, result);
  return result;
}

export function resolveCatTitleCached(cat: any, lang: PrintLang): string {
  const key = cacheKey([lang, cat?.title_az, cat?.title_tr, cat?.title_en]);
  const cached = catTitleCache.get(key);
  if (cached !== undefined) return cached;
  const result = getCategoryTitle(cat, lang);
  catTitleCache.set(key, result);
  return result;
}

export function getZoneCached(titleAz: string | undefined): number {
  const key = titleAz || "";
  const cached = zoneCache.get(key);
  if (cached !== undefined) return cached;
  const result = getZoneForCategory(titleAz);
  zoneCache.set(key, result);
  return result;
}

/* ─── Processed item type ─── */
export interface PrintItem {
  name: string;
  desc?: string;
  price: string;
  badges: string[];
  is_new: boolean;
}

export interface PrintCategory {
  title: string;
  number: number;
  zone: number;
  items: PrintItem[];
}

/* ─── Process categories into print-ready groups ─── */
export function processCategories(
  cats: any[],
  lang: PrintLang,
  branchSlug: string,
  menuType: string,
): PrintCategory[] {
  return cats.map((cat) => {
    const title = resolveCatTitleCached(cat, lang);
    const zone = getZoneCached(cat.title_az);
    const number = getCatNumber(cats, cat.title_az);

    const items: PrintItem[] = (cat.items || [])
      .filter((it: any) => it && it.name_az)
      .map((it: any) => {
        const name = resolveItemNameCached(it, lang);
        const desc = resolveItemDescCached(it, lang);
        const badges = extractBadges(it, cat.title_az, menuType);
        const price = resolvePrice(it, branchSlug, menuType);

        return { name, desc, price, badges, is_new: it.is_new || false };
      });

    return { title, number, zone, items };
  });
}

/* ─── Extract visible badges for print ─── */
function extractBadges(item: any, catTitle: string, menuType: string): string[] {
  const badges: string[] = [];
  if (item.is_new) badges.push("new");
  if (item.is_meat) badges.push("meat");
  if (item.is_fish) badges.push("fish");
  if (item.is_vegetarian) badges.push("veg");
  if (item.is_halal) badges.push("halal");
  if (item.is_spicy) badges.push("spicy");
  return badges;
}

/* ─── Resolve price with branch override ─── */
function resolvePrice(item: any, branchSlug: string, menuType: string): string {
  if (!item) return "-";
  const branchEdit = getBranchItemEdit(
    menuType as any,
    branchSlug,
    item.categoryTitle || "",
    item.name_az || ""
  );
  if (branchEdit?.branch_price) return branchEdit.branch_price;
  return item.price || "-";
}

/* ─── Group categories by zone ─── */
export function groupByZone(categories: PrintCategory[]): Record<number, PrintCategory[]> {
  const groups: Record<number, PrintCategory[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const cat of categories) {
    const z = cat.zone || 3;
    if (!groups[z]) groups[z] = [];
    groups[z].push(cat);
  }
  return groups;
}
