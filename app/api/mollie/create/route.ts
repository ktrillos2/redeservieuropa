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

    // Crear/guardar pedido(s) en Sanity con estado inicial
    try {
      // Si se envió un carrito con varios items, crear una orden por cada item y también la reserva actual si existe
      const items: any[] = Array.isArray(body?.carrito) ? body.carrito : []
      const docsToCreate: any[] = []

      // Helper para construir doc desde un elemento (item o booking)
      const buildDocFrom = (src: any) => {
        return {
          _type: 'order',
          orderNumber: undefined,
          status: 'pending',
          payment: {
            provider: 'mollie',
            paymentId: payment.id,
            status: 'open',
            amount: Number(src.totalPrice || amountNumber) || amountNumber,
            currency: 'EUR',
            requestedMethod: methodFromBody || undefined,
            createdAt: new Date().toISOString(),
            raw: JSON.stringify({ id: payment.id, links: (payment as any)?._links })
          },
          contact: src ? {
            name: src.contactName || src.name || booking?.contactName,
            email: src.contactEmail || src.email || booking?.contactEmail,
            phone: src.contactPhone || src.phone || booking?.contactPhone,
          } : undefined,
          service: src ? {
            type: src.isEvent ? 'evento' : (src.tourId || src.tipo === 'tour' ? 'tour' : 'traslado'),
            title: src.isEvent ? (src.eventTitle || 'Evento') : (src.tourId || src.serviceLabel || `${src.pickupAddress || ''} -> ${src.dropoffAddress || ''}`),
            date: src.date || src.fecha || undefined,
            time: src.time || src.hora || undefined,
            passengers: src.passengers ? Number(src.passengers) : (src.pasajeros ? Number(src.pasajeros) : undefined),
            pickupAddress: src.pickupAddress || src.pickup || undefined,
            dropoffAddress: src.dropoffAddress || src.dropoff || undefined,
            flightNumber: src.flightNumber || undefined,
            luggage23kg: Object.prototype.hasOwnProperty.call(src, 'luggage23kg') ? Number(src.luggage23kg) : undefined,
            luggage10kg: Object.prototype.hasOwnProperty.call(src, 'luggage10kg') ? Number(src.luggage10kg) : undefined,
            isNightTime: Boolean(src.isNightTime),
            extraLuggage: Boolean(src.extraLuggage),
            totalPrice: Number(src.totalPrice || amountNumber) || amountNumber,
            selectedPricingOption: src.selectedPricingOption || undefined,
            notes: src.specialRequests || undefined,
          } : undefined,
          metadata: { source: 'web', createdAt: new Date().toISOString() }
        }
      }

      // Crear docs desde carrito
      if (items.length > 0) {
        for (const it of items) {
          docsToCreate.push(buildDocFrom(it))
        }
      }

      // Agregar la reserva/booking actual como orden aparte si viene en el body
      if (booking) {
        docsToCreate.push(buildDocFrom(booking))
      }

      // Si no hay nada específico, crear al menos una orden vacía a partir del booking/amount
      if (docsToCreate.length === 0) {
        docsToCreate.push(buildDocFrom(booking || { totalPrice: amountNumber }))
      }

      for (const d of docsToCreate) {
        try {
          await serverClient.create(d)
        } catch (e) {
          console.error('[Sanity][orders] No se pudo crear una de las órdenes:', e)
        }
      }
    } catch (err) {
      console.error('[Sanity][orders] Error creando pedidos:', err)
    }

    return NextResponse.json({ id: payment.id, checkoutUrl })
  } catch (e: any) {
    console.error('[Mollie][create] Error', e)
    return NextResponse.json({ error: e?.message || 'Error creando pago' }, { status: 500 })
  }
}
