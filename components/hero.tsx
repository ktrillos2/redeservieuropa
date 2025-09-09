"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { useState } from "react"
import { AnimatedSection } from "@/components/animated-section"

export function Hero() {
  const [bookingData, setBookingData] = useState({
    origen: "",
    destino: "",
    fecha: "",
    hora: "",
    pasajeros: "",
  })

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
                        onValueChange={(value) => setBookingData({ ...bookingData, origen: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar origen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cdg">Aeropuerto CDG</SelectItem>
                          <SelectItem value="orly">Aeropuerto Orly</SelectItem>
                          <SelectItem value="beauvais">Aeropuerto Beauvais</SelectItem>
                          <SelectItem value="paris">París Centro</SelectItem>
                          <SelectItem value="disneyland">Disneyland</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        Destino
                      </label>
                      <Select
                        value={bookingData.destino}
                        onValueChange={(value) => setBookingData({ ...bookingData, destino: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar destino" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cdg">Aeropuerto CDG</SelectItem>
                          <SelectItem value="orly">Aeropuerto Orly</SelectItem>
                          <SelectItem value="beauvais">Aeropuerto Beauvais</SelectItem>
                          <SelectItem value="paris">París Centro</SelectItem>
                          <SelectItem value="disneyland">Disneyland</SelectItem>
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
