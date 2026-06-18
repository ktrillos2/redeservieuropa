import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { serverClient } from '@/sanity/lib/server-client'

type Contact = { name?: string; email?: string; phone?: string }
type Service = { type?: string; title?: string; date?: string; time?: string; totalPrice?: number }

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    const token = url.searchParams.get('token') || undefined
    const expected = process.env.MAIL_TEST_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paymentId, amount = 25, currency = 'EUR', contact = {}, service = {} } = await req.json().catch(() => ({})) as {
      paymentId?: string
      amount?: number
      currency?: string
      contact?: Contact
      service?: Service
    }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

    // Buscar si ya existe
    const existing = await serverClient.fetch<{ _id: string | null }>(`*[_type == "order" && payment.paymentId == $pid][0]{ _id }`, { pid: paymentId })
    const baseDoc: any = {
      _type: 'order',
      status: 'paid',
      payment: {
        provider: 'mollie',
        paymentId,
        status: 'paid',
        amount,
        currency,
        method: 'test',
        paidAt: new Date().toISOString(),
      },
      contact,
      service: {
        type: service.type || 'evento',
        title: service.title || 'Evento de prueba',
        date: service.date || new Date().toISOString().slice(0, 10),
        time: service.time || '12:00',
        totalPrice: service.totalPrice || amount,
      },
      metadata: { createdAt: new Date().toISOString() },
    }

    if (existing && existing._id) {
      await serverClient.patch(existing._id).set(baseDoc).commit()
      return NextResponse.json({ ok: true, updated: true, id: existing._id })
    }

    const created = await serverClient.create(baseDoc)
    return NextResponse.json({ ok: true, created: true, id: created._id })
  } catch (e: any) {
    console.error('[test/create-paid-order] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
