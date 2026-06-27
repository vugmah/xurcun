import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Lang = "az" | "ru" | "en" | "tr" | "ar";
const LANGS: Lang[] = ["az", "ru", "en", "tr", "ar"];

type Multi = Record<Lang, string>;
const emptyMulti = (): Multi => ({ az: "", ru: "", en: "", tr: "", ar: "" });

const inputCls =
  "w-full bg-[#16120e] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-[#ECE6DA] outline-none focus:border-[#9D7C38]";
const labelCls = "block text-[11px] uppercase tracking-wider text-[#928876] mb-1.5";
const btnGold =
  "bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-4 py-2 transition";
const btnGhost =
  "bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-4 py-2 transition";

export default function CatalogPage(props: { menuType?: "catalog" | "cafe"; heading?: string } = {}) {
  const menuType = props.menuType ?? "catalog";
  const heading = props.heading ?? "Kataloq";
  const utils = trpc.useUtils();
  const catsQ = trpc.menu.adminGetCategories.useQuery();
  const cats = (catsQ.data ?? []).filter((c: any) => c.menuType === menuType);

  const [selCat, setSelCat] = useState<number | null>(null);
  const itemsQ = trpc.menu.getItemsByCategory.useQuery(
    { categoryId: selCat ?? 0 },
    { enabled: selCat != null },
  );

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>{heading}</h1>
        <p className="text-xs text-[#928876] mt-1">Kateqoriya və məhsul idarəetməsi · çoxdilli · AI tərcümə</p>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        {/* Categories */}
        <div>
          <CategoryPanel
            cats={cats}
            menuType={menuType}
            selCat={selCat}
            onSelect={setSelCat}
            onChanged={() => utils.menu.adminGetCategories.invalidate()}
          />
        </div>

        {/* Products */}
        <div>
          {selCat == null ? (
            <div className="border border-[#352d24] rounded-xl p-10 text-center text-[#928876] text-sm">
              Soldan bir kateqoriya seçin və ya yeni kateqoriya yaradın.
            </div>
          ) : (
            <ProductPanel
              key={selCat}
              categoryId={selCat}
              items={itemsQ.data ?? []}
              onChanged={() => itemsQ.refetch()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Categories ─────────── */
function CategoryPanel({
  cats, menuType, selCat, onSelect, onChanged,
}: { cats: any[]; menuType: "catalog" | "cafe"; selCat: number | null; onSelect: (id: number) => void; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [titleAz, setTitleAz] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const create = trpc.menu.createCategory.useMutation({
    onSuccess: () => { setTitleAz(""); setParentId(null); setAdding(false); onChanged(); },
  });
  const translate = trpc.translate.toAll.useMutation();
  const topCats = cats.filter((c) => c.parentId == null);

  const save = async () => {
    if (!titleAz.trim()) return;
    let t: any = { az: titleAz, ru: titleAz, en: titleAz, tr: titleAz, ar: titleAz };
    try { t = await translate.mutateAsync({ text: titleAz, source: "az" }); } catch { /* fallback to az */ }
    create.mutate({
      menuType,
      parentId: parentId ?? undefined,
      titleAz: t.az || titleAz,
      titleRu: t.ru || titleAz,
      titleEn: t.en || titleAz,
      titleTr: t.tr || "",
      titleAr: t.ar || "",
      isActive: true,
    });
  };

  return (
    <div className="border border-[#352d24] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a241d]">
        <h3 className="text-sm font-medium">Kateqoriyalar</h3>
        <button className={btnGhost} onClick={() => setAdding((v) => !v)}>+ Yeni</button>
      </div>
      {adding && (
        <div className="p-3 border-b border-[#2a241d] space-y-2">
          <input className={inputCls} placeholder="Kateqoriya adı (AZ)" value={titleAz}
            onChange={(e) => setTitleAz(e.target.value)} />
          <select className={inputCls} value={parentId ?? ""}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}>
            <option value="">— Ana kateqoriya (üst səviyyə) —</option>
            {topCats.map((c) => <option key={c.id} value={c.id}>{c.titleAz} — alt kateqoriya</option>)}
          </select>
          <button className={btnGold} disabled={create.isPending || translate.isPending} onClick={save}>
            {translate.isPending ? "Tərcümə olunur…" : create.isPending ? "Yadda saxlanılır…" : "Yarat (AI tərcümə)"}
          </button>
        </div>
      )}
      <div className="max-h-[60vh] overflow-auto">
        {cats.length === 0 && <div className="px-4 py-6 text-xs text-[#928876]">Hələ katalog kateqoriyası yoxdur.</div>}
        {cats.map((c) => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            style={{ paddingLeft: c.parentId != null ? 28 : undefined }}
            className={`w-full text-left px-4 py-2.5 text-sm border-b border-[#221d17] transition ${
              selCat === c.id ? "bg-[rgba(194,160,90,.14)] text-[#C2A05A]" : "hover:bg-white/5 text-[#cfc6b3]"}`}>
            {c.parentId != null && <span className="text-[#6c6353] mr-1">└</span>}
            {c.titleAz} <span className="text-[#6c6353]">· {c.itemCount ?? 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────── Products ─────────── */
function ProductPanel({
  categoryId, items, onChanged,
}: { categoryId: number; items: any[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  return (
    <div className="border border-[#352d24] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a241d]">
        <h3 className="text-sm font-medium">Məhsullar ({items.length})</h3>
        <button className={btnGold} onClick={() => setEditing({ _new: true })}>+ Yeni məhsul</button>
      </div>

      {editing ? (
        <ProductForm categoryId={categoryId} item={editing}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />
      ) : (
        <table className="w-full text-sm">
          <tbody>
            {items.length === 0 && (
              <tr><td className="px-4 py-6 text-xs text-[#928876]">Bu kateqoriyada məhsul yoxdur.</td></tr>
            )}
            {items.map((it) => (
              <tr key={it.id} className="border-b border-[#221d17] hover:bg-white/5">
                <td className="px-4 py-2.5">
                  <div className="text-[#ECE6DA]">{it.nameAz}</div>
                  <div className="text-[11px] text-[#6c6353]">
                    {it.price ? `${it.price} ₼` : "—"} · {it.priceVisible === false ? "qiymət gizli" : "qiymət görünür"}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button className="text-[#928876] hover:text-[#C2A05A] text-xs px-2 py-1" onClick={() => setEditing(it)}>
                    Redaktə
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ProductForm({
  categoryId, item, onClose, onSaved,
}: { categoryId: number; item: any; onClose: () => void; onSaved: () => void }) {
  const isNewItem = !!item._new;
  const [name, setName] = useState<Multi>(
    isNewItem ? emptyMulti() : { az: item.nameAz ?? "", ru: item.nameRu ?? "", en: item.nameEn ?? "", tr: item.nameTr ?? "", ar: item.nameAr ?? "" },
  );
  const [desc, setDesc] = useState<Multi>(
    isNewItem ? emptyMulti() : { az: item.descAz ?? "", ru: item.descRu ?? "", en: item.descEn ?? "", tr: item.descTr ?? "", ar: item.descAr ?? "" },
  );
  const [price, setPrice] = useState(item.price ?? "");
  const [priceVisible, setPriceVisible] = useState(item.priceVisible !== false);
  const [isNew, setIsNew] = useState(!!item.isNew);
  const [isActive, setIsActive] = useState(item.isActive !== false);
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [tab, setTab] = useState<Lang>("az");

  const translate = trpc.translate.toAll.useMutation();
  const statusQ = trpc.translate.status.useQuery();
  const aiEnabled = statusQ.data?.enabled;

  const create = trpc.menu.createItem.useMutation({ onSuccess: onSaved });
  const update = trpc.menu.updateItem.useMutation({ onSuccess: onSaved });

  const translateField = async (which: "name" | "desc") => {
    const src = which === "name" ? name.az : desc.az;
    if (!src.trim()) return;
    try {
      const r: any = await translate.mutateAsync({ text: src, source: "az" });
      const setter = which === "name" ? setName : setDesc;
      setter((p) => ({ az: p.az, ru: r.ru ?? p.ru, en: r.en ?? p.en, tr: r.tr ?? p.tr, ar: r.ar ?? p.ar }));
    } catch (e: any) {
      alert("Tərcümə xətası: " + (e?.message ?? e));
    }
  };

  const save = () => {
    const nameAz = name.az.trim();
    if (!nameAz) { alert("Ad (AZ) boş ola bilməz"); return; }
    const common = {
      nameAz,
      nameRu: name.ru.trim() || nameAz,
      nameEn: name.en.trim() || nameAz,
      nameTr: name.tr.trim() || undefined,
      nameAr: name.ar.trim() || undefined,
      descAz: desc.az.trim() || undefined,
      descRu: desc.ru.trim() || undefined,
      descEn: desc.en.trim() || undefined,
      descTr: desc.tr.trim() || undefined,
      descAr: desc.ar.trim() || undefined,
      price: price.trim() || undefined,
      priceVisible,
      imageUrl: imageUrl.trim() || undefined,
      isNew,
      isActive,
    };
    if (isNewItem) create.mutate({ categoryId, ...common });
    else update.mutate({ id: item.id, ...common });
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{isNewItem ? "Yeni məhsul" : "Məhsulu redaktə et"}</h4>
        <button className="text-xs text-[#928876] hover:text-[#C2A05A]" onClick={onClose}>← Geri</button>
      </div>

      {/* language tabs */}
      <div className="flex gap-1">
        {LANGS.map((l) => (
          <button key={l} onClick={() => setTab(l)}
            className={`text-[11px] uppercase px-3 py-1.5 rounded-lg border ${
              tab === l ? "bg-[#9D7C38] text-[#1a140a] border-[#9D7C38]" : "border-[#352d24] text-[#928876]"}`}>
            {l}
          </button>
        ))}
      </div>

      <div>
        <label className={labelCls}>Ad ({tab.toUpperCase()})</label>
        <input className={inputCls} value={name[tab]} onChange={(e) => setName({ ...name, [tab]: e.target.value })} />
      </div>
      <div>
        <label className={labelCls}>Təsvir ({tab.toUpperCase()})</label>
        <textarea className={inputCls + " min-h-[70px]"} value={desc[tab]} onChange={(e) => setDesc({ ...desc, [tab]: e.target.value })} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button className={btnGhost} disabled={!aiEnabled || translate.isPending} onClick={() => translateField("name")}>
          {translate.isPending ? "Tərcümə olunur…" : "Adı bütün dillərə çevir"}
        </button>
        <button className={btnGhost} disabled={!aiEnabled || translate.isPending} onClick={() => translateField("desc")}>
          Təsviri bütün dillərə çevir
        </button>
        {!aiEnabled && <span className="text-[11px] text-[#928876] self-center">AI açarı Ayarlar-da daxil edilməyib</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Qiymət (₼)</label>
          <input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="220.00" />
        </div>
      </div>

      <ImageUpload
        value={imageUrl}
        onChange={setImageUrl}
        label="Məhsul şəkli"
        hint="JPEG/PNG/WebP · maks 5MB"
      />

      <div className="flex flex-wrap gap-4">
        <Toggle on={priceVisible} set={setPriceVisible} label="Qiyməti göstər" />
        <Toggle on={isNew} set={setIsNew} label='"Yeni" nişanı' />
        <Toggle on={isActive} set={setIsActive} label="Aktiv" />
      </div>

      <div className="flex gap-2 pt-1">
        <button className={btnGold} disabled={busy} onClick={save}>{busy ? "Yadda saxlanılır…" : "Yadda saxla"}</button>
        <button className={btnGhost} onClick={onClose}>Ləğv</button>
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
