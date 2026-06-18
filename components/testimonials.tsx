"use client"
import { AnimatedSection } from "@/components/animated-section"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { client } from "@/sanity/lib/client"
import { TESTIMONIALS_SECTION_QUERY, USER_TESTIMONIALS_QUERY } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"
import { useTranslation } from "@/contexts/i18n-context"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { TestimonialFormModal } from "./testimonial-form-modal"

const testimonialsLocal = [
  {
    id: 1,
    name: "María González",
    location: "Madrid, España",
    rating: 5,
    comment:
      "Servicio excepcional. El conductor fue muy puntual y el vehículo impecable. Definitivamente lo recomiendo para traslados en París.",
    service: "CDG → París",
    avatar: "/business-man-smiling.jpg",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    location: "Bogotá, Colombia",
    rating: 5,
    comment:
      "Perfecto para familias. Nos llevaron a Disneyland sin problemas, el conductor conocía muy bien la ruta y fue muy amable con los niños.",
    service: "París → Disneyland",
    avatar: "/family-transport-to-disneyland-paris-castle.jpg",
  },
  {
    id: 3,
    name: "Ana Martínez",
    location: "Barcelona, España",
    rating: 5,
    comment:
      "El tour nocturno por París fue increíble. Vimos todos los monumentos iluminados y el conductor nos dio excelentes recomendaciones.",
    service: "Tour Nocturno",
    avatar: "/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg",
  },
  {
    id: 4,
    name: "Luis Fernández",
    location: "México DF, México",
    rating: 5,
    comment:
      "Muy profesional y confiable. Llegué tarde por el vuelo y me esperaron sin costo adicional. Excelente servicio al cliente.",
    service: "Orly → París",
    avatar: "/professional-man-smiling.png",
  },
  {
    id: 5,
    name: "Isabella Silva",
    location: "São Paulo, Brasil",
    rating: 5,
    comment:
      "Comodidad y elegancia en cada detalle. El vehículo era muy limpio y cómodo. Una experiencia de lujo a precio justo.",
    service: "Beauvais → París",
    avatar: "/professional-woman-smiling.png",
  },
]

export function Testimonials() {
  const [data, setData] = useState<any | null>(null)
  const [items, setItems] = useState<any[]>(testimonialsLocal)
  const [api, setApi] = useState<any>()
  const { locale } = useTranslation()

  // Aplicar traducciones de Sanity según el idioma
  const translatedData = useMemo(() => {
    if (!data) return null
    if (locale === 'es') return data
    
    const translation = locale === 'en' ? data.translations?.en : data.translations?.fr
    if (!translation) return data
    
    return {
      ...data,
      title: translation.title || data.title,
      subtitle: translation.subtitle || data.subtitle,
    }
  }, [locale, data])

  // Traducir testimonios individuales
  const translatedItems = useMemo(() => {
    if (!items || locale === 'es') return items
    
    return items.map(item => {
      const translation = locale === 'en' ? item.translations?.en : item.translations?.fr
      if (!translation) return item
      
      return {
        ...item,
        location: translation.location || item.location,
        comment: translation.comment || item.comment,
        service: translation.service || item.service,
      }
    })
  }, [items, locale])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [sectionRes, userRes] = await Promise.all([
          client.fetch(TESTIMONIALS_SECTION_QUERY),
          client.fetch(USER_TESTIMONIALS_QUERY)
        ])
        
        if (!mounted) return
        
        setData(sectionRes)
        
        let combined = []
        // Los testimonios de los usuarios (aprobados) van primero
        if (Array.isArray(userRes)) {
           combined = [...userRes]
        }
        if (Array.isArray(sectionRes?.testimonials)) {
           combined = [...combined, ...sectionRes.testimonials]
        }
        if (combined.length > 0) {
          setItems(combined.map((t, i) => ({ ...t, id: t._id || i })))
        }
      } catch (e) {
        console.warn('[Testimonials] No se pudo cargar testimonios desde Sanity, usando fallback local.')
      }
    })()
    return () => { mounted = false }
  }, [locale])

  // Auto-play basic logic
  useEffect(() => {
    if (!api) return
    const interval = setInterval(() => {
      api.scrollNext()
    }, 5000)
    return () => clearInterval(interval)
  }, [api])

  return (
    <section id="testimonios" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-16 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between max-w-7xl mx-auto mb-4 gap-6">
            <div className="text-left max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary text-balance font-display">
                {translatedData?.title || 'Lo que Dicen Nuestros Clientes'}
              </h2>
              <p className="text-xl text-muted-foreground text-pretty">
                {translatedData?.subtitle || 'Más de 1000 clientes satisfechos confían en nuestro servicio de transporte privado.'}
              </p>
            </div>
            <div className="shrink-0">
              <TestimonialFormModal />
            </div>
          </div>
        </AnimatedSection>

        <div className="max-w-7xl mx-auto">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full relative"
          >
            <CarouselContent className="-ml-4 md:-ml-6 py-4">
              {translatedItems.map((testimonial, index) => (
                <CarouselItem key={testimonial.id || index} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                  <AnimatedSection animation="fade-up" delay={index * 100} className="h-full">
                    <Card className="h-full flex flex-col bg-card/80 backdrop-blur-sm border-border shadow-lg transform hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
                      <CardHeader className="p-0 shrink-0">
                        <div className="h-48 w-full overflow-hidden bg-muted flex items-center justify-center relative">
                          {testimonial.avatar?.asset ? (
                            <img
                              src={urlFor(testimonial.avatar).width(800).height(600).url()}
                              alt={testimonial.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : testimonial.avatar && typeof testimonial.avatar === 'string' ? (
                            <img
                              src={testimonial.avatar || "/placeholder.svg"}
                              alt={testimonial.name}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex flex-col items-center justify-center">
                               <span className="text-6xl text-primary/30 font-display font-light">
                                 {testimonial.name.charAt(0).toUpperCase()}
                               </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </CardHeader>

                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-2 bg-accent/10 rounded-full shrink-0">
                            <Quote className="w-5 h-5 text-accent" />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < (testimonial.rating || 5) ? 'fill-accent text-accent' : 'fill-muted text-muted'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-[15px] text-muted-foreground italic leading-relaxed">
                              "{testimonial.comment}"
                            </p>
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-primary">{testimonial.name}</p>
                            {testimonial.location && (
                              <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                            )}
                          </div>
                          {testimonial.service && (
                            <div className="text-right shrink-0">
                              <span className="inline-block px-2.5 py-1 bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-wider rounded-md">
                                {testimonial.service}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-6" />
              <CarouselNext className="-right-6" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
