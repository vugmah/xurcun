import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../lib/LanguageContext'
import { getGeneralSettings } from '../lib/generalSettings'
import { Star, ExternalLink } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const reviews = [
  {
    name_az: 'Leyla M.',
    name_en: 'Leyla M.',
    text_az: 'Möhtəşəm atmosfer və dadlı yeməklər! Xidmət çox peşəkardır. Hər şey mükəmməl idi.',
    text_en: 'Amazing atmosphere and delicious food! Service is very professional. Everything was perfect.',
    rating: 5,
    date: '2 həftə əvvəl',
  },
  {
    name_az: 'Murat K.',
    name_en: 'Murat K.',
    text_az: 'Bakunun ən yaxşı restoranı. Qəlyan seçimi möhtəşəmdir. Tövsiyə edirəm!',
    text_en: 'The best restaurant in Baku. Shisha selection is amazing. Highly recommended!',
    rating: 5,
    date: '1 ay əvvəl',
  },
  {
    name_az: 'Anna S.',
    name_en: 'Anna S.',
    text_az: 'Romantik axşam yeməyi üçün mükəmməl yer. Kokteyllər heyrətamizdir.',
    text_en: 'Perfect place for a romantic dinner. Cocktails are amazing.',
    rating: 5,
    date: '3 həftə əvvəl',
  },
]

export default function GoogleReviews() {
  const { lang } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  const t = {
    label: lang === 'az' ? 'RƏYLƏR' : lang === 'ru' ? 'ОТЗЫВЫ' : lang === 'tr' ? 'YORUMLAR' : 'REVIEWS',
    title: lang === 'az' ? 'Qonaqlarımız nə deyir' : lang === 'ru' ? 'Что говорят наши гости' : lang === 'tr' ? 'Misafirlerimiz ne diyor' : 'What our guests say',
    cta: lang === 'az' ? 'Google-da bütün rəyləri gör' : lang === 'ru' ? 'Все отзывы на Google' : lang === 'tr' ? "Google'da tüm yorumları gör" : 'See all reviews on Google',
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none none' },
        }
      )
      cardsRef.current.forEach((card, i) => {
        if (!card) return
        gsap.fromTo(card,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.5, delay: 0.15 * i, ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none none' },
          }
        )
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const googleUrl = (() => {
    try { return getGeneralSettings().googleReviewUrl || 'https://www.google.com/search?q=the+woo+white+city+baku+reviews'; }
    catch { return 'https://www.google.com/search?q=the+woo+white+city+baku+reviews'; }
  })()

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-[#0A0A0A]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Header */}
        <div ref={headerRef} className="mb-12 text-center">
          <span className="text-[#C9A96E] text-xs tracking-[0.2em] uppercase block mb-4">{t.label}</span>
          <h2 className="font-display text-2xl md:text-4xl text-white">{t.title}</h2>
          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mt-4">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className="w-5 h-5 fill-[#C9A96E] text-[#C9A96E]" />
            ))}
            <span className="text-white/60 text-sm ml-2">4.9 / 5.0</span>
          </div>
        </div>

        {/* Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {reviews.map((r, i) => (
            <div
              key={i}
              ref={(el) => { cardsRef.current[i] = el }}
              className="bg-[#111] border border-[#222] rounded-xl p-6 hover:border-[#C9A96E]/30 transition-colors duration-300"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                ))}
              </div>
              {/* Text */}
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                {lang === 'ru' ? r.text_en : r.text_az}
              </p>
              {/* Author + Date */}
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">{lang === 'ru' ? r.name_en : r.name_az}</span>
                <span className="text-white/30 text-xs">{r.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-body text-sm px-8 py-3 rounded-full border border-[#C9A96E]/30 text-[#C9A96E] transition-all duration-300 hover:bg-[#C9A96E]/10 hover:border-[#C9A96E]/60"
          >
            {t.cta}
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
