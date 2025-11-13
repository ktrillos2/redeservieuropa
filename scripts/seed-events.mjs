/*
 Seed para crear algunos eventos de ejemplo en Sanity.

 Ejecuta: pnpm run seed:sanity:events
*/

import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'
import fs from 'node:fs'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-15').trim()
const token = (process.env.SANITY_API_TOKEN || '').trim()

if (!projectId || !dataset) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SANITY_PROJECT_ID y/o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('Falta SANITY_API_TOKEN en tu entorno (.env/.env.local). Requiero un token con permisos de escritura.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function maybeUploadImage(relPath, filename) {
  const full = path.join(process.cwd(), 'public', relPath)
  if (!fs.existsSync(full)) {
    console.warn(`[seed:events] No existe imagen ${relPath}`)
    return undefined
  }
  const stream = fs.createReadStream(full)
  const upload = await client.assets.upload('image', stream, { filename, contentType: 'image/jpeg' })
  return { _type: 'image', asset: { _type: 'reference', _ref: upload._id } }
}

async function run() {
  const items = [
    {
      _id: 'event-tour-paris-nocturno',
      _type: 'events',
      title: 'Tour París Nocturno',
      translations: {
        en: {
          title: 'Paris Night Tour',
          shortInfo: 'Explore Paris illuminated with an English-speaking guide. Limited spots, photo stops included.',
          description: 'Discover the magic of Paris by night on a panoramic tour with strategic photo stops. Ideal for couples and families.',
          meetingPoint: 'Disneyland Paris – Meeting point',
        },
        fr: {
          title: 'Visite Nocturne de Paris',
          shortInfo: 'Parcourez Paris illuminé avec un guide francophone. Places limitées, arrêts photo inclus.',
          description: 'Découvrez la magie de Paris la nuit lors d\'un tour panoramique avec des arrêts photo stratégiques. Idéal pour les couples et les familles.',
          meetingPoint: 'Disneyland Paris – Point de rencontre',
        }
      },
      image: await maybeUploadImage('vehicles/stepway-paris-2.jpg', 'tour-paris-nocturno.jpg'),
      pricePerPerson: 200,
      date: '2025-10-15',
      time: '18:00',
      meetingPoint: 'Disneyland Paris – Punto de encuentro',
      shortInfo: 'Recorre París iluminado con guía en español. Plazas limitadas, incluye paradas fotográficas.',
      description: 'Descubre la magia de París por la noche en un tour panorámico con paradas estratégicas para fotos inolvidables. Ideal para parejas y familias.',
      gallery: [
        await maybeUploadImage('vehicles/stepway-paris-2.jpg', 'tour-paris-nocturno-1.jpg'),
        await maybeUploadImage('elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg', 'tour-paris-nocturno-2.jpg'),
        await maybeUploadImage('vehicles/stepway-paris-6.jpg', 'tour-paris-nocturno-3.jpg'),
      ],
      isActive: true,
      order: 1,
    },
  ]

  const tx = client.transaction()
  for (const it of items) tx.createOrReplace(it)
  const res = await tx.commit()
  console.log('[seed:events] Done:', res?.results?.length || 0, 'items')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
