import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'
import { buildOrderEventPayload, createCalendarEvent, getCalendarEventById } from '@/lib/google-calendar'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const url = new URL(req.url)
    const token = url.searchParams.get('token') || undefined
    const bypass = url.searchParams.get('bypass') === '1'

    const orders = await serverClient.fetch<Array<{
      _id: string
      status?: string
      payment?: { amount?: number; paidAt?: string | null; method?: string | null; requestedMethod?: string | null; currency?: string; status?: string | null }
      contact?: { name?: string; email?: string; phone?: string }
      service?: { type?: string; title?: string; date?: string; time?: string; totalPrice?: number; pickupAddress?: string; dropoffAddress?: string; flightNumber?: string; passengers?: number }
      calendar?: { eventId?: string | null; htmlLink?: string | null }
    }>>(
      `*[_type == "order" && payment.paymentId == $pid]{
        _id, status,
        payment{amount,paidAt,method,requestedMethod,currency,status},
        contact{name,email,phone},
        service{type,title,date,time,totalPrice,pickupAddress,dropoffAddress,flightNumber,passengers},
        calendar{eventId,htmlLink}
      }`,
      { pid: paymentId }
    )

    const mollie = getMollieClient()
    let payment: any | undefined
    let status: string = 'pending'
    let chosenMethod: string | undefined

    try {
      payment = await mollie.payments.get(paymentId)
      status = payment.status
      chosenMethod = (payment as any)?.method
    } catch (err) {
      const expected = process.env.MAIL_TEST_TOKEN
      if (expected && token === expected && bypass) {
        const first = orders?.[0]
        status = (first?.payment?.status as any) || first?.status || 'pending'
        chosenMethod = first?.payment?.method || undefined
      } else {
        throw err
      }
    }

    // PATCH de pago/estado para TODOS los orders
    if (Array.isArray(orders) && orders.length > 0) {
      for (const o of orders) {
        const patch: any = {
          'payment.provider': 'mollie',
          'payment.paymentId': paymentId,
          'payment.status': status,
          'payment.paidAt': status === 'paid' ? new Date().toISOString() : undefined,
          ...(typeof o.payment?.amount !== 'number' && payment?.amount?.value ? { 'payment.amount': Number(payment.amount.value) } : {}),
          ...(chosenMethod ? { 'payment.method': String(chosenMethod) } : {}),
          status: status === 'paid'
            ? 'paid'
            : (status === 'failed' || status === 'canceled' || status === 'expired' ? 'failed' : 'pending'),
          'metadata.updatedAt': new Date().toISOString(),
        }
        await serverClient.patch(o._id).set(patch).commit()
        // eslint-disable-next-line no-console
        console.log('[orders/sync] order patched', { orderId: o._id, status: patch.status, paidAt: patch['payment.paidAt'] })
      }
    }

    // Calendar: crear 1 evento por CADA order pagado faltante (idempotente)
    try {
      if (status === 'paid' && Array.isArray(orders) && orders.length > 0) {
        for (const ord of orders) {
          if (!ord?._id) continue

          let exists = false
          if (ord.calendar?.eventId) {
            const evt = await getCalendarEventById(ord.calendar.eventId!)
            exists = Boolean(evt?.id)
          }
          if (exists) continue

          const payload = buildOrderEventPayload(ord)
          const dedupeKey = `${paymentId}:${ord._id}`
          const evt = await createCalendarEvent(payload, dedupeKey)
          if (evt?.id) {
            await serverClient.patch(ord._id).set({
              calendar: { eventId: evt.id, htmlLink: evt.htmlLink, createdAt: new Date().toISOString() },
            }).commit()
            // eslint-disable-next-line no-console
            console.log('[orders/sync] event created', { orderId: ord._id, eventId: evt.id })
          }
        }
      }
    } catch (err) {
      console.error('[orders/sync][calendar] No se pudo crear los eventos múltiples', err)
    }

    // IMPORTANTE: NO enviar emails aquí (todo lo hace el webhook)
    return NextResponse.json({ ok: true, status })
  } catch (e: any) {
    console.error('[Orders][sync] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}

// Respaldo: crear eventos faltantes para TODOS los orders del pago
export async function PUT(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    const orders = await serverClient.fetch<Array<{
      _id: string
      status?: string
      calendar?: { eventId?: string | null; htmlLink?: string | null }
      contact?: any
      service?: any
    }>>(
      `*[_type == "order" && payment.paymentId == $pid]{
        _id, status, calendar{eventId,htmlLink}, contact, service
      }`,
      { pid: paymentId }
    )

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ ok: true, results: [] })
    }

    const results: any[] = []

    for (const ord of orders) {
      let exists = false
      if (ord.calendar?.eventId) {
        const evt = await getCalendarEventById(ord.calendar.eventId!)
        exists = Boolean(evt?.id)
      }

      if (!exists) {
        const payload = buildOrderEventPayload(ord)
        const evt = await createCalendarEvent(payload, `${paymentId}:${ord._id}`)
        if (evt?.id) {
          await serverClient.patch(ord._id).set({
            calendar: { eventId: evt.id, htmlLink: evt.htmlLink, createdAt: new Date().toISOString() }
          }).commit()
        }
        results.push({ orderId: ord._id, created: Boolean(evt?.id), event: evt || null })
      } else {
        results.push({ orderId: ord._id, created: false, exists: true, eventId: ord.calendar?.eventId })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (e: any) {
    console.error('[Orders][sync PUT] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
