import { useState, useEffect, useCallback } from "react";
import { Upload, X, RotateCcw, ImageIcon, Camera } from "lucide-react";
import {
  HOMEPAGE_IMAGE_SLOTS,
  getHomepageImageEdits,
  saveHomepageImageEdit,
  resetHomepageImage,
  getHomepageImageSrc,
  type HomepageImageEdit,
} from "@/lib/homepageImageStore";
import { getAdminKey } from "@/lib/adminAuthStorage";

export default function HomepagePhotosPage() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);
  const edits = getHomepageImageEdits();

  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<HomepageImageEdit>({});

  const openEdit = (key: string) => {
    const e = edits[key] || {};
    const slot = HOMEPAGE_IMAGE_SLOTS.find(s => s.key === key)!;
    setEditForm({
      image_url: getHomepageImageSrc(key),
      alt_az: e.alt_az ?? slot.alt_az,
      alt_ru: e.alt_ru ?? slot.alt_ru,
      alt_en: e.alt_en ?? slot.alt_en,
      is_active: e.is_active ?? slot.is_active ?? true,
    });
    setEditSlot(key);
  };

  const handleSave = (key: string) => {
    const payload: HomepageImageEdit = {
      image_url: editForm.image_url || undefined,
      alt_az: editForm.alt_az || undefined,
      alt_ru: editForm.alt_ru || undefined,
      alt_en: editForm.alt_en || undefined,
      is_active: editForm.is_active,
    };
    // Remove image_url if it's the default
    const slot = HOMEPAGE_IMAGE_SLOTS.find(s => s.key === key);
    if (payload.image_url === slot?.defaultSrc) delete payload.image_url;
    saveHomepageImageEdit(key, payload);
    setEditSlot(null);
    forceUpdate();
  };

  const handleReset = (key: string) => {
    resetHomepageImage(key);
    setEditSlot(null);
    forceUpdate();
  };

  const handleUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 3 * 1024 * 1024) { alert("Max 3MB"); return; }

    const r = new FileReader();
    r.onload = ev => {
      const img = new Image();
      img.onload = async () => {
        const MAX = 1600;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);

        /* Upload to the server (Railway volume) via /api/upload */
        canvas.toBlob(async (blob) => {
          if (!blob) {
            alert("Görsel işlenemedi. Lütfen tekrar deneyin.");
            return;
          }
          const formData = new FormData();
          formData.append("file", blob, "upload.jpg");
          try {
            const res = await fetch("/api/upload", {
              method: "POST",
              headers: { "x-admin-key": getAdminKey() || "" },
              body: formData,
            });
            const data = await res.json();
            if (data.success && data.url) {
              /* Save the returned file URL */
              saveHomepageImageEdit(key, { image_url: data.url });
            } else {
              alert("Yükleme başarısız: " + (data.error || "Bilinmeyen hata"));
            }
          } catch (err) {
            alert("Yükleme hatası: " + (err instanceof Error ? err.message : "Ağ hatası"));
          }
          forceUpdate();
        }, "image/jpeg", 0.85);
      };
      img.src = ev.target?.result as string;
    };
    r.readAsDataURL(f);
  };

  const toggleActive = (key: string) => {
    const e = edits[key] || {};
    saveHomepageImageEdit(key, { is_active: !(e.is_active ?? true) });
    forceUpdate();
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1">Ana Sayfa Fotoğrafları</h1>
      <p className="text-white/40 text-xs mb-6">Ana sayfada görünen tüm fotoğraf alanlarını yönetin.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HOMEPAGE_IMAGE_SLOTS.map(slot => {
          const currentSrc = getHomepageImageSrc(slot.key);
          const isActive = (edits[slot.key]?.is_active ?? slot.is_active ?? true);
          const isEditing = editSlot === slot.key;

          return (
            <div key={slot.key} className={`bg-[#111] border rounded-xl overflow-hidden ${isActive ? "border-[#222]" : "border-red-400/20 opacity-60"}`}>
              {/* Preview */}
              <div className="relative aspect-video bg-[#0A0A0A]">
                {currentSrc ? (
                  <img
                    src={currentSrc}
                    alt={slot.alt_en}
                    className="w-full h-full object-cover object-center"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/10" />
                  </div>
                )}
                {/* Active badge */}
                <button
                  onClick={() => toggleActive(slot.key)}
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${isActive ? "bg-green-400/15 text-green-400 border-green-400/30" : "bg-red-400/15 text-red-400 border-red-400/30"}`}
                >
                  {isActive ? "Aktif" : "Pasif"}
                </button>
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{slot.label_tr}</p>
                    <p className="text-white/30 text-[10px] font-mono">{slot.key}</p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t border-[#222]">
                    <input
                      value={editForm.image_url || ""}
                      onChange={e => setEditForm(p => ({ ...p, image_url: e.target.value }))}
                      placeholder="Image URL veya base64"
                      className="w-full px-2 py-1 bg-[#0A0A0A] border border-[#333] text-white text-xs rounded"
                    />
                    <div className="grid grid-cols-3 gap-1">
                      <input value={editForm.alt_az || ""} onChange={e => setEditForm(p => ({ ...p, alt_az: e.target.value }))} placeholder="Alt AZ" className="px-2 py-1 bg-[#0A0A0A] border border-[#333] text-white text-xs rounded" />
                      <input value={editForm.alt_ru || ""} onChange={e => setEditForm(p => ({ ...p, alt_ru: e.target.value }))} placeholder="Alt RU" className="px-2 py-1 bg-[#0A0A0A] border border-[#333] text-white text-xs rounded" />
                      <input value={editForm.alt_en || ""} onChange={e => setEditForm(p => ({ ...p, alt_en: e.target.value }))} placeholder="Alt EN" className="px-2 py-1 bg-[#0A0A0A] border border-[#333] text-white text-xs rounded" />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => handleSave(slot.key)} className="px-3 py-1 bg-[#C9A96E] text-[#0A0A0A] text-xs font-medium rounded hover:bg-[#D4A853]">Kaydet</button>
                      <button onClick={() => handleReset(slot.key)} className="px-3 py-1 text-red-400 text-xs border border-red-400/20 rounded hover:bg-red-400/10">Sıfırla</button>
                      <button onClick={() => setEditSlot(null)} className="px-3 py-1 text-white/40 text-xs border border-[#333] rounded hover:border-[#555]">İptal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    {/* Upload */}
                    <label className="cursor-pointer">
                      <input type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={e => handleUpload(slot.key, e)} />
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#C9A96E]/15 text-[#C9A96E] text-[11px] border border-[#C9A96E]/30 hover:bg-[#C9A96E]/20"><Upload className="w-3 h-3" /> Yükle</span>
                    </label>
                    {/* Edit URL/alt */}
                    <button onClick={() => openEdit(slot.key)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/5 text-white/60 text-[11px] border border-white/10 hover:border-[#555] hover:text-white"><Camera className="w-3 h-3" /> Düzenle</button>
                    {/* Remove if custom */}
                    {edits[slot.key]?.image_url && (
                      <button onClick={() => handleReset(slot.key)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-red-400 text-[11px] border border-red-400/20 hover:bg-red-400/10"><X className="w-3 h-3" /> Sil</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
