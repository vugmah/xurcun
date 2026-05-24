import { useEffect } from 'react'
import Navigation from '@/sections/Navigation'
import Hero from '@/sections/Hero'
import About from '@/sections/About'
import Concept from '@/sections/Concept'
import MenuPreview from '@/sections/MenuPreview'
import Gallery from '@/sections/Gallery'
import Events from '@/sections/Events'
import GoogleReviews from '@/sections/GoogleReviews'
import FindUs from '@/sections/FindUs'
import Contact from '@/sections/Contact'
import MenuPage from '@/sections/MenuPage'
import HomeScrollButton from '@/sections/HomeScrollButton'
import SEO from '@/sections/SEO'
import { AllHomepageJsonLd } from '@/components/JsonLd'
import { initLenis } from '@/lib/lenis'

export default function HomePage() {
  useEffect(() => {
    const lenis = initLenis()
    return () => { lenis.destroy() }
  }, [])

  return (
    <>
      <SEO page="home" />
      <AllHomepageJsonLd />
      <Navigation />
      <section id="hero"><Hero /></section>
      <section id="about"><About /></section>
      <section id="concept"><Concept /></section>
      <section id="menu-preview"><MenuPreview /></section>
      <section id="menu"><MenuPage /></section>
      <section id="gallery"><Gallery /></section>
      <section id="events"><Events /></section>
      <section id="reviews"><GoogleReviews /></section>
      <section id="find-us"><FindUs /></section>
      <section id="contact"><Contact /></section>
      <HomeScrollButton />
    </>
  )
}
