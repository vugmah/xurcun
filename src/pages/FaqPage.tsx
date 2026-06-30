import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import SEO from '@/sections/SEO'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]
type M = Record<Lang, string>

const S = {
  home: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
  tag: { az: 'Kömək', ru: 'Помощь', en: 'Help', tr: 'Yardım', ar: 'مساعدة' },
  h1: { az: 'Tez-tez verilən suallar', ru: 'Часто задаваемые вопросы', en: 'Frequently asked questions', tr: 'Sıkça sorulan sorular', ar: 'الأسئلة الشائعة' },
  catalog: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
}

const EMPTY = { az: 'Tezliklə.', ru: 'Скоро.', en: 'Coming soon.', tr: 'Yakında.', ar: 'قريبًا.' }

export default function FaqPage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const faqQ = trpc.faq.list.useQuery()
  const items = (faqQ.data ?? []).map((f) => ({ q: f.question as M, a: f.answer as M }))
  return (
    <div className="xc xcpage">
      <SEO page="faq" />
      <header className="xcp-head">
        <a href="/" aria-label="Xurcun"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
        <nav className="xcp-langs" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.code} className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </nav>
      </header>

      <main className="xcp-wrap">
        <p className="tag">{t(S.tag)}</p>
        <h1>{t(S.h1)}</h1>
        <div className="ornament"><img src={EMBLEM} alt="" /></div>

        {faqQ.isLoading ? (
          <div className="xcp-state" role="status"><div className="xcp-spin" aria-label="Loading" /></div>
        ) : items.length === 0 ? (
          <p className="xcp-state muted">{t(EMPTY)}</p>
        ) : (
          <div className="xcp-faq">
            {items.map((f, i) => (
              <details key={i} open={i === 0}>
                <summary>{t(f.q)}</summary>
                <div className="ans">{t(f.a)}</div>
              </details>
            ))}
          </div>
        )}

        <div className="xcp-cta">
          <a className="xcp-btn" href="/catalog">{t(S.catalog)}</a>
          <a className="xcp-link" href="/about">{t({ az: 'Haqqımızda', ru: 'О нас', en: 'About us', tr: 'Hakkımızda', ar: 'من نحن' })}</a>
        </div>
      </main>

      <footer className="xcp-foot">
        <a href="/">{t(S.home)}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
