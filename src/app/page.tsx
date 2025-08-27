import { Header } from '@/components/layout/header'
import { Hero } from '@/components/sections/hero'
import { Services } from '@/components/sections/services'
import { HowItWorks } from '@/components/sections/how-it-works'
import { Testimonials } from '@/components/sections/testimonials'
import { Newsletter } from '@/components/sections/newsletter'
import { Footer } from '@/components/layout/footer'
import { StructuredData } from '@/components/seo/structured-data'

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <div className="min-h-screen bg-white">
        <Header />
        <main>
          <Hero />
          <Services />
          <HowItWorks />
          <Testimonials />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  )
}
