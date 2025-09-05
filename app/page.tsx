import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { TransfersSection } from "@/components/transfers-section"
import { Testimonials } from "@/components/testimonials"
import { Contact } from "@/components/contact"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <AnimatedSection animation="fade-up">
        <Hero />
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
