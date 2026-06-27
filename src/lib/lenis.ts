import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger)

let lenisInstance: Lenis | null = null

export function initLenis(): Lenis {
  // Respect users who ask for less motion (vestibular sensitivity): disable smooth wheel.
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const lenis = new Lenis({
    lerp: prefersReducedMotion ? 1 : 0.1,
    smoothWheel: !prefersReducedMotion,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })

  gsap.ticker.lagSmoothing(0)

  lenisInstance = lenis
  return lenis
}

export function getLenis(): Lenis | null {
  return lenisInstance
}
