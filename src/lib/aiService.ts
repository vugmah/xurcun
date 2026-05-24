/* ─── AI Service Client ───
   Reads AI config from env variables.
   Never hardcodes API keys in frontend code.
*/

export interface AiConfig {
  provider: string; // "openai", "anthropic", "gemini", ""
  apiKey: string;   // masked, read-only indicator
  isConfigured: boolean;
}

export interface AuditIssue {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  page: string;
  description: string;
  suggestion: string;
  autoFixable: boolean;
  category: string;
}

export interface SuggestionRecord {
  id: string;
  date: string;
  title: string;
  category: string;
  severity: "high" | "medium" | "low";
  affectedPage: string;
  oldValue?: string;
  newValue?: string;
  status: "pending" | "draft" | "applied" | "ignored";
}

const SUGGESTIONS_KEY = "xurcun_ai_suggestions_v2"; // bumped to v2: auto-approve SEO, filter info items

/* ─── Read AI config from env ─── */
export function getAiConfig(): AiConfig {
  const provider = (import.meta.env?.VITE_AI_PROVIDER || "").trim();
  const apiKey = (import.meta.env?.VITE_AI_API_KEY || "").trim();
  return {
    provider,
    apiKey: apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "",
    isConfigured: !!provider && !!apiKey,
  };
}

/* ─── Default suggestions — pre-loaded SEO fixes + pending items ─── */
const DEFAULT_SUGGESTIONS: SuggestionRecord[] = [
  {
    id: "seo-001",
    date: "2025-01-15T10:00:00.000Z",
    title: "Meta description tag eksik",
    category: "SEO",
    severity: "high",
    affectedPage: "Tüm Sayfalar",
    oldValue: "<meta name=\"description\"> yok",
    newValue: "Premium hookah lounge & restaurant description eklendi",
    status: "pending",
  },
  {
    id: "seo-002",
    date: "2025-01-15T10:00:00.000Z",
    title: "Open Graph (OG) tag'ler eksik",
    category: "SEO",
    severity: "high",
    affectedPage: "Tüm Sayfalar",
    oldValue: "og:title, og:description, og:image yok",
    newValue: "OG tag'leri eklendi (title, description, type, url, image)",
    status: "pending",
  },
  {
    id: "seo-003",
    date: "2025-01-15T10:00:00.000Z",
    title: "Canonical URL eksik",
    category: "SEO",
    severity: "medium",
    affectedPage: "Tüm Sayfalar",
    oldValue: "<link rel=\"canonical\"> yok",
    newValue: "Canonical URL eklendi",
    status: "applied",
  },
  {
    id: "seo-004",
    date: "2025-01-15T10:00:00.000Z",
    title: "Hreflang tag'leri eksik",
    category: "SEO",
    severity: "medium",
    affectedPage: "Tüm Sayfalar",
    oldValue: "Dil alternatifleri belirtilmemiş",
    newValue: "hreflang tag'leri eklendi (az, tr, ru, en, x-default)",
    status: "applied",
  },
  {
    id: "seo-005",
    date: "2025-01-15T10:00:00.000Z",
    title: "JSON-LD structured data eksik",
    category: "SEO",
    severity: "high",
    affectedPage: "Ana Sayfa",
    oldValue: "Schema.org markup yok",
    newValue: "Restaurant + Organization schema eklendi",
    status: "applied",
  },
  {
    id: "seo-006",
    date: "2025-01-15T10:00:00.000Z",
    title: "Title tag eksik veya default",
    category: "SEO",
    severity: "high",
    affectedPage: "Tüm Sayfalar",
    oldValue: "<title> Vite App veya bos",
    newValue: "Xurcun White City | Premium Dining Baku",
    status: "applied",
  },
  {
    id: "content-001",
    date: "2025-01-15T10:00:00.000Z",
    title: "Events bölümü içeriği kontrol edilmeli",
    category: "Content",
    severity: "medium",
    affectedPage: "Ana Sayfa",
    oldValue: undefined,
    newValue: undefined,
    status: "pending",
  },
  {
    id: "content-002",
    date: "2025-01-15T10:00:00.000Z",
    title: "Footer iletişim bilgileri güncel değil",
    category: "Content",
    severity: "medium",
    affectedPage: "Tüm Sayfalar",
    oldValue: undefined,
    newValue: undefined,
    status: "pending",
  },
  {
    id: "content-003",
    date: "2025-01-15T10:00:00.000Z",
    title: "Marka sesi tutarsızlığı",
    category: "Content",
    severity: "low",
    affectedPage: "Tüm Sayfalar",
    oldValue: undefined,
    newValue: undefined,
    status: "pending",
  },
  {
    id: "perf-001",
    date: "2025-01-15T10:00:00.000Z",
    title: "Bundle splitting önerilir",
    category: "Performance",
    severity: "low",
    affectedPage: "Tüm Sayfalar",
    oldValue: "Tek büyük JS bundle",
    newValue: "Route-based code splitting uygulanmalı",
    status: "pending",
  },
  {
    id: "ui-001",
    date: "2025-01-15T10:00:00.000Z",
    title: "Hero metin render sorunu",
    category: "UI",
    severity: "medium",
    affectedPage: "Ana Sayfa",
    oldValue: undefined,
    newValue: undefined,
    status: "pending",
  },
  {
    id: "tracking-001",
    date: "2025-01-15T10:00:00.000Z",
    title: "Meta Pixel event'leri kontrol edilmeli",
    category: "Tracking",
    severity: "medium",
    affectedPage: "Tüm Sayfalar",
    oldValue: undefined,
    newValue: undefined,
    status: "pending",
  },
  {
    id: "tracking-002",
    date: "2025-01-15T10:00:00.000Z",
    title: "WhatsApp Conversions API entegrasyonu",
    category: "Tracking",
    severity: "medium",
    affectedPage: "Rezervasyon",
    oldValue: undefined,
    newValue: undefined,
    status: "pending",
  },
];

/* ─── Save/load suggestions log ─── */
export function getSuggestions(): SuggestionRecord[] {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as SuggestionRecord[];
      // If stored array is empty (user cleared), return defaults so logs always show
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [...DEFAULT_SUGGESTIONS];
}

/** Merge suggestions from other tabs into the central log */
export function syncSuggestionFromTab(record: Omit<SuggestionRecord, "id" | "date"> & { id?: string }) {
  const id = record.id || `${record.category}-${Date.now()}`;
  const existing = getSuggestions().find((s) => s.id === id);
  if (existing) return; // Already logged
  saveSuggestion({
    id,
    date: new Date().toISOString(),
    title: record.title,
    category: record.category,
    severity: record.severity,
    affectedPage: record.affectedPage,
    oldValue: record.oldValue,
    newValue: record.newValue,
    status: record.status,
  });
  // Notify all listeners that suggestions updated
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("xurcun:suggestions:update"));
  }
}

export function saveSuggestion(s: SuggestionRecord) {
  const all = getSuggestions();
  const existing = all.findIndex((x) => x.id === s.id);
  if (existing >= 0) all[existing] = s;
  else all.unshift(s);
  try { localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(all.slice(0, 200))); } catch { /* ignore */ }
}

export function updateSuggestionStatus(id: string, status: SuggestionRecord["status"]) {
  const all = getSuggestions();
  const idx = all.findIndex((x) => x.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    try { localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  }
}

/* ════════════════════════════════════════════════════════════════
   SAFE FIX SUGGESTIONS — Issues found by the Safe Fix Engine
   ════════════════════════════════════════════════════════════════ */

export interface SafeFixSuggestion {
  id: string;
  date: string;
  title: string;
  category: string;
  severity: "auto" | "low" | "medium" | "high";
  affectedPage: string;
  description: string;
  autoFixed: boolean;
  fixDescription?: string;
  status: "auto-fixed" | "pending-approval" | "approved" | "ignored";
}

const SAFE_FIX_KEY = "xurcun_safe_fix_suggestions_v1";
const SAFE_FIX_HISTORY_KEY = "xurcun_safe_fix_history_v1";

export function getSafeFixSuggestions(): SafeFixSuggestion[] {
  try {
    const raw = localStorage.getItem(SAFE_FIX_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

export function saveSafeFixSuggestion(s: SafeFixSuggestion) {
  const all = getSafeFixSuggestions();
  const existing = all.findIndex((x) => x.id === s.id);
  if (existing >= 0) all[existing] = s;
  else all.unshift(s);
  try { localStorage.setItem(SAFE_FIX_KEY, JSON.stringify(all.slice(0, 100))); } catch { /* ignore */ }
}

export function updateSafeFixStatus(id: string, status: SafeFixSuggestion["status"]) {
  const all = getSafeFixSuggestions();
  const idx = all.findIndex((x) => x.id === id);
  if (idx >= 0) {
    all[idx].status = status;
    try { localStorage.setItem(SAFE_FIX_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  }
}

export function clearSafeFixSuggestions() {
  try { localStorage.removeItem(SAFE_FIX_KEY); } catch { /* ignore */ }
}

export function logSafeFixHistory(entry: { action: string; details: string; timestamp: string }) {
  try {
    const raw = localStorage.getItem(SAFE_FIX_HISTORY_KEY);
    const history = raw ? JSON.parse(raw) : [];
    history.unshift(entry);
    localStorage.setItem(SAFE_FIX_HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
  } catch { /* ignore */ }
}

export function getSafeFixHistory(): { action: string; details: string; timestamp: string }[] {
  try {
    const raw = localStorage.getItem(SAFE_FIX_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

/* ─── Severity color map ───
   Supports all severity aliases used across the audit system.
   Maps to Tailwind utility classes for consistent badge styling.
   ═════════════════════════════════════════════════════════════ */
export const severityClass: Record<string, string> = {
  /* High / Critical → red */
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  critical: "bg-red-500/10 text-red-400 border-red-500/20",
  /* Medium / Warning → amber/yellow */
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  /* Low / Minor → blue */
  low: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  minor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  /* Auto / Success → green */
  auto: "bg-green-500/10 text-green-400 border-green-500/20",
  success: "bg-green-500/10 text-green-400 border-green-500/20",
};

export const severityLabel: Record<string, string> = {
  high: "Critical",
  critical: "Critical",
  medium: "Warning",
  warning: "Warning",
  low: "Minor",
  minor: "Minor",
  auto: "OK",
  success: "Success",
};
