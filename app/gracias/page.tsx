// app/gracias/page.tsx
'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useEffect, useRef, useState } from 'react'

type Order = {
  _id: string
  orderNumber?: string
  status?: string
  payment?: {
    provider?: string
    paymentId?: string
    status?: string
    amount?: number | string
    currency?: string
    method?: string
    requestedMethod?: string
    createdAt?: string
    paidAt?: string
  }
  contact?: { name?: string; email?: string; phone?: string }
  service?: {
    type?: string
    title?: string
    date?: string
    time?: string
    passengers?: number
    pickupAddress?: string
    dropoffAddress?: string
    flightNumber?: string
    luggage23kg?: number
    luggage10kg?: number
    isNightTime?: boolean
    extraLuggage?: boolean
    totalPrice?: number
    selectedPricingOption?: { label?: string; price?: number; hours?: number }
    notes?: string
  }
}

export default function GraciasPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[] | null>(null)

  // Evita doble sync en dev (Strict Mode)
  const hasSyncedRef = useRef(false)

  // Helpers UI
  const fmt1 = (n: number) => n.toFixed(1)
  const sumTotalServices = (list: Order[] | null) =>
    (list || []).reduce((acc, o) => acc + (o.service?.totalPrice || 0), 0)
  const labelRequested = (m?: string | null) => {
    switch ((m || '').toLowerCase()) {
      case 'card': return 'Tarjeta'
      case 'paypal': return 'PayPal'
      case 'cash': return 'Efectivo'
      default: return m || '—'
    }
  }
  const labelMollie = (m?: string | null) => {
    switch ((m || '').toLowerCase()) {
      case 'creditcard': return 'Tarjeta (Mollie)'
      case 'paypal': return 'PayPal (Mollie)'
      case 'bancontact': return 'Bancontact (Mollie)'
      case 'ideal': return 'iDEAL (Mollie)'
      default: return m || '—'
    }
  }

  useEffect(() => {
    // 1) Intentar localStorage
    let pid: string | null = null
    try { pid = localStorage.getItem('lastPaymentId') } catch {}

    // 2) Fallback: querystring ?pid=
    if (!pid && typeof window !== 'undefined') {
      const qs = new URLSearchParams(window.location.search)
      const qpid = qs.get('pid')
      if (qpid) {
        pid = qpid
        try { localStorage.setItem('lastPaymentId', qpid) } catch {}
      }
    }

    if (!pid) {
      console.warn('[Gracias] lastPaymentId no encontrado.')
      setLoading(false)
      return
    }

    setPaymentId(pid)

    // Evitar doble ejecución en dev
    if (hasSyncedRef.current) return
    hasSyncedRef.current = true

    // 3) Consultar estado en Mollie
    fetch(`/api/mollie/status?id=${encodeURIComponent(pid)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => setStatus(json?.status || null))
      .catch(() => setStatus(null))
      .finally(async () => {
        try {
          // 4) Forzar sync (crea/actualiza órdenes, envía correos si procede)
          await fetch('/api/orders/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: pid }),
          })

          // 5) Leer órdenes por payment
          const resp = await fetch(`/api/orders/by-payment?id=${encodeURIComponent(pid)}`)
          if (resp.ok) {
            const j = await resp.json()
            if (j.orders && Array.isArray(j.orders)) {
              setOrders(j.orders)
              if (j.orders[0]?.payment?.status) setStatus(j.orders[0].payment.status)
            }
          }
        } catch (e) {
          console.error('[Gracias] Error en sync/by-payment:', e)
        }
        setLoading(false)
      })
  }, [])

  const title = status === 'paid' ? '¡Pago confirmado!' : '¡Gracias!'
  const desc = status === 'paid'
    ? 'Hemos recibido tu pago correctamente. En breve recibirás un correo con los detalles de tu reserva.'
    : 'Si cerraste el checkout o el pago aún está en proceso, te contactaremos para confirmar el estado.'

  const grandTotal = sumTotalServices(orders)
  const paidTwenty = Number((grandTotal * 0.2).toFixed(1))

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-24 pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6 mt-9">
            <h1 className="text-4xl font-bold text-primary">{title}</h1>

            {loading ? (
              <p className="text-muted-foreground">Verificando el estado de tu pago…</p>
            ) : (
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground">{desc}</p>

                {/* Aviso si no hubo pid */}
                {!paymentId && (
                  <div className="p-3 bg-amber-50 border rounded text-amber-800 text-sm">
                    <b>No se encontró lastPaymentId en el navegador.</b> Si volviste
                    directamente a esta página sin pasar por el checkout, no podremos
                    recuperar el pedido.
                  </div>
                )}

                {/* Pago */}
                {orders && orders.length > 0 && orders[0]?.payment && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">Pago</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Proveedor:</span> {orders[0].payment?.provider || '—'}</div>
                      <div><span className="text-muted-foreground">Estado:</span> {orders[0].payment?.status || status || '—'}</div>
                      <div>
                        <span className="text-muted-foreground">Importe pagado (20%):</span>{' '}
                        {grandTotal > 0 ? `${fmt1(paidTwenty)} €` : '—'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Importe total:</span>{' '}
                        {grandTotal > 0 ? `${fmt1(grandTotal)} €` : '—'}
                      </div>
                      <div><span className="text-muted-foreground">Moneda:</span> {orders[0].payment?.currency || 'EUR'}</div>
                      <div><span className="text-muted-foreground">Método solicitado:</span> {labelRequested(orders[0].payment?.requestedMethod)}</div>
                      <div><span className="text-muted-foreground">Método final (Mollie):</span> {labelMollie(orders[0].payment?.method)}</div>
                      {orders[0].payment?.paymentId && (
                        <div className="sm:col-span-2"><span className="text-muted-foreground">Referencia:</span> {orders[0].payment.paymentId}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contacto */}
                {orders && orders[0]?.contact && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">Contacto</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Nombre:</span> {orders[0].contact?.name || '—'}</div>
                      <div><span className="text-muted-foreground">Teléfono:</span> {orders[0].contact?.phone || '—'}</div>
                      <div className="sm:grid-cols-2"><span className="text-muted-foreground">Email:</span> {orders[0].contact?.email || '—'}</div>
                    </div>
                  </div>
                )}

                {/* Servicios */}
                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => {
                      const service = ord.service
                      if (!service) return null
                      const total = Number(service.totalPrice || 0)
                      const paid = Number((total * 0.2).toFixed(1))

                      return (
                        <div key={ord._id} className="rounded-lg border bg-white p-4 shadow-sm">
                          <h2 className="text-xl font-semibold text-primary mb-2">
                            {service.title || 'Servicio'}
                          </h2>
                          <div className="grid sm:grid-cols-2 gap-2 text-sm">
                            <div><span className="text-muted-foreground">Tipo:</span> {service.type || '—'}</div>
                            <div><span className="text-muted-foreground">Fecha:</span> {service.date || '—'}</div>
                            <div><span className="text-muted-foreground">Hora:</span> {service.time || '—'}</div>
                            <div><span className="text-muted-foreground">Pasajeros:</span> {service.passengers ?? '—'}</div>
                            {service.pickupAddress && (
                              <div className="sm:col-span-2"><span className="text-muted-foreground">Recogida:</span> {service.pickupAddress}</div>
                            )}
                            {service.dropoffAddress && (
                              <div className="sm:col-span-2"><span className="text-muted-foreground">Destino:</span> {service.dropoffAddress}</div>
                            )}
                            {service.flightNumber && (
                              <div className="sm:col-span-2"><span className="text-muted-foreground">Vuelo:</span> {service.flightNumber}</div>
                            )}
                            {service.selectedPricingOption?.label && (
                              <div className="sm:col-span-2"><span className="text-muted-foreground">Opción:</span> {service.selectedPricingOption.label}</div>
                            )}
                            {service.notes && (
                              <div className="sm:col-span-2"><span className="text-muted-foreground">Notas:</span> {service.notes}</div>
                            )}
                            <div><span className="text-muted-foreground">Total estimado:</span> {`${fmt1(total)} €`}</div>
                            <div><span className="text-muted-foreground">Monto pagado (20%):</span> {`${fmt1(paid)} €`}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border rounded text-amber-800 text-sm">
                    No se encontraron órdenes todavía para esta referencia. Si acabas de pagar,
                    puede tardar unos segundos en sincronizarse.
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/" className="inline-flex px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
                Volver al inicio
              </Link>
              <Link href="/#contacto" className="inline-flex px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90">
                Contactar
              </Link>
            </div>

            {status === 'paid' && (
              <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded">
                <b>¿No ves el correo de confirmación?</b> Revisa tu carpeta de SPAM o correo no deseado.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}