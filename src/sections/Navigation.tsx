import { useEffect, useState } from 'react'
import { useLanguage } from '../lib/LanguageContext'
import type { Language } from '../lib/translations'
import { trackReservation, trackLanguageChange } from '../lib/tracking'
import { getHomepageImageSrc } from '../lib/homepageImageStore'

const navLinks = [
  { key: 'nav_menu' as const, href: '#menu' },
  { key: 'nav_about' as const, href: '#about' },
  { key: 'nav_gallery' as const, href: '#gallery' },
  { key: 'nav_events' as const, href: '#events' },
  { key: 'nav_find_us' as const, href: '#find-us' },
  { key: 'nav_contact' as const, href: '#contact' },
]

const languages: { code: Language; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' },
]

export default function Navigation() {
  const { lang, setLang, t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className="fixed top-0 left-0 w-full z-[100] transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,10,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="flex items-center justify-between px-[3vw] py-4 max-w-[1400px] mx-auto">
        {/* Logo - centered on mobile, left on desktop */}
        <a href="#" className="flex items-center lg:order-1">
          <img 
            src={getHomepageImageSrc('logo')}
            loading="eager" 
            alt="XURCUN" 
            className="h-10 md:h-12 w-auto drop-shadow-[0_0_8px_rgba(212,168,83,0.3)]" 
          />
        </a>

        {/* Desktop nav - centered */}
        <div className="hidden lg:flex items-center gap-7 lg:order-2 mx-auto">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleClick(e, link.href)}
              className="font-mono text-[13px] uppercase tracking-[0.08em] text-white link-underline transition-colors duration-300 hover:text-[#D4A853]"
            >
              {t[link.key]}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4 lg:order-3">
          {/* Language switcher */}
          <div className="hidden lg:flex items-center gap-1">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); trackLanguageChange(l.code); }}
                className={`font-mono text-[11px] tracking-wider px-2 py-1 rounded transition-all duration-300 ${
                  lang === l.code
                    ? 'text-[#0A0A0A] bg-[#D4A853]'
                    : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <a
            href="#contact"
            onClick={(e) => { trackReservation(); handleClick(e, '#contact'); }}
            className="hidden md:inline-block font-mono text-[11px] uppercase tracking-[0.08em] px-5 py-2.5 border border-white text-white rounded-full transition-all duration-300 hover:bg-white hover:text-[#0A0A0A]"
            data-gtm="cta_nav_reserve"
          >
            {t.nav_reserve}
          </a>

          {/* Mobile hamburger */}
          <button className="lg:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
            <span className={`w-6 h-px bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-px bg-white transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
        style={{ backgroundColor: 'rgba(10,10,10,0.97)' }}
      >
        <div className="flex flex-col items-center gap-6 py-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={(e) => handleClick(e, link.href)} className="font-mono text-sm uppercase tracking-[0.1em] text-white">
              {t[link.key]}
            </a>
          ))}
          <div className="flex items-center gap-2 mt-2">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); trackLanguageChange(l.code); }}
                className={`font-mono text-[12px] tracking-wider px-3 py-1.5 rounded transition-all ${
                  lang === l.code ? 'text-[#0A0A0A] bg-[#D4A853]' : 'text-[#8A8A8A] hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <a href="/#/reservation" className="font-mono text-xs uppercase tracking-[0.08em] px-6 py-3 border border-[#D4A853] text-[#D4A853] rounded-full mt-2">
            {t.nav_reserve}
          </a>
        </div>
      </div>
    </nav>
  )
}
