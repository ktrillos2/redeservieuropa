"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { useState, useEffect } from "react"

const testimonials = [
  {
    id: 1,
    name: "María González",
    location: "Madrid, España",
    rating: 5,
    comment:
      "Servicio excepcional. El conductor fue muy puntual y el vehículo impecable. Definitivamente lo recomiendo para traslados en París.",
    service: "CDG → París",
    avatar: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    location: "Bogotá, Colombia",
    rating: 5,
    comment:
      "Perfecto para familias. Nos llevaron a Disneyland sin problemas, el conductor conocía muy bien la ruta y fue muy amable con los niños.",
    service: "París → Disneyland",
    avatar: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Ana Martínez",
    location: "Barcelona, España",
    rating: 5,
    comment:
      "El tour nocturno por París fue increíble. Vimos todos los monumentos iluminados y el conductor nos dio excelentes recomendaciones.",
    service: "Tour Nocturno",
    avatar: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    name: "Luis Fernández",
    location: "México DF, México",
    rating: 5,
    comment:
      "Muy profesional y confiable. Llegué tarde por el vuelo y me esperaron sin costo adicional. Excelente servicio al cliente.",
    service: "Orly → París",
    avatar: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    name: "Isabella Silva",
    location: "São Paulo, Brasil",
    rating: 5,
    comment:
      "Comodidad y elegancia en cada detalle. El vehículo era muy limpio y cómodo. Una experiencia de lujo a precio justo.",
    service: "Beauvais → París",
    avatar: "/placeholder.svg?height=200&width=300",
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 3) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const getVisibleTestimonials = () => {
    const visible = []
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length])
    }
    return visible
  }

  return (
    <section id="testimonios" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance">Lo que Dicen Nuestros Clientes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Más de 1000 clientes satisfechos confían en nuestro servicio premium de transporte.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 stagger-animation">
            {getVisibleTestimonials().map((testimonial, index) => (
              <Card
                key={testimonial.id}
                className="bg-card border-border shadow-lg transform hover:scale-105 transition-all duration-500 animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardHeader className="p-0">
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
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
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, index) => (
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
