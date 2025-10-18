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
    calendar{eventId},
    service{
      type,title,date,time,totalPrice,passengers,
      pickupAddress,dropoffAddress,
      flightNumber,flightArrivalTime,flightDepartureTime,
      luggage23kg,luggage10kg,isNightTime,extraLuggage,
      selectedPricingOption
    },
    payment{method,requestedMethod,currency},
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

    /*──────── Google Calendar: 1 evento por servicio ────────*/
    if (status === 'paid') {
      for (const ord of orders) {
        let exists = false
        if (ord.calendar?.eventId) {
          const evt = await getCalendarEventById(ord.calendar.eventId)
          exists = Boolean(evt?.id)
        }
        if (exists) continue

        const total = Number(ord.service?.totalPrice || 0)
        const paid20 = Number((total * 0.2).toFixed(1))

        const payload = buildOrderEventPayload({
          ...ord,
          payment: { ...(ord.payment || {}), paidAmount: paid20 },
        })

        const evt = await createCalendarEvent(payload, `${paymentId}:${ord._id}`)
        if (evt?.id) {
          await serverClient.patch(ord._id).set({
            calendar: { eventId: evt.id, htmlLink: evt.htmlLink, createdAt: new Date().toISOString() },
          }).commit()
          console.log('[orders/sync] event created', { orderId: ord._id, eventId: evt.id })
        }
      }
    }

    /*──────── Envío de correos (idempotente) ────────*/
    if (status === 'paid') {
      const totalAmount = orders.reduce((a, o) => a + (o.service?.totalPrice || 0), 0)
      const paidAmount = Number((totalAmount * 0.2).toFixed(1))
      const acquired = await acquireMailLock(paymentId)

      if (acquired) {
        const services = orders.map(o => o.service)
        const contact = orders.find(o => o.contact?.email)?.contact

        const adminHtml = renderAdminNewServicesEmailMulti({
          mollieId: paymentId,
          amount: paidAmount,
          currency: orders[0]?.payment?.currency || 'EUR',
          contact,
          services,
        })

        const clientHtml = contact
          ? renderClientThanksEmailMulti({
              mollieId: paymentId,
              amount: paidAmount,
              currency: orders[0]?.payment?.currency || 'EUR',
              contact,
              services,
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
    service{
      type,title,date,time,totalPrice,passengers,
      pickupAddress,dropoffAddress,
      flightNumber,flightArrivalTime,flightDepartureTime,
      luggage23kg,luggage10kg,isNightTime,extraLuggage,
      selectedPricingOption
    },
    payment{method,requestedMethod,currency},
    contact{name,email,phone,referralSource}
  }`,
  { pid: paymentId }
)

    const results: any[] = []

    for (const ord of orders) {
      let exists = false
      if (ord.calendar?.eventId) {
        const evt = await getCalendarEventById(ord.calendar.eventId!)
        exists = Boolean(evt?.id)
      }
      if (!exists) {
        const total = Number(ord.service?.totalPrice || 0)
        const paid20 = Number((total * 0.2).toFixed(1))
        const payload = buildOrderEventPayload({
          ...ord,
          payment: { ...(ord as any).payment, paidAmount: paid20 },
        })
        const evt = await createCalendarEvent(payload, `${paymentId}:${ord._id}`)
        if (evt?.id) {
          await serverClient.patch(ord._id).set({
            calendar: { eventId: evt.id, htmlLink: evt.htmlLink, createdAt: new Date().toISOString() },
          }).commit()
        }
        results.push({ orderId: ord._id, created: Boolean(evt?.id) })
      } else {
        results.push({ orderId: ord._id, exists: true })
      }
    }
    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    console.error('[Orders][sync PUT] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
