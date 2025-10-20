/*
  Importador de Tours a Sanity (usa esquema schemas/tour.ts)

  - Entrada: ./data/tours.csv con columnas EXACTAS:
      origin,circuit,destination,p4
    p4 puede venir con coma o punto y con símbolo €, se normaliza a number.

  - Solo se sube el precio base (hasta 4 personas) en pricingRules.baseUpTo4EUR.
    El resto de precios (5..8, 9+) se calculan automáticamente por reglas en el frontend/back.

  - Variables de entorno necesarias (como en otros scripts):
      SANITY_PROJECT_ID | NEXT_PUBLIC_SANITY_PROJECT_ID
      SANITY_DATASET    | NEXT_PUBLIC_SANITY_DATASET
      SANITY_TOKEN      | SANITY_API_TOKEN

  - Ejecutar:
      npm run import:tours
    (añadimos script en package.json)

  Ejemplo de CSV (copiar como ./data/tours.csv):
  origin,circuit,destination,p4
  "Disneyland","París (Tour Eiffel y Arco del Triunfo)","Disneyland",211
  "Disneyland","París Tour (3 horas)","Aeropuerto CDG u ORLY",301
  "Disneyland","París Tour (2 horas)","Aeropuerto CDG u ORLY",256
  "Disneyland","París (Tour Eiffel y Arco del Triunfo)","Aeropuerto CDG u ORLY",201
  "Aeropuerto CDG u ORLY","París Tour (3 horas)","Disneyland",301
  "Aeropuerto CDG u ORLY","París Tour (2 horas)","Disneyland",256
  "Aeropuerto CDG u ORLY","París (Tour Eiffel y Arco del Triunfo)","Disneyland",201
  "Hotel París","París Tour (3 horas)","Aeropuerto CDG u ORLY",210
  "Hotel París","París Tour (2 horas)","Aeropuerto CDG u ORLY",160
  "Aeropuerto CDG u ORLY","París Tour (3 horas)","Hotel París",210
  "Aeropuerto CDG u ORLY","París Tour (2 horas)","Hotel París",160
  "Hotel París","París Tour (3 horas)","Hotel París o centro de París",165
  "Hotel París","París Tour (2 horas)","Hotel París o centro de París",120
*/

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import { createClient } from 'next-sanity'

type SanityClient = ReturnType<typeof createClient>

type CsvRow = {
  origin: string
  circuit: string
  destination: string
  p4: string | number
}

type Block = {
  _type: 'block'
  style?: 'normal' | 'h3' | 'h4'
  children: Array<{ _type: 'span'; text: string }>
}

function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 96)
}

function parseMoney(v: string | number): number {
  if (typeof v === 'number') return v
  const s = (v || '').toString().replace(/€/g, '').replace(/\s+/g, '').replace(',', '.')
  const n = Number(s)
  if (!Number.isFinite(n)) throw new Error(`Valor monetario inválido: ${v}`)
  return n
}

function parseCsv(input: string): CsvRow[] {
  const lines = input.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = splitCsvLine(lines[0]).map((h) => h.trim())
  const expected = ['origin', 'circuit', 'destination', 'p4']
  const ok = expected.every((k, i) => header[i] === k)
  if (!ok) throw new Error(`Cabecera inválida. Esperado: ${expected.join(',')}. Recibido: ${header.join(',')}`)
  const out: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    if (!cols.length) continue
    out.push({ origin: cols[0] || '', circuit: cols[1] || '', destination: cols[2] || '', p4: cols[3] || '' })
  }
  return out
}

function splitCsvLine(line: string): string[] {
  const res: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      res.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  res.push(current)
  return res.map((s) => {
    let t = s.trim()
    if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1)
    return t
  })
}

function detectPlaces(circuit: string): string[] {
  const lower = circuit.toLowerCase()
  const places: string[] = []
  if (lower.includes('eiffel')) places.push('Torre Eiffel')
  if (lower.includes('arco')) places.push('Arco del Triunfo')
  if (lower.includes('louvre')) places.push('Museo del Louvre')
  if (lower.includes('campos')) places.push('Campos Elíseos')
  if (lower.includes('notre')) places.push('Notre Dame')
  if (lower.includes('trocad')) places.push('Trocadéro')
  if (lower.includes('parís') || lower.includes('paris')) places.push('Centro de París')
  return Array.from(new Set(places))
}

function buildTexts(origin: string, circuit: string, destination: string) {
  const title = `${origin} - ${circuit} - ${destination}`
  const summary = `Tour privado: ${circuit}. Servicio puerta a puerta con conductor profesional. Incluye peajes y equipaje estándar.`
  const paras: string[] = []
  paras.push(
    `Disfruta un recorrido cómodo y personalizado: ${circuit}. Te recogemos en ${origin} y finalizamos en ${destination}.`
  )
  paras.push(
    'Hacemos paradas breves para fotos cuando es posible y adaptamos el itinerario a las condiciones de tráfico.'
  )
  paras.push(
    'Incluye: peajes, combustible y tiempo de espera razonable. Los precios son por servicio (no por persona).'
  )
  const descriptionBlocks: Block[] = paras.map((text) => ({ _type: 'block', style: 'normal', children: [{ _type: 'span', text }] }))
  const features = [
    'Paradas en puntos icónicos (según tráfico)',
    'Conductor ES/EN/FR',
    'Vehículo amplio y climatizado',
  ]
  const includes = ['Peajes y combustible incluidos', 'Recogida puntual', 'Seguro de pasajeros']
  const notes = [
    'Itinerario y tiempos sujetos al tráfico y a condiciones de seguridad.',
    'Precios por servicio, no por pasajero.',
  ]
  const amenities = ['WiFi de cortesía', 'Agua a bordo', 'Aire acondicionado']
  const visitedPlaces = detectPlaces(circuit)
  return { title, summary, descriptionBlocks, features, includes, notes, amenities, visitedPlaces }
}

async function upsertTour(client: SanityClient, doc: any): Promise<'created' | 'updated'> {
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type=="tour" && slug.current==$slug][0]{_id}',
    { slug: doc.slug.current }
  )
  if (existing?._id) {
    await client.patch(existing._id).set(doc).commit()
    return 'updated'
  }
  await client.create(doc)
  return 'created'
}

async function main() {
  // Load envs
  dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
  dotenvConfig({ path: path.join(process.cwd(), '.env') })

  const projectId = (process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
  const dataset = (process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
  const token = (process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN || '').trim()
  const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-01-01').trim()

  if (!projectId || !dataset || !token) {
    console.error('Faltan variables: SANITY_PROJECT_ID/DATASET/TOKEN (o NEXT_PUBLIC_*)')
    process.exit(1)
  }

  const client = createClient({ projectId, dataset, token, useCdn: false, apiVersion })

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const csvPath = path.resolve(__dirname, '../data/tours.csv')
  const content = await readFile(csvPath, 'utf8')
  const rows = parseCsv(content)

  let processed = 0
  let created = 0
  let updated = 0
  let failed = 0

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const order = i + 1
    try {
      const origin = r.origin.trim()
      const destination = r.destination.trim()
      const circuit = r.circuit.trim()
      const base = parseMoney(r.p4)
      if (!origin || !destination || !circuit) throw new Error('Campos origin/circuit/destination vacíos')

      const { title, summary, descriptionBlocks, features, includes, notes, amenities, visitedPlaces } =
        buildTexts(origin, circuit, destination)
      const slug = slugify(`${title}`)

      const roundTrip = origin.toLowerCase() === destination.toLowerCase()

      const doc: any = {
        _type: 'tour',
        title,
        slug: { _type: 'slug', current: slug },
        route: { origin, destination, circuitName: circuit, roundTrip },
        summary,
        description: descriptionBlocks,
        features,
        includes,
        visitedPlaces,
        notes,
        amenities,
        pricingMode: 'rules',
        pricingRules: { baseUpTo4EUR: base },
        booking: {
          startingPriceEUR: base,
          priceNote:
            'Precio base hasta 4 pax. Incrementos automáticos: +34 (5 pax), +32 (6), +28 (7), +26 (8). 9+ = precio de 8 pax.',
        },
        isPopular: false,
        orderRank: String(order).padStart(4, '0'),
      }

      const res = await upsertTour(client, doc)
      processed++
      if (res === 'created') created++
      if (res === 'updated') updated++
      console.log(`${res.toUpperCase()} slug=${slug} | ${origin} - ${circuit} - ${destination} | base€=${base}`)
    } catch (err: any) {
      failed++
      console.error(`ERROR fila ${order}:`, err?.message || err)
    }
  }

  console.log('—'.repeat(60))
  console.log(`Tours: processed=${processed} created=${created} updated=${updated} failed=${failed}`)
}

main().catch((err) => {
  console.error('Fallo en import-tours:', err)
  process.exit(1)
})
