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
  tag: { az: 'Kömək', ru: 'Помощь', en: 'Help', tr: 'Yardım', ar: 'مساعدة' },
  h1: { az: 'Tez-tez verilən suallar', ru: 'Часто задаваемые вопросы', en: 'Frequently asked questions', tr: 'Sıkça sorulan sorular', ar: 'الأسئلة الشائعة' },
  catalog: { az: 'Kataloqa bax', ru: 'Смотреть каталог', en: 'View catalogue', tr: 'Kataloğa bak', ar: 'تصفح الكتالوج' },
}

const FAQ: { q: M; a: M }[] = [
  {
    q: { az: 'Xurcun nə satır?', ru: 'Что продаёт Xurcun?', en: 'What does Xurcun sell?', tr: 'Xurcun ne satıyor?', ar: 'ماذا تبيع Xurcun؟' },
    a: {
      az: 'Premium quru meyvə, qoz-fındıq, çərəz, ekzotik çaylar, şokolad, lokum, paxlava və əl işi hədiyyə qutuları.',
      ru: 'Премиальные сухофрукты, орехи, снеки, экзотические чаи, шоколад, лукум, пахлаву и подарочные наборы ручной работы.',
      en: 'Premium dried fruit, nuts, snacks, exotic teas, chocolate, Turkish delight, baklava and handcrafted gift boxes.',
      tr: 'Premium kuru meyve, çerez, atıştırmalık, egzotik çaylar, çikolata, lokum, baklava ve el yapımı hediye kutuları.',
      ar: 'فواكه مجففة فاخرة، مكسرات، وجبات خفيفة، شاي، شوكولاتة، حلقوم، بقلاوة وعلب هدايا مصنوعة يدويًا.',
    },
  },
  {
    q: { az: 'Xurcun nə vaxt yaranıb?', ru: 'Когда основан Xurcun?', en: 'When was Xurcun founded?', tr: 'Xurcun ne zaman kuruldu?', ar: 'متى تأسست Xurcun؟' },
    a: {
      az: 'Xurcun 2015-ci ildə Vüqar Məhərrəmov tərəfindən Bakıda təsis edilib.',
      ru: 'Xurcun основан в 2015 году Вугаром Магеррамовым в Баку.',
      en: 'Xurcun was founded in 2015 by Vugar Maharramov in Baku.',
      tr: 'Xurcun 2015 yılında Vugar Maharramov tarafından Bakü’de kuruldu.',
      ar: 'تأسست Xurcun عام 2015 على يد ووقار محرّموف في باكو.',
    },
  },
  {
    q: { az: 'Neçə mağazanız var?', ru: 'Сколько у вас магазинов?', en: 'How many stores do you have?', tr: 'Kaç mağazanız var?', ar: 'كم عدد متاجركم؟' },
    a: {
      az: 'Bakıda 11 mağazamız var — ticarət mərkəzləri, mərkəzi küçələr və Heydər Əliyev Hava Limanı daxil.',
      ru: 'У нас 11 магазинов в Баку — в торговых центрах, на центральных улицах и в аэропорту имени Гейдара Алиева.',
      en: 'We have 11 stores in Baku — including malls, central streets and Heydar Aliyev International Airport.',
      tr: 'Bakü’de 11 mağazamız var — alışveriş merkezleri, merkezi caddeler ve Haydar Aliyev Havalimanı dahil.',
      ar: 'لدينا 11 متجرًا في باكو — تشمل المراكز التجارية والشوارع الرئيسية ومطار حيدر علييف الدولي.',
    },
  },
  {
    q: { az: 'Məhsullar təbiidir, qlütensiz seçim var?', ru: 'Продукция натуральная, есть ли без глютена?', en: 'Are products natural, any gluten-free options?', tr: 'Ürünler doğal mı, glutensiz seçenek var mı?', ar: 'هل المنتجات طبيعية وهل هناك خيارات خالية من الغلوتين؟' },
    a: {
      az: 'Bəli, məhsullarımız təbii və konservantsızdır; qlütensiz seçimlər də mövcuddur.',
      ru: 'Да, наша продукция натуральная и без консервантов; есть и безглютеновые варианты.',
      en: 'Yes, our products are natural and preservative-free; gluten-free options are also available.',
      tr: 'Evet, ürünlerimiz doğal ve koruyucusuzdur; glutensiz seçenekler de mevcuttur.',
      ar: 'نعم، منتجاتنا طبيعية وخالية من المواد الحافظة، وتتوفر خيارات خالية من الغلوتين.',
    },
  },
  {
    q: { az: 'Necə sifariş verə bilərəm?', ru: 'Как я могу сделать заказ?', en: 'How can I order?', tr: 'Nasıl sipariş verebilirim?', ar: 'كيف يمكنني الطلب؟' },
    a: {
      az: 'Kataloqdan bəyəndiyiniz məhsulları seçin və WhatsApp ilə bizə göndərin, ya da +994 50 212 18 11 nömrəsinə zəng edin.',
      ru: 'Выберите товары в каталоге и отправьте нам список в WhatsApp, или позвоните по номеру +994 50 212 18 11.',
      en: 'Pick the products you like in the catalogue and send us the list on WhatsApp, or call +994 50 212 18 11.',
      tr: 'Katalogdan beğendiğiniz ürünleri seçin ve listeyi WhatsApp ile bize gönderin ya da +994 50 212 18 11’i arayın.',
      ar: 'اختر المنتجات من الكتالوج وأرسل القائمة عبر واتساب، أو اتصل بالرقم ‎+994 50 212 18 11.',
    },
  },
  {
    q: { az: 'Hədiyyə qutuları hazırlayırsınız?', ru: 'Делаете ли вы подарочные наборы?', en: 'Do you make gift boxes?', tr: 'Hediye kutuları hazırlıyor musunuz?', ar: 'هل تصنعون علب هدايا؟' },
    a: {
      az: 'Bəli, korporativ təqdimatlar, bayramlar və xüsusi anlar üçün əl işi premium hədiyyə qutularımız var.',
      ru: 'Да, у нас есть премиальные подарочные наборы ручной работы для корпоративных подарков, праздников и особых случаев.',
      en: 'Yes, we offer handcrafted premium gift boxes for corporate gifts, holidays and special occasions.',
      tr: 'Evet, kurumsal hediyeler, bayramlar ve özel anlar için el yapımı premium hediye kutularımız var.',
      ar: 'نعم، نقدّم علب هدايا فاخرة مصنوعة يدويًا للهدايا المؤسسية والأعياد والمناسبات الخاصة.',
    },
  },
]

export default function FaqPage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  return (
    <div className="xc xcpage">
      <SEO page="faq" />
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

        <div className="xcp-faq">
          {FAQ.map((f, i) => (
            <details key={i} open={i === 0}>
              <summary>{t(f.q)}</summary>
              <div className="ans">{t(f.a)}</div>
            </details>
          ))}
        </div>

        <div className="xcp-cta">
          <a className="xcp-btn" href="/catalog">{t(S.catalog)}</a>
          <a className="xcp-link" href="/about">{t({ az: 'Haqqımızda', ru: 'О нас', en: 'About us', tr: 'Hakkımızda', ar: 'من نحن' })}</a>
        </div>
      </main>

      <footer className="xcp-foot">
        <a href="/">{t(S.home)}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
