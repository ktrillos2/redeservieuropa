"use client"

import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from '@/contexts/i18n-context'
import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { AnimatedSection } from '@/components/animated-section'
import { Clock, MapPin, Users, Info, CheckCircle } from 'lucide-react'

interface Params { slug: string }

export default function TransferDetailPage({ params }: { params: Params }) {
  const [transfer, setTransfer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { locale } = useTranslation()

  // Traducciones estáticas locales
  const staticTexts = useMemo(() => {
    const texts = {
      es: {
        backToTransfers: 'Volver a traslados',
        transferInfo: 'Información del Traslado',
        origin: 'Origen',
        destination: 'Destino',
        estimatedDuration: 'Duración estimada',
        pricesByPassengers: 'Precios por Número de Pasajeros',
        passengers: 'pasajeros',
        groupNote: '* Para grupos de 9 o más pasajeros, se aplica la tarifa de 8 pasajeros',
        requiredInfo: 'Información Requerida',
        flightNumberRequired: 'Número de vuelo obligatorio',
        flightInfoRequired: 'Información de vuelo requerida',
        bookYourTransfer: 'Reserva tu Traslado',
        priceFrom: 'Precio desde',
        forPassengers: 'Para 4 pasajeros',
        professionalDriver: 'Conductor profesional',
        luxuryVehicle: 'Vehículo de lujo',
        doorToDoor: 'Servicio puerta a puerta',
        noHiddenCosts: 'Sin costos ocultos',
        viewNightTour: 'Ver Tour Nocturno',
        bookNow: 'Reservar Ahora',
        depositNote: 'Pagarás el',
        depositPercent: '20%',
        depositRest: 'como depósito. El resto se paga el día del servicio.',
        loading: 'Cargando...',
        notFound: 'Traslado no encontrado',
      },
      en: {
        backToTransfers: 'Back to transfers',
        transferInfo: 'Transfer Information',
        origin: 'Origin',
        destination: 'Destination',
        estimatedDuration: 'Estimated duration',
        pricesByPassengers: 'Prices by Number of Passengers',
        passengers: 'passengers',
        groupNote: '* For groups of 9 or more passengers, the 8-passenger rate applies',
        requiredInfo: 'Required Information',
        flightNumberRequired: 'Flight number required',
        flightInfoRequired: 'Flight information required',
        bookYourTransfer: 'Book Your Transfer',
        priceFrom: 'Price from',
        forPassengers: 'For 4 passengers',
        professionalDriver: 'Professional driver',
        luxuryVehicle: 'Luxury vehicle',
        doorToDoor: 'Door-to-door service',
        noHiddenCosts: 'No hidden costs',
        viewNightTour: 'View Night Tour',
        bookNow: 'Book Now',
        depositNote: 'You will pay',
        depositPercent: '20%',
        depositRest: 'as a deposit. The rest is paid on the day of service.',
        loading: 'Loading...',
        notFound: 'Transfer not found',
      },
      fr: {
        backToTransfers: 'Retour aux transferts',
        transferInfo: 'Informations sur le Transfert',
        origin: 'Origine',
        destination: 'Destination',
        estimatedDuration: 'Durée estimée',
        pricesByPassengers: 'Prix par Nombre de Passagers',
        passengers: 'passagers',
        groupNote: '* Pour les groupes de 9 passagers ou plus, le tarif de 8 passagers s\'applique',
        requiredInfo: 'Informations Requises',
        flightNumberRequired: 'Numéro de vol obligatoire',
        flightInfoRequired: 'Informations de vol requises',
        bookYourTransfer: 'Réservez Votre Transfert',
        priceFrom: 'Prix à partir de',
        forPassengers: 'Pour 4 passagers',
        professionalDriver: 'Chauffeur professionnel',
        luxuryVehicle: 'Véhicule de luxe',
        doorToDoor: 'Service porte-à-porte',
        noHiddenCosts: 'Sans frais cachés',
        viewNightTour: 'Voir le Tour de Nuit',
        bookNow: 'Réserver Maintenant',
        depositNote: 'Vous paierez',
        depositPercent: '20%',
        depositRest: 'd\'acompte. Le reste est payé le jour du service.',
        loading: 'Chargement...',
        notFound: 'Transfert non trouvé',
      },
    }
    return texts[locale] || texts.es
  }, [locale])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const query = `*[_type == "transfer" && slug.current == $slug][0]{
          _id,
          from,
          to,
          slug,
          briefInfo,
          description,
          duration,
          pricingTable,
          requireFlightInfo,
          requireFlightNumber
        }`
        const result = await client.fetch(query, { slug: params.slug })
        if (!mounted) return
        console.log("[TransferDetailPage] Transfer cargado desde Sanity para locale:", locale)
        console.log("[TransferDetailPage] Transfer:", result)
        setTransfer(result)
      } catch (e) {
        console.warn('[TransferDetailPage] Error cargando transfer:', e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [params.slug, locale])

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-24">
          <p className="text-center text-muted-foreground">{staticTexts.loading}</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!transfer) {
    return (
      <main className="min-h-screen bg-muted/30">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-24">
          <p className="text-center text-muted-foreground">{staticTexts.notFound}</p>
        </div>
        <Footer />
      </main>
    )
  }
  
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

  const euro = new Intl.NumberFormat(locale === 'en' ? 'en-US' : locale === 'fr' ? 'fr-FR' : 'es-ES', { 
    style: "currency", 
    currency: "EUR", 
    maximumFractionDigits: 0 
  })

  return (
    <main className="min-h-screen bg-muted/30">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-24">
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="mb-8">
            <Link href="/#traslados" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-2">
              ← {staticTexts.backToTransfers}
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
                    {staticTexts.transferInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">{staticTexts.origin}</p>
                        <p className="text-lg font-medium">{transfer.from}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">{staticTexts.destination}</p>
                        <p className="text-lg font-medium">{transfer.to}</p>
                      </div>
                    </div>
                  </div>

                  {transfer.duration && (
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <Clock className="w-5 h-5 text-accent" />
                      <div>
                        <p className="font-semibold text-sm text-muted-foreground">{staticTexts.estimatedDuration}</p>
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
                      {staticTexts.pricesByPassengers}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {priceTable.map(({ pax, price }) => (
                        <div key={pax} className="p-4 bg-muted/50 rounded-lg text-center border-2 border-transparent hover:border-accent transition-colors">
                          <p className="text-2xl font-bold text-accent">{pax}</p>
                          <p className="text-xs text-muted-foreground mb-2">{staticTexts.passengers}</p>
                          <p className="text-lg font-semibold">{price}€</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      {staticTexts.groupNote}
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
                      {staticTexts.requiredInfo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {transfer.requireFlightNumber && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        {staticTexts.flightNumberRequired}
                      </p>
                    )}
                    {transfer.requireFlightInfo && (
                      <p className="text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-accent rounded-full"></span>
                        {staticTexts.flightInfoRequired}
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
                  <CardTitle className="text-2xl text-primary">{staticTexts.bookYourTransfer}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {basePrice && (
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">{staticTexts.priceFrom}</p>
                      <p className="text-4xl font-bold text-accent">{euro.format(basePrice)}</p>
                      <p className="text-xs text-muted-foreground mt-2">{staticTexts.forPassengers}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>{staticTexts.professionalDriver}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>{staticTexts.luxuryVehicle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>{staticTexts.doorToDoor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span>{staticTexts.noHiddenCosts}</span>
                    </div>
                  </div>

                  {isHourly ? (
                    <Link href="/tour/tour-nocturno" className="block">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                        {staticTexts.viewNightTour}
                      </Button>
                    </Link>
                  ) : (
                    <Link href={reserveHref} className="block">
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                        {staticTexts.bookNow}
                      </Button>
                    </Link>
                  )}

                  <p className="text-xs text-center text-muted-foreground">
                    {staticTexts.depositNote} <strong>{staticTexts.depositPercent}</strong> {staticTexts.depositRest}
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
