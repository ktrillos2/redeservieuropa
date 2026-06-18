// Script para inicializar el nuevo header con estructura dinámica
import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@sanity/client'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

async function seedHeader() {
  const headerDoc = {
    _id: 'header',
    _type: 'header',
    siteTitle: 'REDESERVI',
    siteSubtitle: 'PARIS',
    navLinks: [
      {
        _type: 'menuLink',
        _key: 'servicios',
        label: {
          es: 'Servicios',
          en: 'Services',
          fr: 'Services'
        },
        href: '#',
        type: 'dropdown',
        subItems: [
          {
            _type: 'menuLink',
            _key: 'transfers',
            label: {
              es: 'Traslados',
              en: 'Transfers',
              fr: 'Transferts'
            },
            href: '#traslados',
            type: 'transfers'
          },
          {
            _type: 'menuLink',
            _key: 'tours',
            label: {
              es: 'Tours',
              en: 'Tours',
              fr: 'Tours'
            },
            href: '#',
            type: 'tours'
          },
          {
            _type: 'menuLink',
            _key: 'quote',
            label: {
              es: 'Cotizar servicio personalizado',
              en: 'Request custom quote',
              fr: 'Demander un devis personnalisé'
            },
            href: '/#hero-booking-form',
            type: 'link'
          }
        ]
      },
      {
        _type: 'menuLink',
        _key: 'testimonials',
        label: {
          es: 'Testimonios',
          en: 'Testimonials',
          fr: 'Témoignages'
        },
        href: '#testimonios',
        type: 'link'
      },
      {
        _type: 'menuLink',
        _key: 'contact',
        label: {
          es: 'Contacto',
          en: 'Contact',
          fr: 'Contact'
        },
        href: '#contacto',
        type: 'link'
      }
    ]
  }

  try {
    console.log('🔄 Creando/actualizando header...')
    await client.createOrReplace(headerDoc)
    console.log('✅ Header creado/actualizado exitosamente')
    console.log('📋 Estructura:', JSON.stringify(headerDoc, null, 2))
  } catch (error) {
    console.error('❌ Error al crear header:', error)
    process.exit(1)
  }
}

seedHeader()
