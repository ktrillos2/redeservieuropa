"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, Luggage, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const transferRoutes = [
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

const additionalCharges = [
  { icon: <Clock className="w-5 h-5" />, text: "Recargo nocturno (después 21h)", price: "+5€" },
  { icon: <Luggage className="w-5 h-5" />, text: "Equipaje voluminoso (+3 maletas 23kg)", price: "+10€" },
  { icon: <Users className="w-5 h-5" />, text: "Pasajero adicional", price: "+20€" },
]

export function TransfersSection() {
  const router = useRouter()
  // Captura mínima: la información detallada se pedirá en la página de pago

  const parseBasePrice = (price: string) => {
    const m = price.match(/\d+/)
    return m ? Number(m[0]) : 0
  }

  const defaultPassengers = 1

  const handleReserve = (route: (typeof transferRoutes)[number]) => {
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

  return (
    <section id="traslados" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance">Nuestros Traslados</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Tarifas transparentes para todos nuestros servicios de transporte premium en París.
          </p>
        </AnimatedSection>

        {/* Transfer Routes Carousel */}
        <div className="mb-12" ref={transfersCarouselRef}>
          <Carousel opts={{ align: "start", loop: true }}>
            <CarouselContent className="py-6">
              {transferRoutes.map((route, index) => (
                <CarouselItem key={route.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
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
                            <div className="p-2 bg-accent/10 rounded-lg text-accent animate-rotate-in animation-delay-200">
                              {route.icon}
                            </div>
                            <div>
                              <CardTitle className="text-lg animate-slide-in-right animation-delay-300">
                                {route.from} → {route.to}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground animate-fade-in-up animation-delay-400">
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
              <CardTitle className="text-center text-primary">Cargos Adicionales</CardTitle>
            </AnimatedSection>
          </CardHeader>
          <CardContent>
            <AnimatedSection animation="fade-up" className="grid md:grid-cols-3 gap-4 stagger-animation">
              {additionalCharges.map((charge, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                  <div className="text-accent animate-pulse">{charge.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{charge.text}</p>
                  </div>
                  <div className="text-accent font-bold">{charge.price}</div>
                </div>
              ))}
            </AnimatedSection>
            <div className="mt-6 p-4 bg-primary rounded-lg">
              <p className="text-sm text-center text-white">
                <strong>Nota:</strong> Para grupos de 5+ pasajeros, se combina la tarifa base + tarifa de vehículo
                adicional. Ejemplo: 9 pasajeros = Tarifa de 5 + Tarifa de 4 adicionales.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traslados Especiales */}
        <Card className="bg-card border-border hover-lift mt-10">
          <CardHeader>
            <AnimatedSection animation="fade-up">
              <CardTitle className="text-center text-primary">Traslados Especiales</CardTitle>
            </AnimatedSection>
          </CardHeader>
          <CardContent>
            <AnimatedSection animation="fade-up" className="grid md:grid-cols-3 gap-4 stagger-animation">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                <div className="text-accent"><MapPin className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Versailles</p>
                  <p className="text-xs text-muted-foreground">Desde París. Hasta 4 pax</p>
                </div>
                <div className="text-accent font-bold">65€</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                <div className="text-accent"><Plane className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Parque Asterix</p>
                  <p className="text-xs text-muted-foreground">Desde París u Orly</p>
                </div>
                <div className="text-accent font-bold">70€</div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                <div className="text-accent"><MapPin className="w-5 h-5" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Casa de Monet (Giverny)</p>
                  <p className="text-xs text-muted-foreground">Desde París · hasta 4 pax</p>
                </div>
                <div className="text-accent font-bold">100€</div>
              </div>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
              <div className="text-center">+10€ por pasajero adicional (Versailles)</div>
              <div className="text-center">+20€ por persona adicional (Asterix)</div>
              <div className="text-center">Persona adicional 12€ (Giverny)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
