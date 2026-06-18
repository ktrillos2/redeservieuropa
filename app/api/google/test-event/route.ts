import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { buildOrderEventPayload, createCalendarEvent } from '@/lib/google-calendar'

export async function POST(req: NextRequest) {
  try {
    const expected = process.env.MAIL_TEST_TOKEN
    if (expected) {
      const token = new URL(req.url).searchParams.get('token')
      if (token !== expected) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json().catch(() => ({}))
    // Permite pasar un objeto "order-like" para pruebas; si no, usa un ejemplo minimal
    const now = new Date()
    const date = new Date(now.getTime() + 60 * 60 * 1000) // +1h
    const order = body.order ?? {
      service: {
        type: 'transfer',
        title: 'Test event',
        date: date.toISOString().slice(0, 10),
        time: date.toTimeString().slice(0, 5),
        pickupAddress: 'CDG',
        dropoffAddress: 'Paris',
        totalPrice: 100,
      },
      contact: {
        name: 'Tester',
        email: process.env.SMTP_USER,
        phone: '—',
      },
    }
    const payload = buildOrderEventPayload(order)
    const evt = await createCalendarEvent(payload)
    return NextResponse.json({ ok: true, event: evt })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || 'Error' }, { status: 500 })
  }
}
