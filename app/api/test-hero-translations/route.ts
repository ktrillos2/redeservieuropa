import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export async function GET() {
  try {
    const hero = await client.fetch(`
      *[_type == "hero" && _id == "hero"][0]{
        _id,
        title,
        translations
      }
    `)

    return NextResponse.json({
      success: true,
      hero,
      hasTranslations: !!hero?.translations,
      translationKeys: hero?.translations ? Object.keys(hero.translations) : [],
    })
  } catch (error) {
    console.error('Error fetching hero:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
