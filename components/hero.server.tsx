import { ensureAndGetHero } from '@/sanity/lib/hero'
import { urlFor } from '@/sanity/lib/image'
import { getActiveEventsForHero } from '@/sanity/lib/events'
import { getToursList } from '@/sanity/lib/tours'
import { getTransfersList } from '@/sanity/lib/transfers'   // ⬅️ Nuevo import
import { Hero } from './hero'

export default async function HeroServer() {
  // === Fetch principal ===
  const [hero, events, tours, transfers] = await Promise.all([
    ensureAndGetHero(),
    getActiveEventsForHero(),
    getToursList(),
    getTransfersList(),  // ⬅️ Nuevo: lista de traslados desde Sanity
  ])

  // Debug: Verificar si hero tiene translations
  console.log('[HeroServer] Hero data:', {
    hasHero: !!hero,
    hasTranslations: !!hero?.translations,
    translationKeys: hero?.translations ? Object.keys(hero.translations) : 'none',
    enTitle: hero?.translations?.en?.title,
    frTitle: hero?.translations?.fr?.title,
    fullHero: hero,
  })

  // === Imagen de fondo ===
  const bgUrl = hero?.backgroundImage
    ? urlFor(hero.backgroundImage).width(2000).url()
    : undefined

  // === Eventos del slider (map simplificado) ===
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
    translations: e.translations, // ⬅️ Pasar las traducciones desde Sanity
    images: Array.isArray(e.gallery)
      ? e.gallery
          .map((img) => (img ? urlFor(img).width(1600).url() : undefined))
          .filter((u): u is string => typeof u === 'string')
      : undefined,
  }))

  // === Tours normalizados ===
  const mappedTours = (tours || []).map((t) => ({
    ...t,
    slug: t.slug?.current || '',
    mainImageUrl: t.mainImage ? urlFor(t.mainImage).width(1200).url() : undefined,
  }))

  // === Render ===
  return (
    <Hero
      title={hero?.title}
      highlight={hero?.highlight}
      description={hero?.description}
      backgroundUrl={bgUrl}
      primaryCtaLabel={hero?.primaryCta?.label}
      secondaryCtaLabel={hero?.secondaryCta?.label}
      bookingForm={hero?.bookingForm as any}
      heroTranslations={hero?.translations}
      events={mappedEvents}
      toursList={mappedTours}
      transfersList={transfers}   // ⬅️ Nuevo: pasamos los traslados al Hero
    />
  )
}