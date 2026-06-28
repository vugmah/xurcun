import { useMemo } from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import '@/xurcun-base.css'
import '@/xurcun-catalog.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'
const WA = '994502121811'
const ORIGIN = 'https://xurcun.az'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]
type M = Record<Lang, string>
const S = {
  catalog: { az: 'Kataloq', ru: 'Каталог', en: 'Catalogue', tr: 'Katalog', ar: 'الكتالوج' },
  back: { az: 'Kataloqa qayıt', ru: 'Назад в каталог', en: 'Back to catalogue', tr: 'Kataloğa dön', ar: 'العودة إلى الكتالوج' },
  loading: { az: 'Yüklənir…', ru: 'Загрузка…', en: 'Loading…', tr: 'Yükleniyor…', ar: 'جارٍ التحميل…' },
  notfound: { az: 'Məhsul tapılmadı.', ru: 'Товар не найден.', en: 'Product not found.', tr: 'Ürün bulunamadı.', ar: 'المنتج غير موجود.' },
  order: { az: 'WhatsApp ilə sifariş et', ru: 'Заказать в WhatsApp', en: 'Order on WhatsApp', tr: 'WhatsApp ile sipariş ver', ar: 'اطلب عبر واتساب' },
  ask_price: { az: 'Qiymət üçün soruşun', ru: 'Цена по запросу', en: 'Price on request', tr: 'Fiyat için sorun', ar: 'السعر عند الطلب' },
  related: { az: 'Bənzər məhsullar', ru: 'Похожие товары', en: 'You may also like', tr: 'Benzer ürünler', ar: 'منتجات مشابهة' },
  wa_intro: { az: 'Salam! Bu məhsulu sifariş etmək istəyirəm:', ru: 'Здравствуйте! Хочу заказать этот товар:', en: 'Hello! I would like to order this product:', tr: 'Merhaba! Bu ürünü sipariş etmek istiyorum:', ar: 'مرحبًا! أود طلب هذا المنتج:' },
} satisfies Record<string, M>

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const suffix = lang === 'az' ? 'Az' : lang === 'ru' ? 'Ru' : lang === 'en' ? 'En' : lang === 'tr' ? 'Tr' : 'Ar'
  const pick = (o: Record<string, unknown> | undefined, base: string) =>
    (o?.[base + suffix] || o?.[base + 'Az'] || '') as string

  const q = trpc.catalog.storefront.useQuery({ menuType: 'catalog' })
  const items = (q.data?.items ?? []) as Record<string, unknown>[]
  const cats = (q.data?.categories ?? []) as Record<string, unknown>[]

  const item = useMemo(
    () => items.find((it) => slugify(String(it.nameEn || it.nameAz || '')) === slug)
       || items.find((it) => String(it.id) === slug),
    [items, slug],
  )
  const cat = item ? cats.find((c) => c.id === item.categoryId) : null
  const related = useMemo(
    () => item ? items.filter((i) => i.categoryId === item.categoryId && i.id !== item.id).slice(0, 4) : [],
    [items, item],
  )

  const name = pick(item, 'name')
  const desc = pick(item, 'desc') || pick(item, 'description')
  const img = (item?.imageUrl as string) || ''
  const catName = pick(cat ?? undefined, 'title')
  const priceVisible = item?.priceVisible !== false && !!item?.price
  const priceStr = priceVisible ? `${item?.price as string} ₼` : t(S.ask_price)
  const canonical = `${ORIGIN}/catalog/${slug}`
  const imgAbs = img.startsWith('http') ? img : ORIGIN + img
  const waText = encodeURIComponent(`${t(S.wa_intro)} ${name}${priceVisible ? ` — ${item?.price as string} ₼` : ''}\n${canonical}`)

  const Header = () => (
    <div className="chead">
      <div className="row">
        <a href="/"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
        <div className="clangs" role="group" aria-label="Dil">
          {LANGS.map((l) => (
            <button key={l.code} className={lang === l.code ? 'on' : ''} aria-pressed={lang === l.code} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </div>
      </div>
    </div>
  )

  if (q.isLoading) {
    return <div className="xc xcc"><Header /><div className="cstate"><div className="cspin" />{t(S.loading)}</div></div>
  }
  if (!item) {
    return (
      <div className="xc xcc">
        <Helmet><meta name="robots" content="noindex" /><title>{t(S.notfound)} | Xurcun</title></Helmet>
        <Header />
        <div className="cstate"><img className="emb" src={EMBLEM} alt="" /><div>{t(S.notfound)}</div>
          <a className="cadd" href="/catalog" style={{ marginTop: 12 }}>← {t(S.back)}</a>
        </div>
      </div>
    )
  }

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product',
    name, image: imgAbs ? [imgAbs] : undefined, description: desc || name,
    category: catName || undefined,
    brand: { '@type': 'Brand', name: 'Xurcun' },
    url: canonical,
    ...(priceVisible ? { offers: { '@type': 'Offer', priceCurrency: 'AZN', price: String(item.price), availability: 'https://schema.org/InStock', url: canonical } } : {}),
  }

  return (
    <div className="xc xcc">
      <Helmet>
        <title>{`${name} | Xurcun — ${catName || t(S.catalog)}`}</title>
        <meta name="description" content={(desc || `${name} — Xurcun premium ${catName || ''}`).slice(0, 160)} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${name} | Xurcun`} />
        <meta property="og:description" content={(desc || name).slice(0, 160)} />
        {imgAbs && <meta property="og:image" content={imgAbs} />}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <nav className="cbreadcrumb" aria-label="Breadcrumb">
        <a href="/catalog">{t(S.catalog)}</a>
        {catName && <><span aria-hidden="true">›</span><span>{catName}</span></>}
        <span aria-hidden="true">›</span><span className="cur">{name}</span>
      </nav>

      <div className="cdetail">
        <div className="cdmedia">
          {img
            ? <img src={img} alt={name} decoding="async" onError={(e) => { const im = e.currentTarget; im.onerror = null; im.src = EMBLEM; im.className = 'ph' }} />
            : <img className="ph" src={EMBLEM} alt="" />}
        </div>
        <div className="cdinfo">
          {catName && <span className="cdcat">{catName}</span>}
          <h1>{name}</h1>
          <div className="cdprice">{priceStr}</div>
          {desc && <p className="cdds">{desc}</p>}
          <a className="cdorder" href={`https://wa.me/${WA}?text=${waText}`} target="_blank" rel="noopener noreferrer">
            {t(S.order)}
          </a>
          <a className="cdback" href="/catalog">← {t(S.back)}</a>
        </div>
      </div>

      {related.length > 0 && (
        <section className="cdrel">
          <h2>{t(S.related)}</h2>
          <div className="cgrid">
            {related.map((it) => {
              const rn = pick(it, 'name')
              const rimg = it.imageUrl as string | undefined
              const rslug = slugify(String(it.nameEn || it.nameAz || '')) || String(it.id)
              const rprice = it.priceVisible !== false && it.price ? `${it.price as string} ₼` : t(S.ask_price)
              return (
                <a key={it.id as number} className="ccard" href={`/catalog/${rslug}`}>
                  <div className="cthumb">
                    {rimg
                      ? <img src={rimg} alt={rn} loading="lazy" decoding="async" onError={(e) => { const im = e.currentTarget; im.onerror = null; im.src = EMBLEM; im.className = 'ph' }} />
                      : <img className="ph" src={EMBLEM} alt="" />}
                  </div>
                  <div className="cinfo">
                    <div className="nm">{rn}</div>
                    <div className="prow"><span className="pr">{rprice}</span></div>
                  </div>
                </a>
              )
            })}
          </div>
        </section>
      )}

      <footer className="cfoot">
        <div className="cp">© {new Date().getFullYear()} Xurcun · <a href="/">xurcun.az</a></div>
      </footer>
    </div>
  )
}
