import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../lib/LanguageContext'
import { getHomepageImageSrc } from '../lib/homepageImageStore'

gsap.registerPlugin(ScrollTrigger)

const conceptKeys = [
  { key: 'concept_restaurant' as const, keyDesc: 'concept_restaurant_desc' as const, slotKey: 'concept_restaurant' },
  { key: 'concept_bar' as const, keyDesc: 'concept_bar_desc' as const, slotKey: 'concept_bar' },
  { key: 'concept_lounge' as const, keyDesc: 'concept_lounge_desc' as const, slotKey: 'concept_lounge' },
  { key: 'concept_events' as const, keyDesc: 'concept_events_desc' as const, slotKey: 'concept_events' },
]

export default function Concept() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: i * 0.15,
          scrollTrigger: { trigger: card, start: 'top 80%', toggleActions: 'play none none none' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative bg-[#141414] w-full py-12 md:py-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 w-full">
        {conceptKeys.map((c, i) => {
          const imgSrc = getHomepageImageSrc(c.slotKey);
          return (
          <div key={i} ref={(el) => { cardsRef.current[i] = el }} className="group relative overflow-hidden cursor-pointer bg-gradient-to-b from-[#1a1a2e] to-[#0A0A0A]" style={{ aspectRatio: '3/4' }}>
            {imgSrc && imgSrc !== '/assets/' ? (
              <img src={imgSrc} alt={t[c.key]} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" loading="lazy" decoding="async" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : null}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.2) 60%)' }} />
            <span className="absolute top-6 left-6 font-mono text-[11px] tracking-[0.12em] text-[#D4A853]">{t[c.key]}</span>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-display text-[2.5vw] lg:text-[2vw] text-white mb-3">{t[c.key]}</h3>
              <p className="font-body text-sm font-light text-[#8A8A8A] max-w-[280px] leading-[1.6]">{t[c.keyDesc]}</p>
            </div>
          </div>
        )})}
      </div>
    </section>
  )
}
