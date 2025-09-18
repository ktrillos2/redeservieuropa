/*
 Seed para crear/actualizar el documento de contenido de la sección de traslados.
 Ejecuta: pnpm ts-node scripts/seed-transfers-section.ts (o compila según tu setup)
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
  console.error('[seed:transfersSection] Faltan NEXT_PUBLIC_SANITY_PROJECT_ID o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('[seed:transfersSection] Falta SANITY_API_TOKEN con permisos de escritura')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function run() {
  const doc = {
    _id: 'transfersSectionContent',
    _type: 'transfersSectionContent',
    title: 'Nuestros Traslados',
    subtitle: 'Traslados privados y puntuales entre aeropuertos, ciudad y destinos especiales.',
    highlight: 'Servicio 24/7 con conductores profesionales y vehículos confortables.',
    footnote: '* Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.',
    cta: { label: 'Reservar ahora', internalHref: '#hero' },
    notes: [
      'Seguimiento de vuelos en tiempo real',
      'Cancelación gratuita hasta 24h antes',
      'Conductores bilingües',
    ],
    extraCharges: [
      { icon: 'clock', text: 'Recargo nocturno (después 21h)', price: '+5€' },
      { icon: 'luggage', text: 'Equipaje voluminoso (+3 maletas 23kg)', price: '+10€' },
      { icon: 'users', text: 'Pasajero adicional', price: '+20€' },
    ]
  }

  await client.transaction().createOrReplace(doc).commit()
  console.log('[seed:transfersSection] upsert transfersSectionContent')
}

run().catch((err) => { console.error(err); process.exit(1) })
