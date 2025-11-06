import HeroServer from "@/components/hero.server"
import { TransfersSection } from "@/components/transfers-section"
import { Testimonials } from "@/components/testimonials"
import { Contact } from "@/components/contact"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import ServicesServer from "@/components/services.server"

// Forzar renderizado dinámico para que siempre obtenga datos frescos de Sanity
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <AnimatedSection animation="fade-up">
        {/* Hero consumiendo Sanity */}
        <HeroServer />
      </AnimatedSection>
      <AnimatedSection animation="slide-left" delay={200}>
        <ServicesServer />
      </AnimatedSection>
      <AnimatedSection animation="slide-right" delay={300}>
        <TransfersSection />
      </AnimatedSection>
      <AnimatedSection animation="zoom-in" delay={400}>
        <Testimonials />
      </AnimatedSection>
      <AnimatedSection animation="bounce-in" delay={500}>
        <Contact />
      </AnimatedSection>
      <Footer />
    </main>
  )
}
