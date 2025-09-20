import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { getMollieClient } from '@/app/api/mollie/client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = String(searchParams.get('id') || '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const mollie = getMollieClient()
    const payment = await mollie.payments.get(id)
    return NextResponse.json({ id: payment.id, status: payment.status, amount: payment.amount, description: payment.description })
  } catch (e: any) {
    console.error('[Mollie][status] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
