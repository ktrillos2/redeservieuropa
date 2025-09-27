"use client"

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useEffect, useState } from 'react'

type Order = {
  _id: string
  orderNumber?: string
  status?: string
  payment?: { provider?: string; paymentId?: string; status?: string; amount?: number; currency?: string; method?: string; requestedMethod?: string; createdAt?: string; paidAt?: string }
  contact?: { name?: string; email?: string; phone?: string }
  service?: {
    type?: string; title?: string; date?: string; time?: string; passengers?: number;
    pickupAddress?: string; dropoffAddress?: string; flightNumber?: string;
    luggage23kg?: number; luggage10kg?: number; isNightTime?: boolean; extraLuggage?: boolean; totalPrice?: number;
    selectedPricingOption?: { label?: string; price?: number; hours?: number };
    notes?: string;
  }
}

export default function GraciasPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    const pid = localStorage.getItem('lastPaymentId')
    const bd = localStorage.getItem('bookingData')
    if (bd) {
      try { setBooking(JSON.parse(bd)) } catch {}
    }
    if (pid) {
      setPaymentId(pid)
      fetch(`/api/mollie/status?id=${encodeURIComponent(pid)}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(json => setStatus(json?.status || null))
        .catch(() => setStatus(null))
        .finally(async () => {
          try {
            // Forzar sync con Sanity en segundo plano
            await fetch('/api/orders/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: pid }),
            })
            // Intentar cargar el pedido de Sanity
            const resp = await fetch(`/api/orders/by-payment?id=${encodeURIComponent(pid)}`)
            if (resp.ok) {
              const j = await resp.json()
              if (j.orders && Array.isArray(j.orders)) {
                setOrders(j.orders)
                setOrder(j.orders[0] || null)
                if (j.orders[0]?.payment?.status) setStatus(j.orders[0].payment.status)
              } else if (j.order) {
                setOrder(j.order)
                if (j.order?.payment?.status) setStatus(j.order.payment.status)
              }
            }
          } catch {}
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const title = status === 'paid' ? '¡Pago confirmado!' : '¡Gracias!'
  const desc = status === 'paid'
    ? 'Hemos recibido tu pago correctamente. En breve recibirás un correo con los detalles de tu reserva.'
    : 'Si cerraste el checkout o el pago aún está en proceso, te contactaremos para confirmar el estado.'

  const o = order
  const service = o?.service || (booking ? {
    type: booking?.isEvent ? 'evento' : (booking?.tourId ? 'tour' : 'traslado'),
    title: booking?.isEvent ? (booking?.eventTitle || 'Evento') : (booking?.tourId || `${booking?.pickupAddress || ''} → ${booking?.dropoffAddress || ''}`),
    date: booking?.date, time: booking?.time, passengers: booking?.passengers,
    pickupAddress: booking?.pickupAddress, dropoffAddress: booking?.dropoffAddress, flightNumber: booking?.flightNumber,
    luggage23kg: booking?.luggage23kg, luggage10kg: booking?.luggage10kg, isNightTime: booking?.isNightTime, extraLuggage: booking?.extraLuggage,
    totalPrice: booking?.totalPrice, selectedPricingOption: booking?.selectedPricingOption, notes: booking?.specialRequests,
  } : null)
  const contact = o?.contact || (booking ? { name: booking?.contactName, email: booking?.contactEmail, phone: booking?.contactPhone } : null)
  const payment = o?.payment || (paymentId ? { provider: 'mollie', paymentId, status, amount: booking?.totalPrice, currency: 'EUR', method: undefined, requestedMethod: booking?.paymentMethod } : null)

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

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-24 pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl font-bold text-primary">{title}</h1>
            {loading ? (
              <p className="text-muted-foreground">Verificando el estado de tu pago…</p>
            ) : (
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground">{desc}</p>
                {/* Resumen de pago */}
                {payment && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">Pago</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Proveedor:</span> {payment.provider || '—'}</div>
                      <div><span className="text-muted-foreground">Estado:</span> {payment.status || status || '—'}</div>
                      <div><span className="text-muted-foreground">Importe:</span> {typeof payment.amount === 'number' ? `${payment.amount} €` : '—'}</div>
                      <div><span className="text-muted-foreground">Moneda:</span> {payment.currency || 'EUR'}</div>
                      <div><span className="text-muted-foreground">Método solicitado:</span> {labelRequested(payment.requestedMethod)}</div>
                      <div><span className="text-muted-foreground">Método final (Mollie):</span> {labelMollie(payment.method)}</div>
                      {payment.paymentId && <div className="sm:col-span-2"><span className="text-muted-foreground">Referencia:</span> {payment.paymentId}</div>}
                    </div>
                  </div>
                )}

                {/* Información de contacto */}
                {contact && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">Contacto</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Nombre:</span> {contact.name || '—'}</div>
                      <div><span className="text-muted-foreground">Teléfono:</span> {contact.phone || '—'}</div>
                      <div className="sm:col-span-2"><span className="text-muted-foreground">Email:</span> {contact.email || '—'}</div>
                    </div>
                  </div>
                )}

                {/* Detalles de los servicios pagados */}
                {orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord._id} className="rounded-lg border bg-white p-4 shadow-sm">
                        <h2 className="text-xl font-semibold text-primary mb-2">{ord.service?.title || 'Servicio'}</h2>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Tipo:</span> {ord.service?.type || '—'}</div>
                          <div><span className="text-muted-foreground">Fecha:</span> {ord.service?.date || '—'}</div>
                          <div><span className="text-muted-foreground">Hora:</span> {ord.service?.time || '—'}</div>
                          <div><span className="text-muted-foreground">Pasajeros:</span> {typeof ord.service?.passengers === 'number' ? ord.service!.passengers : '—'}</div>
                          {ord.service?.pickupAddress && <div className="sm:col-span-2"><span className="text-muted-foreground">Recogida:</span> {ord.service.pickupAddress}</div>}
                          {ord.service?.dropoffAddress && <div className="sm:col-span-2"><span className="text-muted-foreground">Destino:</span> {ord.service.dropoffAddress}</div>}
                          {ord.service?.flightNumber && <div className="sm:col-span-2"><span className="text-muted-foreground">Vuelo:</span> {ord.service.flightNumber}</div>}
                          <div><span className="text-muted-foreground">Equipaje 23kg:</span> {typeof ord.service?.luggage23kg === 'number' ? ord.service.luggage23kg : 0}</div>
                          <div><span className="text-muted-foreground">Equipaje 10kg:</span> {typeof ord.service?.luggage10kg === 'number' ? ord.service.luggage10kg : 0}</div>
                          <div><span className="text-muted-foreground">Recargo nocturno:</span> {ord.service?.isNightTime ? 'Sí' : 'No'}</div>
                          <div><span className="text-muted-foreground">Equipaje extra:</span> {ord.service?.extraLuggage ? 'Sí' : 'No'}</div>
                          <div className="sm:col-span-2"><span className="text-muted-foreground">Total estimado del servicio:</span> {typeof ord.service?.totalPrice === 'number' ? `${ord.service!.totalPrice} €` : '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : service ? (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">Detalles del servicio</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Tipo:</span> {service.type || '—'}</div>
                      <div><span className="text-muted-foreground">Título:</span> {service.title || '—'}</div>
                      <div><span className="text-muted-foreground">Fecha:</span> {service.date || '—'}</div>
                      <div><span className="text-muted-foreground">Hora:</span> {service.time || '—'}</div>
                      <div><span className="text-muted-foreground">Pasajeros:</span> {typeof service.passengers === 'number' ? service.passengers : '—'}</div>
                      {service.pickupAddress && <div className="sm:col-span-2"><span className="text-muted-foreground">Recogida:</span> {service.pickupAddress}</div>}
                      {service.dropoffAddress && <div className="sm:col-span-2"><span className="text-muted-foreground">Destino:</span> {service.dropoffAddress}</div>}
                      {service.flightNumber && <div className="sm:col-span-2"><span className="text-muted-foreground">Vuelo:</span> {service.flightNumber}</div>}
                      <div><span className="text-muted-foreground">Equipaje 23kg:</span> {typeof service.luggage23kg === 'number' ? service.luggage23kg : 0}</div>
                      <div><span className="text-muted-foreground">Equipaje 10kg:</span> {typeof service.luggage10kg === 'number' ? service.luggage10kg : 0}</div>
                      <div><span className="text-muted-foreground">Recargo nocturno:</span> {service.isNightTime ? 'Sí' : 'No'}</div>
                      <div><span className="text-muted-foreground">Equipaje extra:</span> {service.extraLuggage ? 'Sí' : 'No'}</div>
                      <div className="sm:col-span-2"><span className="text-muted-foreground">Total estimado del servicio:</span> {typeof service.totalPrice === 'number' ? `${service.totalPrice} €` : '—'}</div>
                      {service.selectedPricingOption?.label && (
                        <div className="sm:col-span-2"><span className="text-muted-foreground">Opción seleccionada:</span> {service.selectedPricingOption.label} {service.selectedPricingOption.hours ? `(${service.selectedPricingOption.hours}h)` : ''} {typeof service.selectedPricingOption.price === 'number' ? `– ${service.selectedPricingOption.price} €` : ''}</div>
                      )}
                      {service.notes && (
                        <div className="sm:col-span-2"><span className="text-muted-foreground">Notas:</span> {service.notes}</div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/" className="inline-flex px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">Volver al inicio</Link>
              <Link href="/#contacto" className="inline-flex px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90">Contactar</Link>
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
