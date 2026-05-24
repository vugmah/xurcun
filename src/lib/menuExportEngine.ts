/* ═══════════════════════════════════════════════════════════════════
   MENU EXPORT ENGINE — Text-based direct rendering
   No screenshot. No html2canvas. No CSS transforms.
   PDF:  jsPDF text() with explicit coordinates
   PPTX: PptxGenJS addText() with editable text objects
   ═══════════════════════════════════════════════════════════════════ */

import { formatPrice } from "./formatPrice";
import { getZoneForCategory, getBeverageZoneForCategory, getCatNumber } from "./printConfig";
import type { PrintLang, PrintPaper } from "./printConfig";

/* ─── Constants matching the print layout exactly ─── */
const MARGIN_L = 14;
const MARGIN_R = 14;
const MARGIN_T = 10;
const MARGIN_B = 12;
const HEADER_H = 32; // mm
const COL_GAP = 2;   // mm
const CAT_GAP = 2;   // mm
const ITEM_GAP = 1.5;// mm

/* Column widths as percentages of content width */
const COL_PCTS = [0.26, 0.22, 0.24, 0.24];

/* Font sizes (pt) */
const FONT = {
  headerBranch: 7,
  catTitle: 10,
  catNum: 9,
  itemName: 8,
  itemDesc: 6.5,
  itemPrice: 8,
  footerService: 9,
  footerAllergen: 7,
  badgeNew: 5,
  scanText: 6.5,
};

/* Line heights (mm) */
const LH = {
  catHeader: 7,
  itemRow: 4.5,
  descRow: 3,
  footerService: 5,
  footerAllergen: 4,
};

/* Colors */
const C = {
  bg: "#F8F6F0",
  text: "#1A1A1A",
  gold: "#C9A96E",
  white: "#FFFDF7",
  dark: "#2C2C2C",
  muted: "#888",
  desc: "#666",
  red: "#C41E3A",
};

/* Emoji badges */
const BADGE_EMOJI: Record<string, string> = {
  meat: "🥩", fish: "🐟", veg: "🥬", halal: "☪",
  spicy: "🌶", gluten_free: "🌾", sugar_free: "⊘",
};

function getBadgeList(item: any): string[] {
  const list: string[] = [];
  if (item.is_meat) list.push("meat");
  if (item.is_fish) list.push("fish");
  if (item.is_vegetarian) list.push("veg");
  if (item.is_halal) list.push("halal");
  if (item.is_spicy) list.push("spicy");
  if (item.is_gluten_free) list.push("gluten_free");
  if (item.is_sugar_free) list.push("sugar_free");
  return list.slice(0, 3);
}

/* ═══════════════════════════════════════════════════════════════════
   LAYOUT CALCULATION — Shared between PDF and PPTX
   ═══════════════════════════════════════════════════════════════════ */

interface LayoutItem {
  name: string; desc: string; price: string;
  badges: string[]; isNew: boolean;
}

interface LayoutCategory {
  title: string; titleAz: string; num: number;
  items: LayoutItem[]; zone: number;
}

interface LayoutColumn {
  x: number; w: number;
  cats: LayoutCategory[];
}

function buildLayout(
  sections: any[], breakfastCat: any, hasBreakfast: boolean,
  menuType: string, lang: PrintLang, paperW: number, paperH: number,
  branchLabel: string, t: Record<string, string>,
): {
  columns: LayoutColumn[]; breakfast: LayoutCategory | null;
  paperW: number; paperH: number; contentW: number;
  headerY: number; gridY: number; footerY: number;
  branchLabel: string; t: Record<string, string>;
  menuType: string; lang: PrintLang;
} {
  /* Process sections into layout categories */
  const allCats: LayoutCategory[] = sections.map((s) => ({
    title: s.title,
    titleAz: s.title_az,
    num: getCatNumber(sections, s.title_az),
    items: s.items.map((item: any) => ({
      name: item.name,
      desc: item.desc || "",
      price: item.price !== null && item.price !== undefined ? formatPrice(item.price) : "",
      badges: getBadgeList(item),
      isNew: item.is_new,
    })),
    zone: menuType === "beverage"
      ? getBeverageZoneForCategory(s.title_az)
      : getZoneForCategory(s.title_az),
  }));

  const nonBf = allCats.filter((c) => c.zone !== 1);
  const bf = hasBreakfast && breakfastCat ? {
    title: breakfastCat.title,
    titleAz: breakfastCat.title_az,
    num: 1,
    items: breakfastCat.items.map((item: any) => ({
      name: item.name,
      desc: item.desc || "",
      price: item.price !== null && item.price !== undefined ? formatPrice(item.price) : "",
      badges: getBadgeList(item),
      isNew: item.is_new,
    })),
    zone: 1,
  } : null;

  /* Calculate column dimensions */
  const contentW = paperW - MARGIN_L - MARGIN_R;
  const colWidths = COL_PCTS.map((p) => p * contentW);
  const colXs: number[] = [];
  let x = MARGIN_L;
  for (let i = 0; i < colWidths.length; i++) {
    colXs.push(x);
    x += colWidths[i] + COL_GAP;
  }

  /* Group categories by column (zone) */
  const zoneMap = menuType === "beverage"
    ? { 1: 0, 10: 0, 20: 1, 30: 2, 40: 3 }
    : { 1: 0, 2: 1, 3: 2, 4: 3 };

  const columns: LayoutColumn[] = colXs.map((cx, i) => ({
    x: cx, w: colWidths[i],
    cats: nonBf.filter((c) => zoneMap[c.zone as keyof typeof zoneMap] === i),
  }));

  /* Place breakfast in column 1 if exists */
  if (bf) {
    columns[0].cats = [bf, ...columns[0].cats];
  }

  return {
    columns, breakfast: bf, paperW, paperH, contentW,
    headerY: MARGIN_T, gridY: MARGIN_T + HEADER_H, footerY: paperH - MARGIN_B,
    branchLabel, t, menuType, lang,
  };
}

/* Calculate the height of a category block */
function catHeight(cat: LayoutCategory): number {
  let h = LH.catHeader; // header
  for (const item of cat.items) {
    h += LH.itemRow; // name + price
    if (item.desc) h += LH.descRow;
    h += ITEM_GAP;
  }
  return h;
}

/* ═══════════════════════════════════════════════════════════════════
   PDF EXPORT — jsPDF with explicit text coordinates
   ═══════════════════════════════════════════════════════════════════ */

export async function exportMenuPDF(
  sections: any[], breakfastCat: any, hasBreakfast: boolean,
  menuType: string, lang: PrintLang, paper: PrintPaper,
  branchLabel: string, t: Record<string, string>,
  qrDataUrl: string, reviewQrUrl: string,
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const pw = paper === "a3" ? 420 : 297;
  const ph = paper === "a3" ? 297 : 210;

  const L = buildLayout(sections, breakfastCat, hasBreakfast, menuType, lang, pw, ph, branchLabel, t);

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [pw, ph],
  });

  /* Background */
  pdf.setFillColor(C.bg);
  pdf.rect(0, 0, pw, ph, "F");

  /* ─── HEADER ─── */
  const headerCY = L.headerY + HEADER_H / 2;

  /* Logo (centered text as placeholder — logo image would need base64) */
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.setTextColor(C.text);
  pdf.text("XURCUN", pw / 2, L.headerY + 8, { align: "center" });

  /* Branch label */
  pdf.setFontSize(FONT.headerBranch);
  pdf.setTextColor(C.gold);
  pdf.setFont("helvetica", "bold");
  pdf.text(branchLabel.toUpperCase(), pw / 2, L.headerY + 14, { align: "center" });

  /* Gold line with diamond */
  const lineY = L.headerY + 18;
  const lineW = 130;
  const lineX = (pw - lineW) / 2;
  pdf.setDrawColor(C.gold);
  pdf.setLineWidth(0.3);
  pdf.line(lineX, lineY, lineX + lineW / 2 - 3, lineY);
  pdf.line(lineX + lineW / 2 + 3, lineY, lineX + lineW, lineY);
  /* Diamond */
  pdf.setFillColor(C.gold);
  const diamond = [
    [pw / 2, lineY - 1.5],
    [pw / 2 + 1.5, lineY],
    [pw / 2, lineY + 1.5],
    [pw / 2 - 1.5, lineY],
  ];
  pdf.triangle(diamond[0][0], diamond[0][1], diamond[1][0], diamond[1][1], diamond[2][0], diamond[2][1], "F");
  pdf.triangle(diamond[0][0], diamond[0][1], diamond[2][0], diamond[2][1], diamond[3][0], diamond[3][1], "F");

  /* ─── COLUMNS ─── */
  for (const col of L.columns) {
    let y = L.gridY;
    for (const cat of col.cats) {
      /* Check if category fits */
      const ch = catHeight(cat);
      if (y + ch > L.footerY - 5) break; // Skip if doesn't fit

      /* Category block background */
      pdf.setFillColor(C.white);
      pdf.setDrawColor(C.gold);
      pdf.setLineWidth(0.2);
      pdf.rect(col.x, y, col.w, ch, "FD");

      /* Category header */
      const headerH = LH.catHeader;
      /* Number badge */
      pdf.setFillColor(C.dark);
      pdf.setDrawColor(C.dark);
      const badgeSize = 5;
      pdf.rect(col.x + 2, y + 1.5, badgeSize, badgeSize, "F");
      pdf.setFontSize(FONT.catNum);
      pdf.setTextColor(C.white);
      pdf.setFont("helvetica", "bold");
      pdf.text(String(cat.num), col.x + 2 + badgeSize / 2, y + 1.5 + badgeSize / 2 + 1.5, { align: "center" });

      /* Category title */
      pdf.setFontSize(FONT.catTitle);
      pdf.setTextColor(C.text);
      pdf.setFont("helvetica", "bold");
      pdf.text(cat.title.toUpperCase(), col.x + 2 + badgeSize + 2, y + 1.5 + 3);

      /* Gold underline */
      pdf.setDrawColor(C.gold);
      pdf.setLineWidth(0.3);
      pdf.line(col.x + 2, y + headerH - 1.5, col.x + col.w - 2, y + headerH - 1.5);

      /* Items */
      let itemY = y + headerH;
      for (const item of cat.items) {
        /* Check if item fits */
        let itemH = LH.itemRow;
        if (item.desc) itemH += LH.descRow;
        if (itemY + itemH > y + ch) break;

        /* Item name (left, bold, uppercase) */
        pdf.setFontSize(FONT.itemName);
        pdf.setTextColor(C.text);
        pdf.setFont("helvetica", "bold");
        const nameX = col.x + 2;
        const priceW = item.price ? pdf.getTextWidth(item.price) + 2 : 0;
        const maxNameW = col.w - 4 - priceW;

        /* Truncate name if too long */
        let displayName = item.name.toUpperCase();
        while (pdf.getTextWidth(displayName) > maxNameW && displayName.length > 3) {
          displayName = displayName.slice(0, -1);
        }
        if (displayName.length < item.name.length) displayName += "…";
        pdf.text(displayName, nameX, itemY + 3);

        /* Badges (emoji after name) */
        let badgeX = nameX + pdf.getTextWidth(displayName) + 1;
        if (item.isNew) {
          pdf.setFillColor(C.red);
          pdf.setDrawColor(C.red);
          pdf.rect(badgeX, itemY, 6, 2.5, "F");
          pdf.setFontSize(FONT.badgeNew);
          pdf.setTextColor("#fff");
          pdf.setFont("helvetica", "bold");
          pdf.text("NEW", badgeX + 3, itemY + 2, { align: "center" });
          badgeX += 7;
        }
        for (const badge of item.badges) {
          const emoji = BADGE_EMOJI[badge];
          if (emoji) {
            pdf.setFontSize(6);
            pdf.text(emoji, badgeX, itemY + 2);
            badgeX += 4;
          }
        }

        /* Price (right, bold) */
        if (item.price) {
          pdf.setFontSize(FONT.itemPrice);
          pdf.setTextColor(C.text);
          pdf.setFont("helvetica", "bold");
          pdf.text(item.price, col.x + col.w - 2, itemY + 3, { align: "right" });
        }

        /* Description (below name, italic) */
        if (item.desc) {
          itemY += LH.itemRow;
          pdf.setFontSize(FONT.itemDesc);
          pdf.setTextColor(C.desc);
          pdf.setFont("helvetica", "italic");
          /* Wrap description */
          const descLines = pdf.splitTextToSize(item.desc, col.w - 4);
          pdf.text(descLines, col.x + 2, itemY + 2);
          itemY += LH.descRow;
        } else {
          itemY += LH.itemRow;
        }

        itemY += ITEM_GAP;
      }

      y += ch + CAT_GAP;
    }

    /* QR codes in column 1 (after breakfast categories) */
    if (col === L.columns[0] && qrDataUrl) {
      const qrSize = 28;
      const qrY = Math.min(y + 5, L.footerY - qrSize - 10);
      try {
        pdf.addImage(qrDataUrl, "PNG", col.x + (col.w - qrSize) / 2, qrY, qrSize, qrSize);
        pdf.setFontSize(FONT.scanText);
        pdf.setTextColor(C.text);
        pdf.setFont("helvetica", "bold");
        pdf.text(t.scanQr, col.x + col.w / 2, qrY + qrSize + 3, { align: "center" });
      } catch { /* QR not loaded */ }
    }

    /* Review QR in column 2 */
    if (col === L.columns[1] && reviewQrUrl) {
      const qrSize = 24;
      const qrY = Math.min(y + 5, L.footerY - qrSize - 10);
      try {
        pdf.addImage(reviewQrUrl, "PNG", col.x + (col.w - qrSize) / 2, qrY, qrSize, qrSize);
        pdf.setFontSize(FONT.scanText);
        pdf.setTextColor(C.text);
        pdf.setFont("helvetica", "bold");
        pdf.text("SCAN TO REVIEW US", col.x + col.w / 2, qrY + qrSize + 3, { align: "center" });
      } catch { /* QR not loaded */ }
    }
  }

  /* ─── FOOTER ─── */
  if (menuType !== "beverage") {
    pdf.setDrawColor(C.gold);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN_L, L.footerY - 8, pw - MARGIN_R, L.footerY - 8);

    pdf.setFontSize(FONT.footerService);
    pdf.setTextColor(C.text);
    pdf.setFont("helvetica", "bold");
    pdf.text(t.serviceNote, pw / 2, L.footerY - 3, { align: "center" });

    pdf.setFontSize(FONT.footerAllergen);
    pdf.setTextColor(C.muted);
    pdf.setFont("helvetica", "normal");
    pdf.text(t.allergenNote, pw / 2, L.footerY + 2, { align: "center" });
  }

  return pdf.output("blob");
}

/* ═══════════════════════════════════════════════════════════════════
   PPTX EXPORT — PptxGenJS with editable text objects
   ═══════════════════════════════════════════════════════════════════ */

export async function exportMenuPPTX(
  sections: any[], breakfastCat: any, hasBreakfast: boolean,
  menuType: string, lang: PrintLang, paper: PrintPaper,
  branchLabel: string, t: Record<string, string>,
  qrDataUrl: string, reviewQrUrl: string,
): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pw = paper === "a3" ? 420 : 297;
  const ph = paper === "a3" ? 297 : 210;

  const L = buildLayout(sections, breakfastCat, hasBreakfast, menuType, lang, pw, ph, branchLabel, t);

  /* Convert mm to inches for PPTX */
  const MM = 0.0393701;
  const pptxW = pw * MM;
  const pptxH = ph * MM;

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "MENU", width: pptxW, height: pptxH });
  pptx.layout = "MENU";
  pptx.author = "Xurcun";

  const slide = pptx.addSlide();

  /* Background */
  slide.background = { color: C.bg };

  /* ─── HEADER ─── */
  slide.addText("XURCUN", {
    x: 0, y: L.headerY * MM, w: pptxW, h: 8 * MM,
    fontSize: 16, bold: true, color: C.text, align: "center",
    fontFace: "Georgia",
  });

  slide.addText(branchLabel.toUpperCase(), {
    x: 0, y: (L.headerY + 8) * MM, w: pptxW, h: 5 * MM,
    fontSize: FONT.headerBranch, bold: true, color: C.gold, align: "center",
    fontFace: "Georgia",
  });

  /* Gold line */
  const lineY = (L.headerY + 14) * MM;
  const lineW = 130 * MM;
  const lineX = (pptxW - lineW) / 2;
  slide.addShape(pptx.ShapeType.rect, {
    x: lineX, y: lineY, w: lineW / 2 - 3 * MM, h: 0.5 * MM,
    fill: { color: C.gold },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: lineX + lineW / 2 + 3 * MM, y: lineY, w: lineW / 2 - 3 * MM, h: 0.5 * MM,
    fill: { color: C.gold },
  });

  /* ─── COLUMNS ─── */
  for (const col of L.columns) {
    let y = L.gridY;
    for (const cat of col.cats) {
      const ch = catHeight(cat);
      if (y + ch > L.footerY - 5) break;

      /* Category block background */
      slide.addShape(pptx.ShapeType.rect, {
        x: col.x * MM, y: y * MM, w: col.w * MM, h: ch * MM,
        fill: { color: C.white }, line: { color: C.gold, width: 0.5 },
      });

      /* Number badge */
      slide.addShape(pptx.ShapeType.rect, {
        x: (col.x + 2) * MM, y: (y + 1.5) * MM, w: 5 * MM, h: 5 * MM,
        fill: { color: C.dark },
      });
      slide.addText(String(cat.num), {
        x: (col.x + 2) * MM, y: (y + 1.5) * MM, w: 5 * MM, h: 5 * MM,
        fontSize: FONT.catNum, bold: true, color: C.white, align: "center", valign: "middle",
        fontFace: "Georgia",
      });

      /* Category title */
      slide.addText(cat.title.toUpperCase(), {
        x: (col.x + 10) * MM, y: (y + 1.5) * MM, w: (col.w - 12) * MM, h: 5 * MM,
        fontSize: FONT.catTitle, bold: true, color: C.text,
        fontFace: "Georgia",
      });

      /* Gold underline */
      slide.addShape(pptx.ShapeType.rect, {
        x: (col.x + 2) * MM, y: (y + LH.catHeader - 1.5) * MM, w: (col.w - 4) * MM, h: 0.5 * MM,
        fill: { color: C.gold },
      });

      /* Items */
      let itemY = y + LH.catHeader;
      for (const item of cat.items) {
        let itemH = LH.itemRow;
        if (item.desc) itemH += LH.descRow;
        if (itemY + itemH > y + ch) break;

        /* Item name */
        slide.addText(item.name.toUpperCase(), {
          x: (col.x + 2) * MM, y: itemY * MM, w: (col.w - 4) * MM * 0.75, h: LH.itemRow * MM,
          fontSize: FONT.itemName, bold: true, color: C.text,
          fontFace: "Georgia",
        });

        /* Price */
        if (item.price) {
          slide.addText(item.price, {
            x: (col.x + col.w - 2) * MM - 15 * MM, y: itemY * MM, w: 15 * MM, h: LH.itemRow * MM,
            fontSize: FONT.itemPrice, bold: true, color: C.text, align: "right",
            fontFace: "Georgia",
          });
        }

        /* NEW badge */
        if (item.isNew) {
          slide.addText("NEW", {
            x: (col.x + col.w * 0.6) * MM, y: itemY * MM, w: 8 * MM, h: 3 * MM,
            fontSize: FONT.badgeNew, bold: true, color: C.red,
            fontFace: "Georgia",
          });
        }

        /* Description */
        if (item.desc) {
          itemY += LH.itemRow;
          slide.addText(item.desc, {
            x: (col.x + 2) * MM, y: itemY * MM, w: (col.w - 4) * MM, h: LH.descRow * MM,
            fontSize: FONT.itemDesc, italic: true, color: C.desc,
            fontFace: "Georgia",
          });
          itemY += LH.descRow;
        } else {
          itemY += LH.itemRow;
        }

        itemY += ITEM_GAP;
      }

      y += ch + CAT_GAP;
    }

    /* QR codes */
    if (col === L.columns[0] && qrDataUrl) {
      const qrSize = 28 * MM;
      const qrY = Math.min(y + 5, L.footerY - 40) * MM;
      slide.addImage({ data: qrDataUrl, x: (col.x + (col.w - 28) / 2) * MM, y: qrY, w: qrSize, h: qrSize });
      slide.addText(t.scanQr, {
        x: col.x * MM, y: qrY + qrSize + 2 * MM, w: col.w * MM, h: 5 * MM,
        fontSize: FONT.scanText, bold: true, color: C.text, align: "center",
        fontFace: "Georgia",
      });
    }

    if (col === L.columns[1] && reviewQrUrl) {
      const qrSize = 24 * MM;
      const qrY = Math.min(y + 5, L.footerY - 36) * MM;
      slide.addImage({ data: reviewQrUrl, x: (col.x + (col.w - 24) / 2) * MM, y: qrY, w: qrSize, h: qrSize });
      slide.addText("SCAN TO REVIEW US", {
        x: col.x * MM, y: qrY + qrSize + 2 * MM, w: col.w * MM, h: 5 * MM,
        fontSize: FONT.scanText, bold: true, color: C.text, align: "center",
        fontFace: "Georgia",
      });
    }
  }

  /* ─── FOOTER ─── */
  if (menuType !== "beverage") {
    slide.addShape(pptx.ShapeType.rect, {
      x: MARGIN_L * MM, y: (L.footerY - 8) * MM, w: (pw - MARGIN_L - MARGIN_R) * MM, h: 0.5 * MM,
      fill: { color: C.gold },
    });
    slide.addText(t.serviceNote, {
      x: 0, y: (L.footerY - 5) * MM, w: pptxW, h: 5 * MM,
      fontSize: FONT.footerService, bold: true, color: C.text, align: "center",
      fontFace: "Georgia",
    });
    slide.addText(t.allergenNote, {
      x: 0, y: L.footerY * MM, w: pptxW, h: 4 * MM,
      fontSize: FONT.footerAllergen, color: C.muted, align: "center",
      fontFace: "Georgia",
    });
  }

  const tl = menuType === "food" ? "ALC" : "BEV";
  await pptx.writeFile({ fileName: `xurcun_${branchLabel.replace(/\s+/g, "-")}_${tl}_${lang}.pptx` });
}
