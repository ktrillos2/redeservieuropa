import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'
import { sendMail } from '@/lib/mailer'
import { buildOrderEventPayload, createCalendarEvent, getCalendarEventById } from '@/lib/google-calendar'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    const url = new URL(req.url)
    const token = url.searchParams.get('token') || undefined
  const bypass = url.searchParams.get('bypass') === '1'
    const found = await serverClient.fetch<{ _id: string | null; payment?: { amount?: number; paidAt?: string | null; method?: string | null; requestedMethod?: string | null; currency?: string; status?: string | null }; contact?: { name?: string; email?: string; phone?: string }; service?: { type?: string; title?: string; date?: string; time?: string; totalPrice?: number; pickupAddress?: string; dropoffAddress?: string; flightNumber?: string; selectedPricingOption?: { hours?: number } }; calendar?: { eventId?: string | null; htmlLink?: string | null }; status?: string }>(`*[_type == "order" && payment.paymentId == $pid][0]{ _id, status, payment{amount,paidAt,method,requestedMethod,currency,status}, contact{name,email,phone}, service{type,title,date,time,totalPrice,pickupAddress,dropoffAddress,flightNumber,selectedPricingOption{hours}}, calendar{eventId,htmlLink} }`, { pid: paymentId })
    const mollie = getMollieClient()
    let payment: any | undefined
    let status: string = 'pending'
    let chosenMethod: string | undefined
    try {
      payment = await mollie.payments.get(paymentId)
      status = payment.status
      chosenMethod = (payment as any)?.method
    } catch (err) {
      // Fallback de prueba: permitido solo si el token de test coincide y bypass=1 está presente
      const expected = process.env.MAIL_TEST_TOKEN
      if (expected && token === expected && bypass) {
        status = (found?.payment?.status as any) || found?.status || 'pending'
        chosenMethod = found?.payment?.method || undefined
      } else {
        throw err
      }
    }
    if (found && found._id) {
      const patch: any = {
        'payment.provider': 'mollie',
        'payment.paymentId': paymentId,
        'payment.status': status,
        'payment.paidAt': status === 'paid' ? new Date().toISOString() : undefined,
        // Si no hay amount guardado aún, usar el de Mollie
        ...(typeof found.payment?.amount !== 'number' && payment && payment.amount && payment.amount.value ? { 'payment.amount': Number(payment.amount.value) } : {}),
        ...(chosenMethod ? { 'payment.method': String(chosenMethod) } : {}),
        status: status === 'paid' ? 'paid' : (status === 'failed' || status === 'canceled' || status === 'expired' ? 'failed' : 'pending'),
        'metadata.updatedAt': new Date().toISOString(),
      }
  await serverClient.patch(found._id).set(patch).commit()
  console.log('[orders/sync] order patched', { orderId: found._id, status: patch.status, paidAt: patch['payment.paidAt'] })
      // Ya no enviamos correos de estado desde aquí para evitar confusión

      // Crear evento si está pagado y no existe aún (idempotente por paymentId) y, al crearse por primera vez, disparar emails de confirmación
      try {
        if (status === 'paid') {
          const order = await serverClient.fetch<{ _id: string | null; status?: string; calendar?: { eventId?: string | null; htmlLink?: string | null }; contact?: any; service?: any }>(`*[_type == "order" && payment.paymentId == $pid][0]{ _id, status, calendar{eventId,htmlLink}, contact, service }`, { pid: paymentId })
          console.log('[orders/sync] paid path', { orderId: order?._id, hasEvent: !!order?.calendar?.eventId })
          if (order && order._id && !order.calendar?.eventId) {
            const payload = buildOrderEventPayload(order)
            const evt = await createCalendarEvent(payload, paymentId)
            if (evt?.id) {
              await serverClient.patch(order._id).set({
                calendar: { eventId: evt.id, htmlLink: evt.htmlLink, createdAt: new Date().toISOString() },
              }).commit()
              console.log('[orders/sync] event created', { eventId: evt.id })
            }
          }
          // Enviar correos de respaldo aunque el evento ya exista (si no se han enviado)
          try {
            const already = await serverClient.fetch<{ sent?: string; lock?: { at?: string } | null; rev?: string }>(`*[_type == "order" && _id == $id][0]{ "sent": notifications.paidEmailsSentAt, "lock": notifications.paidEmailsLock, "rev": _rev }`, { id: order?._id })
            const ttlMs = Number(process.env.MAIL_LOCK_TTL_MS || 600000)
            const lockAtMs = already?.lock?.at ? Date.parse(already.lock.at) : 0
            const lockStale = !!lockAtMs && (Date.now() - lockAtMs > ttlMs)
            console.log('[orders/sync][mail-backup] state', { sentAt: already?.sent, lock: already?.lock, ttlMs, lockStale })
            if (order && order._id && !already?.sent && (!already?.lock || lockStale)) {
              // Adquirir lock antes de enviar
              let acquired = false
              try {
                if (already?.rev) {
                  await serverClient
                    .patch(order._id!)
                    .setIfMissing({ notifications: {} as any })
                    .set({ 'notifications.paidEmailsLock': { at: new Date().toISOString(), by: 'sync', paymentId } })
                    .ifRevisionId(already.rev as any)
                    .commit()
                  acquired = true
                  console.log('[orders/sync][mail-backup] lock acquired/renewed')
                }
              } catch (e) {
                console.error('[orders/sync][mail-backup] lock not acquired', e)
              }
              if (!acquired) {
                return NextResponse.json({ ok: true, status, note: 'mail-skipped-lock' })
              }
              const { renderAdminNewServiceEmail, renderClientThanksEmail } = await import('@/lib/email-templates')
              const adminHtml = renderAdminNewServiceEmail({
                mollieId: paymentId,
                amount: (payment && (payment.amount as any)?.value) || found.payment?.amount,
                currency: found.payment?.currency || 'EUR',
                method: (payment as any)?.method || found.payment?.method || null,
                requestedMethod: found.payment?.requestedMethod || null,
                contact: order.contact || {},
                service: order.service || {},
              })
              await sendMail({ to: 'redeservieuropa@gmail.com', bcc: 'info@redeservieuropa.com', subject: `Nuevo ${order.service?.type || 'servicio'} – ${order.service?.title || 'Reserva'}`, html: adminHtml, replyTo: order.contact?.email || undefined, from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>' })
              if (order.contact?.email) {
                const clientHtml = renderClientThanksEmail({
                  mollieId: paymentId,
                  amount: (payment && (payment.amount as any)?.value) || found.payment?.amount,
                  currency: found.payment?.currency || 'EUR',
                  contact: order.contact || {},
                  service: order.service || {},
                })
                await sendMail({ to: order.contact.email, subject: '¡Gracias por tu pago!', html: clientHtml, from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>' })
              }
              await serverClient.patch(order._id).set({ 'notifications.paidEmailsSentAt': new Date().toISOString(), 'notifications.paidEmailsBy': 'sync' }).commit()
              console.log('[orders/sync][mail-backup] marked sent')
            } else if (order && order._id && !already?.sent) {
              // Hay lock vigente; informar nota para trazabilidad
              return NextResponse.json({ ok: true, status, note: 'mail-skipped-lock-active' })
            }
          } catch (e) {
            console.error('[orders/sync][mail-backup-2] No se pudo enviar/registrar notificaciones', e)
          }
        }
      } catch (err) {
        console.error('[orders/sync][calendar] No se pudo crear el evento', err)
      }
    }

    return NextResponse.json({ ok: true, status })
  } catch (e: any) {
    console.error('[Orders][sync] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}

// Crear evento cuando esté pagado y no exista aún
export async function PUT(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    const order = await serverClient.fetch<{ _id: string | null; status?: string; calendar?: { eventId?: string | null }; contact?: any; service?: any }>(`*[_type == "order" && payment.paymentId == $pid][0]{ _id, status, calendar{eventId}, contact, service }`, { pid: paymentId })
    if (order && order._id && order.status === 'paid') {
      let exists = false
      if (order.calendar?.eventId) {
        const evt = await getCalendarEventById(order.calendar.eventId)
        exists = Boolean(evt?.id)
      }
      if (!exists) {
        const payload = buildOrderEventPayload(order)
        const evt = await createCalendarEvent(payload, paymentId)
        if (evt?.id) {
          await serverClient.patch(order._id).set({
            calendar: {
              eventId: evt.id,
              htmlLink: evt.htmlLink,
              createdAt: new Date().toISOString(),
            },
          }).commit()
        }
        return NextResponse.json({ ok: true, created: Boolean(evt?.id), event: evt || null })
      }
  return NextResponse.json({ ok: true, created: false, exists: true, event: { id: order.calendar?.eventId || null, htmlLink: (order as any)?.calendar?.htmlLink || null } })
    }
    return NextResponse.json({ ok: true, created: false, exists: false })
  } catch (e: any) {
    console.error('[Orders][sync PUT] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
