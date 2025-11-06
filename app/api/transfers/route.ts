import { NextResponse } from 'next/server'
import { getToursList } from '@/sanity/lib/tours'
import { getTransfersList } from '@/sanity/lib/transfers'

export async function GET() {
  try {
    const transfers = await getTransfersList()
    
    // Debug: Verificar que las traducciones están llegando
    console.log('[API Transfers] Total transfers:', transfers.length)
    console.log('[API Transfers] Primer transfer con traducciones:', {
      _id: transfers[0]?._id,
      from: transfers[0]?.from,
      to: transfers[0]?.to,
      translations: transfers[0]?.translations
    })
    
    return NextResponse.json({ transfers })
  } catch (e) {
    console.error('[API Transfers] Error:', e)
    return NextResponse.json({ transfers: [] })
  }
}
