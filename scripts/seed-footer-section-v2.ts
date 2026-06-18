/*
 Seed para crear/actualizar el documento de contenido del footer.
 Ejecuta: npx tsx scripts/seed-footer-section-v2.ts
*/
import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-15').trim()
const token = (process.env.SANITY_API_TOKEN || '').trim()

if (!projectId || !dataset) {
  console.error('[seed:footerSection] Faltan NEXT_PUBLIC_SANITY_PROJECT_ID o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('[seed:footerSection] Falta SANITY_API_TOKEN con permisos de escritura')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function seedFooterSection() {
  console.log('🌍 Iniciando seed del Footer...')

  const footerData = {
    _id: 'footerSection',
    _type: 'footerSection',
    
    // Español (contenido por defecto)
    description: 'Servicio de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con comodidad y elegancia.',
    showStars: true,
    statsText: '+1000 clientes satisfechos',
    copyright: '© 2025 REDESERVI PARIS. Todos los derechos reservados.',
    
    columns: [
      {
        _type: 'footerColumn',
        _key: 'services-column',
        title: 'Servicios',
        links: [
          {
            _type: 'menuLink',
            _key: 'cdg',
            label: 'Aeropuerto CDG',
            internalHref: '/#traslados',
            external: false,
          },
          {
            _type: 'menuLink',
            _key: 'orly',
            label: 'Aeropuerto Orly',
            internalHref: '/#traslados',
            external: false,
          },
          {
            _type: 'menuLink',
            _key: 'beauvais',
            label: 'Aeropuerto Beauvais',
            internalHref: '/#traslados',
            external: false,
          },
          {
            _type: 'menuLink',
            _key: 'disneyland',
            label: 'París ↔ Disneyland',
            internalHref: '/#traslados',
            external: false,
          },
          {
            _type: 'menuLink',
            _key: 'night-tour',
            label: 'Tour Nocturno',
            internalHref: '/#hero-booking-form',
            external: false,
          },
        ],
        translations: {
          en: {
            title: 'Services',
          },
          fr: {
            title: 'Services',
          },
        },
      },
    ],
    
    // Traducciones del footer
    translations: {
      en: {
        description: 'Private transportation service in Paris. We connect airports, downtown Paris and Disneyland with comfort and elegance.',
        statsText: '+1000 satisfied customers',
        copyright: '© 2025 REDESERVI PARIS. All rights reserved.',
      },
      fr: {
        description: 'Service de transport privé à Paris. Nous connectons les aéroports, le centre de Paris et Disneyland avec confort et élégance.',
        statsText: '+1000 clients satisfaits',
        copyright: '© 2025 REDESERVI PARIS. Tous droits réservés.',
      },
    },
  }

  try {
    const result = await client.createOrReplace(footerData)
    console.log('✅ Footer actualizado exitosamente')
    console.log('📦 Documento:', result._id)
    console.log('🌐 Idiomas añadidos: español (es - default), inglés (en), francés (fr)')
    console.log('🎉 Proceso completado')
  } catch (error) {
    console.error('❌ Error al actualizar el Footer:', error)
    throw error
  }
}

seedFooterSection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
