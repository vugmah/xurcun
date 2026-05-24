import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useLanguage } from '../lib/LanguageContext'
import { getHomepageImageSrc, getHomepageImageAlt } from '../lib/homepageImageStore'

gsap.registerPlugin(ScrollTrigger)

const gallerySlots = [
  { key: 'gallery_1', span: 'col-span-2' },
  { key: 'concept_restaurant', span: 'col-span-1' },
  { key: 'concept_lounge', span: 'col-span-1' },
  { key: 'gallery_2', span: 'col-span-2' },
  { key: 'gallery_pizza', span: 'col-span-1' },
  { key: 'gallery_cocktail', span: 'col-span-1' },
  { key: 'gallery_3', span: 'col-span-1' },
]

export default function Gallery() {
  const { t, lang } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set())

  const handleImageError = (index: number) => {
    setBrokenImages(prev => new Set(prev).add(index))
  }

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
      itemsRef.current.forEach((item, i) => {
        if (!item) return
        gsap.fromTo(item, { opacity: 0, y: 40 }, {
          opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: (i % 3) * 0.1,
          scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none none' },
        })
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="gallery" ref={sectionRef} className="relative bg-[#0A0A0A] py-16 md:py-20 px-[3vw]">
      <div ref={headerRef} className="text-center mb-8">
        <span className="reveal-item block font-mono text-[11px] tracking-[0.15em] text-[#B87333] mb-4">{t.gallery_label}</span>
        <h2 className="reveal-item font-display text-3xl md:text-4xl text-white leading-[1.1]">{t.gallery_title}</h2>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {gallerySlots.map((slot, i) => {
          const src = getHomepageImageSrc(slot.key);
          const alt = getHomepageImageAlt(slot.key, lang);
          const isBroken = brokenImages.has(i);
          const hasValidSrc = src && src !== '/assets/';
          return (
            <div key={i} ref={(el) => { itemsRef.current[i] = el }} className={`group relative overflow-hidden cursor-pointer ${slot.span}`} onClick={() => hasValidSrc && !isBroken && setLightbox(src)}>
              <div className="overflow-hidden border-4 border-white transition-colors duration-400 group-hover:border-[#D4A853] bg-gradient-to-br from-[#141414] to-[#0A0A0A]">
                {hasValidSrc && !isBroken ? (
                  <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" style={{ aspectRatio: slot.span === 'col-span-2' ? '16/9' : '1/1' }} loading="lazy" decoding="async" onError={() => handleImageError(i)} />
                ) : (
                  <div className="w-full flex items-center justify-center" style={{ aspectRatio: slot.span === 'col-span-2' ? '16/9' : '1/1' }}>
                    <span className="font-display text-[#C9A96E]/20 text-xs tracking-[0.2em]">XURCUN</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center cursor-pointer" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-[90vw] max-h-[90vh] object-contain" loading="eager" decoding="async" />
          <button className="absolute top-6 right-6 font-mono text-white text-xs uppercase tracking-wider" onClick={() => setLightbox(null)}>{t.gallery_close}</button>
        </div>
      )}
    </section>
  )
}
