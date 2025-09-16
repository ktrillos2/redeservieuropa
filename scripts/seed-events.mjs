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
      _type: 'event',
      title: 'Tour París Nocturno',
      image: await maybeUploadImage('vehicles/stepway-paris-2.jpg', 'tour-paris-nocturno.jpg'),
      pricePerPerson: 200,
      date: '2025-10-15',
      time: '18:00',
      meetingPoint: 'Disneyland Paris – Punto de encuentro',
      isActive: true,
      order: 1,
    },
    {
      _id: 'event-shuttle-disney',
      _type: 'event',
      title: 'Shuttle a Disneyland (Ida/Vuelta)',
      image: await maybeUploadImage('family-transport-to-disneyland-paris-castle.jpg', 'disney-shuttle.jpg'),
      pricePerPerson: 60,
      date: '2025-10-20',
      time: '09:00',
      meetingPoint: 'París Centro',
      isActive: true,
      order: 2,
    },
    {
      _id: 'event-maraton-paris',
      _type: 'event',
      title: 'Traslado especial Maratón París',
      image: await maybeUploadImage('vehicles/stepway-paris-4.jpg', 'maraton-paris.jpg'),
      pricePerPerson: 45,
      date: '2025-11-02',
      time: '06:30',
      meetingPoint: 'Aeropuerto CDG – Terminal 2',
      isActive: true,
      order: 3,
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
