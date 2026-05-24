import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail, Inbox, Trash2, Eye, EyeOff, MessageSquare, Clock, User,
  Search, CheckCircle2, AlertCircle, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";

/* ─── Types ─── */
type ContactItem = {
  id: number;
  name: string | null;
  email: string;
  subject: string | null;
  message: string | null;
  isRead: boolean | null;
  createdAt: Date | null;
};

/* ─── Skeleton ─── */
function InboxSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5" />
              <div className="space-y-1.5">
                <div className="h-3 w-24 bg-white/10 rounded" />
                <div className="h-2 w-32 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-2 w-16 bg-white/5 rounded" />
          </div>
          <div className="h-2 w-full bg-white/5 rounded mb-2" />
          <div className="h-2 w-3/4 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ─── Empty State ─── */
function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-12 text-center">
      <Inbox className="w-10 h-10 text-white/10 mx-auto mb-3" />
      <p className="text-white/40 text-sm mb-1">
        {filter === "unread" ? "Oxunmamış mesaj yoxdur." : "Hələ heç bir mesaj yoxdur."}
      </p>
      <p className="text-white/25 text-xs">
        {filter === "unread"
          ? "Bütün mesajlar oxunub."
          : "Sayt ziyarətçiləri contact formu dolduranda burada görünəcək."}
      </p>
    </div>
  );
}

/* ─── Contact Row ─── */
function ContactRow({
  item,
  onToggleRead,
  onDelete,
}: {
  item: any;
  onToggleRead: (id: number, isRead: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dateStr = new Date(item.createdAt ?? new Date()).toLocaleString("az-AZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`bg-[#111] border rounded-xl transition-all ${
        item.isRead ? "border-[#222]" : "border-[#C9A96E]/20 bg-[#C9A96E]/[0.02]"
      }`}
    >
      <div
        className="p-4 flex items-start gap-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0 mt-0.5">
          {item.isRead ? (
            <Mail className="w-4 h-4 text-white/20" />
          ) : (
            <div className="relative">
              <Mail className="w-4 h-4 text-[#C9A96E]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#C9A96E] rounded-full" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium truncate ${item.isRead ? "text-white/60" : "text-white"}`}>
              {item.name || "Adsız"}
            </span>
            <span className="text-white/30 text-xs truncate">{item.email}</span>
            {!item.isRead && (
              <span className="text-[10px] bg-[#C9A96E]/15 text-[#C9A96E] px-1.5 py-0.5 rounded font-medium">
                Yeni
              </span>
            )}
          </div>

          <p className="text-white/40 text-xs mt-1 truncate">
            {item.subject || "(Mövzu yoxdur)"}
          </p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-white/20 text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {dateStr}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/30" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/30" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="border-t border-[#222] pt-3 space-y-3">
            <div className="bg-[#0A0A0A] rounded-lg p-4">
              <p className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">
                {item.message || "(Mesaj boş)"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-xs h-8 ${
                  item.isRead
                    ? "text-white/40 hover:text-[#C9A96E]"
                    : "text-[#C9A96E] hover:text-[#D4B87E]"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleRead(item.id, !item.isRead);
                }}
              >
                {item.isRead ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 mr-1.5" /> Oxunmamış et
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Oxundu et
                  </>
                )}
              </Button>

              {!confirmDelete ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-white/30 hover:text-red-400 hover:bg-red-400/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Sil
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-white/40 text-xs">Əminsiniz?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-red-400 hover:bg-red-400/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    Bəli, sil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-white/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(false);
                    }}
                  >
                    Ləğv et
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   INBOX PAGE
   ═══════════════════════════════════════════ */

export default function InboxPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.mail.listContacts.useQuery(
    { filter, limit: 100, offset: 0 },
    { refetchInterval: 30000 }
  );

  const markRead = trpc.mail.markContactRead.useMutation({
    onSuccess: () => {
      utils.mail.listContacts.invalidate();
    },
  });

  const deleteContact = trpc.mail.deleteContact.useMutation({
    onSuccess: () => {
      utils.mail.listContacts.invalidate();
    },
  });

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter(
      (item) =>
        (item.name?.toLowerCase().includes(q) ?? false) ||
        item.email.toLowerCase().includes(q) ||
        (item.subject?.toLowerCase().includes(q) ?? false) ||
        (item.message?.toLowerCase().includes(q) ?? false)
    );
  }, [data, search]);

  return (
    <div className="min-w-0 max-w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Gələn Mesajlar</h1>
        <p className="text-white/50 text-xs">
          Sayt ziyarətçilərinin contact formundan göndərdiyi mesajlar.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/15 flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#C9A96E]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{data?.total ?? 0}</p>
          <p className="text-xs text-white/50 mt-0.5">Ümumi mesaj</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/15 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{data?.unread ?? 0}</p>
          <p className="text-xs text-white/50 mt-0.5">Oxunmamış</p>
        </div>
        <div className="bg-[#111] border border-[#222] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-400/15 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {Math.max(0, (data?.total ?? 0) - (data?.unread ?? 0))}
          </p>
          <p className="text-xs text-white/50 mt-0.5">Oxunmuş</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 bg-[#111] border border-[#222] rounded-lg p-1">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === "all"
                ? "bg-[#C9A96E]/15 text-[#C9A96E]"
                : "text-white/40 hover:text-white"
            }`}
          >
            Hamısı
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === "unread"
                ? "bg-[#C9A96E]/15 text-[#C9A96E]"
                : "text-white/40 hover:text-white"
            }`}
          >
            Oxunmamış
            {data?.unread ? (
              <span className="ml-1.5 bg-[#C9A96E] text-[#0A0A0A] text-[9px] px-1 py-0.5 rounded-full font-bold">
                {data.unread}
              </span>
            ) : null}
          </button>
        </div>

        <div className="relative flex-1 w-full sm:w-auto sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
          <Input
            placeholder="Axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-[#111] border-[#222] text-white text-sm h-9"
          />
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <InboxSkeleton />
      ) : filteredItems.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <ContactRow
              key={item.id}
              item={item}
              onToggleRead={(id, isRead) => markRead.mutate({ id, isRead })}
              onDelete={(id) => deleteContact.mutate({ id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
