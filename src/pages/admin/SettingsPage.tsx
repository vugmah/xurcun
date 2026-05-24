import { useState, useCallback } from "react";
import {
  getGeneralSettings, saveGeneralSettings, type GeneralSettings, type BranchItem,
  getBranches, saveBranches,
} from "@/lib/generalSettings";
import { autoGenerateSeo, type SeoPageSettings } from "@/lib/seoStore";
import {
  getShishaDiscount, saveShishaDiscount,
  type ShishaDiscountConfig,
} from "@/lib/shishaDiscountStore";
import { clearTrackingDbCache } from "@/lib/trackingSettings";
import { trpc } from "@/providers/trpc";
import {
  Save, Check, Globe, Phone, Mail, MapPin, Utensils,
  Settings, BarChart3, Search, Server, RotateCcw,
  Plus, Trash2, X, Sparkles, Tag,
} from "lucide-react";

type SectionKey = "site" | "contact" | "branches" | "reservation" | "seo" | "tracking" | "mail" | "shisha-discount";

const SECTIONS: { key: SectionKey; label: string; icon: typeof Settings }[] = [
  { key: "site", label: "Site", icon: Globe },
  { key: "contact", label: "Əlaqə", icon: Phone },
  { key: "branches", label: "Filiallar", icon: MapPin },
  { key: "reservation", label: "Rezervasiya", icon: Utensils },
  { key: "shisha-discount", label: "Qəlyan Endirim", icon: Tag },
  { key: "seo", label: "SEO", icon: Search },
  { key: "tracking", label: "Tracking", icon: BarChart3 },
  { key: "mail", label: "Mail", icon: Server },
];

/* ─── Input Field ─── */
function Field({ label, value, onChange, placeholder, type = "text", help }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; help?: string;
}) {
  return (
    <div className="mb-3">
      <label className="block text-white/60 text-xs mb-1">{label}</label>
      {help && <p className="text-white/25 text-[10px] mb-1">{help}</p>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30" />
    </div>
  );
}

/* ─── Toggle Field ─── */
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-white/60 text-xs">{label}</span>
      <button onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-[#C9A96E]" : "bg-[#333]"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

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

  const update = useCallback((patch: Partial<GeneralSettings>) => {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      saveGeneralSettings(next);

      // Sync tracking IDs to DB (so they work on all devices, not just admin's browser)
      const dbKeyMap: Record<string, string> = {
        gtmId: "gtm_container_id",
        ga4MeasurementId: "ga4_measurement_id",
        googleAdsId: "google_ads_id",
        metaPixelId: "meta_pixel_id",
        metaDomainVerificationCode: "meta_domain_verification",
      };
      for (const [formKey, dbKey] of Object.entries(dbKeyMap)) {
        const val = (patch as Record<string, unknown>)[formKey];
        if (val !== undefined) {
          trackingUpsert.mutate({ key: dbKey, value: String(val) });
        }
      }

      // If tracking IDs changed, clear DB cache so public pages get fresh IDs
      if (patch.gtmId !== undefined || patch.ga4MeasurementId !== undefined ||
          patch.googleAdsId !== undefined || patch.metaPixelId !== undefined ||
          patch.metaDomainVerificationCode !== undefined) {
        clearTrackingDbCache();
      }
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, [trackingUpsert]);

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
      <div className="flex gap-1 mb-6 bg-[#111] border border-[#222] rounded-lg p-1 overflow-x-auto">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeSection === s.key ? "bg-[#C9A96E]/15 text-[#C9A96E]" : "text-white/40 hover:text-white/60"
              }`}>
              <Icon className="w-3.5 h-3.5" /> {s.label}
            </button>
          );
        })}
      </div>

      {/* ═══ SITE ═══ */}
      {activeSection === "site" && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-[#C9A96E]" /> Site</h2>
          <Field label="Site Adı" value={form.siteName} onChange={(v) => update({ siteName: v })} placeholder="Xurcun White City" />
          <Field label="Marka Adı" value={form.brandName} onChange={(v) => update({ brandName: v })} placeholder="Xurcun" />
          <div className="mb-3">
            <label className="block text-white/60 text-xs mb-1">Default Dil</label>
            <select value={form.defaultLanguage} onChange={(e) => update({ defaultLanguage: e.target.value })}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30">
              <option value="az">AZ — Azərbaycan</option>
              <option value="tr">TR — Türkçe</option>
              <option value="ru">RU — Русский</option>
              <option value="en">EN — English</option>
            </select>
            <p className="text-white/25 text-[10px] mt-1">İlk ziyaretciler için tarayıcı diline göre otomatik seçilir.</p>
          </div>
        </div>
      )}

      {/* ═══ CONTACT ═══ */}
      {activeSection === "contact" && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-[#C9A96E]" /> Əlaqə</h2>
          <Field label="Telefon" value={form.phone} onChange={(v) => update({ phone: v })} placeholder="+994502130555" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => update({ whatsapp: v })} placeholder="994502130550" />
          <Field label="E-poçt" value={form.email} onChange={(v) => update({ email: v })} placeholder="info@xurcun.az" />
          <div className="mt-4 pt-4 border-t border-[#222]">
            <h3 className="text-white/40 text-xs uppercase tracking-wider mb-3">Sosial Media</h3>
            <Field label="Instagram URL" value={form.instagramUrl} onChange={(v) => update({ instagramUrl: v })} placeholder="https://instagram.com/xurcunwhitecity" />
            <Field label="Facebook URL" value={form.facebookUrl} onChange={(v) => update({ facebookUrl: v })} placeholder="https://facebook.com/xurcunwhitecity" />
          </div>
        </div>
      )}

      {/* ═══ BRANCHES (CRUD) ═══ */}
      {activeSection === "branches" && (
        <BranchSettings onUpdate={() => setSaved(true)} />
      )}

      {/* ═══ RESERVATION ═══ */}
      {activeSection === "reservation" && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Utensils className="w-4 h-4 text-[#C9A96E]" /> Rezervasiya</h2>
          <Field label="White City WhatsApp" value={form.whiteCityWhatsapp} onChange={(v) => update({ whiteCityWhatsapp: v })} placeholder="994502130550" />
          <Field label="Seabreeze WhatsApp" value={form.seabreezeWhatsapp} onChange={(v) => update({ seabreezeWhatsapp: v })} placeholder="994501234567" help="Boş buraxılarsa Seabreeze rezervasiya deaktiv olar." />
          <div className="mt-4 pt-4 border-t border-[#222] space-y-1">
            <Toggle label="Rezervasiya formu aktiv" value={form.reservationActive} onChange={(v) => update({ reservationActive: v })} />
            <Toggle label="Rezervasiya düyməsi aktiv" value={form.reservationButtonActive} onChange={(v) => update({ reservationButtonActive: v })} />
          </div>
        </div>
      )}

      {/* ═══ SEO ═══ */}
      {activeSection === "seo" && (
        <SeoSettings form={form} update={update} onSaved={() => setSaved(true)} />
      )}

      {/* ═══ MAIL SERVER ═══ */}
      {activeSection === "mail" && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-[#C9A96E]" /> Mail Sunucu</h2>
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
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#C9A96E]" /> Tracking</h2>
          <Field label="Google Tag Manager ID" value={form.gtmId} onChange={(v) => update({ gtmId: v })} placeholder="GTM-XXXXXXX" />
          <Field label="GA4 Measurement ID" value={form.ga4MeasurementId} onChange={(v) => update({ ga4MeasurementId: v })} placeholder="G-XXXXXXXXXX" />
          <Field label="Google Ads Conversion ID" value={form.googleAdsId} onChange={(v) => update({ googleAdsId: v })} placeholder="AW-XXXXXXXXXX" />
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

      {/* ═══ SHISHA DISCOUNT ═══ */}
      {activeSection === "shisha-discount" && (
        <ShishaDiscountSettings onSaved={() => setSaved(true)} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHISHA DISCOUNT SETTINGS — branch-specific
   ═══════════════════════════════════════════ */

function ShishaDiscountSettings({ onSaved }: { onSaved: () => void }) {
  const branches = getBranches();
  const [configs, setConfigs] = useState<Record<string, ShishaDiscountConfig>>(() => {
    const map: Record<string, ShishaDiscountConfig> = {};
    for (const b of branches) {
      map[b.slug] = getShishaDiscount(b.slug);
    }
    return map;
  });

  const updateBranch = (slug: string, patch: Partial<ShishaDiscountConfig>) => {
    setConfigs((prev) => {
      const next = { ...prev, [slug]: { ...prev[slug], ...patch } };
      saveShishaDiscount(slug, next[slug]);
      return next;
    });
    onSaved();
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <h2 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#C9A96E]" /> Qəlyan Endirim — Filial başına
        </h2>
        <p className="text-white/40 text-xs mb-4">Hər filial üçün ayrı endirim faizi, aktiv saatı və ON/OFF ayarı.</p>

        {branches.filter((b) => b.isActive).map((b) => {
          const cfg = configs[b.slug] || { enabled: false, percent: 50, activeFrom: "13:00", activeUntil: "18:00" };
          return (
            <div key={b.slug} className="mb-5 p-4 bg-[#0A0A0A] border border-[#222] rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-medium">{b.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded ${cfg.enabled ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                  {cfg.enabled ? "Aktiv" : "Deaktiv"}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">Endirim Aktiv</span>
                  <button
                    onClick={() => updateBranch(b.slug, { enabled: !cfg.enabled })}
                    className={`relative w-10 h-5 rounded-full transition-colors ${cfg.enabled ? "bg-[#C9A96E]" : "bg-[#333]"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${cfg.enabled ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Endirim Faizi (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={cfg.percent}
                      onChange={(e) => updateBranch(b.slug, { percent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                      className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Başlama Saatı</label>
                    <input
                      type="time"
                      value={cfg.activeFrom}
                      onChange={(e) => updateBranch(b.slug, { activeFrom: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1">Bitmə Saatı</label>
                    <input
                      type="time"
                      value={cfg.activeUntil}
                      onChange={(e) => updateBranch(b.slug, { activeUntil: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                    />
                  </div>
                </div>

                <p className="text-white/25 text-[10px]">
                  {cfg.enabled
                    ? `${cfg.percent}% endirim ${cfg.activeFrom}–${cfg.activeUntil} arası aktivdir. Baku vaxtı UTC+4.`
                    : "Endirim deaktiv — normal qiymətlər göstəriləcək."}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BRANCH SETTINGS (CRUD)
   ═══════════════════════════════════════════ */

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
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">Filial</th>
                <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">Slug</th>
                <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">WhatsApp</th>
                <th className="text-center p-3 text-white/40 font-normal text-[10px] uppercase">Aktiv</th>
                <th className="text-right p-3 text-white/40 font-normal text-[10px] uppercase">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <p className="text-white text-xs font-medium">{b.name}</p>
                    <p className="text-white/30 text-[10px]">{b.address || "—"}</p>
                  </td>
                  <td className="p-3 text-white/40 text-xs font-mono">{b.slug}</td>
                  <td className="p-3 text-white/40 text-xs">{b.whatsapp || "—"}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${b.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {b.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(b)} className="text-white/30 hover:text-[#C9A96E] text-[10px] px-2 py-1 rounded hover:bg-white/5">Duzenle</button>
                      <button onClick={() => remove(b.id)} className="text-white/30 hover:text-red-400 text-[10px] px-2 py-1 rounded hover:bg-white/5">Sil</button>
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
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h3 className="text-white font-medium text-sm mb-4">{editing ? "Filial Duzenle" : "Yeni Filial"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-xs block mb-1">Filial Adi *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Xurcun White City"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30" />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Slug * (URLde gorunur)</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} placeholder="white-city"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30" />
            </div>
            <div className="md:col-span-2">
              <label className="text-white/40 text-xs block mb-1">Unvan</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Baki, White City"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30" />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">Google Maps URL</label>
              <input value={form.mapsUrl} onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })} placeholder="https://maps.app.goo.gl/..."
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30" />
            </div>
            <div>
              <label className="text-white/40 text-xs block mb-1">WhatsApp</label>
              <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="994502130550"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Toggle label="Aktif" value={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="px-4 py-2 bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A] rounded text-sm font-medium transition-all">
              {editing ? "Guncelle" : "Ekle"}
            </button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="px-4 py-2 text-white/40 hover:text-white text-sm transition-all">
              İmtina
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => { setAdding(true); setEditing(null); setForm({ id: "", name: "", slug: "", address: "", mapsUrl: "", whatsapp: "", isActive: true }); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A96E]/10 text-[#C9A96E] border border-[#C9A96E]/20 rounded-lg text-sm hover:bg-[#C9A96E]/20 transition-all">
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
      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <h2 className="text-white font-medium text-sm mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-[#C9A96E]" /> SEO</h2>
        <Field label="Google Site Verification" value={form.googleSiteVerification} onChange={(v) => update({ googleSiteVerification: v })} placeholder="abc123..." help="Google Search Console tesdiq kodu." />
        <Field label="Google Reviews URL" value={form.googleReviewUrl} onChange={(v) => update({ googleReviewUrl: v })} placeholder="https://search.google.com/local/reviews?placeid=..." help="Google Reviews butonunun yonlendirecegi URL." />
        <div className="mt-4 pt-4 border-t border-[#222]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white/60 text-xs uppercase tracking-wider">Default SEO</h3>
            <button
              onClick={handleAutoFill}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                autoFilled
                  ? "bg-green-400/15 text-green-400 border border-green-400/20"
                  : "bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30 hover:bg-[#C9A96E]/25"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {autoFilled ? "Dolduruldu!" : "Otomatik doldur"}
            </button>
          </div>
          <div className="mb-3">
            <label className="block text-white/60 text-xs mb-1">Default Title</label>
            <input
              value={seoForm.title}
              onChange={(e) => { setSeoForm({ ...seoForm, title: e.target.value }); update({ defaultSeoTitle: e.target.value }); }}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
            />
          </div>
          <div className="mb-3">
            <label className="block text-white/60 text-xs mb-1">Default Description</label>
            <textarea
              value={seoForm.desc}
              onChange={(e) => { setSeoForm({ ...seoForm, desc: e.target.value }); update({ defaultSeoDescription: e.target.value }); }}
              rows={3}
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm focus:outline-none focus:border-[#C9A96E]/30 resize-none"
            />
          </div>
          <p className="text-white/25 text-[10px]">
            "Otomatik doldur" butonu site adi, filial, telefon ve menu verilerine gore SEO baslik ve aciklama uretir.
          </p>
        </div>
      </div>
    </div>
  );
}
