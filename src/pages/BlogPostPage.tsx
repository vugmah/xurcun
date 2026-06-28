import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router'
import { useLanguage } from '@/lib/LanguageContext'
import { getBlogPost, pickL } from '@/lib/blogPosts'
import NotFoundPage from './NotFoundPage'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'
const SITE = 'https://xurcun.az'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]
type M = Record<Lang, string>
const S = {
  home: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
  blog: { az: 'Blog', ru: 'Блог', en: 'Blog', tr: 'Blog', ar: 'مدوّنة' },
  catalog: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
}

export default function BlogPostPage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getBlogPost(slug) : undefined
  if (!post) return <NotFoundPage />

  const url = `${SITE}/blog/${post.slug}`
  const img = `${SITE}${post.cover}`
  const title = pickL(post.title, lang)
  const desc = pickL(post.desc, lang)
  const h1 = pickL(post.h1, lang)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: h1,
    description: desc,
    image: img,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Organization', name: 'Xurcun' },
    publisher: {
      '@type': 'Organization',
      name: 'Xurcun Chain of Boutiques',
      logo: { '@type': 'ImageObject', url: `${SITE}/brand/logo-gold.png` },
    },
  }
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t(S.blog), item: `${SITE}/blog` },
      { '@type': 'ListItem', position: 2, name: h1, item: url },
    ],
  }

  return (
    <div className="xc xcpage">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={img} />
        <meta name="twitter:image" content={img} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
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
        <nav className="xcp-crumb" aria-label="Breadcrumb">
          <a href="/blog">{t(S.blog)}</a> <span>/</span> <span>{h1}</span>
        </nav>
        <h1>{h1}</h1>
        <div className="ornament"><img src={EMBLEM} alt="" /></div>

        <article className="xcp-article">
          <img className="cover" src={post.cover} alt={h1} />
          <p className="xcp-lead">{pickL(post.lead, lang)}</p>
          {post.sections.map((sec, i) => (
            <section key={i}>
              <h2>{pickL(sec.h2, lang)}</h2>
              {sec.body.map((b, j) => <p key={j}>{pickL(b, lang)}</p>)}
            </section>
          ))}
        </article>

        <div className="xcp-cta">
          <a className="xcp-btn" href="/catalog">{t(S.catalog)}</a>
          <a className="xcp-link" href="/blog">{t(S.blog)}</a>
        </div>
      </main>

      <footer className="xcp-foot">
        <a href="/">{t(S.home)}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
