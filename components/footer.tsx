"use client"
import { Phone, Mail, MapPin, Star, Facebook, Instagram, Youtube, Send, Linkedin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { client } from "@/sanity/lib/client"
import { GENERAL_INFO_QUERY, FOOTER_SECTION_QUERY } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"
import { useTranslation } from "@/contexts/i18n-context"

type MenuLink = { label: string; href?: string; internalHref?: string; external?: boolean }

// Función auxiliar para obtener el icono según la plataforma
const getSocialIcon = (platform: string) => {
  const iconClass = "w-5 h-5"
  switch (platform?.toLowerCase()) {
    case 'facebook':
      return <Facebook className={iconClass} />
    case 'instagram':
      return <Instagram className={iconClass} />
    case 'youtube':
      return <Youtube className={iconClass} />
    case 'tiktok':
      // TikTok no está en lucide-react, usar un ícono genérico o SVG personalizado
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      )
    case 'x':
    case 'twitter':
      // X/Twitter
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    case 'linkedin':
      return <Linkedin className={iconClass} />
    case 'telegram':
      return <Send className={iconClass} />
    case 'whatsapp':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      )
    default:
      return <Send className={iconClass} />
  }
}

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

            {/* Redes Sociales */}
            {gi?.socialLinks && gi.socialLinks.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-4">
                  {locale === 'en' ? 'Follow Us' : locale === 'fr' ? 'Suivez-nous' : 'Síguenos'}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {gi.socialLinks.map((social: any, idx: number) => (
                    <Link
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-primary-foreground/10"
                      title={social.label || social.platform}
                    >
                      <span className="text-yellow-400">
                        {getSocialIcon(social.platform)}
                      </span>
                      {social.label && <span className="hidden sm:inline">{social.label}</span>}
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
