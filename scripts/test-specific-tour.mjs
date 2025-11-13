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

const testSlug = 'paris-brujas-gante-belgica-1-dia'

// Misma query que usa la página
const query = `*[_type == "tour" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  summary,
  description,
  mainImage,
  route{origin, destination, circuitName, roundTrip},
  features,
  includes,
  visitedPlaces,
  notes,
  amenities,
  pricingMode,
  pricingRules{ baseUpTo4EUR },
  pricingTable{ p4,p5,p6,p7,p8,extraFrom9 },
  booking{ startingPriceEUR },
  isPopular,
  orderRank,
  requirements{ requireTime, requireFlightNumber },
  overCapacityNote,
  translations
}`

console.log('\n=== Buscando tour ===')
console.log('Slug:', testSlug)

const result = await client.fetch(query, { slug: testSlug })

if (result) {
  console.log('\n✅ Tour encontrado:')
  console.log('- ID:', result._id)
  console.log('- Título:', result.title)
  console.log('- Summary:', result.summary ? 'Sí' : 'NO')
  console.log('- Description:', result.description ? 'Sí' : 'NO')
  console.log('- PricingMode:', result.pricingMode || 'NO definido')
  console.log('- PricingTable:', result.pricingTable ? 'Sí' : 'NO')
  console.log('- Translations:', result.translations ? 'Sí' : 'NO')
} else {
  console.log('\n❌ Tour NO encontrado')
  
  // Buscar tours con slug similar
  const similarQuery = `*[_type == "tour" && slug.current match "*brujas*gante*"]{
    _id,
    title,
    "slug": slug.current
  }`
  const similar = await client.fetch(similarQuery)
  
  if (similar.length > 0) {
    console.log('\nTours similares encontrados:')
    similar.forEach(t => {
      console.log(`- ${t.title} (slug: ${t.slug})`)
    })
  }
}

process.exit(0)
