"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Star,
  Euro,
  Calendar,
  Car,
  Shield,
  Wifi,
  Coffee,
  Luggage,
  Phone,
  Plane,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface TourDetailProps {
  tourId: string
}

const tourData: Record<string, any> = {
  "cdg-paris": {
    title: "Traslado CDG ↔ París",
    description:
      "Servicio premium de traslado desde/hacia el aeropuerto Charles de Gaulle al centro de París. Nuestros conductores profesionales te esperarán en la terminal con un cartel con tu nombre.",
    basePrice: 65,
    duration: "45-60 min",
    distance: "35 km",
    image: "/luxury-car-at-charles-de-gaulle-airport-paris.jpg",
    features: [
      "Seguimiento de vuelo en tiempo real",
      "Conductor profesional uniformado",
      "Vehículo Mercedes-Benz o similar",
      "WiFi gratuito a bordo",
      "Agua embotellada de cortesía",
      "Asistencia con equipaje",
      "Pago con tarjeta o efectivo",
      "Cancelación gratuita hasta 24h antes",
    ],
    included: ["Recogida en terminal", "Espera gratuita 60 min", "Peajes incluidos", "Seguro completo"],
    pricing: {
      1: 65,
      2: 65,
      3: 65,
      4: 65,
      5: 85,
      6: 103,
      7: 109,
      8: 113,
    },
  },
  "orly-paris": {
    title: "Traslado Orly ↔ París",
    description:
      "Conexión directa y cómoda entre el aeropuerto de Orly y el centro de París. Servicio puerta a puerta con la máxima comodidad.",
    basePrice: 60,
    duration: "35-45 min",
    distance: "25 km",
    image: "/elegant-transport-service-orly-airport-paris.jpg",
    features: [
      "Servicio puerta a puerta",
      "Vehículos de lujo",
      "Conductores bilingües",
      "Sistema de climatización",
      "Música ambiente",
      "Cargadores USB",
      "Servicio 24/7",
      "Confirmación inmediata",
    ],
    included: ["Recogida en terminal", "Espera gratuita 45 min", "Peajes incluidos", "Limpieza del vehículo"],
    pricing: {
      1: 60,
      2: 60,
      3: 60,
      4: 60,
      5: 80,
      6: 95,
      7: 104,
      8: 108,
    },
  },
  "paris-disneyland": {
    title: "París ↔ Disneyland",
    description:
      "Traslado mágico hacia el reino de la fantasía. Perfecto para familias, con espacio extra para equipaje y entretenimiento para los más pequeños.",
    basePrice: 70,
    duration: "45-60 min",
    distance: "40 km",
    image: "/family-transport-to-disneyland-paris-castle.jpg",
    features: [
      "Perfecto para familias",
      "Entretenimiento para niños",
      "Asientos elevadores disponibles",
      "Espacio extra para equipaje",
      "Paradas técnicas si necesario",
      "Información sobre el parque",
      "Fotos de recuerdo",
      "Horarios flexibles",
    ],
    included: ["Recogida en hotel", "Entrada directa al parque", "Mapa del parque", "Recomendaciones VIP"],
    pricing: {
      1: 70,
      2: 70,
      3: 70,
      4: 70,
      5: 90,
      6: 106,
      7: 118,
      8: 134,
    },
  },
}

export function TourDetail({ tourId }: TourDetailProps) {
  const tour = tourData[tourId]
  const router = useRouter()
  const [passengers, setPassengers] = useState("2")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isNightTime, setIsNightTime] = useState(false)
  const [extraLuggage, setExtraLuggage] = useState(false)
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  const [flightNumber, setFlightNumber] = useState("")
  const [luggageCount, setLuggageCount] = useState("2")
  const [specialRequests, setSpecialRequests] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Tour no encontrado</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  const calculatePrice = () => {
    let basePrice = tour.pricing[Number.parseInt(passengers)] || tour.basePrice
    if (isNightTime) basePrice += 5
    if (extraLuggage) basePrice += 10
    return basePrice
  }

  const handleTimeChange = (value: string) => {
    setTime(value)
    const hour = Number.parseInt(value.split(":")[0])
    setIsNightTime(hour >= 21 || hour < 6)
  }

  const handleBookingSubmit = () => {
    const bookingData = {
      tourId,
      passengers,
      date,
      time,
      pickupAddress,
      dropoffAddress,
      flightNumber,
      luggageCount,
      specialRequests,
      contactName,
      contactPhone,
      contactEmail,
      totalPrice: calculatePrice(),
      isNightTime,
      extraLuggage,
    }

    localStorage.setItem("bookingData", JSON.stringify(bookingData))
    router.push("/pago")
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-10">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a servicios
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 py-3">
          {/* Tour Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative rounded-lg overflow-hidden transform hover:scale-105 transition-all duration-500">
              <img src={tour.image || "/placeholder.svg"} alt={tour.title} className="w-full h-64 object-cover" />
              <div className="absolute top-4 left-4">
                <Badge className="bg-accent text-accent-foreground animate-pulse">
                  <Star className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            </div>

            {/* Tour Details */}
            <Card className="transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-3xl text-primary animate-fade-in-up">{tour.title}</CardTitle>
                <div className="flex items-center gap-6 text-muted-foreground animate-fade-in-up animation-delay-200">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{tour.distance}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    <span>Desde {tour.basePrice}€</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-6 text-pretty animate-fade-in-up animation-delay-400">
                  {tour.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-primary">Características del Servicio</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {tour.features.map((feature: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Included */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-primary">Incluido en el Precio</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {tour.included.map((item: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Shield className="w-4 h-4 text-accent" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-primary">Comodidades del Vehículo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Wifi className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">WiFi Gratuito</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Coffee className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">Agua de Cortesía</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Car className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">Vehículo Premium</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">Seguro Completo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary text-center">Reservar Ahora</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent animate-pulse">{calculatePrice()}€</div>
                  <p className="text-sm text-muted-foreground">por trayecto</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Information Fields */}
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Phone className="w-4 h-4 text-accent" />
                    Información de Contacto
                  </h4>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nombre Completo</label>
                    <Input
                      placeholder="Tu nombre completo"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Teléfono</label>
                      <Input
                        placeholder="+33 1 23 45 67 89"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="transform focus:scale-105 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="transform focus:scale-105 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Number of Passengers */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Número de Pasajeros
                  </label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="transform focus:scale-105 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Pasajero" : "Pasajeros"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date of Travel */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" />
                    Fecha del Viaje
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Time of Pickup */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    Hora de Recogida
                  </label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                  {isNightTime && (
                    <p className="text-xs text-accent animate-pulse">* Recargo nocturno: +5€ (después de las 21:00)</p>
                  )}
                </div>

                {/* Pickup Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Dirección de Recogida
                  </label>
                  <Input
                    placeholder="Dirección completa de recogida"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Dropoff Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    Dirección de Destino
                  </label>
                  <Input
                    placeholder="Dirección completa de destino"
                    value={dropoffAddress}
                    onChange={(e) => setDropoffAddress(e.target.value)}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Flight Number */}
                {(tourId.includes("cdg") || tourId.includes("orly") || tourId.includes("beauvais")) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Plane className="w-4 h-4 text-accent" />
                      Número de Vuelo (Opcional)
                    </label>
                    <Input
                      placeholder="AF1234, BA456, etc."
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value)}
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                )}

                {/* Luggage Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-accent" />
                    Cantidad de Equipaje
                  </label>
                  <Select value={luggageCount} onValueChange={setLuggageCount}>
                    <SelectTrigger className="transform focus:scale-105 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Maleta</SelectItem>
                      <SelectItem value="2">2 Maletas</SelectItem>
                      <SelectItem value="3">3 Maletas</SelectItem>
                      <SelectItem value="4">4+ Maletas (cargo extra)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Services */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Servicios Adicionales</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={extraLuggage}
                        onChange={(e) => setExtraLuggage(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Equipaje voluminoso (+10€)</span>
                    </label>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Solicitudes Especiales</label>
                  <Input
                    placeholder="Asiento para bebé, parada adicional, etc."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Precio base ({passengers} pax)</span>
                    <span>{tour.pricing[Number.parseInt(passengers)] || tour.basePrice}€</span>
                  </div>
                  {isNightTime && (
                    <div className="flex justify-between text-sm">
                      <span>Recargo nocturno</span>
                      <span>+5€</span>
                    </div>
                  )}
                  {extraLuggage && (
                    <div className="flex justify-between text-sm">
                      <span>Equipaje extra</span>
                      <span>+10€</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-accent animate-pulse">{calculatePrice()}€</span>
                  </div>
                </div>

                {/* Proceed to Payment Button */}
                <Button
                  className="w-full bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300"
                  size="lg"
                  onClick={handleBookingSubmit}
                >
                  Proceder al Pago
                </Button>

                {/* Cancelation Policy */}
                <p className="text-xs text-muted-foreground text-center">
                  Cancelación gratuita hasta 24 horas antes del viaje
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
