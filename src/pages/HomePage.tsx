import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import '@/xurcun-base.css'
import '@/xurcun-home.css'

const LOGO = '/brand/logo-gold.png'
const LOGO_WEBP = '/brand/logo-gold.webp'
const EMBLEM = '/brand/emblem-gold.png'
const HERO_IMG = '/images/home/hero.webp' // hero video poster — single-URL attr, webp
const GIFT_IMG = '/images/home/gift.jpg'
const GIFT_WEBP = '/images/home/gift.webp'
const ABOUT_IMG = '/images/home/about.jpg'
const ABOUT_WEBP = '/images/home/about.webp'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

type M = Record<Lang, string>
const S = {
  nav_home: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
  nav_catalog: { az: 'Kataloq', ru: 'Каталог', en: 'Catalogue', tr: 'Katalog', ar: 'الكتالوج' },
  nav_gift: { az: 'Hədiyyəlik', ru: 'Подарки', en: 'Gifts', tr: 'Hediyelik', ar: 'الهدايا' },
  nav_stores: { az: 'Mağazalar', ru: 'Магазины', en: 'Stores', tr: 'Mağazalar', ar: 'المتاجر' },
  nav_about: { az: 'Haqqımızda', ru: 'О нас', en: 'About', tr: 'Hakkımızda', ar: 'من نحن' },
  nav_contact: { az: 'Əlaqə', ru: 'Контакты', en: 'Contact', tr: 'İletişim', ar: 'اتصل بنا' },
  hero_script: { az: 'təbiətin ən seçmə dadları', ru: 'избранные вкусы природы', en: "nature's finest flavours", tr: 'doğanın en seçkin tatları', ar: 'أجود نكهات الطبيعة' },
  hero_h1a: { az: 'Keyfiyyətə', ru: 'Fond of', en: 'Fond of', tr: 'Fond of', ar: 'Fond of' },
  hero_h1em: { az: 'Vurğunuq!', ru: 'Quality', en: 'Quality', tr: 'Quality', ar: 'Quality' },
  hero_lead: {
    az: 'Seçmə quru meyvələr, qoz-fındıq, ləziz şirniyyatlar və əl işi premium hədiyyə qutuları — 2015-dən bəri Azərbaycanın zövqlü süfrəsi üçün.',
    ru: 'Отборные сухофрукты, орехи, изысканные сладости и премиальные подарочные наборы ручной работы — для изысканного стола Азербайджана с 2015 года.',
    en: 'Selected dried fruits, nuts, fine sweets and handcrafted premium gift boxes — for Azerbaijan’s refined table since 2015.',
    tr: 'Seçme kuru meyveler, çerezler, leziz tatlılar ve el yapımı premium hediye kutuları — 2015’ten beri Azerbaycan’ın zarif sofrası için.',
    ar: 'فواكه مجففة مختارة، مكسرات، حلويات فاخرة وعلب هدايا فاخرة مصنوعة يدويًا — لمائدة أذربيجان الراقية منذ 2015.',
  },
  cta_catalog: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
  cta_stores: { az: 'Mağazalar', ru: 'Магазины', en: 'Stores', tr: 'Mağazalar', ar: 'المتاجر' },
  v_natural: { az: '100% Təbii', ru: '100% натурально', en: '100% Natural', tr: '100% Doğal', ar: 'طبيعي 100%' },
  v_handmade: { az: 'Əl işi hədiyyə qutuları', ru: 'Подарки ручной работы', en: 'Handcrafted gift boxes', tr: 'El yapımı hediye kutuları', ar: 'علب هدايا يدوية' },
  v_stores: { az: '11 mağaza · Bakı', ru: '11 магазинов · Баку', en: '11 stores · Baku', tr: '11 mağaza · Bakü', ar: '11 متجرًا · باكو' },
  v_est: { az: 'Est. 2015', ru: 'С 2015', en: 'Est. 2015', tr: 'Est. 2015', ar: 'تأسس 2015' },
  cat_label: { az: 'Kateqoriyalar', ru: 'Категории', en: 'Categories', tr: 'Kategoriler', ar: 'الفئات' },
  cat_title: { az: 'Kolleksiyanı kəşf et', ru: 'Откройте коллекцию', en: 'Discover the collection', tr: 'Koleksiyonu keşfet', ar: 'اكتشف المجموعة' },
  feat_label: { az: 'Bestseller', ru: 'Хиты продаж', en: 'Bestsellers', tr: 'Çok satanlar', ar: 'الأكثر مبيعًا' },
  feat_title: { az: 'Seçilmiş məhsullar', ru: 'Избранные товары', en: 'Featured products', tr: 'Öne çıkan ürünler', ar: 'منتجات مختارة' },
  luxe_tag: { az: 'İmza kolleksiya', ru: 'Фирменная коллекция', en: 'Signature collection', tr: 'İmza koleksiyon', ar: 'مجموعة مميزة' },
  luxe_h1a: { az: 'Hədiyyə vermək', ru: 'Дарить — это', en: 'Gifting is', tr: 'Hediye vermek', ar: 'الإهداء' },
  luxe_h1em: { az: 'bir incəsənətdir.', ru: 'искусство.', en: 'an art.', tr: 'bir sanattır.', ar: 'فنٌّ.' },
  luxe_p: {
    az: 'Əl işi ağac və dəri qutularda hazırlanan premium hədiyyə seçimlərimiz — korporativ təqdimatlar, bayramlar və xüsusi anlar üçün. Hər qutu Xurcun keyfiyyəti ilə imzalanır.',
    ru: 'Наши премиальные подарки в деревянных и кожаных коробках ручной работы — для корпоративных презентов, праздников и особых моментов. Каждая коробка отмечена качеством Xurcun.',
    en: 'Our premium gift selections in handcrafted wood and leather boxes — for corporate gifts, holidays and special moments. Every box is signed with Xurcun quality.',
    tr: 'El yapımı ahşap ve deri kutularda hazırlanan premium hediye seçimlerimiz — kurumsal sunumlar, bayramlar ve özel anlar için. Her kutu Xurcun kalitesiyle imzalanır.',
    ar: 'تشكيلات هدايانا الفاخرة في علب خشبية وجلدية مصنوعة يدويًا — للهدايا المؤسسية والأعياد والمناسبات الخاصة. كل علبة موقعة بجودة Xurcun.',
  },
  luxe_cta: { az: 'Hədiyyə qutularına bax', ru: 'Подарочные наборы', en: 'View gift boxes', tr: 'Hediye kutularına bak', ar: 'تصفح علب الهدايا' },
  stores_label: { az: '11 filial · Bakı', ru: '11 филиалов · Баку', en: '11 branches · Baku', tr: '11 şube · Bakü', ar: '11 فرعًا · باكو' },
  stores_title: { az: 'Mağazalarımız', ru: 'Наши магазины', en: 'Our stores', tr: 'Mağazalarımız', ar: 'متاجرنا' },
  yeni: { az: 'Yeni', ru: 'Новинка', en: 'New', tr: 'Yeni', ar: 'جديد' },
  call: { az: 'Zəng et', ru: 'Позвонить', en: 'Call', tr: 'Ara', ar: 'اتصل' },
  foot_about: {
    az: 'Azərbaycanın premium quru meyvə, çərəz və hədiyyə butiki. 2015-dən bəri Keyfiyyətə Vurğunuq!',
    ru: 'Премиальный бутик сухофруктов, орехов и подарков Азербайджана. Fond of Quality — с 2015 года.',
    en: 'Azerbaijan’s premium dried fruit, nuts and gift boutique. Fond of Quality since 2015.',
    tr: 'Azerbaycan’ın premium kuru meyve, çerez ve hediye butiği. 2015’ten beri Fond of Quality.',
    ar: 'بوتيك أذربيجان الفاخر للفواكه المجففة والمكسرات والهدايا. Fond of Quality منذ 2015.',
  },
  foot_stores: { az: 'Mağazalar', ru: 'Магазины', en: 'Stores', tr: 'Mağazalar', ar: 'المتاجر' },
  foot_contact: { az: 'Əlaqə', ru: 'Контакты', en: 'Contact', tr: 'İletişim', ar: 'اتصل بنا' },
  skip: { az: 'Əsas məzmuna keç', ru: 'К основному содержанию', en: 'Skip to content', tr: 'İçeriğe geç', ar: 'انتقل إلى المحتوى' },
  gift_alt: {
    az: 'Qızıl lentlə bağlanmış əl işi XURCUN hədiyyə qutusu',
    ru: 'Подарочная коробка XURCUN ручной работы с золотой лентой',
    en: 'Handcrafted XURCUN gift box tied with a gold ribbon',
    tr: 'Altın kurdeleli el yapımı XURCUN hediye kutusu',
    ar: 'علبة هدايا XURCUN مصنوعة يدويًا بشريط ذهبي',
  },
  aria_nav: { az: 'Əsas naviqasiya', ru: 'Основная навигация', en: 'Main navigation', tr: 'Ana navigasyon', ar: 'التنقل الرئيسي' },
  aria_lang: { az: 'Dil seçimi', ru: 'Выбор языка', en: 'Language', tr: 'Dil seçimi', ar: 'اختيار اللغة' },
  about_tag: { az: 'Haqqımızda', ru: 'О нас', en: 'About us', tr: 'Hakkımızda', ar: 'من نحن' },
  about_title: {
    az: 'Azərbaycanın dad imzası', ru: 'Вкус Азербайджана', en: 'Azerbaijan’s signature of taste',
    tr: 'Azerbaycan’ın lezzet imzası', ar: 'بصمة طعم أذربيجان',
  },
  about_p1: {
    az: 'Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən təsis edilib — bu gün təbii quru meyvə, qoz-fındıq, ekzotik çaylar və şirniyyatların sürətlə böyüyən butik şəbəkəsidir.',
    ru: 'Xurcun основан в 2015 году Вугаром Магеррамовым — сегодня это быстрорастущая сеть бутиков натуральных сухофруктов, орехов, экзотических чаёв и сладостей.',
    en: 'Founded in 2015 by Vugar Maharramov, Xurcun is today a fast-growing chain of boutiques for natural dried fruits, nuts, exotic teas and sweets.',
    tr: '2015’te Vugar Maharramov tarafından kurulan Xurcun, bugün doğal kuru meyve, çerez, egzotik çaylar ve tatlıların hızla büyüyen butik zinciridir.',
    ar: 'تأسست Xurcun عام 2015 على يد فوغار محرموف، وهي اليوم سلسلة بوتيكات سريعة النمو للفواكه المجففة الطبيعية والمكسرات والشاي والحلويات.',
  },
  about_p2: {
    az: 'Bütün məhsullarımız orqanik və təbiidir, konservant yoxdur; qlütensiz seçimlər də mövcuddur. «Keyfiyyətə Vurğunuq!» sadəcə şüar deyil — hər qutuya qoyduğumuz vəddir. Qonaqlar Azərbaycanın dadını dünyaya aparmaq üçün Xurcun-u seçir.',
    ru: 'Вся наша продукция органическая и натуральная, без консервантов; есть и безглютеновые варианты. «Fond of Quality» — не просто слоган, а обещание в каждой коробке. Гости выбирают Xurcun, чтобы увезти вкус Азербайджана с собой.',
    en: 'All our products are organic and natural, with no preservatives, and gluten-free options too. “Fond of Quality” is not just a slogan — it is the promise in every box. Guests choose Xurcun to carry the taste of Azerbaijan home.',
    tr: 'Tüm ürünlerimiz organik ve doğaldır, koruyucu içermez; glutensiz seçenekler de vardır. “Fond of Quality” yalnızca bir slogan değil — her kutuya koyduğumuz sözdür. Misafirler Azerbaycan’ın lezzetini yanlarında götürmek için Xurcun’u seçer.',
    ar: 'جميع منتجاتنا عضوية وطبيعية وخالية من المواد الحافظة، مع خيارات خالية من الغلوتين. «Fond of Quality» ليس مجرد شعار — بل وعدٌ في كل علبة. يختار الضيوف Xurcun ليحملوا نكهة أذربيجان معهم.',
  },
  about_alt: {
    az: 'Xurcun mağazasında məhsulların tərəzidə çəkilməsi',
    ru: 'Взвешивание продукции в бутике Xurcun',
    en: 'Weighing products at a Xurcun boutique counter',
    tr: 'Xurcun mağazasında ürünlerin tartılması',
    ar: 'وزن المنتجات في متجر Xurcun',
  },
} satisfies Record<string, M>

const CATS: M[] = [
  { az: 'Çay & Ədviyyat', ru: 'Чай и специи', en: 'Tea & Spices', tr: 'Çay & Baharat', ar: 'الشاي والتوابل' },
  { az: 'Çərəz', ru: 'Орехи', en: 'Nuts', tr: 'Çerez', ar: 'المكسرات' },
  { az: 'Şokolad', ru: 'Шоколад', en: 'Chocolate', tr: 'Çikolata', ar: 'الشوكولاتة' },
  { az: 'Quru Meyvə', ru: 'Сухофрукты', en: 'Dried Fruits', tr: 'Kuru Meyve', ar: 'الفواكه المجففة' },
  { az: 'Lokum', ru: 'Лукум', en: 'Turkish Delight', tr: 'Lokum', ar: 'الراحة' },
  { az: 'Paxlava', ru: 'Пахлава', en: 'Baklava', tr: 'Baklava', ar: 'البقلاوة' },
  { az: 'Hədiyyəlik', ru: 'Подарки', en: 'Gifts', tr: 'Hediyelik', ar: 'الهدايا' },
]

const FEATURED = [
  { cat: 6, name: 'Boxful M Black', price: '220 ₼', img: 'https://static.ticimax.cloud/47271/Uploads/UrunResimleri/thumb/boxful-m-black-08-1df.jpg', isNew: true },
  { cat: 5, name: 'Bakhlava Special', price: '330 ₼' },
  { cat: 6, name: 'Selection L Purple', price: '250 ₼' },
  { cat: 6, name: 'Carnaval S', price: '35 ₼', isNew: true },
]

type Branch = { slug: string; name: string; addr: string; tel?: string; q: string }
const BRANCHES: Branch[] = [
  { slug: 'port-baku', name: 'Port Baku Mall', addr: 'Üzeyir Hacıbəyov 57, Bakı', tel: '+994777170070', q: 'Xurcun Port Baku Mall' },
  { slug: 'crescent-mall', name: 'Crescent Mall', addr: 'Neftçilər pr. 68, Bakı', q: 'Xurcun Crescent Mall Baku' },
  { slug: 'sea-breeze', name: 'Sea Breeze', addr: 'Sea Breeze Resort, Nardaran', q: 'Xurcun Sea Breeze Baku' },
  { slug: 'genclik', name: 'Gənclik Mall', addr: 'Fətəli Xan Xoyski 38, Bakı', tel: '+994502123574', q: 'Xurcun Genclik Mall Baku' },
  { slug: 'semed-vurgun', name: 'Səməd Vurğun', addr: 'Səməd Vurğun 81, Bakı', tel: '+994502123549', q: 'Xurcun Semed Vurgun 81 Baku' },
  { slug: 'azadliq', name: 'Azadlıq prospekti', addr: 'Azadlıq pr. 119, Bakı', tel: '+994502123547', q: 'Xurcun Azadliq prospekti Baku' },
  { slug: 'huseyn-cavid', name: 'Hüseyn Cavid', addr: 'Hüseyn Cavid pr. 47K, Bakı', tel: '+994502123548', q: 'Xurcun Huseyn Cavid Baku' },
  { slug: 'xetai', name: 'Xətai', addr: 'İzzət Orucov 16, Bakı', tel: '+994122121811', q: 'Xurcun Xetai Baku' },
  { slug: 'airport', name: 'Hava Limanı — Coffee', addr: 'Heydər Əliyev Hava Limanı, Terminal 1', tel: '+994502123515', q: 'Xurcun Cafe Terminal 1 Baku Airport' },
  { slug: 'airport-dutyfree', name: 'Hava Limanı — Duty Free', addr: 'Heydər Əliyev Hava Limanı (GYD)', q: 'Xurcun Duty Free Heydar Aliyev Airport' },
  { slug: 'white-city', name: 'White City', addr: '1-ci Yaşıl Ada küç., Bakı', tel: '+994502123599', q: 'Xurcun White City Baku' },
]

const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`
// Tap-to-call: strip any formatting so tel: always dials; branches without a number fall back to the central line.
const MAIN_TEL = '+994502121811'
const telHref = (n?: string) => `tel:${(n || MAIN_TEL).replace(/[^\d+]/g, '')}`

export default function HomePage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const root = useRef<HTMLDivElement>(null)
  const heroVid = useRef<HTMLVideoElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Branches come from the admin/DB (synced). Fallback to static list if API empty.
  const branchesQ = trpc.branch.getBranches.useQuery(undefined, { retry: false })
  const branchesFromDb: Branch[] = (branchesQ.data ?? [])
    .map((b) => ({
      slug: b.slug ?? '', name: b.name ?? '', addr: b.address ?? '', tel: b.phone ?? undefined, q: `Xurcun ${b.name ?? ''} Baku`,
    }))
    .filter((b) => b.name) // a branch with no name can't render a usable card
  const branches: Branch[] = branchesFromDb.length ? branchesFromDb : BRANCHES

  // Categories + featured products from the admin/DB (synced). Fallback to static.
  const suffix = lang === 'az' ? 'Az' : lang === 'ru' ? 'Ru' : lang === 'en' ? 'En' : lang === 'tr' ? 'Tr' : 'Ar'
  const pick = (o: Record<string, unknown>, base: string) => (o[base + suffix] || o[base + 'Az'] || '') as string

  const catQ = trpc.catalog.categories.useQuery(undefined, { retry: false })
  // Drop empty/untranslated rows so the DB never renders blank category cells; fall back to static.
  const catFromDb = (catQ.data ?? []).map((c) => pick(c as Record<string, unknown>, 'title')).filter(Boolean)
  const catLabels: string[] = catFromDb.length ? catFromDb : CATS.map((c) => t(c))

  const featQ = trpc.catalog.featured.useQuery(undefined, { retry: false })
  const featFromDb = (featQ.data ?? [])
    .map((p) => {
      const o = p as Record<string, unknown>
      return {
        name: pick(o, 'name'),
        cat: pick(o, 'catTitle'),
        price: o.priceVisible === false ? '' : (o.price ? `${o.price as string} ₼${o.unit ? ` / ${o.unit as string}` : ''}` : ''),
        img: (o.imageUrl as string) || undefined,
        isNew: !!o.isNew,
      }
    })
    .filter((p) => p.name) // a product with no name in any language is unusable
  const featured = featFromDb.length
    ? featFromDb
    : FEATURED.map((p) => ({ name: p.name, cat: t(CATS[p.cat]), price: p.price, img: p.img, isNew: !!p.isNew }))

  useEffect(() => {
    const el = root.current
    if (!el) return
    // Hero video plays only when motion is welcome; otherwise the poster still stands in.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      heroVid.current?.play().catch(() => {})
    }
    const reveals = el.querySelectorAll('.reveal')
    let io: IntersectionObserver | null = null
    let safety: number | undefined
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io?.unobserve(e.target) } }),
        { threshold: 0.16 },
      )
      reveals.forEach((n) => io!.observe(n))
      // Safety net: never leave content stuck at opacity:0 if a reveal never fires
      // (backgrounded tab, very tall viewport, observer throttling).
      safety = window.setTimeout(() => reveals.forEach((n) => n.classList.add('in')), 1500)
    } else {
      reveals.forEach((n) => n.classList.add('in'))
    }
    const hdr = el.querySelector('header')
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => { hdr?.classList.toggle('shrink', window.scrollY > 60); ticking = false })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    const cleanups: (() => void)[] = []
    el.querySelectorAll<HTMLDivElement>('.branch').forEach((b) => {
      const v = b.querySelector('video'); if (!v) return
      const play = () => { v.play().catch(() => {}) }
      const stop = () => { v.pause(); try { v.currentTime = 0 } catch { /* noop */ } }
      // Touch devices have no hover: tap the card to toggle the clip. preload="none"
      // means bytes load only on this explicit intent. Taps on the call/maps links pass through.
      const tap = (e: Event) => {
        if ((e.target as HTMLElement).closest('a')) return
        if (v.paused) play(); else stop()
      }
      const onPlay = () => b.classList.add('playing')
      const onPause = () => b.classList.remove('playing')
      b.addEventListener('mouseenter', play); b.addEventListener('mouseleave', stop)
      b.addEventListener('click', tap)
      v.addEventListener('play', onPlay); v.addEventListener('pause', onPause)
      cleanups.push(() => {
        b.removeEventListener('mouseenter', play); b.removeEventListener('mouseleave', stop)
        b.removeEventListener('click', tap)
        v.removeEventListener('play', onPlay); v.removeEventListener('pause', onPause)
      })
    })
    return () => { io?.disconnect(); if (safety) clearTimeout(safety); window.removeEventListener('scroll', onScroll); cleanups.forEach((c) => c()) }
  }, [lang, branchesQ.data, catQ.data, featQ.data])

  return (
    <div className="xc" ref={root}>
      <a className="skip" href="#main">{t(S.skip)}</a>
      <div className="topbar" id="top"><div className="wrap">
        <div className="ph"><span>info@xurcun.az</span><span>+994 50 212 18 11</span></div>
        <div className="langs" role="group" aria-label={t(S.aria_lang)}>
          {LANGS.map((l) => (
            <button key={l.code} className={lang === l.code ? 'on' : ''} aria-pressed={lang === l.code} aria-label={l.code.toUpperCase()} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </div>
      </div></div>

      <header className={menuOpen ? 'nav-open' : ''}>
        <div className="wrap">
          <picture>
            <source srcSet={LOGO_WEBP} type="image/webp" />
            <img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" width={175} height={58} />
          </picture>
          <button
            type="button"
            className="navtoggle"
            aria-label={t(S.aria_nav)}
            aria-controls="primary-nav"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
          <nav id="primary-nav" aria-label={t(S.aria_nav)} onClick={() => setMenuOpen(false)}>
            <a href="#top">{t(S.nav_home)}</a><a href="/catalog">{t(S.nav_catalog)}</a><a href="/catalog">{t(S.nav_gift)}</a>
            <a href="#magazalar">{t(S.nav_stores)}</a><a href="#haqqimizda">{t(S.nav_about)}</a><a href="#elaqe">{t(S.nav_contact)}</a>
          </nav>
        </div>
      </header>

      <section className="hero" id="main">
        <video className="herovid" ref={heroVid} poster={HERO_IMG} muted loop playsInline preload="metadata" aria-hidden="true">
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="bgpat" /><div className="veil" />
        <div className="wrap">
          <img className="emb" src={EMBLEM} alt="" />
          <div className="script">{t(S.hero_script)}</div>
          <h1>{t(S.hero_h1a)} <em>{t(S.hero_h1em)}</em></h1>
          <p className="lead">{t(S.hero_lead)}</p>
          <div className="btns">
            <a className="btn btn-gold" href="/catalog">{t(S.cta_catalog)}</a>
            <a className="btn btn-ghost" href="#magazalar">{t(S.cta_stores)}</a>
          </div>
        </div>
      </section>

      <div className="values"><div className="wrap">
        <span><i />{t(S.v_natural)}</span><span><i />{t(S.v_handmade)}</span>
        <span><i />{t(S.v_stores)}</span><span><i />{t(S.v_est)}</span>
      </div></div>

      <section className="sec" id="cat">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{t(S.cat_title)}</h2>
          </div>
          <div className="cats reveal d1">
            {catLabels.map((label, i) => (<div className="cat" key={i}><img src={EMBLEM} alt="" />{label}</div>))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--cream-100)' }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{t(S.feat_title)}</h2>
          </div>
          <div className="grid">
            {featured.map((p, i) => (
              <div className={`card reveal d${(i % 3) + 1}`} key={i}>
                <div className="thumb">
                  {p.isNew && <span className="badge">{t(S.yeni)}</span>}
                  {p.img ? (
                    <img className="pimg" src={p.img} alt={p.name} loading="lazy" decoding="async"
                      onError={(e) => { const img = e.currentTarget; img.onerror = null; img.src = EMBLEM; img.className = 'wm' }} />
                  ) : <img className="wm" src={EMBLEM} alt="" loading="lazy" decoding="async" />}
                </div>
                <div className="card-b"><div className="pcat">{p.cat}</div><div className="pname">{p.name}</div>{p.price && <div className="price">{p.price}</div>}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="about" id="haqqimizda">
        <div className="wrap">
          <div className="about-media reveal">
            <picture>
              <source srcSet={ABOUT_WEBP} type="image/webp" />
              <img src={ABOUT_IMG} alt={t(S.about_alt)} loading="lazy" decoding="async" />
            </picture>
          </div>
          <div className="about-body reveal d1">
            <div className="tag">{t(S.about_tag)}</div>
            <h2>{t(S.about_title)}</h2>
            <p>{t(S.about_p1)}</p>
            <p>{t(S.about_p2)}</p>
            <div className="about-stats">
              <span>{t(S.v_est)}</span>
              <span>{t(S.v_natural)}</span>
              <span>{t(S.stores_label)}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="luxe">
        <div className="bgpat" />
        <div className="wrap">
          <div className="reveal">
            <div className="tag">{t(S.luxe_tag)}</div>
            <h2>{t(S.luxe_h1a)}<br /><em>{t(S.luxe_h1em)}</em></h2>
            <p>{t(S.luxe_p)}</p>
            <a className="btn btn-gold" href="/catalog">{t(S.luxe_cta)}</a>
          </div>
          <div className="luxe-frame reveal d2"><picture><source srcSet={GIFT_WEBP} type="image/webp" /><img className="gimg" src={GIFT_IMG} alt={t(S.gift_alt)} loading="lazy" decoding="async" /></picture></div>
        </div>
      </div>

      <section className="sec" id="magazalar">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{t(S.stores_title)}</h2><div className="tag">{t(S.stores_label)}</div>
          </div>
          <div className="mag-grid">
            {branches.map((b, i) => (
              <div className={`branch reveal d${(i % 3) + 1}`} key={b.slug || b.name || i}>
                <video muted loop playsInline preload="none" poster={`/images/branches/${b.slug}.webp`}>
                  <source src={`/videos/${b.slug}.mp4`} type="video/mp4" />
                </video>
                <div className="grad" /><div className="play">▶</div>
                <div className="bover">
                  <div className="bn">{b.name}</div><div className="ba">{b.addr}</div>
                  <div className="brow">
                    <a className="tel" href={telHref(b.tel)} aria-label={`${t(S.call)}: ${b.name}`}>{t(S.call)}</a>
                    <a href={maps(b.q)} target="_blank" rel="noopener noreferrer" aria-label={`${b.name} — Google Maps`}>Google Maps</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer id="elaqe">
        <div className="bgpat" />
        <div className="wrap">
          <div className="reveal"><picture><source srcSet={LOGO_WEBP} type="image/webp" /><img className="logo" src={LOGO} alt="Xurcun" width={140} height={48} /></picture><p>{t(S.foot_about)}</p></div>
          <div className="reveal d1"><h3>{t(S.foot_stores)}</h3><ul><li>Port Baku Mall</li><li>Gənclik Mall</li><li>Crescent Mall</li><li>Sea Breeze</li><li>Hava Limanı</li></ul></div>
          <div className="reveal d2"><h3>{t(S.foot_contact)}</h3><ul>
            <li><a href="mailto:info@xurcun.az">info@xurcun.az</a></li>
            <li><a href="tel:+994502121811">+994 50 212 18 11</a></li>
            <li><a href="https://instagram.com/xurcun" target="_blank" rel="noopener noreferrer">Instagram</a> · <a href="https://fb.com/xurcun" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://xurcun.az">xurcun.az</a></li>
          </ul></div>
        </div>
        <div className="copyright">© 2026 Xurcun · Bütün hüquqlar qorunur</div>
      </footer>
    </div>
  )
}
