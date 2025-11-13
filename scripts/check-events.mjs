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

async function checkEvents() {
  const events = await client.fetch(`*[_type in ["events","event"]]{_id, _type, title, isActive}`)
  console.log('📋 Eventos encontrados en Sanity:')
  console.log(JSON.stringify(events, null, 2))
  console.log(`\n✅ Total: ${events.length} eventos`)
}

checkEvents().catch(console.error)
