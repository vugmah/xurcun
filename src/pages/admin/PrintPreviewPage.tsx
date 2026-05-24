import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ChevronLeft, Printer, Loader2, FileSpreadsheet, ZoomIn, ZoomOut } from "lucide-react";
import { getCategoryTitle, getItemName, getItemDesc } from "@/lib/menuData";
import { formatPrice } from "@/lib/formatPrice";
import { exportMenuPPTX } from "@/lib/menuExportEngine";
import { trpc } from "@/providers/trpc";
/* NOTE: Print Preview now uses LIVE DB API (branchMenu.getMenuByBranch).
   Static seed data (menuEditsSeed.ts) is intentionally NOT used here.
   All prices, availability, and badges come directly from the database. */
import type { PrintLang, PrintPaper } from "@/lib/printConfig";
import { BRANCHES, TX, getPaperDims, getZoneForCategory, getBeverageZoneForCategory, getCatNumber } from "@/lib/printConfig";

/* ─── Utility: convert any image URL to base64 data URI ───
   Critical for SVG foreignObject capture — embeds image inline so
   external resource loading is not needed. */
async function urlToDataUri(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas context null")); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

/* ─── CAPTURE ENGINE — SVG foreignObject (browser native rendering) ───
   No html2canvas. No third-party text engine. Browser renders EXACT pixels.
   Uses SVG <foreignObject> to embed HTML → browser draws natively → canvas.
   This guarantees 1:1 match with preview because the SAME browser engine renders.
   ═══════════════════════════════════════════════════════════════════════ */
async function captureToPng(el: HTMLElement, opts: { scale?: number; backgroundColor?: string } = {}): Promise<string> {
  const scale = opts.scale ?? 4;
  const width = el.scrollWidth;
  const height = el.scrollHeight;
  const bgColor = opts.backgroundColor || "#F8F6F0";



  if (width === 0 || height === 0) {
    /* Try offset dimensions as fallback */
    const w2 = el.offsetWidth || (el.firstElementChild as HTMLElement)?.offsetWidth || 0;
    const h2 = el.offsetHeight || (el.firstElementChild as HTMLElement)?.offsetHeight || 0;

    if (w2 === 0 || h2 === 0) {
      throw new Error(`Capture element has zero dimensions: scroll=${width}x${height} offset=${w2}x${h2}. Is the element rendered?`);
    }
  }

  /* ─── STEP 0: Convert ALL <img> elements to base64 data URIs ───
     External URLs (http, /path) fail inside SVG foreignObject when the SVG
     is loaded from a blob URL (CORS/security restrictions). By converting
     every image to a data URI, the SVG becomes entirely self-contained. */
  const originalSrcMap = new Map<HTMLImageElement, string>();
  const imgs = el.querySelectorAll("img");

  await Promise.all(
    Array.from(imgs).map(async (img) => {
      const rawSrc = img.getAttribute("src") || "";
      if (!rawSrc || rawSrc.startsWith("data:")) return; // already data URI
      try {
        const dataUri = await withTimeout(urlToDataUri(rawSrc), 8000, `DataURI ${rawSrc.slice(0, 60)}`);
        originalSrcMap.set(img, rawSrc);
        img.setAttribute("src", dataUri);

      } catch (err) {
        /* ignore image conversion error */
        /* Leave original src — will rely on absolute URL fallback below */
      }
    })
  );


  /* ─── Pre-load all images (ensure data URI / external images are ready) ─── */

  await Promise.all(Array.from(el.querySelectorAll("img")).map((img) => {
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalWidth > 0) { resolve(); return; }
      const testImg = new Image();
      testImg.onload = () => resolve();
      testImg.onerror = () => { resolve(); };
      testImg.src = img.src;
      setTimeout(() => resolve(), 3000); // 3s timeout per image
    });
  }));


  try {
    /* Serialize the element with all computed styles inlined */
    const xhtml = "http://www.w3.org/1999/xhtml";
    const svgNS = "http://www.w3.org/2000/svg";
    const baseUrl = window.location.href;

    /* Build foreignObject content — convert relative image URLs to absolute */
    const wrapper = document.createElement("div");
    wrapper.setAttribute("xmlns", xhtml);
    wrapper.style.width = `${width}px`;
    wrapper.style.height = `${height}px`;
    wrapper.style.overflow = "hidden";
    wrapper.style.backgroundColor = bgColor;
    wrapper.style.fontFamily = window.getComputedStyle(el).fontFamily || "Georgia, serif";
    wrapper.innerHTML = el.innerHTML;

    /* Fix any remaining relative image URLs inside wrapper — use getAttribute
       for original src since img.src is already browser-resolved to absolute */
    wrapper.querySelectorAll("img").forEach((img) => {
      const rawSrc = img.getAttribute("src") || "";
      if (rawSrc && !rawSrc.startsWith("http") && !rawSrc.startsWith("data:")) {
        try { img.src = new URL(rawSrc, baseUrl).href; } catch { /* keep original */ }
      }
    });

    /* Copy computed styles from original to all matching elements */
    const origAll = el.querySelectorAll("*");
    const wrapAll = wrapper.querySelectorAll("*");
    origAll.forEach((orig, i) => {
      if (!wrapAll[i]) return;
      const cs = window.getComputedStyle(orig);
      const target = wrapAll[i] as HTMLElement;
      target.style.cssText = cs.cssText;
      /* Preserve explicit inline styles from original */
      if ((orig as HTMLElement).style.cssText) {
        target.style.cssText += "; " + (orig as HTMLElement).style.cssText;
      }
    });

    /* Build SVG */
    const svgStr = `
      <svg xmlns="${svgNS}" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%" x="0" y="0">
          <div xmlns="${xhtml}">${wrapper.innerHTML}</div>
        </foreignObject>
      </svg>`;



    /* Draw SVG to scaled canvas */
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {

        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas 2D context null")); return; }
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL("image/png", 1.0);

        resolve(dataUrl);
      };
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        console.error("[Capture] SVG image load failed:", e);
        reject(new Error("SVG capture failed — image onerror fired. This usually happens when an external image cannot be loaded inside the SVG foreignObject. Ensure all images are embedded as data URIs."));
      };
      img.src = url;
    });
  } finally {
    /* ─── Restore original src attributes so the DOM is not permanently mutated ─── */
    for (const [img, origSrc] of originalSrcMap) {
      img.setAttribute("src", origSrc);
    }

  }
}

async function createPdf(opts: any) {
  const { jsPDF } = await import("jspdf");
  return new jsPDF(opts);
}

/* ─── QR code generator ─── */
async function generateQrCode(text: string) {
  const QRCode = (await import("qrcode")).default;
  /* High-res black QR for maximum scan reliability */
  return QRCode.toDataURL(text, { width: 320, margin: 2, color: { dark: "#000000", light: "#FFFFFF" } });
}

/* ─── Timeout wrapper ─── */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out (${ms}ms)`)), ms)),
  ]);
}

type Lang = PrintLang;
type Paper = PrintPaper;
type MenuType = "food" | "beverage";

/* ─── Transform API category into print-ready format ───
   Uses LIVE DB data only — no static seed fallback.
   branchMenu.getMenuByBranch already returns:
   - finalPrice (branch-specific override applied)
   - only available items (unavailable filtered server-side)
   - all badge flags (isNew, isMeat, isFish, etc.)          */
function processApiCategory(cat: any, lang: Lang) {
  const items = (cat.items || [])
    .map((item: any) => {
      try {
        return {
          name: getItemName(item, lang),
          desc: getItemDesc(item, lang),
          price: item.finalPrice ?? item.price ?? null,
          is_new: item.isNew ?? false,
          is_meat: item.isMeat ?? false,
          is_fish: item.isFish ?? false,
          is_vegetarian: item.isVegetarian ?? false,
          is_halal: item.isHalal ?? false,
          is_spicy: item.isSpicy ?? false,
          is_gluten_free: item.isGlutenFree ?? false,
          is_sugar_free: item.isSugarFree ?? false,
        };
      } catch (e: any) {
        console.error("[PrintPreview] processApiCategory error:", e?.message, "for", item?.nameAz);
        return null;
      }
    })
    .filter(Boolean);
  return { title: getCategoryTitle(cat, lang), title_az: cat.titleAz, items };
}

/* ════════════════════════════════════════════════════════════════
   BADGES — NEW stays as original red text pill.
   Other badges (Glutensiz, Sekersiz, Acili, etc.) use emoji icons.
   ════════════════════════════════════════════════════════════════ */

/** Original red NEW badge — kept EXACTLY as before */
function NewBadgePill({ lang }: { lang: Lang }) {
  return (
    <span style={{ display: "inline-block", fontSize: "5pt", fontWeight: 700, background: "#C41E3A", color: "#fff", padding: "0.5mm 1.5mm", borderRadius: "1mm", letterSpacing: "0.03em", whiteSpace: "nowrap", lineHeight: "4mm", height: "4mm", verticalAlign: "middle" }}>
      NEW
    </span>
  );
}

/** Emoji icons for non-NEW badges — premium, minimal */
const BADGE_EMOJI: Record<string, string> = {
  meat: "🥩",
  fish: "🐟",
  veg: "🥬",
  halal: "☪",
  spicy: "🌶",
  gluten_free: "🌾",
  sugar_free: "⊘",
};

function EmojiBadge({ type }: { type: string }) {
  const emoji = BADGE_EMOJI[type];
  if (!emoji) return null;
  return (
    <span style={{ display: "inline-block", fontSize: "3mm", lineHeight: "3mm", height: "3mm", width: "3mm", textAlign: "center", verticalAlign: "middle" }}>
      {emoji}
    </span>
  );
}

/** Inline badges — NEW uses original pill, others use emoji icons */
function InlineBadges({ item, lang }: { item: any; lang: Lang }) {
  const list: string[] = [];
  if (item.is_meat) list.push("meat");
  if (item.is_fish) list.push("fish");
  if (item.is_vegetarian) list.push("veg");
  if (item.is_halal) list.push("halal");
  if (item.is_spicy) list.push("spicy");
  if (item.is_gluten_free) list.push("gluten_free");
  if (item.is_sugar_free) list.push("sugar_free");
  /* Show max 3 emoji badges */
  const visible = list.slice(0, 3);
  const hasNew = item.is_new;
  if (visible.length === 0 && !hasNew) return null;
  return (
    <span style={{ display: "inline-block", whiteSpace: "nowrap", marginLeft: "1.2mm", verticalAlign: "middle", lineHeight: 1 }}>
      {hasNew && <NewBadgePill lang={lang} />}
      {visible.length > 0 && hasNew && <span style={{ display: "inline-block", width: "0.8mm" }} />}
      {visible.map((t, i) => (
        <span key={t} style={{ display: "inline-block" }}>
          <EmojiBadge type={t} />
          {i < visible.length - 1 && <span style={{ display: "inline-block", width: "0.8mm" }} />}
        </span>
      ))}
    </span>
  );
}

/* ─── Paper Canvas Component — rebuilt to match reference exactly ─── */
function PaperCanvas({
  sections, breakfastCat, hasBreakfast, qrUrl, reviewQrUrl, lang, t, menuType, paperW, paperH, branchLabel, logoDataUrl,
}: {
  sections: any[]; breakfastCat: any; hasBreakfast: boolean; qrUrl: string; reviewQrUrl: string;
  lang: Lang; t: Record<string, string>; menuType: MenuType;
  paperW: number; paperH: number; branchLabel: string; logoDataUrl: string;
}) {
  const nonBreakfast = sections.filter((s: any) => getZoneForCategory(s.title_az) !== 1);
  const zone2 = nonBreakfast.filter((s: any) => getZoneForCategory(s.title_az) === 2);
  const zone3 = nonBreakfast.filter((s: any) => getZoneForCategory(s.title_az) === 3);
  const zone4 = nonBreakfast.filter((s: any) => getZoneForCategory(s.title_az) === 4);
  const allCats = hasBreakfast && breakfastCat ? [breakfastCat, ...nonBreakfast] : nonBreakfast;

  /* Reference-specified margins */
  const MARGIN_L = 14;
  const MARGIN_R = 14;
  const MARGIN_T = 10;
  const MARGIN_B = 12;

  /* ═══════════════════════════════════════════════════════════
     BEVERAGE MENU — Separate branch, does NOT affect food menu
     ═══════════════════════════════════════════════════════════ */
  if (menuType === "beverage") {
    const bevAll = sections;
    const bevCol1 = bevAll.filter((s: any) => getBeverageZoneForCategory(s.title_az) === 10);
    const bevCol2 = bevAll.filter((s: any) => getBeverageZoneForCategory(s.title_az) === 20);
    const bevCol3 = bevAll.filter((s: any) => getBeverageZoneForCategory(s.title_az) === 30);
    const bevCol4 = bevAll.filter((s: any) => getBeverageZoneForCategory(s.title_az) === 40);

    return (
      <div style={{
        width: `${paperW}mm`, height: `${paperH}mm`,
        padding: `${MARGIN_T}mm ${MARGIN_R}mm ${MARGIN_B}mm ${MARGIN_L}mm`,
        background: "#F8F6F0", color: "#1A1A1A",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        boxSizing: "border-box", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header — same as food menu */}
        <header style={{
          position: "absolute", top: `${MARGIN_T}mm`, left: `${MARGIN_L}mm`, right: `${MARGIN_R}mm`,
          height: "32mm", textAlign: "center", zIndex: 2,
        }}>
          <img src={logoDataUrl || "/assets/logo-dark.png"} alt="XURCUN"
            style={{ height: "23mm", width: "auto", display: "block", margin: "0 auto", objectFit: "contain" }} />
          <p style={{
            fontFamily: "Georgia, serif", fontSize: "7pt", fontWeight: 600, color: "#C9A96E",
            letterSpacing: "0.12em", margin: "1.5mm 0 0", textTransform: "uppercase", lineHeight: 1,
          }}>{(branchLabel || "Xurcun").toUpperCase()}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: "2.5mm" }}>
            <div style={{ flex: 1, height: "0.8px", background: "#C9A96E", maxWidth: "130mm" }} />
            <div style={{ width: "2.5mm", height: "2.5mm", border: "0.8px solid #C9A96E", transform: "rotate(45deg)", margin: "0 2mm", flexShrink: 0 }} />
            <div style={{ flex: 1, height: "0.8px", background: "#C9A96E", maxWidth: "130mm" }} />
          </div>
        </header>

        {/* 4-column grid — same proportions as food menu */}
        <div style={{ marginTop: "32mm", display: "grid", gridTemplateColumns: "26% 22% 24% 24%", gap: "2mm", alignContent: "start" }}>

          {/* Col 1: Cocktails + Mocktails + Beer + Review QR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
            {bevCol1.map((cat: any) => <PrintCategoryBlock key={cat.title_az} cat={cat} allCats={bevAll} lang={lang} />)}
            {/* Review QR — exact copy from food menu */}
            {reviewQrUrl && (
              <div style={{
                border: "1.5px solid #C9A96E", background: "#FFFDF7",
                padding: "4mm 4mm 3mm", textAlign: "center", position: "relative", marginTop: "auto",
                width: "100%", boxSizing: "border-box",
              }}>
                <span style={{ position: "absolute", top: "1mm", left: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", top: "1mm", right: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", bottom: "1mm", left: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", bottom: "1mm", right: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
                <img src={reviewQrUrl} alt="Google Review QR" style={{ width: "28mm", height: "28mm", display: "block", margin: "0 auto" }} />
                <div style={{ marginTop: "2mm" }}>
                  <span style={{ fontSize: "8pt", color: "#C9A96E", lineHeight: 1, display: "block" }}>★</span>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: "6.5pt", fontWeight: 700, color: "#2B2B2B", letterSpacing: "0.08em", margin: "1.5mm 0 0", textTransform: "uppercase", lineHeight: 1.2 }}>SCAN TO REVIEW US</p>
                </div>
              </div>
            )}
          </div>

          {/* Col 2: Champagne + Wine + Menu QR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
            {bevCol2.map((cat: any) => <PrintCategoryBlock key={cat.title_az} cat={cat} allCats={bevAll} lang={lang} />)}
            {/* Menu QR — exact copy from food menu */}
            {qrUrl && (
              <div style={{
                border: "1.5px solid #C9A96E", background: "#FFFDF7",
                padding: "3mm", textAlign: "center", position: "relative", marginTop: "auto",
              }}>
                <span style={{ position: "absolute", top: "1mm", left: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", top: "1mm", right: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", bottom: "1mm", left: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", bottom: "1mm", right: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
                <img src={qrUrl} alt="QR" style={{ width: "34mm", height: "34mm", display: "block", margin: "0 auto 2mm" }} />
                <p style={{ fontFamily: "Georgia, serif", fontSize: "6.5pt", fontWeight: 700, color: "#1A1A1A", letterSpacing: "0.1em", margin: 0, textTransform: "uppercase", lineHeight: 1.2 }}>SCAN TO VIEW MENU</p>
              </div>
            )}
          </div>

          {/* Col 3: Spirits */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
            {bevCol3.map((cat: any) => <PrintCategoryBlock key={cat.title_az} cat={cat} allCats={bevAll} lang={lang} />)}
          </div>

          {/* Col 4: Cognac + Liqueur + Soft + Juices + Mineral + Coffee + Tea */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
            {bevCol4.map((cat: any) => <PrintCategoryBlock key={cat.title_az} cat={cat} allCats={bevAll} lang={lang} />)}
          </div>
        </div>

        {/* Footer — same as food menu */}
        <div style={{ marginTop: "5mm", padding: "2mm 0 0.5mm", borderTop: "1px solid #C9A96E", textAlign: "center", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: "10pt", color: "#1A1A1A", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.4, fontFamily: "Georgia, serif" }}>{t.serviceNote}</p>
          <p style={{ margin: "1.5mm 0 0", fontSize: "7pt", color: "#888", letterSpacing: "0.03em", lineHeight: 1.3, fontFamily: "Georgia, serif" }}>ⓘ {t.allergenNote}</p>
        </div>
      </div>
    );
  }

  /* ═══ FOOD MENU — STABLE, LOCKED, NEVER MODIFY ═══ */
  return (
    <div style={{
      width: `${paperW}mm`,
      height: `${paperH}mm`,
      padding: `${MARGIN_T}mm ${MARGIN_R}mm ${MARGIN_B}mm ${MARGIN_L}mm`,
      background: "#F8F6F0",
      color: "#1A1A1A",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* ═══ HEADER: Absolute positioned, does NOT push grid down ═══ */}
      <header style={{
        position: "absolute",
        top: `${MARGIN_T}mm`,
        left: `${MARGIN_L}mm`,
        right: `${MARGIN_R}mm`,
        height: "32mm",
        textAlign: "center",
        zIndex: 2,
      }}>
        <img
          src={logoDataUrl || "/assets/logo-dark.png"}
          alt="XURCUN"
          style={{ height: "23mm", width: "auto", display: "block", margin: "0 auto", objectFit: "contain" }}
        />
        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: "7pt",
          fontWeight: 600,
          color: "#C9A96E",
          letterSpacing: "0.12em",
          margin: "1.5mm 0 0",
          textTransform: "uppercase",
          lineHeight: 1,
        }}>
          {(branchLabel || "Xurcun").toUpperCase()}
        </p>
        {/* Gold horizontal line with diamond ornament */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginTop: "2.5mm" }}>
          <div style={{ flex: 1, height: "0.8px", background: "#C9A96E", maxWidth: "130mm" }} />
          <div style={{ width: "2.5mm", height: "2.5mm", border: "0.8px solid #C9A96E", transform: "rotate(45deg)", margin: "0 2mm", flexShrink: 0 }} />
          <div style={{ flex: 1, height: "0.8px", background: "#C9A96E", maxWidth: "130mm" }} />
        </div>
      </header>

      {/* ═══ 4-COLUMN GRID: Fixed start at 32mm below page top, auto height ═══ */}
      <div style={{ marginTop: "32mm", display: "grid", gridTemplateColumns: "26% 22% 24% 24%", gap: "2mm", alignContent: "start" }}>

        {/* ─── COL 1: Breakfast + Brand Panel (auto height, no flex push) ─── */}
        {hasBreakfast && breakfastCat && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
            {/* Breakfast items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm" }}>
              {/* Breakfast header */}
              <div style={{ display: "flex", alignItems: "center", gap: "2mm", paddingBottom: "1.5mm", borderBottom: "1px solid #C9A96E" }}>
                <span style={{ background: "#2C2C2C", color: "#FFFDF7", fontFamily: "Georgia, serif", fontSize: "9pt", fontWeight: 700, width: "6mm", height: "6mm", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}>1</span>
                <h2 style={{ fontFamily: "Georgia, serif", fontSize: "11pt", fontWeight: 700, color: "#1A1A1A", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{t.breakfast}</h2>
              </div>
              <p style={{ fontSize: "6pt", color: "#999", margin: 0, fontStyle: "italic", lineHeight: 1.3 }}>{t.teaNote}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm" }}>
                {breakfastCat.items.map((item: any, i: number) => <PrintProductRow key={i} item={item} lang={lang} compact />)}
              </div>
            </div>

            {/* ═══ BRAND PANEL ═══ */}
            <div style={{ border: "1px solid #C9A96E", background: "#FFFDF7", padding: "5mm 3mm", textAlign: "center", flexShrink: 0, position: "relative" }}>
              {/* Decorative corner brackets */}
              <span style={{ position: "absolute", top: "2mm", left: "2mm", width: "4mm", height: "4mm", borderTop: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
              <span style={{ position: "absolute", top: "2mm", right: "2mm", width: "4mm", height: "4mm", borderTop: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
              <span style={{ position: "absolute", bottom: "2mm", left: "2mm", width: "4mm", height: "4mm", borderBottom: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
              <span style={{ position: "absolute", bottom: "2mm", right: "2mm", width: "4mm", height: "4mm", borderBottom: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />

              <img
                src={logoDataUrl || "/assets/logo-dark.png"}
                alt="XURCUN"
                style={{ height: "18mm", width: "auto", display: "block", margin: "2mm auto 2mm", objectFit: "contain" }}
              />
              <p style={{ fontFamily: "Georgia, serif", fontSize: "13pt", fontWeight: 700, color: "#1A1A1A", letterSpacing: "0.25em", margin: "0 0 1.5mm", textTransform: "uppercase" }}>XURCUN</p>
              <p style={{ fontFamily: "Georgia, serif", fontSize: "10pt", fontWeight: 700, color: "#C9A96E", letterSpacing: "0.15em", margin: "0 0 1.5mm", textTransform: "uppercase" }}>{t.breakfastSub}</p>
              <div style={{ width: "45%", height: "1px", background: "#C9A96E", margin: "0 auto 1.5mm" }} />
              <p style={{ fontFamily: "Georgia, serif", fontSize: "6pt", color: "#888", margin: 0, fontStyle: "italic", letterSpacing: "0.05em" }}>Hər zövqə sizə özəl hazırlanır</p>
            </div>

            {/* ═══ GOOGLE REVIEW QR — matches Menu QR dimensions exactly ═══ */}
            {reviewQrUrl && (
              <div style={{
                border: "1.5px solid #C9A96E",
                background: "#FFFDF7",
                padding: "4mm 4mm 3mm",
                textAlign: "center",
                position: "relative",
                marginTop: "auto",
                width: "100%",
                boxSizing: "border-box",
              }}>
                {/* Corner ornaments */}
                <span style={{ position: "absolute", top: "1mm", left: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", top: "1mm", right: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", bottom: "1mm", left: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
                <span style={{ position: "absolute", bottom: "1mm", right: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
                <img
                  src={reviewQrUrl}
                  alt="Google Review QR"
                  style={{ width: "28mm", height: "28mm", display: "block", margin: "0 auto" }}
                />
                {/* Review icon + text */}
                <div style={{ marginTop: "2mm" }}>
                  <span style={{ fontSize: "8pt", color: "#C9A96E", lineHeight: 1, display: "block" }}>★</span>
                  <p style={{
                    fontFamily: "Georgia, serif",
                    fontSize: "6.5pt",
                    fontWeight: 700,
                    color: "#2B2B2B",
                    letterSpacing: "0.08em",
                    margin: "1.5mm 0 0",
                    textTransform: "uppercase",
                    lineHeight: 1.2,
                  }}>
                    SCAN TO REVIEW US
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── COL 2: Soups + Appetizers + QR ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
          {zone2.map((cat: any) => <PrintCategoryBlock key={cat.title_az} cat={cat} allCats={allCats} lang={lang} />)}
          {/* QR block — placed in lower empty space of this column, flows naturally */}
          {qrUrl && (
            <div style={{
              border: "1.5px solid #C9A96E",
              background: "#FFFDF7",
              padding: "3mm",
              textAlign: "center",
              position: "relative",
              marginTop: "auto",
            }}>
              {/* Corner ornaments */}
              <span style={{ position: "absolute", top: "1mm", left: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
              <span style={{ position: "absolute", top: "1mm", right: "1mm", width: "3mm", height: "3mm", borderTop: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
              <span style={{ position: "absolute", bottom: "1mm", left: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderLeft: "1.5px solid #C9A96E" }} />
              <span style={{ position: "absolute", bottom: "1mm", right: "1mm", width: "3mm", height: "3mm", borderBottom: "1.5px solid #C9A96E", borderRight: "1.5px solid #C9A96E" }} />
              <img
                src={qrUrl}
                alt="QR"
                style={{ width: "34mm", height: "34mm", display: "block", margin: "0 auto 2mm" }}
              />
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: "6.5pt",
                fontWeight: 700,
                color: "#1A1A1A",
                letterSpacing: "0.1em",
                margin: 0,
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}>
                {t.scanQr}
              </p>
            </div>
          )}
        </div>

        {/* ─── COL 3: Salads + Pasta + Desserts ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
          {zone3.map((cat: any) => <PrintCategoryBlock key={cat.title_az} cat={cat} allCats={allCats} lang={lang} />)}
        </div>

        {/* ─── COL 4: Mains + Sides ─── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2mm" }}>
          {zone4.map((cat: any) => <PrintCategoryBlock key={cat.title_az} cat={cat} allCats={allCats} lang={lang} />)}
        </div>
      </div>

      {/* ═══ FOOTER — strong, enlarged, premium ═══ */}
      {(menuType as string) !== "beverage" && (
        <div style={{ marginTop: "5mm", padding: "2mm 0 0.5mm", borderTop: "1px solid #C9A96E", textAlign: "center", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: "10pt", color: "#1A1A1A", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1.4, fontFamily: "Georgia, serif" }}>{t.serviceNote}</p>
          <p style={{ margin: "1.5mm 0 0", fontSize: "7pt", color: "#888", letterSpacing: "0.03em", lineHeight: 1.3, fontFamily: "Georgia, serif" }}>ⓘ {t.allergenNote}</p>
        </div>
      )}
    </div>
  );
}

function PrintCategoryBlock({ cat, allCats, lang }: { cat: any; allCats: any[]; lang: Lang }) {
  const num = getCatNumber(allCats, cat.title_az);
  return (
    <div style={{ border: "1px solid #C9A96E", background: "#FFFDF7", padding: "2.5mm" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5mm", marginBottom: "2mm", paddingBottom: "1.5mm", borderBottom: "1px solid #C9A96E" }}>
        <span style={{ background: "#2C2C2C", color: "#FFFDF7", fontFamily: "Georgia, serif", fontSize: "9pt", fontWeight: 700, width: "6mm", height: "6mm", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, lineHeight: 1 }}>{num}</span>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "11pt", fontWeight: 700, color: "#1A1A1A", letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{cat.title}</h3>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm" }}>
        {cat.items.map((item: any, i: number) => <PrintProductRow key={i} item={item} lang={lang} />)}
      </div>
    </div>
  );
}

function PrintProductRow({ item, lang, compact = false }: { item: any; lang: Lang; compact?: boolean }) {
  return (
    <div style={{ pageBreakInside: "avoid" }}>
      {/* ═══ Name + inline badges + price on ONE LINE ═══ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2mm" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: 0, overflow: "hidden" }}>
          <span style={{ fontSize: compact ? "7.5pt" : "8.5pt", color: "#1A1A1A", fontWeight: 700, letterSpacing: "0.02em", lineHeight: 1.15, textTransform: "uppercase", fontFamily: "Georgia, serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
          <InlineBadges item={item} lang={lang} />
        </div>
        {item.price !== null && item.price !== undefined && (
          <span style={{ fontSize: "8.5pt", color: "#1A1A1A", fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0, fontFamily: "Georgia, serif" }}>{formatPrice(item.price)}</span>
        )}
      </div>
      {/* Description below, badges are now inline above */}
      {item.desc && <p style={{ fontSize: "6.5pt", color: "#666", margin: "0.5mm 0 0", lineHeight: 1.3, fontFamily: "Georgia, serif" }}>{item.desc}</p>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE — Paper Canvas with Viewport Scaling
   ═══════════════════════════════════════════ */
export default function PrintPreviewPage() {
  /* URL params */
  const params = new URLSearchParams(window.location.search);
  const [lang, setLang] = useState<Lang>((params.get("lang") as Lang) || "az");
  const [paper, setPaper] = useState<Paper>((params.get("paper") as Paper) || "a3");
  const [menuType, setMenuType] = useState<MenuType>((params.get("type") as MenuType) || "food");
  const branchSlug = params.get("branch") || "white-city";

  const branch = BRANCHES.find((b) => b.slug === branchSlug) || BRANCHES[0];
  const branchLabel = branch?.label || branchSlug || "Xurcun White City";
  const t = TX[lang];
  const { w: paperW, h: paperH } = getPaperDims(paper, "landscape");

  /* State */
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [printing, setPrinting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [zoom, setZoom] = useState(1);
  const paperRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [logoDataUrl, setLogoDataUrl] = useState("");

  /* ─── Pre-load logo as data URI for reliable SVG foreignObject capture ───
     External images fail inside SVG <foreignObject> due to security/CORS.
     Converting the logo to a base64 data URI embeds it inline, eliminating
     external resource loading during capture. */
  useEffect(() => {
    let cancelled = false;
    async function loadLogo() {
      try {
        const absoluteUrl = new URL("/assets/logo-dark.png", window.location.href).href;
        const dataUri = await urlToDataUri(absoluteUrl);
        if (!cancelled) setLogoDataUrl(dataUri);
      } catch (err) {
        /* ignore logo conversion error */
        /* Fallback: keep empty string — PaperCanvas will use original path */
      }
    }
    loadLogo();
    return () => { cancelled = true; };
  }, []);

  /* Container size tracking — measures the scrollable preview container */
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 1200, h: 800 });
  useEffect(() => {
    function measure() {
      const el = previewContainerRef.current;
      if (el) setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    }
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    if (previewContainerRef.current) ro.observe(previewContainerRef.current);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  /* Auto-zoom to fit — calculates exact scale to fit viewport, never overflows */
  const MM_TO_PX = 3.779527559; // exact 96dpi / 25.4
  const paperPxW = paperW * MM_TO_PX;
  const paperPxH = paperH * MM_TO_PX;

  const autoZoom = useMemo(() => {
    const PAD_X = 48; // horizontal padding inside viewport
    const PAD_Y = 32; // vertical padding inside viewport
    const scaleX = (containerSize.w - PAD_X) / paperPxW;
    const scaleY = (containerSize.h - PAD_Y) / paperPxH;
    return Math.min(scaleX, scaleY, 1.25);
  }, [containerSize, paperPxW, paperPxH]);

  const effectiveZoom = zoom * autoZoom;

  /* Scaled dimensions for the wrapper — constrains layout box to visible area only */
  const scaledW = Math.round(paperPxW * effectiveZoom);
  const scaledH = Math.round(paperPxH * effectiveZoom);

  /* QR code — always generates from configured branch URL, falls back to base domain */
  useEffect(() => {
    const branchConfig = BRANCHES.find((b) => b.slug === branchSlug);
    const configuredUrl = branchConfig?.qrUrl?.trim();
    /* Fallback: use canonical base domain + branch slug when real URL not yet configured */
    const qrUrl = configuredUrl || `https://xurcun.az/#/menu/${branchSlug}`;
    generateQrCode(qrUrl)
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [branchSlug]);

  /* Google Review QR — fixed URL, positioned at left lower area */
  const [reviewQrUrl, setReviewQrUrl] = useState("");
  useEffect(() => {
    generateQrCode("https://maps.app.goo.gl/corJnaHKvz4NgYi67?g_st=ic")
      .then(setReviewQrUrl)
      .catch(() => setReviewQrUrl(""));
  }, []);

  /* ═══ LIVE DB API — branch-specific menu (prices + availability already applied server-side) ═══ */
  const { data: branchMenuData, isLoading: apiLoading } = trpc.branchMenu.getMenuByBranch.useQuery(
    { branchSlug, tab: menuType === "food" ? "food" : "beverage" },
    { retry: false, refetchOnWindowFocus: false, staleTime: 30_000 }
  );
  const apiCategories = branchMenuData?.categories ?? [];

  /* Build sections from live API data — no static seed involved */
  const buildResult = useMemo(() => {
    try {
      const cats = apiCategories
        .filter((c) => c?.items && c.items.length > 0)
        .map((c) => processApiCategory(c, lang))
        .filter((c) => c.items.length > 0);
      const bf = cats.find((c) => (c.title_az || "").toLowerCase().includes("səhər"));
      const nonBf = cats.filter((c) => c !== bf);
      return { sections: nonBf, breakfastCat: bf || null, hasBreakfast: !!bf, buildError: "" };
    } catch (e: any) {
      console.error("[PrintPreview] BUILD FAILED:", e);
      return { sections: [] as any[], breakfastCat: null, hasBreakfast: false, buildError: e?.message || "" };
    }
  }, [lang, apiCategories]);

  const { sections, breakfastCat, hasBreakfast, buildError } = buildResult;

  useEffect(() => {
    if (apiLoading) { setStatus("loading"); }
    else if (buildError) { setStatus("error"); setErrorMsg(buildError); }
    else if (sections.length > 0) setStatus("ready");
  }, [apiLoading, buildError, sections.length]);

  /* ═══ PRE-CAPTURE: capture PaperCanvas once when ready ═══ */
  useEffect(() => {
    if (status !== "ready" || !captureRef.current) return;
    let cancelled = false;
    async function doCapture() {
      /* Wait for fonts to fully load */
      try { await document.fonts.ready; } catch { /* ignore */ }
      try { await document.fonts.load('700 12pt "Georgia"'); } catch { /* ignore */ }
      await new Promise(r => setTimeout(r, 500));
      if (cancelled) return;
      const el = captureRef.current;
      if (!el) return;
      try {
        const png = await captureToPng(el, { scale: 4, backgroundColor: "#F8F6F0" });
        if (cancelled) return;
        setCapturedImage(png);
      } catch (err) {
        console.error("[Pre-capture] failed:", err);
      }
    }
    doCapture();
    return () => { cancelled = true; };
  }, [status, sections, paperW, paperH, qrDataUrl, reviewQrUrl, lang]);

  /* ═══ PDF Export — uses browser print for stability ═══ */
  const handleDownloadPDF = useCallback(() => {
    window.print();
  }, []);

  /* PPTX Export — captures EXACT same PaperCanvas as preview (image-based for 1:1 match) */
  /* ─── PPTX Export — editable text boxes, no screenshot ─── */
  const handleDownloadPPTX = useCallback(async () => {
    setPrinting(true);
    try {
      await exportMenuPPTX(
        sections, breakfastCat, hasBreakfast,
        menuType, lang, paper,
        branchLabel, t,
        qrDataUrl, reviewQrUrl,
      );
    } catch (err: any) {
      alert("[PPTX] Export failed: " + (err?.message || String(err)));
    } finally { setPrinting(false); }
  }, [sections, breakfastCat, hasBreakfast, menuType, lang, paper, branchLabel, t, qrDataUrl, reviewQrUrl]);

  function updateUrl(patch: Partial<Record<string, string>>) {
    const p = new URLSearchParams(window.location.search);
    Object.entries(patch).forEach(([k, v]) => p.set(k, v));
    window.history.replaceState({}, "", `${window.location.pathname}?${p}`);
  }

  return (
    <div
      style={{ height: "calc(100vh - 64px)" }}
      className="bg-[#1A1A1A] text-white flex flex-col overflow-hidden -mx-4 -my-6 md:-mx-6 md:-my-8"
    >
      {/* ═══ Print CSS: A3 landscape, hide UI chrome ═══ */}
      <style>{`@media print {
        @page { size: 420mm 297mm landscape; margin: 0; }
        body { background: #F8F6F0 !important; }
        .shrink-0, .no-print, button, nav, header, footer, select, label,
        .fixed, .sticky, [class*="toolbar"] { display: none !important; }
        .overflow-auto { overflow: visible !important; height: auto !important; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }`}</style>

      {/* ═══ Fixed Toolbar — compact, export buttons always visible ═══ */}
      <div className="shrink-0 bg-[#111] border-b border-[#222] z-50 select-none">
        {/* Row 1: Navigation + Title + Zoom */}
        <div className="flex items-center gap-2 px-3 py-1.5 overflow-hidden">
          <Link to="/admin" className="inline-flex items-center gap-1 text-[#C9A96E] hover:text-[#D4A853] text-xs font-semibold shrink-0">
            <ChevronLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t.back}</span>
          </Link>
          <div className="h-4 w-px bg-[#222] shrink-0" />
          <h1 className="text-[11px] sm:text-xs text-[#C9A96E] tracking-[0.12em] shrink-0 truncate">{t.pageTitle}</h1>
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-0.5 bg-[#1A1A1A] border border-[#222] rounded overflow-hidden shrink-0">
            <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="px-1.5 py-1 hover:bg-[#2A2A2A] text-[#C9A96E]"><ZoomOut className="w-3 h-3" /></button>
            <span className="text-[10px] text-white/60 px-1 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="px-1.5 py-1 hover:bg-[#2A2A2A] text-[#C9A96E]"><ZoomIn className="w-3 h-3" /></button>
          </div>
        </div>
        {/* Row 2: Controls + Export */}
        <div className="flex items-center gap-1.5 px-3 pb-2">
          <div className="flex items-center gap-1.5 shrink min-w-0 overflow-hidden">
            <select value={branchSlug} onChange={(e) => { updateUrl({ branch: e.target.value }); window.location.reload(); }} className="bg-[#1A1A1A] border border-[#222] rounded px-1.5 py-1 text-[10px] text-white shrink-0" style={{ maxWidth: 110 }}>
              {BRANCHES.map((b) => <option key={b.slug} value={b.slug}>{b.label}</option>)}
            </select>
            <select value={menuType} onChange={(e) => { setMenuType(e.target.value as MenuType); updateUrl({ type: e.target.value }); }} className="bg-[#1A1A1A] border border-[#222] rounded px-1.5 py-1 text-[10px] text-white shrink-0">
              <option value="food">{t.typeFood}</option>
              <option value="beverage">{t.typeBev}</option>
            </select>
            <select value={paper} onChange={(e) => { setPaper(e.target.value as Paper); updateUrl({ paper: e.target.value }); }} className="bg-[#1A1A1A] border border-[#222] rounded px-1.5 py-1 text-[10px] text-white shrink-0">
              <option value="a3">A3</option>
              <option value="a4">A4</option>
            </select>
            <select value={lang} onChange={(e) => { setLang(e.target.value as Lang); updateUrl({ lang: e.target.value }); }} className="bg-[#1A1A1A] border border-[#222] rounded px-1.5 py-1 text-[10px] text-white shrink-0">
              <option value="az">AZ</option>
              <option value="tr">TR</option>
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </div>
          <div className="flex-1 min-w-2" />
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleDownloadPPTX} disabled={printing || status !== "ready"} className="px-2 py-1.5 bg-[#1A1A1A] text-[#C9A96E] border border-[#C9A96E] rounded text-[10px] font-semibold hover:bg-[#2A2A2A] disabled:opacity-40 flex items-center gap-1 whitespace-nowrap">
              {printing ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileSpreadsheet className="w-3 h-3" />} PPTX
            </button>
            <button onClick={handleDownloadPDF} disabled={printing || status !== "ready"} className="px-2 py-1.5 bg-[#C9A96E] text-[#0A0A0A] rounded text-[10px] font-semibold hover:bg-[#D4A853] disabled:opacity-40 flex items-center gap-1 whitespace-nowrap">
              {printing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Printer className="w-3 h-3" />} PDF
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Scrollable Preview Area ═══ */}
      <div
        className="flex-1 overflow-auto"
        style={{ background: "#2A2A2A" }}
        ref={previewContainerRef}
      >
        {status === "error" ? (
          <div className="text-center text-red-400 py-20">
            <p className="text-lg font-bold mb-2">{t.pageTitle} — ERROR</p>
            <p className="text-sm text-white/40">{errorMsg}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#C9A96E] text-[#0A0A0A] rounded text-sm">Retry</button>
          </div>
        ) : status === "loading" || apiLoading || sections.length === 0 ? (
          <div className="text-center text-white/30 py-20">
            <Loader2 className="w-8 h-8 animate-spin mb-3 mx-auto" />
            <p className="text-sm">{apiLoading ? "Loading menu data..." : t.loading}</p>
          </div>
        ) : (
          /* Centered scaled preview */
          <div className="flex items-start justify-center py-4">
            <div style={{
              width: `${scaledW}px`,
              height: `${scaledH}px`,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              flexShrink: 0,
            }}>
              <div style={{
                width: `${paperPxW}px`,
                height: `${paperPxH}px`,
                transform: `scale(${effectiveZoom})`,
                transformOrigin: "top left",
                transition: "transform 0.15s ease",
              }}>
                <div ref={paperRef}>
                  <PaperCanvas
                    sections={sections}
                    breakfastCat={breakfastCat}
                    hasBreakfast={hasBreakfast}
                    qrUrl={qrDataUrl}
                    reviewQrUrl={reviewQrUrl}
                    lang={lang}
                    t={t}
                    menuType={menuType}
                    paperW={paperW}
                    paperH={paperH}
                    branchLabel={branchLabel}
                    logoDataUrl={logoDataUrl}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ HIDDEN CAPTURE — exact PaperCanvas clone, NO CSS transform, NO scaling ═══ */}
      {status === "ready" && sections.length > 0 && (
        <div
          ref={captureRef}
          style={{
            position: "absolute",
            left: "-99999px",
            top: 0,
            /* Explicitly no transform — critical for clean capture */
            transform: "none",
            transformOrigin: "top left",
            pointerEvents: "none",
          }}
        >
          {/* EXACT same PaperCanvas with EXACT same props as preview */}
          <PaperCanvas
            sections={sections}
            breakfastCat={breakfastCat}
            hasBreakfast={hasBreakfast}
            qrUrl={qrDataUrl}
            reviewQrUrl={reviewQrUrl}
            lang={lang}
            t={t}
            menuType={menuType}
            paperW={paperW}
            paperH={paperH}
            branchLabel={branchLabel}
            logoDataUrl={logoDataUrl}
          />
        </div>
      )}

    </div>
  );
}
