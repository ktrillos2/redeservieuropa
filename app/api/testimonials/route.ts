import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, location, service, rating, comment } = body

    if (!name || !rating || !comment) {
      return NextResponse.json(
        { message: 'Nombre, puntuación y comentario son requeridos' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'La puntuación debe estar entre 1 y 5' },
        { status: 400 }
      )
    }

    const token = process.env.SANITY_API_TOKEN
    if (!token) {
      console.error('SANITY_API_TOKEN is not defined')
      return NextResponse.json(
        { message: 'Error de configuración del servidor' },
        { status: 500 }
      )
    }

    // Usar cliente con token para tener permisos de escritura
    const writeClient = client.withConfig({
      token: token,
      useCdn: false, // Asegurar que leemos/escribimos directamente sin cache
    })

    const newTestimonial = {
      _type: 'userTestimonial',
      name,
      location: location || '',
      service: service || '',
      rating: Number(rating),
      comment,
      isApproved: false,
    }

    const result = await writeClient.create(newTestimonial)

    return NextResponse.json(
      { message: 'Testimonio enviado correctamente', id: result._id },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error al enviar testimonio:', error)
    return NextResponse.json(
      { message: 'Error al enviar el testimonio', error: error.message },
      { status: 500 }
    )
  }
}
