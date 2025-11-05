"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { TourDoc } from "@/sanity/lib/tours"
import { urlFor } from "@/sanity/lib/image"
import { TourDetail } from "@/components/tour-detail"
import { computePriceForPax, getStartingPriceEUR } from "@/sanity/lib/price"
import Link from "next/link"
import { useEffect, useState, useMemo } from "react"
import { useTranslation } from "@/contexts/i18n-context"
import { client } from "@/sanity/lib/client"
import { TOUR_BY_SLUG_QUERY } from "@/sanity/lib/queries"

interface TourPageProps {
  params: { id: string } // slug en la URL
}

export default function TourPage({ params }: TourPageProps) {
  const [tour, setTour] = useState<TourDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const { locale } = useTranslation()

  // Traducciones estáticas locales (textos de UI que no vienen de Sanity)
  const staticTexts = useMemo(() => {
    const texts = {
      es: {
        priceFrom: 'Precio desde:',
        depositNote: 'Pagarás el',
        depositPercent: '20%',
        depositRest: 'como depósito en la siguiente pantalla. El resto al confirmar.',
        reserveNow: 'Reservar ahora',
        loading: 'Cargando...',
        // Para TourDetail
        backToServices: 'Volver a servicios',
        popular: 'Popular',
        features: 'Características',
        includes: 'Incluye',
        visitedPlaces: 'Qué visitamos',
        vehicleAmenities: 'Comodidades del Vehículo',
        notes: 'Notas',
        wifi: 'WiFi',
        water: 'Agua',
        comfortable: 'Cómodo',
        safe: 'Seguro',
        tourNotFound: 'Tour no encontrado',
        backToHome: 'Volver al inicio',
        enlargeImage: 'Ampliar imagen',
        legacyTour: 'Este tour no viene del CMS (rama legacy).',
      },
      en: {
        priceFrom: 'Price from:',
        depositNote: 'You will pay',
        depositPercent: '20%',
        depositRest: 'as a deposit on the next screen. The rest upon confirmation.',
        reserveNow: 'Book now',
        loading: 'Loading...',
        // Para TourDetail
        backToServices: 'Back to services',
        popular: 'Popular',
        features: 'Features',
        includes: 'Includes',
        visitedPlaces: 'What we visit',
        vehicleAmenities: 'Vehicle Amenities',
        notes: 'Notes',
        wifi: 'WiFi',
        water: 'Water',
        comfortable: 'Comfortable',
        safe: 'Safe',
        tourNotFound: 'Tour not found',
        backToHome: 'Back to home',
        enlargeImage: 'Enlarge image',
        legacyTour: 'This tour does not come from CMS (legacy branch).',
      },
      fr: {
        priceFrom: 'Prix à partir de:',
        depositNote: 'Vous paierez',
        depositPercent: '20%',
        depositRest: 'd\'acompte sur l\'écran suivant. Le reste à la confirmation.',
        reserveNow: 'Réserver maintenant',
        loading: 'Chargement...',
        // Para TourDetail
        backToServices: 'Retour aux services',
        popular: 'Populaire',
        features: 'Caractéristiques',
        includes: 'Inclus',
        visitedPlaces: 'Ce que nous visitons',
        vehicleAmenities: 'Commodités du Véhicule',
        notes: 'Notes',
        wifi: 'WiFi',
        water: 'Eau',
        comfortable: 'Confortable',
        safe: 'Sûr',
        tourNotFound: 'Tour non trouvé',
        backToHome: 'Retour à l\'accueil',
        enlargeImage: 'Agrandir l\'image',
        legacyTour: 'Ce tour ne provient pas du CMS (branche héritée).',
      },
    }
    return texts[locale] || texts.es
  }, [locale])

  // Aplicar traducciones de Sanity según el idioma
  const translatedTour = useMemo(() => {
    if (!tour) return null
    if (locale === 'es') return tour
    
    const translation = locale === 'en' ? tour.translations?.en : tour.translations?.fr
    if (!translation) return tour
    
    return {
      ...tour,
      title: translation.title || tour.title,
      summary: translation.summary || tour.summary,
      description: translation.description || tour.description,
      features: translation.features || tour.features,
      includes: translation.includes || tour.includes,
      visitedPlaces: translation.visitedPlaces || tour.visitedPlaces,
      notes: translation.notes || tour.notes,
      amenities: translation.amenities || tour.amenities,
      overCapacityNote: translation.overCapacityNote || tour.overCapacityNote,
      route: translation.route ? {
        ...tour.route,
        origin: translation.route.origin || tour.route?.origin,
        destination: translation.route.destination || tour.route?.destination,
        circuitName: translation.route.circuitName || tour.route?.circuitName,
        roundTrip: tour.route?.roundTrip,
      } : tour.route,
    }
  }, [tour, locale])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const result = await client.fetch(TOUR_BY_SLUG_QUERY, { slug: params.id })
        if (!mounted) return
        console.log("[TourPage] Tour cargado desde Sanity para locale:", locale)
        console.log("[TourPage] Tour:", result)
        console.log("[TourPage] Translations disponibles:", result?.translations)
        setTour(result)
      } catch (e) {
        console.warn('[TourPage] Error cargando tour:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [params.id, locale])

  if (loading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">{staticTexts.loading}</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!tour || !translatedTour) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p className="text-center text-muted-foreground">Tour no encontrado</p>
        </div>
        <Footer />
      </main>
    )
  }

  // Normalización para TourDetail
  const mainImageUrl = translatedTour?.mainImage ? urlFor(translatedTour.mainImage).width(1600).url() : undefined
  const startingPrice = translatedTour ? getStartingPriceEUR(translatedTour) : undefined
  const euro = new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-FR' : 'es-ES', { 
    style: "currency", 
    currency: "EUR", 
    maximumFractionDigits: 0 
  })

  // Pequeña tabla previa 4..10 pax (si la quieres mostrar en detalle)
  const pricePreview =
    translatedTour
      ? Array.from({ length: 7 }, (_, i) => i + 4) // 4..10
          .map(pax => ({ pax, price: computePriceForPax(pax, translatedTour) }))
          .filter((x): x is { pax: number; price: number } => typeof x.price === "number")
      : []

  // URL a /pago con el tour seleccionado (tu página de pago ya reconoce estas señales)
  const reserveHref =
    `/pago?quickType=tour` +
    `&isTourQuick=1` +
    `&selectedTourSlug=${encodeURIComponent(params.id)}` +
    `&tourId=${encodeURIComponent(tour?._id || params.id)}` +
    (translatedTour?.title ? `&tourTitle=${encodeURIComponent(translatedTour.title)}` : "")

  return (
    <main className="min-h-screen">
      <Header />

      <AnimatedSection animation="fade-up" delay={200}>
        <TourDetail
          tourId={tour?._id || params.id}
          tourFromCms={
            translatedTour
              ? {
                  // --- principales ---
                  title: translatedTour.title,
                  summary: translatedTour.summary,
                  description: translatedTour.description, // Portable Text
                  mainImageUrl,

                  // --- ruta y listas ---
                  route: translatedTour.route,
                  features: translatedTour.features,
                  includes: translatedTour.includes,
                  visitedPlaces: translatedTour.visitedPlaces,
                  notes: translatedTour.notes,
                  amenities: translatedTour.amenities,

                  // --- precios ---
                  pricingMode: translatedTour.pricingMode,
                  pricingRules: translatedTour.pricingRules,
                  pricingTable: translatedTour.pricingTable,
                  startingPriceEUR: startingPrice,
                  startingPriceLabel: startingPrice ? `${staticTexts.priceFrom} ${euro.format(startingPrice)}` : undefined,
                  pricePreview, // [{pax, price}]

                  // --- otros ---
                  overCapacityNote: translatedTour.overCapacityNote,
                  isPopular: translatedTour.isPopular === true || translatedTour.isPopular === "yes",
                }
              : undefined
          }
          staticTexts={staticTexts}
        />
      </AnimatedSection>

      {/* === CTA simple: no pide datos aquí; solo redirige a /pago con el tour seleccionado === */}
      <section className="fixed !w-2/3 bottom-10 md:left-1/2 md:-translate-x-1/2  max-w-3xl px-4 z-50 ">
        <div className="max-w-3xl mx-auto rounded-lg border bg-white p-5 shadow-xl  flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              {translatedTour?.title || "Tour"}
            </h3>
            {startingPrice !== undefined && (
              <p className="text-sm text-muted-foreground">
                {staticTexts.priceFrom} <strong>{euro.format(startingPrice)}</strong>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {staticTexts.depositNote} <strong>{staticTexts.depositPercent}</strong> {staticTexts.depositRest}
            </p>
          </div>
          <Link
            href={reserveHref}
            className="inline-flex items-center justify-center rounded-md bg-accent text-accent-foreground px-4 text-center py-2 hover:bg-accent/90 transition-colors"
          >
            {staticTexts.reserveNow}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}