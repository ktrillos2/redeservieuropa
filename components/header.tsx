"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, ChevronUp, ShoppingCart } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslation } from "@/contexts/i18n-context"
import { client } from "@/sanity/lib/client"
import { GENERAL_INFO_QUERY } from "@/sanity/lib/queries"
import { urlFor } from "@/sanity/lib/image"

const MenuIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
)

const XIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)

export function Header({
  siteTitle,
  siteSubtitle,
  logoUrl,
  tours: toursProp,
  transfers: transfersProp,
}: {
  siteTitle?: string
  siteSubtitle?: string
  logoUrl?: string
  tours?: Array<{ _id: string; title: string; slug: string; translations?: { en?: { title?: string }, fr?: { title?: string } } }>
  transfers?: Array<{ _id: string; from: string; to: string; slug?: string | { current: string }; translations?: { en?: { from?: string; to?: string }, fr?: { from?: string; to?: string } } }>
}) {
  const { t, locale, isLoading } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isServicesOpenMobile, setIsServicesOpenMobile] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const hoverCloseTimeout = useRef<number | null>(null)
  const [toursOpen, setToursOpen] = useState(false)
  const [transfersOpen, setTransfersOpen] = useState(false)
  const [generalInfo, setGeneralInfo] = useState<any | null>(null)
  
  // Estado para datos fetched
  const [headerData, setHeaderData] = useState({
    siteTitle: siteTitle || 'REDESERVI',
    siteSubtitle: siteSubtitle || 'PARIS',
    logoUrl: logoUrl || '/images/logo.png',
    navLinks: []
  })
  const [tours, setTours] = useState(toursProp || [])
  const [transfers, setTransfers] = useState(transfersProp || [])

  // Traducciones estáticas con fallback en español
  const staticTexts = useMemo(() => {
    if (isLoading) {
      // Mientras carga, mostrar español
      return {
        services: 'Servicios',
        transfers: 'Traslados',
        tours: 'Tours',
        testimonials: 'Testimonios',
        contact: 'Contacto',
        cart: 'Carrito',
        customQuote: 'Cotizar servicio personalizado'
      }
    }
    
    // Usar traducciones del contexto cuando estén disponibles y no sean la key
    const getT = (key: string, fallback: string) => {
      const res = t(key);
      return res === key ? fallback : res;
    };

    return {
      services: getT('header.services', 'Servicios'),
      transfers: getT('header.transfers', 'Traslados'),
      tours: getT('header.tours', 'Tours'),
      testimonials: getT('header.testimonials', 'Testimonios'),
      contact: getT('header.contact', 'Contacto'),
      cart: getT('header.cart', 'Carrito'),
      customQuote: locale === 'es' 
        ? 'Cotizar servicio personalizado'
        : locale === 'en'
        ? 'Request custom service quote'
        : 'Demander un devis personnalisé'
    }
  }, [locale, isLoading, t])

  // Cargar general info desde Sanity para logo
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const gi = await client.fetch(GENERAL_INFO_QUERY)
        if (!mounted) return
        setGeneralInfo(gi)
      } catch (e) {
        console.warn('[Header] No se pudo cargar generalInfo desde Sanity')
      }
    })()
    return () => { mounted = false }
  }, [])

  // Fetch data si no se pasan como props
  useEffect(() => {
    if (!toursProp || !transfersProp || !siteTitle) {
      (async () => {
        try {
          // Fetch tours
          if (!toursProp) {
            const toursRes = await fetch('/api/tours')
            const toursData = await toursRes.json()
            // Filtrar solo tours con slug válido y título
            const validTours = (toursData.tours || []).filter((tour: any) => {
              const hasValidSlug = tour.slug && tour.slug.length > 0
              const hasTitle = tour.title && tour.title.trim().length > 0
              
              if (!hasValidSlug) {
                console.warn('[Header] Tour sin slug válido:', tour._id, tour.title)
              }
              if (!hasTitle) {
                console.warn('[Header] Tour sin título:', tour._id)
              }
              
              return hasValidSlug && hasTitle
            })
            console.log(`[Header] Tours válidos: ${validTours.length} de ${toursData.tours?.length || 0}`)
            setTours(validTours)
          }
          
          // Fetch transfers
          if (!transfersProp) {
            const transfersRes = await fetch('/api/transfers')
            const transfersData = await transfersRes.json()
            // Filtrar solo transfers con slug válido
            const validTransfers = (transfersData.transfers || []).filter((transfer: any) => {
              const hasValidSlug = transfer.slug && (
                typeof transfer.slug === 'string' 
                  ? transfer.slug.length > 0 
                  : transfer.slug.current && transfer.slug.current.length > 0
              )
              
              if (!hasValidSlug) {
                console.warn('[Header] Transfer sin slug válido:', transfer._id, transfer.from, transfer.to)
              }
              
              return hasValidSlug
            })
            console.log(`[Header] Transfers válidos: ${validTransfers.length} de ${transfersData.transfers?.length || 0}`)
            setTransfers(validTransfers)
          }
          
          // Fetch header data desde Sanity
          if (!siteTitle) {
            const headerRes = await fetch('/api/header')
            if (headerRes.ok) {
              const headerInfo = await headerRes.json()
              setHeaderData({
                siteTitle: headerInfo.siteTitle || 'REDESERVI',
                siteSubtitle: headerInfo.siteSubtitle || 'PARIS',
                logoUrl: logoUrl || '/images/logo.png',
                navLinks: headerInfo.navLinks || []
              })
            }
          }
        } catch (error) {
          console.warn('[Header] Error fetching data:', error)
        }
      })()
    }
  }, [toursProp, transfersProp, siteTitle, logoUrl])

  // Resetear el estado del acordeón de servicios cuando se cierra el menú móvil
  useEffect(() => {
    if (!isMenuOpen) {
      setIsServicesOpenMobile(false)
    }
  }, [isMenuOpen])
  const pathname = usePathname()

  const isHomePage = pathname === "/"
  const compactHeader = !isHomePage || isScrolled
  const useDarkText = compactHeader

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.setAttribute("data-page", isHomePage ? "home" : "other")
    document.body.setAttribute("data-scrolled", isScrolled.toString())
  }, [isHomePage, isScrolled])

  // Observar cambios en el atributo data-quote-modal para hacer el header transparente
  useEffect(() => {
    if (typeof document === 'undefined') return
    const current = document.body.getAttribute('data-quote-modal')
    setIsModalOpen(current === 'open')
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-quote-modal') {
          const val = document.body.getAttribute('data-quote-modal')
          setIsModalOpen(val === 'open')
        }
      }
    })
    mo.observe(document.body, { attributes: true })
    return () => mo.disconnect()
  }, [])

  // Builder de URL de WhatsApp sin número (abre selector con mensaje)
  const wa = (message: string) => `https://wa.me/?text=${encodeURIComponent(message)}`

  // Helper para obtener título traducido con fallback a español
  const getTourTitle = (tour: any): string => {
    if (locale === 'es' || !tour.translations) {
      return tour.title || 'Tour sin título'
    }
    if (locale === 'en' && tour.translations.en?.title) {
      return tour.translations.en.title
    }
    if (locale === 'fr' && tour.translations.fr?.title) {
      return tour.translations.fr.title
    }
    // Fallback a español
    return tour.title || 'Tour sin título'
  }

  // Helper para obtener origen/destino traducido con fallback a español
  const getTransferLabel = (transfer: any): string => {
    const fromText = locale === 'es' || !transfer.translations 
      ? transfer.from 
      : (locale === 'en' && transfer.translations.en?.from) || (locale === 'fr' && transfer.translations.fr?.from) || transfer.from
    
    const toText = locale === 'es' || !transfer.translations 
      ? transfer.to 
      : (locale === 'en' && transfer.translations.en?.to) || (locale === 'fr' && transfer.translations.fr?.to) || transfer.to
    
    return `${fromText || 'Origen'} → ${toText || 'Destino'}`
  }

  // Obtener logo URL desde Sanity
  const computedLogoUrl = useMemo(() => {
    const logo = generalInfo?.logo
    // Logo del header más pequeño que footer, altura ~140px, pedimos ~2x para nitidez
    return logo ? urlFor(logo).height(280).url() : headerData.logoUrl
  }, [generalInfo, headerData.logoUrl])

  const HOVER_CLOSE_DELAY = 520 // ms de gracia para cruzar del trigger al contenido sin cierre

  const scheduleClose = () => {
    if (hoverCloseTimeout.current) window.clearTimeout(hoverCloseTimeout.current)
    hoverCloseTimeout.current = window.setTimeout(() => setServicesOpen(false), HOVER_CLOSE_DELAY)
  }
  const cancelClose = () => {
    if (hoverCloseTimeout.current) {
      window.clearTimeout(hoverCloseTimeout.current)
      hoverCloseTimeout.current = null
    }
  }
  useEffect(() => {
    return () => {
      if (hoverCloseTimeout.current) window.clearTimeout(hoverCloseTimeout.current)
    }
  }, [])

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out h-auto ${
        isModalOpen ? "bg-transparent py-3" : (isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border py-2" : "bg-transparent py-3")
      }`}
    >
      <div className="container mx-auto px-4" onClick={(e) => {
        // Cerrar sólo si se hace click fuera del trigger/contenido del menú
        const target = e.target as HTMLElement
        const inTrigger = target.closest('[data-slot="dropdown-menu-trigger"]')
        const inContent = target.closest('[data-slot="dropdown-menu-content"]')
        if (!inTrigger && !inContent) {
          setServicesOpen(false)
        }
      }}>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className={`relative transition-all duration-500 ${compactHeader ? 'h-[110px] w-[70px]' : 'h-[140px] w-[90px]'}`}>
              <Image
                src={computedLogoUrl}
                alt={`${headerData.siteTitle} ${headerData.siteSubtitle}`}
                fill
                className="object-contain animate-float transition-all duration-300"
                sizes="(max-width: 768px) 70px, 90px"
                priority
              />
            </div>
            <div className="hidden md:block text-center">
              <h1
                className={`font-bold font-display transition-all duration-300 drop-shadow-lg ${compactHeader ? "text-lg" : "text-4xl"} ${useDarkText ? "!text-black" : "!text-white"}`}
              >
                {headerData.siteTitle}
              </h1>
              <p className={`font-display transition-all duration-300 drop-shadow-lg ${compactHeader ? "text-xs" : "text-2xl"} ${useDarkText ? "!text-black" : "!text-white"}`}>
                {headerData.siteSubtitle}
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 font-sans text-[16px] lg:text-[17px] font-medium z-50">
            {/* Servicios Dropdown */}
            <div 
              className="relative group/nav"
              onMouseEnter={() => { cancelClose(); setServicesOpen(true); }}
              onMouseLeave={scheduleClose}
            >
              <button className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-md ${useDarkText ? "text-gray-900 hover:bg-black/5" : "!text-white drop-shadow-md"}`}>
                {staticTexts.services}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Modern Mega Menu */}
              <div 
                className={`absolute top-full left-1/2 -translate-x-[30%] mt-4 w-[750px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border/50 overflow-hidden transition-all duration-400 origin-top ${servicesOpen ? "opacity-100 translate-y-0 visible" : "opacity-0 translate-y-4 invisible"}`}
              >
                <div className="p-6 grid grid-cols-2 gap-8 font-sans">
                  {/* Columna 1: Traslados */}
                  {transfers.length > 0 && (
                    <div className="flex flex-col">
                      <div className="mb-4 flex items-center gap-2 text-[13px] font-bold text-accent uppercase tracking-widest border-b border-gray-100 pb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                        {staticTexts.transfers}
                      </div>
                      <div className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                        {transfers.map((transfer) => {
                          let slug = ''
                          if (typeof transfer.slug === 'string') slug = transfer.slug
                          else if (transfer.slug && typeof transfer.slug === 'object' && 'current' in transfer.slug) slug = transfer.slug.current
                          if (!slug) return null
                          
                          return (
                            <Link
                              key={transfer._id}
                              href={`/transfer/${slug}`}
                              className="block px-3 py-2 text-[14px] text-gray-700 hover:text-accent hover:bg-accent/10 rounded-xl transition-all leading-snug"
                              onClick={() => setServicesOpen(false)}
                            >
                              {getTransferLabel(transfer)}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Columna 2: Tours & Cotizar */}
                  <div className="flex flex-col">
                    {tours.length > 0 && (
                      <div className="mb-6 flex flex-col flex-grow">
                        <div className="mb-4 flex items-center gap-2 text-[13px] font-bold text-accent uppercase tracking-widest border-b border-gray-100 pb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                          {staticTexts.tours}
                        </div>
                        <div className="space-y-1 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                          {tours.map((tour) => {
                            if (!tour.slug || !tour.title) return null
                            return (
                              <Link
                                key={tour._id}
                                href={`/tour/${tour.slug}`}
                                className="block px-3 py-2 text-[14px] text-gray-700 hover:text-accent hover:bg-accent/10 rounded-xl transition-all leading-snug"
                                onClick={() => setServicesOpen(false)}
                              >
                                {getTourTitle(tour)}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer del Mega Menu (Botón Cotizar a todo el ancho) */}
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Link 
                    href="/#hero-booking-form" 
                    className="relative overflow-hidden group flex items-center justify-center gap-2 w-full bg-[#021e29] !text-white transition-all p-4 rounded-xl font-medium text-[16px] tracking-wide shadow-md hover:shadow-xl hover:shadow-[#021e29]/20 hover:-translate-y-0.5"
                    onClick={() => setServicesOpen(false)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2 !text-white">
                      <span className="text-accent text-xl">✨</span> 
                      {staticTexts.customQuote}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            <Link href="#testimonios" className={`px-4 py-2.5 rounded-full transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-md ${useDarkText ? "text-gray-900 hover:bg-black/5" : "!text-white drop-shadow-md"}`}>
              {staticTexts.testimonials}
            </Link>
            <Link href="#contacto" className={`px-4 py-2.5 rounded-full transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-md ${useDarkText ? "text-gray-900 hover:bg-black/5" : "!text-white drop-shadow-md"}`}>
              {staticTexts.contact}
            </Link>
            
            {/* Selector de idioma */}
            <div className={`px-2 transition-colors ${useDarkText ? "text-gray-900" : "!text-white drop-shadow-md"}`}>
              <LanguageSwitcher />
            </div>
            
            {/* Icono de carrito */}
            <Link
              href="/checkout"
              aria-label="Ver cotizaciones"
              className={`p-2.5 rounded-full transition-all duration-300 hover:bg-white/20 hover:backdrop-blur-md hover:-translate-y-0.5 ${useDarkText ? "text-gray-900 hover:bg-black/5" : "!text-white drop-shadow-md"}`}
            >
              <ShoppingCart className="w-[22px] h-[22px]" />
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden transition-colors hover:bg-muted drop-shadow-lg ${useDarkText ? "text-black" : "text-white"}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? "max-h-[85vh] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"}`}
        >
          <div className="overflow-y-auto max-h-[80vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100">
            <nav className="flex flex-col p-4 space-y-2 font-sans">
              {/* Servicios Acordeón */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/50">
                <button
                  onClick={() => setIsServicesOpenMobile((v) => !v)}
                  className="w-full flex items-center justify-between p-4 text-lg font-bold text-gray-900 font-sans"
                >
                  {staticTexts.services}
                  <ChevronDown className={`w-5 h-5 text-accent transition-transform duration-300 ${isServicesOpenMobile ? "rotate-180" : ""}`} />
                </button>
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isServicesOpenMobile ? "max-h-[1000px] opacity-100 pb-4" : "max-h-0 opacity-0"}`}>
                  <div className="px-4 space-y-6">
                    {/* Traslados */}
                    {transfers.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-[13px] font-bold text-accent uppercase tracking-widest mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                          {staticTexts.transfers}
                        </div>
                        <div className="space-y-1 border-l-2 border-gray-100 ml-1 pl-3">
                          {transfers.map((transfer) => {
                            const slug = typeof transfer.slug === 'string' ? transfer.slug : transfer.slug?.current
                            if (!slug) return null
                            return (
                              <Link 
                                key={transfer._id}
                                href={`/transfer/${slug}`} 
                                className="block py-2 text-[14px] text-gray-600 hover:text-accent transition-colors leading-snug"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {getTransferLabel(transfer)}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tours */}
                    {tours.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 text-[13px] font-bold text-accent uppercase tracking-widest mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                          {staticTexts.tours}
                        </div>
                        <div className="space-y-1 border-l-2 border-gray-100 ml-1 pl-3">
                          {tours.map((tour) => {
                            if (!tour.slug || !tour.title) return null
                            return (
                              <Link 
                                key={tour._id}
                                href={`/tour/${tour.slug}`} 
                                className="block py-2 text-[14px] text-gray-600 hover:text-accent transition-colors leading-snug"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {getTourTitle(tour)}
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Cotizar Móvil */}
                    <Link 
                      href="/#hero-booking-form" 
                      className="flex items-center justify-center gap-2 w-full bg-accent/10 text-accent hover:bg-accent hover:text-white transition-colors p-3.5 rounded-xl font-medium mt-2 font-sans"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ✨ {staticTexts.customQuote}
                    </Link>
                  </div>
                </div>
              </div>

              <Link
                href="#testimonios"
                className="p-4 text-lg font-bold text-gray-900 rounded-2xl hover:bg-gray-50 transition-colors font-sans"
                onClick={() => setIsMenuOpen(false)}
              >
                {staticTexts.testimonials}
              </Link>
              
              <Link
                href="#contacto"
                className="p-4 text-lg font-bold text-gray-900 rounded-2xl hover:bg-gray-50 transition-colors font-sans"
                onClick={() => setIsMenuOpen(false)}
              >
                {staticTexts.contact}
              </Link>

              <div className="flex items-center justify-between p-4 mt-2 border-t border-gray-100">
                <div className="text-gray-900">
                  <LanguageSwitcher />
                </div>
                <Link
                  href="/checkout"
                  className="flex items-center justify-center w-12 h-12 bg-accent/10 text-accent rounded-full hover:bg-accent hover:text-white transition-colors"
                  aria-label="Ver cotizaciones"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
