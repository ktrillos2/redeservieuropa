import { NextResponse } from 'next/server'
import { buildWhatsappLinkFromOrder } from '@/lib/whatsapp'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token') || undefined
    const expected = process.env.MAIL_TEST_TOKEN
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const orderId = searchParams.get('orderId') || ''
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    const templateId = searchParams.get('templateId') || undefined
    const data = await buildWhatsappLinkFromOrder(orderId, templateId)
    return NextResponse.json({ ok: true, ...data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
