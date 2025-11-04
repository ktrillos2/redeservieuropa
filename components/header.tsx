"use client"

import { useState, useEffect, useRef } from "react"
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
  siteTitle = 'REDESERVI',
  siteSubtitle = 'PARIS',
  logoUrl = '/images/logo.png',
  tours = [],
  transfers = [],
}: {
  siteTitle?: string
  siteSubtitle?: string
  logoUrl?: string
  tours?: Array<{ _id: string; title: string; slug: string }>
  transfers?: Array<{ _id: string; from: string; to: string; slug?: string | { current: string } }>
}) {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isServicesOpenMobile, setIsServicesOpenMobile] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const hoverCloseTimeout = useRef<number | null>(null)
  const [toursOpen, setToursOpen] = useState(false)
  const [transfersOpen, setTransfersOpen] = useState(false)

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
                src={logoUrl}
                alt={`${siteTitle} ${siteSubtitle}`}
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
                {siteTitle}
              </h1>
              <p className={`font-display transition-all duration-300 drop-shadow-lg ${compactHeader ? "text-xs" : "text-2xl"} ${useDarkText ? "!text-black" : "!text-white"}`}>
                {siteSubtitle}
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-10 md:space-x-12 font-display">
            {/* Menú Servicios con submenús */}
            <DropdownMenu open={servicesOpen} onOpenChange={setServicesOpen}>
              <DropdownMenuTrigger
                onMouseEnter={() => {
                  cancelClose()
                  setServicesOpen(true)
                }}
                onPointerEnter={() => {
                  cancelClose()
                  setServicesOpen(true)
                }}
                onMouseLeave={scheduleClose}
                onPointerLeave={scheduleClose}
                className={`px-4 py-2 rounded-lg transition-colors hover:bg-accent/15 cursor-pointer font-bold ${useDarkText ? "text-black" : "!text-white"}`}
              >
                {t('header.services')}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-64 px-1.5 py-1.5 max-h-[500px] overflow-y-auto"
                onMouseEnter={cancelClose}
                onPointerEnter={cancelClose}
                onMouseLeave={scheduleClose}
                onPointerLeave={scheduleClose}
              >
                <DropdownMenuGroup>
                  {/* Sección Traslados dinámicos */}
                  {transfers.length > 0 && (
                    <>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setTransfersOpen((v) => !v)
                          setServicesOpen(true)
                        }}
                        className="group justify-between hover:bg-accent hover:text-accent-foreground transition-colors rounded-md px-2 py-2"
                      >
                        <span>{t('header.transfers')}</span>
                        {transfersOpen ? (
                          <ChevronUp className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                        )}
                      </DropdownMenuItem>
                      {transfersOpen && (
                        <div className="pl-6 py-2 space-y-1 soft-fade-in max-h-60 overflow-y-auto">
                          {transfers.map((transfer) => {
                            const slug = typeof transfer.slug === 'string' 
                              ? transfer.slug 
                              : transfer.slug?.current || `${transfer.from}-${transfer.to}`.toLowerCase().replace(/\s+/g, '-')
                            return (
                              <Link
                                key={transfer._id}
                                href={`/transfer/${slug}`}
                                className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                              >
                                {transfer.from} → {transfer.to}
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Sección Tours dinámicos */}
                  {tours.length > 0 && (
                    <>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setToursOpen((v) => !v)
                          setServicesOpen(true)
                        }}
                        className="group justify-between hover:bg-accent hover:text-accent-foreground transition-colors rounded-md px-2 py-2"
                      >
                        <span>{t('header.tours')}</span>
                        {toursOpen ? (
                          <ChevronUp className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                        )}
                      </DropdownMenuItem>
                      {toursOpen && (
                        <div className="pl-6 py-2 space-y-1 soft-fade-in max-h-60 overflow-y-auto">
                          {tours.map((tour) => (
                            <Link
                              key={tour._id}
                              href={`/tour/${tour.slug}`}
                              className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              {tour.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  <DropdownMenuSeparator />

                  {/* Opción de cotización */}
                  <DropdownMenuItem asChild className="rounded-md">
                    <Link href="/#hero-booking-form" className="px-2 py-2 w-full rounded-md font-semibold text-accent">
                      💬 Cotizar servicio personalizado
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Enlace principal 'Traslados' removido: permanece dentro del submenú Servicios */}
            <Link href="#testimonios" className={`transition-colors drop-shadow-lg hover:opacity-80 ${useDarkText ? "text-black" : "!text-white"}`}>
              {t('header.testimonials')}
            </Link>
            <Link href="#contacto" className={`transition-colors drop-shadow-lg hover:opacity-80 ${useDarkText ? "text-black" : "!text-white"}`}>
              {t('header.contact')}
            </Link>
            {/* Selector de idioma (desktop) */}
            <div className={useDarkText ? "text-black" : "text-white"}>
              <LanguageSwitcher />
            </div>
            {/* Icono de carrito persistente (desktop) */}
            <Link
              href="/pago"
              aria-label="Ver cotizaciones"
              className={`transition-colors drop-shadow-lg hover:opacity-80 ${useDarkText ? "text-black" : "!text-white"}`}
            >
              <ShoppingCart className="size-6" />
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

  {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border bg-background/95 backdrop-blur-sm soft-fade-in">
            <nav className="flex flex-col space-y-4 pt-4 font-display px-2">
              {/* Servicios (acordeón simple en móvil) */}
              <button
                onClick={() => setIsServicesOpenMobile((v) => !v)}
                className="text-left text-black transition-colors drop-shadow-lg hover:bg-accent/10 rounded-md px-3 py-2.5 text-base font-semibold"
              >
                {t('header.services')} {isServicesOpenMobile ? "▲" : "▼"}
              </button>
              {isServicesOpenMobile && (
                <div className="pl-4 space-y-4 text-sm font-display">
                  {/* Traslados dinámicos */}
                  {transfers.length > 0 && (
                    <div>
                      <div className="font-bold mb-2 text-base text-black">
                        {t('header.transfers')}
                      </div>
                      <div className="pl-4 space-y-2 max-h-48 overflow-y-auto">
                        {transfers.map((transfer) => {
                          const slug = typeof transfer.slug === 'string' 
                            ? transfer.slug 
                            : transfer.slug?.current || `${transfer.from}-${transfer.to}`.toLowerCase().replace(/\s+/g, '-')
                          return (
                            <Link 
                              key={transfer._id}
                              href={`/transfer/${slug}`} 
                              className="block text-black/80 hover:text-black hover:underline transition-colors"
                            >
                              {transfer.from} → {transfer.to}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tours dinámicos */}
                  {tours.length > 0 && (
                    <div>
                      <div className="font-bold mb-2 text-base text-black">
                        {t('header.tours')}
                      </div>
                      <div className="pl-4 space-y-2 max-h-48 overflow-y-auto">
                        {tours.map((tour) => (
                          <Link 
                            key={tour._id}
                            href={`/tour/${tour.slug}`} 
                            className="block text-black/80 hover:text-black hover:underline transition-colors"
                          >
                            {tour.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-3 mt-3"></div>

                  {/* Opción de cotización */}
                  <Link 
                    href="/#hero-booking-form" 
                    className="block font-semibold text-accent hover:underline px-1 text-base transition-colors"
                  >
                    💬 Cotizar servicio personalizado
                  </Link>
                </div>
              )}
              {/* Enlace principal 'Traslados' removido en móvil: permanece en el submenú de Servicios */}
              <Link
                href="#testimonios"
                className="text-black transition-colors drop-shadow-lg hover:opacity-80 px-3 py-2.5 text-base font-semibold rounded-md hover:bg-accent/10"
              >
                {t('header.testimonials')}
              </Link>
              <Link
                href="#contacto"
                className="text-black transition-colors drop-shadow-lg hover:opacity-80 px-3 py-2.5 text-base font-semibold rounded-md hover:bg-accent/10"
              >
                {t('header.contact')}
              </Link>
              {/* Selector de idioma (móvil) */}
              <div className="px-3 py-2">
                <LanguageSwitcher />
              </div>
              {/* Icono de carrito de compras (móvil) */}
              <Link
                href="/pago"
                className="inline-flex items-center gap-2 text-black transition-colors rounded-md px-3 py-2.5 w-fit font-semibold text-base hover:bg-accent/10"
                aria-label="Ver cotizaciones (carrito)"
                prefetch={false}
              >
                <ShoppingCart className="size-5" />
                <span>{t('header.cart')}</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
