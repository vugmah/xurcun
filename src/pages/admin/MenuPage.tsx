import { useState, useEffect, useMemo, useReducer } from "react";
import { Link } from "react-router";
import { Pencil, ChevronDown, ChevronUp, Search, X, Upload, SlidersHorizontal, Download, FileSpreadsheet, RotateCcw, Package, CheckCircle2, XCircle, ImageIcon, MapPin, AlertTriangle, Code, Copy, FileDown, Printer, Trash2, Globe, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { alacarteData, beverageData, shishaData } from "@/lib/menuData.static";
import { getMenuEdit, saveMenuEdit, getAllEdits, saveBranchItemEdit, getBranchItemEdit, isItemAvailableAtBranch, exportSeedCode, getCategoryLayout, setCategoryLayout, addNewItem, mergeNewItems, deleteNewItem, addNewCategory, deleteNewCategory, editCategoryName } from "@/lib/menuStore";
import { normalize as normalizeKey } from "@/lib/imageStore";
import { formatPrice } from "@/lib/formatPrice";
import { translateAll, translateProduct, smartFill, smartFillProduct, type TranslationFields } from "@/lib/translate";
import ImageEditor from "@/components/ImageEditor";
import { AdminBadges } from "@/components/MenuBadges";
import {
  buildExportRows, exportToExcel, exportToCSV, downloadTemplate,
  parseUploadFile, validateRows, saveBackup, canUndo, undoLastImport, applyImport,
  type ImportPreview,
} from "@/lib/menuBulkOps";

type TabType = "food" | "beverage" | "shisha";

/* ─── Always-available fallback branches ─── */
const FALLBACK_BRANCHES = [
  { id: "white_city", slug: "white-city", name: "Xurcun White City" },
  { id: "branch_2", slug: "seabreeze-marina", name: "Xurcun Seabreeze" },
];

/** Get mutable data array for a tab — shisha normalised to category-array */
function getTabData(tab: TabType): any[] {
  if (tab === "food") return alacarteData;
  if (tab === "beverage") return beverageData;
  return shishaData ? [{ id: "shisha", title_az: "Qəlyan", title_en: "Shisha", title_tr: "Nargile", title_ru: "Кальян", items: (shishaData as any).hookahs || [] }] : [];
}

/* ─── Transform backend API category to admin format ─── */
function apiCatToAdmin(cat: any): any {
  return {
    id: cat.id,
    titleAz: cat.titleAz || cat.title_az || "",
    titleRu: cat.titleRu || cat.title_ru || "",
    titleEn: cat.titleEn || cat.title_en || "",
    titleTr: cat.titleTr || cat.title_tr || "",
    items: (cat.items || []).map((it: any) => ({
      id: it.id,
      nameAz: it.nameAz || it.name_az || "",
      nameRu: it.nameRu || it.name_ru || "",
      nameEn: it.nameEn || it.name_en || "",
      nameTr: it.nameTr || it.name_tr || "",
      price: it.price || null,
      descAz: it.descAz || it.desc_az || "",
      descRu: it.descRu || it.desc_ru || "",
      descEn: it.descEn || it.desc_en || "",
      descTr: it.descTr || it.desc_tr || "",
      imageUrl: it.imageUrl || it.image_url || "",
      imageAltAz: it.imageAltAz || it.image_alt_az || "",
      imageAltRu: it.imageAltRu || it.image_alt_ru || "",
      imageAltEn: it.imageAltEn || it.image_alt_en || "",
      isNew: it.isNew ?? it.is_new ?? false,
      isMeat: it.isMeat ?? it.is_meat ?? false,
      isFish: it.isFish ?? it.is_fish ?? false,
      isVegetarian: it.isVegetarian ?? it.is_vegetarian ?? false,
      isHalal: it.isHalal ?? it.is_halal ?? false,
      isSnack: it.isSnack ?? it.is_snack ?? false,
      isActive: it.isActive ?? it.is_active ?? true,
    })),
  };
}

/* ─── Transform static menuData to admin format ─── */
function staticCatToAdmin(cat: any, tab: TabType, idx: number): any {
  const baseId = tab === "food" ? 100 : tab === "beverage" ? 200 : 300;
  return {
    id: cat.id ?? (baseId + idx), /* ← preserve ORIGINAL string ID from menuData.ts */
    titleAz: cat.title_az,
    titleRu: cat.title_ru,
    titleEn: cat.title_en,
    titleTr: cat.title_tr || "",
    items: (cat.items || []).map((it: any, j: number) => ({
      id: (baseId + idx) * 1000 + j,
      nameAz: it.name_az, nameRu: it.name_ru, nameEn: it.name_en, nameTr: it.name_tr || "",
      price: it.price || null,
      descAz: it.desc_az || "", descRu: it.desc_ru || "", descEn: it.desc_en || "", descTr: it.desc_tr || "",
      imageUrl: it.image_url || "",
      imageAltAz: "", imageAltRu: "", imageAltEn: "",
      isNew: it.is_new ?? false, isMeat: it.is_meat ?? false,
      isFish: it.is_fish ?? false, isVegetarian: it.is_vegetarian ?? false,
      isHalal: it.is_halal ?? false, isSpicy: it.is_spicy ?? false,
      isSnack: it.is_snack ?? false,
      isActive: true,
    })),
  };
}

/* ─── Merge backend/static data with localStorage edits ─── */
function mergeWithEdits(cats: any[], tab: TabType, edits: Record<string, any>): any[] {
  return cats.map(cat => ({
    ...cat,
    items: cat.items.map((item: any) => {
      const key = `${tab}::${cat.titleAz}::${item.nameAz || ""}`;
      const edit = edits[key];
      if (!edit) return item;
      return {
        ...item,
        price: edit.price !== undefined ? edit.price : item.price,
        imageUrl: edit.image_url !== undefined ? edit.image_url : item.imageUrl,
        imageAltAz: edit.image_alt_az !== undefined ? edit.image_alt_az : item.imageAltAz,
        imageAltRu: edit.image_alt_ru !== undefined ? edit.image_alt_ru : item.imageAltRu,
        imageAltEn: edit.image_alt_en !== undefined ? edit.image_alt_en : item.imageAltEn,
        nameAz: edit.name_az !== undefined ? edit.name_az : item.nameAz,
        nameRu: edit.name_ru !== undefined ? edit.name_ru : item.nameRu,
        nameEn: edit.name_en !== undefined ? edit.name_en : item.nameEn,
        nameTr: edit.name_tr !== undefined ? edit.name_tr : item.nameTr,
        descAz: edit.desc_az !== undefined ? edit.desc_az : item.descAz,
        descRu: edit.desc_ru !== undefined ? edit.desc_ru : item.descRu,
        descEn: edit.desc_en !== undefined ? edit.desc_en : item.descEn,
        descTr: edit.desc_tr !== undefined ? edit.desc_tr : item.descTr,
        isNew: edit.is_new ?? item.isNew,
        isMeat: edit.is_meat ?? item.isMeat,
        isFish: edit.is_fish ?? item.isFish,
        isVegetarian: edit.is_vegetarian ?? item.isVegetarian,
        isHalal: edit.is_halal ?? item.isHalal,
        isSpicy: edit.is_spicy ?? item.isSpicy,
        isSnack: edit.is_snack ?? item.isSnack,
        isGlutenFree: edit.is_gluten_free ?? item.isGlutenFree,
        isSugarFree: edit.is_sugar_free ?? item.isSugarFree,
        // isActive is NOT overridden by localStorage edits — always use API value
        // This ensures the toggle reflects the real backend state
      };
    }),
  }));
}

export default function MenuPage() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [activeTab, setActiveTab] = useState<TabType>("food");
  const [menuData, setMenuData] = useState<any>(null);
  const [expandedCat, setExpandedCat] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  /* product creation state — managed by ProductCreateForm component */
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<{ updated: number; created: number; errors: string[] } | null>(null);
  const [seedExport, setSeedExport] = useState<string>("");
  const [seedCopied, setSeedCopied] = useState(false);
  const [serverMode, setServerMode] = useState(true); // default to Server Mode
  /* ─── force re-render when edits or categories change ─── */
  const [editsVersion, setEditsVersion] = useState(0);
  const bumpEdits = () => setEditsVersion(v => v + 1);
  const [catsVersion, setCatsVersion] = useState(0);
  const bumpCats = () => setCatsVersion(v => v + 1);
  /* ─── category name editing ─── */
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatAz, setEditCatAz] = useState("");
  const [editCatEn, setEditCatEn] = useState("");
  const [editCatTr, setEditCatTr] = useState("");
  const [editCatRu, setEditCatRu] = useState("");


  // Load static data as fallback (async, non-blocking)
  const [dataReady, setDataReady] = useState(false);
  useEffect(() => {
    import("@/lib/menuData").then(m => {
      setMenuData(m);
      setDataReady(true);
    }).catch(() => setDataReady(true));
  }, []);

  // Query backend — admin endpoint returns ALL items (active + inactive)
  const apiQuery = trpc.menu.adminGetMenu.useQuery(
    { tab: activeTab },
    { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 }
  );
  const backendCats = apiQuery.data;
  const hasBackend = !!backendCats && backendCats.length > 0;

  // Build category list: backend first, static fallback — always returns array, never blocks
  const baseCats = useMemo(() => {
    if (hasBackend) {
      return (backendCats as any[]).map(apiCatToAdmin);
    }
    if (!menuData) return []; // Empty = skeleton state, not blocking

    if (activeTab === "shisha") {
      // Shisha has synthetic categories (not from category array)
      const s = menuData.shishaData;
      return [
        { id: 301, title_az: "Qəlyan cihazları", title_ru: "Кальян устройства", title_en: "Hookah Devices", title_tr: "Nargile Cihazları",
          items: (s?.hookahs || []).map((h: any, i: number) => ({ id: 301000 + i, name_az: h.name_az || h.name, name_ru: h.name_ru || h.name || h.name_az, name_en: h.name_en || h.name || h.name_az, price: h.price, desc_az: "", desc_ru: "", desc_en: "", image_url: h.image_url || "", is_new: h.is_new ?? false, is_meat: h.is_meat ?? false, is_fish: h.is_fish ?? false, is_vegetarian: h.is_vegetarian ?? false, is_halal: h.is_halal ?? false, is_snack: h.is_snack ?? false })) },
        { id: 302, title_az: "Best Sellers", title_ru: "Популярные", title_en: "Best Sellers", title_tr: "En Çok Tercih Edilenler",
          items: (s?.bestSellers || []).map((n: string, i: number) => ({ id: 302000 + i, name_az: n, name_ru: n, name_en: n, price: null, desc_az: "", desc_ru: "", desc_en: "", image_url: "", is_new: false, is_meat: false, is_fish: false, is_vegetarian: false, is_halal: false, is_snack: false })) },
        { id: 303, title_az: "Klassik brendlər", title_ru: "Классические бренды", title_en: "Classic Brands", title_tr: "Klasik Markalar",
          items: (s?.classic || []).map((n: string, i: number) => ({ id: 303000 + i, name_az: n, name_ru: n, name_en: n, price: null, desc_az: "", desc_ru: "", desc_en: "", image_url: "", is_new: false, is_meat: false, is_fish: false, is_vegetarian: false, is_halal: false, is_snack: false })) },
        { id: 304, title_az: "Premium brendlər", title_ru: "Премиум бренды", title_en: "Premium Brands", title_tr: "Premium Markalar",
          items: (s?.premium || []).map((n: string, i: number) => ({ id: 304000 + i, name_az: n, name_ru: n, name_en: n, price: null, desc_az: "", desc_ru: "", desc_en: "", image_url: "", is_new: false, is_meat: false, is_fish: false, is_vegetarian: false, is_halal: false, is_snack: false })) },
      ].map((cat, idx) => staticCatToAdmin(cat, "shisha", idx));
    }

    const raw = activeTab === "food" ? menuData.alacarteData
      : activeTab === "beverage" ? menuData.beverageData
      : [];
    const adminCats = raw.map((c: any, i: number) => staticCatToAdmin(c, activeTab, i));
    /* Merge admin-created new items */
    return mergeNewItems(activeTab as any, adminCats);
  }, [hasBackend, backendCats, menuData, activeTab, catsVersion]);

  // Apply localStorage edits on top — re-compute when toggles change
  const allEdits = useMemo(() => getAllEdits(), [editsVersion]);
  const cats = useMemo(() => {
    const merged = mergeWithEdits(baseCats, activeTab, allEdits);
    if (!search) return merged;
    const q = search.toLowerCase();
    return merged.filter((c: any) =>
      (c.titleAz || "").toLowerCase().includes(q) ||
      c.items?.some((it: any) => (it.nameAz || "").toLowerCase().includes(q))
    );
  }, [baseCats, activeTab, allEdits, search]);

  // tRPC utils — must be declared BEFORE any mutation that uses it
  const utils = trpc.useUtils();

  // Backend mutation with localStorage fallback
  const updateItem = trpc.menu.updateItem.useMutation({
    onSuccess: () => {
      apiQuery.refetch();
      utils.menu.adminGetMenu.invalidate();
      utils.menu.adminGetCategories.invalidate();
      utils.branchMenu.getMenuByBranch.invalidate();
      utils.photoAssignments.list.invalidate();
      utils.stats.invalidate();
      bumpEdits();
    },
  });

  // Branch data — Xurcun White City + Xurcun Seabreeze
  const branchesQuery = trpc.branch.getBranches.useQuery(undefined, { retry: false });
  const branchList = (
    branchesQuery.data && branchesQuery.data.length > 0
      ? branchesQuery.data
      : []
  ).filter((b: any) => b.isActive !== false);

  // Ensure both branches exist in the list
  const hasWhiteCity = branchList.some((b: any) => b.slug === "white-city");
  const hasSeabreeze = branchList.some((b: any) => b.slug === "seabreeze-marina");
  const fullBranchList = [
    ...branchList,
    ...(hasWhiteCity ? [] : [{ id: 1, name: "Xurcun White City", slug: "white-city" }]),
    ...(hasSeabreeze ? [] : [{ id: 2, name: "Xurcun Seabreeze", slug: "seabreeze-marina" }]),
  ];

  const updateBranchItem = trpc.branchMenu.updateMenuItemBranch.useMutation({
    onSuccess: () => { apiQuery.refetch(); utils.branchMenu.getMenuByBranch.invalidate(); utils.menu.adminGetMenu.invalidate(); utils.stats.invalidate(); },
  });

  // DB photo assignments — single source of truth
  const { data: dbAssignmentsData } = trpc.photoAssignments.list.useQuery(undefined);
  const dbAssignments = dbAssignmentsData?.assignments ?? {};

  // Settings API for persisting viewMode
  const upsertSetting = trpc.settings.upsert.useMutation({
    onSuccess: () => { utils.settings.invalidate(); utils.stats.invalidate(); },
  });
  const dbLayoutsQuery = trpc.settings.getByKey.useQuery({ key: "category_layouts" }, { retry: false });
  useEffect(() => {
    if (dbLayoutsQuery.data) {
      try {
        const parsed = JSON.parse(dbLayoutsQuery.data);
        if (parsed && typeof parsed === "object") {
          sessionStorage.setItem("CATLAYOUT_DB", JSON.stringify(parsed));
        }
      } catch { /* ignore invalid JSON */ }
    }
  }, [dbLayoutsQuery.data]);

  // ─── Stats ───
  const stats = useMemo(() => {
    let total = 0, active = 0, passive = 0, withImg = 0;
    let wcAvail = 0, sbAvail = 0;
    cats.forEach((cat: any) => {
      (cat.items || []).forEach((item: any) => {
        total++;
        if (item.isActive === false) passive++;
        else active++;
        // Count from DB photo_assignments (single source of truth)
        const dbKey = `food:${cat.titleAz}:${item.nameAz || item.name || ""}`;
        const dbKeyNorm = `food:${cat.titleAz}:${normalizeKey(item.nameAz || item.name || "")}`;
        const hasPhoto = dbAssignments[dbKey]?.imageUrl || dbAssignments[dbKeyNorm]?.imageUrl;
        if (hasPhoto) withImg++;
        if (isItemAvailableAtBranch(activeTab, "white-city", cat.titleAz, item.nameAz || "")) wcAvail++;
        if (isItemAvailableAtBranch(activeTab, "seabreeze-marina", cat.titleAz, item.nameAz || "")) sbAvail++;
      });
    });
    return { total, active, passive, withImg, wcAvail, sbAvail };
  }, [cats, activeTab, dbAssignments]);

  // ─── Skeleton state: data still loading (first render) ───
  const isSkeleton = !dataReady && !hasBackend;

  return (
    <div className="min-w-0 max-w-full">
      <h1 className="text-xl font-bold text-white mb-1">Menü Yönetimi</h1>

      {isSkeleton ? (
        /* ─── SKELETON: Menu page still loading data ─── */
        <div className="animate-pulse">
          <div className="h-3 w-48 bg-white/10 rounded mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#111] border border-[#222] rounded-lg p-3">
                <div className="w-6 h-6 rounded bg-white/5 mb-2" />
                <div className="h-4 w-8 bg-white/10 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-[#111] border border-[#222] rounded-lg p-4 space-y-3">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-8 w-full bg-white/5 rounded" />
            <div className="h-8 w-full bg-white/5 rounded" />
            <div className="h-8 w-3/4 bg-white/5 rounded" />
          </div>
        </div>
      ) : (
        <>
      {/* ─── SERVER / LOCAL MODE TOGGLE ─── */}
      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-[#111] border border-[#222]">
        <button
          onClick={() => setServerMode(!serverMode)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            serverMode
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}
        >
          {serverMode ? 'Server Mode — Kayitlar DBye gider' : 'Yerel Mod — Sadece bu cihazda'}
        </button>
        {serverMode && <span className="text-emerald-400 text-xs">Degisiklikler QR/Public/Printe aninda yansir</span>}
        {!serverMode && (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-400/60 text-xs">Seed Export ile kodu kopyalayip menuEditsSeed.ts dosyasina yapistirin.</span>
          </>
        )}
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Toplam</span>
          </div>
          <p className="text-white text-lg font-bold">{stats.total}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Aktif</span>
          </div>
          <p className="text-green-400 text-lg font-bold">{stats.active}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Pasif</span>
          </div>
          <p className="text-red-400 text-lg font-bold">{stats.passive}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Fotoğraflı</span>
          </div>
          <p className="text-blue-400 text-lg font-bold">{stats.withImg}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">White City</span>
          </div>
          <p className="text-[#C9A96E] text-lg font-bold">{stats.wcAvail}</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Seabreeze</span>
          </div>
          <p className="text-purple-400 text-lg font-bold">{stats.sbAvail}</p>
        </div>
      </div>

      {/* QR Menu Links */}
      <div className="mb-3 p-3 bg-[#111] border border-[#222] rounded-lg max-w-full overflow-hidden">
        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">QR Menü Bağlantıları</p>
        <div className="space-y-1 max-w-full">
          {fullBranchList.map(b => {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const url = `${origin}/#/menu/${b.slug}`;
            return (
              <div key={b.id} className="flex items-center gap-2 text-xs min-w-0 max-w-full">
                <span className="text-white/60 shrink-0">{b.name}:</span>
                <code className="text-[#C9A96E] bg-[#C9A96E]/5 px-1.5 py-0.5 rounded truncate min-w-0">{url}</code>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111] border border-[#222] rounded-lg p-1 mb-4 overflow-x-auto min-w-0">
        {(["food","beverage","shisha"] as const).map(t => (
          <button key={t} onClick={() => { setActiveTab(t); setExpandedCat(null); setEditId(null); }} className={`shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 text-center ${activeTab === t ? "bg-[#C9A96E]/15 text-[#C9A96E]" : "text-white/50"}`}>
            {t === "food" ? "A La Carte" : t === "beverage" ? "Beverages" : "Shisha"}
          </button>
        ))}
      </div>

      {/* ═══ ADD CATEGORY / SUBCATEGORY ═══ */}
      <div className="mb-3">
        <button
          onClick={() => setShowCatForm(!showCatForm)}
          className="w-full px-4 py-2 bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-lg text-sm font-semibold text-[#C9A96E]/80 hover:bg-[#C9A96E]/15 flex items-center justify-center gap-2 transition-all"
        >
          {showCatForm ? "− Cancel" : "+ Add Category"}
        </button>
        {showCatForm && (
          <CategoryCreateForm
            activeTab={activeTab}
            onSaved={() => { setShowCatForm(false); bumpCats(); }}
            onCancel={() => setShowCatForm(false)}
          />
        )}
      </div>

      {/* ═══ ADD PRODUCT ═══ */}
      <div className="mb-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full px-4 py-2.5 bg-[#C9A96E]/15 border border-[#C9A96E]/30 rounded-lg text-sm font-semibold text-[#C9A96E] hover:bg-[#C9A96E]/20 flex items-center justify-center gap-2 transition-all"
        >
          {showAddForm ? "− Cancel" : "+ Add New Product"}
        </button>

        {showAddForm && (
          <ProductCreateForm
            activeTab={activeTab}
            onSaved={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input placeholder="Ürün ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-[#111] border border-[#222] text-white text-sm rounded-lg" />
        {search && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" onClick={() => setSearch("")}><X className="w-3.5 h-3.5" /></button>}
      </div>

      {/* ═══ BULK OPERATIONS ═══ */}
      <div className="mb-4 p-3 bg-[#111] border border-[#222] rounded-lg">
        <p className="text-white/40 text-xs mb-2 uppercase tracking-wider">Toplu Menü İşlemleri</p>
        <div className="flex flex-wrap gap-2 mb-2">
          <button onClick={() => {
            try {
              const rows = buildExportRows(cats, activeTab);
              if (rows.length === 0) { alert("İhrac edilecek ürün bulunamadı."); return; }
              exportToExcel(rows, `xurcun-${activeTab}-export.xlsx`);
            } catch (err: any) {
              console.error("[Excel Export] Hata:", err);
              alert("Excel ihrac hatasi: " + (err?.message || "Bilinmeyen hata"));
            }
          }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#C9A96E]/15 text-[#C9A96E] text-xs border border-[#C9A96E]/30 hover:bg-[#C9A96E]/20"><Download className="w-3 h-3" /> Excel indir</button>
          <button onClick={() => exportToCSV(buildExportRows(cats, activeTab), `xurcun-${activeTab}-export.csv`)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/5 text-white/60 text-xs border border-white/10 hover:border-white/20 hover:text-white"><Download className="w-3 h-3" /> CSV indir</button>
          <button onClick={downloadTemplate} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/5 text-white/60 text-xs border border-white/10 hover:border-white/20 hover:text-white"><FileSpreadsheet className="w-3 h-3" /> Şablon indir</button>
          {canUndo() && (
            <button onClick={() => { if (undoLastImport()) { window.location.reload(); } }} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-red-400/10 text-red-400 text-xs border border-red-400/20 hover:bg-red-400/20"><RotateCcw className="w-3 h-3" /> Son importu geri al</button>
          )}
          <button onClick={() => setSeedExport(exportSeedCode())} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-purple-400/10 text-purple-400 text-xs border border-purple-400/20 hover:bg-purple-400/20"><Code className="w-3 h-3" /> Seed Export</button>
          <Link to="/admin/menu/print-preview" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/5 text-white/60 text-xs border border-white/10 hover:border-white/20 hover:text-white no-underline"><Printer className="w-3 h-3" /> Baskı Önizleme</Link>
        </div>
        {/* Upload */}
        <label className="cursor-pointer">
          <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            try {
              const rows = await parseUploadFile(f);
              const preview = validateRows(rows);
              setImportPreview(preview);
              setImportResult(null);
            } catch (err: any) { alert("Dosya okunamadi: " + err.message); }
            e.target.value = "";
          }} />
          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white/5 text-white/60 text-xs border border-white/10 hover:border-white/20 hover:text-white cursor-pointer"><Upload className="w-3 h-3" /> Excel / CSV yükle</span>
        </label>

        {/* Import preview */}
        {importPreview && (
          <div className="mt-3 p-3 bg-[#0A0A0A] rounded border border-[#333] space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-xs">Önizleme: {importPreview.rows.length} satir</p>
              <button onClick={() => setImportPreview(null)} className="text-white/30 hover:text-white"><X className="w-3 h-3" /></button>
            </div>
            {importPreview.errors.length > 0 && (
              <div className="max-h-24 overflow-y-auto space-y-1">
                {importPreview.errors.map((err, i) => (
                  <p key={i} className="text-red-400 text-[10px]">Satir {err.row}: {err.message}</p>
                ))}
              </div>
            )}
            <div className="flex gap-3 text-[10px] text-white/40">
              <span>Guncellenecek: {importPreview.updateCount}</span>
              <span>Yeni: {importPreview.createCount}</span>
              <span>Atlanacak: {importPreview.skipCount}</span>
              <span className={importPreview.errors.length > 0 ? "text-red-400" : "text-green-400"}>Hata: {importPreview.errors.length}</span>
            </div>
            {importPreview.errors.length === 0 && (
              <div className="flex gap-2">
                <button onClick={() => { saveBackup(); const r = applyImport(importPreview.rows, activeTab); setImportResult(r); setImportPreview(null); }} className="px-3 py-1 bg-[#C9A96E] text-[#0A0A0A] text-xs font-medium rounded hover:bg-[#D4A853]">Import uygula</button>
                <button onClick={() => setImportPreview(null)} className="px-3 py-1 text-white/40 text-xs border border-[#333] rounded hover:border-[#555]">İptal</button>
              </div>
            )}
          </div>
        )}

        {/* Import result */}
        {importResult && (
          <div className="mt-2 p-2 bg-green-400/5 rounded border border-green-400/20">
            <p className="text-green-400 text-xs">Import tamamlandi:</p>
            <p className="text-white/40 text-[10px]">Guncellenen: {importResult.updated} | Yeni: {importResult.created}</p>
            {importResult.errors.length > 0 && importResult.errors.map((e, i) => <p key={i} className="text-red-400 text-[10px]">{e}</p>)}
          </div>
        )}

        {/* Seed Export */}
        {seedExport && (
          <div className="mt-3 p-3 bg-[#0A0A0A] rounded border border-purple-400/20 space-y-2 max-w-full">
            <div className="flex items-center justify-between">
              <p className="text-purple-400 text-xs">Seed Export — menuEditsSeed.ts icine yapistirin</p>
              <button onClick={() => setSeedExport("")} className="text-white/30 hover:text-white"><X className="w-3 h-3" /></button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(seedExport);
                    setSeedCopied(true);
                    setTimeout(() => setSeedCopied(false), 2000);
                  } catch {
                    // Fallback: select all in textarea
                    const ta = document.getElementById("seed-export-textarea") as HTMLTextAreaElement;
                    if (ta) { ta.select(); ta.setSelectionRange(0, 999999); }
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#C9A96E]/15 text-[#C9A96E] text-xs border border-[#C9A96E]/30 hover:bg-[#C9A96E]/25 transition-all"
              >
                <Copy className="w-3 h-3" />
                {seedCopied ? "Kopyalandi" : "Kopyala"}
              </button>
              <button
                onClick={() => {
                  const ta = document.getElementById("seed-export-textarea") as HTMLTextAreaElement;
                  if (ta) { ta.select(); ta.setSelectionRange(0, 999999); }
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white/5 text-white/60 text-xs border border-white/10 hover:border-white/20 transition-all"
              >
                Hamisini sec
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([seedExport], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "menuEditsSeed.ts";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white/5 text-white/60 text-xs border border-white/10 hover:border-white/20 transition-all"
              >
                <FileDown className="w-3 h-3" />
                TXT olaraq indir
              </button>
            </div>

            {seedCopied && (
              <p className="text-green-400 text-[10px]">Kopyalandi — istediyiniz yere yapistira bilersiniz.</p>
            )}

            <textarea
              id="seed-export-textarea"
              readOnly
              value={seedExport}
              rows={6}
              className="w-full max-w-full px-2 py-1.5 bg-[#111] border border-[#333] text-purple-300 text-[10px] rounded font-mono resize-y break-all overflow-auto max-h-[40vh]"
              onClick={(e) => {
                const ta = e.target as HTMLTextAreaElement;
                ta.select();
                ta.setSelectionRange(0, 999999);
              }}
            />
            <p className="text-white/30 text-[10px]">Kodu kopyalayin → src/lib/menuEditsSeed.ts dosyasina yapistirin → rebuild → deploy</p>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {cats.map((cat: any) => (
          <div key={cat.id} className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#161616]" onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {expandedCat === cat.id ? <ChevronUp className="w-4 h-4 text-white/40 shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
                {editingCatId === cat.id ? (
                  /* ═══ INLINE CATEGORY EDIT — simplified ═══ */
                  <InlineCategoryEdit
                    cat={cat}
                    activeTab={activeTab}
                    onSaved={() => { setEditingCatId(null); bumpCats(); }}
                    onCancel={() => setEditingCatId(null)}
                  />
                ) : (
                  /* ═══ CATEGORY NAME DISPLAY ═══ */
                  <div className="min-w-0">
                    <h3 className="text-white font-medium truncate">{cat.titleAz}</h3>
                    <p className="text-white/40 text-xs">{cat.titleEn} / {cat.titleRu} / {cat.titleTr}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* QR Layout badge + selector */}
                <div className="flex items-center gap-1" title="QR Görünümü">
                  <span className="text-[9px] text-white/30 uppercase">QR</span>
                  <select
                    value={getCategoryLayout(activeTab as any, cat.titleAz)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      const mode = e.target.value as "auto" | "card" | "list";
                      setCategoryLayout(activeTab as any, cat.titleAz, mode);
                      // Persist to DB settings
                      try {
                        const key = `CATLAYOUT::${activeTab}::${cat.titleAz}`;
                        const current = JSON.parse(sessionStorage.getItem("CATLAYOUT_DB") || "{}");
                        current[key] = mode;
                        sessionStorage.setItem("CATLAYOUT_DB", JSON.stringify(current));
                        upsertSetting.mutate({ key: "category_layouts", value: JSON.stringify(current) });
                      } catch { /* ignore */ }
                      forceUpdate();
                    }}
                    className={`text-[10px] font-medium rounded px-1.5 py-0.5 focus:outline-none cursor-pointer border ${
                      getCategoryLayout(activeTab as any, cat.titleAz) === "card"
                        ? "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30"
                        : getCategoryLayout(activeTab as any, cat.titleAz) === "list"
                        ? "bg-white/5 text-white/40 border-white/10"
                        : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                    }`}
                  >
                    <option value="auto">Auto</option>
                    <option value="card">Kart</option>
                    <option value="list">Liste</option>
                  </select>
                </div>
                <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">{cat.items?.length ?? 0} ürün</span>
                {/* Edit category name */}
                {editingCatId !== cat.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCatId(cat.id);
                      setEditCatAz(cat.titleAz || "");
                      setEditCatEn(cat.titleEn || "");
                      setEditCatTr(cat.titleTr || "");
                      setEditCatRu(cat.titleRu || "");
                    }}
                    className="text-white/20 hover:text-[#C9A96E] shrink-0 transition-colors"
                    title="Edit category name"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {/* Delete category */}
                {editingCatId !== cat.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const hasProducts = (cat.items?.length ?? 0) > 0;
                    const msg = hasProducts
                      ? `"${cat.titleAz}" kategorisi ${cat.items.length} ürün içeriyor. Kategori ve tüm ürünleri silinsin mi?`
                      : `"${cat.titleAz}" kategorisi silinsin mi?`;
                    if (!confirm(msg)) return;
                    /* Pass cat.id for ID-based lookup, fallback to title */
                    deleteNewCategory(activeTab as any, cat.titleAz, cat.id);
                    /* Also clear expanded state if this cat was expanded */
                    if (expandedCat === cat.id) setExpandedCat(null);
                    bumpCats();
                  }}
                  className="text-white/20 hover:text-red-400 shrink-0 transition-colors ml-1"
                  title="Delete category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                )}
              </div>
            </div>
            {expandedCat === cat.id && (
              <div className="border-t border-[#222]">
                {(cat.items || []).map((item: any) => {
                  const editKey = `${activeTab}::${cat.titleAz}::${item.nameAz || ""}`;
                  const edit = allEdits[editKey] || null;
                  const img = dbAssignments[`food:${cat.titleAz}:${item.nameAz || ""}`]?.imageUrl || dbAssignments[`food:${cat.titleAz}:${normalizeKey(item.nameAz || "")}`]?.imageUrl || "";
                  const isEditing = editId === item.id;
                  return (
                    <div key={item.id} className="p-4 border-t border-[#222]">
                      {isEditing ? (
                        <ItemEdit
                          tab={activeTab}
                          catTitle={cat.titleAz}
                          item={item}
                          edit={edit}
                          updateItem={updateItem}
                          updateBranchItem={updateBranchItem}
                          onClose={() => setEditId(null)}
                          dbAssignments={dbAssignments}
                          serverMode={serverMode}
                        />
                      ) : (
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 min-w-0">
                              {img && <div className="w-8 h-8 rounded overflow-hidden bg-[#141414] shrink-0"><img src={img} alt="" className="w-full h-full object-cover object-center" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} /></div>}
                              <span className="text-white text-sm font-medium">{item.nameAz}</span>
                              {item.isNew && <span className="text-[10px] font-bold text-red-400 border border-white/20 px-1.5 py-0.5 rounded-full">NEW</span>}
                              {item.isActive === false && <span className="text-[10px] bg-red-400/20 text-red-400 px-1.5 py-0.5 rounded ml-1">Pasif</span>}
                            </div>
                            <div className="mt-1">
                              <AdminBadges itemData={{
                                isNew: item.isNew ?? item.is_new ?? false,
                                isMeat: item.isMeat ?? item.is_meat ?? false,
                                isFish: item.isFish ?? item.is_fish ?? false,
                                isVegetarian: item.isVegetarian ?? item.is_vegetarian ?? false,
                                isHalal: item.isHalal ?? item.is_halal ?? false,
                                isSpicy: item.isSpicy ?? item.is_spicy ?? false,
                                isGlutenFree: item.isGlutenFree ?? item.is_gluten_free ?? false,
                                isSugarFree: item.isSugarFree ?? item.is_sugar_free ?? false,
                                isSnack: item.isSnack ?? item.is_snack ?? false,
                              }} />
                            </div>
                          </div>
                          <button onClick={() => setEditId(item.id)} className="text-white/40 hover:text-[#C9A96E] shrink-0"><Pencil className="w-4 h-4" /></button>

                          {/* ═══ GLOBAL Active/Passive toggle → API ═══ */}
                          {/* ═══ GLOBAL Active/Passive toggle → API ═══ */}
                          <button
                            onClick={() => {
                              const currentlyActive = item.isActive !== false;
                              if (item.id && item.id < 100000) {
                                updateItem.mutate({ id: item.id, isActive: !currentlyActive });
                              } else {
                                /* New items (not in DB yet) — localStorage only */
                                saveMenuEdit(activeTab, cat.titleAz, item.nameAz || "", {
                                  is_active: !currentlyActive,
                                } as any);
                              }
                              bumpEdits();
                            }}
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded border transition-all ${
                              (item.isActive !== false)
                                ? "bg-green-500 text-white border-green-500"
                                : "bg-red-500 text-white border-red-500"
                            }`}
                            title="Global: ACTIVE = visible everywhere, PASSIVE = hidden everywhere"
                          >
                            {(item.isActive !== false) ? "ACTIVE" : "PASSIVE"}
                          </button>

                          {/* ═══ Branch toggles — WC / SB ═══ */}
                          <div className="flex gap-1">
                            {(["white-city", "seabreeze-marina"] as const).map(branchSlug => {
                              const branchLabel = branchSlug === "white-city" ? "WC" : "SB";
                              const branchEdit = getBranchItemEdit(activeTab as any, branchSlug, cat.titleAz, item.nameAz || "");
                              const isGlobalActive = item.isActive !== false;
                              const isBranchActive = isGlobalActive && (branchEdit?.is_available ?? true);
                              return (
                                <button
                                  key={branchSlug}
                                  onClick={() => {
                                    if (!isGlobalActive) return;
                                    if (item.id && item.id < 100000) {
                                      updateBranchItem.mutate({
                                        menuItemId: item.id,
                                        branchId: branchSlug === "white-city" ? 1 : 2,
                                        isAvailable: !isBranchActive,
                                        branchPrice: branchEdit?.branch_price || null,
                                      });
                                    }
                                    /* Sync local state for instant UI */
                                    saveBranchItemEdit(activeTab as any, branchSlug, cat.titleAz, item.nameAz || "", {
                                      ...branchEdit,
                                      is_available: !isBranchActive,
                                    });
                                    bumpEdits();
                                  }}
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                                    isBranchActive
                                      ? "bg-green-500 text-white border-green-500"
                                      : "bg-red-500 text-white border-red-500"
                                  } ${!isGlobalActive ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                                  title={!isGlobalActive ? "Global PASSIVE — enable product first" : `${branchSlug}: ${isBranchActive ? "Active" : "Passive"}`}
                                >
                                  {branchLabel}
                                </button>
                              );
                            })}
                          </div>

                          {/* ═══ Delete ═══ */}
                          <button
                            onClick={() => {
                              const name = item.nameAz || item.name || item.name_az || "this product";
                              if (!confirm(`"${name}" silinecek. Emin misiniz?`)) return;
                              deleteNewItem(activeTab as any, cat.titleAz, item.nameAz || item.name || item.name_az);
                              bumpEdits();
                            }}
                            className="text-white/30 hover:text-red-400 shrink-0 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ITEM EDIT FORM — always renders 2 hardcoded branch rows
   ═══════════════════════════════════════════════════════════════ */

type LangTab = "az" | "ru" | "en" | "tr";
const LANG_TABS: { key: LangTab; label: string }[] = [
  { key: "az", label: "AZ" },
  { key: "ru", label: "RU" },
  { key: "en", label: "EN" },
  { key: "tr", label: "TR" },
];

/* ═══════════════════════════════════════════════════════════════
   CATEGORY CREATE FORM — one input + AI auto-translate
   ═══════════════════════════════════════════════════════════════ */

function CategoryCreateForm({ activeTab, onSaved, onCancel }: { activeTab: TabType; onSaved: () => void; onCancel: () => void }) {
  const [mainName, setMainName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    fields: tx,
    setFields: setTx,
    translating,
    setTranslating,
    autoFilled,
  } = useAutoTranslate(mainName, { az: "", en: "", tr: "", ru: "" }, true);

  /* Keep az in sync with mainName */
  useEffect(() => {
    if (mainName.trim()) {
      setTx(prev => ({ ...prev, az: mainName.trim() }));
    }
  }, [mainName]);

  const handleSave = async () => {
    const name = mainName.trim();
    if (!name) return;
    setSaving(true);
    /* Smart fill any empty translations */
    const filled = await smartFill(name, { ...tx });
    setSaving(false);
    const ok = addNewCategory(activeTab, name, {
      title_az: filled.az || name,
      title_en: filled.en || "", /* empty if no translation */
      title_tr: filled.tr || "", /* empty if no translation */
      title_ru: filled.ru || "", /* empty if no translation */
    });
    if (!ok) { alert("Category already exists!"); return; }
    onSaved();
  };

  return (
    <div className="mt-3 p-4 bg-[#111] border border-[#222] rounded-lg space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-wider">Add Category — type in any language, AI translates</p>
      {/* Auto-translate indicator */}
      {autoFilled.length > 0 && (
        <div className="text-[10px] px-2 py-1 rounded bg-green-400/10 text-green-400 border border-green-400/20">
          ✅ Auto-translated: {autoFilled.join(", ")}
        </div>
      )}
      {/* Main input */}
      <div className="flex gap-2">
        <input
          value={mainName}
          onChange={e => setMainName(e.target.value)}
          placeholder="Category name (e.g. Desserts)"
          className="flex-1 px-3 py-2 bg-[#1A1A1A] border border-[#222] text-white text-sm rounded-lg focus:outline-none focus:border-[#C9A96E]"
        />
        <button
          onClick={() => {
            setTranslating(true);
            translateAll(mainName.trim()).then(t => {
              setTx({ az: t.az || mainName.trim(), en: t.en, tr: t.tr, ru: t.ru });
              setTranslating(false);
            });
          }}
          disabled={!mainName.trim() || translating}
          className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg text-xs hover:border-[#C9A96E]/30 hover:text-[#C9A96E] disabled:opacity-30 transition-all inline-flex items-center gap-1.5"
        >
          {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
          Translate
        </button>
      </div>
      {/* Translation preview — always visible */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
        <span className="text-[#C9A96E]">AZ: {tx.az || "—"}</span>
        <span className={tx.en ? "text-white/50" : "text-red-400/60"}>EN: {tx.en || "(empty)"}</span>
        <span className={tx.tr ? "text-white/50" : "text-red-400/60"}>TR: {tx.tr || "(empty)"}</span>
        <span className={tx.ru ? "text-white/50" : "text-red-400/60"}>RU: {tx.ru || "(empty)"}</span>
      </div>
      {(!tx.en || !tx.tr || !tx.ru) && mainName.trim() && (
        <p className="text-amber-400/60 text-[9px]">⚠️ Boş çeviriler kaydedilmeden önce otomatik doldurulacak</p>
      )}
      {/* Advanced: manual translation override */}
      <details className="group">
        <summary className="text-white/30 text-[10px] cursor-pointer hover:text-white/50 select-none list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
          Edit translations manually
        </summary>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input value={tx.az} onChange={e => setTx(p => ({ ...p, az: e.target.value }))} placeholder="AZ" className="px-2 py-1.5 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
          <input value={tx.en} onChange={e => setTx(p => ({ ...p, en: e.target.value }))} placeholder="EN" className="px-2 py-1.5 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
          <input value={tx.tr} onChange={e => setTx(p => ({ ...p, tr: e.target.value }))} placeholder="TR" className="px-2 py-1.5 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
          <input value={tx.ru} onChange={e => setTx(p => ({ ...p, ru: e.target.value }))} placeholder="RU" className="px-2 py-1.5 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
        </div>
      </details>
      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!mainName.trim() || saving} className="px-5 py-2 bg-[#C9A96E] text-[#0A0A0A] rounded-lg text-sm font-bold hover:bg-[#D4A853] disabled:opacity-30 transition-all">
          {saving ? "Saving..." : "Save"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-white/40 text-sm border border-[#333] rounded-lg hover:border-[#555]">
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INLINE CATEGORY EDIT — one input + AI translate + optional manual
   ═══════════════════════════════════════════════════════════════ */

/* ─── useAutoTranslate: debounced auto-translate, preserves manual edits ─── */
function useAutoTranslate(source: string, initial: TranslationFields, enabled: boolean) {
  const [fields, setFields] = useState<TranslationFields>(initial);
  const [translating, setTranslating] = useState(false);
  const [autoFilled, setAutoFilled] = useState<string[]>([]);
  const debouncedSource = useDebounce(source, 800);

  /* Reset fields when initial changes (e.g., opening edit for different cat) */
  useEffect(() => {
    setFields(initial);
    setAutoFilled([]);
  }, [initial.az, initial.en, initial.tr, initial.ru]);

  /* Auto-translate when debounced source changes */
  useEffect(() => {
    if (!enabled || !debouncedSource.trim()) return;
    let cancelled = false;
    setTranslating(true);
    smartFill(debouncedSource, { ...fields }).then(filled => {
      if (cancelled) return;
      const filledNow: string[] = [];
      if (!fields.en && filled.en) filledNow.push("EN");
      if (!fields.tr && filled.tr) filledNow.push("TR");
      if (!fields.ru && filled.ru) filledNow.push("RU");
      setFields(prev => ({
        az: filled.az || prev.az || debouncedSource,
        en: prev.en || filled.en || "",
        tr: prev.tr || filled.tr || "",
        ru: prev.ru || filled.ru || "",
      }));
      if (filledNow.length > 0) setAutoFilled(filledNow);
      setTranslating(false);
    }).catch(() => setTranslating(false));
    return () => { cancelled = true; };
  }, [debouncedSource]);

  /* Clear auto-filled notification after 3s */
  useEffect(() => {
    if (autoFilled.length === 0) return;
    const t = setTimeout(() => setAutoFilled([]), 3000);
    return () => clearTimeout(t);
  }, [autoFilled]);

  return { fields, setFields, translating, setTranslating, autoFilled };
}

/* ─── Simple debounce hook ─── */
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function InlineCategoryEdit({ cat, activeTab, onSaved, onCancel }: { cat: any; activeTab: TabType; onSaved: () => void; onCancel: () => void }) {
  const [mainName, setMainName] = useState(cat.titleAz || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [debugMsg, setDebugMsg] = useState<string>("");

  const {
    fields: tx,
    setFields: setTx,
    translating,
    setTranslating,
    autoFilled,
  } = useAutoTranslate(mainName, {
    az: cat.titleAz || "",
    en: cat.titleEn || "",
    tr: cat.titleTr || "",
    ru: cat.titleRu || "",
  }, true);

  /* Keep az in sync with mainName */
  useEffect(() => {
    if (mainName.trim()) {
      setTx(prev => ({ ...prev, az: mainName.trim() }));
    }
  }, [mainName]);

  const handleSave = async () => {
    if (!tx.az.trim()) return;
    setSaving(true);
    setDebugMsg("Çeviri kontrol ediliyor...");
    /* ─── Smart pre-save fill: translate any still-empty fields ─── */
    const filled = await smartFill(tx.az, { ...tx });
    const target = getTabData(activeTab);
    const found = target.find((c: any) => c.id === cat.id);
    if (!found) {
      const allIds = target.map((c: any) => `"${c.id}"(${typeof c.id})`).join(", ");
      setDebugMsg(`NOT FOUND: cat.id="${cat.id}". IDs: ${allIds}`);
      setSaving(false);
      return;
    }
    /* Save — NEVER fall back to AZ. Empty = empty. */
    const ok = editCategoryName(activeTab, cat.id, {
      title_az: filled.az.trim(),
      title_en: filled.en.trim(), /* empty if no translation */
      title_tr: filled.tr.trim(), /* empty if no translation */
      title_ru: filled.ru.trim(), /* empty if no translation */
    });
    setSaving(false);
    if (!ok) {
      setDebugMsg(`❌ Duplicate title?"${filled.az.trim()}"`);
      alert("Kategori adi zaten mevcut!");
      return;
    }
    setDebugMsg(`✅ Saved! "${cat.titleAz}" → "${filled.az.trim()}"`);
    setTimeout(() => setDebugMsg(""), 3000);
    onSaved();
  };

  const hasEmpty = !tx.en || !tx.tr || !tx.ru;
  return (
    <div className="min-w-0 flex-1 space-y-2" onClick={(e) => e.stopPropagation()}>
      {/* Debug */}
      {debugMsg && (
        <div className={`text-[10px] px-2 py-1 rounded border ${debugMsg.startsWith("✅") ? "bg-green-400/10 text-green-400 border-green-400/20" : debugMsg.startsWith("❌") ? "bg-red-400/10 text-red-400 border-red-400/20" : "bg-blue-400/10 text-blue-400 border-blue-400/20"}`}>
          {debugMsg}
        </div>
      )}
      {autoFilled.length > 0 && (
        <div className="text-[10px] px-2 py-1 rounded bg-green-400/10 text-green-400 border border-green-400/20">
          ✅ Auto-translated: {autoFilled.join(", ")}
        </div>
      )}
      {/* Main input */}
      <div className="flex gap-2">
        <input
          value={mainName}
          onChange={e => setMainName(e.target.value)}
          placeholder="Category name (AZ)"
          className="flex-1 px-2 py-1.5 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]"
        />
        <button
          onClick={() => {
            setTranslating(true);
            translateAll(mainName.trim()).then(t => {
              setTx({ az: t.az || mainName.trim(), en: t.en, tr: t.tr, ru: t.ru });
              setTranslating(false);
            });
          }}
          disabled={!mainName.trim() || translating}
          className="px-2 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded text-[10px] hover:border-[#C9A96E]/30 hover:text-[#C9A96E] disabled:opacity-30 transition-all inline-flex items-center gap-1"
        >
          {translating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Globe className="w-3 h-3" />}
        </button>
      </div>
      {/* Translation preview — always visible */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px]">
        <span className="text-[#C9A96E]">AZ: {tx.az || "—"}</span>
        <span className={tx.en ? "text-white/40" : "text-red-400/60"}>EN: {tx.en || "(empty)"}</span>
        <span className={tx.tr ? "text-white/40" : "text-red-400/60"}>TR: {tx.tr || "(empty)"}</span>
        <span className={tx.ru ? "text-white/40" : "text-red-400/60"}>RU: {tx.ru || "(empty)"}</span>
      </div>
      {hasEmpty && (
        <p className="text-amber-400/60 text-[9px]">⚠️ Boş çeviriler kaydedilmeden önce otomatik doldurulacak</p>
      )}
      {/* Advanced manual override */}
      {showAdvanced ? (
        <div className="grid grid-cols-2 gap-1.5">
          <input value={tx.az} onChange={e => setTx(p => ({ ...p, az: e.target.value }))} placeholder="AZ" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
          <input value={tx.en} onChange={e => setTx(p => ({ ...p, en: e.target.value }))} placeholder="EN" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
          <input value={tx.tr} onChange={e => setTx(p => ({ ...p, tr: e.target.value }))} placeholder="TR" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
          <input value={tx.ru} onChange={e => setTx(p => ({ ...p, ru: e.target.value }))} placeholder="RU" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded focus:outline-none focus:border-[#C9A96E]" />
          <button onClick={() => setShowAdvanced(false)} className="col-span-2 text-white/30 text-[10px] hover:text-white/50">Hide translations</button>
        </div>
      ) : (
        <button onClick={() => setShowAdvanced(true)} className="text-white/30 text-[10px] hover:text-white/50">Edit translations manually</button>
      )}
      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="px-3 py-1 bg-[#C9A96E] text-[#0A0A0A] rounded text-xs font-bold hover:bg-[#D4A853] disabled:opacity-30">
          {saving ? "Saving..." : "Kaydet"}
        </button>
        <button onClick={onCancel} className="px-3 py-1 text-white/40 text-xs border border-[#333] rounded hover:border-[#555]">İptal</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT CREATE FORM — name + desc + AI auto-translate
   ═══════════════════════════════════════════════════════════════ */

function ProductCreateForm({ activeTab, onSaved, onCancel }: { activeTab: TabType; onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [catIdx, setCatIdx] = useState(-1);
  const [avail, setAvail] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Auto-translate hooks for name and desc */
  const nameTx = useAutoTranslate(name, { az: "", en: "", tr: "", ru: "" }, true);
  const descTx = useAutoTranslate(desc,  { az: "", en: "", tr: "", ru: "" }, true);

  /* Sync az fields */
  useEffect(() => { if (name.trim()) nameTx.setFields(p => ({ ...p, az: name.trim() })); }, [name]);
  useEffect(() => { if (desc.trim()) descTx.setFields(p => ({ ...p, az: desc.trim() })); }, [desc]);

  const handleSave = async () => {
    if (!name.trim() || catIdx < 0) return;
    setSaving(true);
    /* Smart fill any empty translations */
    const filled = await smartFillProduct(
      name.trim(), desc.trim(),
      { ...nameTx.fields }, { ...descTx.fields }
    );
    setSaving(false);
    const raw = activeTab === "food" ? alacarteData : activeTab === "beverage" ? beverageData : [];
    const cat = raw[catIdx];
    if (!cat) return;
    addNewItem(activeTab as any, cat.title_az, {
      name_az: filled.name.az || name.trim(),
      name_en: filled.name.en, /* empty if no translation */
      name_tr: filled.name.tr, /* empty if no translation */
      name_ru: filled.name.ru, /* empty if no translation */
      desc_az: filled.desc.az || desc.trim(),
      desc_en: filled.desc.en, /* empty if no translation */
      desc_tr: filled.desc.tr, /* empty if no translation */
      desc_ru: filled.desc.ru, /* empty if no translation */
      price: price, is_available: avail, badges: [],
    });
    window.location.reload();
  };

  return (
    <div className="mt-3 p-4 bg-[#111] border border-[#222] rounded-lg space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-wider">Add Product — type in any language, AI translates</p>
      {/* Name + desc + price */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-white/40 mb-1">Product Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grilled Salmon" className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#222] text-white text-sm rounded-lg focus:outline-none focus:border-[#C9A96E]" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Description</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Fresh Atlantic salmon..." className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#222] text-white text-sm rounded-lg focus:outline-none focus:border-[#C9A96E]" />
        </div>
        <div>
          <label className="block text-xs text-white/40 mb-1">Price (AZN)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 28" type="number" className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#222] text-white text-sm rounded-lg focus:outline-none focus:border-[#C9A96E]" />
        </div>
      </div>
      {/* Auto-translate indicators */}
      {(nameTx.autoFilled.length > 0 || descTx.autoFilled.length > 0) && (
        <div className="text-[10px] px-2 py-1 rounded bg-green-400/10 text-green-400 border border-green-400/20">
          ✅ Auto-translated: {[
            ...nameTx.autoFilled.map(l => `Name ${l}`),
            ...descTx.autoFilled.map(l => `Desc ${l}`)
          ].join(", ")}
        </div>
      )}
      {/* Translate button */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            nameTx.setTranslating(true);
            descTx.setTranslating(true);
            translateProduct(name.trim(), desc.trim()).then(t => {
              nameTx.setFields(t.name);
              descTx.setFields(t.desc);
              nameTx.setTranslating(false);
              descTx.setTranslating(false);
            });
          }}
          disabled={!name.trim() || nameTx.translating}
          className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded text-xs hover:border-[#C9A96E]/30 hover:text-[#C9A96E] disabled:opacity-30 transition-all inline-flex items-center gap-1.5"
        >
          {nameTx.translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
          Translate AZ/EN/TR/RU
        </button>
      </div>
      {/* Translation preview — always visible */}
      <div className="space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <span className="text-[#C9A96E]">AZ: {nameTx.fields.az || "—"}</span>
          <span className={nameTx.fields.en ? "text-white/50" : "text-red-400/60"}>EN: {nameTx.fields.en || "(empty)"}</span>
          <span className={nameTx.fields.tr ? "text-white/50" : "text-red-400/60"}>TR: {nameTx.fields.tr || "(empty)"}</span>
          <span className={nameTx.fields.ru ? "text-white/50" : "text-red-400/60"}>RU: {nameTx.fields.ru || "(empty)"}</span>
        </div>
        {desc.trim() && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <span className="text-[#C9A96E]">Desc AZ: {descTx.fields.az || "—"}</span>
            <span className={descTx.fields.en ? "text-white/50" : "text-red-400/60"}>EN: {descTx.fields.en || "(empty)"}</span>
            <span className={descTx.fields.tr ? "text-white/50" : "text-red-400/60"}>TR: {descTx.fields.tr || "(empty)"}</span>
            <span className={descTx.fields.ru ? "text-white/50" : "text-red-400/60"}>RU: {descTx.fields.ru || "(empty)"}</span>
          </div>
        )}
      </div>
      {((!nameTx.fields.en || !nameTx.fields.tr || !nameTx.fields.ru) && name.trim()) && (
        <p className="text-amber-400/60 text-[9px]">⚠️ Boş çeviriler kaydedilmeden önce otomatik doldurulacak</p>
      )}
      {/* Advanced: manual translation override */}
      {showAdvanced ? (
        <div className="space-y-2">
          <p className="text-white/30 text-[10px] uppercase">Manual name translations</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={nameTx.fields.az} onChange={e => nameTx.setFields(p => ({ ...p, az: e.target.value }))} placeholder="Name AZ" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
            <input value={nameTx.fields.en} onChange={e => nameTx.setFields(p => ({ ...p, en: e.target.value }))} placeholder="Name EN" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
            <input value={nameTx.fields.tr} onChange={e => nameTx.setFields(p => ({ ...p, tr: e.target.value }))} placeholder="Name TR" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
            <input value={nameTx.fields.ru} onChange={e => nameTx.setFields(p => ({ ...p, ru: e.target.value }))} placeholder="Name RU" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
          </div>
          <p className="text-white/30 text-[10px] uppercase">Manual description translations</p>
          <div className="grid grid-cols-2 gap-2">
            <input value={descTx.fields.az} onChange={e => descTx.setFields(p => ({ ...p, az: e.target.value }))} placeholder="Desc AZ" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
            <input value={descTx.fields.en} onChange={e => descTx.setFields(p => ({ ...p, en: e.target.value }))} placeholder="Desc EN" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
            <input value={descTx.fields.tr} onChange={e => descTx.setFields(p => ({ ...p, tr: e.target.value }))} placeholder="Desc TR" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
            <input value={descTx.fields.ru} onChange={e => descTx.setFields(p => ({ ...p, ru: e.target.value }))} placeholder="Desc RU" className="px-2 py-1 bg-[#1A1A1A] border border-[#333] text-white text-xs rounded" />
          </div>
          <button onClick={() => setShowAdvanced(false)} className="text-white/30 text-[10px] hover:text-white/50">Hide manual translations</button>
        </div>
      ) : (
        <button onClick={() => setShowAdvanced(true)} className="text-white/30 text-[10px] hover:text-white/50">Edit translations manually</button>
      )}
      {/* Category + available + save */}
      <div className="flex gap-3 items-end flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-white/40 mb-1">Category *</label>
          <select
            value={catIdx}
            onChange={e => setCatIdx(parseInt(e.target.value))}
            className="w-full px-3 py-2.5 bg-[#1A1A1A] border border-[#222] text-white text-sm rounded-lg focus:outline-none focus:border-[#C9A96E] appearance-none"
            style={{ colorScheme: "dark" }}
          >
            <option value={-1} className="bg-[#1A1A1A] text-white">— Select a category —</option>
            {activeTab === "food" && alacarteData.map((c, i) => (
              <option key={i} value={i} className="bg-[#1A1A1A] text-white">{c.title_az}</option>
            ))}
            {activeTab === "beverage" && beverageData.map((c, i) => (
              <option key={i} value={i} className="bg-[#1A1A1A] text-white">{c.title_az}</option>
            ))}
            {activeTab === "shisha" && (
              <>
                <option value={0} className="bg-[#1A1A1A] text-white">Qəlyan cihazları</option>
                <option value={1} className="bg-[#1A1A1A] text-white">Best Sellers</option>
                <option value={2} className="bg-[#1A1A1A] text-white">Klassik brendlər</option>
                <option value={3} className="bg-[#1A1A1A] text-white">Premium brendlər</option>
              </>
            )}
          </select>
          {catIdx < 0 && <p className="text-red-400 text-xs mt-1">Please select a category</p>}
        </div>
        <label className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 cursor-pointer select-none">
          <input type="checkbox" checked={avail} onChange={e => setAvail(e.target.checked)} className="accent-[#C9A96E]" />
          Available
        </label>
        <button onClick={handleSave} disabled={!name.trim() || catIdx < 0 || saving} className="px-5 py-2 bg-[#C9A96E] text-[#0A0A0A] rounded-lg text-sm font-bold hover:bg-[#D4A853] disabled:opacity-30 transition-all">
          {saving ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO UPLOAD MODAL — Uses DB photos (same source as Media panel)
   ═══════════════════════════════════════════════════════════════ */

const MODAL_SECTIONS = [
  { id: "menu", label: "Menu" },
  { id: "gallery", label: "Qalereya" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "Haqqimizda" },
  { id: "concept", label: "Konsept" },
  { id: "events", label: "Tedbirler" },
];

type PhotoModalTab = "library" | "upload";

interface DbPhoto {
  id: number;
  url: string;
  alt: string | null;
  altAz: string | null;
  altRu: string | null;
  altEn: string | null;
  section: string | null;
  sortOrder: number | null;
  active: boolean | null;
  createdAt: Date | null;
}

function PhotoUploadModal({
  isOpen,
  onClose,
  onSelectMedia,
  onUpload,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (url: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [tab, setTab] = useState<PhotoModalTab>("library");
  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState("menu");

  /* ── FIX: Use same DB source as Media panel ───────────────────── */
  const { data: dbPhotos, isLoading: photosLoading } = trpc.photos.adminGetAll.useQuery(undefined, {
    staleTime: 30000,
    enabled: isOpen && tab === "library",
  });

  const allPhotos = (dbPhotos ?? []) as unknown as DbPhoto[];

  /* Section filter + search */
  const filteredPhotos = useMemo(() => {
    let list = allPhotos;
    /* Section filter — default "menu" */
    if (selectedSection) {
      list = list.filter((p) => p.section === selectedSection);
    }
    /* Search */
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => {
        const name = (p.url || "").toLowerCase();
        const alt = (p.altAz || p.alt || "").toLowerCase();
        return name.includes(q) || alt.includes(q);
      });
    }
    return list;
  }, [allPhotos, selectedSection, search]);

  /* Section counts */
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of MODAL_SECTIONS) {
      counts[s.id] = allPhotos.filter((p) => p.section === s.id).length;
    }
    return counts;
  }, [allPhotos]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  /* Lock body scroll when open */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-[#0A0A0A] border border-[#222] rounded-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222] shrink-0">
          <div>
            <h3 className="text-white text-sm font-medium">Fotoğraf Seç veya Yükle</h3>
            <p className="text-white/30 text-[11px] mt-0.5">Media kitabxanasından seçin və ya yeni şəkil yükləyin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 py-3 border-b border-[#222] shrink-0">
          <button
            onClick={() => setTab("library")}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              tab === "library"
                ? "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30"
                : "text-white/40 hover:text-white/60 border-transparent hover:border-white/10"
            }`}
          >
            📁 Media Kitabxanasından Seç
          </button>
          <button
            onClick={() => setTab("upload")}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              tab === "upload"
                ? "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30"
                : "text-white/40 hover:text-white/60 border-transparent hover:border-white/10"
            }`}
          >
            ⬆️ Yeni Şəkil Yüklə
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 min-h-[200px]">
          {tab === "library" ? (
            <>
              {/* Section filter */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {MODAL_SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSection(s.id)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-medium border transition-all ${
                      selectedSection === s.id
                        ? "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30"
                        : "text-white/40 border-[#222] hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {s.label} ({sectionCounts[s.id] ?? 0})
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Fayl adı vəya alt mətn axtar..."
                  className="w-full pl-8 pr-3 py-2 bg-[#111] border border-[#222] text-white text-xs rounded-lg focus:outline-none focus:border-[#C9A96E]"
                />
              </div>

              {photosLoading ? (
                <div className="flex items-center justify-center py-12 text-white/30 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Yüklənir...
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-white/20 text-sm">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-30" />
                  <p>Şəkil tapılmadı</p>
                  <p className="text-white/15 text-[11px] mt-1">
                    {allPhotos.length === 0
                      ? "Media kitabxanası boşdur. 'Yeni Şəkil Yüklə' tabından əlavə edin."
                      : `"${selectedSection}" bölməsində şəkil yoxdur. Başqa bölmə seçin.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {filteredPhotos.map((photo) => {
                    const photoUrl = photo.url;
                    const photoName = photo.url.split("/").pop() || `photo-${photo.id}`;
                    return (
                      <button
                        key={photo.id}
                        onClick={() => {
                          onSelectMedia(photoUrl);
                          onClose();
                        }}
                        className="relative rounded-xl overflow-hidden border-2 border-transparent hover:border-[#C9A96E]/50 transition-all text-left group"
                      >
                        <div className="aspect-square bg-[#111]">
                          <img
                            src={photoUrl}
                            alt={photo.altAz || photo.alt || ""}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="px-1.5 py-1 bg-[#0A0A0A]">
                          <p className="text-white/30 text-[9px] truncate font-mono">{photoName}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Upload Tab */
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-[#C9A96E]" />
              </div>
              <div className="text-center">
                <p className="text-white text-sm font-medium">Şəkil Yüklə</p>
                <p className="text-white/30 text-[11px] mt-1">Max 3MB, JPG/PNG/WEBP — avtomatik "Menu" bölməsinə əlavə olunacaq</p>
              </div>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    onUpload(e);
                    onClose();
                  }}
                />
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A96E] text-[#0A0A0A] text-xs font-bold hover:bg-[#B8985E] transition-all cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Fayl Seç
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#222] shrink-0 flex items-center justify-between">
          <p className="text-white/25 text-[11px]">
            {tab === "library"
              ? `${filteredPhotos.length} / ${sectionCounts[selectedSection] ?? 0} şəkil (${selectedSection})`
              : "Max 3MB"}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-white/40 text-xs border border-[#222] rounded-lg hover:border-white/20 transition-all"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ITEM EDIT FORM — always renders 2 hardcoded branch rows
   ═══════════════════════════════════════════════════════════════ */

function ItemEdit({ tab, catTitle, item, edit, updateItem, updateBranchItem, onClose, dbAssignments, serverMode }: {
  tab: TabType; catTitle: string; item: any; edit: any;
  updateItem: any; updateBranchItem: any; onClose: () => void;
  dbAssignments: Record<string, { imageUrl?: string; imageAlt?: string }>;
  serverMode?: boolean;
}) {
  const [langTab, setLangTab] = useState<LangTab>("az");
  const [form, setForm] = useState({
    price: edit?.price !== undefined ? edit.price : (item.price || ""),
    imageUrl: dbAssignments[`food:${catTitle}:${item.nameAz}`]?.imageUrl || dbAssignments[`food:${catTitle}:${normalizeKey(item.nameAz || "")}`]?.imageUrl || "",
    imageAltAz: edit?.image_alt_az !== undefined ? edit.image_alt_az : (item.imageAltAz || ""),
    imageAltRu: edit?.image_alt_ru !== undefined ? edit.image_alt_ru : (item.imageAltRu || ""),
    imageAltEn: edit?.image_alt_en !== undefined ? edit.image_alt_en : (item.imageAltEn || ""),
    nameAz: edit?.name_az !== undefined ? edit.name_az : (item.nameAz || ""),
    nameRu: edit?.name_ru !== undefined ? edit.name_ru : (item.nameRu || ""),
    nameEn: edit?.name_en !== undefined ? edit.name_en : (item.nameEn || ""),
    nameTr: edit?.name_tr !== undefined ? edit.name_tr : (item.nameTr || item.nameAz || ""),
    descAz: edit?.desc_az !== undefined ? edit.desc_az : (item.descAz || ""),
    descRu: edit?.desc_ru !== undefined ? edit.desc_ru : (item.descRu || ""),
    descEn: edit?.desc_en !== undefined ? edit.desc_en : (item.descEn || ""),
    descTr: edit?.desc_tr !== undefined ? edit.desc_tr : (item.descTr || item.descAz || ""),
    isNew: edit?.is_new ?? item.isNew ?? false,
    isMeat: edit?.is_meat ?? item.isMeat ?? false,
    isFish: edit?.is_fish ?? item.isFish ?? false,
    isVegetarian: edit?.is_vegetarian ?? item.isVegetarian ?? false,
    isHalal: edit?.is_halal ?? item.isHalal ?? false,
    isSpicy: edit?.is_spicy ?? item.isSpicy ?? false,
    isGlutenFree: edit?.is_gluten_free ?? item.isGlutenFree ?? false,
    isSugarFree: edit?.is_sugar_free ?? item.isSugarFree ?? false,
    isSnack: edit?.is_snack ?? item.isSnack ?? false,
    isActive: edit?.is_active !== undefined ? edit.is_active : (item.isActive !== false),
  });
  const [savedTo, setSavedTo] = useState<"" | "backend" | "local">("");
  const [showEditor, setShowEditor] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const utils = trpc.useUtils();
  const removePhotoApi = trpc.photoAssignments.remove.useMutation({
    onSuccess: () => {
      utils.photoAssignments.list.invalidate();
      utils.branchMenu.getMenuByBranch.invalidate();
      utils.menu.adminGetMenu.invalidate();
      utils.stats.invalidate();
    },
    onError: () => {
      alert("Fotoqraf silinə bilmədi");
    },
  });

  // Strip AZN suffix for clean numeric input values
  const stripAzn = (v: string) => v.replace(/\s*AZN\s*$/i, '').trim();

  // Branch state keyed by SLUG (stable, not numeric id)
  // Auto-initialize price from base price when branch price is empty
  const [branchStates, setBranchStates] = useState<Record<string, { available: boolean; price: string }>>(() => {
    const basePrice = stripAzn((edit?.price !== undefined ? edit.price : item.price) || "");
    const hasBasePrice = basePrice !== "";
    const initial: Record<string, { available: boolean; price: string }> = {};
    for (const b of FALLBACK_BRANCHES) {
      const be = getBranchItemEdit(tab, b.slug, catTitle, item.nameAz || "");
      const savedPrice = stripAzn(be?.branch_price ?? "");
      const price = savedPrice || (hasBasePrice ? basePrice : "");
      initial[b.slug] = {
        available: be?.is_available ?? true,
        price,
      };
    }
    return initial;
  });

  const uploadImageApi = trpc.media.uploadImage.useMutation();
  const createPhotoApi = trpc.photos.create.useMutation({
    onSuccess: () => {
      utils.photos.adminGetAll.invalidate();
    },
  });

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 3 * 1024 * 1024) { alert("Max 3MB"); return; }

    /* Step 1: Resize to base64 */
    const b64 = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          canvas.getContext("2d")?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      r.onerror = reject;
      r.readAsDataURL(f);
    });

    /* Step 2: Upload to Supabase → get public URL */
    try {
      const uploadRes = await uploadImageApi.mutateAsync({
        base64: b64,
        folder: "menu",
        fileName: f.name.replace(/[^a-zA-Z0-9._-]/g, "_"),
      });

      if (uploadRes.success && uploadRes.url) {
        /* Step 3: Save to DB with section="menu" */
        await createPhotoApi.mutateAsync({
          filename: uploadRes.url,
          section: "menu",
          altAz: item.nameAz || "",
          altRu: "",
          altEn: "",
        });
        /* Step 4: Set as product image */
        setForm(p => ({ ...p, imageUrl: uploadRes.url }));
      } else {
        /* Fallback: use base64 directly if upload fails */
        console.warn("[Upload] Supabase upload failed, using base64 fallback:", uploadRes.error);
        setForm(p => ({ ...p, imageUrl: b64 }));
      }
    } catch (err: any) {
      console.warn("[Upload] Error:", err?.message || err);
      /* Fallback: use base64 directly */
      setForm(p => ({ ...p, imageUrl: b64 }));
    }
  };

  const handleSave = () => {
    // Save branch data — localStorage always, backend if available
    for (const b of FALLBACK_BRANCHES) {
      const bs = branchStates[b.slug];
      if (!bs) continue;

      // Save to localStorage — numeric only, no AZN
      const cleanPrice = stripAzn(bs.price || "");
      saveBranchItemEdit(tab, b.slug, catTitle, item.nameAz || "", {
        is_available: bs.available,
        branch_price: cleanPrice || undefined,
      });

      // Save branch data to database (server mode only)
      if (serverMode && item.id && item.id < 100000) {
        updateBranchItem.mutate({
          menuItemId: item.id,
          branchId: b.id === "white_city" ? 1 : 2,
          isAvailable: bs.available,
          branchPrice: stripAzn(bs.price || "") || null,
        });
      }
    }

    // Save item-level data to database (server mode only)
    if (serverMode && item.id && item.id < 100000) {
      updateItem.mutate({
        id: item.id,
        price: form.price || null,
        imageUrl: form.imageUrl || undefined,
        imageAltAz: form.imageAltAz || undefined,
        imageAltRu: form.imageAltRu || undefined,
        imageAltEn: form.imageAltEn || undefined,
        nameAz: form.nameAz || undefined,
        nameRu: form.nameRu || undefined,
        nameEn: form.nameEn || undefined,
        nameTr: form.nameTr || undefined,
        descAz: form.descAz || undefined,
        descRu: form.descRu || undefined,
        descEn: form.descEn || undefined,
        descTr: form.descTr || undefined,
        isNew: form.isNew,
        isMeat: form.isMeat,
        isFish: form.isFish,
        isVegetarian: form.isVegetarian,
        isHalal: form.isHalal,
        isSpicy: form.isSpicy,
        isGlutenFree: form.isGlutenFree,
        isSugarFree: form.isSugarFree,
        isSnack: form.isSnack,
        isActive: form.isActive,
      }, {
        onSuccess: () => {
          setSavedTo("backend");
          // Close edit panel after brief delay so user sees "Saved" feedback
          setTimeout(() => onClose(), 800);
        },
        onError: () => {
          saveToLocal();
          setSavedTo("local");
        },
      });
    } else {
      saveToLocal();
      setSavedTo("local");
    }
  };

  const saveToLocal = () => {
    saveMenuEdit(tab, catTitle, item.nameAz || "", {
      price: stripAzn(form.price || "") || null,
      image_url: form.imageUrl || undefined,
      image_alt_az: form.imageAltAz || undefined,
      image_alt_ru: form.imageAltRu || undefined,
      image_alt_en: form.imageAltEn || undefined,
      name_az: form.nameAz || undefined,
      name_ru: form.nameRu || undefined,
      name_en: form.nameEn || undefined,
      name_tr: form.nameTr || undefined,
      desc_az: form.descAz || undefined,
      desc_ru: form.descRu || undefined,
      desc_en: form.descEn || undefined,
      desc_tr: form.descTr || undefined,
      is_new: form.isNew, is_meat: form.isMeat, is_fish: form.isFish,
      is_vegetarian: form.isVegetarian, is_halal: form.isHalal, is_spicy: form.isSpicy,
      is_gluten_free: form.isGlutenFree, is_sugar_free: form.isSugarFree, is_snack: form.isSnack,
      is_active: form.isActive,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-medium">{item.nameAz}</span>
        <button onClick={onClose} className="text-white/40"><X className="w-4 h-4" /></button>
      </div>

      {/* Price field — always show for shisha, conditionally for others */}
      {tab === "shisha" && (
        <div>
          <label className="block text-xs text-white/40 mb-1">Qiymət (AZN)</label>
          <input
            value={form.price}
            onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
            placeholder="e.g. 85"
            type="text"
            className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded focus:outline-none focus:border-[#C9A96E]"
          />
        </div>
      )}

      {/* Image upload + edit */}
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => setShowPhotoModal(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#C9A96E]/15 text-[#C9A96E] text-xs border border-[#C9A96E]/30 hover:bg-[#C9A96E]/25 transition-all"
        >
          <Upload className="w-3.5 h-3.5" /> Fotoğraf yükle
        </button>
        <span className="text-white/25 text-[10px]">Önerilen: 1200×1200 px kare, min 800×800 px, max 3 MB</span>
        {form.imageUrl && (
          <button onClick={() => setShowEditor(true)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-white/5 text-white/70 text-xs border border-white/10 hover:border-[#C9A96E]/30 hover:text-[#C9A96E]"><SlidersHorizontal className="w-3.5 h-3.5" /> Fotoğraf düzenle</button>
        )}
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onSelectMedia={(url) => setForm((p) => ({ ...p, imageUrl: url }))}
        onUpload={handleImage}
      />

      {/* Image editor modal */}
      {showEditor && form.imageUrl && (
        <ImageEditor
          imageSrc={form.imageUrl}
          onApply={(editedBase64) => {
            setForm(p => ({ ...p, imageUrl: editedBase64 }));
            setShowEditor(false);
          }}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {form.imageUrl && (
        <div className="space-y-2 max-w-full">
          <div className="flex gap-3 items-start max-w-full">
            <div className="w-16 h-16 rounded overflow-hidden bg-[#141414] shrink-0"><img src={form.imageUrl} alt="" className="w-full h-full object-cover object-center" /></div>
            <input value={form.imageUrl} onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))} placeholder="Image URL" className="flex-1 min-w-0 max-w-full px-3 py-1.5 bg-[#111] border border-[#333] text-white text-xs rounded truncate" />
          </div>
          {/* Collapsible alt text fields */}
          <details className="group">
            <summary className="text-white/30 text-[10px] cursor-pointer hover:text-white/50 select-none list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition-transform inline-block">▸</span>
              Alt metinler (SEO)
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 mt-1">
              <input value={form.imageAltAz} onChange={e => setForm(p => ({ ...p, imageAltAz: e.target.value }))} placeholder="Alt AZ" className="px-2 py-1 bg-[#111] border border-[#333] text-white text-xs rounded" />
              <input value={form.imageAltRu} onChange={e => setForm(p => ({ ...p, imageAltRu: e.target.value }))} placeholder="Alt RU" className="px-2 py-1 bg-[#111] border border-[#333] text-white text-xs rounded" />
              <input value={form.imageAltEn} onChange={e => setForm(p => ({ ...p, imageAltEn: e.target.value }))} placeholder="Alt EN" className="px-2 py-1 bg-[#111] border border-[#333] text-white text-xs rounded" />
            </div>
          </details>
        </div>
      )}

      {/* ═══ LANGUAGE TABS + NAME/DESC ═══ */}
      <div>
        {/* Language tab bar */}
        <div className="flex gap-1 bg-[#0A0A0A] rounded p-1 mb-3">
          {LANG_TABS.map(l => (
            <button
              key={l.key}
              onClick={() => setLangTab(l.key)}
              className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                langTab === l.key
                  ? "bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30"
                  : "text-white/40 hover:text-white/60 border border-transparent"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Name + desc for active language */}
        {langTab === "az" && (
          <div className="space-y-2">
            <input value={form.nameAz} onChange={e => setForm(p => ({ ...p, nameAz: e.target.value }))} placeholder="Ürün adı (AZ)" className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded" />
            <textarea value={form.descAz} onChange={e => setForm(p => ({ ...p, descAz: e.target.value }))} placeholder="Açıklama (AZ)" rows={2} className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded resize-none" />
          </div>
        )}
        {langTab === "ru" && (
          <div className="space-y-2">
            <input value={form.nameRu} onChange={e => setForm(p => ({ ...p, nameRu: e.target.value }))} placeholder="Название (RU)" className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded" />
            <textarea value={form.descRu} onChange={e => setForm(p => ({ ...p, descRu: e.target.value }))} placeholder="Описание (RU)" rows={2} className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded resize-none" />
          </div>
        )}
        {langTab === "en" && (
          <div className="space-y-2">
            <input value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} placeholder="Name (EN)" className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded" />
            <textarea value={form.descEn} onChange={e => setForm(p => ({ ...p, descEn: e.target.value }))} placeholder="Description (EN)" rows={2} className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded resize-none" />
          </div>
        )}
        {langTab === "tr" && (
          <div className="space-y-2">
            <input value={form.nameTr} onChange={e => setForm(p => ({ ...p, nameTr: e.target.value }))} placeholder="Ürün adı (TR)" className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded" />
            <textarea value={form.descTr} onChange={e => setForm(p => ({ ...p, descTr: e.target.value }))} placeholder="Açıklama (TR)" rows={2} className="w-full px-3 py-2 bg-[#111] border border-[#333] text-white text-sm rounded resize-none" />
          </div>
        )}
      </div>

      {/* ═══ BRANCH SECTION — always 2 rows, hardcoded ═══ */}
      <div className="p-3 bg-[#0A0A0A] rounded border border-[#222] space-y-3">
        <p className="text-[#C9A96E] text-xs font-medium uppercase tracking-wider">Şube Durumu ve Fiyatlar</p>
        {FALLBACK_BRANCHES.map(b => {
          const bs = branchStates[b.slug] || { available: true, price: "" };
          return (
            <div key={b.slug} className="flex items-center gap-3 min-w-0 flex-wrap">
              {/* Active/Passive toggle */}
              <button
                onClick={() => {
                  setBranchStates(prev => ({ ...prev, [b.slug]: { ...bs, available: !bs.available } }));
                }}
                className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${bs.available ? "bg-green-400/15 text-green-400 border-green-400/30" : "bg-red-400/15 text-red-400 border-red-400/30"}`}
              >
                {bs.available ? "Aktif" : "Pasif"}
              </button>
              {/* Branch name */}
              <span className="text-white text-xs shrink-0 min-w-[140px]">{b.name}</span>
              {/* Branch price */}
              <input
                value={bs.price}
                onChange={e => {
                  const clean = stripAzn(e.target.value);
                  setBranchStates(prev => ({ ...prev, [b.slug]: { ...bs, price: clean } }));
                }}
                placeholder="Fiyat"
                className="w-20 px-2 py-1 bg-[#111] border border-[#333] text-white text-xs rounded"
              />
              <span className="text-white/30 text-xs">AZN</span>
            </div>
          );
        })}
      </div>

      {/* Badge toggles — filtered by category type */}
      {(() => {
        const isDessert = (catTitle || "").toUpperCase().includes("ŞİRN");
        let badges: { key: string; label: string; color: string }[];
        if (isDessert) {
          badges = [
            { key: "isNew", label: "NEW", color: "bg-red-400/15 text-red-400 border-red-400/30" },
            { key: "isGlutenFree", label: "🌾 Glutensiz", color: "bg-teal-400/15 text-teal-300 border-teal-400/30" },
            { key: "isSugarFree", label: "🚫 Şəkərsiz", color: "bg-purple-400/15 text-purple-300 border-purple-400/30" },
          ];
        } else if (tab === "beverage") {
          badges = [
            { key: "isNew", label: "NEW", color: "bg-red-400/15 text-red-400 border-red-400/30" },
            { key: "isSpicy", label: "🌶️ Acılı", color: "bg-red-600/15 text-red-500 border-red-600/30" },
          ];
        } else if (tab === "shisha") {
          badges = [
            { key: "isNew", label: "NEW", color: "bg-red-400/15 text-red-400 border-red-400/30" },
          ];
        } else {
          badges = [
            { key: "isNew", label: "NEW", color: "bg-red-400/15 text-red-400 border-red-400/30" },
            { key: "isMeat", label: "🥩 Et", color: "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30" },
            { key: "isFish", label: "🐟 Balıq", color: "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30" },
            { key: "isVegetarian", label: "🥬 Vejetaryen", color: "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30" },
            { key: "isHalal", label: "☪ Helal", color: "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30" },
            { key: "isSpicy", label: "🌶️ Acılı", color: "bg-red-600/15 text-red-500 border-red-600/30" },
            { key: "isGlutenFree", label: "🌾 Gluten-free", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
            { key: "isSugarFree", label: "🚫 Şəkərsiz", color: "bg-blue-400/15 text-blue-300 border-blue-400/30" },
            { key: "isSnack", label: "🍿 Snack", color: "bg-orange-400/15 text-orange-300 border-orange-400/30" },
          ];
        }
        return (
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <button key={b.key} onClick={() => setForm(p => ({ ...p, [b.key]: !p[b.key as keyof typeof p] }))} className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${(form as any)[b.key] ? b.color : "bg-white/5 text-white/30 border-white/10"}`}>
                {b.label}
              </button>
            ))}
          </div>
        );
      })()}
      <div className="flex gap-2 items-center">
        <button onClick={handleSave} className="px-4 py-1.5 bg-[#C9A96E] text-[#0A0A0A] text-sm font-medium rounded-md hover:bg-[#B8985E]">Kaydet</button>
        {/* Photo Delete Button — always visible */}
        <button
          onClick={() => {
            if (!window.confirm("Fotoğraf silinsin?")) return;
            removePhotoApi.mutate({
              tab,
              catTitleAz: catTitle,
              itemNameAz: item.nameAz,
              branchSlug: "white-city",
            });
            setForm(p => ({ ...p, imageUrl: "" }));
          }}
          disabled={removePhotoApi.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600/15 text-red-400 text-sm font-medium rounded-md border border-red-500/30 hover:bg-red-600/25 hover:text-red-300 disabled:opacity-30 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {removePhotoApi.isPending ? "Silinir..." : "Fotoğrafı Sil"}
        </button>
      </div>
    </div>
  );
}
