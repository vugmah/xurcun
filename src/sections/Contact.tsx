import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../lib/LanguageContext'
import { trackPhoneClick, trackWhatsAppClick, trackInstagramClick, trackGoogleReview, trackFacebookClick, trackContactSubmit } from '../lib/tracking'
import { getGeneralSettings, getBranches } from '@/lib/generalSettings'
import { trpc } from '@/providers/trpc'

gsap.registerPlugin(ScrollTrigger)

const quickLinks = [
  { label: 'nav_menu', href: '#menu' },
  { label: 'nav_about', href: '#about' },
  { label: 'nav_gallery', href: '#gallery' },
  { label: 'nav_events', href: '#events' },
  { label: 'nav_reserve', href: '#contact' },
]

/* ─── SVG Social Icons ─── */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/* ═══════════════════════════════════════════
   CONTACT FORM
   ═══════════════════════════════════════════ */

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const submit = trpc.mail.submitContact.useMutation({
    onSuccess: () => {
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      trackContactSubmit();
      setTimeout(() => setStatus("idle"), 4000);
    },
    onError: (err) => {
      setStatus("error");
      setErrorMsg(err.message || "Göndərilmədi. Zəhmət olmasa yenidən cəhd edin.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setStatus("loading");
    submit.mutate({
      name: form.name,
      email: form.email,
      subject: form.subject || undefined,
      message: form.message,
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto mb-16">
      <div className="bg-[#111] border border-[#222] rounded-xl p-6 md:p-8">
        <div className="max-w-xl mx-auto">
          <h3 className="font-display text-xl text-white text-center mb-2">Bizimlə Əlaqə</h3>
          <p className="text-white/40 text-sm text-center mb-6">
            Sualınız və ya təklifiniz var? Aşağıdakı formu doldurun, tezliklə sizinlə əlaqə saxlayaq.
          </p>

          {status === "success" ? (
            <div className="bg-green-400/10 border border-green-400/20 rounded-lg p-4 text-center">
              <p className="text-green-400 text-sm font-medium">Mesajınız uğurla göndərildi!</p>
              <p className="text-white/40 text-xs mt-1">Tezliklə sizinlə əlaqə saxlayacayıq.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Adınız</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50 transition-colors"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50 transition-colors"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Mövzu (isteğe bağlı)</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50 transition-colors"
                  placeholder="Mövzu"
                />
              </div>
              <div>
                <label className="block text-white/50 text-xs mb-1.5">Mesajınız</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#C9A96E]/50 transition-colors resize-none"
                  placeholder="Mesajınızı yazın..."
                />
              </div>

              {status === "error" && (
                <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                  <p className="text-red-400 text-xs">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#C9A96E] hover:bg-[#B8985E] disabled:opacity-50 disabled:cursor-not-allowed text-[#0A0A0A] font-medium text-sm py-2.5 rounded-lg transition-colors"
              >
                {status === "loading" ? "Göndərilir..." : "Mesaj Göndər"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const { t } = useLanguage()
  const { data: emails } = trpc.mail.getContactEmails.useQuery()
  const { data: settings } = trpc.settings.getAll.useQuery()
  const sectionRef = useRef<HTMLElement>(null)
  const colsRef = useRef<(HTMLDivElement | null)[]>([])

  const CORRECT_MAPS_URL = 'https://maps.app.goo.gl/XeTM3L1AkT3h1Pjj6?g_st=ic'

  const social = {
    instagramUrl: (settings?.instagram_url as string) || '',
    facebookUrl: (settings?.facebook_url as string) || '',
    googleMapsUrl: (settings?.google_maps_url as string) || CORRECT_MAPS_URL,
    googleMapsEmbedUrl: (settings?.google_maps_embed_url as string) || '',
    googleReviewUrl: (settings?.google_review_url as string) || '',
    showInstagram: (settings?.show_social_links as string) !== 'false',
    showFacebook: (settings?.show_social_links as string) !== 'false',
    showGoogleReview: (settings?.show_google_review as string) !== 'false',
  }

  /* google_review_url boşsa google_maps_url fallback */
  const reviewUrl = social.googleReviewUrl || social.googleMapsUrl

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      colsRef.current.forEach((col) => {
        if (!col) return
        col.querySelectorAll('.animate-in').forEach((el, j) => {
          gsap.fromTo(el, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: j * 0.08,
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          })
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer id="contact" ref={sectionRef} className="relative bg-[#0A0A0A]" style={{ padding: '10vh 3vw 6vh' }}>
      <ContactForm />
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* ─── Column 1 ─── */}
        <div ref={(el) => { colsRef.current[0] = el }}>
          <h2 className="animate-in block font-display text-[28px] text-white mb-2">XURCUN</h2>
          <span className="animate-in block font-body text-sm font-light text-[#8A8A8A] mb-4">{t.contact_brand}</span>
          <p className="animate-in block font-body text-sm font-light text-[#8A8A8A] mb-2">{t.contact_address}</p>
          <p className="animate-in block font-body text-sm font-light text-[#8A8A8A] mb-4">{t.contact_hours}</p>
          <a href={social.instagramUrl || '#'} target="_blank" rel="noopener noreferrer" className="animate-in font-mono text-[11px] tracking-[0.1em] text-[#D4A853] link-underline" data-gtm="link_instagram" onClick={() => trackInstagramClick()}>{social.instagramUrl ? '@xurcun' : ''}</a>
        </div>

        {/* ─── Column 2 ─── */}
        <div ref={(el) => { colsRef.current[1] = el }}>
          <p className="animate-in font-mono text-[11px] tracking-[0.15em] text-[#8A8A8A] mb-4">{t.contact_quicklinks}</p>
          <ul className="space-y-3">
            {quickLinks.map((link, i) => (
              <li key={i} className="animate-in">
                <a href={link.href} onClick={(e) => handleClick(e, link.href)} className="font-body text-sm text-[#8A8A8A] link-underline transition-colors duration-300 hover:text-white">
                  {t[link.label as keyof typeof t] as string}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ─── Column 3 ─── */}
        <div ref={(el) => { colsRef.current[2] = el }}>
          {/* Phone */}
          <p className="animate-in font-body text-sm text-white mb-2">
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#8A8A8A] block mb-1">{t.contact_phone}</span>
            <a href={`tel:${getGeneralSettings().phone}`} className="hover:text-[#D4A853] transition-colors" data-gtm="cta_call" onClick={() => trackPhoneClick()}>{getGeneralSettings().phone}</a>
          </p>
          {/* WhatsApp */}
          <p className="animate-in font-body text-sm mb-4">
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#8A8A8A] block mb-1">WhatsApp</span>
            <a
              href={`https://wa.me/${getGeneralSettings().whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-2"
              data-gtm="whatsapp_click"
              onClick={() => trackWhatsAppClick()}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              +994 50 213 05 55
            </a>
          </p>
          {/* Email */}
          <p className="animate-in font-body text-sm text-[#8A8A8A] mb-6">
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#8A8A8A] block mb-1">{t.contact_email}</span>
            {emails?.infoEmail ?? "info@xurcun.az"}
          </p>

          {/* Social Media Icons */}
          <p className="animate-in font-mono text-[10px] tracking-[0.15em] text-[#8A8A8A] mb-3">{t.social_follow}</p>
          <div className="animate-in flex items-center gap-5">
            {social.showInstagram && (
              <a href={social.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={t.social_instagram} data-gtm="instagram_click" onClick={() => trackInstagramClick()} className="text-[#8A8A8A] hover:text-[#D4A853] transition-all duration-300">
                <InstagramIcon className="w-5 h-5" />
              </a>
            )}
            {social.showFacebook && (
              <a href={social.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label={t.social_facebook} data-gtm="facebook_click" onClick={() => trackFacebookClick()} className="text-[#8A8A8A] hover:text-[#D4A853] transition-all duration-300">
                <FacebookIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ─── Google Reviews CTA ─── */}
      {social.showGoogleReview && (
        <div className="max-w-[1400px] mx-auto mt-12">
          <div className="border border-[#B87333]/30 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ backgroundColor: 'rgba(184,115,51,0.05)' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(184,115,51,0.15)' }}>
                <GoogleIcon className="w-5 h-5 text-[#D4A853]" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{t.google_review_title}</p>
                <p className="text-white/50 text-xs mt-0.5">{t.google_review_text}</p>
              </div>
            </div>
            <a
              href={reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-gtm="google_review_click"
              onClick={() => trackGoogleReview()}
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] px-5 py-2.5 border border-[#B87333] text-[#D4A853] rounded-full transition-all duration-300 hover:bg-[#D4A853] hover:text-[#0A0A0A]"
            >
              {t.google_review_button}
            </a>
          </div>
        </div>
      )}

      {/* ─── Google Maps ─── */}
      <div className="max-w-[1400px] mx-auto mt-12">
        {/* Embed URL varsa → harita iframe göster, yoksa lokasyon kartları fallback */}
        {social.googleMapsEmbedUrl && social.googleMapsEmbedUrl.trim() !== "" ? (
          <div className="w-full rounded-sm border border-[#222] overflow-hidden mb-4">
            <iframe
              src={social.googleMapsEmbedUrl}
              width="100%"
              height="320"
              style={{ border: 0, filter: 'grayscale(100%) invert(92%)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Xurcun White City Location"
            />
          </div>
        ) : (
          /* Fallback: Lokasyon kartları — iframe embed yoksa */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {getBranches().filter((b: any) => b.isActive !== false).map((branch: any) => (
              <div
                key={branch.slug || branch.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-[#222] bg-[#111]"
              >
                <div className="w-9 h-9 rounded-full bg-[#C9A96E] flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-4 h-4 text-[#0A0A0A]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white truncate">{branch.name || 'Xurcun'}</p>
                  <p className="text-xs text-white/50 truncate">{branch.address || ''}</p>
                </div>
                {branch.mapsUrl && (
                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-md bg-[#C9A96E] text-[#0A0A0A] text-xs font-semibold hover:bg-[#D4A853] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Xəritədə aç
                  </a>
                )}
              </div>
            ))}
            {/* Static fallback: branches yoksa varsayılan kart göster */}
            {getBranches().length === 0 && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-[#222] bg-[#111]">
                <div className="w-9 h-9 rounded-full bg-[#C9A96E] flex items-center justify-center shrink-0">
                  <MapPinIcon className="w-4 h-4 text-[#0A0A0A]" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-white">Xurcun White City</p>
                  <p className="text-xs text-white/50">1-ci Yaşıl Ada, Bakı, Azərbaycan</p>
                </div>
                <a
                  href={social.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-1.5 rounded-md bg-[#C9A96E] text-[#0A0A0A] text-xs font-semibold hover:bg-[#D4A853] transition-colors"
                >
                  Xəritədə aç
                </a>
              </div>
            )}
          </div>
        )}
        {/* Her zaman "Xəritədə aç" butonu göster */}
        <a
          href={social.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-gtm="maps_click"
          onClick={() => { import('../lib/tracking').then(m => m.trackMapsClick()) }}
          className="flex items-center justify-center gap-3 w-full h-[72px] rounded-sm border border-[#222] bg-[#111] hover:bg-[#D4A853] hover:border-[#D4A853] transition-all duration-300 group"
        >
          <MapPinIcon className="w-5 h-5 text-[#D4A853] group-hover:text-[#0A0A0A] transition-colors duration-300" />
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#8A8A8A] group-hover:text-[#0A0A0A] transition-colors duration-300">
            {(t.maps_open_button as string) || 'Xəritədə aç'}
          </span>
          <svg className="w-4 h-4 text-[#8A8A8A]/40 group-hover:text-[#0A0A0A] group-hover:translate-x-1 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>

      {/* ─── Footer Bottom ─── */}
      <div className="max-w-[1400px] mx-auto mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] text-[#8A8A8A]">{t.contact_copyright}</span>
          <a href="#/privacy" className="font-mono text-[10px] text-[#8A8A8A]/50 hover:text-[#D4A853] transition-colors">Privacy</a>
          <a href="#/cookie-policy" className="font-mono text-[10px] text-[#8A8A8A]/50 hover:text-[#D4A853] transition-colors">Cookies</a>
        </div>
        <div className="flex items-center gap-4">
          {/* Social icons footer bottom */}
          {(social.showInstagram || social.showFacebook) && (
            <div className="flex items-center gap-3 mr-2">
              {social.showInstagram && (
                <a href={social.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={t.social_instagram} data-gtm="instagram_click" onClick={() => trackInstagramClick()} className="text-[#8A8A8A]/50 hover:text-[#D4A853] transition-all duration-300">
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {social.showFacebook && (
                <a href={social.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label={t.social_facebook} data-gtm="facebook_click" onClick={() => trackFacebookClick()} className="text-[#8A8A8A]/50 hover:text-[#D4A853] transition-all duration-300">
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
          <span className="text-white/10">|</span>
          <a
            href={social.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-gtm="maps_click"
            onClick={() => { import('../lib/tracking').then(m => m.trackMapsClick()) }}
            className="font-mono text-[10px] text-[#B87333] hover:text-[#D4A853] transition-colors"
          >
            {t.contact_location}
          </a>
        </div>
      </div>
    </footer>
  )
}
