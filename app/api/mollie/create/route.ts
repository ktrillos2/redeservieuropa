import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'

function formatAmount(val: number): string {
  return (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2)
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const amountNumber = Number(body?.amount)
    const description: string = String(body?.description || 'Pago de reserva')
    // Aceptamos "booking" fuera de metadata para no exceder límites de Mollie
    const booking: any = body?.booking || (body?.metadata?.booking ?? undefined)
    // Solo enviamos metadata mínima a Mollie (<=1024 bytes)
    const metadata: any = {
      source: (body?.metadata && body.metadata.source) || 'web',
      short: true,
    }
  const methodFromBody: string | undefined = typeof body?.method === 'string' ? body.method : undefined

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return NextResponse.json({ error: 'Monto inválido' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (!siteUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_SITE_URL no configurado' }, { status: 500 })
    }
    const webhookUrlFromEnv = process.env.MOLLIE_WEBHOOK_URL
    const webhookToken = process.env.MOLLIE_WEBHOOK_TOKEN

    const mollie = getMollieClient()

    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: formatAmount(amountNumber) },
      description,
      redirectUrl: `${siteUrl}/gracias`,
      webhookUrl: webhookUrlFromEnv && webhookUrlFromEnv.length > 0
        ? webhookUrlFromEnv
        : (webhookToken ? `${siteUrl}/api/mollie/webhook?token=${encodeURIComponent(webhookToken)}` : undefined),
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
      },
    })
    if (!webhookUrlFromEnv && webhookToken) {
      console.log('[Mollie][create] Webhook interno activado:', `${siteUrl}/api/mollie/webhook?token=***`)
    }

    const checkoutUrl = (payment as any)?._links?.checkout?.href
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No se obtuvo checkoutUrl' }, { status: 500 })
    }

    // Crear/guardar pedido en Sanity con estado inicial
    try {
      // Usar el booking completo recibido en body para guardar en Sanity
      const orderDoc: any = {
        _type: 'order',
        orderNumber: undefined,
        status: 'pending',
        payment: {
          provider: 'mollie',
          paymentId: payment.id,
          status: 'open',
          amount: amountNumber,
          currency: 'EUR',
          // Guardar preferencia elegida en la web (no forzada en Mollie)
          requestedMethod: methodFromBody || undefined,
          // No establecer método real aquí; se actualizará por webhook/sync
          createdAt: new Date().toISOString(),
          raw: JSON.stringify({ id: payment.id, links: (payment as any)?._links })
  },
  contact: booking ? {
          name: booking.contactName,
          email: booking.contactEmail,
          phone: booking.contactPhone,
        } : undefined,
        service: booking ? {
          type: booking.isEvent ? 'evento' : (booking.tourId ? 'tour' : 'traslado'),
          title: booking.isEvent ? (booking.eventTitle || 'Evento') : (booking.tourId || `${booking.pickupAddress || ''} -> ${booking.dropoffAddress || ''}`),
          date: booking.date || undefined,
          time: booking.time || undefined,
          passengers: Number(booking.passengers || 0) || undefined,
          pickupAddress: booking.pickupAddress || undefined,
          dropoffAddress: booking.dropoffAddress || undefined,
          flightNumber: booking.flightNumber || undefined,
          luggage23kg: Number(booking.luggage23kg || 0) || undefined,
          luggage10kg: Number(booking.luggage10kg || 0) || undefined,
          isNightTime: Boolean(booking.isNightTime),
          extraLuggage: Boolean(booking.extraLuggage),
          totalPrice: Number(booking.totalPrice || amountNumber) || amountNumber,
          selectedPricingOption: booking.selectedPricingOption || undefined,
          notes: booking.specialRequests || undefined,
        } : undefined,
        metadata: {
          source: 'web',
          createdAt: new Date().toISOString(),
        }
      }
      await serverClient.create(orderDoc)
    } catch (err) {
      console.error('[Sanity][orders] No se pudo crear el pedido:', err)
    }

    return NextResponse.json({ id: payment.id, checkoutUrl })
  } catch (e: any) {
    console.error('[Mollie][create] Error', e)
    return NextResponse.json({ error: e?.message || 'Error creando pago' }, { status: 500 })
  }
}
