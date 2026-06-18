import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-15').trim()
const token = (process.env.SANITY_API_TOKEN || '').trim()

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

// Query para tours con todos los campos necesarios
const query = `*[_type == "tour"] | order(orderRank asc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  summary,
  description,
  mainImage,
  pricingMode,
  pricingTable
}`

const tours = await client.fetch(query)

console.log('\n=== Verificación de Tours ===')
console.log('Total de tours:', tours.length)
console.log('\nTours sin slug:')
const withoutSlug = tours.filter(t => !t.slug)
console.log(withoutSlug.length ? withoutSlug.map(t => `- ${t.title} (ID: ${t._id})`).join('\n') : '  Ninguno')

console.log('\nTours sin campos importantes:')
tours.forEach(t => {
  const missing = []
  if (!t.slug) missing.push('slug')
  if (!t.summary) missing.push('summary')
  if (!t.description) missing.push('description')
  if (!t.pricingTable && !t.pricingMode) missing.push('pricing')
  
  if (missing.length > 0) {
    console.log(`- ${t.title} (${t.slug || 'sin-slug'}) - Faltan: ${missing.join(', ')}`)
  }
})

process.exit(0)
