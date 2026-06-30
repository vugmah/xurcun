import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminErrorBoundary from "@/components/AdminErrorBoundary";
import {
  LayoutDashboard, Globe, Image, LogOut, ChevronLeft,
  Mail, Megaphone, Menu, X, Settings, Bot,
  Lightbulb, MessageSquare, ShoppingBag, MapPin, QrCode, Coffee, Package, FileText, HelpCircle, Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type NavItem = { path: string; icon: React.ComponentType<{ className?: string }>; label: string };
const navGroups: { group: string; items: NavItem[] }[] = [
  { group: "Ümumi", items: [{ path: "/admin", icon: LayoutDashboard, label: "İdarə paneli" }] },
  { group: "Kataloq", items: [
    { path: "/admin/catalog", icon: ShoppingBag, label: "Kataloq" },
    { path: "/admin/media", icon: Image, label: "Şəkillər" },
  ] },
  { group: "Mağaza & QR", items: [
    { path: "/admin/branches", icon: MapPin, label: "Mağazalar" },
    { path: "/admin/qr", icon: QrCode, label: "QR Menyu" },
    { path: "/admin/cafe", icon: Coffee, label: "Kafe Menyu" },
  ] },
  { group: "Marketinq", items: [
    { path: "/admin/seo", icon: Globe, label: "SEO" },
    { path: "/admin/blog", icon: FileText, label: "Blog" },
    { path: "/admin/faq", icon: HelpCircle, label: "FAQ" },
    { path: "/admin/homepage-text", icon: Type, label: "Ana səhifə mətni" },
    { path: "/admin/google-ads", icon: Megaphone, label: "Google Ads" },
    { path: "/admin/popups", icon: Megaphone, label: "Kampaniyalar" },
    { path: "/admin/ai-auditor", icon: Bot, label: "AI Auditor" },
    { path: "/admin/ai-insights", icon: Lightbulb, label: "AI Insights" },
  ] },
  { group: "Ünsiyyət", items: [
    { path: "/admin/orders", icon: Package, label: "Sifarişlər" },
    { path: "/admin/inbox", icon: MessageSquare, label: "Gələn mesajlar" },
    { path: "/admin/mail-settings", icon: Mail, label: "Mail" },
  ] },
  { group: "Sistem", items: [{ path: "/admin/settings", icon: Settings, label: "Ayarlar" }] },
];

/** Section skeleton — shows inside content area only, never blocks sidebar */
function SectionSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="mb-6">
        <div className="h-6 w-32 bg-white/10 rounded mb-2" />
        <div className="h-3 w-48 bg-white/5 rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
            <div className="w-9 h-9 rounded-lg bg-white/5 mb-3" />
            <div className="h-5 w-12 bg-white/10 rounded mb-1" />
            <div className="h-3 w-16 bg-white/5 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-5">
        <div className="h-4 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-3 w-full bg-white/5 rounded" />
          <div className="h-3 w-3/4 bg-white/5 rounded" />
          <div className="h-3 w-1/2 bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated (after loading check completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <div dir="ltr" className="min-h-screen bg-[#14110e] text-white overflow-x-hidden">
      {/* ─── Mobile Overlay ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Mobile Header ─── */}
      <header className="md:hidden flex items-center gap-3 px-4 h-16 bg-[#100d0a] border-b border-white/10 sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Menyunu aç"
          className="text-white/60 hover:text-white p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-[#C2A05A] font-semibold text-sm tracking-wider uppercase">
          Xurcun Admin
        </h2>
      </header>

      {/* ─── Sidebar ─── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          w-[82vw] max-w-[320px] md:w-[260px]
          bg-[#100d0a] border-r border-white/10
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          shrink-0
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <img src="/brand/logo-gold.png" alt="Xurcun" className="h-8" />
            <span className="text-[#a89d88] text-[10px] uppercase tracking-widest">Admin</span>
          </Link>
          <button aria-label="Bağla" className="md:hidden text-white/50 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {navGroups.map((g) => (
            <div key={g.group} className="mb-1">
              <div className="px-3 pt-4 pb-1.5 text-[9px] uppercase tracking-[0.2em] text-white/50">{g.group}</div>
              {g.items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-[#C2A05A]/15 text-[#C2A05A] font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft className="w-4 h-4 shrink-0" />
            Siteye Don
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 text-white/60 hover:text-red-400 hover:bg-red-400/10" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Cixis
          </Button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex md:ml-[260px] min-w-0 max-w-full overflow-x-hidden">
        <main className="flex-1 min-w-0 max-w-full">
          <div className="w-full max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8 overflow-x-hidden">
            {isLoading ? (
              /* Show skeleton in content area only — sidebar is already visible */
              <SectionSkeleton />
            ) : !isAuthenticated ? (
              /* Not authenticated — will redirect via useEffect above */
              <div className="flex items-center justify-center py-20">
                <div className="text-[#a89d88] text-sm">Yonlendiriliyor...</div>
              </div>
            ) : (
              /* Authenticated — render the child route */
              <AdminErrorBoundary section={location.pathname.split("/").pop() || "Admin"}>
                <Outlet />
              </AdminErrorBoundary>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
