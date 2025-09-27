import { NextResponse } from 'next/server'
import { getToursList } from '@/sanity/lib/tours'

export async function GET() {
  try {
    const tours = await getToursList()
    const simplified = (tours || []).map(t => ({ title: t.title, slug: t.slug }))
    return NextResponse.json({ tours: simplified })
  } catch (e) {
    return NextResponse.json({ tours: [] })
  }
}
