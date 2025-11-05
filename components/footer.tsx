"use client"
import { Phone, Mail, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { client } from "@/sanity/lib/client"
import { GENERAL_INFO_QUERY, FOOTER_SECTION_QUERY } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"
import { useTranslation } from "@/contexts/i18n-context"

type MenuLink = { label: string; href?: string; internalHref?: string; external?: boolean }

export function Footer() {
  const [gi, setGi] = useState<any | null>(null)
  const [footer, setFooter] = useState<any | null>(null)
  const { locale } = useTranslation()

  // Traducciones estáticas locales (solo para elementos de UI que no vienen de Sanity)
  const staticTexts = useMemo(() => {
    const texts = {
      es: {
        contact: 'Contacto',
      },
      en: {
        contact: 'Contact',
      },
      fr: {
        contact: 'Contact',
      },
    }
    return texts[locale] || texts.es
  }, [locale])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [g, f] = await Promise.all([client.fetch(GENERAL_INFO_QUERY), client.fetch(FOOTER_SECTION_QUERY)])
        if (!mounted) return
        console.log("[Footer] Datos cargados desde Sanity para locale:", locale)
        console.log("[Footer] Footer:", f)
        console.log("[Footer] Translations disponibles:", f?.translations)
        setGi(g)
        setFooter(f)
      } catch (e) {
        console.warn('[Footer] No se pudo cargar desde Sanity, usando fallback local.')
      }
    })()
    return () => { mounted = false }
  }, [locale])

  // Aplicar traducciones de Sanity según el idioma
  const translatedFooter = useMemo(() => {
    if (!footer) return null
    if (locale === 'es') return footer
    
    const translation = locale === 'en' ? footer.translations?.en : footer.translations?.fr
    if (!translation) return footer
    
    return {
      ...footer,
      description: translation.description || footer.description,
      statsText: translation.statsText || footer.statsText,
      copyright: translation.copyright || footer.copyright,
    }
  }, [locale, footer])

  // Traducir columnas
  const translatedColumns = useMemo(() => {
    if (!footer?.columns || locale === 'es') return footer?.columns || []
    
    return footer.columns.map((col: any) => {
      const translation = locale === 'en' ? col.translations?.en : col.translations?.fr
      if (!translation) return col
      
      return {
        ...col,
        title: translation.title || col.title,
      }
    })
  }, [footer, locale])

  const logoUrl = useMemo(() => {
    const logo = gi?.logo
    // Pedimos solo altura para no forzar recorte cuadrado y mantener proporción
    // Logo vertical más alto en footer (~130px); pedimos ~2.5x para nitidez
    return logo ? urlFor(logo).height(320).url() : '/images/logo.png'
  }, [gi])

  // Fallbacks
  const siteTitle = gi?.siteTitle || 'REDESERVI'
  const siteSubtitle = gi?.siteSubtitle || 'PARIS'
  const description = translatedFooter?.description || 'Servicio premium de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con comodidad y elegancia.'
  const showStars = translatedFooter?.showStars ?? true
  const statsText = translatedFooter?.statsText || '+1000 clientes satisfechos'
  
  // Filtrar y limpiar enlaces de WhatsApp de las columnas que vengan del CMS
  const cleanedColumns = translatedColumns.map((col: any) => ({
    ...col,
    links: (col.links || []).map((link: MenuLink) => {
      // Si el enlace contiene wa.me o whatsapp, reemplazarlo con enlaces internos
      const href = link.href || link.internalHref || ''
      if (href.includes('wa.me') || href.includes('whatsapp')) {
        // Reemplazar enlaces de WhatsApp según el label
        if (link.label.toLowerCase().includes('tour') || link.label.toLowerCase().includes('nocturno')) {
          return { ...link, internalHref: '/#hero-booking-form', href: undefined, external: false }
        }
        // Por defecto, redirigir a traslados
        return { ...link, internalHref: '/#traslados', href: undefined, external: false }
      }
      return link
    })
  }))
  
  const copyright = translatedFooter?.copyright || '© 2025 REDESERVI PARIS. Todos los derechos reservados.'

  const resolveHref = (link: MenuLink) => {
    const href = link.internalHref || link.href || '#'
    // Doble verificación: nunca devolver enlaces de WhatsApp
    if (href.includes('wa.me') || href.includes('whatsapp')) {
      return '/#traslados'
    }
    return href
  }

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
            <h4 className="font-semibold mb-4">{staticTexts.contact}</h4>
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
            {(cleanedColumns || []).map((col: any, idx: number) => (
              <div key={idx} className={idx === 0 ? '' : 'mt-6'}>
                {col?.title ? <h4 className="font-semibold mb-4">{col.title}</h4> : null}
                <div className="space-y-2 text-sm">
                  {(col?.links || []).map((l: MenuLink, i: number) => (
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
