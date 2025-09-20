import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { serverClient } from '@/sanity/lib/server-client'
import { sendMail } from '@/lib/mailer'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    const url = new URL(req.url)
  const token = url.searchParams.get('token') || undefined
  const force = url.searchParams.get('force') === '1'
    const expected = process.env.MAIL_TEST_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const order = await serverClient.fetch<{ _id: string | null; status?: string; contact?: any; service?: any; payment?: any; _rev?: string; notifications?: any }>(
      `*[_type == "order" && payment.paymentId == $pid][0]{ _id, _rev, status, contact, service, payment{ amount, currency, method, requestedMethod, paymentId }, notifications{ paidEmailsSentAt, paidEmailsLock } }`,
      { pid: paymentId }
    )
    if (!order || !order._id) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  if (order.status !== 'paid') return NextResponse.json({ error: 'Order not paid' }, { status: 400 })
  if (order.notifications?.paidEmailsSentAt) return NextResponse.json({ ok: true, skipped: true, reason: 'already-sent' })
  const ttlMs = Number(process.env.MAIL_LOCK_TTL_MS || 600000)
  const lockAtMs = order.notifications?.paidEmailsLock?.at ? Date.parse(order.notifications.paidEmailsLock.at) : 0
  const lockStale = !!lockAtMs && (Date.now() - lockAtMs > ttlMs)
  if (order.notifications?.paidEmailsLock && !lockStale && !force) return NextResponse.json({ ok: true, skipped: true, reason: 'locked' })

    // Intentar adquirir lock
    let acquired = false
    try {
      if (order._rev) {
        await serverClient.transaction()
          .patch(order._id!, (p: any) => p
            .setIfMissing({ notifications: {} })
            .set({ 'notifications.paidEmailsLock': { at: new Date().toISOString(), by: 'resend', paymentId } })
          )
          .ifRevisionId(order._rev)
          .commit()
        acquired = true
      }
    } catch {
      return NextResponse.json({ ok: true, skipped: true, reason: 'lock-failed' })
    }

    if (!acquired) return NextResponse.json({ ok: true, skipped: true, reason: 'no-rev' })

    const { renderAdminNewServiceEmail, renderClientThanksEmail } = await import('@/lib/email-templates')
    const adminHtml = renderAdminNewServiceEmail({
      mollieId: paymentId,
      amount: order.payment?.amount,
      currency: order.payment?.currency || 'EUR',
      method: order.payment?.method || null,
      requestedMethod: order.payment?.requestedMethod || null,
      contact: order.contact || {},
      service: order.service || {},
    })
    await sendMail({ to: 'redeservieuropa@gmail.com', bcc: 'info@redeservieuropa.com', subject: `Nuevo ${order.service?.type || 'servicio'} – ${order.service?.title || 'Reserva'}`, html: adminHtml, replyTo: order.contact?.email || undefined, from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>' })

    if (order.contact?.email) {
      const clientHtml = renderClientThanksEmail({
        mollieId: paymentId,
        amount: order.payment?.amount,
        currency: order.payment?.currency || 'EUR',
        contact: order.contact || {},
        service: order.service || {},
      })
      await sendMail({ to: order.contact.email, subject: '¡Gracias por tu pago!', html: clientHtml, from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>' })
    }

    await serverClient.patch(order._id).set({ 'notifications.paidEmailsSentAt': new Date().toISOString(), 'notifications.paidEmailsBy': 'resend' }).commit()

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[orders/resend-emails] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
