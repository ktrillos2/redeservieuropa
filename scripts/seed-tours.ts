/*
 Carga tours en Sanity a partir del mock actual, incluyendo imágenes desde /public si existen.
 Ejecuta: pnpm run seed:sanity:tours
*/
import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'
import fs from 'node:fs'
import { tourData } from '../lib/tours'

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

async function uploadImageIfExists(relPath?: string) {
  if (!relPath) return undefined
  const p = relPath.startsWith('/') ? relPath.slice(1) : relPath
  const full = path.join(process.cwd(), 'public', p)
  if (!fs.existsSync(full)) return undefined
  const stream = fs.createReadStream(full)
  const filename = path.basename(full)
  const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
  const upload = await client.assets.upload('image', stream, { filename, contentType })
  return { _type: 'image', asset: { _type: 'reference', _ref: upload._id } }
}

function slugify(str: string) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function run() {
  const entries = Object.entries(tourData)
  for (const [key, t] of entries) {
    const slug = slugify(key)
    const mainImage = await uploadImageIfExists(t.image)
    const gallery = Array.isArray(t.gallery) ? await Promise.all(t.gallery.map(uploadImageIfExists)) : []
    const pricing = t.pricing
      ? Object.entries(t.pricing).map(([pax, price]) => ({ pax: Number(pax), price: Number(price) }))
      : undefined
    const doc: any = {
  _type: 'tours',
      _id: `tour-${slug}`,
      title: t.title,
      slug: { _type: 'slug', current: slug },
      description: t.description,
      duration: t.duration,
      distance: t.distance,
      mainImage,
      gallery: (gallery || []).filter(Boolean),
      features: t.features || [],
      included: t.included || [],
      basePrice: t.basePrice,
      basePriceDay: t.basePriceDay,
      basePriceNight: t.basePriceNight,
      pricing,
      pricingP4: t.pricingP4,
      pricingP5: t.pricingP5,
      amenities: t.amenities || [],
      pricingOptions: (t.pricingOptions || []).map(po => ({
        _type: 'pricingOption',
        label: po.label,
        price: po.price,
        hours: po.hours,
        description: po.description,
      })),
      isActive: true,
      order: 1,
    }
    await client.transaction().createOrReplace(doc).commit()
    console.log('[seed:tours] upsert', doc._id)
  }
  console.log('[seed:tours] done')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
