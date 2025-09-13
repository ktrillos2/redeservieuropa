"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Clock, Car, Map } from "lucide-react"
import { useMemo, useState, useLayoutEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { AnimatedSection } from "@/components/animated-section"

export function Hero() {
  const router = useRouter()
  // Componente interno para animar cambios de altura suavemente
  function SmoothHeight({ children, deps = [] as any[] }: { children: React.ReactNode; deps?: any[] }) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const contentRef = useRef<HTMLDivElement | null>(null)
    const [height, setHeight] = useState<number>(0)

    useLayoutEffect(() => {
      const next = contentRef.current?.scrollHeight || 0
      setHeight((prev) => (prev === 0 ? next : prev))
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useLayoutEffect(() => {
      const next = contentRef.current?.scrollHeight || 0
      setHeight((prev) => (prev === next ? prev : next))
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return (
      <div
        ref={containerRef}
        style={{ height: height }}
        className="transition-[height] duration-500 ease-in-out overflow-hidden"
      >
        <div ref={contentRef} className="transition-opacity duration-500 ease-in-out data-[entering=true]:opacity-0">
          {children}
        </div>
      </div>
    )
  }

  const [bookingData, setBookingData] = useState({
    origen: "",
    destino: "",
    fecha: "",
    hora: "",
    pasajeros: "",
    vehiculo: "",
  tipoReserva: "" as "" | "traslado" | "tour",
    tipoTour: "" as "diurno" | "nocturno" | "escala" | "",
    categoriaTour: "" as "" | "ciudad" | "escala",
    subtipoTour: "" as "" | "diurno" | "nocturno",
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
    if (!Number.isFinite(n)) return 1
    return Math.min(56, Math.max(1, n))
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
      const pax = parsePassengers(bookingData.pasajeros)
      const data: any = { quickDeposit: true }

      if (bookingData.tipoReserva === "traslado") {
        const base = getBasePrice(bookingData.origen, bookingData.destino)
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
          totalPrice: typeof tourQuote?.total === "number" ? tourQuote.total : 0, // estimación del servicio si disponible
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
            backgroundImage: `url('/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg')`,
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
                <h3 className="text-2xl font-bold mb-6 text-center text-primary">Reserva tu Servicio</h3>
                <div className="space-y-4">
                  {/* Tipo de reserva (botones) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Map className="w-4 h-4 text-accent" />
                      Tipo de reserva
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
                        Traslado
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
                            pasajeros: "",
                            vehiculo: "",
                          })
                        }
                      >
                        <Map className="w-5 h-5" />
                        Tour
                      </Button>
                    </div>
                  </div>

                  {/* Tipo de tour (2 opciones: ciudad (diurno/nocturno) o escala) */}
                  {bookingData.tipoReserva === "tour" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tipo de tour</label>
                        <Select
                          value={bookingData.categoriaTour}
                          onValueChange={(value) =>
                            setBookingData({
                              ...bookingData,
                              categoriaTour: value as any,
                              // reset subtipo si cambia la categoría
                              subtipoTour: "",
                              // mantener compatibilidad con campo antiguo
                              tipoTour: value === "escala" ? "escala" : "",
                            })
                          }
                        >
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Selecciona: Diurno/Nocturno o Escala" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ciudad">Tour diurno o nocturno</SelectItem>
                            <SelectItem value="escala">Tour escala</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {bookingData.categoriaTour === "ciudad" && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Horario del tour</label>
                          <Select
                            value={bookingData.subtipoTour}
                            onValueChange={(value) =>
                              setBookingData({
                                ...bookingData,
                                subtipoTour: value as any,
                                tipoTour: value as any,
                              })
                            }
                          >
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Selecciona: Diurno o Nocturno" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diurno">Diurno</SelectItem>
                              <SelectItem value="nocturno">Nocturno</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {/* Campos de información también para Tour (fecha/hora/pax/vehículo) */}
                  {bookingData.tipoReserva === "tour" && (
                    <>
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
                              <SelectValue placeholder="Número de pasajeros (máx. 56)" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {Array.from({ length: 56 }, (_, i) => i + 1).map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n} {n === 1 ? "Pasajero" : "Pasajeros"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Car className="w-4 h-4 text-accent" />
                            Tipo de vehículo
                          </label>
                          <Select
                            value={bookingData.vehiculo}
                            onValueChange={(value) => setBookingData({ ...bookingData, vehiculo: value })}
                          >
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Selecciona: Vehículo, Minivan o Ambos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vehiculo">Vehículo</SelectItem>
                              <SelectItem value="minivan">Minivan</SelectItem>
                              <SelectItem value="ambos">Ambos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                  {bookingData.tipoReserva === "traslado" && (
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
                        Destino
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
                          <SelectValue placeholder="Número de pasajeros (máx. 56)" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {Array.from({ length: 56 }, (_, i) => i + 1).map((n) => (
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
                        onValueChange={(value) => setBookingData({ ...bookingData, vehiculo: value })}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Selecciona: Vehículo, Minivan o Ambos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vehiculo">Vehículo</SelectItem>
                          <SelectItem value="minivan">Minivan</SelectItem>
                          <SelectItem value="ambos">Ambos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  )}

                  {/* Resultado de cotización */}
                  <div className="rounded-lg border border-border p-4 bg-muted/40">
                    <SmoothHeight
                      deps={[
                        bookingData.tipoReserva,
                        bookingData.tipoTour,
                        bookingData.categoriaTour,
                        bookingData.subtipoTour,
                        bookingData.origen,
                        bookingData.destino,
                        bookingData.hora,
                        bookingData.pasajeros,
                        bookingData.vehiculo,
                      ]}
                    >
                      <div
                        key={`${bookingData.tipoReserva}-${bookingData.tipoTour}-${bookingData.origen}-${bookingData.destino}-${bookingData.hora}-${bookingData.pasajeros}-${bookingData.vehiculo}-${quote?.total ?? 'x'}`}
                        className="animate-[fadeSlide_.5s_ease-in-out]"
                      >
                        {bookingData.tipoReserva === "" ? (
                          <p className="text-sm text-muted-foreground text-center">Selecciona si deseas reservar un Traslado o un Tour.</p>
                        ) : bookingData.tipoReserva === "tour" ? (
                          <div className="space-y-2 text-sm text-center">
                            {!bookingData.categoriaTour ? (
                              <p className="text-muted-foreground">Selecciona el tipo de tour: diurno/nocturno o escala.</p>
                            ) : bookingData.categoriaTour === "ciudad" && !bookingData.subtipoTour ? (
                              <p className="text-muted-foreground">Selecciona si será diurno o nocturno.</p>
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
                          <p className="text-sm text-muted-foreground text-center">Selecciona origen y destino para ver el precio.</p>
                        ) : quote ? (
                          <div className="space-y-1 text-center">
                            <p className="text-sm">
                              Precio base: <span className="font-semibold">{quote.base}€</span> (hasta 4 pasajeros)
                            </p>
                            {bookingData.vehiculo && (
                              <p className="text-xs text-muted-foreground">
                                Tipo de vehículo: {bookingData.vehiculo === "vehiculo" ? "Vehículo" : bookingData.vehiculo === "minivan" ? "Minivan" : "Ambos"}
                              </p>
                            )}
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
                          <p className="text-sm text-destructive text-center">Ruta no disponible. Revisa los traslados disponibles.</p>
                        )}
                      </div>
                    </SmoothHeight>
                  </div>

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
                    Reservar con 5€
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
