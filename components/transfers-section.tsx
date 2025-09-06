"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plane, MapPin, Clock, Users, Luggage, Euro } from "lucide-react"

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
  { icon: <Users className="w-5 h-5" />, text: "Pasajero adicional", price: "+17€" },
]

export function TransfersSection() {
  return (
    <section id="traslados" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-bounce-in">
          <h2 className="text-4xl font-bold mb-4 text-primary text-balance">Nuestros Traslados</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Tarifas transparentes para todos nuestros servicios de transporte premium en París.
          </p>
        </div>

        {/* Transfer Routes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 stagger-animation">
          {transferRoutes.map((route, index) => (
            <Card
              key={route.id}
              className={`relative bg-card border-border hover-lift hover-glow animate-zoom-in ${
                route.popular ? "border-2 border-accent shadow-lg shadow-accent/20" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
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
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground animate-slide-in-left animation-delay-600">
                      <Clock className="w-4 h-4 animate-pulse" />
                      {route.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-2xl font-bold text-accent">
                      <Euro className="w-5 h-5" />
                      {route.price.replace("€", "")}
                    </div>
                    <p className="text-xs text-muted-foreground">Hasta 4 pasajeros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Charges */}
        <Card className="bg-card border-border animate-slide-up animation-delay-800 hover-lift">
          <CardHeader>
            <CardTitle className="text-center text-primary animate-bounce-in">Cargos Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 stagger-animation">
              {additionalCharges.map((charge, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover-lift">
                  <div className="text-accent animate-pulse">{charge.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{charge.text}</p>
                  </div>
                  <div className="text-accent font-bold">{charge.price}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-primary rounded-lg">
              <p className="text-sm text-center text-white">
                <strong>Nota:</strong> Para grupos de 5+ pasajeros, se combina la tarifa base + tarifa de vehículo
                adicional. Ejemplo: 9 pasajeros = Tarifa de 5 + Tarifa de 4 adicionales.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Traslados Especiales */}
        <Card className="bg-card border-border animate-slide-up animation-delay-900 hover-lift mt-10">
          <CardHeader>
            <CardTitle className="text-center text-primary">Traslados Especiales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 stagger-animation">
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
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-3 text-xs text-muted-foreground">
              <div className="text-center">+10€ por pasajero adicional (Versailles)</div>
              <div className="text-center">+17€ por persona adicional (Asterix)</div>
              <div className="text-center">Persona adicional 12€ (Giverny)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
