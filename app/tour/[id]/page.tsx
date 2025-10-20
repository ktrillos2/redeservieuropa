import HeaderServer from "@/components/header.server"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { getTourBySlug, TourDoc } from "@/sanity/lib/tours"
import { urlFor } from "@/sanity/lib/image"
import { TourDetail } from "@/components/tour-detail"
import { computePriceForPax, getStartingPriceEUR } from "@/sanity/lib/price"
import Link from "next/link"

interface TourPageProps {
  params: { id: string } // slug en la URL
}

export default async function TourPage({ params }: TourPageProps) {
  const tour = (await getTourBySlug(params.id)) as TourDoc | null

  // Normalización para TourDetail
  const mainImageUrl = tour?.mainImage ? urlFor(tour.mainImage).width(1600).url() : undefined
  const startingPrice = tour ? getStartingPriceEUR(tour) : undefined
  const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

  // Pequeña tabla previa 4..10 pax (si la quieres mostrar en detalle)
  const pricePreview =
    tour
      ? Array.from({ length: 7 }, (_, i) => i + 4) // 4..10
          .map(pax => ({ pax, price: computePriceForPax(pax, tour) }))
          .filter((x): x is { pax: number; price: number } => typeof x.price === "number")
      : []

  // URL a /pago con el tour seleccionado (tu página de pago ya reconoce estas señales)
  const reserveHref =
    `/pago?quickType=tour` +
    `&isTourQuick=1` +
    `&selectedTourSlug=${encodeURIComponent(params.id)}` +
    `&tourId=${encodeURIComponent(tour?._id || params.id)}` +
    (tour?.title ? `&tourTitle=${encodeURIComponent(tour.title)}` : "")

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
                  isPopular: tour.isPopular === true || tour.isPopular === "yes",
                }
              : undefined
          }
        />
      </AnimatedSection>

      {/* === CTA simple: no pide datos aquí; solo redirige a /pago con el tour seleccionado === */}
      <section className="fixed !w-2/3 bottom-10 md:left-1/2 md:-translate-x-1/2  max-w-3xl px-4 z-50 ">
        <div className="max-w-3xl mx-auto rounded-lg border bg-white p-5 shadow-xl  flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {tour?.title || "Tour"}
            </h3>
            {startingPrice !== undefined && (
              <p className="text-sm text-muted-foreground">
                Precio desde: <strong>{euro.format(startingPrice)}</strong>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Pagarás el <strong>20%</strong> como depósito en la siguiente pantalla. El resto al confirmar.
            </p>
          </div>
          <Link
            href={reserveHref}
            className="inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground px-4 text-center py-2 hover:bg-accent/90 transition-colors"
          >
            Reservar ahora
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}