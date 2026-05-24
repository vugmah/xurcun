import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router";
import { ArrowUp, Share2, Flame, Leaf, Beef, Fish, WheatOff, CandyOff, Moon } from "lucide-react";
import { useLanguage } from "../lib/LanguageContext";
import { trpc } from "../providers/trpc";
/* ─── Static tobacco brand lists (metadata — not menu items, no DB table exists) ─── */
const SHISHA_BESTSELLERS = [
  "Sherbetli — Lime Spiced Peach",
  "Sherbetli — Ice Berry",
  "Sherbetli — Feijoa",
  "Al Fakher — Grape",
  "Azure Gold Line — Lychee",
  "Musthave — Tropic Juice",
  "Starline — Pineapple",
  "White Angel — Original",
  "Adalya — N1",
];
const SHISHA_PREMIUM = [
  "Palitra Classic",
  "Darkside",
  "Sebero",
  "Musthave",
  "Sarma",
  "Tangiers",
];
const SHISHA_CLASSIC = [
  "Sherbetli",
  "Starline",
  "Al Fakher",
  "Blackburn",
  "Adalya",
  "Azure Gold Line",
];
import { formatPrice } from "../lib/formatPrice";
import { getEffectiveLayout, type TabType } from "../lib/menuStore";
import { getAssignedImage } from "../lib/imageStore";

import { getCategoryTitle as resolveCategoryTitle, getItemName as resolveItemName, getItemDesc as resolveItemDesc } from "../lib/menuData";
import { MenuBadgesQR, NewBadgeQR } from "../components/MenuBadges";
import { getBakuHour, isLateNight, reorderCategoriesForTime, getActiveTestTime, clearTestTime, hasTestTimeOverride } from "../lib/bakuTime";
import { getShishaDiscountStatus, formatDiscountBanner, formatDiscountInactive } from "../lib/shishaDiscountStore";
import SEO from "@/sections/SEO";

/* ─── Product slug for share URLs ─── */
function toProductSlug(nameAz: string): string {
  return nameAz
    .toLowerCase()
    .replace(/[ə]/g, "e")
    .replace(/[ıüöçşğ]/g, (c) => ({ ı: "i", ü: "u", ö: "o", ç: "c", ş: "s", ğ: "g" }[c] || c))
    .replace(/[ə]/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ─── Share text by language ─── */
function getShareText(productName: string, lang: Lang): string {
  const texts: Record<Lang, string> = {
    az: `Xurcun menyusundan bu məhsula baxın: ${productName}`,
    tr: `Xurcun menüsünde bu ürüne göz atın: ${productName}`,
    ru: `Посмотрите это блюдо в меню Xurcun: ${productName}`,
    en: `Check out this item on Xurcun menu: ${productName}`,
  };
  return texts[lang];
}

/* ═══ Skeleton Loading Cards — shown while data processes ═══ */
function SkeletonCard() {
  return (
    <div className="bg-[#111] rounded-lg border border-[#222] overflow-hidden animate-pulse">
      <div className="aspect-square bg-[#1A1A1A]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#1A1A1A] rounded w-3/4" />
        <div className="h-3 bg-[#1A1A1A] rounded w-1/3" />
      </div>
    </div>
  );
}

function SkeletonListItem() {
  return (
    <div className="flex gap-3 p-3 bg-[#111] rounded-lg border border-[#222] animate-pulse">
      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md bg-[#1A1A1A]" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3 bg-[#1A1A1A] rounded w-2/3" />
        <div className="h-3 bg-[#1A1A1A] rounded w-full" />
        <div className="h-3 bg-[#1A1A1A] rounded w-1/4" />
      </div>
    </div>
  );
}

/* ─── Product Share Button ─── */
function ProductShareButton({
  productName,
  productNameAz,
  branchSlug,
  menuType,
  categoryName,
  categoryDisplay,
  lang,
  compact = false,
}: {
  productName: string;
  productNameAz: string;
  branchSlug: string;
  menuType: string;
  categoryName: string;       // AZ title for URL/deep-link
  categoryDisplay?: string;   // Translated for display (optional)
  lang: Lang;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const isIOSBtn = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/.test(ua) || (ua.includes("AppleWebKit") && !ua.includes("Chrome") && !ua.includes("Android"));
  }, []);
  const slug = toProductSlug(productNameAz);
  const shareUrl = `${window.location.origin}${window.location.pathname}#/menu/${branchSlug}?product=${slug}`;
  const shareText = getShareText(productName, lang);

  const handleShare = useCallback(async () => {
    // Track share event if helper available
    try {
      const track = (window as any).__trackEvent;
      if (typeof track === "function") {
        track("qr_product_share", {
          branch_slug: branchSlug,
          product_name: productNameAz,
          product_slug: slug,
          category_name: categoryName,
          menu_type: menuType,
        });
      }
    } catch { /* ignore tracking errors */ }

    // Web Share API (mobile native)
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: productName, text: shareText, url: shareUrl });
        return;
      } catch { /* user cancelled or error → fallback */ }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Final fallback: select text
      const ta = document.createElement("textarea");
      ta.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl, shareText, productName, productNameAz, slug, branchSlug, categoryName, menuType]);

  return (
    <div className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleShare}
        className={`shrink-0 rounded-full flex items-center justify-center ${isIOSBtn ? "" : "transition-all duration-100"} ${
          compact
            ? "w-10 h-10 bg-black/50 hover:bg-[#C9A96E]/30 border border-white/20 hover:border-[#C9A96E]/50"
            : "w-10 h-10 bg-black/50 hover:bg-[#C9A96E]/30 border border-white/20 hover:border-[#C9A96E]/50"
        }`}
        aria-label="Share"
        title="Paylaş"
      >
        <Share2 className={`${compact ? "w-4 h-4" : "w-4 h-4"} text-white/70 group-hover:text-[#C9A96E] transition-colors`} />
      </button>
      {copied && (
        <span className={`absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#C9A96E] text-[#0A0A0A] text-[10px] font-semibold px-3 py-1 rounded-full z-10 ${isIOSBtn ? "" : "shadow-lg"}`}>
          {lang === "az" ? "Link kopyalandı" : lang === "tr" ? "Link kopyalandı" : lang === "ru" ? "Ссылка скопирована" : "Link copied"}
        </span>
      )}
    </div>
  );
}

type Lang = "az" | "ru" | "en" | "tr";
type SectionKey = "food" | "beverage" | "shisha" | "snack";

interface QrItem {
  name_az: string; name_ru: string; name_en: string; name_tr?: string;
  name?: string;
  price?: string;
  desc_az?: string | null; desc_ru?: string | null; desc_en?: string | null; desc_tr?: string | null;
  image_url?: string;
  imageUrl?: string;
  is_new?: boolean; is_meat?: boolean; is_fish?: boolean;
  is_vegetarian?: boolean; is_halal?: boolean; is_spicy?: boolean; is_gluten_free?: boolean; is_sugar_free?: boolean; is_snack?: boolean; is_active?: boolean;
}

interface QrCategory {
  title_az: string; title_ru: string; title_en: string; title_tr?: string;
  sortOrder?: number;
  items: QrItem[];
}

/* ─── Dietary Icons: compact inline badges ─── */
function DietaryIcons({ item, compact = false }: { item: QrItem; compact?: boolean }) {
  const size = compact ? "w-3.5 h-3.5" : "w-4 h-4";
  const iconClass = `${size} shrink-0`;

  const flags = [
    { key: "is_spicy" as const, Icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10", label_az: "Acılı" },
    { key: "is_meat" as const, Icon: Beef, color: "text-red-500", bg: "bg-red-500/10", label_az: "Ət" },
    { key: "is_fish" as const, Icon: Fish, color: "text-sky-400", bg: "bg-sky-400/10", label_az: "Balıq" },
    { key: "is_vegetarian" as const, Icon: Leaf, color: "text-emerald-400", bg: "bg-emerald-400/10", label_az: "Vegeterian" },
    { key: "is_halal" as const, Icon: Moon, color: "text-emerald-500", bg: "bg-emerald-500/10", label_az: "Halal" },
    { key: "is_gluten_free" as const, Icon: WheatOff, color: "text-amber-400", bg: "bg-amber-400/10", label_az: "Qlutensiz" },
    { key: "is_sugar_free" as const, Icon: CandyOff, color: "text-pink-400", bg: "bg-pink-400/10", label_az: "Şəkərsiz" },
  ];

  const active = flags.filter((f) => (item as any)[f.key] === true);
  if (active.length === 0) return null;

  return (
    <div className={`flex items-center flex-wrap ${compact ? "gap-1 mt-1" : "gap-1.5 mt-1.5"}`}>
      {active.map((f) => {
        const Icon = f.Icon;
        return (
          <span
            key={f.key}
            className={`inline-flex items-center justify-center ${f.bg} ${f.color} rounded-full`}
            style={{
              width: compact ? "20px" : "22px",
              height: compact ? "20px" : "22px",
            }}
            title={f.label_az}
            aria-label={f.label_az}
            role="img"
          >
            <Icon className={iconClass} strokeWidth={2.5} />
          </span>
        );
      })}
    </div>
  );
}

function useMenuLang() {
  const ctx = useLanguage();
  return { lang: ctx.lang as Lang, setLang: ctx.setLang as (l: Lang) => void };
}

/* ─── Translation resolvers: resolveCategoryTitle, resolveItemName, resolveItemDesc
     imported from menuData.ts. Fallback: selected → EN → AZ → RU ─── */

/* ─── Force re-render on: focus, hash change, visibility change ─── */
function useForceUpdateOnRelevantEvents() {
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);
  useEffect(() => {
    window.addEventListener("focus", forceUpdate);
    window.addEventListener("hashchange", forceUpdate);
    document.addEventListener("visibilitychange", forceUpdate);
    return () => {
      window.removeEventListener("focus", forceUpdate);
      window.removeEventListener("hashchange", forceUpdate);
      document.removeEventListener("visibilitychange", forceUpdate);
    };
  }, []);
  return forceUpdate;
}

/* ─── No localStorage overlay — DB is source of truth ─── */
function getItemEdits(_tab: SectionKey, _catTitle: string, _itemNameAz: string) {
  return {
    price: undefined,
    is_new: false,
    is_meat: false,
    is_fish: false,
    is_vegetarian: false,
    is_halal: false,
    is_spicy: false,
    is_snack: false,
    image_url: undefined,
    is_active: undefined,
  };
}



/* ─── Build Snack items from food + beverage products (DB is source of truth) ─── */
function buildSnackData(food: QrCategory[], bev: QrCategory[]): QrCategory[] {
  const snackItems: (QrItem & { _origCatTitle?: string; _origTab?: string })[] = [];
  [...food, ...bev].forEach(cat => {
    const tab = food.includes(cat) ? "food" : "beverage";
    cat.items.forEach(item => {
      if (item.is_snack === true) {
        snackItems.push({ ...item, _origCatTitle: cat.title_az, _origTab: tab });
      }
    });
  });
  if (snackItems.length === 0) return [];
  return [{ title_az: "Snack", title_ru: "Снэк", title_en: "Snack", title_tr: "Snack", items: snackItems as QrItem[] }];
}

export default function QRMenuPage() {
  const { lang, setLang } = useMenuLang();

  // ─── Track QR menu open on mount (lazy-loaded, non-blocking) ───
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const branch = params.get('branch') || 'white-city';
    import("@/lib/tracking").then(({ trackQrPageView }) => {
      trackQrPageView("food", branch);
    }).catch(() => { /* silently fail if tracking not loaded */ });
  }, []);

  const [active, setActive] = useState<SectionKey>(isLateNight() ? "snack" : "food");
  const [activeCat, setActiveCat] = useState(0);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devTestTime, setDevTestTime] = useState("");
  const [, setDevTick] = useState(0);
  const [imgAssignTick, setImgAssignTick] = useState(0); // force re-render after photo assignments sync
  const catRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chipContainerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(120);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // React Router re-renders on route change → getItemEdits reads fresh localStorage
  const location = useLocation();

  // Also force re-render on focus/visibility (returning from other browser tab)
  useForceUpdateOnRelevantEvents();

  /* ─── Fetch photo assignments — cached, no refetch ─── */
  const { data: photoAssignmentsData } = trpc.photoAssignments.list.useQuery({}, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  useEffect(() => {
    /* Clear any stale localStorage so old browser cache doesn't interfere */
    import("@/lib/imageStore").then((mod) => {
      if (mod.clearOptimisticAssignments) mod.clearOptimisticAssignments();
    });
    if (photoAssignmentsData?.assignments) {
      import("@/lib/imageStore").then((mod) => {
        if (mod.syncAssignments) mod.syncAssignments(photoAssignmentsData.assignments);
        /* ─── Sync without clearing cache — merge new assignments ─── */
        setImgAssignTick((v) => v + 1);
      });
    }
  }, [photoAssignmentsData]);

  // Back to top button visibility — throttled to ~10fps
  const [showBackToTop, setShowBackToTop] = useState(false);
  /* ─── Product detail modal state ─── */
  type ProductDetail = {
    name: string;
    nameAz: string;
    desc: string;
    price: string | null;
    imageUrl: string;
    hasImage: boolean;
    categoryName: string;
    categoryDisplay: string;
    tab: SectionKey;
  } | null;
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail>(null);
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setShowBackToTop(window.scrollY > 300);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ═══════════════════════════════════════════════
  // BRANCH: read slug from URL, default to white-city
  // ═══════════════════════════════════════════════
  const params = useParams<{ branchSlug?: string }>();
  const branchSlug = params.branchSlug || "white-city";

  // ═══════════════════════════════════════════════
  // DATA: static first → API bg fetch → localStorage edits
  // ═══════════════════════════════════════════════

  // DB-only: start empty, fill from API
  const [foodData, setFoodData] = useState<QrCategory[]>([]);
  const [bevData, setBevData] = useState<QrCategory[]>([]);
  const [shishaApiData, setShishaApiData] = useState<QrCategory[]>([]);
  const [shishaLoading, setShishaLoading] = useState(true);

  useEffect(() => {
    document.documentElement.style.overflowY = "auto";
    document.body.style.overflowY = "auto";
    document.body.style.position = "static";
    return () => {
      document.documentElement.style.overflowY = "";
      document.body.style.overflowY = "";
      document.body.style.position = "";
    };
  }, []);

  // 2. Fetch API — use branchMenu when branchSlug provided, else menu.getMenu
  const useBranchApi = !!params.branchSlug;

  // Active tab state for lazy loading
  const activeTab = active;

  // Global menu (no branch context) — lazy: only fetch active tab
  const apiFood = trpc.menu.getMenu.useQuery(
    { tab: "food" },
    { retry: false, refetchOnWindowFocus: false, staleTime: Infinity, enabled: !useBranchApi && (activeTab === "food" || (activeTab as string) === "alacarte") }
  );
  const apiBev = trpc.menu.getMenu.useQuery(
    { tab: "beverage" },
    { retry: false, refetchOnWindowFocus: false, staleTime: Infinity, enabled: !useBranchApi && (activeTab === "beverage" || (activeTab as string) === "drink") }
  );

  // Branch-specific menu — lazy: only fetch active tab
  const branchFood = trpc.branchMenu.getMenuByBranch.useQuery(
    { branchSlug, tab: "food" },
    { retry: false, refetchOnWindowFocus: false, staleTime: Infinity, enabled: useBranchApi && (activeTab === "food" || (activeTab as string) === "alacarte") }
  );
  const branchBev = trpc.branchMenu.getMenuByBranch.useQuery(
    { branchSlug, tab: "beverage" },
    { retry: false, refetchOnWindowFocus: false, staleTime: Infinity, enabled: useBranchApi && (activeTab === "beverage" || (activeTab as string) === "drink") }
  );

  // Shisha — lazy: only fetch when shisha tab active
  const apiShisha = trpc.menu.getMenu.useQuery(
    { tab: "shisha" },
    { retry: false, refetchOnWindowFocus: false, staleTime: Infinity, enabled: !useBranchApi && activeTab === "shisha" }
  );
  const branchShisha = trpc.branchMenu.getMenuByBranch.useQuery(
    { branchSlug, tab: "shisha" },
    { retry: false, refetchOnWindowFocus: false, staleTime: Infinity, enabled: useBranchApi && activeTab === "shisha" }
  );

  // Transform API response to QR format
  function apiToQr(apiData: any[]): QrCategory[] {
    return apiData.map((cat: any) => ({
      title_az: cat.titleAz || "",
      title_ru: cat.titleRu || "",
      title_en: cat.titleEn || "",
      title_tr: cat.titleTr || "",
      items: (cat.items || []).map((it: any) => ({
        name_az: it.nameAz || "",
        name_ru: it.nameRu || "",
        name_en: it.nameEn || "",
        name_tr: it.nameTr || "",
        price: it.price || null,
        desc_az: it.descAz ?? null,
        desc_ru: it.descRu ?? null,
        desc_en: it.descEn ?? null,
        desc_tr: it.descTr ?? null,
        image_url: it.imageUrl || "",
        image_alt_az: it.imageAltAz || "",
        image_alt_ru: it.imageAltRu || "",
        image_alt_en: it.imageAltEn || "",
        is_new: it.isNew ?? false,
        is_meat: it.isMeat ?? false,
        is_fish: it.isFish ?? false,
        is_vegetarian: it.isVegetarian ?? false,
        is_halal: it.isHalal ?? false,
        is_spicy: it.isSpicy ?? false,
        is_active: it.isActive ?? true,
        is_gluten_free: it.isGlutenFree ?? false,
        is_sugar_free: it.isSugarFree ?? false,
        is_snack: it.isSnack ?? false,
      })),
    }));
  }

  // Transform branchMenu response to QR format
  function branchToQr(apiData: any): QrCategory[] {
    const cats = apiData?.categories || [];
    return cats.map((cat: any) => ({
      title_az: cat.titleAz || "",
      title_ru: cat.titleRu || "",
      title_en: cat.titleEn || "",
      title_tr: cat.titleTr || "",
      items: (cat.items || []).map((it: any) => ({
        name_az: it.nameAz || "",
        name_ru: it.nameRu || "",
        name_en: it.nameEn || "",
        name_tr: it.nameTr || "",
        price: it.finalPrice || it.price || null,
        desc_az: it.descAz ?? null,
        desc_ru: it.descRu ?? null,
        desc_en: it.descEn ?? null,
        desc_tr: it.descTr ?? null,
        image_url: it.imageUrl || "",
        image_alt_az: it.imageAltAz || "",
        image_alt_ru: it.imageAltRu || "",
        image_alt_en: it.imageAltEn || "",
        is_new: it.isNew ?? false,
        is_meat: it.isMeat ?? false,
        is_fish: it.isFish ?? false,
        is_vegetarian: it.isVegetarian ?? false,
        is_halal: it.isHalal ?? false,
        is_spicy: it.isSpicy ?? false,
        is_active: it.isActive ?? true,
        is_gluten_free: it.isGlutenFree ?? false,
        is_sugar_free: it.isSugarFree ?? false,
        is_snack: it.isSnack ?? false,
      })),
    }));
  }

  useEffect(() => {
    if (useBranchApi) {
      const d = branchFood.data;
      if (d && d.categories && d.categories.length > 0) {
        setFoodData(branchToQr(d));
      }
    } else {
      const d = apiFood.data;
      if (d && Array.isArray(d) && d.length > 0 && d.some((c: any) => c.items?.length > 0)) {
        setFoodData(apiToQr(d));
      }
    }
  }, [apiFood.data, branchFood.data, useBranchApi]);

  useEffect(() => {
    if (useBranchApi) {
      const d = branchBev.data;
      if (d && d.categories && d.categories.length > 0) {
        setBevData(branchToQr(d));
      }
    } else {
      const d = apiBev.data;
      if (d && Array.isArray(d) && d.length > 0 && d.some((c: any) => c.items?.length > 0)) {
        setBevData(apiToQr(d));
      }
    }
  }, [apiBev.data, branchBev.data, useBranchApi]);

  // Shisha: populate from API
  useEffect(() => {
    const isLoading = useBranchApi ? branchShisha.isLoading : apiShisha.isLoading;
    const isError = useBranchApi ? branchShisha.isError : apiShisha.isError;
    const d = useBranchApi ? branchShisha.data : apiShisha.data;

    if (isLoading) {
      setShishaLoading(true);
      // Timeout guard — force loading off after 8s even if query hangs
      const timeoutId = setTimeout(() => setShishaLoading(false), 8000);
      return () => clearTimeout(timeoutId);
    }

    // Query completed (success or error) — stop loading
    setShishaLoading(false);

    if (isError || !d) return;

    if (useBranchApi) {
      if ((d as any).categories && (d as any).categories.length > 0) {
        setShishaApiData(branchToQr(d));
      }
    } else {
      if (Array.isArray(d) && d.length > 0 && d.some((c: any) => c.items?.length > 0)) {
        setShishaApiData(apiToQr(d));
      }
    }
  }, [apiShisha.data, apiShisha.isLoading, apiShisha.isError, branchShisha.data, branchShisha.isLoading, branchShisha.isError, useBranchApi]);

  function getQrStickyOffset(): number {
    // Safe hardcoded offset — covers tabs (40px) + chips (44px) + breathing room
    // Matches the CSS padding-top on .qr-content
    return 110;
  }

  // Cross-browser safe scrollTo with smooth fallback
  function safeScrollTo(top: number) {
    try {
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    } catch {
      // Safari / old browsers that don't support smooth scroll
      window.scrollTo(0, Math.max(0, top));
    }
  }

  // Time-based tab order: day=ALC,BEV,SHI,SNK / night=SNK,BEV,SHI,ALC
  const tabs: SectionKey[] = isLateNight()
    ? ["snack", "beverage", "shisha", "food"]
    : ["food", "beverage", "shisha", "snack"];

  const t = useMemo(() => ({
    food: lang === "az" ? "Yemək" : lang === "ru" ? "Еда" : lang === "tr" ? "Yemek" : "Food",
    beverage: lang === "az" ? "İçki" : lang === "ru" ? "Напитки" : lang === "tr" ? "İçecekler" : "Beverages",
    shisha: lang === "az" ? "Qəlyan" : lang === "ru" ? "Кальян" : lang === "tr" ? "Nargile" : "Shisha",
    snack: lang === "az" ? "Snack" : lang === "ru" ? "Снэк" : lang === "tr" ? "Snack" : "Snack",
    hookahPrices: lang === "az" ? "Qəlyan Qiymətləri" : lang === "ru" ? "Цены на кальян" : lang === "tr" ? "Nargile Fiyatları" : "Hookah Prices",
    bestSellers: lang === "az" ? "Ən Çox Seçilənlər" : lang === "ru" ? "Популярные" : lang === "tr" ? "En Çok Tercih Edilenler" : "Best Sellers",
    premium: lang === "az" ? "Premium Tütün" : lang === "ru" ? "Премиум табак" : lang === "tr" ? "Premium Tütün" : "Premium Tobacco",
    classic: lang === "az" ? "Klassik Tütün" : lang === "ru" ? "Классический табак" : lang === "tr" ? "Klasik Tütün" : "Classic Tobacco",
    premiumNote: lang === "az" ? "Menyuda göstərilməyən tütün çeşidləri üçün qəlyançımızdan məlumat ala bilərsiniz. İstəyinizə uyğun olaraq fərqli tütün qarışıqları ilə xüsusi qəlyan hazırlaya bilərik." : lang === "ru" ? "Если вы не нашли нужный табак в меню, уточните наличие у нашего кальянного мастера. Мы можем приготовить кальян с различными табачными миксами по вашему вкусу." : lang === "tr" ? "Menüde görmediğiniz tütün çeşitleri için nargile ekibimizden bilgi alabilirsiniz. İsteğinize uygun farklı tütün karışımlarıyla özel nargile hazırlayabiliriz." : "For tobacco options not listed on the menu, please ask our shisha team. We can prepare a custom shisha with different tobacco blends according to your taste.",
    allPrices: lang === "az" ? "Bütün qiymətlər AZN ilə göstərilib." : lang === "ru" ? "Все цены указаны в AZN." : lang === "tr" ? "Tüm fiyatlar AZN olarak gösterilmiştir." : "All prices are in AZN.",
    serviceNote: lang === "az" ? "Qeyd: Hesabınıza 10% servis haqqı əlavə olunur. Allergiyanız varsa, zəhmət olmasa garsonlarımıza məlumat verin." : lang === "ru" ? "Примечание: к вашему счету добавляется 10% сервисный сбор. Если у вас есть аллергия, пожалуйста, сообщите нашим официантам." : lang === "tr" ? "Not: Hesabınıza %10 servis ücreti eklenecektir. Alerjiniz varsa, lütfen garsonlarımıza bilgi verin." : "Note: A 10% service charge will be added to your bill. If you have any allergies, please inform our waiters.",
    snackNote: lang === "az" ? "Bu menyu saat 23:00-dan sonra aktivdir." : lang === "ru" ? "Это меню доступно после 23:00." : lang === "tr" ? "Bu menü saat 23:00'ten sonra aktiftir." : "This menu is available after 23:00.",
    scanQr: lang === "az" ? "Menyunu açmaq üçün telefonunuzla skan edin" : lang === "ru" ? "Отсканируйте телефоном, чтобы открыть меню" : lang === "tr" ? "Menüyü açmak için telefonunuzla tarayın" : "Scan with your phone to open the menu",
    lateNightNote: lang === "az" ? "Tam mətbəx menyusu saat 08:00–23:00 arası aktivdir. Saat 23:00-dan sonra Snack menyudan sifariş verə bilərsiniz." : lang === "ru" ? "Основное меню кухни доступно с 08:00 до 23:00. После 23:00 вы можете заказать из снэк-меню." : lang === "tr" ? "Tam mutfak menüsü 08:00–23:00 arasında aktiftir. Saat 23:00'ten sonra Snack menüden sipariş verebilirsiniz." : "The full kitchen menu is available from 08:00 to 23:00. After 23:00, you can order from the Snack menu.",
  }), [lang]);

  // ═══ PRECOMPUTE ALL CATEGORY DATA ONCE — tab switch just selects from cache ═══
  const categoryCache = useMemo(() => {
    // Food: time-reordered (breakfast first before 12:30) + sortOrder
    const { categories: reorderedFood, defaultIndex: foodDefaultIdx } = reorderCategoriesForTime(foodData);
    // Beverage: sort by sortOrder
    const beverageCats = [...bevData].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    // Snack: derived from food + beverage
    const snackCats = buildSnackData(foodData, bevData);
    // Shisha: sort by sortOrder, then split into priced devices vs unpriced flavor options
    const sortedShisha = [...shishaApiData].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const shishaItems = sortedShisha.flatMap((cat: any) => cat.items);
    const shishaDevices = shishaItems.filter((item: any) => item.price && item.price !== "0" && item.price !== "");
    const shishaFlavors = shishaItems.filter((item: any) => !item.price || item.price === "0" || item.price === "");
    return {
      food: reorderedFood,
      foodDefaultIdx,
      beverage: beverageCats,
      snack: snackCats,
      shisha: shishaItems,
      shishaDevices,
      shishaFlavors,
    };
  }, [foodData, bevData, shishaApiData, branchSlug]);

  const data = active === "food" ? categoryCache.food : active === "beverage" ? categoryCache.beverage : active === "snack" ? categoryCache.snack : [];

/* ═══ Memoized styles — prevent CSS recreation on every render ═══
    iOS-safe mode: disables ALL GPU-heavy effects to prevent compositing crashes.
    Activated automatically when .ios-safe class is present on the root container.
    ═══════════════════════════════════════════════════════════════════ */
const MemoizedStyles = React.memo(function MemoizedStyles() {
  return <style dangerouslySetInnerHTML={{ __html: `
    .qr-highlight-gold {
      box-shadow: 0 0 0 1px rgba(210,170,95,0.7), 0 0 24px rgba(210,170,95,0.22), 0 0 60px rgba(210,170,95,0.08);
      background: rgba(210,170,95,0.06) !important;
      animation: qr-highlight-pulse 0.3s ease-out;
    }
    @keyframes qr-highlight-pulse {
      0% { box-shadow: 0 0 0 0 rgba(210,170,95,0); background: rgba(210,170,95,0); }
      50% { box-shadow: 0 0 0 1px rgba(210,170,95,0.9), 0 0 32px rgba(210,170,95,0.35), 0 0 80px rgba(210,170,95,0.15); background: rgba(210,170,95,0.1); }
      100% { box-shadow: 0 0 0 1px rgba(210,170,95,0.7), 0 0 24px rgba(210,170,95,0.22), 0 0 60px rgba(210,170,95,0.08); background: rgba(210,170,95,0.06); }
    }
    .qr-highlight-fade {
      box-shadow: 0 0 0 0 rgba(210,170,95,0) !important;
      background: rgba(210,170,95,0) !important;
      transition: all 1.5s ease !important;
    }
    .qr-cat-section { scroll-margin-top: calc(var(--header-height, 130px) + 10px); }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }

    /* ═══════════════════════════════════════════════
       iOS SAFE MODE — force simple block rendering
       No compositing layers, no GPU crashes
       ═══════════════════════════════════════════════ */
    .ios-safe * {
      transition: none !important;
      animation: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      filter: none !important;
      -webkit-filter: none !important;
      will-change: auto !important;
      transform: none !important;
      perspective: none !important;
    }
    /* Preserve essential UI state changes — very minimal */
    .ios-safe .qr-highlight-gold {
      border: 2px solid #C9A96E !important;
      background: rgba(201,169,110,0.1) !important;
      box-shadow: none !important;
      animation: none !important;
    }
    /* Keep images visible and properly sized */
    .ios-safe img {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
      -webkit-filter: none !important;
      will-change: auto !important;
    }
    /* Allow lazy images to fade in gently — but keep it simple */
    .ios-safe img[loading="lazy"] {
      opacity: 1 !important;
    }
    /* Modal overlay — keep functional but no blur */
    .ios-safe .bg-black\/85 {
      background: rgba(0,0,0,0.85) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    /* Preserve button tap feedback via opacity change only */
    .ios-safe button:active {
      opacity: 0.7 !important;
    }
    /* Force sticky elements to use simple positioning on iOS */
    @supports (-webkit-touch-callout: none) {
      .ios-safe .fixed { will-change: auto !important; }
      .ios-safe .sticky { will-change: auto !important; position: relative !important; }
    }
  `}} />;
});

  // Dynamic header height measurement — prevents text clipping under fixed header
  useEffect(() => {
    function measure() {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    return () => { window.removeEventListener("resize", measure); ro.disconnect(); };
  }, [active, data.length]);

  // Update default active category when food tab is selected (based on Baku time)
  useEffect(() => {
    if (active === "food") {
      setActiveCat(categoryCache.foodDefaultIdx);
    }
  }, [active, categoryCache.foodDefaultIdx]);

  // ─── Extract ?testTime= override for discount testing ───
  const urlTestTime = new URLSearchParams(location.search).get("testTime") || undefined;

  // ═══ SCROLL SPY: detect visible category section on scroll ═══
  useEffect(() => {
    if (active === "shisha" || active === "snack" || data.length === 0) return;

    const navH = 100; // approximate fixed nav height
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry (largest intersection ratio)
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        }
        if (best) {
          const idx = parseInt((best.target as HTMLElement).dataset.catIdx || "0", 10);
          if (!isNaN(idx)) {
            setActiveCat(idx);
          }
        }
      },
      {
        root: null,
        rootMargin: `-${navH}px 0px -60% 0px`,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe all category sections
    catRefs.current.forEach((el, i) => {
      if (el) {
        el.dataset.catIdx = String(i);
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [active, data.length]);

  // ═══ AUTO-SCROLL CHIP: when activeCat changes, scroll chip into view ═══
  useEffect(() => {
    if (active === "shisha" || active === "snack") return;
    const container = chipContainerRef.current;
    if (!container) return;

    // Find the active chip button
    const buttons = container.querySelectorAll("button");
    const activeBtn = buttons[activeCat];
    if (!activeBtn) return;

    // Instant scroll on iOS, smooth on desktop
    activeBtn.scrollIntoView({
      behavior: isIOS ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeCat, active, data.length]);

  // ─── Deep-link: ?product=slug → safe cross-tab search + highlight ───
  const deepLinkProcessed = useRef(false);
  useEffect(() => {
    // Only process once per mount to avoid loops
    if (deepLinkProcessed.current) return;

    try {
      const params = new URLSearchParams(location.search);
      const productSlug = params.get("product");
      if (!productSlug) return;

      deepLinkProcessed.current = true;

      // Search across all raw data sources (not reordered, to find the product)
      let foundTab: SectionKey | null = null;
      let foundCatIdx = 0;

      // Search food data
      for (let ci = 0; ci < foodData.length; ci++) {
        const cat = foodData[ci];
        if (!cat?.items) continue;
        for (const item of cat.items) {
          if (item?.name_az && toProductSlug(item.name_az) === productSlug) {
            foundTab = "food";
            foundCatIdx = ci;
            break;
          }
        }
        if (foundTab) break;
      }

      // Search beverage data
      if (!foundTab) {
        for (let ci = 0; ci < bevData.length; ci++) {
          const cat = bevData[ci];
          if (!cat?.items) continue;
          for (const item of cat.items) {
            if (item?.name_az && toProductSlug(item.name_az) === productSlug) {
              foundTab = "beverage";
              foundCatIdx = ci;
              break;
            }
          }
          if (foundTab) break;
        }
      }

      // Search shisha data (API source-of-truth)
      if (!foundTab && shishaApiData.length > 0) {
        for (const cat of shishaApiData) {
          for (const item of cat.items) {
            if (item?.name_az && toProductSlug(item.name_az) === productSlug) {
              foundTab = "shisha";
              foundCatIdx = 0;
              break;
            }
          }
          if (foundTab) break;
        }
      }

      // If found, switch tab
      if (foundTab) {
        setActive(foundTab);
        if (foundTab !== "shisha" && foundTab !== "snack") {
          setActiveCat(foundCatIdx);
        }
      }

      // Highlight (even if not found — shows user we tried)
      setHighlightedSlug(productSlug);
      setShowToast(true);
      const toastTimer = setTimeout(() => setShowToast(false), 2500);

      // Scroll after render settles
      const scrollTimer = setTimeout(() => {
        try {
          const el = itemRefs.current[productSlug];
          if (el) {
            const offset = getQrStickyOffset();
            const y = el.getBoundingClientRect().top + window.scrollY - offset;
            safeScrollTo(y);
          }
        } catch (_) { /* ignore scroll errors */ }
        // Fade highlight
        const fadeTimer = setTimeout(() => setHighlightedSlug(null), 3000);
        return () => clearTimeout(fadeTimer);
      }, 600);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(toastTimer);
      };
    } catch (err) {
      console.error("Deep link error:", err);
      deepLinkProcessed.current = true;
    }
  }, [location.search]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToCat = (i: number) => {
    const el = catRefs.current[i];
    if (!el) return;
    const offset = getQrStickyOffset();
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    safeScrollTo(y);
    // Track category click
    const cat = data[i];
    if (cat) {
      const track = (window as any).__trackEvent;
      if (typeof track === "function") {
        track("qr_category_click", { category: cat.title_az, index: i, tab: active });
      }
    }
  };

  // ═══ INSTANT TAB SWITCH: no smooth scroll, no heavy re-render ═══
  const switchTab = useCallback((tab: SectionKey) => {
    // Track QR tab click (lazy-loaded, non-blocking)
    import("@/lib/tracking").then(({ trackQrTabClick }) => {
      trackQrTabClick(tab, branchSlug);
    }).catch(() => { /* silently fail */ });
    // 1. Instant scroll to top (no smooth — eliminates visible delay)
    window.scrollTo(0, 0);
    // 2. Update active tab and reset category / highlight / product state
    setActive(tab);
    setActiveCat(0);
    setHighlightedSlug(null);
    setSelectedProduct(null);
  }, [branchSlug]);

  // Set CSS variable for dynamic header height — used by scroll-margin-top
  const containerStyle = { "--header-height": `${headerHeight}px` } as React.CSSProperties;

  // ─── iOS / WebView detection: enable safe rendering mode ───
  const isIOS = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod/.test(ua) || (ua.includes("AppleWebKit") && !ua.includes("Chrome") && !ua.includes("Android"));
  }, []);

  // ─── Persistent image lookup cache: survives tab switches, avoids 100+ localStorage reads ───
  const imgCacheRef = useRef(new Map<string, string | null>());
  const activeRef = useRef(active);
  activeRef.current = active; // always current — no stale closure
  const imageLookup = useMemo(() => ({
    get(catTitle: string, itemNameAz: string, overrideTab?: string): string | null {
      const tabKey = overrideTab || (activeRef.current === "snack" ? "food" : activeRef.current);
      const key = `${tabKey}:${catTitle}:${itemNameAz}`;
      const cached = imgCacheRef.current.get(key);
      if (cached !== undefined) return cached;
      const url = getAssignedImage(tabKey, catTitle, itemNameAz);
      imgCacheRef.current.set(key, url);
      return url;
    },
    clear() { imgCacheRef.current.clear(); },
  }), [imgAssignTick]);

  useEffect(() => {
    imageLookup.clear();
  }, [imageLookup, imgAssignTick]);

  return (
    <div className={`min-h-screen bg-[#0A0A0A] text-white ${isIOS ? "ios-safe" : ""}`} style={containerStyle}>
      {/* Premium highlight + toast styles — memoized to prevent re-creation */}
      <MemoizedStyles />
      <SEO page="qr" branchSlug={branchSlug} />
      {/* ════════════════════════════════════════════
          FIXED HEADER: Logo + Lang + Tabs + Chips
          Dynamic height — measured and applied to content offset.
          iOS: NO will-change (causes GPU compositing crash)
          ─────────────────────────────────────────── */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-[100] bg-[#050505] border-b border-[#222]">
        {/* Logo + Language selector */}
        <div className="max-w-lg mx-auto px-4 pt-3 pb-1.5">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg text-[#C9A96E] tracking-[0.15em]">XURCUN</h1>
            <div className="flex gap-1">
              {(["az", "ru", "en", "tr"] as Lang[]).map((l) => (
                <button key={l} onClick={() => { setLang(l); }} style={{ touchAction: 'manipulation' }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase select-none ${isIOS ? "" : "transition-all duration-100"} ${lang === l ? "bg-[#C9A96E]/20 text-[#C9A96E]" : "text-white/30 hover:text-white/60 active:text-white/60"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="max-w-lg mx-auto px-4 pt-1 pb-1.5">
          <div className="flex gap-2">
            {tabs.map((s) => (
              <button key={s} onClick={() => switchTab(s)} style={{ touchAction: 'manipulation' }}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium select-none ${isIOS ? "" : "transition-all duration-100"} ${active === s ? (s === "snack" ? "bg-orange-400 text-[#0A0A0A]" : "bg-[#C9A96E] text-[#0A0A0A]") : s === "snack" ? "bg-[#141414] text-orange-400/60 border border-orange-400/20 active:bg-orange-400/20" : "bg-[#141414] text-white/40 border border-[#222] active:bg-white/10"}`}>
                {t[s as keyof typeof t] || s}
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Chips */}
        {active !== "shisha" && active !== "snack" && data.length > 0 && (
          <div ref={navRef} className="border-t border-[#222]/50 py-1.5">
            <div className="max-w-lg mx-auto px-4">
              <div ref={chipContainerRef} data-qr-category-nav className="flex gap-2 overflow-x-auto scrollbar-hide">
                {data.map((cat, i) => (
                  <button key={i} onClick={() => scrollToCat(i)}
                    className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-medium select-none ${isIOS ? "" : "transition-all duration-100"} whitespace-nowrap ${
                      activeCat === i ? "bg-[#C9A96E]/20 text-[#C9A96E] border border-[#C9A96E]/30" : "bg-[#141414] text-white/40 border border-[#222] active:bg-white/10"
                    }`}>
                    {resolveCategoryTitle(cat, lang)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content — dynamic offset measured from actual fixed header height */}
      <main className={`max-w-lg mx-auto px-4 pb-6 ${isIOS ? "" : "transition-[padding-top] duration-100"}`} style={{ paddingTop: `${headerHeight + 12}px` }}>
        {active === "shisha" && (
          <p className="text-[11px] text-[#8A8A8A] italic mb-6 text-center">{t.premiumNote}</p>
        )}
        {active === "snack" && (
          <p className="text-[11px] text-orange-400/80 italic mb-6 text-center">{t.snackNote}</p>
        )}
        {active === "snack" && data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#8A8A8A]">{lang === "az" ? "Hal-hazırda snack mövcud deyil" : lang === "ru" ? "Снэки временно недоступны" : lang === "tr" ? "Şu anda snack mevcut değil" : "No snacks available at the moment"}</p>
          </div>
        )}
        {active === "food" && isLateNight() && (
          <p className="text-[11px] text-[#C9A96E]/80 italic mb-6 text-center">{t.lateNightNote}</p>
        )}

        {/* Food / Beverage / Snack — DIRECT RENDER: every item renders text immediately, only images lazy */}
        {active !== "shisha" && data.length > 0 && data.map((cat, i) => {
          const layout = getEffectiveLayout(active as TabType, cat.title_az, cat.items);
          return (
            <div key={i} ref={(el) => { catRefs.current[i] = el; }} className="mb-8 qr-cat-section">
              <h3 className="font-display text-lg text-[#C9A96E] mb-4 pb-2 border-b border-[#C9A96E]/20">
                {resolveCategoryTitle(cat, lang)}
              </h3>
              {layout === "card" ? (
                <div className="grid grid-cols-2 gap-3">
                  {cat.items.map((item, j) => {
                    const name = resolveItemName(item, lang) || item.name_az || "—";
                    const desc = resolveItemDesc(item, lang);
                    const price = item.price;
                    const slug = toProductSlug(item.name_az);
                    const isHighlighted = highlightedSlug === slug;
                    /* ─── PHOTO: API image_url first, then lookup fallback ─── */
                    const origTab = (item as any)._origTab;
                    const origCat = (item as any)._origCatTitle;
                    const lookupTab = origTab || active;
                    const lookupCat = origCat || cat.title_az;
                    const apiImg = item.imageUrl || item.image_url || "";
                    const lookupImg = imageLookup.get(lookupCat, item.name_az, lookupTab);
                    const imgUrl = apiImg || lookupImg;
                    const hasImage = !!imgUrl;
                    const productDetail: ProductDetail = { name, nameAz: item.name_az, desc: desc || "", price: price || null, imageUrl: imgUrl, hasImage, categoryName: lookupCat, categoryDisplay: resolveCategoryTitle(cat, lang), tab: lookupTab };
                    return (
                      <div key={j} className={`bg-[#111] rounded-lg border overflow-hidden ${isIOS ? "" : "transition-all duration-100"} cursor-pointer ${isHighlighted ? "qr-highlight-gold" : "border-[#222]"}`} onClick={() => setSelectedProduct(productDetail)}>
                        {hasImage ? (
                          <div className="relative bg-[#141414] overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                            <img src={imgUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover object-center" style={{ background: '#141414' }} onError={(e) => { const img = e.target as HTMLImageElement; if (!img.dataset.retried) { img.dataset.retried = "1"; setTimeout(() => { img.src = img.src + "?retry=1"; }, 2000); } else { img.style.display = 'none'; } }} />
                          </div>
                        ) : null}
                        <div className="p-2.5">
                          <span className="font-body text-xs text-white leading-tight block">{name}</span>
                          {desc && (
                            <p className="text-[10px] text-[#8A8A8A] mt-0.5 line-clamp-2">
                              {desc}
                            </p>
                          )}
                          {price && <span className="font-mono text-[11px] text-[#C9A96E] mt-0.5 block">{formatPrice(price)}</span>}
                          <DietaryIcons item={item} compact />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {cat.items.map((item, j) => {
                    const name = resolveItemName(item, lang) || item.name_az || "—";
                    const desc = resolveItemDesc(item, lang);
                    const price = item.price;
                    const slug = toProductSlug(item.name_az);
                    const isHighlighted = highlightedSlug === slug;
                    /* ─── PHOTO: API image_url first, then lookup fallback ─── */
                    const origTab = (item as any)._origTab;
                    const origCat = (item as any)._origCatTitle;
                    const lookupTab = origTab || active;
                    const lookupCat = origCat || cat.title_az;
                    const apiImg = item.imageUrl || item.image_url || "";
                    const lookupImg = imageLookup.get(lookupCat, item.name_az, lookupTab);
                    const imgUrl = apiImg || lookupImg;
                    const hasImage = !!imgUrl;
                    const productDetail: ProductDetail = { name, nameAz: item.name_az, desc: desc || "", price: price || null, imageUrl: imgUrl, hasImage, categoryName: lookupCat, categoryDisplay: resolveCategoryTitle(cat, lang), tab: lookupTab };
                    return (
                      <div key={j} className={`flex gap-3 p-3 bg-[#111] rounded-lg border ${isIOS ? "" : "transition-all duration-100"} cursor-pointer ${isHighlighted ? "qr-highlight-gold" : "border-[#222]"}`} onClick={() => setSelectedProduct(productDetail)}>
                        {hasImage ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-md overflow-hidden bg-[#141414]">
                            <img src={imgUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover object-center" style={{ background: '#141414' }} onError={(e) => { const img = e.target as HTMLImageElement; if (!img.dataset.retried) { img.dataset.retried = "1"; setTimeout(() => { img.src = img.src + "?retry=1"; }, 2000); } else { img.style.display = 'none'; } }} />
                          </div>
                        ) : null}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <span className="font-body text-sm text-white">{name}</span>
                            {desc && <p className="text-[11px] text-[#8A8A8A] mt-0.5">{desc}</p>}
                            <DietaryIcons item={item} compact />
                          </div>
                          {price && <span className="font-mono text-xs text-[#C9A96E] mt-1">{formatPrice(price)}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Service charge + allergy note — Food/Beverage/Snack */}
        {(active === "food" || active === "beverage" || active === "snack") && (
          <div className="my-6 py-4 border-t border-b border-[#222] text-center">
            <p className="text-[11px] text-[#8A8A8A] italic">{t.serviceNote}</p>
          </div>
        )}

        {/* Shisha */}
        {active === "shisha" && (
          <>
            {/* Shisha loading skeleton */}
            {shishaLoading && (
              <div className="space-y-3 mb-8">
                <div className="h-4 bg-[#1A1A1A] rounded w-1/3 animate-pulse" />
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </div>
            )}

            {!shishaLoading && (
            <div className="mb-8">
              <h3 className="font-display text-lg text-[#C9A96E] mb-4 pb-2 border-b border-[#C9A96E]/20">{t.hookahPrices}</h3>
              <div className="space-y-3">
                {categoryCache.shisha.length === 0 && (
                  <p className="text-sm text-[#8A8A8A] text-center py-4">{lang === "az" ? "Qəlyan məlumatları yüklənir..." : lang === "ru" ? "Загрузка данных кальяна..." : lang === "tr" ? "Nargile bilgileri yükleniyor..." : "Loading shisha information..."}</p>
                )}
                {/* PRICED DEVICES: Wookah, Hooky, Quasar — product cards */}
                {categoryCache.shishaDevices.map((h, i) => {
                  const itemNameAz = h.name_az || h.name;
                  const itemNameRu = h.name_ru || h.name;
                  const itemNameEn = h.name_en || h.name;
                  const displayPrice = h.price || null;
                  const lookupImg =
                    imageLookup.get("Qəlyan cihazları", itemNameAz, "shisha") ||
                    imageLookup.get("Qəlyan Qiymətləri", itemNameAz, "shisha") ||
                    imageLookup.get("Nargile Cihazları", itemNameAz, "shisha") ||
                    imageLookup.get("Nargile cihazları", itemNameAz, "shisha") ||
                    imageLookup.get("Hookah Prices", itemNameAz, "shisha");
                  const imgUrl = h.imageUrl || h.image_url || lookupImg || "";
                  const hasImage = !!imgUrl;
                  const displayName = lang === "ru" ? itemNameRu : (lang === "en" || lang === "tr") ? itemNameEn : itemNameAz;
                  const productSlug = toProductSlug(itemNameAz);
                  const isHighlighted = highlightedSlug === productSlug;
                  const shishaCatDisplay = lang === "ru" ? "Цены на кальян" : lang === "en" ? "Hookah Prices" : lang === "tr" ? "Nargile cihazları" : "Qəlyan cihazları";
                  const productDetail: ProductDetail = {
                    name: displayName,
                    nameAz: itemNameAz,
                    desc: "",
                    price: displayPrice,
                    imageUrl: imgUrl,
                    hasImage,
                    categoryName: "Qəlyan cihazları",
                    categoryDisplay: shishaCatDisplay,
                    tab: "shisha",
                  };
                  return (
                    <div
                      key={`dev-${i}`}
                      ref={(el) => { itemRefs.current[productSlug] = el; }}
                      className={`flex gap-3 p-3 bg-[#111] rounded-lg border ${isIOS ? "" : "transition-all duration-100"} cursor-pointer ${isHighlighted ? "qr-highlight-gold" : "border-[#222]"}`}
                      onClick={() => setSelectedProduct(productDetail)}
                    >
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-md overflow-hidden bg-[#141414]">
                        {hasImage ? (
                          <img
                            src={imgUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-center"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-[#141414]" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-start flex-wrap">
                              <span className="font-body text-sm text-white">{displayName}</span>
                              {(h as any).is_new && <NewBadgeQR />}
                            </div>
                            <MenuBadgesQR itemData={{
                              isNew: (h as any).is_new,
                              isMeat: (h as any).is_meat,
                              isFish: (h as any).is_fish,
                              isVegetarian: (h as any).is_vegetarian,
                              isHalal: (h as any).is_halal,
                              isSpicy: (h as any).is_spicy,
                              isSnack: (h as any).is_snack,
                            }} />
                          </div>
                          <ProductShareButton
                            productName={displayName}
                            productNameAz={itemNameAz}
                            branchSlug={branchSlug}
                            menuType="shisha"
                            categoryName="Qəlyan cihazları"
                            categoryDisplay={shishaCatDisplay}
                            lang={lang}
                            compact
                          />
                        </div>
                        {/* Shisha price — with discount support */}
                        {(() => {
                          const s = getShishaDiscountStatus(branchSlug, urlTestTime || undefined);
                          if (displayPrice && s.active && s.percent > 0) {
                            const discounted = Math.round(parseFloat(displayPrice) * (100 - s.percent) / 100 * 100) / 100;
                            return (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-xs text-white/30 line-through">{formatPrice(displayPrice)}</span>
                                <span className="font-mono text-xs text-[#C9A96E] font-bold">{formatPrice(discounted)}</span>
                                <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">-{s.percent}%</span>
                              </div>
                            );
                          }
                          return displayPrice ? (
                            <span className="font-mono text-xs text-[#C9A96E] mt-1">{formatPrice(displayPrice)}</span>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  );
                })}

                {/* UNPRICED FLAVORS: tobacco/aroma options — simple list */}
                {categoryCache.shishaFlavors.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-display text-sm text-[#8A8A8A] mb-3">
                      {lang === "az" ? "Tütün çeşidləri" : lang === "ru" ? "Вкусы табака" : lang === "tr" ? "Tütün çeşitleri" : "Tobacco flavors"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {categoryCache.shishaFlavors.map((f, i) => {
                        const name = lang === "ru" ? (f.name_ru || f.name) : (lang === "en" || lang === "tr") ? (f.name_en || f.name) : (f.name_az || f.name);
                        return (
                          <span key={`flv-${i}`} className="text-xs text-[#8A8A8A] bg-[#141414] px-3 py-1.5 rounded border border-[#222]">
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Shisha discount note — shows active range or inactive preview */}
              {(() => {
                const s = getShishaDiscountStatus(branchSlug, urlTestTime || undefined);
                if (!s.enabled || s.percent <= 0) return null;
                if (s.active) {
                  /* Active: show discount with time range */
                  return (
                    <div className="mt-4 p-3 bg-red-500/5 border border-red-500/15 rounded-lg text-center">
                      <p className="text-[11px] text-red-400/80 font-medium">
                        {formatDiscountBanner(s.percent, s.from, s.until, lang)}
                      </p>
                    </div>
                  );
                }
                /* Inactive but enabled: show upcoming hours (muted) */
                return (
                  <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-lg text-center">
                    <p className="text-[11px] text-white/25 font-medium">
                      {formatDiscountInactive(s.from, s.until, lang)}
                    </p>
                  </div>
                );
              })()}
            </div>
            )}

            <div className="mb-8">
              <h3 className="font-display text-lg text-white mb-4">{t.bestSellers}</h3>
              <div className="flex flex-wrap gap-2">
                {SHISHA_BESTSELLERS.map((s, i) => (
                  <span key={i} className="text-xs text-[#8A8A8A] bg-[#141414] px-3 py-1.5 rounded border border-[#222]">{s}</span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-display text-lg text-[#C9A96E] mb-3">{t.premium}</h3>
              <div className="flex flex-wrap gap-2">
                {SHISHA_PREMIUM.map((b, i) => (
                  <span key={i} className="font-mono text-xs text-white bg-[#141414] px-3 py-1.5 rounded border border-[#C9A96E]/20">{b}</span>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-display text-lg text-[#8A8A8A] mb-3">{t.classic}</h3>
              <div className="flex flex-wrap gap-2">
                {SHISHA_CLASSIC.map((b, i) => (
                  <span key={i} className="font-mono text-xs text-[#8A8A8A] bg-[#141414] px-3 py-1.5 rounded border border-white/10">{b}</span>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#8A8A8A] italic mb-6">{t.premiumNote}</p>
          </>
        )}

        {/* ═══ Developer / QA Mode: testTime override control ═══
             Toggle by clicking the corner indicator. Hidden from normal users.
             Allows setting testTime without URL param (survives navigation). */}
        <div className="mt-8 relative">
          {/* Toggle indicator — always visible when override is active */}
          <button
            onClick={() => setShowDevPanel(v => !v)}
            className={`w-full text-center py-1 text-[9px] uppercase tracking-wider select-none ${hasTestTimeOverride() ? "text-orange-400/50 hover:text-orange-400" : "text-white/10 hover:text-white/30"}`}
          >
            {hasTestTimeOverride()
              ? `QA: testTime=${getActiveTestTime()} (tap to ${showDevPanel ? "hide" : "edit"})`
              : showDevPanel ? "QA Tools (hide)" : "· · ·"}
          </button>

          {showDevPanel && (
            <div className="border border-[#333] rounded-lg p-3 bg-[#0D0D0D] space-y-2">
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">QA — testTime Override</p>

              {/* Set testTime */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="HH:mm (e.g. 02:00)"
                  value={devTestTime}
                  onChange={(e) => setDevTestTime(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && devTestTime) {
                      sessionStorage.setItem("testTime", devTestTime);
                      setDevTick(t => t + 1);
                      setDevTestTime("");
                      window.location.reload();
                    }
                  }}
                  className="flex-1 bg-[#1A1A1A] border border-[#333] rounded px-2 py-1 text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-[#C9A96E]/40"
                />
                <button
                  onClick={() => {
                    if (devTestTime) {
                      sessionStorage.setItem("testTime", devTestTime);
                      setDevTick(t => t + 1);
                      setDevTestTime("");
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1 rounded bg-[#C9A96E]/20 text-[#C9A96E] text-[10px] font-medium border border-[#C9A96E]/30 active:bg-[#C9A96E]/30"
                >
                  Set
                </button>
              </div>

              {/* Quick presets */}
              <div className="flex gap-1.5 flex-wrap">
                {["02:00", "23:30", "12:00", "08:00"].map(preset => (
                  <button
                    key={preset}
                    onClick={() => {
                      sessionStorage.setItem("testTime", preset);
                      setDevTick(t => t + 1);
                      window.location.reload();
                    }}
                    className="px-2 py-0.5 rounded bg-[#1A1A1A] text-[#8A8A8A] text-[10px] border border-[#222] hover:border-[#C9A96E]/20 active:bg-[#C9A96E]/10"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Clear + status */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-white/20">
                  {hasTestTimeOverride()
                    ? `Active: ${getActiveTestTime()} — snack=${isLateNight() ? "ON" : "off"}`
                    : "Using real Baku time"}
                </span>
                {hasTestTimeOverride() && (
                  <button
                    onClick={() => {
                      clearTestTime();
                      setDevTick(t => t + 1);
                      window.location.reload();
                    }}
                    className="px-2 py-0.5 rounded bg-red-500/10 text-red-400/70 text-[10px] border border-red-500/20 hover:bg-red-500/20 active:bg-red-500/30"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#222] text-center pb-8">
          <p className="font-display text-sm text-[#C9A96E]/40 tracking-[0.1em]">{branchSlug === "seabreeze" || branchSlug === "seabreeze-marina" ? "XURCUN SEABREEZE" : "XURCUN WHITE CITY"}</p>
          <p className="text-[10px] text-white/20 mt-1">{t.allPrices}</p>
        </div>
      </main>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => safeScrollTo(0)}
          className={`fixed bottom-24 right-5 z-50 w-12 h-12 rounded-full bg-[#C9A96E] text-[#0A0A0A] shadow-lg shadow-black/40 flex items-center justify-center ${isIOS ? "" : "transition-all hover:bg-[#D4A853] hover:scale-105 active:scale-95"}`}
          aria-label="Yuxari"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Toast: Shared product opened */}
      {showToast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-[#1A1A1A] border border-[#C9A96E]/40 text-[#C9A96E] text-xs font-medium px-4 py-2.5 rounded-full shadow-lg shadow-black/40 flex items-center gap-2 ${isIOS ? "" : "animate-in fade-in slide-in-from-top-2 duration-150"}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
          {lang === "az" ? "Məhsul açıldı" : lang === "tr" ? "Ürün açıldı" : lang === "ru" ? "Позиция открыта" : "Item opened"}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        branchSlug={branchSlug}
        lang={lang}
      />
    </div>
  );
}

/* ─── Product Detail Modal ───
   Tap product image/card to open.
   Tap modal/photo again to close.
   Tap outside overlay to close.
   No X button. Optional 6s auto-close. ─── */
function ProductDetailModal({
  product,
  onClose,
  branchSlug,
  lang,
}: {
  product: { name: string; nameAz: string; desc: string; price: string | null; imageUrl: string; hasImage: boolean; categoryName: string; categoryDisplay: string; tab: SectionKey } | null;
  onClose: () => void;
  branchSlug: string;
  lang: Lang;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");

  // Auto-close after 3 seconds
  useEffect(() => {
    timerRef.current = setTimeout(onClose, 3000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [onClose]);

  // ESC key closes
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    setImageFit(product?.tab === "shisha" ? "contain" : "cover");
  }, [product?.imageUrl, product?.tab]);

  if (!product) return null;

  const isShishaProduct = product.tab === "shisha";
  const useContainedImage = isShishaProduct || imageFit === "contain";

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 p-3 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 flex items-end sm:items-center justify-center p-3 sm:p-6">
        <div
          className="w-full sm:max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl rounded-t-2xl bg-[#111] border border-[#222] shadow-lg overflow-hidden overflow-y-auto"
          onClick={onClose}
        >
          {/* Product image */}
          <div className="relative h-[min(42vh,75vw)] min-h-[220px] max-h-[430px] bg-[#0A0A0A] overflow-hidden">
            {product.hasImage && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={useContainedImage ? "w-full h-full object-contain object-center" : "w-full h-full object-cover object-center"}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  if (!isShishaProduct && img.naturalWidth && img.naturalHeight) {
                    const ratio = img.naturalWidth / img.naturalHeight;
                    setImageFit(ratio < 1.05 || ratio > 1.65 ? "contain" : "cover");
                  }
                }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          {/* Product details */}
          <div className="p-5">
            <h2 className="font-display text-xl text-white tracking-wide mb-1">{product.name}</h2>
            <p className="text-[11px] text-[#C9A96E]/70 uppercase tracking-wider mb-3">{product.categoryDisplay}</p>

            {product.price && (
              <p className="font-mono text-lg text-[#C9A96E] font-bold mb-3">{formatPrice(product.price)}</p>
            )}

            {product.desc && (
              <p className="text-[13px] text-[#8A8A8A] leading-relaxed mb-4">{product.desc}</p>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-[#222]">
              <ProductShareButton
                productName={product.name}
                productNameAz={product.nameAz}
                branchSlug={branchSlug}
                menuType={product.tab}
                categoryName={product.categoryName}
                categoryDisplay={product.categoryDisplay}
                lang={lang}
              />
              <span className="text-[11px] text-[#555]">
                {lang === "az" ? "Dostlarınla paylaş" : lang === "tr" ? "Arkadaşlarınla paylaş" : lang === "ru" ? "Поделиться с друзьями" : "Share with friends"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Build trigger 1779081822
