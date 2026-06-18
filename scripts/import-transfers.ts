/*
  Importador de traslados (transfers) a Sanity

  Uso
  - CSV esperado en: ./data/transfers.csv
  - Separador: coma (,)
  - Debe tener cabecera con columnas EXACTAS:
      from,to,p4,p5,p6,p7,p8
    (p4..p8 pueden venir con coma o punto decimal; se normalizan a number)

  - Variables de entorno necesarias:
      SANITY_PROJECT_ID
      SANITY_DATASET
      SANITY_TOKEN
    (useCdn=false, apiVersion='2025-01-01')

  - Ejecutar (TypeScript con tsx):
      pnpm i @sanity/client csv-parse
      pnpm i -D tsx @types/node
      tsx scripts/import-transfers.ts

  Notas
  - Upsert por slug.current (generado desde "from" y "to").
  - Si existe, se actualizan precios/textos; si no, se crea.
  - Regla 9+: el frontend usará priceP8 para 9 o más pasajeros (no se guarda otro campo).

  Ejemplo de CSV (copiar como ./data/transfers.csv):
  from,to,p4,p5,p6,p7,p8
  "Aeropuerto Charles de Gaulle (CDG)","París",65,85,103,109,113
  "París","Aeropuerto Charles de Gaulle (CDG)",65,85,103,109,113
  "Aeropuerto ORLY","París",60,80,95,104,108
  "París","Aeropuerto ORLY",60,80,95,104,108
  "Aeropuerto Beauvais","París",125,145,160,180,190
  "París","Aeropuerto Beauvais",125,145,160,180,190
  "Aeropuerto Charles de Gaulle (CDG)","Parc Disneyland París",70,82,98,112,128
  "Parc Disneyland París","Aeropuerto Charles de Gaulle (CDG)",70,82,98,112,128
  "Aeropuerto ORLY","Parc Disneyland París",73,90,106,118,134
  "Parc Disneyland París","Aeropuerto ORLY",73,90,106,118,134
  "Aeropuerto Beauvais","Parc Disneyland París",145,155,175,185,195
  "Parc Disneyland París","Aeropuerto Beauvais",145,155,175,185,195
  "París","Parc Disneyland París",70,90,106,118,134
  "Parc Disneyland París","París",70,90,106,118,134
*/

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
// Usamos el cliente de next-sanity ya presente en el proyecto para evitar instalar dependencias nuevas
import { createClient } from 'next-sanity'
type SanityClient = ReturnType<typeof createClient>

// Tipos del documento destino en Sanity
type TransferDoc = {
  _type: 'transfers'
  from: string
  to: string
  briefInfo?: string
  requireFlightInfo?: boolean
  requireFlightNumber?: boolean
  requireFlightTimes?: boolean
  slug: { current: string }
  priceP4: number
  priceP5: number
  priceP6: number
  priceP7: number
  priceP8: number
  description?: string
  duration?: string
  popular?: boolean
  order?: number
}

type CsvRow = {
  from: string
  to: string
  p4: string | number
  p5: string | number
  p6: string | number
  p7: string | number
  p8: string | number
}

// ---------- Utilidades ----------

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD') // separa diacríticos
    // Eliminar marcas combinantes (diacríticos)
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function parseMoney(v: string | number): number {
  if (typeof v === 'number') return v
  if (!v) return NaN
  const s = String(v)
    .replace(/€/g, '')
    .replace(/\s+/g, '')
    .replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) ? n : NaN
}

const AIRPORT_KEYWORDS = ['aeropuerto', 'cdg', 'orly', 'beauvais', 'bva']

function isAirportRelated(from: string, to: string): boolean {
  const hay = (s: string) => AIRPORT_KEYWORDS.some((k) => s.toLowerCase().includes(k))
  return hay(from) || hay(to)
}

function buildTexts(from: string, to: string, airport: boolean): { briefInfo: string; description: string } {
  const baseBrief = 'Servicio puerta a puerta. Tarifa fija para el trayecto. Equipaje estándar incluido.'
  const airportBrief = airport ? ' Seguimiento de vuelo incluido.' : ''

  const lines: string[] = []
  lines.push(`Traslado entre ${from} y ${to} con conductor privado. Recogida puntual en el punto indicado y llegada directa al destino.`)
  lines.push('Incluye equipaje estándar y peajes. Aparcamiento de corta estancia incluido cuando aplica (p. ej., aeropuertos).')
  if (airport) {
    lines.push('Monitoreamos el estado de tu vuelo sin costo adicional. Si lo configuras, el conductor espera con cartel en llegadas.')
  }
  lines.push('Los precios mostrados son por servicio, no por persona.')

  return {
    briefInfo: baseBrief + airportBrief,
    description: lines.join('\n\n'),
  }
}

// Upsert por slug.current
async function upsertTransfer(client: SanityClient, doc: TransferDoc): Promise<'created' | 'updated'> {
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type=="transfers" && slug.current==$slug][0]{_id}',
    { slug: doc.slug.current }
  )

  if (existing?._id) {
    // Actualizar solo campos relevantes, preservando otros posibles
    await client
      .patch(existing._id)
      .set({
        from: doc.from,
        to: doc.to,
        briefInfo: doc.briefInfo,
        description: doc.description,
        requireFlightInfo: doc.requireFlightInfo,
        requireFlightNumber: doc.requireFlightNumber,
        requireFlightTimes: doc.requireFlightTimes,
        priceP4: doc.priceP4,
        priceP5: doc.priceP5,
        priceP6: doc.priceP6,
        priceP7: doc.priceP7,
        priceP8: doc.priceP8,
        popular: doc.popular ?? false,
        order: doc.order,
        // Nota: slug.current no se cambia para mantener estabilidad
      })
      .commit()
    return 'updated'
  }

  await client.create(doc)
  return 'created'
}

// ---------- Main ----------

async function main() {
  // Cargar .env.local luego .env
  dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
  dotenvConfig({ path: path.join(process.cwd(), '.env') })
  // Cargar variables de entorno (opcional: .env.local primero, luego .env)
  // Se usan directamente process.env.* como piden los requisitos.
  // Admite fallback a variables comunes del proyecto si las primeras no están definidas
  const projectId = (process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
  const dataset = (process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
  const token = (process.env.SANITY_TOKEN || process.env.SANITY_API_TOKEN || '').trim()

  if (!projectId || !dataset || !token) {
    console.error('Faltan variables de entorno. Requeridas: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_TOKEN')
    process.exit(1)
  }

  const client = createClient({ projectId, dataset, token, useCdn: false, apiVersion: '2025-01-01' })

  // Localizar CSV relativo al repo
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const csvPath = path.resolve(__dirname, '../data/transfers.csv')

  let fileContent: string
  try {
    fileContent = await readFile(csvPath, 'utf8')
  } catch (err) {
    console.error(`No se pudo leer el archivo CSV en ${csvPath}. Asegúrate de crearlo.`)
    throw err
  }

  // Parsear CSV en memoria (parser minimalista con soporte de comillas)
  const records = parseCsv(fileContent)

  let processed = 0
  let created = 0
  let updated = 0
  let failed = 0

  for (let i = 0; i < records.length; i++) {
    const row = records[i]
    const order = i + 1 // orden incremental empezando en 1
    try {
      const from = (row.from || '').toString().trim()
      const to = (row.to || '').toString().trim()
      if (!from || !to) throw new Error('Campos from/to vacíos')

      const p4 = parseMoney(row.p4)
      const p5 = parseMoney(row.p5)
      const p6 = parseMoney(row.p6)
      const p7 = parseMoney(row.p7)
      const p8 = parseMoney(row.p8)

      if ([p4, p5, p6, p7, p8].some((n) => !Number.isFinite(n))) {
        throw new Error(`Precios inválidos en fila ${order}`)
      }

      const slugCurrent = slugify(`${from}-${to}`)
      const airport = isAirportRelated(from, to)
      const texts = buildTexts(from, to, airport)

      const doc: TransferDoc = {
        _type: 'transfers',
        from,
        to,
        briefInfo: texts.briefInfo,
        description: texts.description,
        requireFlightInfo: airport,
        requireFlightNumber: airport,
        requireFlightTimes: airport,
        slug: { current: slugCurrent },
        priceP4: p4,
        priceP5: p5,
        priceP6: p6,
        priceP7: p7,
        priceP8: p8, // 9+ también usa este precio en el frontend
        popular: false,
        order,
      }

      const result = await upsertTransfer(client, doc)
      processed++
      if (result === 'created') created++
      if (result === 'updated') updated++

      console.log(
        `${result.toUpperCase()} slug=${slugCurrent} | ${from} -> ${to} | p4=${p4}€ p8=${p8}€`
      )
    } catch (err: any) {
      failed++
      console.error(`ERROR en fila ${order}:`, err?.message || err)
      continue
    }
  }

  console.log('—'.repeat(60))
  console.log(
    `Resumen: processed=${processed} | created=${created} | updated=${updated} | failed=${failed}`
  )
}

main().catch((err) => {
  console.error('Fallo inesperado en import-transfers:', err)
  process.exit(1)
})

// ---------- CSV minimal parser ----------
function parseCsv(input: string): CsvRow[] {
  const lines = input.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []
  const header = splitCsvLine(lines[0])
  const expected = ['from', 'to', 'p4', 'p5', 'p6', 'p7', 'p8']
  const normalizedHeader = header.map((h) => h.trim())
  const ok = expected.every((k, i) => normalizedHeader[i] === k)
  if (!ok) {
    throw new Error(
      `Cabecera inválida. Esperado: ${expected.join(',')} | Recibido: ${normalizedHeader.join(',')}`
    )
  }
  const out: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    if (cols.length === 0) continue
    const row: CsvRow = {
      from: cols[0] ?? '',
      to: cols[1] ?? '',
      p4: cols[2] ?? '',
      p5: cols[3] ?? '',
      p6: cols[4] ?? '',
      p7: cols[5] ?? '',
      p8: cols[6] ?? '',
    }
    out.push(row)
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
      // Doble comilla dentro de comillas -> escape
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
  // trim quotes
  return res.map((s) => {
    let t = s.trim()
    if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1)
    return t
  })
}
