import { TourDetail } from "@/components/tour-detail"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"

interface TourPageProps {
  params: {
    id: string
  }
}

export default function TourPage({ params }: TourPageProps) {
  return (
    <main className="min-h-screen">
      <Header />
  <AnimatedSection animation="fade-up" delay={200}>
        <TourDetail tourId={params.id} />
      </AnimatedSection>
      <Footer />
    </main>
  )
}
