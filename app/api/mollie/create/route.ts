// app/api/mollie/create/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'

function formatAmount(val: number): string {
  return (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2)
}

function makeOrderNumber() {
  const t = new Date()
  const y = String(t.getFullYear()).slice(-2)
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const d = String(t.getDate()).padStart(2, '0')
  const h = String(t.getHours()).padStart(2, '0')
  const min = String(t.getMinutes()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2,6).toUpperCase()
  return `RSE-${y}${m}${d}-${h}${min}-${rand}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({})) as any
    const amountNumber = Number(body?.amount)
    const description: string = String(body?.description || 'Pago de reserva')
    const booking: any = body?.booking || (body?.metadata?.booking ?? undefined)

    const metadata: any = {
      source: (body?.metadata && body.metadata.source) || 'web',
      short: true,
    }
    const methodFromBody: string | undefined =
      typeof body?.method === 'string' ? body.method : undefined

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

    // 1) Crear pago con redirect provisional
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

    // 2) Actualizar redirect para incluir pid
    const finalRedirect = `${siteUrl}/gracias?pid=${encodeURIComponent(payment.id)}`
    try {
      await mollie.payments.update(payment.id, { redirectUrl: finalRedirect })
    } catch {
      // Si falla el update por cualquier motivo, seguimos con el redirect provisional
    }

    const checkoutUrl = (payment as any)?._links?.checkout?.href
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No se obtuvo checkoutUrl' }, { status: 500 })
    }

    // 3) Crear/guardar orden(es) inicial(es) en Sanity
    try {
      const items: any[] = Array.isArray(body?.carrito) ? body.carrito : []
      const docsToCreate: any[] = []

      // Helper para construir doc desde un elemento (item o booking)
const buildDocFrom = (src: any) => {
  // --- flags útiles enviados desde el front
  const payFullNow = Boolean(src?.payFullNow)
  const referralSource = src?.referralSource || src?.comoNosConocio || src?.heardFrom || null
  const depositPercent = typeof src?.depositPercent === 'number' ? src.depositPercent : null

  // --- Generador de número de orden único (RSE-YYMMDD-HHMM-XXXX)
  const makeOrderNumber = () => {
    const t = new Date()
    const y = String(t.getFullYear()).slice(-2)
    const m = String(t.getMonth() + 1).padStart(2, '0')
    const d = String(t.getDate()).padStart(2, '0')
    const h = String(t.getHours()).padStart(2, '0')
    const min = String(t.getMinutes()).padStart(2, '0')
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `RSE-${y}${m}${d}-${h}${min}-${rand}`
  }

  // --- detección robusta del tipo TOUR
  const isTour =
    !!src?.tourId ||
    !!src?.tourDoc ||
    !!src?.tourData ||
    !!src?.selectedTourSlug ||
    src?.quickType === 'tour' ||
    src?.isTourQuick === true ||
    src?.tipo === 'tour' ||
    !!src?.categoriaTour

  // --- elegir título correcto
  const tourTitle =
    src?.tourDoc?.title ||
    src?.tourData?.title ||
    src?.tourTitle ||
    (typeof src?.selectedTourSlug === 'string' ? src.selectedTourSlug : undefined)

  const trasladoTitle =
    src?.serviceLabel ||
    `${src?.pickupAddress || ''}${src?.pickupAddress && src?.dropoffAddress ? ' -> ' : ''}${src?.dropoffAddress || ''}`

  return {
    _type: 'order',
    orderNumber: makeOrderNumber(), // 👈 orden única
    status: 'pending',
    payment: {
      provider: 'mollie',
      paymentId: payment.id,
      status: 'open',
      amount: Number(src.totalPrice || amountNumber) || amountNumber,
      currency: 'EUR',
      requestedMethod: methodFromBody || undefined,
      createdAt: new Date().toISOString(),
      // persistimos banderas útiles para emails/calendar
      payFullNow,
      depositPercent,
      raw: JSON.stringify({ id: payment.id, links: (payment as any)?._links }),
    },
    contact: src
      ? {
          name: src.contactName || src.name || booking?.contactName,
          email: src.contactEmail || src.email || booking?.contactEmail,
          phone: src.contactPhone || src.phone || booking?.contactPhone,
          referralSource: referralSource || booking?.referralSource || null,
        }
      : undefined,
    service: src
      ? {
          type: src.isEvent ? 'evento' : isTour ? 'tour' : 'traslado',
          title: src.isEvent
            ? src.eventTitle || 'Evento'
            : isTour
            ? tourTitle || 'Tour'
            : trasladoTitle || 'Traslado',
          date: src.date || src.fecha || undefined,
          time: src.time || src.hora || src.arrivalTime || undefined,
          passengers: src.passengers
            ? Number(src.passengers)
            : src.pasajeros
            ? Number(src.pasajeros)
            : undefined,
          pickupAddress: src.pickupAddress || src.pickup || undefined,
          dropoffAddress: src.dropoffAddress || src.dropoff || undefined,
          flightNumber: src.flightNumber || src.numeroVuelo || undefined,
flightArrivalTime: src.flightArrivalTime || undefined,
flightDepartureTime: src.flightDepartureTime || undefined,
          ninos: src.ninos ?? undefined,
          ninosMenores9: src.ninosMenores9 ?? undefined,
          luggage23kg: Object.prototype.hasOwnProperty.call(src, 'luggage23kg')
            ? Number(src.luggage23kg)
            : undefined,
          luggage10kg: Object.prototype.hasOwnProperty.call(src, 'luggage10kg')
            ? Number(src.luggage10kg)
            : undefined,
          isNightTime: Boolean(src.isNightTime),
          extraLuggage: Boolean(src.extraLuggage),
          totalPrice: Number(src.totalPrice || amountNumber) || amountNumber,
          selectedPricingOption: src.selectedPricingOption || undefined,
          notes: src.specialRequests || undefined,
          payFullNow,
          depositPercent,
        }
      : undefined,
    metadata: { source: 'web', createdAt: new Date().toISOString() },
  }
}

      if (items.length > 0) {
        for (const it of items) docsToCreate.push(buildDocFrom(it))
      }
      if (booking) docsToCreate.push(buildDocFrom(booking))
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