"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet"
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
  // Props de la sección Hero
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
  toursList,
}: {
  title?: string
  highlight?: string
  description?: any
  backgroundUrl?: string
  primaryCtaLabel?: string
  secondaryCtaLabel?: string
  bookingForm?: any
  events?: SliderEventItem[]
  toursList?: { title: string; slug?: string; basePrice?: number; basePriceDay?: number; basePriceNight?: number }[]
}) {
  const router = useRouter()

  // Hooks de estado
  const [bookingData, setBookingData] = useState({
    origen: "cdg",
    destino: "paris",
    fecha: "",
    hora: "",
    pasajeros: "1",
    vehiculo: "coche",
    flightNumber: "",
    idaYVuelta: false,
    ninos: 0, // Selecciona automáticamente 0 niños
    tipoReserva: "traslado" as "" | "traslado" | "tour",
    tipoTour: "" as "diurno" | "nocturno" | "escala" | "",
    categoriaTour: "" as "" | "ciudad" | "escala",
  subtipoTour: "" as "diurno" | "nocturno" | "",
    selectedTourSlug: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const [showReturn, setShowReturn] = useState(false)
  const [returnData, setReturnData] = useState({ origen: '', destino: '', fecha: '', hora: '', ninos: 0 })
  // Paso del formulario
  const [formStep, setFormStep] = useState(1)

  // Fecha mínima: mañana
  const minDateStr = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  }, [])

  // Scroll helpers
  const scrollToElement = (id: string) => {
    try {
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        // Pequeño highlight visual opcional
        el.classList.add('ring', 'ring-accent/40')
        setTimeout(() => el.classList.remove('ring', 'ring-accent/40'), 1200)
      }
    } catch {}
  }

  const handlePrimaryScroll = () => {
    scrollToElement('hero-booking-form')
  }

  const handleSecondaryScroll = () => {
    // Prioridad: sección de servicios ("servicios"), fallback a traslados
    const targetIds = ['servicios', 'traslados']
    for (const id of targetIds) {
      const el = document.getElementById(id)
      if (el) {
        scrollToElement(id)
        return
      }
    }
  }

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
      asterix: "Parc Astérix",
      versailles: "Versalles",
    }),
    []
  )

  // Destinos disponibles según el origen seleccionado
  const availableDestinations = useMemo(() => {
    // Requisito: origen y destino deben ofrecer el mismo conjunto de opciones
    const full = Object.keys(labelMap)
    return full.filter((k) => k !== bookingData.origen)
  }, [bookingData.origen, labelMap])

  const parsePassengers = (paxStr?: string) => {
    const n = parseInt(paxStr || "", 10)
    if (!Number.isFinite(n)) return 1
    return Math.min(56, Math.max(1, n))
  }

  // Lógicas de vehículo y capacidad
  const vehicleCaps: Record<string, number> = {
    coche: 56,
    minivan: 56,
    van: 56,
  }
  const getVehicleCap = (_v?: string) => 56

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

  // Compute validation errors without side effects (pure)
  const computeValidationErrors = (): Record<string, string> => {
    const errs: Record<string,string> = {}
    const pax = parsePassengers(bookingData.pasajeros)
    const cap = getVehicleCap(bookingData.vehiculo)
    if (!bookingData.tipoReserva) errs.tipoReserva = 'Requerido'
    if (pax < 1) errs.pasajeros = '≥1'
    if (pax > cap) errs.pasajeros = `Máx ${cap}`
    if (bookingData.tipoReserva === 'traslado') {
      if (!bookingData.origen) errs.origen = 'Requerido'
      if (!bookingData.destino) errs.destino = 'Requerido'
      if (!bookingData.fecha) errs.fecha = 'Requerido'
      else {
        const today = new Date(); today.setHours(0,0,0,0)
        const selected = new Date(bookingData.fecha)
        if (!(selected.getTime() > today.getTime())) errs.fecha = 'Debe ser posterior a hoy'
      }
      if (!bookingData.hora) errs.hora = 'Requerido'
    // Modal: agregar cotización de regreso al carrito
    } else if (bookingData.tipoReserva === 'tour') {
      if (!bookingData.categoriaTour && !bookingData.subtipoTour) errs.categoriaTour = 'Requerido'
      if (!bookingData.fecha) errs.fecha = 'Requerido'
      if (!bookingData.hora) errs.hora = 'Requerido'
    }
    return errs
  }

  // Pure boolean check without side effects (safe for render)
  const validateHard = (): boolean => {
    const errs = computeValidationErrors()
    return Object.keys(errs).length === 0
  }

  // Derived boolean for UI and a human-friendly map of field labels
  const isFormValid = useMemo(() => validateHard(), [bookingData])
  const fieldLabelMap: Record<string,string> = {
    tipoReserva: 'Tipo de reserva',
    origen: 'Origen',
    destino: 'Destino',
    fecha: 'Fecha',
    hora: 'Hora',
    pasajeros: 'Pasajeros',
    categoriaTour: 'Categoría de tour',
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

    let total = base + nightCharge + extraPaxCharge
    if (bookingData.idaYVuelta) total = total * 2
    return {
      base,
      nightCharge,
      extraPax,
      extraPaxCharge,
      total,
    }
  }, [bookingData.origen, bookingData.destino, bookingData.hora, bookingData.pasajeros, bookingData.vehiculo, bookingData.idaYVuelta])

  // Estimación de precio para Tours según reglas provistas
  const tourQuote = useMemo(() => {
    if (bookingData.tipoReserva !== "tour") return null
    const pax = parsePassengers(bookingData.pasajeros)
    const veh = bookingData.vehiculo
    const cat = bookingData.categoriaTour || (bookingData.tipoTour === "escala" ? "escala" : "ciudad")
    const sub = bookingData.subtipoTour || (bookingData.tipoTour === "escala" ? "" : bookingData.tipoTour)

    // Si hay un tour específico seleccionado desde CMS, usar su tarifa base diurna/nocturna como referencia
    if (bookingData.selectedTourSlug) {
      const t = (toursList || []).find(x => (x.slug || x.title) === bookingData.selectedTourSlug)
      if (t) {
        const isNight = sub === 'nocturno' || isNightTime(bookingData.hora)
        const rate = isNight ? (t.basePriceNight ?? t.basePrice ?? 0) : (t.basePriceDay ?? t.basePrice ?? 0)
        const hours = isNight ? 3 : 2
        const extraPax = Math.max(0, pax - 4)
        const extraPerHour = 10 * extraPax
        const total = rate * hours + extraPerHour * hours
        return { total, label: `Estimado: ${total}€ (${hours}h ${isNight ? 'nocturno' : 'diurno'})` }
      }
    }

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
  }, [bookingData.tipoReserva, bookingData.pasajeros, bookingData.vehiculo, bookingData.categoriaTour, bookingData.subtipoTour, bookingData.tipoTour, bookingData.selectedTourSlug, toursList, bookingData.hora])

  // Enviar a página de pago con un depósito de confirmación de 5€ (quick deposit)
  const goToPayment = () => {
    try {
      // Run validation and set errors / focus as side-effects here (not during render)
      const errs = computeValidationErrors()
      setFieldErrors(errs)
      if (Object.keys(errs).length) {
        const first = Object.keys(errs)[0]
        try { document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus() } catch {}
        return
      }

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
          roundtrip: bookingData.idaYVuelta === true,
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
          tourId: bookingData.selectedTourSlug || undefined,
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

  // Función para manejar el cambio de niños
  function handleNinosChange(value: string) {
    const n = Math.max(0, Math.min(parsePassengers(bookingData.pasajeros), Number(value)))
    setBookingData({ ...bookingData, ninos: n })
  }
  // Función para agregar cotización de regreso
  function handleAddReturn() {
    if (!returnData.origen || !returnData.destino || !returnData.fecha || !returnData.hora) return;
    setShowReturn(false);
    // Aquí se podría guardar en localStorage o en un array de carrito
  }

  // Función para agregar la cotización actual al carrito
  function handleAddToCart() {
    // Construir item actual
    const item = {
      ...bookingData,
      tipo: bookingData.tipoReserva,
      fecha: bookingData.fecha,
      hora: bookingData.hora,
      origen: bookingData.origen,
      destino: bookingData.destino,
      ninos: bookingData.ninos,
      pasajeros: bookingData.pasajeros,
      vehiculo: bookingData.vehiculo,
      tour: bookingData.selectedTourSlug || null,
    };
    // Guardar en localStorage
    let carrito = [];
    try {
      const raw = localStorage.getItem('carritoCotizaciones')
      if (raw) carrito = JSON.parse(raw)
    } catch {}
    carrito.push(item)
    localStorage.setItem('carritoCotizaciones', JSON.stringify(carrito))
    alert('Cotización añadida al carrito. Puedes seguir agregando más o ir a pagar.')
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
              {events && events.length > 0 && (
                <div className="mb-6">
                  <EventsSlider events={events} />
                </div>
              )}
              <div className="mb-8 text-white/95 text-pretty drop-shadow-md text-justify">
                {(() => {
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
                  text = text.replace(/\s*\n+\s*/g, " ").replace(/\s{2,}/g, " ").trim()
                  return <p className="text-xl leading-relaxed">{text}</p>
                })()}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300 shadow-lg"
                  onClick={handlePrimaryScroll}
                >
                  {primaryCtaLabel}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary bg-transparent transform hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  onClick={handleSecondaryScroll}
                >
                  {secondaryCtaLabel}
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Booking Form */}
          {
          <AnimatedSection animation="fade-up" delay={300}>
            <Card id="hero-booking-form" className="bg-card/98 backdrop-blur-md transform hover:scale-102 transition-all duration-300 shadow-2xl border-white/20 scroll-mt-24">
              <CardContent className="p-6">
                {/* Paso 1: Selección de tipo de reserva */}
                {formStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold mb-6 text-center text-primary font-display">{bookingForm?.title || 'Reserva tu Servicio'}</h3>
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
                          className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${bookingData.tipoReserva === "traslado" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                          aria-pressed={bookingData.tipoReserva === "traslado"}
                          onClick={() => {
                            setBookingData((prev) => ({
                              ...prev,
                              tipoReserva: "traslado",
                              tipoTour: "",
                              categoriaTour: "",
                              subtipoTour: "" as "diurno" | "nocturno" | "",
                              // Limpiar campos de tour
                              origen: prev.origen || "cdg",
                              destino: prev.destino || "paris",
                              fecha: prev.fecha || "",
                              hora: prev.hora || "",
                              pasajeros: prev.pasajeros || "1",
                              vehiculo: prev.vehiculo || "coche",
                              flightNumber: prev.flightNumber || "",
                            }));
                            setFormStep(2);
                          }}
                        >
                          <Car className="w-5 h-5" />
                          {bookingForm?.typePicker?.trasladoLabel || 'Traslado'}
                        </Button>
                        <Button
                          type="button"
                          size="lg"
                          variant={bookingData.tipoReserva === "tour" ? "default" : "outline"}
                          className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${bookingData.tipoReserva === "tour" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                          aria-pressed={bookingData.tipoReserva === "tour"}
                          onClick={() => {
                            setBookingData((prev) => ({
                              ...prev,
                              tipoReserva: "tour",
                              // Limpiar campos de traslado
                              origen: "",
                              destino: "",
                              fecha: "",
                              hora: "",
                              pasajeros: "1",
                              vehiculo: "coche",
                              flightNumber: "",
                              tipoTour: "",
                              categoriaTour: "",
                              subtipoTour: "" as "diurno" | "nocturno" | "",
                            }));
                            setFormStep(2);
                          }}
                        >
                          <Map className="w-5 h-5" />
                          {bookingForm?.typePicker?.tourLabel || 'Tour'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Paso 2: Resto del formulario */}
                {formStep === 2 && (
                  <>
                    {/* Título dinámico según tipo de reserva */}
                    <h4 className="text-xl font-semibold text-center mb-2">
                      {bookingData.tipoReserva === "traslado"
                        ? "Cotización Traslado"
                        : bookingData.tipoReserva === "tour"
                        ? "Cotización Tour"
                        : "Cotización"}
                    </h4>
                    {/* Botón volver */}
                    <div className="mb-4 flex justify-start">
                      <Button variant="outline" size="sm" onClick={() => setFormStep(1)}>
                        ← Volver
                      </Button>
                    </div>
                    {/* Formulario paso 2 */}
                    <div className="space-y-4">
                      {/* Campos para traslado */}
                      {bookingData.tipoReserva === "traslado" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Origen */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-accent" />
                              {`Origen${bookingData.origen ? ` ${(labelMap[bookingData.origen as keyof typeof labelMap] || bookingData.origen)}` : ''}`}
                            </label>
                            <Select
                              value={bookingData.origen}
                              onValueChange={(value) => setBookingData({ ...bookingData, origen: value, destino: "" })}
                            >
                              <SelectTrigger data-field="origen" className={"cursor-pointer " + (fieldErrors.origen ? 'border-destructive focus-visible:ring-destructive' : '')}>
                                <SelectValue placeholder="Seleccionar origen" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(labelMap).map((k) => (
                                  <SelectItem key={k} value={k}>{labelMap[k as keyof typeof labelMap]}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Destino */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-accent" />
                              {`Destino${bookingData.destino ? ` ${(labelMap[bookingData.destino as keyof typeof labelMap] || bookingData.destino)}` : ''}`}
                            </label>
                            <Select value={bookingData.destino} onValueChange={(value) => setBookingData({ ...bookingData, destino: value })}>
                              <SelectTrigger data-field="destino" disabled={!bookingData.origen} className={"cursor-pointer disabled:cursor-not-allowed " + (fieldErrors.destino ? 'border-destructive focus-visible:ring-destructive' : '')}>
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
                          {/* Fecha */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-accent" />
                              {bookingForm?.dateField?.label || 'Fecha'}
                            </label>
                            <Input
                              data-field="fecha"
                              type="date"
                              min={minDateStr}
                              value={bookingData.fecha}
                              onChange={(e) => { setBookingData({ ...bookingData, fecha: e.target.value }); if (fieldErrors.fecha) setFieldErrors(f=>{const c={...f}; delete c.fecha; return c}) }}
                              className={fieldErrors.fecha ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                          </div>
                          {/* Hora */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4 text-accent" />
                              {bookingForm?.timeField?.label || 'Hora'}
                            </label>
                            <Input
                              data-field="hora"
                              type="time"
                              value={bookingData.hora}
                              onChange={(e) => { setBookingData({ ...bookingData, hora: e.target.value }); if (fieldErrors.hora) setFieldErrors(f=>{const c={...f}; delete c.hora; return c}) }}
                              className={fieldErrors.hora ? 'border-destructive focus-visible:ring-destructive' : ''}
                            />
                          </div>
                          {/* Pasajeros */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Users className="w-4 h-4 text-accent" />
                              Pasajeros
                            </label>
                            <Select
                              value={bookingData.pasajeros}
                              onValueChange={(value) => setBookingData({ ...bookingData, pasajeros: value })}
                            >
                              <SelectTrigger data-field="pasajeros" className={"cursor-pointer " + (fieldErrors.pasajeros ? 'border-destructive focus-visible:ring-destructive' : '')}>
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
                          {/* Niños */}
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Users className="w-4 h-4 text-accent" />
                              Niños (0-12)
                            </label>
                            <Select
                              value={String(bookingData.ninos ?? 0)}
                              onValueChange={value => {
                                const maxNinos = parsePassengers(bookingData.pasajeros);
                                let n = Number(value);
                                if (n > maxNinos) n = maxNinos;
                                setBookingData({ ...bookingData, ninos: n });
                              }}
                            >
                              <SelectTrigger data-field="ninos" className="cursor-pointer">
                                <SelectValue>
                                  {bookingData.ninos === 0 || bookingData.ninos
                                    ? `${bookingData.ninos} ${bookingData.ninos === 1 ? 'niño' : 'niños'}`
                                    : 'Cantidad de niños'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="max-h-72">
                                {Array.from({ length: parsePassengers(bookingData.pasajeros) + 1 }, (_, i) => i).map((n) => (
                                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Vehículo y Ida y regreso en la misma fila */}
                          <div className="flex flex-col md:flex-row gap-4 col-span-2">
                            <div className="flex-1 space-y-2">
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
                                <SelectTrigger data-field="vehiculo" className="cursor-pointer">
                                  <SelectValue placeholder="Selecciona: Coche, Minivan o Van" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="coche">Coche</SelectItem>
                                  <SelectItem value="minivan">Minivan</SelectItem>
                                  <SelectItem value="van">Van</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                              <label className="text-sm font-medium text-center">¿Ida y regreso?</label>
                              <button
                                type="button"
                                className={`px-3 py-1 rounded border ${bookingData.idaYVuelta ? 'bg-accent text-accent-foreground' : 'bg-background'}`}
                                onClick={() => setBookingData({ ...bookingData, idaYVuelta: !bookingData.idaYVuelta })}
                                aria-pressed={bookingData.idaYVuelta}
                              >
                                {bookingData.idaYVuelta ? 'Sí' : 'No'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Campos para tour */}
                      {bookingData.tipoReserva === "tour" && (
                        <>
                          {/* Tour y Tipo de tour en la misma fila */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Selector de tours disponibles */}
                            {Array.isArray(toursList) && toursList.length > 0 && (
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Map className="w-4 h-4 text-accent" />
                                  Tour
                                </label>
                                <Select
                                  value={bookingData.selectedTourSlug}
                                  onValueChange={(value) => setBookingData({ ...bookingData, selectedTourSlug: value })}
                                >
                                  <SelectTrigger data-field="tour" className="cursor-pointer">
                                    <SelectValue placeholder="Selecciona un tour" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-72">
                                    {toursList.map((t, idx) => (
                                      <SelectItem key={idx} value={t.slug || t.title}>{t.title}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            {/* Tipo de tour (Diurno, Nocturno o Escala) */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Plane className="w-4 h-4 text-accent" />
                                Tipo de tour
                              </label>
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
                                      subtipoTour: "" as "diurno" | "nocturno" | "",
                                      tipoTour: "escala",
                                      selectedTourSlug: "",
                                    })
                                  } else {
                                    setBookingData({
                                      ...bookingData,
                                      categoriaTour: "ciudad",
                                      subtipoTour: value as "diurno" | "nocturno" | "",
                                      tipoTour: value as "diurno" | "nocturno" | "",
                                      selectedTourSlug: "",
                                    })
                                  }
                                }}
                              >
                                <SelectTrigger data-field="categoriaTour" className={"cursor-pointer " + (fieldErrors.categoriaTour ? 'border-destructive focus-visible:ring-destructive' : '')}>
                                  <SelectValue placeholder="Selecciona: Diurno, Nocturno o Escala" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="diurno">Tour diurno</SelectItem>
                                  <SelectItem value="nocturno">Tour nocturno</SelectItem>
                                  <SelectItem value="escala">Tour escala</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          {/* Fecha, hora, pasajeros, vehículo */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent" />
                                {bookingForm?.dateField?.label || 'Fecha'}
                              </label>
                              <Input
                                data-field="fecha"
                                type="date"
                                min={minDateStr}
                                value={bookingData.fecha}
                                onChange={(e) => { setBookingData({ ...bookingData, fecha: e.target.value }); if (fieldErrors.fecha) setFieldErrors(f=>{const c={...f}; delete c.fecha; return c}) }}
                                className={fieldErrors.fecha ? 'border-destructive focus-visible:ring-destructive' : ''}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                {bookingForm?.timeField?.label || 'Hora'}
                              </label>
                              <Input
                                data-field="hora"
                                type="time"
                                value={bookingData.hora}
                                onChange={(e) => { setBookingData({ ...bookingData, hora: e.target.value }); if (fieldErrors.hora) setFieldErrors(f=>{const c={...f}; delete c.hora; return c}) }}
                                className={fieldErrors.hora ? 'border-destructive focus-visible:ring-destructive' : ''}
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
                                <SelectTrigger data-field="pasajeros" className={"cursor-pointer " + (fieldErrors.pasajeros ? 'border-destructive focus-visible:ring-destructive' : '')}>
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
                            {/* Niños (0-12) para tour */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent" />
                                Niños (0-12)
                              </label>
                              <Select
                                value={String(bookingData.ninos ?? 0)}
                                onValueChange={value => {
                                  const maxNinos = parsePassengers(bookingData.pasajeros);
                                  let n = Number(value);
                                  if (n > maxNinos) n = maxNinos;
                                  setBookingData({ ...bookingData, ninos: n });
                                }}
                              >
                                <SelectTrigger data-field="ninos" className="cursor-pointer">
                                  <SelectValue>
                                    {bookingData.ninos === 0 || bookingData.ninos
                                      ? `${bookingData.ninos} ${bookingData.ninos === 1 ? 'niño' : 'niños'}`
                                      : 'Cantidad de niños'}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                  {Array.from({ length: parsePassengers(bookingData.pasajeros) + 1 }, (_, i) => i).map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
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
                                <SelectTrigger data-field="vehiculo" className="cursor-pointer">
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
                      {/* Botón Cotizar */}
                      <div className="pt-4 flex flex-col gap-2">
                        <Button
                          className="w-full bg-accent hover:bg-accent/90 shadow-lg"
                          size="lg"
                          onClick={goToPayment}
                          disabled={!isFormValid}
                        >
                          Cotizar
                        </Button>
                        {!isFormValid && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Campos faltantes: {Object.keys(computeValidationErrors()).map(k => fieldLabelMap[k] || k).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
          }
        </div>
      </div>
    </section>
  )
}
