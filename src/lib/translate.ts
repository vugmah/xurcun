/* ─── Free AI Translation — MyMemory API + Local Dictionary Fallback
   No key required. Rate limit: ~1000 words/day per IP.
   Language codes: az=Azerbaijani, en=English, tr=Turkish, ru=Russian
   ═══════════════════════════════════════════════════════════════════ */

const MYMEMORY = "https://api.mymemory.translated.net/get";

/** Detect probable language from text (very simple heuristic) */
function detectLang(text: string): string {
  const t = text.trim().toLowerCase();
  if (/[əğıöüçş]/i.test(t)) return "az";
  if (/[ёъыэ]/i.test(t)) return "ru";
  if (/[çğışöü]/i.test(t) && /(ve|icin|ile|bir)/i.test(t)) return "tr";
  return "en"; /* default to English */
}

/** Single translation via MyMemory */
async function translateOne(text: string, source: string, target: string): Promise<string> {
  if (!text.trim()) return "";
  if (source === target) return text;
  /* ─── 1. Local dictionary lookup (instant, offline) ─── */
  const dictResult = localDictLookup(text, source, target);
  if (dictResult) return dictResult;
  /* ─── 2. MyMemory API (online, free) ─── */
  try {
    const res = await fetch(`${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=${source}|${target}`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    if (data?.responseData?.translatedText && !data.responseData.translatedText.includes("MYMEMORY")) {
      return data.responseData.translatedText;
    }
  } catch { /* network error / timeout */ }
  /* ─── 3. Return empty — NEVER duplicate source text ─── */
  return "";
}

/** Translate text to all 4 languages */
export async function translateAll(text: string): Promise<{
  az: string; en: string; tr: string; ru: string;
  source: string;
}> {
  if (!text.trim()) return { az: "", en: "", tr: "", ru: "", source: "en" };

  const source = detectLang(text);
  const targets = ["az", "en", "tr", "ru"].filter(l => l !== source);

  /* Translate to each target language in parallel */
  const results = await Promise.all(
    targets.map(async (target) => ({
      lang: target,
      text: await translateOne(text, source, target),
    }))
  );

  const out: Record<string, string> = { [source]: text };
  results.forEach(r => { out[r.lang] = r.text; });

  return {
    az: out["az"] || "",
    en: out["en"] || "",
    tr: out["tr"] || "",
    ru: out["ru"] || "",
    source,
  };
}

/** Batch translate: name + description together */
export async function translateProduct(name: string, desc: string): Promise<{
  name: { az: string; en: string; tr: string; ru: string; source: string };
  desc: { az: string; en: string; tr: string; ru: string; source: string };
}> {
  const [nameT, descT] = await Promise.all([translateAll(name), translateAll(desc)]);
  return {
    name: { az: nameT.az, en: nameT.en, tr: nameT.tr, ru: nameT.ru, source: nameT.source },
    desc: { az: descT.az, en: descT.en, tr: descT.tr, ru: descT.ru, source: descT.source },
  };
}

/* ════════════════════════════════════════════════════════════════
   LOCAL DICTIONARY — Restaurant/Food terms (offline fallback)
   ════════════════════════════════════════════════════════════════ */

/** Category names */
const CAT_DICT: Record<string, Record<string, string>> = {
  "səhər yeməyi":    { en: "Breakfast",    tr: "Kahvaltı",       ru: "Завтрак" },
  "şorbalar":        { en: "Soups",        tr: "Çorbalar",       ru: "Супы" },
  "salatlar":        { en: "Salads",       tr: "Salatalar",      ru: "Салаты" },
  "başlanğıclar":    { en: "Appetizers",   tr: "Başlangıçlar",   ru: "Закуски" },
  "əsas yeməklər":   { en: "Main Courses", tr: "Ana Yemekler",   ru: "Основные блюда" },
  "qarnirlər":       { en: "Sides",        tr: "Garnitürler",    ru: "Гарниры" },
  "pasta & rizotto": { en: "Pasta & Risotto", tr: "Makarna & Risotto", ru: "Паста и Ризотто" },
  "şirniyyatlar":    { en: "Desserts",     tr: "Tatlılar",       ru: "Десерты" },
  "imza kokteyllər":  { en: "Signature Cocktails", tr: "İmza Kokteyller", ru: "Фирменные коктейли" },
  "klassik kokteyllər":{en: "Classic Cocktails",   tr: "Klasik Kokteyller", ru: "Классические коктейли" },
  "imza mokteyllər":  { en: "Signature Mocktails", tr: "İmza Mocktailler", ru: "Фирменные моктейли" },
  "pivə":            { en: "Beer",         tr: "Bira",           ru: "Пиво" },
  "şampan":          { en: "Champagne",    tr: "Şampanya",       ru: "Шампанское" },
  "ağ və roze şərab":{ en: "White & Rosé Wine", tr: "Beyaz & Rosé Şarap", ru: "Белое и Розовое вино" },
  "qırmızı şərab":   { en: "Red Wine",     tr: "Kırmızı Şarap",  ru: "Красное вино" },
  "whisky":          { en: "Whisky",       tr: "Viski",          ru: "Виски" },
  "kokteyllər":      { en: "Cocktails",    tr: "Kokteyller",     ru: "Коктейли" },
  "sıcaq içkilər":   { en: "Hot Beverages",tr: "Sıcak İçecekler",ru: "Горячие напитки" },
  "mocktaillər":     { en: "Mocktails",    tr: "Mocktailler",    ru: "Моктейли" },
  "qəlyan":          { en: "Hookah",       tr: "Nargile",        ru: "Кальян" },
};

/** Food product names (common items) */
const FOOD_DICT: Record<string, Record<string, string>> = {
  "qoz": { en: "Walnut", tr: "Ceviz", ru: "Грецкий орех" },
  "pendir": { en: "Cheese", tr: "Peynir", ru: "Сыр" },
  "toyuq": { en: "Chicken", tr: "Tavuk", ru: "Курица" },
  "quzu": { en: "Lamb", tr: "Kuzu", ru: "Баранина" },
  "mal əti": { en: "Beef", tr: "Dana eti", ru: "Говядина" },
  "balıq": { en: "Fish", tr: "Balık", ru: "Рыба" },
  "qızıl balıq": { en: "Salmon", tr: "Somon", ru: "Лосось" },
  "krevet": { en: "Prawn", tr: "Karides", ru: "Креветка" },
  "dondurma": { en: "Ice cream", tr: "Dondurma", ru: "Мороженое" },
  "şokolad": { en: "Chocolate", tr: "Çikolata", ru: "Шоколад" },
  "meyvə": { en: "Fruit", tr: "Meyve", ru: "Фрукты" },
  "tərəvəz": { en: "Vegetable", tr: "Sebze", ru: "Овощи" },
  "salat": { en: "Salad", tr: "Salata", ru: "Салат" },
  "şorba": { en: "Soup", tr: "Çorba", ru: "Суп" },
  "kartof": { en: "Potato", tr: "Patates", ru: "Картофель" },
  "düyü": { en: "Rice", tr: "Pirinç", ru: "Рис" },
  "pasta": { en: "Pasta", tr: "Makarna", ru: "Паста" },
  "qəlyan cihazları": { en: "Hookah Devices", tr: "Nargile Cihazları", ru: "Кальян устройства" },
};

/** Look up a term in the local dictionary. Returns null if not found. */
function localDictLookup(text: string, _source: string, target: string): string | null {
  const key = text.trim().toLowerCase().replace(/\s+/g, " ").trim();
  if (!key) return null;

  /* Try category dictionary first */
  const catEntry = CAT_DICT[key];
  if (catEntry && catEntry[target]) return catEntry[target];

  /* Try food dictionary */
  const foodEntry = FOOD_DICT[key];
  if (foodEntry && foodEntry[target]) return foodEntry[target];

  /* Try stripping common suffixes and re-lookup */
  const baseKey = key.replace(/lar$/, "").replace(/lər$/, "").trim();
  if (baseKey !== key && baseKey.length > 2) {
    const baseCat = CAT_DICT[baseKey];
    if (baseCat && baseCat[target]) return baseCat[target];
    const baseFood = FOOD_DICT[baseKey];
    if (baseFood && baseFood[target]) return baseFood[target];
  }

  return null;
}

/** Check if a translation looks like a fallback (identical to source or empty) */
function isBadTranslation(original: string, translated: string): boolean {
  if (!translated || translated.trim() === "") return true;
  if (translated.trim().toLowerCase() === original.trim().toLowerCase()) return true;
  if (translated.includes("MYMEMORY")) return true;
  return false;
}

/* ════════════════════════════════════════════════════════════════
   SMART FILL — auto-translate ONLY empty fields, preserve manual
   ════════════════════════════════════════════════════════════════ */

export interface TranslationFields {
  az: string; en: string; tr: string; ru: string;
}

/** Fill only empty (or identical-to-source) fields with translations.
 *  Preserves any manually-edited values. */
export async function smartFill(
  source: string,
  current: TranslationFields
): Promise<TranslationFields> {
  if (!source.trim()) return current;

  const out = { ...current };
  const srcLower = source.trim().toLowerCase();

  const enEmpty = !out.en || out.en.trim() === "" || out.en.trim().toLowerCase() === srcLower;
  const trEmpty = !out.tr || out.tr.trim() === "" || out.tr.trim().toLowerCase() === srcLower;
  const ruEmpty = !out.ru || out.ru.trim() === "" || out.ru.trim().toLowerCase() === srcLower;

  /* If all fields are already manually filled and different from source, skip */
  if (!enEmpty && !trEmpty && !ruEmpty) return out;

  /* Translate via API + dictionary */
  const t = await translateAll(source);

  if (enEmpty && t.en && !isBadTranslation(source, t.en)) out.en = t.en;
  if (trEmpty && t.tr && !isBadTranslation(source, t.tr)) out.tr = t.tr;
  if (ruEmpty && t.ru && !isBadTranslation(source, t.ru)) out.ru = t.ru;

  /* Set AZ from source if empty */
  if (!out.az || out.az.trim() === "") out.az = source;

  return out;
}

/** Smart fill for product (name + description) */
export async function smartFillProduct(
  sourceName: string,
  sourceDesc: string,
  currentName: TranslationFields,
  currentDesc: TranslationFields
): Promise<{
  name: TranslationFields;
  desc: TranslationFields;
}> {
  const [nameFilled, descFilled] = await Promise.all([
    smartFill(sourceName, currentName),
    smartFill(sourceDesc, currentDesc),
  ]);
  return { name: nameFilled, desc: descFilled };
}
