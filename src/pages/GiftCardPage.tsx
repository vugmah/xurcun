import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/lib/LanguageContext'
import GiftCardSection from '@/components/GiftCardSection'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const SITE = 'https://xurcun.az'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]
type M = Record<Lang, string>
const S = {
  home: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
  title: {
    az: 'Hədiyyə Kartı | Xurcun — premium hədiyyə həlli',
    ru: 'Подарочная карта | Xurcun — премиальный подарок',
    en: 'Gift Card | Xurcun — the premium gift solution',
    tr: 'Hediye Kartı | Xurcun — premium hediye çözümü',
    ar: 'بطاقة هدايا | Xurcun — حل الهدية الفاخر',
  },
  desc: {
    az: 'Xurcun Hədiyyə Kartı — istədiyiniz balansı yükləyin, sevdiklərinizə premium kart hədiyyə edin. Bakıdakı 11 mağazada keçərlidir. WhatsApp ilə sifariş.',
    ru: 'Подарочная карта Xurcun — загрузите любой баланс и подарите близким премиальную карту. Действует в 11 магазинах Баку. Заказ в WhatsApp.',
    en: 'Xurcun Gift Card — load any balance and gift a premium card to your loved ones. Valid at 11 stores in Baku. Order on WhatsApp.',
    tr: 'Xurcun Hediye Kartı — istediğiniz bakiyeyi yükleyin, sevdiklerinize premium kart hediye edin. Bakü\'deki 11 mağazada geçerli.',
    ar: 'بطاقة هدايا Xurcun — اشحن أي رصيد وأهدِ أحباءك بطاقة فاخرة. صالحة في 11 متجرًا في باكو. اطلب عبر واتساب.',
  },
}

export default function GiftCardPage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const title = t(S.title)
  const desc = t(S.desc)
  const url = `${SITE}/gift-card`

  return (
    <div className="xc xcpage">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={`${SITE}/brand/og-image.jpg`} />
      </Helmet>

      <header className="xcp-head">
        <a href="/" aria-label="Xurcun"><img className="logo" src={LOGO} alt="Xurcun — Fond of Quality" /></a>
        <nav className="xcp-langs" aria-label="Language">
          {LANGS.map((l) => (
            <button key={l.code} className={l.code === lang ? 'on' : ''} aria-pressed={l.code === lang} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </nav>
      </header>

      <GiftCardSection />

      <footer className="xcp-foot">
        <a href="/">{t(S.home)}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
