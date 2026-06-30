import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import { defaultsForPage, type Lang, type L5 } from '@/lib/pageTextStore'
import '@/xurcun-base.css'
import './xurcun-page.css'

const LOGO = '/brand/logo-gold.png'
const EMBLEM = '/brand/emblem-gold.png'
const WA = '994502121811' // central WhatsApp

const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' }, { code: 'ru', label: 'RU' }, { code: 'en', label: 'EN' },
  { code: 'tr', label: 'TR' }, { code: 'ar', label: 'AR' },
]

export default function CorporatePage() {
  const { lang, setLang } = useLanguage()
  const submit = trpc.mail.submitContact.useMutation()

  const textQ = trpc.pageText.getAll.useQuery({ page: 'corporate' }, { retry: false })
  const textMap = useMemo(() => {
    const m: Record<string, L5> = {}
    ;(textQ.data ?? []).forEach((t) => { m[t.key] = t.value })
    return m
  }, [textQ.data])
  const def = useMemo(() => defaultsForPage('corporate'), [])
  const txt = (key: string, l: Lang = lang) => textMap[key]?.[l] || def[key]?.[l] || def[key]?.az || ''

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
        <p className="tag">{txt('tag')}</p>
        <h1>{txt('h1')}</h1>
        <div className="ornament"><img src={EMBLEM} alt="" /></div>
        <p className="xcp-lead">{txt('lead')}</p>

        {submit.isSuccess ? (
          <div className="xcp-formok" role="status">{txt('ok')}</div>
        ) : (
          <form className="xcp-form" onSubmit={onSubmit}>
            <label>{txt('name')}<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
            <div className="row">
              <label>{txt('company')}<input value={f.company} onChange={set('company')} autoComplete="organization" /></label>
              <label>{txt('phone')}<input value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" /></label>
            </div>
            <label>{txt('email')}<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
            <div className="row">
              <label>{txt('occasion')}<input value={f.occasion} onChange={set('occasion')} /></label>
              <label>{txt('qty')}<input value={f.qty} onChange={set('qty')} inputMode="numeric" /></label>
            </div>
            <label>{txt('message')}<textarea required rows={4} value={f.message} onChange={set('message')} /></label>
            {submit.isError && <p className="xcp-formerr" role="alert">{txt('err')}</p>}
            <button className="xcp-btn" type="submit" disabled={submit.isPending}>
              {submit.isPending ? txt('sending') : txt('send')}
            </button>
            <a className="xcp-link" href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer">{txt('whatsapp')}</a>
          </form>
        )}
      </main>

      <footer className="xcp-foot">
        <a href="/">{txt('home')}</a> · <a href="tel:+994502121811">+994 50 212 18 11</a> · <a href="mailto:info@xurcun.az">info@xurcun.az</a>
      </footer>
    </div>
  )
}
