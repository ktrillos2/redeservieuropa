import HeroServer from "@/components/hero.server"
import { Services } from "@/components/services"
import { TransfersSection } from "@/components/transfers-section"
import { Testimonials } from "@/components/testimonials"
import { Contact } from "@/components/contact"
import HeaderServer from "@/components/header.server"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
  <HeaderServer />
      <AnimatedSection animation="fade-up">
        {/* Hero consumiendo Sanity */}
        <HeroServer />
      </AnimatedSection>
      <AnimatedSection animation="slide-left" delay={200}>
        <Services />
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
