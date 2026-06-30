import { useState, useCallback, useRef } from "react";
import {
  getGeneralSettings, saveGeneralSettings, type GeneralSettings, type BranchItem,
  getBranches, saveBranches,
} from "@/lib/generalSettings";
import { autoGenerateSeo, type SeoPageSettings } from "@/lib/seoStore";
import { clearTrackingDbCache } from "@/lib/trackingSettings";
import { trpc } from "@/providers/trpc";
import {
  Save, Check, Globe, Phone, Mail, MapPin,
  Settings, BarChart3, Search, Server, RotateCcw,
  Plus, Trash2, X, Sparkles,
} from "lucide-react";

type SectionKey = "site" | "contact" | "branches" | "seo" | "tracking" | "mail";

const SECTIONS: { key: SectionKey; label: string; icon: typeof Settings }[] = [
  { key: "site", label: "Site", icon: Globe },
  { key: "contact", label: "Əlaqə", icon: Phone },
  { key: "branches", label: "Filiallar", icon: MapPin },
  { key: "seo", label: "SEO", icon: Search },
  { key: "tracking", label: "Tracking", icon: BarChart3 },
  { key: "mail", label: "Mail", icon: Server },
];

/* ─── Input Field ─── */
function Field({ label, value, onChange, placeholder, type = "text", help, id }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; help?: string; id?: string;
}) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="mb-3">
      <label htmlFor={fieldId} className="block text-white/60 text-xs mb-1">{label}</label>
      {help && <p className="text-[#a89d88] text-[10px] mb-1">{help}</p>}
      <input id={fieldId} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30" />
    </div>
  );
}

/* ─── Toggle Field ─── */
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-white/60 text-xs">{label}</span>
      <button onClick={() => onChange(!value)} aria-label={label} className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#C2A05A]" : "bg-[#352d24]"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

// form field key → DB tracking key. Only these sync to tracking_settings.
// Module-scope so it's a stable reference (no useCallback dep churn).
const TRACKING_DB_KEYS: Record<string, string> = {
  gtmId: "gtm_container_id",
  ga4MeasurementId: "ga4_measurement_id",
  googleAdsId: "google_ads_id",
  googleAdsConversionLabel: "google_ads_conversion_label",
  metaPixelId: "meta_pixel_id",
  metaDomainVerificationCode: "meta_domain_verification",
};

export default function SettingsPage() {
  const [form, setForm] = useState<GeneralSettings>(getGeneralSettings);
  const [activeSection, setActiveSection] = useState<SectionKey>("site");
  const [saved, setSaved] = useState(false);

  const utils = trpc.useUtils();
  const trackingUpsert = trpc.tracking.upsert.useMutation({
    onSuccess: () => {
      utils.settings.invalidate();
    },
  });

  // Debounce tracking DB writes. Writing on every keystroke raced multiple
  // upserts per field and could persist a truncated value (e.g. "AW"). We
  // accumulate the latest value per key and flush once typing settles, so
  // exactly one upsert lands per field with its final value.
  const pendingTrackingRef = useRef<Record<string, string>>({});
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushTracking = useCallback(() => {
    const pending = pendingTrackingRef.current;
    pendingTrackingRef.current = {};
    const keys = Object.keys(pending);
    if (keys.length === 0) return;
    for (const dbKey of keys) {
      trackingUpsert.mutate({ key: dbKey, value: pending[dbKey] });
    }
    clearTrackingDbCache(); // public pages re-fetch fresh IDs
  }, [trackingUpsert]);

  const update = useCallback((patch: Partial<GeneralSettings>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      saveGeneralSettings(next);
      return next;
    });

    // Queue any changed tracking field; flush (one upsert per key) after a pause.
    let touchedTracking = false;
    for (const [formKey, dbKey] of Object.entries(TRACKING_DB_KEYS)) {
      const val = (patch as Record<string, unknown>)[formKey];
      if (val !== undefined) {
        pendingTrackingRef.current[dbKey] = String(val);
        touchedTracking = true;
      }
    }
    if (touchedTracking) {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(flushTracking, 700);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [flushTracking]);

  const handleReset = useCallback(() => {
    if (window.confirm("Bütün ayarlar defaults-a qaytarilsin?")) {
      localStorage.removeItem("xurcun_general_settings_v1");
      setForm(getGeneralSettings());
    }
  }, []);

  return (
    <div className="min-w-0 max-w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Ayarlar</h1>
          <p className="text-white/50 text-xs mb-6">Bütün global ayarlar buradan idarə olunur.</p>
        </div>
        <div className="flex gap-2">
          {saved && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs bg-green-400/15 text-green-400 border border-green-400/20">
              <Check className="w-3 h-3" /> Saxlanıldı!
            </span>
          )}
          <button onClick={handleReset} className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-xs text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-1 mb-6 bg-[#1d1915] border border-[#352d24] rounded-lg p-1 overflow-x-auto">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeSection === s.key ? "bg-[#C2A05A]/15 text-[#C2A05A]" : "text-white/40 hover:text-white/60"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          );
        })}
      </div>

      {/* ═══ SITE ═══ */}
      {activeSection === "site" && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-[#C2A05A]" /> Site</h2>
          <Field label="Site Adı" value={form.siteName} onChange={(v) => update({ siteName: v })} placeholder="Xurcun White City" />
          <Field label="Marka Adı" value={form.brandName} onChange={(v) => update({ brandName: v })} placeholder="Xurcun" />
          <div className="mb-3">
            <label htmlFor="settings-default-language" className="block text-white/60 text-xs mb-1">Default Dil</label>
            <select id="settings-default-language" value={form.defaultLanguage} onChange={(e) => update({ defaultLanguage: e.target.value })}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30">
              <option value="az">AZ — Azərbaycan</option>
              <option value="tr">TR — Türkçe</option>
              <option value="ru">RU — Русский</option>
              <option value="en">EN — English</option>
            </select>
            <p className="text-[#a89d88] text-[10px] mt-1">İlk ziyaretciler için tarayıcı diline göre otomatik seçilir.</p>
          </div>
        </div>
      )}

      {/* ═══ CONTACT ═══ */}
      {activeSection === "contact" && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-[#C2A05A]" /> Əlaqə</h2>
          <Field label="Telefon" value={form.phone} onChange={(v) => update({ phone: v })} placeholder="+994502130555" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => update({ whatsapp: v })} placeholder="994502130550" />
          <Field label="E-poçt" value={form.email} onChange={(v) => update({ email: v })} placeholder="info@xurcun.az" />
          <div className="mt-4 pt-4 border-t border-[#352d24]">
            <h3 className="text-white/50 text-xs uppercase tracking-wider mb-3">Sosial Media</h3>
            <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => update({ instagramUrl: v })} placeholder="https://instagram.com/xurcunwhitecity" />
            <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => update({ facebookUrl: v })} placeholder="https://facebook.com/xurcunwhitecity" />
          </div>
        </div>
      )}

      {/* ═══ BRANCHES (CRUD) ═══ */}
      {activeSection === "branches" && (
        <BranchSettings onUpdate={() => setSaved(true)} />
      )}

      {/* ═══ SEO ═══ */}
      {activeSection === "seo" && (
        <SeoSettings form={form} update={update} onSaved={() => setSaved(true)} />
      )}

      {/* ═══ MAIL SERVER ═══ */}
      {activeSection === "mail" && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-[#C2A05A]" /> Mail Sunucu</h2>
          <Field label="Webmail URL" value={form.webmailUrl} onChange={(v) => update({ webmailUrl: v })} placeholder="https://webmail.xurcun.az" help="Webmail giris sayfasi URL'si." />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="IMAP Sunucu" value={form.mailImapHost} onChange={(v) => update({ mailImapHost: v })} placeholder="mail.xurcun.az" />
            <Field label="IMAP Port" value={form.mailImapPort} onChange={(v) => update({ mailImapPort: v })} placeholder="993" />
            <Field label="SMTP Sunucu" value={form.mailSmtpHost} onChange={(v) => update({ mailSmtpHost: v })} placeholder="mail.xurcun.az" />
            <Field label="SMTP Port" value={form.mailSmtpPort} onChange={(v) => update({ mailSmtpPort: v })} placeholder="465" />
          </div>
        </div>
      )}

      {/* ═══ TRACKING ═══ */}
      {activeSection === "tracking" && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#C2A05A]" /> Tracking</h2>
          <Field label="Google Tag Manager ID" value={form.gtmId} onChange={(v) => update({ gtmId: v })} placeholder="GTM-XXXXXXX" />
          <Field label="GA4 Measurement ID" value={form.ga4MeasurementId} onChange={(v) => update({ ga4MeasurementId: v })} placeholder="G-XXXXXXXXXX" />
          <Field label="Google Ads Conversion ID" value={form.googleAdsId} onChange={(v) => update({ googleAdsId: v })} placeholder="AW-XXXXXXXXXX" />
          <Field label="Google Ads Conversion Label" value={form.googleAdsConversionLabel} onChange={(v) => update({ googleAdsConversionLabel: v })} placeholder="AbCd_eFg (send_to slash-dan sonra)" help="Konversiya event snippet send_to deyerinin slash-dan sonraki hissesi. Lead formu gonderilende konversiya bu label ile ateslenir." />
          <Field label="Meta Pixel ID" value={form.metaPixelId} onChange={(v) => update({ metaPixelId: v })} placeholder="XXXXXXXXXXXXXXXX" />
          <Field label="Meta Domain Verification Code" value={form.metaDomainVerificationCode} onChange={(v) => update({ metaDomainVerificationCode: v })} placeholder="verification_code_here" help="Meta Business Manager → Events Manager → Domain Verification kodu. Bu kod &lt;meta&gt; tag-ine yazilir." />
          <div className="mt-4 p-3 bg-amber-400/5 border border-amber-400/10 rounded-lg">
            <p className="text-amber-400/60 text-[10px]">ID boş qaldıqda həmin təqib skripti yüklənmir. Admin səhifələri təqib edilmir.</p>
          </div>
          <div className="mt-3 p-3 bg-blue-400/5 border border-blue-400/10 rounded-lg">
            <p className="text-blue-400/60 text-[10px]">Canonical domain: <strong className="text-blue-400">https://xurcun.az</strong> — Bütün platformalar üçün HTTPS format istifadə olunur.</p>
          </div>
        </div>
      )}
    </div>
  );
}
function BranchSettings({ onUpdate }: { onUpdate: () => void }) {
  const [branches, setBranches] = useState<BranchItem[]>(getBranches);
  const [editing, setEditing] = useState<BranchItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<BranchItem>({ id: "", name: "", slug: "", address: "", mapsUrl: "", whatsapp: "", isActive: true });

  const save = () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    let next: BranchItem[];
    if (editing) {
      next = branches.map((b) => (b.id === editing.id ? { ...form, id: editing.id } : b));
    } else {
      next = [...branches, { ...form, id: `b_${Date.now()}` }];
    }
    saveBranches(next);
    setBranches(next);
    setEditing(null);
    setAdding(false);
    setForm({ id: "", name: "", slug: "", address: "", mapsUrl: "", whatsapp: "", isActive: true });
    onUpdate();
  };

  const remove = (id: string) => {
    if (!window.confirm("Bu filial silinsin mi?")) return;
    const next = branches.filter((b) => b.id !== id);
    saveBranches(next);
    setBranches(next);
    onUpdate();
  };

  const startEdit = (b: BranchItem) => {
    setEditing(b);
    setForm({ ...b });
    setAdding(true);
  };

  return (
    <div className="space-y-4">
      {/* Branch list */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#352d24]">
                <th className="text-left p-3 text-white/50 font-normal text-[10px] uppercase">Filial</th>
                <th className="text-left p-3 text-white/50 font-normal text-[10px] uppercase">Slug</th>
                <th className="text-left p-3 text-white/50 font-normal text-[10px] uppercase">WhatsApp</th>
                <th className="text-center p-3 text-white/50 font-normal text-[10px] uppercase">Aktiv</th>
                <th className="text-right p-3 text-white/50 font-normal text-[10px] uppercase">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#352d24]">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <p className="text-white text-xs font-medium">{b.name}</p>
                    <p className="text-[#a89d88] text-[10px]">{b.address || "—"}</p>
                  </td>
                  <td className="p-3 text-[#a89d88] text-xs font-mono">{b.slug}</td>
                  <td className="p-3 text-[#a89d88] text-xs">{b.whatsapp || "—"}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${b.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {b.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {b.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(b)} className="text-white/40 hover:text-[#C2A05A] text-[10px] px-3 py-2 rounded hover:bg-white/5">Duzenle</button>
                      <button onClick={() => remove(b.id)} className="text-white/40 hover:text-red-400 text-[10px] px-3 py-2 rounded hover:bg-white/5">Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit form */}
      {adding ? (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
          <h3 className="text-white font-medium text-sm mb-4">{editing ? "Filial Duzenle" : "Yeni Filial"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="branch-name" className="text-white/60 text-xs block mb-1">Filial Adi *</label>
              <input id="branch-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Xurcun White City"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30" />
            </div>
            <div>
              <label htmlFor="branch-slug" className="text-white/60 text-xs block mb-1">Slug * (URLde gorunur)</label>
              <input id="branch-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="white-city"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="branch-address" className="text-white/60 text-xs block mb-1">Unvan</label>
              <input id="branch-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Baki, White City"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30" />
            </div>
            <div>
              <label htmlFor="branch-maps-url" className="text-white/60 text-xs block mb-1">Google Maps URL</label>
              <input id="branch-maps-url" value={form.mapsUrl} onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30" />
            </div>
            <div>
              <label htmlFor="branch-whatsapp" className="text-white/60 text-xs block mb-1">WhatsApp</label>
              <input id="branch-whatsapp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="994502130550"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Toggle label="Aktif" value={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="px-4 py-2 bg-[#9D7C38] hover:bg-[#C2A05A] text-[#0A0A0A] rounded text-sm font-medium transition-all">
              {editing ? "Guncelle" : "Ekle"}
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 text-white/40 hover:text-white text-sm transition-all">
              İmtina
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => { setAdding(true); setEditing(null); setForm({ id: "", name: "", slug: "", address: "", mapsUrl: "", whatsapp: "", isActive: true }); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2A05A]/10 text-[#C2A05A] border border-[#C2A05A]/20 rounded-lg text-sm hover:bg-[#C2A05A]/20 transition-all">
          <Plus className="w-4 h-4" /> Yeni Filial Ekle
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SEO SETTINGS with Auto-Fill + Google Review URL
   ═══════════════════════════════════════════ */

function SeoSettings({ form, update, onSaved }: { form: GeneralSettings; update: (p: Partial<GeneralSettings>) => void; onSaved: () => void }) {
  const [seoForm, setSeoForm] = useState({
    title: form.defaultSeoTitle,
    desc: form.defaultSeoDescription,
  });
  const [autoFilled, setAutoFilled] = useState(false);

  const handleAutoFill = () => {
    const generated = autoGenerateSeo("home");
    setSeoForm({
      title: generated.titleAz,
      desc: generated.descriptionAz,
    });
    update({
      defaultSeoTitle: generated.titleAz,
      defaultSeoDescription: generated.descriptionAz,
    });
    setAutoFilled(true);
    onSaved();
    setTimeout(() => setAutoFilled(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Google Verification + Review URL */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
        <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-[#C2A05A]" /> SEO</h2>
        <Field label="Google Site Verification" value={form.googleSiteVerification} onChange={(v) => update({ googleSiteVerification: v })} placeholder="abc123..." help="Google Search Console tesdiq kodu." />
        <Field label="Google Reviews URL" value={form.googleReviewUrl} onChange={(v) => update({ googleReviewUrl: v })} placeholder="https://search.google.com/local/reviews?placeid=..." help="Google Reviews butonunun yonlendirecegi URL." />
        <div className="mt-4 pt-4 border-t border-[#352d24]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white/60 text-xs uppercase tracking-wider">Default SEO</h3>
            <button
              onClick={handleAutoFill}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                autoFilled
                  ? "bg-green-400/15 text-green-400 border border-green-400/20"
                  : "bg-[#C2A05A]/15 text-[#C2A05A] border border-[#C2A05A]/30 hover:bg-[#C2A05A]/25"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {autoFilled ? "Dolduruldu!" : "Otomatik doldur"}
            </button>
          </div>
          <div className="mb-3">
            <label htmlFor="seo-default-title" className="block text-white/60 text-xs mb-1">Default Title</label>
            <input
              id="seo-default-title"
              value={seoForm.title}
              onChange={(e) => { setSeoForm({ ...seoForm, title: e.target.value }); update({ defaultSeoTitle: e.target.value }); }}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="seo-default-description" className="block text-white/60 text-xs mb-1">Default Description</label>
            <textarea
              id="seo-default-description"
              value={seoForm.desc}
              onChange={(e) => { setSeoForm({ ...seoForm, desc: e.target.value }); update({ defaultSeoDescription: e.target.value }); }}
              rows={3}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#352d24] rounded text-white text-sm focus:outline-none focus:border-[#C2A05A]/30 resize-none"
            />
          </div>
          <p className="text-[#a89d88] text-[10px]">
            "Otomatik doldur" butonu site adi, filial, telefon ve menu verilerine gore SEO baslik ve aciklama uretir.
          </p>
        </div>
      </div>
    </div>
  );
}
