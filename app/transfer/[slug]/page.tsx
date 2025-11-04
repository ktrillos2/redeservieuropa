import { getTransferBySlug } from '@/sanity/lib/transfers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import HeaderServer from '@/components/header.server'
import { Footer } from '@/components/footer'
import { AnimatedSection } from '@/components/animated-section'
import { Clock, MapPin, Users, Info, CheckCircle } from 'lucide-react'

interface Params { slug: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const transfer = await getTransferBySlug(params.slug)
  if (!transfer) return { title: 'Traslado no encontrado' }
  const title = `${transfer.from} → ${transfer.to} | Traslado`;
  return {
    title,
    description: transfer.description || `Traslado ${transfer.from} a ${transfer.to}`
  }
}

export default async function TransferDetailPage({ params }: { params: Params }) {
  const transfer = await getTransferBySlug(params.slug)
  if (!transfer) notFound()
  
  const title = `${transfer.from} → ${transfer.to}`
  const isHourly = /\/h/.test(transfer.from) || transfer.from === 'Tour'
  
  // Construir tabla de precios si existe
  const priceTable = transfer.pricingTable ? [
    { pax: 4, price: transfer.pricingTable.p4 },
    { pax: 5, price: transfer.pricingTable.p5 },
    { pax: 6, price: transfer.pricingTable.p6 },
    { pax: 7, price: transfer.pricingTable.p7 },
    { pax: 8, price: transfer.pricingTable.p8 },
  ].filter(item => item.price !== undefined) : []

  // Precio base (de 4 pasajeros)
  const basePrice = transfer.pricingTable?.p4
  
  // URL de reserva
  const reserveHref = isHourly 
    ? '/tour/tour-nocturno'
    : `/pago?transfer=${encodeURIComponent(transfer.slug?.current || '')}`

  const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })

  return (
    <main className="min-h-screen bg-muted/30">
      <HeaderServer />
      
      <div className="container mx-auto px-4 pt-32 pb-24">
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="mb-8">
            <Link href="/#traslados" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-2">
              ← Volver a traslados
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header del traslado */}
              <Card className="overflow-hidden">
                <div className="p-8">
                  <h1 className="text-4xl font-bold font-display mb-3 text-primary">{title}</h1>
                  {transfer.briefInfo && (
                    <p className="text-lg text-muted-foreground">{transfer.briefInfo}</p>
                  )}
                </div>
              </Card>

              {/* Información general */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Info className="w-6 h-6 text-accent" />
                    Información del Traslado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">Origen</p>
                        <p className="text-lg font-medium">{transfer.from}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">Destino</p>
                        <p className="text-lg font-medium">{transfer.to}</p>
                      </div>
                    </div>
                  </div>

                  {transfer.duration && (
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <Clock className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">Duración estimada</p>
                        <p className="text-lg font-medium">{transfer.duration}</p>
                      </div>
                    </div>
                  )}

                  {transfer.description && (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-muted-foreground leading-relaxed">{transfer.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabla de precios */}
              {priceTable.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Users className="w-6 h-6 text-accent" />
                      Precios por Número de Pasajeros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {priceTable.map(({ pax, price }) => (
                        <div key={pax} className="p-4 bg-muted/50 rounded-lg text-center border-2 border-transparent hover:border-accent transition-colors">
                          <p className="text-2xl font-bold text-accent">{pax}</p>
                          <p className="text-xs text-muted-foreground mb-2">pasajeros</p>
                          <p className="text-lg font-semibold">{price}€</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      * Para grupos de 9 o más pasajeros, se aplica la tarifa de 8 pasajeros
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Notas e información adicional */}
              {(transfer.requireFlightInfo || transfer.requireFlightNumber) && (
                <Card className="border-accent/20 bg-accent/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      Información Requerida
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {transfer.requireFlightNumber && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        Número de vuelo obligatorio
                      </p>
                    )}
                    {transfer.requireFlightInfo && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        Información de vuelo requerida
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar de reserva (sticky) */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Reserva tu Traslado</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {basePrice && (
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Precio desde</p>
                      <p className="text-4xl font-bold text-accent">{euro.format(basePrice)}</p>
                      <p className="text-xs text-muted-foreground mt-2">Para 4 pasajeros</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Conductor profesional</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Vehículo de lujo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Servicio puerta a puerta</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>Sin costos ocultos</span>
                    </div>
                  </div>

                  {isHourly ? (
                    <Link href="/tour/tour-nocturno" className="block">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                        Ver Tour Nocturno
                      </Button>
                    </Link>
                  ) : (
                    <Link href={reserveHref} className="block">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                        Reservar Ahora
                      </Button>
                    </Link>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    Pagarás el <strong>20%</strong> como depósito. El resto se paga el día del servicio.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <Footer />
    </main>
  )
}
