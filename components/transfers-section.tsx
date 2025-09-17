"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, Luggage, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { client } from "@/sanity/lib/client"
import { TRANSFERS_QUERY } from "@/sanity/lib/queries"

const localTransferRoutes = [
  {
    id: 1,
    from: "CDG",
    to: "París",
    price: "65€",
    icon: <Plane className="w-6 h-6" />,
    description: "Aeropuerto Charles de Gaulle",
    duration: "45-60 min",
    popular: true,
  },
  {
    id: 2,
    from: "Orly",
    to: "París",
    price: "60€",
    icon: <Plane className="w-6 h-6" />,
    description: "Aeropuerto de Orly",
    duration: "30-45 min",
    popular: false,
  },
  {
    id: 3,
    from: "Beauvais",
    to: "París",
    price: "125€",
    icon: <Plane className="w-6 h-6" />,
    description: "Aeropuerto Beauvais",
    duration: "75-90 min",
    popular: false,
  },
  {
    id: 4,
    from: "París",
    to: "Disneyland",
    price: "70€",
    icon: <MapPin className="w-6 h-6" />,
    description: "Centro de París a Disneyland",
    duration: "45-60 min",
    popular: true,
  },
  {
    id: 5,
    from: "Orly",
    to: "Disneyland",
    price: "73€",
    icon: <Plane className="w-6 h-6" />,
    description: "Aeropuerto Orly a Disneyland",
    duration: "60-75 min",
    popular: false,
  },
  {
    id: 6,
    from: "Tour",
    to: "Nocturno",
    price: "65€/h",
    icon: <Clock className="w-6 h-6" />,
    description: "Tour nocturno por París (mín. 2h)",
    duration: "2+ horas",
    popular: true,
  },
]

const localAdditionalCharges = [
  { icon: <Clock className="w-5 h-5" />, text: "Recargo nocturno (después 21h)", price: "+5€" },
  { icon: <Luggage className="w-5 h-5" />, text: "Equipaje voluminoso (+3 maletas 23kg)", price: "+10€" },
  { icon: <Users className="w-5 h-5" />, text: "Pasajero adicional", price: "+20€" },
]

export function TransfersSection() {
  const router = useRouter()
  // Captura mínima: la información detallada se pedirá en la página de pago
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await client.fetch(TRANSFERS_QUERY)
        if (!mounted) return
        setData(res)
      } catch (e) {
        console.warn('[TransfersSection] No se pudo cargar transfers desde Sanity, usaré fallback local.', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const parseBasePrice = (price: string) => {
    const m = price.match(/\d+/)
    return m ? Number(m[0]) : 0
  }

  const defaultPassengers = 1

  type Route = { from: string; to: string; price: string; description?: string; duration?: string; popular?: boolean }
  type Charge = { icon?: string; text: string; price: string }
  type Special = { title: string; subtitle?: string; price: string; icon?: string; notes?: string }
  const handleReserve = (route: Route) => {
    const passengers = defaultPassengers
    const base = parseBasePrice(route.price)
    const isHourly = /\/h/.test(route.price) || route.from === "Tour"
    if (isHourly) return
    const total = base

    const bookingData = {
      isEvent: false,
      tourId: `${route.from}-${route.to}`,
      passengers,
      date: "",
      time: "",
      pickupAddress: route.from,
      dropoffAddress: route.to,
      flightNumber: "",
      luggageCount: 0,
      luggage23kg: 0,
      luggage10kg: 0,
      extraLuggage: false,
      isNightTime: false,
      specialRequests: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      basePrice: base,
      totalPrice: total,
    }

    try {
      localStorage.setItem("bookingData", JSON.stringify(bookingData))
      router.push("/pago")
    } catch (e) {
      console.error("No se pudo iniciar la reserva:", e)
    }
  }

  // Autoplay básico para el carrusel de traslados
  const transfersCarouselRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const container = transfersCarouselRef.current
    if (!container) return
    const region = container.querySelector('[role="region"][aria-roledescription="carousel"]') as HTMLElement | null
    if (!region) return

    let timer: number | undefined
    const start = () => {
      stop()
      timer = window.setInterval(() => {
        const nextBtn = region.querySelector('[data-slot="carousel-next"]') as HTMLButtonElement | null
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click()
        } else {
          const prevBtn = region.querySelector('[data-slot="carousel-previous"]') as HTMLButtonElement | null
          prevBtn?.click()
        }
      }, 4000)
    }
    const stop = () => {
      if (timer) window.clearInterval(timer)
      timer = undefined
    }
    const onMouseEnter = () => stop()
    const onMouseLeave = () => start()

    region.addEventListener('mouseenter', onMouseEnter)
    region.addEventListener('mouseleave', onMouseLeave)
    start()

    return () => {
      region.removeEventListener('mouseenter', onMouseEnter)
      region.removeEventListener('mouseleave', onMouseLeave)
      stop()
    }
  }, [])

  const routes: Route[] = useMemo(() => {
    if (data?.routes && Array.isArray(data.routes)) return data.routes
    return localTransferRoutes
  }, [data])

  const charges: Charge[] = useMemo(() => {
    if (data?.extraCharges && Array.isArray(data.extraCharges)) return data.extraCharges
    return localAdditionalCharges
  }, [data])

  const specials: Special[] = useMemo(() => {
    if (data?.specials && Array.isArray(data.specials)) return data.specials
    return [
      { title: 'Versailles', subtitle: 'Desde París. Hasta 4 pax', price: '65€', icon: 'map-pin', notes: '+10€ por pasajero adicional (Versailles)' },
      { title: 'Parque Asterix', subtitle: 'Desde París u Orly', price: '70€', icon: 'plane', notes: '+20€ por persona adicional (Asterix)' },
      { title: 'Casa de Monet (Giverny)', subtitle: 'Desde París · hasta 4 pax', price: '100€', icon: 'map-pin', notes: 'Persona adicional 12€ (Giverny)' },
    ]
  }, [data])

  const sectionTitle = data?.title || 'Nuestros Traslados'
  const sectionSubtitle = data?.subtitle || 'Tarifas transparentes para todos nuestros servicios de transporte premium en París.'
  const footnote = data?.footnote || 'Nota: Para grupos de 5+ pasajeros, se combina la tarifa base + tarifa de vehículo adicional. Ejemplo: 9 pasajeros = Tarifa de 5 + Tarifa de 4 adicionales.'

  return (
    <section id="traslados" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
  <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance font-display">{sectionTitle}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{sectionSubtitle}</p>
        </AnimatedSection>

        {/* Transfer Routes Carousel */}
        <div className="mb-12" ref={transfersCarouselRef}>
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent className="py-6">
              {routes.map((route: Route, index: number) => (
                <CarouselItem key={`${route.from}-${route.to}-${index}`} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <AnimatedSection animation="zoom-in" delay={index * 100}>
                    <Card
                      className={`relative bg-card border-border hover-lift hover-glow h-full flex flex-col ${
                        route.popular ? "border-2 border-accent shadow-lg shadow-accent/20" : ""
                      }`}
                    >
                      {route.popular && (
                        <Badge className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-accent text-white z-10 font-medium">
                          Popular
                        </Badge>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/10 rounded-lg text-accent soft-fade-in animation-delay-200">
                              {/* icono opcional por ahora ignorado para mantener UI */}
                              <Plane className="w-6 h-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg soft-fade-in animation-delay-300">
                                {route.from} → {route.to}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground soft-fade-in animation-delay-400">
                                {route.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{route.price}</div>
                            <p className="text-xs text-muted-foreground">Hasta 4 pasajeros</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1" />

                      {/* Footer fijo abajo con botón */}
                      <div className="mt-auto p-4 pt-0 space-y-3">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{route.duration}</span>
                        </div>
                        {/\/h/.test(route.price) || route.from === "Tour" ? (
                          <Link href="/tour/tour-nocturno" className="block">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-md">
                              Ver detalles y reservar
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            onClick={() => handleReserve(route)}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-md"
                          >
                            Reservar
                          </Button>
                        )}
                      </div>
                    </Card>
                  </AnimatedSection>
                </CarouselItem>) )}
            </CarouselContent>
            <CarouselPrevious className="-left-6" />
            <CarouselNext className="-right-6" />
          </Carousel>
        </div>

        {/* Additional Charges */}
        <Card className="bg-card border-border hover-lift">
          <CardHeader>
            <AnimatedSection animation="fade-up">
              <CardTitle className="text-center text-primary font-display">Cargos Adicionales</CardTitle>
            </AnimatedSection>
          </CardHeader>
          <CardContent>
            <AnimatedSection animation="fade-up" className="grid md:grid-cols-3 gap-4 stagger-animation">
              {charges.map((charge: Charge, index: number) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                  <div className="text-accent animate-pulse"><Euro className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{charge.text}</p>
                  </div>
                  <div className="text-accent font-bold">{charge.price}</div>
                </div>
              ))}
            </AnimatedSection>
            <div className="mt-6 p-4 bg-primary rounded-lg">
              <p className="text-sm text-center text-white">
                <strong>Nota:</strong> {footnote}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traslados Especiales */}
        <Card className="bg-card border-border hover-lift mt-10">
          <CardHeader>
            <AnimatedSection animation="fade-up">
              <CardTitle className="text-center text-primary font-display">Traslados Especiales</CardTitle>
            </AnimatedSection>
          </CardHeader>
          <CardContent>
            <AnimatedSection animation="fade-up" className="grid md:grid-cols-3 gap-4 stagger-animation">
              {specials.map((sp: Special, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                  <div className="text-accent"><MapPin className="w-5 h-5" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sp.title}</p>
                    <p className="text-xs text-muted-foreground">{sp.subtitle}</p>
                  </div>
                  <div className="text-accent font-bold">{sp.price}</div>
                </div>
              ))}
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
              {specials.map((sp: Special, idx: number) => (
                <div key={idx} className="text-center">{sp.notes}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
