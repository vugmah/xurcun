import { useState } from "react";
import { Check, Minus, ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { ImageUpload } from "@/components/admin/ImageUpload";

const inputCls = "w-full bg-[#16120e] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-[#ECE6DA] outline-none focus:border-[#9D7C38]";
const labelCls = "block text-[11px] uppercase tracking-wider text-[#928876] mb-1.5";
const btnGold = "bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-4 py-2 transition";
const btnGhost = "bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-4 py-2 transition";

const LANGS = ["az", "ru", "en", "tr", "ar"] as const;
type Lang = (typeof LANGS)[number];
type L = Record<Lang, string>;

type Gallery = { src: string; alt: L };
type Section = { h2: L; body: L[]; image?: string; imageAlt?: L; gallery?: Gallery[] };

type Post = {
  id?: number;
  slug: string;
  date: string;
  cover?: string;
  video?: string;
  title: L;
  desc: L;
  h1: L;
  lead: L;
  sections: Section[];
  sortOrder: number;
  published: boolean;
};

const emptyL = (): L => ({ az: "", ru: "", en: "", tr: "", ar: "" });

const emptyPost = (): Post => ({
  slug: "",
  date: new Date().toISOString().slice(0, 10),
  cover: "",
  video: "",
  title: emptyL(),
  desc: emptyL(),
  h1: emptyL(),
  lead: emptyL(),
  sections: [],
  sortOrder: 0,
  published: false,
});

export default function BlogAdminPage() {
  const listQ = trpc.blog.adminList.useQuery();
  const [editing, setEditing] = useState<Post | null>(null);

  const reorder = trpc.blog.reorder.useMutation({ onSuccess: () => listQ.refetch() });
  const del = trpc.blog.delete.useMutation({ onSuccess: () => listQ.refetch() });

  const posts = (listQ.data ?? []) as Post[];

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= posts.length) return;
    const reordered = [...posts];
    const [item] = reordered.splice(index, 1);
    reordered.splice(next, 0, item);
    reorder.mutate({ items: reordered.map((p, i) => ({ id: p.id as number, sortOrder: i })) });
  };

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>Blog</h1>
          <p className="text-xs text-[#928876] mt-1">Blog yazıları · 5 dil · şəkillər · qalereya</p>
        </div>
        {!editing && (
          <button className={btnGold} onClick={() => setEditing(emptyPost())}>+ Yeni yazı</button>
        )}
      </div>

      {editing ? (
        <BlogForm
          post={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); listQ.refetch(); }}
        />
      ) : (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#2a241d] text-[#928876] text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Şəkil</th>
                <th className="text-left px-5 py-3 font-medium">Başlıq</th>
                <th className="text-left px-5 py-3 font-medium">Tarix</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p.id} className="border-b border-[#221d17] last:border-0 hover:bg-white/5">
                  <td className="px-5 py-3">
                    <div className="w-12 h-12 rounded-lg border border-[#352d24] bg-[#16120e] overflow-hidden flex items-center justify-center">
                      {p.cover ? (
                        <img src={p.cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-[#6c6353]">yox</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#ECE6DA]">
                    {p.title.az || "(başlıqsız)"}
                    <div className="text-[11px] text-[#6c6353]">/blog/{p.slug}</div>
                  </td>
                  <td className="px-5 py-3 text-[#928876]">{p.date || "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full"
                      style={p.published ? { background: "#16291f", color: "#5bbd86" } : { background: "#2a2620", color: "#a89d88" }}
                    >
                      {p.published ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                      {p.published ? "Dərc olunub" : "Gizli"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="text-[#928876] hover:text-[#C2A05A] min-w-[44px] min-h-[44px] inline-flex items-center justify-center disabled:opacity-30"
                        onClick={() => move(i, -1)}
                        disabled={i === 0 || reorder.isPending}
                        aria-label="Yuxarı daşı"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        className="text-[#928876] hover:text-[#C2A05A] min-w-[44px] min-h-[44px] inline-flex items-center justify-center disabled:opacity-30"
                        onClick={() => move(i, 1)}
                        disabled={i === posts.length - 1 || reorder.isPending}
                        aria-label="Aşağı daşı"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        className="text-[#928876] hover:text-[#C2A05A] text-xs px-3 min-h-[44px]"
                        onClick={() => setEditing(p)}
                      >
                        Redaktə
                      </button>
                      <button
                        className="text-[#e0697a] hover:underline text-xs px-3 min-h-[44px]"
                        onClick={() => { if (confirm("Yazını silmək?")) del.mutate({ id: p.id as number }); }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr><td className="px-5 py-6 text-xs text-[#928876]" colSpan={5}>Blog yazısı yoxdur.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const LANG_LABEL: Record<Lang, string> = { az: "AZ", ru: "RU", en: "EN", tr: "TR", ar: "AR" };

function BlogForm({ post, onClose, onSaved }: { post: Post; onClose: () => void; onSaved: () => void }) {
  const isNew = post.id == null;
  const [f, setF] = useState<Post>({
    ...post,
    title: { ...post.title },
    desc: { ...post.desc },
    h1: { ...post.h1 },
    lead: { ...post.lead },
    sections: post.sections.map((s) => ({
      ...s,
      h2: { ...s.h2 },
      body: s.body.map((b) => ({ ...b })),
      imageAlt: s.imageAlt ? { ...s.imageAlt } : undefined,
      gallery: s.gallery?.map((g) => ({ src: g.src, alt: { ...g.alt } })),
    })),
  });
  const [tab, setTab] = useState<Lang>("az");

  const create = trpc.blog.create.useMutation({ onSuccess: onSaved });
  const update = trpc.blog.update.useMutation({ onSuccess: onSaved });

  const setScalar = (k: "slug" | "date" | "cover" | "video", v: string) => setF((p) => ({ ...p, [k]: v }));
  const setSortOrder = (v: number) => setF((p) => ({ ...p, sortOrder: v }));
  const setPublished = (v: boolean) => setF((p) => ({ ...p, published: v }));

  // Update a top-level L field (title/desc/h1/lead) for the active tab.
  const setLField = (k: "title" | "desc" | "h1" | "lead", v: string) =>
    setF((p) => ({ ...p, [k]: { ...p[k], [tab]: v } }));

  // --- Section mutators (all immutable) ---
  const updateSection = (idx: number, fn: (s: Section) => Section) =>
    setF((p) => ({ ...p, sections: p.sections.map((s, i) => (i === idx ? fn(s) : s)) }));

  const addSection = () =>
    setF((p) => ({ ...p, sections: [...p.sections, { h2: emptyL(), body: [emptyL()] }] }));

  const removeSection = (idx: number) =>
    setF((p) => ({ ...p, sections: p.sections.filter((_, i) => i !== idx) }));

  const moveSection = (idx: number, dir: -1 | 1) =>
    setF((p) => {
      const next = idx + dir;
      if (next < 0 || next >= p.sections.length) return p;
      const arr = [...p.sections];
      const [it] = arr.splice(idx, 1);
      arr.splice(next, 0, it);
      return { ...p, sections: arr };
    });

  const save = () => {
    if (!f.slug.trim()) { alert("Slug tələb olunur"); return; }
    if (!f.date.trim()) { alert("Tarix tələb olunur"); return; }
    const data = {
      slug: f.slug.trim(),
      date: f.date.trim(),
      cover: f.cover?.trim() || undefined,
      video: f.video?.trim() || undefined,
      title: f.title,
      desc: f.desc,
      h1: f.h1,
      lead: f.lead,
      sections: f.sections.map((s) => ({
        h2: s.h2,
        body: s.body,
        image: s.image?.trim() || undefined,
        imageAlt: s.imageAlt,
        gallery: s.gallery && s.gallery.length ? s.gallery : undefined,
      })),
      sortOrder: f.sortOrder,
      published: f.published,
    };
    if (isNew) create.mutate(data);
    else update.mutate({ id: post.id as number, ...data });
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-semibold" style={{ fontFamily: "Rufolo, serif" }}>
          {isNew ? "Yeni yazı" : "Yazını redaktə et"}
        </h3>
        <button className="text-xs text-[#928876] hover:text-[#C2A05A] min-h-[44px] px-2" onClick={onClose}>← Geri</button>
      </div>

      <div className="grid gap-5">
        {/* Scalar fields */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="blog-slug" className={labelCls}>Slug (/blog/...)</label>
            <input id="blog-slug" className={inputCls} value={f.slug} onChange={(e) => setScalar("slug", e.target.value)} />
          </div>
          <div>
            <label htmlFor="blog-date" className={labelCls}>Tarix</label>
            <input id="blog-date" type="date" className={inputCls} value={f.date} onChange={(e) => setScalar("date", e.target.value)} />
          </div>
          <div>
            <label htmlFor="blog-sort" className={labelCls}>Sıra</label>
            <input
              id="blog-sort"
              type="number"
              className={inputCls}
              value={f.sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-5">
          <Toggle on={f.published} set={setPublished} label="Dərc olunub" />
        </div>

        <ImageUpload value={f.cover ?? ""} onChange={(v) => setScalar("cover", v)} label="Üz qabığı şəkli" />
        <ImageUpload
          value={f.video ?? ""}
          onChange={(v) => setScalar("video", v)}
          accept="video/*"
          label="Video (istəyə bağlı)"
          hint="Qısa MP4 və ya hazır /videos/… yolu."
        />

        {/* Language tabs */}
        <div>
          <div className="flex gap-1.5 mb-3" role="tablist" aria-label="Dil seçimi">
            {LANGS.map((l) => (
              <button
                key={l}
                role="tab"
                aria-selected={tab === l}
                onClick={() => setTab(l)}
                className={`min-w-[44px] min-h-[44px] px-3 rounded-lg text-xs font-medium transition ${
                  tab === l ? "bg-[#9D7C38] text-[#1a140a]" : "bg-[#16120e] border border-[#352d24] text-[#ECE6DA] hover:border-[#9D7C38]"
                }`}
              >
                {LANG_LABEL[l]}
              </button>
            ))}
          </div>

          <div className="grid gap-4 border border-[#352d24] rounded-lg p-4 bg-[#16120e]/40">
            <div>
              <label htmlFor={`blog-title-${tab}`} className={labelCls}>Başlıq ({LANG_LABEL[tab]})</label>
              <input id={`blog-title-${tab}`} className={inputCls} value={f.title[tab]} onChange={(e) => setLField("title", e.target.value)} />
            </div>
            <div>
              <label htmlFor={`blog-h1-${tab}`} className={labelCls}>H1 ({LANG_LABEL[tab]})</label>
              <input id={`blog-h1-${tab}`} className={inputCls} value={f.h1[tab]} onChange={(e) => setLField("h1", e.target.value)} />
            </div>
            <div>
              <label htmlFor={`blog-desc-${tab}`} className={labelCls}>Təsvir ({LANG_LABEL[tab]})</label>
              <textarea id={`blog-desc-${tab}`} rows={2} className={inputCls} value={f.desc[tab]} onChange={(e) => setLField("desc", e.target.value)} />
            </div>
            <div>
              <label htmlFor={`blog-lead-${tab}`} className={labelCls}>Giriş mətni ({LANG_LABEL[tab]})</label>
              <textarea id={`blog-lead-${tab}`} rows={3} className={inputCls} value={f.lead[tab]} onChange={(e) => setLField("lead", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Sections editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-[#928876]">Bölmələr</span>
            <button type="button" className={btnGhost} onClick={addSection}>
              <span className="inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Bölmə əlavə et</span>
            </button>
          </div>

          <div className="grid gap-4">
            {f.sections.map((s, si) => (
              <SectionCard
                key={si}
                section={s}
                index={si}
                total={f.sections.length}
                tab={tab}
                onChange={(fn) => updateSection(si, fn)}
                onRemove={() => removeSection(si)}
                onMove={(dir) => moveSection(si, dir)}
              />
            ))}
            {f.sections.length === 0 && (
              <p className="text-xs text-[#6c6353] border border-dashed border-[#352d24] rounded-lg px-4 py-5 text-center">
                Bölmə yoxdur. "Bölmə əlavə et" düyməsi ilə başla.
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button className={btnGold} disabled={busy} onClick={save}>{busy ? "Yadda saxlanılır…" : "Yadda saxla"}</button>
          <button className={btnGhost} onClick={onClose}>Ləğv</button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  section, index, total, tab, onChange, onRemove, onMove,
}: {
  section: Section;
  index: number;
  total: number;
  tab: Lang;
  onChange: (fn: (s: Section) => Section) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const setH2 = (v: string) => onChange((s) => ({ ...s, h2: { ...s.h2, [tab]: v } }));

  const setBody = (bi: number, v: string) =>
    onChange((s) => ({ ...s, body: s.body.map((b, i) => (i === bi ? { ...b, [tab]: v } : b)) }));
  const addBody = () => onChange((s) => ({ ...s, body: [...s.body, emptyL()] }));
  const removeBody = (bi: number) => onChange((s) => ({ ...s, body: s.body.filter((_, i) => i !== bi) }));

  const setImage = (v: string) => onChange((s) => ({ ...s, image: v }));
  const setImageAlt = (v: string) =>
    onChange((s) => ({ ...s, imageAlt: { ...(s.imageAlt ?? emptyL()), [tab]: v } }));

  const setGallerySrc = (gi: number, v: string) =>
    onChange((s) => ({ ...s, gallery: (s.gallery ?? []).map((g, i) => (i === gi ? { ...g, src: v } : g)) }));
  const setGalleryAlt = (gi: number, v: string) =>
    onChange((s) => ({ ...s, gallery: (s.gallery ?? []).map((g, i) => (i === gi ? { ...g, alt: { ...g.alt, [tab]: v } } : g)) }));
  const addGallery = () => onChange((s) => ({ ...s, gallery: [...(s.gallery ?? []), { src: "", alt: emptyL() }] }));
  const removeGallery = (gi: number) => onChange((s) => ({ ...s, gallery: (s.gallery ?? []).filter((_, i) => i !== gi) }));

  return (
    <div className="border border-[#352d24] rounded-lg p-4 bg-[#16120e]/40">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-wider text-[#928876]">Bölmə {index + 1}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="text-[#928876] hover:text-[#C2A05A] min-w-[44px] min-h-[44px] inline-flex items-center justify-center disabled:opacity-30"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Bölməni yuxarı daşı"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="text-[#928876] hover:text-[#C2A05A] min-w-[44px] min-h-[44px] inline-flex items-center justify-center disabled:opacity-30"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label="Bölməni aşağı daşı"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="text-[#e0697a] hover:text-[#f08193] min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
            onClick={onRemove}
            aria-label="Bölməni sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <label htmlFor={`sec-${index}-h2`} className={labelCls}>Alt başlıq H2 ({LANG_LABEL[tab]})</label>
          <input id={`sec-${index}-h2`} className={inputCls} value={section.h2[tab]} onChange={(e) => setH2(e.target.value)} />
        </div>

        {/* Body paragraphs */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#928876]">Abzaslar ({LANG_LABEL[tab]})</span>
            <button type="button" className={btnGhost} onClick={addBody}>
              <span className="inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Abzas</span>
            </button>
          </div>
          <div className="grid gap-2">
            {section.body.map((b, bi) => (
              <div key={bi} className="flex items-start gap-2">
                <textarea
                  rows={2}
                  className={inputCls}
                  value={b[tab]}
                  onChange={(e) => setBody(bi, e.target.value)}
                  aria-label={`Abzas ${bi + 1} (${LANG_LABEL[tab]})`}
                />
                <button
                  type="button"
                  className="text-[#e0697a] hover:text-[#f08193] min-w-[44px] min-h-[44px] inline-flex items-center justify-center shrink-0"
                  onClick={() => removeBody(bi)}
                  aria-label={`Abzas ${bi + 1} sil`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {section.body.length === 0 && (
              <p className="text-[11px] text-[#6c6353]">Abzas yoxdur.</p>
            )}
          </div>
        </div>

        {/* Section image + alt */}
        <ImageUpload value={section.image ?? ""} onChange={setImage} label="Bölmə şəkli (istəyə bağlı)" />
        {section.image && (
          <div>
            <label htmlFor={`sec-${index}-alt`} className={labelCls}>Şəkil alt mətni ({LANG_LABEL[tab]})</label>
            <input
              id={`sec-${index}-alt`}
              className={inputCls}
              value={section.imageAlt?.[tab] ?? ""}
              onChange={(e) => setImageAlt(e.target.value)}
            />
          </div>
        )}

        {/* Gallery */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider text-[#928876]">Qalereya (istəyə bağlı)</span>
            <button type="button" className={btnGhost} onClick={addGallery}>
              <span className="inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Şəkil</span>
            </button>
          </div>
          <div className="grid gap-3">
            {(section.gallery ?? []).map((g, gi) => (
              <div key={gi} className="border border-[#352d24] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#6c6353]">Şəkil {gi + 1}</span>
                  <button
                    type="button"
                    className="text-[#e0697a] hover:text-[#f08193] min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
                    onClick={() => removeGallery(gi)}
                    aria-label={`Qalereya şəkli ${gi + 1} sil`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid gap-3">
                  <ImageUpload value={g.src} onChange={(v) => setGallerySrc(gi, v)} label={`Şəkil ${gi + 1}`} />
                  <div>
                    <label htmlFor={`sec-${index}-gal-${gi}-alt`} className={labelCls}>Alt mətn ({LANG_LABEL[tab]})</label>
                    <input
                      id={`sec-${index}-gal-${gi}-alt`}
                      className={inputCls}
                      value={g.alt[tab]}
                      onChange={(e) => setGalleryAlt(gi, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) {
  return (
    <button onClick={() => set(!on)} className="flex items-center gap-2.5 min-h-[44px] py-2" aria-pressed={on}>
      <span className={`w-9 h-5 rounded-full relative transition ${on ? "bg-[#9D7C38]" : "bg-[#403930]"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? "right-0.5" : "left-0.5"}`} />
      </span>
      <span className="text-xs text-[#ECE6DA]">{label}</span>
    </button>
  );
}
