import { useLanguage } from '@/lib/LanguageContext'
import SEO from '@/sections/SEO'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]
type M = Record<Lang, string>

const S = {
  home: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
  catalog: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
  tag: { az: 'Haqqımızda', ru: 'О нас', en: 'About us', tr: 'Hakkımızda', ar: 'من نحن' },
  h1: {
    az: 'Azərbaycanın dad imzası', ru: 'Вкус Азербайджана', en: 'Azerbaijan’s signature of taste',
    tr: 'Azerbaycan’ın lezzet imzası', ar: 'بصمة طعم أذربيجان',
  },
  p1: {
    az: 'Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən təsis edilib — bu gün təbii quru meyvə, qoz-fındıq, ekzotik çaylar, şirniyyat və əl işi hədiyyə qutularının sürətlə böyüyən butik şəbəkəsidir. Bakıda 11 mağaza.',
    ru: 'Xurcun основан в 2015 году Вугаром Магеррамовым — сегодня это быстрорастущая сеть бутиков натуральных сухофруктов, орехов, экзотических чаёв, сладостей и подарков ручной работы. 11 магазинов в Баку.',
    en: 'Founded in 2015 by Vugar Maharramov, Xurcun is today a fast-growing chain of boutiques for natural dried fruit, nuts, exotic teas, sweets and handcrafted gift boxes. 11 stores in Baku.',
    tr: '2015’te Vugar Maharramov tarafından kurulan Xurcun, bugün doğal kuru meyve, çerez, egzotik çaylar, tatlı ve el yapımı hediye kutularının hızla büyüyen butik zinciridir. Bakü’de 11 mağaza.',
    ar: 'تأسست Xurcun عام 2015 على يد ووقار محرّموف، وهي اليوم سلسلة بوتيكات سريعة النمو للفواكه المجففة الطبيعية والمكسرات والشاي والحلويات وعلب الهدايا المصنوعة يدويًا. 11 متجرًا في باكو.',
  },
  p2: {
    az: 'Bütün məhsullarımız təbii və konservantsızdır; qlütensiz seçimlər də mövcuddur. «Keyfiyyətə Vurğunuq!» sadəcə şüar deyil — hər qutuya qoyduğumuz vəddir. Qonaqlar Azərbaycanın dadını dünyaya aparmaq üçün Xurcun-u seçir.',
    ru: 'Вся наша продукция натуральная, без консервантов; есть и безглютеновые варианты. «Fond of Quality» — не просто слоган, а обещание в каждой коробке. Гости выбирают Xurcun, чтобы увезти вкус Азербайджана с собой.',
    en: 'All our products are natural, with no preservatives, and gluten-free options too. “Fond of Quality” is not just a slogan — it is the promise in every box. Guests choose Xurcun to carry the taste of Azerbaijan home.',
    tr: 'Tüm ürünlerimiz doğaldır, koruyucu içermez; glutensiz seçenekler de vardır. “Fond of Quality” yalnızca bir slogan değil — her kutuya koyduğumuz sözdür. Misafirler Azerbaycan’ın lezzetini götürmek için Xurcun’u seçer.',
    ar: 'جميع منتجاتنا طبيعية وخالية من المواد الحافظة، مع خيارات خالية من الغلوتين. «Fond of Quality» ليس مجرد شعار — بل وعدٌ في كل علبة. يختار الضيوف Xurcun ليحملوا نكهة أذربيجان معهم.',
  },
  facts_title: { az: 'Bir baxışda', ru: 'Кратко', en: 'At a glance', tr: 'Bir bakışta', ar: 'لمحة سريعة' },
  f_year: { az: '2015-dən bəri', ru: 'С 2015 года', en: 'Since 2015', tr: '2015’ten beri', ar: 'منذ 2015' },
  f_stores: { az: 'Bakıda 11 mağaza', ru: '11 магазинов в Баку', en: '11 stores in Baku', tr: 'Bakü’de 11 mağaza', ar: '11 متجرًا في باكو' },
  f_natural: { az: '100% təbii, konservantsız', ru: '100% натурально, без консервантов', en: '100% natural, no preservatives', tr: '%100 doğal, koruyucusuz', ar: 'طبيعي 100٪ بدون مواد حافظة' },
  f_gift: { az: 'Əl işi hədiyyə qutuları', ru: 'Подарки ручной работы', en: 'Handcrafted gift boxes', tr: 'El yapımı hediye kutuları', ar: 'علب هدايا يدوية' },
}

export default function AboutPage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  return (
    <div className="xc xcpage">
      <SEO page="about" />
      <header className="xcp-head">
        <a href="/" aria-label="Xurcun"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
        <nav className="xcp-langs" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.code} className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </nav>
      </header>

      <main className="xcp-wrap">
        <p className="tag">{t(S.tag)}</p>
        <h1>{t(S.h1)}</h1>
        <div className="ornament"><img src={EMBLEM} alt="" /></div>
        <p className="xcp-lead">{t(S.p1)}</p>
        <p className="xcp-lead">{t(S.p2)}</p>

        <h2 className="xcp-h2">{t(S.facts_title)}</h2>
        <ul className="xcp-facts">
          <li>{t(S.f_year)}</li>
          <li>{t(S.f_stores)}</li>
          <li>{t(S.f_natural)}</li>
          <li>{t(S.f_gift)}</li>
        </ul>

        <div className="xcp-cta">
          <a className="xcp-btn" href="/catalog">{t(S.catalog)}</a>
          <a className="xcp-link" href="/faq">FAQ</a>
        </div>
      </main>

      <footer className="xcp-foot">
        <a href="/">{t(S.home)}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
