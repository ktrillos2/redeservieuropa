"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, Car, Map, Plane } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatedSection } from "@/components/animated-section";
import { PortableText } from "@portabletext/react";
import EventsSlider, {
  type EventItem as SliderEventItem,
} from "@/components/events-slider";
import {
  calcBaseTransferPrice,
  getAvailableDestinations as pricingGetAvailableDestinations,
  getGlobalMinBase as pricingGetGlobalMinBase,
  getMinBaseFromOrigin as pricingGetMinBaseFromOrigin,
} from "@/lib/pricing";
import { PhoneInputIntl } from "@/components/ui/phone-input";
import {
  type TransferDoc,
  buildTransfersIndexes,
  computeTransferPrice,
  getOriginLabel,
  getDestinationLabel,
  getFlightRequirements,
} from "@/sanity/lib/transfers";
import { useTranslation } from "@/contexts/i18n-context";

// Traducciones locales como fallback mientras carga
const LOCAL_TRANSLATIONS = {
  en: {
    title: 'Transport',
    highlight: 'Comfortable and safe',
  },
  fr: {
    title: 'Transport',
    highlight: 'Confortable et sûr',
  },
  es: {
    title: 'Transporte',
    highlight: 'Cómodo y Seguro',
  }
}

export function Hero({
  // Props de la sección Hero
  title = "Transporte",
  highlight = "Comodo y Seguro",
  description = [
    {
      _type: "block",
      children: [{ _type: "span", text: "Transporte Privado en París" }],
      markDefs: [],
      style: "normal",
    },
    {
      _type: "block",
      children: [{ _type: "span", text: "Confort, seguridad y puntualidad." }],
      markDefs: [],
      style: "normal",
    },
    {
      _type: "block",
      children: [
        {
          _type: "span",
          text: "Traslados desde/hacia aeropuertos (CDG, ORY, BVA), viajes a Disneyland, tours privados por la ciudad, excursiones a Brujas y mucho más.",
        },
      ],
      markDefs: [],
      style: "normal",
    },
    {
      _type: "block",
      children: [{ _type: "span", text: "Vive París sin preocupaciones." }],
      markDefs: [],
      style: "normal",
    },
  ] as any,
  backgroundUrl,
  primaryCtaLabel = "Reservar Ahora",
  secondaryCtaLabel = "Ver Servicios",
  bookingForm,
  heroTranslations,
  events,
  toursList,
  transfersList,
}: {
  title?: string;
  highlight?: string;
  description?: any;
  backgroundUrl?: string;
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;
  bookingForm?: any;
  heroTranslations?: {
    en?: {
      title?: string;
      highlight?: string;
      description?: any;
      primaryCta?: { label?: string };
      secondaryCta?: { label?: string };
      bookingForm?: any;
    };
    fr?: {
      title?: string;
      highlight?: string;
      description?: any;
      primaryCta?: { label?: string };
      secondaryCta?: { label?: string };
      bookingForm?: any;
    };
    es?: {
      title?: string;
      highlight?: string;
      description?: any;
      primaryCta?: { label?: string };
      secondaryCta?: { label?: string };
      bookingForm?: any;
    };
  };
  events?: SliderEventItem[];
  toursList?: {
    title: string;
    slug?: string;
    basePrice?: number;
    basePriceDay?: number;
    basePriceNight?: number;
  }[];
  transfersList: TransferDoc[];
}) {
  const router = useRouter();
  const { locale } = useTranslation();

  // Estado para las traducciones del hero cargadas dinámicamente
  // Inicializamos con null para forzar carga desde API (no usar props del servidor que pueden estar cacheadas)
  const [clientHeroTranslations, setClientHeroTranslations] = useState<typeof heroTranslations | null>(null);

  // Cargar traducciones del hero cuando cambie el locale
  // SIEMPRE hace fetch desde la API para obtener datos frescos (sin cache)
  useEffect(() => {
    async function loadHeroTranslations() {
      try {
        // Fetch las traducciones del hero desde Sanity (para TODOS los idiomas, incluyendo español)
        // Agregamos cache: 'no-store' y timestamp para forzar request fresco
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/hero-translations?locale=${locale}&t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Hero] Traducciones cargadas desde API para', locale, data);
          if (data.translations) {
            setClientHeroTranslations(data.translations);
          }
        } else {
          console.warn('[Hero] Error en respuesta API:', response.status);
          // Fallback a las props del servidor solo si la API falla
          setClientHeroTranslations(heroTranslations);
        }
      } catch (error) {
        console.error('[Hero] Error cargando traducciones:', error);
        // Fallback a las props del servidor en caso de error
        setClientHeroTranslations(heroTranslations);
      }
    }

    loadHeroTranslations();
  }, [locale]);

  // Debug: Verificar locale y traducciones
  useEffect(() => {
    console.log('[Hero Debug] Locale actual:', locale);
    console.log('[Hero Debug] clientHeroTranslations disponibles:', clientHeroTranslations ? Object.keys(clientHeroTranslations) : 'undefined');
    if (locale !== 'es' && clientHeroTranslations) {
      console.log('[Hero Debug] Traducción para locale actual:', locale === 'en' ? clientHeroTranslations.en : clientHeroTranslations.fr);
    }
  }, [locale, clientHeroTranslations]);

  // Aplicar traducciones del hero según el idioma seleccionado
  // Usar useMemo para que se recalculen cuando cambie el locale
  const translatedTitle = useMemo(() => {
    // Primero, intentar usar las traducciones de Sanity desde la API
    if (clientHeroTranslations) {
      const translation = locale === 'en' ? clientHeroTranslations.en : 
                         locale === 'fr' ? clientHeroTranslations.fr : 
                         clientHeroTranslations.es;
      if (translation?.title) {
        console.log('[Hero Debug] translatedTitle desde Sanity:', translation.title, 'para locale:', locale);
        return translation.title;
      }
    }
    
    // Fallback a traducciones locales
    const localTranslation = LOCAL_TRANSLATIONS[locale as keyof typeof LOCAL_TRANSLATIONS];
    if (localTranslation?.title) {
      console.log('[Hero Debug] translatedTitle desde LOCAL:', localTranslation.title, 'para locale:', locale);
      return localTranslation.title;
    }
    
    // Último fallback: prop del servidor
    return title;
  }, [locale, clientHeroTranslations, title]);

  const translatedHighlight = useMemo(() => {
    // Primero, intentar usar las traducciones de Sanity desde la API
    if (clientHeroTranslations) {
      const translation = locale === 'en' ? clientHeroTranslations.en : 
                         locale === 'fr' ? clientHeroTranslations.fr : 
                         clientHeroTranslations.es;
      if (translation?.highlight) {
        return translation.highlight;
      }
    }
    
    // Fallback a traducciones locales
    const localTranslation = LOCAL_TRANSLATIONS[locale as keyof typeof LOCAL_TRANSLATIONS];
    if (localTranslation?.highlight) {
      return localTranslation.highlight;
    }
    
    // Último fallback: prop del servidor
    return highlight;
  }, [locale, clientHeroTranslations, highlight]);

  const translatedDescription = useMemo(() => {
    if (!clientHeroTranslations) return description;
    const translation = locale === 'en' ? clientHeroTranslations.en : 
                       locale === 'fr' ? clientHeroTranslations.fr : 
                       clientHeroTranslations.es;
    const result = translation?.description || description;
    console.log('[Hero Debug] translatedDescription:', result, 'para locale:', locale);
    return result;
  }, [locale, clientHeroTranslations, description]);

  const translatedPrimaryCtaLabel = useMemo(() => {
    if (!clientHeroTranslations) return primaryCtaLabel;
    const translation = locale === 'en' ? clientHeroTranslations.en : 
                       locale === 'fr' ? clientHeroTranslations.fr : 
                       clientHeroTranslations.es;
    const result = translation?.primaryCta?.label || primaryCtaLabel;
    console.log('[Hero Debug] translatedPrimaryCtaLabel:', result, 'para locale:', locale);
    return result;
  }, [locale, clientHeroTranslations, primaryCtaLabel]);

  const translatedSecondaryCtaLabel = useMemo(() => {
    if (!clientHeroTranslations) return secondaryCtaLabel;
    const translation = locale === 'en' ? clientHeroTranslations.en : 
                       locale === 'fr' ? clientHeroTranslations.fr : 
                       clientHeroTranslations.es;
    const result = translation?.secondaryCta?.label || secondaryCtaLabel;
    console.log('[Hero Debug] translatedSecondaryCtaLabel:', result, 'para locale:', locale);
    return result;
  }, [locale, clientHeroTranslations, secondaryCtaLabel]);

  const translatedBookingForm = useMemo(() => {
    if (!clientHeroTranslations) return bookingForm;
    const translation = locale === 'en' ? clientHeroTranslations.en : 
                       locale === 'fr' ? clientHeroTranslations.fr : 
                       clientHeroTranslations.es;
    return translation?.bookingForm ? { ...bookingForm, ...translation.bookingForm } : bookingForm;
  }, [locale, clientHeroTranslations, bookingForm]);

  // Traducciones del formulario desde Sanity
  const bookingTexts = useMemo(() => {
    // Si hay traducciones del bookingForm desde Sanity, usarlas
    if (translatedBookingForm) {
      const bf = translatedBookingForm;
      return {
        // Type picker
        transferLabel: bf.typePicker?.trasladoLabel || (locale === 'es' ? 'Traslado' : locale === 'en' ? 'Transfer' : 'Transfert'),
        tourLabel: bf.typePicker?.tourLabel || (locale === 'es' ? 'Tour' : 'Tour'),
        
        // Titles
        quotationTransfer: locale === 'es' ? 'Cotización Traslado' : locale === 'en' ? 'Transfer Quote' : 'Devis Transfert',
        quotationTour: locale === 'es' ? 'Cotización Tour' : locale === 'en' ? 'Tour Quote' : 'Devis Tour',
        quotation: locale === 'es' ? 'Cotización Rápida' : locale === 'en' ? 'Quick Quote' : 'Devis Rapide',
        back: locale === 'es' ? 'Volver' : locale === 'en' ? 'Back' : 'Retour',
        bookYourService: bf.title || (locale === 'es' ? 'Reserva tu Servicio' : locale === 'en' ? 'Book Your Service' : 'Réservez Votre Service'),
        bookingTypeLabel: bf.typePicker?.label || (locale === 'es' ? 'Tipo de reserva' : locale === 'en' ? 'Service Type' : 'Type de Service'),
        
        // Origin
        origin: bf.originField?.label || (locale === 'es' ? 'Origen' : locale === 'en' ? 'Origin' : 'Origine'),
        originPlaceholder: bf.originField?.placeholder || (locale === 'es' ? 'Seleccionar origen' : locale === 'en' ? 'Select origin' : 'Sélectionnez l\'origine'),
        
        // Destination
        destination: bf.destinationField?.label || (locale === 'es' ? 'Destino' : locale === 'en' ? 'Destination' : 'Destination'),
        destinationPlaceholder: bf.destinationField?.placeholder || (locale === 'es' ? 'Seleccionar destino' : locale === 'en' ? 'Select destination' : 'Sélectionnez la destination'),
        selectOriginFirst: bf.destinationField?.selectOriginFirst || (locale === 'es' ? 'Seleccione primero el origen' : locale === 'en' ? 'Select origin first' : 'Sélectionnez d\'abord l\'origine'),
        noDestinations: bf.destinationField?.noDestinations || (locale === 'es' ? 'No hay destinos disponibles' : locale === 'en' ? 'No destinations available' : 'Aucune destination disponible'),
        
        // Date & Time
        date: bf.dateField?.label || (locale === 'es' ? 'Fecha' : locale === 'en' ? 'Date' : 'Date'),
        time: bf.timeField?.label || (locale === 'es' ? 'Hora' : locale === 'en' ? 'Time' : 'Heure'),
        
        // Passengers & Children
        passengers: bf.passengersField?.label || (locale === 'es' ? 'Pasajeros' : locale === 'en' ? 'Passengers' : 'Passagers'),
        children: bf.childrenField?.label || (locale === 'es' ? 'Niños' : locale === 'en' ? 'Children' : 'Enfants'),
        passengersSingular: locale === 'es' ? 'Pasajero' : locale === 'en' ? 'Passenger' : 'Passager',
        passengersPlural: locale === 'es' ? 'Pasajeros' : locale === 'en' ? 'Passengers' : 'Passagers',
        childrenSingular: locale === 'es' ? 'niño' : locale === 'en' ? 'child' : 'enfant',
        childrenPlural: locale === 'es' ? 'niños' : locale === 'en' ? 'children' : 'enfants',
        childrenQuantity: locale === 'es' ? 'Cantidad de niños' : locale === 'en' ? 'Number of children' : 'Nombre d\'enfants',
        passengersMax: locale === 'es' ? 'Número de pasajeros (máx.' : locale === 'en' ? 'Number of passengers (max.' : 'Nombre de passagers (max.',
        
        // Vehicle
        vehiclePlaceholder: bf.vehicleField?.placeholder || (locale === 'es' ? 'Seleccionar tipo de vehículo' : locale === 'en' ? 'Select vehicle type' : 'Sélectionnez le véhicule'),
        vehicleLabel: bf.vehicleField?.label || (locale === 'es' ? 'Tipo de vehículo' : locale === 'en' ? 'Vehicle type' : 'Véhicule'),
        car: bf.vehicleField?.labelCoche || (locale === 'es' ? 'Coche' : locale === 'en' ? 'Car' : 'Voiture'),
        minivan: bf.vehicleField?.labelMinivan || (locale === 'es' ? 'Minivan' : 'Minivan'),
        van: bf.vehicleField?.labelVan || (locale === 'es' ? 'Van' : 'Van'),
        
        // Tour type
        tourTypePlaceholder: bf.tourTypeField?.placeholder || (locale === 'es' ? 'Seleccionar tipo de tour' : locale === 'en' ? 'Select tour type' : 'Sélectionnez le type'),
        tourTypeLabel: bf.tourTypeField?.label || (locale === 'es' ? 'Tipo de tour' : locale === 'en' ? 'Tour type' : 'Type de Tour'),
        tourLabel2: locale === 'es' ? 'Tour' : 'Tour',
        dayTour: bf.tourTypeField?.dayLabel || (locale === 'es' ? 'Tour Diurno' : locale === 'en' ? 'Day Tour' : 'Tour de Jour'),
        nightTour: bf.tourTypeField?.nightLabel || (locale === 'es' ? 'Tour Nocturno' : locale === 'en' ? 'Night Tour' : 'Tour de Nuit'),
        stopoverTour: bf.tourTypeField?.stopoverTour || (locale === 'es' ? 'Tour de Escala' : locale === 'en' ? 'Stopover Tour' : 'Tour d\'Escale'),
        selectTour: bf.tourSelectField?.label || (locale === 'es' ? 'Seleccionar un tour' : locale === 'en' ? 'Select a tour' : 'Sélectionner un tour'),
        
        // Button
        quote: bf.buttons?.quote || (locale === 'es' ? 'Cotizar' : locale === 'en' ? 'Get Quote' : 'Obtenir un Devis'),
        
        // Messages
        missingFields: locale === 'es' ? 'Campos faltantes:' : locale === 'en' ? 'Missing fields:' : 'Champs manquants:',
        timeValidation: locale === 'es' ? 'La hora debe ser al menos 45 minutos después de la hora actual' : locale === 'en' ? 'Time must be at least 45 minutes from now' : 'L\'heure doit être au moins 45 minutes à partir de maintenant',
        
        // Field labels for error messages
        fieldBookingType: locale === 'es' ? 'Tipo de reserva' : locale === 'en' ? 'Booking type' : 'Type de réservation',
        fieldOrigin: locale === 'es' ? 'Origen' : locale === 'en' ? 'Origin' : 'Origine',
        fieldDestination: locale === 'es' ? 'Destino' : locale === 'en' ? 'Destination' : 'Destination',
        fieldDate: locale === 'es' ? 'Fecha' : locale === 'en' ? 'Date' : 'Date',
        fieldTime: locale === 'es' ? 'Hora' : locale === 'en' ? 'Time' : 'Heure',
        fieldPassengers: locale === 'es' ? 'Pasajeros' : locale === 'en' ? 'Passengers' : 'Passagers',
        fieldTourCategory: locale === 'es' ? 'Categoría de tour' : locale === 'en' ? 'Tour category' : 'Catégorie de tour',
        fieldVehicle: locale === 'es' ? 'Tipo de vehículo' : locale === 'en' ? 'Vehicle type' : 'Type de véhicule',
        fieldTour: locale === 'es' ? 'Tour' : locale === 'en' ? 'Tour' : 'Tour',
        
        // Vehicle capacity labels
        peopleCapacity: locale === 'es' ? 'personas' : locale === 'en' ? 'people' : 'personnes',
        passengersCapacity: locale === 'es' ? 'pasajeros' : locale === 'en' ? 'passengers' : 'passagers',
      };
    }

    // Fallback to Spanish
    return {
      transferLabel: 'Traslado',
      tourLabel: 'Tour',
      quotationTransfer: 'Cotización Traslado',
      quotationTour: 'Cotización Tour',
      quotation: 'Cotización Rápida',
      back: 'Volver',
      origin: 'Origen',
      originPlaceholder: 'Seleccionar origen',
      destination: 'Destino',
      destinationPlaceholder: 'Seleccionar destino',
      selectOriginFirst: 'Seleccione primero el origen',
      noDestinations: 'No hay destinos disponibles',
      date: 'Fecha',
      time: 'Hora',
      passengers: 'Pasajeros',
      children: 'Niños',
      vehiclePlaceholder: 'Seleccionar tipo de vehículo',
      vehicleLabel: 'Tipo de vehículo',
      car: 'Coche',
      minivan: 'Minivan',
      van: 'Van',
      tourTypePlaceholder: 'Seleccionar tipo de tour',
      tourTypeLabel: 'Tipo de tour',
      tourLabel2: 'Tour',
      dayTour: 'Tour Diurno',
      nightTour: 'Tour Nocturno',
      stopoverTour: 'Tour de Escala',
      selectTour: 'Seleccionar un tour',
      passengersSingular: 'Pasajero',
      passengersPlural: 'Pasajeros',
      childrenSingular: 'niño',
      childrenPlural: 'niños',
      childrenQuantity: 'Cantidad de niños',
      passengersMax: 'Número de pasajeros (máx.',
      quote: 'Cotizar',
      missingFields: 'Campos faltantes:',
      timeValidation: 'La hora debe ser al menos 45 minutos después de la hora actual',
      fieldBookingType: 'Tipo de reserva',
      fieldOrigin: 'Origen',
      fieldDestination: 'Destino',
      fieldDate: 'Fecha',
      fieldTime: 'Hora',
      fieldPassengers: 'Pasajeros',
      fieldTourCategory: 'Categoría de tour',
      fieldVehicle: 'Tipo de vehículo',
      fieldTour: 'Tour',
      bookYourService: 'Reserva tu Servicio',
      bookingTypeLabel: 'Tipo de reserva',
      peopleCapacity: 'personas',
      passengersCapacity: 'pasajeros',
    };
  }, [locale, translatedBookingForm]);

  // Hooks de estado
  const [bookingData, setBookingData] = useState({
    origen: "",
    destino: "",
    fecha: "",
    hora: "",
    pasajeros: "1",
    vehiculo: "coche",
    flightNumber: "",
    pickupAddress: "",
    dropoffAddress: "",
    luggage23kg: 0,
    luggage10kg: 0,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    // idaYVuelta removed: round-trip option deprecated
    ninos: 0, // Selecciona automáticamente 0 niños
    tipoReserva: "traslado" as "" | "traslado" | "tour",
    tipoTour: "" as "diurno" | "nocturno" | "escala" | "",
    categoriaTour: "" as "" | "ciudad" | "escala",
    subtipoTour: "" as "diurno" | "nocturno" | "",
    selectedTourSlug: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showReturn, setShowReturn] = useState(false);
  const [returnData, setReturnData] = useState({
    origen: "",
    destino: "",
    fecha: "",
    hora: "",
    ninos: 0,
  });
  // Paso del formulario
  const [formStep, setFormStep] = useState(1);

  // Fecha mínima: mañana
  const minDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  // Scroll helpers
  const scrollToElement = (id: string) => {
    try {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Pequeño highlight visual opcional
        el.classList.add("ring", "ring-accent/40");
        setTimeout(() => el.classList.remove("ring", "ring-accent/40"), 1200);
      }
    } catch {}
  };

  // === Traslados (desde CMS) ===
  // byOrigin: { [originKey]: { label, destinations: { [destKey]: { label, prices, requireFlightInfo, ... } } } }
  const transfersIdx = useMemo(
    () => buildTransfersIndexes(transfersList || []),
    [transfersList]
  );

  // Claves de origen disponibles y labels helpers
  const originKeys = useMemo(
    () => Object.keys(transfersIdx.byOrigin || {}),
    [transfersIdx]
  );
  const getOriginLabel = (k?: string) => {
    if (!k) return "";
    
    // k es la clave slug-like (normalizada)
    // Obtener el label original del índice
    const originData = transfersIdx.byOrigin?.[k];
    if (!originData) return k;
    
    const originalLabel = originData.label;
    
    // Buscar el transfer usando el label original
    const transfer = transfersList.find(t => t.from === originalLabel);
    
    if (!transfer || !transfer.translations) {
      // Sin traducciones, retornar el label original en español
      return originalLabel;
    }
    
    // Aplicar traducciones según el locale
    if (locale === 'en' && transfer.translations.en?.from) {
      return transfer.translations.en.from;
    }
    if (locale === 'fr' && transfer.translations.fr?.from) {
      return transfer.translations.fr.from;
    }
    
    // Fallback a español
    return originalLabel;
  };

  // Destinos disponibles para el origen seleccionado y helper de label
  const destinationKeys = useMemo(() => {
    if (!bookingData?.origen) return [];
    return Object.keys(
      transfersIdx.byOrigin?.[bookingData.origen]?.destinations || {}
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData?.origen, transfersIdx]);
  
  const getDestinationLabel = (k?: string) => {
    if (!k || !bookingData?.origen) return k || "";
    
    // k y bookingData.origen son claves slug-like (normalizadas)
    // Obtener los labels originales del índice
    const originData = transfersIdx.byOrigin?.[bookingData.origen];
    if (!originData) return k;
    
    const destinationData = originData.destinations?.[k];
    if (!destinationData) return k;
    
    const originalFromLabel = originData.label;
    const originalToLabel = destinationData.label;
    
    // Buscar el transfer usando los labels originales
    const transfer = transfersList.find(
      t => t.from === originalFromLabel && t.to === originalToLabel
    );
    
    if (!transfer || !transfer.translations) {
      // Sin traducciones, retornar el label original en español
      return originalToLabel;
    }
    
    // Aplicar traducciones según el locale
    if (locale === 'en' && transfer.translations.en?.to) {
      return transfer.translations.en.to;
    }
    if (locale === 'fr' && transfer.translations.fr?.to) {
      return transfer.translations.fr.to;
    }
    
    // Fallback a español
    return originalToLabel;
  };

  const handlePrimaryScroll = () => {
    scrollToElement("hero-booking-form");
  };

  const handleSecondaryScroll = () => {
    // Prioridad: sección de servicios ("servicios"), fallback a traslados
    const targetIds = ["servicios", "traslados"];
    for (const id of targetIds) {
      const el = document.getElementById(id);
      if (el) {
        scrollToElement(id);
        return;
      }
    }
  };

  // Helper functions para obtener títulos traducidos
  const getTourTitle = (tour: any): string => {
    if (locale === 'es' || !tour.translations) {
      return tour.title || 'Tour sin título';
    }
    if (locale === 'en' && tour.translations.en?.title) {
      return tour.translations.en.title;
    }
    if (locale === 'fr' && tour.translations.fr?.title) {
      return tour.translations.fr.title;
    }
    // Fallback a español
    return tour.title || 'Tour sin título';
  };

  const getTransferLabel = (from?: string, to?: string): string => {
    // Buscar el transfer completo con traducciones
    const transfer = transfersList.find(t => t.from === from && t.to === to);
    
    if (!transfer) {
      return `${from || 'Origen'} → ${to || 'Destino'}`;
    }

    const fromText = locale === 'es' || !transfer.translations 
      ? transfer.from 
      : (locale === 'en' && transfer.translations.en?.from) || (locale === 'fr' && transfer.translations.fr?.from) || transfer.from;
    
    const toText = locale === 'es' || !transfer.translations 
      ? transfer.to 
      : (locale === 'en' && transfer.translations.en?.to) || (locale === 'fr' && transfer.translations.fr?.to) || transfer.to;
    
    return `${fromText || 'Origen'} → ${toText || 'Destino'}`;
  };

  // Helpers de precios desde módulo compartido
  const getBasePrice = (from?: string, to?: string, pax?: number) =>
    computeTransferPrice(transfersIdx, from, to, pax);

  // Precio mínimo global entre todas las rutas
  const globalMinBase = useMemo(() => pricingGetGlobalMinBase(), []);

  // Precio mínimo "desde" según el origen (si aún no hay destino seleccionado)
  const minBaseFromOrigin = useMemo(
    () => pricingGetMinBaseFromOrigin(bookingData.origen),
    [bookingData.origen]
  );

  const parsePassengers = (paxStr?: string) => {
    const n = parseInt(paxStr || "", 10);
    if (!Number.isFinite(n)) return 1;
    return Math.min(56, Math.max(1, n));
  };

  // Lógicas de vehículo y capacidad
  const vehicleCaps: Record<string, number> = {
    coche: 56,
    minivan: 56,
    van: 56,
  };
  const getVehicleCap = (_v?: string) => 56;

  // Ajustar pasajeros al cambiar de vehículo
  useEffect(() => {
    if (!bookingData.vehiculo) return;
    const cap = getVehicleCap(bookingData.vehiculo);
    const pax = parsePassengers(bookingData.pasajeros);
    const clamped = Math.min(Math.max(pax, 1), cap);
    if (clamped !== pax) {
      setBookingData((bd) => ({ ...bd, pasajeros: String(clamped) }));
    }
  }, [bookingData.vehiculo]);

  // Compute validation errors without side effects (pure)
  const computeValidationErrors = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const pax = parsePassengers(bookingData.pasajeros);
    const cap = getVehicleCap(bookingData.vehiculo);
    if (!bookingData.tipoReserva) errs.tipoReserva = "Requerido";
    if (pax < 1) errs.pasajeros = "≥1";
    if (pax > cap) errs.pasajeros = `Máx ${cap}`;
    if (bookingData.tipoReserva === "traslado") {
      if (!bookingData.origen) errs.origen = "Requerido";
      if (!bookingData.destino) errs.destino = "Requerido";
      if (!bookingData.fecha) errs.fecha = "Requerido";
      else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(bookingData.fecha);
        if (!(selected.getTime() > today.getTime()))
          errs.fecha = "Debe ser posterior a hoy";
      }
      if (!bookingData.hora) errs.hora = "Requerido";
      else if (bookingData.fecha && bookingData.hora) {
        // Validar que la hora sea al menos 45 minutos después de ahora
        const now = new Date();
        const selected = new Date(`${bookingData.fecha}T${bookingData.hora}`);
        const minTime = new Date(now.getTime() + 45 * 60 * 1000); // +45 minutos
        
        if (selected <= minTime) {
          errs.hora = "Debe ser al menos 45 min después";
        }
      }
      // Modal: agregar cotización de regreso al carrito
    } else if (bookingData.tipoReserva === "tour") {
      if (!bookingData.categoriaTour && !bookingData.subtipoTour)
        errs.categoriaTour = "Requerido";
      if (!bookingData.fecha) errs.fecha = "Requerido";
      if (!bookingData.hora) errs.hora = "Requerido";
      else if (bookingData.fecha && bookingData.hora) {
        // Validar que la hora sea al menos 45 minutos después de ahora
        const now = new Date();
        const selected = new Date(`${bookingData.fecha}T${bookingData.hora}`);
        const minTime = new Date(now.getTime() + 45 * 60 * 1000); // +45 minutos
        
        if (selected <= minTime) {
          errs.hora = "Debe ser al menos 45 min después";
        }
      }
    }

    // Validaciones adicionales para el paso final (contacto + direcciones)
    // Solo se aplican cuando estamos en el paso 3 para no bloquear el avance desde el paso 2
    try {
      if (formStep >= 3) {
        if (!bookingData.contactName) errs.contactName = "Requerido";
        if (!bookingData.contactPhone) errs.contactPhone = "Requerido";
        if (bookingData.tipoReserva === "traslado") {
          if (!bookingData.pickupAddress) errs.pickupAddress = "Requerido";
          if (!bookingData.dropoffAddress) errs.dropoffAddress = "Requerido";
          // Allow luggage counts to be zero; do not require explicit luggage fields here
        }
      }
    } catch (e) {}
    return errs;
  };

  // Validation specifically for advancing from paso 2 -> paso 3.
  // This ignores contact/address-specific errors which belong to paso 3.
  const computeStep2Errors = (): Record<string, string> => {
    const errs = computeValidationErrors();
    // Remove errors that are only relevant to step 3 (contact / addresses / luggage)
    const step3Only = [
      "contactName",
      "contactPhone",
      "contactEmail",
      "pickupAddress",
      "dropoffAddress",
      "luggage23kg",
      "luggage10kg",
      "flightNumber",
    ];
    for (const k of step3Only) delete errs[k];

    // Enforce some additional required fields for paso 2 that weren't cubiertos
    // previamente: vehiculo y, si aplica, selección de tour.
    if (!bookingData.vehiculo) errs.vehiculo = "Requerido";
    const pax = parsePassengers(bookingData.pasajeros);
    if (!bookingData.pasajeros || pax < 1) errs.pasajeros = "≥1";
    
    // Validación de tiempo (45 minutos mínimos) para ambos tipos
    if (bookingData.fecha && bookingData.hora) {
      const now = new Date();
      const selected = new Date(`${bookingData.fecha}T${bookingData.hora}`);
      const minTime = new Date(now.getTime() + 45 * 60 * 1000); // +45 minutos
      
      if (selected <= minTime) {
        errs.hora = "Debe ser al menos 45 min después";
      }
    }
    
    if (bookingData.tipoReserva === "tour") {
      // Si hay una lista de tours visible, exigir selección explícita
      if (Array.isArray(toursList) && toursList.length > 0) {
        if (!bookingData.selectedTourSlug) errs.selectedTourSlug = "Requerido";
      } else {
        if (!bookingData.categoriaTour && !bookingData.subtipoTour)
          errs.categoriaTour = "Requerido";
      }
    }
    return errs;
  };

  // Pure boolean check without side effects (safe for render)
  const validateHard = (): boolean => {
    const errs = computeValidationErrors();
    return Object.keys(errs).length === 0;
  };

  // Derived boolean for UI and a human-friendly map of field labels
  const isFormValid = useMemo(() => validateHard(), [bookingData]);
  const fieldLabelMap: Record<string, string> = useMemo(() => ({
    tipoReserva: bookingTexts.fieldBookingType,
    origen: bookingTexts.fieldOrigin,
    destino: bookingTexts.fieldDestination,
    fecha: bookingTexts.fieldDate,
    hora: bookingTexts.fieldTime,
    pasajeros: bookingTexts.fieldPassengers,
    categoriaTour: bookingTexts.fieldTourCategory,
    vehiculo: bookingTexts.fieldVehicle,
    selectedTourSlug: bookingTexts.fieldTour,
  }), [bookingTexts]);

  const isNightTime = (timeStr?: string) => {
    if (!timeStr) return false;
    const [hh] = timeStr.split(":").map((x) => parseInt(x, 10));
    if (!Number.isFinite(hh)) return false;
    // Considerar nocturno desde 21:00 hasta 05:59
    return hh >= 21 || hh < 6;
  };

  const quote = useMemo(() => {
    const pax = parsePassengers(bookingData.pasajeros);
    const base = getBasePrice(bookingData.origen, bookingData.destino, pax);
    if (base == null) return null;
    const night = isNightTime(bookingData.hora);

    // Tarifas adicionales según la sección actual del sitio
    const nightCharge = night ? 5 : 0;
    // Nota: base ya incorpora precios hasta 8 pax; >8 pax se prorratea +20€/pax en el helper
    const extraPax = Math.max(0, pax - 8);
    const extraPaxCharge = extraPax * 20;

    let total = base + nightCharge + extraPaxCharge;
    return {
      base,
      nightCharge,
      extraPax,
      extraPaxCharge,
      total,
    };
  }, [
    bookingData.origen,
    bookingData.destino,
    bookingData.hora,
    bookingData.pasajeros,
    bookingData.vehiculo,
  ]);

  // Estimación de precio para Tours según reglas provistas
  const tourQuote = useMemo(() => {
    if (bookingData.tipoReserva !== "tour") return null;
    const pax = parsePassengers(bookingData.pasajeros);
    const veh = bookingData.vehiculo;
    const cat =
      bookingData.categoriaTour ||
      (bookingData.tipoTour === "escala" ? "escala" : "ciudad");
    const sub =
      bookingData.subtipoTour ||
      (bookingData.tipoTour === "escala" ? "" : bookingData.tipoTour);

    // Si hay un tour específico seleccionado desde CMS, usar su tarifa base diurna/nocturna como referencia
    if (bookingData.selectedTourSlug) {
      const t = (toursList || []).find(
        (x) => (x.slug || x.title) === bookingData.selectedTourSlug
      );
      if (t) {
        const isNight = sub === "nocturno" || isNightTime(bookingData.hora);
        const rate = isNight
          ? (t.basePriceNight ?? t.basePrice ?? 0)
          : (t.basePriceDay ?? t.basePrice ?? 0);
        const hours = isNight ? 3 : 2;
        const extraPax = Math.max(0, pax - 4);
        const extraPerHour = 10 * extraPax;
        const total = rate * hours + extraPerHour * hours;
        return {
          total,
          label: `Estimado: ${total}€ (${hours}h ${isNight ? "nocturno" : "diurno"})`,
        };
      }
    }

    // Tour ciudad nocturno en Minivan: base 400€ desde 6 pax, incluye hasta 8; extra >8: +20€/pax
    if (
      cat === "ciudad" &&
      sub === "nocturno" &&
      veh === "minivan" &&
      pax >= 6
    ) {
      const includedMax = 8;
      const extra = Math.max(0, pax - includedMax) * 20;
      return {
        total: 400 + extra,
        label: `Precio: 400€ (Van 6–8 pasajeros)${extra > 0 ? ` + ${extra}€ por ${pax - includedMax} extra(s)` : ""}`,
      };
    }

    // Tour escala desde 5 pax: 5–8 pax mapeado, >8 añade +20€/pax por extra
    if (cat === "escala" && pax >= 5) {
      const mapping: Record<number, number> = {
        5: 270,
        6: 290,
        7: 320,
        8: 350,
      };
      const includedMax = 8;
      const baseAtCap = mapping[Math.min(pax, includedMax)] ?? 270;
      const extra = Math.max(0, pax - includedMax) * 20;
      const est = baseAtCap + extra;
      return {
        total: est,
        min: 270,
        max: 350,
        label: `Estimado: ${est}€ (5–8 pax: 270–350€)${extra > 0 ? ` + ${extra}€ por ${pax - includedMax} extra(s)` : ""}`,
      };
    }

    // En otros casos no hay tarifa fija definida
    return {
      total: undefined,
      label: "Precio a confirmar según duración, horario y vehículo",
    };
  }, [
    bookingData.tipoReserva,
    bookingData.pasajeros,
    bookingData.vehiculo,
    bookingData.categoriaTour,
    bookingData.subtipoTour,
    bookingData.tipoTour,
    bookingData.selectedTourSlug,
    toursList,
    bookingData.hora,
  ]);

  // Enviar a página de pago con un depósito de confirmación de 5€ (quick deposit)
  // === HERO: función COMPLETA para preparar bookingData y enviar a /pago ===
  const goToPayment = () => {
  try {
    // 1) Validación
    const errs = computeValidationErrors()
    setFieldErrors(errs)
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      try { document.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus() } catch {}
      return
    }

    const pax = parsePassengers(bookingData.pasajeros)
    const isNight = bookingData.subtipoTour === "nocturno" || isNightTime(bookingData.hora)

   // === TRASLADO ===
if (bookingData.tipoReserva === "traslado") {
  const pax = parsePassengers(bookingData.pasajeros);
  const base = getBasePrice(bookingData.origen, bookingData.destino, pax) ?? 0;
  const total = quote?.total ?? base;

  const originKey = bookingData.origen;
  const destinationKey = bookingData.destino;

  // Flags de vuelo desde el índice (CMS)
  const flightReq =
    getFlightRequirements(transfersIdx, originKey, destinationKey) || {};

  // Intentamos localizar el documento del traslado:
  // 1) primero desde el índice, 2) fallback a la lista original
  const idxNode =
    transfersIdx?.byOrigin?.[originKey]?.destinations?.[destinationKey] || {};
  const selectedTransfer =
    idxNode.doc ||
    (transfersList || []).find((t: any) => {
      const fromKey = t.fromKey ?? t.from;
      const toKey = t.toKey ?? t.to;
      return fromKey === originKey && toKey === destinationKey;
    }) ||
    null;

  // Normalizamos slug e incluimos campos relevantes (solo si existen)
  const transferSlug =
    (selectedTransfer as any)?.slug?.current ||
    (selectedTransfer as any)?.slug ||
    `${originKey}-${destinationKey}`;

  const transferDoc = selectedTransfer && {
    _id:
      (selectedTransfer as any)?._id ||
      transferSlug ||
      `${originKey}-${destinationKey}`,
    from: (selectedTransfer as any)?.from,
    to: (selectedTransfer as any)?.to,
    briefInfo: (selectedTransfer as any)?.briefInfo,
    requireFlightInfo:
      (selectedTransfer as any)?.requireFlightInfo ?? !!flightReq.requireFlightInfo,
    requireFlightNumber:
      (selectedTransfer as any)?.requireFlightNumber ?? !!flightReq.requireFlightNumber,
    slug: transferSlug ? { current: transferSlug } : undefined,

    // precios (si tu schema los trae)
    priceP4: (selectedTransfer as any)?.priceP4,
    priceP5: (selectedTransfer as any)?.priceP5,
    priceP6: (selectedTransfer as any)?.priceP6,
    priceP7: (selectedTransfer as any)?.priceP7,
    priceP8: (selectedTransfer as any)?.priceP8,

    // extra opcional del schema
    description: (selectedTransfer as any)?.description,
    duration: (selectedTransfer as any)?.duration,
    popular: (selectedTransfer as any)?.popular,
    order: (selectedTransfer as any)?.order,
    
    // ⭐ NUEVO: Traducciones
    translations: (selectedTransfer as any)?.translations,
  };

  console.warn('para testeo',bookingData)

  const data: any = {
    // --- meta quick ---
    quickDeposit: true,
    quickType: "traslado",
    isTransferQuick: true,

    // --- ruta (claves + labels) ---
    originKey,
    destinationKey,
    originLabel:
      getOriginLabel(originKey) || originKey || "",
    destinationLabel:
      getDestinationLabel(destinationKey) || destinationKey || "",

    // --- cuándo y quiénes ---
    date: bookingData.fecha || "",
    time: bookingData.hora || "",
    passengers: pax,
    ninos: bookingData.ninos ?? 0,
    vehicleType: bookingData.vehiculo || "",

    // --- precios ---
    basePrice: base,
    totalPrice: Number(total || 0),

    // --- requisitos de vuelo (para que /pago sepa qué exigir) ---
    requireFlightInfo: !!flightReq.requireFlightInfo,
    requireFlightNumber: !!flightReq.requireFlightNumber,

    // --- datos de vuelo (Hero no los pide; /pago los mostrará/validará si hace falta) ---
    flight: {
      number: bookingData.flightNumber || "",
    },

    // --- documento completo del traslado (similar a tourDoc) ---
    transferDoc,
  };

  try { localStorage.setItem("bookingData", JSON.stringify(data)); } catch {}
  router.push("/pago");
  return;
}

    // === TOUR ===
    const selectedTour =
      (toursList || []).find(t => (t.slug || t.title) === bookingData.selectedTourSlug) || null

    const tourSlug = selectedTour
      ? (typeof selectedTour.slug === "string" ? selectedTour.slug : (selectedTour as any).slug?.current ?? "")
      : bookingData.selectedTourSlug || ""

    const tourDoc = selectedTour && {
      _id: (selectedTour as any)._id || tourSlug || selectedTour.title,
      title: selectedTour.title,
      route: (selectedTour as any).route,
      summary: (selectedTour as any).summary,
      description: (selectedTour as any).description,
      amenities: (selectedTour as any).amenities,
      features: (selectedTour as any).features,
      includes: (selectedTour as any).includes,
      visitedPlaces: (selectedTour as any).visitedPlaces,
      notes: (selectedTour as any).notes,
      overCapacityNote: (selectedTour as any).overCapacityNote,
      pricingMode: (selectedTour as any).pricingMode,
      pricingRules: (selectedTour as any).pricingRules,
      pricingTable: (selectedTour as any).pricingTable,
      booking: { startingPriceEUR: (selectedTour as any).booking?.startingPriceEUR },
      isPopular: (selectedTour as any).isPopular === true || (selectedTour as any).isPopular === "yes",
      mainImage: (selectedTour as any).mainImage,
      slug: tourSlug ? { current: tourSlug } : undefined,
      translations: (selectedTour as any)?.translations,
    }

    // mismo helper que ya tenías arriba
    const INC_5 = 34, INC_6 = 32, INC_7 = 28, INC_8 = 26
    const computeInitialFromTourDoc = (n: number, doc: any): number => {
      if (!doc) return 0
      const mode = doc?.pricingMode
      n = Math.max(1, Math.floor(n || 0))

      if (mode === "rules" && doc?.pricingRules?.baseUpTo4EUR != null) {
        const base = Number(doc.pricingRules.baseUpTo4EUR || 0)
        if (n <= 4) return base
        if (n === 5) return base + INC_5
        if (n === 6) return base + INC_5 + INC_6
        if (n === 7) return base + INC_5 + INC_6 + INC_7
        return base + INC_5 + INC_6 + INC_7 + INC_8
      }

      if (mode === "table" && doc?.pricingTable) {
        const { p4=0,p5=0,p6=0,p7=0,p8=0,extraFrom9=0 } = doc.pricingTable
        if (n <= 4) return p4
        if (n === 5) return p5
        if (n === 6) return p6
        if (n === 7) return p7
        if (n === 8) return p8
        return p8 + extraFrom9 * (n - 8)
      }

      const fallbackStart = Number(doc?.booking?.startingPriceEUR ?? 0)
      if (fallbackStart > 0) return fallbackStart

      const baseLegacy = isNight
        ? ((selectedTour as any)?.basePriceNight ?? (selectedTour as any)?.basePrice ?? 0)
        : ((selectedTour as any)?.basePriceDay ?? (selectedTour as any)?.basePrice ?? 0)
      const hoursLegacy = isNight ? 3 : 2
      return Number(baseLegacy || 0) * hoursLegacy
    }

    const initialTotal = computeInitialFromTourDoc(pax, tourDoc)

    const data: any = {
      quickDeposit: true,
      quickType: "tour",
      isTourQuick: true,
      tourId: tourSlug,
      tourCategory: bookingData.categoriaTour || "ciudad",
      tourSubtype: bookingData.subtipoTour || "",
      passengers: pax,
      ninos: bookingData.ninos ?? 0,
      date: bookingData.fecha || "",
      time: bookingData.hora || "",
      vehicleType: bookingData.vehiculo || "",
      contactName: bookingData.contactName || "",
      contactPhone: bookingData.contactPhone || "",
      contactEmail: bookingData.contactEmail || "",
      pickupAddress: bookingData.pickupAddress || "",
      dropoffAddress: bookingData.dropoffAddress || "",
      isNightTime: isNight,
      extraLuggage: Number(bookingData.luggage23kg || 0) > 3,
      luggage23kg: bookingData.luggage23kg || 0,
      luggage10kg: bookingData.luggage10kg || 0,
      tourDoc,
      totalPrice: Number(initialTotal || 0),
    }

    try { localStorage.setItem("bookingData", JSON.stringify(data)) } catch {}

    router.push(`/pago${tourSlug ? `?tour=${encodeURIComponent(tourSlug)}` : ""}`)
  } catch (e) {
    console.error("No se pudo preparar el pago:", e)
  }
}

  // Función para manejar el cambio de niños
  function handleNinosChange(value: string) {
    const n = Math.max(
      0,
      Math.min(parsePassengers(bookingData.pasajeros), Number(value))
    );
    setBookingData({ ...bookingData, ninos: n });
  }
  // Función para agregar cotización de regreso
  function handleAddReturn() {
    if (
      !returnData.origen ||
      !returnData.destino ||
      !returnData.fecha ||
      !returnData.hora
    )
      return;
    setShowReturn(false);
    // Aquí se podría guardar en localStorage o en un array de carrito
  }

  // Función para agregar la cotización actual al carrito
  // Nota: el flujo ahora envía una "quick quote" a la página /pago
  // donde se completarán contacto y direcciones. La función que
  // añadía la cotización localmente fue removida del flujo principal.

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-primary pt-20">
      {/* Background with Paris landmarks */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: backgroundUrl
              ? `url('${backgroundUrl}')`
              : `url('/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-primary/40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <AnimatedSection animation="slide-left">
            <div className="text-white">
              <h1 className="font-bold mb-6 text-balance text-white drop-shadow-lg text-5xl font-display">
                {translatedTitle}
                <span className="text-accent block animate-pulse drop-shadow-lg">
                  {translatedHighlight}
                </span>
              </h1>
              {events && events.length > 0 && (
                <div className="mb-6">
                  <EventsSlider events={events} />
                </div>
              )}
              <div className="mb-8 text-white/95 text-pretty drop-shadow-md text-justify">
                {(() => {
                  let text = "";
                  if (Array.isArray(translatedDescription)) {
                    try {
                      text = (translatedDescription as any[])
                        .map((block) => {
                          if (
                            block?._type === "block" &&
                            Array.isArray(block.children)
                          ) {
                            return block.children
                              .map((c: any) => c?.text || "")
                              .join("");
                          }
                          return "";
                        })
                        .filter(Boolean)
                        .join(" ");
                    } catch {
                      text = "";
                    }
                  } else {
                    text = String(translatedDescription || "");
                  }
                  text = text
                    .replace(/\s*\n+\s*/g, " ")
                    .replace(/\s{2,}/g, " ")
                    .trim();
                  return <p className="text-xl leading-relaxed">{text}</p>;
                })()}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300 shadow-lg"
                  onClick={handlePrimaryScroll}
                >
                  {translatedPrimaryCtaLabel}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary bg-transparent transform hover:scale-105 transition-all duration-300 shadow-lg backdrop-blur-sm"
                  onClick={handleSecondaryScroll}
                >
                  {translatedSecondaryCtaLabel}
                </Button>
              </div>
            </div>
          </AnimatedSection>

          {/* Booking Form */}
          {
            <AnimatedSection animation="fade-up" delay={300}>
              <Card
                id="hero-booking-form"
                className="bg-card/98 backdrop-blur-md transform hover:scale-102 transition-all duration-300 shadow-2xl border-white/20 scroll-mt-24"
              >
                <CardContent className="p-6">
                  {/* Paso 1: Selección de tipo de reserva */}
                  {formStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold mb-6 text-center text-primary font-display">
                        {translatedBookingForm?.title || bookingTexts.bookYourService}
                      </h3>
                      <div className="space-y-2">
                        <label className="text-sm text-center font-medium flex justify-center items-center gap-2">
                          <Map className="w-4 h-4 text-accent" />
                          {translatedBookingForm?.typePicker?.label || bookingTexts.bookingTypeLabel}
                        </label>
                        <div className="flex flex-wrap gap-4 justify-center w-full">
                          <Button
                            type="button"
                            size="lg"
                            variant={
                              bookingData.tipoReserva === "traslado"
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${bookingData.tipoReserva === "traslado" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                            aria-pressed={
                              bookingData.tipoReserva === "traslado"
                            }
                            onClick={() => {
                              setBookingData((prev) => ({
                                ...prev,
                                tipoReserva: "traslado",
                                tipoTour: "",
                                categoriaTour: "",
                                subtipoTour: "" as "diurno" | "nocturno" | "",
                                // Limpiar campos de tour
                                origen: prev.origen || "",
                                destino: prev.destino || "",
                                fecha: prev.fecha || "",
                                hora: prev.hora || "",
                                pasajeros: prev.pasajeros || "1",
                                vehiculo: prev.vehiculo || "coche",
                                flightNumber: prev.flightNumber || "",
                              }));
                              setFormStep(2);
                            }}
                          >
                            <Car className="w-5 h-5" />
                            {translatedBookingForm?.typePicker?.trasladoLabel || bookingTexts.transferLabel}
                          </Button>
                          <Button
                            type="button"
                            size="lg"
                            variant={
                              bookingData.tipoReserva === "tour"
                                ? "default"
                                : "outline"
                            }
                            className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${bookingData.tipoReserva === "tour" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                            aria-pressed={bookingData.tipoReserva === "tour"}
                            onClick={() => {
                              setBookingData((prev) => ({
                                ...prev,
                                tipoReserva: "tour",
                                // Limpiar campos de traslado
                                origen: "",
                                destino: "",
                                fecha: "",
                                hora: "",
                                pasajeros: "1",
                                vehiculo: "coche",
                                flightNumber: "",
                                tipoTour: "",
                                categoriaTour: "",
                                subtipoTour: "" as "diurno" | "nocturno" | "",
                              }));
                              setFormStep(2);
                            }}
                          >
                            <Map className="w-5 h-5" />
                            {translatedBookingForm?.typePicker?.tourLabel || bookingTexts.tourLabel}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Paso 2: Resto del formulario */}
                  {formStep === 2 && (
                    <>
                      {/* Título dinámico según tipo de reserva */}
                      <h4 className="text-xl font-semibold text-center mb-2">
                        {bookingData.tipoReserva === "traslado"
                          ? bookingTexts.quotationTransfer
                          : bookingData.tipoReserva === "tour"
                            ? bookingTexts.quotationTour
                            : bookingTexts.quotation}
                      </h4>
                      {/* Botón volver */}
                      <div className="mb-4 flex justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFormStep(1)}
                        >
                          ← {bookingTexts.back}
                        </Button>
                      </div>
                      {/* Formulario paso 2 */}
                      <div className="space-y-4">
                        {/* Campos para traslado */}
                        {bookingData.tipoReserva === "traslado" && (
                          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                            {/* Origen */}
<div className="space-y-2">
  <label className="text-sm font-medium flex items-center gap-2">
    <MapPin className="w-4 h-4 text-accent" />
    {`${bookingTexts.origin}${bookingData.origen ? ` ${getOriginLabel(bookingData.origen)}` : ""}`}
  </label>

  <Select
    value={bookingData.origen}
    onValueChange={(value) =>
      setBookingData({ ...bookingData, origen: value, destino: "" })
    }
  >
    <SelectTrigger
      data-field="origen"
      className={
        "cursor-pointer max-w-[90%] md:max-w-[100%]" +
        (fieldErrors.origen ? "border-destructive focus-visible:ring-destructive" : "")
      }
    >
      <SelectValue placeholder={bookingTexts.originPlaceholder} />
    </SelectTrigger>

    <SelectContent>
      {originKeys.map((k) => (
        <SelectItem key={k} value={k}>
          {getOriginLabel(k)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
                            {/* Destino */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-accent" />
                                {`${bookingTexts.destination}${bookingData.destino ? ` ${getDestinationLabel(bookingData.destino)}` : ""}`}
                              </label>
                              <Select
                                value={bookingData.destino}
                                onValueChange={(value) =>
                                  setBookingData({
                                    ...bookingData,
                                    destino: value,
                                  })
                                }
                              >
                                <SelectTrigger
                                  data-field="destino"
                                  disabled={!bookingData.origen}
                                  className={
                                    "cursor-pointer disabled:cursor-not-allowed  max-w-[90%] md:max-w-[100%]" +
                                    (fieldErrors.destino
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : "")
                                  }
                                >
                                  <SelectValue
                                    placeholder={
                                      bookingData.origen
                                        ? bookingTexts.destinationPlaceholder
                                        : bookingTexts.selectOriginFirst
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {destinationKeys.length > 0 ? (
                                    destinationKeys.map((d) => (
                                      <SelectItem key={d} value={d}>
                                        {getDestinationLabel(d)}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="-" disabled>
                                      {bookingData.origen
                                        ? bookingTexts.noDestinations
                                        : bookingTexts.selectOriginFirst}
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Fecha */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-accent" />
                                {bookingTexts.date}
                              </label>
                              <Input
                                data-field="fecha"
                                type="date"
                                min={minDateStr}
                                value={bookingData.fecha}
                                onChange={(e) => {
                                  setBookingData({
                                    ...bookingData,
                                    fecha: e.target.value,
                                  });
                                  if (fieldErrors.fecha)
                                    setFieldErrors((f) => {
                                      const c = { ...f };
                                      delete c.fecha;
                                      return c;
                                    });
                                }}
                                className={
                                  fieldErrors.fecha
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                              />
                            </div>
                            {/* Hora */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Clock className="w-4 h-4 text-accent" />
                                {bookingTexts.time}
                              </label>
                              <Input
                                data-field="hora"
                                type="time"
                                value={bookingData.hora}
                                onChange={(e) => {
                                  console.log(e.target.value);
                                  const selectedTime = e.target.value;
                                  const selectedDate = bookingData.fecha;
                                  
                                  // Validar que la hora sea al menos 45 minutos después de ahora
                                  if (selectedDate && selectedTime) {
                                    const now = new Date();
                                    const selected = new Date(`${selectedDate}T${selectedTime}`);
                                    const minTime = new Date(now.getTime() + 45 * 60 * 1000); // +45 minutos
                                    console.warn(selected<minTime, selected, minTime);
                                    if (selected <= minTime) {
                                      setFieldErrors((f) => ({
                                        ...f,
                                        hora: bookingTexts.timeValidation
                                      }));
                                      return;
                                    }
                                  }
                                  
                                  setBookingData({
                                    ...bookingData,
                                    hora: selectedTime,
                                  });
                                  if (fieldErrors.hora)
                                    setFieldErrors((f) => {
                                      const c = { ...f };
                                      delete c.hora;
                                      return c;
                                    });
                                }}
                                className={
                                  fieldErrors.hora
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                              />
                              {fieldErrors.hora && (
                                <p className="text-xs text-destructive mt-1">
                                  {fieldErrors.hora}
                                </p>
                              )}
                            </div>
                            {/* Pasajeros */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent" />
                                {bookingTexts.passengers}
                              </label>
                              <Select
                                value={bookingData.pasajeros}
                                onValueChange={(value) =>
                                  setBookingData({
                                    ...bookingData,
                                    pasajeros: value,
                                  })
                                }
                              >
                                <SelectTrigger
                                  data-field="pasajeros"
                                  className={
                                    "cursor-pointer " +
                                    (fieldErrors.pasajeros
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : "")
                                  }
                                >
                                  <SelectValue
                                    placeholder={`${bookingTexts.passengersMax} ${getVehicleCap(bookingData.vehiculo)})`}
                                  />
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                  {Array.from(
                                    {
                                      length: getVehicleCap(
                                        bookingData.vehiculo
                                      ),
                                    },
                                    (_, i) => i + 1
                                  ).map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                      {n} {n === 1 ? bookingTexts.passengersSingular : bookingTexts.passengersPlural}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Niños */}
                            <div className="space-y-2">
                              <label className="text-sm font-medium flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent" />
                                {bookingTexts.children} (0-12)
                              </label>
                              <Select
                                value={String(bookingData.ninos ?? 0)}
                                onValueChange={(value) => {
                                  const maxNinos = parsePassengers(
                                    bookingData.pasajeros
                                  );
                                  let n = Number(value);
                                  if (n > maxNinos) n = maxNinos;
                                  setBookingData({ ...bookingData, ninos: n });
                                }}
                              >
                                <SelectTrigger
                                  data-field="ninos"
                                  className="cursor-pointer"
                                >
                                  <SelectValue>
                                    {bookingData.ninos === 0 ||
                                    bookingData.ninos
                                      ? `${bookingData.ninos} ${bookingData.ninos === 1 ? bookingTexts.childrenSingular : bookingTexts.childrenPlural}`
                                      : bookingTexts.childrenQuantity}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-72">
                                  {Array.from(
                                    {
                                      length:
                                        parsePassengers(bookingData.pasajeros) +
                                        1,
                                    },
                                    (_, i) => i
                                  ).map((n) => (
                                    <SelectItem key={n} value={String(n)}>
                                      {n}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {/* Vehículo y Ida y regreso en la misma fila */}
                            <div className="flex flex-col md:flex-row gap-4 col-span-2">
                              <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Car className="w-4 h-4 text-accent" />
                                  {bookingTexts.vehicleLabel}
                                </label>
                                <Select
                                  value={bookingData.vehiculo}
                                  onValueChange={(value) => {
                                    const cap = getVehicleCap(value);
                                    const pax = parsePassengers(
                                      bookingData.pasajeros
                                    );
                                    const clamped = Math.min(
                                      Math.max(pax, 1),
                                      cap
                                    );
                                    setBookingData({
                                      ...bookingData,
                                      vehiculo: value,
                                      pasajeros: String(clamped),
                                    });
                                  }}
                                >
                                  <SelectTrigger
                                    data-field="vehiculo"
                                    className="cursor-pointer"
                                  >
                                    <SelectValue placeholder={bookingTexts.vehiclePlaceholder} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="coche">{bookingTexts.car}</SelectItem>
                                    <SelectItem value="minivan">
                                      {bookingTexts.minivan}
                                    </SelectItem>
                                    <SelectItem value="van">{bookingTexts.van}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* round-trip option removed */}
                            </div>
                          </div>
                        )}
                        {/* Campos para tour */}
                        {bookingData.tipoReserva === "tour" && (
                          <>
                            {/* Tour y Tipo de tour en la misma fila */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Tipo de tour (Diurno, Nocturno o Escala) */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Plane className="w-4 h-4 text-accent" />
                                  {bookingTexts.tourTypeLabel}
                                </label>
                                <Select
                                  value={
                                    bookingData.categoriaTour === "escala"
                                      ? "escala"
                                      : bookingData.subtipoTour || ""
                                  }
                                  onValueChange={(value) => {
                                    if (value === "escala") {
                                      setBookingData({
                                        ...bookingData,
                                        categoriaTour: "escala",
                                        subtipoTour: "" as
                                          | "diurno"
                                          | "nocturno"
                                          | "",
                                        tipoTour: "escala",
                                        selectedTourSlug: "",
                                      });
                                    } else {
                                      setBookingData({
                                        ...bookingData,
                                        categoriaTour: "ciudad",
                                        subtipoTour: value as
                                          | "diurno"
                                          | "nocturno"
                                          | "",
                                        tipoTour: value as
                                          | "diurno"
                                          | "nocturno"
                                          | "",
                                        selectedTourSlug: "",
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger
                                    data-field="categoriaTour"
                                    className={
                                      "cursor-pointer " +
                                      (fieldErrors.categoriaTour
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "")
                                    }
                                  >
                                    <SelectValue placeholder={bookingTexts.tourTypePlaceholder} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="diurno">
                                      {bookingTexts.dayTour}
                                    </SelectItem>
                                    <SelectItem value="nocturno">
                                      {bookingTexts.nightTour}
                                    </SelectItem>
                                    <SelectItem value="escala">
                                      {bookingTexts.stopoverTour}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Selector de tours disponibles */}
                              {Array.isArray(toursList) &&
                                toursList.length > 0 && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                      <Map className="w-4 h-4 text-accent" />
                                      {bookingTexts.tourLabel2}
                                    </label>
                                    <Select
                                      value={bookingData.selectedTourSlug}
                                      onValueChange={(value) =>
                                        setBookingData({
                                          ...bookingData,
                                          selectedTourSlug: value,
                                        })
                                      }
                                    >
                                      {/* Trigger (botón visible) */}
                                      <SelectTrigger
                                        data-field="tour"
                                        className="cursor-pointer max-w-[260px] truncate"
                                      >
                                        <SelectValue placeholder={bookingTexts.selectTour}>
                                          {(() => {
                                            const value = bookingData.selectedTourSlug;
                                            if (!value)
                                              return bookingTexts.selectTour;
                                            const selectedTour = toursList.find(
                                              (t) =>
                                                t.slug === value ||
                                                t.title === value
                                            );
                                            if (!selectedTour) return value;
                                            const title = selectedTour.title;
                                            // Truncar solo en el valor seleccionado
                                            return title.length > 40
                                              ? title.slice(0, 40) + "…"
                                              : title;
                                          })()}
                                        </SelectValue>
                                      </SelectTrigger>

                                      {/* Lista del selector (sin truncar) */}
                                      <SelectContent className="max-h-72">
                                        {toursList.map((t, idx) => (
                                          <SelectItem
                                            key={idx}
                                            value={t.slug || t.title}
                                            className="whitespace-normal max-w-[400px]" // muestra el texto completo
                                            title={getTourTitle(t)}
                                          >
                                            {getTourTitle(t)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                            </div>
                            {/* Fecha, hora, pasajeros, vehículo */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-accent" />
                                  {translatedBookingForm?.dateField?.label || bookingTexts.date}
                                </label>
                                <Input
                                  data-field="fecha"
                                  type="date"
                                  min={minDateStr}
                                  value={bookingData.fecha}
                                  onChange={(e) => {
                                    setBookingData({
                                      ...bookingData,
                                      fecha: e.target.value,
                                    });
                                    if (fieldErrors.fecha)
                                      setFieldErrors((f) => {
                                        const c = { ...f };
                                        delete c.fecha;
                                        return c;
                                      });
                                  }}
                                  className={
                                    fieldErrors.fecha
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-accent" />
                                  {bookingTexts.time}
                                </label>
                                <Input
                                  data-field="hora"
                                  type="time"
                                  value={bookingData.hora}
                                  onChange={(e) => {
                                    const selectedTime = e.target.value;
                                    const selectedDate = bookingData.fecha;
                                    
                                    // Validar que la hora sea al menos 45 minutos después de ahora
                                    if (selectedDate && selectedTime) {
                                      const now = new Date();
                                      const selected = new Date(`${selectedDate}T${selectedTime}`);
                                      const minTime = new Date(now.getTime() + 45 * 60 * 1000); // +45 minutos
                                      
                                      if (selected <= minTime) {
                                        setFieldErrors((f) => ({
                                          ...f,
                                          hora: bookingTexts.timeValidation
                                        }));
                                        return;
                                      }
                                    }
                                    
                                    setBookingData({
                                      ...bookingData,
                                      hora: selectedTime,
                                    });
                                    if (fieldErrors.hora)
                                      setFieldErrors((f) => {
                                        const c = { ...f };
                                        delete c.hora;
                                        return c;
                                      });
                                  }}
                                  className={
                                    fieldErrors.hora
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                />
                                {fieldErrors.hora && (
                                  <p className="text-xs text-destructive mt-1">
                                    {fieldErrors.hora}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Users className="w-4 h-4 text-accent" />
                                  {bookingTexts.passengers}
                                </label>
                                <Select
                                  value={bookingData.pasajeros}
                                  onValueChange={(value) =>
                                    setBookingData({
                                      ...bookingData,
                                      pasajeros: value,
                                    })
                                  }
                                >
                                  <SelectTrigger
                                    data-field="pasajeros"
                                    className={
                                      "cursor-pointer " +
                                      (fieldErrors.pasajeros
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "")
                                    }
                                  >
                                    <SelectValue
                                      placeholder={`${bookingTexts.passengersMax} ${getVehicleCap(bookingData.vehiculo)})`}
                                    />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-72">
                                    {Array.from(
                                      {
                                        length: getVehicleCap(
                                          bookingData.vehiculo
                                        ),
                                      },
                                      (_, i) => i + 1
                                    ).map((n) => (
                                      <SelectItem key={n} value={String(n)}>
                                        {n}{" "}
                                        {n === 1
                                          ? translatedBookingForm?.passengersField
                                              ?.singular || bookingTexts.passengersSingular
                                          : translatedBookingForm?.passengersField
                                              ?.plural || bookingTexts.passengersPlural}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* Niños (0-12) para tour */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Users className="w-4 h-4 text-accent" />
                                  {bookingTexts.children} (0-12)
                                </label>
                                <Select
                                  value={String(bookingData.ninos ?? 0)}
                                  onValueChange={(value) => {
                                    const maxNinos = parsePassengers(
                                      bookingData.pasajeros
                                    );
                                    let n = Number(value);
                                    if (n > maxNinos) n = maxNinos;
                                    setBookingData({
                                      ...bookingData,
                                      ninos: n,
                                    });
                                  }}
                                >
                                  <SelectTrigger
                                    data-field="ninos"
                                    className="cursor-pointer"
                                  >
                                    <SelectValue>
                                      {bookingData.ninos === 0 ||
                                      bookingData.ninos
                                        ? `${bookingData.ninos} ${bookingData.ninos === 1 ? bookingTexts.childrenSingular : bookingTexts.childrenPlural}`
                                        : bookingTexts.childrenQuantity}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent className="max-h-72">
                                    {Array.from(
                                      {
                                        length:
                                          parsePassengers(
                                            bookingData.pasajeros
                                          ) + 1,
                                      },
                                      (_, i) => i
                                    ).map((n) => (
                                      <SelectItem key={n} value={String(n)}>
                                        {n}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                  <Car className="w-4 h-4 text-accent" />
                                  {translatedBookingForm?.vehicleField?.label ||
                                    bookingTexts.vehicleLabel}
                                </label>
                                <Select
                                  value={bookingData.vehiculo}
                                  onValueChange={(value) => {
                                    const cap = getVehicleCap(value);
                                    const pax = parsePassengers(
                                      bookingData.pasajeros
                                    );
                                    const clamped = Math.min(
                                      Math.max(pax, 1),
                                      cap
                                    );
                                    setBookingData({
                                      ...bookingData,
                                      vehiculo: value,
                                      pasajeros: String(clamped),
                                    });
                                  }}
                                >
                                  <SelectTrigger
                                    data-field="vehiculo"
                                    className="cursor-pointer"
                                  >
                                    <SelectValue placeholder={bookingTexts.vehiclePlaceholder} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="coche">
                                      {bookingTexts.car} (4 {bookingTexts.peopleCapacity})
                                    </SelectItem>
                                    <SelectItem value="minivan">
                                      {bookingTexts.minivan} (6 {bookingTexts.passengersCapacity})
                                    </SelectItem>
                                    <SelectItem value="van">
                                      {bookingTexts.van} (8 {bookingTexts.passengersCapacity})
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            {/* Notas de equipaje para Minivan con 5 o 6 pasajeros */}
                            {bookingData.vehiculo === "minivan" &&
                              (() => {
                                const pax = parsePassengers(
                                  bookingData.pasajeros
                                );
                                if (pax === 6) {
                                  return (
                                    <p className="text-xs text-muted-foreground text-center">
                                      {bookingForm?.notes?.minivan6 ||
                                        "Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero."}
                                    </p>
                                  );
                                }
                                if (pax === 5) {
                                  return (
                                    <p className="text-xs text-muted-foreground text-center">
                                      {bookingForm?.notes?.minivan5 ||
                                        "Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg."}
                                    </p>
                                  );
                                }
                                return null;
                              })()}
                          </>
                        )}
                        {/* Botón Siguiente (ir al paso 3: contacto y direcciones) */}
                        <div className="pt-4 flex flex-col gap-2">
                          {(() => {
                            const errs = computeStep2Errors();
                            const disabled = Object.keys(errs).length > 0;
                            return (
                              <>
                                <Button
                                  className="w-full bg-accent hover:bg-accent/90 shadow-lg"
                                  size="lg"
                                  disabled={disabled}
                                  onClick={() => {
                                    const errsClick = computeStep2Errors();
                                    setFieldErrors(errsClick);
                                    if (Object.keys(errsClick).length) {
                                      const first = Object.keys(errsClick)[0];
                                      try {
                                        document
                                          .querySelector<HTMLElement>(
                                            `[data-field="${first}"]`
                                          )
                                          ?.focus();
                                      } catch {}
                                      return;
                                    }
                                    // Enviar una cotización rápida a la página de pago
                                    goToPayment();
                                  }}
                                >
                                  {bookingTexts.quote}
                                </Button>
                                {disabled && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {bookingTexts.missingFields}{" "}
                                    {Object.keys(errs)
                                      .map((k) => fieldLabelMap[k] || k)
                                      .join(", ")}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          }
        </div>
      </div>
    </section>
  );
}
