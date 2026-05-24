import { useRef, useEffect } from "react";
import { useLanguage } from "../lib/LanguageContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getGeneralSettings } from "@/lib/generalSettings";
import { Monitor, Cable, Volume2, Building2, ChevronRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SEATING_KEYS = [
  "events_seating_ushape",
  "events_seating_theatre",
  "events_seating_banquet",
  "events_seating_cocktail",
];

const TECH_KEYS = [
  { key: "events_tech_displays", icon: Monitor },
  { key: "events_tech_hdmi", icon: Cable },
  { key: "events_tech_bose", icon: Volume2 },
  { key: "events_tech_infra", icon: Building2 },
];

const EVENT_TYPE_KEYS = [
  "events_type_corporate",
  "events_type_presentations",
  "events_type_dining",
  "events_type_birthday",
  "events_type_cocktail",
  "events_type_networking",
  "events_type_exclusive",
];

function getWhatsappEventUrl(lang: string): string {
  const phone = getGeneralSettings().whatsapp;
  const messages: Record<string, string> = {
    az: "Salam, Xurcun-da xususi tedbir tedbir etmek isteyirem.",
    tr: "Merhaba, Xurcun'da ozel bir etkinlik duzenlemek istiyorum.",
    ru: "Zdravstvuyte, ya khochu organizovat osoboye meropriyatiye v Xurcun.",
    en: "Hello, I would like to organize a special event at Xurcun.",
  };
  return `https://wa.me/${phone}?text=${encodeURIComponent(messages[lang] || messages.en)}`;
}

export default function Events() {
  const { t, lang } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, {
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%" },
        y: 30, opacity: 0, duration: 0.8, ease: "power2.out",
      });
      gsap.from(contentRef.current?.children || [], {
        scrollTrigger: { trigger: contentRef.current, start: "top 85%" },
        y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
      });
      gsap.from(ctaRef.current, {
        scrollTrigger: { trigger: ctaRef.current, start: "top 90%" },
        y: 20, opacity: 0, duration: 0.6, ease: "power2.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="events" ref={sectionRef} className="relative bg-[#0A0A0A] py-16 md:py-20 px-[3vw]">
      {/* Header */}
      <div ref={headerRef} className="max-w-4xl mx-auto text-center mb-10">
        <span className="block font-mono text-[11px] tracking-[0.15em] text-[#D4A853] mb-4">
          {t.events_label}
        </span>
        <h2 className="font-display text-3xl md:text-4xl text-white leading-[1.1] mb-4">
          {t.events_title}
        </h2>
        <p className="text-white/50 text-sm max-w-2xl mx-auto leading-relaxed">
          {t.events_intro}
        </p>
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-5xl mx-auto space-y-6">

        {/* Capacity Cards — Restaurant + Lounge */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Restaurant */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <span className="text-[10px] font-mono tracking-[0.15em] text-[#C9A96E]/60">
              {t.events_capacity_restaurant_label}
            </span>
            <h3 className="text-white text-lg font-medium mt-2">{(t as any).events_capacity_restaurant_title}</h3>
            <p className="text-white/40 text-xs mt-2 leading-relaxed">{(t as any).events_capacity_restaurant_desc}</p>
            <p className="text-[#C9A96E] text-sm font-medium mt-3">{(t as any).events_capacity_restaurant_guests}</p>
          </div>
          {/* Lounge */}
          <div className="bg-[#111] border border-[#222] rounded-xl p-6">
            <span className="text-[10px] font-mono tracking-[0.15em] text-[#C9A96E]/60">
              {t.events_capacity_lounge_label}
            </span>
            <h3 className="text-white text-lg font-medium mt-2">{(t as any).events_capacity_lounge_title}</h3>
            <p className="text-white/40 text-xs mt-2 leading-relaxed">{(t as any).events_capacity_lounge_desc}</p>
            <p className="text-[#C9A96E] text-sm font-medium mt-3">{(t as any).events_capacity_lounge_guests}</p>
          </div>
        </div>

        {/* Seating Layout Options */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">{t.events_seating_title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SEATING_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2 text-white/70 text-sm">
                <ChevronRight className="w-3.5 h-3.5 text-[#C9A96E]/60 shrink-0" />
                {(t as any)[key]}
              </div>
            ))}
          </div>
        </div>

        {/* Technology & Audio-Visual Features */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">{t.events_tech_title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TECH_KEYS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-start gap-3">
                  <Icon className="w-4 h-4 text-[#C9A96E]/60 shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm">{(t as any)[item.key]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Types */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6">
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">{t.events_types_title}</h3>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPE_KEYS.map((key) => (
              <span
                key={key}
                className="text-[12px] text-white/60 bg-white/5 border border-[#333] px-3 py-1.5 rounded-full"
              >
                {(t as any)[key]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div ref={ctaRef} className="max-w-4xl mx-auto text-center mt-10">
        <p className="text-white/60 text-sm mb-4">{t.events_cta_text}</p>
        <a
          href={getWhatsappEventUrl(lang)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-sm px-8 py-3 rounded-full transition-all duration-300 inline-flex items-center gap-2"
          style={{ backgroundColor: "#D4A853", color: "#0A0A0A" }}
        >
          {t.events_reserve}
        </a>
      </div>
    </section>
  );
}
