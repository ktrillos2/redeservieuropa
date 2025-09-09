"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, Star, Ticket, Ship } from "lucide-react"
import Link from "next/link"
import { AnimatedSection } from "@/components/animated-section"

// Cards personalizadas con la información proporcionada

export function Services() {
  // Cards por ruta/tour; variaciones (2h/3h/Eiffel+Arco) se detallan en el Tour específico
  const cards = [
    {
      id: "paris-dl-dl",
      title: "Disneyland ➡ Paris Tour ➡ Disneyland",
      desc: "Tour por París saliendo y regresando a Disneyland.",
      icon: <MapPin className="w-8 h-8 text-accent" />,
      price: "Desde 200€",
  link: "/tour/paris-dl-dl",
  popular: true,
  note: "Disponible en 2h, 3h o circuito Torre Eiffel + Arco del Triunfo (ver detalles)",
    },
    {
      id: "paris-dl-air",
      title: "Disneyland ➡ Paris Tour ➡ Aeropuerto (CDG/Orly)",
      desc: "Aprovecha el camino al aeropuerto para un tour inolvidable.",
      icon: <Plane className="w-8 h-8 text-accent" />,
      price: "Desde 180€",
      link: "/tour/tour-paris",
  note: "Disponible en 2h, 3h o circuito Torre Eiffel + Arco del Triunfo (ver detalles)",
    },
    {
      id: "paris-air-dl",
      title: "Aeropuerto (CDG/Orly) ➡ Paris Tour ➡ Disneyland",
      desc: "Comienza tu viaje con un tour por París en tránsito a Disney.",
      icon: <Plane className="w-8 h-8 text-accent" />,
      price: "Desde 180€",
      link: "/tour/tour-paris",
  note: "Disponible en 2h, 3h o circuito Torre Eiffel + Arco del Triunfo (ver detalles)",
    },
    {
      id: "paris-hotel-center",
      title: "Hôtel Paris ➡ Paris Tour ➡ Hôtel/centro",
      desc: "Tour personalizado iniciando y terminando en su hotel o centro.",
      icon: <MapPin className="w-8 h-8 text-accent" />,
      price: "Desde 130€",
      link: "/tour/tour-paris",
  note: "Disponible en 2h o 3h (ver detalles)",
    },
    {
      id: "paris-hotel-air",
      title: "Hôtel Paris ➡ Paris Tour ➡ Aeropuerto (CDG/Orly)",
      desc: "Cierre perfecto de su estadía con un tour antes del vuelo.",
      icon: <Plane className="w-8 h-8 text-accent" />,
      price: "Desde 160€",
      link: "/tour/tour-paris",
  note: "Disponible en 2h o 3h (ver detalles)",
    },
    {
      id: "tour-versailles",
      title: "Tour Versailles",
      desc: "Castillo, jardines, Trianon y aldea de la reina.",
      icon: <MapPin className="w-8 h-8 text-accent" />,
      price: "Desde 290€",
      link: "/tour/tour-paris",
      special: true,
      note: "Hasta 3 personas; adicional 90€/persona",
    },
    {
      id: "tour-brujas",
      title: "Tour Brujas (Bélgica)",
      desc: "Guía 2h, degustación de chocolates, recomendaciones locales.",
      icon: <MapPin className="w-8 h-8 text-accent" />,
      price: "Desde 520€",
      link: "/tour/tour-paris",
      special: true,
      note: "Hasta 3 personas; 4º+ 140€/persona",
    },
    {
      id: "tour-brujas-amsterdam",
      title: "Brujas y Amsterdam",
      desc: "París → Brujas (noche) → Amsterdam.",
      icon: <MapPin className="w-8 h-8 text-accent" />,
  price: "Desde 1.100€",
      link: "/tour/tour-paris",
      special: true,
      note: "Hasta 5 personas; Van 8p: 1.450€",
    },
  ]

  return (
    <section id="servicios" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="bounce-in" className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance">Nuestros Tours</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Traslados cómodos con la máxima comodidad y puntualidad. Tarifas transparentes y servicio excepcional.
          </p>
        </AnimatedSection>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((c, idx) => (
            <AnimatedSection key={c.id} animation="zoom-in" delay={idx * 100}>
              <Card className={`relative transition-all duration-500 hover-lift hover-glow ${c.popular ? "border-2 border-accent/60" : ""}`}>
                {c.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-accent text-white z-10 font-medium">
                    <Star className="w-3 h-3 mr-1" /> Popular
                  </Badge>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="animate-rotate-in">{c.icon}</div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{c.price}</div>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-primary">{c.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{c.desc}</p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {c.note && <p className="text-muted-foreground">{c.note}</p>}
                  <Link href={c.link}>
                    <Button className="w-full bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300">
                      Ver Detalles y Reservar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        {/* Sub-sección: Cotiza a tu gusto */}
        <AnimatedSection animation="zoom-in" delay={400} className="mt-8">
          <Card className="relative transition-all duration-500 hover-lift hover-glow">
            <CardHeader>
              <CardTitle className="text-center text-primary">Cotiza a tu gusto</CardTitle>
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
                        Cotizar por WhatsApp
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
                        Cotizar por WhatsApp
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
