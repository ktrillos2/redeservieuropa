import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { serverClient } from '@/sanity/lib/server-client'
import { buildOrderEventPayload, createCalendarEvent } from '@/lib/google-calendar'

export async function POST(req: NextRequest) {
  try {
    const expected = process.env.MAIL_TEST_TOKEN
    if (expected) {
      const token = new URL(req.url).searchParams.get('token')
      if (token !== expected) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ ok: false, error: 'Missing paymentId' }, { status: 400 })
    const order = await serverClient.fetch<any>(`*[_type == "order" && payment.paymentId == $pid][0]{ _id, calendar{eventId,htmlLink}, contact, service }`, { pid: paymentId })
    if (!order?._id) return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 })
    if (order?.calendar?.eventId) {
      return NextResponse.json({ ok: true, event: { id: order.calendar.eventId, htmlLink: order.calendar.htmlLink }, skipped: true })
    }
    const payload = buildOrderEventPayload(order)
    const evt = await createCalendarEvent(payload, paymentId)
    if (evt?.id) {
      await serverClient.patch(order._id).set({ calendar: { eventId: evt.id, htmlLink: evt.htmlLink, createdAt: new Date().toISOString() } }).commit()
    }
    return NextResponse.json({ ok: true, event: evt || null })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
