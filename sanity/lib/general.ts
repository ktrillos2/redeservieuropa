import { sanityFetch } from './live'
import { GENERAL_INFO_QUERY, TOURS_LIST_QUERY, TRANSFERS_LIST_QUERY } from './queries'
import { serverClient } from './server-client'
import { getTranslatedTours, getTranslatedTransfers } from '@/lib/translations-content'
import { Locale } from '@/lib/i18n-sanity'
import path from 'node:path'
import fs from 'node:fs'

export type GeneralInfo = {
  _id: string
  siteTitle?: string
  siteSubtitle?: string
  description?: string
  logo?: any
  contact?: { phone?: string; email?: string; address?: string; whatsapp?: string }
  defaultWhatsAppMessage?: string
  socialLinks?: Array<{ platform?: string; label?: string; url?: string }>
}

export async function getGeneralInfo(): Promise<GeneralInfo | null> {
  const res = await sanityFetch({ query: GENERAL_INFO_QUERY })
  const doc = (res as any)?.data as GeneralInfo | undefined
  return doc || null
}

// Server-side: ensure the singleton exists; upload logo from public if needed; return the doc
export async function ensureAndGetGeneralInfo(): Promise<GeneralInfo> {
  // If token is not present, skip write and just try read.
  const hasToken = !!process.env.SANITY_API_TOKEN

  // Try to read first
  const existing = await serverClient.fetch(GENERAL_INFO_QUERY)
  if (existing && existing._id) {
    return existing as GeneralInfo
  }

  if (!hasToken) {
    // No token => cannot create, but return a default shape
    return {
      _id: 'generalInfo',
      siteTitle: 'REDESERVI',
      siteSubtitle: 'PARIS',
      description:
        'Servicio premium de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con comodidad y elegancia.',
      contact: {
        phone: '+33 1 23 45 67 89',
        email: 'info@redeservi.paris',
        address: 'París, Francia',
        whatsapp: '',
      },
      defaultWhatsAppMessage: 'Hola, me gustaría recibir información sobre sus servicios.',
      socialLinks: [],
    }
  }

  // Importante: no subir assets desde SSR para evitar errores de "duplex" en undici.
  // El logo se subirá mediante un script dedicado o desde el Studio.
  let logoAssetRef: any = undefined

  const doc: GeneralInfo = {
    _id: 'generalInfo',
    siteTitle: 'REDESERVI',
    siteSubtitle: 'PARIS',
    description:
      'Servicio premium de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con comodidad y elegancia.',
    logo: logoAssetRef,
    contact: {
      phone: '+33 1 23 45 67 89',
      email: 'info@redeservi.paris',
      address: 'París, Francia',
      whatsapp: '',
    },
    defaultWhatsAppMessage: 'Hola, me gustaría recibir información sobre sus servicios.',
    socialLinks: [],
  }

  await serverClient.transaction().createOrReplace({ _type: 'generalInfo', ...doc }).commit()
  const created = await serverClient.fetch(GENERAL_INFO_QUERY)
  return (created as GeneralInfo) || doc
}

// Header schema seeding/ensure
export type NavLink = {
  label: {
    es: string
    en?: string
    fr?: string
  }
  href: string
  type: 'link' | 'tours' | 'transfers' | 'dropdown'
  subItems?: NavLink[]
  external?: boolean
}

export type HeaderDoc = {
  _id: string
  siteTitle?: string
  siteSubtitle?: string
  navLinks?: NavLink[]
}

export async function ensureAndGetHeader(): Promise<HeaderDoc> {
  const token = process.env.SANITY_API_TOKEN
  const existing = await serverClient.fetch(`*[_type=='header' && _id == 'header'][0]{
    _id,
    siteTitle,
    siteSubtitle,
    navLinks
  }`)
  if (existing) return existing as HeaderDoc

  // Seed inicial con estructura nueva
  const doc: HeaderDoc = {
    _id: 'header',
    siteTitle: 'REDESERVI',
    siteSubtitle: 'PARIS',
    navLinks: [
      {
        label: { es: 'Servicios', en: 'Services', fr: 'Services' },
        href: '#',
        type: 'dropdown',
        subItems: [
          {
            label: { es: 'Traslados', en: 'Transfers', fr: 'Transferts' },
            href: '#traslados',
            type: 'transfers' // Esto mostrará el listado dinámico
          },
          {
            label: { es: 'Tours', en: 'Tours', fr: 'Tours' },
            href: '#',
            type: 'tours' // Esto mostrará el listado dinámico
          },
          {
            label: { es: 'Cotizar servicio personalizado', en: 'Request custom quote', fr: 'Demander un devis personnalisé' },
            href: '/#hero-booking-form',
            type: 'link'
          }
        ]
      },
      {
        label: { es: 'Testimonios', en: 'Testimonials', fr: 'Témoignages' },
        href: '#testimonios',
        type: 'link'
      },
      {
        label: { es: 'Contacto', en: 'Contact', fr: 'Contact' },
        href: '#contacto',
        type: 'link'
      }
    ]
  }

  if (token) {
    await serverClient.transaction().createOrReplace({ _type: 'header', ...doc }).commit()
    const created = await serverClient.fetch(`*[_type=='header' && _id == 'header'][0]{
      _id,
      siteTitle,
      siteSubtitle,
      navLinks
    }`)
    return (created as HeaderDoc) || doc
  }
  return doc
}

// === Tours y Traslados para el menú ===

export type TourMenuItem = {
  _id: string
  title: string
  slug: string
}

export type TransferMenuItem = {
  _id: string
  from: string
  to: string
  slug?: { current: string } | string
}

export async function getToursForMenu(locale: Locale = 'es'): Promise<TourMenuItem[]> {
  try {
    const tours = await serverClient.fetch(TOURS_LIST_QUERY)
    const translatedTours = getTranslatedTours(tours || [], locale)
    
    // Filtrar tours que tengan los campos mínimos necesarios
    const validTours = translatedTours.filter((t: any) => {
      const hasValidSlug = t.slug || (typeof t.slug === 'object' && t.slug?.current)
      const hasSummary = t.summary && t.summary.trim().length > 0
      const hasPricing = t.pricingTable || t.pricingMode || (t.booking && t.booking.startingPriceEUR)
      
      // Solo incluir tours que tengan slug válido, resumen y algún tipo de pricing
      return hasValidSlug && hasSummary && hasPricing
    })
    
    return validTours.map((t: any) => ({
      _id: t._id,
      title: t.title || 'Tour sin título',
      slug: typeof t.slug === 'string' ? t.slug : t.slug?.current || t._id
    }))
  } catch (error) {
    console.error('Error fetching tours for menu:', error)
    return []
  }
}

export async function getTransfersForMenu(locale: Locale = 'es'): Promise<TransferMenuItem[]> {
  try {
    const transfers = await serverClient.fetch(TRANSFERS_LIST_QUERY)
    const translatedTransfers = getTranslatedTransfers(transfers || [], locale)
    return translatedTransfers.map((t: any) => ({
      _id: t._id,
      from: t.from || 'Origen',
      to: t.to || 'Destino',
      slug: typeof t.slug === 'string' ? t.slug : t.slug?.current || `${t.from}-${t.to}`.toLowerCase().replace(/\s+/g, '-')
    }))
  } catch (error) {
    console.error('Error fetching transfers for menu:', error)
    return []
  }
}
