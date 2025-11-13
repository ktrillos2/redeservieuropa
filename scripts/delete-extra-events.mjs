import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-15').trim()
const token = (process.env.SANITY_API_TOKEN || '').trim()

if (!projectId || !dataset || !token) {
  console.error('Faltan variables de entorno necesarias')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function deleteExtraEvents() {
  console.log('🗑️  Eliminando eventos extras...')
  
  const idsToDelete = [
    'event-shuttle-disney',
    'event-maraton-paris'
  ]
  
  const tx = client.transaction()
  for (const id of idsToDelete) {
    tx.delete(id)
  }
  
  const result = await tx.commit()
  console.log(`✅ Eliminados ${idsToDelete.length} eventos:`)
  idsToDelete.forEach(id => console.log(`   - ${id}`))
  console.log('\n✨ Ahora solo existe: event-tour-paris-nocturno')
}

deleteExtraEvents().catch(console.error)
