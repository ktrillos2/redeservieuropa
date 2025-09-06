"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
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
    included: [
      "Recogida en terminal",
      "Espera gratuita 60 min",
      "Peajes incluidos",
      "Seguro completo",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo amplio",
    ],
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
    included: [
      "Recogida en terminal",
      "Espera gratuita 45 min",
      "Peajes incluidos",
      "Limpieza del vehículo",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
    ],
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
    included: [
      "Recogida en hotel",
      "Entrada directa al parque",
      "Mapa del parque",
      "Recomendaciones VIP",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo amplio",
    ],
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
  "tour-paris": {
    title: "Tour por París",
    description:
      "Descubre la Ciudad de la Luz con nuestro tour personalizado. Recorre los monumentos más emblemáticos de París con un conductor profesional que te contará la historia de cada lugar.",
    basePriceDay: 55,
    basePriceNight: 65,
    duration: "Mínimo 2 horas",
    distance: "Personalizable",
    image: "/vehicles/stepway-paris-4.jpg",
    features: [
      "Tour personalizable",
      "Paradas en monumentos principales",
      "Conductor guía profesional",
      "Vehículo cómodo y amplio",
      "Fotos en lugares emblemáticos",
      "Información histórica",
      "Flexibilidad de horarios",
      "Rutas adaptadas a tus intereses",
    ],
    included: [
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
      "Combustible incluido",
      "Estacionamiento incluido",
    ],
    pricing: {
      day: 55, // por hora
      night: 65, // por hora
      minHours: 2,
    },
  },
  "paris-dl-dl": {
    title: "Disneyland ➡ Paris Tour ➡ Disneyland",
    description:
      "Disfruta un recorrido por París saliendo desde Disneyland y regresando al mismo punto. Ideal para conocer lo imprescindible en un solo trayecto con paradas para fotos.",
    basePrice: 200,
    duration: "2h · 3h o circuito Eiffel + Arco",
    distance: "Circuito en París",
    image: "/vehicles/stepway-paris-1.jpg",
    features: [
      "Salida y regreso a Disneyland",
      "Paradas en puntos icónicos",
      "Conductor guía profesional",
      "Vehículo cómodo y amplio",
      "Itinerario optimizado según tráfico",
      "Flexibilidad de horarios",
      "Fotos en lugares emblemáticos",
      "Servicio privado",
    ],
    included: [
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
      "Combustible y peajes",
      "Estacionamiento incluido",
    ],
    pricingP4: { threeH: 300, twoH: 245, eiffelArco: 200 },
    pricingP5: { threeH: 340, twoH: 315, eiffelArco: 245 },
  },
}

export function TourDetail({ tourId }: TourDetailProps) {
  const effectiveTourId = tourId === "tour-nocturno" ? "tour-paris" : tourId
  const tour = tourData[effectiveTourId]
  const router = useRouter()
  const [passengers, setPassengers] = useState(2)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isNightTime, setIsNightTime] = useState(false)
  const [extraLuggage, setExtraLuggage] = useState(false)
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropoffAddress, setDropoffAddress] = useState("")
  const [flightNumber, setFlightNumber] = useState("")
  const [luggage23kg, setLuggage23kg] = useState(0)
  const [luggage10kg, setLuggage10kg] = useState(0)
  const [babyStrollers, setBabyStrollers] = useState(0)
  const [childrenAges, setChildrenAges] = useState("")
  const [specialRequests, setSpecialRequests] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [tourHours, setTourHours] = useState(2)
  const [routeOption, setRouteOption] = useState<"threeH" | "twoH" | "eiffelArco" | undefined>(undefined)

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
    if (effectiveTourId === "tour-paris") {
      const hourlyRate = isNightTime ? tour.basePriceNight : tour.basePriceDay
      return hourlyRate * tourHours
    }

    if (effectiveTourId === "paris-dl-dl") {
      if (!routeOption) return NaN
      if (passengers >= 1 && passengers <= 4) {
        const map = tour.pricingP4
        return routeOption === "threeH" ? map.threeH : routeOption === "twoH" ? map.twoH : map.eiffelArco
      }
      if (passengers === 5) {
        const map = tour.pricingP5
        return routeOption === "threeH" ? map.threeH : routeOption === "twoH" ? map.twoH : map.eiffelArco
      }
      return NaN
    }

    let basePrice = tour.pricing[passengers] || tour.basePrice
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
    // Validaciones requeridos
    const errors: string[] = []
    if (!contactName.trim()) errors.push("Nombre completo")
    if (!contactPhone.trim()) errors.push("Teléfono")
    if (!contactEmail.trim()) errors.push("Email")
    if (!date) errors.push("Fecha del viaje")
    if (!time) errors.push("Hora de recogida")
    if (!pickupAddress.trim()) errors.push("Dirección de recogida")
    if (passengers < 1) errors.push("Número de pasajeros")
    if (effectiveTourId !== "tour-paris" && effectiveTourId !== "paris-dl-dl" && !dropoffAddress.trim()) {
      errors.push("Dirección de destino")
    }
    if (effectiveTourId === "tour-paris" && tourHours < 2) {
      errors.push("Duración del tour (mínimo 2h)")
    }
    if (effectiveTourId === "paris-dl-dl" && !routeOption) {
      errors.push("Opción del tour")
    }

    if (errors.length > 0) {
      alert(`Por favor completa: ${errors.join(", ")}.`)
      return
    }
    const bookingData = {
      tourId,
      passengers,
      date,
      time,
      pickupAddress,
      dropoffAddress,
      flightNumber,
      luggage23kg,
      luggage10kg,
      babyStrollers,
      childrenAges,
  tourHours: tourId === "tour-paris" ? tourHours : undefined,
  routeOption: effectiveTourId === "paris-dl-dl" ? routeOption : undefined,
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
                      {effectiveTourId === "tour-paris" ? (
                      <span>
                        Diurno {tour.basePriceDay}€/h - Nocturno {tour.basePriceNight}€/h
                      </span>
                      ) : effectiveTourId === "paris-dl-dl" ? (
                        <span>Desde 200€</span>
                      ) : (
                      <span>Desde {tour.basePrice}€</span>
                    )}
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
                    <span className="text-sm text-center">Vehículo Cómodo</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-lg transform hover:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-accent animate-pulse" />
                    <span className="text-sm text-center">Seguro Completo</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tarifas y Tours personalizados - tour de París y primera tarjeta dedicada */}
            {effectiveTourId === "tour-paris" && (
              <Card className="transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Tarifas y Tours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm md:text-base">
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Tarifas Tour: hasta 4 pasajeros</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="dl-dl-4">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">300€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">245€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">200€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="dl-air-4">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">270€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">235€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">180€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="air-dl-4">
                        <AccordionTrigger>Aeropuerto CDG u Orly ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">270€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">235€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">180€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-center-4">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Hôtel París o centro</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">160€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">130€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-air-4">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">210€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">160€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p>El tiempo de tour cuenta desde el momento que estamos en el primer lugar emblemático de París.</p>
                    <p>La hora adicional tiene un valor de 55€.</p>
                    <p>
                      En cada uno de los lugares que visitamos pueden bajar del vehículo por 15 min para tomar fotos y conocer
                      un poco el lugar.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Tour de 3 horas – lugares visitados</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Iglesia del Sagrado Corazón (Montmartre) ⛪</li>
                        <li>Cafetería de Ladybug 🐞</li>
                        <li>Molino Rojo</li>
                        <li>Museo de Louvre 🔼</li>
                        <li>Notre Dame de París ⛪</li>
                        <li>Campos Elíseos y Arco del triunfo ⛩🌅</li>
                        <li>Trocadero 🏛</li>
                        <li>Torre Eiffel 🗼</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Tour de 2 horas – lugares visitados</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Museo de Louvre 🔼</li>
                        <li>Campos Elíseos y Arco del triunfo ⛩🌅</li>
                        <li>Trocadero 🏛</li>
                        <li>Torre Eiffel 🗼</li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-2">Tarifas Tour: hasta 5 pasajeros</h3>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="dl-dl">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">340€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">315€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">245€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="dl-air">
                        <AccordionTrigger>Disneyland ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">320€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">300€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">230€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="air-dl">
                        <AccordionTrigger>Aeropuerto CDG u Orly ➡ Paris Tour ➡ Disneyland</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">320€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">300€</span></li>
                            <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">230€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-center">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Hôtel París o centro</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">190€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">145€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="hotel-air">
                        <AccordionTrigger>Hôtel Paris ➡ Paris Tour ➡ Aeropuerto CDG u Orly</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Paris Tour (3h): <span className="font-semibold">230€</span></li>
                            <li>Paris Tour (2h): <span className="font-semibold">210€</span></li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <p>El tiempo de tour cuenta desde el momento que estamos en el primer lugar emblemático de París.</p>
                    <p>La hora adicional tiene un valor de 55€.</p>
                    <p>
                      En cada uno de los lugares que visitamos pueden bajar del vehículo por 15 min para tomar fotos y conocer
                      un poco el lugar.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-primary">Tour Versailles</h3>
                    <p>
                      Tiene un costo mínimo de <span className="font-semibold">290€</span> hasta 3 personas, persona adicional
                      tiene un valor de <span className="font-semibold">90€</span>.
                    </p>
                    <div>
                      <p className="font-medium">Incluye:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Transporte de ida y regreso a su hotel en París.</li>
                        <li>Acompañamiento durante todo el recorrido (6h en promedio).</li>
                        <li>Entrada a todo el dominio de Versailles (Castillo, jardines, Trianon de María Antonieta y aldea de la reina).</li>
                        <li>Transporte de ida y regreso a su hotel en París.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="font-medium">En los traslados colocar:</p>
                    <p>Origen o Destino:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <span className="font-semibold">Versailles:</span> 65€ hasta 4 pasajeros. Después aumenta 10€ cada
                        pasajero. Valor desde París.
                      </li>
                      <li>
                        <span className="font-semibold">Parque Asterix:</span> 70€ desde Paris o aeropuerto Orly. Persona adicional
                        +17€.
                      </li>
                      <li>
                        <span className="font-semibold">Casa de Monet (Giverny):</span> 100€ desde París. Hasta 4 pasajeros, persona
                        adicional 12€.
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-primary">Tour Brujas</h3>
                    <p>
                      Tiene un costo mínimo de <span className="font-semibold">520€</span> hasta 3 pasajeros. A partir del 4º
                      pasajero el valor sería de <span className="font-semibold">140€</span> por pasajero.
                    </p>
                    <div>
                      <p className="font-medium">Incluye:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Transporte de ida y regreso a su hotel en París*</li>
                        <li>Guía en la ciudad por 2 horas.</li>
                        <li>Degustación de chocolates 🍫</li>
                        <li>Recomendaciones para comer y tomar una cerveza 🍺</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Itinerario Tour Brujas:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Recogida pasajeros en París 6:30am a 7:00am</li>
                        <li>Salida de París hacia Brujas 6:45 a 7:15</li>
                        <li>Parada desayuno: 8:30am</li>
                        <li>Retoma de trayecto hacia Brujas: 9:00am</li>
                        <li>Llegada a Brujas: 11:00am</li>
                        <li>Encuentro con el guía 11:30am (Recorrido 2 horas)</li>
                        <li>Visita libre por la ciudad de Brujas: 13:30 a 17:30</li>
                        <li>Si el cliente no quiere guía se resta 10€ por persona</li>
                      </ol>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-primary">Transporte Brujas y Amsterdam</h3>
                    <p>
                      <span className="font-semibold">1.100€</span>
                    </p>
                    <div>
                      <p className="font-medium">Incluye:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Transporte desde París hasta Amsterdam, con escala intermedia de una noche en Brujas (Bélgica).</li>
                        <li>
                          Hospedaje del conductor a cargo del cliente y comidas a cargo del cliente, tarifa hasta grupo de 5 personas.
                          Valor por Van de 8 personas: <span className="font-semibold">1450€</span>.
                        </li>
                      </ul>
                    </div>
                    <p className="text-muted-foreground">
                      En este tour de Amsterdam, es mejor priorizar el contacto directo con nosotros para coordinar detalles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {effectiveTourId === "paris-dl-dl" && (
              <Card className="transform hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Opciones y Tarifas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm md:text-base">
                  <div className="space-y-3">
                    <p className="text-muted-foreground">Tarifas según número de pasajeros:</p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-primary mb-1">Hasta 4 pasajeros</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Paris Tour (3h): <span className="font-semibold">300€</span></li>
                          <li>Paris Tour (2h): <span className="font-semibold">245€</span></li>
                          <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">200€</span></li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-primary mb-1">Hasta 5 pasajeros</h5>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Paris Tour (3h): <span className="font-semibold">340€</span></li>
                          <li>Paris Tour (2h): <span className="font-semibold">315€</span></li>
                          <li>Paris Tour Eiffel y Arco del triunfo: <span className="font-semibold">245€</span></li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Para más de 5 pasajeros, consultar por Van (8p).</p>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Qué visitamos</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Museo del Louvre</li>
                        <li>Campos Elíseos y Arco del Triunfo</li>
                        <li>Trocadero</li>
                        <li>Torre Eiffel</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary mb-2">Notas</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Paradas de 15 min para fotos</li>
                        <li>Itinerario ajustable según tráfico</li>
                        <li>Servicio privado puerta a puerta</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-2xl text-primary text-center">Reservar Ahora</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent animate-pulse">{Number.isNaN(calculatePrice()) ? "…€" : `${calculatePrice()}€`}</div>
                  <p className="text-sm text-muted-foreground">
                    {effectiveTourId === "tour-paris" ? `por ${tourHours} hora${tourHours > 1 ? "s" : ""}` : "por trayecto"}
                  </p>
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
                      required
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
                        required
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
                        required
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
                  <Input
                    type="number"
                    min="1"
                    max={effectiveTourId === "paris-dl-dl" ? 5 : 8}
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                    required
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                {effectiveTourId === "paris-dl-dl" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Opción de Tour
                    </label>
                    <div className="max-w-xs">
                      <Select value={routeOption} onValueChange={(v: any) => setRouteOption(v)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="threeH">Paris Tour (3h)</SelectItem>
                          <SelectItem value="twoH">Paris Tour (2h)</SelectItem>
                          <SelectItem value="eiffelArco">Torre Eiffel + Arco del Triunfo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {effectiveTourId === "tour-paris" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" />
                      Duración del Tour (mínimo 2 horas)
                    </label>
                    <Input
                      type="number"
                      min="2"
                      max="12"
                      value={tourHours}
                      onChange={(e) => setTourHours(Number(e.target.value))}
                      required
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                )}

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
                    required
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
                    required
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                  {isNightTime && effectiveTourId !== "tour-paris" && (
                    <p className="text-xs text-accent animate-pulse">* Recargo nocturno: +5€ (después de las 21:00)</p>
                  )}
                  {isNightTime && effectiveTourId === "tour-paris" && (
                    <p className="text-xs text-accent animate-pulse">
                      * Tour nocturno: {tour.basePriceNight}€/h (después de las 21:00)
                    </p>
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
                    required
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                {/* Dropoff Address */}
                {effectiveTourId !== "tour-paris" && effectiveTourId !== "paris-dl-dl" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-accent" />
                      Dirección de Destino
                    </label>
                    <Input
                      placeholder="Dirección completa de destino"
                      value={dropoffAddress}
                      onChange={(e) => setDropoffAddress(e.target.value)}
                      required
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                )}

                {/* Flight Number */}
                {(effectiveTourId.includes("cdg") || effectiveTourId.includes("orly") || effectiveTourId.includes("beauvais")) && (
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

                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-accent" />
                    Equipaje
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium"># Maletas 23kg</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={luggage23kg}
                        onChange={(e) => setLuggage23kg(Number(e.target.value))}
                        className="transform focus:scale-105 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium"># Maletas 10kg</label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={luggage10kg}
                        onChange={(e) => setLuggage10kg(Number(e.target.value))}
                        className="transform focus:scale-105 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">Carritos de bebé</label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={babyStrollers}
                      onChange={(e) => setBabyStrollers(Number(e.target.value))}
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
                  <label className="text-sm font-medium">Edades niños menores de 8 años</label>
                  <Input
                    placeholder="Ej: 3 años, 5 años"
                    value={childrenAges}
                    onChange={(e) => setChildrenAges(e.target.value)}
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                  <p className="text-xs text-muted-foreground">
                    Para sillas de niño o bebé que se requieran (sin costo adicional)
                  </p>
                </div>

                {/* Additional Services */}
                {effectiveTourId !== "tour-paris" && effectiveTourId !== "paris-dl-dl" && (
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
                )}

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
                  {effectiveTourId === "tour-paris" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Precio por hora ({isNightTime ? "nocturno" : "diurno"})</span>
                        <span>{isNightTime ? tour.basePriceNight : tour.basePriceDay}€</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Duración</span>
                        <span>
                          {tourHours} hora{tourHours > 1 ? "s" : ""}
                        </span>
                      </div>
                    </>
                  ) : effectiveTourId === "paris-dl-dl" ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Opción</span>
                        <span>
                          {!routeOption
                            ? "Selecciona"
                            : routeOption === "threeH"
                              ? "Paris Tour (3h)"
                              : routeOption === "twoH"
                                ? "Paris Tour (2h)"
                                : "Torre Eiffel + Arco"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pasajeros</span>
                        <span>{passengers <= 5 ? `${passengers}` : "Consultar"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Precio base ({passengers} pax)</span>
                        <span>{tour.pricing[passengers] || tour.basePrice}€</span>
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
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-accent animate-pulse">{Number.isNaN(calculatePrice()) ? "…€" : `${calculatePrice()}€`}</span>
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
