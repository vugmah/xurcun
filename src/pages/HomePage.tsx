import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import '@/xurcun-home.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'

const LANGS: { code: 'az' | 'ru' | 'en' | 'tr' | 'ar'; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

const CATS = ['Çay & Ədviyyat', 'Çərəz', 'Şokolad', 'Quru Meyvə', 'Lokum', 'Paxlava', 'Hədiyyəlik']

const FEATURED = [
  { name: 'Boxful M Black', cat: 'Hədiyyəlik', price: '220 ₼', img: 'https://static.ticimax.cloud/47271/Uploads/UrunResimleri/thumb/boxful-m-black-08-1df.jpg', isNew: true },
  { name: 'Bakhlava Special', cat: 'Paxlava', price: '330 ₼' },
  { name: 'Selection L Purple', cat: 'Hədiyyəlik', price: '250 ₼' },
  { name: 'Carnaval S', cat: 'Hədiyyəlik', price: '35 ₼', isNew: true },
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

export default function HomePage() {
  const { lang, setLang } = useLanguage()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }),
      { threshold: 0.16 },
    )
    el.querySelectorAll('.reveal').forEach((n) => io.observe(n))

    const hdr = el.querySelector('header')
    const onScroll = () => hdr?.classList.toggle('shrink', window.scrollY > 60)
    window.addEventListener('scroll', onScroll)

    const cleanups: (() => void)[] = []
    el.querySelectorAll<HTMLDivElement>('.branch').forEach((b) => {
      const v = b.querySelector('video')
      if (!v) return
      const play = () => { v.play().catch(() => {}) }
      const stop = () => { v.pause(); try { v.currentTime = 0 } catch { /* noop */ } }
      b.addEventListener('mouseenter', play)
      b.addEventListener('mouseleave', stop)
      cleanups.push(() => { b.removeEventListener('mouseenter', play); b.removeEventListener('mouseleave', stop) })
    })

    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); cleanups.forEach((c) => c()) }
  }, [])

  return (
    <div className="xc" ref={root}>
      <div className="topbar"><div className="wrap">
        <div className="ph"><span>info@xurcun.az</span><span>+994 50 212 18 11</span></div>
        <div className="langs">
          {LANGS.map((l) => (
            <button key={l.code} className={lang === l.code ? 'on' : ''} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </div>
      </div></div>

      <header>
        <div className="wrap">
          <img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" />
          <nav>
            <a href="#">Ana səhifə</a><a href="#cat">Kataloq</a><a href="#">Hədiyyəlik</a>
            <a href="#magazalar">Mağazalar</a><a href="#">Haqqımızda</a><a href="#">Əlaqə</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="bgpat" /><div className="veil" />
        <div className="wrap">
          <img className="emb" src={EMBLEM} alt="" />
          <div className="script">təbiətin ən seçmə dadları</div>
          <h1>Keyfiyyətə <em>vurğunuq.</em></h1>
          <p className="lead">Seçmə quru meyvələr, qoz-fındıq, ləziz şirniyyatlar və əl işi premium hədiyyə qutuları — 2015-dən bəri Azərbaycanın zövqlü süfrəsi üçün.</p>
          <div className="btns">
            <a className="btn btn-gold" href="#cat">Kataloqa bax</a>
            <a className="btn btn-ghost" href="#magazalar">Mağazalar</a>
          </div>
        </div>
      </section>

      <div className="values"><div className="wrap">
        <span><i />100% Təbii</span><span><i />Əl işi hədiyyə qutuları</span>
        <span><i />11 mağaza · Bakı</span><span><i />Est. 2015</span>
      </div></div>

      <section className="sec" id="cat">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>Kolleksiyanı kəşf et</h2><div className="tag">Kateqoriyalar</div>
          </div>
          <div className="cats reveal d1">
            {CATS.map((c) => (<div className="cat" key={c}><img src={EMBLEM} alt="" />{c}</div>))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--cream-100)' }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>Seçilmiş məhsullar</h2><div className="tag">Bestseller</div>
          </div>
          <div className="grid">
            {FEATURED.map((p, i) => (
              <div className={`card reveal d${(i % 3) + 1}`} key={p.name}>
                <div className="thumb">
                  {p.isNew && <span className="badge">Yeni</span>}
                  {p.img
                    ? <img className="pimg" src={p.img} alt={p.name} />
                    : <img className="wm" src={EMBLEM} alt="" />}
                </div>
                <div className="card-b"><div className="pcat">{p.cat}</div><div className="pname">{p.name}</div><div className="price">{p.price}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="luxe">
        <div className="bgpat" />
        <div className="wrap">
          <div className="reveal">
            <div className="tag">İmza kolleksiya</div>
            <h2>Hədiyyə vermək<br />bir <em>incəsənətdir.</em></h2>
            <p>Əl işi ağac və dəri qutularda hazırlanan premium hədiyyə seçimlərimiz — korporativ təqdimatlar, bayramlar və xüsusi anlar üçün. Hər qutu Xurcun keyfiyyəti ilə imzalanır.</p>
            <a className="btn btn-gold" href="#cat">Hədiyyə qutularına bax</a>
          </div>
          <div className="luxe-frame reveal d2"><img src={EMBLEM} alt="" /></div>
        </div>
      </div>

      <section className="sec" id="magazalar">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>Mağazalarımız</h2><div className="tag">11 filial · Bakı</div>
          </div>
          <div className="mag-grid">
            {BRANCHES.map((b, i) => (
              <div className={`branch reveal d${(i % 3) + 1}`} key={b.slug}>
                <video muted loop playsInline preload="none" poster={`/images/branches/${b.slug}.jpg`}>
                  <source src={`/videos/${b.slug}.mp4`} type="video/mp4" />
                </video>
                <div className="grad" /><div className="play">▶</div>
                <div className="bover">
                  <div className="bn">{b.name}</div><div className="ba">{b.addr}</div>
                  <div className="brow">
                    {b.tel && <a className="tel" href={`tel:${b.tel}`}>Zəng et</a>}
                    <a href={maps(b.q)} target="_blank" rel="noopener noreferrer">Google Maps</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="bgpat" />
        <div className="wrap">
          <div className="reveal"><img className="logo" src={LOGO} alt="Xurcun" /><p>Azərbaycanın premium quru meyvə, çərəz və hədiyyə butiki. 2015-dən bəri keyfiyyətə vurğunuq.</p></div>
          <div className="reveal d1"><h4>Mağazalar</h4><ul><li>Port Baku Mall</li><li>Gənclik Mall</li><li>Crescent Mall</li><li>Sea Breeze</li><li>Hava Limanı</li></ul></div>
          <div className="reveal d2"><h4>Əlaqə</h4><ul><li>info@xurcun.az</li><li>+994 50 212 18 11</li><li>Instagram · Facebook</li><li>xurcun.az</li></ul></div>
        </div>
        <div className="copyright">© 2026 Xurcun · Bütün hüquqlar qorunur · Lang: {lang.toUpperCase()}</div>
      </footer>
    </div>
  )
}
