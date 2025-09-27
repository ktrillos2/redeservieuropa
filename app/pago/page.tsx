"use client"

// Mapa de etiquetas amigables para mostrar en los labels
const labelMap = {
  cdg: "Aeropuerto CDG",
  orly: "Aeropuerto Orly",
  beauvais: "Aeropuerto Beauvais",
  paris: "París Centro",
  disneyland: "Disneyland",
  asterix: "Parc Astérix",
  versailles: "Versalles",
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, CreditCard, Shield, Clock, MapPin, Users, Luggage } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { calcBaseTransferPrice, isNightTime as pricingIsNightTime } from "@/lib/pricing"
import { formatPhonePretty, ensureLeadingPlus } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

export default function PaymentPage() {
  const [bookingData, setBookingData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [payFullNow, setPayFullNow] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  // Direcciones específicas del pago (información adicional, no reemplazan la dirección del servicio)
  const [paymentPickupAddress, setPaymentPickupAddress] = useState<string>('')
  const [paymentDropoffAddress, setPaymentDropoffAddress] = useState<string>('')
  // Mapa de errores por campo para resaltar inputs faltantes
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  /*
   * === RECARGO NOCTURNO AUTOMÁTICO ===
   * Ahora, además de calcular el recargo nocturno según la hora seleccionada en la reserva (time),
   * detectamos la hora local del cliente en la página de pago. Si son >=21h o <6h y el booking no tenía
   * ya marcado isNightTime, se añade automáticamente el recargo (+5€) excepto para 'tour-paris' / 'tour-nocturno'
   * donde la lógica de tarifa nocturna ya está incorporada al precio por hora en la pantalla anterior.
   * Si quieres cambiar el rango nocturno modifica la condición hour >= 21 || hour < 6.
   */

  useEffect(() => {
    const data = localStorage.getItem("bookingData")
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (parsed?.contactPhone) {
          const withPlus = ensureLeadingPlus(String(parsed.contactPhone))
          parsed.contactPhone = formatPhonePretty(withPlus)
          localStorage.setItem("bookingData", JSON.stringify(parsed))
        }
        setBookingData(parsed)
      } catch {
        setBookingData(JSON.parse(data))
      }
    }
    setIsLoading(false)
  }, [])

  // Detectar hora local del cliente y marcar recargo nocturno si aplica cuando aún no se marcó.
  useEffect(() => {
    if (!bookingData) return
    try {
      const now = new Date()
      const hour = now.getHours()
      const isNight = hour >= 21 || hour < 6
      // Sólo aplicar automáticamente si el registro aún no tenía isNightTime true y NO es un tour (los tours ya incorporan lógica propia)
      if (isNight && !bookingData.isNightTime && !bookingData.tourId) {
        setBookingData((prev: any) => {
          if (!prev) return prev
          const next = { ...prev, isNightTime: true, totalPrice: Number(prev.totalPrice || 0) + 5 }
          localStorage.setItem("bookingData", JSON.stringify(next))
          return next
        })
      }
    } catch {}
  }, [bookingData])

  const updateBookingField = (key: string, value: any) => {
    setBookingData((prev: any) => {
      const next: any = { ...prev, [key]: value }

      // Recalcular derivados (total, extras) solo si aplica
      const recalc = (n: any) => {
        // Normalizar campos numéricos
        n.passengers = Math.max(1, Math.min(9, Number(n.passengers || 1)))
        n.luggage23kg = Math.max(0, Number(n.luggage23kg || 0))
        n.luggage10kg = Math.max(0, Number(n.luggage10kg || 0))

        // Eventos: total = precio por persona * cupos
        if (n.isEvent && typeof n.pricePerPerson === "number") {
          const total = Number(n.pricePerPerson) * Number(n.passengers || 1)
          n.totalPrice = Number(total.toFixed(2))
          return n
        }

        // Traslados: calcular base por ruta y pax
        if (n.pickupAddress && n.dropoffAddress) {
          // Intentar deducir origen/destino a partir de etiquetas
          const from = (n.pickupAddress || "").toLowerCase().includes("cdg") ? "cdg"
            : (n.pickupAddress || "").toLowerCase().includes("orly") ? "orly"
            : (n.pickupAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
            : (n.pickupAddress || "").toLowerCase().includes("disney") ? "disneyland"
            : (n.pickupAddress || "").toLowerCase().includes("parís") || (n.pickupAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
          const to = (n.dropoffAddress || "").toLowerCase().includes("cdg") ? "cdg"
            : (n.dropoffAddress || "").toLowerCase().includes("orly") ? "orly"
            : (n.dropoffAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
            : (n.dropoffAddress || "").toLowerCase().includes("disney") ? "disneyland"
            : (n.dropoffAddress || "").toLowerCase().includes("parís") || (n.dropoffAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
          const pax = Math.max(1, Number(n.passengers || 1))
          const baseCalc = calcBaseTransferPrice(from, to, pax)
          const base = typeof baseCalc === "number" ? baseCalc : Number(n.basePrice || 0)

          const isNight = (() => {
            if (!n.time) return false
            const [hh] = String(n.time).split(":").map(Number)
            const h = hh || 0
            return h >= 21 || h < 6
          })()
          // Equipaje voluminoso: más de 3 maletas de 23Kg
          const extraLuggage = Number(n.luggage23kg || 0) > 3
          const extrasSum = (isNight ? 5 : 0) + (extraLuggage ? 10 : 0)
          n.isNightTime = isNight
          n.extraLuggage = extraLuggage
          n.luggageCount = Number(n.luggage23kg || 0) + Number(n.luggage10kg || 0)
          n.totalPrice = Number((base + extrasSum).toFixed(2))
          n.basePrice = base
          return n
        }

        // Por defecto: mantener total
        return n
      }

      const computed = recalc(next)
      localStorage.setItem("bookingData", JSON.stringify(computed))
      // Limpiar error del campo si ahora tiene valor válido
      setFieldErrors((prevErr) => {
        if (!prevErr[key]) return prevErr
        // Revalidaciones simples: si el valor ya no está vacío / formato básico
        if (typeof value === 'string' && value.trim() === '') return prevErr
        if (key === 'contactEmail') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
            if (!emailRegex.test(String(value))) return prevErr
        }
        if (key === 'contactPhone') {
          if (String(value).replace(/\D/g, '').length < 6) return prevErr
        }
        const clone = { ...prevErr }
        delete clone[key]
        return clone
      })
      return computed
    })
  }

  // Validar email en blur y actualizar errores de campo
  const validateAndSetEmail = (value: string) => {
    try {
      updateBookingField('contactEmail', value)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      setFieldErrors((prev) => {
        const next = { ...prev }
        if (!emailRegex.test(String(value))) {
          next.contactEmail = 'Formato inválido'
        } else {
          delete next.contactEmail
        }
        return next
      })
    } catch {}
  }

  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">No hay datos de reserva</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Derivados para depósito/remaining y método de pago
  const paymentMethod = bookingData?.paymentMethod || "card" // card | paypal | cash
  const isQuick = bookingData?.quickDeposit === true
  const isTour = Boolean(
    bookingData?.isEvent ||
      bookingData?.tourHours !== undefined ||
      bookingData?.routeOption !== undefined ||
      (bookingData?.tourId && typeof bookingData.tourId === 'string'),
  )
  const isEvent = Boolean(bookingData?.isEvent)
  const isTourBooking = !isEvent && Boolean(
    bookingData?.tourHours !== undefined ||
    bookingData?.routeOption !== undefined ||
    (bookingData?.tourId && typeof bookingData.tourId === 'string')
  )
  // Si tenemos una ruta y pasajeros, recalcular base con la nueva lógica
  let computedBase = Number(bookingData?.basePrice || 0)
  try {
    const from = (bookingData?.pickupAddress || "").toLowerCase().includes("cdg") ? "cdg"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("orly") ? "orly"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("disney") ? "disneyland"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("parís") || (bookingData?.pickupAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
    const to = (bookingData?.dropoffAddress || "").toLowerCase().includes("cdg") ? "cdg"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("orly") ? "orly"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("disney") ? "disneyland"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("parís") || (bookingData?.dropoffAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
    const pax = Number(bookingData?.passengers || 1)
    const baseCalc = calcBaseTransferPrice(from, to, pax)
    if (typeof baseCalc === "number") computedBase = baseCalc
  } catch {}
  const total = Number(bookingData?.totalPrice || computedBase || 0)
  const depositPercent = isEvent ? 0.2 : (isTourBooking ? 0.2 : 0.1)
  const depositPercentInt = Math.round(depositPercent * 100)
  const deposit = Math.max(1, Number((total * depositPercent).toFixed(2)))
  const remaining = Math.max(0, Number((total - deposit).toFixed(2)))
  const amountNow = payFullNow ? total : deposit
  const clientHour = (() => { try { return new Date().getHours() } catch { return undefined } })()

  // Validación centralizada: determina si se puede pagar depósito ahora
  const isDepositReady = () => {
    if (!bookingData) return false

    // Normalizar nombres (algunas pantallas usan 'fecha'/'hora'/'pasajeros')
    const passengers = bookingData.passengers ?? bookingData.pasajeros
    const date = bookingData.date ?? bookingData.fecha
    const time = bookingData.time ?? bookingData.hora

    // Pasajeros, fecha y hora
    if (!passengers || Number(passengers) < 1) return false
    if (!date || !String(date).trim()) return false
    if (!time || !String(time).trim()) return false

    // Direcciones requeridas para traslados (no eventos ni tours predefinidos)
    const needsAddresses = !bookingData.isEvent && !bookingData.isTourQuick && !bookingData.tourId
    if (needsAddresses) {
      // Ahora requerimos las direcciones ingresadas en la sección de pago (campos adicionales)
      if (!paymentPickupAddress || !String(paymentPickupAddress).trim()) return false
      if (!paymentDropoffAddress || !String(paymentDropoffAddress).trim()) return false
    }

    // Equipaje: requerir que el usuario haya indicado cantidades (aunque sean 0)
    if (typeof bookingData.luggage23kg === 'undefined' || typeof bookingData.luggage10kg === 'undefined') return false

    // Contacto: siempre requerimos nombre, teléfono y email para poder pagar el depósito
    if (!bookingData.contactName || !String(bookingData.contactName).trim()) return false
    if (!bookingData.contactPhone || !String(bookingData.contactPhone).trim()) return false
    if (!bookingData.contactEmail || !String(bookingData.contactEmail).trim()) return false

    // No hay errores activos
    if (Object.keys(fieldErrors || {}).length > 0) return false

    return true
  }

  // Etiquetas seguras para servicio/route en quick
  const quickType: "traslado" | "tour" | undefined = bookingData?.quickType
  const serviceLabel = bookingData?.isEvent
    ? "EVENTO ESPECIAL"
    : isQuick
      ? (quickType === "traslado"
          ? (bookingData?.pickupAddress && bookingData?.dropoffAddress
              ? `${bookingData.pickupAddress} → ${bookingData.dropoffAddress}`
              : "TRASLADO")
          : "TOUR")
      : (bookingData?.tourId ? bookingData.tourId.replace("-", " → ").toUpperCase() : "SERVICIO")

  // Enviar a WhatsApp cuando el método es efectivo
  const sendWhatsApp = () => {
    try {
      const numberFromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
      const phone = (numberFromEnv || "").replace(/[^\d]/g, "") // solo dígitos
      const isEvent = Boolean(bookingData?.isEvent)
      const title = isEvent
        ? (bookingData?.eventTitle || "Evento especial")
        : (bookingData?.tourId ? bookingData.tourId.split("-").join(" → ").toUpperCase() : "Servicio")
      const paxLabel = isEvent ? "Cupos" : "Pasajeros"
      const equipaje = isEvent
        ? `23kg: ${bookingData?.luggage23kg || 0} | 10kg: ${bookingData?.luggage10kg || 0}`
        : `${bookingData?.luggageCount || 0} maleta(s)`

      const extraLines: string[] = []
      const isTourMsg = Boolean(bookingData?.tourId)
      if (!isTourMsg) {
        if (bookingData?.isNightTime) extraLines.push("Recargo nocturno: +5€")
        if (bookingData?.extraLuggage) extraLines.push("Equipaje extra: +10€")
      }
      if (bookingData?.routeOption) extraLines.push(`Opción: ${bookingData.routeOption}`)
      if (bookingData?.tourHours) extraLines.push(`Duración: ${bookingData.tourHours}h`)

      const lines = [
        "Hola, quisiera confirmar una reserva:",
        `• ${isEvent ? "Evento" : "Servicio"}: ${title}`,
        `• Fecha y hora: ${bookingData?.date || "-"} ${bookingData?.time ? `a las ${bookingData.time}` : ""}`,
        `• ${paxLabel}: ${bookingData?.passengers || 0}`,
        bookingData?.pickupAddress ? `• Recogida: ${bookingData.pickupAddress}` : "",
        bookingData?.dropoffAddress ? `• Destino: ${bookingData.dropoffAddress}` : "",
        `• Equipaje: ${equipaje}`,
        bookingData?.flightNumber ? `• Vuelo: ${bookingData.flightNumber}` : "",
        "",
        "Contacto:",
        `• Nombre: ${bookingData?.contactName || "-"}`,
        `• Teléfono: ${bookingData?.contactPhone || "-"}`,
        `• Email: ${bookingData?.contactEmail || "-"}`,
        "",
        "Pago:",
        `• Método: Efectivo con depósito`,
        `• Total: ${total}€`,
        `• Depósito: ${deposit}€`,
        `• Saldo el día del servicio: ${remaining}€`,
        ...extraLines,
        "",
        "Realizaré el depósito para confirmar la reserva. Gracias."
      ].filter(Boolean)

      const msg = encodeURIComponent(lines.join("\n"))
      const waBase = "https://wa.me/"
      const url = phone ? `${waBase}${phone}?text=${msg}` : `${waBase}?text=${msg}`
      window.open(url, "_blank")
    } catch (e) {
      console.error("No se pudo abrir WhatsApp:", e)
    }
  }

  // Leer carrito de cotizaciones
  let carrito: any[] = []
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('carritoCotizaciones')
      if (raw) carrito = JSON.parse(raw)
    } catch {}
  }

  // Sumar total del carrito
  const totalCarrito = carrito.reduce((acc: number, item: any) => acc + Number(item.totalPrice || 0), 0)
  const tieneTour = carrito.some((item: any) => item.tipo === 'tour')
  const tieneTraslado = carrito.some((item: any) => item.tipo === 'traslado')

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <AnimatedSection animation="slide-left">
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a servicios
            </Link>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <AnimatedSection animation="fade-up" className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Página de Pago</h1>
              <p className="text-xl text-muted-foreground">Confirma tu reserva y procede con el pago seguro</p>
            </AnimatedSection>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <AnimatedSection animation="slide-left" delay={200}>
                <Card className="transform hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <CheckCircle className="w-6 h-6 text-accent" />
                      Resumen de tu Reserva
                      {bookingData.isEvent && (
                        <Badge className="ml-2 bg-accent text-white">Evento</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookingData.isEvent && Array.isArray(bookingData.eventImages) && bookingData.eventImages.length > 0 && (
                      <EventImagesCarousel images={bookingData.eventImages} shortInfo={bookingData.eventShortInfo} />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{bookingData.isEvent ? "Evento:" : "Servicio:"}</span>
                      <Badge className="bg-accent text-accent-foreground">
                        {serviceLabel}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {/* Pasajeros/Cupos editable */}
                      {bookingData.isEvent && bookingData.eventShortInfo && !bookingData.eventImages?.length && (
                        <div className="text-sm text-muted-foreground border-l-2 border-accent/60 pl-3">
                          {bookingData.eventShortInfo}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{bookingData.isEvent ? "Cupos" : "Pasajeros"}</span>
                          <Input
                            type="number"
                            data-field="passengers"
                            className={`w-24 ${fieldErrors.passengers ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            min={1}
                            max={9}
                            value={bookingData.passengers || 1}
                            onChange={(e) => updateBookingField("passengers", Number(e.target.value))}
                          />
                        </div>
                      </div>
                      {fieldErrors.passengers && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.passengers}</p>
                      )}

                      {/* Fecha y hora editable */}
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            data-field="date"
                            className={`w-40 ${fieldErrors.date ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            value={bookingData.date || ""}
                            onChange={(e) => updateBookingField("date", e.target.value)}
                          />
                          <Input
                            type="time"
                            data-field="time"
                            className={`w-28 ${fieldErrors.time ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            value={bookingData.time || ""}
                            onChange={(e) => updateBookingField("time", e.target.value)}
                          />
                        </div>
                      </div>
                      {(fieldErrors.date || fieldErrors.time) && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.date || fieldErrors.time}</p>
                      )}

                      {/* Direcciones: editables en traslados, sólo lectura en tours / eventos */}
                      {isTour ? (
                        <>
                          {bookingData.pickupAddress && (
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-accent mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium">Recogida:</p>
                                <p className="text-muted-foreground">{bookingData.pickupAddress}</p>
                              </div>
                            </div>
                          )}
                          {bookingData.dropoffAddress && (
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-accent mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium">Destino:</p>
                                <p className="text-muted-foreground">{bookingData.dropoffAddress}</p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-primary">Direcciones (información adicional)</h4>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              {`Origen del servicio${bookingData?.origen ? ` [${labelMap?.[bookingData.origen as keyof typeof labelMap] || bookingData.origen}]` : ''}`}
                            </label>
                            <p className="text-sm text-muted-foreground">{bookingData.pickupAddress || (labelMap?.[bookingData.origen as keyof typeof labelMap] || bookingData.origen) || 'No especificado'}</p>
                            <Input
                              placeholder="Ubicación exacta"
                              data-field="paymentPickupAddress"
                              className={fieldErrors.pickupAddress ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={paymentPickupAddress}
                              onChange={(e) => { setPaymentPickupAddress(e.target.value); if (fieldErrors.pickupAddress) setFieldErrors(f=>{const c={...f}; delete c.pickupAddress; return c}) }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              {`Destino del servicio${bookingData?.destino ? ` [${labelMap?.[bookingData.destino as keyof typeof labelMap] || bookingData.destino}]` : ''}`}
                            </label>
                            <p className="text-sm text-muted-foreground">{bookingData.dropoffAddress || (labelMap?.[bookingData.destino as keyof typeof labelMap] || bookingData.destino) || 'No especificado'}</p>
                            <Input
                              placeholder="Ubicación exacta"
                              data-field="paymentDropoffAddress"
                              className={fieldErrors.dropoffAddress ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={paymentDropoffAddress}
                              onChange={(e) => { setPaymentDropoffAddress(e.target.value); if (fieldErrors.dropoffAddress) setFieldErrors(f=>{const c={...f}; delete c.dropoffAddress; return c}) }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Número de Vuelo (opcional)</label>
                            <Input
                              placeholder="AF1234, BA456, etc."
                              value={bookingData.flightNumber || ''}
                              onChange={(e) => updateBookingField('flightNumber', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Equipaje por peso editable para ambos casos */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Luggage className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">Equipaje</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground"># Maletas 23kg</label>
                            <Input
                              type="number"
                              min={0}
                              value={bookingData.luggage23kg || 0}
                              onChange={(e) => updateBookingField("luggage23kg", Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground"># Maletas 10kg</label>
                            <Input
                              type="number"
                              min={0}
                              value={bookingData.luggage10kg || 0}
                              onChange={(e) => updateBookingField("luggage10kg", Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      {bookingData.flightNumber && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm">Vuelo: {bookingData.flightNumber}</span>
                        </div>
                      )}

                      {bookingData.specialRequests && (
                        <div className="flex items-start gap-3">
                          <div className="text-sm">
                            <p className="font-medium">Solicitudes especiales:</p>
                            <p className="text-muted-foreground">{bookingData.specialRequests}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Contact Info: editable para traslados */}
                    {bookingData.isEvent ? (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium text-primary">Información de Contacto</h4>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Nombre Completo</label>
                          <Input
                            placeholder="Tu nombre completo"
                            data-field="contactName"
                            className={fieldErrors.contactName ? 'border-destructive focus-visible:ring-destructive' : ''}
                            value={bookingData.contactName || ''}
                            onChange={(e) => updateBookingField('contactName', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Teléfono</label>
                            <Input
                              placeholder="+33 1 23 45 67 89"
                              data-field="contactPhone"
                              className={fieldErrors.contactPhone ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={bookingData.contactPhone || ''}
                              onChange={(e) => updateBookingField('contactPhone', ensureLeadingPlus(e.target.value))}
                              onBlur={(e) => updateBookingField('contactPhone', formatPhonePretty(ensureLeadingPlus(e.target.value)))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Email</label>
                            <Input
                              type="email"
                              placeholder="tu@email.com"
                              data-field="contactEmail"
                              className={fieldErrors.contactEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={bookingData.contactEmail || ''}
                              onChange={(e) => updateBookingField('contactEmail', e.target.value)}
                              onBlur={(e) => validateAndSetEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Solicitudes Especiales (opcional)</label>
                          <Input
                            placeholder="Asiento bebé, parada extra, etc."
                            value={bookingData.specialRequests || ''}
                            onChange={(e) => updateBookingField('specialRequests', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : isTour ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Información de Contacto:</h4>
                        <p className="text-sm">{bookingData.contactName}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.contactPhone}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.contactEmail}</p>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium text-primary">Información de Contacto</h4>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Nombre Completo</label>
                          <Input
                            placeholder="Tu nombre completo"
                            data-field="contactName"
                            className={fieldErrors.contactName ? 'border-destructive focus-visible:ring-destructive' : ''}
                            value={bookingData.contactName || ''}
                            onChange={(e) => updateBookingField('contactName', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Teléfono</label>
                            <Input
                              placeholder="+33 1 23 45 67 89"
                              data-field="contactPhone"
                              className={fieldErrors.contactPhone ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={bookingData.contactPhone || ''}
                              onChange={(e) => updateBookingField('contactPhone', ensureLeadingPlus(e.target.value))}
                              onBlur={(e) => updateBookingField('contactPhone', formatPhonePretty(ensureLeadingPlus(e.target.value)))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Email</label>
                            <Input
                              type="email"
                              placeholder="tu@email.com"
                              data-field="contactEmail"
                              className={fieldErrors.contactEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={bookingData.contactEmail || ''}
                              onChange={(e) => updateBookingField('contactEmail', e.target.value)}
                              onBlur={(e) => validateAndSetEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Solicitudes Especiales (opcional)</label>
                          <Input
                            placeholder="Asiento bebé, parada extra, etc."
                            value={bookingData.specialRequests || ''}
                            onChange={(e) => updateBookingField('specialRequests', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      {isQuick ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Depósito para confirmar</span>
                            <span>{deposit}€</span>
                          </div>
                          {total > 0 && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Importe total estimado del servicio</span>
                              <span>{total}€</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">El resto del servicio ({remaining}€) se paga el día del servicio.</p>
                        </>
                      ) : bookingData.isEvent ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Precio por cupo</span>
                            <span>{bookingData.pricePerPerson ?? bookingData.totalPrice}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cupos</span>
                            <span>x{bookingData.passengers || 1}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Depósito (20%)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Saldo el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                        </>
                      ) : (["tour-paris", "tour-nocturno"].includes(bookingData.tourId || "")) ? (
                        (() => {
                          const pax = Number(bookingData.passengers || 1)
                          const hours = bookingData.selectedPricingOption?.hours || bookingData.tourHours || 1
                          const extraPassengers = Math.max(0, pax - 4)
                          const ratePerExtra = bookingData.isNightTime ? 12 : 10
                          const totalLocal = Number(bookingData.totalPrice || 0)
                          const lines: JSX.Element[] = []
                          if (bookingData.selectedPricingOption) {
                            lines.push(
                              <div key="opt" className="flex justify-between text-sm">
                                <span>Opción seleccionada</span>
                                <span>{bookingData.selectedPricingOption.label}{bookingData.selectedPricingOption.hours ? ` (${bookingData.selectedPricingOption.hours}h)` : ''}</span>
                              </div>
                            )
                            lines.push(
                              <div key="opt-price" className="flex justify-between text-sm">
                                <span>Precio opción</span>
                                <span>{bookingData.selectedPricingOption.price}€</span>
                              </div>
                            )
                            lines.push(
                              <div key="pax" className="flex justify-between text-sm">
                                <span>Pasajeros</span>
                                <span>{pax}</span>
                              </div>
                            )
                            if (extraPassengers > 0) {
                              const recargo = ratePerExtra * extraPassengers * hours
                              lines.push(
                                <div key="recargo" className="flex justify-between text-sm text-accent">
                                  <span>Recargo pasajeros extra</span>
                                  <span>+{recargo}€</span>
                                </div>
                              )
                            }
                          } else {
                            // Intentamos deducir tarifa base por hora (sin extras) para mostrarla.
                            const perHourWithExtras = hours > 0 ? (totalLocal / hours) : totalLocal
                            const baseHourly = perHourWithExtras - (extraPassengers * ratePerExtra)
                            lines.push(
                              <div key="rate" className="flex justify-between text-sm">
                                <span>Precio por hora ({bookingData.isNightTime ? 'nocturno' : 'diurno'})</span>
                                <span>{Math.max(0, Math.round(baseHourly))}€</span>
                              </div>
                            )
                            lines.push(
                              <div key="dur" className="flex justify-between text-sm">
                                <span>Duración</span>
                                <span>{hours}h</span>
                              </div>
                            )
                            lines.push(
                              <div key="pax-base" className="flex justify-between text-sm">
                                <span>Pasajeros</span>
                                <span>{pax}</span>
                              </div>
                            )
                            if (extraPassengers > 0) {
                              const recargo = ratePerExtra * extraPassengers * hours
                              lines.push(
                                <div key="recargo-base" className="flex justify-between text-sm text-accent">
                                  <span>Recargo pasajeros extra</span>
                                  <span>+{recargo}€</span>
                                </div>
                              )
                            }
                          }
                          return <>{lines}</>
                        })()
                      ) : typeof bookingData.basePrice === "number" ? (
                        <>
                          {bookingData.selectedPricingOption && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>Opción seleccionada</span>
                                <span>
                                  {bookingData.selectedPricingOption.label}
                                  {bookingData.selectedPricingOption.hours ? ` (${bookingData.selectedPricingOption.hours}h)` : ''}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Precio</span>
                                <span>{bookingData.selectedPricingOption.price}€</span>
                              </div>
                            </>
                          )}
                          {!bookingData.selectedPricingOption && (
                          <div className="flex justify-between text-sm">
                            <span>Precio base</span>
                            <span>{bookingData.basePrice}€</span>
                          </div>
                          )}
                          {Math.max(0, (bookingData.passengers || 1) - 4) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Pasajeros adicionales</span>
                              <span>+{Math.max(0, (bookingData.passengers || 1) - 4) * 20}€</span>
                            </div>
                          )}
                          {bookingData.isNightTime && (
                            <div className="flex justify-between text-sm">
                              <span>Recargo nocturno</span>
                              <span>+5€</span>
                            </div>
                          )}
                          {bookingData.extraLuggage && (
                            <div className="flex justify-between text-sm">
                              <span>Equipaje extra</span>
                              <span>+10€</span>
                            </div>
                          )}
                          {/* Depósito/Saldo para traslados */}
                          <div className="flex justify-between text-sm">
                            <span>Depósito ({Math.round(depositPercent*100)}%)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Saldo el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{bookingData.totalPrice}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Depósito ({Math.round(depositPercent*100)}%)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Saldo el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                        </>
                      )}
                      {!isQuick && bookingData.isNightTime && !isTour && (
                        <div className="flex justify-between text-sm">
                          <span>Recargo nocturno</span>
                          <span>+5€</span>
                        </div>
                      )}
                      {!isQuick && bookingData.extraLuggage && !isTour && (
                        <div className="flex justify-between text-sm">
                          <span>Equipaje extra</span>
                          <span>+10€</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={payFullNow} onChange={(e) => setPayFullNow(e.target.checked)} />
                          ¿Deseas pagar todo ahora?
                        </label>
                        <div className="flex items-baseline gap-3 font-bold text-lg">
                          <span>
                            Total a pagar ahora {payFullNow ? '(100%)' : `(depósito ${depositPercentInt}%)`}
                          </span>
                          <span className="text-accent animate-pulse">{amountNow}€</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Payment Section */}
              <AnimatedSection animation="slide-right" delay={300}>
                <Card className="transform hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <CreditCard className="w-6 h-6 text-accent" />
                      Información de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Método de Pago</h4>
                      <div className="grid gap-3">
                        {/* Tarjeta */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={() => updateBookingField("paymentMethod", "card")}
                            className="text-accent"
                          />
                          <CreditCard className="w-5 h-5 text-accent" />
                          <div className="flex-1">
                            <span className="font-medium">Pago con tarjeta</span>
                            <div className="mt-1 flex items-center gap-3">
                              <img src="/logos/visa.svg" alt="Visa" className="h-5 w-auto" />
                              <img src="/logos/mastercard.svg" alt="Mastercard" className="h-5 w-auto" />
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-auto">Seguro</Badge>
                        </label>

                        {/* PayPal */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="paypal"
                            checked={paymentMethod === "paypal"}
                            onChange={() => updateBookingField("paymentMethod", "paypal")}
                            className="text-accent"
                          />
                          {/* Logo estilo PayPal */}
                          <div className="flex items-center">
                            <span className="text-[#003087] font-extrabold text-sm">Pay</span>
                            <span className="text-[#009CDE] font-extrabold text-sm">Pal</span>
                          </div>
                          <div className="flex-1" />
                          <Badge variant="secondary" className="ml-auto">Recomendado</Badge>
                        </label>

                        {/* Efectivo */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="cash"
                            checked={paymentMethod === "cash"}
                            onChange={() => updateBookingField("paymentMethod", "cash")}
                            className="text-accent"
                          />
                          <span className="font-medium">Efectivo</span>
                          <Badge className="ml-2" variant="outline">Depósito requerido</Badge>
                          <div className="flex-1" />
                        </label>
                      </div>
                    </div>

                    <Separator />

                    {/* Depósito y Restante (según método) */}
                    <div className="space-y-2 text-sm">
                      {isQuick ? (
                        <>
                          <div className="flex justify-between">
                            <span>Pago de confirmación</span>
                            <span>{deposit}€</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Este pago asegura tu reserva. Después de pagarlo, terminarás de rellenar los datos faltantes.
                          </p>
                        </>
                      ) : paymentMethod === "cash" ? (
                        <>
                          <div className="flex justify-between">
                            <span>Confirmar tu reserva (depósito)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor a pagar el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              ¿Por qué pedimos un depósito? Asegura la disponibilidad del vehículo y del conductor en la fecha y
                              hora seleccionadas y cubre el bloqueo de agenda y la preparación del servicio.
                            </p>
                            <p>
                              ¿Cómo se paga? El depósito se abona ahora de forma segura. El resto ({remaining}€) se paga el día del
                              servicio en efectivo, tarjeta o PayPal según prefieras.
                            </p>
                            {isTourBooking ? (
                              <p>Importe del depósito: {deposit}€.</p>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Total a pagar ahora {payFullNow ? '(100%)' : `(depósito ${depositPercentInt}%)`}</span>
                            <span>{amountNow}€</span>
                          </div>
                          {!payFullNow && (
                            <div className="flex justify-between">
                              <span>Saldo el día del servicio</span>
                              <span>{remaining}€</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Puedes pagar con tarjeta o PayPal de forma segura. {payFullNow ? 'Se cobrará el total ahora.' : `Si prefieres, marca "¿Deseas pagar todo ahora?" para abonar el 100%. En caso contrario, se cobrará el depósito del ${depositPercentInt}% y el resto se paga el día del servicio.`}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            * Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.
                            {typeof clientHour === 'number' && (
                              <span className="ml-1 text-xs">Hora local detectada: {clientHour}:00 {clientHour >= 21 || clientHour < 6 ? '(recargo aplicado)' : ''}</span>
                            )}
                          </p>
                        </>
                      )}
                    </div>

                    <Separator />

                    {/* Security Features */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent" />
                        Pago Seguro
                      </h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span>Encriptación SSL de 256 bits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span>Procesamiento seguro de pagos</span>
                        </div>
                        
                      </div>
                    </div>

                    <Separator />

          {/* Confirmation Button */}
                    <div className="space-y-4">
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300"
                        size="lg"
                        onClick={() => {
                          if (!bookingData) return
                          // Usar la validación central
                          const ok = isDepositReady()
                          if (!ok) {
                            // Reconstruir errores para mostrar al usuario los campos faltantes
                            const errors: Record<string, string> = {}

                            // Normalizar nombres de campos
                            const passengers = bookingData.passengers ?? bookingData.pasajeros
                            const date = bookingData.date ?? bookingData.fecha
                            const time = bookingData.time ?? bookingData.hora

                            if (!passengers || Number(passengers) < 1) errors.passengers = 'Requerido'
                            if (!date) errors.date = 'Requerido'
                            if (!time) errors.time = 'Requerido'

                            const requiresContact = !bookingData.quickDeposit
                            if (requiresContact) {
                              if (!bookingData.contactName || !String(bookingData.contactName).trim()) errors.contactName = 'Requerido'
                              if (!bookingData.contactPhone || !String(bookingData.contactPhone).trim()) errors.contactPhone = 'Requerido'
                              if (!bookingData.contactEmail || !String(bookingData.contactEmail).trim()) errors.contactEmail = 'Requerido'
                            }

                            const needsAddresses = !bookingData.isEvent && !bookingData.isTourQuick && !bookingData.tourId
                            if (needsAddresses) {
                              if (!paymentPickupAddress || !String(paymentPickupAddress).trim()) errors.pickupAddress = 'Requerido'
                              if (!paymentDropoffAddress || !String(paymentDropoffAddress).trim()) errors.dropoffAddress = 'Requerido'
                            }

                            // Formatos básicos
                            if (!errors.contactEmail && bookingData.contactEmail) {
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
                              if (!emailRegex.test(String(bookingData.contactEmail))) errors.contactEmail = 'Formato inválido'
                            }
                            if (!errors.contactPhone && bookingData.contactPhone) {
                              if (String(bookingData.contactPhone).replace(/\D/g, '').length < 6) errors.contactPhone = 'Teléfono inválido'
                            }

                            setFieldErrors(errors)
                            requestAnimationFrame(() => {
                              const first = Object.keys(errors)[0]
                              // Mapear claves normalizadas a los data-field reales usados en los inputs
                              const fieldMap: Record<string, string> = {
                                passengers: 'passengers',
                                date: 'date',
                                time: 'time',
                                contactName: 'contactName',
                                contactPhone: 'contactPhone',
                                contactEmail: 'contactEmail',
                                pickupAddress: 'pickupAddress',
                                dropoffAddress: 'dropoffAddress'
                              }
                              const selector = `[data-field="${fieldMap[first] || first}"]`
                              const el = document.querySelector(selector) as HTMLElement | null
                              if (el) el.focus()
                            })
                            return
                          }

                          // Crear pago en backend (Mollie) y redirigir a checkout
                          const doPay = async () => {
                            try {
                              const description = bookingData?.isEvent
                                ? `Evento: ${bookingData?.eventTitle || 'Reserva'}`
                                : bookingData?.tourId
                                ? `Reserva tour: ${bookingData.tourId}`
                                : `Reserva traslado ${bookingData?.pickupAddress || ''} -> ${bookingData?.dropoffAddress || ''}`
                              const amount = Number(amountNow || 0)
                              const res = await fetch('/api/mollie/create', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  amount,
                                  description,
                                  method: paymentMethod,
                                  booking: {
                                    ...bookingData,
                                    paymentPickupAddress,
                                    paymentDropoffAddress,
                                  },
                                  metadata: { source: 'web' },
                                }),
                              })
                              if (!res.ok) throw new Error(`Error creando pago: ${res.status}`)
                              const json = await res.json()
                              const url = json?.checkoutUrl
                              try { if (json?.id) localStorage.setItem('lastPaymentId', String(json.id)) } catch {}
                              if (typeof url === 'string') {
                                window.location.href = url
                                return
                              } else {
                                throw new Error('checkoutUrl no recibido')
                              }
                            } catch (e) {
                              console.error('No se pudo iniciar el pago:', e)
                              alert('No se pudo iniciar el pago. Intenta nuevamente más tarde.')
                            } finally {
                              // Si no hubo redirect el botón debe volver a su estado normal
                              try { setIsPaying(false) } catch {}
                            }
                          }
                          // Marcar que se está procesando el pago para deshabilitar el botón y mostrar feedback
                          setIsPaying(true)
                          doPay()
                        }}
                        disabled={!isDepositReady() || isPaying}
                        aria-disabled={!isDepositReady() || isPaying}
                      >
            {isPaying ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Procesando...
              </span>
            ) : (payFullNow ? `Pagar todo (${total}€)` : `Pagar depósito ${deposit}€`)}
                      </Button>
                      {/* Mensajes de error por campo ya mostrados inline sobre cada input */}

                      <p className="text-xs text-muted-foreground text-center">
                        {isQuick
                          ? "Después del pago podrás completar los datos faltantes para finalizar tu reserva."
                          : "Al confirmar el pago, aceptas nuestros términos y condiciones de servicio. Recibirás una confirmación por email con todos los detalles de tu reserva."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Additional Info */}
            <AnimatedSection animation="zoom-in" delay={500}>
              <Card className="mt-8">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-primary">¿Qué sucede después del pago?</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">1. Confirmación Inmediata</h4>
                        <p className="text-muted-foreground">Recibirás un email con los detalles de tu reserva</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">2. Recordatorio</h4>
                        <p className="text-muted-foreground">Te contactaremos 24h antes para confirmar detalles</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">3. Servicio Comodo</h4>
                        <p className="text-muted-foreground">Disfruta de tu traslado puntual y cómodo</p>
                      </div>
                    </div>
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

function EventImagesCarousel({ images, shortInfo }: { images: string[]; shortInfo?: string }) {
  const apiRef = useRef<CarouselApi | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    const start = () => {
      if (intervalRef.current) return
      intervalRef.current = setInterval(() => {
        apiRef.current?.scrollNext()
      }, 4000)
    }
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    if (!isHover) start()
    return () => stop()
  }, [isHover])

  return (
    <div className="relative" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
      <Carousel
        className="w-full h-56 sm:h-64 rounded-lg overflow-hidden"
        opts={{ align: "start", loop: true }}
        setApi={(api) => {
          // @ts-ignore: embla type channel
          apiRef.current = api
        }}
      >
        <CarouselContent className="h-full">
          {images.map((src: string, idx: number) => (
            <CarouselItem key={idx} className="h-full">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Ampliar imagen ${idx + 1}`}
                    className="relative block w-full h-56 sm:h-64"
                  >
                    <img src={src} alt={`Imagen ${idx + 1} del evento`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                  <div className="relative w-full h-[70vh]">
                    <img src={src} alt={`Imagen ${idx + 1} ampliada`} className="w-full h-full object-contain" />
                  </div>
                </DialogContent>
              </Dialog>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {shortInfo && (
        <p className="mt-3 text-sm text-muted-foreground">{shortInfo}</p>
      )}
    </div>
  )
}
