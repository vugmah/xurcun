import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../lib/LanguageContext'
import { aboutText } from '../lib/aboutText'
import { getHomepageImageSrc, getHomepageImageAlt } from '../lib/homepageImageStore'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const { lang } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const img1Ref = useRef<HTMLDivElement>(null)
  const img2Ref = useRef<HTMLDivElement>(null)

  const text = aboutText[lang]

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      if (leftRef.current) {
        leftRef.current.querySelectorAll('.reveal-item').forEach((el, i) => {
          gsap.fromTo(el, { opacity: 0, y: 40 }, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: i * 0.15,
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
          })
        })
      }

      const images = [img1Ref.current, img2Ref.current].filter(Boolean)
      images.forEach((img) => {
        const inner = img?.querySelector('img')
        if (inner) {
          gsap.fromTo(inner, { scale: 1.15, filter: 'brightness(0.4)' }, {
            scale: 1, filter: 'brightness(1)', duration: 1.2, ease: 'power2.out',
            scrollTrigger: { trigger: img, start: 'top 85%', end: 'top 40%', scrub: 0.5 },
          })
        }
      })

      if (img1Ref.current) gsap.to(img1Ref.current, { y: -30, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      if (img2Ref.current) gsap.to(img2Ref.current, { y: 40, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const getLabel = () => {
    if (lang === 'ru') return 'О НАС'
    if (lang === 'en') return 'ABOUT'
    if (lang === 'tr') return 'HAKKIMIZDA'
    return 'HAQQIMIZDA'
  }

  return (
    <section id="about" ref={sectionRef} className="relative bg-[#0A0A0A] py-16 md:py-20 lg:py-24 px-[3vw]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left column - text */}
        <div ref={leftRef}>
          <span className="reveal-item block font-mono text-[11px] tracking-[0.15em] text-[#B87333] mb-6">{getLabel()}</span>
          <h2 className="reveal-item font-display text-[clamp(24px,4vw,48px)] text-white leading-[1.1] mb-8">
            XURCUN WHITE CITY
          </h2>
          <div className="reveal-item font-body text-[clamp(14px,1.05vw,17px)] font-light text-[#8A8A8A] leading-[1.8] max-w-[520px] mb-8 whitespace-pre-line">
            {text}
          </div>
        </div>

        {/* Right column - editorial photo stack */}
        <div className="relative h-[500px] lg:h-[650px] overflow-hidden">
          {/* Photo 1 - top right, larger */}
          <div ref={img1Ref} className="absolute top-0 right-0 w-[68%] overflow-hidden shadow-2xl" style={{ zIndex: 1 }}>
            <div className="relative">
              <img src={getHomepageImageSrc('about_image_1')} alt={getHomepageImageAlt('about_image_1', lang)} className="w-full h-auto object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 border-2 border-white/20 pointer-events-none" />
            </div>
          </div>

          {/* Photo 2 - bottom left, overlapping */}
          <div ref={img2Ref} className="absolute bottom-0 left-0 w-[58%] overflow-hidden shadow-2xl" style={{ zIndex: 2 }}>
            <div className="relative">
              <img src={getHomepageImageSrc('about_image_2')} alt={getHomepageImageAlt('about_image_2', lang)} className="w-full h-auto object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 border-2 border-white/20 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
