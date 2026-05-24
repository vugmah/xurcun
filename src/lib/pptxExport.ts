/**
 * PPTX Export Utility
 *
 * Generates a .pptx file from a captured menu image using pptxgenjs.
 * The image is embedded as a full-slide background for 1:1 visual fidelity
 * with the print preview.
 *
 * Usage:
 *   import { generatePPTXFromImage } from "@/lib/pptxExport";
 *   await generatePPTXFromImage({
 *     imageData: capturedImage,  // data:image/png;base64,... string
 *     layoutWidthMm: paperW,
 *     layoutHeightMm: paperH,
 *     fileName: "xurcun_white-city_ALC_az.pptx",
 *   });
 */

/** Strip the data URI prefix (e.g. "data:image/png;base64,") and return pure base64 */
function stripDataUriPrefix(dataUri: string): string {
  const commaIdx = dataUri.indexOf(",");
  if (commaIdx === -1) return dataUri; // Already bare base64
  return dataUri.slice(commaIdx + 1);
}

interface GeneratePPTXOptions {
  /** Full data URI (data:image/png;base64,...) or bare base64 string */
  imageData: string;
  /** Paper width in millimetres */
  layoutWidthMm: number;
  /** Paper height in millimetres */
  layoutHeightMm: number;
  /** Output file name (must end with .pptx) */
  fileName: string;
  /** Optional author metadata */
  author?: string;
  /** Optional title metadata */
  title?: string;
  /** Optional subject metadata */
  subject?: string;
}

/**
 * Generate a PPTX file from a captured menu image.
 *
 * Uses the image-based approach: the captured PNG is placed as a full-slide
 * image so the exported PPTX is visually identical to the print preview.
 *
 * @throws Error if pptxgenjs fails to load or generation fails
 */
export async function generatePPTXFromImage(
  opts: GeneratePPTXOptions
): Promise<void> {
  const {
    imageData,
    layoutWidthMm,
    layoutHeightMm,
    fileName,
    author = "Xurcun",
    title = "Xurcun Menu",
    subject = "Restaurant Menu",
  } = opts;

  /* ── Dynamically import pptxgenjs (keeps bundle small) ── */
  let PptxGenJS: typeof import("pptxgenjs").default;
  try {
    const mod = await import("pptxgenjs");
    PptxGenJS = mod.default ?? (mod as any);
    if (!PptxGenJS) {
      throw new Error(
        "pptxgenjs module loaded but default export is undefined. " +
          "Try: const PptxGenJS = (await import('pptxgenjs')).default;"
      );
    }
  } catch (importErr: any) {
    console.error("[PPTX Export] Failed to load pptxgenjs:", importErr);
    throw new Error(
      "Failed to load pptxgenjs library. Is it installed? (npm install pptxgenjs)"
    );
  }

  /* ── Convert mm → inches (PPTX internal unit) ── */
  const MM_TO_IN = 0.0393701;
  const layoutW = Math.round(layoutWidthMm * MM_TO_IN * 10000) / 10000;
  const layoutH = Math.round(layoutHeightMm * MM_TO_IN * 10000) / 10000;

  /* ── Build presentation ── */
  const pptx = new PptxGenJS();

  /* Define custom layout matching paper size exactly */
  pptx.defineLayout({
    name: "MENU",
    width: layoutW,
    height: layoutH,
  });
  pptx.layout = "MENU";

  /* Metadata */
  pptx.author = author;
  pptx.title = title;
  pptx.subject = subject;
  pptx.company = "Xurcun";

  /* ── Add slide with full-bleed menu image ── */
  const slide = pptx.addSlide();

  /* Strip data URI prefix before passing to pptxgenjs */
  const base64Image = stripDataUriPrefix(imageData);

  slide.addImage({
    data: base64Image,
    x: 0,
    y: 0,
    w: layoutW,
    h: layoutH,
    sizing: { type: "crop", w: layoutW, h: layoutH },
  });

  /* ── Write file ── */
  await pptx.writeFile({ fileName });
}
