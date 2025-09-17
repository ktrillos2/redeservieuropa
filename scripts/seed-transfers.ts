/*
  Seed para la sección de Traslados (singleton transfers)
  Ejecuta: pnpm run seed:sanity:transfers
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

const routes = [
  { from: 'CDG', to: 'París', price: '65€', description: 'Aeropuerto Charles de Gaulle', duration: '45-60 min', popular: true, icon: 'plane' },
  { from: 'Orly', to: 'París', price: '60€', description: 'Aeropuerto de Orly', duration: '30-45 min', popular: false, icon: 'plane' },
  { from: 'Beauvais', to: 'París', price: '125€', description: 'Aeropuerto Beauvais', duration: '75-90 min', popular: false, icon: 'plane' },
  { from: 'París', to: 'Disneyland', price: '70€', description: 'Centro de París a Disneyland', duration: '45-60 min', popular: true, icon: 'map-pin' },
  { from: 'Orly', to: 'Disneyland', price: '73€', description: 'Aeropuerto Orly a Disneyland', duration: '60-75 min', popular: false, icon: 'plane' },
  { from: 'Tour', to: 'Nocturno', price: '65€/h', description: 'Tour nocturno por París (mín. 2h)', duration: '2+ horas', popular: true, icon: 'clock' },
]

const extraCharges = [
  { icon: 'clock', text: 'Recargo nocturno (después 21h)', price: '+5€' },
  { icon: 'luggage', text: 'Equipaje voluminoso (+3 maletas 23kg)', price: '+10€' },
  { icon: 'users', text: 'Pasajero adicional', price: '+20€' },
]

const specials = [
  { title: 'Versailles', subtitle: 'Desde París. Hasta 4 pax', price: '65€', icon: 'map-pin', notes: '+10€ por pasajero adicional (Versailles)' },
  { title: 'Parque Asterix', subtitle: 'Desde París u Orly', price: '70€', icon: 'plane', notes: '+20€ por persona adicional (Asterix)' },
  { title: 'Casa de Monet (Giverny)', subtitle: 'Desde París · hasta 4 pax', price: '100€', icon: 'map-pin', notes: 'Persona adicional 12€ (Giverny)' },
]

const doc = {
  _id: 'transfers',
  _type: 'transfers',
  title: 'Nuestros Traslados',
  subtitle: 'Tarifas transparentes para todos nuestros servicios de transporte premium en París.',
  routes,
  extraCharges,
  specials,
  footnote:
    'Nota: Para grupos de 5+ pasajeros, se combina la tarifa base + tarifa de vehículo adicional. Ejemplo: 9 pasajeros = Tarifa de 5 + Tarifa de 4 adicionales.',
}

async function run() {
  const res = await client.transaction().createOrReplace(doc).commit()
  console.log('[seed:transfers] Done:', res?.results?.length || 0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
