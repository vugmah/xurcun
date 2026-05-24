import { useState, useRef, useEffect, useCallback } from "react";
import { X, RotateCcw, Check, Square, RectangleHorizontal, Scan } from "lucide-react";

interface ImageEditorProps {
  imageSrc: string;
  onApply: (editedBase64: string) => void;
  onCancel: () => void;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturate: number;
}

const DEFAULT_FILTERS: Filters = { brightness: 100, contrast: 100, saturate: 100 };

type CropRatio = "1:1" | "4:3" | "free";

export default function ImageEditor({ imageSrc, onApply, onCancel }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [cropRatio, setCropRatio] = useState<CropRatio>("1:1");
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  // Compute target aspect from ratio mode
  const targetAspect = cropRatio === "1:1" ? 1 : cropRatio === "4:3" ? 4 / 3 : 0;

  // Fit a rectangle of aspect `a` inside the unit square, centered
  const fitCrop = useCallback((a: number) => {
    if (a <= 0) return { x: 0.05, y: 0.05, w: 0.9, h: 0.9 }; // free
    const imgAspect = imgRef.current ? imgRef.current.naturalWidth / imgRef.current.naturalHeight : 1;
    // Work in image-normalized space
    let w: number, h: number;
    const containerAspect = 1; // our preview is square
    if (imgAspect >= a) {
      // Image is wider than target → limit by height
      h = 0.9;
      w = h * a / imgAspect * containerAspect;
      if (w > 0.9) { w = 0.9; h = w / a * imgAspect / containerAspect; }
    } else {
      // Image is taller than target → limit by width
      w = 0.9;
      h = w / a * imgAspect / containerAspect;
      if (h > 0.9) { h = 0.9; w = h * a / imgAspect * containerAspect; }
    }
    // Clamp
    w = Math.min(0.9, Math.max(0.2, w));
    h = Math.min(0.9, Math.max(0.2, h));
    return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
  }, []);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const c = fitCrop(targetAspect);
      setCrop(c);
      drawPreview(img, filters, c);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw when filters or crop change
  useEffect(() => {
    if (imgRef.current) drawPreview(imgRef.current, filters, crop);
  }, [filters, crop]);

  // When ratio changes, recenter crop
  useEffect(() => {
    if (imgRef.current) {
      const c = fitCrop(targetAspect);
      setCrop(c);
      drawPreview(imgRef.current, filters, c);
    }
  }, [cropRatio, targetAspect, fitCrop]);

  const drawPreview = useCallback((img: HTMLImageElement, f: Filters, c: typeof crop) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cropW = Math.round(img.naturalWidth * c.w);
    const cropH = Math.round(img.naturalHeight * c.h);
    if (cropW < 1 || cropH < 1) return;
    canvas.width = cropW;
    canvas.height = cropH;

    ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturate}%)`;
    ctx.drawImage(img, img.naturalWidth * c.x, img.naturalHeight * c.y, cropW, cropH, 0, 0, cropW, cropH);
    ctx.filter = "none";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    dragStart.current = { x: pos.x, y: pos.y, cropX: crop.x, cropY: crop.y, cropW: crop.w, cropH: crop.h };
    const handleX = crop.x + crop.w;
    const handleY = crop.y + crop.h;
    if (Math.abs(pos.x - handleX) < 0.05 && Math.abs(pos.y - handleY) < 0.05) {
      setIsResizing(true);
    } else if (pos.x >= crop.x && pos.x <= crop.x + crop.w && pos.y >= crop.y && pos.y <= crop.y + crop.h) {
      setIsDragging(true);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging && !isResizing) return;
    const pos = getPos(e);
    const start = dragStart.current;

    if (isDragging) {
      let nx = start.cropX + (pos.x - start.x);
      let ny = start.cropY + (pos.y - start.y);
      nx = Math.max(0, Math.min(1 - crop.w, nx));
      ny = Math.max(0, Math.min(1 - crop.h, ny));
      setCrop(prev => ({ ...prev, x: nx, y: ny }));
    } else if (isResizing) {
      let nw = start.cropW + (pos.x - start.x);
      // Enforce aspect ratio while resizing
      if (targetAspect > 0) {
        const imgAspect = imgRef.current ? imgRef.current.naturalWidth / imgRef.current.naturalHeight : 1;
        const containerAspect = 1;
        // nw in container space → nh should maintain aspect
        let nh = (nw / targetAspect) * imgAspect / containerAspect;
        // Alternatively if user dragged more vertically, use that
        const altNh = start.cropH + (pos.y - start.y);
        if (Math.abs(altNh - nh) > 0.02) nh = altNh;
        nh = Math.max(0.1, Math.min(1 - crop.y, nh));
        nw = nh * targetAspect / imgAspect * containerAspect;
        nw = Math.max(0.1, Math.min(1 - crop.x, nw));
        nh = nw / targetAspect * imgAspect / containerAspect;
        setCrop(prev => ({ ...prev, w: nw, h: nh }));
      } else {
        let nh = start.cropH + (pos.y - start.y);
        nw = Math.max(0.1, Math.min(1 - crop.x, nw));
        nh = Math.max(0.1, Math.min(1 - crop.y, nh));
        setCrop(prev => ({ ...prev, w: nw, h: nh }));
      }
    }
  };

  const handlePointerUp = () => { setIsDragging(false); setIsResizing(false); };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onApply(canvas.toDataURL("image/jpeg", 0.92));
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS });
    if (imgRef.current) {
      const c = fitCrop(targetAspect);
      setCrop(c);
      drawPreview(imgRef.current, DEFAULT_FILTERS, c);
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    left: `${crop.x * 100}%`,
    top: `${crop.y * 100}%`,
    width: `${crop.w * 100}%`,
    height: `${crop.h * 100}%`,
    border: "2px dashed #C9A96E",
    background: "rgba(201, 169, 110, 0.1)",
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
  };
  const handleStyle: React.CSSProperties = {
    position: "absolute", right: -6, bottom: -6, width: 12, height: 12,
    background: "#C9A96E", borderRadius: "50%", cursor: "nwse-resize",
  };

  const RatioBtn = ({ ratio, icon: Icon }: { ratio: CropRatio; icon: typeof Square }) => (
    <button
      onClick={() => setCropRatio(ratio)}
      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] border transition-all ${
        cropRatio === ratio
          ? "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30"
          : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
      }`}
    >
      <Icon className="w-3 h-3" />
      {ratio === "free" ? "Serbest" : ratio}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-xl max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h3 className="text-white font-medium text-sm">Fotoğraf Düzenle</h3>
          <button onClick={onCancel} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Ratio selector */}
        <div className="flex items-center gap-2 px-4 pt-3">
          <span className="text-white/40 text-[10px] uppercase tracking-wider">Kırpma:</span>
          <RatioBtn ratio="1:1" icon={Square} />
          <RatioBtn ratio="4:3" icon={RectangleHorizontal} />
          <RatioBtn ratio="free" icon={Scan} />
        </div>

        {/* Upload guidance */}
        <div className="px-4 pt-2">
          <p className="text-[#C9A96E]/60 text-[10px]">
            Öneri: 1200×1200 px kare fotoğraf yükleyin. Ürünü ortalayın, etrafında boşluk bırakın.
          </p>
        </div>

        {/* Preview */}
        <div className="p-4">
          <div
            ref={containerRef}
            className="relative w-full aspect-square bg-[#0A0A0A] rounded overflow-hidden select-none"
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            {imgRef.current && (
              <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 w-full h-full"
                style={{
                  objectFit: "contain",
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`,
                  opacity: 0.3,
                  pointerEvents: "none",
                }}
              />
            )}
            <div style={overlayStyle} onMouseDown={e => { e.stopPropagation(); handlePointerDown(e); }} onTouchStart={e => { e.stopPropagation(); handlePointerDown(e); }}>
              <div style={handleStyle} />
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <p className="text-white/30 text-[10px] mt-1.5 text-center">
            Kırpma alanını sürükleyin. Sağ alt köşeyi tutup yeniden boyutlandırın.
            {cropRatio !== "free" && ` Oran kilitli: ${cropRatio}`}
          </p>
        </div>

        {/* Filters */}
        <div className="px-4 pb-2 space-y-3">
          {([
            { key: "brightness", label: "Parlaklık" },
            { key: "contrast", label: "Kontrast" },
            { key: "saturate", label: "Renk" },
          ] as const).map(f => (
            <div key={f.key} className="flex items-center gap-3">
              <span className="text-white/50 text-xs w-20 shrink-0">{f.label}</span>
              <input
                type="range" min={0} max={200}
                value={filters[f.key]}
                onChange={e => setFilters(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                className="flex-1 accent-[#C9A96E]"
              />
              <span className="text-white/50 text-xs w-10 text-right">{filters[f.key]}%</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-[#222]">
          <button onClick={handleReset} className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white/50 hover:text-white border border-[#333] hover:border-[#555]">
            <RotateCcw className="w-3 h-3" /> Sıfırla
          </button>
          <button onClick={handleApply} className="flex items-center gap-1 px-4 py-1.5 rounded bg-[#C9A96E] text-[#0A0A0A] text-xs font-medium hover:bg-[#D4A853] ml-auto">
            <Check className="w-3 h-3" /> Uygula
          </button>
          <button onClick={onCancel} className="px-3 py-1.5 rounded text-xs text-white/50 hover:text-white border border-[#333] hover:border-[#555]">
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
