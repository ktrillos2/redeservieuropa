// sanity/lib/transfers.ts
import { serverClient } from './server-client'
import { TRANSFERS_LIST_QUERY, TRANSFER_BY_SLUG_QUERY } from './queries'

// ===============================
// Tipos (según el nuevo esquema)
// ===============================
export type TransferPricingTable = {
  p4?: number
  p5?: number
  p6?: number
  p7?: number
  p8?: number
  // En este modelo 9+ toma el mismo precio de p8, así que no es obligatorio extraFrom9
}

export async function getTransferDocByRoute(from: string, to: string) {
  try {
    const transfers = await serverClient.fetch(TRANSFERS_LIST_QUERY);
    const match = transfers.find(
      (t: any) =>
        t.from.toLowerCase() === from.toLowerCase() &&
        t.to.toLowerCase() === to.toLowerCase()
    );
    return match || null;
  } catch {
    return null;
  }
}

export type TransferDoc = {
  _id: string
  slug?: { current: string }
  from: string            // origen
  to: string              // destino
  briefInfo?: string      // información breve (tooltip)
  description?: string    // descripción
  duration?: string
  popular?: boolean
  // Nuevo: flags de requerimientos de vuelo
  requireFlightInfo?: boolean
  requireFlightNumber?: boolean
  // Tabla de precios (4..8 pax). De 9+ = p8.
  pricingTable?: TransferPricingTable
  // Orden opcional
  order?: number
}

// =====================================
// Fetchers (similares a tours.ts)
// =====================================
export async function getTransfersList(): Promise<TransferDoc[]> {
  // Sin caché para obtener cambios al instante (como en tours.ts)
  const res = await serverClient.fetch(
    TRANSFERS_LIST_QUERY,
    {},
    { cache: 'no-store', next: { revalidate: 0, tags: ['transfers'] } }
  )
  return (res || []) as TransferDoc[]
}

export async function getTransferBySlug(slug: string): Promise<TransferDoc | null> {
  if (!slug) return null
  const res = await serverClient.fetch(
    TRANSFER_BY_SLUG_QUERY,
    { slug },
    { cache: 'no-store', next: { revalidate: 0, tags: ['transfers'] } }
  )
  return (res as TransferDoc) || null
}

// =====================================
// Helpers de indexación y precios
// =====================================

/**
 * Normaliza una clave "slug-like" a partir de un texto (from/to),
 * útil para agrupar por origen/destino aunque vengan con mayúsculas o acentos.
 */
function toKey(s?: string): string {
  if (!s) return ''
  return s
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Estructura de índices para consumir fácil desde el Hero:
 * - byOrigin: { [originKey]: { label, destinations: { [destKey]: { label, doc } } } }
 * - byPair: { `${originKey}__${destKey}`: doc }
 * - originKeys: string[]
 */
export type TransfersIndexes = {
  byOrigin: Record<
    string,
    {
      label: string
      destinations: Record<
        string,
        {
          label: string
          doc: TransferDoc
        }
      >
    }
  >
  byPair: Record<string, TransferDoc>
  originKeys: string[]
}

/**
 * Construye índices (orígenes/destinos) a partir de la lista de traslados.
 */
export function buildTransfersIndexes(list: TransferDoc[] = []): TransfersIndexes {
  const byOrigin: TransfersIndexes['byOrigin'] = {}
  const byPair: TransfersIndexes['byPair'] = {}

  for (const t of list) {
    const ok = toKey(t.from)
    const dk = toKey(t.to)
    if (!ok || !dk) continue

    if (!byOrigin[ok]) {
      byOrigin[ok] = {
        label: t.from || ok,
        destinations: {},
      }
    }
    // Si hay múltiples docs mismo par, nos quedamos con el último cargado (o podrías decidir la primera coincidencia)
    byOrigin[ok].destinations[dk] = {
      label: t.to || dk,
      doc: t,
    }

    byPair[`${ok}__${dk}`] = t
  }

  const originKeys = Object.keys(byOrigin)
  return { byOrigin, byPair, originKeys }
}

/**
 * Devuelve la lista de destinos disponibles (keys) para un origen dado (key o label).
 */
export function getAvailableDestinations(indexes: TransfersIndexes, origin?: string): string[] {
  if (!origin) return []
  const ok = toKey(origin)
  const dests = indexes.byOrigin?.[ok]?.destinations
  return dests ? Object.keys(dests) : []
}

/**
 * Calcula el precio base según pax usando la tabla p4..p8.
 * Regla: 1–4 pax => p4; 5 => p5; 6 => p6; 7 => p7; 8 => p8; 9+ => p8.
 * Devuelve `null` si no existe el par origen-destino.
 */
export function computeTransferPrice(
  indexes: TransfersIndexes,
  from?: string,
  to?: string,
  pax?: number
): number | null {
  if (!from || !to) return null

  const ok = toKey(from)
  const dk = toKey(to)
  const doc = indexes.byPair?.[`${ok}__${dk}`]
  if (!doc) return null

  const n = Math.max(1, Math.floor(Number(pax || 1)))
  const { p4 = 0, p5 = 0, p6 = 0, p7 = 0, p8 = 0 } = doc.pricingTable || {}

  if (n <= 4) return p4
  if (n === 5) return p5
  if (n === 6) return p6
  if (n === 7) return p7
  // 8 o más
  return p8
}

/**
 * Normaliza un texto (origen/destino) a la clave de índice usada en buildTransfersIndexes.
 * - minúsculas
 * - sin acentos/diacríticos
 * - no alfanumérico -> "-"
 * - sin guiones al inicio/fin
 */
export function toIndexKey(s?: string): string {
  if (!s) return ''
  return s
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Helpers de label (por si los necesitas en UI).
 */
export function getOriginLabel(indexes: TransfersIndexes, origin?: string): string {
  const ok = toKey(origin)
  return indexes.byOrigin?.[ok]?.label || origin || ''
}

export function getDestinationLabel(indexes: TransfersIndexes, origin?: string, dest?: string): string {
  const ok = toKey(origin)
  const dk = toKey(dest)
  return indexes.byOrigin?.[ok]?.destinations?.[dk]?.label || dest || ''
}

/**
 * Helpers de requerimientos de vuelo por par origen-destino.
 */
export function getFlightRequirements(
  indexes: TransfersIndexes,
  from?: string,
  to?: string
): { requireFlightInfo: boolean; requireFlightNumber: boolean } {
  const ok = toKey(from)
  const dk = toKey(to)
  const doc = indexes.byPair?.[`${ok}__${dk}`]
  return {
    requireFlightInfo: !!doc?.requireFlightInfo,
    requireFlightNumber: !!doc?.requireFlightNumber,
  }
}