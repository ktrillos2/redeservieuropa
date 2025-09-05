"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, Star, Euro } from "lucide-react"
import Link from "next/link"
import { AnimatedSection } from "@/components/animated-section"

const services = [
  {
    id: "cdg-paris",
    title: "CDG ↔ París",
    description: "Traslado cómodo desde/hacia el aeropuerto Charles de Gaulle",
    icon: Plane,
    price: "65€",
    duration: "45-60 min",
    passengers: "1-4",
    features: ["Vehículo premium", "Conductor profesional", "Seguimiento de vuelo"],
    popular: true,
  },
  {
    id: "orly-paris",
    title: "Orly ↔ París",
    description: "Servicio directo desde/hacia el aeropuerto de Orly",
    icon: Plane,
    price: "60€",
    duration: "35-45 min",
    passengers: "1-4",
    features: ["Puntualidad garantizada", "WiFi gratuito", "Agua embotellada"],
  },
  {
    id: "beauvais-paris",
    title: "Beauvais ↔ París",
    description: "Traslado desde el aeropuerto más alejado de París",
    icon: Plane,
    price: "125€",
    duration: "75-90 min",
    passengers: "1-4",
    features: ["Viaje cómodo", "Asientos de cuero", "Aire acondicionado"],
  },
  {
    id: "paris-disneyland",
    title: "París ↔ Disneyland",
    description: "Traslado mágico hacia el parque de diversiones",
    icon: MapPin,
    price: "70€",
    duration: "45-60 min",
    passengers: "1-4",
    features: ["Perfecto para familias", "Espacio para equipaje", "Entretenimiento"],
    popular: true,
  },
  {
    id: "orly-disneyland",
    title: "Orly ↔ Disneyland",
    description: "Directo del aeropuerto a la magia de Disney",
    icon: Plane,
    price: "73€",
    duration: "50-65 min",
    passengers: "1-4",
    features: ["Sin escalas", "Servicio directo", "Comodidad total"],
  },
  {
    id: "tour-nocturno",
    title: "Tour Nocturno París",
    description: "Descubre París iluminado con nuestro tour privado",
    icon: Clock,
    price: "65€/h",
    duration: "Mín. 2h",
    passengers: "1-4",
    features: ["Guía incluido", "Ruta personalizable", "Fotos incluidas"],
    special: true,
  },
]

export function Services() {
  return (
    <section id="servicios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="bounce-in" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance">Nuestros Servicios Premium</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Traslados de lujo con la máxima comodidad y puntualidad. Tarifas transparentes y servicio excepcional.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon
            return (
              <AnimatedSection key={service.id} animation="zoom-in" delay={index * 100}>
                <Card
                  className={`relative transition-all duration-500 hover-lift hover-glow ${
                    service.popular ? "border-2 border-accent shadow-lg shadow-accent/20" : "overflow-hidden"
                  } ${service.special ? "border-2 border-accent shadow-lg shadow-accent/20" : ""}`}
                >
                  {service.popular && (
                    <Badge className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-accent text-white z-10 font-medium">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  {service.special && (
                    <Badge className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-accent text-white font-semibold z-10">
                      Especial
                    </Badge>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="animate-rotate-in">
                        <IconComponent className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary flex items-center">
                          <Euro className="w-5 h-5 mr-1" />
                          {service.price}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-primary">{service.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{service.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-accent" />
                        <span>{service.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-accent" />
                        <span>{service.passengers}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link href={`/tour/${service.id}`}>
                      <Button className="w-full bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300">
                        Ver Detalles y Reservar
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )
          })}
        </div>

        <AnimatedSection animation="slide-up" delay={600} className="mt-12 text-center">
          <div className="bg-primary p-6 rounded-lg border border-border max-w-4xl mx-auto hover-lift">
            <h3 className="text-lg font-semibold mb-4 text-white">Cargos Adicionales</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-white">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent" />
                <span>Recargo nocturno después de las 21h: +5€</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                <span>Pasajero adicional: +17€</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Equipaje voluminoso (+3 maletas): +10€</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                <span>Grupos de 5-8 personas: Tarifas especiales</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
