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

// Buscar tours con palabras clave
const searchTerms = ['Versailles', 'Brujas', 'Bruges', 'Gante', 'Ghent', 'Bélgica', 'Belgium']

console.log('\n=== Buscando tours con los términos ===\n')

const query = `*[_type == "tour"] {
  _id,
  title,
  "slug": slug.current
} | order(title asc)`

const allTours = await client.fetch(query)

console.log('Tours que contienen las palabras clave:\n')

searchTerms.forEach(term => {
  const found = allTours.filter(t => 
    t.title?.toLowerCase().includes(term.toLowerCase())
  )
  
  if (found.length > 0) {
    console.log(`\n📍 "${term}":`)
    found.forEach(t => {
      console.log(`   - ${t.title}`)
      console.log(`     ID: ${t._id}`)
      console.log(`     Slug: ${t.slug || 'SIN SLUG'}`)
    })
  }
})

process.exit(0)
