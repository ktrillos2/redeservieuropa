import { NextResponse } from 'next/server'
import { getToursList } from '@/sanity/lib/tours'
import { getTransfersList } from '@/sanity/lib/transfers'

export async function GET() {
  try {
    const transfers = await getTransfersList()
    return NextResponse.json({ transfers })
  } catch (e) {
    console.error('[API Transfers] Error:', e)
    return NextResponse.json({ transfers: [] })
  }
}
