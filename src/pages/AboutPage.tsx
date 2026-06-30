import { useMemo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import { defaultsForPage, type Lang, type L5 } from '@/lib/pageTextStore'
import SEO from '@/sections/SEO'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

const def = defaultsForPage('about')

export default function AboutPage() {
  const { lang, setLang } = useLanguage()
  const q = trpc.pageText.getAll.useQuery({ page: 'about' }, { retry: false })
  const map = useMemo(() => {
    const m: Record<string, L5> = {}
    ;(q.data ?? []).forEach((r) => { m[r.key] = r.value })
    return m
  }, [q.data])
  const txt = (key: string, l: Lang = lang) => map[key]?.[l] || def[key]?.[l] || def[key]?.az || ''
  return (
    <div className="xc xcpage">
      <SEO page="about" />
      <header className="xcp-head">
        <a href="/" aria-label="Xurcun"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
        <nav className="xcp-langs" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.code} className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </nav>
      </header>

      <main className="xcp-wrap">
        <p className="tag">{txt('tag')}</p>
        <h1>{txt('h1')}</h1>
        <div className="ornament"><img src={EMBLEM} alt="" /></div>
        <p className="xcp-lead">{txt('p1')}</p>
        <p className="xcp-lead">{txt('p2')}</p>

        <h2 className="xcp-h2">{txt('facts_title')}</h2>
        <ul className="xcp-facts">
          <li>{txt('f_year')}</li>
          <li>{txt('f_stores')}</li>
          <li>{txt('f_natural')}</li>
          <li>{txt('f_gift')}</li>
        </ul>

        <div className="xcp-cta">
          <a className="xcp-btn" href="/catalog">{txt('catalog')}</a>
          <a className="xcp-link" href="/faq">FAQ</a>
        </div>
      </main>

      <footer className="xcp-foot">
        <a href="/">{txt('home')}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
