import { useMemo, useState } from "react";
import { Upload, X, ImageIcon, Camera } from "lucide-react";
import { HOMEPAGE_IMAGE_SLOTS } from "@/lib/homepageImageStore";
import { getAdminKey } from "@/lib/adminAuthStorage";
import { trpc } from "@/providers/trpc";

interface SlotEditForm {
  url?: string;
  altAz?: string;
  altRu?: string;
  altEn?: string;
}

export default function HomepagePhotosPage() {
  const utils = trpc.useUtils();
  const rowsQ = trpc.photos.getAll.useQuery();

  /* Map of homepage rows keyed by slot key (section suffix). */
  const rowMap = useMemo(() => {
    const m: Record<string, { id: number; url: string; altAz: string | null; altRu: string | null; altEn: string | null }> = {};
    const PREFIX = "homepage:";
    (rowsQ.data ?? []).forEach((p) => {
      if (p.section?.startsWith(PREFIX)) {
        m[p.section.slice(PREFIX.length)] = {
          id: p.id,
          url: p.url,
          altAz: p.altAz,
          altRu: p.altRu,
          altEn: p.altEn,
        };
      }
    });
    return m;
  }, [rowsQ.data]);

  const upsert = trpc.photos.upsertBySection.useMutation({
    onSuccess: () => utils.photos.getAll.invalidate(),
  });
  const del = trpc.photos.delete.useMutation({
    onSuccess: () => utils.photos.getAll.invalidate(),
  });

  const [editSlot, setEditSlot] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SlotEditForm>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const openEdit = (key: string) => {
    const slot = HOMEPAGE_IMAGE_SLOTS.find((s) => s.key === key)!;
    const row = rowMap[key];
    setEditForm({
      url: row?.url ?? slot.defaultSrc,
      altAz: row?.altAz ?? "",
      altRu: row?.altRu ?? "",
      altEn: row?.altEn ?? "",
    });
    setEditSlot(key);
  };

  const handleSave = (key: string) => {
    const slot = HOMEPAGE_IMAGE_SLOTS.find((s) => s.key === key);
    if (!slot) return;
    upsert.mutate({
      section: slot.section,
      url: editForm.url || slot.defaultSrc,
      altAz: editForm.altAz || undefined,
      altRu: editForm.altRu || undefined,
      altEn: editForm.altEn || undefined,
    });
    setEditSlot(null);
  };

  const handleReset = (key: string) => {
    const row = rowMap[key];
    if (row) del.mutate({ id: row.id });
    setEditSlot(null);
  };

  const handleUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 3 * 1024 * 1024) { alert("Max 3MB"); return; }

    const slot = HOMEPAGE_IMAGE_SLOTS.find((s) => s.key === key);
    if (!slot) return;

    setUploadingKey(key);
    const r = new FileReader();
    r.onload = (ev) => {
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
            setUploadingKey(null);
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
              const row = rowMap[key];
              upsert.mutate({
                section: slot.section,
                url: data.url,
                altAz: row?.altAz || undefined,
                altRu: row?.altRu || undefined,
                altEn: row?.altEn || undefined,
              });
            } else {
              alert("Yükleme başarısız: " + (data.error || "Bilinmeyen hata"));
            }
          } catch (err) {
            alert("Yükleme hatası: " + (err instanceof Error ? err.message : "Ağ hatası"));
          } finally {
            setUploadingKey(null);
          }
        }, "image/jpeg", 0.85);
      };
      img.onerror = () => {
        alert("Görsel okunamadı. Lütfen tekrar deneyin.");
        setUploadingKey(null);
      };
      img.src = ev.target?.result as string;
    };
    r.onerror = () => setUploadingKey(null);
    r.readAsDataURL(f);
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-1">Ana Sayfa Fotoğrafları</h1>
      <p className="text-[#a89d88] text-xs mb-6">Ana sayfada görünen tüm fotoğraf alanlarını yönetin.</p>

      {rowsQ.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#352d24] border-t-[#C2A05A] animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {HOMEPAGE_IMAGE_SLOTS.map((slot) => {
          const row = rowMap[slot.key];
          const currentSrc = row?.url ?? slot.defaultSrc;
          const isEditing = editSlot === slot.key;

          return (
            <div key={slot.key} className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
              {/* Preview */}
              <div className="relative aspect-video bg-[#16120e]">
                {currentSrc ? (
                  <img
                    src={currentSrc}
                    alt={slot.alt ?? slot.label}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/10" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{slot.label}</p>
                    <p className="text-[#a89d88] text-[10px] font-mono">{slot.key}</p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-2 border-t border-[#352d24]">
                    <input
                      aria-label={`Image URL — ${slot.key}`}
                      value={editForm.url || ""}
                      onChange={(e) => setEditForm((p) => ({ ...p, url: e.target.value }))}
                      placeholder="Image URL"
                      className="w-full px-2 py-1 bg-[#16120e] border border-[#352d24] text-white text-xs rounded"
                    />
                    <div className="grid grid-cols-3 gap-1">
                      <input aria-label={`Alt AZ — ${slot.key}`} value={editForm.altAz || ""} onChange={(e) => setEditForm((p) => ({ ...p, altAz: e.target.value }))} placeholder="Alt AZ" className="px-2 py-1 bg-[#16120e] border border-[#352d24] text-white text-xs rounded" />
                      <input aria-label={`Alt RU — ${slot.key}`} value={editForm.altRu || ""} onChange={(e) => setEditForm((p) => ({ ...p, altRu: e.target.value }))} placeholder="Alt RU" className="px-2 py-1 bg-[#16120e] border border-[#352d24] text-white text-xs rounded" />
                      <input aria-label={`Alt EN — ${slot.key}`} value={editForm.altEn || ""} onChange={(e) => setEditForm((p) => ({ ...p, altEn: e.target.value }))} placeholder="Alt EN" className="px-2 py-1 bg-[#16120e] border border-[#352d24] text-white text-xs rounded" />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button onClick={() => handleSave(slot.key)} disabled={upsert.isPending} className="px-4 min-h-[44px] bg-[#9D7C38] text-[#0A0A0A] text-xs font-medium rounded hover:bg-[#C2A05A] transition disabled:opacity-50">Kaydet</button>
                      <button onClick={() => handleReset(slot.key)} disabled={del.isPending} className="px-4 min-h-[44px] text-red-400 text-xs border border-red-400/20 rounded hover:bg-red-400/10 transition disabled:opacity-50">Sıfırla</button>
                      <button onClick={() => setEditSlot(null)} className="px-4 min-h-[44px] text-[#a89d88] text-xs border border-[#352d24] rounded hover:border-[#555] transition">İptal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {/* Upload */}
                    {(() => {
                      const isUploading = uploadingKey === slot.key;
                      return (
                        <label className={isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}>
                          <input type="file" aria-label={`Şəkil yüklə — ${slot.key}`} accept=".jpg,.jpeg,.png,.webp" className="hidden" disabled={isUploading} onChange={(e) => handleUpload(slot.key, e)} />
                          <span className="inline-flex items-center gap-1 px-3 min-h-[44px] rounded bg-[#C2A05A]/15 text-[#C2A05A] text-[11px] border border-[#C2A05A]/30 hover:bg-[#C2A05A]/20 transition"><Upload className="w-3 h-3" /> {isUploading ? "Yükleniyor…" : "Yükle"}</span>
                        </label>
                      );
                    })()}
                    {/* Edit URL/alt */}
                    <button onClick={() => openEdit(slot.key)} className="inline-flex items-center gap-1 px-3 min-h-[44px] rounded bg-white/5 text-[#a89d88] text-[11px] border border-white/10 hover:border-[#555] hover:text-white transition"><Camera className="w-3 h-3" /> Düzenle</button>
                    {/* Remove override if a DB row exists */}
                    {row && (
                      <button onClick={() => handleReset(slot.key)} disabled={del.isPending} className="inline-flex items-center gap-1 px-3 min-h-[44px] rounded text-red-400 text-[11px] border border-red-400/20 hover:bg-red-400/10 transition disabled:opacity-50"><X className="w-3 h-3" /> Sil</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
