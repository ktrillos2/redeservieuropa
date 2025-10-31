import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'
import { buildOrderEventPayload, createCalendarEvent, getCalendarEventById } from '@/lib/google-calendar'
import { sendMail } from '@/lib/mailer'
import { renderClientThanksEmailMulti, renderAdminNewServicesEmailMulti } from '@/lib/email-templates'

/*───────────────────────────────────────────────────────────────*
 *   🔐 MailLock atómico para evitar correos duplicados
 *───────────────────────────────────────────────────────────────*/
async function acquireMailLock(paymentId: string): Promise<boolean> {
  const _id = `mailLock.payment_${paymentId}`
  try {
    await serverClient.createIfNotExists({
      _id,
      _type: 'mailLock',
      paymentId,
      createdAt: new Date().toISOString(),
      sentAt: null,
      sendingAt: null,
      lockAt: null,
      lockBy: null,
    } as any)

    const existing: any = await serverClient.getDocument(_id)
    if (!existing) return false

    if (existing.sentAt) return false

    if (existing.sendingAt && Date.now() - new Date(existing.sendingAt).getTime() < 45_000) {
      return false
    }

    const patch = serverClient
      .patch(_id)
      .ifRevisionId(existing._rev) // 👈 lock atómico
      .set({
        lockAt: new Date().toISOString(),
        lockBy: 'orders/sync',
        sendingAt: new Date().toISOString(),
      })

    await patch.commit({ returnDocuments: false })
    return true
  } catch (e) {
    console.warn('[sync][mailLock] no adquirido (race)', e?.message || e)
    return false
  }
}

async function markMailSent(paymentId: string) {
  const _id = `mailLock.payment_${paymentId}`
  try {
    await serverClient
      .patch(_id)
      .set({ sentAt: new Date().toISOString(), sendingAt: null })
      .commit({ returnDocuments: false })
  } catch (e) {
    console.error('[sync][mailLock] mark sent error', e)
  }
}

/*───────────────────────────────────────────────────────────────*
 *   🧾 POST /api/orders/sync
 *───────────────────────────────────────────────────────────────*/
export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const mollie = getMollieClient()
    let payment: any
    let status: string = 'pending'
    try {
      payment = await mollie.payments.get(paymentId)
      status = payment.status
    } catch (err) {
      console.warn('[orders/sync] Mollie error o entorno local', err)
    }

    const orders = await serverClient.fetch<Array<any>>(
      `*[_type == "order" && payment.paymentId == $pid]{
        _id,
        services[]{
          type,title,date,time,totalPrice,passengers,
          pickupAddress,dropoffAddress,
          flightNumber,flightArrivalTime,flightDepartureTime,
          luggage23kg,luggage10kg,ninos,isNightTime,
          payFullNow,depositPercent
        },
        payment{status,method,requestedMethod,currency,payFullNow,depositPercent},
        contact{name,email,phone,referralSource}
      }`,
      { pid: paymentId }
    )

    if (!orders?.length)
      return NextResponse.json({ ok: true, note: 'no-orders' })

    /*──────── PATCH: actualiza órdenes a pagadas ────────*/
    if (status === 'paid') {
      for (const o of orders) {
        await serverClient.patch(o._id).set({
          'payment.status': 'paid',
          'payment.paidAt': new Date().toISOString(),
          status: 'paid',
          'metadata.updatedAt': new Date().toISOString(),
        }).commit()
        console.log('[orders/sync] order patched', { orderId: o._id, status: 'paid' })
      }
    }

    /*──────── Google Calendar: 1 evento por cada servicio de cada orden ────────*/
    if (status === 'paid') {
      for (const ord of orders) {
        const services = ord.services || []
        
        for (let idx = 0; idx < services.length; idx++) {
          const service = services[idx]
          
          // Calcular pago según depositPercent del servicio
          const total = Number(service?.totalPrice || 0)
          const pct = service?.depositPercent || ord.payment?.depositPercent || 
                     (service?.type === 'tour' ? 20 : service?.type === 'evento' ? 15 : 10)
          const paidAmount = Number((total * pct / 100).toFixed(1))

          // Crear payload para Google Calendar con la fecha y hora correcta en zona horaria de París
          const payload = buildOrderEventPayload({
            service,
            payment: { ...ord.payment, paidAmount, depositPercent: pct },
            contact: ord.contact,
          })

          try {
            const evt = await createCalendarEvent(payload, `${paymentId}:${ord._id}:${idx}`)
            if (evt?.id) {
              console.log('[orders/sync] event created', { 
                orderId: ord._id, 
                serviceIdx: idx, 
                eventId: evt.id,
                date: service.date,
                time: service.time
              })
            }
          } catch (err) {
            console.error('[orders/sync] calendar error', { 
              orderId: ord._id, 
              serviceIdx: idx, 
              error: err?.message || err 
            })
          }
        }
      }
    }

    /*──────── Envío de correos (idempotente) ────────*/
    if (status === 'paid') {
      // Calcular totales considerando todos los servicios
      let totalAmount = 0
      let paidAmount = 0
      
      for (const ord of orders) {
        for (const service of (ord.services || [])) {
          const total = Number(service?.totalPrice || 0)
          const pct = service?.depositPercent || ord.payment?.depositPercent || 
                     (service?.type === 'tour' ? 20 : service?.type === 'evento' ? 15 : 10)
          totalAmount += total
          paidAmount += total * pct / 100
        }
      }
      
      paidAmount = Number(paidAmount.toFixed(1))
      
      const acquired = await acquireMailLock(paymentId)

      if (acquired) {
        // Aplanar todos los servicios de todas las órdenes
        const allServices = orders.flatMap(o => o.services || [])
        const contact = orders.find(o => o.contact?.email)?.contact

        const adminHtml = renderAdminNewServicesEmailMulti({
          mollieId: paymentId,
          amount: paidAmount,
          currency: orders[0]?.payment?.currency || 'EUR',
          contact,
          services: allServices,
        })

        const clientHtml = contact
          ? renderClientThanksEmailMulti({
              mollieId: paymentId,
              amount: paidAmount,
              currency: orders[0]?.payment?.currency || 'EUR',
              contact,
              services: allServices,
            })
          : null

        // Admin
        await sendMail({
          to: ['redeservieuropa@gmail.com'],
          bcc: 'info@redeservieuropa.com',
          subject: 'Nuevos servicios confirmados',
          html: adminHtml,
          from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>',
        })

        // Cliente
        if (contact?.email && clientHtml) {
          await sendMail({
            to: contact.email,
            subject: '¡Gracias por tu pago!',
            html: clientHtml,
            from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>',
          })
        }

        await markMailSent(paymentId)
        console.log('[orders/sync][mail] Correos enviados y lock marcado.')
      } else {
        console.log('[orders/sync][mail] lock ya adquirido; no se reenvían correos.')
      }
    }

    return NextResponse.json({ ok: true, status })
  } catch (e: any) {
    console.error('[Orders][sync] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}

/*──────── PUT de respaldo: recrea eventos faltantes ────────*/
export async function PUT(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const orders = await serverClient.fetch<Array<any>>(
  `*[_type == "order" && payment.paymentId == $pid]{
    _id,
    calendar{eventId},
    services[]{
      type,title,date,time,totalPrice,passengers,
      pickupAddress,dropoffAddress,
      flightNumber,flightArrivalTime,flightDepartureTime,
      luggage23kg,luggage10kg,ninos,isNightTime,
      payFullNow,depositPercent
    },
    payment{method,requestedMethod,currency,payFullNow,depositPercent},
    contact{name,email,phone,referralSource}
  }`,
  { pid: paymentId }
)

    const results: any[] = []

    for (const ord of orders) {
      const services = ord.services || []
      
      for (let idx = 0; idx < services.length; idx++) {
        const service = services[idx]
        
        // Calcular pago según depositPercent del servicio
        const total = Number(service?.totalPrice || 0)
        const pct = service?.depositPercent || ord.payment?.depositPercent || 
                   (service?.type === 'tour' ? 20 : service?.type === 'evento' ? 15 : 10)
        const paidAmount = Number((total * pct / 100).toFixed(1))
        
        const payload = buildOrderEventPayload({
          service,
          payment: { ...ord.payment, paidAmount, depositPercent: pct },
          contact: ord.contact,
        })
        
        try {
          const evt = await createCalendarEvent(payload, `${paymentId}:${ord._id}:${idx}`)
          if (evt?.id) {
            console.log('[orders/sync PUT] event created', { 
              orderId: ord._id, 
              serviceIdx: idx, 
              eventId: evt.id 
            })
          }
          results.push({ orderId: ord._id, serviceIdx: idx, created: Boolean(evt?.id) })
        } catch (err) {
          console.error('[orders/sync PUT] calendar error', { 
            orderId: ord._id, 
            serviceIdx: idx, 
            error: err?.message || err 
          })
          results.push({ orderId: ord._id, serviceIdx: idx, error: err?.message || err })
        }
      }
    }
    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    console.error('[Orders][sync PUT] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
