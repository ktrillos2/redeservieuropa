import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'

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
      const query = `*[_type == "order" && payment.paymentId == $pid][0]{ _id }`
      const found = await serverClient.fetch<{_id: string | null}>(query, { pid: id })
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
      }
    } catch (e) {
      console.error('[Sanity][orders] No se pudo actualizar el pedido por webhook', e)
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[Mollie][webhook] Error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
