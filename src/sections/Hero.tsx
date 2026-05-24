import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useLanguage } from '../lib/LanguageContext'
import { trackReservation, trackMenuView } from '../lib/tracking'
import { getHomepageImageSrc } from '../lib/homepageImageStore'
import { getTrackingSettings } from '@/lib/trackingSettings'
import { getActiveBranches } from '@/lib/generalSettings'
import { MapPin, X, Utensils } from 'lucide-react'

const BRANCHES = getActiveBranches().map((b) => ({ slug: b.slug, name: b.name, phone: b.whatsapp }));

function getWhatsappUrl(phone: string, branchName: string, lang: string): string {
  const messages: Record<string, string> = {
    az: `Salam, ${branchName} üçün rezervasiya etmək istəyirəm.`,
    tr: `Merhaba, ${branchName} için rezervasyon yapmak istiyorum.`,
    ru: `Здравствуйте, я хочу забронировать столик в ${branchName}.`,
    en: `Hello, I would like to make a reservation at ${branchName}.`,
  }
  const text = encodeURIComponent(messages[lang] || messages.en)
  return `https://wa.me/${phone}?text=${text}`
}

function getNoNumberMessage(lang: string): string {
  const messages: Record<string, string> = {
    az: "Bu filial üçün WhatsApp nömrəsi tezliklə əlavə olunacaq.",
    tr: "Bu şube için WhatsApp numarası yakında eklenecek.",
    ru: "Номер WhatsApp для этого филиала скоро будет добавлен.",
    en: "WhatsApp number for this branch will be added soon.",
  }
  return messages[lang] || messages.en
}

/* ─── Branch Choice Modal ─── */
function BranchModal({
  open,
  onClose,
  lang,
}: {
  open: boolean
  onClose: () => void
  lang: string
}) {
  const [noNumberMsg, setNoNumberMsg] = useState<string | null>(null)

  if (!open) return null

  const handleBranchClick = (branch: typeof BRANCHES[0]) => {
    if (branch.slug === "white-city") {
      window.open(getWhatsappUrl(branch.phone, branch.name, lang), "_blank")
      onClose()
      return
    }

    // Seabreeze — check admin setting
    const settings = getTrackingSettings()
    const phone = settings.seabreezeWhatsapp?.trim()
    if (phone) {
      window.open(getWhatsappUrl(phone, branch.name, lang), "_blank")
      onClose()
    } else {
      setNoNumberMsg(getNoNumberMessage(lang))
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-lg text-[#C9A96E] mb-1 text-center">
          {lang === "az" ? "Filial seçin" : lang === "tr" ? "Şube seçin" : lang === "ru" ? "Выберите филиал" : "Choose branch"}
        </h3>
        <p className="text-white/40 text-xs text-center mb-6">
          {lang === "az" ? "Rezervasiya üçün filial seçin" : lang === "tr" ? "Rezervasyon için şube seçin" : lang === "ru" ? "Выберите филиал для бронирования" : "Select a branch for reservation"}
        </p>

        <div className="space-y-3">
          {BRANCHES.map((branch) => (
            <button
              key={branch.slug}
              onClick={() => handleBranchClick(branch)}
              className="w-full flex items-center gap-3 p-4 bg-[#0A0A0A] border border-[#222] rounded-xl hover:border-[#C9A96E]/40 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium group-hover:text-[#C9A96E] transition-colors">
                  {branch.name}
                </p>
                {branch.phone && (
                  <p className="text-white/30 text-[10px]">{branch.phone}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {noNumberMsg && (
          <div className="mt-4 p-3 bg-amber-400/10 border border-amber-400/20 rounded-lg">
            <p className="text-amber-400 text-xs text-center">{noNumberMsg}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Menu Branch Choice Modal ─── */
function MenuBranchModal({ open, onClose, lang }: { open: boolean; onClose: () => void; lang: string }) {
  if (!open) return null;

  const t2 = {
    title: lang === "az" ? "Filial seçin" : lang === "tr" ? "Şube seçin" : lang === "ru" ? "Выберите филиал" : "Choose branch",
    desc: lang === "az" ? "Baxmaq istədiyiniz menyu filialını seçin." : lang === "tr" ? "Görmek istediğiniz menü şubesini seçin." : lang === "ru" ? "Выберите меню филиала, которое хотите открыть." : "Select which branch menu you would like to view.",
  };

  const handleBranch = (slug: string) => {
    try { trackMenuView((slug === "white-city" ? "white-city" : "seabreeze-marina") as any); } catch { /* tracking not loaded */ }
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    const tracking = params.get("utm_source") || params.get("fbclid") || params.get("gclid");
    let url = `${window.location.origin}${window.location.pathname}#/menu/${slug}`;
    const queryParts: string[] = [];
    if (lang) queryParts.push(`lang=${lang}`);
    if (tracking) queryParts.push(params.toString().split("&").find(p => p.includes("utm_") || p.includes("fbclid") || p.includes("gclid")) || "");
    if (queryParts.length > 0) url += "?" + queryParts.filter(Boolean).join("&");
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111] border border-[#333] rounded-2xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        <h3 className="font-display text-lg text-[#C9A96E] mb-1 text-center">{t2.title}</h3>
        <p className="text-white/40 text-xs text-center mb-6">{t2.desc}</p>
        <div className="space-y-3">
          {BRANCHES.map((b) => (
            <button
              key={b.slug}
              onClick={() => handleBranch(b.slug)}
              className="w-full flex items-center gap-3 p-4 bg-[#0A0A0A] border border-[#222] rounded-xl hover:border-[#C9A96E]/40 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-full bg-[#C9A96E]/10 flex items-center justify-center shrink-0">
                <Utensils className="w-4 h-4 text-[#C9A96E]" />
              </div>
              <span className="text-white text-sm font-medium group-hover:text-[#C9A96E] transition-colors">{b.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t, lang } = useLanguage()
  const labelRef = useRef<HTMLSpanElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sublineRef = useRef<HTMLSpanElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [menuModalOpen, setMenuModalOpen] = useState(false)

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 })
    if (labelRef.current) tl.to(labelRef.current, { opacity: 1, duration: 0.5, ease: 'power2.out' })
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll('.char')
      tl.fromTo(chars, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.02 }, '-=0.2')
    }
    if (sublineRef.current) tl.to(sublineRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6')
    if (ctaRef.current) tl.to(ctaRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
  }, [])

  const titleChars = 'Xurcun White City'.split('')

  const handleScroll = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    if (href === '#contact') trackReservation()
    if (href === '#menu') trackMenuView('all')
  }

  return (
    <>
      <section id="hero" className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: 600 }}>
        <div className="absolute inset-0">
          <img src={getHomepageImageSrc('hero_background')} alt="Xurcun White City" className="w-full h-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.3), rgba(10,10,10,0.7))' }} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <span ref={labelRef} className="font-mono text-xs tracking-[0.2em] text-[#8A8A8A] mb-6" style={{ opacity: 0 }}>
            {t.hero_label}
          </span>

          <h1 ref={titleRef} className="font-display text-[7vw] text-white leading-[1.05] mb-2">
            <span className="block overflow-hidden">
              {titleChars.map((char, i) => (
                <span key={i} className="char inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </h1>

          <span ref={sublineRef} className="font-display italic text-[clamp(18px,3vw,36px)] text-[#D4A853] block" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            Restaurant & Lounge
          </span>

          <div ref={ctaRef} className="flex gap-4 mt-8 flex-wrap justify-center" style={{ opacity: 0 }}>
            <button onClick={() => { try { trackMenuView('all'); } catch { /* */ } setMenuModalOpen(true); }} className="font-body text-sm px-8 py-3 rounded-full transition-all duration-300" style={{ backgroundColor: '#D4A853', color: '#0A0A0A' }} data-gtm="cta_hero_menu">
              {t.hero_cta_menu}
            </button>
            <button
              onClick={() => { trackReservation(); setModalOpen(true); }}
              className="font-body text-sm px-8 py-3 rounded-full border border-white text-white transition-all duration-300 hover:bg-white hover:text-[#0A0A0A]"
              data-gtm="cta_hero_reserve"
            >
              {t.hero_cta_reserve}
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden py-4 border-t border-white/10">
          <div className="flex whitespace-nowrap animate-marquee">
            {[1, 2].map((i) => (
              <span key={i} className="font-mono text-[10px] tracking-[0.15em] text-[#8A8A8A] mx-4">
                {t.marquee_text}{t.marquee_text}
              </span>
            ))}
          </div>
        </div>

        <style>{`@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.animate-marquee{animation:marquee 30s linear infinite}`}</style>
      </section>

      {/* Branch Choice Modal (Reservation) */}
      <BranchModal open={modalOpen} onClose={() => setModalOpen(false)} lang={lang} />

      {/* Menu Branch Choice Modal */}
      <MenuBranchModal open={menuModalOpen} onClose={() => setMenuModalOpen(false)} lang={lang} />
    </>
  )
}
