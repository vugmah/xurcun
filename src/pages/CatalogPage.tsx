import { useState, useEffect, useRef, useMemo } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import SEO from '@/sections/SEO'
import TasteGallery from '@/components/TasteGallery'
import '@/xurcun-base.css'
import '@/xurcun-catalog.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'
const WA = '994502121811' // ümumi sifariş WhatsApp nömrəsi
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

type M = Record<Lang, string>
const S = {
  title: { az: 'Kataloq', ru: 'Каталог', en: 'Catalogue', tr: 'Katalog', ar: 'الكتالوج' },
  lead: {
    az: 'Bəyəndiyiniz məhsulları seçin, səbətə əlavə edin və WhatsApp ilə bizə göndərin.',
    ru: 'Выберите товары, добавьте в корзину и отправьте нам в WhatsApp.',
    en: 'Pick the products you like, add them to the cart and send us your list on WhatsApp.',
    tr: 'Beğendiğiniz ürünleri seçin, sepete ekleyin ve WhatsApp ile bize gönderin.',
    ar: 'اختر المنتجات التي تعجبك، أضفها إلى السلة وأرسل قائمتك عبر واتساب.',
  },
  loading: { az: 'Kataloq yüklənir…', ru: 'Загрузка каталога…', en: 'Loading catalogue…', tr: 'Katalog yükleniyor…', ar: 'جارٍ تحميل الكتالوج…' },
  err: { az: 'Kataloq yüklənmədi.', ru: 'Не удалось загрузить каталог.', en: 'Could not load the catalogue.', tr: 'Katalog yüklenemedi.', ar: 'تعذّر تحميل الكتالوج.' },
  retry: { az: 'Yenidən cəhd et', ru: 'Повторить', en: 'Try again', tr: 'Tekrar dene', ar: 'إعادة المحاولة' },
  empty: { az: 'Bu kataloqda hələ məhsul yoxdur.', ru: 'В каталоге пока нет товаров.', en: 'No products in the catalogue yet.', tr: 'Katalogda henüz ürün yok.', ar: 'لا توجد منتجات في الكتالوج بعد.' },
  add: { az: 'Səbətə', ru: 'В корзину', en: 'Add', tr: 'Sepete', ar: 'أضف' },
  cart: { az: 'Səbət', ru: 'Корзина', en: 'Cart', tr: 'Sepet', ar: 'السلة' },
  cart_empty: { az: 'Səbət boşdur.', ru: 'Корзина пуста.', en: 'Your cart is empty.', tr: 'Sepet boş.', ar: 'السلة فارغة.' },
  total: { az: 'Cəmi', ru: 'Итого', en: 'Total', tr: 'Toplam', ar: 'الإجمالي' },
  send_wa: { az: 'WhatsApp ilə göndər', ru: 'Отправить в WhatsApp', en: 'Send on WhatsApp', tr: 'WhatsApp ile gönder', ar: 'إرسال عبر واتساب' },
  clear: { az: 'Təmizlə', ru: 'Очистить', en: 'Clear', tr: 'Temizle', ar: 'مسح' },
  ask_price: { az: 'Qiymət üçün soruşun', ru: 'Цена по запросу', en: 'Price on request', tr: 'Fiyat için sorun', ar: 'السعر عند الطلب' },
  wa_intro: { az: 'Salam! Bu məhsulları sifariş etmək istəyirəm:', ru: 'Здравствуйте! Хочу заказать эти товары:', en: 'Hello! I would like to order these products:', tr: 'Merhaba! Bu ürünleri sipariş etmek istiyorum:', ar: 'مرحبًا! أود طلب هذه المنتجات:' },
  pcs: { az: 'əd.', ru: 'шт.', en: 'pcs', tr: 'ad.', ar: 'قطعة' },
  close: { az: 'Bağla', ru: 'Закрыть', en: 'Close', tr: 'Kapat', ar: 'إغلاق' },
  pay: { az: 'Ödəniləcək məbləğ', ru: 'Сумма к оплате', en: 'Amount to pay', tr: 'Ödenecek tutar', ar: 'المبلغ المطلوب' },
  order_title: { az: 'Sifariş forması', ru: 'Бланк заказа', en: 'Order form', tr: 'Sipariş formu', ar: 'نموذج الطلب' },
  searchPh: { az: 'Məhsul axtar…', ru: 'Поиск товара…', en: 'Search products…', tr: 'Ürün ara…', ar: 'ابحث عن منتج…' },
  fHalal: { az: 'Halal', ru: 'Халяль', en: 'Halal', tr: 'Helal', ar: 'حلال' },
  fGluten: { az: 'Qlütensiz', ru: 'Без глютена', en: 'Gluten-free', tr: 'Glutensiz', ar: 'خالٍ من الغلوتين' },
  fSugar: { az: 'Şəkərsiz', ru: 'Без сахара', en: 'Sugar-free', tr: 'Şekersiz', ar: 'خالٍ من السكر' },
  noRes: { az: 'Axtarışa uyğun məhsul tapılmadı.', ru: 'Ничего не найдено.', en: 'No products match your search.', tr: 'Aramanıza uygun ürün bulunamadı.', ar: 'لا توجد منتجات مطابقة لبحثك.' },
} satisfies Record<string, M>

type Cat = { id: number; parentId: number | null; sortOrder?: number } & Record<string, unknown>
type Item = { id: number; categoryId: number } & Record<string, unknown>

const WaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.523 5.26l-.999 3.648 3.965-1.06z" />
  </svg>
)

const priceNum = (p: unknown) => {
  const n = parseFloat(String(p ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export default function CatalogPage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const suffix = lang === 'az' ? 'Az' : lang === 'ru' ? 'Ru' : lang === 'en' ? 'En' : lang === 'tr' ? 'Tr' : 'Ar'
  const pick = (o: Record<string, unknown>, base: string) => (o[base + suffix] || o[base + 'Az'] || '') as string

  const [cart, setCart] = useState<Record<number, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [activeCat, setActiveCat] = useState<number | null>(null)
  const [q, setQ] = useState('')
  const [diet, setDiet] = useState<Set<string>>(() => new Set())
  const toggleDiet = (k: string) => setDiet((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })
  const rootRef = useRef<HTMLDivElement>(null)

  const storeQ = trpc.catalog.storefront.useQuery({ menuType: 'catalog' }, { retry: false })
  const submitOrder = trpc.orders.submit.useMutation()
  const cats = (storeQ.data?.categories ?? []) as unknown as Cat[]
  const items = (storeQ.data?.items ?? []) as unknown as Item[]

  const itemsByCat = useMemo(() => {
    const m = new Map<number, Item[]>()
    for (const it of items) {
      if (!m.has(it.categoryId)) m.set(it.categoryId, [])
      m.get(it.categoryId)!.push(it)
    }
    return m
  }, [items])

  const itemById = useMemo(() => {
    const m = new Map<number, Item>()
    for (const it of items) m.set(it.id, it)
    return m
  }, [items])

  // Top-level categories that have any products (directly or via a subcategory).
  const tree = useMemo(() => {
    const tops = cats.filter((c) => c.parentId == null).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    const subsOf = (pid: number) => cats.filter((c) => c.parentId === pid).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    return tops
      .map((top) => {
        const directItems = itemsByCat.get(top.id) ?? []
        const subs = subsOf(top.id)
          .map((s) => ({ cat: s, items: itemsByCat.get(s.id) ?? [] }))
          .filter((s) => s.items.length > 0)
        return { cat: top, directItems, subs }
      })
      .filter((g) => g.directItems.length > 0 || g.subs.length > 0)
  }, [cats, itemsByCat])

  // Search + dietary filter. When inactive, displayTree === tree.
  const filtering = q.trim().length > 0 || diet.size > 0
  const displayTree = useMemo(() => {
    if (!filtering) return tree
    const needle = q.trim().toLowerCase()
    const matchItem = (it: Item) => {
      const o = it as Record<string, unknown>
      if (diet.has('halal') && !o.isHalal) return false
      if (diet.has('gluten') && !o.isGlutenFree) return false
      if (diet.has('sugar') && !o.isSugarFree) return false
      if (!needle) return true
      const hay = ['nameAz', 'nameRu', 'nameEn', 'nameTr', 'nameAr', 'descriptionAz', 'descriptionEn']
        .map((k) => String(o[k] ?? '')).join(' ').toLowerCase()
      return hay.includes(needle)
    }
    return tree
      .map((g) => ({
        ...g,
        directItems: g.directItems.filter(matchItem),
        subs: g.subs.map((s) => ({ ...s, items: s.items.filter(matchItem) })).filter((s) => s.items.length > 0),
      }))
      .filter((g) => g.directItems.length > 0 || g.subs.length > 0)
  }, [tree, q, diet, filtering])

  // Scroll-spy: highlight the chip for the section currently in view.
  useEffect(() => {
    const secs = rootRef.current?.querySelectorAll<HTMLElement>('.csec')
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
  }, [tree.length, lang])

  // Product structured data — an ItemList of Products injected as JSON-LD. Google reads
  // JS-injected structured data, so this auto-populates as catalog products are added.
  useEffect(() => {
    const ID = 'xc-catalog-jsonld'
    const products = items
      .map((it, i) => {
        const o = it as unknown as Record<string, unknown>
        const name = pick(o, 'name')
        if (!name) return null
        const node: Record<string, unknown> = { '@type': 'Product', position: i + 1, name }
        const img = o.imageUrl as string | undefined
        if (img) node.image = img.startsWith('http') ? img : `https://xurcun.az${img}`
        const desc = pick(o, 'desc')
        if (desc) node.description = desc
        if (o.priceVisible !== false && o.price) {
          const amount = priceNum(o.price)
          if (amount > 0) {
            node.offers = {
              '@type': 'Offer',
              price: String(amount),
              priceCurrency: 'AZN',
              availability: 'https://schema.org/InStock',
              ...(o.unit ? { description: `Qiymət / ${o.unit as string}` } : {}),
            }
          }
        }
        return node
      })
      .filter(Boolean)
    const json = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Xurcun Kataloqu',
      url: 'https://xurcun.az/catalog',
      numberOfItems: products.length,
      itemListElement: products,
    }
    let el = document.getElementById(ID) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.id = ID
      el.type = 'application/ld+json'
      document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(json)
    return () => { document.getElementById(ID)?.remove() }
  }, [items, lang])

  const setQty = (id: number, q: number) =>
    setCart((c) => {
      const next = { ...c }
      if (q <= 0) delete next[id]
      else next[id] = q
      return next
    })

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => ({ item: itemById.get(Number(id)), qty }))
    .filter((l): l is { item: Item; qty: number } => !!l.item)
  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0)
  const cartTotal = cartLines.reduce(
    (s, l) => s + (l.item.priceVisible === false ? 0 : priceNum(l.item.price) * l.qty),
    0,
  )

  const waText = () => {
    const lines = [t(S.wa_intro), '']
    for (const l of cartLines) {
      const nm = pick(l.item as Record<string, unknown>, 'name')
      const pr = l.item.priceVisible === false || !l.item.price ? '' : ` — ${l.item.price} ₼`
      lines.push(`• ${nm} × ${l.qty}${pr}`)
    }
    if (cartTotal > 0) lines.push('', `${t(S.pay)}: ${cartTotal.toFixed(2)} ₼`)
    return lines.join('\n')
  }
  const waLink = () => `https://wa.me/${WA}?text=${encodeURIComponent(waText())}`

  const [busy, setBusy] = useState(false)

  // Branded PNG order form — previews inline in WhatsApp; shared via the device share sheet.
  const buildOrderBlob = async (): Promise<Blob | null> => {
    if (typeof document === 'undefined') return null
    try { await (document.fonts?.ready ?? Promise.resolve()) } catch { /* fonts optional */ }
    const locale = ({ az: 'az-AZ', ru: 'ru-RU', en: 'en-GB', tr: 'tr-TR', ar: 'ar' } as Record<string, string>)[lang] || 'az-AZ'
    const dateStr = new Date().toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
    const logo = new Image()
    logo.src = LOGO
    await new Promise<void>((res) => { logo.onload = () => res(); logo.onerror = () => res() })

    const W = 720, pad = 48, rowH = 58
    const ratio = logo.naturalWidth ? logo.naturalHeight / logo.naturalWidth : 0.32
    const logoW = 160, logoH = Math.round(logoW * ratio)
    const hasTotal = cartTotal > 0
    const headerH = pad + logoH + 12 + 30 + 26 + 28
    const H = headerH + cartLines.length * rowH + (hasTotal ? 70 : 14) + 64
    const scale = 2
    const cv = document.createElement('canvas')
    cv.width = W * scale; cv.height = Math.ceil(H) * scale
    const ctx = cv.getContext('2d')
    if (!ctx) return null
    ctx.scale(scale, scale)
    ctx.fillStyle = '#F6F2E9'; ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#9D7C38'; ctx.fillRect(0, 0, W, 6)
    let y = pad
    if (logo.naturalWidth) { ctx.drawImage(logo, (W - logoW) / 2, y, logoW, logoH); y += logoH + 6 }
    else { ctx.fillStyle = '#2E2A25'; ctx.font = '600 32px "Rufolo", Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('XURCUN', W / 2, y + 30); y += 44 }
    ctx.textAlign = 'center'; ctx.fillStyle = '#7E6228'; ctx.font = '400 11px Montserrat, sans-serif'
    ctx.fillText('F O N D   O F   Q U A L I T Y', W / 2, y + 4); y += 26
    ctx.strokeStyle = '#D8CFB9'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(W - pad, y); ctx.stroke(); y += 30
    ctx.textAlign = 'left'; ctx.fillStyle = '#2E2A25'; ctx.font = '600 22px "Rufolo", Georgia, serif'
    ctx.fillText(t(S.order_title), pad, y)
    ctx.textAlign = 'right'; ctx.fillStyle = '#6b6457'; ctx.font = '400 13px Montserrat, sans-serif'
    ctx.fillText(dateStr, W - pad, y - 2); y += 28
    const ell = (str: string, max: number) => {
      if (ctx.measureText(str).width <= max) return str
      let r = str
      while (r.length > 1 && ctx.measureText(r + '…').width > max) r = r.slice(0, -1)
      return r + '…'
    }
    for (const l of cartLines) {
      const nm = pick(l.item as Record<string, unknown>, 'name')
      const visible = !(l.item.priceVisible === false || !l.item.price)
      const sub = priceNum(l.item.price) * l.qty
      ctx.textAlign = 'left'; ctx.fillStyle = '#2E2A25'; ctx.font = '600 17px Montserrat, sans-serif'
      ctx.fillText(ell(nm, W * 0.6), pad, y + 18)
      ctx.fillStyle = '#6b6457'; ctx.font = '400 13px Montserrat, sans-serif'
      ctx.fillText(visible ? `${l.qty} × ${l.item.price} ₼` : `${t(S.pcs)}: ${l.qty}`, pad, y + 38)
      ctx.textAlign = 'right'
      if (visible) { ctx.fillStyle = '#2E2A25'; ctx.font = '600 17px Montserrat, sans-serif'; ctx.fillText(`${sub.toFixed(2)} ₼`, W - pad, y + 26) }
      else { ctx.fillStyle = '#6b6457'; ctx.font = '400 14px Montserrat, sans-serif'; ctx.fillText(t(S.ask_price), W - pad, y + 26) }
      y += rowH
      ctx.strokeStyle = '#E6DEC9'; ctx.beginPath(); ctx.moveTo(pad, y - 14); ctx.lineTo(W - pad, y - 14); ctx.stroke()
    }
    if (hasTotal) {
      y += 18
      ctx.textAlign = 'left'; ctx.fillStyle = '#2E2A25'; ctx.font = '600 16px Montserrat, sans-serif'
      ctx.fillText(t(S.pay), pad, y + 8)
      ctx.textAlign = 'right'; ctx.fillStyle = '#7E6228'; ctx.font = '700 24px "Rufolo", Georgia, serif'
      ctx.fillText(`${cartTotal.toFixed(2)} ₼`, W - pad, y + 12)
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#6b6457'; ctx.font = '400 13px Montserrat, sans-serif'
    ctx.fillText('+994 50 212 18 11   ·   xurcun.az', W / 2, H - 24)
    return await new Promise<Blob | null>((res) => cv.toBlob((b) => res(b), 'image/png', 0.95))
  }

  const shareOrder = async () => {
    if (busy || cartLines.length === 0) return
    setBusy(true)
    // Capture the order for the admin (best-effort; never blocks the WhatsApp share)
    try {
      submitOrder.mutate({
        source: 'catalog',
        lang,
        total: cartTotal > 0 ? cartTotal.toFixed(2) : undefined,
        items: cartLines.map((l) => ({
          itemId: l.item.id,
          name: pick(l.item as Record<string, unknown>, 'name') || 'Məhsul',
          qty: l.qty,
          price: l.item.priceVisible === false || !l.item.price ? undefined : String(l.item.price),
        })),
      })
    } catch { /* ignore — capture is best-effort */ }
    try {
      const blob = await buildOrderBlob()
      const nav = navigator as Navigator & { canShare?: (d?: unknown) => boolean; share?: (d: unknown) => Promise<void> }
      if (blob) {
        const file = new File([blob], 'xurcun-sifaris.png', { type: 'image/png' })
        if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
          try { await nav.share({ files: [file], text: waText(), title: 'Xurcun' }); return }
          catch (e) { if ((e as { name?: string })?.name === 'AbortError') return }
        }
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'xurcun-sifaris.png'; a.click()
        setTimeout(() => URL.revokeObjectURL(url), 5000)
      }
      window.open(waLink(), '_blank', 'noopener')
    } finally { setBusy(false) }
  }

  const ProductCard = ({ it }: { it: Item }) => {
    const name = pick(it as Record<string, unknown>, 'name')
    const desc = pick(it as Record<string, unknown>, 'desc')
    const img = it.imageUrl as string | undefined
    const priceStr = it.priceVisible === false || !it.price ? '' : `${it.price as string} ₼`
    const qty = cart[it.id] ?? 0
    const href = `/catalog/${slugify(String((it.nameEn as string) || (it.nameAz as string) || '')) || it.id}`
    return (
      <div className="ccard">
        <a className="cthumb" href={href} aria-label={name}>
          {img
            ? <img src={img} alt={name} loading="lazy" decoding="async" onError={(e) => { const im = e.currentTarget; im.onerror = null; im.src = EMBLEM; im.className = 'ph' }} />
            : <img className="ph" src={EMBLEM} alt="" />}
        </a>
        <div className="cinfo">
          <a className="nm" href={href}>{name}</a>
          {desc && <div className="ds">{desc}</div>}
          <div className="prow">
            <span className="pr">{priceStr || t(S.ask_price)}</span>
            {qty === 0 ? (
              <button className="cadd" onClick={() => setQty(it.id, 1)}>+ {t(S.add)}</button>
            ) : (
              <div className="cstep" role="group" aria-label={name}>
                <button onClick={() => setQty(it.id, qty - 1)} aria-label="−">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(it.id, qty + 1)} aria-label="+">+</button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="xc xcc" ref={rootRef}>
      <SEO page="catalog" />
      <div className="chead">
        <div className="row">
          <a href="/"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
          <div className="clangs" role="group" aria-label="Dil">
            {LANGS.map((l) => (
              <button key={l.code} className={lang === l.code ? 'on' : ''} aria-pressed={lang === l.code} aria-label={l.code.toUpperCase()} onClick={() => setLang(l.code)}>{l.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="cwrap">
        <div className="chero">
          <img className="emb" src={EMBLEM} alt="" />
          <span className="tag">{t(S.title)}</span>
          <h1>{t(S.title)}</h1>
          <p className="lead">{t(S.lead)}</p>
          <div className="ornament"><img src={EMBLEM} alt="" /></div>
        </div>
      </div>

      <TasteGallery />

      {tree.length > 0 && (
        <div className="cwrap">
          <div className="cfilter">
            <input className="csearch" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(S.searchPh)} aria-label={t(S.searchPh)} />
            <div className="cdiet" role="group" aria-label="Filter">
              <button type="button" className={diet.has('halal') ? 'on' : ''} aria-pressed={diet.has('halal')} onClick={() => toggleDiet('halal')}>{t(S.fHalal)}</button>
              <button type="button" className={diet.has('gluten') ? 'on' : ''} aria-pressed={diet.has('gluten')} onClick={() => toggleDiet('gluten')}>{t(S.fGluten)}</button>
              <button type="button" className={diet.has('sugar') ? 'on' : ''} aria-pressed={diet.has('sugar')} onClick={() => toggleDiet('sugar')}>{t(S.fSugar)}</button>
            </div>
          </div>
        </div>
      )}

      {displayTree.length > 0 && (
        <div className="cchips">
          <div className="scroll">
            {displayTree.map((g) => (
              <a key={g.cat.id} href={`#cat-${g.cat.id}`} className={activeCat === g.cat.id ? 'on' : ''} aria-current={activeCat === g.cat.id ? 'true' : undefined}>{pick(g.cat as Record<string, unknown>, 'title')}</a>
            ))}
          </div>
        </div>
      )}

      <div className="cwrap cbody">
        {storeQ.isLoading && <div className="cstate"><div className="cspin" />{t(S.loading)}</div>}

        {!storeQ.isLoading && storeQ.isError && (
          <div className="cstate"><img className="emb" src={EMBLEM} alt="" /><div>{t(S.err)}</div>
            <button className="cretry" onClick={() => storeQ.refetch()}>{t(S.retry)}</button>
          </div>
        )}

        {!storeQ.isLoading && !storeQ.isError && tree.length === 0 && (
          <div className="cstate"><img className="emb" src={EMBLEM} alt="" /><div>{t(S.empty)}</div></div>
        )}

        {!storeQ.isLoading && !storeQ.isError && tree.length > 0 && filtering && displayTree.length === 0 && (
          <div className="cstate"><img className="emb" src={EMBLEM} alt="" /><div>{t(S.noRes)}</div></div>
        )}

        {displayTree.map((g) => (
          <section className="csec" id={`cat-${g.cat.id}`} key={g.cat.id}>
            <div className="csec-head"><h2>{pick(g.cat as Record<string, unknown>, 'title')}</h2><span className="line" /></div>
            {g.directItems.length > 0 && (
              <div className="cgrid">{g.directItems.map((it) => <ProductCard key={it.id} it={it} />)}</div>
            )}
            {g.subs.map((s) => (
              <div className="csub" key={s.cat.id}>
                <h3>{pick(s.cat as Record<string, unknown>, 'title')}</h3>
                <div className="cgrid">{s.items.map((it) => <ProductCard key={it.id} it={it} />)}</div>
              </div>
            ))}
          </section>
        ))}

        <div className="cfoot">
          <div className="script">Fond of Quality</div>
          <div className="cp">© {new Date().getFullYear()} Xurcun · <a href="/">xurcun.az</a></div>
        </div>
      </div>

      {cartCount > 0 && !cartOpen && (
        <button className="cbar" onClick={() => setCartOpen(true)}>
          <span className="cbar-l"><span className="cbar-badge">{cartCount}</span>{t(S.cart)}</span>
          {cartTotal > 0 && <span className="cbar-r">{cartTotal.toFixed(2)} ₼</span>}
        </button>
      )}

      {cartOpen && (
        <div className="csheet-wrap" role="dialog" aria-modal="true" aria-label={t(S.cart)}>
          <div className="csheet-bg" onClick={() => setCartOpen(false)} />
          <div className="csheet">
            <div className="csheet-head">
              <h2>{t(S.cart)}</h2>
              <button className="cx" aria-label={t(S.close)} onClick={() => setCartOpen(false)}>×</button>
            </div>
            <div className="csheet-body">
              {cartLines.length === 0 && <div className="cstate"><div>{t(S.cart_empty)}</div></div>}
              {cartLines.map((l) => {
                const nm = pick(l.item as Record<string, unknown>, 'name')
                const visible = !(l.item.priceVisible === false || !l.item.price)
                const sub = priceNum(l.item.price) * l.qty
                const priceStr = !visible ? t(S.ask_price) : l.qty > 1 ? `${l.qty} × ${l.item.price} ₼ = ${sub.toFixed(2)} ₼` : `${l.item.price as string} ₼`
                return (
                  <div className="cline" key={l.item.id}>
                    <div className="cline-i">
                      <div className="nm">{nm}</div>
                      <div className="pr">{priceStr}</div>
                    </div>
                    <div className="cstep">
                      <button onClick={() => setQty(l.item.id, l.qty - 1)} aria-label="−">−</button>
                      <span>{l.qty}</span>
                      <button onClick={() => setQty(l.item.id, l.qty + 1)} aria-label="+">+</button>
                    </div>
                  </div>
                )
              })}
            </div>
            {cartLines.length > 0 && (
              <div className="csheet-foot">
                {cartTotal > 0 && <div className="ctotal"><span>{t(S.pay)}</span><b>{cartTotal.toFixed(2)} ₼</b></div>}
                <button type="button" className="cwa" onClick={shareOrder} disabled={busy}><WaIcon />{t(S.send_wa)}</button>
                <button className="cclear" onClick={() => { setCart({}); setCartOpen(false) }}>{t(S.clear)}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
