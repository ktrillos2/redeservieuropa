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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const shouldUseDarkText = !isHomePage || isScrolled

  console.log(
    "[v0] Header render - pathname:",
    pathname,
    "isHomePage:",
    isHomePage,
    "isScrolled:",
    isScrolled,
    "shouldUseDarkText:",
    shouldUseDarkText,
  )

  const textStyle = shouldUseDarkText
    ? { color: "#1e293b", fontWeight: "600" }
    : { color: "#ffffff", fontWeight: "600" }

  const logoStyle = shouldUseDarkText ? { color: "#1e293b" } : { color: "#ffffff" }

  const subtextStyle = shouldUseDarkText ? { color: "#475569" } : { color: "rgba(255, 255, 255, 0.9)" }

  return (
    <header
      className={`fixed top-0 w-full z-[100] transition-all duration-500 ease-in-out ${
        isScrolled ? "bg-background/95 backdrop-blur-sm border-b border-border py-2" : "bg-transparent py-3"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt="REDESERVI PARIS"
              width={isScrolled ? 50 : 60}
              height={isScrolled ? 50 : 60}
              className="animate-float transition-all duration-300"
            />
            <div className="hidden md:block">
              <h1
                className={`font-bold transition-all duration-300 drop-shadow-lg ${isScrolled ? "text-lg" : "text-xl"}`}
                style={logoStyle}
              >
                REDESERVI
              </h1>
              <p
                className={`transition-all duration-300 drop-shadow-lg ${isScrolled ? "text-xs" : "text-sm"}`}
                style={subtextStyle}
              >
                PARIS
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#servicios" className="transition-colors drop-shadow-lg hover:opacity-80" style={textStyle}>
              Servicios
            </Link>
            <Link href="#traslados" className="transition-colors drop-shadow-lg hover:opacity-80" style={textStyle}>
              Traslados
            </Link>
            <Link href="#testimonios" className="transition-colors drop-shadow-lg hover:opacity-80" style={textStyle}>
              Testimonios
            </Link>
            <Link href="#contacto" className="transition-colors drop-shadow-lg hover:opacity-80" style={textStyle}>
              Contacto
            </Link>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden transition-colors ${
              shouldUseDarkText ? "hover:bg-muted" : "hover:bg-white/10 drop-shadow-lg"
            }`}
            style={textStyle}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>

        {isMenuOpen && (
          <div
            className={`md:hidden mt-4 pb-4 border-t animate-fade-in-up ${
              shouldUseDarkText ? "border-border bg-background/95" : "border-white/30 bg-white/10 backdrop-blur-sm"
            }`}
          >
            <nav className="flex flex-col space-y-4 pt-4">
              <Link href="#servicios" className="transition-colors drop-shadow-lg hover:opacity-75" style={textStyle}>
                Servicios
              </Link>
              <Link href="#traslados" className="transition-colors drop-shadow-lg hover:opacity-75" style={textStyle}>
                Traslados
              </Link>
              <Link href="#testimonios" className="transition-colors drop-shadow-lg hover:opacity-75" style={textStyle}>
                Testimonios
              </Link>
              <Link href="#contacto" className="transition-colors drop-shadow-lg hover:opacity-75" style={textStyle}>
                Contacto
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
