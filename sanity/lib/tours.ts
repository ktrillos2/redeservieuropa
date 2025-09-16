import { serverClient } from './server-client'
import { TOURS_LIST_QUERY, TOUR_BY_SLUG_QUERY } from './queries'

export type TourDoc = {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  duration?: string
  distance?: string
  mainImage?: any
  gallery?: any[]
  features?: string[]
  included?: string[]
  basePrice?: number
  basePriceDay?: number
  basePriceNight?: number
  pricing?: { pax: number; price: number }[]
  pricingP4?: { threeH?: number; twoH?: number; eiffelArco?: number }
  pricingP5?: { threeH?: number; twoH?: number; eiffelArco?: number }
  extraSections?: Array<{ title?: string; body?: any; included?: string[]; itinerary?: string[] }>
}

export async function getToursList(): Promise<TourDoc[]> {
  const res = await serverClient.fetch(TOURS_LIST_QUERY)
  return (res || []) as TourDoc[]
}

export async function getTourBySlug(slug: string): Promise<TourDoc | null> {
  if (!slug) return null
  const res = await serverClient.fetch(TOUR_BY_SLUG_QUERY, { slug })
  return (res as TourDoc) || null
}
