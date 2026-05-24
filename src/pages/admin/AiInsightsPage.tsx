/* ═══════════════════════════════════════════════════════════════════
   AI INSIGHTS PAGE — Smart Intelligence Dashboard
   ═══════════════════════════════════════════════════════════════════ */

import { useState, useEffect } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Lightbulb, TrendingUp, Users, Clock, Eye, Heart,
  Utensils, Sparkles, ChevronRight, BarChart3, ScanLine,
  Loader2, AlertTriangle, CheckCircle2, XCircle, PauseCircle,
  Filter, ArrowUpDown, RefreshCw,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { getLogHistory } from "@/lib/safeFixEngine";
import type { DetectedIssue } from "@/lib/safeFixEngine";

const SEVERITY_COLORS: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#3b82f6",
  auto: "#22c55e",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-amber-400" />,
  approved: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  rejected: <XCircle className="w-4 h-4 text-red-400" />,
  snoozed: <PauseCircle className="w-4 h-4 text-blue-400" />,
};

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, color = "gold", sub }: { icon: any; label: string; value: number | string; color?: string; sub?: string }) {
  const colorMap: Record<string, string> = {
    gold: "text-[#C9A96E] bg-[#C9A96E]/15",
    green: "text-green-400 bg-green-400/15",
    blue: "text-blue-400 bg-blue-400/15",
    red: "text-red-400 bg-red-400/15",
    purple: "text-purple-400 bg-purple-400/15",
  };
  return (
    <div className="bg-[#111] border border-[#222] rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        {sub && <span className="text-[9px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">{sub}</span>}
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/50 mt-0.5">{label}</p>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AiInsightsPage() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<"overview" | "recommendations" | "audits">("overview");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  // Data queries
  const { data: badgeStats } = trpc.badges.stats.useQuery();
  const { data: recommendations, isLoading: recsLoading } = trpc.badges.adminList.useQuery(
    { status: statusFilter as any, limit: 50 },
    { enabled: activeTab === "recommendations" }
  );
  const { data: approvedBadges } = trpc.badges.adminGetApproved.useQuery();
  const { data: topItems } = trpc.analytics.getTopItems.useQuery(
    { limit: 10 },
    { enabled: activeTab === "overview" }
  );

  // Mutations
  const approveMutation = trpc.badges.approve.useMutation({
    onSuccess: () => { utils.badges.invalidate(); },
  });
  const rejectMutation = trpc.badges.reject.useMutation({
    onSuccess: () => { utils.badges.invalidate(); },
  });
  const snoozeMutation = trpc.badges.snooze.useMutation({
    onSuccess: () => { utils.badges.invalidate(); },
  });
  const generateMutation = trpc.badges.generate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      setLastGenerated(new Date().toLocaleTimeString());
      utils.badges.invalidate();
      alert(`AI generated ${data.count} new recommendations`);
    },
    onError: () => setIsGenerating(false),
  });

  // AI Auditor issues
  const [auditIssues, setAuditIssues] = useState<DetectedIssue[]>([]);
  const [auditStats, setAuditStats] = useState({ total: 0, high: 0, medium: 0, low: 0, pending: 0, fixed: 0, score: 100 });

  useEffect(() => {
    if (activeTab === "overview" || activeTab === "audits") {
      import("@/lib/safeFixEngine").then(({ runFullAudit, getAuditStats }) => {
        const issues = runFullAudit();
        setAuditIssues(issues);
        setAuditStats(getAuditStats(issues));
      });
    }
  }, [activeTab]);

  const handleApprove = (id: number) => {
    approveMutation.mutate({ recommendationId: id, approvedBy: "admin" });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ recommendationId: id });
  };

  const handleSnooze = (id: number) => {
    snoozeMutation.mutate({ recommendationId: id, days: 14 });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    generateMutation.mutate({});
  };

  // Chart data
  const chartData = topItems?.map((item, idx) => ({
    name: item.itemName?.slice(0, 15) || `Item ${idx + 1}`,
    views: item.count,
    unique: item.uniqueSessions,
  })) || [];

  const auditHistory = getLogHistory().slice(0, 10);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white mb-1">AI Insights</h1>
          <p className="text-white/50 text-xs">Smart Intelligence Dashboard — AI-generated recommendations and audit insights</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { utils.badges.invalidate(); utils.analytics.invalidate(); }} className="px-3 py-1.5 rounded-lg text-xs text-white/60 border border-[#222] hover:border-[#C9A96E]/30 transition-all">
            <RefreshCw className="w-3 h-3 inline mr-1" /> Refresh
          </button>
        </div>
      </div>

      {/* ─── Stats Bar ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <StatCard icon={Lightbulb} label="Pending" value={badgeStats?.pending ?? 0} color="gold" />
        <StatCard icon={CheckCircle2} label="Approved" value={badgeStats?.approved ?? 0} color="green" />
        <StatCard icon={XCircle} label="Rejected" value={badgeStats?.rejected ?? 0} color="red" />
        <StatCard icon={PauseCircle} label="Snoozed" value={badgeStats?.snoozed ?? 0} color="blue" />
        <StatCard icon={Sparkles} label="Active Badges" value={badgeStats?.activeBadges ?? 0} color="purple" />
        <StatCard icon={Eye} label="Total Views" value={topItems?.reduce((s, i) => s + (i.count || 0), 0) ?? 0} color="blue" />
        <StatCard icon={AlertTriangle} label="Audit Issues" value={auditStats.pending} color="red" sub={`${auditStats.score}/100`} />
        <StatCard icon={BarChart3} label="Audit Score" value={`${auditStats.score}`} color="green" />
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 mb-4 border-b border-[#222] pb-2">
        {(["overview", "recommendations", "audits"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? "bg-[#C9A96E]/15 text-[#C9A96E]" : "text-white/40 hover:text-white/60"}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Generate button */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium text-sm">AI Badge Recommendation</p>
              <p className="text-white/40 text-xs">Generate AI recommendations from user behavior data</p>
              {lastGenerated && <p className="text-white/30 text-[10px] mt-1">Last generated: {lastGenerated}</p>}
            </div>
            <Button onClick={handleGenerate} disabled={isGenerating}
              className="bg-[#C9A96E] text-[#1A1A1A] hover:bg-[#B8985E] text-xs font-semibold">
              {isGenerating ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Generating...</> : <><Sparkles className="w-3 h-3 mr-1" /> Generate AI</>}
            </Button>
          </div>

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                <h3 className="text-white text-sm font-medium mb-3">Top Items by Views</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="views" fill="#C9A96E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-[#111] border border-[#222] rounded-xl p-4">
                <h3 className="text-white text-sm font-medium mb-3">Unique Sessions</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="unique" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Top items list */}
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222] flex items-center justify-between">
              <h3 className="text-white text-sm font-medium">Top Performing Items</h3>
              <Link to="/admin/menu" className="text-[#C9A96E] text-xs hover:underline">Go to Menu</Link>
            </div>
            {topItems && topItems.length > 0 ? (
              <div className="divide-y divide-[#222]">
                {topItems.map((item, idx) => (
                  <div key={idx} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                    <span className="text-[#C9A96E] font-bold text-sm w-6">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.itemName || "Unknown"}</p>
                      <p className="text-white/40 text-[10px]">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-medium">{item.count} views</p>
                      <p className="text-white/30 text-[10px]">{item.uniqueSessions} unique</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-white/30 text-sm">No data yet. Start tracking events.</div>
            )}
          </div>

          {/* Audit summary */}
          <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#222]">
              <h3 className="text-white text-sm font-medium">Latest Audit Issues</h3>
            </div>
            {auditIssues.filter((i) => i.status === "pending").slice(0, 5).map((issue) => (
              <div key={issue.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-[#222]/50">
                <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: SEVERITY_COLORS[issue.severity] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm">{issue.title}</p>
                  <p className="text-white/40 text-[10px]">{issue.category}</p>
                </div>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border"
                  style={{ color: SEVERITY_COLORS[issue.severity], borderColor: `${SEVERITY_COLORS[issue.severity]}33`, background: `${SEVERITY_COLORS[issue.severity]}11` }}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── RECOMMENDATIONS TAB ─── */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {/* Status filter */}
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected", "snoozed"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${statusFilter === s ? "bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30" : "text-white/40 border-[#222] hover:border-white/20"}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Recommendation list */}
          {recsLoading ? (
            <div className="flex items-center justify-center p-12"><Loader2 className="w-6 h-6 text-[#C9A96E] animate-spin" /></div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="bg-[#111] border border-[#222] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">{STATUS_ICONS[rec.status] || <Clock className="w-4 h-4 text-white/30" />}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm">{rec.itemName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C9A96E]/15 text-[#C9A96E] border border-[#C9A96E]/30">{rec.badgeType.replace(/^is/, "")}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-400/15 text-green-400 border border-green-400/30">{rec.confidence}% confidence</span>
                      </div>
                      <p className="text-white/50 text-xs mt-1">{rec.reason}</p>
                      {rec.dataPoints && (
                        <p className="text-white/30 text-[10px] mt-0.5">{rec.dataPoints}</p>
                      )}
                    </div>
                    {/* Actions */}
                    {rec.status === "pending" && (
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleApprove(rec.id)} className="px-2 py-1 rounded text-[10px] text-green-400 border border-green-400/20 hover:bg-green-400/10 transition-all">Approve</button>
                        <button onClick={() => handleReject(rec.id)} className="px-2 py-1 rounded text-[10px] text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all">Reject</button>
                        <button onClick={() => handleSnooze(rec.id)} className="px-2 py-1 rounded text-[10px] text-blue-400 border border-blue-400/20 hover:bg-blue-400/10 transition-all">Snooze</button>
                      </div>
                    )}
                    {rec.status === "approved" && <span className="text-green-400 text-xs">Approved{rec.approvedBy ? ` by ${rec.approvedBy}` : ""}</span>}
                    {rec.status === "rejected" && <span className="text-red-400 text-xs">{rec.rejectedReason || "Rejected"}</span>}
                    {rec.status === "snoozed" && <span className="text-blue-400 text-xs">Snoozed</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#111] border border-[#222] rounded-xl p-8 text-center">
              <Lightbulb className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">No recommendations found.</p>
              <p className="text-white/20 text-[10px] mt-1">Click "Generate AI" in Overview tab to create recommendations.</p>
            </div>
          )}
        </div>
      )}

      {/* ─── AUDITS TAB ─── */}
      {activeTab === "audits" && (
        <div className="space-y-4">
          <div className="bg-[#111] border border-[#222] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white text-sm font-medium">Audit Health Score</h3>
              <span className="text-2xl font-bold" style={{ color: auditStats.score >= 80 ? "#22c55e" : auditStats.score >= 50 ? "#f59e0b" : "#ef4444" }}>{auditStats.score}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${auditStats.score}%`, background: auditStats.score >= 80 ? "#22c55e" : auditStats.score >= 50 ? "#f59e0b" : "#ef4444" }} />
            </div>
            <div className="flex gap-4 mt-2 text-[10px] text-white/40">
              <span>High: {auditStats.high}</span>
              <span>Medium: {auditStats.medium}</span>
              <span>Low: {auditStats.low}</span>
              <span>Pending: {auditStats.pending}</span>
              <span>Fixed: {auditStats.fixed}</span>
            </div>
          </div>

          <div className="space-y-2">
            {auditIssues.filter((i) => (i.status || "pending") === "pending").map((issue) => (
              <div key={issue.id} className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SEVERITY_COLORS[issue.severity] }} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm">{issue.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded border" style={{ color: SEVERITY_COLORS[issue.severity], borderColor: `${SEVERITY_COLORS[issue.severity]}33` }}>{issue.severity}</span>
                  </div>
                  <p className="text-white/50 text-xs mt-0.5">{issue.description}</p>
                  {issue.recommendation && <p className="text-[#C9A96E]/60 text-[10px] mt-1">{issue.recommendation}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
