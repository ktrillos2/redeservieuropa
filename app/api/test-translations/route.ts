import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET() {
  try {
    // Obtener todos los documentos de traducción
    const translations = await client.fetch(`*[_type == "translation"]{
      _id,
      language,
      "hasHeader": defined(header),
      "hasFooter": defined(footer),
      "hasHome": defined(home),
      "hasCheckout": defined(checkout),
      "hasThanks": defined(thanks),
      "hasCommon": defined(common),
      header,
      footer,
      home,
      checkout,
      thanks,
      common
    }`)

    return NextResponse.json({
      success: true,
      count: translations.length,
      translations,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    }, { status: 500 })
  }
}
