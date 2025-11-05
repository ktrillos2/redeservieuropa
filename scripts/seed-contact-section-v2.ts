/*
 Seed para crear/actualizar el documento de contenido de la sección de contacto.
 Ejecuta: npx tsx scripts/seed-contact-section-v2.ts
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
  console.error('[seed:contactSection] Faltan NEXT_PUBLIC_SANITY_PROJECT_ID o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('[seed:contactSection] Falta SANITY_API_TOKEN con permisos de escritura')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function seedContactSection() {
  console.log('🌍 Iniciando seed de la sección de Contacto...')

  const contactData = {
    _id: 'contactSection',
    _type: 'contactSection',
    
    // Español (contenido por defecto)
    title: 'Contáctanos',
    subtitle: 'Estamos disponibles 24/7 para atender tus consultas y reservas.',
    formTitle: 'Envíanos un Mensaje',
    formNote: 'Por favor, asegúrate de completar todos tus datos para que podamos contactarte.',
    showWhatsAppButton: true,
    
    // Traducciones
    translations: {
      en: {
        title: 'Contact Us',
        subtitle: 'We are available 24/7 to assist with your inquiries and bookings.',
        formTitle: 'Send Us a Message',
        formNote: 'Please make sure to complete all your details so we can contact you.',
      },
      fr: {
        title: 'Contactez-Nous',
        subtitle: 'Nous sommes disponibles 24h/24 et 7j/7 pour répondre à vos demandes et réservations.',
        formTitle: 'Envoyez-Nous un Message',
        formNote: 'Veuillez vous assurer de remplir toutes vos coordonnées afin que nous puissions vous contacter.',
      },
    },
  }

  try {
    const result = await client.createOrReplace(contactData)
    console.log('✅ Sección de Contacto actualizada exitosamente')
    console.log('📦 Documento:', result._id)
    console.log('🌐 Idiomas añadidos: español (es - default), inglés (en), francés (fr)')
    console.log('🎉 Proceso completado')
  } catch (error) {
    console.error('❌ Error al actualizar la sección de Contacto:', error)
    throw error
  }
}

seedContactSection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
