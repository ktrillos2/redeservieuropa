import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'
import { sendMail } from '@/lib/mailer'
import { renderClientThanksEmailMulti, renderAdminNewServicesEmailMulti } from '@/lib/email-templates'
import { buildOrderEventPayload, createCalendarEvent, getCalendarEventById } from '@/lib/google-calendar'

/** ------- Helpers de idempotencia por pago (lock en Sanity) ------- */
async function getMailLock(paymentId: string): Promise<{ _id: string; sentAt?: string | null } | null> {
  const id = `mailLock.payment_${paymentId}`
  try {
    const doc = await serverClient.getDocument(id)
    return doc as any
  } catch {
    return null
  }
}

async function acquireMailLock(paymentId: string): Promise<boolean> {
  const _id = `mailLock.payment_${paymentId}`
  try {
    // Crea si no existe
    await serverClient.createIfNotExists({
      _id,
      _type: 'mailLock',
      paymentId,
      createdAt: new Date().toISOString(),
      sentAt: null,
    } as any)
    // Si ya tenía sentAt, no enviar
    const existing = await serverClient.getDocument(_id)
    if ((existing as any)?.sentAt) return false
    // Marca lock "en curso" (opcional)
    await serverClient.patch(_id).set({ lockAt: new Date().toISOString() }).commit()
    return true
  } catch (e) {
    console.error('[webhook][mail-lock] acquire error', e)
    return false
  }
}

async function markMailSent(paymentId: string) {
  const _id = `mailLock.payment_${paymentId}`
  try {
    await serverClient.patch(_id).set({ sentAt: new Date().toISOString() }).commit()
  } catch (e) {
    console.error('[webhook][mail-lock] mark sent error', e)
  }
}
/** ----------------------------------------------------------------- */

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const expected = process.env.MOLLIE_WEBHOOK_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const mollie = getMollieClient()
    const form = await req.formData()
    const paymentId = String(form.get('id') || '')
    if (!paymentId) return NextResponse.json({ ok: true })

    // 1) Verificar pago en Mollie
    const payment = await mollie.payments.get(paymentId)
    const isPaid = payment?.status === 'paid'

    // 2) Trae TODOS los orders asociados al pago
    const orders = await serverClient.fetch<Array<{
      _id: string
      status?: string
      payment?: { currency?: string }
      contact?: { name?: string; email?: string }
      service?: {
        type?: string; title?: string; date?: string; time?: string; totalPrice?: number
        pickupAddress?: string; dropoffAddress?: string; flightNumber?: string; passengers?: number
      }
      calendar?: { eventId?: string | null; htmlLink?: string | null }
    }>>(
      `*[_type == "order" && payment.paymentId == $pid]{
        _id, status, payment{currency}, contact{name,email},
        service{type,title,date,time,totalPrice,pickupAddress,dropoffAddress,flightNumber,passengers},
        calendar{eventId,htmlLink}
      }`,
      { pid: paymentId }
    )

    // Si no hay orders no hacemos nada
    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ ok: true, note: 'no-orders' })
    }

    // DEBUG paso a paso: agendamiento en Google Calendar
    console.log('[webhook][DEBUG] Pago confirmado, iniciando proceso de agendamiento y envío de email')
    try {
      for (const ord of orders) {
        console.log('[webhook][DEBUG] Procesando order para calendar:', { orderId: ord._id })
        let exists = false
        if (ord.calendar && ord.calendar.eventId) {
          console.log('[webhook][DEBUG] Verificando si ya existe evento en calendar:', ord.calendar.eventId)
          const evt = await getCalendarEventById(ord.calendar.eventId)
          exists = Boolean(evt?.id)
        }
        if (exists) {
          console.log('[webhook][DEBUG] Evento calendar ya existe, saltando:', ord.calendar ? ord.calendar.eventId : 'sin calendar')
          continue
        }

        const payload = buildOrderEventPayload(ord)
        console.log('[webhook][DEBUG] Payload para calendar:', payload)
        const dedupeKey = `${paymentId}:${ord._id}`
        const evt = await createCalendarEvent(payload, dedupeKey)
        if (evt?.id) {
          await serverClient.patch(ord._id).set({
            calendar: {
              eventId: evt.id,
              htmlLink: evt.htmlLink,
              createdAt: new Date().toISOString(),
            },
          }).commit()
          console.log('[webhook][DEBUG] Evento calendar creado y guardado:', { orderId: ord._id, eventId: evt.id })
        }
      }
    } catch (e) {
      console.error('[webhook][DEBUG][calendar] error creando eventos múltiples', e)
    }

    // Idempotencia: solo enviar correos si no se ha enviado antes
    const mailLock = await getMailLock(paymentId)
    if (mailLock?.sentAt) {
      console.log('[webhook][mailLock] Correos ya enviados para este pago, no se enviará de nuevo.')
      return NextResponse.json({ ok: true, skipped: true, reason: 'mailLock-sent' })
    }

    // Enviar correos (ADMIN y CLIENTE)
    console.log('[webhook][DEBUG] Iniciando envío de correos (ADMIN y CLIENTE)')
    const services = orders.map(o => ({
      type: o.service?.type,
      title: o.service?.title,
      date: o.service?.date,
      time: o.service?.time,
      totalPrice: o.service?.totalPrice,
      pickupAddress: o.service?.pickupAddress,
      dropoffAddress: o.service?.dropoffAddress,
      flightNumber: o.service?.flightNumber,
      passengers: o.service?.passengers,
    }))

    const totalAmount = payment?.amount?.value ? Number(payment.amount.value) :
      services.reduce((acc, s) => acc + (s.totalPrice || 0), 0)

    const adminHtml = renderAdminNewServicesEmailMulti({
      mollieId: paymentId,
      amount: totalAmount,
      currency: orders[0]?.payment?.currency || 'EUR',
      method: (payment as any)?.method || null,
      services
    })

    const client = orders.find(o => o.contact?.email)?.contact
    const clientHtml = client ? renderClientThanksEmailMulti({
      mollieId: paymentId,
      amount: totalAmount,
      currency: orders[0]?.payment?.currency || 'EUR',
      contact: client,
      services
    }) : null

    let adminResult = null
    let clientResult = null
    let adminError = null
    let clientError = null

    // Envío ADMIN
    console.log('[webhook][DEBUG] Enviando correo ADMIN', {
      to: ['redeservieuropa@gmail.com'],
      bcc: 'info@redeservieuropa.com',
      subject: 'Nuevos servicios confirmados'
    })
    try {
      adminResult = await sendMail({
        to: ['redeservieuropa@gmail.com'],
        bcc: 'info@redeservieuropa.com',
        subject: 'Nuevos servicios confirmados',
        html: adminHtml,
        from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>'
      })
      console.log('[webhook][DEBUG] Resultado ADMIN:', adminResult)
    } catch (e) {
      adminError = e
      console.error('[webhook][DEBUG] Error al enviar correo ADMIN', e)
    }

    // Envío CLIENTE (si hay email)
    if (client?.email && clientHtml) {
      console.log('[webhook][DEBUG] Enviando correo CLIENTE', {
        to: client.email,
        subject: '¡Gracias por tu pago!'
      })
      try {
        clientResult = await sendMail({
          to: client.email,
          subject: '¡Gracias por tu pago!',
          html: clientHtml,
          from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>'
        })
        console.log('[webhook][DEBUG] Resultado CLIENTE:', clientResult)
      } catch (e) {
        clientError = e
        console.error('[webhook][DEBUG] Error al enviar correo CLIENTE', e)
      }
    }

    // Marcar como enviado
    await markMailSent(paymentId)

    return NextResponse.json({
      ok: true,
      adminResult,
      clientResult,
      adminError: adminError ? String(adminError) : null,
      clientError: clientError ? String(clientError) : null
    })
  } catch (e: any) {
    console.error('[Mollie][webhook] Error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
