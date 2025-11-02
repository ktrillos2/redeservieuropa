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

    // 3) Crear UNA ÚNICA orden en Sanity con todos los servicios
    try {
      const items: any[] = Array.isArray(body?.carrito) ? body.carrito : []
      const allServices: any[] = []
      
      // Extraer información de contacto (priorizar body.contact > booking)
      const contactName = body?.contact?.name || booking?.contactName || booking?.name || 'Cliente'
      const contactEmail = body?.contact?.email || booking?.contactEmail || booking?.email || ''
      const contactPhone = body?.contact?.phone || booking?.contactPhone || booking?.phone || ''
      const referralSource = body?.referralSource || booking?.referralSource || booking?.comoNosConocio || booking?.heardFrom || null
      
      // Flags de pago
      const payFullNow = Boolean(body?.payFullNow || booking?.payFullNow)
      const depositPercent = typeof body?.depositPercent === 'number' 
        ? body.depositPercent 
        : typeof booking?.depositPercent === 'number'
        ? booking.depositPercent
        : null

      // Helper para construir objeto de servicio
      const buildServiceObject = (src: any) => {
        const isTour =
          !!src?.tourId ||
          !!src?.tourDoc ||
          !!src?.tourData ||
          !!src?.selectedTourSlug ||
          src?.quickType === 'tour' ||
          src?.isTourQuick === true ||
          src?.tipo === 'tour' ||
          !!src?.categoriaTour

        const tourTitle =
          src?.tourDoc?.title ||
          src?.tourData?.title ||
          src?.tourTitle ||
          (typeof src?.selectedTourSlug === 'string' ? src.selectedTourSlug : undefined)

        const trasladoTitle =
          src?.serviceLabel ||
          `${src?.pickupAddress || ''}${src?.pickupAddress && src?.dropoffAddress ? ' → ' : ''}${src?.dropoffAddress || ''}`

        const serviceType = src.isEvent ? 'evento' : isTour ? 'tour' : 'traslado'
        
        // 👇 Calcular depositPercent automáticamente según el tipo
        const isPayingFullNow = Boolean(src.payFullNow || payFullNow)
        let calculatedDepositPercent: number
        
        if (isPayingFullNow) {
          calculatedDepositPercent = 100
        } else if (typeof src.depositPercent === 'number') {
          // Si viene especificado desde el front, respetarlo
          calculatedDepositPercent = src.depositPercent
        } else if (typeof depositPercent === 'number') {
          // Si viene en el body general
          calculatedDepositPercent = depositPercent
        } else {
          // Calcular según el tipo: 10% traslado, 20% tour, 15% evento
          if (serviceType === 'tour') {
            calculatedDepositPercent = 20
          } else if (serviceType === 'evento') {
            calculatedDepositPercent = 15
          } else {
            calculatedDepositPercent = 10 // traslado
          }
        }

        return {
          type: serviceType,
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
          ninos: src.ninos ?? undefined,
          ninosMenores9: src.ninosMenores9 ?? undefined,
          luggage23kg: Object.prototype.hasOwnProperty.call(src, 'luggage23kg')
            ? Number(src.luggage23kg)
            : undefined,
          luggage10kg: Object.prototype.hasOwnProperty.call(src, 'luggage10kg')
            ? Number(src.luggage10kg)
            : undefined,
          isNightTime: Boolean(src.isNightTime),
          totalPrice: Number(src.totalPrice || 0),
          notes: src.specialRequests || undefined,
          payFullNow: isPayingFullNow,
          depositPercent: calculatedDepositPercent, // 👈 Calculado automáticamente
        }
      }

      // Agregar servicios del carrito
      if (items.length > 0) {
        for (const it of items) {
          allServices.push(buildServiceObject(it))
        }
      }

      // Agregar servicio principal (booking) si existe
      if (booking) {
        allServices.push(buildServiceObject(booking))
      }

      // Si no hay servicios, crear uno por defecto
      if (allServices.length === 0) {
        allServices.push({
          type: 'traslado',
          title: 'Servicio',
          totalPrice: amountNumber,
          payFullNow,
          depositPercent: payFullNow ? 100 : 10, // 10% por defecto para traslado
        })
      }

      // Crear UNA ÚNICA orden con todos los servicios
      const orderDoc = {
        _type: 'order',
        orderNumber: makeOrderNumber(),
        status: 'pending',
        payment: {
          provider: 'mollie',
          paymentId: payment.id,
          status: 'open',
          amount: amountNumber,
          currency: 'EUR',
          requestedMethod: methodFromBody || undefined,
          createdAt: new Date().toISOString(),
          payFullNow,
          depositPercent,
          raw: JSON.stringify({ id: payment.id, links: (payment as any)?._links }),
        },
        contact: {
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          referralSource: referralSource,
        },
        services: allServices, // 👈 Array de servicios
        metadata: { source: 'web', createdAt: new Date().toISOString() },
      }

      await serverClient.create(orderDoc)
      
      // Log detallado con los porcentajes calculados
      const servicesLog = allServices.map((s, idx) => 
        `${idx + 1}. ${s.title || s.type} (${s.type}): €${s.totalPrice} × ${s.depositPercent}% = €${(s.totalPrice * s.depositPercent / 100).toFixed(2)}`
      ).join(' | ')
      
      console.log(`[Mollie][create] ✅ Orden ${orderDoc.orderNumber} creada:`)
      console.log(`  👤 Cliente: ${contactName}`)
      console.log(`  💰 Total: €${amountNumber}`)
      console.log(`  📦 Servicios (${allServices.length}): ${servicesLog}`)


    } catch (err) {
      console.error('[Sanity][orders] Error creando pedido:', err)
    }

    return NextResponse.json({ id: payment.id, checkoutUrl })
  } catch (e: any) {
    console.error('[Mollie][create] Error', e)
    return NextResponse.json({ error: e?.message || 'Error creando pago' }, { status: 500 })
  }
}