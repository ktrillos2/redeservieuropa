/*
  Seed para la sección "Testimonios" (singleton testimonialsSection)
  Ejecuta: pnpm run seed:sanity:testimonials-section
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

function fileImageRef(p: string | undefined) {
  if (!p) return undefined
  const rel = p.startsWith('/') ? p.slice(1) : p
  const full = path.join(process.cwd(), 'public', rel)
  if (!fs.existsSync(full)) return undefined
  return fs.createReadStream(full)
}

async function maybeUploadImage(rel: string | undefined) {
  if (!rel) return undefined
  const stream = fileImageRef(rel)
  if (!stream) return undefined
  const filename = path.basename(rel)
  const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
  const upload = await client.assets.upload('image', stream, { filename, contentType })
  return { _type: 'image', asset: { _type: 'reference', _ref: upload._id } }
}

const LOCAL_TESTIMONIALS = [
  {
    name: 'María González',
    location: 'Madrid, España',
    rating: 5,
    comment:
      'Servicio excepcional. El conductor fue muy puntual y el vehículo impecable. Definitivamente lo recomiendo para traslados en París.',
    service: 'CDG → París',
    avatar: '/business-man-smiling.jpg',
  },
  {
    name: 'Carlos Rodríguez',
    location: 'Bogotá, Colombia',
    rating: 5,
    comment:
      'Perfecto para familias. Nos llevaron a Disneyland sin problemas, el conductor conocía muy bien la ruta y fue muy amable con los niños.',
    service: 'París → Disneyland',
    avatar: '/family-transport-to-disneyland-paris-castle.jpg',
  },
  {
    name: 'Ana Martínez',
    location: 'Barcelona, España',
    rating: 5,
    comment:
      'El tour nocturno por París fue increíble. Vimos todos los monumentos iluminados y el conductor nos dio excelentes recomendaciones.',
    service: 'Tour Nocturno',
    avatar: '/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg',
  },
  {
    name: 'Luis Fernández',
    location: 'México DF, México',
    rating: 5,
    comment:
      'Muy profesional y confiable. Llegué tarde por el vuelo y me esperaron sin costo adicional. Excelente servicio al cliente.',
    service: 'Orly → París',
    avatar: '/professional-man-smiling.png',
  },
  {
    name: 'Isabella Silva',
    location: 'São Paulo, Brasil',
    rating: 5,
    comment:
      'Comodidad y elegancia en cada detalle. El vehículo era muy limpio y cómodo. Una experiencia de lujo a precio justo.',
    service: 'Beauvais → París',
    avatar: '/professional-woman-smiling.png',
  },
]

async function run() {
  const testimonials = [] as any[]
  for (const t of LOCAL_TESTIMONIALS) {
    const img = await maybeUploadImage(t.avatar)
    testimonials.push({ ...t, avatar: img })
  }

  const doc = {
    _id: 'testimonialsSection',
    _type: 'testimonialsSection',
    title: 'Lo que Dicen Nuestros Clientes',
    subtitle: 'Más de 1000 clientes satisfechos confían en nuestro servicio premium de transporte.',
    testimonials,
  }

  const res = await client.transaction().createOrReplace(doc).commit()
  console.log('[seed:testimonials-section] Done:', res?.results?.length || 0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
