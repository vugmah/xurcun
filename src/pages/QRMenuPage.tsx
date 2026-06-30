import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import SEO from '@/sections/SEO'
import '@/xurcun-base.css'
import '@/xurcun-menu.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

type M = Record<Lang, string>
const S = {
  menu: { az: 'Menyu', ru: 'Меню', en: 'Menu', tr: 'Menü', ar: 'القائمة' },
  tab_catalog: { az: 'Kataloq', ru: 'Каталог', en: 'Catalogue', tr: 'Katalog', ar: 'الكتالوج' },
  tab_cafe: { az: 'Kafe', ru: 'Кафе', en: 'Café', tr: 'Kafe', ar: 'المقهى' },
  call: { az: 'Zəng et', ru: 'Позвонить', en: 'Call', tr: 'Ara', ar: 'اتصل' },
  map: { az: 'Xəritə', ru: 'Карта', en: 'Map', tr: 'Harita', ar: 'الخريطة' },
  loading: { az: 'Menyu yüklənir…', ru: 'Загрузка меню…', en: 'Loading menu…', tr: 'Menü yükleniyor…', ar: 'جارٍ تحميل القائمة…' },
  empty: { az: 'Bu menyuda hələ məhsul yoxdur.', ru: 'В этом меню пока нет товаров.', en: 'No items in this menu yet.', tr: 'Bu menüde henüz ürün yok.', ar: 'لا توجد منتجات في هذه القائمة بعد.' },
  rev_google: { az: 'Google-da rəy yaz', ru: 'Отзыв в Google', en: 'Review on Google', tr: "Google'da yorum yap", ar: 'قيّمنا على Google' },
  rev_trip: { az: 'TripAdvisor-da rəy yaz', ru: 'Отзыв в TripAdvisor', en: 'Review on TripAdvisor', tr: "TripAdvisor'da yorum yap", ar: 'قيّمنا على TripAdvisor' },
  b_new: { az: 'Yeni', ru: 'Новинка', en: 'New', tr: 'Yeni', ar: 'جديد' },
  b_sugar: { az: 'Şəkərsiz', ru: 'Без сахара', en: 'Sugar-free', tr: 'Şekersiz', ar: 'خالٍ من السكر' },
  b_veg: { az: 'Vegetarian', ru: 'Вегетар.', en: 'Vegetarian', tr: 'Vejetaryen', ar: 'نباتي' },
  b_gluten: { az: 'Glutensiz', ru: 'Без глютена', en: 'Gluten-free', tr: 'Glutensiz', ar: 'خالٍ من الغلوتين' },
  b_halal: { az: 'Halal', ru: 'Халяль', en: 'Halal', tr: 'Helal', ar: 'حلال' },
  foot_script: { az: 'Fond of Quality', ru: 'Fond of Quality', en: 'Fond of Quality', tr: 'Fond of Quality', ar: 'Fond of Quality' },
  err: { az: 'Menyu yüklənmədi.', ru: 'Не удалось загрузить меню.', en: 'Could not load the menu.', tr: 'Menü yüklenemedi.', ar: 'تعذّر تحميل القائمة.' },
  retry: { az: 'Yenidən cəhd et', ru: 'Повторить', en: 'Try again', tr: 'Tekrar dene', ar: 'إعادة المحاولة' },
}

export default function QRMenuPage() {
  const { branchSlug } = useParams<{ branchSlug?: string }>()
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const suffix = lang === 'az' ? 'Az' : lang === 'ru' ? 'Ru' : lang === 'en' ? 'En' : lang === 'tr' ? 'Tr' : 'Ar'
  const pick = (o: Record<string, unknown>, base: string) => (o[base + suffix] || o[base + 'Az'] || '') as string

  const branchQ = trpc.branch.getBranchBySlug.useQuery(
    { slug: branchSlug ?? '' },
    { enabled: !!branchSlug, retry: false },
  )
  const branch = (branchQ.data ?? null) as Record<string, unknown> | null
  const hasCafe = !!branch?.hasCafe

  // menuType (kataloq/kafe). Yalnız kafe olan filiallarda toggle göstərilir.
  // URL ?type=cafe ilə də açıla bilər.
  const initialType: 'catalog' | 'cafe' =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('type') === 'cafe'
      ? 'cafe' : 'catalog'
  const [menuType, setMenuType] = useState<'catalog' | 'cafe'>(initialType)
  const [activeCat, setActiveCat] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const branchMenuQ = trpc.branchMenu.getMenuForBranch.useQuery(
    { branchSlug: branchSlug ?? '', menuType },
    { enabled: !!branchSlug, retry: false },
  )
  const storeQ = trpc.catalog.storefront.useQuery({ menuType }, { enabled: !branchSlug, retry: false })
  const menuQ = branchSlug ? branchMenuQ : storeQ

  const cats = ((menuQ.data?.categories ?? []) as unknown as Record<string, unknown>[])
  const items = ((menuQ.data?.items ?? []) as unknown as Record<string, unknown>[])

  const byCat = new Map<number, Record<string, unknown>[]>()
  for (const it of items) {
    const cid = it.categoryId as number
    if (!byCat.has(cid)) byCat.set(cid, [])
    byCat.get(cid)!.push(it)
  }
  const sections = cats.filter((c) => (byCat.get(c.id as number)?.length ?? 0) > 0)

  // Scroll-spy: highlight the category chip for the section currently in view.
  useEffect(() => {
    const secs = rootRef.current?.querySelectorAll<HTMLElement>('.msec')
    if (!secs || !secs.length || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActiveCat(Number(top.target.id.replace('cat-', '')))
      },
      { rootMargin: '-120px 0px -65% 0px' },
    )
    secs.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [sections.length, menuType, lang])

  const branchName = (branch?.name as string) || 'Xurcun'
  const branchAddr = branch?.address as string | undefined
  const branchPhone = branch?.phone as string | undefined
  const branchMap = (branch?.mapUrl as string) || (branchAddr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Xurcun ' + branchName)}` : undefined)

  const badgesFor = (it: Record<string, unknown>) => {
    const out: { label: string; cls?: string }[] = []
    if (it.isNew) out.push({ label: t(S.b_new), cls: 'new' })
    if (it.isSugarFree) out.push({ label: t(S.b_sugar) })
    if (it.isVegetarian) out.push({ label: t(S.b_veg) })
    if (it.isGlutenFree) out.push({ label: t(S.b_gluten) })
    if (it.isHalal) out.push({ label: t(S.b_halal) })
    return out
  }

  return (
    <div className="xc xcm" ref={rootRef}>
      <SEO page="menu" />
      {/* Header */}
      <div className="mhead">
        <div className="row">
          <a href="/"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
          <div className="mlangs">
            {LANGS.map((l) => (
              <button key={l.code} className={lang === l.code ? 'on' : ''} aria-pressed={lang === l.code} aria-label={l.code.toUpperCase()} onClick={() => setLang(l.code)}>{l.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Branch hero */}
      <div className="mwrap">
        <div className="mhero">
          <img className="emb" src={EMBLEM} alt="" />
          <span className="tag">{t(S.menu)}</span>
          <h1>{branchName}</h1>
          {branchAddr && (
            <div className="addr">
              <span>{branchAddr}</span>
              {branchMap && <a href={branchMap} target="_blank" rel="noopener noreferrer">{t(S.map)}</a>}
              {branchPhone && <a href={`tel:${branchPhone.replace(/[^\d+]/g, '')}`}>{t(S.call)}</a>}
            </div>
          )}
          <div className="ornament"><img src={EMBLEM} alt="" /></div>
        </div>

        {hasCafe && (
          <div className="mtabs">
            <button className={menuType === 'catalog' ? 'on' : ''} onClick={() => setMenuType('catalog')}>{t(S.tab_catalog)}</button>
            <button className={menuType === 'cafe' ? 'on' : ''} onClick={() => setMenuType('cafe')}>{t(S.tab_cafe)}</button>
          </div>
        )}
      </div>

      {/* Category chips */}
      {sections.length > 0 && (
        <div className="mchips">
          <div className="scroll">
            {sections.map((c) => (
              <a key={c.id as number} href={`#cat-${c.id}`} className={activeCat === (c.id as number) ? 'on' : ''} aria-current={activeCat === (c.id as number) ? 'true' : undefined}>{pick(c, 'title')}</a>
            ))}
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mwrap">
        {menuQ.isLoading && (
          <div className="mloading"><div className="mspin" />{t(S.loading)}</div>
        )}

        {!menuQ.isLoading && menuQ.isError && (
          <div className="mempty">
            <img className="emb" src={EMBLEM} alt="" />
            <div>{t(S.err)}</div>
            <button className="mretry" onClick={() => menuQ.refetch()}>{t(S.retry)}</button>
          </div>
        )}

        {!menuQ.isLoading && !menuQ.isError && sections.length === 0 && (
          <div className="mempty">
            <img className="emb" src={EMBLEM} alt="" />
            <div>{t(S.empty)}</div>
          </div>
        )}

        {sections.map((c) => {
          const list = byCat.get(c.id as number) ?? []
          return (
            <section className="msec" id={`cat-${c.id}`} key={c.id as number}>
              <div className="msec-head">
                <h2>{pick(c, 'title')}</h2>
                <span className="line" />
              </div>
              {list.map((it) => {
                const name = pick(it, 'name')
                const desc = pick(it, 'desc')
                const unit = it.unit as string | undefined
                const minOrder = it.minOrder as string | undefined
                // Price is shown per its unit (e.g. "10 ₼ / 100 q") — this carries the
                // per-100g vitrine convention through to both the card and the order message.
                const priceStr = (it.priceVisible === false || !it.price) ? '' : `${it.price as string} ₼${unit ? ` / ${unit}` : ''}`
                const img = it.imageUrl as string | undefined
                const badges = badgesFor(it)
                return (
                  <div className="mcard" key={it.id as number}>
                    <div className="mthumb">
                      {img ? <img src={img} alt={name} loading="lazy" decoding="async" onError={(e) => { const im = e.currentTarget; im.onerror = null; im.src = EMBLEM; im.className = 'ph' }} /> : <img className="ph" src={EMBLEM} alt="" />}
                    </div>
                    <div className="minfo">
                      <div className="nm">{name}</div>
                      {desc && <div className="ds">{desc}</div>}
                      {minOrder && <div className="unit">Min. {minOrder}</div>}
                      {badges.length > 0 && (
                        <div className="mbadges">
                          {badges.map((b, i) => <span className={`mbadge ${b.cls ?? ''}`} key={i}>{b.label}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="mside">
                      {priceStr && <div className="mprice">{priceStr}</div>}
                    </div>
                  </div>
                )
              })}
            </section>
          )
        })}

        {(branch?.googleReviewUrl || branch?.tripadvisorUrl) && (
          <div className="mreviews">
            {branch?.googleReviewUrl && <a className="mrev mrev-g" href={branch.googleReviewUrl as string} target="_blank" rel="noopener noreferrer">{t(S.rev_google)}</a>}
            {branch?.tripadvisorUrl && <a className="mrev mrev-t" href={branch.tripadvisorUrl as string} target="_blank" rel="noopener noreferrer">{t(S.rev_trip)}</a>}
          </div>
        )}

        <div className="mfoot">
          <div className="script">{t(S.foot_script)}</div>
          <div className="cp">© {new Date().getFullYear()} Xurcun · <a href="/">xurcun.az</a></div>
        </div>
      </div>
    </div>
  )
}