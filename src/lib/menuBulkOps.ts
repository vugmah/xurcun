import * as XLSX from "xlsx";
import { getAllEdits, getBranchItemEdit, saveMenuEdit, saveBranchItemEdit, getCategoryLayout, setCategoryLayout, type TabType } from "./menuStore";

const BACKUP_KEY = "xurcun_menu_backup_v1";

export interface BulkRow {
  menu_type: string;
  category_id: number;
  category_name_az: string;
  category_name_ru: string;
  category_name_en: string;
  category_name_tr: string;
  item_id: number;
  item_name_az: string;
  item_name_ru: string;
  item_name_en: string;
  item_name_tr: string;
  item_desc_az: string;
  item_desc_ru: string;
  item_desc_en: string;
  item_desc_tr: string;
  base_price: string;
  is_active: string;
  sort_order: number;
  is_new: string;
  is_meat: string;
  is_fish: string;
  is_vegetarian: string;
  is_halal: string;
  is_snack: string;
  qr_layout_mode: string;
  image_url: string;
  image_alt_az: string;
  image_alt_ru: string;
  image_alt_en: string;
  white_city_active: string;
  white_city_price: string;
  seabreeze_marina_active: string;
  seabreeze_marina_price: string;
}

const EXCEL_COLS: (keyof BulkRow)[] = [
  "menu_type", "category_id", "category_name_az", "category_name_ru", "category_name_en", "category_name_tr",
  "item_id", "item_name_az", "item_name_ru", "item_name_en", "item_name_tr",
  "item_desc_az", "item_desc_ru", "item_desc_en", "item_desc_tr",
  "base_price", "is_active", "sort_order",
  "is_new", "is_meat", "is_fish", "is_vegetarian", "is_halal", "is_snack",
  "qr_layout_mode",
  "image_url", "image_alt_az", "image_alt_ru", "image_alt_en",
  "white_city_active", "white_city_price", "seabreeze_marina_active", "seabreeze_marina_price",
];

/* ─── Parse boolean from various formats ─── */
function parseBool(v: string | number | boolean | undefined): boolean | null {
  if (v === undefined || v === null || v === "") return null;
  const s = String(v).toLowerCase().trim();
  if (["true", "1", "yes", "evet", "aktif"].includes(s)) return true;
  if (["false", "0", "no", "hayır", "pasif"].includes(s)) return false;
  return null;
}

/* ─── Serialize boolean for export ─── */
function serializeBool(v: boolean | undefined): string {
  return v === true ? "TRUE" : v === false ? "FALSE" : "";
}

/* ─── Build flat rows from current merged menu data ─── */
export function buildExportRows(cats: any[], tab: string): BulkRow[] {
  const allEdits = getAllEdits();
  const rows: BulkRow[] = [];
  cats.forEach((cat: any, ci: number) => {
    (cat.items || []).forEach((item: any, ii: number) => {
      const editKey = `${tab}::${cat.titleAz}::${item.nameAz || ""}`;
      const edit = allEdits[editKey] || null;
      const wc = getBranchItemEdit(tab as any, "white-city", cat.titleAz, item.nameAz || "");
      const sm = getBranchItemEdit(tab as any, "seabreeze-marina", cat.titleAz, item.nameAz || "");
      rows.push({
        menu_type: tab,
        category_id: cat.id || ci + 1,
        category_name_az: cat.titleAz || "",
        category_name_ru: cat.titleRu || "",
        category_name_en: cat.titleEn || "",
        category_name_tr: cat.titleTr || "",
        item_id: item.id || (ci * 1000 + ii),
        item_name_az: item.nameAz || "",
        item_name_ru: item.nameRu || "",
        item_name_en: item.nameEn || "",
        item_name_tr: item.nameTr || "",
        item_desc_az: item.descAz || edit?.desc_az || "",
        item_desc_ru: item.descRu || edit?.desc_ru || "",
        item_desc_en: item.descEn || edit?.desc_en || "",
        item_desc_tr: item.descTr || edit?.desc_tr || "",
        base_price: (edit?.price !== undefined ? edit.price : item.price) || "",
        is_active: serializeBool(edit?.is_active !== undefined ? edit.is_active : item.isActive),
        sort_order: ii * 10,
        is_new: serializeBool(edit?.is_new ?? item.isNew),
        is_meat: serializeBool(edit?.is_meat ?? item.isMeat),
        is_fish: serializeBool(edit?.is_fish ?? item.isFish),
        is_vegetarian: serializeBool(edit?.is_vegetarian ?? item.isVegetarian),
        is_halal: serializeBool(edit?.is_halal ?? item.isHalal),
        is_snack: serializeBool(edit?.is_snack ?? item.isSnack),
        qr_layout_mode: getCategoryLayout(tab as any, cat.titleAz || ""),
        image_url: (edit?.image_url !== undefined ? edit.image_url : item.imageUrl) || "",
        image_alt_az: (edit?.image_alt_az !== undefined ? edit.image_alt_az : item.imageAltAz) || "",
        image_alt_ru: (edit?.image_alt_ru !== undefined ? edit.image_alt_ru : item.imageAltRu) || "",
        image_alt_en: (edit?.image_alt_en !== undefined ? edit.image_alt_en : item.imageAltEn) || "",
        white_city_active: serializeBool(wc?.is_available),
        white_city_price: wc?.branch_price || "",
        seabreeze_marina_active: serializeBool(sm?.is_available),
        seabreeze_marina_price: sm?.branch_price || "",
      });
    });
  });
  return rows;
}

/* ─── Export to Excel ─── */
export function exportToExcel(rows: BulkRow[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: EXCEL_COLS });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");

  // Instructions sheet
  const instr = [
    { Kolon: "menu_type", Aciklama: "food, beverage, veya shisha" },
    { Kolon: "base_price", Aciklama: "Sadece rakam, AZN olmadan. Orn: 10" },
    { Kolon: "is_active", Aciklama: "TRUE veya FALSE" },
    { Kolon: "is_new / is_meat / is_fish / is_vegetarian / is_halal / is_snack", Aciklama: "TRUE veya FALSE" },
    { Kolon: "white_city_active / seabreeze_marina_active", Aciklama: "TRUE veya FALSE" },
    { Kolon: "white_city_price / seabreeze_marina_price", Aciklama: "Sadece rakam, AZN olmadan" },
    { Kolon: "item_name_tr", Aciklama: "Turkce urun adi (bos birakilabilir, fallback var)" },
    { Kolon: "item_desc_tr", Aciklama: "Turkce aciklama (bos birakilabilir)" },
  ];
  const ws2 = XLSX.utils.json_to_sheet(instr);
  XLSX.utils.book_append_sheet(wb, ws2, "Instructions");

  /* Blob download — reliable on mobile Safari where writeFile() fails */
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* ─── Export to CSV ─── */
export function exportToCSV(rows: BulkRow[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: EXCEL_COLS });
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Download empty template ─── */
export function downloadTemplate() {
  const example: BulkRow[] = [
    {
      menu_type: "food", category_id: 1, category_name_az: "SƏHƏR YEMƏYİ", category_name_ru: "ЗАВТРАК", category_name_en: "BREAKFAST", category_name_tr: "Kahvaltı",
      item_id: 1, item_name_az: "Tavada yumurta", item_name_ru: "Яичница", item_name_en: "Fried eggs", item_name_tr: "Tavada yumurta",
      item_desc_az: "", item_desc_ru: "", item_desc_en: "", item_desc_tr: "",
      base_price: "8", is_active: "TRUE", sort_order: 0,
      is_new: "FALSE", is_meat: "FALSE", is_fish: "FALSE", is_vegetarian: "FALSE", is_halal: "FALSE", is_snack: "FALSE", qr_layout_mode: "auto",
      image_url: "", image_alt_az: "", image_alt_ru: "", image_alt_en: "",
      white_city_active: "TRUE", white_city_price: "8", seabreeze_marina_active: "TRUE", seabreeze_marina_price: "10",
    },
  ];
  exportToExcel(example, "xurcun-menu-template.xlsx");
}

/* ─── Parse uploaded file ─── */
export function parseUploadFile(file: File): Promise<BulkRow[]> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellText: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<BulkRow>(ws, { defval: "" });
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };
    r.readAsArrayBuffer(file);
  });
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export interface ImportPreview {
  rows: BulkRow[];
  errors: ValidationError[];
  updateCount: number;
  createCount: number;
  skipCount: number;
}

/* ─── Validate rows ─── */
export function validateRows(rows: BulkRow[]): ImportPreview {
  const errors: ValidationError[] = [];
  let updateCount = 0, createCount = 0, skipCount = 0;
  const validTypes = ["food", "beverage", "shisha"];

  rows.forEach((row, i) => {
    const rn = i + 2; // Excel row number (1-based + header)
    if (!row.menu_type || !validTypes.includes(String(row.menu_type).toLowerCase())) {
      errors.push({ row: rn, field: "menu_type", message: `Gecersiz menu_type: "${row.menu_type}". food/beverage/shisha olmali` });
    }
    if (!row.item_name_az && !row.item_name_en) {
      errors.push({ row: rn, field: "item_name_az", message: "Urun adi (AZ veya EN) bos olamaz" });
    }
    if (row.base_price && isNaN(Number(row.base_price))) {
      errors.push({ row: rn, field: "base_price", message: `Fiyat sayi olmali: "${row.base_price}"` });
    }
    if (row.white_city_price && isNaN(Number(row.white_city_price))) {
      errors.push({ row: rn, field: "white_city_price", message: `Sayi olmali: "${row.white_city_price}"` });
    }
    if (row.seabreeze_marina_price && isNaN(Number(row.seabreeze_marina_price))) {
      errors.push({ row: rn, field: "seabreeze_marina_price", message: `Sayi olmali: "${row.seabreeze_marina_price}"` });
    }
    if (row.item_id) updateCount++;
    else if (row.item_name_az) createCount++;
    else skipCount++;
  });

  return { rows, errors, updateCount, createCount, skipCount };
}

/* ─── Save backup before import ─── */
export function saveBackup() {
  const edits = getAllEdits();
  localStorage.setItem(BACKUP_KEY, JSON.stringify(edits));
}

/* ─── Undo last import ─── */
export function canUndo(): boolean {
  return !!localStorage.getItem(BACKUP_KEY);
}

export function undoLastImport(): boolean {
  const raw = localStorage.getItem(BACKUP_KEY);
  if (!raw) return false;
  localStorage.setItem("xurcun_menu_edits_v2", raw);
  return true;
}

/* ─── Apply validated rows to localStorage ─── */
export function applyImport(rows: BulkRow[], tab: string): { updated: number; created: number; errors: string[] } {
  let updated = 0, created = 0;
  const errors: string[] = [];

  rows.forEach((row, i) => {
    try {
      const itemNameAz = row.item_name_az || row.item_name_en || "";
      const catTitle = row.category_name_az || "General";

      // Save item fields
      saveMenuEdit(tab as TabType, catTitle, itemNameAz, {
        price: row.base_price || null,
        is_active: parseBool(row.is_active) ?? true,
        is_new: parseBool(row.is_new) ?? false,
        is_meat: parseBool(row.is_meat) ?? false,
        is_fish: parseBool(row.is_fish) ?? false,
        is_vegetarian: parseBool(row.is_vegetarian) ?? false,
        is_halal: parseBool(row.is_halal) ?? false,
        is_snack: parseBool(row.is_snack) ?? false,
        image_url: row.image_url || undefined,
        qr_layout_mode: (row.qr_layout_mode === "card" || row.qr_layout_mode === "list" || row.qr_layout_mode === "auto") ? row.qr_layout_mode : undefined,
        image_alt_az: row.image_alt_az || undefined,
        image_alt_ru: row.image_alt_ru || undefined,
        image_alt_en: row.image_alt_en || undefined,
        name_az: row.item_name_az || undefined,
        name_ru: row.item_name_ru || undefined,
        name_en: row.item_name_en || undefined,
        name_tr: row.item_name_tr || undefined,
        desc_az: row.item_desc_az || undefined,
        desc_ru: row.item_desc_ru || undefined,
        desc_en: row.item_desc_en || undefined,
        desc_tr: row.item_desc_tr || undefined,
      });

      // Category-level QR layout
      if (row.qr_layout_mode) {
        const layoutVal = String(row.qr_layout_mode).trim();
        if (layoutVal === "card" || layoutVal === "list" || layoutVal === "auto") {
          setCategoryLayout(tab as any, catTitle, layoutVal);
        }
      }

      // Save branch fields
      saveBranchItemEdit(tab as any, "white-city", catTitle, itemNameAz, {
        is_available: parseBool(row.white_city_active) ?? true,
        branch_price: row.white_city_price || undefined,
      });
      saveBranchItemEdit(tab as any, "seabreeze-marina", catTitle, itemNameAz, {
        is_available: parseBool(row.seabreeze_marina_active) ?? true,
        branch_price: row.seabreeze_marina_price || undefined,
      });

      if (row.item_id) updated++;
      else created++;
    } catch (err: any) {
      errors.push(`Satir ${i + 2}: ${err.message}`);
    }
  });

  return { updated, created, errors };
}
