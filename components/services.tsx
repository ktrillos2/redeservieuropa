"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, Star, Ticket } from "lucide-react"
import Link from "next/link"
import { AnimatedSection } from "@/components/animated-section"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useEffect, useRef, useMemo } from "react"
import { useTranslation } from "@/contexts/i18n-context"
import type { ToursSectionDoc } from "@/sanity/lib/tours"

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
export function Services({ 
  cards, 
  toursSection 
}: { 
  cards: ServiceCard[]
  toursSection: ToursSectionDoc | null
}) {
  const { locale } = useTranslation()
  const carouselContainerRef = useRef<HTMLDivElement | null>(null)

  // Traducciones estáticas locales (solo los badges y botones)
  const staticTexts = useMemo(() => {
    const texts = {
      es: {
        popular: 'Popular',
        viewDetails: 'Ver Detalles y Reservar',
        available: 'Disponible',
      },
      en: {
        popular: 'Popular',
        viewDetails: 'View Details and Book',
        available: 'Available',
      },
      fr: {
        popular: 'Populaire',
        viewDetails: 'Voir Détails et Réserver',
        available: 'Disponible',
      },
    }
    return texts[locale] || texts.es
  }, [locale])

  // Aplicar traducciones de Sanity según el idioma
  const translatedSection = useMemo(() => {
    if (!toursSection) return null
    if (locale === 'es') return toursSection
    
    const translation = locale === 'en' ? toursSection.translations?.en : toursSection.translations?.fr
    if (!translation) return toursSection
    
    return {
      ...toursSection,
      title: translation.title || toursSection.title,
      subtitle: translation.subtitle || toursSection.subtitle,
      customQuote: translation.customQuote ? {
        ...toursSection.customQuote,
        ...translation.customQuote,
        transfers: translation.customQuote.transfers ? {
          ...toursSection.customQuote?.transfers,
          ...translation.customQuote.transfers,
        } : toursSection.customQuote?.transfers,
        tickets: translation.customQuote.tickets ? {
          ...toursSection.customQuote?.tickets,
          ...translation.customQuote.tickets,
        } : toursSection.customQuote?.tickets,
      } : toursSection.customQuote,
      additionalCharges: translation.additionalCharges ? {
        ...toursSection.additionalCharges,
        ...translation.additionalCharges,
      } : toursSection.additionalCharges,
    }
  }, [locale, toursSection])

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
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance font-display">
            {translatedSection?.title || 'Nuestros Tours'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            {translatedSection?.subtitle || 'Traslados cómodos con la máxima comodidad y puntualidad. Tarifas transparentes y servicio excepcional.'}
          </p>
        </AnimatedSection>

        <div ref={carouselContainerRef}>
          <Carousel opts={{ align: "start", loop: true }} className="relative !overflow-none">
            <CarouselContent className="pb-2">
              {cards.map((c, idx) => (
                <CarouselItem key={c.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <AnimatedSection animation="zoom-in" delay={idx * 100}>
                    <Card className={`group relative flex flex-col h-full overflow-hidden transition-all duration-500 hover-lift hover-glow pt-0 gap-0 ${c.popular ? "border-2 border-accent/60" : "border border-border/50 bg-card/50"}`}>
                      {/* Badge Popular */}
                      {c.popular && (
                        <Badge className={`absolute ${c.image ? 'top-4 right-4' : 'top-0 right-0 rounded-bl-lg rounded-tr-none'} bg-accent text-white z-20 font-medium shadow-md border-none px-3 py-1`}>
                          <Star className="w-3 h-3 mr-1 fill-white" /> {staticTexts.popular}
                        </Badge>
                      )}

                      {/* Imagen destacada (si existe) */}
                      {c.image && (
                        <div className="relative h-60 w-full overflow-hidden bg-muted shrink-0">
                          <img 
                            src={c.image} 
                            alt={c.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                          />
                        </div>
                      )}

                      <CardHeader className="pt-6 pb-2">
                        {/* Mostramos el precio siempre en la cabecera para que destaque como "valor" */}
                        <div className="flex items-start justify-between mb-4 gap-2">
                          <Badge variant="outline" className="text-accent border-accent/30 bg-accent/5 px-3 py-1">
                            Tour Exclusivo
                          </Badge>
                          <div className="text-right text-2xl font-bold text-primary shrink-0 drop-shadow-sm">
                            {c.price ?? ''}
                          </div>
                        </div>
                        <CardTitle className="text-xl text-primary font-display leading-snug">{c.title}</CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4 pt-0 mt-auto">
                        {/* Ubicación / Disponibilidad en lugar de la descripción gigante */}
                        {c.note && (
                          <div className="flex items-center text-muted-foreground text-sm py-3 border-t border-border/40 mt-4">
                            <MapPin className="w-4 h-4 text-accent mr-2 shrink-0" />
                            <span className="truncate">{c.note}</span>
                          </div>
                        )}

                        <Link href={c.link} className="block mt-2">
                          <Button className="w-full bg-primary text-white hover:bg-accent hover:text-accent-foreground transform group-hover:scale-[1.02] transition-all duration-300 shadow-md h-12 text-[15px] font-light tracking-wide rounded-sm">
                            {staticTexts.viewDetails}
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
        <AnimatedSection animation="fade-up" delay={400} className="mt-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary font-display mb-4">
                {translatedSection?.customQuote?.title || 'Experiencias a tu Medida'}
              </h2>
              <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-4"></div>
              <p className="text-muted-foreground text-lg">
                Diseñamos tu ruta ideal en París. Cuéntanos qué necesitas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Traslados punto A → punto B */}
              <div className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-500"></div>
                
                <div className="p-8 flex flex-col h-full relative z-10">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="p-4 bg-primary rounded-xl shrink-0 text-accent group-hover:scale-110 transition-transform duration-500 shadow-md">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary mb-2 font-display">
                        {translatedSection?.customQuote?.transfers?.title || 'Traslados Personalizados'}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {translatedSection?.customQuote?.transfers?.subtitle || 'Aeropuertos, estaciones de tren o un viaje directo a la magia de Disneyland.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-border/50">
                    <a
                      href={(() => {
                        const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "")
                        const text = encodeURIComponent(
                          [
                            "Hola, quiero cotizar un traslado personalizado.",
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
                      className="block"
                    >
                      <Button className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 h-14 text-[15px] font-medium tracking-wide">
                        {translatedSection?.customQuote?.transfers?.buttonLabel || 'Solicitar Cotización'}
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Boletas Disneyland y barquito */}
              <div className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 -mt-4 -ml-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-all duration-500"></div>

                <div className="p-8 flex flex-col h-full relative z-10">
                  <div className="flex items-start gap-5 mb-6">
                    <div className="p-4 bg-accent rounded-xl shrink-0 text-white group-hover:scale-110 transition-transform duration-500 shadow-md">
                      <Ticket className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-primary mb-2 font-display">
                        {translatedSection?.customQuote?.tickets?.title || 'Entradas y Atracciones'}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {translatedSection?.customQuote?.tickets?.subtitle || 'Disneyland desde 85€ y paseos en barco por el Sena desde 15€ por persona.'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-border/50">
                    <a
                      href={(() => {
                        const phone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^\d]/g, "")
                        const text = encodeURIComponent(
                          [
                            "Hola, quiero cotizar entradas:",
                            "• Boletas Disneyland",
                            "• Paseo en barco",
                            "• Fecha estimada: __",
                            "• Número de personas: __",
                          ].join("\n")
                        )
                        return phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button className="w-full bg-accent text-white hover:bg-accent/90 transition-colors duration-300 h-14 text-[15px] font-medium tracking-wide shadow-md">
                        {translatedSection?.customQuote?.tickets?.buttonLabel || 'Reservar Entradas'}
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Cargos Adicionales */}
        <AnimatedSection animation="fade-up" delay={600} className="mt-16 mb-8 max-w-4xl mx-auto">
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20 overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="relative bg-card/95 backdrop-blur-xl p-8 md:p-10 rounded-[15px]">
              <div className="flex flex-col items-center mb-8">
                <h3 className="text-2xl font-bold text-primary font-display flex items-center gap-3">
                  <span className="w-8 h-[1px] bg-accent"></span>
                  {translatedSection?.additionalCharges?.title || 'Cargos Adicionales'}
                  <span className="w-8 h-[1px] bg-accent"></span>
                </h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-6 text-[15px] text-muted-foreground">
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover/item:bg-accent/10 transition-colors">
                    <Clock className="w-5 h-5 text-accent" />
                  </div>
                  <span>{translatedSection?.additionalCharges?.nightCharge || 'Recargo nocturno (después de 21h): +5€'}</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover/item:bg-accent/10 transition-colors">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <span>{translatedSection?.additionalCharges?.extraPassenger || 'Pasajero adicional: +20€'}</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover/item:bg-accent/10 transition-colors">
                    <MapPin className="w-5 h-5 text-accent" />
                  </div>
                  <span>{translatedSection?.additionalCharges?.bulkyLuggage || 'Equipaje voluminoso (+3 maletas): +10€'}</span>
                </div>
                <div className="flex items-center gap-4 group/item">
                  <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover/item:bg-accent/10 transition-colors">
                    <Plane className="w-5 h-5 text-accent" />
                  </div>
                  <span>{translatedSection?.additionalCharges?.groupRates || 'Grupos de 5-8 personas: Consultar tarifas'}</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
