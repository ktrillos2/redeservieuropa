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
  description?: any
  backgroundImage?: any
  primaryCta?: { label?: string; href?: string; internalHref?: string; external?: boolean }
  secondaryCta?: { label?: string; href?: string; internalHref?: string; external?: boolean }
  bookingForm?: any
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
    description: [
      { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'Transporte Privado en París' }] },
      { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'Confort, seguridad y puntualidad.' }] },
      { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'Traslados desde/hacia aeropuertos (CDG, ORY, BVA), viajes a Disneyland, tours privados por la ciudad, excursiones a Brujas y mucho más.' }] },
      { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text: 'Vive París sin preocupaciones.' }] },
    ],
    backgroundImage: bg,
    primaryCta: { label: 'Reservar Ahora', internalHref: '#', external: false },
    secondaryCta: { label: 'Ver Servicios', internalHref: '#', external: false },
    bookingForm: {
      title: 'Reserva tu Servicio',
      ctaLabel: 'Reservar con 5€',
      depositAmount: 5,
      typePicker: { label: 'Tipo de reserva', trasladoLabel: 'Traslado', tourLabel: 'Tour' },
      originField: { label: 'Origen' },
      destinationField: { label: 'Destino' },
      dateField: { label: 'Fecha' },
      timeField: { label: 'Hora' },
      passengersField: { label: 'Pasajeros', singular: 'Pasajero', plural: 'Pasajeros' },
      vehicleField: { label: 'Tipo de vehículo', labelCoche: 'Coche (4 personas)', labelMinivan: 'Minivan (6 pasajeros)', labelVan: 'Van (8 pasajeros)' },
      flightNumberField: { label: 'Número de vuelo', placeholder: 'Ej: AF1234' },
      notes: {
        minivan6: 'Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero.',
        minivan5: 'Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg.',
        nightChargeNote: '+5€ recargo nocturno después de las 21:00.',
        surchargeFootnote: '* Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.',
      },
    },
  }

  await serverClient.transaction().createOrReplace({ _type: 'hero', ...doc }).commit()
  const created = await serverClient.fetch(HERO_QUERY)
  return (created as HeroDoc) || doc
}
