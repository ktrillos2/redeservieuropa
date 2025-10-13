"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, Star, Ticket } from "lucide-react"
import Link from "next/link"
import { AnimatedSection } from "@/components/animated-section"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useEffect, useRef } from "react"

// ---------- NUEVO: tipo que recibimos desde el servidor ----------
export type ServiceCard = {
  id: string
  title: string
  desc?: string
  price?: string
  link: string
  note?: string
  image?: string
  popular?: boolean
  // opcional: icon si quieres personalizar por tour
}

// ---------- NUEVO: ahora Services recibe cards por props ----------
export function Services({ cards }: { cards: ServiceCard[] }) {
  const carouselContainerRef = useRef<HTMLDivElement | null>(null)

  // Autoplay básico: avanza cada 4s, pausa on-hover
  useEffect(() => {
    const container = carouselContainerRef.current
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
    <section id="servicios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="bounce-in" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance font-display">Nuestros Tours</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Traslados cómodos con la máxima comodidad y puntualidad. Tarifas transparentes y servicio excepcional.
          </p>
        </AnimatedSection>

        <div ref={carouselContainerRef}>
          <Carousel opts={{ align: "start", loop: true }} className="relative !overflow-none">
            <CarouselContent className="py-6">
              {cards.map((c, idx) => (
                <CarouselItem key={c.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <AnimatedSection animation="zoom-in" delay={idx * 100}>
                    <Card className={`relative transition-all duration-500 hover-lift hover-glow ${c.popular ? "border-2 border-accent/60" : ""}`}>
  {c.popular && (
    <Badge className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-accent text-white z-10 font-medium">
      <Star className="w-3 h-3 mr-1" /> Popular
    </Badge>
  )}

  <CardHeader className="pb-3">
    <div className="flex items-start justify-between">
      <MapPin className="w-6 h-6 text-accent mt-1" />
      <div className="text-right text-2xl font-bold text-primary">
        {c.price ?? ''}
      </div>
    </div>
    <CardTitle className="text-xl text-primary font-display leading-tight">{c.title}</CardTitle>
    {c.desc && <p className="text-muted-foreground text-sm">{c.desc}</p>}
  </CardHeader>

  <CardContent className="space-y-3 text-sm">
    {/* Línea adicional encima del botón (opcional) */}
    {c.note && (
      <p className="text-muted-foreground">
        {c.note}
      </p>
    )}

    <Link href={c.link}>
      <Button className="w-full bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300">
        Ver Detalles y Reservar
      </Button>
    </Link>
  </CardContent>
</Card>

                  </AnimatedSection>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-6" />
            <CarouselNext className="-right-6" />
          </Carousel>
        </div>

        {/* Sub-sección: Cotiza a tu gusto */}
        <AnimatedSection animation="zoom-in" delay={400} className="mt-8">
          <Card className="relative transition-all duration-500 hover-lift hover-glow">
            <CardHeader>
              <CardTitle className="text-center text-primary font-display">Cotiza a tu gusto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Traslados punto A → punto B */}
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-accent" />
                      <div>
                        <h4 className="font-medium text-primary">Traslados punto A → punto B</h4>
                        <p className="text-xs text-muted-foreground">Popular: De aeropuertos a la ciudad o Disneyland</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={(() => {
                        const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "")
                        const text = encodeURIComponent(
                          [
                            "Hola, quiero cotizar un traslado punto A → punto B.",
                            "• Tipo: Aeropuerto ↔ Ciudad/Disneyland",
                            "• Pasajeros: __",
                            "• Fecha y hora: __",
                            "• Equipaje 23kg / 10kg: __ / __",
                          ].join("\n")
                        )
                        return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-accent text-accent-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-md">
                        ¡Escríbenos!
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Boletas Disneyland y barquito */}
                <div className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-accent" />
                      <div>
                        <h4 className="font-medium text-primary">Boletas Disneyland y barquito</h4>
                        <p className="text-xs text-muted-foreground">Desde 85€ (Disney) y 15€ por persona (barquito)</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <a
                      href={(() => {
                        const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "")
                        const text = encodeURIComponent(
                          [
                            "Hola, quiero cotizar:",
                            "• Boletas Disneyland (desde 85€)",
                            "• Paseo en barquito (desde 15€ por persona)",
                            "• Fecha estimada: __",
                            "• Número de personas: __",
                          ].join("\n")
                        )
                        return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-accent text-accent-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-md">
                        ¡Escríbenos!
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="zoom-in" delay={600} className="mt-12 text-center">
          <div className="bg-primary p-6 rounded-lg border border-border max-w-4xl mx-auto hover-lift">
            <h3 className="text-lg font-semibold mb-4 text-white font-display">Cargos Adicionales</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span>Recargo nocturno después de las 21h: +5€</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <span>Pasajero adicional: +20€</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Equipaje voluminoso (+3 maletas): +10€</span>
              </div>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-accent" />
                <span>Grupos de 5-8 personas: Tarifas especiales</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
