"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, CreditCard, Shield, Clock, MapPin, Users, Luggage } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { calcBaseTransferPrice, isNightTime as pricingIsNightTime } from "@/lib/pricing"

export default function PaymentPage() {
  const [bookingData, setBookingData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = localStorage.getItem("bookingData")
    if (data) {
      setBookingData(JSON.parse(data))
    }
    setIsLoading(false)
  }, [])

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

        // Traslados con base conocida
        if (typeof n.basePrice === "number") {
          const base = Number(n.basePrice)
          const passengers = Number(n.passengers || 1)
          const extraPax = Math.max(0, passengers - 4) * 20
          const isNight = (() => {
            if (!n.time) return false
            const [hh] = String(n.time).split(":").map(Number)
            const h = hh || 0
            return h >= 21 || h < 6
          })()
          // Equipaje voluminoso: más de 3 maletas de 23Kg
          const extraLuggage = Number(n.luggage23kg || 0) > 3
          const extrasSum = extraPax + (isNight ? 5 : 0) + (extraLuggage ? 10 : 0)
          n.isNightTime = isNight
          n.extraLuggage = extraLuggage
          n.luggageCount = Number(n.luggage23kg || 0) + Number(n.luggage10kg || 0)
          n.totalPrice = Number((base + extrasSum).toFixed(2))
          return n
        }

        // Por defecto: mantener total
        return n
      }

      const computed = recalc(next)
      localStorage.setItem("bookingData", JSON.stringify(computed))
      return computed
    })
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
      ["tour-paris", "tour-nocturno", "paris-dl-dl"].includes(bookingData?.tourId || ""),
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
  const deposit = paymentMethod === "cash" ? (isTour ? Number((total * 0.1).toFixed(2)) : 5) : 0
  const remaining = Math.max(0, Number((total - deposit).toFixed(2)))
  const amountNow = isQuick ? 5 : (paymentMethod === "cash" ? deposit : total)

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
      if (bookingData?.isNightTime) extraLines.push("Recargo nocturno: +5€")
      if (bookingData?.extraLuggage) extraLines.push("Equipaje extra: +10€")
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

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <AnimatedSection animation="slide-left">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
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
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{bookingData.isEvent ? "Evento:" : "Servicio:"}</span>
                      <Badge className="bg-accent text-accent-foreground">
                        {serviceLabel}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {/* Pasajeros/Cupos editable */}
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{bookingData.isEvent ? "Cupos" : "Pasajeros"}</span>
                          <Input
                            type="number"
                            className="w-24"
                            min={1}
                            max={9}
                            value={bookingData.passengers || 1}
                            onChange={(e) => updateBookingField("passengers", Number(e.target.value))}
                          />
                        </div>
                      </div>

                      {/* Fecha y hora editable */}
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            className="w-40"
                            value={bookingData.date || ""}
                            onChange={(e) => updateBookingField("date", e.target.value)}
                          />
                          <Input
                            type="time"
                            className="w-28"
                            value={bookingData.time || ""}
                            onChange={(e) => updateBookingField("time", e.target.value)}
                          />
                        </div>
                      </div>

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

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary">Información de Contacto:</h4>
                      <p className="text-sm">{bookingData.contactName}</p>
                      <p className="text-sm text-muted-foreground">{bookingData.contactPhone}</p>
                      <p className="text-sm text-muted-foreground">{bookingData.contactEmail}</p>
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      {isQuick ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Pago de confirmación ahora</span>
                            <span>5€</span>
                          </div>
                          {total > 0 && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Importe estimado del servicio</span>
                              <span>{total}€</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">Después del pago completarás los datos faltantes para finalizar tu reserva.</p>
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
                        </>
                      ) : typeof bookingData.basePrice === "number" ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Precio base</span>
                            <span>{bookingData.basePrice}€</span>
                          </div>
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
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{bookingData.totalPrice}€</span>
                          </div>
                        </>
                      )}
                      {!isQuick && bookingData.isNightTime && (
                        <div className="flex justify-between text-sm">
                          <span>Recargo nocturno</span>
                          <span>+5€</span>
                        </div>
                      )}
                      {!isQuick && bookingData.extraLuggage && (
                        <div className="flex justify-between text-sm">
                          <span>Equipaje extra</span>
                          <span>+10€</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total a Pagar</span>
                        <span className="text-accent animate-pulse">{amountNow}€</span>
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
                            <span>5€</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Este pago asegura tu reserva. Después de pagarlo, terminarás de rellenar los datos faltantes.
                          </p>
                        </>
                      ) : paymentMethod === "cash" ? (
                        <>
                          <div className="flex justify-between">
                            <span>Confirmar tu reserva (depósito {isTour ? "10%" : "fijo"})</span>
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
                            <p>
                              Importe del depósito: {isTour ? "10% para tours/eventos" : "5€ para traslados"}.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Total a pagar ahora</span>
                            <span>{total}€</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Puedes pagar con tarjeta o PayPal de forma segura.</p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            * Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.
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
                          if (paymentMethod === "cash") {
                            sendWhatsApp()
                          } else {
                            // Aquí iría la integración de pago con tarjeta/PayPal
                          }
                        }}
                      >
            {isQuick ? "Pagar 5€ y confirmar" : "Pagar ahora"}
                      </Button>

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
