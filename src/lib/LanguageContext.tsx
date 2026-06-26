import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { translations, type Language } from './translations'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: Record<string, string>
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Try to read ?lang= from URL on initial load
  const detectBrowserLang = (): Language | null => {
    if (typeof navigator === 'undefined') return null
    const navLang = navigator.language || (navigator as any).userLanguage || ''
    const code = navLang.toLowerCase().split('-')[0]
    const map: Record<string, Language> = { az: 'az', tr: 'tr', ru: 'ru', en: 'en', ar: 'ar' }
    // Regional mappings
    if (code === 'tk' || code === 'ky' || code === 'uz') return 'tr'
    if (code === 'uk' || code === 'be') return 'ru'
    return map[code] || null
  }

  const getInitialLang = (): Language => {
    if (typeof window === 'undefined') return 'az'
    const params = new URLSearchParams(window.location.search)
    const urlLang = params.get('lang')
    if (urlLang === 'az' || urlLang === 'ru' || urlLang === 'en' || urlLang === 'tr' || urlLang === 'ar') return urlLang
    // Check stored preference
    const stored = localStorage.getItem('xurcun_lang')
    if (stored === 'az' || stored === 'ru' || stored === 'en' || stored === 'tr' || stored === 'ar') return stored
    // First visit — detect from browser language
    const detected = detectBrowserLang()
    if (detected) {
      localStorage.setItem('xurcun_lang', detected)
      return detected
    }
    return 'az'
  }

  const [lang, setLangState] = useState<Language>(getInitialLang)

  // Sync <html lang/dir> on mount and whenever language changes (Arabic = RTL)
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    document.documentElement.lang = newLang
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('xurcun_lang', newLang)
    // Update URL ?lang= param without reload
    const url = new URL(window.location.href)
    url.searchParams.set('lang', newLang)
    window.history.replaceState({}, '', url.toString())
    // Track language change (lazy-loaded — won't block render)
    import('./tracking').then(({ trackLanguageChange }) => {
      trackLanguageChange(newLang)
    }).catch(() => { /* silently fail if tracking not loaded */ })
  }, [])

  // Sync lang from URL changes (back/forward buttons)
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search)
      const urlLang = params.get('lang')
      if (urlLang === 'az' || urlLang === 'ru' || urlLang === 'en' || urlLang === 'tr' || urlLang === 'ar') {
        setLangState(urlLang)
        document.documentElement.lang = urlLang
        document.documentElement.dir = urlLang === 'ar' ? 'rtl' : 'ltr'
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const t = translations[lang]

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
