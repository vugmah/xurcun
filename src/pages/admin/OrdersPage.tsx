import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Package, Trash2, Plus, X, Phone, Check, Minus } from "lucide-react";

const STATUSES = ["new", "contacted", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<Status, string> = {
  new: "Yeni",
  contacted: "Əlaqə saxlanıldı",
  completed: "Tamamlandı",
  cancelled: "Ləğv edildi",
};
const STATUS_CLR: Record<Status, string> = {
  new: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  contacted: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  completed: "bg-green-500/15 text-green-300 border-green-500/30",
  cancelled: "bg-white/10 text-[#a89d88] border-white/15",
};
const SOURCE_LABEL: Record<string, string> = { manual: "Əl ilə", catalog: "Kataloq", corporate: "Korporativ" };

const fmt = (d: unknown) => {
  try { return new Date(d as string).toLocaleString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
};

export default function OrdersPage() {
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selId, setSelId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const utils = trpc.useUtils();

  const listQ = trpc.orders.adminList.useQuery(filter === "all" ? undefined : { status: filter });
  const detailQ = trpc.orders.adminGet.useQuery({ id: selId as number }, { enabled: selId != null });

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { utils.orders.adminList.invalidate(); if (selId) utils.orders.adminGet.invalidate({ id: selId }); },
  });
  const del = trpc.orders.delete.useMutation({
    onSuccess: () => { utils.orders.adminList.invalidate(); setSelId(null); },
  });

  const orders = listQ.data ?? [];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:px-6 md:py-8">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-white text-lg font-medium flex items-center gap-2"><Package className="w-5 h-5 text-[#C2A05A]" /> Sifarişlər</h1>
          <p className="text-[#a89d88] text-xs mt-1">Hədiyyə qutusu / kataloq sorğularını izləyin (yeni → əlaqə → tamamlandı).</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 text-sm bg-[#9D7C38] hover:bg-[#C2A05A] text-black font-medium px-3.5 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Yeni sifariş
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {(["all", ...STATUSES] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${filter === s ? "bg-[#9D7C38] text-black border-[#9D7C38]" : "bg-[#1d1915] text-white/50 border-[#352d24] hover:text-white"}`}>
            {s === "all" ? "Hamısı" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {listQ.isLoading && <div className="text-[#a89d88] text-sm py-12 text-center">Yüklənir…</div>}
      {listQ.isError && <div className="text-red-400 text-sm py-12 text-center">Sifarişlər yüklənmədi. <button className="underline" onClick={() => listQ.refetch()}>Yenidən</button></div>}

      {!listQ.isLoading && !listQ.isError && orders.length === 0 && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-12 text-center">
          <Package className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-[#a89d88] text-sm">Hələ sifariş yoxdur.</p>
        </div>
      )}

      <div className="space-y-2.5">
        {orders.map((o) => (
          <button key={o.id} onClick={() => setSelId(o.id)}
            className="w-full text-left bg-[#1d1915] border border-[#352d24] hover:border-[#352d24] rounded-xl p-4 transition-colors">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[#a89d88] text-xs font-mono">#{o.id}</span>
                <div className="min-w-0">
                  <div className="text-white text-sm font-medium truncate">{o.customerName || "Adsız müştəri"}</div>
                  <div className="text-[#a89d88] text-xs flex items-center gap-2 flex-wrap">
                    {o.customerPhone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{o.customerPhone}</span>}
                    <span>· {SOURCE_LABEL[o.source as string] || o.source}</span>
                    <span>· {fmt(o.createdAt)}</span>
                  </div>
                </div>
              </div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap inline-flex items-center gap-1 ${STATUS_CLR[o.status as Status] || STATUS_CLR.new}`}>
                {(o.status as Status) === "cancelled" ? <Minus className="w-3 h-3" /> : (o.status as Status) === "completed" ? <Check className="w-3 h-3" /> : null}
                {STATUS_LABEL[o.status as Status] || o.status}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail drawer */}
      {selId != null && (
        <div className="fixed inset-0 z-[9998] flex justify-end bg-black/60" onClick={() => setSelId(null)}>
          <div className="w-full max-w-md h-full bg-[#0d0d0d] border-l border-[#352d24] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-medium">Sifariş #{selId}</h2>
              <button onClick={() => setSelId(null)} aria-label="Bağla" className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {detailQ.isLoading && <div className="text-[#a89d88] text-sm">Yüklənir…</div>}
            {detailQ.data && (
              <div className="space-y-5">
                <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4 space-y-1.5 text-sm">
                  <div className="text-white">{detailQ.data.order.customerName || "Adsız müştəri"}</div>
                  {detailQ.data.order.customerPhone && (
                    <a href={`tel:${detailQ.data.order.customerPhone}`} className="text-[#C2A05A] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{detailQ.data.order.customerPhone}</a>
                  )}
                  <div className="text-[#a89d88] text-xs">{SOURCE_LABEL[detailQ.data.order.source as string] || detailQ.data.order.source} · {fmt(detailQ.data.order.createdAt)}</div>
                  {detailQ.data.order.note && <div className="text-white/70 text-xs pt-2 border-t border-[#352d24] whitespace-pre-wrap">{detailQ.data.order.note}</div>}
                </div>

                {detailQ.data.items.length > 0 && (
                  <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4">
                    <div className="text-[#a89d88] text-xs mb-2">Məhsullar</div>
                    <div className="space-y-1.5">
                      {detailQ.data.items.map((it) => (
                        <div key={it.id} className="flex items-center justify-between text-sm text-white/80">
                          <span className="truncate">{it.name}</span>
                          <span className="text-white/50 whitespace-nowrap ml-3">{it.qty} ×{it.price ? ` ${it.price}` : ""}</span>
                        </div>
                      ))}
                    </div>
                    {detailQ.data.order.total && <div className="text-right text-white text-sm font-medium mt-3 pt-2 border-t border-[#352d24]">Cəmi: {detailQ.data.order.total}</div>}
                  </div>
                )}

                <div>
                  <div className="text-[#a89d88] text-xs mb-2">Status</div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => (
                      <button key={s} disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: selId, status: s })}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${detailQ.data!.order.status === s ? STATUS_CLR[s] : "bg-[#1d1915] text-white/50 border-[#352d24] hover:text-white"}`}>
                        {STATUS_LABEL[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => { if (confirm("Bu sifarişi silmək istəyirsiniz?")) del.mutate({ id: selId }); }}
                  disabled={del.isPending}
                  className="inline-flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4" /> Sil
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} onDone={() => { utils.orders.adminList.invalidate(); setShowCreate(false); }} />}
    </div>
  );
}

function CreateOrderModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<{ name: string; qty: string; price: string }[]>([{ name: "", qty: "1", price: "" }]);
  const create = trpc.orders.create.useMutation({ onSuccess: onDone });

  const setItem = (i: number, k: "name" | "qty" | "price", v: string) =>
    setItems((p) => p.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  const submit = () => {
    const cleanItems = items.filter((it) => it.name.trim()).map((it) => ({ name: it.name.trim(), qty: Math.max(1, parseInt(it.qty) || 1), price: it.price.trim() || undefined }));
    create.mutate({ customerName: name.trim() || undefined, customerPhone: phone.trim() || undefined, note: note.trim() || undefined, source: "manual", items: cleanItems });
  };

  const input = "w-full bg-[#0d0d0d] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C2A05A]";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-[#1d1915] border border-[#352d24] rounded-xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-medium">Yeni sifariş</h2>
          <button onClick={onClose} aria-label="Bağla" className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <label htmlFor="create-order-name" className="sr-only">Müştəri adı</label>
          <input id="create-order-name" className={input} placeholder="Müştəri adı" value={name} onChange={(e) => setName(e.target.value)} />
          <label htmlFor="create-order-phone" className="sr-only">Telefon</label>
          <input id="create-order-phone" className={input} placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label htmlFor="create-order-note" className="sr-only">Qeyd</label>
          <textarea id="create-order-note" className={input} rows={2} placeholder="Qeyd" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="space-y-2">
            <div className="text-[#a89d88] text-xs">Məhsullar</div>
            {items.map((it, i) => (
              <div key={i} className="flex gap-2">
                <input aria-label={`Məhsul ${i + 1} ad`} className={input + " flex-[3]"} placeholder="Ad" value={it.name} onChange={(e) => setItem(i, "name", e.target.value)} />
                <input aria-label={`Məhsul ${i + 1} say`} className={input + " flex-[1] min-w-0"} placeholder="Say" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} />
                <input aria-label={`Məhsul ${i + 1} qiymət`} className={input + " flex-[1.5] min-w-0"} placeholder="Qiymət" value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} />
                {items.length > 1 && <button onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))} aria-label="Məhsulu sil" className="text-white/30 hover:text-red-400 px-1 min-w-[44px] min-h-[44px] flex items-center justify-center"><X className="w-4 h-4" /></button>}
              </div>
            ))}
            <button onClick={() => setItems((p) => [...p, { name: "", qty: "1", price: "" }])} className="text-[#C2A05A] text-xs inline-flex items-center gap-1"><Plus className="w-3 h-3" /> Məhsul əlavə et</button>
          </div>
          {create.isError && <div className="text-red-400 text-xs">Saxlanmadı. Yenidən cəhd edin.</div>}
          <button onClick={submit} disabled={create.isPending} className="w-full bg-[#9D7C38] hover:bg-[#C2A05A] text-black font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {create.isPending ? "Saxlanılır…" : "Yadda saxla"}
          </button>
        </div>
      </div>
    </div>
  );
}
