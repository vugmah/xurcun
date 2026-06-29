import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import './xurcun-gallery.css'

type Lang = 'az' | 'ru' | 'en' | 'tr' | 'ar'
type M = Record<Lang, string>

const TILES: { key: string; cap: M }[] = [
  { key: 'driedfruit', cap: { az: 'Quru meyvə', ru: 'Сухофрукты', en: 'Dried fruit', tr: 'Kuru meyve', ar: 'فواكه مجففة' } },
  { key: 'nuts', cap: { az: 'Qoz-fındıq', ru: 'Орехи', en: 'Nuts', tr: 'Çerez', ar: 'مكسرات' } },
  { key: 'chocolate', cap: { az: 'Şokolad', ru: 'Шоколад', en: 'Chocolate', tr: 'Çikolata', ar: 'شوكولاتة' } },
  { key: 'mix', cap: { az: 'Lokum & qarışıq', ru: 'Лукум и ассорти', en: 'Turkish delight', tr: 'Lokum', ar: 'حلقوم' } },
  { key: 'giftbox', cap: { az: 'Hədiyyə qutusu', ru: 'Подарочная коробка', en: 'Gift box', tr: 'Hediye kutusu', ar: 'علبة هدايا' } },
  { key: 'mix2', cap: { az: 'Çeşid', ru: 'Ассорти', en: 'Assortment', tr: 'Çeşit', ar: 'تشكيلة' } },
  { key: 'nuts2', cap: { az: 'Çərəz', ru: 'Снеки', en: 'Snacks', tr: 'Atıştırmalık', ar: 'وجبات خفيفة' } },
  { key: 'ribbons', cap: { az: 'Əl işi', ru: 'Ручная работа', en: 'Handcrafted', tr: 'El işi', ar: 'صناعة يدوية' } },
]

const S = {
  tag: { az: 'DADINA BAX', ru: 'ВЗГЛЯНИТЕ', en: 'TAKE A LOOK', tr: 'GÖZ ATIN', ar: 'ألقِ نظرة' },
  h2: { az: 'Bir baxışda Xurcun', ru: 'Xurcun с первого взгляда', en: 'Xurcun at a glance', tr: 'Bir bakışta Xurcun', ar: 'Xurcun بنظرة واحدة' },
  hint: { az: 'Səs üçün videoya toxunun', ru: 'Нажмите на видео для звука', en: 'Tap a video for sound', tr: 'Ses için videoya dokunun', ar: 'انقر على الفيديو للصوت' },
} satisfies Record<string, M>

const SoundIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" stroke="none" />
    {on
      ? <><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 6a9 9 0 0 1 0 12" /></>
      : <><path d="m17 9 4 6M21 9l-4 6" /></>}
  </svg>
)

export default function TasteGallery() {
  const { lang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const rowRef = useRef<HTMLDivElement>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const [soundIdx, setSoundIdx] = useState<number | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const row = rowRef.current
    if (!row) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement
          if (e.isIntersecting) v.play().catch(() => {})
          else v.pause()
        }
      },
      { root: row, threshold: 0.6 },
    )
    row.querySelectorAll('video').forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [])

  // Don't let the horizontal reels row hijack vertical mouse-wheel scrolling
  // (browsers translate vertical wheel to horizontal on x-scrollers → page feels stuck).
  // Vertical-intent wheel scrolls the page; horizontal-intent still scrolls the row.
  useEffect(() => {
    const row = rowRef.current
    if (!row) return
    const onWheel = (e: WheelEvent) => {
      if (row.scrollWidth <= row.clientWidth) return
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        window.scrollBy(0, e.deltaY)
      }
    }
    row.addEventListener('wheel', onWheel, { passive: false })
    return () => row.removeEventListener('wheel', onWheel)
  }, [])

  // Tap a tile to hear it; only one tile plays sound at a time.
  const toggleSound = (i: number) => {
    setSoundIdx((prev) => {
      const next = prev === i ? null : i
      vids.current.forEach((v, idx) => {
        if (!v) return
        v.muted = idx !== next
        if (idx === next) v.play().catch(() => {})
      })
      return next
    })
  }

  return (
    <section className="tg" aria-labelledby="tg-h">
      <div className="tg-head">
        <span className="tag">{t(S.tag)}</span>
        <h2 id="tg-h">{t(S.h2)}</h2>
        <div className="ornament"><img src="/brand/emblem-gold.png" alt="" /></div>
        <p className="tg-hint">{t(S.hint)}</p>
      </div>

      <div className="tg-row" ref={rowRef}>
        {TILES.map((tile, i) => (
          <button
            type="button"
            className="tg-tile"
            key={tile.key}
            onClick={() => toggleSound(i)}
            aria-pressed={soundIdx === i}
            aria-label={`${t(tile.cap)} — ${t(S.hint)}`}
          >
            <video
              ref={(el) => { vids.current[i] = el }}
              muted
              loop
              playsInline
              preload="none"
              poster={`/images/gv-${tile.key}.webp`}
            >
              <source src={`/videos/gv-${tile.key}-s.mp4`} type="video/mp4" />
            </video>
            <span className={`tg-sound${soundIdx === i ? ' on' : ''}`} aria-hidden="true"><SoundIcon on={soundIdx === i} /></span>
            <span className="tg-cap">{t(tile.cap)}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
