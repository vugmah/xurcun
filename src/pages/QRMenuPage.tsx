import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import '@/xurcun-base.css'
import '@/xurcun-menu.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'
const DEFAULT_WA = '994502121811' // ümumi WhatsApp (filial nömrəsi yoxdursa)

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
  order: { az: 'Sifariş', ru: 'Заказать', en: 'Order', tr: 'Sipariş', ar: 'اطلب' },
  call: { az: 'Zəng et', ru: 'Позвонить', en: 'Call', tr: 'Ara', ar: 'اتصل' },
  map: { az: 'Xəritə', ru: 'Карта', en: 'Map', tr: 'Harita', ar: 'الخريطة' },
  loading: { az: 'Menyu yüklənir…', ru: 'Загрузка меню…', en: 'Loading menu…', tr: 'Menü yükleniyor…', ar: 'جارٍ تحميل القائمة…' },
  empty: { az: 'Bu menyuda hələ məhsul yoxdur.', ru: 'В этом меню пока нет товаров.', en: 'No items in this menu yet.', tr: 'Bu menüde henüz ürün yok.', ar: 'لا توجد منتجات في هذه القائمة بعد.' },
  wa_intro: {
    az: 'Salam! Bu məhsulla maraqlanıram:',
    ru: 'Здравствуйте! Меня интересует этот товар:',
    en: "Hello! I'm interested in this product:",
    tr: 'Merhaba! Bu ürünle ilgileniyorum:',
    ar: 'مرحبًا! أنا مهتم بهذا المنتج:',
  },
  wa_branch: { az: 'Mağaza', ru: 'Магазин', en: 'Store', tr: 'Mağaza', ar: 'المتجر' },
  b_new: { az: 'Yeni', ru: 'Новинка', en: 'New', tr: 'Yeni', ar: 'جديد' },
  b_sugar: { az: 'Şəkərsiz', ru: 'Без сахара', en: 'Sugar-free', tr: 'Şekersiz', ar: 'خالٍ من السكر' },
  b_veg: { az: 'Vegetarian', ru: 'Вегетар.', en: 'Vegetarian', tr: 'Vejetaryen', ar: 'نباتي' },
  b_gluten: { az: 'Glutensiz', ru: 'Без глютена', en: 'Gluten-free', tr: 'Glutensiz', ar: 'خالٍ من الغلوتين' },
  b_halal: { az: 'Halal', ru: 'Халяль', en: 'Halal', tr: 'Helal', ar: 'حلال' },
  foot_script: { az: 'Fond of Quality', ru: 'Fond of Quality', en: 'Fond of Quality', tr: 'Fond of Quality', ar: 'Fond of Quality' },
  err: { az: 'Menyu yüklənmədi.', ru: 'Не удалось загрузить меню.', en: 'Could not load the menu.', tr: 'Menü yüklenemedi.', ar: 'تعذّر تحميل القائمة.' },
  retry: { az: 'Yenidən cəhd et', ru: 'Повторить', en: 'Try again', tr: 'Tekrar dene', ar: 'إعادة المحاولة' },
}

const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.523 5.26l-.999 3.648 3.965-1.06z" />
  </svg>
)

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
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('type') === 'cafe' && hasCafe
      ? 'cafe' : 'catalog'
  const [menuType, setMenuType] = useState<'catalog' | 'cafe'>(initialType)
  const [activeCat, setActiveCat] = useState<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const storeQ = trpc.catalog.storefront.useQuery({ menuType }, { retry: false })

  const cats = ((storeQ.data?.categories ?? []) as unknown as Record<string, unknown>[])
  const items = ((storeQ.data?.items ?? []) as unknown as Record<string, unknown>[])

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

  const waDigits = String(branch?.whatsappNumber || branch?.phone || DEFAULT_WA).replace(/[^0-9]/g, '')
  const waLink = (productName: string, priceStr: string) => {
    const lines = [t(S.wa_intro), `• ${productName}${priceStr ? ' — ' + priceStr : ''}`]
    if (branch?.name) lines.push(`${t(S.wa_branch)}: ${branch.name as string}`)
    return `https://wa.me/${waDigits}?text=${encodeURIComponent(lines.join('\n'))}`
  }

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
              {branchPhone && <a href={`tel:${branchPhone.replace(/\s/g, '')}`}>{t(S.call)}</a>}
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
        {storeQ.isLoading && (
          <div className="mloading"><div className="mspin" />{t(S.loading)}</div>
        )}

        {!storeQ.isLoading && storeQ.isError && (
          <div className="mempty">
            <img className="emb" src={EMBLEM} alt="" />
            <div>{t(S.err)}</div>
            <button className="mretry" onClick={() => storeQ.refetch()}>{t(S.retry)}</button>
          </div>
        )}

        {!storeQ.isLoading && !storeQ.isError && sections.length === 0 && (
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
                const priceStr = (it.priceVisible === false || !it.price) ? '' : `${it.price as string} ₼`
                const img = it.imageUrl as string | undefined
                const badges = badgesFor(it)
                return (
                  <div className="mcard" key={it.id as number}>
                    <div className="mthumb">
                      {img ? <img src={img} alt={name} loading="lazy" onError={(e) => { const im = e.currentTarget; im.onerror = null; im.src = EMBLEM; im.className = 'ph' }} /> : <img className="ph" src={EMBLEM} alt="" />}
                    </div>
                    <div className="minfo">
                      <div className="nm">{name}</div>
                      {desc && <div className="ds">{desc}</div>}
                      {unit && <div className="unit">{unit}</div>}
                      {badges.length > 0 && (
                        <div className="mbadges">
                          {badges.map((b, i) => <span className={`mbadge ${b.cls ?? ''}`} key={i}>{b.label}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="mside">
                      {priceStr && <div className="mprice">{priceStr}</div>}
                      <a className="mwa" href={waLink(name, priceStr)} target="_blank" rel="noopener noreferrer">
                        <WaIcon />{t(S.order)}
                      </a>
                    </div>
                  </div>
                )
              })}
            </section>
          )
        })}

        <div className="mfoot">
          <div className="script">{t(S.foot_script)}</div>
          <div className="cp">© {new Date().getFullYear()} Xurcun · <a href="/">xurcun.az</a></div>
        </div>
      </div>
    </div>
  )
}