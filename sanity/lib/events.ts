import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'
import { EVENTS_FOR_HERO_QUERY } from './queries'

const serverClient = createClient({ projectId, dataset, apiVersion, useCdn: false, token: process.env.SANITY_API_TOKEN })

export type EventItem = {
  _id: string
  title: string
  image?: any
  pricePerPerson?: number
  date?: string
  time?: string
  meetingPoint?: string
  shortInfo?: string
  description?: string
  gallery?: any[]
  translations?: {
    en?: {
      title?: string
      shortInfo?: string
      description?: string
      meetingPoint?: string
    }
    fr?: {
      title?: string
      shortInfo?: string
      description?: string
      meetingPoint?: string
    }
  }
}

export async function getActiveEventsForHero(): Promise<EventItem[]> {
  const events = await serverClient.fetch(EVENTS_FOR_HERO_QUERY)
  return (events || []) as EventItem[]
}
