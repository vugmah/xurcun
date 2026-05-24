import { useState } from "react";
import { Tag, Save, Info } from "lucide-react";
import { getBranches } from "@/lib/generalSettings";
import {
  getShishaDiscount, saveShishaDiscount,
  type ShishaDiscountConfig,
} from "@/lib/shishaDiscountStore";
import { Button } from "@/components/ui/button";

export default function ShishaDiscountPage() {
  const branches = getBranches().filter((b) => b.isActive);
  const [configs, setConfigs] = useState<Record<string, ShishaDiscountConfig>>(() => {
    const map: Record<string, ShishaDiscountConfig> = {};
    for (const b of branches) {
      map[b.slug] = getShishaDiscount(b.slug);
    }
    return map;
  });
  const [saved, setSaved] = useState(false);

  const updateBranch = (slug: string, patch: Partial<ShishaDiscountConfig>) => {
    setConfigs((prev) => {
      const next = { ...prev, [slug]: { ...prev[slug], ...patch } };
      saveShishaDiscount(slug, next[slug]);
      return next;
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#C9A96E]" /> Qəlyan / Nargile Endirimi
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Her filial ucun ayri endirim faizi, aktiv saati ve ON/OFF ayari.
          </p>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-green-400 text-sm">
            <Save className="w-4 h-4" /> Kaydedildi
          </span>
        )}
      </div>

      {/* Info box */}
      <div className="mb-6 p-4 bg-[#C9A96E]/5 border border-[#C9A96E]/10 rounded-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-[#C9A96E] shrink-0 mt-0.5" />
        <div>
          <p className="text-white/60 text-sm">
            Endirim yalniz QR menuda gosterilir. Orijinal admin qiymetleri degismez.
            Her filialin farkli endirim durumu olabilir.
          </p>
        </div>
      </div>

      {/* Branch cards */}
      <div className="space-y-4">
        {branches.map((b) => {
          const cfg = configs[b.slug] || { enabled: false, percent: 50, activeUntil: "18:00" };
          return (
            <div key={b.slug} className="bg-[#111] border border-[#222] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-medium">{b.name}</h2>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    cfg.enabled
                      ? "bg-green-500/15 text-green-400 border border-green-500/20"
                      : "bg-red-500/15 text-red-400 border border-red-500/20"
                  }`}
                >
                  {cfg.enabled ? "Aktiv" : "Deaktiv"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Toggle */}
                <div className="flex items-center justify-between md:block">
                  <label className="text-white/50 text-sm mb-2 block">Endirim Aktiv</label>
                  <button
                    onClick={() => updateBranch(b.slug, { enabled: !cfg.enabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      cfg.enabled ? "bg-[#C9A96E]" : "bg-[#333]"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        cfg.enabled ? "left-7" : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Percent */}
                <div>
                  <label className="text-white/50 text-sm mb-2 block">Endirim Faizi (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cfg.percent}
                    onChange={(e) =>
                      updateBranch(b.slug, {
                        percent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                  />
                </div>

                {/* Active until */}
                <div>
                  <label className="text-white/50 text-sm mb-2 block">Aktiv Saatina Kadar</label>
                  <input
                    type="time"
                    value={cfg.activeUntil}
                    onChange={(e) => updateBranch(b.slug, { activeUntil: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#333] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]/30"
                  />
                </div>
              </div>

              <p className="text-white/25 text-xs mt-4">
                {cfg.enabled
                  ? `%${cfg.percent} endirim ${cfg.activeUntil}-a kadar aktiv. Baku vaxti UTC+4.`
                  : "Endirim deaktiv - normal qiymetler gosterilecek."}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
