import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

/* ═══════════════════════════════════════════
   Homepage "Scroll to Top" Button
   - Hidden at top of page
   - Appears after scrolling down
   - Click smooth-scrolls to top
   ═══════════════════════════════════════════ */

export default function HomeScrollButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Yuxarı"
      className="fixed z-40 w-12 h-12 rounded-full bg-[#111] border border-[#C9A96E]/30 shadow-lg shadow-black/50 flex items-center justify-center text-[#C9A96E] hover:bg-[#1A1A1A] hover:border-[#C9A96E]/50 hover:scale-105 active:scale-95 transition-all duration-200"
      style={{
        bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        right: "max(20px, env(safe-area-inset-right, 20px))",
      }}
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
