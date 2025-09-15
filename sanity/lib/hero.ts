import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'
import { HERO_QUERY } from './queries'
import path from 'node:path'
import fs from 'node:fs'

const serverClient = createClient({ projectId, dataset, apiVersion, useCdn: false, token: process.env.SANITY_API_TOKEN })

export type HeroDoc = {
  _id: string
  title?: string
  highlight?: string
  description?: string
  backgroundImage?: any
  primaryCta?: { label?: string; href?: string; internalHref?: string; external?: boolean }
  secondaryCta?: { label?: string; href?: string; internalHref?: string; external?: boolean }
  showBookingForm?: boolean
}

export async function ensureAndGetHero(): Promise<HeroDoc> {
  const existing = await serverClient.fetch(HERO_QUERY)
  if (existing) return existing as HeroDoc

  // Importante: no subir assets desde SSR para evitar errores de "duplex" en undici.
  // Los assets se subirán mediante un script dedicado.
  let bg: any = undefined

  const doc: HeroDoc = {
    _id: 'hero',
    title: 'Transporte',
    highlight: 'Comodo y Seguro',
    description: 'Transporte Privado en París\nConfort, seguridad y puntualidad.\nTraslados desde/hacia aeropuertos (CDG, ORY, BVA), viajes a Disneyland, tours privados por la ciudad,\nexcursiones a Brujas y mucho más.\nVive París sin preocupaciones.',
    backgroundImage: bg,
    primaryCta: { label: 'Reservar Ahora', internalHref: '#', external: false },
    secondaryCta: { label: 'Ver Servicios', internalHref: '#', external: false },
    showBookingForm: true,
  }

  await serverClient.transaction().createOrReplace({ _type: 'hero', ...doc }).commit()
  const created = await serverClient.fetch(HERO_QUERY)
  return (created as HeroDoc) || doc
}
