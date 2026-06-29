import { useEffect, useRef } from 'react'
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
} satisfies Record<string, M>

export default function TasteGallery() {
  const { lang } = useLanguage()
  const t = (m: M) => m[lang] ?? m.az
  const rowRef = useRef<HTMLDivElement>(null)

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

  return (
    <section className="tg" aria-labelledby="tg-h">
      <div className="tg-head">
        <span className="tag">{t(S.tag)}</span>
        <h2 id="tg-h">{t(S.h2)}</h2>
        <div className="ornament"><img src="/brand/emblem-gold.png" alt="" /></div>
      </div>

      <div className="tg-row" ref={rowRef}>
        {TILES.map((tile) => (
          <div className="tg-tile" key={tile.key}>
            <video
              muted
              loop
              playsInline
              preload="none"
              poster={`/images/gv-${tile.key}.webp`}
              aria-label={t(tile.cap)}
            >
              <source src={`/videos/gv-${tile.key}.mp4`} type="video/mp4" />
            </video>
            <span className="tg-cap">{t(tile.cap)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
