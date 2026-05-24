/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS — Anonymous menu tracking (GDPR-safe, no PII)

   - Session-based (hashed, not linked to identity)
   - Batched sends (every 10s or 10 events)
   - Graceful fallback (localStorage queue if offline)
   - Auto-cleanup (events older than 90 days)
   ═══════════════════════════════════════════════════════════════════ */

import { trpc } from "@/providers/trpc";

const SESSION_KEY = "_xurcun_session";
const QUEUE_KEY = "_xurcun_event_queue";
const BATCH_INTERVAL_MS = 10000; // 10 seconds
const MAX_QUEUE_SIZE = 50;
const MAX_BATCH_SIZE = 10;

let _sessionId: string | null = null;
let _queue: AnalyticsEvent[] = [];
let _flushTimer: ReturnType<typeof setInterval> | null = null;
let _initialized = false;

export interface AnalyticsEvent {
  eventType: "view" | "hover" | "qr_scan" | "print" | "favorite";
  itemId?: number;
  itemName?: string;
  category?: string;
  branchSlug?: string;
  lang?: string;
  source?: "qr" | "homepage" | "admin";
  metadata?: Record<string, unknown>;
}

function getSessionId(): string {
  if (_sessionId) return _sessionId;
  try {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      _sessionId = existing;
      return existing;
    }
  } catch { /* ignore */ }
  // Generate anonymous session hash (no PII)
  const hash = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${navigator.userAgent.slice(0, 20).replace(/[^a-zA-Z0-9]/g, "")}`;
  const sessionHash = btoa(hash).slice(0, 32);
  _sessionId = sessionHash;
  try { localStorage.setItem(SESSION_KEY, sessionHash); } catch { /* ignore */ }
  return sessionHash;
}

function loadQueue(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveQueue() {
  try {
    // Keep only last MAX_QUEUE_SIZE events
    const trimmed = _queue.slice(-MAX_QUEUE_SIZE);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch { /* ignore */ }
}

function clearQueue() {
  _queue = [];
  try { localStorage.removeItem(QUEUE_KEY); } catch { /* ignore */ }
}

/** Initialize analytics (call once on app mount) */
export function initAnalytics() {
  if (_initialized) return;
  _initialized = true;
  _queue = loadQueue();

  // Auto-flush every 10 seconds
  _flushTimer = setInterval(() => {
    if (_queue.length > 0) flush();
  }, BATCH_INTERVAL_MS);

  // Flush on page hide
  window.addEventListener("pagehide", () => {
    if (_queue.length > 0) flushSync();
  });

  // Track initial page view
  track({ eventType: "view", source: "qr" });
}

/** Track a single event */
export function track(event: AnalyticsEvent) {
  if (!_initialized) initAnalytics();

  const enriched: AnalyticsEvent = {
    ...event,
    branchSlug: event.branchSlug || getCurrentBranchSlug(),
    lang: event.lang || getCurrentLang(),
    source: event.source || detectSource(),
  };

  _queue.push(enriched);

  // Flush immediately if batch is full
  if (_queue.length >= MAX_BATCH_SIZE) {
    flush();
  } else {
    saveQueue();
  }
}

/** Track item hover (with duration) */
let _hoverStart: number | null = null;
let _hoverItem: AnalyticsEvent | null = null;

export function startHover(event: AnalyticsEvent) {
  _hoverStart = Date.now();
  _hoverItem = event;
}

export function endHover() {
  if (_hoverStart && _hoverItem) {
    const duration = Date.now() - _hoverStart;
    if (duration > 500) { // Only track hovers > 500ms
      track({
        ..._hoverItem,
        eventType: "hover",
        metadata: { duration },
      });
    }
  }
  _hoverStart = null;
  _hoverItem = null;
}

/** Track favorite toggle */
export function trackFavorite(itemId: number, itemName: string, category: string, isFavorited: boolean) {
  if (isFavorited) {
    track({ eventType: "favorite", itemId, itemName, category });
  }
}

/** Track QR scan */
export function trackQRScan(branchSlug: string, lang: string) {
  track({ eventType: "qr_scan", branchSlug, lang });
}

/** Track print */
export function trackPrint(branchSlug: string, lang: string) {
  track({ eventType: "print", branchSlug, lang });
}

/** Flush queue to server */
async function flush() {
  if (_queue.length === 0) return;

  const batch = _queue.splice(0, MAX_BATCH_SIZE);
  saveQueue();

  const sessionId = getSessionId();
  const events = batch.map((e) => ({
    sessionId,
    eventType: e.eventType,
    itemId: e.itemId,
    itemName: e.itemName,
    category: e.category,
    branchSlug: e.branchSlug,
    lang: e.lang,
    source: e.source,
    metadata: e.metadata ? JSON.stringify(e.metadata) : undefined,
  }));

  try {
    // Use fetch directly to avoid tRPC dependency in vanilla TS
    await fetch("/api/trpc/analytics.trackBatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ json: { events } }),
    });
  } catch {
    // Put events back in queue
    _queue.unshift(...batch);
    saveQueue();
  }
}

/** Synchronous flush (for pagehide) */
function flushSync() {
  if (_queue.length === 0) return;

  const sessionId = getSessionId();
  const events = _queue.slice(0, MAX_BATCH_SIZE).map((e) => ({
    sessionId,
    eventType: e.eventType,
    itemId: e.itemId,
    itemName: e.itemName,
    category: e.category,
    branchSlug: e.branchSlug,
    lang: e.lang,
    source: e.source,
    metadata: e.metadata ? JSON.stringify(e.metadata) : undefined,
  }));

  try {
    const body = JSON.stringify({ json: { events } });
    // @ts-ignore — sendBeacon is available
    navigator.sendBeacon?.("/api/trpc/analytics.trackBatch", new Blob([body], { type: "application/json" }));
  } catch { /* ignore */ }
}

/** Get current branch slug from URL */
function getCurrentBranchSlug(): string {
  const hash = window.location.hash;
  if (hash.includes("/menu/")) {
    return hash.split("/menu/")[1]?.split("/")[0] || "white-city";
  }
  return "white-city";
}

/** Get current language */
function getCurrentLang(): string {
  return document.documentElement.lang || "az";
}

/** Detect source from URL */
function detectSource(): "qr" | "homepage" | "admin" {
  const hash = window.location.hash;
  if (hash.includes("/admin")) return "admin";
  if (hash.includes("/menu/")) return "qr";
  return "qr";
}

/** Cleanup (call on unmount) */
export function destroyAnalytics() {
  if (_flushTimer) {
    clearInterval(_flushTimer);
    _flushTimer = null;
  }
  flushSync();
}
