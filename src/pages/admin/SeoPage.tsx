import { useState, useCallback } from "react";
import {
  SEO_PAGES,
  getSeoSettings,
  autoGenerateSeo,
  resetPageSeo,
  type SeoPageSettings,
} from "@/lib/seoStore";
import { trpc } from "@/providers/trpc";
import {
  Globe,
  Pencil,
  Save,
  X,
  RotateCcw,
  Code,
  Sparkles,
  Loader2,
} from "lucide-react";

const LANGS = [
  { key: "Az" as const, label: "AZ" },
  { key: "Ru" as const, label: "RU" },
  { key: "En" as const, label: "EN" },
  { key: "Tr" as const, label: "TR" },
];

type FieldGroup = {
  key: "title" | "description" | "keywords" | "ogTitle" | "ogDescription";
  label: string;
  textarea: boolean;
};

const FIELD_GROUPS: FieldGroup[] = [
  { key: "title", label: "Title (Səhifə Başlığı)", textarea: false },
  { key: "description", label: "Meta Description", textarea: true },
  { key: "keywords", label: "Keywords (Açar Sözlər)", textarea: false },
  { key: "ogTitle", label: "OG Title (Open Graph)", textarea: false },
  { key: "ogDescription", label: "OG Description", textarea: true },
];

/* ═══════════════════════════════════════════
   DB row -> SeoPageSettings field map
   Tries camelCase (API) then snake_case (Drizzle raw)
   ═══════════════════════════════════════════ */
function mapDbRowToForm(
  dbRow: Record<string, unknown> | undefined,
  base: SeoPageSettings
): SeoPageSettings {
  if (!dbRow) return base;

  const merged = { ...base };
  const dbFields: (keyof SeoPageSettings)[] = [
    "titleAz",
    "titleRu",
    "titleEn",
    "titleTr",
    "descriptionAz",
    "descriptionRu",
    "descriptionEn",
    "descriptionTr",
    "keywordsAz",
    "keywordsRu",
    "keywordsEn",
    "keywordsTr",
    "ogTitleAz",
    "ogTitleRu",
    "ogTitleEn",
    "ogTitleTr",
    "ogDescriptionAz",
    "ogDescriptionRu",
    "ogDescriptionEn",
    "ogDescriptionTr",
    "ogImage",
  ];

  for (const f of dbFields) {
    // Try camelCase (API normalized) then snake_case (raw DB)
    const snake = f.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    const val = dbRow[f] ?? dbRow[snake];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      (merged as Record<string, unknown>)[f] = String(val);
    }
  }
  return merged;
}

/* ═══════════════════════════════════════════
   Form -> API payload (only fields router accepts)
   ═══════════════════════════════════════════ */
function formToUpsertPayload(
  pageId: string,
  form: SeoPageSettings
): Parameters<ReturnType<typeof trpc.seo.upsertByPage.useMutation>["mutate"]>[0] {
  return {
    page: pageId,
    titleAz: form.titleAz || undefined,
    titleRu: form.titleRu || undefined,
    titleEn: form.titleEn || undefined,
    descriptionAz: form.descriptionAz || undefined,
    descriptionRu: form.descriptionRu || undefined,
    descriptionEn: form.descriptionEn || undefined,
    keywordsAz: form.keywordsAz || undefined,
    keywordsRu: form.keywordsRu || undefined,
    keywordsEn: form.keywordsEn || undefined,
    ogTitleAz: form.ogTitleAz || undefined,
    ogTitleRu: form.ogTitleRu || undefined,
    ogTitleEn: form.ogTitleEn || undefined,
    ogDescriptionAz: form.ogDescriptionAz || undefined,
    ogDescriptionRu: form.ogDescriptionRu || undefined,
    ogDescriptionEn: form.ogDescriptionEn || undefined,
    ogImage: form.ogImage || undefined,
  };
}

/* ═══════════════════════════════════════════
   SEO Editor for one page
   ═══════════════════════════════════════════ */
function SeoEditor({
  pageId,
  pageLabel,
  dbRow,
}: {
  pageId: string;
  pageLabel: string;
  dbRow?: Record<string, unknown>;
}) {
  const utils = trpc.useUtils();

  const [editing, setEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const defaults = autoGenerateSeo(pageId);
  const savedSettings = getSeoSettings()[pageId];
  const hasDbRow = !!dbRow;

  /* Init form: dbRow > localStorage > autoGenerate */
  const initForm = useCallback((): SeoPageSettings => {
    let merged = { ...defaults };
    if (savedSettings) merged = { ...merged, ...savedSettings };
    if (dbRow) merged = mapDbRowToForm(dbRow, merged);
    return merged;
  }, [defaults, savedSettings, dbRow]);

  const [form, setForm] = useState<SeoPageSettings>(initForm);

  const updateField = (field: string, lang: string, value: string) => {
    setForm((prev) => ({ ...prev, [`${field}${lang}`]: value }));
  };

  /* ── tRPC mutations ── */
  const upsertMutation = trpc.seo.upsertByPage.useMutation({
    onSuccess: () => {
      setSaveStatus("success");
      utils.seo.adminGetAll.invalidate();
      utils.seo.getAll.invalidate();
      utils.seo.getByPage.invalidate();
      setTimeout(() => {
        setSaveStatus("idle");
        setEditing(false);
      }, 2000);
    },
    onError: () => {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    },
  });

  const deleteMutation = trpc.seo.delete.useMutation({
    onSuccess: () => {
      resetPageSeo(pageId);
      setForm(autoGenerateSeo(pageId));
      utils.seo.adminGetAll.invalidate();
      utils.seo.getAll.invalidate();
      utils.seo.getByPage.invalidate();
    },
  });

  const handleSave = useCallback(() => {
    setSaveStatus("saving");
    upsertMutation.mutate(formToUpsertPayload(pageId, form));
  }, [pageId, form, upsertMutation]);

  const handleReset = useCallback(() => {
    if (!window.confirm("Auto-generated defaults-a qaytarilsin?")) return;
    if (dbRow && typeof dbRow.id === "number") {
      deleteMutation.mutate({ id: dbRow.id as number });
    } else {
      resetPageSeo(pageId);
      setForm(autoGenerateSeo(pageId));
    }
    setEditing(false);
  }, [pageId, dbRow, deleteMutation]);

  const openEdit = useCallback(() => {
    setForm(initForm());
    setSaveStatus("idle");
    setEditing(true);
  }, [initForm]);

  /* ── Save button state ── */
  const btnClass =
    saveStatus === "success"
      ? "bg-green-500/15 text-green-400 border border-green-500/20 cursor-default"
      : saveStatus === "error"
        ? "bg-red-500/15 text-red-400 border border-red-500/20 cursor-default"
        : saveStatus === "saving"
          ? "bg-[#C9A96E]/50 text-[#0A0A0A] cursor-wait"
          : "bg-[#C9A96E] text-[#0A0A0A] hover:bg-[#B8985E]";

  const btnContent =
    saveStatus === "success" ? (
      "Saxlanıldı! ✅ DB"
    ) : saveStatus === "error" ? (
      "Xəta!"
    ) : saveStatus === "saving" ? (
      <>
        <Loader2 className="w-3 h-3 animate-spin" /> Saxlanır…
      </>
    ) : (
      <>
        <Save className="w-3 h-3" /> Saxla
      </>
    );

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4 text-[#C9A96E]" />
          <div>
            <h3 className="text-white font-medium text-sm">{pageLabel}</h3>
            <p className="text-white/40 text-xs">{pageId}</p>
          </div>
          {hasDbRow && (
            <span className="text-[10px] text-[#C9A96E] bg-[#C9A96E]/10 px-1.5 py-0.5 rounded">
              DB
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {!editing ? (
            <button
              onClick={openEdit}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-white/50 hover:text-[#C9A96E] hover:bg-white/5 transition-all"
            >
              <Pencil className="w-3 h-3" /> Düzəliş
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saveStatus === "saving" || saveStatus === "success"}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${btnClass}`}
              >
                {btnContent}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setSaveStatus("idle");
                }}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded text-xs text-white/40 hover:text-white transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Edit mode ── */}
      {editing ? (
        <div className="space-y-4">
          {FIELD_GROUPS.map((fg) => (
            <div key={fg.key}>
              <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">
                {fg.label}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {LANGS.map(({ key, label }) => {
                  const formKey = `${fg.key}${key}` as keyof SeoPageSettings;
                  const val = (form[formKey] || "") as string;
                  const isDefault = !hasDbRow && val === defaults[formKey];
                  const borderClass = isDefault
                    ? "border-[#333] focus:border-[#C9A96E]/30"
                    : "border-[#C9A96E]/30 focus:border-[#C9A96E]";
                  return (
                    <div key={key}>
                      <label className="text-white/40 text-[10px] block mb-1">
                        {label}
                      </label>
                      {fg.textarea ? (
                        <textarea
                          value={val}
                          onChange={(e) =>
                            updateField(fg.key, key, e.target.value)
                          }
                          rows={2}
                          className={`w-full px-2 py-1.5 bg-[#0A0A0A] border rounded text-white text-xs resize-none focus:outline-none transition-colors ${borderClass}`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            updateField(fg.key, key, e.target.value)
                          }
                          className={`w-full px-2 py-1.5 bg-[#0A0A0A] border rounded text-white text-xs focus:outline-none transition-colors ${borderClass}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* OG Image */}
          <div>
            <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">
              OG Image URL
            </p>
            <input
              type="text"
              value={form.ogImage || ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, ogImage: e.target.value }))
              }
              className="w-full px-2 py-1.5 bg-[#0A0A0A] border border-[#333] rounded text-white text-xs focus:outline-none focus:border-[#C9A96E]/30"
              placeholder="https://xurcun.az/og-home.jpg"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleReset}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3" /> Defaults-a qaytar
            </button>
          </div>
        </div>
      ) : (
        /* ── Read-only mode ── */
        <div className="text-sm">
          {hasDbRow ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {LANGS.map(({ key, label }) => {
                const tk = `title${key}` as keyof SeoPageSettings;
                const dk = `description${key}` as keyof SeoPageSettings;
                return (
                  <div key={key}>
                    <span className="text-[10px] text-white/40 uppercase">
                      {label} Title
                    </span>
                    <p className="text-white/70 truncate text-xs">
                      {String(form[tk] || "—")}
                    </p>
                    <span className="text-[10px] text-white/40 uppercase mt-2 block">
                      {label} Desc
                    </span>
                    <p className="text-white/50 truncate text-xs">
                      {String(form[dk] || "—")}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-white/30" />
              <p className="text-white/30 italic text-xs">
                Auto-generated SEO (defaults) — "Düzəliş" ilə dəyişdirin
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Skeleton loader while DB data loads
   ═══════════════════════════════════════════ */
function SeoSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-[#111] border border-[#222] rounded-xl p-5 animate-pulse"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-4 h-4 bg-white/10 rounded" />
            <div className="space-y-1.5">
              <div className="w-32 h-3.5 bg-white/10 rounded" />
              <div className="w-20 h-2.5 bg-white/5 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="w-6 h-2 bg-white/5 rounded" />
                <div className="w-full h-7 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN SEO PAGE
   ═══════════════════════════════════════════ */
export default function SeoPage() {
  const [activeTab, setActiveTab] = useState("main");
  const { data: dbRows, isLoading } = trpc.seo.adminGetAll.useQuery();

  const mainPages = SEO_PAGES.filter((p) =>
    ["home", "menu", "about", "contact", "reservation"].includes(p.id)
  );
  const menuPages = SEO_PAGES.filter((p) =>
    ["qr"].includes(p.id)
  );
  const otherPages = SEO_PAGES.filter((p) =>
    ["gallery", "events"].includes(p.id)
  );

  /* Build page -> dbRow lookup */
  const dbRowMap: Record<string, Record<string, unknown>> = {};
  if (dbRows) {
    for (const row of dbRows) {
      dbRowMap[row.page] = row as unknown as Record<string, unknown>;
    }
  }

  return (
    <div className="min-w-0 max-w-full">
      <h1 className="text-xl font-bold text-white mb-1">SEO İdarəsi</h1>
      <p className="text-white/50 text-xs mb-4">
        Hər səhifə üçün SEO başlıqları, açıqlamaları və OG tag-lərini 4 dildə
        idarə edin. Boş qalan sahələr auto-generated defaults istifadə edir.
      </p>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-4 bg-[#111] border border-[#222] rounded-lg p-1">
        {[
          { key: "main", label: "Əsas Səhifələr" },
          { key: "menu", label: "Menyu / QR" },
          { key: "other", label: "Digər" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === t.key
                ? "bg-[#C9A96E]/15 text-[#C9A96E]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── SEO Files ── */}
      <div className="mb-4 p-3 bg-[#111] border border-[#222] rounded-lg">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
          SEO Faylları
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#C9A96E] hover:underline"
          >
            <Globe className="w-3 h-3" /> sitemap.xml
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#C9A96E] hover:underline"
          >
            <Code className="w-3 h-3" /> robots.txt
          </a>
        </div>
      </div>

      {/* ── Page lists ── */}
      {isLoading ? (
        <SeoSkeleton />
      ) : (
        <>
          {activeTab === "main" && (
            <div className="space-y-3">
              {mainPages.map((p) => (
                <SeoEditor
                  key={p.id}
                  pageId={p.id}
                  pageLabel={`${p.labelAz} / ${p.labelEn}`}
                  dbRow={dbRowMap[p.id]}
                />
              ))}
            </div>
          )}
          {activeTab === "menu" && (
            <div className="space-y-3">
              {menuPages.map((p) => (
                <SeoEditor
                  key={p.id}
                  pageId={p.id}
                  pageLabel={`${p.labelAz} / ${p.labelEn}`}
                  dbRow={dbRowMap[p.id]}
                />
              ))}
            </div>
          )}
          {activeTab === "other" && (
            <div className="space-y-3">
              {otherPages.map((p) => (
                <SeoEditor
                  key={p.id}
                  pageId={p.id}
                  pageLabel={`${p.labelAz} / ${p.labelEn}`}
                  dbRow={dbRowMap[p.id]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
