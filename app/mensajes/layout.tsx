import type { ReactNode } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function MensajesLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 pt-40 pb-12">
        {children}
      </div>
      <Footer />
    </main>
  )
}
