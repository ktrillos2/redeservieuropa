/*
  Seed para la sección "Contáctanos" (singleton contactSection)
  Ejecuta: pnpm run seed:sanity:contact-section
*/
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
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SANITY_PROJECT_ID y/o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('Falta SANITY_API_TOKEN en tu entorno (.env/.env.local). Requiero un token con permisos de escritura.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

const doc = {
  _id: 'contactSection',
  _type: 'contactSection',
  title: 'Contáctanos',
  subtitle: 'Estamos disponibles 24/7 para atender tus consultas y reservas.',
  formTitle: 'Envíanos un Mensaje',
  formNote: '',
  showWhatsAppButton: true,
}

async function run() {
  const res = await client.transaction().createOrReplace(doc).commit()
  console.log('[seed:contact-section] Done:', res?.results?.length || 0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
