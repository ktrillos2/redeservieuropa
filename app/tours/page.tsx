import HeaderServer from '@/components/header.server'
import { Footer } from '@/components/footer'
import { AnimatedSection } from '@/components/animated-section'
import { getToursList } from '@/sanity/lib/tours'
import { serverClient } from '@/sanity/lib/server-client'
import { TOURS_SECTION_QUERY } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import Link from 'next/link'

export default async function ToursPage() {
  const tours = await getToursList()
  const section = await serverClient.fetch(TOURS_SECTION_QUERY)
  const title = section?.title || 'Tours'
  const subtitle = section?.subtitle || ''
  return (
    <main className="min-h-screen">
      <HeaderServer />
      <section className="container mx-auto px-4 pt-24 pb-16">
        <AnimatedSection animation="fade-up">
          <h1 className="text-4xl font-bold text-primary mb-3 font-display">{title}</h1>
          {subtitle ? (
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl">{subtitle}</p>
          ) : null}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((t) => {
              const img = t.mainImage ? urlFor(t.mainImage).width(800).height(500).url() : '/placeholder.jpg'
              return (
                <article key={t._id} className="rounded-xl overflow-hidden shadow-lg border border-border/50 bg-card">
                  <div className="h-48 bg-muted" style={{ backgroundImage: `url('${img}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold text-primary">{t.title}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{t.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{t.duration}</span>
                      <Link href={`/tour/${t.slug?.current}`} className="text-accent hover:underline">Ver detalles y reservar</Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </AnimatedSection>
      </section>
      <Footer />
    </main>
  )
}
