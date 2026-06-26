import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { trpc } from "@/providers/trpc";

type Branch = { id?: number; name?: string; slug?: string; hasCafe?: boolean };

function origin() {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://xurcun.az";
}

function QrImg({ url }: { url: string }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    QRCode.toDataURL(url, { width: 240, margin: 1, color: { dark: "#2E2A25", light: "#ffffff" } })
      .then(setSrc)
      .catch(() => setSrc(""));
  }, [url]);
  return src ? <img src={src} alt="QR" className="w-full h-full object-contain" /> : <div className="w-full h-full" />;
}

function QrCard({ name, type, url }: { name: string; type: string; url: string }) {
  return (
    <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4 text-center">
      <div className="text-[9.5px] uppercase tracking-wider text-[#C2A05A] mb-2.5">{type}</div>
      <div className="bg-white rounded-lg p-2.5 w-[130px] h-[130px] mx-auto mb-3">
        <QrImg url={url} />
      </div>
      <div className="text-[15px] font-semibold" style={{ fontFamily: "Rufolo, serif", color: "#ECE6DA" }}>{name}</div>
      <div className="text-[10px] text-[#928876] mt-1 mb-3 break-all">{url.replace(/^https?:\/\//, "")}</div>
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="inline-block bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-4 py-1.5 transition">
        Aç / yoxla
      </a>
    </div>
  );
}

export default function QrPage() {
  const branchesQ = trpc.branch.adminGetBranches.useQuery();
  const branches = (branchesQ.data ?? []) as Branch[];
  const base = origin();

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>QR Menyu</h1>
          <p className="text-xs text-[#928876] mt-1">Hər filial üçün avtomatik QR · skan → həmin filialın menyusu</p>
        </div>
        <button onClick={() => window.print()}
          className="bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-4 py-2 transition">
          Çap et
        </button>
      </div>

      <div className="rounded-lg px-4 py-2.5 mb-5 text-[11.5px]" style={{ background: "rgba(194,160,90,.1)", border: "1px solid rgba(194,160,90,.3)", color: "#C2A05A" }}>
        ⓘ QR-ları çap edib vitrin/masaya qoyun. "Kafe" işarəli filiallarda həm katalog, həm kafe menyusu üçün ayrıca QR var.
      </div>

      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
        {branches.map((b) => (
          <QrCard key={`${b.id}-cat`} name={b.name ?? ""} type="Katalog" url={`${base}/menu/${b.slug}`} />
        ))}
        {branches.filter((b) => b.hasCafe).map((b) => (
          <QrCard key={`${b.id}-cafe`} name={`${b.name} · Kafe`} type="☕ Kafe Menyu" url={`${base}/menu/${b.slug}/kafe`} />
        ))}
        {branches.length === 0 && <div className="text-xs text-[#928876]">Filial yoxdur.</div>}
      </div>
    </div>
  );
}
