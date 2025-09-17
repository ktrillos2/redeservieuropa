"use client"
import { Phone, Mail, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { client } from "@/sanity/lib/client"
import { GENERAL_INFO_QUERY, FOOTER_SECTION_QUERY } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"

type MenuLink = { label: string; href?: string; internalHref?: string; external?: boolean }

export function Footer() {
  const [gi, setGi] = useState<any | null>(null)
  const [footer, setFooter] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [g, f] = await Promise.all([client.fetch(GENERAL_INFO_QUERY), client.fetch(FOOTER_SECTION_QUERY)])
        if (!mounted) return
        setGi(g)
        setFooter(f)
      } catch (e) {
        console.warn('[Footer] No se pudo cargar desde Sanity, usando fallback local.')
      }
    })()
    return () => { mounted = false }
  }, [])

  const logoUrl = useMemo(() => {
    const logo = gi?.logo
    // Pedimos solo altura para no forzar recorte cuadrado y mantener proporción
    // Logo vertical más alto en footer (~130px); pedimos ~2.5x para nitidez
    return logo ? urlFor(logo).height(320).url() : '/images/logo.png'
  }, [gi])

  // Fallbacks
  const siteTitle = gi?.siteTitle || 'REDESERVI'
  const siteSubtitle = gi?.siteSubtitle || 'PARIS'
  const description = footer?.description || 'Servicio premium de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con comodidad y elegancia.'
  const showStars = footer?.showStars ?? true
  const statsText = footer?.statsText || '+1000 clientes satisfechos'
  const columns: Array<{ title?: string; links?: MenuLink[] }> = footer?.columns || [
    {
      title: 'Servicios',
      links: [
        { label: 'Aeropuerto CDG', internalHref: '/#traslados', external: false },
        { label: 'Aeropuerto Orly', internalHref: '/#traslados', external: false },
        { label: 'Aeropuerto Beauvais', internalHref: '/#traslados', external: false },
        { label: 'París ↔ Disneyland', internalHref: '/#traslados', external: false },
        { label: 'Tour Nocturno', href: '#', external: true },
      ],
    },
  ]
  const copyright = footer?.copyright || '© 2025 REDESERVI PARIS. Todos los derechos reservados.'

  const resolveHref = (link: MenuLink) => link.internalHref || link.href || '#'

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative h-[130px] w-[84px]">
                <Image src={logoUrl} alt={`${siteTitle} ${siteSubtitle}`} fill className="object-contain" sizes="84px" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{siteTitle}</h3>
                <p className="text-yellow-400">{siteSubtitle}</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md text-pretty">
              {description}
            </p>
            {showStars && (
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                {statsText ? <span className="ml-2 text-sm">{statsText}</span> : null}
              </div>
            )}
          </div>

          {/* Contact Info (desde Información General) */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm">
              {gi?.contact?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-yellow-400" />
                  <span>{gi.contact.phone}</span>
                </div>
              )}
              {gi?.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <span>{gi.contact.email}</span>
                </div>
              )}
              {gi?.contact?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  <span>{gi.contact.address}</span>
                </div>
              )}
              {!gi?.contact && (
                <>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-yellow-400" />
                    <span>+33 1 23 45 67 89</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-yellow-400" />
                    <span>info@redeservi.paris</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-yellow-400" />
                    <span>París, Francia</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Columns from CMS */}
          <div>
            {(columns || []).map((col, idx) => (
              <div key={idx} className={idx === 0 ? '' : 'mt-6'}>
                {col?.title ? <h4 className="font-semibold mb-4">{col.title}</h4> : null}
                <div className="space-y-2 text-sm">
                  {(col?.links || []).map((l, i) => (
                    <Link
                      key={i}
                      href={resolveHref(l)}
                      target={l.external ? '_blank' : undefined}
                      rel={l.external ? 'noopener noreferrer' : undefined}
                      className="block hover:text-yellow-400 transition-colors"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  )
}
