import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getMollieClient } from '@/app/api/mollie/client'
import { serverClient } from '@/sanity/lib/server-client'

export async function POST(req: Request) {
  try {
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
    const mollie = getMollieClient()
    const payment = await mollie.payments.get(paymentId)
  const status = payment.status
  const chosenMethod = (payment as any)?.method

    const found = await serverClient.fetch<{ _id: string | null; payment?: { amount?: number } }>(`*[_type == "order" && payment.paymentId == $pid][0]{ _id, payment{amount} }`, { pid: paymentId })
    if (found && found._id) {
      const patch: any = {
        'payment.provider': 'mollie',
        'payment.paymentId': paymentId,
        'payment.status': status,
        'payment.paidAt': status === 'paid' ? new Date().toISOString() : undefined,
        // Si no hay amount guardado aún, usar el de Mollie
        ...(typeof found.payment?.amount !== 'number' && payment.amount && payment.amount.value ? { 'payment.amount': Number(payment.amount.value) } : {}),
        ...(chosenMethod ? { 'payment.method': String(chosenMethod) } : {}),
        status: status === 'paid' ? 'paid' : (status === 'failed' || status === 'canceled' || status === 'expired' ? 'failed' : 'pending'),
        'metadata.updatedAt': new Date().toISOString(),
      }
      await serverClient.patch(found._id).set(patch).commit()
    }

    return NextResponse.json({ ok: true, status })
  } catch (e: any) {
    console.error('[Orders][sync] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
