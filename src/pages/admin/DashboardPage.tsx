import { Link } from "react-router";
import {
  Utensils, Image, ImageOff, CheckCircle2, XCircle,
  MapPin, ArrowRightLeft, ExternalLink, RefreshCw,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  color = "gold",
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color?: "gold" | "green" | "red" | "blue" | "purple";
  sub?: string;
}) {
  const colorMap = {
    gold: "text-[#C9A96E] bg-[#C9A96E]/15",
    green: "text-green-400 bg-green-400/15",
    red: "text-red-400 bg-red-400/15",
    blue: "text-blue-400 bg-blue-400/15",
    purple: "text-purple-400 bg-purple-400/15",
  };

  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        {sub && (
          <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
            {sub}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50 mt-1">{label}</p>
    </div>
  );
}

/* ─── Quick Link ─── */
function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const isHash = href.startsWith("#/");
  const inner = (
    <div className="flex items-center gap-3 px-4 py-3 bg-[#111] border border-[#222] rounded-lg hover:border-[#C9A96E]/30 hover:bg-[#161616] transition-all group">
      <Icon className="w-4 h-4 text-[#C9A96E] shrink-0" />
      <span className="text-sm text-white/70 group-hover:text-white flex-1">{label}</span>
      <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-[#C9A96E] shrink-0" />
    </div>
  );

  if (isHash) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return <Link to={href}>{inner}</Link>;
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD — DB source of truth only
   ═══════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const utils = trpc.useUtils();
  const { data: s, isLoading, isError } = trpc.stats.getDashboard.useQuery(undefined, {
    retry: 3,
    retryDelay: 1000,
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const invalidate = () => {
    utils.stats.invalidate();
    utils.menu.getMenu.invalidate();
  };

  const branches = [
    { slug: "white-city", name: "Xurcun White City" },
    { slug: "seabreeze-marina", name: "Xurcun Seabreeze" },
  ];

  if (isLoading || !s) {
    return (
      <div className="max-w-6xl mx-auto min-w-0 max-w-full">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-white/50 text-xs">Xurcun White City — genel bakış</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#111] border border-[#222] rounded-xl p-5 animate-pulse">
              <div className="w-9 h-9 rounded-lg bg-white/5 mb-3" />
              <div className="h-5 w-12 bg-white/10 rounded mb-1" />
              <div className="h-3 w-16 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto min-w-0 max-w-full">
        <h1 className="text-xl font-bold text-white mb-4">Dashboard</h1>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm mb-3">Veriler yüklenemedi</p>
          <button
            onClick={invalidate}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-all"
          >
            Yeniden dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto min-w-0 max-w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-white/50 text-xs">Xurcun White City — genel bakış</p>
        </div>
        <button
          onClick={invalidate}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 border border-[#222] hover:border-[#C9A96E]/30 hover:text-[#C9A96E] transition-all"
          title="Verileri yenile"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Yenile
        </button>
      </div>

      {/* ═══ SECTION 1: Product Overview — all from DB ═══ */}
      <div className="mb-8">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Ürün Özeti</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard icon={Utensils} label="Toplam Ürün" value={s.menuItems} color="gold" />
          <StatCard icon={CheckCircle2} label="Aktif Ürün" value={s.activeItems} color="green" />
          <StatCard icon={XCircle} label="Pasif Ürün" value={s.inactiveItems} color="red" />
          <StatCard
            icon={Utensils}
            label="Kategori"
            value={s.menuCategories}
            color="blue"
            sub={`Y:${s.byTab.alacarte} İ:${s.byTab.beverages} Q:${s.byTab.shisha}`}
          />
          <StatCard icon={Image} label="Fotoğraflı" value={s.withPhotos} color="green" />
          <StatCard icon={ImageOff} label="Fotosuz" value={s.withoutPhotos} color="red" />
        </div>
      </div>

      {/* ═══ SECTION 2: Branches ═══ */}
      <div className="mb-8">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Şubeler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((b) => (
            <div key={b.slug} className="bg-[#111] border border-[#222] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span className="text-sm font-medium text-white">{b.name}</span>
              </div>
              <div className="flex gap-4">
                <QuickLink href={`#/menu/${b.slug}`} label="QR Menü" icon={ExternalLink} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ SECTION 3: Menu Breakdown Bars — from DB ═══ */}
      <div className="mb-8">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Menü Dağılımı</h2>
        <div className="bg-[#111] border border-[#222] rounded-xl p-5">
          <div className="space-y-3">
            {[
              { label: "A La Carte", count: s.byTab.alacarte, color: "bg-[#C9A96E]" },
              { label: "Beverages", count: s.byTab.beverages, color: "bg-[#8B7355]" },
              { label: "Shisha", count: s.byTab.shisha, color: "bg-[#6B5B3A]" },
            ].map((item) => {
              const total = s.menuItems || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{item.label}</span>
                    <span className="text-white/50">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ SECTION 4: Quick Links ═══ */}
      <div className="mb-8">
        <h2 className="text-xs text-white/40 uppercase tracking-wider mb-3">Hızlı Bağlantılar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickLink href="/" label="Ana Sayfa" icon={ExternalLink} />
          <QuickLink href="/admin/menu" label="Menü Yönetimi" icon={Utensils} />
          <QuickLink href="#/menu/white-city" label="White City QR Menü" icon={MapPin} />
          <QuickLink href="#/menu/seabreeze-marina" label="Seabreeze QR Menü" icon={MapPin} />
        </div>
      </div>
    </div>
  );
}
