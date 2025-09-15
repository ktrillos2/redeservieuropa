/*
 Seed para crear/actualizar el documento singleton "hero" en Sanity y subir imagen de fondo.

 Ejecuta: pnpm run seed:sanity:hero
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

async function run() {
  let bg = undefined
  const bgPath = path.join(process.cwd(), 'public', 'elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg')
  if (fs.existsSync(bgPath)) {
    const stream = fs.createReadStream(bgPath)
    const upload = await client.assets.upload('image', stream, { filename: 'hero-bg.jpg', contentType: 'image/jpeg' })
    bg = { _type: 'image', asset: { _type: 'reference', _ref: upload._id }, alt: 'París' }
  } else {
    console.warn('[seed:hero] No se encontró la imagen de fondo en public/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg')
  }

  const doc = {
    _id: 'hero',
    _type: 'hero',
    title: 'Transporte',
    highlight: 'Comodo y Seguro',
    description: 'Transporte Privado en París\nConfort, seguridad y puntualidad.\nTraslados desde/hacia aeropuertos (CDG, ORY, BVA), viajes a Disneyland, tours privados por la ciudad,\nexcursiones a Brujas y mucho más.\nVive París sin preocupaciones.',
    backgroundImage: bg,
    primaryCta: { label: 'Reservar Ahora', internalHref: '#', external: false },
    secondaryCta: { label: 'Ver Servicios', internalHref: '#', external: false },
    showBookingForm: true,
  }

  const res = await client.transaction().createOrReplace(doc).commit()
  console.log('[seed:hero] Done:', res)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
