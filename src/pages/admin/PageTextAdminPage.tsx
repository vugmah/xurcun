import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { PAGE_TEXT } from "@/lib/pageTextStore";
import type { Lang, L5, PageKey, PageTextField } from "@/lib/pageTextStore";

const inputCls = "w-full bg-[#16120e] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-[#ECE6DA] outline-none focus:border-[#9D7C38]";
const labelCls = "block text-[11px] uppercase tracking-wider text-[#928876] mb-1.5";
const btnGold = "bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-4 py-2 transition disabled:opacity-30";
const btnGhost = "bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-4 py-2 transition disabled:opacity-30";

const LANGS = ["az", "ru", "en", "tr", "ar"] as const;
const LANG_LABEL: Record<Lang, string> = { az: "AZ", ru: "RU", en: "EN", tr: "TR", ar: "AR" };

const PAGES: { key: PageKey; label: string }[] = [
  { key: "about", label: "Haqqımızda" },
  { key: "corporate", label: "Korporativ" },
  { key: "giftcard", label: "Hədiyyə Kartı" },
  { key: "privacy", label: "Məxfilik" },
  { key: "cookie", label: "Cookie" },
];

// Loose AZ labels for the heterogeneous `group` strings across pages.
// Falls back to the raw group name when unmapped.
const GROUP_LABEL: Record<string, string> = {
  nav: "Naviqasiya",
  intro: "Giriş",
  facts: "Faktlar",
  form: "Forma",
  messages: "Mesajlar",
  seo: "SEO",
  section: "Bölmə",
  hero: "Hero",
  values: "Dəyərlər",
  headings: "Bölmə başlıqları",
  about: "Haqqımızda",
  footer: "Footer",
  advanced: "Ətraflı / texniki",
};

const cloneL5 = (v: L5): L5 => ({ az: v.az, ru: v.ru, en: v.en, tr: v.tr, ar: v.ar });
const eqL5 = (a: L5, b: L5): boolean => LANGS.every((l) => a[l] === b[l]);

export default function PageTextAdminPage() {
  const [page, setPage] = useState<PageKey>("about");
  const listQ = trpc.pageText.adminListAll.useQuery();

  const fields = PAGE_TEXT[page];

  // Server values (for this page) merged with defaults => baseline per key.
  const baseline = useMemo(() => {
    const fromDb: Record<string, L5> = {};
    for (const row of listQ.data ?? []) {
      if (row.page === page) fromDb[row.key] = row.value;
    }
    const map: Record<string, L5> = {};
    for (const field of fields) {
      map[field.key] = cloneL5(fromDb[field.key] ?? field.default);
    }
    return map;
  }, [listQ.data, page, fields]);

  // Local edit drafts, keyed by field key. Only contains keys the user touched.
  const [draft, setDraft] = useState<Record<string, L5>>({});
  // Shared active language across all fields.
  const [lang, setLang] = useState<Lang>("az");
  // Key of the most recently saved field, for the brief "saved" indicator.
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const upsert = trpc.pageText.upsert.useMutation({ onSuccess: () => listQ.refetch() });
  const reset = trpc.pageText.reset.useMutation({ onSuccess: () => listQ.refetch() });

  const valueFor = (key: string): L5 => draft[key] ?? baseline[key];

  const setFieldLang = (key: string, l: Lang, v: string) => {
    setDraft((prev) => {
      const cur = prev[key] ?? baseline[key];
      return { ...prev, [key]: { ...cloneL5(cur), [l]: v } };
    });
  };

  const isDirty = (key: string): boolean => {
    const d = draft[key];
    if (!d) return false;
    return !eqL5(d, baseline[key]);
  };

  // Derive group order + grouping dynamically from PAGE_TEXT[page].
  const groupOrder = useMemo(() => {
    const seen: string[] = [];
    for (const f of fields) if (!seen.includes(f.group)) seen.push(f.group);
    return seen;
  }, [fields]);

  const grouped = useMemo(() => {
    const m = new Map<string, PageTextField[]>();
    for (const g of groupOrder) m.set(g, []);
    for (const f of fields) {
      const arr = m.get(f.group);
      if (arr) arr.push(f);
    }
    return m;
  }, [fields, groupOrder]);

  const switchPage = (p: PageKey) => {
    setPage(p);
    setDraft({});
    setSavedKey(null);
  };

  const saveField = (field: PageTextField) => {
    upsert.mutate(
      { page, key: field.key, value: valueFor(field.key) },
      {
        onSuccess: () => {
          setDraft((prev) => {
            const next = { ...prev };
            delete next[field.key];
            return next;
          });
          setSavedKey(field.key);
        },
      },
    );
  };

  const resetField = (field: PageTextField) => {
    reset.mutate(
      { page, key: field.key },
      {
        onSuccess: () =>
          setDraft((prev) => ({ ...prev, [field.key]: cloneL5(field.default) })),
      },
    );
  };

  const saveGroup = (groupFields: PageTextField[]) => {
    for (const field of groupFields) {
      if (isDirty(field.key)) saveField(field);
    }
  };

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>
          Səhifə mətnləri
        </h1>
        <p className="text-xs text-[#928876] mt-1">Statik səhifələrin mətni · 5 dil</p>
      </div>

      {/* Page selector */}
      <div className="mb-5">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Səhifə seçimi">
          {PAGES.map((p) => (
            <button
              key={p.key}
              role="tab"
              aria-selected={page === p.key}
              onClick={() => switchPage(p.key)}
              className={`min-h-[44px] px-4 rounded-lg text-xs font-medium transition ${
                page === p.key
                  ? "bg-[#9D7C38] text-[#1a140a]"
                  : "bg-[#16120e] border border-[#352d24] text-[#ECE6DA] hover:border-[#9D7C38]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shared language selector */}
      <div className="sticky top-0 z-10 -mx-1 mb-5 bg-[#16120e]/80 backdrop-blur px-1 py-2">
        <div className="flex gap-1.5" role="tablist" aria-label="Dil seçimi">
          {LANGS.map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={lang === l}
              onClick={() => setLang(l)}
              className={`min-w-[44px] min-h-[44px] px-3 rounded-lg text-xs font-medium transition ${
                lang === l
                  ? "bg-[#9D7C38] text-[#1a140a]"
                  : "bg-[#16120e] border border-[#352d24] text-[#ECE6DA] hover:border-[#9D7C38]"
              }`}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>

      {listQ.isLoading ? (
        <p className="text-xs text-[#928876]">Yüklənir…</p>
      ) : (
        <div className="grid gap-4 max-w-3xl">
          {groupOrder.map((g) => {
            const groupFields = grouped.get(g) ?? [];
            if (groupFields.length === 0) return null;
            const dirtyCount = groupFields.filter((f) => isDirty(f.key)).length;
            return (
              <details
                key={g}
                open
                className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer select-none px-5 py-3 flex items-center justify-between text-[13px] font-medium text-[#ECE6DA] hover:bg-white/5">
                  <span style={{ fontFamily: "Rufolo, serif" }} className="text-[15px]">
                    {GROUP_LABEL[g] ?? g}
                  </span>
                  <span className="flex items-center gap-3">
                    {dirtyCount > 0 && (
                      <span className="text-[10.5px] px-2.5 py-1 rounded-full" style={{ background: "#2a2620", color: "#C2A05A" }}>
                        {dirtyCount} dəyişiklik
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-[#928876]">{groupFields.length}</span>
                  </span>
                </summary>

                <div className="border-t border-[#2a241d] px-5 py-4 grid gap-5">
                  {groupFields.map((field) => (
                    <FieldRow
                      key={field.key}
                      field={field}
                      lang={lang}
                      value={valueFor(field.key)}
                      dirty={isDirty(field.key)}
                      busy={upsert.isPending || reset.isPending}
                      saved={savedKey === field.key && !isDirty(field.key)}
                      onChange={(v) => {
                        if (savedKey === field.key) setSavedKey(null);
                        setFieldLang(field.key, lang, v);
                      }}
                      onSave={() => saveField(field)}
                      onReset={() => resetField(field)}
                    />
                  ))}

                  {dirtyCount > 0 && (
                    <div className="pt-1">
                      <button
                        className={btnGhost}
                        disabled={upsert.isPending}
                        onClick={() => saveGroup(groupFields)}
                      >
                        Hamısını yadda saxla ({dirtyCount})
                      </button>
                    </div>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FieldRow({
  field,
  lang,
  value,
  dirty,
  busy,
  saved,
  onChange,
  onSave,
  onReset,
}: {
  field: PageTextField;
  lang: Lang;
  value: L5;
  dirty: boolean;
  busy: boolean;
  saved: boolean;
  onChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const id = `pt-${field.key}-${lang}`;
  return (
    <div className="grid gap-2 border border-[#2a241d] rounded-lg p-4 bg-[#16120e]/40">
      <label htmlFor={id} className={labelCls}>
        {field.label} ({LANG_LABEL[lang]})
      </label>

      {field.multiline ? (
        <textarea
          id={id}
          rows={4}
          className={inputCls}
          value={value[lang]}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          className={inputCls}
          value={value[lang]}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      <div className="flex items-center gap-2 pt-1">
        <button className={btnGold} disabled={!dirty || busy} onClick={onSave}>
          Yadda saxla
        </button>
        <button
          className="text-[#928876] hover:text-[#C2A05A] text-xs px-3 min-h-[44px]"
          disabled={busy}
          onClick={onReset}
        >
          Defolta qaytar
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full" style={{ background: "#16291f", color: "#5bbd86" }}>
            <Check className="w-3 h-3" /> Yadda saxlanıldı
          </span>
        )}
      </div>
    </div>
  );
}
