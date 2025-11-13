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

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

const query = `*[_type == "tour"] | order(orderRank asc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current
}`

const tours = await client.fetch(query)

console.log('\n=== Tours en Sanity ===')
console.log('Total:', tours.length)
tours.forEach(t => {
  console.log(`- ${t.title} (slug: ${t.slug})`)
})

process.exit(0)
