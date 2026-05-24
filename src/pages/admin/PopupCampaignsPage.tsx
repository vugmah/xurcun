import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  MousePointer,
  Megaphone,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  ImageIcon,
  Loader2,
  Search,
} from "lucide-react";

/* ─── Type Definitions ─── */
type PopupType = "welcome" | "time" | "discount" | "exit" | "scroll" | "branch" | "event";

interface Campaign {
  id: number;
  name: string;
  type: PopupType;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  isActive: boolean | null;
  startDate: Date | null;
  endDate: Date | null;
  startHour: number | null;
  endHour: number | null;
  placement: string | null;
  branch: string | null;
  lang: string | null;
  frequency: number | null;
  delay: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface CampaignForm {
  name: string;
  type: PopupType;
  title: string;
  content: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  startHour: number;
  endHour: number;
  placement: string;
  branch: string;
  lang: string;
  frequency: number;
  delay: number;
}

/* ─── Constants ─── */
const POPUP_TYPES: { value: PopupType; label: string; color: string }[] = [
  { value: "welcome", label: "Welcome", color: "bg-blue-500/15 text-blue-400" },
  { value: "time", label: "Time", color: "bg-purple-500/15 text-purple-400" },
  { value: "discount", label: "Discount", color: "bg-green-500/15 text-green-400" },
  { value: "exit", label: "Exit", color: "bg-red-500/15 text-red-400" },
  { value: "scroll", label: "Scroll", color: "bg-orange-500/15 text-orange-400" },
  { value: "branch", label: "Branch", color: "bg-cyan-500/15 text-cyan-400" },
  { value: "event", label: "Event", color: "bg-pink-500/15 text-pink-400" },
];

const BRANCH_OPTIONS = [
  { value: "", label: "Butun Filiallar" },
  { value: "white-city", label: "White City" },
  { value: "seabreeze", label: "Seabreeze" },
];

const LANG_OPTIONS = [
  { value: "", label: "Butun Diller" },
  { value: "az", label: "AZ" },
  { value: "en", label: "EN" },
  { value: "ru", label: "RU" },
  { value: "tr", label: "TR" },
];

const PLACEMENT_OPTIONS = [
  { value: "", label: "Butun Sehifeler" },
  { value: "all", label: "Butun Sehifeler" },
  { value: "homepage", label: "Ana Sehife" },
  { value: "qr", label: "QR Menu" },
  { value: "homepage+qr", label: "Ana Sehife + QR Menu" },
];

const EMPTY_FORM: CampaignForm = {
  name: "",
  type: "welcome",
  title: "",
  content: "",
  imageUrl: "",
  ctaText: "",
  ctaLink: "",
  isActive: true,
  startDate: "",
  endDate: "",
  startHour: 0,
  endHour: 23,
  placement: "",
  branch: "",
  lang: "",
  frequency: 1,
  delay: 0,
};

/* ─── Helpers ─── */
function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toInputDate(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTypeColor(type: string): string {
  return POPUP_TYPES.find((t) => t.value === type)?.color ?? "bg-white/10 text-white/60";
}

function getTypeLabel(type: string): string {
  return POPUP_TYPES.find((t) => t.value === type)?.label ?? type;
}

/* ═══════════════════════════════════════════
   STATS DISPLAY COMPONENT
   ═══════════════════════════════════════════ */
function CampaignStats({ campaignId }: { campaignId: number }) {
  const { data, isLoading } = trpc.popup.stats.useQuery({ campaignId });

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-12 h-3 bg-white/5 rounded animate-pulse" />
        <div className="w-12 h-3 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-1 text-[11px] text-white/50" title="Goruntulenme">
        <Eye className="w-3 h-3" />
        {data?.views ?? 0}
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] text-white/50" title="Klikler">
        <MousePointer className="w-3 h-3" />
        {data?.clicks ?? 0}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKELETON
   ═══════════════════════════════════════════ */
function CampaignsSkeleton() {
  return (
    <div className="w-full animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-6 w-40 bg-white/10 rounded mb-2" />
        <div className="h-3 w-64 bg-white/5 rounded" />
      </div>
      {/* Toolbar skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 w-32 bg-white/10 rounded" />
        <div className="h-8 w-24 bg-white/10 rounded" />
      </div>
      {/* Table skeleton */}
      <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
        <div className="p-3 border-b border-[#222]">
          <div className="h-3 w-full bg-white/5 rounded" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-3 border-b border-[#222] flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-white/5" />
            <div className="flex-1">
              <div className="h-3 w-32 bg-white/10 rounded mb-1" />
              <div className="h-2 w-20 bg-white/5 rounded" />
            </div>
            <div className="w-16 h-3 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function PopupCampaignsPage() {
  const utils = trpc.useUtils();

  /* ── Queries & Mutations ── */
  const { data: campaigns, isLoading } = trpc.popup.adminList.useQuery();
  const createMut = trpc.popup.create.useMutation({
    onSuccess: () => {
      utils.popup.adminList.invalidate();
      closeModal();
    },
  });
  const updateMut = trpc.popup.update.useMutation({
    onSuccess: () => {
      utils.popup.adminList.invalidate();
      closeModal();
    },
  });
  const deleteMut = trpc.popup.delete.useMutation({
    onSuccess: () => {
      utils.popup.adminList.invalidate();
      setDeleteId(null);
    },
  });
  const toggleMut = trpc.popup.toggleActive.useMutation({
    onSuccess: () => utils.popup.adminList.invalidate(),
  });

  /* ── Local State ── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CampaignForm>({ ...EMPTY_FORM });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Derived ── */
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    if (!searchTerm.trim()) return campaigns;
    const term = searchTerm.toLowerCase();
    return campaigns.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term) ||
        (c.title ?? "").toLowerCase().includes(term)
    );
  }, [campaigns, searchTerm]);

  const isMutating = createMut.isPending || updateMut.isPending || deleteMut.isPending || toggleMut.isPending;

  /* ── Modal Helpers ── */
  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setIsModalOpen(true);
  }

  function openEdit(campaign: Campaign) {
    setEditingId(campaign.id);
    setForm({
      name: campaign.name ?? "",
      type: (campaign.type as PopupType) ?? "welcome",
      title: campaign.title ?? "",
      content: campaign.content ?? "",
      imageUrl: campaign.imageUrl ?? "",
      ctaText: campaign.ctaText ?? "",
      ctaLink: campaign.ctaLink ?? "",
      isActive: campaign.isActive ?? true,
      startDate: toInputDate(campaign.startDate),
      endDate: toInputDate(campaign.endDate),
      startHour: campaign.startHour ?? 0,
      endHour: campaign.endHour ?? 23,
      placement: campaign.placement ?? "",
      branch: campaign.branch ?? "",
      lang: campaign.lang ?? "",
      frequency: campaign.frequency ?? 1,
      delay: campaign.delay ?? 0,
    });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }

  function handleSubmit() {
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      type: form.type,
      title: form.title || undefined,
      content: form.content || undefined,
      imageUrl: form.imageUrl || undefined,
      ctaText: form.ctaText || undefined,
      ctaLink: form.ctaLink || undefined,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      startHour: form.startHour,
      endHour: form.endHour,
      placement: (form.placement || "all") as "all" | "homepage" | "qr" | "homepage+qr",
      branch: form.branch || undefined,
      lang: form.lang || undefined,
      frequency: form.frequency,
      delay: form.delay,
    };

    if (editingId !== null) {
      updateMut.mutate({ id: editingId, ...payload });
    } else {
      createMut.mutate(payload);
    }
  }

  function handleDelete() {
    if (deleteId !== null) {
      deleteMut.mutate({ id: deleteId });
    }
  }

  function updateForm<K extends keyof CampaignForm>(key: K, value: CampaignForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /* ── Render ── */
  return (
    <div className="min-w-0 max-w-full">
      {/* ═══ HEADER ═══ */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-5 h-5 text-[#C9A96E]" />
          <h1 className="text-xl font-bold text-white">Kampaniyalar</h1>
        </div>
        <p className="text-white/50 text-xs ml-7">
          Saytda gosterilen popup kampaniyalarini idare edin
        </p>
      </div>

      {isLoading ? (
        <CampaignsSkeleton />
      ) : (
        <>
          {/* ═══ TOOLBAR ═══ */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Kampaniya axtar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-[#111] border border-[#222] rounded-lg text-white text-xs placeholder:text-white/25 focus:outline-none focus:border-[#C9A96E]/30"
              />
            </div>
            <Button
              size="sm"
              className="bg-[#C9A96E]/10 text-[#C9A96E] hover:bg-[#C9A96E]/20 border border-[#C9A96E]/30 shrink-0"
              onClick={openCreate}
            >
              <Plus className="w-4 h-4 mr-1" /> Yeni Kampaniya
            </Button>
          </div>

          {/* ═══ CAMPAIGN LIST ═══ */}
          {filteredCampaigns.length === 0 ? (
            /* Empty state */
            <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
              <Megaphone className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm mb-1">
                {searchTerm ? "Axtaris uygun netice tapilmadi" : "Hec bir kampaniya yaradilmayib"}
              </p>
              <p className="text-white/20 text-xs mb-4">
                {searchTerm ? "Basqa axtaris terminleri cehd edin" : "Birinci kampaniyani yaratmag ucun duymeye basin"}
              </p>
              {!searchTerm && (
                <Button
                  size="sm"
                  className="bg-[#C9A96E]/10 text-[#C9A96E] hover:bg-[#C9A96E]/20 border border-[#C9A96E]/30"
                  onClick={openCreate}
                >
                  <Plus className="w-4 h-4 mr-1" /> Kampaniya Yarat
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
              {/* Desktop: table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#222]">
                      <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">
                        Kampaniya
                      </th>
                      <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">
                        Tip
                      </th>
                      <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">
                        Status
                      </th>
                      <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">
                        Statistika
                      </th>
                      <th className="text-left p-3 text-white/40 font-normal text-[10px] uppercase">
                        Tarix
                      </th>
                      <th className="text-right p-3 text-white/40 font-normal text-[10px] uppercase">
                        Islemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {filteredCampaigns.map((c) => (
                      <tr key={c.id} className="hover:bg-white/[0.02]">
                        <td className="p-3">
                          <p className="text-white text-xs font-medium">{c.name}</p>
                          {c.title && (
                            <p className="text-white/30 text-[10px]">{c.title}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded ${getTypeColor(c.type)}`}
                          >
                            {getTypeLabel(c.type)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {c.isActive ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <Switch
                              checked={c.isActive ?? false}
                              onCheckedChange={(v) =>
                                toggleMut.mutate({ id: c.id, isActive: v })
                              }
                              disabled={toggleMut.isPending}
                              className="data-[state=checked]:bg-[#C9A96E]"
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <CampaignStats campaignId={c.id} />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-white/40 text-[11px]">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {formatDate(c.startDate)} → {formatDate(c.endDate)}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-white/40 hover:text-[#C9A96E]"
                              onClick={() => openEdit(c as unknown as Campaign)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-white/40 hover:text-red-400"
                              onClick={() => setDeleteId(c.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: card view */}
              <div className="md:hidden divide-y divide-[#222]">
                {filteredCampaigns.map((c) => (
                  <div key={c.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{c.name}</p>
                        {c.title && (
                          <p className="text-white/30 text-xs truncate">{c.title}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded shrink-0 ml-2 ${getTypeColor(c.type)}`}
                      >
                        {getTypeLabel(c.type)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <CampaignStats campaignId={c.id} />
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={c.isActive ?? false}
                          onCheckedChange={(v) =>
                            toggleMut.mutate({ id: c.id, isActive: v })
                          }
                          disabled={toggleMut.isPending}
                          className="data-[state=checked]:bg-[#C9A96E]"
                        />
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            c.isActive
                              ? "bg-green-500/15 text-green-400"
                              : "bg-red-500/15 text-red-400"
                          }`}
                        >
                          {c.isActive ? "Aktiv" : "Deaktiv"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-white/30 text-[11px] mb-3">
                      <Calendar className="w-3 h-3" />
                      {formatDate(c.startDate)} → {formatDate(c.endDate)}
                    </div>

                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-white/40 hover:text-[#C9A96E]"
                        onClick={() => openEdit(c as unknown as Campaign)}
                      >
                        <Pencil className="w-3 h-3 mr-1" /> Duzelis
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-white/40 hover:text-red-400"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" /> Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══ CREATE/EDIT MODAL ═══ */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="bg-[#111] border-[#222] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {editingId !== null ? (
                <>
                  <Pencil className="w-4 h-4 text-[#C9A96E]" /> Kampaniyani Duzelis Et
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-[#C9A96E]" /> Yeni Kampaniya Yarat
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Popup kampaniyasinin butun parametrlarini doldurun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Row 1: Name + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs block mb-1">
                  Ad <span className="text-red-400">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="Kampaniya adi"
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs block mb-1">Tip</Label>
                <select
                  value={form.type}
                  onChange={(e) => updateForm("type", e.target.value as PopupType)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded-md text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                >
                  {POPUP_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Title */}
            <div>
              <Label className="text-white/60 text-xs block mb-1">Basliq</Label>
              <Input
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                placeholder="Popup basligi"
                className="bg-[#0A0A0A] border-[#333] text-white text-sm"
              />
            </div>

            {/* Row 3: Content */}
            <div>
              <Label className="text-white/60 text-xs block mb-1">Mezmun</Label>
              <Textarea
                value={form.content}
                onChange={(e) => updateForm("content", e.target.value)}
                placeholder="Popup mezmunu (HTML destekleyir)"
                rows={3}
                className="bg-[#0A0A0A] border-[#333] text-white text-sm resize-none"
              />
            </div>

            {/* Row 4: Image URL + Preview */}
            <div>
              <Label className="text-white/60 text-xs block mb-1">
                <ImageIcon className="w-3 h-3 inline mr-1" />
                Sekil URL
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  value={form.imageUrl}
                  onChange={(e) => updateForm("imageUrl", e.target.value)}
                  placeholder="https://..."
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm flex-1"
                />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded object-cover border border-[#333] shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </div>
            </div>

            {/* Row 5: CTA Text + CTA Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs block mb-1">Düyme Metni</Label>
                <Input
                  value={form.ctaText}
                  onChange={(e) => updateForm("ctaText", e.target.value)}
                  placeholder="Mes: Indi Rezerv Et"
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs block mb-1">Düyme Linki</Label>
                <Input
                  value={form.ctaLink}
                  onChange={(e) => updateForm("ctaLink", e.target.value)}
                  placeholder="/reservation veya https://..."
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
              </div>
            </div>

            {/* Row 6: Active Toggle */}
            <div className="flex items-center gap-3 p-3 bg-[#0A0A0A] rounded-lg border border-[#222]">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => updateForm("isActive", v)}
                className="data-[state=checked]:bg-[#C9A96E]"
              />
              <div>
                <span className="text-white/70 text-xs">Aktiv</span>
                <p className="text-white/30 text-[10px]">
                  Kampaniya saytda gosterilsin
                </p>
              </div>
            </div>

            {/* Row 7: Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs block mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Baslama Tarixi
                </Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm("startDate", e.target.value)}
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs block mb-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  Bitme Tarixi
                </Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm("endDate", e.target.value)}
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
              </div>
            </div>

            {/* Row 8: Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs block mb-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Baslama Saati (0-23)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={form.startHour}
                  onChange={(e) =>
                    updateForm(
                      "startHour",
                      Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs block mb-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Bitme Saati (0-23)
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={form.endHour}
                  onChange={(e) =>
                    updateForm(
                      "endHour",
                      Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                    )
                  }
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
              </div>
            </div>

            {/* Row 9: Placement */}
            <div>
              <Label className="text-white/60 text-xs block mb-1">Gosterim Yeri</Label>
              <select
                value={form.placement}
                onChange={(e) => updateForm("placement", e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded-md text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
              >
                {PLACEMENT_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-white/25 text-[10px] mt-1">
                Popup hansi sehifelerde gosterilsin
              </p>
            </div>

            {/* Row 10: Branch + Lang */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs block mb-1">Filial</Label>
                <select
                  value={form.branch}
                  onChange={(e) => updateForm("branch", e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded-md text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-white/60 text-xs block mb-1">Dil</Label>
                <select
                  value={form.lang}
                  onChange={(e) => updateForm("lang", e.target.value)}
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded-md text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                >
                  {LANG_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 11: Frequency + Delay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-white/60 text-xs block mb-1">
                  Tezlik (sessiya basina gosterim)
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={form.frequency}
                  onChange={(e) =>
                    updateForm(
                      "frequency",
                      Math.max(1, parseInt(e.target.value) || 1)
                    )
                  }
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
                <p className="text-white/25 text-[10px] mt-1">
                  Her sessiyada maksimum gosterim sayi
                </p>
              </div>
              <div>
                <Label className="text-white/60 text-xs block mb-1">
                  Gecikme (saniye)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.delay}
                  onChange={(e) =>
                    updateForm(
                      "delay",
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  }
                  className="bg-[#0A0A0A] border-[#333] text-white text-sm"
                />
                <p className="text-white/25 text-[10px] mt-1">
                  Popupin gosterilmesinden once gozleme muddeti
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white"
              onClick={closeModal}
              disabled={isMutating}
            >
              Imtina
            </Button>
            <Button
              size="sm"
              className="bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A]"
              onClick={handleSubmit}
              disabled={!form.name.trim() || createMut.isPending || updateMut.isPending}
            >
              {createMut.isPending || updateMut.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : editingId !== null ? (
                <Pencil className="w-4 h-4 mr-1" />
              ) : (
                <Plus className="w-4 h-4 mr-1" />
              )}
              {editingId !== null ? "Yenile" : "Yarat"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ DELETE CONFIRMATION DIALOG ═══ */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent className="bg-[#111] border-[#222] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" /> Kampaniyani Sil
            </DialogTitle>
            <DialogDescription className="text-white/40 text-xs">
              Bu kampaniyani silmek istediyinize eminsiniz? Bu emeliyyat geri
              alinmaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white"
              onClick={() => setDeleteId(null)}
              disabled={deleteMut.isPending}
            >
              Imtina
            </Button>
            <Button
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
              disabled={deleteMut.isPending}
            >
              {deleteMut.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1" />
              )}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
