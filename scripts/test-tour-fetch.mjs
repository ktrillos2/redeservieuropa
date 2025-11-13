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

const testSlug = 'paris-dominio-versailles-6h'

const query = `*[_type == "tour" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  summary
}`

const result = await client.fetch(query, { slug: testSlug })

console.log('\n=== Resultado de búsqueda ===')
console.log('Slug buscado:', testSlug)
console.log('Resultado:', result)

process.exit(0)
