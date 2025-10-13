import { urlFor } from '@/sanity/lib/image'
import { getToursList, TourDoc } from '@/sanity/lib/tours'
import { Services, type ServiceCard } from './services'

export const revalidate = 0

// --- Cálculo del precio base ---
function startingPriceEUR(t: TourDoc): number | undefined {
  if (typeof t.booking?.startingPriceEUR === 'number') return t.booking.startingPriceEUR

  if (t.pricingMode === 'rules' && t.pricingRules?.baseUpTo4EUR) {
    return t.pricingRules.baseUpTo4EUR
  }

  if (t.pricingMode === 'table' && t.pricingTable) {
    const { p4, p5, p6, p7, p8 } = t.pricingTable
    const list = [p4, p5, p6, p7, p8].filter((n): n is number => typeof n === 'number')
    if (list.length) return Math.min(...list)
  }

  return undefined
}

export default async function ServicesServer() {
  const tours = (await getToursList()) as TourDoc[] | undefined

  const cards: ServiceCard[] = (tours ?? []).map((t, idx) => {
    const priceNum = startingPriceEUR(t)
    const price = typeof priceNum === 'number' ? `Desde ${priceNum}€` : undefined

    const desc =
      t.summary ||
      (t.route?.origin && t.route?.destination
        ? `Tour por ${t.route.destination} saliendo y regresando a ${t.route.origin}.`
        : 'Tour privado con paradas para fotos y ruta optimizada.')

    const note = t.route?.circuitName ? `Disponible: ${t.route.circuitName}` : undefined

    return {
      id: t._id || `tour-${idx}`,
      title: t.title,
      desc,
      price,
      note,
      link: `/tour/${typeof t.slug === 'string' ? t.slug : t.slug?.current ?? ''}`,
      image: t.mainImage ? urlFor(t.mainImage).width(1200).url() : undefined,
      popular: t.isPopular === true || t.isPopular === 'yes',
    }
  })

  return <Services cards={cards} />
}
