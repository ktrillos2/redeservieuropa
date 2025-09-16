import { TourDetail } from "@/components/tour-detail"
import HeaderServer from "@/components/header.server"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { getTourBySlug } from "@/sanity/lib/tours"

interface TourPageProps {
  params: {
    id: string
  }
}

export default async function TourPage({ params }: TourPageProps) {
  const tour = await getTourBySlug(params.id)
  return (
    <main className="min-h-screen">
      <HeaderServer />
  <AnimatedSection animation="fade-up" delay={200}>
        <TourDetail tourId={params.id} tourFromCms={tour ? {
          title: tour.title,
          description: tour.description,
          basePrice: tour.basePrice,
          basePriceDay: tour.basePriceDay,
          basePriceNight: tour.basePriceNight,
          duration: tour.duration,
          distance: tour.distance,
          mainImage: tour.mainImage,
          gallery: tour.gallery,
          features: tour.features,
          included: tour.included,
          pricing: tour.pricing,
          pricingP4: tour.pricingP4,
          pricingP5: tour.pricingP5,
          extraSections: tour.extraSections,
        } : undefined} />
      </AnimatedSection>
      <Footer />
    </main>
  )
}
