"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { client } from "@/sanity/lib/client"
import { TRANSFERS_LIST_QUERY, TRANSFERS_SECTION_CONTENT_QUERY } from "@/sanity/lib/queries"
import { useTranslation } from "@/contexts/i18n-context"

type Route = {
  from: string
  to: string
  price: string           // Sanity: string como "65€" o "65 €/trayecto"
  description?: string
  duration?: string
  popular?: boolean
  slug?: { current: string }
  icon?: string           // opcional en Sanity (ej. "plane" | "map")
  priceP4?: number
  priceP5?: number
  priceP6?: number
  priceP7?: number
  priceP8?: number
}

type Charge = { icon?: string; text: string; price: string } // solo si lo traes desde Sanity

export function TransfersSection() {
  const router = useRouter()
  const { locale } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [list, setList] = useState<Route[] | null>(null)
  const [content, setContent] = useState<any | null>(null)

  // Traducciones estáticas locales (solo badges y botones)
  const staticTexts = useMemo(() => {
    const texts = {
      es: {
        popular: 'Popular',
        from: 'Desde',
        reserve: 'Reservar',
        additionalCharges: 'Cargos Adicionales',
        note: 'Nota',
        loading: 'Cargando traslados…',
      },
      en: {
        popular: 'Popular',
        from: 'From',
        reserve: 'Book Now',
        additionalCharges: 'Additional Charges',
        note: 'Note',
        loading: 'Loading transfers…',
      },
      fr: {
        popular: 'Populaire',
        from: 'Dès',
        reserve: 'Réserver',
        additionalCharges: 'Frais Supplémentaires',
        note: 'Note',
        loading: 'Chargement des transferts…',
      },
    }
    return texts[locale] || texts.es
  }, [locale])

  // Aplicar traducciones de Sanity según el idioma
  const translatedContent = useMemo(() => {
    if (!content) return null
    if (locale === 'es') return content
    
    const translation = locale === 'en' ? content.translations?.en : content.translations?.fr
    if (!translation) return content
    
    return {
      ...content,
      title: translation.title || content.title,
      subtitle: translation.subtitle || content.subtitle,
      highlight: translation.highlight || content.highlight,
      footnote: translation.footnote || content.footnote,
      extraCharges: translation.extraCharges || content.extraCharges,
    }
  }, [locale, content])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [listRes, contentRes] = await Promise.all([
          client.fetch(TRANSFERS_LIST_QUERY),
          client.fetch(TRANSFERS_SECTION_CONTENT_QUERY),
        ])
        if (!mounted) return
        console.log("[TransfersSection] Datos cargados desde Sanity para locale:", locale)
        console.log("[TransfersSection] Content:", contentRes)
        console.log("[TransfersSection] Translations disponibles:", contentRes?.translations)
        setList(listRes || [])
        setContent(contentRes || null)
      } catch (e) {
        console.warn("[TransfersSection] Error cargando desde Sanity:", e)
        setList([])
        setContent(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [locale])

  const parseBasePrice = (price: string): number => {
    const m = String(price || "").match(/\d+([.,]\d+)?/)
    if (!m) return 0
    return Number(m[0].replace(",", "."))
  }

  const pickIcon = (r: Route) => {
    const key = (r.icon || "").toLowerCase()
    if (key === "plane" || /cdg|orly|beauvais|aeropuerto|airport/i.test(`${r.from} ${r.to} ${r.description}`)) {
      return <Plane className="w-6 h-6" />
    }
    return <MapPin className="w-6 h-6" />
  }

  const routes: Route[] = useMemo(() => {
  if (Array.isArray(list)) {
    return list.map((t: any) => ({
      from: t.from,
      to: t.to,
      price: t.price || `${t.priceP4 || 0}€`,
      description: t.briefInfo || t.description,
      duration: t.duration,
      popular: t.popular,
      slug: t.slug,
      icon: t.icon,

      // ⬇️ trae precios numéricos
      priceP4: t.priceP4,
      priceP5: t.priceP5,
      priceP6: t.priceP6,
      priceP7: t.priceP7,
      priceP8: t.priceP8,
    }))
  }
  return []
}, [list])
  const charges: Charge[] = useMemo(
    () => (translatedContent?.extraCharges && Array.isArray(translatedContent.extraCharges)) ? translatedContent.extraCharges : [],
    [translatedContent]
  )

  const sectionTitle = translatedContent?.title || "Nuestros Traslados"
  const sectionSubtitle = translatedContent?.subtitle || "Traslados privados y puntuales entre aeropuertos, ciudad y destinos especiales."
  const footnote = translatedContent?.footnote || ""

  const handleReserve = (route: Route) => {
  const base = Number(route.priceP4 || 0)   // ⬅️ usa priceP4

  const bookingData = {
    tipoReserva: "traslado",
    quickType: "traslado",
    origen: route.from,
    destino: route.to,
    pickupAddress: route.from,
    dropoffAddress: route.to,
    passengers: 1,
    date: "",
    time: "",
    flightNumber: "",
    luggage23kg: 0,
    luggage10kg: 0,
    extraLuggage: false,
    isNightTime: false,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    basePrice: base,
    totalPrice: base,        // ⬅️ el total real lo recalculas en /pago
  }

  localStorage.setItem("bookingData", JSON.stringify(bookingData))
  router.push("/pago")
}

  // Autoplay básico del carrusel
  const transfersCarouselRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const region = transfersCarouselRef.current?.querySelector(
      '[role="region"][aria-roledescription="carousel"]'
    ) as HTMLElement | null
    if (!region) return

    let timer: number | undefined
    const start = () => {
      stop()
      timer = window.setInterval(() => {
        const nextBtn = region.querySelector('[data-slot="carousel-next"]') as HTMLButtonElement | null
        if (nextBtn && !nextBtn.disabled) nextBtn.click()
        else region.querySelector<HTMLButtonElement>('[data-slot="carousel-previous"]')?.click()
      }, 4000)
    }
    const stop = () => { if (timer) window.clearInterval(timer); timer = undefined }
    const onMouseEnter = () => stop()
    const onMouseLeave = () => start()

    region.addEventListener("mouseenter", onMouseEnter)
    region.addEventListener("mouseleave", onMouseLeave)
    start()
    return () => { region.removeEventListener("mouseenter", onMouseEnter); region.removeEventListener("mouseleave", onMouseLeave); stop() }
  }, [])

  if (loading) {
    return (
      <section id="traslados" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-muted-foreground">{staticTexts.loading}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="traslados" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance font-display">{sectionTitle}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">{sectionSubtitle}</p>
        </AnimatedSection>

        {/* Transfer Routes Carousel (solo Sanity) */}
        {routes.length > 0 && (
          <div className="mb-12" ref={transfersCarouselRef}>
            <Carousel opts={{ align: "start", loop: true }}>
              <CarouselContent className="py-6">
                {routes.map((route, index) => {
                  const basePrice = parseBasePrice(route.price)
                  return (
                    <CarouselItem
                      key={`${route.slug?.current || route.from + "-" + route.to}-${index}`}
                      className="basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <AnimatedSection animation="zoom-in" delay={index * 100}>
                        <Card
                          className={`relative bg-card border-border hover-lift hover-glow h-full flex flex-col ${
                            route.popular ? "border-2 border-accent shadow-lg shadow-accent/20" : ""
                          }`}
                        >
                          {route.popular && (
                            <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-white z-10 font-medium">
                              {staticTexts.popular}
                            </Badge>
                          )}

                          {/* HEADER: icono arriba izq; título+desc debajo; precio arriba der */}
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-3">
                              {/* Izquierda: icono + textos */}
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-accent/10 rounded-lg text-accent soft-fade-in">
                                  {pickIcon(route)}
                                </div>
                                <div>
                                  <CardTitle className="text-lg soft-fade-in">
                                    {route.from} → {route.to}
                                  </CardTitle>
                                  {route.description && (
                                    <p className="text-sm text-muted-foreground soft-fade-in">
                                      {route.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Derecha: precio "Desde X €" */}
                              <div className="text-right leading-tight">
  <div className="text-xs text-muted-foreground">{staticTexts.from}</div>
  <div className="text-2xl font-extrabold text-primary text-nowrap">
    {typeof route.priceP4 === "number" ? `${route.priceP4} €` : "—"}
  </div>
</div>
                            </div>
                          </CardHeader>

                          <CardContent className="flex-1" />

                          {/* Footer fijo con duración + botón reservar */}
                          <div className="mt-auto p-4 pt-0 space-y-3">
                            {route.duration && (
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{route.duration}</span>
                              </div>
                            )}

                            {/* Si tuvieras rutas por hora, podrías enviarlas a una página de tour;
                                aquí los tratamos como traslados normales */}
                            <Button
                              onClick={() => handleReserve(route)}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transform hover:scale-105 transition-all duration-300 hover:shadow-md"
                            >
                              {staticTexts.reserve}
                            </Button>
                          </div>
                        </Card>
                      </AnimatedSection>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="-left-6" />
              <CarouselNext className="-right-6" />
            </Carousel>
          </div>
        )}

        {/* Cargos Adicionales (solo si vienen de Sanity) */}
        {Array.isArray(charges) && charges.length > 0 && (
          <Card className="bg-card border-border hover-lift">
            <CardHeader>
              <AnimatedSection animation="fade-up">
                <CardTitle className="text-center text-primary font-display">{staticTexts.additionalCharges}</CardTitle>
              </AnimatedSection>
            </CardHeader>
            <CardContent>
              <AnimatedSection animation="fade-up" className="grid md:grid-cols-3 gap-4 stagger-animation">
                {charges.map((charge, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                    <div className="text-accent animate-pulse"><Euro className="w-5 h-5" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{charge.text}</p>
                    </div>
                    <div className="text-accent font-bold">{charge.price}</div>
                  </div>
                ))}
              </AnimatedSection>

              {footnote && (
                <div className="mt-6 p-4 bg-primary rounded-lg">
                  <p className="text-sm text-center text-white">
                    <strong>{staticTexts.note}:</strong> {footnote}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}