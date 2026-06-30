import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { trpc } from '@/providers/trpc'
import { defaultsForPage, type Lang, type L5 } from '@/lib/pageTextStore'
import './xurcun-giftcard.css'

const EMBLEM = '/brand/logo-gold.png'
const WA = '994502121811' // central — +994 50 212 18 11

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

  // Page text overrides (admin CMS). Falls back to in-code defaults so the
  // section renders identical copy while the query loads or when the DB is empty.
  const textQ = trpc.pageText.getAll.useQuery({ page: 'giftcard' }, { retry: false })
  const map = useMemo(() => {
    const m: Record<string, L5> = {}
    ;(textQ.data ?? []).forEach((t) => { m[t.key] = t.value })
    return m
  }, [textQ.data])
  const def = defaultsForPage('giftcard')
  const txt = (key: string, l: Lang = lang) => map[key]?.[l] || def[key]?.[l] || def[key]?.az || ''

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

  const waHref = `https://wa.me/${WA}?text=${encodeURIComponent(txt('waMsg'))}`

  return (
    <section className="gc" id="hediyye-karti" aria-labelledby="gc-h">
      <div className="gc-head">
        <span className="tag">{txt('tag')}</span>
        <h2 id="gc-h">{txt('h2')}</h2>
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
          <button className="gc-sound" onClick={toggleSound} aria-label={txt('sound')} aria-pressed={soundOn}>
            <SoundIcon on={soundOn} />
          </button>
        </div>

        <div className="gc-info">
          <div className="gc-card" role="img" aria-label={txt('h2')}>
            <div className="gc-card-sun" />
            <div className="gc-card-sheen" />
            <img className="gc-card-logo" src={EMBLEM} alt="" />
            <span className="gc-card-label">GIFT CARD</span>
          </div>

          <p className="gc-lead">{txt('lead')}</p>

          <div className="gc-steps">
            <div className="gc-step"><b>1</b>{txt('s1')}</div>
            <div className="gc-step"><b>2</b>{txt('s2')}</div>
            <div className="gc-step"><b>3</b>{txt('s3')}</div>
            <div className="gc-step"><b>4</b>{txt('s4')}</div>
          </div>

          <div className="gc-cta">
            <a className="gc-wa" href={waHref} target="_blank" rel="noopener">{txt('cta')}</a>
            <span className="gc-note">{txt('note')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
