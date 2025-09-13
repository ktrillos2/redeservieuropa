"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
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

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out h-auto ${
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border py-2" : "bg-transparent py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt="REDESERVI PARIS"
              width={isScrolled ? 70 : 60}
              height={isScrolled ? 70 : 60}
              className="animate-float transition-all duration-300"
            />
            <div className="hidden md:block">
              <h1
                className={`font-bold font-display transition-all duration-300 drop-shadow-lg ${isScrolled ? "text-lg" : "text-xl"} ${useDarkText ? "!text-black" : "!text-white"}`}
              >
                REDESERVI
              </h1>
              <p className={`font-display transition-all duration-300 drop-shadow-lg ${isScrolled ? "text-xs" : "text-sm"} ${useDarkText ? "!text-black" : "!text-white"}`}>
                PARIS
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 font-display">
            <Link href="#servicios" className={`transition-colors drop-shadow-lg hover:opacity-80 ${useDarkText ? "text-black" : "!text-white"}`}>
              Servicios
            </Link>
            <Link href="#traslados" className={`transition-colors drop-shadow-lg hover:opacity-80 ${useDarkText ? "text-black" : "!text-white"}`}>
              Traslados
            </Link>
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
          <div className="md:hidden mt-4 pb-4 border-t border-border bg-background/95 animate-fade-in-up">
            <nav className="flex flex-col space-y-4 pt-4 font-display">
              <Link
                href="#servicios"
                className="transition-colors drop-shadow-lg hover:opacity-75"
                style={{ color: "#000000", fontWeight: "600" }}
              >
                Servicios
              </Link>
              <Link
                href="#traslados"
                className="transition-colors drop-shadow-lg hover:opacity-75"
                style={{ color: "#000000", fontWeight: "600" }}
              >
                Traslados
              </Link>
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
