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
import { ChevronDown, ChevronUp } from "lucide-react"

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
}: {
  siteTitle?: string
  siteSubtitle?: string
  logoUrl?: string
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isServicesOpenMobile, setIsServicesOpenMobile] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const hoverCloseTimeout = useRef<number | null>(null)
  const [belgiumOpen, setBelgiumOpen] = useState(false)
  const [parisOpen, setParisOpen] = useState(false)
  const pathname = usePathname()

  const isHomePage = pathname === "/"
  const useDarkText = !isHomePage || isScrolled

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
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border py-2" : "bg-transparent py-3"
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
            <Image
              src={logoUrl}
              alt="REDESERVI PARIS"
              width={isScrolled ? 64 : 88}
              height={isScrolled ? 64 : 88}
              className="animate-float transition-all duration-300"
            />
            <div className="hidden md:block">
              <h1
                className={`font-bold font-display transition-all duration-300 drop-shadow-lg ${isScrolled ? "text-lg" : "text-4xl"} ${useDarkText ? "!text-black" : "!text-white"}`}
              >
                {siteTitle}
              </h1>
              <p className={`font-display transition-all duration-300 drop-shadow-lg ${isScrolled ? "text-xs" : "text-2xl"} ${useDarkText ? "!text-black" : "!text-white"}`}>
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
                Servicios
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="min-w-64 px-1.5 py-1.5"
                onMouseEnter={cancelClose}
                onPointerEnter={cancelClose}
                onMouseLeave={scheduleClose}
                onPointerLeave={scheduleClose}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild className="rounded-md">
                    <Link href="/#traslados" className="px-2 py-2 w-full rounded-md">Traslados</Link>
                  </DropdownMenuItem>

                  {/* Acordeón inline: Tours París */}
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setParisOpen((v) => !v)
                      setServicesOpen(true)
                    }}
                    className="group justify-between hover:bg-accent hover:text-accent-foreground transition-colors rounded-md px-2 py-2"
                  >
                    <span>Tours París</span>
                    {parisOpen ? (
                      <ChevronUp className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                    )}
                  </DropdownMenuItem>
                  {parisOpen && (
                    <div className="pl-6 py-2 space-y-1 soft-fade-in">
                      <Link
                        href="/tour/tour-paris"
                        className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Tour por París (personalizable)
                      </Link>
                      <a
                        href={wa("Hola, me interesa un Tour en acompañamiento por París (sin vehículo). ¿Podrían enviarme propuesta y disponibilidad?")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Tour en acompañamiento por París (No vehículo)
                      </a>
                      <a
                        href={wa("Hola, me interesa un Tour escala (aeropuerto - Tour - aeropuerto). Tengo una escala y deseo hacer un tour por París entre vuelos. ¿Podrían enviarme opciones, duración y precios?")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Tour escala (aeropuerto - Tour - aeropuerto)
                      </a>
                    </div>
                  )}

                  {/* Acordeón inline: Tours Bélgica */}
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setBelgiumOpen((v) => !v)
                      setServicesOpen(true)
                    }}
                    className="group justify-between hover:bg-accent hover:text-accent-foreground transition-colors rounded-md px-2 py-2"
                  >
                    <span>Tours Bélgica</span>
                    {belgiumOpen ? (
                      <ChevronUp className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground transition-colors group-hover:!text-accent-foreground" />
                    )}
                  </DropdownMenuItem>
                  {belgiumOpen && (
                    <div className="pl-6 py-1 space-y-1 soft-fade-in">
                      <a
                        href={wa("Hola, me interesa el Tour a Brujas desde París. ¿Podrían enviarme información y disponibilidad?")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Brujas
                      </a>
                      <a
                        href={wa("Hola, me interesa el Tour Gante y Brujas desde París. ¿Podrían enviarme información y disponibilidad?")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Gante y Brujas
                      </a>
                      <a
                        href={wa("Hola, me interesa el Tour Bruselas y Brujas desde París. ¿Podrían enviarme información y disponibilidad?")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Bruselas y Brujas
                      </a>
                    </div>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <a href={wa("Hola, me interesa el Tour Brujas y Amsterdam (3 días). ¿Podrían enviarme itinerario y precios?")} target="_blank" rel="noopener noreferrer">Tour Brujas y Amsterdam (3 días)</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={wa("Hola, me interesa el Tour a Mont Saint Michel. ¿Podrían enviarme información y disponibilidad?")} target="_blank" rel="noopener noreferrer">Tour Mont Saint Michel</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={wa("Hola, me interesa el Tour a los Castillos del Valle del Loira. ¿Podrían enviarme opciones y precios?")} target="_blank" rel="noopener noreferrer">Tour castillo del Valle de Loira</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={wa("Hola, me interesa el Tour a Versailles. ¿Podrían enviarme información de horarios, entradas y transporte?")} target="_blank" rel="noopener noreferrer">Tour Versailles</a>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <a
                      href={wa("Hola, quiero cotizar un tour a mi gusto. Indico a continuación intereses, fechas y número de pasajeros: ")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cotiza tu tour a tu gusto
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={wa("Hola, quiero comprar billetes para el paseo en barco por el Río Sena (con/sin cena). ¿Podrían enviarme opciones y precios?")} target="_blank" rel="noopener noreferrer">Billetes paseo en barco Río Sena</a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={wa("Hola, quiero comprar billetes para Disneyland París. ¿Podrían enviarme disponibilidad y precios?")} target="_blank" rel="noopener noreferrer">Billetes Disneyland</a>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Enlace principal 'Traslados' removido: permanece dentro del submenú Servicios */}
            <Link href="#testimonios" className={`transition-colors drop-shadow-lg hover:opacity-80 ${useDarkText ? "text-black" : "!text-white"}`}>
              Testimonios
            </Link>
            <Link href="#contacto" className={`transition-colors drop-shadow-lg hover:opacity-80 ${useDarkText ? "text-black" : "!text-white"}`}>
              Contacto
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden transition-colors hover:bg-muted drop-shadow-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border bg-background/95 soft-fade-in">
            <nav className="flex flex-col space-y-5 pt-4 font-display px-2">
              {/* Servicios (acordeón simple en móvil) */}
              <button
                onClick={() => setIsServicesOpenMobile((v) => !v)}
                className="text-left transition-colors drop-shadow-lg hover:bg-accent/10 rounded-md px-2 py-2"
                style={{ color: "#000000", fontWeight: 600 }}
              >
                Servicios {isServicesOpenMobile ? "▲" : "▼"}
              </button>
              {isServicesOpenMobile && (
                <div className="pl-4 space-y-3 text-sm">
                  <Link href="/#traslados" className="block hover:underline" style={{ color: "#000" }}>
                    <span className="inline-block px-1 py-1.5 -mx-1 rounded-md hover:bg-accent/10">Traslados</span>
                  </Link>
                  <div>
                    <div className="font-semibold mb-1" style={{ color: "#000" }}>Tours París</div>
                    <div className="pl-4 space-y-2">
                      <Link href="/tour/tour-paris" className="block hover:underline" style={{ color: "#000" }}>
                        Tour por París (personalizable)
                      </Link>
                      <a href={wa("Hola, me interesa un Tour en acompañamiento por París (sin vehículo). ¿Podrían enviarme propuesta y disponibilidad?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>
                        Tour en acompañamiento por París (No vehículo)
                      </a>
                      <a
                        href={wa("Hola, me interesa un Tour escala (aeropuerto - Tour - aeropuerto). Tengo una escala y deseo hacer un tour por París entre vuelos. ¿Podrían enviarme opciones, duración y precios?")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block hover:underline"
                        style={{ color: "#000" }}
                      >
                        Tour escala (aeropuerto - Tour - aeropuerto)
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-1" style={{ color: "#000" }}>Tours Bélgica</div>
                    <div className="pl-4 space-y-2">
                      <a href={wa("Hola, me interesa el Tour a Brujas desde París. ¿Podrían enviarme información y disponibilidad?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Brujas</a>
                      <a href={wa("Hola, me interesa el Tour Gante y Brujas desde París. ¿Podrían enviarme información y disponibilidad?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Gante y Brujas</a>
                      <a href={wa("Hola, me interesa el Tour Bruselas y Brujas desde París. ¿Podrían enviarme información y disponibilidad?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Bruselas y Brujas</a>
                    </div>
                  </div>
                  <a href={wa("Hola, me interesa el Tour Brujas y Amsterdam (3 días). ¿Podrían enviarme itinerario y precios?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Tour Brujas y Amsterdam (3 días)</a>
                  <a href={wa("Hola, me interesa el Tour a Mont Saint Michel. ¿Podrían enviarme información y disponibilidad?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Tour Mont Saint Michel</a>
                  <a href={wa("Hola, me interesa el Tour a los Castillos del Valle del Loira. ¿Podrían enviarme opciones y precios?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Tour castillo del Valle de Loira</a>
                  <a href={wa("Hola, me interesa el Tour a Versailles. ¿Podrían enviarme información de horarios, entradas y transporte?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Tour Versailles</a>
                  <a href={wa("Hola, me interesa un Tour en acompañamiento por París (sin vehículo). ¿Podrían enviarme propuesta y disponibilidad?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Tour en acompañamiento por París (No vehículo)</a>
                  <a
                    href={wa("Hola, me interesa un Tour escala (aeropuerto - Tour - aeropuerto). Tengo una escala y deseo hacer un tour por París entre vuelos. ¿Podrían enviarme opciones, duración y precios?")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:underline"
                    style={{ color: "#000" }}
                  >
                    Tour escala (aeropuerto - Tour - aeropuerto)
                  </a>
                  <a href={wa("Hola, quiero cotizar un tour a mi gusto. Indico a continuación intereses, fechas y número de pasajeros: ")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Cotiza tu tour a tu gusto</a>
                  <a href={wa("Hola, quiero comprar billetes para el paseo en barco por el Río Sena (con/sin cena). ¿Podrían enviarme opciones y precios?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Billetes paseo en barco Río Sena</a>
                  <a href={wa("Hola, quiero comprar billetes para Disneyland París. ¿Podrían enviarme disponibilidad y precios?")} target="_blank" rel="noopener noreferrer" className="block hover:underline" style={{ color: "#000" }}>Billetes Disneyland</a>
                </div>
              )}
              {/* Enlace principal 'Traslados' removido en móvil: permanece en el submenú de Servicios */}
              <Link
                href="#testimonios"
                className="transition-colors drop-shadow-lg hover:opacity-75"
                style={{ color: "#000000", fontWeight: "600" }}
              >
                Testimonios
              </Link>
              <Link
                href="#contacto"
                className="transition-colors drop-shadow-lg hover:opacity-75"
                style={{ color: "#000000", fontWeight: "600" }}
              >
                Contacto
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
