import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Upload, Trash2, Image, Loader2, X, Unlink, Search, Check, Eye, RotateCcw,
  CloudUpload, FileImage, AlertCircle, Play, ChevronUp, ChevronDown
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  getAvailableImages, getImageUrl, getAssignedImageIds,
  clearAllAssignments, getAssignedImage,
} from "@/lib/imageStore";
import { ImageUpload } from "@/components/admin/ImageUpload";

/* ═══════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: "hero", label: "Hero / Ana Sehife" },
  { id: "about", label: "Haqqimizda" },
  { id: "concept", label: "Konsept" },
  { id: "gallery", label: "Qalereya" },
  { id: "menu", label: "Menu" },
  { id: "events", label: "Tedbirler" },
];

interface PhotoItem {
  id: number;
  url: string;
  filename?: string;
  altAz: string | null;
  altRu: string | null;
  altEn: string | null;
  section: string;
  sortOrder: number | null;
  active: boolean | null;
  createdAt: Date | null;
}

type UploadStatus = "pending" | "uploading" | "processing" | "done" | "error";

interface UploadQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  retryCount: number;
}

/* ═══════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════ */

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const MAX_CONCURRENT = 3;

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function MediaPage() {
  const { adminKey } = useAdminAuth();
  const utils = trpc.useUtils();

  /* ─── tRPC hooks ─── */
  const photosQuery = trpc.photos.adminGetAll.useQuery(undefined, {
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const updatePhoto = trpc.photos.update.useMutation({
    onSuccess: () => {
      utils.photos.adminGetAll.invalidate();
      utils.media.listImages.invalidate();
      utils.stats.invalidate();
    },
  });
  const deletePhoto = trpc.photos.delete.useMutation({
    onSuccess: () => {
      utils.photos.adminGetAll.invalidate();
      utils.media.listImages.invalidate();
      utils.stats.invalidate();
    },
  });
  const bulkDeletePhotos = trpc.photos.bulkDelete.useMutation({
    onSuccess: () => {
      utils.photos.adminGetAll.invalidate();
      utils.media.listImages.invalidate();
      utils.stats.invalidate();
      setSelectedIds(new Set());
    },
  });
  const createPhoto = trpc.photos.create.useMutation({
    onSuccess: () => {
      utils.photos.adminGetAll.invalidate();
      utils.media.listImages.invalidate();
      utils.stats.invalidate();
    },
  });

  /* ─── Local state ─── */
  const [uploadForm, setUploadForm] = useState({
    filename: "", altAz: "", altRu: "", altEn: "", section: "gallery", sortOrder: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── Upload queue state ─── */
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [isQueueOpen, setIsQueueOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [bulkSection, setBulkSection] = useState("menu");
  const activeUploadsRef = useRef(0);
  const queueRef = useRef(uploadQueue);
  queueRef.current = uploadQueue;

  /* ─── Derived data ─── */
  const allPhotos = (photosQuery.data ?? []) as unknown as PhotoItem[];
  const sectionFiltered = selectedSection
    ? allPhotos.filter((p) => p.section === selectedSection)
    : allPhotos;
  const filteredPhotos = searchQuery.trim()
    ? sectionFiltered.filter((p) =>
        (p.url || "").toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : sectionFiltered;

  const queueStats = useMemo(() => {
    const pending = uploadQueue.filter((q) => q.status === "pending").length;
    const uploading = uploadQueue.filter((q) => q.status === "uploading" || q.status === "processing").length;
    const done = uploadQueue.filter((q) => q.status === "done").length;
    const error = uploadQueue.filter((q) => q.status === "error").length;
    return { pending, uploading, done, error, total: uploadQueue.length };
  }, [uploadQueue]);

  const hasFailedItems = queueStats.error > 0;

  /* ─── Single-file upload (for the form) ─── */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-key": adminKey || "" },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setUploadForm({ ...uploadForm, filename: data.url });
      } else {
        alert("Yukleme xetasi: " + (data.error || "Bilinmeyen xeta"));
      }
    } catch (err) {
      alert("Yukleme xetasi: " + (err instanceof Error ? err.message : "Bilinmeyen xeta"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const savePhoto = () => {
    if (!uploadForm.filename) { alert("Evvelce sekil yukleyin"); return; }
    createPhoto.mutate({
      filename: uploadForm.filename,
      altAz: uploadForm.altAz || undefined,
      altRu: uploadForm.altRu || undefined,
      altEn: uploadForm.altEn || undefined,
      section: uploadForm.section,
      sortOrder: uploadForm.sortOrder,
    }, {
      onSuccess: () => {
        setUploadForm({ filename: "", altAz: "", altRu: "", altEn: "", section: "gallery", sortOrder: 0 });
      },
    });
  };

  /* ─── Bulk upload: add files to queue ─── */
  const addFilesToQueue = useCallback((files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;

    const newItems: UploadQueueItem[] = imageFiles.map((file) => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "pending" as UploadStatus,
      retryCount: 0,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
    setIsQueueOpen(true);
  }, []);

  /* ─── Process a single queue item ─── */
  const processQueueItem = useCallback(async (item: UploadQueueItem) => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", progress: 10 } : q))
    );

    try {
      // Step 1: Upload file to /api/upload
      const formData = new FormData();
      formData.append("file", item.file);

      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, progress: 40 } : q))
      );

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-key": adminKey || "" },
        body: formData,
      });

      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, progress: 70 } : q))
      );

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Upload failed");
      }

      // Step 2: Create photo entry in DB
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, progress: 85, status: "processing" } : q))
      );

      await createPhoto.mutateAsync({
        filename: data.url,
        section: bulkSection,
        sortOrder: 0,
      });

      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, progress: 100, status: "done" } : q))
      );
    } catch (err: any) {
      setUploadQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? { ...q, status: "error", error: err.message || "Upload failed", progress: 0 }
            : q
        )
      );
    }
  }, [adminKey, bulkSection, createPhoto]);

  /* ─── Process queue with concurrency limit ─── */
  const processQueue = useCallback(async () => {
    const pendingItems = queueRef.current.filter((q) => q.status === "pending" && q.retryCount < 3);
    if (pendingItems.length === 0) return;

    const slots = MAX_CONCURRENT - activeUploadsRef.current;
    if (slots <= 0) return;

    const toProcess = pendingItems.slice(0, slots);

    await Promise.all(
      toProcess.map(async (item) => {
        activeUploadsRef.current += 1;
        await processQueueItem(item);
        activeUploadsRef.current -= 1;
        // Trigger next batch
        processQueue();
      })
    );
  }, [processQueueItem]);

  // Auto-process queue when items are added
  useEffect(() => {
    const pending = uploadQueue.filter((q) => q.status === "pending");
    if (pending.length > 0 && activeUploadsRef.current < MAX_CONCURRENT) {
      processQueue();
    }
  }, [uploadQueue, processQueue]);

  /* ─── Retry a single failed item ─── */
  const retryItem = useCallback((item: UploadQueueItem) => {
    setUploadQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? { ...q, status: "pending", error: undefined, progress: 0, retryCount: q.retryCount + 1 }
          : q
      )
    );
  }, []);

  /* ─── Retry all failed items ─── */
  const retryAllFailed = useCallback(() => {
    setUploadQueue((prev) =>
      prev.map((q) =>
        q.status === "error"
          ? { ...q, status: "pending", error: undefined, progress: 0, retryCount: q.retryCount + 1 }
          : q
      )
    );
  }, []);

  /* ─── Remove a completed/failed item from queue ─── */
  const removeQueueItem = useCallback((id: string) => {
    setUploadQueue((prev) => prev.filter((q) => q.id !== id));
  }, []);

  /* ─── Clear completed items ─── */
  const clearCompleted = useCallback(() => {
    setUploadQueue((prev) => prev.filter((q) => q.status !== "done"));
  }, []);

  /* ─── Drag & Drop handlers ─── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    addFilesToQueue(e.dataTransfer.files);
  }, [addFilesToQueue]);

  /* ─── Bulk file input handler ─── */
  const handleBulkFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    addFilesToQueue(e.target.files);
    e.currentTarget.value = "";
  }, [addFilesToQueue]);

  /* ─── Toggle select all ─── */
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredPhotos.length && filteredPhotos.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPhotos.map((p) => p.id)));
    }
  }, [selectedIds.size, filteredPhotos]);

  /* ─── Render ─── */
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Media Idaresi</h1>
        <p className="text-white/50 text-sm">Sekil yukleyin ve galereyanizi idare edin</p>
      </div>

      {/* ═════════════════ Drag & Drop Zone ═════════════════ */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("bulk-file-input")?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer
          transition-all duration-200 select-none
          ${isDragOver
            ? "border-[#C2A05A] bg-[#C2A05A]/10 shadow-[0_0_20px_rgba(194,160,90,0.15)]"
            : "border-[#352d24] bg-[#1d1915] hover:border-[#555] hover:bg-[#1d1915]"
          }
        `}
      >
        <input
          id="bulk-file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleBulkFileSelect}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200
            ${isDragOver ? "bg-[#C2A05A]/20 scale-110" : "bg-[#1d1915]"}
          `}>
            <CloudUpload className={`w-7 h-7 transition-colors ${isDragOver ? "text-[#C2A05A]" : "text-[#a89d88]"}`} />
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              {isDragOver ? "Şəkilləri buraxın" : "Sürükləyib buraxın və ya klikləyin"}
            </p>
            <p className="text-[#a89d88] text-xs mt-1">
              Çoxsaylı şəkil fayllarını seçin və ya sürükləyib buraxın (JPEG, PNG, WebP)
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[#a89d88] text-[10px]">Bulk bölmə:</span>
            <select
              aria-label="Bulk bölmə"
              value={bulkSection}
              onChange={(e) => { e.stopPropagation(); setBulkSection(e.target.value); }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0A0A0A] border border-[#352d24] text-white/50 text-[10px] rounded px-2 py-1 focus:outline-none focus:border-[#C2A05A]"
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ═════════════════ Upload Queue Panel ═════════════════ */}
      {uploadQueue.length > 0 && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl mb-6 overflow-hidden">
          {/* Queue Header */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
            onClick={() => setIsQueueOpen(!isQueueOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {queueStats.uploading > 0 ? (
                  <Loader2 className="w-4 h-4 text-[#C2A05A] animate-spin" />
                ) : queueStats.error > 0 ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : queueStats.pending > 0 ? (
                  <Play className="w-4 h-4 text-amber-400" />
                ) : (
                  <Check className="w-4 h-4 text-green-400" />
                )}
                <span className="text-white text-sm font-medium">Yükləmə növbəsi</span>
              </div>
              <div className="flex items-center gap-1.5">
                {queueStats.uploading > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400">
                    {queueStats.uploading} yüklənir
                  </span>
                )}
                {queueStats.done > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-400/10 text-green-400">
                    {queueStats.done} hazır
                  </span>
                )}
                {queueStats.error > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-400/10 text-red-400">
                    {queueStats.error} xəta
                  </span>
                )}
                {queueStats.pending > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[#a89d88]">
                    {queueStats.pending} gözləyir
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasFailedItems && (
                <button
                  onClick={(e) => { e.stopPropagation(); retryAllFailed(); }}
                  className="text-[10px] px-2 py-1 rounded bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Hamısını təkrarla
                </button>
              )}
              {queueStats.done > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); clearCompleted(); }}
                  className="text-[10px] px-2 py-1 rounded bg-white/5 text-[#a89d88] hover:bg-white/10 transition-colors"
                >
                  Təmizlə
                </button>
              )}
              {isQueueOpen ? (
                <ChevronUp className="w-4 h-4 text-white/30" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/30" />
              )}
            </div>
          </div>

          {/* Queue Items */}
          {isQueueOpen && (
            <div className="border-t border-[#352d24] max-h-64 overflow-y-auto">
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-4 py-2.5 border-b border-[#352d24]/50 last:border-b-0"
                >
                  {/* File icon */}
                  <div className="shrink-0">
                    {item.status === "done" ? (
                      <div className="w-8 h-8 rounded bg-green-400/10 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                    ) : item.status === "error" ? (
                      <div className="w-8 h-8 rounded bg-red-400/10 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-[#1d1915] flex items-center justify-center">
                        <FileImage className="w-4 h-4 text-[#a89d88]" />
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white/80 text-xs truncate">{item.name}</p>
                      <span className="text-[#a89d88] text-[10px] shrink-0">{formatBytes(item.size)}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#1d1915] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.status === "error"
                              ? "bg-red-400"
                              : item.status === "done"
                              ? "bg-green-400"
                              : "bg-[#C2A05A]"
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[#a89d88] text-[10px] w-8 text-right">{item.progress}%</span>
                    </div>

                    {/* Error message */}
                    {item.error && (
                      <p className="text-red-400/70 text-[10px] mt-0.5">{item.error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-1">
                    {item.status === "error" && (
                      <button
                        onClick={() => retryItem(item)}
                        disabled={item.retryCount >= 3}
                        aria-label="Təkrarla"
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded text-white/30 hover:text-[#C2A05A] hover:bg-[#C2A05A]/10 transition-colors disabled:opacity-30"
                        title="Təkrarla"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {item.status === "done" && (
                      <button
                        onClick={() => removeQueueItem(item.id)}
                        aria-label="Növbədən sil"
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(item.status === "error") && (
                      <button
                        onClick={() => removeQueueItem(item.id)}
                        aria-label="Növbədən sil"
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Sil"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(item.status === "uploading" || item.status === "processing") && (
                      <Loader2 className="w-3.5 h-3.5 text-[#C2A05A] animate-spin" />
                    )}
                    {item.status === "pending" && (
                      <span className="text-[#a89d88] text-[10px]">gözləyir</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════ Single Upload Form ═════════════════ */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5 mb-6">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#C2A05A]" />
          Yeni Sekil Yukle (Tək)
        </h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="single-upload-file" className="text-[#a89d88] text-xs block mb-1">Sekil *</label>
            <input
              id="single-upload-file"
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-[#352d24] text-white/70 hover:text-white hover:bg-white/5"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {uploading ? "Yuklenir..." : "Sechil"}
              </Button>
              {uploadForm.filename && (
                <div className="flex items-center gap-2 text-sm text-[#C2A05A]">
                  <Image className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{uploadForm.filename}</span>
                  <button
                    aria-label="Şəkli sil"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/40 hover:text-red-400"
                    onClick={() => setUploadForm({ ...uploadForm, filename: "" })}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="single-upload-section" className="text-[#a89d88] text-xs block mb-1">Bolme *</label>
            <select
              id="single-upload-section"
              value={uploadForm.section}
              onChange={(e) => setUploadForm({ ...uploadForm, section: e.target.value })}
              className="w-full bg-[#0A0A0A] border border-[#352d24] text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-[#C2A05A]"
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Input
            aria-label="AZ Alt metni"
            placeholder="AZ Alt metni"
            value={uploadForm.altAz}
            onChange={(e) => setUploadForm({ ...uploadForm, altAz: e.target.value })}
            className="bg-[#0A0A0A] border-[#352d24] text-white text-sm"
          />
          <Input
            aria-label="RU Alt metni"
            placeholder="RU Alt metni"
            value={uploadForm.altRu}
            onChange={(e) => setUploadForm({ ...uploadForm, altRu: e.target.value })}
            className="bg-[#0A0A0A] border-[#352d24] text-white text-sm"
          />
          <Input
            aria-label="EN Alt text"
            placeholder="EN Alt text"
            value={uploadForm.altEn}
            onChange={(e) => setUploadForm({ ...uploadForm, altEn: e.target.value })}
            className="bg-[#0A0A0A] border-[#352d24] text-white text-sm"
          />
        </div>

        <Button
          className="bg-[#9D7C38] hover:bg-[#C2A05A] text-[#0A0A0A]"
          onClick={savePhoto}
          disabled={createPhoto.isPending || !uploadForm.filename}
        >
          <Upload className="w-4 h-4 mr-2" />
          {createPhoto.isPending ? "Elave edilir..." : "Elave Et"}
        </Button>
      </div>

      {/* ═════════════════ Filters ═════════════════ */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Button
          size="sm"
          variant={selectedSection === null ? "default" : "ghost"}
          className={selectedSection === null ? "bg-[#C2A05A]/15 text-[#C2A05A]" : "text-white/50 hover:text-white"}
          onClick={() => setSelectedSection(null)}
        >
          Hamisi ({allPhotos.length})
        </Button>
        {SECTIONS.map((s) => {
          const count = allPhotos.filter((p) => p.section === s.id).length;
          return (
            <Button
              key={s.id}
              size="sm"
              variant={selectedSection === s.id ? "default" : "ghost"}
              className={selectedSection === s.id ? "bg-[#C2A05A]/15 text-[#C2A05A]" : "text-white/50 hover:text-white"}
              onClick={() => setSelectedSection(s.id)}
            >
              {s.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* ═════════════════ Search + Bulk Delete Controls ═════════════════ */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <input
            aria-label="Fayl adına görə axtar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fayl adina gore axtar..."
            className="w-full pl-8 pr-3 py-2 bg-[#1d1915] border border-[#352d24] text-white text-xs rounded-lg focus:outline-none focus:border-[#C2A05A]"
          />
          {searchQuery && (
            <button
              aria-label="Axtarışı təmizlə"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/30 hover:text-white/60"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Select All */}
        {filteredPhotos.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="px-3 py-2 text-[#a89d88] text-xs border border-[#352d24] rounded-md hover:border-white/20 hover:text-white/60 transition-all flex items-center gap-1.5"
          >
            {selectedIds.size === filteredPhotos.length && filteredPhotos.length > 0 ? (
              <>
                <X className="w-3 h-3" /> Seçimi ləğv et
              </>
            ) : (
              <>
                <Check className="w-3 h-3" /> Hamısını seç ({filteredPhotos.length})
              </>
            )}
          </button>
        )}

        {/* Bulk Delete Bar */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[#C2A05A] text-xs font-medium bg-[#C2A05A]/10 px-2 py-1 rounded">
              {selectedIds.size} seçildi
            </span>
            <button
              onClick={() => {
                if (!window.confirm(`${selectedIds.size} sekli silmek istediyinize emin misiniz?`)) return;
                bulkDeletePhotos.mutate({ ids: Array.from(selectedIds) });
              }}
              disabled={bulkDeletePhotos.isPending}
              className="px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              {bulkDeletePhotos.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              Seçilənləri sil
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-2 text-[#a89d88] text-xs border border-[#352d24] rounded-md hover:border-white/20 hover:text-white/60 transition-all"
            >
              Təmizlə
            </button>
          </div>
        )}
      </div>

      {/* ═════════════════ Photo Grid ═════════════════ */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 text-[#a89d88]">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Bu bolmede sekil yoxdur</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isSelected={selectedIds.has(photo.id)}
              onToggleSelect={(id) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
              onUpdate={(id, data) => updatePhoto.mutate({ id, ...data })}
              onDelete={(id) => {
                if (confirm("Bu sekli silmek istediyinize eminsiniz?")) {
                  deletePhoto.mutate({ id });
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                  });
                }
              }}
            />
          ))}
        </div>
      )}

      {/* ═════════════════ Food Photo Assignment Section ═════════════════ */}
      <div className="pt-8 border-t border-[#352d24] mt-8">
        <h2 className="text-lg font-bold text-white">Məhsul Şəkilləri</h2>
        <p className="text-white/50 text-sm mt-1">Kataloq məhsullarının şəkillərini yüklə və ya dəyiş</p>
      </div>
      <FoodPhotoAssignment />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHOTO CARD COMPONENT
   ═══════════════════════════════════════════════════════════ */

function PhotoCard({
  photo,
  isSelected,
  onToggleSelect,
  onUpdate,
  onDelete,
}: {
  photo: PhotoItem;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onUpdate: (id: number, data: object) => void;
  onDelete: (id: number) => void;
}) {
  const sectionLabel = SECTIONS.find((s) => s.id === photo.section)?.label ?? photo.section;

  return (
    <div className={`bg-[#1d1915] border rounded-xl overflow-hidden group transition-all ${
      isSelected ? "border-[#C2A05A]/60 ring-1 ring-[#C2A05A]/20" : "border-[#352d24]"
    }`}>
      <div className="aspect-[4/3] bg-[#0A0A0A] relative overflow-hidden">
        {/* Selection checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(photo.id); }}
            aria-label={isSelected ? "Seçimi ləğv et" : "Seç"}
            aria-pressed={isSelected}
            className={`p-2.5 -m-2.5 flex items-center justify-center transition-all`}
          >
            <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
              isSelected
                ? "bg-[#C2A05A] border-[#C2A05A]"
                : "bg-black/40 border-white/30 hover:border-white/60"
            }`}>
              {isSelected && <Check className="w-3 h-3 text-[#0A0A0A]" />}
            </span>
          </button>
        </div>
        <img
          src={photo.url || photo.filename || ""}
          alt={photo.altAz ?? ""}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="destructive"
            aria-label="Şəkli sil"
            className="w-9 h-9 p-0"
            onClick={() => onDelete(photo.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
        {photo.active === false && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white/60 text-xs bg-black/60 px-2 py-1 rounded">Pasiv</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-[#C2A05A] bg-[#C2A05A]/10 px-1.5 py-0.5 rounded">
            {sectionLabel}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#a89d88]">Aktiv</span>
            <Switch
              checked={photo.active ?? true}
              onCheckedChange={(v) => onUpdate(photo.id, { active: v })}
            />
          </div>
        </div>
        {photo.altAz && (
          <p className="text-white/50 text-xs truncate">{photo.altAz}</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOD PHOTO ASSIGNMENT
   ═══════════════════════════════════════════════════════════ */

type FoodPhotoOption = {
  imageId: string;
  imageUrl: string;
  label: string;
};

function normalizeImageId(value: string): string {
  if (!value) return "";
  const clean = value.split("?")[0].split("#")[0];
  const file = clean.split("/").pop() || clean;
  return file.replace(/\.(webp|jpe?g|png|gif)$/i, "");
}

function resolveFoodPhotoUrl(value: string, imageId: string): string {
  if (!value) return getImageUrl(imageId);
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/") || value.startsWith("data:")) {
    return value;
  }
  if (/\.(webp|jpe?g|png|gif)(\?|#|$)/i.test(value)) {
    return `/food-photos/${value}`;
  }
  return getImageUrl(imageId);
}

function foodPhotoFallbacks(photo: FoodPhotoOption): string[] {
  const candidates = [
    photo.imageUrl,
    getImageUrl(photo.imageId),
    `/food-photos/${photo.imageId}.jpg`,
    `/food-photos/${photo.imageId}.jpeg`,
    `/food-photos/${photo.imageId}.png`,
  ];
  return Array.from(new Set(candidates.filter(Boolean)));
}

function PhotoPickerModal({
  isOpen, onClose, imageOptions, assignments,
  currentImageId, onSelect, productName,
}: {
  isOpen: boolean; onClose: () => void;
  imageOptions: FoodPhotoOption[]; assignments: Record<string, string>;
  currentImageId: string | null;
  onSelect: (photo: FoodPhotoOption) => void; productName: string;
}) {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "unassigned">("all");
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const assignedIds = useMemo(() => {
    const ids = Object.values(assignments).filter(Boolean).map(normalizeImageId);
    return ids.length > 0 ? new Set(ids) : getAssignedImageIds();
  }, [assignments]);

  const filteredImages = useMemo(() => {
    let list = imageOptions;
    if (filterMode === "unassigned") list = list.filter((photo) => !assignedIds.has(photo.imageId));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((photo) =>
        photo.imageId.toLowerCase().includes(q) ||
        photo.imageUrl.toLowerCase().includes(q) ||
        photo.label.toLowerCase().includes(q)
      );
    }
    return list;
  }, [imageOptions, filterMode, assignedIds, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0A0A0A] border border-[#352d24] rounded-2xl flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#352d24] shrink-0">
          <div>
            <h3 className="text-white text-sm font-medium">Şəkil Seç</h3>
            <p className="text-[#a89d88] text-[11px] mt-0.5 truncate max-w-[280px]">{productName}</p>
          </div>
          <button onClick={onClose} aria-label="Bağla" className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 px-5 py-3 border-b border-[#352d24] shrink-0 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input aria-label="Fayl adı axtar" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Fayl adı axtar..." autoFocus className="w-full pl-8 pr-3 py-2 bg-[#1d1915] border border-[#352d24] text-white text-xs rounded-lg focus:outline-none focus:border-[#C2A05A]" />
          </div>
          <div className="flex gap-1">
            <button onClick={() => setFilterMode("all")} className={`px-3 py-2 rounded-lg text-[11px] border transition-all ${filterMode === "all" ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30" : "bg-[#1d1915] text-[#a89d88] border-[#352d24] hover:border-white/10"}`}>Hamısı</button>
            <button onClick={() => setFilterMode("unassigned")} className={`px-3 py-2 rounded-lg text-[11px] border transition-all ${filterMode === "unassigned" ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30" : "bg-[#1d1915] text-[#a89d88] border-[#352d24] hover:border-white/10"}`}>Təyin edilməyib</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#a89d88] text-sm">
              <Image className="w-8 h-8 mb-2 opacity-30" />
              <p>Şəkil tapılmadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {filteredImages.map((photo) => {
                const isCurrent = currentImageId === photo.imageId;
                const isAssigned = assignedIds.has(photo.imageId) && !isCurrent;
                return (
                  <button
                    key={`${photo.imageId}:${photo.imageUrl}`}
                    onClick={() => { onSelect(photo); onClose(); }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                      isCurrent ? "border-[#C2A05A] ring-2 ring-[#C2A05A]/20" : isAssigned ? "border-white/5 opacity-50" : "border-transparent hover:border-white/20"
                    }`}
                  >
                    <div className="aspect-square bg-[#1d1915]">
                      <img
                        src={photo.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const img = e.currentTarget;
                          const current = img.currentSrc || img.src;
                          const next = foodPhotoFallbacks(photo).find((candidate) => {
                            try {
                              return new URL(candidate, window.location.origin).href !== current;
                            } catch {
                              return candidate !== current;
                            }
                          });
                          if (next) {
                            img.src = next;
                            return;
                          }
                          img.style.display = "none";
                        }}
                      />
                    </div>
                    {isCurrent && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#C2A05A] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#0A0A0A]" />
                      </div>
                    )}
                    {isAssigned && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white/50 text-[9px] font-medium">Təyin edilib</span>
                      </div>
                    )}
                    <div className="px-1.5 py-1 bg-[#0A0A0A]">
                      <p className="text-[#a89d88] text-[9px] truncate font-mono">{photo.label}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewId(photo.imageId); }}
                      aria-label="Önizləmə"
                      className="absolute bottom-6 left-1.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded bg-black/50 text-white/40 hover:text-white hover:bg-black/70 transition-all"
                    >
                      <Eye className="w-2.5 h-2.5" />
                    </button>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-[#352d24] shrink-0 flex items-center justify-between">
          <p className="text-[#a89d88] text-[11px]">{filteredImages.length} şəkil</p>
          <button onClick={onClose} className="px-4 py-2 text-[#a89d88] text-xs border border-[#352d24] rounded-lg hover:border-white/20 transition-all">Bağla</button>
        </div>
      </div>
      {previewId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-8" onClick={() => setPreviewId(null)}>
          <div className="absolute inset-0 bg-black/90" />
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageOptions.find((photo) => photo.imageId === previewId)?.imageUrl || getImageUrl(previewId)}
              alt=""
              className="max-w-full max-h-[80vh] rounded-lg object-contain"
            />
            <button onClick={() => setPreviewId(null)} aria-label="Bağla" className="absolute -top-3 -right-3 w-9 h-9 rounded-full bg-[#352d24] text-white/60 hover:text-white flex items-center justify-center">
              <X className="w-3.5 h-3.5" />
            </button>
            <p className="text-center text-white/50 text-[10px] mt-2 font-mono">{previewId}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOD PHOTO ASSIGNMENT — Product list with visual picker
   ═══════════════════════════════════════════════════════════ */

/* ─── Catalog product image manager (boutique) ───
   Lists DB catalog products and lets the admin upload/replace each product's
   image. Writes straight to menu_items.imageUrl via menu.updateItem, so the
   change is what the public catalog renders. */
function FoodPhotoAssignment() {
  const utils = trpc.useUtils();
  const [searchProd, setSearchProd] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const catalogQ = trpc.catalog.storefront.useQuery({ menuType: "catalog" });
  const cats = (catalogQ.data?.categories ?? []) as any[];
  const items = (catalogQ.data?.items ?? []) as any[];

  const catTitleById = useMemo(() => {
    const m = new Map<number, string>();
    cats.forEach((c) => m.set(c.id, c.titleAz));
    return m;
  }, [cats]);

  const updateItem = trpc.menu.updateItem.useMutation({
    onSuccess: () => { utils.catalog.storefront.invalidate(); },
  });

  const products = useMemo(
    () =>
      items.map((it) => ({
        id: it.id as number,
        name: (it.nameAz as string) || "—",
        cat: catTitleById.get(it.categoryId) || "—",
        imageUrl: (it.imageUrl as string) || "",
      })),
    [items, catTitleById],
  );

  const categories = useMemo(() => cats.map((c) => c.titleAz as string), [cats]);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCat) list = list.filter((p) => p.cat === selectedCat);
    if (searchProd.trim()) {
      const q = searchProd.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, selectedCat, searchProd]);

  const withImage = useMemo(() => products.filter((p) => p.imageUrl).length, [products]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-[#a89d88] text-xs">
        <span>{products.length} məhsul</span>
        <span className="w-px h-3 bg-white/10" />
        <span className="text-green-400/70">{withImage} şəkilli</span>
        <span className="w-px h-3 bg-white/10" />
        <span className="text-amber-400/70">{products.length - withImage} şəkilsiz</span>
      </div>

      {catalogQ.isLoading && (
        <div className="text-amber-400/70 text-xs bg-amber-400/5 border border-amber-400/10 rounded-lg p-2 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> Kataloq yüklənir…
        </div>
      )}
      {catalogQ.error && (
        <div className="text-red-400 text-xs bg-red-400/5 border border-red-400/10 rounded-lg p-2">
          <p className="font-semibold">API XƏTASI:</p>
          <p className="mt-1">{catalogQ.error.message}</p>
        </div>
      )}
      {!catalogQ.isLoading && !catalogQ.error && products.length === 0 && (
        <div className="p-6 bg-amber-400/5 border border-amber-400/10 rounded-xl">
          <p className="text-amber-400/70 text-xs font-medium">Kataloqda məhsul yoxdur</p>
          <p className="text-[#a89d88] text-[11px] mt-1">
            Əvvəlcə Kataloq səhifəsindən məhsul əlavə et, sonra burada şəkillərini idarə et.
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
          <input
            aria-label="Məhsul axtar"
            value={searchProd}
            onChange={(e) => setSearchProd(e.target.value)}
            placeholder="Məhsul axtar…"
            className="w-full pl-7 pr-3 py-1.5 bg-[#0A0A0A] border border-[#352d24] text-white text-xs rounded-md focus:outline-none focus:border-[#C2A05A] transition-colors"
          />
        </div>
        <select
          aria-label="Kateqoriya filtri"
          value={selectedCat || ""}
          onChange={(e) => setSelectedCat(e.target.value || null)}
          className="px-2 py-1.5 bg-[#0A0A0A] border border-[#352d24] text-white text-xs rounded-md focus:outline-none focus:border-[#C2A05A]"
        >
          <option value="">Bütün kateqoriyalar</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filteredProducts.length === 0 && products.length > 0 ? (
          <div className="p-8 text-center text-[#a89d88] text-xs bg-[#1d1915] border border-[#352d24] rounded-xl">
            Məhsul tapılmadı
          </div>
        ) : (
          filteredProducts.map((prod) => (
            <div key={prod.id} className="bg-[#1d1915] border border-[#352d24] rounded-xl px-4 py-3">
              <ImageUpload
                value={prod.imageUrl}
                onChange={(url) => updateItem.mutate({ id: prod.id, imageUrl: url })}
                label={`${prod.name}  ·  ${prod.cat}`}
                accept="image/*"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Divider between Media sections ─── */
function SectionDivider({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="pt-8 border-t border-[#352d24] mt-8">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {subtitle && <p className="text-white/50 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
