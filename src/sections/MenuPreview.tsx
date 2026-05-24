import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../lib/LanguageContext'
import { getHomepageImageSrc } from '../lib/homepageImageStore'

gsap.registerPlugin(ScrollTrigger)

const menuCards = [
  { slotKey: 'about_image_1', key: 'food', itemsKey: 'menu_card_food_items' as const },
  { slotKey: 'about_image_2', key: 'beverage', itemsKey: 'menu_card_bev_items' as const },
  { slotKey: 'concept_bar', key: 'shisha', itemsKey: 'menu_card_shisha_items' as const },
]

export default function MenuPreview() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        headerRef.current.querySelectorAll('.reveal-item').forEach((el, i) => {
          gsap.fromTo(el, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: i * 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          })
        })
      }
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card, { opacity: 0, y: 60 }, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: i * 0.15,
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const cardLabels = [
    { label: t.menu_alacarte, tab: 'alacarte' },
    { label: t.menu_beverages, tab: 'beverages' },
    { label: t.menu_shisha, tab: 'shisha' },
  ]

  return (
    <section id="menu" ref={sectionRef} className="relative bg-[#0A0A0A] py-16 md:py-20 lg:py-24 px-[3vw]">
      <div ref={headerRef} className="text-center mb-16">
        <span className="reveal-item block font-mono text-[11px] tracking-[0.15em] text-[#D4A853] mb-4">{t.menu_label}</span>
        <h2 className="reveal-item font-display text-[4.5vw] text-white leading-[1.1] mb-4">{t.menu_title}</h2>
        <p className="reveal-item font-display italic text-[clamp(14px,1.8vw,24px)] text-[#8A8A8A]">{t.menu_subtitle}</p>
      </div>

      {/* 3 Menu category cards */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {menuCards.map((card, i) => (
          <div
            key={i}
            ref={(el) => { cardsRef.current[i] = el }}
            className="group relative overflow-hidden cursor-pointer"
            style={{ aspectRatio: '3/4' }}
            onClick={() => {
              const target = document.querySelector('.menu-page-anchor')
              target?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            {/* Real interior photo as background */}
            <img
              src={getHomepageImageSrc(card.slotKey)}
              alt={cardLabels[i].label}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              loading="lazy" decoding="async"
            />

            {/* Dark gradient overlay */}
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.5) 50%, rgba(10,10,10,0.2) 100%)',
              }}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-[#D4A853]/0 group-hover:bg-[#D4A853]/10 transition-all duration-500" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-display text-xl lg:text-2xl text-white mb-4 group-hover:text-[#D4A853] transition-colors duration-300">
                {cardLabels[i].label}
              </h3>

              {/* Item list */}
              <p className="font-mono text-[10px] tracking-wider text-[#8A8A8A] leading-relaxed">
                {t[card.itemsKey]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Anchor for menu page */}
      <div className="menu-page-anchor" />
    </section>
  )
}
