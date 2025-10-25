"use client";
import { TooltipBriefInfo } from "@/components/ui/tooltip-brief-info";


// idaYVuelta removed: round-trip option deprecated
// Removed idaYVuelta from modalForm initialization
// Removed idaYVuelta from bookingData

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Shield,
  Clock,
  MapPin,
  Users,
  Luggage,
  Map,
  Car,
  Plane,
  Calendar,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnimatedSection } from "@/components/animated-section";
import { useToast } from "@/hooks/use-toast";
import {
  calcBaseTransferPrice,
  isNightTime as pricingIsNightTime,
  getAvailableDestinations as pricingGetAvailableDestinations,
} from "@/lib/pricing";
import { formatPhonePretty, ensureLeadingPlus } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PhoneInputIntl } from "@/components/ui/phone-input";
import { EmailAutocomplete } from "@/components/ui/email-autocomplete";
import { buildTransfersIndexes, getTransferDocByRoute, toIndexKey, TransferDoc } from "@/sanity/lib/transfers";

// Helper: formato con máximo 2 decimales (sin forzar ceros)
const fmtMoney = (n: number | string | undefined | null) => {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(isFinite(num) ? num : 0);
  } catch {
    return String(Math.round((isFinite(num) ? num : 0) * 100) / 100);
  }
};

function getDepositPercent(item: any): number {
  const tipo = (
    item?.tipo ||
    item?.quickType ||
    item?.tourDoc?.type ||
    ""
  ).toLowerCase();
  if (tipo === "tour" || item?.isTourQuick || item?.tourId || item?.tourDoc)
    return 0.2;
  if (tipo === "traslado" || tipo === "transfer" || item?.isTransfer)
    return 0.1;
  if (tipo === "evento" || tipo === "event") return 0.2;
  return 0.1; // por defecto
}

type CartItem = {
  id: number;
  tipo: "tour" | "traslado";
  serviceLabel: string;
  serviceSubLabel?: string;
  origen?: string;
  destino?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  date: string;
  time: string;
  passengers: number;
  ninos?: number;
  vehicle?: string;
  selectedTourSlug?: string;
  categoriaTour?: string;
  subtipoTour?: string;
  flightNumber?: string;
  flightArrivalTime?: string;
  flightDepartureTime?: string;
  luggage23kg?: number;
  luggage10kg?: number;
  specialRequests?: string;
  totalPrice: number;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  transferDoc?: TransferDoc;
};

type PricingItem = { _key?: string; pax: number; price: number };
type PricingOption = {
  _key?: string;
  _type?: "pricingOption";
  label: string;
  hours?: number;
  price: number;
};

// === /pago: helper de precio según esquema nuevo (ACTUALIZADO) ===
const INC_5 = 34,
  INC_6 = 32,
  INC_7 = 28,
  INC_8 = 26;

function computeFromTourDoc(pax: number, tourDoc: any) {
  const n = Math.max(1, Math.floor(pax || 0));
  const mode = tourDoc?.pricingMode;

  // MODO "rules": base hasta 4; 5→+34; 6→+32; 7→+28; 8→+26
  // NUEVO: 9+ = (precio de 8) + INC_8 * (n - 8)
  if (mode === "rules" && tourDoc?.pricingRules?.baseUpTo4EUR != null) {
    const base = Number(tourDoc.pricingRules.baseUpTo4EUR || 0);
    if (n <= 4) return base;
    if (n === 5) return base + INC_5;
    if (n === 6) return base + INC_5 + INC_6;
    if (n === 7) return base + INC_5 + INC_6 + INC_7;
    if (n === 8) return base + INC_5 + INC_6 + INC_7 + INC_8;
    // n > 8
    const priceAt8 = base + INC_5 + INC_6 + INC_7 + INC_8;
    return priceAt8 + INC_8 * (n - 8);
  }

  // MODO "table": 4..8 explícitos + extraFrom9 por cada pasajero > 8 (ya contemplaba 9+ sin tope)
  if (mode === "table" && tourDoc?.pricingTable) {
    const {
      p4 = 0,
      p5 = 0,
      p6 = 0,
      p7 = 0,
      p8 = 0,
      extraFrom9 = 0,
    } = tourDoc.pricingTable;
    if (n <= 4) return p4;
    if (n === 5) return p5;
    if (n === 6) return p6;
    if (n === 7) return p7;
    if (n === 8) return p8;
    return p8 + extraFrom9 * (n - 8);
  }

  // Fallback si no hay modo ni tabla
  return Number(tourDoc?.booking?.startingPriceEUR ?? 0) || 0;
}

function computeFromTransferDoc(pax: number, doc: any) {
  const n = Math.max(1, Math.floor(Number(pax) || 1));
  const p4 = Number(doc?.priceP4 || 0);
  const p5 = Number(doc?.priceP5 || p4);
  const p6 = Number(doc?.priceP6 || p5);
  const p7 = Number(doc?.priceP7 || p6);
  const p8 = Number(doc?.priceP8 || p7);

  if (n <= 4) return p4;
  if (n === 5) return p5;
  if (n === 6) return p6;
  if (n === 7) return p7;
  if (n === 8) return p8;

  // Regla 9+: precio de 8 + 20€/pax extra (misma regla que usaste)
  const extra = Math.max(0, n - 8) * 20;
  return p8 + extra;
}

const truncate = (s: string, n = 30) => {
  if (!s) return "";
  const str = String(s);
  return str.length <= n ? str : str.slice(0, n - 1) + "…";
};



type Requirements = {
  requireTime?: boolean;
  requireFlightNumber?: boolean;
};
type SanityImageRef = {
  _type: "image";
  asset: { _ref?: string; _type?: "reference" };
};
type TourData = {
  _id: string;
  amenities?: string[];
  basePrice?: number;
  basePriceDay?: number | null;
  basePriceNight?: number | null;
  description?: string;
  distance?: string;
  duration?: string;
  extraSections?: any;
  features?: string[];
  gallery?: SanityImageRef[];
  included?: string[];
  infoLists?: any;
  isActive?: boolean;
  mainImage?: SanityImageRef;
  notes?: any;
  order?: number;
  pricing?: PricingItem[];
  pricingOptions?: PricingOption[];
  pricingP4?: any;
  pricingP5?: any;
  requireFlightInfo?: boolean | null;
  slug: string;
  title: string;
  mainImageUrl?: string;
  requirements?: Requirements;
};

type CommonBookingFields = {
  quickDeposit?: boolean;
  quickType?: "tour" | "traslado";
  passengers?: number;
  ninos?: number;
  date?: string;
  time?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  referralSource?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  flightNumber?: string;
  flightArrivalTime?: string;
  specialRequests?: string;
  totalPrice?: number;
  // UI/runtime helpers:
  isNightTime?: boolean;
  extraLuggage?: boolean;
};

type TourBookingData = CommonBookingFields & {
  isTourQuick?: boolean;
  tourCategory?: "ciudad" | "escala" | string;
  tourSubtype?: "diurno" | "nocturno" | string;
  vehicleType?: "coche" | "minivan" | "van" | string;
  tourId?: string;
  tourData?: TourData;
  basePrice?: number;
  isNight?: boolean;
  hours?: number;
  // flag obligatorio actual:
  requireFlightInfo?: boolean;
  // Opcionalmente si usas selectedPricingOption:
  selectedPricingOption?: { label: string; hours?: number; price: number };
};

type TransferBookingData = CommonBookingFields & {
  tipoReserva?: "traslado";
  origen?: string;
  destino?: string;
  vehiculo?: "coche" | "minivan" | "van" | string;
  // flag obligatorio actual también aplica para traslados desde aeropuerto:
  requireFlightInfo?: boolean;
};

type BookingData = TourBookingData | TransferBookingData;

export default function PaymentPage() {
  const [destino, setDestino] = useState<BookingData | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  // Guardar origen/destino al cargar la página (por ejemplo después de redirigir desde la cotización)
  const [savedOriginOnLoad, setSavedOriginOnLoad] = useState<string | null>(
    null
  );
  const [savedDestinationOnLoad, setSavedDestinationOnLoad] = useState<
    string | null
  >(null);
  // Ref para indicar que el flujo de "ida y vuelta" fue iniciado desde el botón "Aquí"
  const returnInitiatedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [payFullNow, setPayFullNow] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  // Direcciones específicas del pago (información adicional, no reemplazan la dirección del servicio)
  const [paymentPickupAddress, setPaymentPickupAddress] = useState<string>("");
  const [paymentDropoffAddress, setPaymentDropoffAddress] =
    useState<string>("");
  // Mapa de errores por campo para resaltar inputs faltantes
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // Carrito de cotizaciones (traslados / tours añadidos)
  const [carritoState, setCarritoState] = useState<any[]>([]);
  const { toast } = useToast();
  // Modal para crear/editar cotización (pasos)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [modalEditingId, setModalEditingId] = useState<number | null>(null);
  const [modalStep, setModalStep] = useState(1);
  const [modalForm, setModalForm] = useState<any>(() => ({
    tipo: "traslado",
    origen: "",
    destino: "",
    pickupAddress: "",
    dropoffAddress: "",
    date: "",
    time: "",
    passengers: "1",
    ninos: 0,
    vehicle: "coche",
    // idaYVuelta removed
    selectedTourSlug: "",
    categoriaTour: "",
    subtipoTour: "",
    flightNumber: "",
    flightArrivalTime: "",
    totalPrice: 0,
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    flightDepartureTime: "",
  }));
  // Errores locales para el modal (validación por paso)
  const [modalFieldErrors, setModalFieldErrors] = useState<
    Record<string, string>
  >({});

  // Lista de tours para los selects dentro del modal (cargada desde API)
  const [toursList, setToursList] = useState<TourData[]>([]);
  const [transfersList, setTransfersList] = useState<TransferDoc[]>([]);

  const toTitle = (s?: string) => {
    if (!s) return "";
    return s
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (m) => m.toUpperCase());
  };

  const cartActive = (carritoState?.length ?? 0) >= 1;

  const buildSinglePayload = (bd: any): CartItem => {
  const isTourCurrent = !!(
    bd?.isEvent || bd?.tourId || bd?.tourDoc || bd?.selectedTourSlug || bd?.quickType === "tour"
  );
  const tipo: "tour" | "traslado" = isTourCurrent ? "tour" : "traslado";

  return {
    id: Date.now(),
    tipo,
    serviceLabel: isTourCurrent ? "Tour" : "Traslado",
    serviceSubLabel: isTourCurrent
      ? bd?.tourData?.title || bd?.tourDoc?.title || bd?.selectedTourSlug || "Tour"
      : undefined,

    // 👇👇 CAMBIA estas 3
    vehicle: bd?.vehicle || bd?.vehiculo || bd?.vehicleType || "",
    categoriaTour: bd?.categoriaTour || bd?.tourCategory || "",
    subtipoTour: bd?.subtipoTour || bd?.tourSubtype || "",

    origen: bd?.origen || "",
    destino: bd?.destino || "",
    pickupAddress: bd?.pickupAddress || "",
    dropoffAddress: bd?.dropoffAddress || "",
    date: bd?.date || bd?.fecha || "",
    time: bd?.time || bd?.hora || "",
    passengers: Number(bd?.passengers || bd?.pasajeros || 1),
    ninos: Number(bd?.ninos || 0),
    transferDoc: bd?.transferDoc,

    selectedTourSlug: bd?.selectedTourSlug || "",
    flightNumber: bd?.flightNumber || "",
    flightArrivalTime: bd?.flightArrivalTime || "",
    flightDepartureTime: bd?.flightDepartureTime || "",
    luggage23kg: Number(bd?.luggage23kg ?? 0),
    luggage10kg: Number(bd?.luggage10kg ?? 0),
    specialRequests: bd?.specialRequests || "",
    totalPrice: Number(bd?.totalPrice || 0),
    contactName: bd?.contactName || "",
    contactPhone: bd?.contactPhone || "",
    contactEmail: bd?.contactEmail || "",
  };
};

  const buildSubmission = () => {
    const current = buildSinglePayload(bookingData);
    const cartItems = Array.isArray(carritoState) ? carritoState : [];
    const items: CartItem[] = cartItems.length ? [...cartItems] : [];
    // Si aún no agregaste la actual al carrito y quieres incluirla en el envío combinado:
    if (!cartItems.length) items.push(current);

    return {
      contact: {
        name: current.contactName || bookingData?.contactName || "",
        phone: current.contactPhone || bookingData?.contactPhone || "",
        email: current.contactEmail || bookingData?.contactEmail || "",
        referralSource: bookingData?.referralSource || "",
      },
      payFullNow,
      paymentMethod,
      items, // 👈 cada item respetando su `tipo`
      combinedTotal,
      combinedDepositSum,
    };
  };

  useEffect(() => {
    let mounted = true;
    fetch("/api/tours")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setToursList(data?.tours || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    let mounted = true;
    fetch("/api/transfers")
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setTransfersList(data?.transfers || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Cuando bookingData se carga, guardar origen/destino en variables separadas
  useEffect(() => {
    console.log(bookingData)
    if (!bookingData) return;
    // detectar distintos nombres de campo que pueden contener origen/destino
    const o =
      bookingData.origen ??
      bookingData.origin ??
      bookingData.pickupAddress ??
      bookingData.from ??
      "";
    const d =
      bookingData.destino ??
      bookingData.destination ??
      bookingData.dropoffAddress ??
      bookingData.to ??
      "";
    setSavedOriginOnLoad(o || null);
    setSavedDestinationOnLoad(d || null);
  }, [bookingData]);

  // === /pago: recalcular total cuando cambian pax/nocturno/equipaje (COMPLETO) ===
  useEffect(() => {
    if (!bookingData?.tourDoc) return;

    const pax = Number(bookingData.passengers || 1);

    // 1) base según doc del tour
    let total = computeFromTourDoc(pax, bookingData.tourDoc);

    // 2) recargos globales (si los usas)

    if (Number(bookingData.luggage23kg || 0) > 3) total += 10;

    // 3) sincroniza estado y localStorage si cambió
    if (total !== Number(bookingData.totalPrice || 0)) {
      setBookingData((prev: any) => {
        const next = { ...prev, totalPrice: total };
        try {
          localStorage.setItem("bookingData", JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [
    bookingData?.tourDoc, // cambia el tour
    bookingData?.passengers, // cambia cantidad de pasajeros
    bookingData?.isNightTime, // cambia horario (nocturno)
    bookingData?.luggage23kg, // cambia equipaje
  ]);

  // === /pago: recalcular total cuando el booking es TRASLADO con transferDoc ===
useEffect(() => {
  if (!bookingData?.transferDoc) return;

  const pax = Number(bookingData.passengers || 1);

  // 1) base según doc del traslado
  let base = computeFromTransferDoc(pax, bookingData.transferDoc);

  // 2) extras (idénticos a tu lógica actual)
  const isNight = (() => {
    const t = bookingData.time || bookingData.hora;
    if (!t) return false;
    const [hh] = String(t).split(":").map(Number);
    return (hh || 0) >= 21 || (hh || 0) < 6;
  })();

  const extraLuggage = Number(bookingData.luggage23kg || 0) > 3;
  const extrasSum = (isNight ? 5 : 0) + (extraLuggage ? 10 : 0);

  const total = Number((base + extrasSum).toFixed(2));

  if (total !== Number(bookingData.totalPrice || 0) || base !== Number(bookingData.basePrice || 0)) {
    setBookingData((prev: any) => {
      const next = {
        ...prev,
        basePrice: base,
        isNightTime: isNight,
        extraLuggage,
        totalPrice: total,
      };
      try { localStorage.setItem("bookingData", JSON.stringify(next)); } catch {}
      return next;
    });
  }
}, [
  bookingData?.transferDoc,
  bookingData?.passengers,
  bookingData?.time,
  bookingData?.hora,
  bookingData?.luggage23kg,
]);

  // Exponer en el body un atributo cuando el modal de cotización esté abierto
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (quoteModalOpen) document.body.setAttribute("data-quote-modal", "open");
    else document.body.removeAttribute("data-quote-modal");
  }, [quoteModalOpen]);

  useEffect(() => {
    if (!bookingData?.tourDoc) return;
    if (bookingData?.tourDoc?.requirements) return;

    try {
      // intenta emparejar por slug o por título
      const slug = bookingData.selectedTourSlug || bookingData.tourDoc.slug;
      const match: any =
        Array.isArray(toursList) &&
        toursList.find(
          (t) =>
            (slug && (t.slug === slug || t.title === slug)) ||
            t.title === bookingData.tourDoc.title
        );
      if (match?.requirements) {
        setBookingData((prev: any) => {
          const next = {
            ...prev,
            tourDoc: { ...prev.tourDoc, requirements: match.requirements },
          };
          try {
            localStorage.setItem("bookingData", JSON.stringify(next));
          } catch {}
          return next;
        });
      }
    } catch {}
  }, [toursList, bookingData?.tourDoc, bookingData?.selectedTourSlug]);

  // Fallbacks y helpers para la sección copiada del hero
  const bookingForm: any = useMemo(
    () => ({
      dateField: { label: "Fecha" },
      timeField: { label: "Hora" },
      passengersField: {
        label: "Pasajeros",
        singular: "Pasajero",
        plural: "Pasajeros",
      },
      vehicleField: {
        label: "Tipo de vehículo",
        labelCoche: "Coche (4 personas)",
        labelMinivan: "Minivan (6 pasajeros)",
        labelVan: "Van (8 pasajeros)",
      },
      notes: {
        minivan6:
          "Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero.",
        minivan5:
          "Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg.",
      },
    }),
    []
  );

  const minDateStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const parsePassengers = (paxStr: any) => {
    const n = parseInt(String(paxStr || ""), 10);
    if (!Number.isFinite(n)) return 1;
    return Math.min(56, Math.max(1, n));
  };

  const getVehicleCap = (_v?: string) => {
    const caps: Record<string, number> = { coche: 4, minivan: 6, van: 8 };
    return caps[_v || "coche"] || 56;
  };


  const availableDestinations = useMemo(() => {
    try {
      // derivar destinos disponibles según el origen seleccionado en el modal
      const from = modalForm?.origen;
      return pricingGetAvailableDestinations(from);
    } catch {
      return [];
    }
  }, [modalForm?.origen]);

  const openNewQuoteModal = () => {
    // Mantén el tipo seleccionado por el usuario o el del booking actual, pero NO lo infieras por tener direcciones
    const defaultTipo: "tour" | "traslado" =
      bookingData?.isEvent ||
      bookingData?.tourId ||
      bookingData?.tourDoc ||
      bookingData?.selectedTourSlug
        ? "tour"
        : bookingData?.tipoReserva || "traslado";

    setModalForm({
      tipo: defaultTipo,
      // 💡 SIEMPRE vacíos al crear NUEVA cotización (requisito)
      origen: "",
      destino: "",
      pickupAddress: "",
      dropoffAddress: "",
      // 💡 Fecha/Hora vacías
      date: "",
      time: "",
      // Pasajeros arranca con el valor actual (con tope)
      passengers: String(
        Math.max(
          1,
          Math.min(
            56,
            Number(bookingData?.passengers || bookingData?.pasajeros || 1)
          )
        )
      ),
      ninos: 0,
      vehicle: bookingData?.vehicle || bookingData?.vehiculo || "coche",

      // Si era tour, dejamos el slug si existía (para que siga siendo tour), PERO no autoconvertimos por direcciones
      selectedTourSlug: bookingData?.selectedTourSlug || "",
      categoriaTour: bookingData?.categoriaTour || "",
      subtipoTour: bookingData?.subtipoTour || "",

      // 💡 Vuelo SIEMPRE vacío al crear nueva cotización
      flightNumber: "",
      flightArrivalTime: "",
      flightDepartureTime: "",

      // 💡 Equipaje SIEMPRE en cero al crear nueva cotización
      luggage23kg: 0,
      luggage10kg: 0,

      specialRequests: "",
      totalPrice: 0,
      contactName: bookingData?.contactName || "",
      contactPhone: bookingData?.contactPhone || "",
      contactEmail: bookingData?.contactEmail || "",
    });
    setModalEditingId(null);
    setModalStep(1);
    setQuoteModalOpen(true);
  };

  // Nueva función: abrir modal con origen y destino intercambiados (ida y vuelta)
  const openReturnQuoteModal = () => {
    returnInitiatedRef.current = true;

    const currentOrigin =
      savedOriginOnLoad ??
      bookingData?.origen ??
      bookingData?.origin ??
      bookingData?.pickupAddress ??
      "";
    const currentDestination =
      savedDestinationOnLoad ??
      bookingData?.destino ??
      bookingData?.destination ??
      bookingData?.dropoffAddress ??
      "";

    // Mantener tipo del booking actual, pero NO inferirlo por direcciones
    const defaultTipo: "tour" | "traslado" =
      bookingData?.isEvent ||
      bookingData?.tourId ||
      bookingData?.tourDoc ||
      bookingData?.selectedTourSlug
        ? "tour"
        : bookingData?.tipoReserva || "traslado";

    const invertedData = {
      tipo: defaultTipo,
      origen:  "",
      destino:  "",
      // 💡 Direcciones VACÍAS (es nueva cotización)
      pickupAddress: "",
      dropoffAddress: "",
      date: "",
      time: "",
      passengers: String(
        Math.max(
          1,
          Math.min(
            56,
            Number(bookingData?.passengers || bookingData?.pasajeros || 1)
          )
        )
      ),
      ninos: 0,
      vehicle:
        bookingData?.vehicle ||
        bookingData?.vehiculo ||
        bookingData?.vehicleType ||
        "coche",

      selectedTourSlug: bookingData?.selectedTourSlug || "",
      categoriaTour: bookingData?.categoriaTour || "",
      subtipoTour: bookingData?.subtipoTour || "",

      // 💡 Vuelo VACÍO
      flightNumber: "",
      flightArrivalTime: "",
      flightDepartureTime: "",

      // 💡 Equipaje en cero
      luggage23kg: 0,
      luggage10kg: 0,

      specialRequests: "",
      totalPrice: 0,
      contactName: bookingData?.contactName || "",
      contactPhone: bookingData?.contactPhone || "",
      contactEmail: bookingData?.contactEmail || "",
    };

    setModalForm(invertedData);
    setModalEditingId(null);
    setModalStep(1);
    setQuoteModalOpen(true);
  };

  const openEditModal = async (item: any) => {
    console.warn(item)
    const tipo: "tour" | "traslado" =
      item?.tipo ||
      (item?.tourId || item?.tourDoc || item?.selectedTourSlug ? "tour" : "traslado");

    // ——— Traslado: resolvemos transferDoc por la ruta actual del ítem ———
    let transferDoc = item?.transferDoc;
   
    

    setModalForm({
      // identidad del ítem
      id: item?.id,
      tipo,

      // --- RUTA ORIGINAL (hidratar ambos pares) ---
      // Prioriza las claves 'origen'/'destino' guardadas en el item;
      // si no existen, cae a pickup/dropoff, y viceversa para mantener ambos campos visibles.
      origen: toIndexKey(transferDoc?.from)|| "",
      destino: toIndexKey(transferDoc?.to)|| "",
      pickupAddress: item?.pickupAddress ?? item?.origen ?? "",
      dropoffAddress: item?.dropoffAddress ?? item?.destino ?? "",
      tipoTour: item?.tipoTour || "",
      // tour/transfer docs
      selectedTourSlug: item?.selectedTourSlug || "",
      tourDoc: item?.tourDoc,               // si es tour
      transferDoc,                          // si es traslado

      // flags de vuelo (prioriza los del transferDoc)
      requireFlightInfo:  !!(transferDoc?.requireFlightInfo ?? item?.requireFlightInfo),
      requireFlightNumber:!!(transferDoc?.requireFlightNumber ?? item?.requireFlightNumber),
      requireFlightTimes: !!(transferDoc?.requireFlightTimes ?? item?.requireFlightTimes),

      // resto de campos
      date: item?.date || "",
      time: item?.time || "",
      passengers: String(item?.passengers ?? 1),
      ninos: Number(item?.ninos ?? 0),
      vehicle: item?.vehicle || "coche",

      flightNumber: item?.flightNumber || "",
      flightArrivalTime: item?.flightArrivalTime || "",
      flightDepartureTime: item?.flightDepartureTime || "",

      luggage23kg: Number(item?.luggage23kg ?? 0),
      luggage10kg: Number(item?.luggage10kg ?? 0),
      specialRequests: item?.specialRequests || "",

      totalPrice: Number(item?.totalPrice ?? 0),
      contactName: item?.contactName || "",
      contactPhone: item?.contactPhone || "",
      contactEmail: item?.contactEmail || "",
    });

    // marca que estamos editando un ítem del carrito (no la reserva -1)
    setModalEditingId(item?.id);
    setModalStep(2);
    setQuoteModalOpen(true);
  };

  // Calcular precio automático para traslados dentro del modal cuando cambian campos relevantes
  const computeModalPrice = (mf: any) => {
    try {
      if (!mf) return 0;
      const pax = Math.max(1, Number(mf.passengers || 1));

      // === TOUR ===
      if (mf.tipo === "tour") {
        // Busca el tour seleccionado por slug o título
        const selectedTour = Array.isArray(toursList)
          ? toursList.find(
              (t) =>
                (t.slug || t.title) === mf.selectedTourSlug ||
                t.title === mf.selectedTourSlug
            )
          : undefined;

        const isNight =
          mf.subtipoTour === "nocturno" ||
          (() => {
            if (!mf.time) return false;
            const [hh] = String(mf.time).split(":").map(Number);
            const h = hh || 0;
            return h >= 21 || h < 6;
          })();

        // Si el tour trae modo de precios con reglas/tabla, usar computeFromTourDoc (escala por pasajeros)
        if (selectedTour && (selectedTour as any).pricingMode) {
          let total = computeFromTourDoc(pax, selectedTour as any);
          // Si en tu negocio aplican recargos globales a tours, descomenta:
          // if (isNight) total += 5
          // if (Number(mf.luggage23kg || 0) > 3) total += 10
          return Number(total.toFixed(2));
        }

        // Fallback: base x horas (usa Day/Night si existen)
        let base = 0;
        if (
          isNight &&
          typeof (selectedTour as any)?.basePriceNight === "number"
        ) {
          base = (selectedTour as any).basePriceNight;
        } else if (
          !isNight &&
          typeof (selectedTour as any)?.basePriceDay === "number"
        ) {
          base = (selectedTour as any).basePriceDay;
        } else if (typeof (selectedTour as any)?.basePrice === "number") {
          base = (selectedTour as any).basePrice;
        }
        const hours = isNight ? 3 : 2;
        return Number((base * hours).toFixed(2));
      }

      // === TRASLADO ===
      const normalize = (v: string | undefined) => {
        if (!v) return undefined;
        const low = String(v).toLowerCase();
        
        if (low.includes("cdg")) return "cdg";
        if (low.includes("orly")) return "orly";
        if (low.includes("beauvais") || low.includes("bva")) return "beauvais";
        if (low.includes("disney")) return "disneyland";
        if (low.includes("paris") || low.includes("parís")) return "paris";
        return undefined;
      };
      const from = normalize(mf.origen) || normalize(mf.pickupAddress);
      const to = normalize(mf.destino) || normalize(mf.dropoffAddress);
      const baseCalc = calcBaseTransferPrice(from, to, pax);
      const base =
        typeof baseCalc === "number" ? baseCalc : Number(mf.basePrice || 0);
      const isNight = (() => {
        if (!mf.time) return false;
        const [hh] = String(mf.time).split(":").map(Number);
        const h = hh || 0;
        return h >= 21 || h < 6;
      })();
      const extraLuggage = Number(mf.luggage23kg ?? 0) > 3;
      const extrasSum = (isNight ? 5 : 0) + (extraLuggage ? 10 : 0);
      return Number((base + extrasSum).toFixed(2));
    } catch {
      return mf.totalPrice || 0;
    }
  };

  useEffect(() => {
  if (modalEditingId === null) return;          // solo en modo edición
  if (modalForm?.tipo !== "traslado") return;
  const from = modalForm?.origen?.trim();
  const to   = modalForm?.destino?.trim();
  if (!from || !to) return;

  let cancelled = false;
  const t = setTimeout(async () => {
    try {
      const doc = await getTransferDocByRoute(from, to);
      if (cancelled) return;
      setModalForm((s: any) => ({
        ...s,
        transferDoc: doc || undefined,
        requireFlightInfo:  !!(doc?.requireFlightInfo),
        requireFlightNumber:!!(doc?.requireFlightNumber),
        requireFlightTimes: !!(doc?.requireFlightTimes),
      }));
    } catch {}
  }, 250); // debounce

  return () => { cancelled = true; clearTimeout(t); };
}, [modalForm?.origen, modalForm?.destino, modalEditingId]);

  // Mantener total calculado cuando cambian campos relevantes
  useEffect(() => {
    try {
      const total = computeModalPrice(modalForm);
      setModalForm((s: any) => ({
        ...s,
        totalPrice: total,
        basePrice: s.basePrice || undefined,
      }));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    modalForm.tipo,
    modalForm.origen,
    modalForm.destino,
    modalForm.pickupAddress,
    modalForm.dropoffAddress,
    modalForm.time,
    modalForm.passengers,
    modalForm.luggage23kg,
    modalForm.luggage10kg,
  ]);

  // Validación por paso del modal
  const validateModalStep = (
    step: number
  ): { valid: boolean; errors: Record<string, string> } => {
    const errs: Record<string, string> = {};
    const mf = modalForm || {};

    // 👇 si estás editando, ignora el paso 1 por completo
    if (step === 1 && modalEditingId !== null) {
      return { valid: true, errors: {} };
    }

    if (step === 1) {
      if (!mf.tipo) errs.tipo = "Selecciona tipo";
      return { valid: Object.keys(errs).length === 0, errors: errs };
    }

    if (step === 2) {
      const p = Math.max(
        1,
        Math.min(56, Number(mf.passengers || mf.pasajeros || 1))
      );
      if (!p || p < 1) errs.passengers = "Requerido";
      if (!mf.time || String(mf.time).trim() === "") errs.time = "Requerido";
      if (!mf.date || String(mf.date).trim() === "") errs.date = "Requerido";
      if (!mf.vehicle && !mf.vehiculo) errs.vehicle = "Requerido";

      if (mf.tipo === "traslado") {
        if (!mf.origen) errs.origen = "Requerido";
        if (!mf.destino) errs.destino = "Requerido";
      }
      if (mf.tipo === "tour") {
        if (!mf.selectedTourSlug && !mf.categoriaTour && !mf.subtipoTour)
          errs.selectedTourSlug = "Selecciona un tour o categoría";
      }
      return { valid: Object.keys(errs).length === 0, errors: errs };
    }

    if (step === 3) {
      if (mf.tipo === "traslado") {
        if (!mf.pickupAddress || String(mf.pickupAddress).trim() === "")
          errs.pickupAddress = "Requerido";
        if (!mf.dropoffAddress || String(mf.dropoffAddress).trim() === "")
          errs.dropoffAddress = "Requerido";
      }

      const p = Math.max(
        1,
        Math.min(56, Number(mf.passengers || mf.pasajeros || 1))
      );
      const date = mf.date || mf.fecha;
      const time = mf.time || mf.hora;
      if (!p || p < 1) errs.passengers = "Requerido";
      if (!date || !String(date).trim()) errs.date = "Requerido";
      if (!time || !String(time).trim()) errs.time = "Requerido";

      // 🔴 Si el tour seleccionado exige vuelo → los 3 campos son obligatorios
      if (modalRequiresFlight(mf, toursList)) {
        if (!String(mf.flightNumber || "").trim())
          errs.flightNumber = "Requerido";
        if (!String(mf.flightArrivalTime || "").trim())
          errs.flightArrivalTime = "Requerido";
        if (!String(mf.flightDepartureTime || "").trim())
          errs.flightDepartureTime = "Requerido";
      }
      return { valid: Object.keys(errs).length === 0, errors: errs };
    }

    return { valid: true, errors: {} };
  };
  const handleModalPrev = () => setModalStep((s) => Math.max(1, s - 1));

  const handleModalNext = () => {
    const { valid, errors } = validateModalStep(modalStep);
    if (!valid) {
      setModalFieldErrors(errors);
      const first = Object.keys(errors)[0];
      requestAnimationFrame(() => {
        const el = document.querySelector(
          `[data-modal-field="${first}"]`
        ) as HTMLElement | null;
        el?.focus();
      });
      return;
    }
    setModalFieldErrors({});
    setModalStep((s) => Math.min(3, s + 1)); // 👈 avanza 1 paso
  };

  const transfersIdx = useMemo(
      () => buildTransfersIndexes(transfersList || []),
      [transfersList]
    );
  
    // Claves de origen disponibles y labels helpers
    const originKeys = useMemo(
      () => Object.keys(transfersIdx.byOrigin || {}),
      [transfersIdx]
    );
    const getOriginLabel = (k?: string) =>
      (k && transfersIdx.byOrigin?.[k]?.label) || k || "";
  const destinationKeys = useMemo(() => {
    if (!bookingData?.transferDoc.from) return [];
    return Object.keys(transfersIdx.byOrigin || {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData?.origen, transfersIdx]);
  const getDestinationLabel = (k?: string) => {
    const originKey =
      (bookingData as any)?.originKey || (modalForm as any)?.origen || "";
    if (!k || !originKey) return k || "";
    // Si el destino es igual al origen, no devolver etiqueta
    if (k === originKey) return "";
    return (
      transfersIdx.byOrigin?.[originKey]?.destinations?.[k]?.label || k
    );
  };


  const updateCurrentBookingFromModal = () => {
  const mf = modalForm;
  setBookingData((prev: any) => {
    const next = {
      ...prev,
      quickType: mf.tipo === "tour" ? "tour" : "traslado",

      // campos comunes
      origen: mf.origen || prev?.origen || "",
      destino: mf.destino || prev?.destino || "",
      pickupAddress: mf.pickupAddress || prev?.pickupAddress || "",
      dropoffAddress: mf.dropoffAddress || prev?.dropoffAddress || "",
      date: mf.date,
      time: mf.time,
      passengers: Number(mf.passengers || 1),
      ninos: Number(mf.ninos || 0),
      vehicle: mf.vehicle || prev?.vehicle || "coche",

      // tour
      selectedTourSlug: mf.selectedTourSlug || prev?.selectedTourSlug || "",
      categoriaTour: mf.categoriaTour || prev?.categoriaTour || "",
      subtipoTour: mf.subtipoTour || prev?.subtipoTour || "",

      // vuelo / equipaje
      flightNumber: mf.flightNumber || prev?.flightNumber || "",
      flightArrivalTime: mf.flightArrivalTime || prev?.flightArrivalTime || "",
      flightDepartureTime:
        mf.flightDepartureTime || prev?.flightDepartureTime || "",
      luggage23kg: Number(mf.luggage23kg ?? prev?.luggage23kg ?? 0),
      luggage10kg: Number(mf.luggage10kg ?? prev?.luggage10kg ?? 0),

      specialRequests: mf.specialRequests || prev?.specialRequests || "",

      // total (respeta el que calcula tu computeModalPrice)
      totalPrice: Number(mf.totalPrice || prev?.totalPrice || 0),
    };
    try { localStorage.setItem("bookingData", JSON.stringify(next)); } catch {}
    return next;
  });

  // cerrar modal como en updateExistingItem
  setQuoteModalOpen(false);
  setModalEditingId(null);
  setModalStep(1);
  toast({ title: "Guardado", description: "Reserva actual actualizada." });
};

  const handleModalSave = (isEdit = false) => {
    console.warn("Guardando modal...", modalForm);
  const errs = validateModalForSave({ ...modalForm });
  if (modalRequiresFlight(modalForm, toursList)) {
    if (!modalForm.flightNumber?.trim()) errs.flightNumber = "Requerido";
    if (!modalForm.flightArrivalTime?.trim()) errs.flightArrivalTime = "Requerido";
    if (!modalForm.flightDepartureTime?.trim()) errs.flightDepartureTime = "Requerido";
  }
  if (Object.keys(errs).length) {
    setModalFieldErrors(errs);
    requestAnimationFrame(() => {
      const first = Object.keys(errs)[0];
      const el = document.querySelector(`[data-modal-field="${first}"]`) as HTMLElement | null;
      el?.focus();
    });
    return;
  }

  setModalFieldErrors({});

  // 👇 clave: si estamos “editando” y el id es -1, actualiza bookingData
  if (modalEditingId !== null) {
    if (modalEditingId === -1) {
      updateCurrentBookingFromModal();
    } else {
      updateExistingItem();
    }
  } else {
    saveModalAsNew();
  }
};

  const persistCarrito = (next: any[]) => {
    try {
      localStorage.setItem("carritoCotizaciones", JSON.stringify(next));
    } catch {}
    setCarritoState(next);
  };

  const removeCartItem = (id: number) => {
    try {
      const next = carritoState.filter((it) => it.id !== id);
      persistCarrito(next);
      toast({
        title: "Eliminado",
        description: "Cotización eliminada del carrito.",
      });
    } catch (e) {
      console.error("No se pudo eliminar item del carrito", e);
    }
  };


  const validateModalForSave = (mf: any): Record<string, string> => {
    const errs: Record<string, string> = {};
    

    // comunes
    if (!mf.passengers || Number(mf.passengers) <= 0)
      errs.passengers = "Requerido";
    if (!mf.date) errs.date = "Requerido";
    if (!mf.time) errs.time = "Requerido";
    if (mf.tipo === "traslado") {
      if (!mf.pickupAddress?.trim()) errs.pickupAddress = "Requerido";
      if (!mf.dropoffAddress?.trim()) errs.dropoffAddress = "Requerido";
    }
    if (modalRequiresFlight(mf, toursList)) {
      if (!mf.flightNumber?.trim()) errs.flightNumber = "Requerido";
      if (!mf.flightArrivalTime?.trim()) errs.flightArrivalTime = "Requerido";
      if (!mf.flightDepartureTime?.trim()) errs.flightDepartureTime = "Requerido";
    }
    // si es tour, forzar selección de tour
    if (
      mf.tipo === "tour" &&
      !mf.selectedTourSlug &&
      !mf.categoriaTour &&
      !mf.subtipoTour
    ) {
      errs.selectedTourSlug = "Selecciona un tour o categoría";
    }
    return errs;
  };

  // Helper centralizado
  const modalTourRequiresFlight = (mf: any, tours: TourData[]): boolean => {
  if (mf?.tipo !== "tour") return false; // 👈 evita falsos positivos en traslados

  if (mf?.tourDoc?.requirements?.requireFlightNumber) return true;
  if (mf?.tourData?.requirements?.requireFlightNumber) return true;
  if (mf?.requireFlightNumber) return true;

  try {
    const sel = Array.isArray(tours)
      ? tours.find(
          (t) =>
            (t.slug || t.title) === mf.selectedTourSlug ||
            t.title === mf.selectedTourSlug
        )
      : null;
    return sel?.requirements?.requireFlightNumber === true;
  } catch {
    return false;
  }
};

  const modalRequiresFlight = (mf: any, tours: TourData[]): boolean => {
    // 1) Tours: respeta requirements del tour (único caso donde puede ser obligatorio)
    if (modalTourRequiresFlight(mf, tours)) return true;

    // 2) Traslados: SOLO si hay flags explícitos en el ítem o en su transferDoc.
    if (mf?.tipo === "traslado") {
      const explicit =
        mf?.requireFlightInfo === true ||
        mf?.requireFlightNumber === true ||
        mf?.requireFlightTimes === true ||
        mf?.transferDoc?.requireFlightInfo === true ||
        mf?.transferDoc?.requireFlightNumber === true ||
        mf?.transferDoc?.requireFlightTimes === true;
      return explicit === true;
    }

    return false;
  };

  const saveModalAsNew = () => {
    const errs = validateModalForSave(modalForm);

    if (modalRequiresFlight(modalForm, toursList)) {
      if (!modalForm.flightNumber?.trim()) errs.flightNumber = "Requerido";
      if (!modalForm.flightArrivalTime?.trim())
        errs.flightArrivalTime = "Requerido";
      if (!modalForm.flightDepartureTime?.trim())
        errs.flightDepartureTime = "Requerido";
    }

    if (Object.keys(errs).length) {
      setModalFieldErrors(errs);
      requestAnimationFrame(() => {
        const first = Object.keys(errs)[0];
        const el = document.querySelector(
          `[data-modal-field="${first}"]`
        ) as HTMLElement | null;
        el?.focus();
      });
      return;
    }

    // ✅ Crear el nuevo item
    const newItem = {
      ...modalForm,
      id: modalForm.id || Date.now(),
      tipo: modalForm.tipo || "tour",
      passengers: Number(modalForm.passengers || 1),
      totalPrice: Number(modalForm.totalPrice || 0),
    };

    // ✅ Guardar en localStorage y en state
    const next = [...carritoState, newItem];
    persistCarrito(next);

    // ✅ Cerrar modal y limpiar errores
    setModalFieldErrors({});
    setQuoteModalOpen(false);
  };

  // Ítem “virtual” para la reserva actual (no se guarda en carritoState)
  const currentCartItem = useMemo(() => {
    if (!bookingData) return null;
    const it = buildSinglePayload(bookingData);
    return { ...it, id: -1, _isCurrent: true }; // marca para no permitir borrar/editar
  }, [bookingData]);

  // Lista a mostrar en el carrito: extras + actual
  const cartDisplayItems = useMemo(() => {
    if (!currentCartItem) return carritoState;
    return [...carritoState, currentCartItem];
  }, [carritoState, currentCartItem]);

  const updateExistingItem = () => {
    if (modalEditingId === null) return;
    const updated = carritoState.map((it) =>
      it.id === modalEditingId
        ? {
            ...it,
            tipo: modalForm.tipo,

            // Reconstruir etiqueta visible usando ubicaciones generales (origen/destino via labelMap)
            serviceLabel:
              modalForm.tipo === "tour"
                ? "Tour"
                : (() => {
                    const originLabel = modalForm.origen
                      ? 
                        modalForm.origen
                      : modalForm.pickupAddress || it.pickupAddress || "";
                    const destLabel = modalForm.destino
                      ? 
                        modalForm.destino
                      : modalForm.dropoffAddress || it.dropoffAddress || "";
                    if (!originLabel && !destLabel)
                      return it.serviceLabel || "Traslado";
                    return `${originLabel}${originLabel && destLabel ? " → " : ""}${destLabel}`;
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
            flightDepartureTime:
              modalForm.flightDepartureTime || it.flightDepartureTime,
            flightArrivalTime:
              modalForm.flightArrivalTime || it.flightArrivalTime,
          }
        : it
    );
    persistCarrito(updated);
    // close modal and clear editing state
    setQuoteModalOpen(false);
    setModalEditingId(null);
    setModalStep(1);
    toast({ title: "Guardado", description: "Cotización actualizada." });
  };
  /*
   * === RECARGO NOCTURNO AUTOMÁTICO ===
   * Ahora, además de calcular el recargo nocturno según la hora seleccionada en la reserva (time),
   * detectamos la hora local del cliente en la página de pago. Si son >=21h o <6h y el booking no tenía
   * ya marcado isNightTime, se añade automáticamente el recargo (+5€) excepto para 'tour-paris' / 'tour-nocturno'
   * donde la lógica de tarifa nocturna ya está incorporada al precio por hora en la pantalla anterior.
   * Si quieres cambiar el rango nocturno modifica la condición hour >= 21 || hour < 6.
   */

  useEffect(() => {
    const data = localStorage.getItem("bookingData");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed?.contactPhone) {
          const withPlus = ensureLeadingPlus(String(parsed.contactPhone));
          parsed.contactPhone = formatPhonePretty(withPlus);
          localStorage.setItem("bookingData", JSON.stringify(parsed));
        }
        setBookingData(parsed);
      } catch {
        setBookingData(JSON.parse(data));
      }
    }
    try {
      const raw = localStorage.getItem("carritoCotizaciones");
      if (raw) setCarritoState(JSON.parse(raw));
    } catch {}
    setIsLoading(false);
  }, []);

  // Detectar hora local del cliente y marcar recargo nocturno si aplica cuando aún no se marcó.
  useEffect(() => {
    if (!bookingData) return;
    try {
      const now = new Date();
      const hour = now.getHours();
      const isNight = hour >= 21 || hour < 6;
      // Sólo aplicar automáticamente si el registro aún no tenía isNightTime true y NO es un tour (los tours ya incorporan lógica propia)
      if (isNight && !bookingData.isNightTime && !bookingData.tourId && !bookingData.time) {
        setBookingData((prev: any) => {
          if (!prev) return prev;
          const next = {
            ...prev,
            isNightTime: true,
            totalPrice: Number(prev.totalPrice || 0) + 5,
          };
          localStorage.setItem("bookingData", JSON.stringify(next));
          return next;
        });
      }
    } catch {}
  }, [bookingData]);

  // Asegurar que el número de niños no supere el número de pasajeros ni 10
  useEffect(() => {
    try {
      if (!bookingData) return;
      const pax = Number(bookingData.passengers || bookingData.pasajeros || 1);
      const ninos = Number(bookingData.ninos ?? 0);
      const maxAllowed = Math.min(10, Math.max(0, pax));
      if (ninos > maxAllowed) {
        updateBookingField("ninos", Math.min(ninos, maxAllowed));
      }
    } catch {}
  }, [bookingData?.passengers, bookingData?.pasajeros, bookingData?.ninos]);

  const updateBookingField = (key: string, value: any) => {
  setBookingData((prev: any) => {
    const next: any = { ...prev, [key]: value };

    // 🔧 Normalizar campos numéricos (SIN límite 9)
    next.passengers = Math.max(1, Math.min(56, Number(next.passengers || 1)));
    next.luggage23kg = Math.max(0, Number(next.luggage23kg ?? 0));
    next.luggage10kg = Math.max(0, Number(next.luggage10kg ?? 0));

    // 🎫 Eventos: total = precio por persona * cupos
    if (next.isEvent && typeof next.pricePerPerson === "number") {
      const total =
        Number(next.pricePerPerson) * Number(next.passengers || 1);
      next.totalPrice = Number(total.toFixed(2));
      try {
        localStorage.setItem("bookingData", JSON.stringify(next));
      } catch {}
      // limpieza de errores
      setFieldErrors((prevErr) => {
        if (!prevErr[key]) return prevErr;
        if (typeof value === "string" && value.trim() === "") return prevErr;
        if (key === "contactEmail") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailRegex.test(String(value))) return prevErr;
        }
        if (key === "contactPhone") {
          if (String(value).replace(/\D/g, "").length < 6) return prevErr;
        }
        const passengers = next.passengers ?? next.pasajeros;
        const date = next.date ?? next.fecha;
        const time = next.time ?? next.hora;
        const contactName = next.contactName;
        const contactPhone = next.contactPhone;
        const contactEmail = next.contactEmail;
        const pickupAddress = next.pickupAddress;
        const dropoffAddress = next.dropoffAddress;
        const needsAddresses =
          !next.isEvent && !next.isTourQuick && !next.tourId;
        const allValid =
          passengers &&
          Number(passengers) > 0 &&
          date &&
          String(date).trim() !== "" &&
          time &&
          String(time).trim() !== "" &&
          contactName &&
          String(contactName).trim() !== "" &&
          contactPhone &&
          String(contactPhone).trim() !== "" &&
          contactEmail &&
          String(contactEmail).trim() !== "" &&
          (!needsAddresses ||
            (pickupAddress &&
              String(pickupAddress).trim() !== "" &&
              dropoffAddress &&
              String(dropoffAddress).trim() !== ""));
        if (allValid) return {};
        const clone = { ...prevErr };
        delete clone[key];
        return clone;
      });
      return next;
    }

    // 🧮 TOURS: delega el total a computeFromTourDoc (precio escala por pax)
    if (next.tourDoc) {
      const n = Number(next.passengers || 1);
      let total = computeFromTourDoc(n, next.tourDoc);
      // Si aplicas recargos globales a tours, déjalos aquí
      if (next.isNightTime) total += 5;
      if (Number(next.luggage23kg || 0) > 3) total += 10;

      next.totalPrice = Number(total.toFixed(2));
      try {
        localStorage.setItem("bookingData", JSON.stringify(next));
      } catch {}

      // limpieza de errores
      setFieldErrors((prevErr) => {
        if (!prevErr[key]) return prevErr;
        if (typeof value === "string" && value.trim() === "") return prevErr;
        if (key === "contactEmail") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailRegex.test(String(value))) return prevErr;
        }
        if (key === "contactPhone") {
          if (String(value).replace(/\D/g, "").length < 6) return prevErr;
        }
        const passengers = next.passengers ?? next.pasajeros;
        const date = next.date ?? next.fecha;
        const time = next.time ?? next.hora;
        const contactName = next.contactName;
        const contactPhone = next.contactPhone;
        const contactEmail = next.contactEmail;
        const pickupAddress = next.pickupAddress;
        const dropoffAddress = next.dropoffAddress;
        const needsAddresses =
          !next.isEvent && !next.isTourQuick && !next.tourId;
        const allValid =
          passengers &&
          Number(passengers) > 0 &&
          date &&
          String(date).trim() !== "" &&
          time &&
          String(time).trim() !== "" &&
          contactName &&
          String(contactName).trim() !== "" &&
          contactPhone &&
          String(contactPhone).trim() !== "" &&
          contactEmail &&
          String(contactEmail).trim() !== "" &&
          (!needsAddresses ||
            (pickupAddress &&
              String(pickupAddress).trim() !== "" &&
              dropoffAddress &&
              String(dropoffAddress).trim() !== ""));
        if (allValid) return {};
        const clone = { ...prevErr };
        delete clone[key];
        return clone;
      });
      return next;
    }

    // 🚗 TRASLADOS con transferDoc: calcula base con priceP4..P8 y extras
    if (next.transferDoc) {
      const pax = Math.max(1, Number(next.passengers || 1));
      const base = computeFromTransferDoc(pax, next.transferDoc);

      const isNight = (() => {
        const t = next.time || next.hora;
        if (!t) return false;
        const [hh] = String(t).split(":").map(Number);
        const h = hh || 0;
        return h >= 21 || h < 6;
      })();
      const extraLuggage = Number(next.luggage23kg ?? 0) > 3;
      const extrasSum = (isNight ? 5 : 0) + (extraLuggage ? 10 : 0);

      next.basePrice = base;
      next.isNightTime = isNight;
      next.extraLuggage = extraLuggage;
      next.luggageCount =
        Number(next.luggage23kg ?? 0) + Number(next.luggage10kg ?? 0);
      next.totalPrice = Number((base + extrasSum).toFixed(2));

      try {
        localStorage.setItem("bookingData", JSON.stringify(next));
      } catch {}

      // limpieza de errores
      setFieldErrors((prevErr) => {
        if (!prevErr[key]) return prevErr;
        if (typeof value === "string" && value.trim() === "") return prevErr;
        if (key === "contactEmail") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailRegex.test(String(value))) return prevErr;
        }
        if (key === "contactPhone") {
          if (String(value).replace(/\D/g, "").length < 6) return prevErr;
        }
        const passengers = next.passengers ?? next.pasajeros;
        const date = next.date ?? next.fecha;
        const time = next.time ?? next.hora;
        const contactName = next.contactName;
        const contactPhone = next.contactPhone;
        const contactEmail = next.contactEmail;
        const pickupAddress = next.pickupAddress;
        const dropoffAddress = next.dropoffAddress;
        const needsAddresses =
          !next.isEvent && !next.isTourQuick && !next.tourId;
        const allValid =
          passengers &&
          Number(passengers) > 0 &&
          date &&
          String(date).trim() !== "" &&
          time &&
          String(time).trim() !== "" &&
          contactName &&
          String(contactName).trim() !== "" &&
          contactPhone &&
          String(contactPhone).trim() !== "" &&
          contactEmail &&
          String(contactEmail).trim() !== "" &&
          (!needsAddresses ||
            (pickupAddress &&
              String(pickupAddress).trim() !== "" &&
              dropoffAddress &&
              String(dropoffAddress).trim() !== ""));
        if (allValid) return {};
        const clone = { ...prevErr };
        delete clone[key];
        return clone;
      });

      return next;
    }

    // 🚗 TRASLADOS SIN transferDoc: calcula base por direcciones (fallback)
    if (next.pickupAddress && next.dropoffAddress) {
      const from = (next.pickupAddress || "").toLowerCase().includes("cdg")
        ? "cdg"
        : (next.pickupAddress || "").toLowerCase().includes("orly")
          ? "orly"
          : (next.pickupAddress || "").toLowerCase().includes("beauvais")
            ? "beauvais"
            : (next.pickupAddress || "").toLowerCase().includes("disney")
              ? "disneyland"
              : (next.pickupAddress || "").toLowerCase().includes("parís") ||
                  (next.pickupAddress || "").toLowerCase().includes("paris")
                ? "paris"
                : undefined;

      const to = (next.dropoffAddress || "").toLowerCase().includes("cdg")
        ? "cdg"
        : (next.dropoffAddress || "").toLowerCase().includes("orly")
          ? "orly"
          : (next.dropoffAddress || "").toLowerCase().includes("beauvais")
            ? "beauvais"
            : (next.dropoffAddress || "").toLowerCase().includes("disney")
              ? "disneyland"
              : (next.dropoffAddress || "")
                    .toLowerCase()
                    .includes("parís") ||
                (next.dropoffAddress || "").toLowerCase().includes("paris")
                ? "paris"
                : undefined;

      const pax = Math.max(1, Number(next.passengers || 1));
      const baseCalc = calcBaseTransferPrice(from, to, pax);
      const base =
        typeof baseCalc === "number" ? baseCalc : Number(next.basePrice || 0);

      const isNight = (() => {
        if (!next.time) return false;
        const [hh] = String(next.time).split(":").map(Number);
        const h = hh || 0;
        return h >= 21 || h < 6;
      })();
      const extraLuggage = Number(next.luggage23kg ?? 0) > 3;
      const extrasSum = (isNight ? 5 : 0) + (extraLuggage ? 10 : 0);

      next.isNightTime = isNight;
      next.extraLuggage = extraLuggage;
      next.luggageCount =
        Number(next.luggage23kg ?? 0) + Number(next.luggage10kg ?? 0);
      next.totalPrice = Number((base + extrasSum).toFixed(2));
      next.basePrice = base;

      try {
        localStorage.setItem("bookingData", JSON.stringify(next));
      } catch {}

      // limpieza de errores
      setFieldErrors((prevErr) => {
        if (!prevErr[key]) return prevErr;
        if (typeof value === "string" && value.trim() === "") return prevErr;
        if (key === "contactEmail") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailRegex.test(String(value))) return prevErr;
        }
        if (key === "contactPhone") {
          if (String(value).replace(/\D/g, "").length < 6) return prevErr;
        }
        const passengers = next.passengers ?? next.pasajeros;
        const date = next.date ?? next.fecha;
        const time = next.time ?? next.hora;
        const contactName = next.contactName;
        const contactPhone = next.contactPhone;
        const contactEmail = next.contactEmail;
        const pickupAddress = next.pickupAddress;
        const dropoffAddress = next.dropoffAddress;
        const needsAddresses =
          !next.isEvent && !next.isTourQuick && !next.tourId;
        const allValid =
          passengers &&
          Number(passengers) > 0 &&
          date &&
          String(date).trim() !== "" &&
          time &&
          String(time).trim() !== "" &&
          contactName &&
          String(contactName).trim() !== "" &&
          contactPhone &&
          String(contactPhone).trim() !== "" &&
          contactEmail &&
          String(contactEmail).trim() !== "" &&
          (!needsAddresses ||
            (pickupAddress &&
              String(pickupAddress).trim() !== "" &&
              dropoffAddress &&
              String(dropoffAddress).trim() !== ""));
        if (allValid) return {};
        const clone = { ...prevErr };
        delete clone[key];
        return clone;
      });

      return next;
    }

    // 🧩 Por defecto: solo persistir y limpiar error del campo
    try {
      localStorage.setItem("bookingData", JSON.stringify(next));
    } catch {}

    setFieldErrors((prevErr) => {
      if (!prevErr[key]) return prevErr;
      if (typeof value === "string" && value.trim() === "") return prevErr;
      if (key === "contactEmail") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(String(value))) return prevErr;
      }
      if (key === "contactPhone") {
        if (String(value).replace(/\D/g, "").length < 6) return prevErr;
      }
      const clone = { ...prevErr };
      delete clone[key];
      return clone;
    });

    return next;
  });
};

  // Validar email en blur y actualizar errores de campo
  const validateAndSetEmail = (value: string) => {
    try {
      updateBookingField("contactEmail", value);
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (!emailRegex.test(String(value))) {
          next.contactEmail = "Formato inválido";
        } else {
          delete next.contactEmail;
        }
        return next;
      });
    } catch {}
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent"></div>
      </div>
    );
  }
  const requireFlight =
    bookingData?.tourDoc?.requirements?.requireFlightNumber === true ||
    bookingData?.tourData?.requirements?.requireFlightNumber === true ||
    bookingData?.requireFlightInfo === true;

  // ¿Vuelo obligatorio dentro del MODAL?
  const requireFlightModal =
    bookingData?.tourDoc?.requirements?.requireFlightNumber === true ||
    bookingData?.tourData?.requirements?.requireFlightNumber === true ||
    (() => {
      try {
        const sel = Array.isArray(toursList)
          ? toursList.find(
              (t) =>
                (t.slug || t.title) === modalForm.selectedTourSlug ||
                t.title === modalForm.selectedTourSlug
            )
          : null;
        return sel?.requirements?.requireFlightNumber === true;
      } catch {
        return false;
      }
    })();


  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">
            No hay datos de reserva
          </h1>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Derivados para depósito/remaining y método de pago
  const paymentMethod = bookingData?.paymentMethod || "card"; // card | paypal | cash
  const isQuick = bookingData?.quickDeposit === true;
  const isTour = Boolean(
    bookingData?.isEvent ||
      bookingData?.tourHours !== undefined ||
      bookingData?.routeOption !== undefined ||
      (bookingData?.tourId && typeof bookingData.tourId === "string")
  );
  const isEvent = Boolean(bookingData?.isEvent);
  const isTourBooking =
    !isEvent &&
    Boolean(
      bookingData?.tourHours !== undefined ||
        bookingData?.routeOption !== undefined ||
        (bookingData?.tourId && typeof bookingData.tourId === "string")
    );
  // Si tenemos una ruta y pasajeros, recalcular base con la nueva lógica
  let computedBase = Number(bookingData?.basePrice || 0);
  try {
    const from = (bookingData?.pickupAddress || "")
      .toLowerCase()
      .includes("cdg")
      ? "cdg"
      : (bookingData?.pickupAddress || "").toLowerCase().includes("orly")
        ? "orly"
        : (bookingData?.pickupAddress || "").toLowerCase().includes("beauvais")
          ? "beauvais"
          : (bookingData?.pickupAddress || "").toLowerCase().includes("disney")
            ? "disneyland"
            : (bookingData?.pickupAddress || "")
                  .toLowerCase()
                  .includes("parís") ||
                (bookingData?.pickupAddress || "")
                  .toLowerCase()
                  .includes("paris")
              ? "paris"
              : undefined;
    const to = (bookingData?.dropoffAddress || "").toLowerCase().includes("cdg")
      ? "cdg"
      : (bookingData?.dropoffAddress || "").toLowerCase().includes("orly")
        ? "orly"
        : (bookingData?.dropoffAddress || "").toLowerCase().includes("beauvais")
          ? "beauvais"
          : (bookingData?.dropoffAddress || "").toLowerCase().includes("disney")
            ? "disneyland"
            : (bookingData?.dropoffAddress || "")
                  .toLowerCase()
                  .includes("parís") ||
                (bookingData?.dropoffAddress || "")
                  .toLowerCase()
                  .includes("paris")
              ? "paris"
              : undefined;
    const pax = Number(bookingData?.passengers || 1);
    const baseCalc = calcBaseTransferPrice(from, to, pax);
    if (typeof baseCalc === "number") computedBase = baseCalc;
  } catch {}
  const total = Number(bookingData?.totalPrice || computedBase || 0);
  const isSingleTour =
  !cartActive &&
  (
    bookingData?.isEvent ||                       // evento cuenta como tour para % depósito
    bookingData?.tourId ||                        // tour con id
    bookingData?.tourDoc ||                       // tour con doc cargado
    bookingData?.selectedTourSlug                 // tour elegido por slug
  );

const depositPercent = isSingleTour ? 0.2 : 0.1;
const depositPercentInt = Math.round(depositPercent * 100);
const deposit = Math.max(1, Number((total * depositPercent).toFixed(2)));
  const remaining = Math.max(0, Number((total - deposit).toFixed(2)));
  // const amountNow = payFullNow ? total : deposit
  const clientHour = (() => {
    try {
      return new Date().getHours();
    } catch {
      return undefined;
    }
  })();

  // Valida la cotización actual (sin carrito)
  const validateSingleBooking = (
    bd: any,
    paymentPickupAddress: string,
    paymentDropoffAddress: string
  ): string[] => {
    const reasons: string[] = [];
    if (!bd) return ["Faltan datos de la reserva."];

    const passengers = Number(bd.passengers ?? bd.pasajeros ?? 0);
    const date = String(bd.date ?? bd.fecha ?? "");
    const time = String(bd.time ?? bd.hora ?? "");
    const needsAddresses = !bd.isEvent && !bd.isTourQuick && !bd.tourId;

    if (!(passengers > 0)) reasons.push("Indica la cantidad de pasajeros.");
    if (!date.trim()) reasons.push("Selecciona la fecha del servicio.");
    if (!time.trim()) reasons.push("Selecciona la hora del servicio.");

    if (needsAddresses) {
      if (!String(paymentPickupAddress || "").trim())
        reasons.push("Completa la dirección exacta de recogida.");
      if (!String(paymentDropoffAddress || "").trim())
        reasons.push("Completa la dirección exacta de destino.");
    }

    // Contacto
    if (!String(bd.contactName || "").trim())
      reasons.push("Escribe tu nombre completo.");
    if (!String(bd.contactPhone || "").trim())
      reasons.push("Indica un teléfono válido.");
    const email = String(bd.contactEmail || "");
    if (!email.trim()) {
      reasons.push("Indica un email válido.");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(email))
        reasons.push("El email no tiene un formato válido.");
    }

    // 🔴 REGLA NUEVA: si el tour requiere datos de vuelo → exige número + hora llegada + hora salida
    const requireFlightByTour =
      bd?.tourDoc?.requirements?.requireFlightNumber === true ||
      bd?.tourData?.requirements?.requireFlightNumber === true;

    if (requireFlightByTour) {
      if (!String(bd.flightNumber || "").trim())
        reasons.push("Indica el número de vuelo.");
      if (!String(bd.flightArrivalTime || "").trim())
        reasons.push("Indica la hora de llegada del vuelo.");
      if (!String(bd.flightDepartureTime || "").trim())
        reasons.push("Indica la hora de salida del vuelo.");
    }

    // Si quieres además forzar hora del servicio por `requireTime` del tour:
    const requireTimeByTour =
      bd?.tourDoc?.requirements?.requireTime === true ||
      bd?.tourData?.requirements?.requireTime === true;
    if (requireTimeByTour && !String(time).trim()) {
      reasons.push("La hora del tour es obligatoria.");
    }

    return reasons;
  };

  // Valida cada ítem del carrito (solo corre cuando hay 2+)
  const validateCartItems = (items: any[]): string[] => {
    const reasons: string[] = [];
    for (const it of items) {
      if (!(Number(it.passengers || 0) > 0)) {
        reasons.push("Una cotización del carrito no tiene pasajeros.");
        break;
      }
      if (!String(it.date || "").trim()) {
        reasons.push("Una cotización del carrito no tiene fecha.");
        break;
      }
      if (!String(it.time || "").trim()) {
        reasons.push("Una cotización del carrito no tiene hora.");
        break;
      }
      if (it.tipo === "traslado") {
        if (!String(it.pickupAddress || "").trim()) {
          reasons.push(
            "Una cotización del carrito no tiene dirección de recogida."
          );
          break;
        }
        if (!String(it.dropoffAddress || "").trim()) {
          reasons.push(
            "Una cotización del carrito no tiene dirección de destino."
          );
          break;
        }
      }
    }
    return reasons;
  };

  // Razones por las que no se puede pagar todavía (si el botón está desactivado)
 const getDepositDisabledReasons = (): string[] => {
  const reasons: string[] = [];
  const cartLen = carritoState?.length ?? 0;

  // 1) Si hay 2+ cotizaciones, valida el carrito
  if (cartLen >= 2) {
    reasons.push(...validateCartItems(carritoState));
  }

  // 2) Valida siempre la cotización actual (la “larga”)
  reasons.push(
    ...validateSingleBooking(
      bookingData,
      paymentPickupAddress,
      paymentDropoffAddress
    )
  );

  // ➕ Regla extra SOLO para TRASLADOS que requieran datos de vuelo
  try {
    const b = bookingData || {};
    const type =
      String(b?.tipo || b?.tipoReserva || b?.quickType || "").toLowerCase();
    const isTransfer = type === "traslado";

    if (isTransfer) {
      const doc = b.transferDoc || {};
      const requireFlightInfo =
        !!b.requireFlightInfo ||
        !!doc.requireFlightInfo ||
        !!doc.requiredFlightInfo ||
        !!doc.requireFlight;

      const requireFlightNumber =
        !!b.requireFlightNumber ||
        !!doc.requireFlightNumber ||
        !!doc.requiredFlightNumber ||
        !!doc.requireFlight;

      const requireFlightTimes =
        !!b.requireFlightTimes ||
        !!doc.requireFlightTimes ||
        !!doc.requiredFlightTimes ||
        requireFlightInfo; // si se pide info de vuelo, pedimos horas

      const has = (v: any) =>
        typeof v === "number" ? true : Boolean(String(v ?? "").trim());

      if (requireFlightInfo || requireFlightNumber) {
        if (!has(b.flightNumber)) reasons.push("Ingresa el número de vuelo.");
      }
      if (requireFlightInfo || requireFlightTimes) {
        if (!has(b.flightArrivalTime))
          reasons.push("Ingresa la hora de llegada del vuelo.");
        if (!has(b.flightDepartureTime))
          reasons.push("Ingresa la hora de salida del vuelo.");
      }
    }
  } catch {
    // no romper UI por errores de lectura
  }

  // 3) Incluye errores de campos actuales (si existieran)
  for (const v of Object.values(fieldErrors || {})) {
    const msg = String(v || "").trim();
    if (msg) reasons.push(msg);
  }

  // Dedup y salida ordenada
  return Array.from(new Set(reasons)).filter(Boolean);
};


  // === Estado listo para pagar
  const isDepositReady = (): boolean => {
    return getDepositDisabledReasons().length === 0;
  };

  // Etiquetas seguras para servicio/route en quick
  const quickType: "traslado" | "tour" | undefined = bookingData?.quickType;

  // ===== NUEVO: obtener nombre legible del tour si aplica =====
  const selectedTourTitleFromList = (() => {
    try {
      if (bookingData?.selectedTourSlug && Array.isArray(toursList)) {
        const t = toursList.find(
          (x) =>
            x.slug === bookingData.selectedTourSlug ||
            x.title === bookingData.selectedTourSlug
        );
        return t?.title;
      }
    } catch {}
    return undefined;
  })();

  // === NUEVO: label de traslado desde Sanity (title/name) o desde from/to ===
const transferLabel =
  bookingData?.transferDoc?.title ||
  bookingData?.transferData?.title ||
  bookingData?.transferDoc?.name ||
  bookingData?.transferData?.name ||
  (bookingData?.transferDoc?.from && bookingData?.transferDoc?.to
    ? `${bookingData.transferDoc.from} → ${bookingData.transferDoc.to}`
    : "");
  const tourName =
    bookingData?.tourDoc?.title ||
    selectedTourTitleFromList ||
    (bookingData?.tourId ? toTitle(bookingData.tourId) : "");

  // ===== REEMPLAZA tu serviceLabel por este =====
  const serviceLabel =
  bookingData?.isEvent
    ? bookingData?.eventTitle || "Evento especial"
    : isQuick
      ? bookingData?.quickType === "traslado"
        ? transferLabel || // 👈 PRIORIDAD al nombre del traslado
          (bookingData?.origen && bookingData?.destino
            ? `${ bookingData.origen} → ${bookingData.destino}`
            : "Traslado")
        : tourName || "Tour"
      : isTour
        ? tourName || "Tour"
        : transferLabel || // 👈 PRIORIDAD al nombre del traslado
          (bookingData?.origen && bookingData?.destino
            ? `${ bookingData.origen} → ${bookingData.destino}`
            : "Traslado");
  // Enviar a WhatsApp cuando el método es efectivo
  const sendWhatsApp = () => {
    try {
      const numberFromEnv = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
      const phone = (numberFromEnv || "").replace(/[^\d]/g, ""); // solo dígitos
      const isEvent = Boolean(bookingData?.isEvent);
      const title = isEvent
        ? bookingData?.eventTitle || "Evento especial"
        : bookingData?.tourId
          ? bookingData.tourId.split("-").join(" → ").toUpperCase()
          : "Servicio";
      const paxLabel = isEvent ? "Cupos" : "Pasajeros";
      const equipaje = isEvent
        ? `23kg: ${bookingData?.luggage23kg ?? 0} | 10kg: ${bookingData?.luggage10kg ?? 0}`
        : `${bookingData?.luggageCount || 0} maleta(s)`;

      const extraLines: string[] = [];
      const isTourMsg = Boolean(bookingData?.tourId);
      if (!isTourMsg) {
        if (bookingData?.isNightTime) extraLines.push("Recargo nocturno: +5€");
        if (bookingData?.extraLuggage) extraLines.push("Equipaje extra: +10€");
      }
      if (bookingData?.routeOption)
        extraLines.push(`Opción: ${bookingData.routeOption}`);
      if (bookingData?.tourHours)
        extraLines.push(`Duración: ${bookingData.tourHours}h`);

      const lines = [
        "Hola, quisiera confirmar una reserva:",
        `• ${isEvent ? "Evento" : "Servicio"}: ${title}`,
        `• Fecha y hora: ${bookingData?.date || "-"} ${bookingData?.time ? `a las ${bookingData.time}` : ""}`,
        `• ${paxLabel}: ${bookingData?.passengers || 0}`,
        bookingData?.pickupAddress
          ? `• Recogida: ${bookingData.pickupAddress}`
          : "",
        bookingData?.dropoffAddress
          ? `• Destino: ${bookingData.dropoffAddress}`
          : "",
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
        "Realizaré el depósito para confirmar la reserva. Gracias.",
      ].filter(Boolean);

      const msg = encodeURIComponent(lines.join("\n"));
      const waBase = "https://wa.me/";
      const url = phone
        ? `${waBase}${phone}?text=${msg}`
        : `${waBase}?text=${msg}`;
      window.open(url, "_blank");
    } catch (e) {
      console.error("No se pudo abrir WhatsApp:", e);
    }
  };

  // Sumar total del carrito desde state
  const totalCarrito = carritoState.reduce(
    (acc: number, item: any) => acc + Number(item.totalPrice || 0),
    0
  );
  const tieneTour = carritoState.some((item: any) => item.tipo === "tour");
  const tieneTraslado = carritoState.some(
    (item: any) => item.tipo === "traslado"
  );

  // Calcular importes combinados (cuando hay carrito):
  // - combinedTotal: suma de totales de carrito + booking actual
  // - combinedDepositSum: suma de depósitos (según tipo) de cada item + depósito del booking actual
  const combinedTotal = Number(
    (totalCarrito + Number(bookingData.totalPrice || total || 0)).toFixed(2)
  );
  const computeDepositForItem = (itm: any) => {
  const price = Number(itm?.totalPrice || 0);
  const percent = getDepositPercent(itm); // devuelve 0.2 para TOUR/EVENT, 0.1 para TRASLADO
  return Number((price * percent).toFixed(2));
};
  const combinedDepositSum =
    carritoState.reduce(
      (acc: number, it: any) => acc + computeDepositForItem(it),
      0
    ) +
    (payFullNow
      ? 0
      : computeDepositForItem({
          ...bookingData,
          tipo: isTour ? "tour" : "traslado",
        }));
  // Si el usuario marca pagar todo ahora, el importe a cobrar es el total combinado; si no, es la suma de depósitos
  const getCombinedAmountToCharge = () =>
    payFullNow ? combinedTotal : combinedDepositSum;
  // === Importe ahora / Saldo cuando hay carrito activo ===
  const amountNowSingle = payFullNow ? total : deposit;
  const amountNow = cartActive ? getCombinedAmountToCharge() : amountNowSingle;
  const remainingCombined = Math.max(
    0,
    Number((combinedTotal - amountNow).toFixed(2))
  );
  // Añadir el servicio/quote actual al carrito y mantener al usuario en la misma página
  const addCurrentToCart = () => {
    if (!bookingData) return;
    try {
      const safeOrigen =
        bookingData.origen ||
        bookingData.pickupAddress ||
        paymentPickupAddress ||
        "";
      const safeDestino =
        bookingData.destino ||
        bookingData.dropoffAddress ||
        paymentDropoffAddress ||
        "";

      const isTourType = bookingData.isEvent
        ? true
        : Boolean(bookingData.tourId);
      const primaryLabel = isTourType
  ? "Tour"
  : (bookingData?.transferDoc?.title ||
     bookingData?.transferData?.title ||
     "Traslado");
      let secondaryLabel = "";
      if (isTourType) {
        const name =
          bookingData?.tourData?.title ||
          (() => {
            try {
              if (bookingData?.selectedTourSlug && Array.isArray(toursList)) {
                const t = toursList.find(
                  (x) =>
                    x.slug === bookingData.selectedTourSlug ||
                    x.title === bookingData.selectedTourSlug
                );
                return t?.title;
              }
              return undefined;
            } catch {
              return undefined;
            }
          })() ||
          bookingData?.tourId ||
          "Tour";
        secondaryLabel = truncate(name, 30);
      } else {
        const originLabel = safeOrigen
          ?  safeOrigen
          : "";
        const destLabel = safeDestino
          ?  safeDestino
          : "";
        const route =
          originLabel || destLabel
            ? `${originLabel}${originLabel && destLabel ? " → " : ""}${destLabel}`
            : "Traslado";
        secondaryLabel = truncate(route, 30);
      }

      const item = {
        id: Date.now(),
        tipo:
          bookingData.isEvent ||
          bookingData.tipoReserva === "tour" ||
          bookingData.tourId ||
          bookingData.tourData ||
          bookingData.selectedTourSlug
            ? "tour"
            : "traslado",
        serviceLabel: primaryLabel,
        serviceSubLabel: secondaryLabel,
        origen: safeOrigen,
        destino: safeDestino,
        luggage23kg: Number(bookingData.luggage23kg ?? 0),
        luggage10kg: Number(bookingData.luggage10kg ?? 0),
        flightNumber: bookingData.flightNumber || "",
        flightArrivalTime: bookingData.flightArrivalTime || "",
        flightDepartureTime: bookingData.flightDepartureTime || "",
        specialRequests: bookingData.specialRequests || "",
        pickupAddress: bookingData.pickupAddress || paymentPickupAddress || "",
        dropoffAddress:
          bookingData.dropoffAddress || paymentDropoffAddress || "",
        date: bookingData.date || bookingData.fecha || "",
        time: bookingData.time || bookingData.hora || "",
        passengers: Number(
          bookingData.passengers || bookingData.pasajeros || 1
        ),
        vehicle: bookingData.vehicle || bookingData.vehiculo || bookingData.vehicleType || "",
categoriaTour: bookingData.categoriaTour || bookingData.tourCategory || "",
subtipoTour: bookingData.subtipoTour || bookingData.tourSubtype || "",
        totalPrice: Number(bookingData.totalPrice || total || 0),
      };

      const updated = [...carritoState, item];
      localStorage.setItem("carritoCotizaciones", JSON.stringify(updated));
      setCarritoState(updated);

      try {
        toast({
          title: "Añadido al carrito",
          description:
            "Tu cotización se añadió al carrito. Puedes continuar cotizando o pagar todo junto.",
        });
      } catch {}
    } catch (e) {
      console.error("No se pudo agregar al carrito", e);
      alert("No se pudo agregar al carrito. Intenta nuevamente.");
    }
  };
  

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
              <h1 className="text-4xl font-bold text-primary mb-4">
                Página de Pago
              </h1>
              <p className="text-xl text-muted-foreground">
                Confirma tu reserva y procede con el pago seguro
              </p>
            </AnimatedSection>

            <div className="grid lg:grid-cols-2 gap-8 min-h-[900px] lg:overflow-visible">
              {/* Booking Summary: ocultar si hay múltiples cotizaciones (actual + extras) */}
              {carritoState?.length < 1 && (
                <AnimatedSection animation="slide-left" delay={200}>
                  <Card className="transform hover:scale-105 transition-all duration-300 lg:sticky lg:top-24 z-20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <CheckCircle className="w-6 h-6 text-accent" />
                        Resumen de tu Reserva
                        {bookingData.isEvent && (
                          <Badge className="ml-2 bg-accent text-white">
                            Evento
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookingData.isEvent &&
                        Array.isArray(bookingData.eventImages) &&
                        bookingData.eventImages.length > 0 && (
                          <EventImagesCarousel
                            images={bookingData.eventImages}
                            shortInfo={bookingData.eventShortInfo}
                          />
                        )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {bookingData.isEvent ? "Evento:" : "Servicio:"}
                        </span>
                        <div className="flex items-center gap-2 relative">
                          {isTour ? (
                            <Badge className="bg-accent text-accent-foreground">
                              {bookingData.tourData.title || "Tour"}
                            </Badge>
                          ) : (
                            <Badge className="bg-accent text-accent-foreground">
                              {serviceLabel}
                            </Badge>
                          )}
                          {/* Tooltip info breve */}
                          {(isTour
                            ? bookingData.tourData?.briefInfo
                            : bookingData.transferData?.briefInfo) && (
                            <TooltipBriefInfo
                              info={
                                isTour
                                  ? bookingData.tourData?.briefInfo
                                  : bookingData.transferData?.briefInfo
                              }
                            />
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        {/* Pasajeros/Cupos editable */}
                        {bookingData.isEvent &&
                          bookingData.eventShortInfo &&
                          !bookingData.eventImages?.length && (
                            <div className="text-sm text-muted-foreground border-l-2 border-accent/60 pl-3">
                              {bookingData.eventShortInfo}
                            </div>
                          )}
                        <div className="flex flex-wrap items-center gap-3">
                          <Users className="w-4 h-4 text-accent" />
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {bookingData.isEvent ? "Cupos" : "Pasajeros"}
                            </span>

                            <Select
                              value={String(bookingData.passengers ?? 1)}
                              onValueChange={(value) => {
                                const n = Math.max(
                                  1,
                                  Math.min(56, Number(value) || 1)
                                );
                                updateBookingField("passengers", n);

                                // 🔹 Guarda también en localStorage si el pago depende de ello
                                try {
                                  const stored =
                                    localStorage.getItem("bookingData");
                                  if (stored) {
                                    const obj = JSON.parse(stored);
                                    obj.passengers = n;
                                    localStorage.setItem(
                                      "bookingData",
                                      JSON.stringify(obj)
                                    );
                                  }
                                } catch {}
                              }}
                            >
                              <SelectTrigger
                                data-field="passengers"
                                className={`w-24 cursor-pointer ${
                                  fieldErrors.passengers
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }`}
                              >
                                <SelectValue placeholder="Selecciona" />
                              </SelectTrigger>

                              {/* 🔹 Lista dinámica de 1 a 56 pasajeros */}
                              <SelectContent className="max-h-72 overflow-y-auto">
                                {Array.from(
                                  { length: 56 },
                                  (_, i) => i + 1
                                ).map((n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n} {n === 1 ? "Pasajero" : "Pasajeros"}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Selector para niños (hasta 10) */}
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm flex items-center gap-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-accent"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-3-3v6m9 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Niños
                            </span>
                            <Select
                              value={String(bookingData.ninos ?? 0)}
                              onValueChange={(value) =>
                                updateBookingField("ninos", Number(value))
                              }
                            >
                              <SelectTrigger
                                data-field="ninos"
                                className={
                                  "w-20 cursor-pointer " +
                                  (fieldErrors.ninos
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : "")
                                }
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-72">
                                {Array.from(
                                  {
                                    length:
                                      Math.min(
                                        10,
                                        Math.max(
                                          1,
                                          parsePassengers(
                                            bookingData.passengers || 1
                                          )
                                        )
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
                          {/* Selector para niños menores de 9 años, igual estilo que el principal */}
                          {Number(bookingData.ninos || 0) > 0 && (
                            <>
                              <div className="flex items-center gap-2  mt-2">
                                <span className="text-sm flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-accent"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      fill="none"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4m0 4h.01"
                                    />
                                  </svg>
                                  Menores de 9 años
                                </span>
                                <Select
                                  value={String(bookingData.ninosMenores9 ?? 0)}
                                  onValueChange={(value) =>
                                    updateBookingField(
                                      "ninosMenores9",
                                      Number(value)
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    data-field="ninosMenores9"
                                    className={
                                      "w-20 cursor-pointer " +
                                      (fieldErrors.ninosMenores9
                                        ? "border-destructive focus-visible:ring-destructive"
                                        : "")
                                    }
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-72">
                                    {Array.from(
                                      {
                                        length:
                                          Number(bookingData.ninos || 0) + 1,
                                      },
                                      (_, i) => (
                                        <SelectItem key={i} value={String(i)}>
                                          {i}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                          )}
                        </div>
                        {fieldErrors.passengers && (
                          <p className="text-xs text-destructive mt-1">
                            {fieldErrors.passengers}
                          </p>
                        )}

                        {/* Fecha y hora editable */}
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-accent" />
                          <div className="flex items-center gap-2">
                            <Input
                              type="date"
                              data-field="date"
                              className={`w-40 ${fieldErrors.date ? "border-destructive focus-visible:ring-destructive" : ""}`}
                              value={bookingData.date || ""}
                              onChange={(e) =>
                                updateBookingField("date", e.target.value)
                              }
                            />
                            <Input
                              type="time"
                              data-field="time"
                              className={`w-full max-w-xs ${fieldErrors.time ? "border-destructive focus-visible:ring-destructive" : ""}`}
                              value={bookingData.time || ""}
                              onChange={(e) =>
                                updateBookingField("time", e.target.value)
                              }
                            />
                          </div>
                        </div>
                        {(fieldErrors.date || fieldErrors.time) && (
                          <p className="text-xs text-destructive mt-1">
                            {fieldErrors.date || fieldErrors.time}
                          </p>
                        )}

                        {/* Direcciones: editables en traslados, sólo lectura en tours / eventos */}
                        {isTour ? (
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium text-primary">
                              Direcciones (información adicional)
                            </h4>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                {`Origen del servicio${bookingData?.origen ? ` [${bookingData.origen}]` : ""}`}
                              </label>
                              <p className="text-sm text-muted-foreground">
                                {carritoState && carritoState.length > 0
                                  ? ""
                                  : paymentPickupAddress || "No especificado"}
                              </p>
                              <Input
                                placeholder="Ubicación exacta"
                                data-field="paymentPickupAddress"
                                className={
                                  fieldErrors.pickupAddress
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                                value={paymentPickupAddress}
                                onChange={(e) => {
                                  setPaymentPickupAddress(e.target.value);
                                  // no tocar bookingData.pickupAddress para que el label del servicio no cambie
                                  if (fieldErrors.pickupAddress) {
                                    setFieldErrors((f) => {
                                      const c = { ...f };
                                      delete c.pickupAddress;
                                      return c;
                                    });
                                  }
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                {`Destino del servicio${bookingData?.destino ? ` [${bookingData.destino}]` : ""}`}
                              </label>
                              <p className="text-sm text-muted-foreground">
                                {carritoState && carritoState.length > 0
                                  ? ""
                                  : bookingData.dropoffAddress ||
                                    
                                    bookingData.destino ||
                                    "No especificado"}
                              </p>
                              <Input
                                placeholder="Ubicación exacta"
                                data-field="paymentDropoffAddress"
                                className={
                                  fieldErrors.dropoffAddress
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                                value={paymentDropoffAddress}
                                onChange={(e) => {
                                  setPaymentDropoffAddress(e.target.value);
                                  updateBookingField(
                                    "dropoffAddress",
                                    e.target.value
                                  );
                                  if (fieldErrors.dropoffAddress)
                                    setFieldErrors((f) => {
                                      const c = { ...f };
                                      delete c.dropoffAddress;
                                      return c;
                                    });
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Número de Vuelo{" "}
                                  {bookingData?.tourDoc?.requirements
                                    ?.requireFlightNumber
                                    ? "(obligatorio)"
                                    : "(opcional)"}
                                </label>
                                <Input
                                  placeholder="AF1234, BA456, etc."
                                  className={
                                    fieldErrors.flightNumber
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                  value={bookingData.flightNumber ?? ""}
                                  onChange={(e) =>
                                    updateBookingField(
                                      "flightNumber",
                                      e.target.value
                                    )
                                  }
                                />
                                {fieldErrors.flightNumber && (
                                  <p className="text-xs text-destructive mt-1">
                                    {fieldErrors.flightNumber}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Hora de llegada{" "}
                                  {bookingData?.tourDoc?.requirements
                                    ?.requireFlightNumber
                                    ? "(obligatorio)"
                                    : "(opcional)"}
                                </label>
                                <Input
                                  type="time"
                                  placeholder="HH:MM"
                                  className={
                                    fieldErrors.flightArrivalTime
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                  value={bookingData.flightArrivalTime || ""}
                                  onChange={(e) =>
                                    updateBookingField(
                                      "flightArrivalTime",
                                      e.target.value
                                    )
                                  }
                                />
                                {fieldErrors.flightArrivalTime && (
                                  <p className="text-xs text-destructive mt-1">
                                    {fieldErrors.flightArrivalTime}
                                  </p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Hora de salida{" "}
                                  {bookingData?.tourDoc?.requirements
                                    ?.requireFlightNumber
                                    ? "(obligatorio)"
                                    : "(opcional)"}
                                </label>
                                <Input
                                  type="time"
                                  placeholder="HH:MM"
                                  className={
                                    fieldErrors.flightDepartureTime
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                  value={bookingData.flightDepartureTime || ""}
                                  onChange={(e) =>
                                    updateBookingField(
                                      "flightDepartureTime",
                                      e.target.value
                                    )
                                  }
                                />
                                {fieldErrors.flightDepartureTime && (
                                  <p className="text-xs text-destructive mt-1">
                                    {fieldErrors.flightDepartureTime}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium text-primary">
                              Direcciones (información adicional)
                            </h4>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                {`Origen del servicio${
                                  bookingData?.origen
                                    ? ` [${bookingData.origen}]`
                                    : ""
                                }`}
                              </label>

                              <Input
                                placeholder="Ubicación exacta"
                                data-field="paymentPickupAddress"
                                className={
                                  fieldErrors.pickupAddress
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                                value={paymentPickupAddress}
                                onChange={(e) => {
                                  // Solo actualiza el campo, sin afectar el label
                                  setPaymentPickupAddress(e.target.value);
                                  updateBookingField(
                                    "pickupAddress",
                                    e.target.value
                                  );
                                  if (fieldErrors.pickupAddress)
                                    setFieldErrors((f) => {
                                      const c = { ...f };
                                      delete c.pickupAddress;
                                      return c;
                                    });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                {`Destino del servicio${bookingData?.destino ? ` [${bookingData.destino}]` : ""}`}
                              </label>
                              <Input
                                placeholder="Ubicación exacta"
                                data-field="paymentDropoffAddress"
                                className={
                                  fieldErrors.dropoffAddress
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                                value={paymentDropoffAddress}
                                onChange={(e) => {
                                  setPaymentDropoffAddress(e.target.value);
                                  if (fieldErrors.dropoffAddress)
                                    setFieldErrors((f) => {
                                      const c = { ...f };
                                      delete c.dropoffAddress;
                                      return c;
                                    });
                                }}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              {/* Número de vuelo */}
                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Número de Vuelo{" "}
                                  {requireFlight
                                    ? "(obligatorio)"
                                    : "(opcional)"}
                                </label>
                                <Input
                                  placeholder="AF1234, BA456, etc."
                                  className={
                                    fieldErrors.flightNumber
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                  value={bookingData.flightNumber ?? ""}
                                  onChange={(e) =>
                                    updateBookingField(
                                      "flightNumber",
                                      e.target.value
                                    )
                                  }
                                />
                                {fieldErrors.flightNumber && (
                                  <p className="text-xs text-destructive mt-1">
                                    {fieldErrors.flightNumber}
                                  </p>
                                )}
                              </div>

                              {/* Hora de llegada */}
                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Hora de llegada{" "}
                                  {requireFlight
                                    ? "(obligatorio)"
                                    : "(opcional)"}
                                </label>
                                <Input
                                  type="time"
                                  placeholder="HH:MM"
                                  className={
                                    fieldErrors.flightArrivalTime
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                  value={bookingData.flightArrivalTime || ""}
                                  onChange={(e) =>
                                    updateBookingField(
                                      "flightArrivalTime",
                                      e.target.value
                                    )
                                  }
                                />
                                {fieldErrors.flightArrivalTime && (
                                  <p className="text-xs text-destructive mt-1">
                                    {fieldErrors.flightArrivalTime}
                                  </p>
                                )}
                              </div>

                              {/* Hora de salida (NUEVO) */}
                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Hora de salida{" "}
                                  {requireFlight
                                    ? "(obligatorio)"
                                    : "(opcional)"}
                                </label>
                                <Input
                                  type="time"
                                  placeholder="HH:MM"
                                  className={
                                    fieldErrors.flightDepartureTime
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                  value={bookingData.flightDepartureTime || ""}
                                  onChange={(e) =>
                                    updateBookingField(
                                      "flightDepartureTime",
                                      e.target.value
                                    )
                                  }
                                />
                                {fieldErrors.flightDepartureTime && (
                                  <p className="text-xs text-destructive mt-1">
                                    {fieldErrors.flightDepartureTime}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Equipaje por peso editable para ambos casos */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Luggage className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">
                              Equipaje
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-muted-foreground">
                                # Maletas 23kg
                              </label>
                              <Input
                                type="number"
                                min={0}
                                value={bookingData.luggage23kg ?? 0}
                                onChange={(e) =>
                                  updateBookingField(
                                    "luggage23kg",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">
                                # Maletas 10kg
                              </label>
                              <Input
                                type="number"
                                min={0}
                                value={bookingData.luggage10kg ?? 0}
                                onChange={(e) =>
                                  updateBookingField(
                                    "luggage10kg",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>

                        {bookingData.flightNumber && (
                          <div className="flex items-center gap-3">
                            <span className="text-sm">
                              Vuelo: {bookingData.flightNumber}
                            </span>
                          </div>
                        )}

                        {bookingData.specialRequests && (
                          <div className="flex items-start gap-3">
                            <div className="text-sm">
                              <p className="font-medium">
                                Solicitudes especiales:
                              </p>
                              <p className="text-muted-foreground">
                                {bookingData.specialRequests}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Contact Info: editable para traslados */}
                      {bookingData.isEvent ? (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-primary">
                            Información de Contacto
                          </h4>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              Nombre Completo
                            </label>
                            <Input
                              placeholder="Tu nombre completo"
                              data-field="contactName"
                              className={
                                fieldErrors.contactName
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : ""
                              }
                              value={bookingData.contactName || ""}
                              onChange={(e) =>
                                updateBookingField(
                                  "contactName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                Teléfono
                              </label>
                              <PhoneInputIntl
                                value={bookingData.contactPhone || ""}
                                onChange={(value) =>
                                  updateBookingField("contactPhone", value)
                                }
                                inputProps={{
                                  name: "contactPhone",
                                  className: fieldErrors.contactPhone
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : "",
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                Email
                              </label>
                              <EmailAutocomplete
                                value={bookingData.contactEmail || ""}
                                onChange={(value) =>
                                  updateBookingField("contactEmail", value)
                                }
                                className={
                                  fieldErrors.contactEmail
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                                name="contactEmail"
                                data-field="contactEmail"
                                onBlur={(e) =>
                                  validateAndSetEmail(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              ¿Dónde nos conociste?
                            </label>
                            <Select
                              value={bookingData.referralSource || ""}
                              onValueChange={(v) =>
                                updateBookingField("referralSource", v)
                              }
                            >
                              <SelectTrigger className="cursor-pointer">
                                <SelectValue placeholder="Selecciona una opción" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="google">Google</SelectItem>
                                <SelectItem value="facebook">
                                  Facebook
                                </SelectItem>
                                <SelectItem value="instagram">
                                  Instagram
                                </SelectItem>
                                <SelectItem value="referido">
                                  Recomendación
                                </SelectItem>
                                <SelectItem value="otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              Solicitudes Especiales (opcional)
                            </label>
                            <Input
                              placeholder="Asiento bebé, parada extra, etc."
                              value={bookingData.specialRequests || ""}
                              onChange={(e) =>
                                updateBookingField(
                                  "specialRequests",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      ) : isTour ? (
                        <>
                          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                            <h4 className="font-medium text-primary">
                              Información de Contacto
                            </h4>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                Nombre Completo
                              </label>
                              <Input
                                placeholder="Tu nombre completo"
                                data-field="contactName"
                                className={
                                  fieldErrors.contactName
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                                }
                                value={bookingData.contactName || ""}
                                onChange={(e) =>
                                  updateBookingField(
                                    "contactName",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Teléfono
                                </label>
                                <PhoneInputIntl
                                  value={bookingData.contactPhone || ""}
                                  onChange={(value) =>
                                    updateBookingField("contactPhone", value)
                                  }
                                  inputProps={{
                                    name: "contactPhone",
                                    className: fieldErrors.contactPhone
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : "",
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-medium">
                                  Email
                                </label>
                                <EmailAutocomplete
                                  value={bookingData.contactEmail || ""}
                                  onChange={(value) =>
                                    updateBookingField("contactEmail", value)
                                  }
                                  className={
                                    fieldErrors.contactEmail
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }
                                  name="contactEmail"
                                  data-field="contactEmail"
                                  onBlur={(e) =>
                                    validateAndSetEmail(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                ¿Dónde nos conociste?
                              </label>
                              <Select
                                value={bookingData.referralSource || ""}
                                onValueChange={(v) =>
                                  updateBookingField("referralSource", v)
                                }
                              >
                                <SelectTrigger className="cursor-pointer">
                                  <SelectValue placeholder="Selecciona una opción" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="google">Google</SelectItem>
                                  <SelectItem value="facebook">
                                    Facebook
                                  </SelectItem>
                                  <SelectItem value="instagram">
                                    Instagram
                                  </SelectItem>
                                  <SelectItem value="referido">
                                    Recomendación
                                  </SelectItem>
                                  <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                Solicitudes Especiales (opcional)
                              </label>
                              <Input
                                placeholder="Asiento bebé, parada extra, etc."
                                value={bookingData.specialRequests || ""}
                                onChange={(e) =>
                                  updateBookingField(
                                    "specialRequests",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-primary">
                            Información de Contacto
                          </h4>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              Nombre Completo
                            </label>
                            <Input
                              placeholder="Tu nombre completo"
                              data-field="contactName"
                              className={
                                fieldErrors.contactName
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : ""
                              }
                              value={bookingData.contactName || ""}
                              onChange={(e) =>
                                updateBookingField(
                                  "contactName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                Teléfono
                              </label>
                              <PhoneInputIntl
                                value={bookingData.contactPhone || ""}
                                onChange={(value) =>
                                  updateBookingField("contactPhone", value)
                                }
                                inputProps={{
                                  name: "contactPhone",
                                  className: fieldErrors.contactPhone
                                    ? "w-full !pl-12 border-destructive focus-visible:ring-destructive"
                                    : "w-full !pl-12",
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                Email
                              </label>
                              <EmailAutocomplete
                                value={bookingData.contactEmail || ""}
                                onChange={(value) =>
                                  updateBookingField("contactEmail", value)
                                }
                                className={
                                  fieldErrors.contactEmail
                                    ? "w-full border-destructive focus-visible:ring-destructive"
                                    : "w-full"
                                }
                                name="contactEmail"
                                data-field="contactEmail"
                                onBlur={(e) =>
                                  validateAndSetEmail(e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                ¿Dónde nos conociste?
                              </label>
                              <Select
                                value={bookingData.referralSource || ""}
                                onValueChange={(v) =>
                                  updateBookingField("referralSource", v)
                                }
                              >
                                <SelectTrigger className="cursor-pointer w-full">
                                  <SelectValue placeholder="Selecciona una opción" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="google">Google</SelectItem>
                                  <SelectItem value="facebook">
                                    Facebook
                                  </SelectItem>
                                  <SelectItem value="instagram">
                                    Instagram
                                  </SelectItem>
                                  <SelectItem value="referido">
                                    Recomendación
                                  </SelectItem>
                                  <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <label className="text-xs font-medium">
                                Solicitudes Especiales (opcional)
                              </label>
                              <Input
                                placeholder="Asiento bebé, parada extra, etc."
                                value={bookingData.specialRequests || ""}
                                onChange={(e) =>
                                  updateBookingField(
                                    "specialRequests",
                                    e.target.value
                                  )
                                }
                                className="w-full"
                              />
                            </div>
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
                              <span>{fmtMoney(deposit)}€</span>
                            </div>
                            {isTour && (
                              <div className="flex justify-between text-sm">
                                <span>Precio del tour</span>
                                <span>{fmtMoney(bookingData.totalPrice)}€</span>
                              </div>
                            )}
                            {total > 0 && (
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Importe total estimado del servicio</span>
                                <span>{fmtMoney(total)}€</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                              El resto del servicio ({fmtMoney(remaining)}€) se
                              paga el día del servicio.
                            </p>
                          </>
                        ) : bookingData.isEvent ? (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Precio por cupo</span>
                              <span>
                                {bookingData.pricePerPerson ??
                                  bookingData.totalPrice}
                                €
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Cupos</span>
                              <span>x{bookingData.passengers || 1}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Depósito (20%)</span>
                              <span>{fmtMoney(deposit)}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Saldo el día del servicio</span>
                              <span>{fmtMoney(remaining)}€</span>
                            </div>
                          </>
                        ) : ["tour-paris", "tour-nocturno"].includes(
                            bookingData.tourId || ""
                          ) ? (
                          (() => {
                            const pax = Number(bookingData.passengers || 1);
                            const hours =
                              bookingData.selectedPricingOption?.hours ||
                              bookingData.tourHours ||
                              1;
                            const extraPassengers = Math.max(0, pax - 4);
                            const ratePerExtra = bookingData.isNightTime
                              ? 12
                              : 10;
                            const totalLocal = Number(
                              bookingData.totalPrice || 0
                            );
                            const lines: JSX.Element[] = [];
                            if (bookingData.selectedPricingOption) {
                              lines.push(
                                <div
                                  key="opt"
                                  className="flex justify-between text-sm"
                                >
                                  <span>Opción seleccionada</span>
                                  <span>
                                    {bookingData.selectedPricingOption.label}
                                    {bookingData.selectedPricingOption.hours
                                      ? ` (${bookingData.selectedPricingOption.hours}h)`
                                      : ""}
                                  </span>
                                </div>
                              );
                              lines.push(
                                <div
                                  key="opt-price"
                                  className="flex justify-between text-sm"
                                >
                                  <span>Precio opción</span>
                                  <span>
                                    {fmtMoney(
                                      bookingData.selectedPricingOption.price
                                    )}
                                    €
                                  </span>
                                </div>
                              );
                              lines.push(
                                <div
                                  key="pax"
                                  className="flex justify-between text-sm"
                                >
                                  <span>Pasajeros</span>
                                  <span>{pax}</span>
                                </div>
                              );
                              if (extraPassengers > 0) {
                                const recargo =
                                  ratePerExtra * extraPassengers * hours;
                                lines.push(
                                  <div
                                    key="recargo"
                                    className="flex justify-between text-sm text-accent"
                                  >
                                    <span>Recargo pasajeros extra</span>
                                    <span>+{recargo}€</span>
                                  </div>
                                );
                              }
                            } else {
                              // Intentamos deducir tarifa base por hora (sin extras) para mostrarla.
                              const perHourWithExtras =
                                hours > 0 ? totalLocal / hours : totalLocal;
                              const baseHourly =
                                perHourWithExtras -
                                extraPassengers * ratePerExtra;
                              lines.push(
                                <div
                                  key="rate"
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    Precio por hora (
                                    {bookingData.isNightTime
                                      ? "nocturno"
                                      : "diurno"}
                                    )
                                  </span>
                                  <span>
                                    {Math.max(0, Math.round(baseHourly))}€
                                  </span>
                                </div>
                              );
                              lines.push(
                                <div
                                  key="dur"
                                  className="flex justify-between text-sm"
                                >
                                  <span>Duración</span>
                                  <span>{hours}h</span>
                                </div>
                              );
                              lines.push(
                                <div
                                  key="pax-base"
                                  className="flex justify-between text-sm"
                                >
                                  <span>Pasajeros</span>
                                  <span>{pax}</span>
                                </div>
                              );
                              if (extraPassengers > 0) {
                                const recargo =
                                  ratePerExtra * extraPassengers * hours;
                                lines.push(
                                  <div
                                    key="recargo-base"
                                    className="flex justify-between text-sm text-accent"
                                  >
                                    <span>Recargo pasajeros extra</span>
                                    <span>+{recargo}€</span>
                                  </div>
                                );
                              }
                            }
                            return <>{lines}</>;
                          })()
                        ) : typeof bookingData.basePrice === "number" ? (
                          <>
                            {bookingData.selectedPricingOption && (
                              <>
                                <div className="flex justify-between text-sm">
                                  <span>Opción seleccionada</span>
                                  <span>
                                    {bookingData.selectedPricingOption.label}
                                    {bookingData.selectedPricingOption.hours
                                      ? ` (${bookingData.selectedPricingOption.hours}h)`
                                      : ""}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Precio</span>
                                  <span>
                                    {fmtMoney(
                                      bookingData.selectedPricingOption.price
                                    )}
                                    €
                                  </span>
                                </div>
                              </>
                            )}
                            {!bookingData.selectedPricingOption && (
                              <div className="flex justify-between text-sm">
                                <span>Precio base</span>
                                <span>{bookingData.basePrice}€</span>
                              </div>
                            )}
                            {Math.max(0, (bookingData.passengers || 1) - 4) >
                              0 && (
                              <div className="flex justify-between text-sm">
                                <span>Pasajeros adicionales</span>
                                <span>
                                  +
                                  {Math.max(
                                    0,
                                    (bookingData.passengers || 1) - 4
                                  ) * 20}
                                  €
                                </span>
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
                              <span>
                                Depósito ({Math.round(depositPercent * 100)}%)
                              </span>
                              <span>{fmtMoney(deposit)}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Saldo el día del servicio</span>
                              <span>{fmtMoney(remaining)}€</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Subtotal</span>
                              <span>{fmtMoney(bookingData.totalPrice)}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>
                                Depósito ({Math.round(depositPercent * 100)}%)
                              </span>
                              <span>{fmtMoney(deposit)}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Saldo el día del servicio</span>
                              <span>{fmtMoney(remaining)}€</span>
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
                            <input
                              type="checkbox"
                              checked={payFullNow}
                              onChange={(e) => setPayFullNow(e.target.checked)}
                            />
                            ¿Deseas pagar todo ahora?
                          </label>
                          <div className="flex items-baseline gap-3 font-bold text-lg">
                            <span>
                              Total a pagar ahora{" "}
                              {payFullNow
                                ? "(100%)"
                                : `(depósito ${depositPercentInt}%)`}
                            </span>
                            <span className="text-accent animate-pulse">
                              {fmtMoney(amountNow)}€
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              )}

              {/* Si hay múltiples cotizaciones: mostrar solo formulario de contacto en la columna izquierda */}
              {carritoState?.length >= 1 && (
                <AnimatedSection animation="slide-left" delay={200}>
                  <div className="lg:block lg:h-full">
                    <Card className="transform hover:scale-105 transition-all duration-300 lg:sticky lg:top-40 lg:z-30">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                          <Users className="w-5 h-5 text-accent" />
                          Información de Contacto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">
                            Nombre Completo
                          </label>
                          <Input
                            placeholder="Tu nombre completo"
                            data-field="contactName"
                            className={
                              fieldErrors.contactName
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                            value={bookingData.contactName || ""}
                            onChange={(e) =>
                              updateBookingField("contactName", e.target.value)
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">
                              Teléfono
                            </label>
                            <PhoneInputIntl
                              value={bookingData.contactPhone || ""}
                              onChange={(value) =>
                                updateBookingField("contactPhone", value)
                              }
                              inputProps={{
                                name: "contactPhone",
                                className: fieldErrors.contactPhone
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : "",
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Email</label>
                            <EmailAutocomplete
                              value={bookingData.contactEmail || ""}
                              onChange={(value) =>
                                updateBookingField("contactEmail", value)
                              }
                              className={
                                fieldErrors.contactEmail
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : ""
                              }
                              name="contactEmail"
                              data-field="contactEmail"
                              onBlur={(e) =>
                                validateAndSetEmail(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">
                            ¿Dónde nos conociste?
                          </label>
                          <Select
                            value={bookingData.referralSource || ""}
                            onValueChange={(v) =>
                              updateBookingField("referralSource", v)
                            }
                          >
                            <SelectTrigger className="cursor-pointer">
                              <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="google">Google</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="instagram">
                                Instagram
                              </SelectItem>
                              <SelectItem value="referido">
                                Recomendación
                              </SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">
                            Solicitudes Especiales (opcional)
                          </label>
                          <Input
                            placeholder="Asiento bebé, parada extra, etc."
                            value={bookingData.specialRequests || ""}
                            onChange={(e) =>
                              updateBookingField(
                                "specialRequests",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Esta información se usará para todas las cotizaciones.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </AnimatedSection>
              )}

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
                            onChange={() =>
                              updateBookingField("paymentMethod", "card")
                            }
                            className="text-accent"
                          />
                          <CreditCard className="w-5 h-5 text-accent" />
                          <div className="flex-1">
                            <span className="font-medium">
                              Pago con tarjeta
                            </span>
                            <div className="mt-1 flex items-center gap-3">
                              <img
                                src="/logos/visa.svg"
                                alt="Visa"
                                className="h-5 w-auto"
                              />
                              <img
                                src="/logos/mastercard.svg"
                                alt="Mastercard"
                                className="h-5 w-auto"
                              />
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-auto">
                            Seguro
                          </Badge>
                        </label>

                        {/* PayPal */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="paypal"
                            checked={paymentMethod === "paypal"}
                            onChange={() =>
                              updateBookingField("paymentMethod", "paypal")
                            }
                            className="text-accent"
                          />
                          {/* Logo estilo PayPal */}
                          <div className="flex items-center">
                            <span className="text-[#003087] font-extrabold text-sm">
                              Pay
                            </span>
                            <span className="text-[#009CDE] font-extrabold text-sm">
                              Pal
                            </span>
                          </div>
                          <div className="flex-1" />
                          <Badge variant="secondary" className="ml-auto">
                            Recomendado
                          </Badge>
                        </label>

                        {/* Efectivo */}
                        <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/30">
                          <input
                            type="radio"
                            name="payment"
                            value="cash"
                            checked={paymentMethod === "cash"}
                            onChange={() =>
                              updateBookingField("paymentMethod", "cash")
                            }
                            className="text-accent"
                          />
                          <span className="font-medium">Efectivo</span>
                          <Badge className="ml-2" variant="outline">
                            Depósito requerido
                          </Badge>
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
                            <span>{fmtMoney(deposit)}€</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Este pago asegura tu reserva. Después de pagarlo,
                            terminarás de rellenar los datos faltantes.
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
                            <span>{fmtMoney(remaining)}€</span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>
                              ¿Por qué pedimos un depósito? Asegura la
                              disponibilidad del vehículo y del conductor en la
                              fecha y hora seleccionadas y cubre el bloqueo de
                              agenda y la preparación del servicio.
                            </p>
                            <p>
                              ¿Cómo se paga? El depósito se abona ahora de forma
                              segura. El resto ({remaining}€) se paga el día del
                              servicio en efectivo, tarjeta o PayPal según
                              prefieras.
                            </p>
                            {isTourBooking ? (
                              <p>Importe del depósito: {deposit}€.</p>
                            ) : null}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>
                              Total a pagar ahora{" "}
                              {payFullNow
                                ? "(100%)"
                                : `(depósito ${depositPercentInt}%)`}
                            </span>
                            <span>{fmtMoney(amountNow)}€</span>
                          </div>
                          {!payFullNow && (
                            <div className="flex justify-between">
                              <span>Saldo el día del servicio</span>
                              <span>{fmtMoney(remaining)}€</span>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Puedes pagar con tarjeta o PayPal de forma segura.{" "}
                            {payFullNow
                              ? "Se cobrará el total ahora."
                              : `Si prefieres, marca "¿Deseas pagar todo ahora?" para abonar el 100%. En caso contrario, se cobrará el depósito del ${depositPercentInt}% y el resto se paga el día del servicio.`}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            * Recargo nocturno después de las 21:00: +5€.
                            Equipaje voluminoso (más de 3 maletas de 23Kg):
                            +10€.
                            {typeof clientHour === "number" && (
                              <span className="ml-1 text-xs">
                                Hora local detectada: {clientHour}:00{" "}
                                {clientHour >= 21 || clientHour < 6
                                  ? "(recargo aplicado)"
                                  : ""}
                              </span>
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
                      {cartActive && (
                        <div
                          id="carrito-cotizaciones"
                          className="space-y-3 p-3 bg-muted/20 rounded"
                        >
                          <h4 className="font-medium">
                            Carrito de Cotizaciones
                          </h4>
                          <div className="space-y-2 max-h-40 overflow-auto">
                            {cartDisplayItems.map((it) => (
                              <div
                                key={it.id}
                                className="relative flex items-center justify-between p-2 border rounded bg-background/80"
                              >
                                {/* botón eliminar: oculto si es la actual */}
                                {!it._isCurrent && (
                                  <button
                                    aria-label={`Eliminar cotización ${it.id}`}
                                    onClick={() => removeCartItem(it.id)}
                                    className="absolute right-0 top-0 w-7 h-7 rounded-full border border-transparent flex items-center justify-center transition-colors duration-150 text-muted-foreground group cursor-pointer"
                                    title="Eliminar"
                                  >
                                    <X
                                      className="w-4 h-4 text-muted-foreground group-hover:text-destructive"
                                      aria-hidden="true"
                                    />
                                    {/* ...icono X... */}
                                  </button>
                                )}

                                <div className="text-sm">
                                  <div className="font-medium">
                                    {it.tipo === "tour" ? "Tour" : "Traslado"}{" "}
                                    {it._isCurrent && (
                                      <span className="text-xs text-accent">
                                        (actual)
                                      </span>
                                    )}
                                  </div>

                                  {it.tipo === "tour" ? (
  <div className="text-xs text-muted-foreground">
    {truncate(
      it.serviceSubLabel ||
        toursList?.find(
          (t) => t.slug === it.selectedTourSlug || t.title === it.selectedTourSlug
        )?.title ||
        toTitle(it.selectedTourSlug) ||
        "Tour",
      30
    )}
  </div>
) : (
  <div className="text-xs text-muted-foreground">
    {/* Preferimos siempre lo que viene del transferDoc */}
    {(it.transferDoc?.from ||
      
      it.origen ||
      it.pickupAddress ||
      "")}

    {(
      (it.transferDoc?.from ||
        it.origen ||
        it.pickupAddress) &&
      (it.transferDoc?.to ||
        it.destino ||
        it.dropoffAddress)
    )
      ? " → "
      : ""}

    {(it.transferDoc?.to ||
      
      it.destino ||
      it.dropoffAddress ||
      "")}
  </div>
)}

                                  <div className="text-xs text-muted-foreground">
                                    {it.date} {it.time} • {it.passengers} pax
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="text-sm font-bold">
                                    {fmtMoney(it.totalPrice)}€
                                  </div>
                                  
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditModal(it)}
                                    >
                                      Editar
                                    </Button>
                                  
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total: usa el combinado, no solo el del carrito */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm">Total combinado</div>
                            <div className="font-bold">
                              {fmtMoney(combinedTotal)}€
                            </div>
                          </div>

                          <div className="pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={openNewQuoteModal}
                            >
                              Añadir cotización
                            </Button>
                          </div>
                        </div>
                      )}
                      {/* Texto informativo para cotizar ida y vuelta: ocultar cuando hay más de 1 cotización */}
                      {carritoState?.length < 1 && (
                        <div className="text-center p-4 mt-4 bg-muted border border-dashed rounded-lg">
                          <p className="text-sm text-primary/90">
                            Si deseas añadir <strong>Otra Cotización</strong> ,
                            pulsa
                            <Button
                              size="sm"
                              variant="default"
                              className="mx-2 align-middle"
                              onClick={openReturnQuoteModal}
                            >
                              aquí
                            </Button>
                            y podrás cotizar otro traslado o tour.
                          </p>
                        </div>
                      )}
                      {/* Mostrar número de cotizaciones realizadas (items en carrito) */}
                      <div className="text-center mb-3">
                        <span className="text-sm text-muted-foreground">
                          Cotizaciones extras realizadas:{" "}
                          <strong>{carritoState?.length || 0}</strong>
                        </span>
                      </div>

                      {/* Nota: indicar porcentaje de depósito e importe a pagar ahora (ej. 10%) */}
                      {!payFullNow && (
                        <div className="text-center mb-3 p-3 bg-muted/10 rounded">
                          <p className="text-sm text-muted-foreground">
                            <strong>Nota:</strong> Ahora se cobrará el depósito
                            correspondiente a cada servicio (
                            <strong>10%</strong> para traslados y{" "}
                            <strong>20%</strong> para tours), por un total de{" "}
                            <strong>{fmtMoney(amountNow)}€</strong> sobre un
                            total combinado de{" "}
                            <strong>{fmtMoney(combinedTotal)}€</strong>.
                          </p>
                        </div>
                      )}

                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transform hover:scale-105 transition-all duration-300"
                        size="lg"
                        onClick={() => {
                          if (!bookingData) return;
                          // Usar la validación central
                          const ok = isDepositReady();
                          if (!ok) {
                            // Reconstruir errores para mostrar al usuario los campos faltantes
                            const errors: Record<string, string> = {};

                            // Normalizar nombres de campos
                            const passengers =
                              bookingData.passengers ?? bookingData.pasajeros;
                            const date = bookingData.date ?? bookingData.fecha;
                            const time = bookingData.time ?? bookingData.hora;

                            if (!passengers || Number(passengers) < 1)
                              errors.passengers = "Requerido";
                            if (!date) errors.date = "Requerido";
                            if (!time) errors.time = "Requerido";

                            const requiresContact = !bookingData.quickDeposit;
                            if (requiresContact) {
                              if (
                                !bookingData.contactName ||
                                !String(bookingData.contactName).trim()
                              )
                                errors.contactName = "Requerido";
                              if (
                                !bookingData.contactPhone ||
                                !String(bookingData.contactPhone).trim()
                              )
                                errors.contactPhone = "Requerido";
                              if (
                                !bookingData.contactEmail ||
                                !String(bookingData.contactEmail).trim()
                              )
                                errors.contactEmail = "Requerido";
                            }

                            const needsAddresses =
                              !bookingData.isEvent &&
                              !bookingData.isTourQuick &&
                              !bookingData.tourId;
                            if (needsAddresses) {
                              if (
                                !paymentPickupAddress ||
                                !String(paymentPickupAddress).trim()
                              )
                                errors.pickupAddress = "Requerido";
                              if (
                                !paymentDropoffAddress ||
                                !String(paymentDropoffAddress).trim()
                              )
                                errors.dropoffAddress = "Requerido";
                            }

                            // Formatos básicos
                            if (
                              !errors.contactEmail &&
                              bookingData.contactEmail
                            ) {
                              const emailRegex =
                                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                              if (
                                !emailRegex.test(
                                  String(bookingData.contactEmail)
                                )
                              )
                                errors.contactEmail = "Formato inválido";
                            }
                            if (
                              !errors.contactPhone &&
                              bookingData.contactPhone
                            ) {
                              if (
                                String(bookingData.contactPhone).replace(
                                  /\D/g,
                                  ""
                                ).length < 6
                              )
                                errors.contactPhone = "Teléfono inválido";
                            }

                            if (
                              bookingData?.tourDoc?.requirements
                                ?.requireFlightNumber ||
                              bookingData?.tourData?.requirements
                                ?.requireFlightNumber
                            ) {
                              if (!bookingData.flightNumber)
                                errors.flightNumber = "Requerido";
                              if (!bookingData.flightArrivalTime)
                                errors.flightArrivalTime = "Requerido";
                              if (!bookingData.flightDepartureTime)
                                errors.flightDepartureTime = "Requerido";
                            }

                            setFieldErrors(errors);
                            requestAnimationFrame(() => {
                              const first = Object.keys(errors)[0];
                              // Mapear claves normalizadas a los data-field reales usados en los inputs
                              const fieldMap: Record<string, string> = {
                                passengers: "passengers",
                                date: "date",
                                time: "time",
                                contactName: "contactName",
                                contactPhone: "contactPhone",
                                contactEmail: "contactEmail",
                                pickupAddress: "pickupAddress",
                                dropoffAddress: "dropoffAddress",
                                flightNumber: "flightNumber", // 👈
                                flightArrivalTime: "flightArrivalTime", // 👈
                                flightDepartureTime: "flightDepartureTime",
                              };
                              const selector = `[data-field="${fieldMap[first] || first}"]`;
                              const el = document.querySelector(
                                selector
                              ) as HTMLElement | null;
                              if (el) el.focus();
                            });
                            return;
                          }

                          // Crear pago en backend (Mollie) y redirigir a checkout
                          const doPay = async () => {
                            setIsPaying(true);
                            try {
                              // Evita que /gracias use un paymentId viejo
                              try {
                                localStorage.removeItem("lastPaymentId");
                              } catch {}

                              // ==== 1) Datos base ====
                              const cartActive =
                                Array.isArray(carritoState) &&
                                carritoState.length > 0;
                              const body = buildSubmission(); // <- usa tu helper
                              const amount = Number(amountNow || 0);

                              // ¿El servicio actual es un tour?
                              const isTourCurrent = Boolean(
                                bookingData?.isEvent ||
                                  bookingData?.quickType === "tour" ||
                                  bookingData?.isTourQuick === true ||
                                  bookingData?.tipoReserva === "tour" ||
                                  bookingData?.tourId ||
                                  bookingData?.tourData ||
                                  bookingData?.selectedTourSlug
                              );

                              // Nombre legible del tour (si aplica)
                              const toTitleCase = (v?: string) =>
                                v
                                  ? String(v)
                                      .replace(/[-_]/g, " ")
                                      .replace(/\s+/g, " ")
                                      .trim()
                                      .replace(/\b\w/g, (m) => m.toUpperCase())
                                  : "";

                              const selectedTourNameFromList = (() => {
                                try {
                                  if (
                                    bookingData?.selectedTourSlug &&
                                    Array.isArray(toursList)
                                  ) {
                                    const t = toursList.find(
                                      (x) =>
                                        x.slug ===
                                          bookingData.selectedTourSlug ||
                                        x.title === bookingData.selectedTourSlug
                                    );
                                    return t?.title;
                                  }
                                } catch {}
                                return undefined;
                              })();

                              const tourName =
                                bookingData?.tourData?.title ||
                                selectedTourNameFromList ||
                                (bookingData?.tourId
                                  ? toTitleCase(bookingData.tourId)
                                  : "");

                              // Origen/Destino legibles (para traslados)
                              const originPretty =
                                
                                bookingData?.pickupAddress ||
                                bookingData?.origen ||
                                "";
                              const destPretty =
                                
                                bookingData?.dropoffAddress ||
                                bookingData?.destino ||
                                "";

                              // Descripción base (single)
                              const descriptionSingle = isTourCurrent
                                ? `Reserva Tour ${tourName || `${originPretty}${originPretty && destPretty ? " → " : ""}${destPretty}`}`
                                : `Reserva Traslado ${originPretty}${originPretty && destPretty ? " → " : ""}${destPretty}`;

                              // Descripción final (combinado o single)
                              const description = cartActive
                                ? `Pago combinado (${(carritoState?.length || 0) + 1} servicios)`
                                : descriptionSingle;

                              // ==== 2) Normalizar objetos para el backend ====

                              // Ítems del carrito para enviar (solo si hay)
                              const carritoForSubmit = cartActive
                                ? (body.items || []).map((it: any) => ({
                                    ...it,
                                    contactName: body.contact?.name,
                                    contactPhone: body.contact?.phone,
                                    contactEmail: body.contact?.email,
                                    referralSource:
                                      bookingData?.referralSource ||
                                      it.referralSource ||
                                      "",
                                    payFullNow: body.payFullNow,
                                  }))
                                : [];

                              // Reserva actual (fuera del carrito, como en tu backend actual)
                              const bookingForSubmit = {
                                ...bookingData,
                                referralSource:
                                  bookingData?.referralSource || "",
                                paymentPickupAddress,
                                paymentDropoffAddress,
                                payFullNow: body.payFullNow,
                              };

                              // ==== 3) Crear pago en backend ====
                              const res = await fetch("/api/mollie/create", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  amount, // importe a cobrar ahora
                                  description, // texto que verá el usuario en el checkout
                                  method: body.paymentMethod, // card | paypal | cash (aunque cash no redirige a Mollie)
                                  referralSource:
                                    bookingData?.referralSource || "",
                                  payFullNow: body.payFullNow,

                                  // Reserva principal
                                  booking: bookingForSubmit,

                                  // Ítems extra (si hay carrito)
                                  carrito: carritoForSubmit,

                                  // Contacto (normalizado desde buildSubmission)
                                  contact: {
                                    name: body.contact?.name || "",
                                    phone: body.contact?.phone || "",
                                    email: body.contact?.email || "",
                                    referralSource:
                                      bookingData?.referralSource || "",
                                  },

                                  // Metadatos útiles
                                  metadata: {
                                    source: "web",
                                    combinedPayment: cartActive,
                                    itemsCount: cartActive
                                      ? (carritoState?.length || 0) + 1
                                      : 1,
                                    combinedTotal: Number(
                                      body.combinedTotal || 0
                                    ),
                                    combinedDepositSum: Number(
                                      body.combinedDepositSum || 0
                                    ),
                                  },
                                }),
                              });

                              if (!res.ok)
                                throw new Error(
                                  `Error creando pago: ${res.status}`
                                );
                              const json = await res.json();

                              // Guardar paymentId para /gracias
                              try {
                                if (json?.id)
                                  localStorage.setItem(
                                    "lastPaymentId",
                                    String(json.id)
                                  );
                              } catch {}

                              const url = json?.checkoutUrl;
                              if (typeof url === "string") {
                                // Limpia carrito solo si era combinado
                                if (cartActive) {
                                  try {
                                    localStorage.removeItem(
                                      "carritoCotizaciones"
                                    );
                                    setCarritoState([]);
                                  } catch {}
                                }
                                window.location.href = url;
                                return;
                              }

                              throw new Error("checkoutUrl no recibido");
                            } catch (e) {
                              console.error("No se pudo iniciar el pago:", e);
                              alert(
                                "No se pudo iniciar el pago. Intenta nuevamente más tarde."
                              );
                            } finally {
                              try {
                                setIsPaying(false);
                              } catch {}
                            }
                          };

                          // Marcar que se está procesando el pago para deshabilitar el botón y mostrar feedback
                          setIsPaying(true);
                          doPay();
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
                          <>
                            {payFullNow
                              ? `Pagar todo (${fmtMoney(combinedTotal)}€)`
                              : `Pagar depósito (${fmtMoney(amountNow)}€)`}
                          </>
                        )}
                      </Button>

                      {(() => {
                        const reasons = getDepositDisabledReasons();
                        if (!isDepositReady() && reasons.length > 0) {
                          return (
                            <div className="mt-3 p-3 bg-destructive/10 rounded text-destructive text-sm">
                              <span className="font-semibold block mb-1">
                                No puedes pagar aún:
                              </span>
                              <ul className="list-disc pl-5">
                                {reasons.map((msg, idx) => (
                                  <li key={idx}>{msg}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                    <h3 className="text-lg font-semibold text-primary">
                      ¿Qué sucede después del pago?
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">
                          1. Confirmación Inmediata
                        </h4>
                        <p className="text-muted-foreground">
                          Recibirás un email con los detalles de tu reserva
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <Clock className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">2. Recordatorio</h4>
                        <p className="text-muted-foreground">
                          Te contactaremos 24h antes para confirmar detalles
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-medium">3. Servicio Comodo</h4>
                        <p className="text-muted-foreground">
                          Disfruta de tu traslado puntual y cómodo
                        </p>
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
            <h3 className="text-lg font-semibold">
              {modalEditingId ? "Editar cotización" : "Nueva cotización"}
            </h3>

            {/* Paso 1: Tipo de servicio (usar mismo selector visual que Hero) */}
            {modalStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Map className="w-4 h-4 text-accent" />
                    {bookingForm?.typePicker?.label || "Tipo de reserva"}
                  </label>
                  <div className="flex flex-wrap gap-4 justify-center w-full">
                    <Button
                      type="button"
                      size="lg"
                      variant={
                        modalForm.tipo === "traslado" ? "default" : "outline"
                      }
                      className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${modalForm.tipo === "traslado" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                      aria-pressed={modalForm.tipo === "traslado"}
                      onClick={() => {
                        // Si el flujo de ida y vuelta fue iniciado, usar los valores guardados intercambiados
                        if (returnInitiatedRef.current) {
                          console.log(
                            "[Modal] Traslado clicked after return initiated - applying saved swapped origin/destination"
                          );
                          // const newOrigen =
                          //   getLocationKeyFromValue(
                          //     savedDestinationOnLoad ||
                          //       bookingData?.dropoffAddress ||
                          //       ""
                          //   ) ||
                          //   savedDestinationOnLoad ||
                          //   "";
                          // const newDestino =
                          //   getLocationKeyFromValue(
                          //     savedOriginOnLoad ||
                          //       bookingData?.pickupAddress ||
                          //       ""
                          //   ) ||
                          //   savedOriginOnLoad ||
                          //   "";
                          setModalForm((prev: any) => ({
                            ...prev,
                            tipo: "traslado",
                            // origen: newOrigen,
                            // destino: newDestino,
                            origen: '',
                            destino: '',
                            pickupAddress:
                              bookingData?.dropoffAddress ||
                              prev.pickupAddress ||
                              "",
                            dropoffAddress:
                              bookingData?.pickupAddress ||
                              prev.dropoffAddress ||
                              "",
                          }));
                          // reset flag
                          returnInitiatedRef.current = false;
                        } else {
                          setModalForm((prev: any) => ({
                            ...prev,
                            tipo: "traslado",
                            origen: prev.origen || "",
                            destino: prev.destino || "",
                          }));
                        }
                        setModalStep(2);
                      }}
                    >
                      <Car className="w-5 h-5" />
                      {bookingForm?.typePicker?.trasladoLabel || "Traslado"}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant={
                        modalForm.tipo === "tour" ? "default" : "outline"
                      }
                      className={`cursor-pointer h-12 px-8 text-base md:text-lg min-w-[150px] shadow-md hover:shadow-lg hover:scale-[1.02] transition-all ${modalForm.tipo === "tour" ? "ring-2 ring-accent bg-gradient-to-r from-primary to-primary/80" : "border-2"}`}
                      aria-pressed={modalForm.tipo === "tour"}
                      onClick={() => {
                        setModalForm((prev: any) => ({
                          ...prev,
                          tipo: "tour",
                          origen: "",
                          destino: "",
                          tipoTour: "",
                          categoriaTour: "",
                          subtipoTour: "" as any,
                        }));
                        setModalStep(2);
                      }}
                    >
                      <Map className="w-5 h-5" />
                      {bookingForm?.typePicker?.tourLabel || "Tour"}
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
                          {`Origen`}
                        </label>
                        <Select
                          value={modalForm.origen}
                          onValueChange={(value) =>
                            setModalForm({
                              ...modalForm,
                              origen: value,
                              destino: "",
                            })
                          }
                        >
                          <SelectTrigger
                            data-modal-field="origen"
                            className={
                              "cursor-pointer " +
                              (modalFieldErrors.origen
                                ? "border-destructive focus-visible:ring-destructive"
                                : "")
                            }
                          >
                            <SelectValue placeholder={modalForm.origen ? "" : (modalForm.pickupAddress || "Seleccionar origen")} />
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
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          
                          {`Destino`}
                        </label>
                        <Select
                          value={modalForm.destino}
                          onValueChange={(value) =>
                            setModalForm({ ...modalForm, destino: value })
                          }
                        >
                          <SelectTrigger
                            data-modal-field="destino"
                            disabled={!modalForm.origen}
                            className={
                              "cursor-pointer disabled:cursor-not-allowed " +
                              (modalFieldErrors.destino
                                ? "border-destructive focus-visible:ring-destructive"
                                : "")
                            }
                          >
                            <SelectValue
                              placeholder={
                                modalForm.origen
                                  ? (modalForm.destino ? "" : (modalForm.dropoffAddress || "Seleccionar destino"))
                                  : (modalForm.dropoffAddress || "Selecciona el origen primero")
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
                                        ? "No hay destinos disponibles"
                                        : "Selecciona el origen primero"}
                                    </SelectItem>
                                  )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-accent" />
                          {bookingForm?.dateField?.label || "Fecha"}
                        </label>
                        <Input
                          data-modal-field="date"
                          type="date"
                          min={minDateStr}
                          value={modalForm.date}
                          onChange={(e) => {
                            setModalForm({
                              ...modalForm,
                              date: e.target.value,
                            });
                            if (modalFieldErrors.date)
                              setModalFieldErrors((f) => {
                                const c = { ...f };
                                delete c.date;
                                return c;
                              });
                          }}
                          className={
                            modalFieldErrors.date
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-accent" />
                          {bookingForm?.timeField?.label || "Hora"}
                        </label>
                        <Input
                          data-modal-field="time"
                          type="time"
                          value={modalForm.time}
                          onChange={(e) => {
                            setModalForm({
                              ...modalForm,
                              time: e.target.value,
                            });
                            if (modalFieldErrors.time)
                              setModalFieldErrors((f) => {
                                const c = { ...f };
                                delete c.time;
                                return c;
                              });
                          }}
                          className={
                            modalFieldErrors.time
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Users className="w-4 h-4 text-accent" />
                          Pasajeros
                        </label>
                        <Select
                          value={String(modalForm.passengers)}
                          onValueChange={(value) =>
                            setModalForm({
                              ...modalForm,
                              passengers: String(value),
                            })
                          }
                        >
                          <SelectTrigger
                            data-modal-field="passengers"
                            className={
                              "cursor-pointer " +
                              (modalFieldErrors.passengers
                                ? "border-destructive focus-visible:ring-destructive"
                                : "")
                            }
                          >
                            <SelectValue
                              placeholder={`Número de pasajeros (máx. 56)`}
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {Array.from({ length: 56 }, (_, i) => i + 1).map(
                              (n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n} {n === 1 ? "Pasajero" : "Pasajeros"}
                                </SelectItem>
                              )
                            )}
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
                          onValueChange={(value) => {
                            const maxNinos = parsePassengers(
                              modalForm.passengers as any
                            );
                            let n = Number(value);
                            if (n > maxNinos) n = maxNinos;
                            setModalForm({ ...modalForm, ninos: n });
                          }}
                        >
                          <SelectTrigger
                            data-modal-field="ninos"
                            className="cursor-pointer"
                          >
                            <SelectValue>
                              {modalForm.ninos === 0 || modalForm.ninos
                                ? `${modalForm.ninos} ${modalForm.ninos === 1 ? "niño" : "niños"}`
                                : "Cantidad de niños"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-72">
                            {Array.from(
                              {
                                length:
                                  parsePassengers(modalForm.passengers as any) +
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
                      <div className="flex flex-col md:flex-row gap-4 col-span-2">
                        <div className="flex-1 space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Car className="w-4 h-4 text-accent" />
                            Tipo de vehículo
                          </label>
                          <Select
                            value={modalForm.vehicle}
                            onValueChange={(value) => {
                              const cap = getVehicleCap(value);
                              const pax = parsePassengers(
                                modalForm.passengers as any
                              );
                              const clamped = Math.min(Math.max(pax, 1), cap);
                              setModalForm({
                                ...modalForm,
                                vehicle: value,
                                passengers: String(clamped),
                              });
                            }}
                          >
                            <SelectTrigger
                              data-modal-field="vehicle"
                              className="cursor-pointer"
                            >
                              <SelectValue placeholder="Selecciona: Coche, Minivan o Van" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="coche">
                                {bookingForm?.vehicleField?.labelCoche ||
                                  "Coche (4 personas)"}
                              </SelectItem>
                              <SelectItem value="minivan">
                                {bookingForm?.vehicleField?.labelMinivan ||
                                  "Minivan (6 pasajeros)"}
                              </SelectItem>
                              <SelectItem value="van">
                                {bookingForm?.vehicleField?.labelVan ||
                                  "Van (8 pasajeros)"}
                              </SelectItem>
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
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Plane className="w-4 h-4 text-accent" />
                            Tipo de tour
                          </label>
                          <Select
                            value={
                              modalForm.categoriaTour === "escala"
                                ? "escala"
                                : modalForm.tipoTour || "" // 👈 si viene vacío, se queda vacío
                            }
                            onValueChange={(value) => {
                              if (value === "escala") {
                                setModalForm({
                                  ...modalForm,
                                  categoriaTour: "escala",
                                  subtipoTour: "",
                                  tipoTour: "escala",
                                  selectedTourSlug: "",
                                });
                              } else {
                                setModalForm({
                                  ...modalForm,
                                  categoriaTour: "ciudad",
                                  subtipoTour: value as any, // 'diurno' | 'nocturno'
                                  tipoTour: value as any,
                                  selectedTourSlug: "",
                                });
                              }
                            }}
                          >
                            <SelectTrigger
                              data-modal-field="categoriaTour"
                              className={
                                "cursor-pointer " +
                                (modalFieldErrors.categoriaTour
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : "")
                              }
                            >
                              <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                            <SelectContent portal={false}>
                              <SelectItem value="diurno">
                                Tour diurno
                              </SelectItem>
                              <SelectItem value="nocturno">
                                Tour nocturno
                              </SelectItem>
                              <SelectItem value="escala">
                                Tour escala
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {Array.isArray(toursList) && toursList.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Map className="w-4 h-4 text-accent" />
                              Tour
                            </label>
                            <Select
                              value={modalForm.selectedTourSlug}
                              onValueChange={(value) =>
                                setModalForm({
                                  ...modalForm,
                                  selectedTourSlug: value,
                                })
                              }
                            >
                              <SelectTrigger
                                data-modal-field="selectedTourSlug"
                                className="cursor-pointer"
                              >
                                {modalForm.selectedTourSlug ? (
                                  // mostramos SOLO el seleccionado, limitado a 30 chars
                                  <span>
                                    {truncate(
                                      toursList.find(
                                        (t) =>
                                          (t.slug || t.title) ===
                                          modalForm.selectedTourSlug
                                      )?.title || modalForm.selectedTourSlug,
                                      30
                                    )}
                                  </span>
                                ) : (
                                  // placeholder cuando no hay selección
                                  <SelectValue placeholder="Selecciona un tour" />
                                )}
                              </SelectTrigger>

                              {/* Opciones completas, SIN truncar */}
                              <SelectContent
                                portal={false}
                                className="max-h-72"
                              >
                                {toursList.map((t, idx) => (
                                  <SelectItem
                                    key={idx}
                                    value={t.slug || t.title}
                                  >
                                    {t.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" />
                            {bookingForm?.dateField?.label || "Fecha"}
                          </label>
                          <Input
                            data-modal-field="date"
                            type="date"
                            min={minDateStr}
                            value={modalForm.date}
                            onChange={(e) => {
                              setModalForm({
                                ...modalForm,
                                date: e.target.value,
                              });
                              if (modalFieldErrors.date)
                                setModalFieldErrors((f) => {
                                  const c = { ...f };
                                  delete c.date;
                                  return c;
                                });
                            }}
                            className={
                              modalFieldErrors.date
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4 text-accent" />
                            {bookingForm?.timeField?.label || "Hora"}
                          </label>
                          <Input
                            data-modal-field="time"
                            type="time"
                            value={modalForm.time}
                            onChange={(e) => {
                              setModalForm({
                                ...modalForm,
                                time: e.target.value,
                              });
                              if (modalFieldErrors.time)
                                setModalFieldErrors((f) => {
                                  const c = { ...f };
                                  delete c.time;
                                  return c;
                                });
                            }}
                            className={
                              modalFieldErrors.time
                                ? "border-destructive focus-visible:ring-destructive"
                                : ""
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            {bookingForm?.passengersField?.label || "Pasajeros"}
                          </label>
                          <Select
                            value={String(modalForm.passengers)}
                            onValueChange={(value) =>
                              setModalForm({ ...modalForm, passengers: value })
                            }
                          >
                            <SelectTrigger
                              data-modal-field="passengers"
                              className={
                                "cursor-pointer " +
                                (modalFieldErrors.passengers
                                  ? "border-destructive focus-visible:ring-destructive"
                                  : "")
                              }
                            >
                              <SelectValue placeholder="Número de pasajeros (máx. 56)" />
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {Array.from({ length: 56 }, (_, i) => i + 1).map(
                                (n) => (
                                  <SelectItem key={n} value={String(n)}>
                                    {n}{" "}
                                    {n === 1
                                      ? bookingForm?.passengersField
                                          ?.singular || "Pasajero"
                                      : bookingForm?.passengersField?.plural ||
                                        "Pasajeros"}
                                  </SelectItem>
                                )
                              )}
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
                            onValueChange={(value) => {
                              const maxNinos = parsePassengers(
                                modalForm.passengers as any
                              );
                              let n = Number(value);
                              if (n > maxNinos) n = maxNinos;
                              setModalForm({ ...modalForm, ninos: n });
                            }}
                          >
                            <SelectTrigger
                              data-modal-field="ninos"
                              className="cursor-pointer"
                            >
                              <SelectValue>
                                {modalForm.ninos === 0 || modalForm.ninos
                                  ? `${modalForm.ninos} ${modalForm.ninos === 1 ? "niño" : "niños"}`
                                  : "Cantidad de niños"}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-72">
                              {Array.from(
                                {
                                  length:
                                    parsePassengers(
                                      modalForm.passengers as any
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
                            {bookingForm?.vehicleField?.label ||
                              "Tipo de vehículo"}
                          </label>
                          <Select
                            value={modalForm.vehicle}
                            onValueChange={(value) => {
                              const cap = getVehicleCap(value);
                              const pax = parsePassengers(
                                modalForm.passengers as any
                              );
                              const clamped = Math.min(Math.max(pax, 1), cap);
                              setModalForm({
                                ...modalForm,
                                vehicle: value,
                                passengers: String(clamped),
                              });
                            }}
                          >
                            <SelectTrigger
                              data-modal-field="vehicle"
                              className="cursor-pointer"
                            >
                              <SelectValue placeholder="Selecciona: Coche, Minivan o Van" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="coche">
                                {bookingForm?.vehicleField?.labelCoche ||
                                  "Coche (4 personas)"}
                              </SelectItem>
                              <SelectItem value="minivan">
                                {bookingForm?.vehicleField?.labelMinivan ||
                                  "Minivan (6 pasajeros)"}
                              </SelectItem>
                              <SelectItem value="van">
                                {bookingForm?.vehicleField?.labelVan ||
                                  "Van (8 pasajeros)"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Notas de equipaje para Minivan con 5 o 6 pasajeros */}
                      {modalForm.vehicle === "minivan" &&
                        (() => {
                          const pax = parsePassengers(
                            modalForm.passengers as any
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

                  {/* Nota: los campos de direcciones/equipaje/vuelo se completan en el Paso 3 tras la información de contacto */}
                </div>
              </>
            )}

            {/* Paso 4: Direcciones y equipaje (final) */}
            {modalStep === 3 && (
              <div className="space-y-3">
                <div className="space-y-3 p-3 bg-muted/10 rounded">
                  <h4 className="font-medium">Direcciones y equipaje</h4>
                  <div>
                    <label className="text-xs">Origen - Ubicación exacta</label>
                    <Input
                      data-modal-field="pickupAddress"
                      placeholder="Ubicación exacta"
                      value={modalForm.pickupAddress || ""}
                      onChange={(e) =>
                        setModalForm((s: any) => ({
                          ...s,
                          pickupAddress: e.target.value,
                        }))
                      }
                      className={
                        modalFieldErrors.pickupAddress
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {modalFieldErrors.pickupAddress && (
                      <p className="text-xs text-destructive mt-1">
                        {modalFieldErrors.pickupAddress}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs">
                      Destino - Ubicación exacta
                    </label>
                    <Input
                      data-modal-field="dropoffAddress"
                      placeholder="Ubicación exacta"
                      value={modalForm.dropoffAddress || ""}
                      onChange={(e) =>
                        setModalForm((s: any) => ({
                          ...s,
                          dropoffAddress: e.target.value,
                        }))
                      }
                      className={
                        modalFieldErrors.dropoffAddress
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {modalFieldErrors.dropoffAddress && (
                      <p className="text-xs text-destructive mt-1">
                        {modalFieldErrors.dropoffAddress}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Número de vuelo */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Número de Vuelo{" "}
                        {requireFlightModal ? "(obligatorio)" : "(opcional)"}
                      </label>
                      <Input
                        placeholder="AF1234, BA456, etc."
                        className={
                          modalFieldErrors.flightNumber
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        value={modalForm.flightNumber || ""}
                        onChange={(e) =>
                          setModalForm((s: any) => ({
                            ...s,
                            flightNumber: e.target.value,
                          }))
                        }
                      />
                      {modalFieldErrors.flightNumber && (
                        <p className="text-xs text-destructive mt-1">
                          {modalFieldErrors.flightNumber}
                        </p>
                      )}
                    </div>

                    {/* Hora de llegada */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Hora de llegada{" "}
                        {requireFlightModal ? "(obligatorio)" : "(opcional)"}
                      </label>
                      <Input
                        data-modal-field="flightArrivalTime"
                        type="time"
                        placeholder="HH:MM"
                        className={
                          modalFieldErrors.flightArrivalTime
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        value={modalForm.flightArrivalTime || ""}
                        onChange={(e) =>
                          setModalForm((s: any) => ({
                            ...s,
                            flightArrivalTime: e.target.value,
                          }))
                        }
                      />
                      {modalFieldErrors.flightArrivalTime && (
                        <p className="text-xs text-destructive mt-1">
                          {modalFieldErrors.flightArrivalTime}
                        </p>
                      )}
                    </div>

                    {/* Hora de salida */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium">
                        Hora de salida{" "}
                        {requireFlightModal ? "(obligatorio)" : "(opcional)"}
                      </label>
                      <Input
                        data-modal-field="flightDepartureTime"
                        type="time"
                        placeholder="HH:MM"
                        className={
                          modalFieldErrors.flightDepartureTime
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                        }
                        value={modalForm.flightDepartureTime || ""}
                        onChange={(e) =>
                          setModalForm((s: any) => ({
                            ...s,
                            flightDepartureTime: e.target.value,
                          }))
                        }
                      />
                      {modalFieldErrors.flightDepartureTime && (
                        <p className="text-xs text-destructive mt-1">
                          {modalFieldErrors.flightDepartureTime}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs"># Maletas 23kg</label>
                      <Input
                        data-modal-field="luggage23kg"
                        type="number"
                        min={0}
                        value={modalForm.luggage23kg ?? 0}
                        onChange={(e) =>
                          setModalForm((s: any) => ({
                            ...s,
                            luggage23kg: Number(e.target.value),
                          }))
                        }
                      />
                      {modalFieldErrors.luggage23kg && (
                        <p className="text-xs text-destructive mt-1">
                          {modalFieldErrors.luggage23kg}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs"># Maletas 10kg</label>
                      <Input
                        data-modal-field="luggage10kg"
                        type="number"
                        min={0}
                        value={modalForm.luggage10kg ?? 0}
                        onChange={(e) =>
                          setModalForm((s: any) => ({
                            ...s,
                            luggage10kg: Number(e.target.value),
                          }))
                        }
                      />
                      {modalFieldErrors.luggage10kg && (
                        <p className="text-xs text-destructive mt-1">
                          {modalFieldErrors.luggage10kg}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controles de navegación */}
            <div className="flex items-center justify-between pt-4">
              <div>
                {modalStep > 1 && (
                  <Button variant="outline" size="sm" onClick={handleModalPrev}>
                    Atrás
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {modalStep < 3 && (
                  <Button
                    size="sm"
                    onClick={handleModalNext}
                    disabled={!validateModalStep(modalStep).valid}
                  >
                    Siguiente
                  </Button>
                )}
                {modalStep === 3 && !modalEditingId && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const ok = handleModalSave(false);
                      if (ok) {
                        // modal already closed in saveModalAsNew
                      }
                    }}
                  >
                    Añadir al carrito
                  </Button>
                )}
                {modalStep === 3 && modalEditingId && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const ok = handleModalSave(true);
                      if (ok) {
                        // modal already closed in updateExistingItem
                      }
                    }}
                  >
                    Guardar cambios
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </main>
  );
}

function EventImagesCarousel({
  images,
  shortInfo,
}: {
  images: string[];
  shortInfo?: string;
}) {
  const apiRef = useRef<CarouselApi | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        apiRef.current?.scrollNext();
      }, 4000);
    };
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    if (!isHover) start();
    return () => stop();
  }, [isHover]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Carousel
        className="w-full h-56 sm:h-64 rounded-lg overflow-hidden"
        opts={{ align: "start", loop: true }}
        setApi={(api) => {
          // @ts-ignore: embla type channel
          apiRef.current = api;
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
                    <img
                      src={src}
                      alt={`Imagen ${idx + 1} del evento`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                  </button>
                </DialogTrigger>
                <DialogContent
                  className="max-w-5xl p-0 bg-transparent border-none shadow-none"
                  showCloseButton
                >
                  <div className="relative w-full h-[70vh]">
                    <img
                      src={src}
                      alt={`Imagen ${idx + 1} ampliada`}
                      className="w-full h-full object-contain"
                    />
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
  );
}
