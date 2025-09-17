"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Clock, Car, Map, Plane } from "lucide-react"
import { useMemo, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatedSection } from "@/components/animated-section"
import { PortableText } from "@portabletext/react"
import EventsSlider, { type EventItem as SliderEventItem } from "@/components/events-slider"
import { calcBaseTransferPrice, getAvailableDestinations as pricingGetAvailableDestinations, getGlobalMinBase as pricingGetGlobalMinBase, getMinBaseFromOrigin as pricingGetMinBaseFromOrigin } from "@/lib/pricing"

export function Hero({
  title = 'Transporte',
  highlight = 'Comodo y Seguro',
  description = [
    {
      _type: 'block',
      children: [
        { _type: 'span', text: 'Transporte Privado en París' },
      ],
      markDefs: [],
      style: 'normal',
    },
    {
      _type: 'block',
      children: [
        { _type: 'span', text: 'Confort, seguridad y puntualidad.' },
      ],
      markDefs: [],
      style: 'normal',
    },
    {
      _type: 'block',
      children: [
        { _type: 'span', text: 'Traslados desde/hacia aeropuertos (CDG, ORY, BVA), viajes a Disneyland, tours privados por la ciudad, excursiones a Brujas y mucho más.' },
      ],
      markDefs: [],
      style: 'normal',
    },
    {
      _type: 'block',
      children: [
        { _type: 'span', text: 'Vive París sin preocupaciones.' },
      ],
      markDefs: [],
      style: 'normal',
    },
  ] as any,
  backgroundUrl,
  primaryCtaLabel = 'Reservar Ahora',
  secondaryCtaLabel = 'Ver Servicios',
  bookingForm,
  events,
}: {
  title?: string
  highlight?: string
  description?: any
  backgroundUrl?: string
  primaryCtaLabel?: string
  secondaryCtaLabel?: string
  bookingForm?: any
  events?: SliderEventItem[]
}) {
  const router = useRouter()
  // Eliminado FadeOnMount para no ocultar contenido con opacity 0

  const [bookingData, setBookingData] = useState({
    origen: "cdg",
    destino: "paris",
    fecha: "",
    hora: "",
    pasajeros: "1",
    vehiculo: "coche",
    flightNumber: "",
  tipoReserva: "traslado" as "" | "traslado" | "tour",
    tipoTour: "" as "diurno" | "nocturno" | "escala" | "",
    categoriaTour: "" as "" | "ciudad" | "escala",
    subtipoTour: "" as "" | "diurno" | "nocturno",
  })

  const [formError, setFormError] = useState<string>("")

  // Helpers de precios desde módulo compartido
  const getBasePrice = (from?: string, to?: string, pax?: number) => calcBaseTransferPrice(from, to, pax)

  // Precio mínimo global entre todas las rutas
  const globalMinBase = useMemo(() => pricingGetGlobalMinBase(), [])

  // Precio mínimo "desde" según el origen (si aún no hay destino seleccionado)
  const minBaseFromOrigin = useMemo(() => pricingGetMinBaseFromOrigin(bookingData.origen), [bookingData.origen])

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
  const availableDestinations = useMemo(() => pricingGetAvailableDestinations(bookingData.origen), [bookingData.origen])

  const parsePassengers = (paxStr?: string) => {
    const n = parseInt(paxStr || "", 10)
    if (!Number.isFinite(n)) return 1
    return Math.min(56, Math.max(1, n))
  }

  // Lógicas de vehículo y capacidad
  const vehicleCaps: Record<string, number> = {
    coche: 4,
    minivan: 6,
    van: 8,
  }
  const getVehicleCap = (v?: string) => (v && vehicleCaps[v]) || 4

  // Ajustar pasajeros al cambiar de vehículo
  useEffect(() => {
    if (!bookingData.vehiculo) return
    const cap = getVehicleCap(bookingData.vehiculo)
    const pax = parsePassengers(bookingData.pasajeros)
    const clamped = Math.min(Math.max(pax, 1), cap)
    if (clamped !== pax) {
      setBookingData((bd) => ({ ...bd, pasajeros: String(clamped) }))
    }
  }, [bookingData.vehiculo])

  const validateHard = (): boolean => {
    const pax = parsePassengers(bookingData.pasajeros)
    const cap = getVehicleCap(bookingData.vehiculo)
    if (pax < 1) {
      setFormError("Debes seleccionar al menos 1 pasajero.")
      return false
    }
    if (pax > cap) {
      const vehLabel = bookingData.vehiculo === 'coche' ? 'Coche (4)' : bookingData.vehiculo === 'minivan' ? 'Minivan (6)' : 'Van (8)'
      setFormError(`Para ${vehLabel} el máximo es ${cap} pasajero(s).`)
      return false
    }
    setFormError("")
    return true
  }

  const isNightTime = (timeStr?: string) => {
    if (!timeStr) return false
    const [hh] = timeStr.split(":").map((x) => parseInt(x, 10))
    if (!Number.isFinite(hh)) return false
    // Considerar nocturno desde 21:00 hasta 05:59
    return hh >= 21 || hh < 6
  }

  const quote = useMemo(() => {
    const pax = parsePassengers(bookingData.pasajeros)
    const base = getBasePrice(bookingData.origen, bookingData.destino, pax)
    if (base == null) return null
    const night = isNightTime(bookingData.hora)

    // Tarifas adicionales según la sección actual del sitio
    const nightCharge = night ? 5 : 0
    // Nota: base ya incorpora precios hasta 8 pax; >8 pax se prorratea +20€/pax en el helper
    const extraPax = Math.max(0, pax - 8)
    const extraPaxCharge = extraPax * 20

    const total = base + nightCharge + extraPaxCharge
    return {
      base,
      nightCharge,
      extraPax,
      extraPaxCharge,
      total,
    }
  }, [bookingData.origen, bookingData.destino, bookingData.hora, bookingData.pasajeros, bookingData.vehiculo])

  // Estimación de precio para Tours según reglas provistas
  const tourQuote = useMemo(() => {
    if (bookingData.tipoReserva !== "tour") return null
    const pax = parsePassengers(bookingData.pasajeros)
    const veh = bookingData.vehiculo
    const cat = bookingData.categoriaTour || (bookingData.tipoTour === "escala" ? "escala" : "ciudad")
    const sub = bookingData.subtipoTour || (bookingData.tipoTour === "escala" ? "" : bookingData.tipoTour)

  // Tour ciudad nocturno en Minivan: base 400€ desde 6 pax, incluye hasta 8; extra >8: +20€/pax
  if (cat === "ciudad" && sub === "nocturno" && veh === "minivan" && pax >= 6) {
      const includedMax = 8
      const extra = Math.max(0, pax - includedMax) * 20
      return { total: 400 + extra, label: `Precio: 400€ (Van 6–8 pasajeros)${extra > 0 ? ` + ${extra}€ por ${pax - includedMax} extra(s)` : ""}` }
    }

  // Tour escala desde 5 pax: 5–8 pax mapeado, >8 añade +20€/pax por extra
  if (cat === "escala" && pax >= 5) {
      const mapping: Record<number, number> = { 5: 270, 6: 290, 7: 320, 8: 350 }
      const includedMax = 8
      const baseAtCap = mapping[Math.min(pax, includedMax)] ?? 270
      const extra = Math.max(0, pax - includedMax) * 20
      const est = baseAtCap + extra
      return { total: est, min: 270, max: 350, label: `Estimado: ${est}€ (5–8 pax: 270–350€)${extra > 0 ? ` + ${extra}€ por ${pax - includedMax} extra(s)` : ""}` }
    }

    // En otros casos no hay tarifa fija definida
    return { total: undefined, label: "Precio a confirmar según duración, horario y vehículo" }
  }, [bookingData.tipoReserva, bookingData.pasajeros, bookingData.vehiculo, bookingData.categoriaTour, bookingData.subtipoTour, bookingData.tipoTour])

  // Enviar a página de pago con un depósito de confirmación de 5€ (quick deposit)
  const goToPayment = () => {
    try {
      if (!validateHard()) return
      const pax = parsePassengers(bookingData.pasajeros)
      const data: any = { quickDeposit: true }

      if (bookingData.tipoReserva === "traslado") {
        const pax = parsePassengers(bookingData.pasajeros)
        const base = getBasePrice(bookingData.origen, bookingData.destino, pax)
        const total = quote?.total ?? base ?? 0
        Object.assign(data, {
          quickType: "traslado",
          basePrice: base,
          totalPrice: Number(total || 0),
          passengers: pax,
          date: bookingData.fecha || "",
          time: bookingData.hora || "",
          vehicleType: bookingData.vehiculo || "",
          pickupAddress: (labelMap as any)[bookingData.origen] || bookingData.origen || "",
          dropoffAddress: (labelMap as any)[bookingData.destino] || bookingData.destino || "",
          flightNumber: bookingData.flightNumber || "",
        })
      } else if (bookingData.tipoReserva === "tour") {
        Object.assign(data, {
          quickType: "tour",
          isTourQuick: true,
          tourCategory: bookingData.categoriaTour || (bookingData.tipoTour === "escala" ? "escala" : "ciudad"),
          tourSubtype: bookingData.subtipoTour || (bookingData.tipoTour === "escala" ? "" : bookingData.tipoTour || ""),
          passengers: pax,
          date: bookingData.fecha || "",
          time: bookingData.hora || "",
          vehicleType: bookingData.vehiculo || "",
          // Para quick deposit, si no hay estimación, mantenemos 0 como estimado, pero el pago ahora será 5€.
          totalPrice: typeof tourQuote?.total === "number" ? tourQuote.total : 0,
        })
      }

      localStorage.setItem("bookingData", JSON.stringify(data))
      router.push("/pago")
    } catch (e) {
      console.error("No se pudo preparar el pago:", e)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary pt-20">
      {/* Background with Paris landmarks */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: backgroundUrl ? `url('${backgroundUrl}')` : `url('/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-primary/40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <AnimatedSection animation="slide-left">
            <div className="text-white">
              <h1 className="font-bold mb-6 text-balance text-white drop-shadow-lg text-5xl font-display">
                {title}
                <span className="text-accent block animate-pulse drop-shadow-lg">{highlight}</span>
              </h1>
              {/* Slider de evento, pequeño, justo debajo del título */}
              {events && events.length > 0 && (
                <div className="mb-6">
                  <EventsSlider events={events} />
                </div>
              )}
              <div className="mb-8 text-white/95 text-pretty drop-shadow-md text-justify">
                {(() => {
                  // Construir un único párrafo a partir de Portable Text o string
                  let text = ""
                  if (Array.isArray(description)) {
                    try {
                      text = (description as any[])
                        .map((block) => {
                          if (block?._type === "block" && Array.isArray(block.children)) {
                            return block.children.map((c: any) => c?.text || "").join("")
                          }
                          return ""
                        })
                        .filter(Boolean)
                        .join(" ")
                    } catch {
                      text = ""
                    }
                  } else {
                    text = String(description || "")
                  }
                  // Normalizar espacios y saltos de línea a espacios simples
                  text = text.replace(/\s*\n+\s*/g, " ").replace(/\s{2,}/g, " ").trim()
                  return <p className="text-xl leading-relaxed">{text}</p>
                })()}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {primaryCtaLabel}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary bg-transparent transform hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
                >
                  {secondaryCtaLabel}
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {
          <AnimatedSection animation="fade-up" delay={300}>
            <Card className="bg-card/98 backdrop-blur-md transform hover:scale-102 transition-all duration-300 shadow-2xl border-white/20">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-center text-primary font-display">{bookingForm?.title || 'Reserva tu Servicio'}</h3>
                <div className="space-y-4">
                  {/* Tipo de reserva (botones) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Map className="w-4 h-4 text-accent" />
                      {bookingForm?.typePicker?.label || 'Tipo de reserva'}
                    </label>
                    <div className="flex flex-wrap gap-4 justify-center w-full">
                      <Button
                        type="button"
                        size="lg"
                        variant={bookingData.tipoReserva === "traslado" ? "default" : "outline"}
                        className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                          bookingData.tipoReserva === "traslado"
                            ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80"
                            : "border-2"
                        }`}
                        aria-pressed={bookingData.tipoReserva === "traslado"}
                        onClick={() =>
                          setBookingData({
                            ...bookingData,
                            tipoReserva: "traslado",
                            // limpiar campos de tour al cambiar a traslado
                            tipoTour: "",
                            categoriaTour: "",
                            subtipoTour: "",
                          })
                        }
                      >
                        <Car className="w-5 h-5" />
                        {bookingForm?.typePicker?.trasladoLabel || 'Traslado'}
                      </Button>
                      <Button
                        type="button"
                        size="lg"
                        variant={bookingData.tipoReserva === "tour" ? "default" : "outline"}
                        className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${
                          bookingData.tipoReserva === "tour"
                            ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80"
                            : "border-2"
                        }`}
                        aria-pressed={bookingData.tipoReserva === "tour"}
                        onClick={() =>
                          setBookingData({
                            ...bookingData,
                            tipoReserva: "tour",
                            // limpiar campos de traslado al cambiar a tour
                            origen: "",
                            destino: "",
                            fecha: "",
                            hora: "",
                            pasajeros: "1",
                            vehiculo: "coche",
                            flightNumber: "",
                          })
                        }
                      >
                        <Map className="w-5 h-5" />
                        {bookingForm?.typePicker?.tourLabel || 'Tour'}
                      </Button>
                    </div>
                  </div>

                  {/* Tipo de tour (unificado: Diurno, Nocturno o Escala) */}
                  {bookingData.tipoReserva === "tour" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo de tour</label>
                      <Select
                        value={
                          bookingData.categoriaTour === "escala"
                            ? "escala"
                            : bookingData.subtipoTour || ""
                        }
                        onValueChange={(value) => {
                          if (value === "escala") {
                            setBookingData({
                              ...bookingData,
                              categoriaTour: "escala",
                              subtipoTour: "",
                              tipoTour: "escala",
                            })
                          } else {
                            setBookingData({
                              ...bookingData,
                              categoriaTour: "ciudad",
                              subtipoTour: value as any, // diurno | nocturno
                              tipoTour: value as any,
                            })
                          }
                        }}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Selecciona: Diurno, Nocturno o Escala" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diurno">Tour diurno</SelectItem>
                          <SelectItem value="nocturno">Tour nocturno</SelectItem>
                          <SelectItem value="escala">Tour escala</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Campos de información también para Tour (fecha/hora/pax/vehículo) */}
                  {bookingData.tipoReserva === "tour" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" />
                            {bookingForm?.dateField?.label || 'Fecha'}
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
                            {bookingForm?.timeField?.label || 'Hora'}
                          </label>
                          <Input
                            type="time"
                            value={bookingData.hora}
                            onChange={(e) => setBookingData({ ...bookingData, hora: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            {bookingForm?.passengersField?.label || 'Pasajeros'}
                          </label>
                          <Select
                            value={bookingData.pasajeros}
                            onValueChange={(value) => setBookingData({ ...bookingData, pasajeros: value })}
                          >
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder={`Número de pasajeros (máx. ${getVehicleCap(bookingData.vehiculo)})`} />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {Array.from({ length: getVehicleCap(bookingData.vehiculo) }, (_, i) => i + 1).map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n} {n === 1 ? (bookingForm?.passengersField?.singular || 'Pasajero') : (bookingForm?.passengersField?.plural || 'Pasajeros')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Car className="w-4 h-4 text-accent" />
                            {bookingForm?.vehicleField?.label || 'Tipo de vehículo'}
                          </label>
                          <Select
                            value={bookingData.vehiculo}
                            onValueChange={(value) => {
                              const cap = getVehicleCap(value)
                              const pax = parsePassengers(bookingData.pasajeros)
                              const clamped = Math.min(Math.max(pax, 1), cap)
                              setBookingData({ ...bookingData, vehiculo: value, pasajeros: String(clamped) })
                            }}
                          >
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Selecciona: Coche, Minivan o Van" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="coche">{bookingForm?.vehicleField?.labelCoche || 'Coche (4 personas)'}</SelectItem>
                              <SelectItem value="minivan">{bookingForm?.vehicleField?.labelMinivan || 'Minivan (6 pasajeros)'}</SelectItem>
                              <SelectItem value="van">{bookingForm?.vehicleField?.labelVan || 'Van (8 pasajeros)'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Notas de equipaje para Minivan con 5 o 6 pasajeros */}
                      {bookingData.vehiculo === "minivan" && (
                        (() => {
                          const pax = parsePassengers(bookingData.pasajeros)
                          if (pax === 6) {
                            return (
                              <p className="text-xs text-muted-foreground text-center">
                                {bookingForm?.notes?.minivan6 || 'Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero.'}
                              </p>
                            )
                          }
                          if (pax === 5) {
                            return (
                              <p className="text-xs text-muted-foreground text-center">
                                {bookingForm?.notes?.minivan5 || 'Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg.'}
                              </p>
                            )
                          }
                          return null
                        })()
                      )}
                    </>
                  )}
                  {bookingData.tipoReserva === "traslado" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-accent" />
                        {bookingForm?.originField?.label || 'Origen'}
                      </label>
                      <Select
                        value={bookingData.origen}
                        onValueChange={(value) =>
                          setBookingData({ ...bookingData, origen: value, destino: "" })
                        }
                      >
                        <SelectTrigger className="cursor-pointer">
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
                        {bookingForm?.destinationField?.label || 'Destino'}
                      </label>
                      <Select value={bookingData.destino} onValueChange={(value) => setBookingData({ ...bookingData, destino: value })}>
                        <SelectTrigger disabled={!bookingData.origen} className="cursor-pointer disabled:cursor-not-allowed">
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
                  )}

                  

                  {bookingData.tipoReserva === "traslado" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        {bookingForm?.dateField?.label || 'Fecha'}
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
                        {bookingForm?.timeField?.label || 'Hora'}
                      </label>
                      <Input
                        type="time"
                        value={bookingData.hora}
                        onChange={(e) => setBookingData({ ...bookingData, hora: e.target.value })}
                      />
                    </div>
                    
                  </div>
                  )}

                  {bookingData.tipoReserva === "traslado" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        Pasajeros
                      </label>
                      <Select
                        value={bookingData.pasajeros}
                        onValueChange={(value) => setBookingData({ ...bookingData, pasajeros: value })}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder={`Número de pasajeros (máx. ${getVehicleCap(bookingData.vehiculo)})`} />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {Array.from({ length: getVehicleCap(bookingData.vehiculo) }, (_, i) => i + 1).map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n === 1 ? "Pasajero" : "Pasajeros"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tipo de vehículo */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Car className="w-4 h-4 text-accent" />
                        Tipo de vehículo
                      </label>
                      <Select
                        value={bookingData.vehiculo}
                        onValueChange={(value) => {
                          const cap = getVehicleCap(value)
                          const pax = parsePassengers(bookingData.pasajeros)
                          const clamped = Math.min(Math.max(pax, 1), cap)
                          setBookingData({ ...bookingData, vehiculo: value, pasajeros: String(clamped) })
                        }}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Selecciona: Coche, Minivan o Van" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coche">Coche (4 personas)</SelectItem>
                          <SelectItem value="minivan">Minivan (6 pasajeros)</SelectItem>
                          <SelectItem value="van">Van (8 pasajeros)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  )}

                  {/* Notas de equipaje para Minivan con 5 o 6 pasajeros (traslado) */}
                  {bookingData.tipoReserva === "traslado" && bookingData.vehiculo === "minivan" && (() => {
                    const pax = parsePassengers(bookingData.pasajeros)
                    if (pax === 6) {
                      return (
                        <p className="text-xs text-muted-foreground text-center">
                          Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero.
                        </p>
                      )
                    }
                    if (pax === 5) {
                      return (
                        <p className="text-xs text-muted-foreground text-center">
                          Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg.
                        </p>
                      )
                    }
                    return null
                  })()}

                  {/* Número de vuelo: última opción, centrada, siempre visible */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-sm space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 justify-center">
                        <Plane className="w-4 h-4 text-accent" />
                        {bookingForm?.flightNumberField?.label || 'Número de vuelo'}
                      </label>
                      <Input
                        type="text"
                        placeholder={bookingForm?.flightNumberField?.placeholder || 'Ej: AF1234'}
                        className="text-center"
                        value={bookingData.flightNumber}
                        onChange={(e) => setBookingData({ ...bookingData, flightNumber: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Resultado de cotización */}
                  <div className="rounded-lg border border-border p-4 bg-muted/40 text-foreground">
                    <div>
                      {bookingData.tipoReserva === "" ? (
                        <div className="space-y-1 text-center">
                          <p className="text-sm text-muted-foreground">Selecciona si deseas reservar un Traslado o un Tour.</p>
                          {globalMinBase != null && (
                            <p className="text-sm">Desde: <span className="font-semibold">{globalMinBase}€</span></p>
                          )}
                        </div>
                      ) : bookingData.tipoReserva === "tour" ? (
                        <div className="space-y-2 text-sm text-center">
                          {!bookingData.categoriaTour && !bookingData.subtipoTour ? (
                            <p className="text-muted-foreground">Selecciona el tipo de tour: Diurno, Nocturno o Escala.</p>
                          ) : (
                            <>
                              <p>
                                Reserva seleccionada: <span className="font-semibold">{bookingData.categoriaTour === "escala" ? "Tour escala" : `Tour ${bookingData.subtipoTour}`}</span>
                              </p>
                              {tourQuote?.total ? (
                                <p className="text-base font-semibold text-primary">Total estimado del tour: {tourQuote.total}€</p>
                              ) : (
                                <p className="text-xs text-muted-foreground">{tourQuote?.label || "Los precios de tour varían según duración, horario y vehículo. Indícanos tus datos para una cotización exacta."}</p>
                              )}
                            </>
                          )}
                        </div>
                      ) : !bookingData.origen || !bookingData.destino ? (
                        <div className="space-y-1 text-center">
                          <p className="text-sm text-muted-foreground">Selecciona origen y destino para ver el precio.</p>
                          {bookingData.origen && minBaseFromOrigin != null && (
                            <p className="text-sm">
                              Desde: <span className="font-semibold">{minBaseFromOrigin}€</span>
                            </p>
                          )}
                          {!bookingData.origen && globalMinBase != null && (
                            <p className="text-sm">
                              Desde: <span className="font-semibold">{globalMinBase}€</span>
                            </p>
                          )}
                        </div>
                      ) : quote ? (
                        <div className="space-y-1 text-center">
                          <p className="text-sm">
                            Precio base: <span className="font-semibold">{quote.base}€</span> (hasta 4 pasajeros)
                          </p>
                          {bookingData.vehiculo && (
                            <p className="text-xs text-muted-foreground">
                              Tipo de vehículo: {bookingData.vehiculo === "coche" ? "Coche (4)" : bookingData.vehiculo === "minivan" ? "Minivan (6)" : "Van (8)"}
                            </p>
                          )}
                          {quote.nightCharge > 0 && (
                            <p className="text-xs text-muted-foreground">+{quote.nightCharge}€ {bookingForm?.notes?.nightChargeNote || 'recargo nocturno'}</p>
                          )}
                          {quote.extraPax > 0 && (
                            <p className="text-xs text-muted-foreground">+{quote.extraPaxCharge}€ por {quote.extraPax} pasajero(s) extra</p>
                          )}
                          <p className="text-lg font-bold text-primary mt-1">
                            Total estimado: {quote.total}€
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {bookingForm?.notes?.surchargeFootnote || '* Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-destructive text-center">Ruta no disponible. Revisa los traslados disponibles.</p>
                      )}
                    </div>
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive text-center">{formError}</p>
                  )}

                  <Button
                    className="w-full bg-accent hover:bg-accent/90 shadow-lg"
                    size="lg"
                    disabled={
                      !bookingData.tipoReserva ||
                      (bookingData.tipoReserva === "traslado" && (!bookingData.origen || !bookingData.destino)) ||
                      (bookingData.tipoReserva === "tour" && (!bookingData.categoriaTour || (bookingData.categoriaTour === "ciudad" && !bookingData.subtipoTour)))
                    }
                    onClick={goToPayment}
                  >
                    {bookingForm?.ctaLabel || 'Reservar con 5€'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
          }
        </div>
      </div>
    </section>
  )
}
