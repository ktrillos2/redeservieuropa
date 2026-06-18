import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { buildWhatsappLinkFromOrder } from '@/lib/whatsapp'

const COOKIE_NAME = 'mensajes_auth'

export async function POST(req: Request) {
  try {
    const auth = cookies().get(COOKIE_NAME)?.value === '1'
    if (!auth) return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 })
    const form = await req.formData()
    const orderId = String(form.get('orderId') || '')
    const templateId = String(form.get('templateId') || '') || undefined
    if (!orderId) return NextResponse.json({ ok: false, error: 'Falta orderId' }, { status: 400 })
    const data = await buildWhatsappLinkFromOrder(orderId, templateId)
    return NextResponse.json({ ok: true, ...data })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
