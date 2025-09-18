import { sanityFetch } from './live'
import { TRANSFERS_LIST_QUERY, TRANSFERS_SECTION_CONTENT_QUERY, TRANSFER_BY_SLUG_QUERY } from './queries'

export type TransferRoute = {
  from: string
  to: string
  price: string
  description?: string
  duration?: string
  popular?: boolean
  icon?: string
}

export type ExtraCharge = { icon?: string; text: string; price: string }
export type SpecialTransfer = { title: string; subtitle?: string; price: string; icon?: string; notes?: string }

export type TransferDoc = {
  _id: string
  slug?: { current: string }
  from: string
  to: string
  price: string
  description?: string
  duration?: string
  popular?: boolean
  icon?: string
  isSpecial?: boolean
  subtitle?: string
  notes?: string
  order?: number
}

export type TransfersSectionContentDoc = {
  _id: string
  title?: string
  subtitle?: string
  highlight?: string
  footnote?: string
  cta?: { label?: string; href?: string; internalHref?: string }
  notes?: string[]
}

export async function getTransfersList(): Promise<TransferDoc[]> {
  const res = await sanityFetch({ query: TRANSFERS_LIST_QUERY })
  return ((res as any)?.data || []) as TransferDoc[]
}

export async function getTransfersSectionContent(): Promise<TransfersSectionContentDoc | null> {
  const res = await sanityFetch({ query: TRANSFERS_SECTION_CONTENT_QUERY })
  return (res as any)?.data || null
}

export async function getTransferBySlug(slug: string): Promise<TransferDoc | null> {
  if (!slug) return null
  const res = await sanityFetch({ query: TRANSFER_BY_SLUG_QUERY, params: { slug } })
  return (res as any)?.data || null
}

// Helper combinado por conveniencia (evitar múltiples llamadas desde el componente)
export async function getTransfersComposite() {
  const [list, content] = await Promise.all([
    getTransfersList(),
    getTransfersSectionContent(),
  ])
  return { list, content }
}
