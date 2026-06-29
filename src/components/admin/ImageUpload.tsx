import { useRef, useState } from "react";
import { getAdminKey } from "@/lib/adminAuthStorage";

/**
 * Reusable admin image/file uploader.
 * Picks a file → POSTs to /api/upload (x-admin-key) → returns the stored URL.
 * Works with Supabase (cloud) or the local-disk fallback on the server.
 */
export function ImageUpload({
  value,
  onChange,
  accept = "image/*",
  label = "Şəkil",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(value);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-key": getAdminKey() || "" },
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else if (data.error === "SUPABASE_NOT_CONFIGURED") {
        setErr("Server yaddaşı qoşulmayıb. Texniki dəstəyə bildir.");
      } else {
        setErr(data.error || "Yükləmə alınmadı");
      }
    } catch (e: any) {
      setErr(e?.message || "Yükləmə xətası");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const labelCls = "block text-[11px] uppercase tracking-wider text-[#928876] mb-1.5";
  const inputCls =
    "w-full bg-[#16120e] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-[#ECE6DA] outline-none focus:border-[#9D7C38]";

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="flex items-start gap-3">
        {/* preview */}
        <div className="w-16 h-16 rounded-lg border border-[#352d24] bg-[#16120e] overflow-hidden flex items-center justify-center shrink-0">
          {value ? (
            isVideo ? (
              <video src={value} className="w-full h-full object-cover" muted />
            ) : (
              <img src={value} alt="" className="w-full h-full object-cover" />
            )
          ) : (
            <span className="text-[10px] text-[#6c6353]">yox</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={pick}
              disabled={busy}
              className="bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-3 py-2 transition disabled:opacity-50"
            >
              {busy ? "Yüklənir…" : "Fayl seç və yüklə"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-3 py-2 transition"
              >
                Sil
              </button>
            )}
          </div>
          <input
            className={inputCls}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="və ya URL yapışdır: https://…"
            aria-label={`${label} URL`}
          />
          {hint && <p className="text-[10px] text-[#6c6353]">{hint}</p>}
          {err && <p className="text-[11px] text-[#e0a0a0]">{err}</p>}
        </div>
        <input ref={inputRef} type="file" accept={accept} onChange={onFile} className="hidden" />
      </div>
    </div>
  );
}
