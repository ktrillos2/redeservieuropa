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
  console.error('Faltan variables de entorno')
  process.exit(1)
}

if (!token) {
  console.error('Falta SANITY_API_TOKEN')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

// Tours a eliminar por slug
const toursToDelete = [
  'paris-dominio-versailles-6h',
  'paris-brujas-belgica-1-dia',
  'paris-brujas-gante-belgica-1-dia'
]

console.log('\n=== Eliminando tours inválidos ===\n')

for (const slug of toursToDelete) {
  try {
    // Buscar el tour por slug
    const query = `*[_type == "tour" && slug.current == $slug][0]{ _id, title }`
    const tour = await client.fetch(query, { slug })
    
    if (tour) {
      console.log(`🗑️  Eliminando: ${tour.title} (${slug})`)
      await client.delete(tour._id)
      console.log(`✅ Eliminado correctamente\n`)
    } else {
      console.log(`⚠️  No encontrado: ${slug}\n`)
    }
  } catch (error) {
    console.error(`❌ Error eliminando ${slug}:`, error.message)
  }
}

console.log('✨ Proceso completado\n')
process.exit(0)
