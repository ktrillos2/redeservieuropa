import { NextResponse } from 'next/server'
import { getToursList } from '@/sanity/lib/tours'

export async function GET() {
  try {
    const tours = await getToursList()
    return NextResponse.json({ tours })
  } catch (e) {
    return NextResponse.json({ tours: [] })
  }
}
