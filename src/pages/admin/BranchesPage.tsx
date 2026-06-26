import { useState } from "react";
import { trpc } from "@/providers/trpc";

const inputCls = "w-full bg-[#16120e] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-[#ECE6DA] outline-none focus:border-[#9D7C38]";
const labelCls = "block text-[11px] uppercase tracking-wider text-[#928876] mb-1.5";
const btnGold = "bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-4 py-2 transition";
const btnGhost = "bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-4 py-2 transition";

type Branch = {
  id?: number; name?: string; slug?: string; address?: string | null; phone?: string | null;
  whatsappNumber?: string | null; mapUrl?: string | null; videoUrl?: string | null;
  hasCafe?: boolean; sortOrder?: number; isActive?: boolean;
};

export default function BranchesPage() {
  const listQ = trpc.branch.adminGetBranches.useQuery();
  const [editing, setEditing] = useState<Branch | null>(null);

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>Mağazalar</h1>
          <p className="text-xs text-[#928876] mt-1">Filial məlumatları · ünvan · WhatsApp · Maps · video</p>
        </div>
        {!editing && <button className={btnGold} onClick={() => setEditing({ isActive: true, hasCafe: false })}>+ Yeni filial</button>}
      </div>

      {editing ? (
        <BranchForm branch={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); listQ.refetch(); }} />
      ) : (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#2a241d] text-[#928876] text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Ad</th>
                <th className="text-left px-5 py-3 font-medium">Ünvan</th>
                <th className="text-left px-5 py-3 font-medium">Telefon</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(listQ.data ?? []).map((b) => (
                <tr key={(b as Branch).id} className="border-b border-[#221d17] last:border-0 hover:bg-white/5">
                  <td className="px-5 py-3 text-[#ECE6DA]">{(b as Branch).name}<div className="text-[11px] text-[#6c6353]">/menu/{(b as Branch).slug}</div></td>
                  <td className="px-5 py-3 text-[#928876]">{(b as Branch).address || "—"}</td>
                  <td className="px-5 py-3 text-[#928876]">{(b as Branch).phone || "—"}</td>
                  <td className="px-5 py-3">
                    <span className="text-[10.5px] px-2.5 py-1 rounded-full" style={(b as Branch).isActive !== false ? { background: "#16291f", color: "#5bbd86" } : { background: "#2c1418", color: "#e0697a" }}>
                      {(b as Branch).isActive !== false ? "Aktiv" : "Passiv"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-[#928876] hover:text-[#C2A05A] text-xs px-2 py-1" onClick={() => setEditing(b as Branch)}>Redaktə</button>
                  </td>
                </tr>
              ))}
              {(listQ.data ?? []).length === 0 && (
                <tr><td className="px-5 py-6 text-xs text-[#928876]">Filial yoxdur.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BranchForm({ branch, onClose, onSaved }: { branch: Branch; onClose: () => void; onSaved: () => void }) {
  const isNew = branch.id == null;
  const [f, setF] = useState<Branch>({ ...branch });
  const set = (k: keyof Branch, v: unknown) => setF((p) => ({ ...p, [k]: v }));

  const create = trpc.branch.createBranch.useMutation({ onSuccess: onSaved });
  const update = trpc.branch.updateBranch.useMutation({ onSuccess: onSaved });
  const del = trpc.branch.deleteBranch.useMutation({ onSuccess: onSaved });

  const save = () => {
    if (!f.name?.trim() || !f.slug?.trim()) { alert("Ad və slug tələb olunur"); return; }
    const data = {
      name: f.name.trim(), slug: f.slug.trim(),
      address: f.address?.trim() || undefined, phone: f.phone?.trim() || undefined,
      whatsappNumber: f.whatsappNumber?.trim() || undefined, mapUrl: f.mapUrl?.trim() || undefined,
      videoUrl: f.videoUrl?.trim() || undefined, hasCafe: !!f.hasCafe,
      sortOrder: f.sortOrder ?? 0, isActive: f.isActive !== false,
    };
    if (isNew) create.mutate(data);
    else update.mutate({ id: branch.id as number, ...data });
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5 max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-semibold" style={{ fontFamily: "Rufolo, serif" }}>{isNew ? "Yeni filial" : "Filialı redaktə et"}</h3>
        <button className="text-xs text-[#928876] hover:text-[#C2A05A]" onClick={onClose}>← Geri</button>
      </div>
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Ad</label><input className={inputCls} value={f.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
          <div><label className={labelCls}>Slug (QR: /menu/...)</label><input className={inputCls} value={f.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></div>
        </div>
        <div><label className={labelCls}>Ünvan</label><input className={inputCls} value={f.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className={labelCls}>Telefon</label><input className={inputCls} value={f.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><label className={labelCls}>WhatsApp nömrəsi</label><input className={inputCls} value={f.whatsappNumber ?? ""} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="994xxxxxxxxx" /></div>
        </div>
        <div><label className={labelCls}>Google Maps URL</label><input className={inputCls} value={f.mapUrl ?? ""} onChange={(e) => set("mapUrl", e.target.value)} /></div>
        <div><label className={labelCls}>Video URL (/videos/...)</label><input className={inputCls} value={f.videoUrl ?? ""} onChange={(e) => set("videoUrl", e.target.value)} placeholder={`/videos/${f.slug || "slug"}.mp4`} /></div>
        <div className="flex flex-wrap gap-5">
          <Toggle on={f.isActive !== false} set={(v) => set("isActive", v)} label="Aktiv" />
          <Toggle on={!!f.hasCafe} set={(v) => set("hasCafe", v)} label="Mağaza içi kafe" />
        </div>
        <div className="flex gap-2 pt-1">
          <button className={btnGold} disabled={busy} onClick={save}>{busy ? "Yadda saxlanılır…" : "Yadda saxla"}</button>
          <button className={btnGhost} onClick={onClose}>Ləğv</button>
          {!isNew && <button className="ml-auto text-xs text-[#e0697a] hover:underline px-3" onClick={() => { if (confirm("Filialı silmək?")) del.mutate({ id: branch.id as number }); }}>Sil</button>}
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-2.5">
      <span className={`w-9 h-5 rounded-full relative transition ${on ? "bg-[#9D7C38]" : "bg-[#403930]"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "right-0.5" : "left-0.5"}`} />
      </span>
      <span className="text-xs text-[#ECE6DA]">{label}</span>
    </button>
  );
}
