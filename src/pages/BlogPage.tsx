import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/lib/LanguageContext'
import { BLOG_POSTS } from '@/lib/blogPosts'
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
  tag: { az: 'Blog', ru: 'Блог', en: 'Blog', tr: 'Blog', ar: 'مدوّنة' },
  h1: { az: 'Xurcun Blog', ru: 'Блог Xurcun', en: 'Xurcun Blog', tr: 'Xurcun Blog', ar: 'مدوّنة Xurcun' },
  lead: {
    az: 'Hədiyyə, toy xonçası, premium qutular, şokolad, paxlava və lokum haqqında bələdçilər.',
    ru: 'Гиды о подарках, свадебных хончах, премиальных наборах, шоколаде, пахлаве и лукуме.',
    en: 'Guides on gifts, wedding trays, premium boxes, chocolate, baklava and Turkish delight.',
    tr: 'Hediye, düğün honçası, premium kutular, çikolata, baklava ve lokum rehberleri.',
    ar: 'أدلة عن الهدايا، صواني الزفاف، العلب الفاخرة، الشوكولاتة، البقلاوة والحلقوم.',
  },
  catalog: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
}

export default function BlogPage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  return (
    <div className="xc xcpage">
      <Helmet>
        <title>Blog | Xurcun — hədiyyə, xonça, şirniyyat bələdçisi</title>
        <meta name="description" content="Xurcun blog — toy xonçası, bayram hədiyyələri, premium qutular, şokolad, paxlava və lokum haqqında bələdçilər." />
        <link rel="canonical" href="https://xurcun.az/blog" />
        <meta property="og:title" content="Xurcun Blog — hədiyyə və şirniyyat bələdçiləri" />
        <meta property="og:url" content="https://xurcun.az/blog" />
        <meta property="og:image" content="https://xurcun.az/brand/og-image.jpg" />
      </Helmet>
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
        <p className="xcp-lead">{t(S.lead)}</p>

        <div className="xcp-bloglist">
          {BLOG_POSTS.map((p) => (
            <a className="xcp-blogcard" href={`/blog/${p.slug}`} key={p.slug}>
              <div className="thumb"><img src={p.cover} alt={p.h1} loading="lazy" /></div>
              <div className="meta">
                <h2>{p.h1}</h2>
                <p>{p.lead}</p>
                <span className="more">Oxu →</span>
              </div>
            </a>
          ))}
        </div>

        <div className="xcp-cta">
          <a className="xcp-btn" href="/catalog">{t(S.catalog)}</a>
        </div>
      </main>

      <footer className="xcp-foot">
        <a href="/">{t(S.home)}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
