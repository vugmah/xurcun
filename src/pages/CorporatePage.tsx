import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'
const WA = '994502121811' // central WhatsApp

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]
type M = Record<Lang, string>
const S = {
  tag: { az: 'Korporativ', ru: 'Корпоративным', en: 'Corporate', tr: 'Kurumsal', ar: 'الشركات' },
  h1: { az: 'Korporativ hədiyyə sorğusu', ru: 'Запрос корпоративных подарков', en: 'Corporate gift inquiry', tr: 'Kurumsal hediye talebi', ar: 'طلب هدايا الشركات' },
  lead: {
    az: 'Müştəri, tərəfdaş və əməkdaşlarınız üçün loqolu, fərdiləşdirilmiş premium hədiyyə qutuları. Formu doldurun — sizinlə əlaqə saxlayaq.',
    ru: 'Премиальные подарочные коробки с логотипом и персонализацией для клиентов, партнёров и сотрудников. Заполните форму — мы свяжемся с вами.',
    en: 'Premium, logo-branded, personalised gift boxes for your clients, partners and staff. Fill in the form and we will get back to you.',
    tr: 'Müşterileriniz, ortaklarınız ve çalışanlarınız için logolu, kişiselleştirilmiş premium hediye kutuları. Formu doldurun, size dönelim.',
    ar: 'علب هدايا فاخرة بشعاركم ومخصّصة لعملائكم وشركائكم وموظفيكم. املأ النموذج وسنتواصل معكم.',
  },
  name: { az: 'Ad, soyad *', ru: 'Имя, фамилия *', en: 'Full name *', tr: 'Ad soyad *', ar: 'الاسم الكامل *' },
  company: { az: 'Şirkət', ru: 'Компания', en: 'Company', tr: 'Şirket', ar: 'الشركة' },
  phone: { az: 'Telefon', ru: 'Телефон', en: 'Phone', tr: 'Telefon', ar: 'الهاتف' },
  email: { az: 'E-poçt *', ru: 'E-mail *', en: 'Email *', tr: 'E-posta *', ar: 'البريد الإلكتروني *' },
  occasion: { az: 'Münasibət (bayram, yubiley…)', ru: 'Повод (праздник, юбилей…)', en: 'Occasion (holiday, anniversary…)', tr: 'Vesile (bayram, yıldönümü…)', ar: 'المناسبة (عيد، ذكرى…)' },
  qty: { az: 'Təxmini say', ru: 'Примерное количество', en: 'Approx. quantity', tr: 'Yaklaşık adet', ar: 'الكمية التقريبية' },
  message: { az: 'Mesaj *', ru: 'Сообщение *', en: 'Message *', tr: 'Mesaj *', ar: 'الرسالة *' },
  send: { az: 'Sorğunu göndər', ru: 'Отправить запрос', en: 'Send inquiry', tr: 'Talebi gönder', ar: 'إرسال الطلب' },
  sending: { az: 'Göndərilir…', ru: 'Отправка…', en: 'Sending…', tr: 'Gönderiliyor…', ar: 'جارٍ الإرسال…' },
  ok: { az: 'Təşəkkürlər! Sorğunuz alındı, tezliklə əlaqə saxlayacağıq.', ru: 'Спасибо! Запрос получен, мы скоро свяжемся с вами.', en: 'Thank you! Your inquiry was received — we will be in touch soon.', tr: 'Teşekkürler! Talebiniz alındı, en kısa sürede dönüş yapacağız.', ar: 'شكرًا! تم استلام طلبك وسنتواصل معك قريبًا.' },
  err: { az: 'Xəta baş verdi. Yenidən cəhd edin və ya WhatsApp ilə yazın.', ru: 'Произошла ошибка. Попробуйте снова или напишите в WhatsApp.', en: 'Something went wrong. Please try again or message us on WhatsApp.', tr: 'Bir hata oluştu. Tekrar deneyin ya da WhatsApp’tan yazın.', ar: 'حدث خطأ. حاول مرة أخرى أو راسلنا على واتساب.' },
  whatsapp: { az: 'və ya WhatsApp ilə yazın', ru: 'или напишите в WhatsApp', en: 'or message us on WhatsApp', tr: 'veya WhatsApp’tan yazın', ar: 'أو راسلنا على واتساب' },
  home: { az: 'Ana səhifə', ru: 'Главная', en: 'Home', tr: 'Ana sayfa', ar: 'الرئيسية' },
}

export default function CorporatePage() {
  const { lang, setLang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const submit = trpc.mail.submitContact.useMutation()

  const [f, setF] = useState({ name: '', company: '', phone: '', email: '', occasion: '', qty: '', message: '' })
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submit.isPending) return
    const lines = [
      f.company && `Şirkət/Company: ${f.company}`,
      f.phone && `Telefon/Phone: ${f.phone}`,
      f.occasion && `Münasibət/Occasion: ${f.occasion}`,
      f.qty && `Say/Qty: ${f.qty}`,
    ].filter(Boolean) as string[]
    const body = [...lines, '', f.message].join('\n')
    submit.mutate({
      name: f.name.trim(),
      email: f.email.trim(),
      subject: `Korporativ sorğu — ${f.company.trim() || f.name.trim()}`,
      message: body,
    })
  }

  return (
    <div className="xc xcpage">
      <Helmet>
        <title>Korporativ hədiyyə sorğusu | Xurcun</title>
        <meta name="description" content="Korporativ və topdan hədiyyə sorğusu — loqolu premium hədiyyə qutuları. Müştəri, tərəfdaş və əməkdaşlar üçün. Xurcun, Bakı." />
        <link rel="canonical" href="https://xurcun.az/corporate" />
        <meta property="og:title" content="Korporativ hədiyyə sorğusu | Xurcun" />
        <meta property="og:url" content="https://xurcun.az/corporate" />
        <meta property="og:image" content="https://xurcun.az/brand/og-image.jpg" />
      </Helmet>
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
        <p className="xcp-lead">{t(S.lead)}</p>

        {submit.isSuccess ? (
          <div className="xcp-formok" role="status">{t(S.ok)}</div>
        ) : (
          <form className="xcp-form" onSubmit={onSubmit}>
            <label>{t(S.name)}<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <div className="row">
              <label>{t(S.company)}<input value={f.company} onChange={set('company')} autoComplete="organization" /></label>
              <label>{t(S.phone)}<input value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" /></label>
            </div>
            <label>{t(S.email)}<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
            <div className="row">
              <label>{t(S.occasion)}<input value={f.occasion} onChange={set('occasion')} /></label>
              <label>{t(S.qty)}<input value={f.qty} onChange={set('qty')} inputMode="numeric" /></label>
            </div>
            <label>{t(S.message)}<textarea required rows={4} value={f.message} onChange={set('message')} /></label>
            {submit.isError && <p className="xcp-formerr" role="alert">{t(S.err)}</p>}
            <button className="xcp-btn" type="submit" disabled={submit.isPending}>
              {submit.isPending ? t(S.sending) : t(S.send)}
            </button>
            <a className="xcp-link" href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer">{t(S.whatsapp)}</a>
          </form>
        )}
      </main>

      <footer className="xcp-foot">
        <a href="/">{t(S.home)}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
