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
export type HeaderDoc = {
  _id: string
  siteTitle?: string
  siteSubtitle?: string
  logo?: any
  navLinks?: Array<{ label: string; href?: string; internalHref?: string; external?: boolean }>
  serviciosMenu?: Array<any>
}

export async function ensureAndGetHeader(): Promise<HeaderDoc> {
  const token = process.env.SANITY_API_TOKEN
  const existing = await serverClient.fetch("*[_type=='header' && _id == 'header'][0]")
  if (existing) return existing as HeaderDoc

  const doc: HeaderDoc = {
    _id: 'header',
    siteTitle: 'REDESERVI',
    siteSubtitle: 'PARIS',
    // Nota: el logo NO se guarda aquí; se consume desde generalInfo
    navLinks: [
      { label: 'Testimonios', internalHref: '#testimonios', external: false },
      { label: 'Contacto', internalHref: '#contacto', external: false },
    ],
    serviciosMenu: [
      { _type: 'menuLink', label: 'Traslados', internalHref: '/#traslados', external: false },
      { _type: 'menuGroup', title: 'Tours París', items: [
        { label: 'Tour por París (personalizable)', internalHref: '/tour/tour-paris', external: false },
        { label: 'Tour en acompañamiento por París (No vehículo)', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa un Tour en acompañamiento por París (sin vehículo). ¿Podrían enviarme propuesta y disponibilidad?'), external: true },
        { label: 'Tour escala (aeropuerto - Tour - aeropuerto)', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa un Tour escala (aeropuerto - Tour - aeropuerto). Tengo una escala y deseo hacer un tour por París entre vuelos. ¿Podrían enviarme opciones, duración y precios?'), external: true },
      ]},
      { _type: 'menuGroup', title: 'Tours Bélgica', items: [
        { label: 'Brujas', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour a Brujas desde París. ¿Podrían enviarme información y disponibilidad?'), external: true },
        { label: 'Gante y Brujas', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour Gante y Brujas desde París. ¿Podrían enviarme información y disponibilidad?'), external: true },
        { label: 'Bruselas y Brujas', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour Bruselas y Brujas desde París. ¿Podrían enviarme información y disponibilidad?'), external: true },
      ]},
      { _type: 'menuSeparator' },
      { _type: 'menuLink', label: 'Tour Brujas y Amsterdam (3 días)', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour Brujas y Amsterdam (3 días). ¿Podrían enviarme itinerario y precios?'), external: true },
      { _type: 'menuLink', label: 'Tour Mont Saint Michel', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour a Mont Saint Michel. ¿Podrían enviarme información y disponibilidad?'), external: true },
      { _type: 'menuLink', label: 'Tour castillo del Valle de Loira', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour a los Castillos del Valle del Loira. ¿Podrían enviarme opciones y precios?'), external: true },
      { _type: 'menuLink', label: 'Tour Versailles', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, me interesa el Tour a Versailles. ¿Podrían enviarme información de horarios, entradas y transporte?'), external: true },
      { _type: 'menuSeparator' },
      { _type: 'menuLink', label: 'Cotiza tu tour a tu gusto', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, quiero cotizar un tour a mi gusto. Indico a continuación intereses, fechas y número de pasajeros: '), external: true },
      { _type: 'menuLink', label: 'Billetes paseo en barco Río Sena', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, quiero comprar billetes para el paseo en barco por el Río Sena (con/sin cena). ¿Podrían enviarme opciones y precios?'), external: true },
      { _type: 'menuLink', label: 'Billetes Disneyland', href: 'https://wa.me/?text=' + encodeURIComponent('Hola, quiero comprar billetes para Disneyland París. ¿Podrían enviarme disponibilidad y precios?'), external: true },
    ],
  }

  if (token) {
    await serverClient.transaction().createOrReplace({ _type: 'header', ...doc }).commit()
    const created = await serverClient.fetch("*[_type=='header' && _id == 'header'][0]")
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
    return translatedTours.map((t: any) => ({
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
