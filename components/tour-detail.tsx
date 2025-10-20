"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArrowLeft, Clock, MapPin, Star, Euro, Car, Shield, Wifi, Coffee } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { PortableText } from "@portabletext/react"
import { tourData } from "@/lib/tours"
import { urlFor } from "@/sanity/lib/image"

type PricingRules = { baseUpTo4EUR: number }
type PricingTable = { p4?: number; p5?: number; p6?: number; p7?: number; p8?: number; extraFrom9?: number }

interface TourDetailProps {
  tourId: string
  // NUEVO shape desde Sanity (map que te pasó la page)
  tourFromCms?: {
    // principales
    title: string
    summary?: string
    description?: any // PortableText
    mainImage?: any
    mainImageUrl?: string

    // ruta y listas
    route?: { origin?: string; destination?: string; circuitName?: string; roundTrip?: boolean }
    features?: string[]
    includes?: string[]
    visitedPlaces?: string[]
    notes?: string[]
    amenities?: string[]

    // precios
    pricingMode?: "rules" | "table"
    pricingRules?: PricingRules
    pricingTable?: PricingTable
    startingPriceEUR?: number
    startingPriceLabel?: string // "Desde 200 €"
    overCapacityNote?: string

    // popularidad
    isPopular?: boolean

    // opcional si quieres mostrar una previa de precios
    pricePreview?: Array<{ pax: number; price: number }>
  }
}

const INC_5 = 34, INC_6 = 32, INC_7 = 28, INC_8 = 26

function computePriceForPax(n: number, mode?: "rules" | "table", rules?: PricingRules, tbl?: PricingTable): number | undefined {
  if (!n || n < 1) return undefined
  if (mode === "rules" && rules?.baseUpTo4EUR != null) {
    const base = rules.baseUpTo4EUR
    if (n <= 4) return base
    if (n === 5) return base + INC_5
    if (n === 6) return base + INC_5 + INC_6
    if (n === 7) return base + INC_5 + INC_6 + INC_7
    return base + INC_5 + INC_6 + INC_7 + INC_8 // 8 en adelante mismo precio
  }
  if (mode === "table" && tbl) {
    const { p4 = 0, p5 = 0, p6 = 0, p7 = 0, p8 = 0, extraFrom9 = 0 } = tbl
    if (n <= 4) return p4
    if (n === 5) return p5
    if (n === 6) return p6
    if (n === 7) return p7
    if (n === 8) return p8
    return p8 + extraFrom9 * (n - 8)
  }
  return undefined
}

export function TourDetail({ tourId, tourFromCms }: TourDetailProps) {
  const effectiveTourId = tourId === "tour-nocturno" ? "tour-paris" : tourId
  const tour = tourFromCms || tourData[effectiveTourId]

  // Galería
  const galleryImages = useMemo<string[]>(() => {
    if (tourFromCms) {
      const imgs: string[] = []
      if (tourFromCms.mainImageUrl) imgs.push(tourFromCms.mainImageUrl)
      else if (tourFromCms.mainImage) {
        try {
          const u = urlFor(tourFromCms.mainImage).width(1600).url()
          if (u) imgs.push(u)
        } catch {}
      }
      return imgs
    }
    const g = (tour as any)?.gallery as string[] | undefined
    return Array.isArray(g) && g.length > 0 ? g : (tour as any)?.image ? [(tour as any).image] : []
  }, [tour, tourFromCms])

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Tour no encontrado</h1>
          <Link href="/" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  // ============ RAMA CMS (nuevo esquema) ============
  if (tourFromCms) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-10">
          {/* Back */}
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a servicios
          </Link>

          {/* SOLO contenido informativo - SIN columna de reserva */}
          <div className="space-y-8 py-3">
            {/* Galería */}
            <div className="relative rounded-lg overflow-hidden">
              <Carousel className="soft-fade-in">
                <CarouselContent>
                  {galleryImages.map((src, idx) => (
                    <CarouselItem key={idx}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            aria-label="Ampliar imagen"
                            className="relative group block w-full h-64 md:h-96 overflow-hidden"
                          >
                            <img src={src} alt={`${tourFromCms.title} - imagen ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                          <div className="relative w-full h-[70vh]">
                            <img src={src} alt={`${tourFromCms.title} - ampliada ${idx + 1}`} className="w-full h-full object-contain" />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-3 md:left-4 size-10 md:size-12 bg-black/50 text-white hover:bg-black/70 border-white/20 shadow-lg z-20" />
                <CarouselNext className="right-3 md:right-4 size-10 md:size-12 bg-black/50 text-white hover:bg-black/70 border-white/20 shadow-lg z-20" />
              </Carousel>

              {tourFromCms.isPopular && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-accent text-accent-foreground">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
            </div>

            {/* Detalle */}
            <Card className="transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-3xl text-primary">{tourFromCms.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  {tourFromCms.route?.origin && tourFromCms.route?.destination && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{tourFromCms.route.origin} ↔ {tourFromCms.route.destination}</span>
                    </div>
                  )}
                  {tourFromCms.startingPriceLabel && (
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      <span>{tourFromCms.startingPriceLabel}</span>
                    </div>
                  )}
                  {tourFromCms.route?.circuitName && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{tourFromCms.route.circuitName}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {Array.isArray(tourFromCms.description) ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert mb-6">
                    <PortableText value={tourFromCms.description as any} />
                  </div>
                ) : tourFromCms.summary ? (
                  <p className="text-lg text-muted-foreground mb-6 text-pretty">{tourFromCms.summary}</p>
                ) : null}

                {Array.isArray(tourFromCms.features) && tourFromCms.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Características</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {tourFromCms.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(tourFromCms.includes) && tourFromCms.includes.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Incluye</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {tourFromCms.includes.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-accent" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(tourFromCms.visitedPlaces) && tourFromCms.visitedPlaces.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <h3 className="text-xl font-semibold mb-4 text-primary">Qué visitamos</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {tourFromCms.visitedPlaces.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </>
                )}

                {Array.isArray(tourFromCms.amenities) && tourFromCms.amenities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Comodidades del Vehículo</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {tourFromCms.amenities.map((am, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-accent" />
                          <span className="text-sm">{am}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray(tourFromCms.notes) && tourFromCms.notes.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <h3 className="text-xl font-semibold mb-4 text-primary">Notas</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {tourFromCms.notes.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </>
                )}

                {tourFromCms.overCapacityNote && (
                  <>
                    <Separator className="my-6" />
                    <p className="text-sm text-muted-foreground">{tourFromCms.overCapacityNote}</p>
                  </>
                )}
              </CardContent>
            </Card>

            

            {/* Tarjeta “comodidades” visual */}
            <Card className="transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">Comodidades del Vehículo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Wifi className="w-6 h-6 text-accent" />
                    <span className="text-sm text-center">WiFi</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Coffee className="w-6 h-6 text-accent" />
                    <span className="text-sm text-center">Agua</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Car className="w-6 h-6 text-accent" />
                    <span className="text-sm text-center">Cómodo</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-accent" />
                    <span className="text-sm text-center">Seguro</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ========= Fallback (data local antigua)
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-10">
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a servicios
        </Link>
        <p className="text-muted-foreground">Este tour no viene del CMS (rama legacy).</p>
      </div>
    </div>
  )
}