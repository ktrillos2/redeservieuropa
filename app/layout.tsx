import type React from "next"
import type { Metadata } from "next"
import { Jost, Playfair_Display } from "next/font/google"
import { Suspense } from "react"
import { ScrollToTopButtonServer } from "@/components/scroll-to-top-button.server"
import { SanityLive } from '@/sanity/lib/live'
import { AnimationGuardian } from "@/components/animation-guardian"
import { I18nProvider } from "@/contexts/i18n-context"
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
  title: "REDESERVI PARIS - Transporte Privado",
  description:
    "Servicio de transporte privado en París. Traslados a aeropuertos CDG, Orly, Beauvais y Disneyland. Reserva tu viaje.",
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
      <head>
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-6RK2YQR7CF"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-6RK2YQR7CF');
            `,
          }}
        />
      </head>
      <body className="font-sans">
      <I18nProvider>
        <Suspense fallback={null}>{children}<SpeedInsights /></Suspense>
  <ScrollToTopButtonServer />
  <SanityLive />
        <AnimationGuardian />
        {/* pre-anim removido para evitar ocultar contenido antes de las animaciones */}
      </I18nProvider>
      </body>
    </html>
  )
}
