"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { StepContact } from "@/components/checkout/step-contact";
import { StepServiceDetails } from "@/components/checkout/step-service-details";
import { StepPayment } from "@/components/checkout/step-payment";
import { AddServiceModal } from "@/components/checkout/add-service-modal";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/i18n-context";
import { ChevronRight, Check } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";

// This is a client component, so we can't export Metadata directly if it was a server component, 
// but since it's "use client", we should handle the title via useEffect or separate layout.
// For now, I'll add the H1 clearly in the component.

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState<any>(null);
  const [carritoState, setCarritoState] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { locale } = useTranslation();

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedBooking = localStorage.getItem("bookingData");
      const savedCart = localStorage.getItem("carritoState");
      
      if (savedBooking) {
        const parsed = JSON.parse(savedBooking);
        setBookingData(parsed);
      }
      
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCarritoState(parsed);
      }
    } catch (e) {
      console.error("Error loading checkout data", e);
    }
  }, []);

  // Compute items for the summary
  const items = useMemo(() => {
    const list = [...carritoState];
    // If cart is empty, use the main booking data as a single item if it exists
    if (list.length === 0 && bookingData) {
      list.push({
        ...bookingData,
        id: bookingData.id || 1, // stable id to prevent remounting components
        tipo: bookingData.isEvent || bookingData.tourId || bookingData.tourDoc ? "tour" : "traslado",
      });
    }
    return list;
  }, [carritoState, bookingData]);

  // Pricing calculation logic (simplified or extracted from pago/page.tsx)
  const getDepositPercent = (item: any): number => {
    const tipo = (item?.tipo || item?.quickType || item?.tourDoc?.type || "").toLowerCase();
    if (tipo === "tour" || item?.isTourQuick || item?.tourId || item?.tourDoc) return 0.2;
    return 0.1; // transfer
  };

  const totals = useMemo(() => {
    let total = 0;
    let deposit = 0;
    items.forEach(item => {
      const itemTotal = Number(item.totalPrice || 0);
      total += itemTotal;
      deposit += itemTotal * getDepositPercent(item);
    });
    return { total, deposit: Math.round(deposit * 100) / 100 };
  }, [items]);

  const updateContactData = (fields: any) => {
    setBookingData((prev: any) => ({ ...prev, ...fields }));
    // Also update in items if necessary, but usually contact is global
  };

  const updateItemDetail = (id: number, fields: any) => {
    setCarritoState((prev) => prev.map(item => item.id === id ? { ...item, ...fields } : item));
    if (bookingData && items.length === 1) {
       setBookingData((prev: any) => ({ ...prev, ...fields }));
    }
  };

  const updateAllItemsDetail = (fields: any) => {
    setCarritoState((prev) => prev.map(item => ({ ...item, ...fields })));
    if (bookingData) {
      setBookingData((prev: any) => ({ ...prev, ...fields }));
    }
  };

  const handleAddQuote = (newItem: any) => {
    setCarritoState(prev => {
      const next = [...prev, newItem];
      setActiveItemIndex(next.length - 1);
      return next;
    });
    toast({
      title: locale === "es" ? "Servicio Añadido" : locale === "en" ? "Service Added" : "Service Ajouté",
      description: locale === "es" ? "Se ha añadido un nuevo servicio a tu reserva." : locale === "en" ? "A new service has been added to your booking." : "Un nouveau service a été ajouté à votre réservation.",
    });
  };

  const handleRemoveItem = (id: number) => {
    setCarritoState(prev => {
      const next = prev.filter(item => item.id !== id);
      // Adjust active index if needed
      if (activeItemIndex >= next.length) {
        setActiveItemIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
    toast({
      title: locale === "es" ? "Servicio Eliminado" : locale === "en" ? "Service Removed" : "Service Supprimé",
      description: locale === "es" ? "El servicio ha sido eliminado de tu reserva." : locale === "en" ? "The service has been removed from your booking." : "Le service a été supprimé de votre réservation.",
    });
  };

  // Pre-configures a return transfer by inverting origin/destination
  const handleAddReturn = (sourceItem: any) => {
    const returnItem = {
      ...sourceItem,
      id: Date.now(),
      origen: sourceItem.destino,
      destino: sourceItem.origen,
      pickupAddress: sourceItem.dropoffAddress || "",
      dropoffAddress: sourceItem.pickupAddress || "",
      date: "",
      time: "",
      flightNumber: "",
      specialRequests: "",
      serviceLabel: sourceItem.serviceLabel
        ? `${locale === "es" ? "Regreso" : locale === "en" ? "Return" : "Retour"}: ${sourceItem.serviceLabel}`
        : (locale === "es" ? "Traslado de Regreso" : locale === "en" ? "Return Transfer" : "Transfert Retour"),
      serviceSubLabel: locale === "es" ? "Traslado de Regreso" : locale === "en" ? "Return Transfer" : "Transfert Retour",
      isReturn: true,
    };
    handleAddQuote(returnItem);
    setIsAddModalOpen(false);
  };

  const validateStep = (s: number) => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!bookingData?.contactName?.trim()) newErrors.contactName = "El nombre es obligatorio";
      
      if (!bookingData?.contactEmail?.trim()) {
        newErrors.contactEmail = "El email es obligatorio";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(String(bookingData.contactEmail))) {
          newErrors.contactEmail = "Formato de email inválido";
        }
      }

      if (!bookingData?.contactPhone?.trim()) {
        newErrors.contactPhone = "El teléfono es obligatorio";
      } else {
        if (String(bookingData.contactPhone).replace(/\D/g, "").length < 6) {
          newErrors.contactPhone = "Teléfono inválido";
        }
      }
    } else if (s === 2) {
      items.forEach((item, idx) => {
        const isEvent = Boolean(item.isEvent);
        
        // Direcciones
        const needsAddresses = !isEvent; 
        if (needsAddresses) {
          if (!item.pickupAddress?.trim()) newErrors[`item_${idx}_pickup`] = "Dirección requerida";
          if (!item.dropoffAddress?.trim()) newErrors[`item_${idx}_dropoff`] = "Dirección requerida";
        }

        // Vuelo
        const explicitFlightReq = 
          item.requireFlightInfo === true || 
          item.requireFlightNumber === true || 
          item.requireFlightTimes === true || 
          item.transferDoc?.requireFlightInfo === true || 
          item.transferDoc?.requireFlightNumber === true ||
          item.tourDoc?.requirements?.requireFlightNumber === true ||
          item.tourData?.requirements?.requireFlightNumber === true;

        if (explicitFlightReq && !item.flightNumber?.trim()) {
          newErrors[`item_${idx}_flight`] = "Número de vuelo requerido";
        }

        // Básicos
        if (!item.date) newErrors[`item_${idx}_date`] = "Fecha requerida";
        if (!item.time) newErrors[`item_${idx}_time`] = "Hora requerida";
        if (!item.passengers || Number(item.passengers) <= 0) newErrors[`item_${idx}_passengers`] = "Requerido";
        
        if (Number(item.ninos) > 0 && !item.ninosMenores9?.trim()) {
          newErrors[`item_${idx}_ninosMenores9`] = "Las edades son requeridas";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({
        title: "Campos faltantes",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirm = async (method: string, payFull: boolean) => {
    setIsProcessing(true);
    try {
      // Build a rich Mollie description from all services
      const serviceNames = items.map(it => {
        const label = it.serviceSubLabel || it.serviceLabel || it.tourTitle || it.tourDoc?.title;
        const date = it.date ? ` (${it.date})` : "";
        return label ? `${label}${date}` : it.tipo === "tour" ? `Tour${date}` : `Traslado${date}`;
      });
      const mollieDescription = serviceNames.length > 1
        ? `Redeservi Europa: ${serviceNames.join(" | ")}`
        : `Redeservi Europa: ${serviceNames[0] || "Reserva"}`;

      const payload = {
        amount: payFull ? totals.total : totals.deposit,
        description: mollieDescription.slice(0, 255), // Mollie max 255 chars
        carrito: items,
        contact: {
          name: bookingData?.contactName,
          phone: bookingData?.contactPhone,
          email: bookingData?.contactEmail,
          referralSource: bookingData?.referralSource || "",
        },
        referralSource: bookingData?.referralSource || "",
        method: method,
        payFullNow: payFull,
        locale: locale || "es",
      };

      // Save payload to localStorage for the gracias page fallback
      try {
        localStorage.setItem("lastCheckoutPayload", JSON.stringify({
          items,
          contact: payload.contact,
          amountNow: payload.amount,
          payFullNow: payFull,
          paymentMethod: method,
          locale: locale || "es",
        }));
      } catch {}


      const res = await fetch("/api/mollie/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Error al crear el pago");
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "No se pudo procesar la reserva. Reintenta.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, label: "Contacto" },
    { id: 2, label: "Detalles" },
    { id: 3, label: "Pago" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5DC]/30 flex flex-col">
      <Header />
      
      {/* Hidden H1 for SEO */}
      <h1 className="sr-only">Checkout - Confirmación de Reserva | REDESERVI PARIS</h1>

      <main className="flex-grow pt-40 pb-12 lg:pt-48 container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8 h-full items-start">
          {/* Left Column: Steps and Form */}
          <div className="flex-grow lg:w-2/3 space-y-8">
            {/* Step Indicator */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-[#4A0E0E]/10">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step >= s.id ? "bg-[#4A0E0E] text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                    </div>
                    <span className={`hidden sm:inline font-bold ${step >= s.id ? "text-[#4A0E0E]" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex-grow mx-4 h-[2px] bg-muted relative overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-[#4A0E0E] transition-all duration-500" 
                        style={{ width: step > s.id ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <Card className="border-none shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm min-h-[500px]">
              <CardContent className="p-8 md:p-12">
                <>
                  {step === 1 && (
                    <div
                      key="step1"
                      className="animate-in fade-in slide-in-from-left-4 duration-300"
                    >
                      <StepContact 
                        data={bookingData || {}} 
                        updateData={updateContactData} 
                        onNext={handleNext}
                        errors={errors}
                      />
                    </div>
                  )}
                  {step === 2 && (
                    <div
                      key="step2"
                      className="animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                      <StepServiceDetails 
                        items={items} 
                        updateItem={updateItemDetail}
                        updateAllItems={updateAllItemsDetail} 
                        onNext={handleNext} 
                        onBack={handleBack}
                        errors={errors}
                        activeItemIndex={activeItemIndex}
                        setActiveItemIndex={setActiveItemIndex}
                        onRemoveItem={handleRemoveItem}
                        onAddService={() => setIsAddModalOpen(true)}
                        onAddReturn={handleAddReturn}
                      />
                    </div>
                  )}
                  {step === 3 && (
                    <div
                      key="step3"
                      className="animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                      <StepPayment 
                        onBack={handleBack} 
                        onConfirm={handleConfirm}
                        isProcessing={isProcessing}
                        deposit={totals.deposit}
                        total={totals.total}
                      />
                    </div>
                  )}
                </>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary (Sticky) */}
          <aside className="lg:w-1/3">
            <div className="sticky top-32">
              <CheckoutSummary 
                items={items} 
                total={totals.total} 
                deposit={totals.deposit}
                activeItemIndex={activeItemIndex}
                setActiveItemIndex={setActiveItemIndex} 
                onAddQuote={() => setIsAddModalOpen(true)}
                onRemoveItem={handleRemoveItem}
                onAddReturn={handleAddReturn}
              />
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      <AddServiceModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddQuote}
        currentItems={items}
      />
    </div>
  );
}
