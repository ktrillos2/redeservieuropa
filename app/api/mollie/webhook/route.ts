import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'
import { sendMail } from '@/lib/mailer'
import { renderClientThanksEmail, renderAdminNewServiceEmail } from '@/lib/email-templates'
import { buildOrderEventPayload, createCalendarEvent, getCalendarEventById } from '@/lib/google-calendar'

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
    const id = String(form.get('id') || '')
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })

    const payment = await mollie.payments.get(id)
  const status = payment.status
  const chosenMethod = (payment as any)?.method
    console.log('[Mollie][webhook]', id, status)

    // Actualizar el pedido en Sanity por payment.paymentId
    try {
  const query = `*[_type == \"order\" && payment.paymentId == $pid][0]{ _id, payment{paidAt, amount, method, requestedMethod, currency}, contact{name,email,phone}, service{type,title,date,time,totalPrice,pickupAddress,dropoffAddress,flightNumber,selectedPricingOption{hours}}, calendar{eventId,htmlLink} }`
  const found = await serverClient.fetch<{_id: string | null; payment?: { paidAt?: string | null, amount?: number; method?: string | null; requestedMethod?: string | null; currency?: string }; contact?: { name?: string; email?: string; phone?: string }; service?: { type?: string; title?: string; date?: string; time?: string; totalPrice?: number; pickupAddress?: string; dropoffAddress?: string; flightNumber?: string; selectedPricingOption?: { hours?: number } }; calendar?: { eventId?: string | null; htmlLink?: string | null } }>(query, { pid: id })
      if (found && found._id) {
        const patch: any = {
          'payment.provider': 'mollie',
          'payment.paymentId': id,
          'payment.status': status,
          'payment.paidAt': status === 'paid' ? new Date().toISOString() : undefined,
          // Si falta amount en el documento, rellenarlo con el de Mollie
          ...(payment.amount && (payment.amount as any).value ? { 'payment.amount': Number((payment.amount as any).value) } : {}),
          ...(chosenMethod ? { 'payment.method': String(chosenMethod) } : {}),
          status: status === 'paid' ? 'paid' : (status === 'failed' || status === 'canceled' || status === 'expired' ? 'failed' : 'pending'),
          'metadata.updatedAt': new Date().toISOString(),
        }
        await serverClient.patch(found._id).set(patch).commit()

        // Enviar correos SOLO cuando esté pagado: cliente (gracias) y admin (nuevo servicio)
        try {
          if (status === 'paid') {
            const adminRecipients = ['redeservieuropa@gmail.com']
            // Admins: nuevo servicio confirmado
            const newServiceSubject = `Nuevo ${found.service?.type || 'servicio'} – ${found.service?.title || 'Reserva'}`
            const newServiceHtml = renderAdminNewServiceEmail({
              mollieId: id,
              amount: (payment.amount as any)?.value || found.payment?.amount,
              currency: found.payment?.currency || 'EUR',
              method: (payment as any)?.method || found.payment?.method || null,
              contact: found.contact || {},
              service: found.service || {},
            })
            await sendMail({ to: adminRecipients, bcc: 'info@redeservieuropa.com', subject: newServiceSubject, html: newServiceHtml, replyTo: found.contact?.email || undefined, from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>' })
            // Cliente: gracias por tu pago
            if (found.contact?.email) {
              const clientHtml = renderClientThanksEmail({
                mollieId: id,
                amount: (payment.amount as any)?.value || found.payment?.amount,
                currency: found.payment?.currency || 'EUR',
                contact: found.contact || {},
                service: found.service || {},
              })
              await sendMail({ to: found.contact.email, subject: '¡Gracias por tu pago!', html: clientHtml, from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>' })
            }
          }
        } catch (err) {
          console.error('[webhook][mail] No se pudo enviar notificación de estado de pago', err)
        }
      }
    } catch (e) {
      console.error('[Sanity][orders] No se pudo actualizar el pedido por webhook', e)
    }

    // Crear evento en Google Calendar si el pago está pagado y no existe aún
    try {
      const order = await serverClient.fetch<{ _id: string | null; status?: string; calendar?: { eventId?: string | null; htmlLink?: string | null }; contact?: any; service?: any }>(`*[_type == "order" && payment.paymentId == $pid][0]{ _id, status, calendar{eventId,htmlLink}, contact, service }`, { pid: id })
      if (order && order._id && order.status === 'paid') {
        let exists = false
        if (order.calendar?.eventId) {
          const evt = await getCalendarEventById(order.calendar.eventId)
          exists = Boolean(evt?.id)
        }
        if (!exists) {
          const payload = buildOrderEventPayload(order)
          const evt = await createCalendarEvent(payload, id)
          if (evt?.id) {
            await serverClient.patch(order._id).set({
              calendar: {
                eventId: evt.id,
                htmlLink: evt.htmlLink,
                createdAt: new Date().toISOString(),
              },
            }).commit()
          }
        }
      }
    } catch (err) {
      console.error('[webhook][calendar] No se pudo crear el evento', err)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[Mollie][webhook] Error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
