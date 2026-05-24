import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  BarChart3, Plus, Trash2, Pencil, Save, X, AlertTriangle,
  Megaphone, Target, FileText, List, Clock, Settings, RefreshCw,
} from "lucide-react";

/* ─── Helper: status badge color ─── */
function StatusBadge({ status }: { status: string | null }) {
  const s = status ?? "PAUSED";
  const cls =
    s === "ENABLED"
      ? "bg-green-500/15 text-green-400"
      : s === "PAUSED"
      ? "bg-yellow-500/15 text-yellow-400"
      : "bg-red-500/15 text-red-400";
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${cls}`}>{s}</span>;
}

/* ═══════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════ */

function DashboardTab() {
  const statusQ = trpc.googleAds.getStatus.useQuery();
  const s = statusQ.data;

  const cards = [
    { label: "Kampanya", value: s?.counts.campaigns ?? 0, icon: Megaphone },
    { label: "Reklam Grubu", value: s?.counts.adGroups ?? 0, icon: Target },
    { label: "Reklam", value: s?.counts.ads ?? 0, icon: FileText },
    { label: "Anahtar Kelime", value: s?.counts.keywords ?? 0, icon: List },
  ];

  return (
    <div className="space-y-6">
      {/* API Status */}
      <div className={`p-4 rounded-xl border ${s?.apiConfigured ? "bg-green-500/5 border-green-500/20" : "bg-yellow-500/5 border-yellow-500/20"}`}>
        <div className="flex items-center gap-2">
          {s?.apiConfigured ? (
            <div className="w-2 h-2 rounded-full bg-green-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
          )}
          <span className="text-white/70 text-sm">
            Google Ads API: {s?.apiConfigured ? "Bagli" : "Bagli degil - Settings sekmesinden yapilandirin"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#111] border border-[#222] rounded-xl p-5">
            <c.icon className="w-5 h-5 text-[#C9A96E] mb-3" />
            <p className="text-2xl font-bold text-white">{c.value}</p>
            <p className="text-white/50 text-xs">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CAMPAIGNS TAB
   ═══════════════════════════════════════════ */

const CAMPAIGN_TYPES = [
  { value: "SEARCH", label: "Search" },
  { value: "DISPLAY", label: "Display" },
  { value: "VIDEO", label: "Video" },
  { value: "PERFORMANCE_MAX", label: "Performance Max" },
  { value: "HOTEL", label: "Hotel" },
];

const BIDDING_STRATEGIES = [
  { value: "MANUAL_CPC", label: "Manual CPC" },
  { value: "TARGET_CPA", label: "Target CPA" },
  { value: "TARGET_ROAS", label: "Target ROAS" },
  { value: "MAXIMIZE_CONVERSIONS", label: "Maximize Conversions" },
  { value: "MAXIMIZE_CONVERSION_VALUE", label: "Maximize Conversion Value" },
];

function CampaignsTab() {
  const utils = trpc.useUtils();
  const { data: campaigns, isLoading } = trpc.googleAds.listCampaigns.useQuery();
  const createMut = trpc.googleAds.createCampaign.useMutation({ onSuccess: () => { utils.googleAds.listCampaigns.invalidate(); utils.googleAds.getStatus.invalidate(); setShowForm(false); } });
  const updateMut = trpc.googleAds.updateCampaign.useMutation({ onSuccess: () => { utils.googleAds.listCampaigns.invalidate(); setEditing(null); } });
  const deleteMut = trpc.googleAds.deleteCampaign.useMutation({ onSuccess: () => { utils.googleAds.listCampaigns.invalidate(); utils.googleAds.getStatus.invalidate(); } });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", type: "SEARCH", dailyBudget: "", biddingStrategy: "MANUAL_CPC", startDate: "", endDate: "", targetCpa: "", targetRoa: "" });
  const [editForm, setEditForm] = useState({ name: "", status: "PAUSED", dailyBudget: "", biddingStrategy: "" });

  if (isLoading) return <div className="text-white/40 text-sm p-4">Yukleniyor…</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">Reklam kampanyalarini yonetin</p>
        <Button size="sm" className="bg-[#C9A96E]/10 text-[#C9A96E] hover:bg-[#C9A96E]/20 border border-[#C9A96E]/30" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Yeni Kampanya
        </Button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-3">
          <h4 className="text-white font-medium">Yeni Kampanya</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Kampanya adi" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>{CAMPAIGN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Gunluk butce (AZN)" value={form.dailyBudget} onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" />
            <Select value={form.biddingStrategy} onValueChange={(v) => setForm({ ...form, biddingStrategy: v })}>
              <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>{BIDDING_STRATEGIES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A]" onClick={() => createMut.mutate(form)} disabled={!form.name}>Olustur</Button>
            <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setShowForm(false)}>Imtina</Button>
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222]">
              <th className="text-left p-3 text-white/40 text-xs uppercase">Ad</th>
              <th className="text-left p-3 text-white/40 text-xs uppercase">Tur</th>
              <th className="text-left p-3 text-white/40 text-xs uppercase">Durum</th>
              <th className="text-left p-3 text-white/40 text-xs uppercase">Butce</th>
              <th className="text-right p-3 text-white/40 text-xs uppercase">Islem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {campaigns?.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="p-3 text-white">{c.name}</td>
                <td className="p-3 text-white/50">{c.type}</td>
                <td className="p-3"><StatusBadge status={c.status} /></td>
                <td className="p-3 text-white/50">{c.dailyBudget ?? "-"}</td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-[#C9A96E]"
                      onClick={() => { setEditing(c.id); setEditForm({ name: c.name ?? "", status: c.status ?? "PAUSED", dailyBudget: c.dailyBudget ?? "", biddingStrategy: c.biddingStrategy ?? "" }); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-red-400"
                      onClick={() => { if (confirm("Silinsin mi?")) deleteMut.mutate({ id: c.id }); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {(!campaigns || campaigns.length === 0) && (
              <tr><td colSpan={5} className="p-6 text-center text-white/30">Kampanya bulunmuyor</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing !== null && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-3">
          <h4 className="text-white font-medium">Kampanya Duzenle</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" />
            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
              <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ENABLED">ENABLED</SelectItem>
                <SelectItem value="PAUSED">PAUSED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A]" onClick={() => updateMut.mutate({ id: editing, ...editForm })}>Saxla</Button>
            <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setEditing(null)}>Imtina</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONVERSIONS TAB
   ═══════════════════════════════════════════ */

const CONVERSION_CATEGORIES = [
  "CONTACT", "SUBMIT_LEAD_FORM", "PURCHASE", "PAGE_VIEW", "SIGN_UP", "ADD_TO_CART", "BEGIN_CHECKOUT",
];

function ConversionsTab() {
  const utils = trpc.useUtils();
  const { data: conversions } = trpc.googleAds.listConversions.useQuery();
  const createMut = trpc.googleAds.createConversion.useMutation({ onSuccess: () => { utils.googleAds.listConversions.invalidate(); setShowForm(false); } });
  const updateMut = trpc.googleAds.updateConversion.useMutation({ onSuccess: () => { utils.googleAds.listConversions.invalidate(); setEditing(null); } });
  const deleteMut = trpc.googleAds.deleteConversion.useMutation({ onSuccess: () => utils.googleAds.listConversions.invalidate() });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", category: "CONTACT", value: "", googleEvent: "", metaEvent: "", gtmTrigger: "" });
  const [editForm, setEditForm] = useState({ name: "", category: "", value: "", status: "", isActive: true, googleEvent: "", metaEvent: "", gtmTrigger: "" });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-white/50 text-sm">Conversion action’lari yonetin</p>
        <Button size="sm" className="bg-[#C9A96E]/10 text-[#C9A96E] hover:bg-[#C9A96E]/20 border border-[#C9A96E]/30" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-1" /> Yeni Conversion
        </Button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Conversion adi (rezervasyon_click)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" />
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="bg-[#0A0A0A] border-[#333] text-white"><SelectValue /></SelectTrigger>
              <SelectContent>{CONVERSION_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Deger (mes: 5.00)" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" />
            <Input placeholder="Google Event (mes: reservation_click)" value={form.googleEvent} onChange={(e) => setForm({ ...form, googleEvent: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" />
          </div>
          <Input placeholder="Meta Event (mes: reservation_click)" value={form.metaEvent} onChange={(e) => setForm({ ...form, metaEvent: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" />
          <Textarea placeholder="GTM Trigger (mes: Click - Rezervasyon Butonu)" value={form.gtmTrigger} onChange={(e) => setForm({ ...form, gtmTrigger: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white min-h-[60px]" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A]" onClick={() => createMut.mutate(form)} disabled={!form.name}>Olustur</Button>
            <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setShowForm(false)}>Imtina</Button>
          </div>
        </div>
      )}

      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222]">
              <th className="text-left p-3 text-white/40 text-xs uppercase">Ad</th>
              <th className="text-left p-3 text-white/40 text-xs uppercase">Kategori</th>
              <th className="text-left p-3 text-white/40 text-xs uppercase">Deger</th>
              <th className="text-left p-3 text-white/40 text-xs uppercase">Durum</th>
              <th className="text-right p-3 text-white/40 text-xs uppercase">Islem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {conversions?.map((c) => (
              <tr key={c.id} className="hover:bg-white/[0.02]">
                <td className="p-3 text-white">{c.name}</td>
                <td className="p-3 text-white/50">{c.category}</td>
                <td className="p-3 text-white/50">{c.value ?? "-"}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <Switch checked={c.isActive ?? true} onCheckedChange={(v) => updateMut.mutate({ id: c.id, isActive: v })} />
                  </div>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-[#C9A96E]"
                      onClick={() => { setEditing(c.id); setEditForm({ name: c.name, category: c.category ?? "", value: c.value ?? "", status: c.status ?? "", isActive: c.isActive ?? true, googleEvent: c.googleEvent ?? "", metaEvent: c.metaEvent ?? "", gtmTrigger: c.gtmTrigger ?? "" }); }}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-white/40 hover:text-red-400"
                      onClick={() => { if (confirm("Silinsin mi?")) deleteMut.mutate({ id: c.id }); }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {(!conversions || conversions.length === 0) && (
              <tr><td colSpan={5} className="p-6 text-center text-white/30">Conversion bulunmuyor</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS TAB
   ═══════════════════════════════════════════ */

function SettingsTab() {
  const utils = trpc.useUtils();
  const { data: settings } = trpc.googleAds.getSettings.useQuery();
  const upsertMut = trpc.googleAds.upsertSettings.useMutation({
    onSuccess: () => { utils.googleAds.getSettings.invalidate(); utils.googleAds.getStatus.invalidate(); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ clientId: "", clientSecret: "", developerToken: "", loginCustomerId: "", refreshToken: "", isActive: false });

  const load = () => {
    if (!settings) return;
    setForm({
      clientId: settings.clientId ?? "",
      clientSecret: "",
      developerToken: settings.developerToken ?? "",
      loginCustomerId: settings.loginCustomerId ?? "",
      refreshToken: "",
      isActive: settings.isActive ?? false,
    });
  };

  const save = () => {
    const payload: Record<string, unknown> = {
      clientId: form.clientId,
      developerToken: form.developerToken,
      loginCustomerId: form.loginCustomerId,
      isActive: form.isActive,
    };
    if (form.clientSecret) payload.clientSecret = form.clientSecret;
    if (form.refreshToken) payload.refreshToken = form.refreshToken;
    upsertMut.mutate(payload);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#B87333]/5 border border-[#B87333]/20 rounded-xl p-5">
        <h3 className="text-[#B87333] font-medium mb-2">Google Ads API Yapilandirma</h3>
        <p className="text-white/50 text-sm mb-4">
          Google Ads API erisimi icin asagidaki bilgileri doldurun. Bu bilgiler sadece backend&apos;de saklanir.
        </p>
        <Button size="sm" variant="ghost" className="text-white/50 hover:text-[#C9A96E] mb-4" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Mevcut Ayarlari Doldur
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label className="text-white/40 text-xs block mb-1">Client ID</Label><Input value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="bg-[#0A0A0A] border-[#333] text-white" /></div>
          <div><Label className="text-white/40 text-xs block mb-1">Client Secret</Label><Input type="password" value={form.clientSecret} onChange={(e) => setForm({ ...form, clientSecret: e.target.value })} placeholder="Bos birakilirsa degismez" className="bg-[#0A0A0A] border-[#333] text-white" /></div>
          <div><Label className="text-white/40 text-xs block mb-1">Developer Token</Label><Input type="password" value={form.developerToken} onChange={(e) => setForm({ ...form, developerToken: e.target.value })} placeholder="Bos birakilirsa degismez" className="bg-[#0A0A0A] border-[#333] text-white" /></div>
          <div><Label className="text-white/40 text-xs block mb-1">Login Customer ID</Label><Input value={form.loginCustomerId} onChange={(e) => setForm({ ...form, loginCustomerId: e.target.value })} placeholder="123-456-7890" className="bg-[#0A0A0A] border-[#333] text-white" /></div>
          <div><Label className="text-white/40 text-xs block mb-1">Refresh Token</Label><Input type="password" value={form.refreshToken} onChange={(e) => setForm({ ...form, refreshToken: e.target.value })} placeholder="Bos birakilirsa degismez" className="bg-[#0A0A0A] border-[#333] text-white" /></div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
          <span className="text-white/60 text-sm">Aktif</span>
        </div>

        <div className="mt-4 bg-[#0A0A0A] rounded-lg p-4 border border-[#222]">
          <p className="text-white/40 text-xs mb-2">Google Ads API icin .env degiskenleri (opsiyonel - ayarlardan da yonetilebilir):</p>
          <div className="font-mono text-[10px] text-white/30 space-y-0.5">
            <p>GOOGLE_ADS_CLIENT_ID=xxx.apps.googleusercontent.com</p>
            <p>GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxx</p>
            <p>GOOGLE_ADS_DEVELOPER_TOKEN=xxx</p>
            <p>GOOGLE_ADS_LOGIN_CUSTOMER_ID=xxx</p>
            <p>GOOGLE_ADS_REFRESH_TOKEN=1//xxx</p>
            <p>GOOGLE_ADS_MCC_ID=xxx</p>
          </div>
        </div>

        <Button className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A] mt-4" onClick={save} disabled={upsertMut.isPending}>
          <Save className="w-4 h-4 mr-2" /> {saved ? "Saxlanildi!" : "Ayarlarini Saxla"}
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function GoogleAdsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Google Ads Yonetimi</h1>
        <p className="text-white/50 text-sm">Kampanyalar, conversion&apos;lar, anahtar kelimeler ve API ayarlari</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-[#111] border border-[#222] flex-wrap h-auto">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E]">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E]">
            <Megaphone className="w-3.5 h-3.5 mr-1.5" /> Kampanyalar
          </TabsTrigger>
          <TabsTrigger value="conversions" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E]">
            <Target className="w-3.5 h-3.5 mr-1.5" /> Conversion&apos;lar
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E]">
            <Settings className="w-3.5 h-3.5 mr-1.5" /> Ayarlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard"><DashboardTab /></TabsContent>
        <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
        <TabsContent value="conversions"><ConversionsTab /></TabsContent>
        <TabsContent value="settings"><SettingsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
