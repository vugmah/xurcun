import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import { TEXT_DEFAULT, type L5 } from '@/lib/homepageTextStore'
import GiftCardSection from '@/components/GiftCardSection'
import TasteGallery from '@/components/TasteGallery'
import '@/xurcun-base.css'
import '@/xurcun-home.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'
const HERO_IMG = '/images/home/hero.webp' // hero video poster — single-URL attr, webp
const GIFT_IMG = '/images/home/gift.jpg'
const ANNIV_POSTER = '/images/anniversary.webp' // poster for the anniversary reel

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

type M = Record<Lang, string>

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
// Tap-to-call: strip any formatting so each branch's own number always dials.
const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, '')}`

export default function HomePage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const root = useRef<HTMLDivElement>(null)
  const heroVid = useRef<HTMLVideoElement>(null)
  const aboutVid = useRef<HTMLVideoElement>(null)
  const [aboutSound, setAboutSound] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // Pick a lighter 480p hero clip on phones (~280KB vs 842KB). Decided once at
  // mount — `media` on a <video><source> is not reliably honored by browsers.
  const [heroVideo] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
      ? '/videos/hero-mobile.mp4'
      : '/videos/hero.mp4',
  )

  const toggleAboutSound = () => {
    const v = aboutVid.current
    if (!v) return
    const next = !aboutSound
    v.muted = !next
    if (next) void v.play?.()
    setAboutSound(next)
  }

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

  // Homepage image overrides (admin CMS). Rows keyed by section `homepage:<key>`.
  const homeImgsQ = trpc.photos.getAll.useQuery(undefined, { retry: false })
  const homeMap = useMemo(() => {
    const m: Record<string, string> = {}
    const PREFIX = 'homepage:'
    ;(homeImgsQ.data ?? []).forEach((p) => {
      if (p.section?.startsWith(PREFIX)) m[p.section.slice(PREFIX.length)] = p.url
    })
    return m
  }, [homeImgsQ.data])
  const img = (key: string, fallback: string) => homeMap[key] || fallback

  // Homepage text overrides (admin CMS). Falls back to in-code TEXT_DEFAULT so
  // the page renders identical copy while the query loads or when the DB is empty.
  const homeTextQ = trpc.homepageText.getAll.useQuery(undefined, { retry: false })
  const textMap = useMemo(() => {
    const m: Record<string, L5> = {}
    ;(homeTextQ.data ?? []).forEach((t) => { m[t.key] = t.value })
    return m
  }, [homeTextQ.data])
  const txt = (key: string, l: Lang = lang) => textMap[key]?.[l] || TEXT_DEFAULT[key]?.[l] || TEXT_DEFAULT[key]?.az || ''

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
      <a className="skip" href="#main">{txt('skip')}</a>
      <div className="topbar" id="top"><div className="wrap">
        <div className="ph"><a href="mailto:info@xurcun.az" dir="ltr">info@xurcun.az</a><a href="tel:+994502121811" dir="ltr">+994 50 212 18 11</a></div>
        <div className="langs" role="group" aria-label={txt('aria_lang')}>
          {LANGS.map((l) => (
            <button key={l.code} className={lang === l.code ? 'on' : ''} aria-pressed={lang === l.code} aria-label={l.code.toUpperCase()} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </div>
      </div></div>

      <header className={menuOpen ? 'nav-open' : ''}>
        <div className="wrap">
          <img className="logo" src={img('logo', LOGO)} alt="Xurcun — Fond of Quality" width={175} height={58} />
          <button
            type="button"
            className="navtoggle"
            aria-label={txt('aria_nav')}
            aria-controls="primary-nav"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span /><span /><span />
          </button>
          <nav id="primary-nav" aria-label={txt('aria_nav')} onClick={() => setMenuOpen(false)}>
            <a href="#top">{txt('nav_home')}</a><a href="/catalog">{txt('nav_catalog')}</a><a href="/catalog">{txt('nav_gift')}</a>
            <a href="/gift-card">{txt('nav_giftcard')}</a><a href="#magazalar">{txt('nav_stores')}</a><a href="#haqqimizda">{txt('nav_about')}</a><a href="#elaqe">{txt('nav_contact')}</a>
          </nav>
        </div>
      </header>

      <section className="hero" id="main">
        <video className="herovid" ref={heroVid} poster={img('hero_poster', HERO_IMG)} muted loop playsInline preload="metadata" aria-hidden="true">
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="bgpat" /><div className="veil" />
        <div className="wrap">
          <img className="emb" src={EMBLEM} alt="" />
          <div className="script">{txt('hero_script')}</div>
          <h1>{txt('hero_h1a')} <em>{txt('hero_h1em')}</em></h1>
          <p className="lead">{txt('hero_lead')}</p>
          <div className="btns">
            <a className="btn btn-gold" href="/catalog">{txt('cta_catalog')}</a>
            <a className="btn btn-ghost" href="#magazalar">{txt('cta_stores')}</a>
          </div>
        </div>
      </section>

      <div className="values"><div className="wrap">
        <span><i />{txt('v_natural')}</span><span><i />{txt('v_handmade')}</span>
        <span><i />{txt('v_stores')}</span><span><i />{txt('v_est')}</span>
      </div></div>

      <section className="sec" id="cat">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{txt('cat_title')}</h2>
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
            <h2>{txt('feat_title')}</h2>
          </div>
          <div className="grid">
            {featured.map((p, i) => (
              <div className={`card reveal d${(i % 3) + 1}`} key={i}>
                <div className="thumb">
                  {p.isNew && <span className="badge">{txt('yeni')}</span>}
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

      <TasteGallery />

      <GiftCardSection />

      <section className="about" id="haqqimizda">
        <div className="wrap">
          <div className="about-media reveal">
            <video ref={aboutVid} className="about-vid" muted loop playsInline autoPlay preload="metadata" poster={img('about_poster', '/images/gv-ribbons.webp')} aria-label={txt('about_alt')}>
              <source src="/videos/gv-ribbons-s.mp4" type="video/mp4" />
            </video>
            <button
              type="button"
              className={`about-sound${aboutSound ? ' on' : ''}`}
              onClick={toggleAboutSound}
              aria-pressed={aboutSound}
              aria-label={txt('about_sound')}
              title={txt('about_sound')}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
                {aboutSound
                  ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 6a8 8 0 0 1 0 12" /></>
                  : <path d="m17 9 5 6M22 9l-5 6" />}
              </svg>
              <span>{txt('about_sound')}</span>
            </button>
          </div>
          <div className="about-body reveal d1">
            <div className="tag">{txt('about_tag')}</div>
            <h2>{txt('about_title')}</h2>
            <p>{txt('about_p1')}</p>
            <p>{txt('about_p2')}</p>
            <div className="about-stats">
              <span>{txt('v_est')}</span>
              <span>{txt('v_natural')}</span>
              <span>{txt('stores_label')}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="luxe">
        <div className="bgpat" />
        <div className="wrap">
          <div className="reveal">
            <div className="tag">{txt('luxe_tag')}</div>
            <h2>{txt('luxe_h1a')}<br /><em>{txt('luxe_h1em')}</em></h2>
            <p>{txt('luxe_p')}</p>
            <a className="btn btn-gold" href="/catalog">{txt('luxe_cta')}</a>
          </div>
          <div className="luxe-frame reveal d2"><img className="gimg" src={img('gift', GIFT_IMG)} alt={txt('gift_alt')} loading="lazy" decoding="async" /></div>
        </div>
      </div>

      <section className="sec" id="magazalar">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{txt('stores_title')}</h2><div className="tag">{txt('stores_label')}</div>
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
                    {b.tel && <a className="tel" href={telHref(b.tel)} aria-label={`${txt('call')}: ${b.name}`}>{txt('call')}</a>}
                    <a href={maps(b.q)} target="_blank" rel="noopener noreferrer" aria-label={`${b.name} — Google Maps`}>Google Maps</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec anniv" id="yubiley" style={{ background: 'var(--cream-100)' }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{txt('anniv_title')}</h2><div className="tag">{txt('anniv_label')}</div>
          </div>
          <p className="anniv-lead reveal">{txt('anniv_lead')}</p>
          <div className="anniv-stage reveal">
            <video controls playsInline preload="none" poster={img('anniversary_poster', ANNIV_POSTER)}>
              <source src="/videos/anniversary.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <footer id="elaqe">
        <div className="bgpat" />
        <div className="wrap">
          <div className="reveal"><img className="logo" src={img('logo', LOGO)} alt="Xurcun" width={140} height={48} /><p>{txt('foot_about')}</p><p className="foot-links"><a href="/about">{txt('nav_about')}</a> · <a href="/faq">FAQ</a> · <a href="/blog">Blog</a> · <a href="/corporate">{txt('nav_corp')}</a> · <a href="/gift-card">{txt('nav_giftcard')}</a> · <a href="/catalog">{txt('nav_catalog')}</a></p></div>
          <div className="reveal d1"><h3>{txt('foot_stores')}</h3><ul><li>Port Baku Mall</li><li>Gənclik Mall</li><li>Crescent Mall</li><li>Sea Breeze</li><li>Hava Limanı</li></ul></div>
          <div className="reveal d2"><h3>{txt('foot_contact')}</h3><ul>
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
