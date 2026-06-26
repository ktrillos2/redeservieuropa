'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '@/contexts/i18n-context'
import { CheckCircle, Clock, Map, Car, MapPin, Users, Mail, Loader2, Calendar } from 'lucide-react'

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
    loading: 'Verificando el estado de tu reserva…',
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
      name: 'Pasajero',
      phone: 'Teléfono',
      email: 'Email',
      referralSource: '¿Dónde nos conociste?',
      type: 'Clase',
      date: 'Fecha',
      time: 'Hora',
      passengers: 'Pasajeros',
      children: 'Niños',
      childrenAges: 'Edades de los niños',
      pickup: 'Origen',
      dropoff: 'Destino',
      flight: 'Vuelo',
      luggage23: 'Maletas 23kg',
      luggage10: 'Maletas 10kg',
      notes: 'Notas Especiales',
      serviceTotal: 'Tarifa Base',
      paidNow: 'Pagado Hoy',
      pendingBalance: 'A Pagar al Conductor',
    },
    messages: {
      noPaymentId: 'No se encontró la reserva en el navegador.',
      noPaymentIdDetail: 'Si volviste directamente a esta página sin pasar por el checkout, no podremos recuperar el pedido.',
      noOrders: 'No se encontraron órdenes todavía para esta referencia. Si acabas de pagar, puede tardar unos segundos en sincronizarse.',
      checkSpam: '¿No ves el correo de confirmación?',
      checkSpamDetail: 'Revisa tu carpeta de SPAM o correo no deseado.',
      needChanges: '¿Necesitas hacer alguna modificación?',
      contactWhatsApp: 'Escríbenos al WhatsApp:',
    },
    buttons: {
      backHome: 'Volver al inicio',
      contact: 'Contactar a Soporte',
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
    loading: 'Verifying your booking status…',
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
      name: 'Passenger',
      phone: 'Phone',
      email: 'Email',
      referralSource: 'How did you hear about us?',
      type: 'Class',
      date: 'Date',
      time: 'Time',
      passengers: 'Passengers',
      children: 'Children',
      childrenAges: 'Children ages',
      pickup: 'Origin',
      dropoff: 'Destination',
      flight: 'Flight',
      luggage23: '23kg Luggage',
      luggage10: '10kg Luggage',
      notes: 'Special Notes',
      serviceTotal: 'Base Fare',
      paidNow: 'Paid Today',
      pendingBalance: 'To Pay Driver',
    },
    messages: {
      noPaymentId: 'Booking reference not found in browser.',
      noPaymentIdDetail: 'If you came directly to this page without going through checkout, we cannot retrieve the order.',
      noOrders: 'No orders found yet for this reference. If you just paid, it may take a few seconds to sync.',
      checkSpam: 'Don\'t see the confirmation email?',
      checkSpamDetail: 'Check your SPAM or junk folder.',
      needChanges: 'Need to make any changes?',
      contactWhatsApp: 'Contact us on WhatsApp:',
    },
    buttons: {
      backHome: 'Back to home',
      contact: 'Contact Support',
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
    loading: 'Vérification de l\'état de votre réservation…',
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
      name: 'Passager',
      phone: 'Téléphone',
      email: 'Email',
      referralSource: 'Comment nous avez-vous connu ?',
      type: 'Classe',
      date: 'Date',
      time: 'Heure',
      passengers: 'Passagers',
      children: 'Enfants',
      childrenAges: 'Âges des enfants',
      pickup: 'Origine',
      dropoff: 'Destination',
      flight: 'Vol',
      luggage23: 'Bagages 23kg',
      luggage10: 'Bagages 10kg',
      notes: 'Notes Spéciales',
      serviceTotal: 'Tarif de Base',
      paidNow: 'Payé Aujourd\'hui',
      pendingBalance: 'À Payer au Chauffeur',
    },
    messages: {
      noPaymentId: 'Référence de réservation introuvable dans le navigateur.',
      noPaymentIdDetail: 'Si vous êtes arrivé directement sur cette page sans passer par le paiement, nous ne pouvons pas récupérer la commande.',
      noOrders: 'Aucune commande trouvée pour cette référence. Si vous venez de payer, cela peut prendre quelques secondes pour se synchroniser.',
      checkSpam: 'Vous ne voyez pas l\'email de confirmation ?',
      checkSpamDetail: 'Vérifiez votre dossier SPAM ou courrier indésirable.',
      needChanges: 'Besoin de modifier votre réservation ?',
      contactWhatsApp: 'Contactez-nous sur WhatsApp :',
    },
    buttons: {
      backHome: 'Retour à l\'accueil',
      contact: 'Contacter le Support',
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
  addons?: {
    boatTickets?: number
    boatTicketsPrice?: number
  }
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
    if (isTour && it?.tourData) {
      let translatedTitle = it.tourData.title; 
      if (locale === 'en' && it.tourData.translations?.en?.title) {
        translatedTitle = it.tourData.translations.en.title;
      } else if (locale === 'fr' && it.tourData.translations?.fr?.title) {
        translatedTitle = it.tourData.translations.fr.title;
      }
      return translatedTitle;
    }

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

    if (isTour && it?.tourTitle) {
      return it.tourTitle;
    }

    return it?.transferTitle || 
           it?.tourData?.title || 
           it?.label ||
           it?.serviceLabel ||
           it?.serviceSubLabel ||
           (isTour ? 'Tour' : 'Traslado')
  }

  // Helper para obtener título traducido de un servicio ya guardado
  const getServiceTitle = (service: any): string => {
    if (service?.translations) {
      if (locale === 'en' && service.translations.en?.title) {
        return service.translations.en.title
      }
      if (locale === 'fr' && service.translations.fr?.title) {
        return service.translations.fr.title
      }
    }
    return service?.title || service?.type || 'Servicio'
  }

  const sumTotalServices = (list: Order[] | null) =>
    (list || []).reduce((a, o) => a + (o.services || []).reduce((s, srv) => s + Number(srv.totalPrice || 0), 0), 0)

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
    
    const allServices = b.items.map((it: any) => {
      const isTour = Boolean(
        it.isEvent ||
        it.quickType === 'tour' ||
        it.isTourQuick === true ||
        it.tipoReserva === 'tour' ||
        it.tourId ||
        it.tourData ||
        it.selectedTourSlug
      );
      
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
        depositPercent: (it?.payFullNow || b?.payFullNow) ? 100 : (isTour ? 20 : 10),
        notes: it?.specialRequests,
        translations: it?.tourData?.translations || it?.translations || undefined,
      };
    });

    return [{
      _id: 'local-bundle',
      orderNumber: b?.orderNumber || 'PENDING',
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
      services: allServices,
      addons: b?.addons
    }]
  }

  // ===== Efecto principal =====
  useEffect(() => {
    let pid: string | null = null
    try { pid = localStorage.getItem('lastPaymentId') } catch {}

    if (!pid && typeof window !== 'undefined') {
      const qs = new URLSearchParams(window.location.search)
      const qpid = qs.get('pid')
      if (qpid) {
        pid = qpid
        try { localStorage.setItem('lastPaymentId', qpid) } catch {}
      }
    }

    if (!pid) {
      try {
        const raw = localStorage.getItem('lastCheckoutPayload')
        if (raw) setBundleFallback(JSON.parse(raw))
      } catch {}
      setLoading(false)
      return
    }

    setPaymentId(pid)

    if (hasSyncedRef.current) return
    hasSyncedRef.current = true

    fetch(`/api/mollie/status?id=${encodeURIComponent(pid)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => setStatus(json?.status || null))
      .catch(() => setStatus(null))
      .finally(async () => {
        try {
          await fetch('/api/orders/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: pid }),
          })

          const resp = await fetch(`/api/orders/by-payment?id=${encodeURIComponent(pid)}`)
          if (resp.ok) {
            const j = await resp.json()
            if (j.orders && Array.isArray(j.orders) && j.orders.length > 0) {
              setOrders(j.orders)
              if (j.orders[0]?.payment?.status) setStatus(j.orders[0].payment.status)
              
              try {
                const contact = j.orders[0]?.contact
                const services = j.orders.flatMap((o: any) => o.services || [])
                
                if (contact?.email && services.length > 0) {
                  const currentLocale = (localStorage.getItem('locale') as 'es' | 'en' | 'fr') || 'es'
                  await fetch('/api/orders/send-translated-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      paymentId: pid,
                      locale: currentLocale,
                      contact,
                      services,
                    }),
                  })
                }
              } catch (emailErr) {
                console.error('Error enviando email traducido:', emailErr)
              }
            } else {
              try {
                const raw = localStorage.getItem('lastCheckoutPayload')
                if (raw) setBundleFallback(JSON.parse(raw))
              } catch {}
            }
          } else {
            try {
              const raw = localStorage.getItem('lastCheckoutPayload')
              if (raw) setBundleFallback(JSON.parse(raw))
            } catch {}
          }
        } catch (e) {
          try {
            const raw = localStorage.getItem('lastCheckoutPayload')
            if (raw) setBundleFallback(JSON.parse(raw))
          } catch {}
        }
        setLoading(false)
      })
  }, [])

  const effectiveOrders: Order[] | null =
    (orders && orders.length > 0)
      ? orders
      : (bundleFallback ? ordersFromBundle(bundleFallback) : null)
      
  const title = status === 'paid' ? tr.titles.paid : tr.titles.thanks
  const desc = status === 'paid'
    ? tr.descriptions.paid
    : tr.descriptions.pending

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-grow pt-28 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          
          {/* Header Hero */}
          <div className="text-center space-y-4 mb-10">
            {status === 'paid' ? (
              <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <CheckCircle className="w-10 h-10" />
              </div>
            ) : (
              <div className="mx-auto w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Clock className="w-10 h-10" />
              </div>
            )}
            <h1 className="text-3xl md:text-5xl font-serif text-[#4A0E0E] uppercase font-bold tracking-wider">{title}</h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">{desc}</p>
          </div>

          {/* Warnings */}
          {status === 'paid' && (
            <div className="bg-[#4A0E0E]/5 border border-[#4A0E0E]/20 text-[#4A0E0E] p-4 rounded-xl mb-10 flex gap-4 text-sm md:text-base items-center max-w-2xl mx-auto shadow-sm">
              <Mail className="w-6 h-6 shrink-0 text-[#4A0E0E]" />
              <div>
                <strong>{tr.messages.checkSpam}</strong> <br className="hidden md:block" />
                {tr.messages.checkSpamDetail}
              </div>
            </div>
          )}

          {!paymentId && (
            <div className="p-4 bg-amber-50 border rounded-xl text-amber-800 text-sm mb-10 max-w-2xl mx-auto">
              <b>{tr.messages.noPaymentId}</b> {tr.messages.noPaymentIdDetail}
            </div>
          )}

          {/* Boarding Passes */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#4A0E0E]" />
              <span className="ml-3 text-lg text-muted-foreground font-medium">{tr.loading}</span>
            </div>
          ) : effectiveOrders && effectiveOrders.length > 0 ? (
            <div className="space-y-12 pb-10">
              {effectiveOrders.map((ord, oIdx) => {
                const services = (ord.services || []).sort((a, b) => {
                  const dateTimeA = a.date && a.time ? new Date(`${a.date}T${a.time}`).getTime() : a.date ? new Date(a.date).getTime() : 0
                  const dateTimeB = b.date && b.time ? new Date(`${b.date}T${b.time}`).getTime() : b.date ? new Date(b.date).getTime() : 0
                  return dateTimeA - dateTimeB
                })
                if (services.length === 0 && !ord.addons?.boatTickets) return null

                const renderedServices = services.map((service, sIdx) => {
                  const total = Number(service.totalPrice || 0)
                  const pct = depositPercentForService(service, ord)
                  const paid = Number((total * pct / 100).toFixed(1))
                  const isTour = service.type === 'tour'

                  return (
                    <div key={`${ord._id}-${sIdx}`} className="relative mx-auto w-full max-w-3xl filter drop-shadow-xl flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden">
                      
                      {/* LEFT SECTION */}
                      <div className="relative flex-1 p-6 md:p-8 bg-white md:border-r-[2px] md:border-dashed md:border-gray-300">
                        
                        {/* Desktop Notches */}
                        <div className="hidden md:block absolute -top-4 -right-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner border border-transparent"></div>
                        <div className="hidden md:block absolute -bottom-4 -right-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner border border-transparent"></div>

                        {/* Header of Ticket */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                          <div className="flex items-center gap-4">
                             <div className="bg-[#4A0E0E] text-white p-3 rounded-xl shadow-sm">
                                {isTour ? <Map className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                             </div>
                             <div>
                               <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                                  {isTour ? 'Tour' : 'Traslado'}
                               </p>
                               <p className="font-serif font-bold text-[#4A0E0E] text-xl leading-tight">
                                  {getServiceTitle(service)}
                               </p>
                             </div>
                          </div>
                          <div className="sm:text-right bg-slate-50 px-3 py-1.5 rounded-lg border">
                             <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">Booking Ref</p>
                             <p className="font-mono font-bold text-[#4A0E0E] text-sm">
                               {ord.orderNumber || ord._id.slice(-6).toUpperCase()}
                             </p>
                          </div>
                        </div>

                        {/* Route Info */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#4A0E0E]/5 p-5 rounded-2xl mb-8 gap-4 border border-[#4A0E0E]/10">
                          <div className="flex-1 w-full">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.pickup}</p>
                            <p className="font-bold text-[#4A0E0E] text-base md:text-lg leading-tight flex items-start gap-2">
                              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#4A0E0E]/50" />
                              {service.pickupAddress || '—'}
                            </p>
                          </div>
                          
                          <div className="hidden md:flex flex-col items-center px-4">
                            <div className="w-8 h-0.5 bg-[#4A0E0E]/20 mb-1"></div>
                            {isTour ? <Map className="w-5 h-5 text-[#4A0E0E] opacity-40" /> : <Car className="w-5 h-5 text-[#4A0E0E] opacity-40" />}
                            <div className="w-8 h-0.5 bg-[#4A0E0E]/20 mt-1"></div>
                          </div>

                          <div className="flex-1 w-full text-left md:text-right">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.dropoff}</p>
                            <p className="font-bold text-[#4A0E0E] text-base md:text-lg leading-tight flex items-start gap-2 md:justify-end">
                              <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#4A0E0E]/50 md:hidden" />
                              {service.dropoffAddress || '—'}
                            </p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.date}</p>
                            <p className="font-semibold text-gray-800 text-base">{service.date || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.time}</p>
                            <p className="font-semibold text-gray-800 text-base">{service.time || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.passengers}</p>
                            <p className="font-semibold text-gray-800 flex items-center gap-1.5 text-base">
                               <Users className="w-4 h-4 text-muted-foreground" /> {service.passengers ?? '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.children}</p>
                            <p className="font-semibold text-gray-800 text-base">{service.ninos ?? 0}</p>
                          </div>
                        </div>

                        {/* Optional Info */}
                        {(service.flightNumber || service.luggage23kg > 0 || service.luggage10kg > 0 || service.notes) && (
                          <div className="grid grid-cols-2 gap-6 border-t border-gray-100 pt-6 mt-2">
                            {service.flightNumber && (
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.flight}</p>
                                <p className="font-semibold text-gray-800">{service.flightNumber}</p>
                              </div>
                            )}
                            {(service.luggage23kg > 0 || service.luggage10kg > 0) && (
                              <div className="flex gap-6">
                                {service.luggage23kg > 0 && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.luggage23}</p>
                                    <p className="font-semibold text-gray-800">{service.luggage23kg}</p>
                                  </div>
                                )}
                                {service.luggage10kg > 0 && (
                                  <div>
                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.luggage10}</p>
                                    <p className="font-semibold text-gray-800">{service.luggage10kg}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {service.notes && (
                              <div className="col-span-2">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{tr.fields.notes}</p>
                                <p className="font-medium text-gray-600 text-sm">{service.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* RIGHT SECTION */}
                      <div className="relative w-full md:w-72 bg-[#4A0E0E] text-white p-6 md:p-8 flex flex-col justify-between overflow-hidden">
                        
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

                        {/* Mobile Notches */}
                        <div className="block md:hidden absolute -top-4 -left-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner border border-transparent"></div>
                        <div className="block md:hidden absolute -bottom-4 -left-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner border border-transparent"></div>

                        <div className="relative z-10">
                           <div className="mb-8">
                             <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">{tr.fields.name}</p>
                             <p className="font-bold text-xl uppercase tracking-wide truncate" title={ord.contact?.name || '—'}>
                               {ord.contact?.name || '—'}
                             </p>
                           </div>

                           <div className="space-y-4">
                             <div className="flex justify-between items-center border-b border-white/10 pb-3">
                               <span className="text-xs text-white/70 uppercase tracking-wider">{tr.fields.serviceTotal}</span>
                               <span className="font-semibold text-lg">{fmt1(total)} €</span>
                             </div>
                             <div className="flex justify-between items-center border-b border-white/10 pb-3">
                               <span className="text-xs text-white/70 uppercase tracking-wider">{tr.fields.paidNow}</span>
                               <span className="font-bold text-yellow-400 text-xl">{fmt1(paid)} €</span>
                             </div>
                             {pct < 100 && (
                               <div className="flex justify-between items-center pt-1">
                                 <span className="text-xs text-white/70 uppercase tracking-wider">{tr.fields.pendingBalance}</span>
                                 <span className="font-bold text-white text-lg">{fmt1(total - paid)} €</span>
                               </div>
                             )}
                           </div>
                        </div>

                        <div className="mt-10 text-center relative z-10">
                           {/* Simulated Barcode */}
                           <div className="h-12 w-full opacity-90 mix-blend-screen bg-white rounded-sm" style={{
                             backgroundImage: 'repeating-linear-gradient(90deg, #4A0E0E, #4A0E0E 2px, transparent 2px, transparent 4px, #4A0E0E 4px, #4A0E0E 5px, transparent 5px, transparent 8px, #4A0E0E 8px, #4A0E0E 12px, transparent 12px, transparent 14px)'
                           }}></div>
                           <p className="text-[10px] uppercase tracking-widest mt-3 text-white/50 font-mono">
                              {paymentId || 'NO-REF-ID'}
                           </p>
                        </div>

                      </div>
                    </div>
                  )
                })

                const addonsBlock = ord.addons?.boatTickets ? (
                  <div key={`addons-${ord._id}`} className="relative mx-auto w-full max-w-3xl filter drop-shadow-xl flex flex-col md:flex-row bg-amber-50 rounded-2xl overflow-hidden mt-6 border border-amber-200">
                    <div className="flex-1 p-6 md:p-8">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-amber-600 text-white p-3 rounded-xl shadow-sm text-2xl flex items-center justify-center">
                          🎟️
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                            Adicionales Adquiridos
                          </p>
                          <p className="font-serif font-bold text-amber-900 text-xl leading-tight">
                            Boletas de barquito por el Sena
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-amber-800">
                        Cantidad: <b>{ord.addons.boatTickets}</b> boletas<br/>
                        Expiran en 1 año. Tú eliges cuándo usarlas de 9:00 am a 22:30.<br/>
                        Pronto nos pondremos en contacto para enviártelas.
                      </p>
                    </div>
                    <div className="relative w-full md:w-72 bg-amber-600 text-white p-6 md:p-8 flex flex-col justify-center items-center">
                       <p className="text-xs text-white/80 uppercase tracking-wider mb-2">Total Adicionales</p>
                       <span className="font-bold text-white text-3xl">{fmt1(ord.addons.boatTicketsPrice || 0)} €</span>
                    </div>
                  </div>
                ) : null;

                return (
                  <div key={`wrap-${ord._id}`} className="space-y-6">
                    {renderedServices}
                    {addonsBlock}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-6 bg-amber-50 border rounded-2xl text-amber-800 text-center shadow-sm max-w-2xl mx-auto">
              <p className="text-lg font-medium">{tr.messages.noOrders}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Link href="/" className="inline-flex justify-center items-center px-8 py-3.5 rounded-xl bg-[#4A0E0E] text-white hover:bg-[#3A0B0B] font-bold tracking-wide transition-all shadow-md hover:shadow-lg w-full sm:w-auto text-sm uppercase">
              {tr.buttons.backHome}
            </Link>
            <a href="https://wa.me/33695587787" target="_blank" rel="noopener noreferrer" className="inline-flex justify-center items-center px-8 py-3.5 rounded-xl bg-white border-2 border-[#4A0E0E] text-[#4A0E0E] hover:bg-slate-50 font-bold tracking-wide transition-all shadow-sm hover:shadow-md w-full sm:w-auto text-sm uppercase">
              {tr.buttons.contact}
            </a>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  )
}