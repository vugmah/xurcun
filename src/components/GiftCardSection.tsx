import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import './xurcun-giftcard.css'

const EMBLEM = '/brand/logo-gold.png'
const WA = '994502121811' // central — +994 50 212 18 11

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
type M = Record<Lang, string>

const S = {
  tag: { az: 'HƏDİYYƏ KARTI', ru: 'ПОДАРОЧНАЯ КАРТА', en: 'GIFT CARD', tr: 'HEDİYE KARTI', ar: 'بطاقة هدية' },
  h2: { az: 'Xurcun Hədiyyə Kartı', ru: 'Подарочная карта Xurcun', en: 'Xurcun Gift Card', tr: 'Xurcun Hediye Kartı', ar: 'بطاقة هدايا Xurcun' },
  lead: {
    az: 'Fiziki hədiyyə əvəzinə istədiyiniz balansı yükləyin və sevdiklərinizə premium Xurcun kartı hədiyyə edin. Bütün mağazalarımızda keçərlidir.',
    ru: 'Вместо обычного подарка загрузите любой баланс и подарите близким премиальную карту Xurcun. Действует во всех наших магазинах.',
    en: 'Instead of a physical gift, load any balance and give your loved ones a premium Xurcun card. Valid in all our stores.',
    tr: 'Fiziki hediye yerine istediğiniz bakiyeyi yükleyin ve sevdiklerinize premium Xurcun kartı hediye edin. Tüm mağazalarımızda geçerlidir.',
    ar: 'بدلاً من هدية تقليدية، اشحن أي رصيد وأهدِ أحباءك بطاقة Xurcun الفاخرة. صالحة في جميع متاجرنا.',
  },
  s1: { az: 'Kartı seçin', ru: 'Выберите карту', en: 'Choose the card', tr: 'Kartı seçin', ar: 'اختر البطاقة' },
  s2: { az: 'Balans yükləyin', ru: 'Загрузите баланс', en: 'Load a balance', tr: 'Bakiye yükleyin', ar: 'اشحن الرصيد' },
  s3: { az: 'Hədiyyə edin', ru: 'Подарите', en: 'Give as a gift', tr: 'Hediye edin', ar: 'قدّمها هدية' },
  s4: { az: 'Mağazada istifadə', ru: 'Используйте в магазине', en: 'Use in store', tr: 'Mağazada kullanın', ar: 'استخدمها في المتجر' },
  cta: { az: 'WhatsApp ilə sifariş', ru: 'Заказать в WhatsApp', en: 'Order on WhatsApp', tr: "WhatsApp'tan sipariş", ar: 'اطلب عبر واتساب' },
  note: { az: '11 mağazada mövcuddur', ru: 'Доступно в 11 магазинах', en: 'Available at 11 stores', tr: '11 mağazada mevcut', ar: 'متوفرة في 11 متجرًا' },
  waMsg: {
    az: 'Salam! Xurcun Hədiyyə Kartı haqqında məlumat almaq istəyirəm.',
    ru: 'Здравствуйте! Хочу узнать о подарочной карте Xurcun.',
    en: 'Hello! I would like information about the Xurcun Gift Card.',
    tr: 'Merhaba! Xurcun Hediye Kartı hakkında bilgi almak istiyorum.',
    ar: 'مرحبًا! أود الحصول على معلومات حول بطاقة هدايا Xurcun.',
  },
  sound: { az: 'Səsi aç / bağla', ru: 'Включить / выключить звук', en: 'Toggle sound', tr: 'Sesi aç / kapat', ar: 'كتم / تشغيل الصوت' },
}

const SoundIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
    {on
      ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 6a9 9 0 0 1 0 12" /></>
      : <><path d="m17 9 4 6M21 9l-4 6" /></>}
  </svg>
)

export default function GiftCardSection() {
  const { lang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const vidRef = useRef<HTMLVideoElement>(null)
  const [soundOn, setSoundOn] = useState(false)

  useEffect(() => {
    const v = vidRef.current
    if (!v) return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.play().catch(() => {})
    }
  }, [])

  const toggleSound = () => {
    const v = vidRef.current
    if (!v) return
    const next = !soundOn
    v.muted = !next
    setSoundOn(next)
    v.play().catch(() => {})
  }

  const waHref = `https://wa.me/${WA}?text=${encodeURIComponent(t(S.waMsg))}`

  return (
    <section className="gc" id="hediyye-karti" aria-labelledby="gc-h">
      <div className="gc-head">
        <span className="tag">{t(S.tag)}</span>
        <h2 id="gc-h">{t(S.h2)}</h2>
        <div className="ornament"><img src="/brand/emblem-gold.png" alt="" /></div>
      </div>

      <div className="gc-grid">
        <div className="gc-videowrap">
          <video
            ref={vidRef}
            className="gc-video"
            poster="/images/giftcard.webp"
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/videos/giftcard.mp4" type="video/mp4" />
          </video>
          <button className="gc-sound" onClick={toggleSound} aria-label={t(S.sound)} aria-pressed={soundOn}>
            <SoundIcon on={soundOn} />
          </button>
        </div>

        <div className="gc-info">
          <div className="gc-card" role="img" aria-label={t(S.h2)}>
            <div className="gc-card-sun" />
            <div className="gc-card-sheen" />
            <img className="gc-card-logo" src={EMBLEM} alt="" />
            <span className="gc-card-label">GIFT CARD</span>
          </div>

          <p className="gc-lead">{t(S.lead)}</p>

          <div className="gc-steps">
            <div className="gc-step"><b>1</b>{t(S.s1)}</div>
            <div className="gc-step"><b>2</b>{t(S.s2)}</div>
            <div className="gc-step"><b>3</b>{t(S.s3)}</div>
            <div className="gc-step"><b>4</b>{t(S.s4)}</div>
          </div>

          <div className="gc-cta">
            <a className="gc-wa" href={waHref} target="_blank" rel="noopener">{t(S.cta)}</a>
            <span className="gc-note">{t(S.note)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
