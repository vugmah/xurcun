/* ═══════════════════════════════════════════
   PRINT TEMPLATE CONFIGURATION
   All template constants in one place.
   Changes here affect both preview and PDF.
   ═══════════════════════════════════════════ */

export type PrintLang = "az" | "tr" | "ru" | "en";
export type PrintPaper = "a4" | "a3";
export type PrintOrient = "portrait" | "landscape";
export type PrintMenuType = "food" | "beverage" | "snack-shisha";

export const BRANCHES = [
  { slug: "white-city", label: "Xurcun White City", qrUrl: "" },
  { slug: "seabreeze-marina", label: "Xurcun Seabreeze", qrUrl: "" },
] as const;

/* ─── Paper dimensions (mm) ─── */
export const PAPER_SIZES: Record<PrintPaper, { w: number; h: number }> = {
  a3: { w: 420, h: 297 },
  a4: { w: 297, h: 210 },
};

export function getPaperDims(paper: PrintPaper, orient: PrintOrient) {
  const base = PAPER_SIZES[paper];
  return orient === "landscape"
    ? { w: Math.max(base.w, base.h), h: Math.min(base.w, base.h) }
    : { w: Math.min(base.w, base.h), h: Math.max(base.w, base.h) };
}

/* ─── Zone layout configuration ───
   4-column grid for landscape:
   Zone 1: Breakfast (left, framed)
   Zone 2: Soups + Appetizers
   Zone 3: Salads + Pasta + Desserts
   Zone 4: Mains + Sides + QR
   */
export const ZONE_COLUMNS = ["24%", "19%", "23%", "30%"];

/* ─── Zone mapping by category title keywords ───
   Food zones: 1=Breakfast, 2=Soups/Appetizers, 3=Salads/Pasta/Desserts, 4=Mains/Sides
   Beverage zones: 10=Col1 Cocktails, 20=Col2 Wine, 30=Col3 Spirits, 40=Col4 Misc, 50=Bottom Coffee/Tea
   */
export function getZoneForCategory(titleAz: string | undefined): number {
  const t = (titleAz || "").toUpperCase();
  if (t.includes("SƏHƏR") || t.includes("BREAKFAST") || t.includes("KAHVALTI")) return 1;
  if (t.includes("ŞORBA") || t.includes("BAŞLANĞIC")) return 2;
  if (t.includes("SALAT") || t.includes("PASTA") || t.includes("RİZOTTO") || t.includes("ŞİRN")) return 3;
  if (t.includes("ƏSAS") || t.includes("QARNAİR") || t.includes("ƏLAVƏ") || t.includes("SIDES") || t.includes("QARN")) return 4;
  return 3; // fallback
}

/* ─── Beverage zone mapping: 19 drink categories across 4 columns (exact food menu layout)
   Column 1 (zone 10): Cocktails + Mocktails + Beer
   Column 2 (zone 20): Champagne + Wine
   Column 3 (zone 30): Spirits (Vodka/Gin/Tequila/Rum/Whisky)
   Column 4 (zone 40): Cognac + Liqueur + Soft + Juices + Mineral + Coffee + Tea
   ═══════════════════════════════════════════════════════════════════════════════════════ */
export function getBeverageZoneForCategory(titleAz: string | undefined): number {
  const t = (titleAz || "").toUpperCase();
  // Column 1: Cocktails + Mocktails + Beer
  if (t.includes("KOKTEYL") || t.includes("MOKTEYL") || t.includes("PİVƏ") || t.includes("BEER")) return 10;
  // Column 2: Champagne + Wine
  if (t.includes("ŞAMPAN") || t.includes("ŞƏRAB") || t.includes("WINE") || t.includes("CHAMPAGNE")) return 20;
  // Column 3: Spirits
  if (t.includes("VODKA") || t.includes("CİN") || t.includes("GIN") || t.includes("TEKİLA") || t.includes("TEQUILA") || t.includes("ROM") || t.includes("RUM") || t.includes("VİSKİ") || t.includes("WHISK")) return 30;
  // Column 4: Everything else (Cognac, Liqueur, Soft Drinks, Juices, Mineral Water, Coffee, Tea)
  return 40;
}

/* ─── Category number based on alacarteData order ─── */
export function getCatNumber(allCats: { title_az?: string }[], titleAz: string | undefined): number {
  if (!titleAz || !allCats) return 0;
  return allCats.findIndex((c) => c?.title_az === titleAz) + 1;
}

/* ─── Translation texts ─── */
export const TX: Record<PrintLang, Record<string, string>> = {
  az: {
    pageTitle: "Çap Önbaxış", branch: "Filial", type: "Menyu", paper: "Kağız",
    orient: "İstiqamət", lang: "Dil", pdf: "PDF Yüklə", pdfPreparing: "Hazırlanır...",
    back: "Geri", typeFood: "A La Carte", typeBev: "İçkilər", typeSS: "Snack + Qəlyan",
    a4: "A4", a3: "A3", port: "Şaquli", land: "Üfüqi",
    breakfast: "SƏHƏR YEMƏYİ", breakfastSub: "SƏHƏR LƏZZƏTLƏRİ",
    breakfastNote: "Hər səhər təzə hazırlanır",
    teaNote: "Bütün Səhər Yeməkləri ilə stəkan çay hədiyyə olunur",
    scanQr: "SCAN FOR PHOTO MENU",
    serviceNote: "QEYD: 10% xidmət haqqı hesabınıza əlavə olunacaq.",
    allergenNote: "Zəhmət olmasa, qida allergiyası ilə bağlı məlumat üçün personalımıza müraciət edin.",
    shishaNote: "Üstünlük verdiyiniz tütün menyuda qeyd olunmayıbsa, qəlyançımıza müraciət edə bilərsiniz.",
    loading: "Hazırlanır...",
  },
  tr: {
    pageTitle: "Baskı Önizleme", branch: "Şube", type: "Menü", paper: "Kağıt",
    orient: "Yönlendirme", lang: "Dil", pdf: "PDF İndir", pdfPreparing: "Hazırlanıyor...",
    back: "Geri", typeFood: "A La Carte", typeBev: "İçecekler", typeSS: "Snack + Nargile",
    a4: "A4", a3: "A3", port: "Dikey", land: "Yatay",
    breakfast: "KAHVALTI", breakfastSub: "KAHVALTI LEZZETLERİ",
    breakfastNote: "Her sabah taze hazırlanır",
    teaNote: "Bütün kahvaltı yemekleri ile birlikte bir fincan çay ikram edilir",
    scanQr: "SCAN FOR PHOTO MENU",
    serviceNote: "NOT: Hesabınıza %10 servis ücreti eklenecektir.",
    allergenNote: "Lütfen, gıda alerjisi hakkında bilgi için personelimize danışın.",
    shishaNote: "Tercih ettiğiniz tütün menüde yoksa nargile ustamıza danışın.",
    loading: "Hazırlanıyor...",
  },
  en: {
    pageTitle: "Print Preview", branch: "Branch", type: "Menu", paper: "Paper",
    orient: "Orientation", lang: "Language", pdf: "Download PDF", pdfPreparing: "Preparing...",
    back: "Back", typeFood: "A La Carte", typeBev: "Beverages", typeSS: "Snack + Shisha",
    a4: "A4", a3: "A3", port: "Portrait", land: "Landscape",
    breakfast: "BREAKFAST", breakfastSub: "BREAKFAST DELIGHTS",
    breakfastNote: "Freshly prepared every morning",
    teaNote: "A complimentary cup of tea is served with all breakfast items",
    scanQr: "SCAN FOR PHOTO MENU",
    serviceNote: "NOTE: A 10% service charge will be added to your bill.",
    allergenNote: "Please inform our staff if you have any food allergies.",
    shishaNote: "If your preferred tobacco is not on the menu, please ask the shisha master.",
    loading: "Loading...",
  },
  ru: {
    pageTitle: "Печать", branch: "Филиал", type: "Меню", paper: "Бумага",
    orient: "Ориентация", lang: "Язык", pdf: "Скачать PDF", pdfPreparing: "Подготовка...",
    back: "Назад", typeFood: "A La Carte", typeBev: "Напитки", typeSS: "Снек + Кальян",
    a4: "A4", a3: "A3", port: "Книжная", land: "Альбомная",
    breakfast: "ЗАВТРАК", breakfastSub: "ВКУСНЫЕ ЗАВТРАКИ",
    breakfastNote: "Свежеприготовлено каждое утро",
    teaNote: "При каждом завтраке подаётся чашка чая в подарок",
    scanQr: "SCAN FOR PHOTO MENU",
    serviceNote: "ПРИМЕЧАНИЕ: К вашему счёту будет добавлено 10% за обслуживание.",
    allergenNote: "При наличии пищевой аллергии сообщите персоналу.",
    shishaNote: "Если ваш табак отсутствует в меню, обратитесь к кальян-мастеру.",
    loading: "Загрузка...",
  },
};

/* ─── Badge config ─── */
export const BADGE_COLORS: Record<string, string> = {
  new: "#C41E3A", meat: "#8B2020", fish: "#1E5AA8", veg: "#2E7D32", halal: "#6B2D5C", spicy: "#B91C1C",
};

export const BADGE_LABELS: Record<string, Record<PrintLang, string>> = {
  new:    { az: "NEW", tr: "NEW", ru: "NEW", en: "NEW" },
  meat:   { az: "ET", tr: "ET", ru: "МЯСО", en: "MEAT" },
  fish:   { az: "BALIQ", tr: "BALIK", ru: "РЫБА", en: "FISH" },
  veg:    { az: "VEGETARIAN", tr: "VEJETARYAN", ru: "ВЕГЕТАР", en: "VEG" },
  halal:  { az: "HALAL", tr: "HELAL", ru: "ХАЛЯЛЬ", en: "HALAL" },
  spicy:  { az: "ACILI", tr: "ACILI", ru: "ОСТРОЕ", en: "SPICY" },
};

/* ─── Template colors ─── */
export const COLORS = {
  bg: "#F8F6F0",
  text: "#1A1A1A",
  gold: "#C9A96E",
  darkGold: "#B8956A",
  white: "#FFFDF7",
  accentRed: "#C41E3A",
  muted: "#999",
  lightMuted: "#888",
} as const;

/* ─── Screen preview scale factor ─── */
export const SCREEN_SCALE: Record<PrintPaper, number> = {
  a3: 0.32,
  a4: 0.48,
};
