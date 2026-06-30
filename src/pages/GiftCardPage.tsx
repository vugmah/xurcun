import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import { defaultsForPage, type Lang, type L5 } from '@/lib/pageTextStore'
import GiftCardSection from '@/components/GiftCardSection'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const SITE = 'https://xurcun.az'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

export default function GiftCardPage() {
  const { lang, setLang } = useLanguage()

  // Page text overrides (admin CMS). Falls back to in-code defaults so the page
  // renders identical copy while the query loads or when the DB is empty.
  const textQ = trpc.pageText.getAll.useQuery({ page: 'giftcard' }, { retry: false })
  const map = useMemo(() => {
    const m: Record<string, L5> = {}
    ;(textQ.data ?? []).forEach((t) => { m[t.key] = t.value })
    return m
  }, [textQ.data])
  const def = defaultsForPage('giftcard')
  const txt = (key: string, l: Lang = lang) => map[key]?.[l] || def[key]?.[l] || def[key]?.az || ''

  const title = txt('title')
  const desc = txt('desc')
  const url = `${SITE}/gift-card`

  return (
    <div className="xc xcpage">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${SITE}/brand/og-image.jpg`} />
      </Helmet>

      <header className="xcp-head">
        <a href="/" aria-label="Xurcun"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
        <nav className="xcp-langs" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.code} className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </nav>
      </header>

      <GiftCardSection />

      <footer className="xcp-foot">
        <a href="/">{txt('home')}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
