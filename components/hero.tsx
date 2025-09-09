"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { useMemo, useState } from "react"
import { AnimatedSection } from "@/components/animated-section"

export function Hero() {
  const [bookingData, setBookingData] = useState({
    origen: "",
    destino: "",
    fecha: "",
    hora: "",
    pasajeros: "",
  })

  // Rutas disponibles y sus precios base (hasta 4 pasajeros)
  const routePrices: Record<string, number> = useMemo(
    () => ({
      "cdg->paris": 65,
      "orly->paris": 60,
      "beauvais->paris": 125,
      "paris->disneyland": 70,
      "orly->disneyland": 73,
    }),
    []
  )

  const getBasePrice = (from?: string, to?: string) => {
    if (!from || !to) return undefined
    const key = `${from}->${to}`
    return routePrices[key]
  }

  // Mapa de etiquetas amigables
  const labelMap = useMemo(
    () => ({
      cdg: "Aeropuerto CDG",
      orly: "Aeropuerto Orly",
      beauvais: "Aeropuerto Beauvais",
      paris: "París Centro",
      disneyland: "Disneyland",
    }),
    []
  )

  // Destinos disponibles según el origen seleccionado
  const availableDestinations = useMemo(() => {
    if (!bookingData.origen) return [] as string[]
    const prefix = `${bookingData.origen}->`
    return Object.keys(routePrices)
      .filter((k) => k.startsWith(prefix))
      .map((k) => k.split("->")[1])
  }, [bookingData.origen, routePrices])

  const parsePassengers = (paxStr?: string) => {
    const n = parseInt(paxStr || "", 10)
    return Number.isFinite(n) && n > 0 ? n : 1
  }

  const isNightTime = (timeStr?: string) => {
    if (!timeStr) return false
    const [hh] = timeStr.split(":").map((x) => parseInt(x, 10))
    if (!Number.isFinite(hh)) return false
    // Considerar nocturno desde 21:00 hasta 05:59
    return hh >= 21 || hh < 6
  }

  const quote = useMemo(() => {
    const base = getBasePrice(bookingData.origen, bookingData.destino)
    if (base == null) return null
    const pax = parsePassengers(bookingData.pasajeros)
    const night = isNightTime(bookingData.hora)

    // Tarifas adicionales según la sección actual del sitio
    const nightCharge = night ? 5 : 0
    const extraPax = Math.max(0, pax - 4)
    const extraPaxCharge = extraPax * 17

    const total = base + nightCharge + extraPaxCharge
    return {
      base,
      nightCharge,
      extraPax,
      extraPaxCharge,
      total,
    }
  }, [bookingData.origen, bookingData.destino, bookingData.hora, bookingData.pasajeros])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary pt-20">
      {/* Background with Paris landmarks */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-primary/60"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <AnimatedSection animation="slide-left">
            <div className="text-white">
              <h1 className="font-bold mb-6 text-balance text-white drop-shadow-lg text-5xl">
                Transporte 
                <span className="text-accent block animate-pulse drop-shadow-lg">Comodo y Seguro</span>
              </h1>
              <p className="text-xl mb-8 text-white/95 text-pretty drop-shadow-md">
                {"✈🚖 Transporte Privado en París\nConfort, seguridad y puntualidad.\n📍 Traslados desde/hacia aeropuertos (CDG, ORY, BVA),🎢 Viajes a Disneyland, 🏰 Tours privados por la ciudad,\nExcursiones a Brujas y mucho más. \n✨ Vive París sin preocupaciones."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Reservar Ahora
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary bg-transparent transform hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
                >
                  Ver Servicios
                </Button>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300}>
            <Card className="bg-card/98 backdrop-blur-md transform hover:scale-102 transition-all duration-300 shadow-2xl border-white/20">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-center text-primary">Reserva tu Traslado</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        Origen
                      </label>
                      <Select
                        value={bookingData.origen}
                        onValueChange={(value) =>
                          setBookingData({ ...bookingData, origen: value, destino: "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cdg">{labelMap.cdg}</SelectItem>
                          <SelectItem value="orly">{labelMap.orly}</SelectItem>
                          <SelectItem value="beauvais">{labelMap.beauvais}</SelectItem>
                          <SelectItem value="paris">{labelMap.paris}</SelectItem>
                          <SelectItem value="disneyland">{labelMap.disneyland}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        Destino
                      </label>
                      <Select value={bookingData.destino} onValueChange={(value) => setBookingData({ ...bookingData, destino: value })}>
                        <SelectTrigger disabled={!bookingData.origen}>
                          <SelectValue placeholder={bookingData.origen ? "Seleccionar destino" : "Selecciona el origen primero"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDestinations.length > 0 ? (
                            availableDestinations.map((d) => (
                              <SelectItem key={d} value={d}>
                                {labelMap[d as keyof typeof labelMap] || d}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="-" disabled>
                              {bookingData.origen ? "No hay destinos disponibles" : "Selecciona el origen primero"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        Fecha
                      </label>
                      <Input
                        type="date"
                        value={bookingData.fecha}
                        onChange={(e) => setBookingData({ ...bookingData, fecha: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        Hora
                      </label>
                      <Input
                        type="time"
                        value={bookingData.hora}
                        onChange={(e) => setBookingData({ ...bookingData, hora: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Pasajeros
                    </label>
                    <Select
                      value={bookingData.pasajeros}
                      onValueChange={(value) => setBookingData({ ...bookingData, pasajeros: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Número de pasajeros" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Pasajero</SelectItem>
                        <SelectItem value="2">2 Pasajeros</SelectItem>
                        <SelectItem value="3">3 Pasajeros</SelectItem>
                        <SelectItem value="4">4 Pasajeros</SelectItem>
                        <SelectItem value="5">5 Pasajeros</SelectItem>
                        <SelectItem value="6">6 Pasajeros</SelectItem>
                        <SelectItem value="7">7 Pasajeros</SelectItem>
                        <SelectItem value="8">8 Pasajeros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resultado de cotización */}
                  <div className="rounded-lg border border-border p-4 bg-muted/40">
                    {!bookingData.origen || !bookingData.destino ? (
                      <p className="text-sm text-muted-foreground">Selecciona origen y destino para ver el precio.</p>
                    ) : quote ? (
                      <div className="space-y-1">
                        <p className="text-sm">
                          Precio base: <span className="font-semibold">{quote.base}€</span> (hasta 4 pasajeros)
                        </p>
                        {quote.nightCharge > 0 && (
                          <p className="text-xs text-muted-foreground">+{quote.nightCharge}€ recargo nocturno</p>
                        )}
                        {quote.extraPax > 0 && (
                          <p className="text-xs text-muted-foreground">+{quote.extraPaxCharge}€ por {quote.extraPax} pasajero(s) extra</p>
                        )}
                        <p className="text-lg font-bold text-primary mt-1">
                          Total estimado: {quote.total}€
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-destructive">Ruta no disponible. Revisa los traslados disponibles.</p>
                    )}
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg" size="lg">
                    Habla con Nosotros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
