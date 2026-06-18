/*
 Seed que crea documentos individuales de transfers.
 Basado en los valores locales previos + especiales.
*/
import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const token = process.env.SANITY_API_TOKEN

if (!projectId || !dataset || !token) {
  console.error('Faltan credenciales para seed transfers list')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion: '2024-10-01', useCdn: false, token })

const baseTransfers = [
  { from: 'CDG', to: 'París', price: '65€', description: 'Aeropuerto Charles de Gaulle', duration: '45-60 min', popular: true, order: 1 },
  { from: 'Orly', to: 'París', price: '60€', description: 'Aeropuerto de Orly', duration: '30-45 min', order: 2 },
  { from: 'Beauvais', to: 'París', price: '125€', description: 'Aeropuerto Beauvais', duration: '75-90 min', order: 3 },
  { from: 'París', to: 'Disneyland', price: '70€', description: 'Centro de París a Disneyland', duration: '45-60 min', popular: true, order: 4 },
  { from: 'Orly', to: 'Disneyland', price: '73€', description: 'Aeropuerto Orly a Disneyland', duration: '60-75 min', order: 5 },
  { from: 'Tour', to: 'Nocturno', price: '65€/h', description: 'Tour nocturno por París (mín. 2h)', duration: '2+ horas', popular: true, order: 6 },
]

const specialTransfers = [
  { from: 'París', to: 'Versailles', price: '65€', isSpecial: true, subtitle: 'Hasta 4 pax', notes: '+10€ por pasajero adicional (Versailles)', order: 50, description: 'Traslado especial', duration: 'Variable' },
  { from: 'París', to: 'Parque Asterix', price: '70€', isSpecial: true, subtitle: 'París / Orly', notes: '+20€ por pasajero adicional (Asterix)', order: 51, description: 'Traslado especial', duration: 'Variable' },
  { from: 'París', to: "Casa de Monet (Giverny)", price: '100€', isSpecial: true, subtitle: 'Hasta 4 pax', notes: 'Persona adicional 12€ (Giverny)', order: 52, description: 'Traslado especial', duration: 'Variable' },
]

async function run() {
  const existing = await client.fetch("*[_type=='transfers']{_id, from, to}")
  const tx = client.transaction()

  const slugPart = (str: string) => str
    .normalize('NFD')
    .replace(/[^\p{Letter}\p{Number}\s]/gu, '') // quitar símbolos excepto letras/números/espacios
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/\s+/g, '-')
    .toLowerCase()

  ;[...baseTransfers, ...specialTransfers].forEach((t: any) => {
    const base = `${slugPart(t.from)}-${slugPart(t.to)}`
    const id = `transfer-${base}`
    const slug = { _type: 'slug', current: base }
    tx.createOrReplace({ _id: id, _type: 'transfers', popular: false, slug, ...t })
  })

  await tx.commit()
  console.log('[seed:transfers-list] Upsert de transfers completado.')
}

run().catch(e => { console.error(e); process.exit(1) })
