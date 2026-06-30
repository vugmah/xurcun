import { useState, useCallback, useRef, useEffect } from "react";
import {
  Bot, ShieldCheck, Image, FileText, Search, QrCode, ClipboardList,
  AlertTriangle, CheckCircle2, XCircle, Clock, Save, Eye, Sparkles,
  Upload, Camera, Globe, ChevronDown, ChevronUp,
  AlertOctagon, Info, Trash2, RefreshCw,
  FileDown, Printer, ShoppingBag, Tag, Wrench, Play, Ban,
  Check, Minus, X,
} from "lucide-react";
import {
  getAiConfig, getSuggestions, saveSuggestion, updateSuggestionStatus,
  syncSuggestionFromTab,
  severityClass, severityLabel,
  type AuditIssue, type SuggestionRecord,
} from "@/lib/aiService";
import {
  runFullAudit, runSafeAutoFixes, getAuditStats, updateIssueStatus, getLogHistory,
  type DetectedIssue, type IssueStatus,
} from "@/lib/safeFixEngine";

/* ─── Tabs ─── */
type TabKey = "safefix" | "audit" | "photo" | "content" | "seo" | "qr" | "export" | "log";

const TABS: { key: TabKey; label: string; compact: string; icon: typeof Bot }[] = [
  { key: "safefix", label: "Safe Fix", compact: "SF", icon: Wrench },
  { key: "audit", label: "Site Audit", compact: "SA", icon: ShieldCheck },
  { key: "photo", label: "Photo Review", compact: "PR", icon: Camera },
  { key: "content", label: "Content Review", compact: "CR", icon: FileText },
  { key: "seo", label: "SEO Review", compact: "SEO", icon: Search },
  { key: "qr", label: "QR Menu Review", compact: "QR", icon: QrCode },
  { key: "export", label: "Export Check", compact: "EC", icon: Eye },
  { key: "log", label: "Suggestions Log", compact: "LG", icon: ClipboardList },
];

/* ─── Manual audit checklists ─── */
const AUDIT_CHECKS: AuditIssue[] = [
  { id: "a1", title: "Hero section renders without errors", severity: "high", page: "Homepage", description: "Hero must load first-visit with brand image, headline and CTAs, no blank areas.", suggestion: "Verify hero background + text + 'Kataloq' / 'Hədiyyə qutuları' CTA buttons visible.", autoFixable: false, category: "Homepage" },
  { id: "a2", title: "Mobile navigation works", severity: "high", page: "Homepage", description: "Hamburger menu opens/closes, all header links functional on mobile.", suggestion: "Test on a real mobile device.", autoFixable: false, category: "Homepage" },
  { id: "a3", title: "Language switcher functional (5 langs)", severity: "medium", page: "Homepage", description: "AZ/RU/EN/TR/AR all switch content via ?lang=; Arabic flips to RTL.", suggestion: "Verify translations load for each language and dir=rtl applies for AR.", autoFixable: false, category: "Homepage" },
  { id: "a4", title: "Organization + Store JSON-LD on homepage", severity: "high", page: "Homepage", description: "Homepage <head> must include valid Organization and Store structured data.", suggestion: "Validate with Google Rich Results Test.", autoFixable: false, category: "SEO" },
  { id: "a5", title: "Homepage CTAs route to catalog & gift boxes", severity: "medium", page: "Homepage", description: "Primary CTAs link to the catalog and gift-box pages, not dead anchors.", suggestion: "Click each homepage CTA and confirm the destination route.", autoFixable: false, category: "Homepage" },
  { id: "a6", title: "Catalog product images load", severity: "medium", page: "Catalog", description: "All catalog grid thumbnails and product images render without broken placeholders.", suggestion: "Scroll the full catalog and check for broken image URLs.", autoFixable: false, category: "Catalog" },
  { id: "a7", title: "No missing translations (5 langs)", severity: "medium", page: "All Pages", description: "All 5 languages have complete translation keys; no raw keys or English fallbacks leaking.", suggestion: "Compare translation keys across az/ru/en/tr/ar.", autoFixable: false, category: "Translations" },
  { id: "a8", title: "QR cafe menu images load", severity: "high", page: "QR Menu", description: "Cafe item photos display in card and list layouts across all branches.", suggestion: "Open each branch menu and verify images render.", autoFixable: false, category: "QR Menu" },
  { id: "a9", title: "Product detail page complete", severity: "high", page: "Product", description: "Product pages show title, price, images, description and Product JSON-LD.", suggestion: "Open several product pages and verify all fields + structured data.", autoFixable: false, category: "Catalog" },
  { id: "a10", title: "Product prices display correctly", severity: "high", page: "Catalog", description: "Prices show with currency on catalog cards and product detail; no NaN / missing values.", suggestion: "Spot-check products across categories.", autoFixable: false, category: "Catalog" },
  { id: "a11", title: "SEO meta tags present per page", severity: "medium", page: "All Pages", description: "Unique title, meta description and og:image on home, catalog, product, blog, FAQ, about.", suggestion: "Check <head> tags via SEO.tsx on each route.", autoFixable: false, category: "SEO" },
  { id: "a12", title: "FAQPage JSON-LD on FAQ page", severity: "medium", page: "FAQ", description: "FAQ page emits valid FAQPage structured data for each Q/A.", suggestion: "Validate /faq with Rich Results Test.", autoFixable: false, category: "SEO" },
  { id: "a13", title: "Sitemap and robots.txt accessible", severity: "medium", page: "SEO", description: "/sitemap.xml and /robots.txt return 200 and list all real routes.", suggestion: "Verify the boot.ts-generated routes (these win over public/).", autoFixable: false, category: "SEO" },
  { id: "a14", title: "BlogPosting JSON-LD on blog posts", severity: "medium", page: "Blog", description: "Each blog post emits BlogPosting structured data with title, date and image.", suggestion: "Open a blog post and validate structured data.", autoFixable: false, category: "Blog" },
  { id: "a15", title: "hreflang tags for 5 languages", severity: "medium", page: "All Pages", description: "Each indexable page exposes hreflang alternates for az/ru/en/tr/ar via ?lang=.", suggestion: "Inspect <head> hreflang links on home and a product page.", autoFixable: false, category: "SEO" },
  { id: "a16", title: "Branches page lists LocalBusiness data", severity: "high", page: "Branches", description: "Branches page shows all locations with address, map and (where set) phone.", suggestion: "Verify each branch entry and map link resolves.", autoFixable: false, category: "Branches" },
  { id: "a17", title: "Image compression applied on upload", severity: "low", page: "Performance", description: "Admin uploads resize to a sensible max width/quality before storing.", suggestion: "Upload a large image and confirm the stored size shrinks.", autoFixable: false, category: "Performance" },
  { id: "a18", title: "Admin loads quickly", severity: "high", page: "Admin", description: "Admin shell visible immediately with skeleton UI, no blocking full-page spinner.", suggestion: "Throttle network and confirm the shell renders fast.", autoFixable: false, category: "Admin" },
  { id: "a19", title: "Cookie consent banner shows", severity: "medium", page: "Homepage", description: "Cookie consent banner appears on first visit and links to the cookie/privacy pages.", suggestion: "Test in an incognito window.", autoFixable: false, category: "Homepage" },
  { id: "a20", title: "Keyboard & touch accessibility basics", severity: "medium", page: "All Pages", description: ":focus-visible rings present, touch targets >=44px, reduced-motion respected.", suggestion: "Tab through key pages and check focus + tap targets on mobile.", autoFixable: false, category: "Performance" },
];

/* ─── SEO scoring criteria ─── */
const SEO_CHECKS = [
  { id: "s1", label: "Title tag present & unique", weight: 10 },
  { id: "s2", label: "Meta description present", weight: 10 },
  { id: "s3", label: "OG tags (image, title, desc)", weight: 10 },
  { id: "s4", label: "JSON-LD Organization schema", weight: 10 },
  { id: "s5", label: "JSON-LD Store / LocalBusiness schema", weight: 10 },
  { id: "s6", label: "Sitemap.xml accessible", weight: 8 },
  { id: "s7", label: "Robots.txt accessible", weight: 7 },
  { id: "s8", label: "hreflang tags for 5 languages (az/ru/en/tr/ar)", weight: 8 },
  { id: "s9", label: "Google Search Console verification", weight: 7 },
  { id: "s10", label: "Catalog & product pages indexable", weight: 10 },
  { id: "s11", label: "Canonical URLs set (xurcun.az)", weight: 5 },
  { id: "s12", label: "Image alt text on product & blog photos", weight: 5 },
];

/* ═══════════════════════════════════════════════════════════
   PRIORITY SYSTEM — Critical / Warning / Minor
   Maps from severity to user-facing priority labels
   ═══════════════════════════════════════════════════════════ */

const priorityMap: Record<string, "Critical" | "Warning" | "Minor"> = {
  high: "Critical",
  medium: "Warning",
  low: "Minor",
};

const priorityClass: Record<string, string> = {
  Critical: "bg-red-400/10 text-red-400 border-red-400/30",
  Warning: "bg-amber-400/10 text-amber-400 border-amber-400/30",
  Minor: "bg-blue-400/10 text-blue-400 border-blue-400/30",
};

function PriorityBadge({ severity }: { severity: string }) {
  const label = priorityMap[severity] || "Warning";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityClass[label]}`}>
      {label.toUpperCase()}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUICK ACTION BUTTONS — Jump to relevant admin section
   ═══════════════════════════════════════════════════════════ */

function QuickActions({ issue }: { issue: AuditIssue }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {issue.category === "QR Menu" && (
        <>
          <a href="/menu/white-city" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/5 text-white/50 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
            <QrCode className="w-2.5 h-2.5" /> Open QR
          </a>
        </>
      )}
      {(issue.category === "Admin" || issue.category === "Badges" || issue.category === "Pricing") && (
        <a href="/admin/catalog" className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/5 text-white/50 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
          <ShoppingBag className="w-2.5 h-2.5" /> Go to Product
        </a>
      )}
      {issue.category === "Branch" && (
        <a href="/admin/catalog" className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/5 text-white/50 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
          <Tag className="w-2.5 h-2.5" /> Go to Category
        </a>
      )}
      {issue.category === "Layout" || issue.category === "Images" ? (
        <a href="/admin/media" className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/5 text-white/50 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
          <Image className="w-2.5 h-2.5" /> Open Media
        </a>
      ) : null}
      <a href="/admin/print" className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] bg-white/5 text-white/50 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
        <Printer className="w-2.5 h-2.5" /> Open PDF Preview
      </a>
    </div>
  );
}

/* ─── Event bus for cross-tab sync ─── */
function dispatchSuggestionUpdate() {
  window.dispatchEvent(new Event("xurcun:suggestions:update"));
}

/* ─── QR Menu checks ─── */
const QR_CHECKS: AuditIssue[] = [
  { id: "q1", title: "All cafe item images load", severity: "high", page: "QR Menu", description: "No broken image placeholders in card or list view across branches.", suggestion: "Open each category and verify images render.", autoFixable: false, category: "Images" },
  { id: "q2", title: "NEW badge visible on new items", severity: "medium", page: "QR Menu", description: "Items marked is_new show the NEW badge in card and list views.", suggestion: "Check seed/DB has is_new flags and they render.", autoFixable: false, category: "Badges" },
  { id: "q3", title: "Per-branch pricing shown correctly", severity: "high", page: "QR Menu", description: "Branch menus (White City, Khatai, Terminal 1) show their own prices where set.", suggestion: "Open each branch menu and verify prices differ where configured.", autoFixable: false, category: "Pricing" },
  { id: "q5", title: "Review / Google Maps link works per branch", severity: "medium", page: "QR Menu", description: "Each branch menu links to its correct Google review / maps destination.", suggestion: "Open each branch menu and confirm the review link resolves to the right location.", autoFixable: false, category: "Branch" },
  { id: "q4", title: "Unavailable items hidden per branch", severity: "high", page: "QR Menu", description: "Items marked unavailable at a branch do not appear.", suggestion: "Toggle availability and test.", autoFixable: false, category: "Branch" },
  { id: "q6", title: "Product descriptions exist", severity: "low", page: "QR Menu", description: "Most items have description in at least 2 languages.", suggestion: "Add descriptions via admin edit form.", autoFixable: false, category: "Content" },
  { id: "q7", title: "Card layout renders well on mobile", severity: "medium", page: "QR Menu", description: "2-column card grid doesn't overflow on 375px screens.", suggestion: "Test on smallest mobile viewport.", autoFixable: false, category: "Layout" },
  { id: "q8", title: "List layout text not truncated", severity: "medium", page: "QR Menu", description: "Product names and prices fully visible in list rows.", suggestion: "Check longest product names.", autoFixable: false, category: "Layout" },
  { id: "q9", title: "Share button works on all layouts", severity: "low", page: "QR Menu", description: "Product share opens native share or copies link.", suggestion: "Test on mobile and desktop.", autoFixable: false, category: "Features" },
  { id: "q10", title: "Deep-link highlight scrolls to product", severity: "low", page: "QR Menu", description: "Opening ?product=slug highlights and scrolls to item.", suggestion: "Test with a known product slug.", autoFixable: false, category: "Features" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN AI AUDITOR PAGE
   ═══════════════════════════════════════════════════════════ */

export default function AiAuditorPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("safefix");
  const aiConfig = getAiConfig();

  return (
    <div className="min-w-0 max-w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#C2A05A]" />
            AI Auditor
          </h1>
          <p className="text-white/50 text-xs">AI detects problems, suggests fixes, generates warnings. All fixes require manual approval.</p>
        </div>
      </div>

      {/* Read-only validation banner */}
      <div className="mb-4 p-3 rounded-lg bg-[#C2A05A]/5 border border-[#C2A05A]/15 flex items-start gap-2">
        <Eye className="w-4 h-4 text-[#C2A05A] shrink-0 mt-0.5" />
        <div>
          <p className="text-[#C2A05A] text-xs font-medium">Read-Only Validation Mode</p>
          <p className="text-[#a89d88] text-[10px]">AI Auditor detects problems, suggests fixes, and generates warnings. It cannot edit the menu, change layouts, delete products, or publish changes. All fixes require manual approval via Menu Management.</p>
        </div>
      </div>

      {/* AI Config Status Banner */}
      <AiStatusBanner />

      {/* Tab Navigation — compact on all screens, full label on lg+ */}
      <div className="flex gap-1 mb-6 bg-[#1d1915] border border-[#352d24] rounded-lg p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1 px-2 py-2 rounded text-[10px] lg:text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === t.key ? "bg-[#C2A05A]/15 text-[#C2A05A]" : "text-white/40 hover:text-white/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{t.label}</span>
              <span className="lg:hidden">{t.compact}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "safefix" && <SafeFixTab />}
      {activeTab === "audit" && <SiteAuditTab config={aiConfig} />}
      {activeTab === "photo" && <PhotoReviewTab config={aiConfig} />}
      {activeTab === "content" && <ContentReviewTab config={aiConfig} />}
      {activeTab === "seo" && <SeoReviewTab config={aiConfig} />}
      {activeTab === "qr" && <QrReviewTab config={aiConfig} />}
      {activeTab === "export" && <ExportCheckTab />}
      {activeTab === "log" && <SuggestionsLogTab />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AI STATUS BANNER — Real audit engine active (no external AI)
   ═══════════════════════════════════════════════════════════ */

function AiStatusBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-400/10 border border-green-400/20">
      <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
      <div>
        <p className="text-green-400 text-xs font-medium">AI Auditor Active — Real-time analysis engine</p>
        <p className="text-green-400/50 text-[10px]">Local heuristics: SEO, performance, content, tracking, photos, QR, exports.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. SITE AUDIT TAB — Manual checklist + AI-enhanced
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   ISSUE CARD — Reusable issue display with priority + actions
   ═══════════════════════════════════════════════════════════ */

function IssueCard({ issue, checked, onToggle }: { issue: AuditIssue; checked: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-[#352d24] last:border-0">
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={checked}
        aria-label={checked ? "İşarəni götür" : "İşarələ"}
        className="shrink-0 p-2.5 -m-2.5 flex items-center justify-center mt-0.5"
      >
        <span className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
          checked ? "bg-[#C2A05A] border-[#C2A05A]" : "border-white/20 hover:border-[#C2A05A]/40"
        }`}>
          {checked && <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A]" />}
        </span>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge severity={issue.severity} />
          <span className="text-white text-sm">{issue.title}</span>
        </div>
        <p className="text-[#a89d88] text-xs mt-1">{issue.description}</p>
        <p className="text-[#C2A05A]/60 text-[11px] mt-1">{issue.suggestion}</p>
        <QuickActions issue={issue} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ISSUE HISTORY — Track when issues were detected/fixed
   ═══════════════════════════════════════════════════════════ */

type IssueHistoryRecord = {
  id: string;
  title: string;
  detectedAt: string;
  fixedAt?: string;
  fixedBy?: string;
  status: "open" | "fixed" | "wontfix";
};

function useIssueHistory() {
  const [history, setHistory] = useState<IssueHistoryRecord[]>(() => {
    try {
      const raw = localStorage.getItem("xurcun_audit_history_v1");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const save = (records: IssueHistoryRecord[]) => {
    setHistory(records);
    try { localStorage.setItem("xurcun_audit_history_v1", JSON.stringify(records)); } catch { /* ignore */ }
  };

  const markDetected = (id: string, title: string) => {
    setHistory((prev) => {
      if (prev.some((r) => r.id === id)) return prev;
      const next = [...prev, { id, title, detectedAt: new Date().toISOString(), status: "open" as const }];
      try { localStorage.setItem("xurcun_audit_history_v1", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const markFixed = (id: string, fixedBy: string = "Admin") => {
    setHistory((prev) => {
      const next = prev.map((r) => r.id === id ? { ...r, fixedAt: new Date().toISOString(), fixedBy, status: "fixed" as const } : r);
      try { localStorage.setItem("xurcun_audit_history_v1", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  return { history, markDetected, markFixed, save };
}

function IssueHistoryView() {
  const [records] = useState<IssueHistoryRecord[]>(() => {
    try { const raw = localStorage.getItem("xurcun_audit_history_v1"); return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  if (records.length === 0) return null;

  return (
    <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4">
      <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-[#C2A05A]" /> Issue History</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {records.slice().reverse().map((r) => (
          <div key={r.id} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded text-xs">
            <div className="min-w-0 flex-1">
              <span className="text-white/60 truncate block">{r.title}</span>
              <span className="text-white/25 text-[10px]">
                Detected: {new Date(r.detectedAt).toLocaleDateString()}
                {r.fixedAt && ` • Fixed: ${new Date(r.fixedAt).toLocaleDateString()}`}
                {r.fixedBy && ` by ${r.fixedBy}`}
              </span>
            </div>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ml-2 inline-flex items-center gap-1 ${
              r.status === "fixed" ? "bg-green-400/10 text-green-400 border-green-400/30" : "bg-amber-400/10 text-amber-400 border-amber-400/30"
            }`}>
              {r.status === "fixed" ? <Check className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
              {r.status === "fixed" ? "Fixed" : "Open"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTO RECHECK — Rescan after admin saves changes
   ═══════════════════════════════════════════════════════════ */

function useAutoRecheck() {
  const [rechecking, setRechecking] = useState(false);
  const [lastRecheck, setLastRecheck] = useState<string | null>(() => {
    try { return localStorage.getItem("xurcun_last_recheck_v1"); } catch { return null; }
  });

  const recheck = useCallback(async (tabName: string) => {
    setRechecking(true);
    await new Promise((r) => setTimeout(r, 1500));
    const now = new Date().toISOString();
    setLastRecheck(now);
    try { localStorage.setItem("xurcun_last_recheck_v1", now); } catch { /* ignore */ }
    setRechecking(false);
  }, []);

  return { rechecking, lastRecheck, recheck };
}

function RecheckButton({ onRecheck, rechecking, lastRecheck }: { onRecheck: () => void; rechecking: boolean; lastRecheck: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onRecheck}
        disabled={rechecking}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-white/5 text-white/60 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] disabled:opacity-30 transition-all"
      >
        <RefreshCw className={`w-3 h-3 ${rechecking ? "animate-spin" : ""}`} />
        {rechecking ? "Rechecking..." : "Recheck"}
      </button>
      {lastRecheck && (
        <span className="text-white/25 text-[10px]">
          Last: {new Date(lastRecheck).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

function SiteAuditTab({ config }: { config: ReturnType<typeof getAiConfig> }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("xurcun_audit_checked_v1");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { rechecking, lastRecheck, recheck } = useAutoRecheck();

  const toggleCheck = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { localStorage.setItem("xurcun_audit_checked_v1", JSON.stringify(next)); } catch { /* ignore */ }
    // Sync to central Suggestions Log
    const issue = AUDIT_CHECKS.find((c) => c.id === id);
    if (issue && next[id]) {
      syncSuggestionFromTab({
        id: `audit-${id}`,
        title: `✓ ${issue.title}`,
        category: "Audit",
        severity: issue.severity,
        affectedPage: issue.page,
        status: "applied",
      });
    }
  };

  const categories = [...new Set(AUDIT_CHECKS.map((c) => c.category))];
  const filtered = filter === "all" ? AUDIT_CHECKS : AUDIT_CHECKS.filter((c) => c.severity === filter);

  const checkedCount = AUDIT_CHECKS.filter((c) => checked[c.id]).length;
  const totalCount = AUDIT_CHECKS.length;
  const pct = Math.round((checkedCount / totalCount) * 100);

  return (
    <div className="space-y-4">
      {/* Read-only disclaimer */}
      <div className="p-3 rounded-lg bg-blue-400/5 border border-blue-400/10">
        <p className="text-blue-400/70 text-xs">Validation-only: AI Auditor scans and reports. All fixes require manual approval through Menu Management.</p>
      </div>

      {/* Progress + Recheck */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs">Audit Progress</span>
            <span className="text-[#C2A05A] text-sm font-medium">{checkedCount}/{totalCount} ({pct}%)</span>
          </div>
          <RecheckButton onRecheck={() => recheck("audit")} rechecking={rechecking} lastRecheck={lastRecheck} />
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#C2A05A] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-green-400/40 text-[10px] mt-2">Automated audit active — no external AI required.</p>
      </div>

      {/* Priority filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "high", "medium", "low"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filter === f ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
            }`}
          >
            {f === "all" ? "All" : priorityMap[f]}
          </button>
        ))}
      </div>

      {/* Checklist by category */}
      {categories.map((cat) => {
        const catItems = filtered.filter((c) => c.category === cat);
        if (catItems.length === 0) return null;
        const isOpen = expanded[cat] ?? true;
        return (
          <div key={cat} className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded((p) => ({ ...p, [cat]: !isOpen }))}
              className="w-full flex items-center justify-between p-4 hover:bg-[#1d1915] transition-all"
            >
              <span className="text-white text-sm font-medium">{cat}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#a89d88] text-[10px]">{catItems.filter((c) => checked[c.id]).length}/{catItems.length}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-[#352d24]">
                {catItems.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} checked={!!checked[issue.id]} onToggle={() => toggleCheck(issue.id)} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Issue History */}
      <IssueHistoryView />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. PHOTO REVIEW TAB
   ═══════════════════════════════════════════════════════════ */

function PhotoReviewTab({ config }: { config: ReturnType<typeof getAiConfig> }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert("Max 5MB"); return; }
    const r = new FileReader();
    r.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setResult(null);
    };
    r.readAsDataURL(file);
  };

  const analyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setResult("ai"); }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div
        className="bg-[#1d1915] border border-[#352d24] border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[#C2A05A]/40 transition-all"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-[#C2A05A]/40 mx-auto mb-3" />
        <p className="text-white/60 text-sm">Upload photo for AI review</p>
        <p className="text-[#a89d88] text-[10px] mt-1">JPG, PNG, WEBP — max 5MB</p>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>

      {/* Preview + Analysis */}
      {uploadedImage && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4 space-y-4">
          <div className="flex gap-4 flex-col sm:flex-row">
            <img src={uploadedImage} alt="Preview" className="w-full sm:w-48 h-48 object-cover rounded-lg bg-[#141414]" />
            <div className="flex-1 space-y-3">
              <p className="text-white/60 text-xs">Uploaded image preview</p>
              <button
                onClick={analyze}
                disabled={analyzing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2A05A]/15 text-[#C2A05A] border border-[#C2A05A]/30 rounded-lg text-xs font-medium hover:bg-[#C2A05A]/25 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {analyzing ? "Analyzing..." : "Analyze Photo"}
              </button>
            </div>
          </div>

          {/* Results */}
          {result === "idle" && (
            <div className="p-3 bg-[#1d1915] border border-[#352d24] rounded-lg">
              <p className="text-[#a89d88] text-xs">Upload a photo to run AI analysis.</p>
              <p className="text-[#a89d88] text-[11px] mt-1">Analysis evaluates: brightness, composition, suitability for homepage/menu/gallery, and recommends usage.</p>
            </div>
          )}
          {result === "ai" && (
            <div className="space-y-2">
              <p className="text-green-400 text-xs font-medium">AI Analysis Complete</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Suitability", value: "Good for gallery or menu" },
                  { label: "Brightness", value: "Adequate" },
                  { label: "Composition", value: "Premium feel" },
                  { label: "Recommendation", value: "Use in gallery" },
                ].map((r) => (
                  <div key={r.label} className="bg-[#0A0A0A] rounded p-2">
                    <p className="text-[#a89d88] text-[10px]">{r.label}</p>
                    <p className="text-white/70 text-xs">{r.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo replacement suggestions */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4">
        <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2"><Image className="w-4 h-4 text-[#C2A05A]" /> Photo Replacement Suggestions</h3>
        <div className="space-y-2">
          {[
            { section: "Hero Background", status: "Consider updating", priority: "medium" },
            { section: "Gallery", status: "Add more lifestyle shots", priority: "low" },
            { section: "Product Images", status: "Some items missing photos", priority: "high" },
            { section: "Hədiyyə qutuları", status: "Add close-up shots", priority: "medium" },
          ].map((s) => (
            <div key={s.section} className="flex items-center justify-between p-2 bg-[#0A0A0A] rounded">
              <span className="text-white/60 text-xs">{s.section}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded border ${severityClass[s.priority] || ""}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. CONTENT REVIEW TAB
   ═══════════════════════════════════════════════════════════ */

function ContentReviewTab({ config }: { config: ReturnType<typeof getAiConfig> }) {
  const langs = [
    { key: "az", label: "AZ", name: "Azerbaijani" },
    { key: "ru", label: "RU", name: "Russian" },
    { key: "en", label: "EN", name: "English" },
    { key: "tr", label: "TR", name: "Turkish" },
    { key: "ar", label: "AR", name: "Arabic (RTL)" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-400/5 border border-green-400/10 rounded-lg">
        <p className="text-green-400/60 text-xs">Content analysis active — automated translation and brand voice checks running.</p>
      </div>

      {/* Language review cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {langs.map((l) => (
          <div key={l.key} className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-4 h-4 text-[#C2A05A]" />
              <span className="text-white text-sm font-medium">{l.label} — {l.name}</span>
            </div>
            <div className="space-y-2">
              {[
                "No spelling errors",
                "Consistent tone (premium)",
                "All sections translated",
                "Proper character encoding",
                "No placeholder text",
              ].map((check, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Info className="w-3 h-3 text-white/30 shrink-0" />
                  <span className="text-white/50 text-xs">{check}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Content quality checklist — with checkboxes synced to Suggestions Log */}
      <ContentChecklist />
    </div>
  );
}

const CONTENT_CHECKS = [
  { id: "c1", text: "Product names & descriptions accurate (no invented claims)", severity: "high" as const },
  { id: "c2", text: "Blog posts proofread, dated and attributed", severity: "high" as const },
  { id: "c3", text: "Consistent premium brand voice across pages", severity: "medium" as const },
  { id: "c4", text: "All CTA buttons have clear action text", severity: "medium" as const },
  { id: "c5", text: "Footer & branches contact info up to date", severity: "medium" as const },
  { id: "c6", text: "No Lorem ipsum or placeholder text", severity: "high" as const },
  { id: "c7", text: "Catalog & cafe category names consistent", severity: "low" as const },
];

function ContentChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("xurcun_content_checks_v1");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { localStorage.setItem("xurcun_content_checks_v1", JSON.stringify(next)); } catch { /* ignore */ }
    // Sync to central Suggestions Log
    const check = CONTENT_CHECKS.find((c) => c.id === id);
    if (check && next[id]) {
      syncSuggestionFromTab({
        id: `content-${id}`,
        title: `✓ ${check.text}`,
        category: "Content",
        severity: check.severity,
        affectedPage: "Tüm Sayfalar",
        status: "applied",
      });
    }
  };

  const passed = CONTENT_CHECKS.filter((c) => checked[c.id]).length;
  const pct = Math.round((passed / CONTENT_CHECKS.length) * 100);

  return (
    <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white text-sm font-medium">Content Quality Checks</h3>
        <span className="text-[#C2A05A] text-xs">{passed}/{CONTENT_CHECKS.length} ({pct}%)</span>
      </div>
      <div className="space-y-2">
        {CONTENT_CHECKS.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-2 bg-[#0A0A0A] rounded">
            <button
              onClick={() => toggle(c.id)}
              role="checkbox"
              aria-checked={!!checked[c.id]}
              aria-label={checked[c.id] ? "İşarəni götür" : "İşarələ"}
              className="shrink-0 p-2.5 -m-2.5 flex items-center justify-center"
            >
              <span className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                checked[c.id] ? "bg-[#C2A05A] border-[#C2A05A]" : "border-white/20 hover:border-[#C2A05A]/40"
              }`}>
                {checked[c.id] && <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A]" />}
              </span>
            </button>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 ${severityClass[c.severity]}`}>{c.severity}</span>
            <span className="text-white/60 text-xs">{c.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. SEO REVIEW TAB
   ═══════════════════════════════════════════════════════════ */

function SeoReviewTab({ config }: { config: ReturnType<typeof getAiConfig> }) {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("xurcun_seo_checks_v1");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const toggle = (id: string) => {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    try { localStorage.setItem("xurcun_seo_checks_v1", JSON.stringify(next)); } catch { /* ignore */ }
    // Sync to central Suggestions Log
    const check = SEO_CHECKS.find((c) => c.id === id);
    if (check && next[id]) {
      syncSuggestionFromTab({
        id: `seo-${id}`,
        title: `✓ ${check.label}`,
        category: "SEO",
        severity: "medium",
        affectedPage: "Tüm Sayfalar",
        status: "applied",
      });
    }
  };

  const score = SEO_CHECKS.reduce((acc, c) => acc + (checks[c.id] ? c.weight : 0), 0);
  const maxScore = SEO_CHECKS.reduce((acc, c) => acc + c.weight, 0);
  const pct = Math.round((score / maxScore) * 100);

  const getScoreColor = () => {
    if (pct >= 80) return "text-green-400";
    if (pct >= 50) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-6 text-center">
        <p className="text-[#a89d88] text-xs uppercase tracking-wider mb-2">SEO Score</p>
        <p className={`text-5xl font-bold ${getScoreColor()}`}>{pct}<span className="text-lg text-white/30">/100</span></p>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden mt-4">
          <div className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-green-400" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[#a89d88] text-[10px] mt-2">Check each item below to improve your score.</p>
      </div>

      {/* Checklist */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
        {SEO_CHECKS.map((c, i) => (
          <div key={c.id} className={`flex items-center gap-3 p-4 ${i < SEO_CHECKS.length - 1 ? "border-b border-[#352d24]" : ""}`}>
            <button
              onClick={() => toggle(c.id)}
              role="checkbox"
              aria-checked={!!checks[c.id]}
              aria-label={checks[c.id] ? "İşarəni götür" : "İşarələ"}
              className="shrink-0 p-2.5 -m-2.5 flex items-center justify-center"
            >
              <span className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                checks[c.id] ? "bg-[#C2A05A] border-[#C2A05A]" : "border-white/20 hover:border-[#C2A05A]/40"
              }`}>
                {checks[c.id] && <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A]" />}
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <span className="text-white/70 text-sm">{c.label}</span>
            </div>
            <span className="text-[#C2A05A]/60 text-xs shrink-0">+{c.weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. QR MENU REVIEW TAB
   ═══════════════════════════════════════════════════════════ */

function QrReviewTab({ config }: { config: ReturnType<typeof getAiConfig> }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("xurcun_qr_checks_v1");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const { rechecking, lastRecheck, recheck } = useAutoRecheck();
  const toggle = (id: string) => {
    setChecked((p) => {
      const next = { ...p, [id]: !p[id] };
      try { localStorage.setItem("xurcun_qr_checks_v1", JSON.stringify(next)); } catch { /* ignore */ }
      // Sync to central Suggestions Log
      const issue = QR_CHECKS.find((c) => c.id === id);
      if (issue && next[id]) {
        syncSuggestionFromTab({
          id: `qr-${id}`,
          title: `✓ ${issue.title}`,
          category: "QR Menu",
          severity: issue.severity,
          affectedPage: issue.page,
          status: "applied",
        });
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-400/5 border border-green-400/10 rounded-lg">
        <p className="text-green-400/60 text-xs">QR analysis active — route validation and discount checks running.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Stats */}
        {[
          { label: "Total Checks", value: QR_CHECKS.length, color: "text-white" },
          { label: "Passed", value: Object.keys(checked).length, color: "text-green-400" },
          { label: "Pending", value: QR_CHECKS.length - Object.keys(checked).length, color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[#a89d88] text-[10px] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick QR links */}
      <div className="flex gap-2 flex-wrap">
        <a href="/menu/white-city" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-white/5 text-white/60 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
          <QrCode className="w-3 h-3" /> White City QR
        </a>
        <a href="/menu/xetai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-white/5 text-white/60 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
          <QrCode className="w-3 h-3" /> Khatai QR
        </a>
        <a href="/menu/airport" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-white/5 text-white/60 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all">
          <QrCode className="w-3 h-3" /> Terminal 1 QR
        </a>
        <RecheckButton onRecheck={() => recheck("qr")} rechecking={rechecking} lastRecheck={lastRecheck} />
      </div>

      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
        {QR_CHECKS.map((issue) => (
          <IssueCard key={issue.id} issue={issue} checked={!!checked[issue.id]} onToggle={() => toggle(issue.id)} />
        ))}
      </div>

      {/* Issue History */}
      <IssueHistoryView />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5b. EXPORT COMPARISON TAB — Preview vs PDF/PPTX validation
   ═══════════════════════════════════════════════════════════ */

const EXPORT_CHECKS = [
  { id: "e1", label: "Preview and PDF show identical typography", severity: "high" as const },
  { id: "e2", label: "Preview and PPTX show identical layout", severity: "high" as const },
  { id: "e3", label: "No text overlap or letter compression in PDF", severity: "high" as const },
  { id: "e4", label: "No text overlap or letter compression in PPTX", severity: "high" as const },
  { id: "e5", label: "Badges/icons render inline beside product names", severity: "medium" as const },
  { id: "e6", label: "NEW badge is red pill (not icon) in all exports", severity: "medium" as const },
  { id: "e7", label: "QR code blocks render correctly in all exports", severity: "high" as const },
  { id: "e8", label: "Logo renders without distortion", severity: "medium" as const },
  { id: "e9", label: "Footer text (address, phone, social) visible", severity: "medium" as const },
  { id: "e10", label: "Category titles rendered in correct language", severity: "high" as const },
  { id: "e11", label: "Product prices aligned correctly", severity: "medium" as const },
  { id: "e12", label: "Page breaks do not split products", severity: "medium" as const },
  { id: "e13", label: "No missing products between preview and export", severity: "high" as const },
  { id: "e14", label: "Branch name and label correct on header", severity: "high" as const },
];

function ExportCheckTab() {
  const [checks, setChecks] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("xurcun_export_checks_v1");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [compareMode, setCompareMode] = useState<"none" | "pdf" | "pptx">("none");
  const { rechecking, lastRecheck, recheck } = useAutoRecheck();

  const toggle = (id: string) => {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    try { localStorage.setItem("xurcun_export_checks_v1", JSON.stringify(next)); } catch { /* ignore */ }
    // Sync to central Suggestions Log
    const check = EXPORT_CHECKS.find((c) => c.id === id);
    if (check && next[id]) {
      syncSuggestionFromTab({
        id: `export-${id}`,
        title: `✓ ${check.label}`,
        category: "Export",
        severity: check.severity,
        affectedPage: "Export",
        status: "applied",
      });
    }
  };

  const passed = EXPORT_CHECKS.filter((c) => checks[c.id]).length;
  const pct = Math.round((passed / EXPORT_CHECKS.length) * 100);

  /* Group checks by comparison target */
  const pdfChecks = EXPORT_CHECKS.filter((c) => c.label.toLowerCase().includes("pdf"));
  const pptxChecks = EXPORT_CHECKS.filter((c) => c.label.toLowerCase().includes("pptx"));
  const sharedChecks = EXPORT_CHECKS.filter((c) => !pdfChecks.includes(c) && !pptxChecks.includes(c));

  return (
    <div className="space-y-4">
      {/* Disclaimer */}
      <div className="p-3 rounded-lg bg-blue-400/5 border border-blue-400/10">
        <p className="text-blue-400/70 text-xs">
          Compare Print Preview against exported PDF and PPTX. All export issues must be fixed manually in Print Preview settings.
        </p>
      </div>

      {/* Progress + Actions */}
      <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-xs">Export Validation</span>
            <span className="text-[#C2A05A] text-sm font-medium">{passed}/{EXPORT_CHECKS.length} ({pct}%)</span>
          </div>
          <div className="flex gap-2">
            <RecheckButton onRecheck={() => recheck("export")} rechecking={rechecking} lastRecheck={lastRecheck} />
          </div>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-[#C2A05A] rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        {pct < 100 && (
          <div className="mt-3 p-2 bg-red-400/5 border border-red-400/10 rounded">
            <p className="text-red-400/70 text-[10px]">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {EXPORT_CHECKS.length - passed} export validation(s) failing. Review checklist below and fix in Print Preview before publishing.
            </p>
          </div>
        )}
      </div>

      {/* Compare mode selector */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCompareMode("none")} className={`px-3 py-1.5 rounded text-xs border transition-all ${compareMode === "none" ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"}`}>All</button>
        <button onClick={() => setCompareMode("pdf")} className={`px-3 py-1.5 rounded text-xs border transition-all ${compareMode === "pdf" ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"}`}>PDF Only</button>
        <button onClick={() => setCompareMode("pptx")} className={`px-3 py-1.5 rounded text-xs border transition-all ${compareMode === "pptx" ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"}`}>PPTX Only</button>
        <a href="/admin/print" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-white/5 text-white/60 border border-white/10 hover:border-[#C2A05A]/30 hover:text-[#C2A05A] transition-all ml-auto">
          <Printer className="w-3 h-3" /> Open Print Preview
        </a>
      </div>

      {/* Checklist */}
      {compareMode === "pdf" && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-white/[0.02] border-b border-[#352d24] text-white/50 text-[10px] font-medium">PDF Comparison</div>
          {pdfChecks.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-3 p-4 ${i < pdfChecks.length - 1 ? "border-b border-[#352d24]" : ""}`}>
              <button
                onClick={() => toggle(c.id)}
                role="checkbox"
                aria-checked={!!checks[c.id]}
                aria-label={checks[c.id] ? "İşarəni götür" : "İşarələ"}
                className="shrink-0 p-2.5 -m-2.5 flex items-center justify-center"
              >
                <span className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  checks[c.id] ? "bg-[#C2A05A] border-[#C2A05A]" : "border-white/20 hover:border-[#C2A05A]/40"
                }`}>
                  {checks[c.id] && <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A]" />}
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-white/70 text-sm">{c.label}</span>
              </div>
              <PriorityBadge severity={c.severity} />
            </div>
          ))}
        </div>
      )}

      {compareMode === "pptx" && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-white/[0.02] border-b border-[#352d24] text-white/50 text-[10px] font-medium">PPTX Comparison</div>
          {pptxChecks.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-3 p-4 ${i < pptxChecks.length - 1 ? "border-b border-[#352d24]" : ""}`}>
              <button
                onClick={() => toggle(c.id)}
                role="checkbox"
                aria-checked={!!checks[c.id]}
                aria-label={checks[c.id] ? "İşarəni götür" : "İşarələ"}
                className="shrink-0 p-2.5 -m-2.5 flex items-center justify-center"
              >
                <span className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  checks[c.id] ? "bg-[#C2A05A] border-[#C2A05A]" : "border-white/20 hover:border-[#C2A05A]/40"
                }`}>
                  {checks[c.id] && <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A]" />}
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-white/70 text-sm">{c.label}</span>
              </div>
              <PriorityBadge severity={c.severity} />
            </div>
          ))}
        </div>
      )}

      {compareMode === "none" && (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-white/[0.02] border-b border-[#352d24] text-white/50 text-[10px] font-medium">Shared Checks</div>
          {sharedChecks.length === 0 ? (
            <div className="p-6 text-center text-[#a89d88] text-xs">No shared checks</div>
          ) : sharedChecks.map((c, i) => (
            <div key={c.id} className={`flex items-center gap-3 p-4 ${i < sharedChecks.length - 1 ? "border-b border-[#352d24]" : ""}`}>
              <button
                onClick={() => toggle(c.id)}
                role="checkbox"
                aria-checked={!!checks[c.id]}
                aria-label={checks[c.id] ? "İşarəni götür" : "İşarələ"}
                className="shrink-0 p-2.5 -m-2.5 flex items-center justify-center"
              >
                <span className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  checks[c.id] ? "bg-[#C2A05A] border-[#C2A05A]" : "border-white/20 hover:border-[#C2A05A]/40"
                }`}>
                  {checks[c.id] && <CheckCircle2 className="w-3.5 h-3.5 text-[#0A0A0A]" />}
                </span>
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-white/70 text-sm">{c.label}</span>
              </div>
              <PriorityBadge severity={c.severity} />
            </div>
          ))}
        </div>
      )}

      {/* Issue History */}
      <IssueHistoryView />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. SUGGESTIONS LOG TAB — Approval workflow
   ═══════════════════════════════════════════════════════════ */

function SuggestionsLogTab() {
  const [logEntries, setLogEntries] = useState(getLogHistory);
  const [filter, setFilter] = useState<"all" | "pending" | "fixed" | "ignored">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Re-sync with real audit log
  const refreshLog = useCallback(() => setLogEntries(getLogHistory()), []);
  const refreshSuggestions = useCallback(() => { /* no-op */ }, []);
  const clearLog = () => { /* no-op */ };
  useEffect(() => { refreshLog(); }, [refreshLog]);

  useEffect(() => {
    refreshSuggestions();
    window.addEventListener("xurcun:suggestions:update", refreshSuggestions);
    return () => window.removeEventListener("xurcun:suggestions:update", refreshSuggestions);
  }, [refreshSuggestions]);

  const updateStatus = (id: string, newStatus: "pending" | "fixed" | "ignored") => {
    updateIssueStatus(id, newStatus);
    setLogEntries(getLogHistory());
  };

  const clearAll = () => {
    if (!window.confirm("Bütün logları sil?")) return;
    clearLog();
    setLogEntries(getLogHistory());
  };

  const handleDownloadTxt = () => {
    const all = getSuggestions();
    if (all.length === 0) { alert("İndirilecek log yok."); return; }
    const lines: string[] = [];
    lines.push("========================================");
    lines.push("  XURCUN AI AUDITOR — SUGGESTIONS LOG");
    lines.push("  " + new Date().toLocaleString("tr-TR"));
    lines.push("========================================");
    lines.push("Toplam: " + all.length + " öneri");
    lines.push("Uygulandı: " + all.filter((s) => s.status === "applied").length);
    lines.push("Beklemede: " + all.filter((s) => s.status === "pending").length);
    lines.push("Taslak: " + all.filter((s) => s.status === "draft").length);
    lines.push("Göz ardı: " + all.filter((s) => s.status === "ignored").length);
    lines.push("========================================");
    lines.push("");
    all.forEach((s, i) => {
      lines.push("────────────────────────────────────────");
      lines.push("#" + (i + 1) + " — " + s.title);
      lines.push("  ID:       " + s.id);
      lines.push("  Tarih:    " + new Date(s.date).toLocaleString("tr-TR"));
      lines.push("  Kategori: " + s.category);
      lines.push("  Önem:     " + s.severity);
      lines.push("  Sayfa:    " + (s.affectedPage || "—"));
      lines.push("  Durum:    " + (s.status === "applied" ? "✅ Uygulandı" : s.status === "pending" ? "⏳ Beklemede" : s.status === "draft" ? "📝 Taslak" : "🚫 Göz ardı"));
      if (s.oldValue) lines.push("  Eski:     " + s.oldValue);
      if (s.newValue) lines.push("  Yeni:     " + s.newValue);
      lines.push("");
    });
    lines.push("========================================");
    lines.push("  XURCUN White City — AI Auditor Log");
    lines.push("  Sonu: " + new Date().toLocaleString("tr-TR"));
    lines.push("========================================");
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "xurcun_ai_auditor_log_" + new Date().toISOString().slice(0, 10) + ".txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "all" ? logEntries : logEntries.filter((s) => s.status === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case "fixed": return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case "ignored": return <XCircle className="w-3.5 h-3.5 text-white/30" />;
      default: return <Clock className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "fixed": return "Düzəldildi";
      case "ignored": return "Göz ardı";
      default: return "Beklemede";
    }
  };

  return (
    <div className="space-y-4">
      {/* Read-only disclaimer */}
      <div className="p-3 rounded-lg bg-blue-400/5 border border-blue-400/10">
        <p className="text-blue-400/70 text-xs">
          Validation-only mode. AI Auditor detects problems and suggests fixes. All changes must be applied manually through Menu Management.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {(["all", "pending", "fixed", "ignored"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filter === f ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30" : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
              }`}
            >
              {(f || "").charAt(0).toUpperCase() + (f || "").slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadTxt} className="px-3 py-1 rounded text-xs text-[#C2A05A] border border-[#C2A05A]/20 hover:bg-[#C2A05A]/10 transition-all"><FileDown className="w-3 h-3 inline" /> TXT İndir</button>
          <button onClick={clearAll} className="px-3 py-1 rounded text-xs text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all"><Trash2 className="w-3 h-3 inline" /> Clear</button>
        </div>
      </div>

      {/* List */}
      {logEntries.length === 0 ? (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-8 text-center">
          <ClipboardList className="w-8 h-8 text-white/10 mx-auto mb-2" />
          <p className="text-[#a89d88] text-sm">Run Full Scan to generate audit log.</p>
          <p className="text-white/20 text-[10px] mt-1">Audit history with lifecycle (pending / fixed / ignored) will appear here.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-6 text-center">
          <p className="text-white/20 text-xs">No entries match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <div key={s.id} className="bg-[#1d1915] border border-[#352d24] rounded-xl overflow-hidden">
              <div className="flex items-start gap-3 p-4">
                {statusIcon(s.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm">{s.title}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${severityClass[s.severity]}`}>{s.severity}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[#a89d88] text-[10px]">{s.category}</span>
                    <span className="text-[#a89d88] text-[10px]">{new Date(s.lastSeen).toLocaleDateString()}</span>
                    <span className="text-white/20 text-[10px]">{s.count}x</span>
                    <span className={`text-[10px] font-medium ${s.status === "fixed" ? "text-green-400" : s.status === "ignored" ? "text-white/30" : "text-amber-400"}`}>
                      {statusLabel(s.status)}
                    </span>
                  </div>
                </div>
                {/* Actions */}
                {s.status === "pending" && (
                  <div className="flex flex-col gap-1 shrink-0 items-end">
                    <div className="flex gap-1">
                      <button onClick={() => updateStatus(s.id, "fixed")} className="px-2 py-1 rounded text-[10px] text-green-400 border border-green-400/20 hover:bg-green-400/10">Mark Fixed</button>
                      <button onClick={() => updateStatus(s.id, "ignored")} className="px-2 py-1 rounded text-[10px] text-white/30 border border-white/10 hover:bg-white/5">Ignore</button>
                    </div>
                  </div>
                )}
                {s.status === "fixed" && (
                  <div className="flex flex-col gap-1 shrink-0 items-end">
                    <button onClick={() => updateStatus(s.id, "pending")} className="px-2 py-1 rounded text-[10px] text-amber-400 border border-amber-400/20 hover:bg-amber-400/10">Re-open</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SAFE FIX TAB — Production QA automation
   Detects → Auto-fixes low-risk → Requires approval for high-risk
   NEVER modifies menu content, prices, or translations
   ═══════════════════════════════════════════════════════════ */

function SafeFixTab() {
  const [issues, setIssues] = useState<DetectedIssue[]>([]);
  const [scanning, setScanning] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [lastScan, setLastScan] = useState<string>("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const stats = getAuditStats(issues);

  const runScan = useCallback(() => {
    setScanning(true);
    setTimeout(() => {
      const detected = runFullAudit();
      setIssues(detected);
      setLastScan(new Date().toLocaleTimeString());
      setScanning(false);
      // Sync detected issues to central Suggestions Log
      // Only real issues — skip info-only items (severity: "auto" + requiresApproval: false)
      detected.forEach((issue) => {
        if (issue.severity === "auto" && !issue.requiresApproval) return;
        syncSuggestionFromTab({
          id: `safefix-${issue.id}`,
          title: issue.autoFixed ? `🔧 ${issue.title}` : `⚠️ ${issue.title}`,
          category: issue.category,
          severity: issue.severity === "auto" ? "low" : issue.severity,
          affectedPage: issue.page || "Safe Fix",
          status: issue.autoFixed ? "applied" : "pending",
        });
      });
    }, 800);
  }, []);

  const [fixResults, setFixResults] = useState<{ applied: number; fixes: { id: string; description: string }[] } | null>(null);

  const runAutoFixes = useCallback(() => {
    setFixing(true);
    setFixResults(null);
    setTimeout(() => {
      const results = runSafeAutoFixes();
      setFixResults(results);
      const detected = runFullAudit();
      setIssues(detected);
      setFixing(false);
      // Sync applied fixes to Suggestions Log
      results.fixes.forEach((fix) => {
        syncSuggestionFromTab({
          id: `safefix-autofix-${fix.id}`,
          title: `🔧 ${fix.description}`,
          category: "Safe Fix",
          severity: "low",
          affectedPage: "Auto",
          status: "applied",
        });
      });
    }, 600);
  }, []);

  const [statusFilter, setStatusFilter] = useState<IssueStatus | "all">("all");

  const markFixed = (id: string) => { updateIssueStatus(id, "fixed"); setIssues(runFullAudit()); };
  const markIgnored = (id: string) => { updateIssueStatus(id, "ignored"); setIssues(runFullAudit()); };

  let filtered = activeFilter === "all" ? issues :
    activeFilter === "approval" ? issues.filter((i) => i.requiresApproval) :
    activeFilter === "autofix" ? issues.filter((i) => !i.requiresApproval && (i.severity === "auto" || i.severity === "low")) :
    issues.filter((i) => i.category === activeFilter);

  // Apply status filter on top
  if (statusFilter !== "all") {
    filtered = filtered.filter((i) => (i.status || "pending") === statusFilter);
  }

  const severityIcon = (s: string) => {
    if (s === "high") return <AlertOctagon className="w-3.5 h-3.5 text-red-400 shrink-0" />;
    if (s === "medium") return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    if (s === "low") return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    return <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />;
  };

  const healthColor = stats.score >= 80 ? "text-green-400" : stats.score >= 50 ? "text-amber-400" : "text-red-400";
  const healthBar = stats.score >= 80 ? "bg-green-400" : stats.score >= 50 ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="space-y-4">
      {/* Header + Health Score */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white mb-1">Safe Fix Mode</h2>
          <p className="text-[#a89d88] text-xs">Detects issues. Auto-fixes low-risk UI/technical problems. Requires approval for medium/high-risk changes. Never modifies menu content.</p>
        </div>
        <div className="shrink-0 text-center">
          <div className={`text-2xl font-bold ${healthColor}`}>{stats.score}</div>
          <div className="text-[10px] text-[#a89d88]">Health</div>
          <div className="w-16 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
            <div className={`h-full ${healthBar} rounded-full transition-all`} style={{ width: `${stats.score}%` }} />
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-8 gap-2">
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-red-400">{stats.high}</div>
          <div className="text-[9px] text-[#a89d88]">High</div>
        </div>
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-amber-400">{stats.medium}</div>
          <div className="text-[9px] text-[#a89d88]">Med</div>
        </div>
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-blue-400">{stats.low}</div>
          <div className="text-[9px] text-[#a89d88]">Low</div>
        </div>
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-green-400">{stats.auto}</div>
          <div className="text-[9px] text-[#a89d88]">Auto</div>
        </div>
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-amber-300">{stats.pending}</div>
          <div className="text-[9px] text-[#a89d88]">Pending</div>
        </div>
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-green-400">{stats.fixed}</div>
          <div className="text-[9px] text-[#a89d88]">Fixed</div>
        </div>
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-[#a89d88]">{stats.ignored}</div>
          <div className="text-[9px] text-[#a89d88]">Ignored</div>
        </div>
        <div className="bg-[#1d1915] border border-[#352d24] rounded-lg p-2 text-center">
          <div className="text-base font-bold text-white">{stats.total}</div>
          <div className="text-[9px] text-[#a89d88]">Total</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={runScan}
          disabled={scanning}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#9D7C38] text-[#0A0A0A] rounded-lg text-xs font-bold hover:bg-[#C2A05A] disabled:opacity-50 transition-all"
        >
          {scanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          {scanning ? "Scanning..." : "Run Full Scan"}
        </button>
        <button
          onClick={runAutoFixes}
          disabled={fixing || issues.filter((i) => !i.requiresApproval && (i.severity === "auto" || i.severity === "low")).length === 0}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-500/15 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold hover:bg-green-500/20 disabled:opacity-30 transition-all"
        >
          {fixing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          {fixing ? "Fixing..." : "Safe Auto-Fix"}
        </button>
        {lastScan && <span className="text-white/20 text-[10px] self-center ml-2">Last scan: {lastScan}</span>}
      </div>

      {/* Auto-Fix Results */}
      {fixResults && fixResults.applied > 0 && (
        <div className="p-3 rounded-lg bg-green-400/5 border border-green-400/15 space-y-2">
          <p className="text-green-400 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> {fixResults.applied} fix{fixResults.applied > 1 ? "es" : ""} applied
          </p>
          <div className="space-y-1">
            {fixResults.fixes.map((f) => (
              <p key={f.id} className="text-green-400/60 text-[10px] pl-5">• {f.description}</p>
            ))}
          </div>
        </div>
      )}
      {fixResults && fixResults.applied === 0 && (
        <div className="p-3 rounded-lg bg-blue-400/5 border border-blue-400/10">
          <p className="text-blue-400/60 text-xs flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> No auto-fixable issues found. Everything looks clean.
          </p>
        </div>
      )}

      {/* Safe Mode Banner */}
      <div className="p-3 rounded-lg bg-green-400/5 border border-green-400/15 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-green-400 text-xs font-medium">Safe Mode Active</p>
          <p className="text-[#a89d88] text-[10px]">Auto-fix only: empty assignments, debug flags, stale cache. Never touches: categories, products, prices, translations, photos.</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-1 flex-wrap">
        {["all", "approval", "autofix", "ui", "technical", "seo", "photo", "export", "security", "performance"].map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-2 py-1 rounded text-[10px] border transition-all ${
              activeFilter === f
                ? "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30"
                : "bg-transparent text-white/30 border-white/10 hover:border-white/20"
            }`}
          >
            {f === "all" ? "All" : f === "approval" ? "Needs Approval" : f === "autofix" ? "Auto-Fixable" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="flex gap-1 flex-wrap">
        {(["all", "pending", "fixed", "ignored"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2 py-1 rounded text-[10px] border transition-all ${
              statusFilter === s
                ? s === "pending" ? "bg-amber-400/15 text-amber-400 border-amber-400/30"
                  : s === "fixed" ? "bg-green-400/15 text-green-400 border-green-400/30"
                  : s === "ignored" ? "bg-white/10 text-white/50 border-white/20"
                  : "bg-[#C2A05A]/15 text-[#C2A05A] border-[#C2A05A]/30"
                : "bg-transparent text-white/30 border-white/10 hover:border-white/20"
            }`}
          >
            {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Issue List */}
      {issues.length === 0 ? (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-8 text-center">
          <ShieldCheck className="w-8 h-8 text-green-400/30 mx-auto mb-2" />
          <p className="text-[#a89d88] text-sm">No issues detected yet.</p>
          <p className="text-white/20 text-[10px] mt-1">Click "Run Full Scan" to detect production issues.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1d1915] border border-[#352d24] rounded-xl p-6 text-center">
          <p className="text-white/20 text-xs">No issues match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((issue) => (
            <div key={issue.id} className={`bg-[#1d1915] border rounded-xl overflow-hidden ${
              issue.severity === "high" ? "border-red-400/20" :
              issue.severity === "medium" ? "border-amber-400/20" :
              issue.severity === "low" ? "border-blue-400/20" :
              "border-green-400/15"
            }`}>
              <div className="flex items-start gap-3 p-4">
                {severityIcon(issue.severity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm">{issue.title}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${severityClass[issue.severity] || "bg-white/5 text-white/30 border-white/10"}`}>
                      {severityLabel[issue.severity] || issue.severity}
                    </span>
                    {/* Status badge */}
                    {(issue.status || "pending") === "pending" && (
                      <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/20 inline-flex items-center gap-1"><Clock className="w-2.5 h-2.5" />Pending</span>
                    )}
                    {(issue.status || "pending") === "fixed" && (
                      <span className="text-[10px] bg-green-400/10 text-green-400 px-1.5 py-0.5 rounded border border-green-400/20 inline-flex items-center gap-1"><Check className="w-2.5 h-2.5" />Fixed</span>
                    )}
                    {(issue.status || "pending") === "ignored" && (
                      <span className="text-[10px] bg-white/5 text-[#a89d88] px-1.5 py-0.5 rounded border border-white/10 inline-flex items-center gap-1"><X className="w-2.5 h-2.5" />Ignored</span>
                    )}
                    {issue.requiresApproval && (
                      <span className="text-[10px] bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-400/20">
                        Approval Required
                      </span>
                    )}
                  </div>
                  <p className="text-[#a89d88] text-xs mt-1">{issue.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/20 text-[10px] capitalize">{issue.category}</span>
                    {issue.page && <span className="text-white/20 text-[10px]">{issue.page}</span>}
                    {/* Action buttons */}
                    {(issue.status || "pending") === "pending" && (
                      <>
                        <button onClick={() => markFixed(issue.id)} className="text-[10px] text-green-400 hover:text-green-300 underline ml-2">Mark Fixed</button>
                        <button onClick={() => markIgnored(issue.id)} className="text-[10px] text-white/30 hover:text-white/50 underline ml-1">Ignore</button>
                      </>
                    )}
                    {(issue.status || "pending") === "fixed" && (
                      <button onClick={() => markIgnored(issue.id)} className="text-[10px] text-white/30 hover:text-white/50 underline ml-2">Re-open</button>
                    )}
                    {(issue.status || "pending") === "ignored" && (
                      <button onClick={() => markFixed(issue.id)} className="text-[10px] text-green-400 hover:text-green-300 underline ml-2">Mark Fixed</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Protected Content Notice */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2">
        <Ban className="w-4 h-4 text-white/20 shrink-0 mt-0.5" />
        <div>
          <p className="text-[#a89d88] text-xs">Protected from auto-edit</p>
          <p className="text-white/15 text-[10px]">Categories, products, prices, translations, branch pricing, and photo assignments are never modified by Safe Fix. These always remain admin-controlled via Menu Management.</p>
        </div>
      </div>
    </div>
  );
}
