import { ensureAndGetHero } from '@/sanity/lib/hero'
import { urlFor } from '@/sanity/lib/image'
import { Hero } from './hero'

export default async function HeroServer() {
  const hero = await ensureAndGetHero()
  const bgUrl = hero?.backgroundImage ? urlFor(hero.backgroundImage).width(2000).url() : undefined
  return (
    <Hero
      title={hero?.title}
      highlight={hero?.highlight}
      description={hero?.description}
      backgroundUrl={bgUrl}
      primaryCtaLabel={hero?.primaryCta?.label}
      secondaryCtaLabel={hero?.secondaryCta?.label}
      showBookingForm={hero?.showBookingForm !== false}
    />
  )
}
