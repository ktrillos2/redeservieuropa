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

type PricingRules = { baseUpTo4EUR: number }
type PricingTable = { p4?: number; p5?: number; p6?: number; p7?: number; p8?: number; extraFrom9?: number }

interface TourDetailProps {
  tourId: string
  // NUEVO shape desde Sanity (map que te pasé en la page)
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
    startingPriceLabel?: string // "Desde 200 €" si lo quieres mostrar
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
  const router = useRouter()

  // Estado UI
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Galería: para el nuevo esquema usamos solo mainImageUrl (o construimos desde mainImage)
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
    // Fallback local
    const g = (tour as any)?.gallery as string[] | undefined
    return Array.isArray(g) && g.length > 0 ? g : (tour as any)?.image ? [(tour as any).image] : []
  }, [tour, tourFromCms])

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Tour no encontrado</h1>
          <Link href="/"><Button>Volver al inicio</Button></Link>
        </div>
      </div>
    )
  }

  // ============ RAMA CMS (nuevo esquema) ============
  if (tourFromCms) {
    const nightFee = isNightTime ? 5 : 0
    const luggageFee = (Number(luggage23kg || 0) > 3) ? 10 : 0

    const totalCms = (() => {
      const base = computePriceForPax(
        passengers,
        tourFromCms.pricingMode,
        tourFromCms.pricingRules,
        tourFromCms.pricingTable
      ) ?? 0
      return base + nightFee + luggageFee
    })()

    // === TOUR-DETAIL (CMS): función completa para enviar a /pago con tourDoc ===
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
    const firstKey = Object.keys(newErrors)[0]
    try { document.querySelector<HTMLInputElement>(`[data-field="${firstKey}"]`)?.focus() } catch {}
    return
  }

  // Determinar nocturno simple por hora introducida
  const isNight = (() => {
    if (!time) return false
    const [hh] = String(time).split(':').map(Number)
    const h = hh || 0
    return h >= 21 || h < 6
  })()

  // Construir tourDoc con el esquema nuevo
  const tourDoc = {
    _id: tourId,
    title: tourFromCms!.title,
    route: tourFromCms!.route,
    summary: tourFromCms!.summary,
    description: tourFromCms!.description,
    amenities: tourFromCms!.amenities,
    features: tourFromCms!.features,
    includes: tourFromCms!.includes,
    visitedPlaces: tourFromCms!.visitedPlaces,
    notes: tourFromCms!.notes,
    overCapacityNote: tourFromCms!.overCapacityNote,
    pricingMode: tourFromCms!.pricingMode,       // 'rules' | 'table'
    pricingRules: tourFromCms!.pricingRules,     // { baseUpTo4EUR }
    pricingTable: tourFromCms!.pricingTable,     // { p4..p8, extraFrom9 }
    booking: { startingPriceEUR: tourFromCms!.startingPriceEUR },
   isPopular: Boolean(
  (tourFromCms as any)?.isPopular === true ||
  (tourFromCms as any)?.isPopular === 'yes'
),
  }

  // Total inicial (lo recalcularemos en /pago con tourDoc y passengers)
  const initialTotal = 0

  const bookingData: any = {
    quickType: 'tour',
    isTourQuick: true,

    tourId,                     // slug/id del tour
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

    // Tour del CMS (nuevo esquema)
    tourDoc,

    // Flags
    isNightTime: isNight,
    extraLuggage: Number(luggage23kg || 0) > 3,

    // Total inicial
    totalPrice: initialTotal,
  }

  try { localStorage.setItem('bookingData', JSON.stringify(bookingData)) } catch {}

  router.push(`/pago?tour=${encodeURIComponent(tourId)}`)
}

    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 py-10">
          {/* Back */}
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300">
            <ArrowLeft className="w-4 h-4" />
            Volver a servicios
          </Link>

          <div className="grid lg:grid-cols-3 gap-8 py-3">
            {/* Izquierda: info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Galería */}
              <div className="relative rounded-lg overflow-hidden">
                <Carousel className="soft-fade-in">
                  <CarouselContent>
                    {galleryImages.map((src, idx) => (
                      <CarouselItem key={idx}>
                        <Dialog>
                          <DialogTrigger asChild>
                            <button aria-label="Ampliar imagen" className="relative group block w-full h-64 md:h-96 overflow-hidden">
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

                {(tourFromCms.isPopular) && (
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
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{tourFromCms.route.origin} ↔ {tourFromCms.route.destination}</span></div>
                    )}
                    {tourFromCms.startingPriceLabel && (
                      <div className="flex items-center gap-1"><Euro className="w-4 h-4" /><span>{tourFromCms.startingPriceLabel}</span></div>
                    )}
                    {tourFromCms.route?.circuitName && (
                      <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{tourFromCms.route.circuitName}</span></div>
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

              {/* Tarjeta “comodidades” visual (igual diseño) */}
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

            {/* Derecha: reserva */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary text-center">Reservar Ahora</CardTitle>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent animate-pulse">
                      {Number.isNaN(Number(totalCms)) ? "…€" : `${totalCms}€`}
                    </div>
                    <p className="text-sm text-muted-foreground">precio estimado según pasajeros</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contacto */}
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
                      type="number" min={1} max={20}
                      value={passengers}
                      onChange={(e) => { setPassengers(Number(e.target.value)); if (fieldErrors.passengers) setFieldErrors(f => { const c={...f}; delete c.passengers; return c }) }}
                      className={fieldErrors.passengers ? 'border-destructive focus-visible:ring-destructive' : ''}
                    />
                    {fieldErrors.passengers && <p className="text-xs text-destructive">{fieldErrors.passengers}</p>}
                  </div>

                  {/* Fecha/hora */}
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
                          const hh = Number(v.split(":")[0] || 0)
                          setIsNightTime(hh >= 21 || hh < 6)
                          if (fieldErrors.time) setFieldErrors(f => { const c={...f}; delete c.time; return c })
                        }}
                        className={fieldErrors.time ? 'border-destructive focus-visible:ring-destructive' : ''}
                      />
                      {fieldErrors.time && <p className="text-xs text-destructive">{fieldErrors.time}</p>}
                      {isNightTime && <p className="text-xs text-accent animate-pulse">* Recargo nocturno: +5€</p>}
                    </div>
                  </div>

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

                  {/* Vuelo opcional */}
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
                        <Input type="number" min={0} max={20} value={luggage23kg} onChange={(e) => setLuggage23kg(Number(e.target.value))} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium"># Maletas 10kg</label>
                        <Input type="number" min={0} max={20} value={luggage10kg} onChange={(e) => setLuggage10kg(Number(e.target.value))} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Carritos de bebé</label>
                      <Input type="number" min={0} max={5} value={babyStrollers} onChange={(e) => setBabyStrollers(Number(e.target.value))} />
                    </div>
                  </div>

                  {/* Solicitudes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Solicitudes Especiales</label>
                    <Input placeholder="Asiento para bebé, parada adicional, etc." value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
                  </div>

                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-accent">{Number.isNaN(Number(totalCms)) ? "…€" : `${totalCms}€`}</span>
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

  // ========= Fallback (data local antigua) — mantiene TU diseño previo =========
  // … (tu rama antigua tal cual). Si no la necesitas, puedes eliminarla.

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-10">
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300">
          <ArrowLeft className="w-4 h-4" />
          Volver a servicios
        </Link>
        {/* Puedes dejar aquí tu versión legacy si aún la usas */}
        <p className="text-muted-foreground">Este tour no viene del CMS (rama legacy).</p>
      </div>
    </div>
  )
}
