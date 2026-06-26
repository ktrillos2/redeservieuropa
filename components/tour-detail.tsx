"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ArrowLeft, Clock, MapPin, Star, Euro, Car, Shield, Wifi, Coffee, CheckCircle2, Navigation, Image as ImageIcon, Info } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { PortableText } from "@portabletext/react"
import { tourData } from "@/lib/tours"
import { urlFor } from "@/sanity/lib/image"
import { useTranslation } from "@/contexts/i18n-context"

type PricingRules = { baseUpTo4EUR: number }
type PricingTable = { p3?: number; p4?: number; p5?: number; p6?: number; p7?: number; p8?: number; extraFrom9?: number }

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
    gallery?: any[] // Galería de imágenes adicionales

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
  staticTexts?: {
    backToServices?: string
    popular?: string
    features?: string
    includes?: string
    visitedPlaces?: string
    vehicleAmenities?: string
    notes?: string
    wifi?: string
    water?: string
    comfortable?: string
    safe?: string
    tourNotFound?: string
    backToHome?: string
    enlargeImage?: string
    legacyTour?: string
    priceFrom?: string
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
    const { p3, p4 = 0, p5 = 0, p6 = 0, p7 = 0, p8 = 0, extraFrom9 = 0 } = tbl
    if (n <= 3 && p3 != null) return p3
    if (n <= 4) return p4 || (p3 ?? 0)
    if (n === 5) return p5
    if (n === 6) return p6
    if (n === 7) return p7
    if (n === 8) return p8
    return p8 + extraFrom9 * (n - 8)
  }
  return undefined
}

export function TourDetail({ tourId, tourFromCms, staticTexts: passedStaticTexts }: TourDetailProps) {
  const effectiveTourId = tourId === "tour-nocturno" ? "tour-paris" : tourId
  const tour = tourFromCms || tourData[effectiveTourId]
  const { locale } = useTranslation()

  // Traducciones estáticas locales por defecto
  const defaultStaticTexts = useMemo(() => {
    const texts = {
      es: {
        priceFrom: 'Precio desde:',
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

  const staticTexts = passedStaticTexts || defaultStaticTexts

  // Galería
  const galleryImages = useMemo<string[]>(() => {
    if (tourFromCms) {
      const imgs: string[] = []
      // Agregar imagen principal
      if (tourFromCms.mainImageUrl) imgs.push(tourFromCms.mainImageUrl)
      else if (tourFromCms.mainImage) {
        try {
          const u = urlFor(tourFromCms.mainImage).width(1600).url()
          if (u) imgs.push(u)
        } catch {}
      }
      // Agregar imágenes de la galería
      if (tourFromCms.gallery && Array.isArray(tourFromCms.gallery)) {
        tourFromCms.gallery.forEach((img: any) => {
          try {
            const u = urlFor(img).width(1600).url()
            if (u) imgs.push(u)
          } catch {}
        })
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
          <h1 className="text-2xl font-bold text-primary mb-4">{staticTexts.tourNotFound}</h1>
          <Link href="/" className="inline-flex items-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
            {staticTexts.backToHome}
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
            {staticTexts.backToServices}
          </Link>

          {/* GALERÍA 3D CARRUSEL O IMAGEN ÚNICA */}
          <div className="relative w-full mb-16 pt-4 pb-12 overflow-hidden">
            {galleryImages.length > 1 ? (
              <Carousel 
                opts={{ 
                  align: "center",
                  loop: true,
                }} 
                className="w-full"
              >
                <CarouselContent className="-ml-4 md:-ml-8 py-10 px-4">
                  {galleryImages.map((src, idx) => (
                    <CarouselItem key={idx} className="pl-4 md:pl-8 basis-[85%] md:basis-[60%] lg:basis-[50%]">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="relative w-full h-[300px] md:h-[450px] cursor-pointer group outline-none">
                            <div className="absolute inset-0 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:scale-[1.03] group-hover:-translate-y-3 border-[6px] border-white overflow-hidden bg-muted">
                              <img src={src} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                          <div className="relative w-full h-[80vh] flex items-center justify-center">
                            <img src={src} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:block">
                  <CarouselPrevious className="left-8 xl:left-16 w-14 h-14 bg-white/90 text-primary hover:bg-white hover:scale-110 transition-all border-none shadow-xl z-20" />
                  <CarouselNext className="right-8 xl:right-16 w-14 h-14 bg-white/90 text-primary hover:bg-white hover:scale-110 transition-all border-none shadow-xl z-20" />
                </div>
              </Carousel>
            ) : (
              <div className="flex justify-center items-center py-10 px-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="relative w-[95%] md:w-[70%] lg:w-[60%] h-[300px] md:h-[450px] cursor-pointer group outline-none">
                      <div className="absolute inset-0 rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transform transition-transform duration-500 hover:scale-[1.02] hover:-translate-y-2 border-[6px] border-white overflow-hidden bg-muted">
                        <img src={galleryImages[0] || "/placeholder.jpg"} alt="Principal" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                      <img src={galleryImages[0]} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
            
            {/* Popular Badge */}
            {tourFromCms.isPopular && (
              <div className="absolute top-8 left-4 md:left-12 z-50">
                <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-1.5 text-sm font-bold shadow-lg shadow-accent/20 border-none rounded-full flex items-center gap-1.5 transform -rotate-2">
                  <Star className="w-4 h-4 fill-current" />
                  {staticTexts.popular}
                </Badge>
              </div>
            )}
          </div>

          {/* CONTENIDO PRINCIPAL Y BARRA LATERAL */}
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            
            {/* Columna Izquierda: Información del Tour (65%) */}
            <div className="md:col-span-2 space-y-12 pb-24">
              
              {/* Header Info */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary font-display tracking-tight text-balance mb-4">
                  {tourFromCms.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground mt-4">
                  {tourFromCms.route?.origin && tourFromCms.route?.destination && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-medium">{tourFromCms.route.origin} ↔ {tourFromCms.route.destination}</span>
                    </div>
                  )}
                  {tourFromCms.route?.circuitName && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="font-medium">{tourFromCms.route.circuitName}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Descripción */}
              <div>
                {Array.isArray(tourFromCms.description) ? (
                  <div className="prose prose-lg max-w-none text-muted-foreground prose-p:leading-relaxed prose-a:text-accent hover:prose-a:text-accent/80">
                    <PortableText value={tourFromCms.description as any} />
                  </div>
                ) : tourFromCms.summary ? (
                  <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                    {tourFromCms.summary}
                  </p>
                ) : null}
              </div>

              {/* Características e Incluye */}
              <div className="grid sm:grid-cols-2 gap-8">
                {Array.isArray(tourFromCms.features) && tourFromCms.features.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                      <Star className="w-6 h-6 text-accent" />
                      {staticTexts.features}
                    </h3>
                    <ul className="space-y-4">
                      {tourFromCms.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(tourFromCms.includes) && tourFromCms.includes.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                      <Shield className="w-6 h-6 text-accent" />
                      {staticTexts.includes}
                    </h3>
                    <ul className="space-y-4">
                      {tourFromCms.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Qué visitamos */}
              {Array.isArray(tourFromCms.visitedPlaces) && tourFromCms.visitedPlaces.length > 0 && (
                <div>
                  <Separator className="bg-border/50 mb-10" />
                  <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-accent" />
                    {staticTexts.visitedPlaces}
                  </h3>
                  <div className="relative border-l-2 border-accent/20 ml-3 space-y-6">
                    {tourFromCms.visitedPlaces.map((p, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-accent" />
                        <p className="text-lg text-muted-foreground">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas y Overcapacity */}
              {((Array.isArray(tourFromCms.notes) && tourFromCms.notes.length > 0) || tourFromCms.overCapacityNote) && (
                <div className="bg-muted/30 p-6 md:p-8 rounded-2xl border border-border/50">
                  <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" />
                    {staticTexts.notes}
                  </h3>
                  
                  {Array.isArray(tourFromCms.notes) && tourFromCms.notes.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      {tourFromCms.notes.map((n, i) => (
                        <li key={i} className="text-muted-foreground">{n}</li>
                      ))}
                    </ul>
                  )}
                  
                  {tourFromCms.overCapacityNote && (
                    <p className="text-sm text-muted-foreground italic border-t border-border/50 pt-4 mt-4">
                      {tourFromCms.overCapacityNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Columna Derecha: Sticky Sidebar (35%) */}
            <div className="md:col-span-1 relative">
              <div className="sticky top-28 space-y-6">
                
                {/* Tarjeta de Resumen y Precio (Solo visual, reserva está en footer fix) */}
                <Card className="shadow-xl shadow-black/5 border-border/50 overflow-hidden rounded-2xl">
                  <div className="p-6 md:p-8 bg-gradient-to-b from-card to-muted/10">
                    {tourFromCms.startingPriceLabel && (
                      <div className="mb-6">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          {staticTexts.priceFrom || "Desde"}
                        </span>
                        <div className="text-4xl font-black text-primary">
                          {tourFromCms.startingPriceEUR ? `€${tourFromCms.startingPriceEUR}` : ""}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4 mb-8 text-sm">
                      <div className="flex justify-between items-center py-3 border-b border-border/50">
                        <span className="text-muted-foreground font-medium">Modalidad</span>
                        <span className="font-semibold text-primary">Tour Privado</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border/50">
                        <span className="text-muted-foreground font-medium">Cancelación</span>
                        <span className="font-semibold text-green-600">Gratuita</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Comodidades del Vehículo */}
                <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-primary mb-6">
                      {staticTexts.vehicleAmenities}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Wifi className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.wifi}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Coffee className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.water}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Car className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.comfortable}</span>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Shield className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.safe}</span>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>
            </div>

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
          {staticTexts.backToServices}
        </Link>
        <p className="text-muted-foreground">{staticTexts.legacyTour}</p>
      </div>
    </div>
  )
}