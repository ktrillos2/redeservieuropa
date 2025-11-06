import { NextRequest, NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const HERO_TRANSLATIONS_QUERY = `*[_type == "hero" && _id == "hero"][0]{
  translations
}`

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const locale = searchParams.get('locale')

    if (!locale || !['en', 'fr', 'es'].includes(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const hero = await client.fetch(HERO_TRANSLATIONS_QUERY)

    if (!hero || !hero.translations) {
      return NextResponse.json({ translations: null }, { status: 200 })
    }

    const response = NextResponse.json({ translations: hero.translations }, { status: 200 })
    
    // Headers para prevenir cache (navegador, CDN, Next.js)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    
    return response
  } catch (error) {
    console.error('Error fetching hero translations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
