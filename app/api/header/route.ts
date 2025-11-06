import { NextResponse } from 'next/server'
import { ensureAndGetHeader } from '@/sanity/lib/general'

export async function GET() {
  try {
    const header = await ensureAndGetHeader()
    return NextResponse.json(header)
  } catch (e) {
    console.error('[API /api/header] Error:', e)
    return NextResponse.json({ 
      _id: 'header',
      siteTitle: 'REDESERVI',
      siteSubtitle: 'PARIS',
      navLinks: []
    })
  }
}
