// /app/api/mollie/webhook/route.ts
import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'
import { sendMail } from '@/lib/mailer'
import { renderClientThanksEmailMulti, renderAdminNewServicesEmailMulti } from '@/lib/email-templates'
import { buildOrderEventPayload, createCalendarEvent, getCalendarEventById } from '@/lib/google-calendar'

// ─── Mail Lock (idempotencia) ─────────────────────────────────────────────
async function acquireMailLock(paymentId: string): Promise<boolean> {
  const _id = `mailLock.payment_${paymentId}`
  try {
    await serverClient.createIfNotExists({
      _id,
      _type: 'mailLock',
      paymentId,
      createdAt: new Date().toISOString(),
      sentAt: null,
    } as any)

    const existing = await serverClient.getDocument(_id)
    if ((existing as any)?.sentAt) return false

    const lockAt = (existing as any)?.lockAt
    if (lockAt && Date.now() - new Date(lockAt).getTime() < 30000) return false

    await serverClient.patch(_id).set({
      lockAt: new Date().toISOString(),
      lockBy: 'webhook',
    }).commit()
    return true
  } catch {
    return false
  }
}

async function markMailSent(paymentId: string) {
  const _id = `mailLock.payment_${paymentId}`
  await serverClient.patch(_id).set({ sentAt: new Date().toISOString() }).commit().catch(() => {})
}

// ─── GET para validación de Mollie ───────────────────────────────────────
export async function GET() {
  return NextResponse.json({ ok: true, message: 'Webhook Mollie validado' }, { status: 200 })
}

// ─── POST Webhook ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const expected = process.env.MOLLIE_WEBHOOK_TOKEN
    if (!expected || token !== expected)
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })

    const mollie = getMollieClient()
    const form = await req.formData()
    const paymentId = String(form.get('id') || '')
    if (!paymentId) return NextResponse.json({ ok: true, note: 'missing-id' })

    const payment = await mollie.payments.get(paymentId)
    if (payment.status !== 'paid')
      return NextResponse.json({ ok: true, note: `ignored-status-${payment.status}` })

    const orders = await serverClient.fetch<Array<any>>(
  `*[_type == "order" && payment.paymentId == $pid]{
    _id,
    contact{name,email,phone,referralSource},
    services[]{
      type,title,date,time,totalPrice,passengers,
      pickupAddress,dropoffAddress,
      flightNumber,
      luggage23kg,luggage10kg,ninos,isNightTime,
      payFullNow,depositPercent
    },
    calendar{eventId,htmlLink},
    payment{currency,method,requestedMethod,payFullNow,depositPercent}
  }`,
  { pid: paymentId }
)

    if (!orders?.length)
      return NextResponse.json({ ok: true, note: 'no-orders' })

    // Calcular montos considerando todos los servicios
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

    // Crear eventos de Calendar (uno por cada servicio de cada orden)
    for (const ord of orders) {
      const services = ord.services || []
      
      for (let idx = 0; idx < services.length; idx++) {
        const service = services[idx]
        
        // Calcular pago según depositPercent del servicio
        const total = Number(service?.totalPrice || 0)
        const pct = service?.depositPercent || ord.payment?.depositPercent || 
                   (service?.type === 'tour' ? 20 : service?.type === 'evento' ? 15 : 10)
        const servicePaidAmount = Number((total * pct / 100).toFixed(1))

        const payload = buildOrderEventPayload({
          service,
          payment: { ...ord.payment, paidAmount: servicePaidAmount, depositPercent: pct },
          contact: ord.contact,
        })
        
        try {
          const evt = await createCalendarEvent(payload, `${paymentId}:${ord._id}:${idx}`)
          if (evt?.id) {
            console.log('[webhook] event created', { 
              orderId: ord._id, 
              serviceIdx: idx, 
              eventId: evt.id,
              date: service.date,
              time: service.time
            })
          }
        } catch (err) {
          console.error('[webhook] calendar error', { 
            orderId: ord._id, 
            serviceIdx: idx, 
            error: err?.message || err 
          })
        }
      }
    }

    // ─── Correos ───────────────────────────────
    const lock = await acquireMailLock(paymentId)
    if (!lock) return NextResponse.json({ ok: true, skipped: true })

    const contact = orders.find(o => o.contact?.email)?.contact
    const services = orders.flatMap(o => o.services || [])

    const adminHtml = renderAdminNewServicesEmailMulti({
  mollieId: paymentId,
  amount: paidAmount,
  currency: 'EUR',
  method: orders[0]?.payment?.method,
  requestedMethod: orders[0]?.payment?.requestedMethod,
  contact,
  services,
})
    const clientHtml = contact
      ? renderClientThanksEmailMulti({
          mollieId: paymentId,
          amount: paidAmount,
          currency: 'EUR',
          contact,
          services,
        })
      : null

    await sendMail({
      to: ['redeservieuropa@gmail.com'],
      bcc: 'info@redeservieuropa.com',
      subject: 'Nuevos servicios confirmados',
      html: adminHtml,
      from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>',
    })

    if (contact?.email && clientHtml) {
      await sendMail({
        to: contact.email,
        subject: '¡Gracias por tu pago!',
        html: clientHtml,
        from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>',
      })
    }

    await markMailSent(paymentId)

    return NextResponse.json({ ok: true, totalAmount, paidAmount })
  } catch (e: any) {
    console.error('[Mollie webhook error]', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
