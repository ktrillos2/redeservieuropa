/*
  Migra documentos legacy 'event' -> 'events' y 'tour' -> 'tours'.
  Estrategia: lee docs legacy, los borra y crea con mismo _id usando el nuevo _type.
  Uso:
    pnpm tsx scripts/migrate-legacy-types.mjs --apply
  Sin --apply hace solo dry-run.
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

if (!projectId || !dataset || !token) {
  console.error('[migrate-legacy-types] Faltan credenciales')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

const APPLY = process.argv.includes('--apply')

async function run() {
  const legacyEvents = await client.fetch("*[_type == 'event']")
  const legacyTours = await client.fetch("*[_type == 'tour']")
  const oldTransfersSingleton = await client.fetch("*[_type == 'transfers' && defined(routes)][0]{_id}")

  console.log(`[migrate] legacy events: ${legacyEvents.length}, legacy tours: ${legacyTours.length}, old transfers singleton: ${oldTransfersSingleton?._id ? 'yes' : 'no'}`)
  if (!APPLY) {
    console.log('Dry-run. Añade --apply para ejecutar.')
    return
  }

  const tx = client.transaction()

  for (const doc of legacyEvents) {
    tx.delete(doc._id)
  }
  for (const doc of legacyTours) {
    tx.delete(doc._id)
  }
  if (oldTransfersSingleton?._id) {
    tx.delete(oldTransfersSingleton._id)
  }

  const res = await tx.commit()
  console.log('[migrate] deleted legacy docs. Ahora ejecuta seeds:')
  console.log('  pnpm run seed:sanity:events')
  console.log('  pnpm run seed:sanity:tours')
  console.log('  pnpm run seed:sanity:tours-section')
  console.log('  pnpm run seed:sanity:transfers-list (si no lo hiciste)')
}

run().catch(e => { console.error(e); process.exit(1) })
