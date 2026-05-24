import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

const SESSION_KEY = "xurcun_popup_session";
const SHOWN_KEY = "xurcun_popups_shown";

interface PopupCampaign {
  id: number;
  name: string;
  type: string;
  title: string | null;
  content: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  delay: number | null;
  frequency: number | null;
  placement: string | null;   // "all", "homepage", "qr", "homepage+qr"
  branch: string | null;      // "white-city", "seabreeze", null=all
  lang: string | null;        // "az", "en", "ru", "tr", null=all
}

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "fallback-" + Date.now();
  }
}

function getShownPopups(): Record<number, number> {
  try {
    const raw = sessionStorage.getItem(SHOWN_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function recordShown(popupId: number) {
  try {
    const shown = getShownPopups();
    shown[popupId] = (shown[popupId] || 0) + 1;
    sessionStorage.setItem(SHOWN_KEY, JSON.stringify(shown));
  } catch { /* ignore */ }
}

/**
 * Detect current page placement for popup targeting.
 * Returns: "homepage" | "qr" | "other"
 *
 * Uses window.location.hash because the app uses HashRouter.
 *   Homepage: "" | "#" | "#/"
 *   QR menu:  "#/menu/..."
 *   Admin:    "#/admin/..."
 */
function getCurrentPlacement(): "homepage" | "qr" | "other" {
  const hash = window.location.hash || "";
  if (hash === "" || hash === "#" || hash === "#/") return "homepage";
  if (hash.startsWith("#/menu/")) return "qr";
  return "other";
}

/**
 * Detect current branch slug from the hash route.
 * For QR pages: "#/menu/white-city" → "white-city"
 */
function getCurrentBranch(): string | undefined {
  const hash = window.location.hash || "";
  const parts = hash.replace("#", "").split("/").filter(Boolean);
  // parts[0] = "menu", parts[1] = branch slug
  if (parts[0] === "menu" && parts[1]) return parts[1];
  return undefined;
}

/**
 * Detect current language from html lang attribute or URL.
 */
function getCurrentLang(): string | undefined {
  // Prefer html lang attribute (set by LanguageContext)
  const htmlLang = document.documentElement.lang;
  if (htmlLang) return htmlLang;
  return undefined;
}

/**
 * Frontend targeting check — runs BEFORE a popup is shown.
 * Returns true if the popup passes all targeting filters.
 */
function passesTargeting(campaign: PopupCampaign): boolean {
  // ── 1. Admin exclusion — NEVER show on admin routes ──
  const hash = window.location.hash || "";
  if (hash.startsWith("#/admin")) return false;

  // ── 2. Placement targeting ──
  const placement = campaign.placement ?? "all";
  if (placement !== "all") {
    const currentPlacement = getCurrentPlacement();
    if (placement === "homepage" && currentPlacement !== "homepage") return false;
    if (placement === "qr" && currentPlacement !== "qr") return false;
    if (placement === "homepage+qr" && currentPlacement === "other") return false;
  }

  // ── 3. Branch targeting ──
  const popupBranch = campaign.branch;
  if (popupBranch) {
    const currentBranch = getCurrentBranch();
    if (currentBranch !== popupBranch) return false;
  }

  // ── 4. Language targeting ──
  const popupLang = campaign.lang;
  if (popupLang) {
    const currentLang = getCurrentLang() || "az";
    if (currentLang !== popupLang) return false;
  }

  return true;
}

export default function PopupRenderer() {
  const [activePopup, setActivePopup] = useState<PopupCampaign | null>(null);
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const sessionId = useRef(getSessionId());
  const processedRef = useRef<Set<number>>(new Set());
  const utils = trpc.useUtils();

  const branch = getCurrentBranch();
  const lang = getCurrentLang();
  const placement = getCurrentPlacement();

  const { data: campaigns = [] } = trpc.popup.list.useQuery(
    { placement, branch, lang, sessionId: sessionId.current },
    { staleTime: 60_000 }
  );

  const trackView = trpc.popup.trackView.useMutation();
  const trackClick = trpc.popup.trackClick.useMutation();

  // Process campaigns: find eligible popup to show
  useEffect(() => {
    if (!campaigns.length) {
      /* DB has zero campaigns — ensure no stale popup remains visible */
      setActivePopup(null);
      setOpen(false);
      setEntered(false);
      processedRef.current.clear();
      return;
    }

    const shown = getShownPopups();

    for (const campaign of campaigns) {
      // Skip if already processed this campaign
      if (processedRef.current.has(campaign.id)) continue;

      // Skip if frequency already reached
      const freq = campaign.frequency ?? 1;
      if ((shown[campaign.id] || 0) >= freq) {
        processedRef.current.add(campaign.id);
        continue;
      }

      // ── FRONTEND TARGETING: skip if campaign doesn't match current context ──
      if (!passesTargeting(campaign)) {
        processedRef.current.add(campaign.id);
        continue;
      }

      // Mark as processed so we don't show it again this session cycle
      processedRef.current.add(campaign.id);

      // Show this popup with delay
      const delayMs = (campaign.delay ?? 0) * 1000;

      const timer = setTimeout(() => {
        setActivePopup(campaign);
        setOpen(true);

        // Trigger enter animation after a tick
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setEntered(true));
        });

        // Track view
        trackView.mutate({
          campaignId: campaign.id,
          sessionId: sessionId.current,
        });

        // Record shown in session
        recordShown(campaign.id);
      }, delayMs);

      // Only show one popup at a time - first eligible wins
      return () => clearTimeout(timer);
    }
  }, [campaigns, trackView]);

  const handleClose = useCallback(() => {
    setEntered(false);
    setTimeout(() => {
      setOpen(false);
      setActivePopup(null);
    }, 300);
  }, []);

  const handleCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!activePopup) return;

      trackClick.mutate({
        campaignId: activePopup.id,
        sessionId: sessionId.current,
      });

      // If CTA link is external, let it navigate
      if (activePopup.ctaLink) {
        // Let the anchor handle navigation naturally
        return;
      }

      e.preventDefault();
      handleClose();
    },
    [activePopup, trackClick, handleClose]
  );

  // ── FINAL GUARD: don't render if no active popup or on admin route ──
  if (!activePopup) return null;
  if ((window.location.hash || "").startsWith("#/admin")) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent
        className={`
          fixed z-50 left-1/2 top-1/2
          -translate-x-1/2 transition-all duration-500 ease-out
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          ${entered ? "-translate-y-1/2 opacity-100 scale-100" : "-translate-y-[30%] opacity-0 scale-95"}
          w-[calc(100%-2rem)] max-w-[500px] p-0 border-0 overflow-hidden rounded-xl
          bg-[#111] shadow-2xl shadow-black/50
        `}
        showCloseButton={false}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Image */}
        {activePopup.imageUrl && (
          <div className="w-full aspect-[16/10] overflow-hidden">
            <img
              src={activePopup.imageUrl}
              alt={activePopup.title ?? "Campaign"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-center">
          {activePopup.title && (
            <h2 className="text-white text-xl font-semibold mb-2 tracking-wide">
              {activePopup.title}
            </h2>
          )}
          {activePopup.content && (
            <p className="text-white/70 text-sm leading-relaxed mb-5 whitespace-pre-wrap">
              {activePopup.content}
            </p>
          )}

          {/* CTA Button */}
          {activePopup.ctaText && (
            <a
              href={activePopup.ctaLink ?? "#"}
              target={activePopup.ctaLink?.startsWith("http") ? "_blank" : undefined}
              rel={activePopup.ctaLink?.startsWith("http") ? "noopener noreferrer" : undefined}
              onClick={handleCtaClick}
              className="inline-block px-6 py-2.5 bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A] font-medium text-sm rounded-md transition-colors"
            >
              {activePopup.ctaText}
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
