import type React from "react"
import type { Metadata } from "next"
import { Jost, Playfair_Display } from "next/font/google"
import { Suspense } from "react"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import { SanityLive } from '@/sanity/lib/live'
import { AnimationGuardian } from "@/components/animation-guardian"
import "./globals.css"
import { SpeedInsights } from "@vercel/speed-insights/next"

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "REDESERVI PARIS - Transporte Privado de Lujo",
  description:
    "Servicio de transporte privado premium en París. Traslados a aeropuertos CDG, Orly, Beauvais y Disneyland. Reserva tu viaje de lujo.",
  generator: "v0.app",
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'icon', url: '/favicon.svg' },
      { rel: 'shortcut icon', url: '/favicon.svg' },
    ],
    apple: '/images/logo.png', // Mantener logo vertical como touch icon (iOS muestra ícono más grande)
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
  <html lang="es" className={`${jost.variable} ${playfair.variable} antialiased`}>
      <head />
      <body className="font-sans">
      
        <Suspense fallback={null}>{children}<SpeedInsights /></Suspense>
  <ScrollToTopButton />
  <SanityLive />
        <AnimationGuardian />
        {/* pre-anim removido para evitar ocultar contenido antes de las animaciones */}
      </body>
    </html>
  )
}
