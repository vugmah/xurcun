import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { getGeneralSettings } from "@/lib/generalSettings";
import {
  Mail, Server, Settings, AlertTriangle, Save, RefreshCw, Trash2,
  Lock, HardDrive, Search, ExternalLink, Eye, EyeOff, Plus, X,
  Shield, Users, FileText, WifiOff, Info, Globe, ArrowRight,
} from "lucide-react";

/* ═══════════════════════════════════════════
   REAL DATA ONLY
   ═══════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   TAB 1 — Website Contact Emails
   ═══════════════════════════════════════════ */

const CONTACT_FIELDS = [
  { key: "infoEmail",       label: "Info Email",       placeholder: "info@xurcun.az" },
  { key: "reservationEmail",label: "Reservation Email",placeholder: "reservation@xurcun.az" },
  { key: "supportEmail",    label: "Support Email",    placeholder: "support@xurcun.az" },
  { key: "marketingEmail",  label: "Marketing Email",  placeholder: "marketing@xurcun.az" },
  { key: "hrEmail",         label: "HR Email",         placeholder: "hr@xurcun.az" },
  { key: "complaintsEmail", label: "Complaints Email", placeholder: "complaints@xurcun.az" },
];

function ContactEmailsTab() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.mail.adminGetContactEmails.useQuery();
  const upsert = trpc.mail.upsertContactEmails.useMutation({
    onSuccess: () => { utils.mail.adminGetContactEmails.invalidate(); utils.mail.getContactEmails.invalidate(); },
  });

  const [form, setForm] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const values: Record<string, string> = {};
  CONTACT_FIELDS.forEach((f) => {
    values[f.key] = form[f.key] ?? (data?.[f.key as keyof typeof data] as string) ?? "";
  });

  const save = () => {
    const payload: Record<string, string> = {};
    CONTACT_FIELDS.forEach((f) => {
      const v = values[f.key];
      if (v && v.includes("@")) payload[f.key] = v;
    });
    upsert.mutate(payload, { onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); } });
  };

  if (isLoading) return <div className="text-white/40 text-sm p-4">Yukleniyor…</div>;

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4">
      <p className="text-white/50 text-sm mb-2">
        Sitede gorunen email adreslerini yonetin.
      </p>
      {CONTACT_FIELDS.map((f) => (
        <div key={f.key} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 items-center">
          <Label className="text-white/70 text-sm">{f.label}</Label>
          <Input
            type="email"
            placeholder={f.placeholder}
            value={values[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            className="bg-[#0A0A0A] border-[#333] text-white"
          />
        </div>
      ))}
      <Button className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A] mt-2" onClick={save} disabled={upsert.isPending}>
        <Save className="w-4 h-4 mr-2" /> {saved ? "Saxlanildi!" : "Saxla"}
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 2 — Hosting Mail Accounts (cPanel)
   ═══════════════════════════════════════════ */

function MailAccountsTab() {
  const utils = trpc.useUtils();
  const statusQ = trpc.mail.getCpanelStatus.useQuery();
  const accountsQ = trpc.mail.listMailAccounts.useQuery();
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const createMut = trpc.mail.createMailAccount.useMutation({
    onSuccess: (data) => {
      accountsQ.refetch();
      setCreateOpen(false);
      // Show generated password once if returned
      const pw = (data as any)?.password || (data as any)?.plainPassword;
      if (pw) setGeneratedPassword(String(pw));
    },
  });
  const deleteMut = trpc.mail.deleteMailAccount.useMutation({ onSuccess: () => accountsQ.refetch() });
  const passMut = trpc.mail.changeMailPassword.useMutation({ onSuccess: () => { accountsQ.refetch(); setPassModal(null); } });
  const quotaMut = trpc.mail.changeMailQuota.useMutation({ onSuccess: () => { accountsQ.refetch(); setQuotaModal(null); } });

  const cpanelReady = statusQ.data?.envConfigured ?? false;
  const domain = statusQ.data?.domain ?? "xurcun.az";
  const rawAccounts = (accountsQ.data as { accounts?: Array<Record<string, unknown>> } | undefined)?.accounts ?? [];

  // Real accounts only
  const accounts = rawAccounts;

  // Search & filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Create form
  const [createOpen, setCreateOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({ username: "", password: "", quotaMb: 1024, department: "Genel", role: "Hizmet", notes: "" });

  // Modals
  const [passModal, setPassModal] = useState<string | null>(null);
  const [passForm, setPassForm] = useState("");
  const [quotaModal, setQuotaModal] = useState<string | null>(null);
  const [quotaForm, setQuotaForm] = useState(1024);

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc: any) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        acc.email?.toLowerCase().includes(q) ||
        acc.username?.toLowerCase().includes(q) ||
        acc.department?.toLowerCase().includes(q) ||
        acc.role?.toLowerCase().includes(q) ||
        acc.notes?.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [accounts, search, statusFilter]);

  // Webmail URL
  const webmailUrl = `https://${domain}:2096/`;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <Input
            placeholder="Ara: email, departman, rol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-[#0A0A0A] border-[#333] text-white text-sm"
          />
        </div>
        <div className="flex gap-1 bg-[#111] border border-[#222] rounded-lg p-0.5">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-all ${
                statusFilter === s ? "bg-[#C9A96E]/15 text-[#C9A96E]" : "text-white/40 hover:text-white/60"
              }`}
            >
              {s === "all" ? "Tum" : s === "active" ? "Aktif" : "Pasif"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <a href={webmailUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A96E]/10 text-[#C9A96E] text-xs border border-[#C9A96E]/20 hover:bg-[#C9A96E]/20 transition-all">
            <ExternalLink className="w-3 h-3" /> Webmail
          </a>
          <Button size="sm" className="bg-[#C9A96E]/10 text-[#C9A96E] hover:bg-[#C9A96E]/20 border border-[#C9A96E]/30" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Yeni
          </Button>
        </div>
      </div>

      {/* Create Account Form */}
      {createOpen && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Yeni Mail Hesabi</h3>
            <button onClick={() => setCreateOpen(false)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <Label className="text-white/40 text-xs block mb-1">Kullanici adi *</Label>
              <Input value={newAcc.username} onChange={(e) => setNewAcc({ ...newAcc, username: e.target.value })} placeholder="manager" className="bg-[#0A0A0A] border-[#333] text-white" />
            </div>
            <div>
              <Label className="text-white/40 text-xs block mb-1">Sifre *</Label>
              <Input type="password" value={newAcc.password} onChange={(e) => setNewAcc({ ...newAcc, password: e.target.value })} placeholder="******" className="bg-[#0A0A0A] border-[#333] text-white" />
            </div>
            <div>
              <Label className="text-white/40 text-xs block mb-1">Kota (MB, 0=sinirsiz)</Label>
              <Input type="number" value={newAcc.quotaMb} onChange={(e) => setNewAcc({ ...newAcc, quotaMb: parseInt(e.target.value) || 0 })} className="bg-[#0A0A0A] border-[#333] text-white" />
            </div>
            <div>
              <Label className="text-white/40 text-xs block mb-1">Departman</Label>
              <select
                value={newAcc.department}
                onChange={(e) => setNewAcc({ ...newAcc, department: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm"
              >
                <option>Genel</option><option>Rezervasiya</option><option>Destek</option>
                <option>Pazarlama</option><option>IK</option><option>Etkinlik</option>
                <option>Yonetim</option><option>Finans</option><option>Mutfak</option>
              </select>
            </div>
            <div>
              <Label className="text-white/40 text-xs block mb-1">Rol</Label>
              <select
                value={newAcc.role}
                onChange={(e) => setNewAcc({ ...newAcc, role: e.target.value })}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded text-white text-sm"
              >
                <option>Hizmet</option><option>Yonetim</option><option>Pazarlama</option><option>Operasyon</option>
              </select>
            </div>
            <div>
              <Label className="text-white/40 text-xs block mb-1">Notlar</Label>
              <Input value={newAcc.notes} onChange={(e) => setNewAcc({ ...newAcc, notes: e.target.value })} placeholder="Aciklama" className="bg-[#0A0A0A] border-[#333] text-white" />
            </div>
          </div>
          <p className="text-white/40 text-xs mb-3">{newAcc.username ? `${newAcc.username}@${domain}` : `...@${domain}`}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A]" onClick={() => createMut.mutate(newAcc)} disabled={createMut.isPending || !newAcc.username || !newAcc.password}>
              {createMut.isPending ? "Olusturuluyor…" : "Olustur"}
            </Button>
            <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setCreateOpen(false)}>İmtina</Button>
          </div>
        </div>
      )}

      {/* Generated password — shown once only */}
      {generatedPassword && (
        <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-400 text-sm font-medium">Hesap olusturuldu! Sifreyi kaydedin:</p>
            <button onClick={() => setGeneratedPassword(null)} className="text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <code className="block bg-[#0A0A0A] border border-[#333] rounded px-3 py-2 text-green-300 font-mono text-sm select-all">{generatedPassword}</code>
          <p className="text-green-400/50 text-[10px] mt-2">Bu sifre bir daha gosterilmeyecek. Webmail'de giris yapmak icin kaydedin.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#111] border border-[#222] rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-white">{accounts.length}</p>
          <p className="text-[10px] text-white/40">Toplam Hesap</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-green-400">{accounts.filter((a: any) => a.status === "active").length}</p>
          <p className="text-[10px] text-white/40">Aktif</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-[#C9A96E]">{Math.round(accounts.reduce((s: number, a: any) => s + (a.usedMb || 0), 0) / 1024 * 100) / 100} GB</p>
          <p className="text-[10px] text-white/40">Toplam Kullanim</p>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase tracking-wider">Email / Kullanici</th>
                <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase tracking-wider">Departman / Rol</th>
                <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase tracking-wider">Kullanim</th>
                <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase tracking-wider">Durum</th>
                <th className="text-right p-3 text-white/40 font-normal text-[10px] uppercase tracking-wider">Islem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-white/30">Hesap bulunmuyor</td>
                </tr>
              )}
              {filteredAccounts.map((acc: any) => (
                <tr key={String(acc.email)} className="hover:bg-white/[0.02]">
                  <td className="p-3">
                    <p className="text-white font-mono text-xs">{String(acc.email)}</p>
                    {acc.notes && <p className="text-white/30 text-[10px]">{acc.notes}</p>}
                  </td>
                  <td className="p-3">
                    <p className="text-white/60 text-xs">{acc.department || "—"}</p>
                    <p className="text-white/30 text-[10px]">{acc.role || "—"}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A96E] rounded-full" style={{ width: `${Math.min(100, ((acc.quotaMb || 1) > 0 ? (acc.usedMb || 0) / acc.quotaMb : 0) * 100)}%` }} />
                      </div>
                      <span className="text-white/40 text-[10px]">{acc.usedMb || 0} / {acc.quotaMb || 0} MB</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${acc.status === "active" ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>
                      {String(acc.status)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={getGeneralSettings().webmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-2 py-1 rounded text-[10px] text-blue-400 bg-blue-400/10 hover:bg-blue-400/20 transition-all mr-1"
                        title="Webmail'i ac"
                      >
                        <Globe className="w-3 h-3 mr-1" /> Webmail
                      </a>
                      <Button size="sm" variant="ghost" className="text-white/40 hover:text-[#C9A96E] h-7 px-2" title="Kota" onClick={() => { setQuotaModal(String(acc.email)); setQuotaForm(Number(acc.quotaMb) || 1024); }}>
                        <HardDrive className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white/40 hover:text-[#C9A96E] h-7 px-2" title="Sifre" onClick={() => { setPassModal(String(acc.email)); setPassForm(""); }}>
                        <Lock className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white/40 hover:text-red-400 h-7 px-2" title="Sil" onClick={() => { if (confirm(`${acc.email} silinsin mi?`)) deleteMut.mutate({ email: String(acc.email) }); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Modal */}
      {passModal && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h4 className="text-white font-medium mb-3">{passModal} — Sifre Degistir</h4>
          <Input type="password" placeholder="Yeni sifre" value={passForm} onChange={(e) => setPassForm(e.target.value)} className="bg-[#0A0A0A] border-[#333] text-white mb-3" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A]" onClick={() => passMut.mutate({ email: passModal, password: passForm })} disabled={passMut.isPending || passForm.length < 6}>
              {passMut.isPending ? "Degistiriliyor…" : "Degistir"}
            </Button>
            <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setPassModal(null)}>İmtina</Button>
          </div>
        </div>
      )}

      {/* Quota Modal */}
      {quotaModal && (
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <h4 className="text-white font-medium mb-3">{quotaModal} — Kota Degistir</h4>
          <Input type="number" placeholder="MB (0=sinirsiz)" value={quotaForm} onChange={(e) => setQuotaForm(parseInt(e.target.value) || 0)} className="bg-[#0A0A0A] border-[#333] text-white mb-3" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A]" onClick={() => quotaMut.mutate({ email: quotaModal, quotaMb: quotaForm })} disabled={quotaMut.isPending}>
              {quotaMut.isPending ? "Guncelleniyor…" : "Guncelle"}
            </Button>
            <Button size="sm" variant="ghost" className="text-white/50" onClick={() => setQuotaModal(null)}>İmtina</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 3 — Audit Log
   ═══════════════════════════════════════════ */

function AuditLogTab() {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
      <FileText className="w-8 h-8 text-white/20 mx-auto mb-3" />
      <p className="text-white/40 text-sm">Audit log is empty.</p>
      <p className="text-white/25 text-xs mt-1">Mail account actions will appear here when cPanel is connected.</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   OLD AuditLogTab — replaced with clean empty state
   ═══════════════════════════════════════════ */
function _AuditLogTabOld() { return null; }
/* ═══════════════════════════════════════════
   TAB 4 — SMTP Settings
   ═══════════════════════════════════════════ */

function SmtpTab() {
  const utils = trpc.useUtils();
  const { data } = trpc.mail.getSmtpSettings.useQuery();
  const upsert = trpc.mail.upsertSmtpSettings.useMutation({
    onSuccess: () => { utils.mail.getSmtpSettings.invalidate(); setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const [form, setForm] = useState({
    host: "", port: 587, username: "", password: "",
    secure: false, fromEmail: "", fromName: "", isActive: false,
  });
  const [saved, setSaved] = useState(false);

  const load = () => {
    if (!data) return;
    setForm({
      host: data.host ?? "", port: data.port ?? 587, username: data.username ?? "",
      password: "", secure: data.secure ?? false, fromEmail: data.fromEmail ?? "",
      fromName: data.fromName ?? "", isActive: data.isActive ?? false,
    });
  };

  const save = () => {
    const payload: Record<string, unknown> = {
      host: form.host, port: form.port, username: form.username,
      secure: form.secure, fromEmail: form.fromEmail, fromName: form.fromName, isActive: form.isActive,
    };
    if (form.password && form.password.length > 0) payload.password = form.password;
    upsert.mutate(payload);
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white/50 text-sm">Form maillerinin gonderilecegi SMTP ayarlari</p>
        <Button size="sm" variant="ghost" className="text-white/50 hover:text-[#C9A96E]" onClick={load}>
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Doldur
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white/40 text-xs block mb-1">SMTP Host</Label>
          <Input value={form.host} onChange={(e) => setForm({ ...form, host: e.target.value })} placeholder="smtp.xurcun.az" className="bg-[#0A0A0A] border-[#333] text-white" />
        </div>
        <div>
          <Label className="text-white/40 text-xs block mb-1">Port</Label>
          <Input type="number" value={form.port} onChange={(e) => setForm({ ...form, port: parseInt(e.target.value) || 587 })} className="bg-[#0A0A0A] border-[#333] text-white" />
        </div>
        <div>
          <Label className="text-white/40 text-xs block mb-1">Username</Label>
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="info@xurcun.az" className="bg-[#0A0A0A] border-[#333] text-white" />
        </div>
        <div>
          <Label className="text-white/40 text-xs block mb-1">Password (bos birakilirsa degismez)</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="******" className="bg-[#0A0A0A] border-[#333] text-white" />
        </div>
        <div>
          <Label className="text-white/40 text-xs block mb-1">From Email</Label>
          <Input value={form.fromEmail} onChange={(e) => setForm({ ...form, fromEmail: e.target.value })} placeholder="info@xurcun.az" className="bg-[#0A0A0A] border-[#333] text-white" />
        </div>
        <div>
          <Label className="text-white/40 text-xs block mb-1">From Name</Label>
          <Input value={form.fromName} onChange={(e) => setForm({ ...form, fromName: e.target.value })} placeholder="Xurcun White City" className="bg-[#0A0A0A] border-[#333] text-white" />
        </div>
      </div>
      <div className="flex items-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <Switch checked={form.secure} onCheckedChange={(v) => setForm({ ...form, secure: v })} />
          <span className="text-white/60 text-sm">TLS/SSL</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
          <span className="text-white/60 text-sm">Aktif</span>
        </div>
      </div>
      <Button className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A] mt-2" onClick={save} disabled={upsert.isPending}>
        <Save className="w-4 h-4 mr-2" /> {saved ? "Saxlanildi!" : "SMTP Ayarlarini Saxla"}
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   TAB 5 — Info / Usage Guide
   ═══════════════════════════════════════════ */

function MailInfoTab() {
  const s = getGeneralSettings();
  return (
    <div className="space-y-4">
      {/* How to use Webmail */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#C9A96E]" /> Webmail Nasil Kullanilir?
        </h3>
        <ol className="space-y-2 text-white/60 text-xs">
          <li className="flex items-start gap-2">
            <span className="text-[#C9A96E] font-bold shrink-0">1.</span>
            <span>Mail Hesaplari sekmesinde hesabinizin yanindaki <strong className="text-blue-400">Webmail</strong> butonuna tiklayin.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#C9A96E] font-bold shrink-0">2.</span>
            <span>Tam email adresinizi girin (ornegin: <code className="text-white/80">info@xurcun.az</code>).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#C9A96E] font-bold shrink-0">3.</span>
            <span>Posta kutusu sifrenizi girin.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#C9A96E] font-bold shrink-0">4.</span>
            <span>Email okuyun ve gonderin.</span>
          </li>
        </ol>
        <div className="mt-3">
          <a
            href={s.webmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-400/10 text-blue-400 border border-blue-400/20 rounded-lg text-sm hover:bg-blue-400/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Webmail'i Ac
          </a>
        </div>
      </div>

      {/* IMAP / SMTP Settings */}
      <div className="bg-[#111] border border-[#222] rounded-xl p-5">
        <h3 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
          <Server className="w-4 h-4 text-[#C9A96E]" /> Mail Istemcisi Ayarlari (Outlook, Apple Mail, Thunderbird)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Incoming IMAP */}
          <div className="space-y-2">
            <h4 className="text-white/60 text-xs uppercase tracking-wider">Gelen Sunucu (IMAP)</h4>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Sunucu:</span>
                <code className="text-white/80 text-xs font-mono">{s.mailImapHost}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Port:</span>
                <code className="text-white/80 text-xs font-mono">{s.mailImapPort} SSL</code>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Guvenlik:</span>
                <span className="text-green-400 text-xs">SSL/TLS</span>
              </div>
            </div>
          </div>

          {/* Outgoing SMTP */}
          <div className="space-y-2">
            <h4 className="text-white/60 text-xs uppercase tracking-wider">Giden Sunucu (SMTP)</h4>
            <div className="bg-[#0A0A0A] border border-[#222] rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Sunucu:</span>
                <code className="text-white/80 text-xs font-mono">{s.mailSmtpHost}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Port:</span>
                <code className="text-white/80 text-xs font-mono">{s.mailSmtpPort} SSL</code>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 text-xs">Guvenlik:</span>
                <span className="text-green-400 text-xs">SSL/TLS</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-[#0A0A0A] border border-[#222] rounded-lg p-3 space-y-1">
          <div className="flex justify-between">
            <span className="text-white/40 text-xs">Kullanici adi:</span>
            <span className="text-[#C9A96E] text-xs">Tam email adresiniz (ornegin: info@xurcun.az)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40 text-xs">Sifre:</span>
            <span className="text-[#C9A96E] text-xs">Posta kutusu sifreniz</span>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-400/5 border border-amber-400/10">
        <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-amber-400/60 text-[11px]">
          Sifreler admin panelinde gorunmez. Yeni sifre olusturuldugunda bir kere gosterilir.
          cPanel API bilgileri asla disariya aciklanmaz.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function MailSettingsPage() {
  return (
    <div className="min-w-0 max-w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white mb-1">Mail Yonetimi</h1>
        <p className="text-white/50 text-xs">Hosting mail hesaplari, contact email ve SMTP ayarlari</p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList className="bg-[#111] border border-[#222] flex-wrap h-auto">
          <TabsTrigger value="accounts" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E] text-xs">
            <Server className="w-3.5 h-3.5 mr-1.5" /> Mail Hesaplari
          </TabsTrigger>
          <TabsTrigger value="contact" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E] text-xs">
            <Mail className="w-3.5 h-3.5 mr-1.5" /> Contact Email
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E] text-xs">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Islem Kayitlari
          </TabsTrigger>
          <TabsTrigger value="smtp" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E] text-xs">
            <Settings className="w-3.5 h-3.5 mr-1.5" /> SMTP
          </TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-[#C9A96E]/15 data-[state=active]:text-[#C9A96E] text-xs">
            <Info className="w-3.5 h-3.5 mr-1.5" /> Bilgi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts"><MailAccountsTab /></TabsContent>
        <TabsContent value="contact"><ContactEmailsTab /></TabsContent>
        <TabsContent value="audit"><AuditLogTab /></TabsContent>
        <TabsContent value="smtp"><SmtpTab /></TabsContent>
        <TabsContent value="info"><MailInfoTab /></TabsContent>
      </Tabs>
    </div>
  );
}
