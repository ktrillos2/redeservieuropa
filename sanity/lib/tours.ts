import { serverClient } from './server-client'
import { TOURS_LIST_QUERY, TOUR_BY_SLUG_QUERY } from './queries'

export type TourDoc = {
  _id: string
  title: string
  slug: { current: string }
  summary?: string
  description?: any // Portable Text (array de bloques)
  mainImage?: any
  orderRank?: string

  // --- RUTA DEL TOUR ---
  route?: {
    origin?: string
    destination?: string
    circuitName?: string
    roundTrip?: boolean
  }

  // --- LISTAS ---
  features?: string[]
  includes?: string[]
  visitedPlaces?: string[]
  notes?: string[]
  amenities?: string[] // ahora es texto libre

  // --- MODO DE PRECIOS ---
  pricingMode?: 'rules' | 'table'

  // --- 1️⃣ MODO REGLAS ---
  pricingRules?: {
    baseUpTo4EUR: number
  }

  // --- 2️⃣ MODO TABLA ESPECIAL ---
  pricingTable?: {
    p4?: number
    p5?: number
    p6?: number
    p7?: number
    p8?: number
    extraFrom9?: number
  }

  // --- MENSAJE PARA MÁS DE 8 ---
  overCapacityNote?: string

  // --- INFORMACIÓN DE RESERVA ---
  booking?: {
    startingPriceEUR?: number
    priceNote?: string
  }

  isPopular?: boolean | 'yes' | 'no'


  // --- CAMPOS ANTIGUOS (opcional mantener si hay data vieja) ---
  // duration?: string
  // distance?: string
  // basePrice?: number
  // basePriceDay?: number
  // basePriceNight?: number
  // pricing?: { pax: number; price: number }[]
  // pricingP4?: { threeH?: number; twoH?: number; eiffelArco?: number }
  // pricingP5?: { threeH?: number; twoH?: number; eiffelArco?: number }

  // // --- SECCIONES ADICIONALES ---
  // extraSections?: Array<{
  //   title?: string
  //   body?: any
  //   included?: string[]
  //   itinerary?: string[]
  // }>
}


export async function getToursList(): Promise<TourDoc[]> {
  const res = await serverClient.fetch(TOURS_LIST_QUERY, {}, { cache: 'no-store', next: { revalidate: 0, tags: ['tours'] } })

  return (res || []) as TourDoc[]
}

export async function getTourBySlug(slug: string): Promise<TourDoc | null> {
  if (!slug) return null
  const res = await serverClient.fetch(TOUR_BY_SLUG_QUERY, { slug }, { cache: 'no-store', next: { revalidate: 0, tags: ['tours'] }} )
  return (res as TourDoc) || null
}
