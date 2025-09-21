import type { ReactNode } from 'react'
import HeaderServer from '@/components/header.server'
import { Footer } from '@/components/footer'

export default function MensajesLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <HeaderServer />
      <div className="container mx-auto px-4 pt-40 pb-12">
        {children}
      </div>
      <Footer />
    </main>
  )
}
