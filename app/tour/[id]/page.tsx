import HeaderServer from "@/components/header.server"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { getTourBySlug, TourDoc } from "@/sanity/lib/tours"
import { urlFor } from "@/sanity/lib/image"
import { TourDetail } from "@/components/tour-detail"
import { computePriceForPax, getStartingPriceEUR } from "@/sanity/lib/price"

interface TourPageProps {
  params: { id: string } // slug en la URL
}

export default async function TourPage({ params }: TourPageProps) {
  const tour = (await getTourBySlug(params.id)) as TourDoc | null

  // Normalización para TourDetail
  const mainImageUrl = tour?.mainImage ? urlFor(tour.mainImage).width(1600).url() : undefined
  const startingPrice = tour ? getStartingPriceEUR(tour) : undefined
  const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

  // Pequeña tabla previa 4..10 pax (si la quieres mostrar en detalle)
  const pricePreview =
    tour
      ? Array.from({ length: 7 }, (_, i) => i + 4) // 4..10
          .map(pax => ({ pax, price: computePriceForPax(pax, tour) }))
          .filter((x): x is { pax: number; price: number } => typeof x.price === 'number')
      : []

  return (
    <main className="min-h-screen">
      <HeaderServer />

      <AnimatedSection animation="fade-up" delay={200}>
        <TourDetail
          tourId={tour?._id || params.id}
          tourFromCms={
            tour
              ? {
                  // --- principales ---
                  title: tour.title,
                  summary: tour.summary,
                  description: tour.description, // Portable Text
                  mainImageUrl,

                  // --- ruta y listas ---
                  route: tour.route,
                  features: tour.features,
                  includes: tour.includes,
                  visitedPlaces: tour.visitedPlaces,
                  notes: tour.notes,
                  amenities: tour.amenities,

                  // --- precios ---
                  pricingMode: tour.pricingMode,
                  pricingRules: tour.pricingRules,
                  pricingTable: tour.pricingTable,
                  startingPriceEUR: startingPrice,
                  startingPriceLabel: startingPrice ? `Desde ${euro.format(startingPrice)}` : undefined,
                  pricePreview, // [{pax, price}]

                  // --- otros ---
                  overCapacityNote: tour.overCapacityNote,
                  isPopular: tour.isPopular === true || tour.isPopular === 'yes',
                }
              : undefined
          }
        />
      </AnimatedSection>

      <Footer />
    </main>
  )
}
