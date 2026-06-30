import { useState } from "react";
import { Check, Minus, ChevronUp, ChevronDown } from "lucide-react";
import { trpc } from "@/providers/trpc";

const inputCls = "w-full bg-[#16120e] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-[#ECE6DA] outline-none focus:border-[#9D7C38]";
const labelCls = "block text-[11px] uppercase tracking-wider text-[#928876] mb-1.5";
const btnGold = "bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-4 py-2 transition";
const btnGhost = "bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-4 py-2 transition";

const LANGS = ["az", "ru", "en", "tr", "ar"] as const;
type Lang = (typeof LANGS)[number];
type L = Record<Lang, string>;

type Faq = {
  id?: number;
  question: L;
  answer: L;
  sortOrder: number;
  published: boolean;
};

const emptyL = (): L => ({ az: "", ru: "", en: "", tr: "", ar: "" });

const emptyFaq = (): Faq => ({
  question: emptyL(),
  answer: emptyL(),
  sortOrder: 0,
  published: false,
});

export default function FaqAdminPage() {
  const listQ = trpc.faq.adminList.useQuery();
  const [editing, setEditing] = useState<Faq | null>(null);

  const reorder = trpc.faq.reorder.useMutation({ onSuccess: () => listQ.refetch() });
  const del = trpc.faq.delete.useMutation({ onSuccess: () => listQ.refetch() });

  const items = (listQ.data ?? []) as Faq[];

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const reordered = [...items];
    const [item] = reordered.splice(index, 1);
    reordered.splice(next, 0, item);
    reorder.mutate({ items: reordered.map((p, i) => ({ id: p.id as number, sortOrder: i })) });
  };

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>FAQ</h1>
          <p className="text-xs text-[#928876] mt-1">Tez-tez verilən suallar · 5 dil</p>
        </div>
        {!editing && (
          <button className={btnGold} onClick={() => setEditing(emptyFaq())}>+ Yeni sual</button>
        )}
      </div>

      {editing ? (
        <FaqForm
          faq={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); listQ.refetch(); }}
        />
      ) : (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#2a241d] text-[#928876] text-[10px] uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-medium">Sual</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => (
                <tr key={p.id} className="border-b border-[#221d17] last:border-0 hover:bg-white/5">
                  <td className="px-5 py-3 text-[#ECE6DA]">
                    <span className="block max-w-[420px] truncate">{p.question.az || "(başlıqsız)"}</span>
                  </td>
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
                        disabled={i === items.length - 1 || reorder.isPending}
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
                        onClick={() => { if (confirm("Sualı silmək?")) del.mutate({ id: p.id as number }); }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="px-5 py-6 text-xs text-[#928876]" colSpan={3}>Sual yoxdur.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const LANG_LABEL: Record<Lang, string> = { az: "AZ", ru: "RU", en: "EN", tr: "TR", ar: "AR" };

function FaqForm({ faq, onClose, onSaved }: { faq: Faq; onClose: () => void; onSaved: () => void }) {
  const isNew = faq.id == null;
  const [f, setF] = useState<Faq>({
    ...faq,
    question: { ...faq.question },
    answer: { ...faq.answer },
  });
  const [tab, setTab] = useState<Lang>("az");

  const create = trpc.faq.create.useMutation({ onSuccess: onSaved });
  const update = trpc.faq.update.useMutation({ onSuccess: onSaved });

  const setSortOrder = (v: number) => setF((p) => ({ ...p, sortOrder: v }));
  const setPublished = (v: boolean) => setF((p) => ({ ...p, published: v }));

  const setLField = (k: "question" | "answer", v: string) =>
    setF((p) => ({ ...p, [k]: { ...p[k], [tab]: v } }));

  const save = () => {
    if (!f.question.az.trim()) { alert("Sual (AZ) tələb olunur"); return; }
    const data = {
      question: f.question,
      answer: f.answer,
      sortOrder: f.sortOrder,
      published: f.published,
    };
    if (isNew) create.mutate(data);
    else update.mutate({ id: faq.id as number, ...data });
  };

  const busy = create.isPending || update.isPending;

  return (
    <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[17px] font-semibold" style={{ fontFamily: "Rufolo, serif" }}>
          {isNew ? "Yeni sual" : "Sualı redaktə et"}
        </h3>
        <button className="text-xs text-[#928876] hover:text-[#C2A05A] min-h-[44px] px-2" onClick={onClose}>← Geri</button>
      </div>

      <div className="grid gap-5">
        {/* Scalar fields */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="faq-sort" className={labelCls}>Sıra</label>
            <input
              id="faq-sort"
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
              <label htmlFor={`faq-question-${tab}`} className={labelCls}>Sual ({LANG_LABEL[tab]})</label>
              <input id={`faq-question-${tab}`} className={inputCls} value={f.question[tab]} onChange={(e) => setLField("question", e.target.value)} />
            </div>
            <div>
              <label htmlFor={`faq-answer-${tab}`} className={labelCls}>Cavab ({LANG_LABEL[tab]})</label>
              <textarea id={`faq-answer-${tab}`} rows={5} className={inputCls} value={f.answer[tab]} onChange={(e) => setLField("answer", e.target.value)} />
            </div>
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
