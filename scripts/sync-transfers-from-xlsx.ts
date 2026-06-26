/*
  sync-transfers-from-xlsx.ts
  ===========================
  Sincroniza todos los traslados del archivo tarifas.xlsx con Sanity.

  - Hace upsert (crea o actualiza) cada traslado por slug.
  - Agrega la nota "Precio sujeto a cambios" en transfersSectionContent.
  - Detecta traslados con aeropuerto para activar follow-up de vuelo.

  Uso:
    pnpm tsx scripts/sync-transfers-from-xlsx.ts

  Variables de entorno requeridas (en .env.local):
    NEXT_PUBLIC_SANITY_PROJECT_ID
    NEXT_PUBLIC_SANITY_DATASET
    SANITY_API_TOKEN
*/

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as dotenvConfig } from 'dotenv'
import { createClient } from 'next-sanity'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SanityClient = ReturnType<typeof createClient>

interface TransferDoc {
  _type: 'transfers'
  from: string
  to: string
  briefInfo: string
  description: string
  requireFlightInfo: boolean
  requireFlightNumber: boolean
  requireFlightTimes: boolean
  slug: { _type: 'slug'; current: string }
  priceP4: number
  priceP5: number
  priceP6: number
  priceP7: number
  priceP8: number
  popular: boolean
  order: number
}

// ─── Datos del Excel (extraídos de public/tarifas.xlsx) ───────────────────────
// Columnas: from, to, p4, p5, p6, p7, p8
// Los precios son en € por servicio (no por persona).

const TRANSFERS_RAW: Array<[string, string, number, number, number, number, number]> = [
  // CDG
  ['Charles de Gaulle (CDG)', 'París', 75, 100, 108, 126, 126],
  ['París', 'Charles de Gaulle (CDG)', 75, 100, 108, 126, 126],
  ['Charles de Gaulle (CDG)', 'Orly', 80, 100, 124, 134, 134],
  ['Orly', 'Charles de Gaulle (CDG)', 80, 100, 124, 134, 134],
  ['Charles de Gaulle (CDG)', 'Versailles', 100, 128, 143, 143, 158],
  ['Versailles', 'Charles de Gaulle (CDG)', 100, 128, 143, 143, 158],
  ['Charles de Gaulle (CDG)', 'Disneyland París', 75, 98, 108, 126, 126],
  ['Disneyland París', 'Charles de Gaulle (CDG)', 75, 98, 108, 126, 126],
  ['Charles de Gaulle (CDG)', 'Parc Astérix', 72, 87, 90, 113, 113],
  ['Parc Astérix', 'Charles de Gaulle (CDG)', 72, 87, 90, 113, 113],
  // ORLY
  ['Orly', 'París', 65, 88, 98, 116, 116],
  ['París', 'Orly', 65, 88, 98, 116, 116],
  ['Orly', 'Parc Astérix', 90, 102, 116, 130, 130],
  ['Parc Astérix', 'Orly', 90, 102, 116, 130, 130],
  ['Orly', 'Disneyland París', 78, 95, 106, 118, 136],
  ['Disneyland París', 'Orly', 78, 95, 106, 118, 136],
  // BEAUVAIS
  ['Beauvais', 'París', 135, 150, 165, 180, 190],
  ['París', 'Beauvais', 135, 150, 165, 180, 190],
  ['Beauvais', 'Disneyland París', 150, 160, 175, 185, 205],
  ['Disneyland París', 'Beauvais', 150, 160, 175, 185, 205],
  // DISNEYLAND
  ['Disneyland París', 'Parc Astérix', 80, 100, 124, 134, 134],
  ['Parc Astérix', 'Disneyland París', 80, 100, 124, 134, 134],
  ['Disneyland París', 'Versailles', 100, 118, 118, 136, 136],
  ['Versailles', 'Disneyland París', 100, 118, 118, 136, 136],
  ['París', 'Disneyland París', 75, 95, 108, 126, 126],
  ['Disneyland París', 'París', 75, 95, 108, 126, 126],
  // VERSAILLES
  ['París', 'Versailles', 68, 80, 90, 118, 118],
  ['Versailles', 'París', 68, 80, 90, 118, 134],
  // CIUDAD (NUEVOS)
  ['París', 'París (centro)', 50, 60, 70, 70, 80],
  ['París', 'Estación de tren', 60, 65, 65, 70, 80],
  ['Estación de tren', 'París', 60, 65, 65, 70, 80],
  ['Charles de Gaulle (CDG)', 'Hotel CDG', 50, 50, 50, 50, 60],
  // LA DÉFENSE (NUEVO)
  ['Charles de Gaulle (CDG)', 'La Défense', 75, 98, 108, 126, 126],
  ['La Défense', 'Charles de Gaulle (CDG)', 75, 98, 108, 126, 126],
  ['Orly', 'La Défense', 75, 98, 108, 126, 126],
  ['La Défense', 'Orly', 75, 98, 108, 126, 126],
  // ORLY - VERSAILLES (NUEVO)
  ['Orly', 'Versailles', 65, 80, 80, 116, 116],
  ['Versailles', 'Orly', 65, 80, 80, 116, 116],
  // DISNEYLAND INTERNO (NUEVO)
  ['Disneyland París', 'Hoteles Disneyland', 48, 48, 48, 48, 48],
  ['Disneyland París', 'Davy Crockett Ranch', 55, 55, 55, 55, 65],
]

// ─── Utilidades ───────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const AIRPORT_KEYWORDS = ['aeropuerto', 'cdg', 'orly', 'beauvais', 'bva', 'charles de gaulle']

function isAirportRelated(from: string, to: string): boolean {
  const hay = (s: string) => AIRPORT_KEYWORDS.some((k) => s.toLowerCase().includes(k))
  return hay(from) || hay(to)
}

function buildTexts(from: string, to: string, airport: boolean): { briefInfo: string; description: string } {
  const airportNote = airport ? ' Seguimiento de vuelo sin costo adicional.' : ''
  return {
    briefInfo: `Servicio puerta a puerta. Tarifa fija por el trayecto. Equipaje estándar incluido.${airportNote}`,
    description: [
      `Traslado privado entre ${from} y ${to}. Recogida puntual y llegada directa al destino sin escalas ni paradas intermedias.`,
      'Precio por servicio (no por persona). Peajes y aparcamiento de corta estancia incluidos cuando aplica.',
      airport
        ? 'Monitoreamos el estado de tu vuelo. El conductor espera con cartel personalizado en la zona de llegadas.'
        : '',
      '⚠️ Los precios son orientativos y pueden estar sujetos a cambios. Confirme la tarifa al momento de la reserva.',
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}

// Upsert por slug.current
async function upsertTransfer(
  client: SanityClient,
  doc: TransferDoc
): Promise<'created' | 'updated'> {
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type=="transfers" && slug.current==$slug][0]{_id}',
    { slug: doc.slug.current }
  )

  if (existing?._id) {
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
        popular: doc.popular,
        order: doc.order,
      })
      .commit()
    return 'updated'
  }

  await client.create(doc)
  return 'created'
}

// ─── Actualizar transfersSectionContent ───────────────────────────────────────

async function updateSectionContent(client: SanityClient) {
  const existing = await client.fetch<{ _id: string } | null>(
    '*[_type=="transfersSectionContent"][0]{_id}',
    {}
  )

  // Notas actualizadas con aviso de precio sujeto a cambios
  const notes = [
    '⚠️ Los precios son orientativos y pueden estar sujetos a cambios sin previo aviso. Confirme la tarifa al reservar.',
    '🌙 Recargo nocturno después de las 21:00 h: +5 €.',
    '🧳 Equipaje voluminoso (más de 3 maletas de 23 kg): +10 €.',
    '🚗 Tarifas por servicio completo, no por persona.',
    '✅ Conductor bilingüe (español/francés) disponible.',
  ]

  // Nota al pie destacada
  const footnote =
    '⚠️ Precios sujetos a cambios. * Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23 kg): +10€.'

  if (existing?._id) {
    await client
      .patch(existing._id)
      .set({ notes, footnote })
      .commit()
    console.log('✅ transfersSectionContent actualizado con notas de precio.')
  } else {
    console.log('⚠️  No se encontró transfersSectionContent. Créalo en Sanity Studio primero.')
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const projectId = (
    process.env.SANITY_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    ''
  ).trim()
  const dataset = (
    process.env.SANITY_DATASET ||
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    ''
  ).trim()
  const token = (
    process.env.SANITY_TOKEN ||
    process.env.SANITY_API_TOKEN ||
    ''
  ).trim()

  if (!projectId || !dataset || !token) {
    console.error(
      '❌ Faltan variables de entorno: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN'
    )
    process.exit(1)
  }

  const client = createClient({
    projectId,
    dataset,
    token,
    useCdn: false,
    apiVersion: '2025-01-01',
  })

  console.log(`\n🚀 Sincronizando ${TRANSFERS_RAW.length} traslados con Sanity...`)
  console.log(`   Project: ${projectId} | Dataset: ${dataset}\n`)

  let created = 0
  let updated = 0
  let failed = 0

  for (let i = 0; i < TRANSFERS_RAW.length; i++) {
    const [from, to, p4, p5, p6, p7, p8] = TRANSFERS_RAW[i]
    const order = i + 1
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
      slug: { _type: 'slug', current: slugCurrent },
      priceP4: p4,
      priceP5: p5,
      priceP6: p6,
      priceP7: p7,
      priceP8: p8,
      popular: false,
      order,
    }

    try {
      const result = await upsertTransfer(client, doc)
      if (result === 'created') created++
      if (result === 'updated') updated++
      const icon = result === 'created' ? '🆕' : '✏️ '
      console.log(`${icon} ${result.toUpperCase().padEnd(7)} | ${from} → ${to} | 4p: ${p4}€  8p: ${p8}€`)
    } catch (err: any) {
      failed++
      console.error(`❌ ERROR [${from} → ${to}]: ${err?.message || err}`)
    }
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`📊 Resumen: ${TRANSFERS_RAW.length} procesados | 🆕 ${created} creados | ✏️  ${updated} actualizados | ❌ ${failed} errores`)

  // Actualizar sección de contenido con nota de precios sujetos a cambios
  console.log('\n📝 Actualizando sección de contenido...')
  await updateSectionContent(client)

  console.log('\n✅ Sincronización completada.\n')
}

main().catch((err) => {
  console.error('💥 Fallo inesperado:', err)
  process.exit(1)
})
