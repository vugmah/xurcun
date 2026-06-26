import { useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import '@/xurcun-home.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'

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
  hero_h1a: { az: 'Keyfiyyətə', ru: 'Преданы', en: 'Fond of', tr: 'Kaliteye', ar: 'مغرمون' },
  hero_h1em: { az: 'vurğunuq.', ru: 'качеству.', en: 'quality.', tr: 'gönül verdik.', ar: 'بالجودة.' },
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
    az: 'Azərbaycanın premium quru meyvə, çərəz və hədiyyə butiki. 2015-dən bəri keyfiyyətə vurğunuq.',
    ru: 'Премиальный бутик сухофруктов, орехов и подарков Азербайджана. Преданы качеству с 2015 года.',
    en: 'Azerbaijan’s premium dried fruit, nuts and gift boutique. Fond of quality since 2015.',
    tr: 'Azerbaycan’ın premium kuru meyve, çerez ve hediye butiği. 2015’ten beri kaliteye tutkunuz.',
    ar: 'بوتيك أذربيجان الفاخر للفواكه المجففة والمكسرات والهدايا. مغرمون بالجودة منذ 2015.',
  },
  foot_stores: { az: 'Mağazalar', ru: 'Магазины', en: 'Stores', tr: 'Mağazalar', ar: 'المتاجر' },
  foot_contact: { az: 'Əlaqə', ru: 'Контакты', en: 'Contact', tr: 'İletişim', ar: 'اتصل بنا' },
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

export default function HomePage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
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
      const v = b.querySelector('video'); if (!v) return
      const play = () => { v.play().catch(() => {}) }
      const stop = () => { v.pause(); try { v.currentTime = 0 } catch { /* noop */ } }
      b.addEventListener('mouseenter', play); b.addEventListener('mouseleave', stop)
      cleanups.push(() => { b.removeEventListener('mouseenter', play); b.removeEventListener('mouseleave', stop) })
    })
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); cleanups.forEach((c) => c()) }
  }, [lang])

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
            <a href="#">{t(S.nav_home)}</a><a href="#cat">{t(S.nav_catalog)}</a><a href="#cat">{t(S.nav_gift)}</a>
            <a href="#magazalar">{t(S.nav_stores)}</a><a href="#">{t(S.nav_about)}</a><a href="#">{t(S.nav_contact)}</a>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="bgpat" /><div className="veil" />
        <div className="wrap">
          <img className="emb" src={EMBLEM} alt="" />
          <div className="script">{t(S.hero_script)}</div>
          <h1>{t(S.hero_h1a)} <em>{t(S.hero_h1em)}</em></h1>
          <p className="lead">{t(S.hero_lead)}</p>
          <div className="btns">
            <a className="btn btn-gold" href="#cat">{t(S.cta_catalog)}</a>
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
            <h2>{t(S.cat_title)}</h2><div className="tag">{t(S.cat_label)}</div>
          </div>
          <div className="cats reveal d1">
            {CATS.map((c) => (<div className="cat" key={c.az}><img src={EMBLEM} alt="" />{t(c)}</div>))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: 'var(--cream-100)' }}>
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{t(S.feat_title)}</h2><div className="tag">{t(S.feat_label)}</div>
          </div>
          <div className="grid">
            {FEATURED.map((p, i) => (
              <div className={`card reveal d${(i % 3) + 1}`} key={p.name}>
                <div className="thumb">
                  {p.isNew && <span className="badge">{t(S.yeni)}</span>}
                  {p.img ? <img className="pimg" src={p.img} alt={p.name} /> : <img className="wm" src={EMBLEM} alt="" />}
                </div>
                <div className="card-b"><div className="pcat">{t(CATS[p.cat])}</div><div className="pname">{p.name}</div><div className="price">{p.price}</div></div>
              </div>
            ))}
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
            <a className="btn btn-gold" href="#cat">{t(S.luxe_cta)}</a>
          </div>
          <div className="luxe-frame reveal d2"><img src={EMBLEM} alt="" /></div>
        </div>
      </div>

      <section className="sec" id="magazalar">
        <div className="wrap">
          <div className="sec-head reveal">
            <div className="ornament"><img src={EMBLEM} alt="" /></div>
            <h2>{t(S.stores_title)}</h2><div className="tag">{t(S.stores_label)}</div>
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
                    {b.tel && <a className="tel" href={`tel:${b.tel}`}>{t(S.call)}</a>}
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
          <div className="reveal"><img className="logo" src={LOGO} alt="Xurcun" /><p>{t(S.foot_about)}</p></div>
          <div className="reveal d1"><h4>{t(S.foot_stores)}</h4><ul><li>Port Baku Mall</li><li>Gənclik Mall</li><li>Crescent Mall</li><li>Sea Breeze</li><li>Hava Limanı</li></ul></div>
          <div className="reveal d2"><h4>{t(S.foot_contact)}</h4><ul><li>info@xurcun.az</li><li>+994 50 212 18 11</li><li>Instagram · Facebook</li><li>xurcun.az</li></ul></div>
        </div>
        <div className="copyright">© 2026 Xurcun · Bütün hüquqlar qorunur</div>
      </footer>
    </div>
  )
}
