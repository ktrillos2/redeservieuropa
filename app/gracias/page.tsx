'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/i18n-context'

// ===== Traducciones locales =====
const GRACIAS_TRANSLATIONS = {
  es: {
    paymentMethod: {
      card: 'Tarjeta',
      paypal: 'PayPal',
      cash: 'Efectivo',
      creditcard: 'Tarjeta (Mollie)',
      paypalMollie: 'PayPal (Mollie)',
      bancontact: 'Bancontact (Mollie)',
      ideal: 'iDEAL (Mollie)',
    },
    titles: {
      paid: '¡Pago confirmado!',
      thanks: '¡Gracias!',
    },
    descriptions: {
      paid: 'Hemos recibido tu pago correctamente. En breve recibirás un correo con los detalles de tu reserva.',
      pending: 'Si cerraste el checkout o el pago aún está en proceso, te contactaremos para confirmar el estado.',
    },
    loading: 'Verificando el estado de tu pago…',
    sections: {
      payment: 'Pago',
      contact: 'Contacto',
      services: 'Servicios contratados',
    },
    fields: {
      provider: 'Proveedor',
      status: 'Estado',
      amountPaid: 'Importe pagado',
      totalAmount: 'Importe total',
      currency: 'Moneda',
      requestedMethod: 'Método solicitado',
      reference: 'Referencia',
      name: 'Nombre',
      phone: 'Teléfono',
      email: 'Email',
      referralSource: '¿Dónde nos conociste?',
      type: 'Tipo',
      date: 'Fecha',
      time: 'Hora',
      passengers: 'Pasajeros',
      children: 'Niños',
      childrenAges: 'Edades de los niños',
      pickup: 'Recogida',
      dropoff: 'Destino',
      flight: 'Vuelo',
      luggage23: 'Maletas 23kg',
      luggage10: 'Maletas 10kg',
      notes: 'Notas',
      serviceTotal: 'Total del servicio',
      paidNow: 'Pagado ahora',
      pendingBalance: 'Saldo pendiente',
    },
    messages: {
      noPaymentId: 'No se encontró lastPaymentId en el navegador.',
      noPaymentIdDetail: 'Si volviste directamente a esta página sin pasar por el checkout, no podremos recuperar el pedido.',
      noOrders: 'No se encontraron órdenes todavía para esta referencia. Si acabas de pagar, puede tardar unos segundos en sincronizarse.',
      checkSpam: '¿No ves el correo de confirmación?',
      checkSpamDetail: 'Revisa tu carpeta de SPAM o correo no deseado.',
      needChanges: '¿Necesitas hacer alguna modificación de la reserva?',
      contactWhatsApp: 'Escríbenos al WhatsApp:',
    },
    buttons: {
      backHome: 'Volver al inicio',
      contact: 'Contactar',
    },
  },
  en: {
    paymentMethod: {
      card: 'Card',
      paypal: 'PayPal',
      cash: 'Cash',
      creditcard: 'Card (Mollie)',
      paypalMollie: 'PayPal (Mollie)',
      bancontact: 'Bancontact (Mollie)',
      ideal: 'iDEAL (Mollie)',
    },
    titles: {
      paid: 'Payment confirmed!',
      thanks: 'Thank you!',
    },
    descriptions: {
      paid: 'We have received your payment successfully. You will receive an email shortly with your booking details.',
      pending: 'If you closed the checkout or the payment is still in process, we will contact you to confirm the status.',
    },
    loading: 'Verifying your payment status…',
    sections: {
      payment: 'Payment',
      contact: 'Contact',
      services: 'Booked Services',
    },
    fields: {
      provider: 'Provider',
      status: 'Status',
      amountPaid: 'Amount paid',
      totalAmount: 'Total amount',
      currency: 'Currency',
      requestedMethod: 'Requested method',
      reference: 'Reference',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      referralSource: 'How did you hear about us?',
      type: 'Type',
      date: 'Date',
      time: 'Time',
      passengers: 'Passengers',
      children: 'Children',
      childrenAges: 'Children ages',
      pickup: 'Pickup',
      dropoff: 'Drop-off',
      flight: 'Flight',
      luggage23: '23kg Luggage',
      luggage10: '10kg Luggage',
      notes: 'Notes',
      serviceTotal: 'Service total',
      paidNow: 'Paid now',
      pendingBalance: 'Pending balance',
    },
    messages: {
      noPaymentId: 'lastPaymentId not found in browser.',
      noPaymentIdDetail: 'If you came directly to this page without going through checkout, we cannot retrieve the order.',
      noOrders: 'No orders found yet for this reference. If you just paid, it may take a few seconds to sync.',
      checkSpam: 'Don\'t see the confirmation email?',
      checkSpamDetail: 'Check your SPAM or junk folder.',
      needChanges: 'Need to make any changes to your booking?',
      contactWhatsApp: 'Contact us on WhatsApp:',
    },
    buttons: {
      backHome: 'Back to home',
      contact: 'Contact',
    },
  },
  fr: {
    paymentMethod: {
      card: 'Carte',
      paypal: 'PayPal',
      cash: 'Espèces',
      creditcard: 'Carte (Mollie)',
      paypalMollie: 'PayPal (Mollie)',
      bancontact: 'Bancontact (Mollie)',
      ideal: 'iDEAL (Mollie)',
    },
    titles: {
      paid: 'Paiement confirmé !',
      thanks: 'Merci !',
    },
    descriptions: {
      paid: 'Nous avons bien reçu votre paiement. Vous recevrez sous peu un email avec les détails de votre réservation.',
      pending: 'Si vous avez fermé le paiement ou si celui-ci est toujours en cours, nous vous contacterons pour confirmer le statut.',
    },
    loading: 'Vérification de l\'état de votre paiement…',
    sections: {
      payment: 'Paiement',
      contact: 'Contact',
      services: 'Services réservés',
    },
    fields: {
      provider: 'Fournisseur',
      status: 'Statut',
      amountPaid: 'Montant payé',
      totalAmount: 'Montant total',
      currency: 'Devise',
      requestedMethod: 'Méthode demandée',
      reference: 'Référence',
      name: 'Nom',
      phone: 'Téléphone',
      email: 'Email',
      referralSource: 'Comment nous avez-vous connu ?',
      type: 'Type',
      date: 'Date',
      time: 'Heure',
      passengers: 'Passagers',
      children: 'Enfants',
      childrenAges: 'Âges des enfants',
      pickup: 'Prise en charge',
      dropoff: 'Destination',
      flight: 'Vol',
      luggage23: 'Bagages 23kg',
      luggage10: 'Bagages 10kg',
      notes: 'Notes',
      serviceTotal: 'Total du service',
      paidNow: 'Payé maintenant',
      pendingBalance: 'Solde restant',
    },
    messages: {
      noPaymentId: 'lastPaymentId introuvable dans le navigateur.',
      noPaymentIdDetail: 'Si vous êtes arrivé directement sur cette page sans passer par le paiement, nous ne pouvons pas récupérer la commande.',
      noOrders: 'Aucune commande trouvée pour cette référence. Si vous venez de payer, cela peut prendre quelques secondes pour se synchroniser.',
      checkSpam: 'Vous ne voyez pas l\'email de confirmation ?',
      checkSpamDetail: 'Vérifiez votre dossier SPAM ou courrier indésirable.',
      needChanges: 'Besoin de modifier votre réservation ?',
      contactWhatsApp: 'Contactez-nous sur WhatsApp :',
    },
    buttons: {
      backHome: 'Retour à l\'accueil',
      contact: 'Contact',
    },
  },
} as const

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
    ninosMenores9?: string
    isNightTime?: boolean
    totalPrice?: number
    notes?: string
    payFullNow?: boolean
    depositPercent?: number
    translations?: {
      en?: { title?: string }
      fr?: { title?: string }
    }
  }>
}

export default function GraciasPage() {
  const { locale } = useTranslation()
  const tr = GRACIAS_TRANSLATIONS[locale] || GRACIAS_TRANSLATIONS.es
  
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
  
  // Helper para obtener título traducido de un item
  const getTranslatedTitle = (it: any, isTour: boolean): string => {
    // Si hay tourData con traducciones (para tours)
    if (isTour && it?.tourData) {
      // Obtener el título traducido según el locale
      let translatedTitle = it.tourData.title; // Default español
      
      if (locale === 'en' && it.tourData.translations?.en?.title) {
        translatedTitle = it.tourData.translations.en.title;
      } else if (locale === 'fr' && it.tourData.translations?.fr?.title) {
        translatedTitle = it.tourData.translations.fr.title;
      }
      
      return translatedTitle;
    }

    // Si hay traducciones directas en el item (para transfers)
    if (!isTour && it?.translations) {
      const fromText = locale === 'es' || !it.translations 
        ? it.transferFrom || it.from 
        : (locale === 'en' && it.translations.en?.from) || (locale === 'fr' && it.translations.fr?.from) || it.transferFrom || it.from
      
      const toText = locale === 'es' || !it.translations 
        ? it.transferTo || it.to 
        : (locale === 'en' && it.translations.en?.to) || (locale === 'fr' && it.translations.fr?.to) || it.transferTo || it.to
      
      if (fromText && toText) {
        return `${fromText} → ${toText}`
      }
    }

    // Si es tour pero ya tiene tourTitle formateado (posiblemente con info adicional)
    // intentar usar solo el título del tour si está disponible
    if (isTour && it?.tourTitle) {
      // El tourTitle puede venir como "Disneyland - París (Tour Eiffel y Arco del Triunfo) - Disneyland"
      // pero queremos solo el título limpio del tour
      return it.tourTitle;
    }

    // Fallback a los títulos ya formateados o por defecto
    return it?.transferTitle || 
           it?.tourData?.title || 
           it?.label ||
           it?.serviceLabel ||
           it?.serviceSubLabel ||
           (isTour ? 'Tour' : 'Traslado')
  }

  // Helper para obtener título traducido de un servicio ya guardado
  const getServiceTitle = (service: any): string => {
    // Si el servicio tiene traducciones almacenadas
    if (service?.translations) {
      if (locale === 'en' && service.translations.en?.title) {
        return service.translations.en.title
      }
      if (locale === 'fr' && service.translations.fr?.title) {
        return service.translations.fr.title
      }
    }
    
    // Fallback al título por defecto
    return service?.title || service?.type || 'Servicio'
  }

  const sumTotalServices = (list: Order[] | null) =>
    (list || []).reduce((a, o) => a + (o.services || []).reduce((s, srv) => s + Number(srv.totalPrice || 0), 0), 0)

  const labelRequested = (m?: string | null) => {
    const method = (m || '').toLowerCase()
    switch (method) {
      case 'card': return tr.paymentMethod.card
      case 'paypal': return tr.paymentMethod.paypal
      case 'cash': return tr.paymentMethod.cash
      default: return m || '—'
    }
  }
  const labelMollie = (m?: string | null) => {
    const method = (m || '').toLowerCase()
    switch (method) {
      case 'creditcard': return tr.paymentMethod.creditcard
      case 'paypal': return tr.paymentMethod.paypalMollie
      case 'bancontact': return tr.paymentMethod.bancontact
      case 'ideal': return tr.paymentMethod.ideal
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
    
    console.log('📦 Bundle recibido:', b);
    console.log('📋 Items:', b.items);
    
    // Convertir todos los items a servicios
    const allServices = b.items.map((it: any) => {
      // Determinar si es tour o traslado
      const isTour = Boolean(
        it.isEvent ||
        it.quickType === 'tour' ||
        it.isTourQuick === true ||
        it.tipoReserva === 'tour' ||
        it.tourId ||
        it.tourData ||
        it.selectedTourSlug
      );
      
      console.log('🔍 Item procesado:', {
        isTour,
        transferTitle: it?.transferTitle,
        label: it?.label,
        tourTitle: it?.tourData?.title,
      });

      
      console.log(it)
      
      return {
        type: isTour ? 'tour' : 'traslado',
        title: getTranslatedTitle(it, isTour),
        date: it?.date || it?.fecha,
        time: it?.time || it?.hora,
        passengers: Number(it?.passengers ?? it?.pasajeros ?? 0),
        pickupAddress: it?.pickupAddress || it?.paymentPickupAddress || it?.origen,
        dropoffAddress: it?.dropoffAddress || it?.paymentDropoffAddress || it?.destino,
        flightNumber: it?.flightNumber,
        flightArrivalTime: it?.flightArrivalTime,
        flightDepartureTime: it?.flightDepartureTime,
        luggage23kg: Number(it?.luggage23kg ?? 0),
        luggage10kg: Number(it?.luggage10kg ?? 0),
        ninos: Number(it?.ninos ?? 0),
        ninosMenores9: it?.ninosMenores9 || '',
        isNightTime: !!it?.isNightTime,
        totalPrice: Number(it?.totalPrice || 0),
        payFullNow: !!it?.payFullNow || !!b?.payFullNow,
        depositPercent: (it?.payFullNow || b?.payFullNow)
          ? 100
          : (isTour ? 20 : 10),
        notes: it?.specialRequests,
        // Incluir traducciones si están disponibles
        translations: it?.tourData?.translations || it?.translations || undefined,
      };
    });

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
              
              // 6) Enviar email traducido con el locale actual
              try {
                const contact = j.orders[0]?.contact
                const services = j.orders.flatMap((o: any) => o.services || [])
                
                if (contact?.email && services.length > 0) {
                  // Leer el locale directamente del localStorage para asegurar que es el correcto
                  const currentLocale = (localStorage.getItem('locale') as 'es' | 'en' | 'fr') || 'es'
                  console.log('🌍 [Gracias] Locale del contexto:', locale)
                  console.log('🌍 [Gracias] Locale del localStorage:', currentLocale)
                  
                  await fetch('/api/orders/send-translated-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      paymentId: pid,
                      locale: currentLocale, // 👈 Usar el locale del localStorage directamente
                      contact,
                      services,
                    }),
                  })
                  console.log('✅ Email traducido solicitado en idioma:', currentLocale)
                }
              } catch (emailErr) {
                console.error('Error enviando email traducido:', emailErr)
              }
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

  // Usa órdenes reales si existen; si no, convierte el bundle local a "orders"
  const effectiveOrders: Order[] | null =
    (orders && orders.length > 0)
      ? orders
      : (bundleFallback ? ordersFromBundle(bundleFallback) : null)
  const title = status === 'paid' ? tr.titles.paid : tr.titles.thanks
  const desc = status === 'paid'
    ? tr.descriptions.paid
    : tr.descriptions.pending

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
              <p className="text-muted-foreground">{tr.loading}</p>
            ) : (
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground">{desc}</p>

                {/* Aviso si no hubo pid */}
                {!paymentId && (
                  <div className="p-3 bg-amber-50 border rounded text-amber-800 text-sm">
                    <b>{tr.messages.noPaymentId}</b> {tr.messages.noPaymentIdDetail}
                  </div>
                )}

                {/* Pago */}
                {effectiveOrders && effectiveOrders.length > 0 && effectiveOrders[0]?.payment && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">{tr.sections.payment}</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">{tr.fields.provider}:</span> {effectiveOrders[0].payment?.provider || '—'}</div>
                      <div><span className="text-muted-foreground">{tr.fields.status}:</span> {effectiveOrders[0].payment?.status || status || '—'}</div>
                      <div>
                        <span className="text-muted-foreground">{tr.fields.amountPaid}:</span>{' '}
                        {grandTotal > 0 ? `${fmt1(paidNowTotal)} €` : '—'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{tr.fields.totalAmount}:</span>{' '}
                        {grandTotal > 0 ? `${fmt1(grandTotal)} €` : '—'}
                      </div>
                      <div><span className="text-muted-foreground">{tr.fields.currency}:</span> {effectiveOrders[0].payment?.currency || 'EUR'}</div>
                      <div><span className="text-muted-foreground">{tr.fields.requestedMethod}:</span> {labelRequested(effectiveOrders[0].payment?.requestedMethod)}</div>
                      {effectiveOrders[0].payment?.paymentId && (
                        <div className="sm:col-span-2"><span className="text-muted-foreground">{tr.fields.reference}:</span> {effectiveOrders[0].payment?.paymentId}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contacto */}
                {effectiveOrders && effectiveOrders[0]?.contact && (
                  <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <h2 className="text-xl font-semibold text-primary mb-2">{tr.sections.contact}</h2>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">{tr.fields.name}:</span> {effectiveOrders[0].contact?.name || '—'}</div>
                      <div><span className="text-muted-foreground">{tr.fields.phone}:</span> {effectiveOrders[0].contact?.phone || '—'}</div>
                      <div><span className="text-muted-foreground">{tr.fields.email}:</span> {effectiveOrders[0].contact?.email || '—'}</div>
                      <div>
                        <span className="text-muted-foreground">{tr.fields.referralSource}</span>{' '}
                        {effectiveOrders[0].contact?.referralSource || '—'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Servicios */}
                {effectiveOrders && effectiveOrders.length > 0 ? (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold text-primary">{tr.sections.services}</h2>
                    {effectiveOrders.map((ord) => {
                      const services = (ord.services || []).sort((a, b) => {
                        const dateTimeA = a.date && a.time 
                          ? new Date(`${a.date}T${a.time}`).getTime()
                          : a.date 
                            ? new Date(a.date).getTime()
                            : 0
                        const dateTimeB = b.date && b.time 
                          ? new Date(`${b.date}T${b.time}`).getTime()
                          : b.date 
                            ? new Date(b.date).getTime()
                            : 0
                        return dateTimeA - dateTimeB
                      })
                      if (services.length === 0) return null

                      return services.map((service, idx) => {
                        const total = Number(service.totalPrice || 0)
                        const pct = depositPercentForService(service, ord)
                        const paid = Number((total * pct / 100).toFixed(1))

                        return (
                          <div key={`${ord._id}-${idx}`} className="rounded-lg border bg-white p-4 shadow-sm">
                            <h3 className="text-xl font-semibold text-primary mb-2">
                              {getServiceTitle(service)}
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                              <div><span className="text-muted-foreground">{tr.fields.type}:</span> {service.type || '—'}</div>
                              <div><span className="text-muted-foreground">{tr.fields.date}:</span> {service.date || '—'}</div>
                              <div><span className="text-muted-foreground">{tr.fields.time}:</span> {service.time || '—'}</div>
                              <div><span className="text-muted-foreground">{tr.fields.passengers}:</span> {service.passengers ?? '—'}</div>
                              <div><span className="text-muted-foreground">{tr.fields.children}:</span> {service.ninos ?? 0}</div>
                              {service.ninosMenores9 && (
                                <div className="sm:col-span-2">
                                  <span className="text-muted-foreground">{tr.fields.childrenAges}:</span> {service.ninosMenores9}
                                </div>
                              )}

                              {service.pickupAddress && (
                                <div><span className="text-muted-foreground">{tr.fields.pickup}:</span> {service.pickupAddress}</div>
                              )}
                              {service.dropoffAddress && (
                                <div><span className="text-muted-foreground">{tr.fields.dropoff}:</span> {service.dropoffAddress}</div>
                              )}
                              {service.flightNumber && (
                                <div><span className="text-muted-foreground">{tr.fields.flight}:</span> {service.flightNumber}</div>
                              )}
                              <div><span className="text-muted-foreground">{tr.fields.luggage23}:</span> {service.luggage23kg ?? 0}</div>
                              <div><span className="text-muted-foreground">{tr.fields.luggage10}:</span> {service.luggage10kg ?? 0}</div>
                              {service.notes && (
                                <div className="sm:col-span-2"><span className="text-muted-foreground">{tr.fields.notes}:</span> {service.notes}</div>
                              )}
                            </div>
                            
                            {/* Total y depósito */}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex justify-between items-center font-semibold">
                                <span>{tr.fields.serviceTotal}:</span>
                                <span className="text-lg text-primary">{fmt1(total)} €</span>
                              </div>
                              <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                                <span>{tr.fields.paidNow} ({pct}%):</span>
                                <span className="font-semibold text-foreground">{fmt1(paid)} €</span>
                              </div>
                              {pct < 100 && (
                                <div className="flex justify-between items-center text-sm text-amber-600 mt-1">
                                  <span>{tr.fields.pendingBalance}:</span>
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
                    {tr.messages.noOrders}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/" className="inline-flex px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90">
                {tr.buttons.backHome}
              </Link>
              <Link href="/#contacto" className="inline-flex px-4 py-2 rounded-md bg-accent text-accent-foreground hover:bg-accent/90">
                {tr.buttons.contact}
              </Link>
            </div>

            {status === 'paid' && (
              <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded">
                <b>{tr.messages.checkSpam}</b> {tr.messages.checkSpamDetail}
              </div>
            )}

            {status === 'paid' && (
              <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-800 rounded">
                <p className="font-semibold mb-1">{tr.messages.needChanges}</p>
                <p>{tr.messages.contactWhatsApp} <a href="https://wa.me/33695587787" className="underline font-semibold" target="_blank" rel="noopener noreferrer">+33 6 95 58 77 87</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}