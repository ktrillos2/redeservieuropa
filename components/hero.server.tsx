import { ensureAndGetHero } from '@/sanity/lib/hero'
import { urlFor } from '@/sanity/lib/image'
import { getActiveEventsForHero } from '@/sanity/lib/events'
import { Hero } from './hero'

export default async function HeroServer() {
  const hero = await ensureAndGetHero()
  const events = await getActiveEventsForHero()
  const bgUrl = hero?.backgroundImage ? urlFor(hero.backgroundImage).width(2000).url() : undefined
  const mappedEvents = (events || []).map((e) => ({
    id: e._id,
    title: e.title,
    image: e.image ? urlFor(e.image).width(1200).url() : undefined,
    pricePerPerson: typeof e.pricePerPerson === 'number' ? e.pricePerPerson : 0,
    date: e.date,
    time: e.time,
    meetingPoint: e.meetingPoint,
    shortInfo: e.shortInfo,
    description: e.description,
    images: Array.isArray(e.gallery)
      ? e.gallery
          .map((img) => (img ? urlFor(img).width(1600).url() : undefined))
          .filter((u): u is string => typeof u === 'string')
      : undefined,
  }))
  return (
    <Hero
      title={hero?.title}
      highlight={hero?.highlight}
      description={hero?.description}
      backgroundUrl={bgUrl}
      primaryCtaLabel={hero?.primaryCta?.label}
      secondaryCtaLabel={hero?.secondaryCta?.label}
      bookingForm={hero?.bookingForm as any}
      events={mappedEvents}
    />
  )
}
