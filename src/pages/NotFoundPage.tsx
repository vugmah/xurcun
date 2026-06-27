import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/lib/LanguageContext'

const LOGO = '/brand/logo-gold.png'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const T: Record<string, Record<Lang, string>> = {
  title: { az: 'Səhifə tapılmadı', ru: 'Страница не найдена', en: 'Page not found', tr: 'Sayfa bulunamadı', ar: 'الصفحة غير موجودة' },
  desc: {
    az: 'Axtardığınız səhifə mövcud deyil və ya köçürülüb.',
    ru: 'Запрашиваемая страница не существует или была перемещена.',
    en: 'The page you are looking for does not exist or has moved.',
    tr: 'Aradığınız sayfa mevcut değil veya taşınmış.',
    ar: 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.',
  },
  home: { az: 'Ana səhifəyə qayıt', ru: 'На главную', en: 'Back to home', tr: 'Ana sayfaya dön', ar: 'العودة للرئيسية' },
}

export default function NotFoundPage() {
  const { lang } = useLanguage()
  const l = (lang as Lang) in T.title ? (lang as Lang) : 'az'

  // Override the static index.html robots tag in place (single tag, guaranteed
  // noindex) so unknown routes aren't indexed — avoids the soft-404 problem.
  // Restored on unmount so navigating to a real page is indexable again.
  useEffect(() => {
    const m = document.querySelector('meta[name="robots"]')
    if (!m) return
    const prev = m.getAttribute('content')
    m.setAttribute('content', 'noindex, follow')
    return () => { if (prev !== null) m.setAttribute('content', prev) }
  }, [])

  return (
    <>
      <Helmet>
        <title>404 — Xurcun</title>
      </Helmet>
      <div
        style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24,
          textAlign: 'center', background: '#F6F2E9', color: '#2E2A25',
          fontFamily: 'Montserrat, system-ui, sans-serif',
        }}
      >
        <img src={LOGO} alt="Xurcun" style={{ height: 48, marginBottom: 8 }} />
        <div style={{ fontFamily: 'Rufolo, "Cormorant Garamond", serif', fontSize: 'clamp(28px,6vw,44px)', fontWeight: 600, color: '#7E6228' }}>404</div>
        <h1 style={{ fontFamily: 'Rufolo, "Cormorant Garamond", serif', fontSize: 'clamp(20px,4vw,28px)', fontWeight: 600, margin: 0 }}>{T.title[l]}</h1>
        <p style={{ color: '#6B6457', fontSize: 15, maxWidth: 420, lineHeight: 1.6, margin: 0 }}>{T.desc[l]}</p>
        <a
          href="/"
          style={{
            marginTop: 8, minHeight: 44, display: 'inline-flex', alignItems: 'center',
            padding: '12px 28px', background: '#9D7C38', color: '#F6F2E9',
            fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
            textDecoration: 'none', borderRadius: 2,
          }}
        >
          {T.home[l]}
        </a>
      </div>
    </>
  )
}
