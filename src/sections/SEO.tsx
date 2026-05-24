import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../lib/LanguageContext'
import { getFinalPageSeo } from '../lib/seoStore'
import { getTrackingSettings } from '../lib/trackingSettings'
import { trpc } from '../providers/trpc'

type Lang = 'az' | 'ru' | 'en' | 'tr'

/* ─── OG locale per language ─── */
const OG_LOCALES: Record<Lang, string> = {
  az: 'az_AZ',
  ru: 'ru_RU',
  en: 'en_US',
  tr: 'tr_TR',
}

const CANONICAL_ROOT = 'https://xurcun.az/'

interface SeoProps {
  page?: string
  branchSlug?: string
}

function getHashPath(): string {
  const hash = window.location.hash
  if (hash && hash.length > 1) {
    return hash.slice(1).split('?')[0] || '/'
  }
  return window.location.pathname || '/'
}

export default function SEO({ page = 'home', branchSlug }: SeoProps) {
  const { lang } = useLanguage()
  const currentPath = getHashPath()

  /* ─── 1. Path-based SEO (seoPages table) — most granular ─── */
  const { data: pathSeo } = trpc.seo.getByPath.useQuery(
    { path: currentPath, lang },
    { staleTime: 60_000, retry: false }
  )

  /* ─── 2. Legacy page-based SEO (seoSettings table) ─── */
  const { data: dbSeo } = trpc.seo.getByPage.useQuery(
    { page },
    { staleTime: 60_000, retry: false }
  )

  /* ─── 3. Auto-generated fallback (dynamic menu-based > static templates) ─── */
  const fallback = getFinalPageSeo(page, branchSlug)

  const resolve = (dbVal: string | null | undefined, fbVal: string): string => {
    if (dbVal && String(dbVal).trim().length > 0) return String(dbVal).trim()
    return fbVal
  }

  let title: string
  let description: string
  let keywords: string
  let ogTitle: string
  let ogDescription: string
  let ogImage: string
  let canonicalUrl: string
  let robotsContent = 'index, follow'

  /* ─── Priority: path-based (seoPages) > legacy (seoSettings) > fallback ─── */
  const hasPathSeo = pathSeo && pathSeo.id > 0 && pathSeo.title

  if (hasPathSeo) {
    title = resolve(pathSeo.title, fallback.titleAz)
    description = resolve(pathSeo.description, fallback.descriptionAz)
    keywords = resolve(pathSeo.keywords, fallback.keywordsAz)
    ogTitle = resolve(pathSeo.ogTitle, title)
    ogDescription = resolve(pathSeo.ogDescription, description)
    ogImage = resolve(pathSeo.ogImage, fallback.ogImage)
    canonicalUrl = resolve(pathSeo.canonical, CANONICAL_ROOT)
    if (pathSeo.noIndex) robotsContent = 'noindex, nofollow'
  } else {
    const seo = {
      titleAz:       resolve(dbSeo?.titleAz,       fallback.titleAz),
      titleRu:       resolve(dbSeo?.titleRu,       fallback.titleRu),
      titleEn:       resolve(dbSeo?.titleEn,       fallback.titleEn),
      titleTr:       resolve(dbSeo?.titleTr,       fallback.titleTr),
      descriptionAz: resolve(dbSeo?.descriptionAz, fallback.descriptionAz),
      descriptionRu: resolve(dbSeo?.descriptionRu, fallback.descriptionRu),
      descriptionEn: resolve(dbSeo?.descriptionEn, fallback.descriptionEn),
      descriptionTr: resolve(dbSeo?.descriptionTr, fallback.descriptionTr),
      keywordsAz:    resolve(dbSeo?.keywordsAz,    fallback.keywordsAz),
      keywordsRu:    resolve(dbSeo?.keywordsRu,    fallback.keywordsRu),
      keywordsEn:    resolve(dbSeo?.keywordsEn,    fallback.keywordsEn),
      keywordsTr:    resolve(dbSeo?.keywordsTr,    fallback.keywordsTr),
      ogTitleAz:       resolve(dbSeo?.ogTitleAz,       fallback.ogTitleAz),
      ogTitleRu:       resolve(dbSeo?.ogTitleRu,       fallback.ogTitleRu),
      ogTitleEn:       resolve(dbSeo?.ogTitleEn,       fallback.ogTitleEn),
      ogTitleTr:       resolve(dbSeo?.ogTitleTr,       fallback.ogTitleTr),
      ogDescriptionAz: resolve(dbSeo?.ogDescriptionAz, fallback.ogDescriptionAz),
      ogDescriptionRu: resolve(dbSeo?.ogDescriptionRu, fallback.ogDescriptionRu),
      ogDescriptionEn: resolve(dbSeo?.ogDescriptionEn, fallback.ogDescriptionEn),
      ogDescriptionTr: resolve(dbSeo?.ogDescriptionTr, fallback.ogDescriptionTr),
      ogImage: resolve(dbSeo?.ogImage ?? undefined, fallback.ogImage),
    }

    const suffix = lang === 'az' ? 'Az' : lang === 'ru' ? 'Ru' : lang === 'tr' ? 'Tr' : 'En'

    title       = seo[`title${suffix}` as keyof typeof seo] as string
    description = seo[`description${suffix}` as keyof typeof seo] as string
    keywords    = seo[`keywords${suffix}` as keyof typeof seo] as string
    ogTitle       = (seo[`ogTitle${suffix}` as keyof typeof seo] as string) || title
    ogDescription = (seo[`ogDescription${suffix}` as keyof typeof seo] as string) || description
    ogImage       = seo.ogImage || 'https://xurcun.az/assets/og-default.jpg'
    canonicalUrl  = CANONICAL_ROOT
  }

  const ogUrl = canonicalUrl

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Xurcun White City Restaurant & Lounge" />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph — per language */}
      <meta property="og:type" content="restaurant" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="Xurcun White City Restaurant & Lounge" />
      <meta property="og:locale" content={OG_LOCALES[lang as Lang]} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Theme Color */}
      <meta name="theme-color" content="#0A0A0A" />
      <meta name="msapplication-TileColor" content="#0A0A0A" />

      {/* Google Search Console Verification */}
      {(() => {
        const gsv = getTrackingSettings().googleSiteVerification?.trim()
        return gsv ? <meta name="google-site-verification" content={gsv} /> : null
      })()}
    </Helmet>
  )
}
