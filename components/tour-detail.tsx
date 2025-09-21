"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Star,
  Euro,
  Calendar,
  Car,
  Shield,
  Wifi,
  Coffee,
  Luggage,
  Phone,
  Plane,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { formatPhonePretty, ensureLeadingPlus } from "@/lib/utils"
import { PortableText } from "@portabletext/react"
import { useRouter } from "next/navigation"
import { tourData } from "@/lib/tours"
import { urlFor } from "@/sanity/lib/image"

interface TourDetailProps {
  tourId: string
  tourFromCms?: {
    title: string
    description?: string
    basePrice?: number
    basePriceDay?: number
    basePriceNight?: number
    duration?: string
    distance?: string
    mainImage?: any
    gallery?: any[]
    features?: string[]
    included?: string[]
    pricing?: { pax: number; price: number }[]
    pricingP4?: { threeH?: number; twoH?: number; eiffelArco?: number }
    pricingP5?: { threeH?: number; twoH?: number; eiffelArco?: number }
    extraSections?: Array<{ title?: string; body?: any; included?: string[]; itinerary?: string[] }>
    amenities?: string[]
    notes?: string[]
    infoLists?: Array<{ title?: string; icon?: string; items?: string[] }>
  }
}

export function TourDetail({ tourId, tourFromCms }: TourDetailProps) {
  const effectiveTourId = tourId === "tour-nocturno" ? "tour-paris" : tourId
  const tour = tourFromCms || tourData[effectiveTourId]
  const router = useRouter()
  /*
   * === LÓGICA DE PRECIOS DINÁMICOS (DOCUMENTACIÓN) ===
   * Para el tour "tour-paris" el precio ya no es fijo sólo por horas, sino que escala con la cantidad de pasajeros:
   *  - El precio base por hora (diurno o nocturno) cubre hasta 4 pasajeros.
   *  - A partir del quinto pasajero se aplica un recargo por pasajero y por hora.
   *  - Recargo diurno actual: 10€/h por pasajero extra.
   *  - Recargo nocturno actual: 12€/h por pasajero extra.
   *  - Cuando el usuario selecciona una "pricingOption" (tarifa cerrada) que incluye horas (p.ej. 2h, 3h), esa tarifa se toma
   *    como base y se añade el recargo de pasajeros extra calculado con las horas de la opción.
   *  - Si la opción no define horas, se asume 1 hora para el recargo.
   *  - En la rama CMS se replica comportamiento. Si existe una opción seleccionada se aplica la misma lógica de recargos.
   *  - Si el CMS no provee tabla de precios por pax, se usa basePrice + (pasajeros extra * 10€) (fallback simple).
   *
   * Para modificar los recargos:
   *  - Cambiar en calculatePrice(): las constantes extraPerPassenger (10 / 12) y en calcCmsPrice() (10, 12) según convenga.
   *  - Ajustar también el breakdown (desglose) en el JSX para reflejar la fórmula nueva si cambia.
   *
   * Esta implementación evita toasts y mantiene validaciones de campos mediante fieldErrors.
   */
  const [passengers, setPassengers] = useState(2)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isNightTime, setIsNightTime] = useState(false)
  const [extraLuggage, setExtraLuggage] = useState(false)
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  const [flightNumber, setFlightNumber] = useState("")
  const [luggage23kg, setLuggage23kg] = useState(0)
  const [luggage10kg, setLuggage10kg] = useState(0)
  const [babyStrollers, setBabyStrollers] = useState(0)
  const [childrenAges, setChildrenAges] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [tourHours, setTourHours] = useState(2)
  const [routeOption, setRouteOption] = useState<"threeH" | "twoH" | "eiffelArco" | undefined>(undefined)
  // Nueva: selección explícita de opción de tarifa (pricingOptions)
  const [selectedPricingOption, setSelectedPricingOption] = useState<{ label: string; price: number; hours?: number } | null>(null)
  // Estado de errores por campo para validaciones inline (sin toasts)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const galleryImages = useMemo<string[]>(() => {
    // Si viene de CMS, construir URLs de Sanity
    if (tourFromCms) {
      const sanImgs: string[] = []
      const main = tourFromCms.mainImage ? urlFor(tourFromCms.mainImage).width(1600).url() : undefined
      if (main) sanImgs.push(main)
      if (Array.isArray(tourFromCms.gallery)) {
        tourFromCms.gallery.forEach((img: any) => {
          try {
            const u = urlFor(img).width(1600).url()
            if (u) sanImgs.push(u)
          } catch {}
        })
      }
      return sanImgs
    }
    // Fallback local
    const g = (tour as any)?.gallery as string[] | undefined
    return Array.isArray(g) && g.length > 0 ? g : (tour as any)?.image ? [(tour as any).image] : []
  }, [tour, tourFromCms])

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Tour no encontrado</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Rama uniforme para tours del CMS: misma estructura para todos
  if (tourFromCms) {
    // === Helpers de renderizado dinámico para nuevas listas ===
    const IconMap: Record<string, any> = {
      plane: Plane,
      "map-pin": MapPin,
      clock: Clock,
      shield: Shield,
      car: Car,
      star: Star,
    }
    const ListSection = ({ title, items, icon }: { title: string; items?: string[]; icon?: string }) => {
      if (!items || items.length === 0) return null
      const Ico = icon && IconMap[icon] ? IconMap[icon] : Shield
      return (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2"><Ico className="w-4 h-4 text-accent" /> {title}</h3>
          <ul className="grid md:grid-cols-2 gap-3 list-none m-0 p-0">
            {items.map((it, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    const hasExtraSections = Array.isArray(tourFromCms.extraSections) && tourFromCms.extraSections.length > 0
    const calcCmsPrice = () => {
      // Base según opción seleccionada o tablas
      let baseTotal = 0
      // 1) Opción seleccionada: usar su precio y añadir recargo por pasajeros extra (>4) proporcional a horas
      if (selectedPricingOption) {
        const baseIncluded = 4
        const extraPassengers = Math.max(0, passengers - baseIncluded)
        const perHourExtra = isNightTime ? 12 : 10
        const hours = selectedPricingOption.hours ?? 1
        baseTotal = selectedPricingOption.price + (extraPassengers > 0 ? extraPassengers * perHourExtra * hours : 0)
      } else {
        // 2) Buscar precio por pax en pricing; si no, usar basePrice; si tampoco, mínimo de pricingOptions
        const p: any = tourFromCms.pricing
        const po: any[] = Array.isArray((tour as any).pricingOptions) ? (tour as any).pricingOptions : []
        let foundPrice: number | undefined = undefined
        if (Array.isArray(p)) {
          const found = p.find((x: any) => x && Number(x.pax) === Number(passengers))
          if (found && typeof found.price === 'number') foundPrice = found.price
        }
        if (typeof foundPrice !== 'number') {
          if (typeof tourFromCms.basePrice === 'number' && !Number.isNaN(tourFromCms.basePrice)) {
            foundPrice = tourFromCms.basePrice
          } else if (Array.isArray(po) && po.length > 0) {
            // Usar la opción más barata como "desde" para evitar 0€ inicial
            const minOpt = po.reduce((min: any, curr: any) => (curr?.price < (min?.price ?? Infinity) ? curr : min), null)
            if (minOpt && typeof minOpt.price === 'number') {
              const baseIncluded = 4
              const extraPassengers = Math.max(0, passengers - baseIncluded)
              const perHourExtra = isNightTime ? 12 : 10
              const hours = typeof minOpt.hours === 'number' ? minOpt.hours : 1
              foundPrice = minOpt.price + (extraPassengers > 0 ? extraPassengers * perHourExtra * hours : 0)
            }
          }
        }
        if (typeof foundPrice === 'number') {
          baseTotal = foundPrice
        } else {
          // Fallback seguro para evitar 0€ cuando no hay datos estructurados.
          // Asunción basada en teaser del sitio: "Desde 180€".
          baseTotal = 180
        }
      }

      // 3) Recargos globales: nocturno (+5) y equipaje voluminoso (+10) si aplica
      const extraLugg = Number(luggage23kg || 0) > 3
      const nightFee = isNightTime ? 5 : 0
      const luggageFee = extraLugg ? 10 : 0
      return baseTotal + nightFee + luggageFee
    }

    const cmsTotal = calcCmsPrice()

    const submitCmsBooking = () => {
      const newErrors: Record<string, string> = {}
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      if (!contactName.trim()) newErrors.contactName = 'Requerido'
      if (!contactPhone.trim()) newErrors.contactPhone = 'Requerido'
      if (!contactEmail.trim()) newErrors.contactEmail = 'Requerido'
      else if (!emailRegex.test(contactEmail.trim())) newErrors.contactEmail = 'Email inválido'
      if (!date) newErrors.date = 'Requerido'
      if (!time) newErrors.time = 'Requerido'
      if (!pickupAddress.trim()) newErrors.pickupAddress = 'Requerido'
      if (passengers < 1) newErrors.passengers = 'Debe ser ≥1'

      setFieldErrors(newErrors)
      if (Object.keys(newErrors).length > 0) {
        // Enfocar primer campo con error
        const firstKey = Object.keys(newErrors)[0]
        try { document.querySelector<HTMLInputElement>(`[data-field="${firstKey}"]`)?.focus() } catch {}
        return
      }
      const isNight = (() => {
        if (!time) return false
        const [hh] = String(time).split(":").map(Number)
        const h = hh || 0
        return h >= 21 || h < 6
      })()
      const extraLugg = Number(luggage23kg || 0) > 3
      const bookingData: any = {
        tourId,
        passengers,
        date,
        time,
        pickupAddress,
        dropoffAddress,
        flightNumber,
        luggage23kg,
        luggage10kg,
        babyStrollers,
        childrenAges,
        specialRequests,
        contactName,
        contactPhone,
        contactEmail,
        totalPrice: Number(cmsTotal || 0),
        isNightTime: isNight,
        extraLuggage: extraLugg,
        luggageCount: Number(luggage23kg || 0) + Number(luggage10kg || 0),
        // Marca como tour para cálculo de depósito en Pago
        tourHours: 0,
        selectedPricingOption: selectedPricingOption ? { label: selectedPricingOption.label, price: selectedPricingOption.price, hours: selectedPricingOption.hours } : undefined,
      }
      localStorage.setItem("bookingData", JSON.stringify(bookingData))
      router.push("/pago")
    }

    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-10">
          {/* Back Button */}
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a servicios
          </Link>

          <div className="grid lg:grid-cols-3 gap-8 py-3">
            {/* Información + galería */}
            <div className="lg:col-span-2 space-y-8">
              {/* Galería uniforme con lightbox */}
              <div className="relative rounded-lg overflow-hidden">
                <Carousel className="soft-fade-in">
                  <CarouselContent>
                    {galleryImages.map((src, idx) => (
                      <CarouselItem key={idx} className="md:basis-1/1 lg:basis-1/1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button aria-label="Ampliar imagen" className="relative group block w-full h-64 md:h-96 overflow-hidden">
                              <img src={src} alt={`${tour.title} - imagen ${idx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                            <div className="relative w-full h-[70vh]">
                              <img src={src} alt={`${tour.title} - ampliada ${idx + 1}`} className="w-full h-full object-contain" />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>

              {/* Detalle básico uniforme */}
              <Card className="transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-3xl text-primary">{tour.title}</CardTitle>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    {tour.duration && (
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{tour.duration}</span></div>
                    )}
                    {tour.distance && (
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{tour.distance}</span></div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {tour.description && (
                    <p className="text-lg text-muted-foreground mb-6 text-pretty">{tour.description}</p>
                  )}

                  {Array.isArray((tour as any).pricingOptions) && (tour as any).pricingOptions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4 text-primary">Selecciona una Opción / Tarifa</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {(tour as any).pricingOptions.map((op: any, idx: number) => {
                          const active = selectedPricingOption?.label === op.label && selectedPricingOption?.price === op.price
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedPricingOption({ label: op.label, price: op.price, hours: op.hours })}
                              className={`text-left p-4 rounded-lg border transition-all duration-300 hover:shadow-sm hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${active ? 'border-accent bg-accent/10 shadow-inner' : 'border-border bg-muted/30'}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm flex items-center gap-2">
                                  {op.label}{op.hours ? ` (${op.hours}h)` : ''}
                                  {active && (
                                    <Badge className="bg-accent text-accent-foreground animate-pulse">Seleccionado</Badge>
                                  )}
                                </span>
                                <Badge className={active ? 'bg-accent text-accent-foreground' : 'bg-primary/80'}>{op.price}€</Badge>
                              </div>
                              {op.description && <p className="text-xs text-muted-foreground leading-snug">{op.description}</p>}
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">La selección ajustará el total mostrado. Puedes modificarla en cualquier momento.</p>
                      {selectedPricingOption && (
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            onClick={() => setSelectedPricingOption(null)}
                          >
                            Quitar selección
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {Array.isArray(tour.features) && tour.features.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-4 text-primary">Características</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {tour.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(tour.included) && tour.included.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-primary">Incluye</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {tour.included.map((item: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-accent" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray((tour as any).amenities) && (tour as any).amenities.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4 text-primary">Comodidades del Vehículo</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {(tour as any).amenities.map((am: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-accent" />
                            <span className="text-sm">{am}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray((tour as any).pricingOptions) && (tour as any).pricingOptions.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4 text-primary">Opciones y Tarifas</h3>
                      <div className="space-y-3">
                        {(tour as any).pricingOptions.map((op: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{op.label}{op.hours ? ` (${op.hours}h)` : ''}</span>
                              {op.description && <span className="text-xs text-muted-foreground">{op.description}</span>}
                            </div>
                            <Badge className="bg-accent text-accent-foreground">{op.price}€</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas sueltas (bullets genéricos) */}
                  {Array.isArray(tourFromCms.notes) && tourFromCms.notes.length > 0 && (
                    <ListSection title="Notas" items={tourFromCms.notes} icon="star" />
                  )}

                  {/* Listas informativas genéricas */}
                  {Array.isArray(tourFromCms.infoLists) && tourFromCms.infoLists.length > 0 && (
                    <div className="mt-8 space-y-8">
                      {tourFromCms.infoLists.map((lst, i) => (
                        <ListSection key={i} title={lst.title || `Lista ${i + 1}`} items={lst.items} icon={lst.icon} />
                      ))}
                    </div>
                  )}

                  {/* Secciones adicionales enriquecidas (PortableText + listas) */}
                  {hasExtraSections && (
                    <div className="mt-10 space-y-10">
                      {tourFromCms.extraSections!.map((sec, idx) => {
                        const hasBody = Array.isArray(sec.body) && sec.body.length > 0
                        const hasIncluded = Array.isArray(sec.included) && sec.included.length > 0
                        const hasItinerary = Array.isArray(sec.itinerary) && sec.itinerary.length > 0
                        if (!hasBody && !hasIncluded && !hasItinerary) return null
                        return (
                          <div key={idx} className="p-6 rounded-lg border bg-muted/30">
                            {sec.title && <h3 className="text-xl font-semibold mb-4 text-primary">{sec.title}</h3>}
                            {hasBody && (
                              <div className="prose prose-sm max-w-none mb-4 dark:prose-invert">
                                <PortableText value={sec.body as any} />
                              </div>
                            )}
                            {hasIncluded && <ListSection title="Incluye" items={sec.included as string[]} icon="shield" />}
                            {hasItinerary && <ListSection title="Itinerario" items={sec.itinerary as string[]} icon="map-pin" />}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Card adicional: Opciones y Tarifas (CMS) */}
              <Card className="transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Opciones y Tarifas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm md:text-base">
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Tarifas según número de pasajeros:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-primary mb-1">Hasta 4 pasajeros</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Paris Tour (3h): <span className="font-semibold">300€</span></li>
                          <li>Paris Tour (2h): <span className="font-semibold">245€</span></li>
                          <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">200€</span></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-primary mb-1">Hasta 5 pasajeros</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Paris Tour (3h): <span className="font-semibold">340€</span></li>
                          <li>Paris Tour (2h): <span className="font-semibold">315€</span></li>
                          <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">245€</span></li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Para más de 5 pasajeros, consultar por Van (8p).</p>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Qué visitamos</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Museo del Louvre</li>
                        <li>Campos Elíseos y Arco del Triunfo</li>
                        <li>Trocadero</li>
                        <li>Torre Eiffel</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Notas</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Paradas de 15 min para fotos</li>
                        <li>Itinerario ajustable según tráfico</li>
                        <li>Servicio privado puerta a puerta</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card adicional: Comodidades del Vehículo (CMS) */}
              <Card className="transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Comodidades del Vehículo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                      <Wifi className="w-6 h-6 text-accent animate-pulse" />
                      <span className="text-sm text-center">WiFi Gratuito</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                      <Coffee className="w-6 h-6 text-accent animate-pulse" />
                      <span className="text-sm text-center">Agua de Cortesía</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                      <Car className="w-6 h-6 text-accent animate-pulse" />
                      <span className="text-sm text-center">Vehículo Cómodo</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                      <Shield className="w-6 h-6 text-accent animate-pulse" />
                      <span className="text-sm text-center">Seguro Completo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reserva completa y uniforme */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary text-center">Reservar Ahora</CardTitle>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent animate-pulse">{Number.isNaN(Number(cmsTotal)) ? "…€" : `${cmsTotal}€`}</div>
                    <p className="text-sm text-muted-foreground">precio estimado según pasajeros</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Información de contacto */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <Phone className="w-4 h-4 text-accent" />
                      Información de Contacto
                    </h4>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre Completo</label>
                      <Input
                        data-field="contactName"
                        placeholder="Tu nombre completo"
                        value={contactName}
                        onChange={(e) => { setContactName(e.target.value); if (fieldErrors.contactName) setFieldErrors(f => { const c={...f}; delete c.contactName; return c }) }}
                        className={fieldErrors.contactName ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {fieldErrors.contactName && <p className="text-xs text-destructive">{fieldErrors.contactName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Teléfono</label>
                        <Input
                          data-field="contactPhone"
                          placeholder="+33 1 23 45 67 89"
                          value={contactPhone}
                          onChange={(e) => { setContactPhone(ensureLeadingPlus(e.target.value)); if (fieldErrors.contactPhone) setFieldErrors(f => { const c={...f}; delete c.contactPhone; return c }) }}
                          onBlur={(e) => setContactPhone(formatPhonePretty(ensureLeadingPlus(e.target.value)))}
                          className={fieldErrors.contactPhone ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {fieldErrors.contactPhone && <p className="text-xs text-destructive">{fieldErrors.contactPhone}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          data-field="contactEmail"
                          type="email"
                          placeholder="tu@email.com"
                          value={contactEmail}
                          onChange={(e) => { setContactEmail(e.target.value); if (fieldErrors.contactEmail) setFieldErrors(f => { const c={...f}; delete c.contactEmail; return c }) }}
                          className={fieldErrors.contactEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                        {fieldErrors.contactEmail && <p className="text-xs text-destructive">{fieldErrors.contactEmail}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Pasajeros */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Número de Pasajeros
                    </label>
                    <Input
                      data-field="passengers"
                      type="number" min={1} max={9}
                      value={passengers}
                      onChange={(e) => { setPassengers(Number(e.target.value)); if (fieldErrors.passengers) setFieldErrors(f => { const c={...f}; delete c.passengers; return c }) }}
                      className={fieldErrors.passengers ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {fieldErrors.passengers && <p className="text-xs text-destructive">{fieldErrors.passengers}</p>}
                  </div>

                  {/* Fecha y hora */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" />Fecha</label>
                      <Input
                        data-field="date"
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); if (fieldErrors.date) setFieldErrors(f => { const c={...f}; delete c.date; return c }) }}
                        min={new Date().toISOString().split("T")[0]}
                        className={fieldErrors.date ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {fieldErrors.date && <p className="text-xs text-destructive">{fieldErrors.date}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />Hora</label>
                      <Input
                        data-field="time"
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const v = e.target.value
                          setTime(v)
                          const hour = Number.parseInt(v.split(":")[0])
                          setIsNightTime(hour >= 21 || hour < 6)
                          if (fieldErrors.time) setFieldErrors(f => { const c={...f}; delete c.time; return c })
                        }}
                        className={fieldErrors.time ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {fieldErrors.time && <p className="text-xs text-destructive">{fieldErrors.time}</p>}
                    </div>
                  </div>
                  {isNightTime && (
                    <p className="text-xs text-accent animate-pulse">* Tour nocturno (después de las 21:00)</p>
                  )}

                  {/* Direcciones */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />Dirección de Recogida</label>
                    <Input
                      data-field="pickupAddress"
                      placeholder="Dirección completa de recogida"
                      value={pickupAddress}
                      onChange={(e) => { setPickupAddress(e.target.value); if (fieldErrors.pickupAddress) setFieldErrors(f => { const c={...f}; delete c.pickupAddress; return c }) }}
                      className={fieldErrors.pickupAddress ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {fieldErrors.pickupAddress && <p className="text-xs text-destructive">{fieldErrors.pickupAddress}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />Dirección de Destino (opcional)</label>
                    <Input placeholder="Dirección completa de destino" value={dropoffAddress} onChange={(e) => setDropoffAddress(e.target.value)} />
                  </div>

                  {/* Vuelo (opcional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2"><Plane className="w-4 h-4 text-accent" />Número de Vuelo (opcional)</label>
                    <Input placeholder="AF1234, BA456, etc." value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
                  </div>

                  {/* Equipaje */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <label className="text-sm font-medium flex items-center gap-2"><Luggage className="w-4 h-4 text-accent" />Equipaje</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-medium"># Maletas 23kg</label>
                        <Input type="number" min={0} max={10} value={luggage23kg} onChange={(e) => setLuggage23kg(Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium"># Maletas 10kg</label>
                        <Input type="number" min={0} max={10} value={luggage10kg} onChange={(e) => setLuggage10kg(Number(e.target.value))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Carritos de bebé</label>
                      <Input type="number" min={0} max={5} value={babyStrollers} onChange={(e) => setBabyStrollers(Number(e.target.value))} />
                    </div>
                  </div>

                  {/* Edades niños y solicitudes */}
                  <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                    <label className="text-sm font-medium">Edades niños menores de 8 años</label>
                    <Input placeholder="Ej: 3 años, 5 años" value={childrenAges} onChange={(e) => setChildrenAges(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Para sillas de niño o bebé que se requieran (sin costo adicional)</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Solicitudes Especiales</label>
                    <Input placeholder="Asiento para bebé, parada adicional, etc." value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
                  </div>

                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-accent">{Number.isNaN(Number(cmsTotal)) ? "…€" : `${cmsTotal}€`}</span>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90" size="lg" onClick={submitCmsBooking}>
                    Ver pago y confirmar
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">El depósito para tours en efectivo es del 10%.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const calculatePrice = () => {
    // Si hay pricingOptions seleccionada y es tour-paris, la usamos como base pero añadimos recargo por pasajeros extra.
    // En otros tours (no paris) se mantiene como total directo.
    if (selectedPricingOption && effectiveTourId !== "tour-paris") return selectedPricingOption.price
    if (effectiveTourId === "tour-paris") {
      // Nuevo: precio dinámico según cantidad de pasajeros.
      // Asunción (documentada):
      //  - El precio base por hora (diurno/nocturno) cubre hasta 4 pasajeros.
      //  - A partir del 5º pasajero se cobra un recargo por pasajero y por hora.
      //  - Recargo diurno: +10€/h por pasajero extra; Recargo nocturno: +12€/h por pasajero extra.
      //  - Esto facilita ampliar en el futuro simplemente ajustando constantes.
      // Si hay opción seleccionada con horas definidas la respetamos como precio base total, ignorando tourHours para base,
      // pero seguimos añadiendo recargos de pasajeros por hora real seleccionada (op.hours si existe, si no tourHours).
      const hourlyRate = (isNightTime ? tour.basePriceNight : tour.basePriceDay) ?? 0
      const baseIncluded = 4
      const extraPerPassenger = isNightTime ? 12 : 10
      const extraPassengers = Math.max(0, passengers - baseIncluded)
      const hoursToUse = selectedPricingOption?.hours ? selectedPricingOption.hours : tourHours
      const recargoExtra = extraPassengers * extraPerPassenger * hoursToUse
      if (selectedPricingOption) {
        return selectedPricingOption.price + recargoExtra
      }
      const hourlyTotal = hourlyRate + extraPassengers * extraPerPassenger
      return hourlyTotal * hoursToUse
    }

    if (effectiveTourId === "paris-dl-dl") {
      if (!routeOption) return NaN
      let base = NaN
      if (passengers >= 1 && passengers <= 4) {
        const map = tour.pricingP4
        if (!map) return NaN
        const val = routeOption === "threeH" ? map.threeH : routeOption === "twoH" ? map.twoH : map.eiffelArco
        base = typeof val === 'number' ? val : NaN
      } else if (passengers === 5) {
        const map = tour.pricingP5
        if (!map) return NaN
        const val = routeOption === "threeH" ? map.threeH : routeOption === "twoH" ? map.twoH : map.eiffelArco
        base = typeof val === 'number' ? val : NaN
      }
      const nightFee = isNightTime ? 5 : 0
      const extraLugg = Number(luggage23kg || 0) > 3
      const luggageFee = extraLugg ? 10 : 0
      return Number(base) + nightFee + luggageFee
    }

    const getBaseFromPricing = (): number | undefined => {
      const p: any = (tour as any)?.pricing
      if (Array.isArray(p)) {
        const found = p.find((x: any) => x && Number(x.pax) === Number(passengers))
        if (found && typeof found.price === 'number') return found.price
        return undefined
      }
      if (p && typeof p === 'object') {
        const val = (p as Record<string, number>)[String(passengers)]
        if (typeof val === 'number') return val
      }
      return undefined
    }
    let base = getBaseFromPricing()
    if (typeof base !== 'number') base = (tour as any)?.basePrice ?? 0
    let total = base || 0
    if (isNightTime) total += 5
    if (extraLuggage) total += 10
    return total
  }

  const handleTimeChange = (value: string) => {
    setTime(value)
    const hour = Number.parseInt(value.split(":")[0])
    setIsNightTime(hour >= 21 || hour < 6)
  }

  const handleBookingSubmit = () => {
    const newErrors: Record<string, string> = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!contactName.trim()) newErrors.contactName = 'Requerido'
    if (!contactPhone.trim()) newErrors.contactPhone = 'Requerido'
    if (!contactEmail.trim()) newErrors.contactEmail = 'Requerido'
    else if (!emailRegex.test(contactEmail.trim())) newErrors.contactEmail = 'Email inválido'
    if (!date) newErrors.date = 'Requerido'
    if (!time) newErrors.time = 'Requerido'
    if (!pickupAddress.trim()) newErrors.pickupAddress = 'Requerido'
    if (passengers < 1) newErrors.passengers = 'Debe ser ≥1'
    if (effectiveTourId !== 'tour-paris' && effectiveTourId !== 'paris-dl-dl' && !dropoffAddress.trim()) newErrors.dropoffAddress = 'Requerido'
    if (effectiveTourId === 'tour-paris' && tourHours < 2) newErrors.tourHours = 'Mínimo 2'
    if (effectiveTourId === 'paris-dl-dl' && !routeOption) newErrors.routeOption = 'Seleccione una opción'

    setFieldErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0]
      try { document.querySelector<HTMLElement>(`[data-field="${firstKey}"]`)?.focus() } catch {}
      return
    }
    const bookingData = {
      tourId,
      passengers,
      date,
      time,
      pickupAddress,
      dropoffAddress,
      flightNumber,
      luggage23kg,
      luggage10kg,
      babyStrollers,
      childrenAges,
  tourHours: tourId === "tour-paris" ? tourHours : undefined,
  routeOption: effectiveTourId === "paris-dl-dl" ? routeOption : undefined,
      specialRequests,
      contactName,
      contactPhone,
      contactEmail,
      totalPrice: calculatePrice(),
      isNightTime,
      extraLuggage,
      selectedPricingOption: selectedPricingOption ? { label: selectedPricingOption.label, price: selectedPricingOption.price, hours: selectedPricingOption.hours } : undefined,
    }

    localStorage.setItem("bookingData", JSON.stringify(bookingData))
    router.push("/pago")
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-10">
        {/* Back Button */}
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a servicios
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 py-3">
          {/* Tour Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Galería con carrusel + lightbox */}
            <div className="relative rounded-lg overflow-hidden">
              <Carousel className="soft-fade-in">
                <CarouselContent className="">
                  {galleryImages.map((src, idx) => (
                    <CarouselItem key={idx} className="md:basis-1/1 lg:basis-1/1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            aria-label="Ampliar imagen"
                            className="relative group block w-full h-64 md:h-96 overflow-hidden"
                          >
                            <img
                              src={src}
                              alt={`${tour.title} - imagen ${idx + 1}`}
                              className="w-full h-full object-cover transition-opacity duration-500 opacity-0 group-[data-state=open]:opacity-100"
                              onLoad={(e) => {
                                // fade-in suave al cargar
                                e.currentTarget.classList.remove("opacity-0")
                                e.currentTarget.classList.add("opacity-100")
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                          <div className="relative w-full h-[70vh]">
                            <img
                              src={src}
                              alt={`${tour.title} - ampliada ${idx + 1}`}
                              className="w-full h-full object-contain soft-fade-in"
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-3 md:left-4 size-10 md:size-12 bg-black/50 text-white hover:bg-black/70 border-white/20 shadow-lg z-20" />
                <CarouselNext className="right-3 md:right-4 size-10 md:size-12 bg-black/50 text-white hover:bg-black/70 border-white/20 shadow-lg z-20" />
              </Carousel>

              <div className="absolute top-4 left-4">
                <Badge className="bg-accent text-accent-foreground animate-pulse">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>

            {/* Tour Details */}
            <Card className="transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-3xl text-primary soft-fade-in">{tour.title}</CardTitle>
                <div className="flex items-center gap-6 text-muted-foreground soft-fade-in animation-delay-200">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tour.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                      {effectiveTourId === "tour-paris" ? (
                      <span>
                        Diurno {tour.basePriceDay}€/h - Nocturno {tour.basePriceNight}€/h
                      </span>
                      ) : effectiveTourId === "paris-dl-dl" ? (
                        <span>Desde 200€</span>
                      ) : (
                      <span>Desde {tour.basePrice}€</span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-6 text-pretty soft-fade-in animation-delay-400">
                  {tour.description}
                </p>

                {Array.isArray((tour as any).pricingOptions) && (tour as any).pricingOptions.length > 0 && (
                  <div className="mb-8 soft-fade-in">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Selecciona una Opción / Tarifa</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {(tour as any).pricingOptions.map((op: any, idx: number) => {
                        const active = selectedPricingOption?.label === op.label && selectedPricingOption?.price === op.price
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPricingOption({ label: op.label, price: op.price, hours: op.hours })}
                            className={`text-left p-4 rounded-lg border transition-all duration-300 hover:shadow-sm hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${active ? 'border-accent bg-accent/10 shadow-inner' : 'border-border bg-muted/30'}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm flex items-center gap-2">
                                {op.label}{op.hours ? ` (${op.hours}h)` : ''}
                                {active && (
                                  <Badge className="bg-accent text-accent-foreground animate-pulse">Seleccionado</Badge>
                                )}
                              </span>
                              <Badge className={active ? 'bg-accent text-accent-foreground' : 'bg-primary/80'}>{op.price}€</Badge>
                            </div>
                            {op.description && <p className="text-xs text-muted-foreground leading-snug">{op.description}</p>}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">La selección ajustará el total mostrado. Puedes modificarla en cualquier momento.</p>
                    {selectedPricingOption && (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => setSelectedPricingOption(null)}
                        >
                          Quitar selección
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Características del Servicio</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(tour.features || []).map((feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 soft-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Included */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">Incluido en el Precio</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(tour.included || []).map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 soft-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Shield className="w-4 h-4 text-accent" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {Array.isArray((tour as any).amenities) && (tour as any).amenities.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Comodidades del Vehículo</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {(tour as any).amenities.map((am: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 soft-fade-in"
                          style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                          <Car className="w-4 h-4 text-accent" />
                          <span className="text-sm">{am}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Array.isArray((tour as any).pricingOptions) && (tour as any).pricingOptions.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-primary">Opciones y Tarifas</h3>
                    <div className="space-y-3">
                      {(tour as any).pricingOptions.map((op: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 soft-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{op.label}{op.hours ? ` (${op.hours}h)` : ''}</span>
                            {op.description && <span className="text-xs text-muted-foreground">{op.description}</span>}
                          </div>
                          <Badge className="bg-accent text-accent-foreground">{op.price}€</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Comodidades del Vehículo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Wifi className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">WiFi Gratuito</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Coffee className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">Agua de Cortesía</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Car className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">Vehículo Cómodo</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">Seguro Completo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tarifas y Tours personalizados - tour de París y primera tarjeta dedicada */}
            {effectiveTourId === "tour-paris" && (
              <Card className="transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Tarifas y Tours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm md:text-base">
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Tarifas Tour: hasta 4 pasajeros</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="dl-dl-4">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">300€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">245€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">200€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="dl-air-4">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">270€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">235€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">180€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="air-dl-4">
                        <AccordionTrigger>Aeropuerto CDG u Orly ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">270€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">235€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">180€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-center-4">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Hôtel París o centro</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">160€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">130€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-air-4">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">210€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">160€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p>El tiempo de tour cuenta desde el momento que estamos en el primer lugar emblemático de París.</p>
                    <p>La hora adicional tiene un valor de 55€.</p>
                    <p>
                      En cada uno de los lugares que visitamos pueden bajar del vehículo por 15 min para tomar fotos y conocer
                      un poco el lugar.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Tour de 3 horas – lugares visitados</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Iglesia del Sagrado Corazón (Montmartre) ⛪</li>
                        <li>Cafetería de Ladybug 🐞</li>
                        <li>Molino Rojo</li>
                        <li>Museo de Louvre 🔼</li>
                        <li>Notre Dame de París ⛪</li>
                        <li>Campos Elíseos y Arco del triunfo ⛩🌅</li>
                        <li>Trocadero 🏛</li>
                        <li>Torre Eiffel 🗼</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Tour de 2 horas – lugares visitados</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Museo de Louvre 🔼</li>
                        <li>Campos Elíseos y Arco del triunfo ⛩🌅</li>
                        <li>Trocadero 🏛</li>
                        <li>Torre Eiffel 🗼</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Tarifas Tour: hasta 5 pasajeros</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="dl-dl">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">340€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">315€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">245€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="dl-air">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">320€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">300€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">230€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="air-dl">
                        <AccordionTrigger>Aeropuerto CDG u Orly ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">320€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">300€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">230€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-center">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Hôtel París o centro</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">190€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">145€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-air">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">230€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">210€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p>El tiempo de tour cuenta desde el momento que estamos en el primer lugar emblemático de París.</p>
                    <p>La hora adicional tiene un valor de 55€.</p>
                    <p>
                      En cada uno de los lugares que visitamos pueden bajar del vehículo por 15 min para tomar fotos y conocer
                      un poco el lugar.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-primary">Tour Versailles</h3>
                    <p>
                      Tiene un costo mínimo de <span className="font-semibold">290€</span> hasta 3 personas, persona adicional
                      tiene un valor de <span className="font-semibold">90€</span>.
                    </p>
                    <div>
                      <p className="font-medium">Incluye:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Transporte de ida y regreso a su hotel en París.</li>
                        <li>Acompañamiento durante todo el recorrido (6h en promedio).</li>
                        <li>Entrada a todo el dominio de Versailles (Castillo, jardines, Trianon de María Antonieta y aldea de la reina).</li>
                        <li>Transporte de ida y regreso a su hotel en París.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium">En los traslados colocar:</p>
                    <p>Origen o Destino:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <span className="font-semibold">Versailles:</span> 65€ hasta 4 pasajeros. Después aumenta 10€ cada
                        pasajero. Valor desde París.
                      </li>
                      <li>
                        <span className="font-semibold">Parque Asterix:</span> 70€ desde Paris o aeropuerto Orly. Persona adicional
                        +17€.
                      </li>
                      <li>
                        <span className="font-semibold">Casa de Monet (Giverny):</span> 100€ desde París. Hasta 4 pasajeros, persona
                        adicional 12€.
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-primary">Tour Brujas</h3>
                    <p>
                      Tiene un costo mínimo de <span className="font-semibold">520€</span> hasta 3 pasajeros. A partir del 4º
                      pasajero el valor sería de <span className="font-semibold">140€</span> por pasajero.
                    </p>
                    <div>
                      <p className="font-medium">Incluye:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Transporte de ida y regreso a su hotel en París*</li>
                        <li>Guía en la ciudad por 2 horas.</li>
                        <li>Degustación de chocolates 🍫</li>
                        <li>Recomendaciones para comer y tomar una cerveza 🍺</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Itinerario Tour Brujas:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Recogida pasajeros en París 6:30am a 7:00am</li>
                        <li>Salida de París hacia Brujas 6:45 a 7:15</li>
                        <li>Parada desayuno: 8:30am</li>
                        <li>Retoma de trayecto hacia Brujas: 9:00am</li>
                        <li>Llegada a Brujas: 11:00am</li>
                        <li>Encuentro con el guía 11:30am (Recorrido 2 horas)</li>
                        <li>Visita libre por la ciudad de Brujas: 13:30 a 17:30</li>
                        <li>Si el cliente no quiere guía se resta 10€ por persona</li>
                      </ol>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-primary">Transporte Brujas y Amsterdam</h3>
                    <p>
                      <span className="font-semibold">1.100€</span>
                    </p>
                    <div>
                      <p className="font-medium">Incluye:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Transporte desde París hasta Amsterdam, con escala intermedia de una noche en Brujas (Bélgica).</li>
                        <li>
                          Hospedaje del conductor a cargo del cliente y comidas a cargo del cliente, tarifa hasta grupo de 5 personas.
                          Valor por Van de 8 personas: <span className="font-semibold">1450€</span>.
                        </li>
                      </ul>
                    </div>
                    <p className="text-muted-foreground">
                      En este tour de Amsterdam, es mejor priorizar el contacto directo con nosotros para coordinar detalles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {effectiveTourId === "paris-dl-dl" && (
              <Card className="transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Opciones y Tarifas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm md:text-base">
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Tarifas según número de pasajeros:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-primary mb-1">Hasta 4 pasajeros</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Paris Tour (3h): <span className="font-semibold">300€</span></li>
                          <li>Paris Tour (2h): <span className="font-semibold">245€</span></li>
                          <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">200€</span></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-primary mb-1">Hasta 5 pasajeros</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Paris Tour (3h): <span className="font-semibold">340€</span></li>
                          <li>Paris Tour (2h): <span className="font-semibold">315€</span></li>
                          <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">245€</span></li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Para más de 5 pasajeros, consultar por Van (8p).</p>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Qué visitamos</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Museo del Louvre</li>
                        <li>Campos Elíseos y Arco del Triunfo</li>
                        <li>Trocadero</li>
                        <li>Torre Eiffel</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Notas</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Paradas de 15 min para fotos</li>
                        <li>Itinerario ajustable según tráfico</li>
                        <li>Servicio privado puerta a puerta</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary text-center">Reservar Ahora</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent animate-pulse">{Number.isNaN(calculatePrice()) ? "…€" : `${calculatePrice()}€`}</div>
                  <p className="text-sm text-muted-foreground">
                    {effectiveTourId === "tour-paris" ? `por ${tourHours} hora${tourHours > 1 ? "s" : ""}` : "por trayecto"}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Information Fields */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Phone className="w-4 h-4 text-accent" />
                    Información de Contacto
                  </h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre Completo</label>
                    <Input
                      data-field="contactName"
                      placeholder="Tu nombre completo"
                      value={contactName}
                      onChange={(e) => { setContactName(e.target.value); if (fieldErrors.contactName) setFieldErrors(f => { const c={...f}; delete c.contactName; return c }) }}
                      className={(fieldErrors.contactName ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                    />
                    {fieldErrors.contactName && <p className="text-xs text-destructive">{fieldErrors.contactName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Teléfono</label>
                      <Input
                        data-field="contactPhone"
                        placeholder="+33 1 23 45 67 89"
                        value={contactPhone}
                        onChange={(e) => { setContactPhone(ensureLeadingPlus(e.target.value)); if (fieldErrors.contactPhone) setFieldErrors(f => { const c={...f}; delete c.contactPhone; return c }) }}
                        onBlur={(e) => setContactPhone(formatPhonePretty(ensureLeadingPlus(e.target.value)))}
                        className={(fieldErrors.contactPhone ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                      />
                      {fieldErrors.contactPhone && <p className="text-xs text-destructive">{fieldErrors.contactPhone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        data-field="contactEmail"
                        type="email"
                        placeholder="tu@email.com"
                        value={contactEmail}
                        onChange={(e) => { setContactEmail(e.target.value); if (fieldErrors.contactEmail) setFieldErrors(f => { const c={...f}; delete c.contactEmail; return c }) }}
                        className={(fieldErrors.contactEmail ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                      />
                      {fieldErrors.contactEmail && <p className="text-xs text-destructive">{fieldErrors.contactEmail}</p>}
                    </div>
                  </div>
                </div>

                {/* Number of Passengers */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Número de Pasajeros
                  </label>
                  <Input
                    data-field="passengers"
                    type="number"
                    min="1"
                    max={effectiveTourId === "paris-dl-dl" ? 5 : 8}
                    value={passengers}
                    onChange={(e) => { setPassengers(Number(e.target.value)); if (fieldErrors.passengers) setFieldErrors(f => { const c={...f}; delete c.passengers; return c }) }}
                    className={(fieldErrors.passengers ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                  />
                  {fieldErrors.passengers && <p className="text-xs text-destructive">{fieldErrors.passengers}</p>}
                </div>

                {effectiveTourId === "paris-dl-dl" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Opción de Tour
                    </label>
                    <div className="max-w-xs">
                      <Select value={routeOption} onValueChange={(v: any) => { setRouteOption(v); if (fieldErrors.routeOption) setFieldErrors(f => { const c={...f}; delete c.routeOption; return c }) }}>
                        <SelectTrigger className={"w-full " + (fieldErrors.routeOption ? 'border-destructive focus-visible:ring-destructive' : '')}>
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="threeH">Paris Tour (3h)</SelectItem>
                          <SelectItem value="twoH">Paris Tour (2h)</SelectItem>
                          <SelectItem value="eiffelArco">Torre Eiffel + Arco del Triunfo</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldErrors.routeOption && <p className="text-xs text-destructive">{fieldErrors.routeOption}</p>}
                    </div>
                  </div>
                )}

                {effectiveTourId === "tour-paris" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Duración del Tour (mínimo 2 horas)
                    </label>
                    <Input
                      data-field="tourHours"
                      type="number"
                      min="2"
                      max="12"
                      value={tourHours}
                      onChange={(e) => { setTourHours(Number(e.target.value)); if (fieldErrors.tourHours) setFieldErrors(f => { const c={...f}; delete c.tourHours; return c }) }}
                      className={(fieldErrors.tourHours ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                    />
                    {fieldErrors.tourHours && <p className="text-xs text-destructive">{fieldErrors.tourHours}</p>}
                  </div>
                )}

                {/* Date of Travel */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    Fecha del Viaje
                  </label>
                  <Input
                    data-field="date"
                    type="date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); if (fieldErrors.date) setFieldErrors(f => { const c={...f}; delete c.date; return c }) }}
                    min={new Date().toISOString().split("T")[0]}
                    className={(fieldErrors.date ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                  />
                  {fieldErrors.date && <p className="text-xs text-destructive">{fieldErrors.date}</p>}
                </div>

                {/* Time of Pickup */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    Hora de Recogida
                  </label>
                  <Input
                    data-field="time"
                    type="time"
                    value={time}
                    onChange={(e) => { handleTimeChange(e.target.value); if (fieldErrors.time) setFieldErrors(f => { const c={...f}; delete c.time; return c }) }}
                    className={(fieldErrors.time ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                  />
                  {fieldErrors.time && <p className="text-xs text-destructive">{fieldErrors.time}</p>}
                  {isNightTime && effectiveTourId !== "tour-paris" && (
                    <p className="text-xs text-accent animate-pulse">* Recargo nocturno: +5€ (después de las 21:00)</p>
                  )}
                  {isNightTime && effectiveTourId === "tour-paris" && (
                    <p className="text-xs text-accent animate-pulse">
                      * Tour nocturno: {tour.basePriceNight}€/h (después de las 21:00)
                    </p>
                  )}
                </div>

                {/* Pickup Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Dirección de Recogida
                  </label>
                  <Input
                    data-field="pickupAddress"
                    placeholder="Dirección completa de recogida"
                    value={pickupAddress}
                    onChange={(e) => { setPickupAddress(e.target.value); if (fieldErrors.pickupAddress) setFieldErrors(f => { const c={...f}; delete c.pickupAddress; return c }) }}
                    className={(fieldErrors.pickupAddress ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                  />
                  {fieldErrors.pickupAddress && <p className="text-xs text-destructive">{fieldErrors.pickupAddress}</p>}
                </div>

                {/* Dropoff Address */}
                {effectiveTourId !== "tour-paris" && effectiveTourId !== "paris-dl-dl" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      Dirección de Destino
                    </label>
                    <Input
                      data-field="dropoffAddress"
                      placeholder="Dirección completa de destino"
                      value={dropoffAddress}
                      onChange={(e) => { setDropoffAddress(e.target.value); if (fieldErrors.dropoffAddress) setFieldErrors(f => { const c={...f}; delete c.dropoffAddress; return c }) }}
                      className={(fieldErrors.dropoffAddress ? 'border-destructive focus-visible:ring-destructive ' : '') + 'transform focus:scale-105 transition-all duration-300'}
                    />
                    {fieldErrors.dropoffAddress && <p className="text-xs text-destructive">{fieldErrors.dropoffAddress}</p>}
                  </div>
                )}

                {/* Flight Number */}
                {(effectiveTourId.includes("cdg") || effectiveTourId.includes("orly") || effectiveTourId.includes("beauvais")) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Plane className="w-4 h-4 text-accent" />
                      Número de Vuelo (Opcional)
                    </label>
                    <Input
                      placeholder="AF1234, BA456, etc."
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                )}

                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-accent" />
                    Equipaje
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium"># Maletas 23kg</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={luggage23kg}
                        onChange={(e) => setLuggage23kg(Number(e.target.value))}
                        className="transform focus:scale-105 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium"># Maletas 10kg</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={luggage10kg}
                        onChange={(e) => setLuggage10kg(Number(e.target.value))}
                        className="transform focus:scale-105 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">Carritos de bebé</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={babyStrollers}
                      onChange={(e) => setBabyStrollers(Number(e.target.value))}
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <label className="text-sm font-medium">Edades niños menores de 8 años</label>
                  <Input
                    placeholder="Ej: 3 años, 5 años"
                    value={childrenAges}
                    onChange={(e) => setChildrenAges(e.target.value)}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para sillas de niño o bebé que se requieran (sin costo adicional)
                  </p>
                </div>

                {/* Additional Services */}
                {effectiveTourId !== "tour-paris" && effectiveTourId !== "paris-dl-dl" && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Servicios Adicionales</label>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={extraLuggage}
                          onChange={(e) => setExtraLuggage(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm">Equipaje voluminoso (+10€)</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Solicitudes Especiales</label>
                  <Input
                    placeholder="Asiento para bebé, parada adicional, etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  {selectedPricingOption ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Opción seleccionada</span>
                        <span>{selectedPricingOption.label}{selectedPricingOption.hours ? ` (${selectedPricingOption.hours}h)` : ''}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Precio</span>
                        <span>{selectedPricingOption.price}€</span>
                      </div>
                      {effectiveTourId === "tour-paris" && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Pasajeros</span>
                            <span>{passengers}</span>
                          </div>
                          {passengers > 4 && (
                            <div className="flex justify-between text-sm text-accent">
                              <span>Recargo pasajeros extra</span>
                              <span>
                                {(() => {
                                  const extraPerPassenger = isNightTime ? 12 : 10
                                  const extraPassengers = Math.max(0, passengers - 4)
                                  const hoursToUse = selectedPricingOption?.hours ? selectedPricingOption.hours : tourHours
                                  return `+${extraPerPassenger * extraPassengers * hoursToUse}€`
                                })()}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : effectiveTourId === "tour-paris" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Precio por hora ({isNightTime ? "nocturno" : "diurno"})</span>
                        <span>{isNightTime ? tour.basePriceNight : tour.basePriceDay}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duración</span>
                        <span>
                          {tourHours} hora{tourHours > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pasajeros</span>
                        <span>{passengers}</span>
                      </div>
                      {passengers > 4 && (
                        <div className="flex justify-between text-sm text-accent">
                          <span>Recargo pasajeros extra</span>
                          <span>
                            {(() => {
                              const extraPerPassenger = isNightTime ? 12 : 10
                              const extraPassengers = Math.max(0, passengers - 4)
                              return `+${extraPerPassenger * extraPassengers * tourHours}€`
                            })()}
                          </span>
                        </div>
                      )}
                    </>
                  ) : effectiveTourId === "paris-dl-dl" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Opción</span>
                        <span>
                          {!routeOption
                            ? "Selecciona"
                            : routeOption === "threeH"
                              ? "Paris Tour (3h)"
                              : routeOption === "twoH"
                                ? "Paris Tour (2h)"
                                : "Torre Eiffel + Arco"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pasajeros</span>
                        <span>{passengers <= 5 ? `${passengers}` : "Consultar"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Precio base ({passengers} pax)</span>
                        <span>
                          {(() => {
                            const p: any = (tour as any)?.pricing
                            if (Array.isArray(p)) {
                              const found = p.find((x: any) => x && Number(x.pax) === Number(passengers))
                              return `${typeof found?.price === 'number' ? found.price : ((tour as any)?.basePrice ?? 0)}€`
                            }
                            const val = p?.[passengers]
                            return `${typeof val === 'number' ? val : ((tour as any)?.basePrice ?? 0)}€`
                          })()}
                        </span>
                      </div>
                      {isNightTime && (
                        <div className="flex justify-between text-sm">
                          <span>Recargo nocturno</span>
                          <span>+5€</span>
                        </div>
                      )}
                      {extraLuggage && (
                        <div className="flex justify-between text-sm">
                          <span>Equipaje extra</span>
                          <span>+10€</span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-accent animate-pulse">{Number.isNaN(calculatePrice()) ? "…€" : `${calculatePrice()}€`}</span>
                  </div>
                </div>

                {/* Proceed to Payment Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300"
                  size="lg"
                  onClick={handleBookingSubmit}
                >
                  Proceder al Pago
                </Button>

                {/* Cancelation Policy */}
                <p className="text-xs text-muted-foreground text-center">
                  Cancelación gratuita hasta 24 horas antes del viaje
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
