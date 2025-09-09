import type React from "react"
import type { Metadata } from "next"
import { Jost, Playfair_Display } from "next/font/google"
import { Suspense } from "react"
import { ScrollToTopButton } from "@/components/scroll-to-top-button"
import "./globals.css"

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
    icon: "/images/logo.png",
    apple: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
  <html lang="es" className={`${jost.variable} ${playfair.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={null}>{children}</Suspense>
        <ScrollToTopButton />
      </body>
    </html>
  )
}
