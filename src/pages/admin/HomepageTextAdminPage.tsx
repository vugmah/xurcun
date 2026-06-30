import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { HOMEPAGE_TEXT_FIELDS } from "@/lib/homepageTextStore";
import type { Lang, L5, HomepageTextField } from "@/lib/homepageTextStore";

const inputCls = "w-full bg-[#16120e] border border-[#352d24] rounded-lg px-3 py-2 text-sm text-[#ECE6DA] outline-none focus:border-[#9D7C38]";
const labelCls = "block text-[11px] uppercase tracking-wider text-[#928876] mb-1.5";
const btnGold = "bg-[#9D7C38] hover:bg-[#C2A05A] text-[#1a140a] text-xs font-medium rounded-lg px-4 py-2 transition disabled:opacity-30";
const btnGhost = "bg-transparent border border-[#352d24] hover:border-[#9D7C38] text-[#ECE6DA] text-xs rounded-lg px-4 py-2 transition disabled:opacity-30";

const LANGS = ["az", "ru", "en", "tr", "ar"] as const;
const LANG_LABEL: Record<Lang, string> = { az: "AZ", ru: "RU", en: "EN", tr: "TR", ar: "AR" };

type Group = HomepageTextField["group"];

const GROUP_LABEL: Record<Group, string> = {
  hero: "Hero",
  values: "Dəyərlər",
  headings: "Bölmə başlıqları",
  about: "Haqqımızda",
  luxe: "Hədiyyə (luxe)",
  anniversary: "Yubiley",
  footer: "Footer",
  nav: "Naviqasiya",
  advanced: "Ətraflı / texniki",
};

// Order groups: marketing first (open), then nav, then advanced (collapsed).
const GROUP_ORDER: Group[] = [
  "hero",
  "values",
  "headings",
  "about",
  "luxe",
  "anniversary",
  "footer",
  "nav",
  "advanced",
];
const OPEN_GROUPS = new Set<Group>(["hero", "values", "headings", "about", "luxe", "anniversary", "footer"]);

const cloneL5 = (v: L5): L5 => ({ az: v.az, ru: v.ru, en: v.en, tr: v.tr, ar: v.ar });
const eqL5 = (a: L5, b: L5): boolean => LANGS.every((l) => a[l] === b[l]);

export default function HomepageTextAdminPage() {
  const listQ = trpc.homepageText.adminList.useQuery();

  // Server values merged with defaults => baseline per key.
  const baseline = useMemo(() => {
    const fromDb: Record<string, L5> = {};
    for (const row of listQ.data ?? []) fromDb[row.key] = row.value;
    const map: Record<string, L5> = {};
    for (const field of HOMEPAGE_TEXT_FIELDS) {
      map[field.key] = cloneL5(fromDb[field.key] ?? field.default);
    }
    return map;
  }, [listQ.data]);

  // Local edit drafts, keyed by field key. Only contains keys the user touched.
  const [draft, setDraft] = useState<Record<string, L5>>({});
  // Shared active language across all fields.
  const [lang, setLang] = useState<Lang>("az");
  // Key of the most recently saved field, for the brief "saved" indicator.
  const [savedKey, setSavedKey] = useState<string | null>(null);
  // Key of the most recent failed mutation, for an inline error indicator.
  const [errorKey, setErrorKey] = useState<string | null>(null);
  // Key currently mid-flight (save or reset), so only that row's buttons disable.
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  // Auto-dismiss the "saved" pill so it doesn't linger as stale state.
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!savedKey) return;
    savedTimer.current = setTimeout(() => setSavedKey(null), 2000);
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, [savedKey]);

  const upsert = trpc.homepageText.upsert.useMutation({ onSuccess: () => listQ.refetch() });
  const reset = trpc.homepageText.reset.useMutation({ onSuccess: () => listQ.refetch() });

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

  const grouped = useMemo(() => {
    const m = new Map<Group, HomepageTextField[]>();
    for (const g of GROUP_ORDER) m.set(g, []);
    for (const f of HOMEPAGE_TEXT_FIELDS) {
      const arr = m.get(f.group);
      if (arr) arr.push(f);
    }
    return m;
  }, []);

  const saveField = (field: HomepageTextField) => {
    setErrorKey(null);
    setPendingKey(field.key);
    upsert.mutate(
      { key: field.key, value: valueFor(field.key) },
      {
        onSuccess: () => {
          setDraft((prev) => {
            const next = { ...prev };
            delete next[field.key];
            return next;
          });
          setSavedKey(field.key);
        },
        onError: () => setErrorKey(field.key),
        onSettled: () => setPendingKey(null),
      },
    );
  };

  const resetField = (field: HomepageTextField) => {
    if (!window.confirm("Bu sahəni defolt mətnə qaytarmaq? Yadda saxlanmış dəyişikliklər silinəcək.")) return;
    setErrorKey(null);
    setPendingKey(field.key);
    reset.mutate(
      { key: field.key },
      {
        onSuccess: () =>
          setDraft((prev) => ({ ...prev, [field.key]: cloneL5(field.default) })),
        onError: () => setErrorKey(field.key),
        onSettled: () => setPendingKey(null),
      },
    );
  };

  const saveGroup = (fields: HomepageTextField[]) => {
    for (const field of fields) {
      if (isDirty(field.key)) saveField(field);
    }
  };

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>
          Ana səhifə mətnləri
        </h1>
        <p className="text-xs text-[#928876] mt-1">Ana səhifə marketinq mətni · 5 dil</p>
      </div>

      {/* Shared language selector */}
      <div className="sticky top-0 z-10 -mx-1 mb-5 bg-[#16120e]/80 backdrop-blur px-1 py-2">
        <div className="flex gap-1.5" role="group" aria-label="Dil">
          {LANGS.map((l) => (
            <button
              key={l}
              aria-pressed={lang === l}
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
        <div className="grid gap-4 max-w-3xl" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5 animate-pulse motion-reduce:animate-none">
              <div className="h-4 w-40 rounded bg-[#352d24]" />
              <div className="mt-4 grid gap-3">
                <div className="h-3 w-3/4 rounded bg-[#2a241d]" />
                <div className="h-3 w-5/6 rounded bg-[#2a241d]" />
                <div className="h-3 w-2/3 rounded bg-[#2a241d]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 max-w-3xl">
          {GROUP_ORDER.map((g) => {
            const fields = grouped.get(g) ?? [];
            if (fields.length === 0) return null;
            const dirtyCount = fields.filter((f) => isDirty(f.key)).length;
            return (
              <details
                key={g}
                open={OPEN_GROUPS.has(g)}
                className="group bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer select-none px-5 py-3 flex items-center justify-between text-[13px] font-medium text-[#ECE6DA] hover:bg-white/5">
                  <span className="flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 text-[#928876] transition-transform duration-200 group-open:rotate-180" />
                    <span style={{ fontFamily: "Rufolo, serif" }} className="text-[15px]">
                      {GROUP_LABEL[g]}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    {dirtyCount > 0 && (
                      <span className="text-[10.5px] px-2.5 py-1 rounded-full" style={{ background: "#2a2620", color: "#C2A05A" }}>
                        {dirtyCount} dəyişiklik
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-[#928876]">{fields.length}</span>
                  </span>
                </summary>

                <div className="border-t border-[#2a241d] px-5 py-4 grid gap-5">
                  {fields.map((field) => (
                    <FieldRow
                      key={field.key}
                      field={field}
                      lang={lang}
                      value={valueFor(field.key)}
                      dirty={isDirty(field.key)}
                      busy={pendingKey === field.key}
                      saved={savedKey === field.key && !isDirty(field.key)}
                      errored={errorKey === field.key}
                      onChange={(v) => {
                        if (errorKey === field.key) setErrorKey(null);
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
                        disabled={pendingKey !== null}
                        onClick={() => saveGroup(fields)}
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
  errored,
  onChange,
  onSave,
  onReset,
}: {
  field: HomepageTextField;
  lang: Lang;
  value: L5;
  dirty: boolean;
  busy: boolean;
  saved: boolean;
  errored: boolean;
  onChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const id = `hpt-${field.key}-${lang}`;
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
          {busy ? (
            <span className="inline-flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" /> Yadda saxlanır…
            </span>
          ) : (
            "Yadda saxla"
          )}
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
        {errored && (
          <span className="inline-flex items-center gap-1 text-[10.5px]" style={{ color: "#e0697a" }}>
            <X className="w-3 h-3" /> Xəta, yenidən cəhd edin
          </span>
        )}
      </div>
    </div>
  );
}
