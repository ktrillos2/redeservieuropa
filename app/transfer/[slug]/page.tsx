import { getTransferBySlug } from '@/sanity/lib/transfers'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Params { slug: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const transfer = await getTransferBySlug(params.slug)
  if (!transfer) return { title: 'Traslado no encontrado' }
  const title = `${transfer.from} → ${transfer.to} | Traslado`;
  return {
    title,
    description: transfer.description || `Traslado ${transfer.from} a ${transfer.to} con tarifa ${transfer.price}`
  }
}

export default async function TransferDetailPage({ params }: { params: Params }) {
  const transfer = await getTransferBySlug(params.slug)
  if (!transfer) notFound()
  const title = `${transfer.from} → ${transfer.to}`
  const isHourly = /\/h/.test(transfer.price) || transfer.from === 'Tour'
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <Link href="/#traslados" className="text-sm text-muted-foreground hover:underline">← Volver a traslados</Link>
      </div>
      <h1 className="text-4xl font-bold mb-6 text-primary font-display">{title}</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Información del Traslado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p><strong>Precio:</strong> {transfer.price}</p>
              {transfer.duration && <p><strong>Duración estimada:</strong> {transfer.duration}</p>}
              {transfer.description && <p className="text-muted-foreground">{transfer.description}</p>}
              {transfer.isSpecial && transfer.subtitle && <p><strong>Detalles:</strong> {transfer.subtitle}</p>}
              {transfer.notes && <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">{transfer.notes}</p>}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              {isHourly ? (
                <Link href="/tour/tour-nocturno">
                  <Button className="w-full">Ver tour nocturno</Button>
                </Link>
              ) : (
                <Link href={`/pago?transfer=${encodeURIComponent(transfer.slug?.current || '')}`}>
                  <Button className="w-full">Reservar ahora</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
