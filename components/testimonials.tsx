"use client"
import { AnimatedSection } from "@/components/animated-section"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { client } from "@/sanity/lib/client"
import { TESTIMONIALS_SECTION_QUERY } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"
import { useTranslation } from "@/contexts/i18n-context"

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
  const [currentIndex, setCurrentIndex] = useState(0)
  const [data, setData] = useState<any | null>(null)
  const [items, setItems] = useState<any[]>(testimonialsLocal)
  const { locale } = useTranslation()

  // Traducciones estáticas locales (solo para elementos de UI que no vienen de Sanity)
  const staticTexts = useMemo(() => {
    // No hay textos estáticos adicionales por ahora, todo viene de Sanity
    return {}
  }, [locale])

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
        const res = await client.fetch(TESTIMONIALS_SECTION_QUERY)
        if (!mounted) return
        console.log("[Testimonials] Datos cargados desde Sanity para locale:", locale)
        console.log("[Testimonials] Data:", res)
        console.log("[Testimonials] Translations disponibles:", res?.translations)
        setData(res)
        if (Array.isArray(res?.testimonials) && res.testimonials.length > 0) {
          setItems(res.testimonials)
        }
      } catch (e) {
        console.warn('[Testimonials] No se pudo cargar testimonios desde Sanity, usando fallback local.')
      }
    })()
    return () => { mounted = false }
  }, [locale])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 3) % translatedItems.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [translatedItems.length])

  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push(translatedItems[(currentIndex + i) % translatedItems.length])
    }
    return visible
  }

  return (
    <section id="testimonios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance font-display">
            {translatedData?.title || 'Lo que Dicen Nuestros Clientes'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            {translatedData?.subtitle || 'Más de 1000 clientes satisfechos confían en nuestro servicio premium de transporte.'}
          </p>
        </AnimatedSection>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 stagger-animation">
            {getVisibleTestimonials().map((testimonial, index) => (
              <AnimatedSection key={testimonial.id} animation="fade-up" delay={index * 200}>
              <Card
                className="bg-card border-border shadow-lg transform hover:scale-105 transition-all duration-500 overflow-hidden"
              >
                <CardHeader className="p-0">
                  <div className="h-48 w-full overflow-hidden">
                    {testimonial.avatar?.asset ? (
                      <img
                        src={urlFor(testimonial.avatar).width(1200).height(800).url()}
                        alt={testimonial.name}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <img
                        src={testimonial.avatar || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <Quote className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-base text-foreground mb-4 italic text-pretty">"{testimonial.comment}"</p>
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-accent">{testimonial.service}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </AnimatedSection>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(translatedItems.length / 3) }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 transform hover:scale-125 ${
                  Math.floor(currentIndex / 3) === index ? "bg-accent" : "bg-border hover:bg-accent/50"
                }`}
                onClick={() => setCurrentIndex(index * 3)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
