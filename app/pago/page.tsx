"use client"

// Mapa de etiquetas amigables para mostrar en los labels
const labelMap = {
  cdg: "Aeropuerto CDG",
  orly: "Aeropuerto Orly",
  beauvais: "Aeropuerto Beauvais",
  paris: "París Centro",
  disneyland: "Disneyland",
  asterix: "Parc Astérix",
  versailles: "Versalles",
};
    // idaYVuelta removed: round-trip option deprecated
    // Removed idaYVuelta from modalForm initialization
    // Removed idaYVuelta from bookingData

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, CheckCircle, CreditCard, Shield, Clock, MapPin, Users, Luggage, Map, Car, Plane, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useEffect, useRef, useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { calcBaseTransferPrice, isNightTime as pricingIsNightTime, getAvailableDestinations as pricingGetAvailableDestinations } from "@/lib/pricing"
import { formatPhonePretty, ensureLeadingPlus } from "@/lib/utils"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { PhoneInputIntl } from '@/components/ui/phone-input';
import { EmailAutocomplete } from '@/components/ui/email-autocomplete';

export default function PaymentPage() {
  const [destino, setDestino] = useState<any>(null)
  const [bookingData, setBookingData] = useState<any>(null)
  // Guardar origen/destino al cargar la página (por ejemplo después de redirigir desde la cotización)
  const [savedOriginOnLoad, setSavedOriginOnLoad] = useState<string | null>(null)
  const [savedDestinationOnLoad, setSavedDestinationOnLoad] = useState<string | null>(null)
  // Ref para indicar que el flujo de "ida y vuelta" fue iniciado desde el botón "Aquí"
  const returnInitiatedRef = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [payFullNow, setPayFullNow] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  // Direcciones específicas del pago (información adicional, no reemplazan la dirección del servicio)
  const [paymentPickupAddress, setPaymentPickupAddress] = useState<string>('')
  const [paymentDropoffAddress, setPaymentDropoffAddress] = useState<string>('')
  // Mapa de errores por campo para resaltar inputs faltantes
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  // Carrito de cotizaciones (traslados / tours añadidos)
  const [carritoState, setCarritoState] = useState<any[]>([])
  const { toast } = useToast()
  // Modal para crear/editar cotización (pasos)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [modalEditingId, setModalEditingId] = useState<number | null>(null)
  const [modalStep, setModalStep] = useState(1)
  const [modalForm, setModalForm] = useState<any>(() => ({
    tipo: 'traslado',
    origen: '',
    destino: '',
    pickupAddress: '',
    dropoffAddress: '',
    date: '',
    time: '',
    passengers: '1',
    ninos: 0,
    vehicle: 'coche',
       // idaYVuelta removed
    selectedTourSlug: '',
    categoriaTour: '',
    subtipoTour: '',
    flightNumber: '',
    totalPrice: 0,
    contactName: '',
    contactPhone: '',
    contactEmail: '',
  }))
  // Errores locales para el modal (validación por paso)
  const [modalFieldErrors, setModalFieldErrors] = useState<Record<string,string>>({})

  // Lista de tours para los selects dentro del modal (cargada desde API)
  const [toursList, setToursList] = useState<Array<{title:string;slug?:string}>>([])

  useEffect(() => {
    let mounted = true;
    fetch('/api/tours')
      .then(res => res.json())
      .then((data) => { if (mounted) setToursList(data?.tours || []) })
      .catch(() => {});
    return () => { mounted = false };
  }, []);

  // Cuando bookingData se carga, guardar origen/destino en variables separadas
  useEffect(() => {
    if (!bookingData) return;
      // detectar distintos nombres de campo que pueden contener origen/destino
      const o = bookingData.origen ?? bookingData.origin ?? bookingData.pickupAddress ?? bookingData.from ?? ''
      const d = bookingData.destino ?? bookingData.destination ?? bookingData.dropoffAddress ?? bookingData.to ?? ''
      setSavedOriginOnLoad(o || null)
      setSavedDestinationOnLoad(d || null)
      console.log('Saved origin/destination on load:', { o, d })
      // debug: mostrar keys disponibles en bookingData para diagnostico
      try {
        console.log('bookingData keys:', Object.keys(bookingData))
      } catch (err) {}
  }, [bookingData])

  // Exponer en el body un atributo cuando el modal de cotización esté abierto
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (quoteModalOpen) document.body.setAttribute('data-quote-modal', 'open')
    else document.body.removeAttribute('data-quote-modal')
  }, [quoteModalOpen])

  // Fallbacks y helpers para la sección copiada del hero
  const bookingForm: any = useMemo(() => ({
    dateField: { label: 'Fecha' },
    timeField: { label: 'Hora' },
    passengersField: { label: 'Pasajeros', singular: 'Pasajero', plural: 'Pasajeros' },
    vehicleField: { label: 'Tipo de vehículo', labelCoche: 'Coche (4 personas)', labelMinivan: 'Minivan (6 pasajeros)', labelVan: 'Van (8 pasajeros)' },
    notes: { minivan6: 'Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero.', minivan5: 'Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg.' },
  }), [])

  const minDateStr = useMemo(() => new Date().toISOString().slice(0,10), [])

  const parsePassengers = (paxStr: any) => {
    const n = parseInt(String(paxStr || ''), 10)
    if (!Number.isFinite(n)) return 1
    return Math.min(56, Math.max(1, n))
  }

  const getVehicleCap = (_v?: string) => {
    const caps: Record<string, number> = { coche: 4, minivan: 6, van: 8 }
    return caps[_v || 'coche'] || 56
  }

  // Helper: intentar convertir un valor (etiqueta completa o dirección) a la clave usada en labelMap
  const getLocationKeyFromValue = (v?: string) => {
    if (!v) return ''
    const val = String(v).trim()
    const low = val.toLowerCase()
    // si ya es una clave
    if (Object.keys(labelMap).includes(val)) return val
    // buscar coincidencia exacta en labels
    const exact = Object.keys(labelMap).find(k => (labelMap[k as keyof typeof labelMap] || '').toLowerCase() === low)
    if (exact) return exact
    // buscar por inclusión (p.ej. 'cdg' en 'Aeropuerto CDG' o 'paris' en 'París')
    const incl = Object.keys(labelMap).find(k => low.includes(k) || (labelMap[k as keyof typeof labelMap] || '').toLowerCase().includes(low) || (labelMap[k as keyof typeof labelMap] || '').toLowerCase().includes(k))
    return incl || ''
  }

  const availableDestinations = useMemo(() => {
    try {
      // derivar destinos disponibles según el origen seleccionado en el modal
      const from = modalForm?.origen
      return pricingGetAvailableDestinations(from)
    } catch {
      return []
    }
  }, [modalForm?.origen])

  const openNewQuoteModal = () => {
    // Rellenar el modal con los datos actuales de la página de pago
    setModalForm({
      tipo: bookingData?.isEvent ? 'tour' : (bookingData?.tipoReserva || 'traslado'),
      origen: bookingData?.origen || '',
      destino: bookingData?.destino || '',
      pickupAddress: paymentPickupAddress || bookingData?.pickupAddress || '',
      dropoffAddress: paymentDropoffAddress || bookingData?.dropoffAddress || '',
      date: bookingData?.date || bookingData?.fecha || '',
      time: bookingData?.time || bookingData?.hora || '',
      passengers: String(bookingData?.passengers || bookingData?.pasajeros || 1),
      ninos: bookingData?.ninos || 0,
      vehicle: bookingData?.vehicle || bookingData?.vehiculo || 'coche',
      selectedTourSlug: bookingData?.selectedTourSlug || '',
      categoriaTour: bookingData?.categoriaTour || '',
      subtipoTour: bookingData?.subtipoTour || '',
      flightNumber: bookingData?.flightNumber || '',
      totalPrice: Number(bookingData?.totalPrice || total || 0),
      contactName: bookingData?.contactName || '',
      contactPhone: bookingData?.contactPhone || '',
      contactEmail: bookingData?.contactEmail || '',
    })
    setModalEditingId(null)
    setModalStep(1)
    setQuoteModalOpen(true)
  }

  // Nueva función: abrir modal con origen y destino intercambiados (ida y vuelta)
  const openReturnQuoteModal = () => {
  // marcar que iniciamos el flujo de ida y vuelta
  returnInitiatedRef.current = true
  console.log('[openReturnQuoteModal] returnInitiatedRef set to true')
  // Construir valores usando saved variables si existen, o fallback a pickup/dropoff
  const currentOrigin = savedOriginOnLoad ?? bookingData?.origen ?? bookingData?.origin ?? bookingData?.pickupAddress ?? ''
  const currentDestination = savedDestinationOnLoad ?? bookingData?.destino ?? bookingData?.destination ?? bookingData?.dropoffAddress ?? ''
  const invertedData = {
    tipo: bookingData?.isEvent ? 'tour' : (bookingData?.tipoReserva || 'traslado'),
  // --- LÓGICA DE INVERSIÓN ---
  // Convertir a claves que usa el Select (p.ej. 'cdg', 'paris') si es posible
  origen: getLocationKeyFromValue(currentDestination) || currentDestination || '',
  destino: getLocationKeyFromValue(currentOrigin) || currentOrigin || '',
  // También rellenar las direcciones exactas intercambiadas
  pickupAddress: bookingData?.dropoffAddress || paymentDropoffAddress || '',
  dropoffAddress: bookingData?.pickupAddress || paymentPickupAddress || '',
    // --- FIN DE LÓGICA ---
    date: bookingData?.date || bookingData?.fecha || '',
    time: bookingData?.time || bookingData?.hora || '',
    passengers: String(bookingData?.passengers || bookingData?.pasajeros || 1),
    ninos: bookingData?.ninos || 0,
    vehicle: bookingData?.vehicle || bookingData?.vehiculo || bookingData?.vehicleType || 'coche',
    selectedTourSlug: bookingData?.selectedTourSlug || '',
    categoriaTour: bookingData?.categoriaTour || '',
    subtipoTour: bookingData?.subtipoTour || '',
    flightNumber: bookingData?.flightNumber || '',
    totalPrice: Number(bookingData?.totalPrice || total || 0),
    contactName: bookingData?.contactName || '',
    contactPhone: bookingData?.contactPhone || '',
    contactEmail: bookingData?.contactEmail || '',
    luggage23kg: bookingData?.luggage23kg ?? 0,
    luggage10kg: bookingData?.luggage10kg ?? 0,
    specialRequests: bookingData?.specialRequests || '',
  };

  // --- DEBUG ---
  console.log('--- DEBUG: Botón "aquí" (Ida y Vuelta) ---');
  console.log('Datos Originales:', { origen: modalForm?.origen, destino: modalForm?.destino });
  console.log('Datos Invertidos para el Modal:', { origen: invertedData.origen, destino: invertedData.destino });
  
  setModalForm(invertedData);
  setModalEditingId(null);
  setModalStep(1);
  setQuoteModalOpen(true);
}

  const openEditModal = (item: any) => {
    setModalForm({
      tipo: item.tipo || 'traslado',
      origen: item.origen || '',
      destino: item.destino || '',
      pickupAddress: item.pickupAddress || '',
      dropoffAddress: item.dropoffAddress || '',
      date: item.date || '',
      time: item.time || '',
  passengers: String(item.passengers || 1),
      ninos: item.ninos || 0,
      vehicle: item.vehicle || 'coche',
         // idaYVuelta removed
      selectedTourSlug: item.selectedTourSlug || '',
      categoriaTour: item.categoriaTour || '',
      subtipoTour: item.subtipoTour || '',
      flightNumber: item.flightNumber || '',
      totalPrice: Number(item.totalPrice || 0),
      contactName: item.contactName || '',
      contactPhone: item.contactPhone || '',
      contactEmail: item.contactEmail || '',
    })
    setModalEditingId(item.id)
    setModalStep(1)
    setQuoteModalOpen(true)
  }

  // Calcular precio automático para traslados dentro del modal cuando cambian campos relevantes
  const computeModalPrice = (mf: any) => {
    try {
      if (!mf) return 0
      if (mf.tipo !== 'traslado') return mf.totalPrice || 0
      // intentar deducir códigos desde origen/destino (si el usuario seleccionó etiqueta)
      const normalize = (v: string | undefined) => {
        if (!v) return undefined
        const low = String(v).toLowerCase()
        if (Object.keys(labelMap).includes(low)) return low
        // si el usuario puso un texto que contiene 'cdg'/'orly' etc.
        if (low.includes('cdg')) return 'cdg'
        if (low.includes('orly')) return 'orly'
        if (low.includes('beauvais') || low.includes('bva')) return 'beauvais'
        if (low.includes('disney')) return 'disneyland'
        if (low.includes('paris') || low.includes('parís')) return 'paris'
        return undefined
      }
      const from = normalize(mf.origen) || normalize(mf.pickupAddress)
      const to = normalize(mf.destino) || normalize(mf.dropoffAddress)
      const pax = Math.max(1, Number(mf.passengers || 1))
      const baseCalc = calcBaseTransferPrice(from, to, pax)
      const base = typeof baseCalc === 'number' ? baseCalc : Number(mf.basePrice || 0)
      const isNight = (() => {
        if (!mf.time) return false
        const [hh] = String(mf.time).split(':').map(Number)
        const h = hh || 0
        return h >= 21 || h < 6
      })()
          const extraLuggage = Number(mf.luggage23kg ?? 0) > 3
      const extrasSum = (isNight ? 5 : 0) + (extraLuggage ? 10 : 0)
      const total = Number((base + extrasSum).toFixed(2))
      return total
    } catch {
      return mf.totalPrice || 0
    }
  }

  // Mantener total calculado cuando cambian campos relevantes
  useEffect(() => {
    try {
      const total = computeModalPrice(modalForm)
      setModalForm((s:any) => ({ ...s, totalPrice: total, basePrice: s.basePrice || undefined }))
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalForm.tipo, modalForm.origen, modalForm.destino, modalForm.pickupAddress, modalForm.dropoffAddress, modalForm.time, modalForm.passengers, modalForm.luggage23kg, modalForm.luggage10kg])

  // Validación por paso del modal
  const validateModalStep = (step: number) : { valid: boolean; errors: Record<string,string> } => {
    const errs: Record<string,string> = {}
    const mf = modalForm || {}
    // Step 1: tipo presente
    if (step === 1) {
      if (!mf.tipo) errs.tipo = 'Selecciona tipo'
      return { valid: Object.keys(errs).length === 0, errors: errs }
    }
    // Step 2: Campos principales (origen/destino/fecha/hora/pasajeros/vehículo)
    if (step === 2) {
      // Campos comunes que deben existir antes de avanzar
      const passengers = mf.passengers || mf.pasajeros
      if (!passengers || Number(passengers) < 1) errs.passengers = 'Requerido'
      if (!mf.time || String(mf.time).trim() === '') errs.time = 'Requerido'
      if (!mf.date || String(mf.date).trim() === '') errs.date = 'Requerido'
      if (!mf.vehicle && !mf.vehiculo) errs.vehicle = 'Requerido'

      if (mf.tipo === 'traslado') {
        // Para traslados: origen y destino son obligatorios
        if (!mf.origen) errs.origen = 'Requerido'
        if (!mf.destino) errs.destino = 'Requerido'
      }

      if (mf.tipo === 'tour') {
        // para tours: asegurar que haya una selección o categoría
        if (!mf.selectedTourSlug && !mf.categoriaTour && !mf.subtipoTour) errs.selectedTourSlug = 'Selecciona un tour o categoría'
      }

      return { valid: Object.keys(errs).length === 0, errors: errs }
    }
    // Step 3: Información de contacto + comprobaciones finales (fecha/hora/pasajeros)
      // Step 3: Información de contacto (separado del paso de direcciones)
      if (step === 3) {
        if (!mf.contactName || String(mf.contactName).trim() === '') errs.contactName = 'Requerido'
        if (!mf.contactPhone || String(mf.contactPhone).trim() === '') errs.contactPhone = 'Requerido'
        if (!mf.contactEmail || String(mf.contactEmail).trim() === '') errs.contactEmail = 'Requerido'
        else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
          if (!emailRegex.test(String(mf.contactEmail))) errs.contactEmail = 'Formato inválido'
        }
        return { valid: Object.keys(errs).length === 0, errors: errs }
      }
      // Step 4: Direcciones y equipaje (final) + comprobaciones finales (fecha/hora/pasajeros)
      if (step === 4) {
        if (mf.tipo === 'traslado') {
          if (!mf.pickupAddress || String(mf.pickupAddress).trim() === '') errs.pickupAddress = 'Requerido'
          if (!mf.dropoffAddress || String(mf.dropoffAddress).trim() === '') errs.dropoffAddress = 'Requerido'
          // Allow luggage counts to be zero or omitted; do not require explicit luggage fields here
        }
        const passengers = mf.passengers || mf.pasajeros
        const date = mf.date || mf.fecha
        const time = mf.time || mf.hora
        if (!passengers || Number(passengers) < 1) errs.passengers = 'Requerido'
        if (!date || !String(date).trim()) errs.date = 'Requerido'
        if (!time || !String(time).trim()) errs.time = 'Requerido'
        return { valid: Object.keys(errs).length === 0, errors: errs }
      }
    return { valid: true, errors: {} }
  }

  const handleModalNext = () => {
    const { valid, errors } = validateModalStep(modalStep)
    if (!valid) {
      setModalFieldErrors(errors)
      // focus first field
      const first = Object.keys(errors)[0]
      requestAnimationFrame(() => {
        const selector = `[data-modal-field="${first}"]`
        const el = document.querySelector(selector) as HTMLElement | null
        if (el) el.focus()
      })
      return
    }
    // limpiar errores del paso actual
    setModalFieldErrors({})
    setModalStep((s) => Math.min(4, s + 1))
  }

  const handleModalSave = (isEdit = false) => {
    const { valid, errors } = validateModalStep(4)
    if (!valid) {
      setModalFieldErrors(errors)
      requestAnimationFrame(() => {
        const first = Object.keys(errors)[0]
        const selector = `[data-modal-field="${first}"]`
        const el = document.querySelector(selector) as HTMLElement | null
        if (el) el.focus()
      })
      return
    }
    setModalFieldErrors({})
    if (isEdit) {
      updateExistingItem()
    } else {
      saveModalAsNew()
    }
    return true
  }

  const persistCarrito = (next: any[]) => {
    try { localStorage.setItem('carritoCotizaciones', JSON.stringify(next)) } catch {}
    setCarritoState(next)
  }

  const removeCartItem = (id: number) => {
    try {
      const next = carritoState.filter(it => it.id !== id)
      persistCarrito(next)
      toast({ title: 'Eliminado', description: 'Cotización eliminada del carrito.' })
    } catch (e) {
      console.error('No se pudo eliminar item del carrito', e)
    }
  }

  const saveModalAsNew = () => {
    // Construir la etiqueta visible del servicio usando las ubicaciones generales (labelMap)
    let serviceLabel = 'Traslado'
    if (modalForm.tipo === 'tour') {
      serviceLabel = 'Tour'
    } else {
      const originLabel = modalForm.origen ? (labelMap[modalForm.origen as keyof typeof labelMap] || modalForm.origen) : (modalForm.pickupAddress || '')
      const destLabel = modalForm.destino ? (labelMap[modalForm.destino as keyof typeof labelMap] || modalForm.destino) : (modalForm.dropoffAddress || '')
      
      if (originLabel || destLabel) serviceLabel = `${originLabel}${originLabel && destLabel ? ' → ' : ''}${destLabel}`
    }

    const item = {
      id: Date.now(),
      tipo: modalForm.tipo,
      // serviceLabel muestra la ubicación general (Aeropuerto CDG, París Centro, etc.)
      serviceLabel,
      origen: modalForm.origen || '',
      destino: modalForm.destino || '',
      // pickup/dropoff mantienen la dirección exacta como detalle adicional
      pickupAddress: modalForm.pickupAddress || '',
      dropoffAddress: modalForm.dropoffAddress || '',
      date: modalForm.date || '',
      time: modalForm.time || '',
      passengers: modalForm.passengers || 1,
      ninos: modalForm.ninos || 0,
  vehicle: modalForm.vehicle || 'coche',
      selectedTourSlug: modalForm.selectedTourSlug || '',
      categoriaTour: modalForm.categoriaTour || '',
      subtipoTour: modalForm.subtipoTour || '',
      flightNumber: modalForm.flightNumber || '',
  luggage23kg: modalForm.luggage23kg ?? 0,
  luggage10kg: modalForm.luggage10kg ?? 0,
      specialRequests: modalForm.specialRequests || '',
      totalPrice: Number(modalForm.totalPrice || 0),
      contactName: modalForm.contactName || '',
      contactPhone: modalForm.contactPhone || '',
      contactEmail: modalForm.contactEmail || '',
    }
    const updated = [...carritoState, item]
    persistCarrito(updated)
    // reset modal editing state and close
    setModalEditingId(null)
    setModalStep(1)
    setQuoteModalOpen(false)
    toast({ title: 'Añadido', description: 'Cotización añadida al carrito.' })
  }

  const updateExistingItem = () => {
    if (modalEditingId === null) return
    const updated = carritoState.map((it) => it.id === modalEditingId ? {
      ...it,
      tipo: modalForm.tipo,
      // Reconstruir etiqueta visible usando ubicaciones generales (origen/destino via labelMap)
      serviceLabel: (modalForm.tipo === 'tour') ? 'Tour' : ((): string => {
        const originLabel = modalForm.origen ? (labelMap[modalForm.origen as keyof typeof labelMap] || modalForm.origen) : (modalForm.pickupAddress || it.pickupAddress || '')
        const destLabel = modalForm.destino ? (labelMap[modalForm.destino as keyof typeof labelMap] || modalForm.destino) : (modalForm.dropoffAddress || it.dropoffAddress || '')
        if (!originLabel && !destLabel) return it.serviceLabel || 'Traslado'
        return `${originLabel}${originLabel && destLabel ? ' → ' : ''}${destLabel}`
      })(),
      origen: modalForm.origen || it.origen,
      destino: modalForm.destino || it.destino,
      pickupAddress: modalForm.pickupAddress,
      dropoffAddress: modalForm.dropoffAddress,
      date: modalForm.date,
      time: modalForm.time,
      passengers: modalForm.passengers,
      ninos: modalForm.ninos || it.ninos,
  vehicle: modalForm.vehicle,
      selectedTourSlug: modalForm.selectedTourSlug || it.selectedTourSlug,
      categoriaTour: modalForm.categoriaTour || it.categoriaTour,
      subtipoTour: modalForm.subtipoTour || it.subtipoTour,
      flightNumber: modalForm.flightNumber || it.flightNumber,
  luggage23kg: modalForm.luggage23kg ?? it.luggage23kg,
  luggage10kg: modalForm.luggage10kg ?? it.luggage10kg,
      specialRequests: modalForm.specialRequests || it.specialRequests,
      totalPrice: Number(modalForm.totalPrice || it.totalPrice || 0),
      contactName: modalForm.contactName || it.contactName,
      contactPhone: modalForm.contactPhone || it.contactPhone,
      contactEmail: modalForm.contactEmail || it.contactEmail,
    } : it)
    persistCarrito(updated)
    // close modal and clear editing state
    setQuoteModalOpen(false)
    setModalEditingId(null)
    setModalStep(1)
    toast({ title: 'Guardado', description: 'Cotización actualizada.' })
  }
  /*
   * === RECARGO NOCTURNO AUTOMÁTICO ===
   * Ahora, además de calcular el recargo nocturno según la hora seleccionada en la reserva (time),
   * detectamos la hora local del cliente en la página de pago. Si son >=21h o <6h y el booking no tenía
   * ya marcado isNightTime, se añade automáticamente el recargo (+5€) excepto para 'tour-paris' / 'tour-nocturno'
   * donde la lógica de tarifa nocturna ya está incorporada al precio por hora en la pantalla anterior.
   * Si quieres cambiar el rango nocturno modifica la condición hour >= 21 || hour < 6.
   */

  useEffect(() => {
    const data = localStorage.getItem("bookingData")
    if (data) {
      try {
        const parsed = JSON.parse(data)
        if (parsed?.contactPhone) {
          const withPlus = ensureLeadingPlus(String(parsed.contactPhone))
          parsed.contactPhone = formatPhonePretty(withPlus)
          localStorage.setItem("bookingData", JSON.stringify(parsed))
        }
        setBookingData(parsed)
      } catch {
        setBookingData(JSON.parse(data))
      }
    }
      try {
        const raw = localStorage.getItem('carritoCotizaciones')
        if (raw) setCarritoState(JSON.parse(raw))
      } catch {}
    setIsLoading(false)
  }, [])

  // Detectar hora local del cliente y marcar recargo nocturno si aplica cuando aún no se marcó.
  useEffect(() => {
    if (!bookingData) return
    try {
      const now = new Date()
      const hour = now.getHours()
      const isNight = hour >= 21 || hour < 6
      // Sólo aplicar automáticamente si el registro aún no tenía isNightTime true y NO es un tour (los tours ya incorporan lógica propia)
      if (isNight && !bookingData.isNightTime && !bookingData.tourId) {
        setBookingData((prev: any) => {
          if (!prev) return prev
          const next = { ...prev, isNightTime: true, totalPrice: Number(prev.totalPrice || 0) + 5 }
          localStorage.setItem("bookingData", JSON.stringify(next))
          return next
        })
      }
    } catch {}
  }, [bookingData])

  const updateBookingField = (key: string, value: any) => {
    setBookingData((prev: any) => {
      const next: any = { ...prev, [key]: value }

      // Recalcular derivados (total, extras) solo si aplica
      const recalc = (n: any) => {
        // Normalizar campos numéricos
        n.passengers = Math.max(1, Math.min(9, Number(n.passengers || 1)))
          n.luggage23kg = Math.max(0, Number(n.luggage23kg ?? 0))
        n.luggage10kg = Math.max(0, Number(n.luggage10kg ?? 0))

        // Eventos: total = precio por persona * cupos
        if (n.isEvent && typeof n.pricePerPerson === "number") {
          const total = Number(n.pricePerPerson) * Number(n.passengers || 1)
          n.totalPrice = Number(total.toFixed(2))
          return n
        }

        // Traslados: calcular base por ruta y pax
        if (n.pickupAddress && n.dropoffAddress) {
          // Intentar deducir origen/destino a partir de etiquetas
          const from = (n.pickupAddress || "").toLowerCase().includes("cdg") ? "cdg"
            : (n.pickupAddress || "").toLowerCase().includes("orly") ? "orly"
            : (n.pickupAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
            : (n.pickupAddress || "").toLowerCase().includes("disney") ? "disneyland"
            : (n.pickupAddress || "").toLowerCase().includes("parís") || (n.pickupAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
          const to = (n.dropoffAddress || "").toLowerCase().includes("cdg") ? "cdg"
            : (n.dropoffAddress || "").toLowerCase().includes("orly") ? "orly"
            : (n.dropoffAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
            : (n.dropoffAddress || "").toLowerCase().includes("disney") ? "disneyland"
            : (n.dropoffAddress || "").toLowerCase().includes("parís") || (n.dropoffAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
          const pax = Math.max(1, Number(n.passengers || 1))
          const baseCalc = calcBaseTransferPrice(from, to, pax)
          const base = typeof baseCalc === "number" ? baseCalc : Number(n.basePrice || 0)

          const isNight = (() => {
            if (!n.time) return false
            const [hh] = String(n.time).split(":").map(Number)
            const h = hh || 0
            return h >= 21 || h < 6
          })()
          // Equipaje voluminoso: más de 3 maletas de 23Kg
          const extraLuggage = Number(n.luggage23kg ?? 0) > 3
          const extrasSum = (isNight ? 5 : 0) + (extraLuggage ? 10 : 0)
          n.isNightTime = isNight
          n.extraLuggage = extraLuggage
          n.luggageCount = Number(n.luggage23kg ?? 0) + Number(n.luggage10kg ?? 0)
          n.totalPrice = Number((base + extrasSum).toFixed(2))
          n.basePrice = base
          return n
        }

        // Por defecto: mantener total
        return n
      }

      const computed = recalc(next)
      localStorage.setItem("bookingData", JSON.stringify(computed))
      // Limpiar error del campo si ahora tiene valor válido
      setFieldErrors((prevErr) => {
        if (!prevErr[key]) return prevErr
        // Revalidaciones simples: si el valor ya no está vacío / formato básico
        if (typeof value === 'string' && value.trim() === '') return prevErr
        if (key === 'contactEmail') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
            if (!emailRegex.test(String(value))) return prevErr
        }
        if (key === 'contactPhone') {
          if (String(value).replace(/\D/g, '').length < 6) return prevErr
        }
        const clone = { ...prevErr }
        delete clone[key]
        return clone
      })
      return computed
    })
  }

  // Validar email en blur y actualizar errores de campo
  const validateAndSetEmail = (value: string) => {
    try {
      updateBookingField('contactEmail', value)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
      setFieldErrors((prev) => {
        const next = { ...prev }
        if (!emailRegex.test(String(value))) {
          next.contactEmail = 'Formato inválido'
        } else {
          delete next.contactEmail
        }
        return next
      })
    } catch {}
  }

  

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">No hay datos de reserva</h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Derivados para depósito/remaining y método de pago
  const paymentMethod = bookingData?.paymentMethod || "card" // card | paypal | cash
  const isQuick = bookingData?.quickDeposit === true
  const isTour = Boolean(
    bookingData?.isEvent ||
      bookingData?.tourHours !== undefined ||
      bookingData?.routeOption !== undefined ||
      (bookingData?.tourId && typeof bookingData.tourId === 'string'),
  )
  const isEvent = Boolean(bookingData?.isEvent)
  const isTourBooking = !isEvent && Boolean(
    bookingData?.tourHours !== undefined ||
    bookingData?.routeOption !== undefined ||
    (bookingData?.tourId && typeof bookingData.tourId === 'string')
  )
  // Si tenemos una ruta y pasajeros, recalcular base con la nueva lógica
  let computedBase = Number(bookingData?.basePrice || 0)
  try {
    const from = (bookingData?.pickupAddress || "").toLowerCase().includes("cdg") ? "cdg"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("orly") ? "orly"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("disney") ? "disneyland"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("parís") || (bookingData?.pickupAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
    const to = (bookingData?.dropoffAddress || "").toLowerCase().includes("cdg") ? "cdg"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("orly") ? "orly"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("beauvais") ? "beauvais"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("disney") ? "disneyland"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("parís") || (bookingData?.dropoffAddress || "").toLowerCase().includes("paris") ? "paris" : undefined
    const pax = Number(bookingData?.passengers || 1)
    const baseCalc = calcBaseTransferPrice(from, to, pax)
    if (typeof baseCalc === "number") computedBase = baseCalc
  } catch {}
  const total = Number(bookingData?.totalPrice || computedBase || 0)
  const depositPercent = isEvent ? 0.2 : (isTourBooking ? 0.2 : 0.1)
  const depositPercentInt = Math.round(depositPercent * 100)
  const deposit = Math.max(1, Number((total * depositPercent).toFixed(2)))
  const remaining = Math.max(0, Number((total - deposit).toFixed(2)))
  const amountNow = payFullNow ? total : deposit
  const clientHour = (() => { try { return new Date().getHours() } catch { return undefined } })()

  // Validación centralizada: determina si se puede pagar depósito ahora
  const isDepositReady = () => {
    if (!bookingData) return false

    // Normalizar nombres (algunas pantallas usan 'fecha'/'hora'/'pasajeros')
    const passengers = bookingData.passengers ?? bookingData.pasajeros
    const date = bookingData.date ?? bookingData.fecha
    const time = bookingData.time ?? bookingData.hora

    // Pasajeros, fecha y hora
    if (!passengers || Number(passengers) < 1) return false
    if (!date || !String(date).trim()) return false
    if (!time || !String(time).trim()) return false

    // Direcciones requeridas para traslados (no eventos ni tours predefinidos)
    const needsAddresses = !bookingData.isEvent && !bookingData.isTourQuick && !bookingData.tourId
    if (needsAddresses) {
      // Ahora requerimos las direcciones ingresadas en la sección de pago (campos adicionales)
      if (!paymentPickupAddress || !String(paymentPickupAddress).trim()) return false
      if (!paymentDropoffAddress || !String(paymentDropoffAddress).trim()) return false
    }

  // Equipaje: no requerimos que el usuario haya indicado cantidades aquí (0 es válido)

    // Contacto: siempre requerimos nombre, teléfono y email para poder pagar el depósito
    if (!bookingData.contactName || !String(bookingData.contactName).trim()) return false
    if (!bookingData.contactPhone || !String(bookingData.contactPhone).trim()) return false
    if (!bookingData.contactEmail || !String(bookingData.contactEmail).trim()) return false

    // No hay errores activos
    if (Object.keys(fieldErrors || {}).length > 0) return false

    return true
  }

  // Etiquetas seguras para servicio/route en quick
  const quickType: "traslado" | "tour" | undefined = bookingData?.quickType
  const serviceLabel = bookingData?.isEvent
    ? "EVENTO ESPECIAL"
    : isQuick
      ? (quickType === "traslado"
          ? (bookingData?.pickupAddress && bookingData?.dropoffAddress
              ? `${bookingData.pickupAddress} → ${bookingData.dropoffAddress}`
              : "TRASLADO")
          : "TOUR")
      : (bookingData?.tourId ? bookingData.tourId.replace("-", " → ").toUpperCase() : "SERVICIO")

  // Enviar a WhatsApp cuando el método es efectivo
  const sendWhatsApp = () => {
    try {
      const numberFromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
      const phone = (numberFromEnv || "").replace(/[^\d]/g, "") // solo dígitos
      const isEvent = Boolean(bookingData?.isEvent)
      const title = isEvent
        ? (bookingData?.eventTitle || "Evento especial")
        : (bookingData?.tourId ? bookingData.tourId.split("-").join(" → ").toUpperCase() : "Servicio")
      const paxLabel = isEvent ? "Cupos" : "Pasajeros"
      const equipaje = isEvent
    ? `23kg: ${bookingData?.luggage23kg ?? 0} | 10kg: ${bookingData?.luggage10kg ?? 0}`
        : `${bookingData?.luggageCount || 0} maleta(s)`

      const extraLines: string[] = []
      const isTourMsg = Boolean(bookingData?.tourId)
      if (!isTourMsg) {
        if (bookingData?.isNightTime) extraLines.push("Recargo nocturno: +5€")
        if (bookingData?.extraLuggage) extraLines.push("Equipaje extra: +10€")
      }
      if (bookingData?.routeOption) extraLines.push(`Opción: ${bookingData.routeOption}`)
      if (bookingData?.tourHours) extraLines.push(`Duración: ${bookingData.tourHours}h`)

      const lines = [
        "Hola, quisiera confirmar una reserva:",
        `• ${isEvent ? "Evento" : "Servicio"}: ${title}`,
        `• Fecha y hora: ${bookingData?.date || "-"} ${bookingData?.time ? `a las ${bookingData.time}` : ""}`,
        `• ${paxLabel}: ${bookingData?.passengers || 0}`,
        bookingData?.pickupAddress ? `• Recogida: ${bookingData.pickupAddress}` : "",
        bookingData?.dropoffAddress ? `• Destino: ${bookingData.dropoffAddress}` : "",
        `• Equipaje: ${equipaje}`,
        bookingData?.flightNumber ? `• Vuelo: ${bookingData.flightNumber}` : "",
        "",
        "Contacto:",
        `• Nombre: ${bookingData?.contactName || "-"}`,
        `• Teléfono: ${bookingData?.contactPhone || "-"}`,
        `• Email: ${bookingData?.contactEmail || "-"}`,
        "",
        "Pago:",
        `• Método: Efectivo con depósito`,
        `• Total: ${total}€`,
        `• Depósito: ${deposit}€`,
        `• Saldo el día del servicio: ${remaining}€`,
        ...extraLines,
        "",
        "Realizaré el depósito para confirmar la reserva. Gracias."
      ].filter(Boolean)

      const msg = encodeURIComponent(lines.join("\n"))
      const waBase = "https://wa.me/"
      const url = phone ? `${waBase}${phone}?text=${msg}` : `${waBase}?text=${msg}`
      window.open(url, "_blank")
    } catch (e) {
      console.error("No se pudo abrir WhatsApp:", e)
    }
  }

  // Sumar total del carrito desde state
  const totalCarrito = carritoState.reduce((acc: number, item: any) => acc + Number(item.totalPrice || 0), 0)
  const tieneTour = carritoState.some((item: any) => item.tipo === 'tour')
  const tieneTraslado = carritoState.some((item: any) => item.tipo === 'traslado')

  // Calcular importes combinados (cuando hay carrito):
  // - combinedTotal: suma de totales de carrito + booking actual
  // - combinedDepositSum: suma de depósitos (según tipo) de cada item + depósito del booking actual
  const combinedTotal = Number((totalCarrito + Number(bookingData.totalPrice || total || 0)).toFixed(2))
  const computeDepositForItem = (itm: any) => {
    const price = Number(itm.totalPrice || 0)
    // asumir 20% para tours/eventos, 10% para traslados
    const percent = itm.tipo === 'tour' || itm.tipo === 'event' ? 0.2 : 0.1
    return Math.max(1, Number((price * percent).toFixed(2)))
  }
  const combinedDepositSum = carritoState.reduce((acc: number, it: any) => acc + computeDepositForItem(it), 0) + (payFullNow ? 0 : deposit)
  // Si el usuario marca pagar todo ahora, el importe a cobrar es el total combinado; si no, es la suma de depósitos
  const getCombinedAmountToCharge = () => payFullNow ? combinedTotal : combinedDepositSum

  // Añadir el servicio/quote actual al carrito y mantener al usuario en la misma página
  const addCurrentToCart = () => {
    if (!bookingData) return
    try {
      const item = {
        id: Date.now(),
        tipo: bookingData.isEvent ? 'tour' : (bookingData.tipoReserva || (bookingData.tourId ? 'tour' : 'traslado')),
        // Mostrar etiqueta basada en ubicaciones generales (labelMap) y mantener direcciones exactas como detalle
        serviceLabel: (() => {
          if (bookingData.isEvent) return serviceLabel
          const originLabel = bookingData.origen ? (labelMap[bookingData.origen as keyof typeof labelMap] || bookingData.origen) : (bookingData.pickupAddress || paymentPickupAddress || '')
          const destLabel = bookingData.destino ? (labelMap[bookingData.destino as keyof typeof labelMap] || bookingData.destino) : (bookingData.dropoffAddress || paymentDropoffAddress || '')
          if (!originLabel && !destLabel) return serviceLabel
          return `${originLabel}${originLabel && destLabel ? ' → ' : ''}${destLabel}`
        })(),
        origen: bookingData.origen || '',
        destino: bookingData.destino || '',
        pickupAddress: bookingData.pickupAddress || paymentPickupAddress || '',
        dropoffAddress: bookingData.dropoffAddress || paymentDropoffAddress || '',
        date: bookingData.date || bookingData.fecha || '',
        time: bookingData.time || bookingData.hora || '',
        passengers: bookingData.passengers || bookingData.pasajeros || 1,
        vehicle: bookingData.vehicle || bookingData.vehiculo || '',
        totalPrice: Number(bookingData.totalPrice || total || 0),
      }
      const updated = [...carritoState, item]
      localStorage.setItem('carritoCotizaciones', JSON.stringify(updated))
      setCarritoState(updated)
      try {
        // Mostrar confirmación al usuario sin redirigir
        try {
          toast({
            title: 'Añadido al carrito',
            description: 'Tu cotización se añadió al carrito. Puedes continuar cotizando o pagar todo junto.',
          })
        } catch (tErr) {
          console.info('Cotización añadida al carrito')
        }
      } catch (e) {
        // noop
      }
    } catch (e) {
      console.error('No se pudo agregar al carrito', e)
      alert('No se pudo agregar al carrito. Intenta nuevamente.')
    }
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-20 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <AnimatedSection animation="slide-left">
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-primary hover:text-accent transition-colors mb-8 transform hover:scale-105 duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a servicios
            </Link>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <AnimatedSection animation="fade-up" className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Página de Pago</h1>
              <p className="text-xl text-muted-foreground">Confirma tu reserva y procede con el pago seguro</p>
            </AnimatedSection>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Booking Summary */}
              <AnimatedSection animation="slide-left" delay={200}>
                <Card className="transform hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <CheckCircle className="w-6 h-6 text-accent" />
                      Resumen de tu Reserva
                      {bookingData.isEvent && (
                        <Badge className="ml-2 bg-accent text-white">Evento</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {bookingData.isEvent && Array.isArray(bookingData.eventImages) && bookingData.eventImages.length > 0 && (
                      <EventImagesCarousel images={bookingData.eventImages} shortInfo={bookingData.eventShortInfo} />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{bookingData.isEvent ? "Evento:" : "Servicio:"}</span>
                      <Badge className="bg-accent text-accent-foreground">
                        {serviceLabel}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      {/* Pasajeros/Cupos editable */}
                      {bookingData.isEvent && bookingData.eventShortInfo && !bookingData.eventImages?.length && (
                        <div className="text-sm text-muted-foreground border-l-2 border-accent/60 pl-3">
                          {bookingData.eventShortInfo}
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{bookingData.isEvent ? "Cupos" : "Pasajeros"}</span>
                          <Input
                            type="number"
                            data-field="passengers"
                            className={`w-24 ${fieldErrors.passengers ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            min={1}
                            max={9}
                            value={bookingData.passengers || 1}
                            onChange={(e) => updateBookingField("passengers", Number(e.target.value))}
                          />
                        </div>
                      </div>
                      {fieldErrors.passengers && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.passengers}</p>
                      )}

                      {/* Fecha y hora editable */}
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            data-field="date"
                            className={`w-40 ${fieldErrors.date ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            value={bookingData.date || ""}
                            onChange={(e) => updateBookingField("date", e.target.value)}
                          />
                          <Input
                            type="time"
                            data-field="time"
                            className={`w-28 ${fieldErrors.time ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            value={bookingData.time || ""}
                            onChange={(e) => updateBookingField("time", e.target.value)}
                          />
                        </div>
                      </div>
                      {(fieldErrors.date || fieldErrors.time) && (
                        <p className="text-xs text-destructive mt-1">{fieldErrors.date || fieldErrors.time}</p>
                      )}

                      {/* Direcciones: editables en traslados, sólo lectura en tours / eventos */}
                      {isTour ? (
                        <>
                          {bookingData.pickupAddress && (
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-accent mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium">Recogida:</p>
                                <p className="text-muted-foreground">{bookingData.pickupAddress}</p>
                              </div>
                            </div>
                          )}
                          {bookingData.dropoffAddress && (
                            <div className="flex items-start gap-3">
                              <MapPin className="w-4 h-4 text-accent mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium">Destino:</p>
                                <p className="text-muted-foreground">{bookingData.dropoffAddress}</p>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-primary">Direcciones (información adicional)</h4>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              {`Origen del servicio${bookingData?.origen ? ` [${labelMap?.[bookingData.origen as keyof typeof labelMap] || bookingData.origen}]` : ''}`}
                            </label>
                            <p className="text-sm text-muted-foreground">{bookingData.pickupAddress || (labelMap?.[bookingData.origen as keyof typeof labelMap] || bookingData.origen) || 'No especificado'}</p>
                            <Input
                              placeholder="Ubicación exacta"
                              data-field="paymentPickupAddress"
                              className={fieldErrors.pickupAddress ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={paymentPickupAddress}
                              onChange={(e) => { setPaymentPickupAddress(e.target.value); if (fieldErrors.pickupAddress) setFieldErrors(f=>{const c={...f}; delete c.pickupAddress; return c}) }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              {`Destino del servicio${bookingData?.destino ? ` [${labelMap?.[bookingData.destino as keyof typeof labelMap] || bookingData.destino}]` : ''}`}
                            </label>
                            <p className="text-sm text-muted-foreground">{bookingData.dropoffAddress || (labelMap?.[bookingData.destino as keyof typeof labelMap] || bookingData.destino) || 'No especificado'}</p>
                            <Input
                              placeholder="Ubicación exacta"
                              data-field="paymentDropoffAddress"
                              className={fieldErrors.dropoffAddress ? 'border-destructive focus-visible:ring-destructive' : ''}
                              value={paymentDropoffAddress}
                              onChange={(e) => { setPaymentDropoffAddress(e.target.value); if (fieldErrors.dropoffAddress) setFieldErrors(f=>{const c={...f}; delete c.dropoffAddress; return c}) }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Número de Vuelo (opcional)</label>
                            <Input
                              placeholder="AF1234, BA456, etc."
                              value={bookingData.flightNumber || ''}
                              onChange={(e) => updateBookingField('flightNumber', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* Equipaje por peso editable para ambos casos */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Luggage className="w-4 h-4 text-accent" />
                          <span className="text-sm font-medium">Equipaje</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-muted-foreground"># Maletas 23kg</label>
                            <Input
                              type="number"
                              min={0}
                              value={bookingData.luggage23kg ?? 0}
                              onChange={(e) => updateBookingField("luggage23kg", Number(e.target.value))}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground"># Maletas 10kg</label>
                            <Input
                              type="number"
                              min={0}
                              value={bookingData.luggage10kg ?? 0}
                              onChange={(e) => updateBookingField("luggage10kg", Number(e.target.value))}
                            />
                          </div>
                        </div>
                      </div>

                      {bookingData.flightNumber && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm">Vuelo: {bookingData.flightNumber}</span>
                        </div>
                      )}

                      {bookingData.specialRequests && (
                        <div className="flex items-start gap-3">
                          <div className="text-sm">
                            <p className="font-medium">Solicitudes especiales:</p>
                            <p className="text-muted-foreground">{bookingData.specialRequests}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Contact Info: editable para traslados */}
                    {bookingData.isEvent ? (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium text-primary">Información de Contacto</h4>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Nombre Completo</label>
                          <Input
                            placeholder="Tu nombre completo"
                            data-field="contactName"
                            className={fieldErrors.contactName ? 'border-destructive focus-visible:ring-destructive' : ''}
                            value={bookingData.contactName || ''}
                            onChange={(e) => updateBookingField('contactName', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Teléfono</label>
                            <PhoneInputIntl
  value={bookingData.contactPhone || ''}
  onChange={value => updateBookingField('contactPhone', value)}
  inputProps={{
    name: 'contactPhone',
    className: fieldErrors.contactPhone ? 'border-destructive focus-visible:ring-destructive' : ''
  }}
/>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Email</label>
                            <EmailAutocomplete
  value={bookingData.contactEmail || ''}
  onChange={value => updateBookingField('contactEmail', value)}
  className={fieldErrors.contactEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
  name="contactEmail"
  data-field="contactEmail"
  onBlur={e => validateAndSetEmail(e.target.value)}
/>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Solicitudes Especiales (opcional)</label>
                          <Input
                            placeholder="Asiento bebé, parada extra, etc."
                            value={bookingData.specialRequests || ''}
                            onChange={(e) => updateBookingField('specialRequests', e.target.value)}
                          />
                        </div>
                      </div>
                    ) : isTour ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">Información de Contacto:</h4>
                        <p className="text-sm">{bookingData.contactName}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.contactPhone}</p>
                        <p className="text-sm text-muted-foreground">{bookingData.contactEmail}</p>
                      </div>
                    ) : (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium text-primary">Información de Contacto</h4>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Nombre Completo</label>
                          <Input
                            placeholder="Tu nombre completo"
                            data-field="contactName"
                            className={fieldErrors.contactName ? 'border-destructive focus-visible:ring-destructive' : ''}
                            value={bookingData.contactName || ''}
                            onChange={(e) => updateBookingField('contactName', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Teléfono</label>
                            <PhoneInputIntl
  value={bookingData.contactPhone || ''}
  onChange={value => updateBookingField('contactPhone', value)}
  inputProps={{
    name: 'contactPhone',
    className: fieldErrors.contactPhone ? 'border-destructive focus-visible:ring-destructive' : ''
  }}
/>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Email</label>
                            <EmailAutocomplete
  value={bookingData.contactEmail || ''}
  onChange={value => updateBookingField('contactEmail', value)}
  className={fieldErrors.contactEmail ? 'border-destructive focus-visible:ring-destructive' : ''}
  name="contactEmail"
  data-field="contactEmail"
  onBlur={e => validateAndSetEmail(e.target.value)}
/>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Solicitudes Especiales (opcional)</label>
                          <Input
                            placeholder="Asiento bebé, parada extra, etc."
                            value={bookingData.specialRequests || ''}
                            onChange={(e) => updateBookingField('specialRequests', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-2">
                      {isQuick ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Depósito para confirmar</span>
                            <span>{deposit}€</span>
                          </div>
                          {total > 0 && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Importe total estimado del servicio</span>
                              <span>{total}€</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">El resto del servicio ({remaining}€) se paga el día del servicio.</p>
                        </>
                      ) : bookingData.isEvent ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Precio por cupo</span>
                            <span>{bookingData.pricePerPerson ?? bookingData.totalPrice}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Cupos</span>
                            <span>x{bookingData.passengers || 1}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Depósito (20%)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Saldo el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                        </>
                      ) : (["tour-paris", "tour-nocturno"].includes(bookingData.tourId || "")) ? (
                        (() => {
                          const pax = Number(bookingData.passengers || 1)
                          const hours = bookingData.selectedPricingOption?.hours || bookingData.tourHours || 1
                          const extraPassengers = Math.max(0, pax - 4)
                          const ratePerExtra = bookingData.isNightTime ? 12 : 10
                          const totalLocal = Number(bookingData.totalPrice || 0)
                          const lines: JSX.Element[] = []
                          if (bookingData.selectedPricingOption) {
                            lines.push(
                              <div key="opt" className="flex justify-between text-sm">
                                <span>Opción seleccionada</span>
                                <span>{bookingData.selectedPricingOption.label}{bookingData.selectedPricingOption.hours ? ` (${bookingData.selectedPricingOption.hours}h)` : ''}</span>
                              </div>
                            )
                            lines.push(
                              <div key="opt-price" className="flex justify-between text-sm">
                                <span>Precio opción</span>
                                <span>{bookingData.selectedPricingOption.price}€</span>
                              </div>
                            )
                            lines.push(
                              <div key="pax" className="flex justify-between text-sm">
                                <span>Pasajeros</span>
                                <span>{pax}</span>
                              </div>
                            )
                            if (extraPassengers > 0) {
                              const recargo = ratePerExtra * extraPassengers * hours
                              lines.push(
                                <div key="recargo" className="flex justify-between text-sm text-accent">
                                  <span>Recargo pasajeros extra</span>
                                  <span>+{recargo}€</span>
                                </div>
                              )
                            }
                          } else {
                            // Intentamos deducir tarifa base por hora (sin extras) para mostrarla.
                            const perHourWithExtras = hours > 0 ? (totalLocal / hours) : totalLocal
                            const baseHourly = perHourWithExtras - (extraPassengers * ratePerExtra)
                            lines.push(
                              <div key="rate" className="flex justify-between text-sm">
                                <span>Precio por hora ({bookingData.isNightTime ? 'nocturno' : 'diurno'})</span>
                                <span>{Math.max(0, Math.round(baseHourly))}€</span>
                              </div>
                            )
                            lines.push(
                              <div key="dur" className="flex justify-between text-sm">
                                <span>Duración</span>
                                <span>{hours}h</span>
                              </div>
                            )
                            lines.push(
                              <div key="pax-base" className="flex justify-between text-sm">
                                <span>Pasajeros</span>
                                <span>{pax}</span>
                              </div>
                            )
                            if (extraPassengers > 0) {
                              const recargo = ratePerExtra * extraPassengers * hours
                              lines.push(
                                <div key="recargo-base" className="flex justify-between text-sm text-accent">
                                  <span>Recargo pasajeros extra</span>
                                  <span>+{recargo}€</span>
                                </div>
                              )
                            }
                          }
                          return <>{lines}</>
                        })()
                      ) : typeof bookingData.basePrice === "number" ? (
                        <>
                          {bookingData.selectedPricingOption && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>Opción seleccionada</span>
                                <span>
                                  {bookingData.selectedPricingOption.label}
                                  {bookingData.selectedPricingOption.hours ? ` (${bookingData.selectedPricingOption.hours}h)` : ''}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Precio</span>
                                <span>{bookingData.selectedPricingOption.price}€</span>
                              </div>
                            </>
                          )}
                          {!bookingData.selectedPricingOption && (
                          <div className="flex justify-between text-sm">
                            <span>Precio base</span>
                            <span>{bookingData.basePrice}€</span>
                          </div>
                          )}
                          {Math.max(0, (bookingData.passengers || 1) - 4) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Pasajeros adicionales</span>
                              <span>+{Math.max(0, (bookingData.passengers || 1) - 4) * 20}€</span>
                            </div>
                          )}
                          {bookingData.isNightTime && (
                            <div className="flex justify-between text-sm">
                              <span>Recargo nocturno</span>
                              <span>+5€</span>
                            </div>
                          )}
                          {bookingData.extraLuggage && (
                            <div className="flex justify-between text-sm">
                              <span>Equipaje extra</span>
                              <span>+10€</span>
                            </div>
                          )}
                          {/* Depósito/Saldo para traslados */}
                          <div className="flex justify-between text-sm">
                            <span>Depósito ({Math.round(depositPercent*100)}%)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Saldo el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>{bookingData.totalPrice}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Depósito ({Math.round(depositPercent*100)}%)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Saldo el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                        </>
                      )}
                      {!isQuick && bookingData.isNightTime && !isTour && (
                        <div className="flex justify-between text-sm">
                          <span>Recargo nocturno</span>
                          <span>+5€</span>
                        </div>
                      )}
                      {!isQuick && bookingData.extraLuggage && !isTour && (
                        <div className="flex justify-between text-sm">
                          <span>Equipaje extra</span>
                          <span>+10€</span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={payFullNow} onChange={(e) => setPayFullNow(e.target.checked)} />
                          ¿Deseas pagar todo ahora?
                        </label>
                        <div className="flex items-baseline gap-3 font-bold text-lg">
                          <span>
                            Total a pagar ahora {payFullNow ? '(100%)' : `(depósito ${depositPercentInt}%)`}
                          </span>
                          <span className="text-accent animate-pulse">{amountNow}€</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              {/* Payment Section */}
              <AnimatedSection animation="slide-right" delay={300}>
                <Card className="transform hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <CreditCard className="w-6 h-6 text-accent" />
                      Información de Pago
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Método de Pago</h4>
                      <div className="grid gap-3">
                        {/* Tarjeta */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="card"
                            checked={paymentMethod === "card"}
                            onChange={() => updateBookingField("paymentMethod", "card")}
                            className="text-accent"
                          />
                          <CreditCard className="w-5 h-5 text-accent" />
                          <div className="flex-1">
                            <span className="font-medium">Pago con tarjeta</span>
                            <div className="mt-1 flex items-center gap-3">
                              <img src="/logos/visa.svg" alt="Visa" className="h-5 w-auto" />
                              <img src="/logos/mastercard.svg" alt="Mastercard" className="h-5 w-auto" />
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-auto">Seguro</Badge>
                        </label>

                        {/* PayPal */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="paypal"
                            checked={paymentMethod === "paypal"}
                            onChange={() => updateBookingField("paymentMethod", "paypal")}
                            className="text-accent"
                          />
                          {/* Logo estilo PayPal */}
                          <div className="flex items-center">
                            <span className="text-[#003087] font-extrabold text-sm">Pay</span>
                            <span className="text-[#009CDE] font-extrabold text-sm">Pal</span>
                          </div>
                          <div className="flex-1" />
                          <Badge variant="secondary" className="ml-auto">Recomendado</Badge>
                        </label>

                        {/* Efectivo */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="cash"
                            checked={paymentMethod === "cash"}
                            onChange={() => updateBookingField("paymentMethod", "cash")}
                            className="text-accent"
                          />
                          <span className="font-medium">Efectivo</span>
                          <Badge className="ml-2" variant="outline">Depósito requerido</Badge>
                          <div className="flex-1" />
                        </label>
                      </div>
                    </div>

                    <Separator />

                    {/* Depósito y Restante (según método) */}
                    <div className="space-y-2 text-sm">
                      {isQuick ? (
                        <>
                          <div className="flex justify-between">
                            <span>Pago de confirmación</span>
                            <span>{deposit}€</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Este pago asegura tu reserva. Después de pagarlo, terminarás de rellenar los datos faltantes.
                          </p>
                        </>
                      ) : paymentMethod === "cash" ? (
                        <>
                          <div className="flex justify-between">
                            <span>Confirmar tu reserva (depósito)</span>
                            <span>{deposit}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor a pagar el día del servicio</span>
                            <span>{remaining}€</span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              ¿Por qué pedimos un depósito? Asegura la disponibilidad del vehículo y del conductor en la fecha y
                              hora seleccionadas y cubre el bloqueo de agenda y la preparación del servicio.
                            </p>
                            <p>
                              ¿Cómo se paga? El depósito se abona ahora de forma segura. El resto ({remaining}€) se paga el día del
                              servicio en efectivo, tarjeta o PayPal según prefieras.
                            </p>
                            {isTourBooking ? (
                              <p>Importe del depósito: {deposit}€.</p>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>Total a pagar ahora {payFullNow ? '(100%)' : `(depósito ${depositPercentInt}%)`}</span>
                            <span>{amountNow}€</span>
                          </div>
                          {!payFullNow && (
                            <div className="flex justify-between">
                              <span>Saldo el día del servicio</span>
                              <span>{remaining}€</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Puedes pagar con tarjeta o PayPal de forma segura. {payFullNow ? 'Se cobrará el total ahora.' : `Si prefieres, marca "¿Deseas pagar todo ahora?" para abonar el 100%. En caso contrario, se cobrará el depósito del ${depositPercentInt}% y el resto se paga el día del servicio.`}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            * Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.
                            {typeof clientHour === 'number' && (
                              <span className="ml-1 text-xs">Hora local detectada: {clientHour}:00 {clientHour >= 21 || clientHour < 6 ? '(recargo aplicado)' : ''}</span>
                            )}
                          </p>
                        </>
                      )}
                    </div>

                    <Separator />

                    {/* Security Features */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Shield className="w-5 h-5 text-accent" />
                        Pago Seguro
                      </h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span>Encriptación SSL de 256 bits</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span>Procesamiento seguro de pagos</span>
                        </div>
                        
                      </div>
                    </div>

                    <Separator />

          {/* Confirmation Button */}
                    <div className="space-y-4">
                      {/* Carrito rápido: mostrar items añadidos y opción de agregar otro */}
                      {carritoState && carritoState.length > 0 && (
                        <div className="space-y-3 p-3 bg-muted/20 rounded">
                          <h4 className="font-medium">Carrito de Cotizaciones</h4>
                          <div className="space-y-2 max-h-40 overflow-auto">
                            {carritoState.map((it) => (
                              <div key={it.id} className="relative flex items-center justify-between p-2 border rounded bg-background/80">
                                {/* Delete button top-right: small, always visible, icon turns red on hover, button flush to corner */}
                                <button
                                  aria-label={`Eliminar cotización ${it.id}`}
                                  onClick={() => removeCartItem(it.id)}
                                  className="absolute right-0 top-0 w-7 h-7 rounded-full border border-transparent flex items-center justify-center transition-colors duration-150 text-muted-foreground group cursor-pointer"
                                  title="Eliminar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-muted-foreground group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                                <div className="text-sm">
                                  <div className="font-medium">{it.serviceLabel}</div>
                                  {/* Mostrar direcciones exactas solo como detalle adicional */}
                                  {(it.pickupAddress || it.dropoffAddress) ? (
                                    <div className="text-xs text-muted-foreground">{it.pickupAddress || ''}{(it.pickupAddress && it.dropoffAddress) ? ' → ' : ''}{it.dropoffAddress || ''}</div>
                                  ) : null}
                                  <div className="text-xs text-muted-foreground">{it.date} {it.time} • {it.passengers} pax</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-bold">{it.totalPrice}€</div>
                                  <Button size="sm" variant="ghost" onClick={() => openEditModal(it)}>Editar</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Total carrito</div>
                            <div className="font-bold">{totalCarrito}€</div>
                          </div>
                          <div className="pt-2">
                            <Button size="sm" variant="outline" onClick={openNewQuoteModal}>Añadir cotización</Button>
                          </div>
                        </div>
                      )}
                      {/* Texto informativo para cotizar ida y vuelta */}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Si deseas un <strong>ida y vuelta</strong>, pulsa
                          <Button size="sm" variant="outline" className="mx-2 align-middle" onClick={openReturnQuoteModal}>
                            aquí
                          </Button>
                          y podrás cotizar otro traslado o tour.
                        </p>
                      </div>
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300"
                        size="lg"
                        onClick={() => {
                          if (!bookingData) return
                          // Usar la validación central
                          const ok = isDepositReady()
                          if (!ok) {
                            // Reconstruir errores para mostrar al usuario los campos faltantes
                            const errors: Record<string, string> = {}

                            // Normalizar nombres de campos
                            const passengers = bookingData.passengers ?? bookingData.pasajeros
                            const date = bookingData.date ?? bookingData.fecha
                            const time = bookingData.time ?? bookingData.hora

                            if (!passengers || Number(passengers) < 1) errors.passengers = 'Requerido'
                            if (!date) errors.date = 'Requerido'
                            if (!time) errors.time = 'Requerido'

                            const requiresContact = !bookingData.quickDeposit
                            if (requiresContact) {
                              if (!bookingData.contactName || !String(bookingData.contactName).trim()) errors.contactName = 'Requerido'
                              if (!bookingData.contactPhone || !String(bookingData.contactPhone).trim()) errors.contactPhone = 'Requerido'
                              if (!bookingData.contactEmail || !String(bookingData.contactEmail).trim()) errors.contactEmail = 'Requerido'
                            }

                            const needsAddresses = !bookingData.isEvent && !bookingData.isTourQuick && !bookingData.tourId
                            if (needsAddresses) {
                              if (!paymentPickupAddress || !String(paymentPickupAddress).trim()) errors.pickupAddress = 'Requerido'
                              if (!paymentDropoffAddress || !String(paymentDropoffAddress).trim()) errors.dropoffAddress = 'Requerido'
                            }

                            // Formatos básicos
                            if (!errors.contactEmail && bookingData.contactEmail) {
                              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
                              if (!emailRegex.test(String(bookingData.contactEmail))) errors.contactEmail = 'Formato inválido'
                            }
                            if (!errors.contactPhone && bookingData.contactPhone) {
                              if (String(bookingData.contactPhone).replace(/\D/g, '').length < 6) errors.contactPhone = 'Teléfono inválido'
                            }

                            setFieldErrors(errors)
                            requestAnimationFrame(() => {
                              const first = Object.keys(errors)[0]
                              // Mapear claves normalizadas a los data-field reales usados en los inputs
                              const fieldMap: Record<string, string> = {
                                passengers: 'passengers',
                                date: 'date',
                                time: 'time',
                                contactName: 'contactName',
                                contactPhone: 'contactPhone',
                                contactEmail: 'contactEmail',
                                pickupAddress: 'pickupAddress',
                                dropoffAddress: 'dropoffAddress'
                              }
                              const selector = `[data-field="${fieldMap[first] || first}"]`
                              const el = document.querySelector(selector) as HTMLElement | null
                              if (el) el.focus()
                            })
                            return
                          }

                          // Crear pago en backend (Mollie) y redirigir a checkout
                          const doPay = async () => {
                            try {
                              const description = bookingData?.isEvent
                                ? `Evento: ${bookingData?.eventTitle || 'Reserva'}`
                                : bookingData?.tourId
                                ? `Reserva tour: ${bookingData.tourId}`
                                : `Reserva traslado ${bookingData?.pickupAddress || ''} -> ${bookingData?.dropoffAddress || ''}`
                              // Si hay items en el carrito, hacemos un único cobro combinado (carrito + cotización actual)
                              const amount = carritoState && carritoState.length > 0 ? getCombinedAmountToCharge() : Number(amountNow || 0)
                              const res = await fetch('/api/mollie/create', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  amount,
                                  description: carritoState && carritoState.length > 0 ? `Pago combinado (${(carritoState.length + 1)} servicios)` : description,
                                  method: paymentMethod,
                                  // Enviamos el booking actual y el carrito para que el backend pueda crear una única orden
                                  booking: {
                                    ...bookingData,
                                    paymentPickupAddress,
                                    paymentDropoffAddress,
                                  },
                                  carrito: carritoState || [],
                                  metadata: { source: 'web', combinedPayment: !!(carritoState && carritoState.length > 0), itemsCount: (carritoState?.length || 0) + 1 },
                                }),
                              })
                              if (!res.ok) throw new Error(`Error creando pago: ${res.status}`)
                              const json = await res.json()
                              const url = json?.checkoutUrl
                              try { if (json?.id) localStorage.setItem('lastPaymentId', String(json.id)) } catch {}
                              if (typeof url === 'string') {
                                window.location.href = url
                                return
                              } else {
                                throw new Error('checkoutUrl no recibido')
                              }
                            } catch (e) {
                              console.error('No se pudo iniciar el pago:', e)
                              alert('No se pudo iniciar el pago. Intenta nuevamente más tarde.')
                            } finally {
                              // Si no hubo redirect el botón debe volver a su estado normal
                              try { setIsPaying(false) } catch {}
                            }
                          }
                          // Marcar que se está procesando el pago para deshabilitar el botón y mostrar feedback
                          setIsPaying(true)
                          doPay()
                        }}
                        disabled={!isDepositReady() || isPaying}
                        aria-disabled={!isDepositReady() || isPaying}
                      >
            {isPaying ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Procesando...
              </span>
            ) : (
              // Mostrar importes combinados si existen items en carrito
              carritoState && carritoState.length > 0
                ? (payFullNow ? `Pagar todo (${combinedTotal}€)` : `Pagar depósitos (${combinedDepositSum}€)`)
                : (payFullNow ? `Pagar todo (${total}€)` : `Pagar depósito ${deposit}€`)
            )}
                      </Button>
                      {/* Mensajes de error por campo ya mostrados inline sobre cada input */}

                      <p className="text-xs text-muted-foreground text-center">
                        {isQuick
                          ? "Después del pago podrás completar los datos faltantes para finalizar tu reserva."
                          : "Al confirmar el pago, aceptas nuestros términos y condiciones de servicio. Recibirás una confirmación por email con todos los detalles de tu reserva."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            {/* Additional Info */}
            <AnimatedSection animation="zoom-in" delay={500}>
              <Card className="mt-8">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold text-primary">¿Qué sucede después del pago?</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">1. Confirmación Inmediata</h4>
                        <p className="text-muted-foreground">Recibirás un email con los detalles de tu reserva</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">2. Recordatorio</h4>
                        <p className="text-muted-foreground">Te contactaremos 24h antes para confirmar detalles</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">3. Servicio Comodo</h4>
                        <p className="text-muted-foreground">Disfruta de tu traslado puntual y cómodo</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
      {/* Modal para crear/editar cotizaciones (wizard multi-paso) */}
      <Dialog open={quoteModalOpen} onOpenChange={(v) => setQuoteModalOpen(v)}>
        <DialogContent className="max-w-3xl">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{modalEditingId ? 'Editar cotización' : 'Nueva cotización'}</h3>

            {/* Paso 1: Tipo de servicio (usar mismo selector visual que Hero) */}
            {modalStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Map className="w-4 h-4 text-accent" />
                    {bookingForm?.typePicker?.label || 'Tipo de reserva'}
                  </label>
                  <div className="flex flex-wrap gap-4 justify-center w-full">
                    <Button
                      type="button"
                      size="lg"
                      variant={modalForm.tipo === "traslado" ? "default" : "outline"}
                      className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${modalForm.tipo === "traslado" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                      aria-pressed={modalForm.tipo === "traslado"}
                      onClick={() => {
                        // Si el flujo de ida y vuelta fue iniciado, usar los valores guardados intercambiados
                        if (returnInitiatedRef.current) {
                          console.log('[Modal] Traslado clicked after return initiated - applying saved swapped origin/destination')
                          const newOrigen = getLocationKeyFromValue(savedDestinationOnLoad || bookingData?.dropoffAddress || '') || (savedDestinationOnLoad || '')
                          const newDestino = getLocationKeyFromValue(savedOriginOnLoad || bookingData?.pickupAddress || '') || (savedOriginOnLoad || '')
                          setModalForm((prev:any) => ({
                            ...prev,
                            tipo: "traslado",
                            origen: newOrigen,
                            destino: newDestino,
                            pickupAddress: bookingData?.dropoffAddress || prev.pickupAddress || '',
                            dropoffAddress: bookingData?.pickupAddress || prev.dropoffAddress || '',
                          }))
                          // reset flag
                          returnInitiatedRef.current = false
                        } else {
                          setModalForm((prev:any) => ({
                            ...prev,
                            tipo: "traslado",
                            origen: prev.origen || '',
                            destino: prev.destino || '',
                          }))
                        }
                        setModalStep(2)
                      }}
                    >
                      <Car className="w-5 h-5" />
                      {bookingForm?.typePicker?.trasladoLabel || 'Traslado'}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant={modalForm.tipo === "tour" ? "default" : "outline"}
                      className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${modalForm.tipo === "tour" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                      aria-pressed={modalForm.tipo === "tour"}
                      onClick={() => {
                        setModalForm((prev:any) => ({
                          ...prev,
                          tipo: "tour",
                          origen: "",
                          destino: "",
                          tipoTour: '',
                          categoriaTour: '',
                          subtipoTour: '' as any,
                        }))
                        setModalStep(2)
                      }}
                    >
                      <Map className="w-5 h-5" />
                      {bookingForm?.typePicker?.tourLabel || 'Tour'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Campos principales (copiado desde hero, adaptado a modalForm) */}
            {modalStep === 2 && (
              <>
                {/* Título dinámico según tipo de reserva */}
                <h4 className="text-xl font-semibold text-center mb-2">
                  {modalForm.tipo === "traslado"
                    ? "Cotización Traslado"
                    : modalForm.tipo === "tour"
                    ? "Cotización Tour"
                    : "Cotización"}
                </h4>
                <div className="space-y-4">
                  {/* Campos para traslado */}
                  {modalForm.tipo === "traslado" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          {`Origen${modalForm.origen ? ` ${(labelMap[modalForm.origen as keyof typeof labelMap] || modalForm.origen)}` : ''}`}
                        </label>
                        <Select
                          value={modalForm.origen}
                          onValueChange={(value) => setModalForm({ ...modalForm, origen: value, destino: "" })}
                        >
                          <SelectTrigger data-modal-field="origen" className={"cursor-pointer " + (modalFieldErrors.origen ? 'border-destructive focus-visible:ring-destructive' : '')}>
                            <SelectValue placeholder="Seleccionar origen" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(labelMap).map((k) => (
                              <SelectItem key={k} value={k}>{labelMap[k as keyof typeof labelMap]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          {`Destino${modalForm.destino ? ` ${(labelMap[modalForm.destino as keyof typeof labelMap] || modalForm.destino)}` : ''}`}
                        </label>
                        <Select value={modalForm.destino} onValueChange={(value) => setModalForm({ ...modalForm, destino: value })}>
                          <SelectTrigger data-modal-field="destino" disabled={!modalForm.origen} className={"cursor-pointer disabled:cursor-not-allowed " + (modalFieldErrors.destino ? 'border-destructive focus-visible:ring-destructive' : '')}>
                            <SelectValue placeholder={modalForm.origen ? "Seleccionar destino" : "Selecciona el origen primero"} />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDestinations && availableDestinations.length > 0 ? (
                              availableDestinations.map((d) => (
                                <SelectItem key={d} value={d}>{labelMap[d as keyof typeof labelMap] || d}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="-" disabled>
                                {modalForm.origen ? "No hay destinos disponibles" : "Selecciona el origen primero"}
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          {bookingForm?.dateField?.label || 'Fecha'}
                        </label>
                        <Input
                          data-modal-field="date"
                          type="date"
                          min={minDateStr}
                          value={modalForm.date}
                          onChange={(e) => { setModalForm({ ...modalForm, date: e.target.value }); if (modalFieldErrors.date) setModalFieldErrors(f=>{const c={...f}; delete c.date; return c}) }}
                          className={modalFieldErrors.date ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent" />
                          {bookingForm?.timeField?.label || 'Hora'}
                        </label>
                        <Input
                          data-modal-field="time"
                          type="time"
                          value={modalForm.time}
                          onChange={(e) => { setModalForm({ ...modalForm, time: e.target.value }); if (modalFieldErrors.time) setModalFieldErrors(f=>{const c={...f}; delete c.time; return c}) }}
                          className={modalFieldErrors.time ? 'border-destructive focus-visible:ring-destructive' : ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-accent" />
                          Pasajeros
                        </label>
                        <Select
                          value={String(modalForm.passengers)}
                          onValueChange={(value) => setModalForm({ ...modalForm, passengers: String(value) })}
                        >
                          <SelectTrigger data-modal-field="passengers" className={"cursor-pointer " + (modalFieldErrors.passengers ? 'border-destructive focus-visible:ring-destructive' : '')}>
                            <SelectValue placeholder={`Número de pasajeros (máx. ${getVehicleCap(modalForm.vehicle)})`} />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {Array.from({ length: getVehicleCap(modalForm.vehicle) }, (_, i) => i + 1).map((n) => (
                              <SelectItem key={n} value={String(n)}>
                                {n} {n === 1 ? "Pasajero" : "Pasajeros"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-accent" />
                          Niños (0-12)
                        </label>
                        <Select
                          value={String(modalForm.ninos ?? 0)}
                          onValueChange={value => {
                            const maxNinos = parsePassengers(modalForm.passengers as any)
                            let n = Number(value)
                            if (n > maxNinos) n = maxNinos
                            setModalForm({ ...modalForm, ninos: n })
                          }}
                        >
                          <SelectTrigger data-modal-field="ninos" className="cursor-pointer">
                            <SelectValue>
                              {modalForm.ninos === 0 || modalForm.ninos ? `${modalForm.ninos} ${modalForm.ninos === 1 ? 'niño' : 'niños'}` : 'Cantidad de niños'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {Array.from({ length: parsePassengers(modalForm.passengers as any) + 1 }, (_, i) => i).map((n) => (
                              <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col md:flex-row gap-4 col-span-2">
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Car className="w-4 h-4 text-accent" />
                            Tipo de vehículo
                          </label>
                          <Select
                            value={modalForm.vehicle}
                            onValueChange={(value) => {
                              const cap = getVehicleCap(value)
                              const pax = parsePassengers(modalForm.passengers as any)
                              const clamped = Math.min(Math.max(pax, 1), cap)
                              setModalForm({ ...modalForm, vehicle: value, passengers: String(clamped) })
                            }}
                          >
                            <SelectTrigger data-modal-field="vehicle" className="cursor-pointer">
                              <SelectValue placeholder="Selecciona: Coche, Minivan o Van" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="coche">Coche</SelectItem>
                              <SelectItem value="minivan">Minivan</SelectItem>
                              <SelectItem value="van">Van</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* round-trip option removed */}
                      </div>
                    </div>
                  )}
                  {/* Campos para tour */}
                  {modalForm.tipo === "tour" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(toursList) && toursList.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Map className="w-4 h-4 text-accent" />
                              Tour
                            </label>
                            <Select
                              value={modalForm.selectedTourSlug}
                              onValueChange={(value) => setModalForm({ ...modalForm, selectedTourSlug: value })}
                            >
                              <SelectTrigger data-modal-field="selectedTourSlug" className="cursor-pointer">
                                <SelectValue placeholder="Selecciona un tour" />
                              </SelectTrigger>
                              <SelectContent portal={false} className="max-h-72">
                                {toursList.map((t, idx) => (
                                  <SelectItem key={idx} value={t.slug || t.title}>{t.title}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Plane className="w-4 h-4 text-accent" />
                            Tipo de tour
                          </label>
                          <Select
                            value={modalForm.categoriaTour === "escala" ? "escala" : modalForm.subtipoTour || ""}
                            onValueChange={(value) => {
                              if (value === "escala") {
                                setModalForm({
                                  ...modalForm,
                                  categoriaTour: "escala",
                                  subtipoTour: "",
                                  tipoTour: "escala",
                                  selectedTourSlug: "",
                                })
                              } else {
                                setModalForm({
                                  ...modalForm,
                                  categoriaTour: "ciudad",
                                  subtipoTour: value as any,
                                  tipoTour: value as any,
                                  selectedTourSlug: "",
                                })
                              }
                            }}
                          >
                            <SelectTrigger data-modal-field="categoriaTour" className={"cursor-pointer " + (modalFieldErrors.categoriaTour ? 'border-destructive focus-visible:ring-destructive' : '')}>
                                  <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                            <SelectContent portal={false}>
                              <SelectItem value="diurno">Tour diurno</SelectItem>
                              <SelectItem value="nocturno">Tour nocturno</SelectItem>
                              <SelectItem value="escala">Tour escala</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" />
                            {bookingForm?.dateField?.label || 'Fecha'}
                          </label>
                          <Input
                            data-modal-field="date"
                            type="date"
                            min={minDateStr}
                            value={modalForm.date}
                            onChange={(e) => { setModalForm({ ...modalForm, date: e.target.value }); if (modalFieldErrors.date) setModalFieldErrors(f=>{const c={...f}; delete c.date; return c}) }}
                            className={modalFieldErrors.date ? 'border-destructive focus-visible:ring-destructive' : ''}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4 text-accent" />
                            {bookingForm?.timeField?.label || 'Hora'}
                          </label>
                          <Input
                            data-modal-field="time"
                            type="time"
                            value={modalForm.time}
                            onChange={(e) => { setModalForm({ ...modalForm, time: e.target.value }); if (modalFieldErrors.time) setModalFieldErrors(f=>{const c={...f}; delete c.time; return c}) }}
                            className={modalFieldErrors.time ? 'border-destructive focus-visible:ring-destructive' : ''}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            {bookingForm?.passengersField?.label || 'Pasajeros'}
                          </label>
                          <Select
                            value={String(modalForm.passengers)}
                            onValueChange={(value) => setModalForm({ ...modalForm, passengers: value })}
                          >
                            <SelectTrigger data-modal-field="passengers" className={"cursor-pointer " + (modalFieldErrors.passengers ? 'border-destructive focus-visible:ring-destructive' : '')}>
                              <SelectValue placeholder={`Número de pasajeros (máx. ${getVehicleCap(modalForm.vehicle)})`} />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {Array.from({ length: getVehicleCap(modalForm.vehicle) }, (_, i) => i + 1).map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n} {n === 1 ? (bookingForm?.passengersField?.singular || 'Pasajero') : (bookingForm?.passengersField?.plural || 'Pasajeros')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            Niños (0-12)
                          </label>
                          <Select
                            value={String(modalForm.ninos ?? 0)}
                            onValueChange={value => {
                              const maxNinos = parsePassengers(modalForm.passengers as any)
                              let n = Number(value)
                              if (n > maxNinos) n = maxNinos
                              setModalForm({ ...modalForm, ninos: n })
                            }}
                          >
                            <SelectTrigger data-modal-field="ninos" className="cursor-pointer">
                              <SelectValue>
                                {modalForm.ninos === 0 || modalForm.ninos ? `${modalForm.ninos} ${modalForm.ninos === 1 ? 'niño' : 'niños'}` : 'Cantidad de niños'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {Array.from({ length: parsePassengers(modalForm.passengers as any) + 1 }, (_, i) => i).map((n) => (
                                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Car className="w-4 h-4 text-accent" />
                            {bookingForm?.vehicleField?.label || 'Tipo de vehículo'}
                          </label>
                          <Select
                            value={modalForm.vehicle}
                            onValueChange={(value) => {
                              const cap = getVehicleCap(value)
                              const pax = parsePassengers(modalForm.passengers as any)
                              const clamped = Math.min(Math.max(pax, 1), cap)
                              setModalForm({ ...modalForm, vehicle: value, passengers: String(clamped) })
                            }}
                          >
                            <SelectTrigger data-modal-field="vehicle" className="cursor-pointer">
                              <SelectValue placeholder="Selecciona: Coche, Minivan o Van" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="coche">{bookingForm?.vehicleField?.labelCoche || 'Coche (4 personas)'}</SelectItem>
                              <SelectItem value="minivan">{bookingForm?.vehicleField?.labelMinivan || 'Minivan (6 pasajeros)'}</SelectItem>
                              <SelectItem value="van">{bookingForm?.vehicleField?.labelVan || 'Van (8 pasajeros)'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Notas de equipaje para Minivan con 5 o 6 pasajeros */}
                      {modalForm.vehicle === "minivan" && (() => {
                        const pax = parsePassengers(modalForm.passengers as any)
                        if (pax === 6) {
                          return (
                            <p className="text-xs text-muted-foreground text-center">
                              {bookingForm?.notes?.minivan6 || 'Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero.'}
                            </p>
                          )
                        }
                        if (pax === 5) {
                          return (
                            <p className="text-xs text-muted-foreground text-center">
                              {bookingForm?.notes?.minivan5 || 'Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg.'}
                            </p>
                          )
                        }
                        return null
                      })()}
                    </>
                  )}

                  {/* Nota: los campos de direcciones/equipaje/vuelo se completan en el Paso 3 tras la información de contacto */}
                </div>
              </>
            )}

            {/* Paso 3: Información de contacto */}
            {modalStep === 3 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Información de contacto</h4>
                  <div>
                    <label className="text-xs">Nombre completo</label>
                    <Input data-modal-field="contactName" value={modalForm.contactName || ''} onChange={(e)=>setModalForm((s:any)=>({...s, contactName: e.target.value}))} className={modalFieldErrors.contactName ? 'border-destructive' : ''} />
                    {modalFieldErrors.contactName && <p className="text-xs text-destructive mt-1">{modalFieldErrors.contactName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs">Teléfono</label>
                      <PhoneInputIntl
  value={bookingData.contactPhone || ''}
  onChange={value => updateBookingField('contactPhone', value)}
  inputProps={{
    name: 'contactPhone',
    className: fieldErrors.contactPhone ? 'border-destructive focus-visible:ring-destructive' : ''
  }}
/>
                      {modalFieldErrors.contactPhone && <p className="text-xs text-destructive mt-1">{modalFieldErrors.contactPhone}</p>}
                    </div>
                    <div>
                      <label className="text-xs">Email</label>
                      <EmailAutocomplete
  value={modalForm.contactEmail || ''}
  onChange={value => setModalForm((s:any)=>({...s, contactEmail: value}))}
  className={modalFieldErrors.contactEmail ? 'border-destructive' : ''}
  name="contactEmail"
  data-modal-field="contactEmail"
  onBlur={e => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(String(e.target.value))) setModalFieldErrors(fe => ({...fe, contactEmail: 'Formato inválido'}))
    else setModalFieldErrors(fe => { const c = {...fe}; delete c.contactEmail; return c })
  }}
/>
                      {modalFieldErrors.contactEmail && <p className="text-xs text-destructive mt-1">{modalFieldErrors.contactEmail}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs">Solicitudes especiales (opcional)</label>
                    <Input value={modalForm.specialRequests || ''} onChange={(e)=>setModalForm((s:any)=>({...s, specialRequests: e.target.value}))} />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 4: Direcciones y equipaje (final) */}
            {modalStep === 4 && (
              <div className="space-y-3">
                <div className="space-y-3 p-3 bg-muted/10 rounded">
                  <h4 className="font-medium">Direcciones y equipaje</h4>
                  <div>
                    <label className="text-xs">Origen - Ubicación exacta</label>
                    <Input data-modal-field="pickupAddress" placeholder="Ubicación exacta" value={modalForm.pickupAddress || ''} onChange={(e)=>setModalForm((s:any)=>({...s, pickupAddress: e.target.value}))} className={modalFieldErrors.pickupAddress ? 'border-destructive' : ''} />
                    {modalFieldErrors.pickupAddress && <p className="text-xs text-destructive mt-1">{modalFieldErrors.pickupAddress}</p>}
                  </div>
                  <div>
                    <label className="text-xs">Destino - Ubicación exacta</label>
                    <Input data-modal-field="dropoffAddress" placeholder="Ubicación exacta" value={modalForm.dropoffAddress || ''} onChange={(e)=>setModalForm((s:any)=>({...s, dropoffAddress: e.target.value}))} className={modalFieldErrors.dropoffAddress ? 'border-destructive' : ''} />
                    {modalFieldErrors.dropoffAddress && <p className="text-xs text-destructive mt-1">{modalFieldErrors.dropoffAddress}</p>}
                  </div>
                  <div>
                    <label className="text-xs">Número de Vuelo (opcional)</label>
                    <Input placeholder="AF1234, BA456" value={modalForm.flightNumber || ''} onChange={(e)=>setModalForm((s:any)=>({...s, flightNumber: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs"># Maletas 23kg</label>
                      <Input data-modal-field="luggage23kg" type="number" min={0} value={modalForm.luggage23kg ?? 0} onChange={(e)=>setModalForm((s:any)=>({...s, luggage23kg: Number(e.target.value)}))} />
                      {modalFieldErrors.luggage23kg && <p className="text-xs text-destructive mt-1">{modalFieldErrors.luggage23kg}</p>}
                    </div>
                    <div>
                      <label className="text-xs"># Maletas 10kg</label>
                      <Input data-modal-field="luggage10kg" type="number" min={0} value={modalForm.luggage10kg ?? 0} onChange={(e)=>setModalForm((s:any)=>({...s, luggage10kg: Number(e.target.value)}))} />
                      {modalFieldErrors.luggage10kg && <p className="text-xs text-destructive mt-1">{modalFieldErrors.luggage10kg}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controles de navegación */}
              <div className="flex items-center justify-between pt-4">
              <div>
                {modalStep > 1 && <Button variant="outline" size="sm" onClick={()=>{ setModalFieldErrors({}); setModalStep(s=>Math.max(1,s-1)) }}>Atrás</Button>}
              </div>
              <div className="flex items-center gap-2">
                {modalStep < 4 && (
                  <Button size="sm" onClick={handleModalNext} disabled={!validateModalStep(modalStep).valid}>Siguiente</Button>
                )}
                {modalStep === 4 && !modalEditingId && (
                  <Button size="sm" onClick={() => {
                    const ok = handleModalSave(false)
                    if (ok) {
                      // modal already closed in saveModalAsNew
                    }
                  }}>Añadir al carrito</Button>
                )}
                {modalStep === 4 && modalEditingId && (
                  <Button size="sm" onClick={() => {
                    const ok = handleModalSave(true)
                    if (ok) {
                      // modal already closed in updateExistingItem
                    }
                  }}>Guardar cambios</Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  )
}

function EventImagesCarousel({ images, shortInfo }: { images: string[]; shortInfo?: string }) {
  const apiRef = useRef<CarouselApi | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    const start = () => {
      if (intervalRef.current) return
      intervalRef.current = setInterval(() => {
        apiRef.current?.scrollNext()
      }, 4000)
    }
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    if (!isHover) start()
    return () => stop()
  }, [isHover])

  return (
    <div className="relative" onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
      <Carousel
        className="w-full h-56 sm:h-64 rounded-lg overflow-hidden"
        opts={{ align: "start", loop: true }}
        setApi={(api) => {
          // @ts-ignore: embla type channel
          apiRef.current = api
        }}
      >
        <CarouselContent className="h-full">
          {images.map((src: string, idx: number) => (
            <CarouselItem key={idx} className="h-full">
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Ampliar imagen ${idx + 1}`}
                    className="relative block w-full h-56 sm:h-64"
                  >
                    <img src={src} alt={`Imagen ${idx + 1} del evento`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                  <div className="relative w-full h-[70vh]">
                    <img src={src} alt={`Imagen ${idx + 1} ampliada`} className="w-full h-full object-contain" />
                  </div>
                </DialogContent>
              </Dialog>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      {shortInfo && (
        <p className="mt-3 text-sm text-muted-foreground">{shortInfo}</p>
      )}
    </div>
  )
}
