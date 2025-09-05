import type React from "react"
import type { Metadata } from "next"
import { Jost } from "next/font/google"
import { Suspense } from "react"
import "./globals.css"

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "REDESERVI PARIS - Transporte Privado de Lujo",
  description:
    "Servicio de transporte privado premium en París. Traslados a aeropuertos CDG, Orly, Beauvais y Disneyland. Reserva tu viaje de lujo.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${jost.variable} antialiased`}>
      <body className="font-sans">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  )
}
