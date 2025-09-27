import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { serverClient } from '@/sanity/lib/server-client'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = String(searchParams.get('id') || '')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    const query = `*[_type == "order" && payment.paymentId == $pid]{
      _id,
      _rev,
      orderNumber,
      status,
      payment,
      contact,
      service,
      notifications,
      metadata
    }`
    const orders = await serverClient.fetch(query, { pid: id })
    if (!orders || !Array.isArray(orders) || orders.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ orders })
  } catch (e: any) {
    console.error('[Orders][by-payment] Error', e)
    return NextResponse.json({ error: e?.message || 'Error' }, { status: 500 })
  }
}
