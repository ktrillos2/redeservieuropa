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
        _id, contact{name,email,phone},
        service{type,title,date,time,totalPrice,pickupAddress,dropoffAddress,flightNumber,passengers},
        calendar{eventId,htmlLink}, payment{currency}
      }`,
      { pid: paymentId }
    )

    if (!orders?.length)
      return NextResponse.json({ ok: true, note: 'no-orders' })

    // Monto total y pagado (20% del total)
    const totalAmount = orders.reduce((a, o) => a + (o.service?.totalPrice || 0), 0)
    const paidAmount = Number((totalAmount * 0.2).toFixed(1))

    // Crear eventos de Calendar (uno por servicio)
    for (const ord of orders) {
      const exists = ord.calendar?.eventId && (await getCalendarEventById(ord.calendar.eventId))
      if (exists?.id) continue

      const payload = buildOrderEventPayload({
        ...ord,
        payment: { ...ord.payment, paidAmount },
      })
      const evt = await createCalendarEvent(payload, `${paymentId}:${ord._id}`)
      if (evt?.id) {
        await serverClient.patch(ord._id).set({
          calendar: { eventId: evt.id, htmlLink: evt.htmlLink, createdAt: new Date().toISOString() },
        }).commit()
      }
    }

    // ─── Correos ───────────────────────────────
    const lock = await acquireMailLock(paymentId)
    if (!lock) return NextResponse.json({ ok: true, skipped: true })

    const contact = orders.find(o => o.contact?.email)?.contact
    const services = orders.map(o => o.service)

    const adminHtml = renderAdminNewServicesEmailMulti({
      mollieId: paymentId,
      amount: paidAmount,
      currency: 'EUR',
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
