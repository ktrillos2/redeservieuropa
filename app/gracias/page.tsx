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
    payFullNow?: boolean
    depositPercent?: number
  }
  contact?: {
    name?: string
    email?: string
    phone?: string
    referralSource?: string
  }
  services?: Array<{
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
    ninos?: number
    isNightTime?: boolean
    totalPrice?: number
    notes?: string
    payFullNow?: boolean
    depositPercent?: number
  }>
}

export default function GraciasPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[] | null>(null)

  // Fallback local si aún no llegaron órdenes del backend
  const [bundleFallback, setBundleFallback] = useState<any | null>(null)

  // Evita doble sync en dev (Strict Mode)
  const hasSyncedRef = useRef(false)

  // ===== Helpers UI / cálculo =====
  const fmt1 = (n: number) => n.toFixed(1)
  
  const sumTotalServices = (list: Order[] | null) =>
    (list || []).reduce((acc, o) => {
      const servicesSum = (o.services || []).reduce((s, srv) => 
        s + Number(srv.totalPrice || 0), 0)
      return acc + servicesSum
    }, 0)

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

  const pctFromType = (type?: string) => {
    const t = String(type || '').toLowerCase()
    if (t === 'traslado') return 10
    if (t === 'tour') return 20
    if (t === 'evento') return 15
    return 10
  }

  const depositPercentForService = (service: any, order: Order) => {
    if (service?.payFullNow || order.payment?.payFullNow) return 100
    if (typeof service?.depositPercent === 'number') return service.depositPercent
    if (typeof order.payment?.depositPercent === 'number') return order.payment.depositPercent
    return pctFromType(service?.type)
  }

  const sumPaidNow = (list: Order[] | null) =>
    (list || []).reduce((acc, o) => {
      return acc + (o.services || []).reduce((s, srv) => {
        const pct = depositPercentForService(srv, o)
        const total = Number(srv.totalPrice || 0)
        return s + (total * pct / 100)
      }, 0)
    }, 0)

  // ===== Adapter: bundle (localStorage.lastCheckoutPayload) -> Order[] =====
  const ordersFromBundle = (b: any): Order[] => {
    if (!b || !Array.isArray(b.items)) return []
    
    // Convertir todos los items a servicios
    const allServices = b.items.map((it: any) => ({
      type: it?.tipo === 'tour' ? 'tour' : 'traslado',
      title:
        it?.label ||
        it?.serviceLabel ||
        it?.serviceSubLabel ||
        (it?.tipo === 'tour' ? 'Tour' : 'Traslado'),
      date: it?.date,
      time: it?.time,
      passengers: Number(it?.passengers ?? 0),
      pickupAddress: it?.pickupAddress,
      dropoffAddress: it?.dropoffAddress,
      flightNumber: it?.flightNumber,
      flightArrivalTime: it?.flightArrivalTime,
      flightDepartureTime: it?.flightDepartureTime,
      luggage23kg: Number(it?.luggage23kg ?? 0),
      luggage10kg: Number(it?.luggage10kg ?? 0),
      ninos: Number(it?.ninos ?? 0),
      isNightTime: !!it?.isNightTime,
      totalPrice: Number(it?.totalPrice || 0),
      payFullNow: !!b?.payFullNow,
      depositPercent: b?.payFullNow
        ? 100
        : (it?.tipo === 'tour' ? 20 : 10),
      notes: it?.specialRequests,
    }))

    // Retornar UNA orden con todos los servicios
    return [{
      _id: 'local-bundle',
      status: b?.payFullNow ? 'paid' : 'open',
      payment: {
        provider: 'mollie',
        paymentId: undefined,
        status: b?.payFullNow ? 'paid' : 'open',
        amount: b?.amountNow ?? undefined,
        currency: 'EUR',
        method: b?.paymentMethod,
        requestedMethod: b?.paymentMethod,
        payFullNow: !!b?.payFullNow,
        depositPercent: b?.payFullNow ? 100 : undefined,
      },
      contact: {
        name: b?.contact?.name,
        email: b?.contact?.email,
        phone: b?.contact?.phone,
        referralSource: b?.contact?.referralSource,
      },
      services: allServices, // 👈 Array de servicios
    }]
  }

  // ===== Efecto principal: lee pid, consulta estado, sincroniza, trae órdenes,
  //       y si no hay órdenes usa fallback local del bundle =====
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
      // Aun así, intentamos pintar con lastCheckoutPayload si existe
      try {
        const raw = localStorage.getItem('lastCheckoutPayload')
        if (raw) setBundleFallback(JSON.parse(raw))
      } catch {}
      setLoading(false)
      return
    }

    setPaymentId(pid)

    // Evitar doble ejecución en dev
    if (hasSyncedRef.current) return
    hasSyncedRef.current = true

    // 3) Consultar estado y luego sincronizar/leer órdenes
    fetch(`/api/mollie/status?id=${encodeURIComponent(pid)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => setStatus(json?.status || null))
      .catch(() => setStatus(null))
      .finally(async () => {
        try {
          // 4) Forzar sync
          await fetch('/api/orders/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: pid }),
          })

          // 5) Leer órdenes por payment
          const resp = await fetch(`/api/orders/by-payment?id=${encodeURIComponent(pid)}`)
          if (resp.ok) {
            const j = await resp.json()
            if (j.orders && Array.isArray(j.orders) && j.orders.length > 0) {
              setOrders(j.orders)
              if (j.orders[0]?.payment?.status) setStatus(j.orders[0].payment.status)
            } else {
              // Si todavía no hay órdenes, intenta fallback local
              try {
                const raw = localStorage.getItem('lastCheckoutPayload')
                if (raw) setBundleFallback(JSON.parse(raw))
              } catch {}
            }
          } else {
            // Si el endpoint falla, intenta fallback local
            try {
              const raw = localStorage.getItem('lastCheckoutPayload')
              if (raw) setBundleFallback(JSON.parse(raw))
            } catch {}
          }
        } catch (e) {
          console.error('[Gracias] Error en sync/by-payment:', e)
          // Si hubo error, intenta fallback local
          try {
            const raw = localStorage.getItem('lastCheckoutPayload')
            if (raw) setBundleFallback(JSON.parse(raw))
          } catch {}
        }
        setLoading(false)
      })
  }, [])

  // Usa órdenes reales si existen; si no, convierte el bundle local a “orders”
  const effectiveOrders: Order[] | null =
    (orders && orders.length > 0)
      ? orders
      : (bundleFallback ? ordersFromBundle(bundleFallback) : null)

  const title = status === 'paid' ? '¡Pago confirmado!' : '¡Gracias!'
  const desc = status === 'paid'
    ? 'Hemos recibido tu pago correctamente. En breve recibirás un correo con los detalles de tu reserva.'
    : 'Si cerraste el checkout o el pago aún está en proceso, te contactaremos para confirmar el estado.'

  const grandTotal = sumTotalServices(effectiveOrders)
  const paidNowTotal = Number(sumPaidNow(effectiveOrders).toFixed(1))

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
                {effectiveOrders && effectiveOrders.length > 0 && effectiveOrders[0]?.payment && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">Pago</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Proveedor:</span> {effectiveOrders[0].payment?.provider || '—'}</div>
                      <div><span className="text-muted-foreground">Estado:</span> {effectiveOrders[0].payment?.status || status || '—'}</div>
                      <div>
                        <span className="text-muted-foreground">Importe pagado:</span>{' '}
                        {grandTotal > 0 ? `${fmt1(paidNowTotal)} €` : '—'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Importe total:</span>{' '}
                        {grandTotal > 0 ? `${fmt1(grandTotal)} €` : '—'}
                      </div>
                      <div><span className="text-muted-foreground">Moneda:</span> {effectiveOrders[0].payment?.currency || 'EUR'}</div>
                      <div><span className="text-muted-foreground">Método solicitado:</span> {labelRequested(effectiveOrders[0].payment?.requestedMethod)}</div>
                      {effectiveOrders[0].payment?.paymentId && (
                        <div className="sm:col-span-2"><span className="text-muted-foreground">Referencia:</span> {effectiveOrders[0].payment?.paymentId}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contacto */}
                {effectiveOrders && effectiveOrders[0]?.contact && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">Contacto</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Nombre:</span> {effectiveOrders[0].contact?.name || '—'}</div>
                      <div><span className="text-muted-foreground">Teléfono:</span> {effectiveOrders[0].contact?.phone || '—'}</div>
                      <div><span className="text-muted-foreground">Email:</span> {effectiveOrders[0].contact?.email || '—'}</div>
                      <div>
                        <span className="text-muted-foreground">¿Dónde nos conociste?</span>{' '}
                        {effectiveOrders[0].contact?.referralSource || '—'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Servicios */}
                {effectiveOrders && effectiveOrders.length > 0 ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-primary">Servicios contratados</h2>
                    {effectiveOrders.map((ord) => {
                      const services = ord.services || []
                      if (services.length === 0) return null

                      return services.map((service, idx) => {
                        const total = Number(service.totalPrice || 0)
                        const pct = depositPercentForService(service, ord)
                        const paid = Number((total * pct / 100).toFixed(1))

                        return (
                          <div key={`${ord._id}-${idx}`} className="rounded-lg border bg-white p-4 shadow-sm">
                            <h3 className="text-xl font-semibold text-primary mb-2">
                              {service.title || service.type || 'Servicio'}
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                              <div><span className="text-muted-foreground">Tipo:</span> {service.type || '—'}</div>
                              <div><span className="text-muted-foreground">Fecha:</span> {service.date || '—'}</div>
                              <div><span className="text-muted-foreground">Hora:</span> {service.time || '—'}</div>
                              <div><span className="text-muted-foreground">Pasajeros:</span> {service.passengers ?? '—'}</div>
                              <div><span className="text-muted-foreground">Niños:</span> {service.ninos ?? 0}</div>

                              {service.pickupAddress && (
                                <div><span className="text-muted-foreground">Recogida:</span> {service.pickupAddress}</div>
                              )}
                              {service.dropoffAddress && (
                                <div><span className="text-muted-foreground">Destino:</span> {service.dropoffAddress}</div>
                              )}
                              {service.flightNumber && (
                                <div><span className="text-muted-foreground">Vuelo:</span> {service.flightNumber}</div>
                              )}
                              <div><span className="text-muted-foreground">Maletas 23kg:</span> {service.luggage23kg ?? 0}</div>
                              <div><span className="text-muted-foreground">Maletas 10kg:</span> {service.luggage10kg ?? 0}</div>
                              {service.notes && (
                                <div className="sm:col-span-2"><span className="text-muted-foreground">Notas:</span> {service.notes}</div>
                              )}
                            </div>
                            
                            {/* Total y depósito */}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex justify-between items-center font-semibold">
                                <span>Total del servicio:</span>
                                <span className="text-lg text-primary">{fmt1(total)} €</span>
                              </div>
                              <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                                <span>Pagado ahora ({pct}%):</span>
                                <span className="font-semibold text-foreground">{fmt1(paid)} €</span>
                              </div>
                              {pct < 100 && (
                                <div className="flex justify-between items-center text-sm text-amber-600 mt-1">
                                  <span>Saldo pendiente:</span>
                                  <span className="font-semibold">{fmt1(total - paid)} €</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
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

            {status === 'paid' && (
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded">
                <p className="font-semibold mb-1">¿Necesitas hacer alguna modificación de la reserva?</p>
                <p>Escríbenos al WhatsApp: <a href="https://wa.me/33695587787" className="underline font-semibold" target="_blank" rel="noopener noreferrer">+33 6 95 58 77 87</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}