"use client"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Info, MapPin, Star, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function EventosPage() {
  const router = useRouter()
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [lug23, setLug23] = useState(0)
  const [lug10, setLug10] = useState(0)

  // Evento de ejemplo basado en el primer tour
  const event = useMemo(
    () => ({
      id: "evento-tour-paris",
      title: "Tour París Especial – Evento de Tiempo Limitado",
      desc: "Vente con nosotros a descubrir París en un circuito especial, plazas limitadas.",
      date: "2025-10-15",
      time: "18:00",
      meetingPoint: "Disneyland Paris – Punto de encuentro principal",
      pricePerPerson: 200,
      image: "/vehicles/stepway-paris-2.jpg",
      details: {
        incluye: [
          "Transporte ida y vuelta",
          "Paradas fotográficas (15 min) en puntos icónicos",
          "Conductor guía de habla hispana",
          "Seguro y peajes incluidos",
        ],
        recorrido: ["Louvre", "Campos Elíseos", "Arco del Triunfo", "Trocadero", "Torre Eiffel"],
        nota: "Duración estimada 2–3 horas según tráfico. Evento grupal con plazas limitadas.",
      },
    }),
    []
  )

  const handleAgendar = () => {
    const d = event.date
    const t = event.time
    const isNightTime = (() => {
      const [hh] = (t || "").split(":").map(Number)
      const h = hh ?? 0
      return h >= 21 || h < 6
    })()

    const bookingData = {
      isEvent: true,
      eventId: event.id,
  eventTitle: event.title,
      tourId: event.id,
      passengers: 1,
  date: d,
  time: t,
      pickupAddress: event.meetingPoint,
      dropoffAddress: "",
      flightNumber: "",
      luggage23kg: 0,
      luggage10kg: 0,
      babyStrollers: 0,
      specialRequests: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      isNightTime,
      extraLuggage: false,
  pricePerPerson: event.pricePerPerson,
      totalPrice: event.pricePerPerson, // precio por persona (1 cupo)
    }

    localStorage.setItem("bookingData", JSON.stringify(bookingData))
    router.push("/pago")
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20">
        <div className="container mx-auto px-4 py-12">
          <AnimatedSection animation="fade-up" className="text-center mb-10">
            <h1 className="text-4xl font-bold text-primary font-display">Eventos a venir</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
              Reserva tu cupo para nuestros eventos especiales con plazas limitadas.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedSection animation="zoom-in">
              <Card className="relative transition-all duration-500 hover-lift hover-glow">
                <Badge className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-accent text-white z-10 font-medium">
                  <Star className="w-3 h-3 mr-1" /> Evento de tiempo limitado
                </Badge>
                <div className="relative rounded-t-xl overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-primary font-display">{event.title}</CardTitle>
                  <p className="text-muted-foreground text-sm">{event.desc}</p>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" />
                      <span>{new Date(event.date).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />
                      <span>{event.time} hrs</span>
                    </div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />
                      <span>{event.meetingPoint}</span>
                    </div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-accent" />
                      <span>Precio: {event.pricePerPerson}€ por persona</span>
                    </div>
                  </div>

                   <div className="flex items-center gap-3 pt-2">
                     <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Info className="w-4 h-4 mr-2" /> Información
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-display">{event.title}</DialogTitle>
                          <DialogDescription>
                            <div className="space-y-4 mt-2">
                              <div>
                                <p className="font-medium">Incluye:</p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                  {event.details.incluye.map((i) => (
                                    <li key={i}>{i}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="font-medium">Recorrido:</p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                  {event.details.recorrido.map((i) => (
                                    <li key={i}>{i}</li>
                                  ))}
                                </ul>
                              </div>
                              <p className="text-sm text-muted-foreground">{event.details.nota}</p>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>

                     <Button onClick={handleAgendar} className="flex-1 bg-primary hover:bg-primary/90">
                       Agendar cupo
                     </Button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
