import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { TRPCProvider } from "./providers/trpc";
import { LanguageProvider } from "./lib/LanguageContext";
import App from "./App";
import "./index.css";

// ═══ Chunk load failure detection + safe auto-reload ═══
let chunkReloadTriggered = false;
window.addEventListener("error", (e) => {
  const msg = e.message || "";
  const isChunkError =
    msg.includes("Importing a module script failed") ||
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("error loading dynamically imported module") ||
    /Loading chunk \d+ failed/i.test(msg) ||
    (e.target && (e.target as any).src?.includes?.("assets/"));
  if (isChunkError && !chunkReloadTriggered) {
    chunkReloadTriggered = true;
    console.warn("[CHUNK ERROR] Stale chunk detected. Reloading...", msg);
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("_cb", Date.now().toString());
      window.location.replace(url.toString());
    }, 800);
  }
});

// ═══ Global error tracking ═══
(window as any).__ERRORS = [];
window.addEventListener("error", (e) => {
  (window as any).__ERRORS.push({ type: "error", message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno, stack: e.error?.stack });
  console.error("[GLOBAL ERROR]", e.message, "at", e.filename + ":" + e.lineno);
});
window.addEventListener("unhandledrejection", (e) => {
  const reason = String(e.reason);
  const isChunkReject =
    reason.includes("Importing a module script failed") ||
    reason.includes("Failed to fetch dynamically imported module") ||
    reason.includes("error loading dynamically imported module") ||
    /Loading chunk \d+ failed/i.test(reason);
  if (isChunkReject && !chunkReloadTriggered) {
    chunkReloadTriggered = true;
    console.warn("[CHUNK REJECT] Stale chunk detected. Reloading...", reason);
    setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("_cb", Date.now().toString());
      window.location.replace(url.toString());
    }, 800);
    return;
  }
  (window as any).__ERRORS.push({ type: "rejection", message: reason, stack: e.reason?.stack });
  console.error("[UNHANDLED REJECTION]", e.reason);
});

// ═══ Global tracking helper for QR page backward compatibility ═══
(window as any).__trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  import("./lib/tracking").then(({ trackMetaCustom, trackGoogle }) => {
    trackMetaCustom(eventName, params ?? {});
    trackGoogle(eventName, params ?? {});
  }).catch(() => { /* silently fail */ });
};

// ═══ Legacy hash-URL redirect (old QR codes / links used /#/path) ═══
// Migrated HashRouter → BrowserRouter. Old links like xurcun.az/#/menu/branch
// must still work, so rewrite "#/..." to a real path before React mounts.
if (window.location.hash.startsWith("#/")) {
  const target = window.location.hash.slice(1); // "/menu/branch?lang=az"
  window.history.replaceState(null, "", target || "/");
}

// ═══ Render app ═══
const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("[FATAL] #root element not found");
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <BrowserRouter>
        <HelmetProvider>
          <TRPCProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </TRPCProvider>
        </HelmetProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
