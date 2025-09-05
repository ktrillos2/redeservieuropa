"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, CreditCard, Shield, Clock, MapPin, Users, Luggage, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"

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
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Servicio:</span>
                      <Badge className="bg-accent text-accent-foreground">
                        {bookingData.tourId.replace("-", " → ").toUpperCase()}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="text-sm">Pasajeros: {bookingData.passengers}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-sm">
                          Fecha y Hora: {bookingData.date} a las {bookingData.time}
                        </span>
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

                      <div className="flex items-center gap-3">
                        <Luggage className="w-4 h-4 text-accent" />
                        <span className="text-sm">Equipaje: {bookingData.luggageCount} maleta(s)</span>
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
                      <div className="flex justify-between text-sm">
                        <span>Precio base</span>
                        <span>
                          {bookingData.totalPrice -
                            (bookingData.isNightTime ? 5 : 0) -
                            (bookingData.extraLuggage ? 10 : 0)}
                          €
                        </span>
                      </div>
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
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total a Pagar</span>
                        <span className="text-accent animate-pulse">{bookingData.totalPrice}€</span>
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
                        <div className="flex items-center space-x-3 p-4 border border-accent rounded-lg bg-accent/5">
                          <input type="radio" name="payment" value="paypal" defaultChecked className="text-accent" />
                          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                          <span>PayPal</span>
                          <Badge variant="secondary" className="ml-auto">
                            Recomendado
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                          <input type="radio" name="payment" value="custom-link" className="text-accent" />
                          <ExternalLink className="w-5 h-5 text-accent" />
                          <div className="flex-1">
                            <span>Link de Pago Personalizado</span>
                            <p className="text-xs text-muted-foreground">Te enviaremos un enlace seguro por WhatsApp</p>
                          </div>
                        </div>
                      </div>
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
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span>Cancelación gratuita hasta 24h antes</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Confirmation Button */}
                    <div className="space-y-4">
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300"
                        size="lg"
                      >
                        Confirmar Pago - {bookingData.totalPrice}€
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Al confirmar el pago, aceptas nuestros términos y condiciones de servicio. Recibirás una
                        confirmación por email con todos los detalles de tu reserva.
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
                        <h4 className="font-medium">3. Servicio Premium</h4>
                        <p className="text-muted-foreground">Disfruta de tu traslado de lujo puntual y cómodo</p>
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
