"use client";

import { useTranslation } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Clock, Car, Plane, Luggage } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface CheckoutSummaryProps {
  items: any[];
  total: number;
  deposit: number;
  activeItemIndex?: number;
  setActiveItemIndex?: (index: number) => void;
}

const fmtMoney = (n: number | string | undefined | null) => {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(isFinite(num) ? num : 0);
  } catch {
    return `${Math.round((isFinite(num) ? num : 0) * 100) / 100}€`;
  }
};

export function CheckoutSummary({ items, total, deposit, activeItemIndex, setActiveItemIndex }: CheckoutSummaryProps) {
  const { locale } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();

  // Sincronizar Carousel -> activeItemIndex
  useEffect(() => {
    if (!api || !setActiveItemIndex) return;
    const onSelect = () => {
      setActiveItemIndex(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, setActiveItemIndex]);

  // Sincronizar activeItemIndex -> Carousel
  useEffect(() => {
    if (!api || activeItemIndex === undefined) return;
    if (api.selectedScrollSnap() !== activeItemIndex) {
      api.scrollTo(activeItemIndex);
    }
  }, [api, activeItemIndex]);

  const texts = {
    es: {
      summary: "Resumen de Reserva",
      total: "Total del servicio",
      deposit: "Pago hoy (Depósito)",
      remaining: "Saldo el día del servicio",
      passengers: "Pasajeros",
      children: "Niños",
      vehicle: "Vehículo",
      flight: "Vuelo",
    },
    en: {
      summary: "Booking Summary",
      total: "Total service",
      deposit: "Pay today (Deposit)",
      remaining: "Balance on service day",
      passengers: "Passengers",
      children: "Children",
      vehicle: "Vehicle",
      flight: "Flight",
    },
    fr: {
      summary: "Résumé Réservation",
      total: "Total du service",
      deposit: "Acompte (Aujourd'hui)",
      remaining: "Solde le jour du service",
      passengers: "Passagers",
      children: "Enfants",
      vehicle: "Véhicule",
      flight: "Vol",
    }
  }[locale] || {
    summary: "Resumen de Reserva",
    total: "Total del servicio",
    deposit: "Pago hoy (Depósito)",
    remaining: "Saldo el día del servicio",
    passengers: "Pasajeros",
    children: "Niños",
    vehicle: "Vehículo",
    flight: "Vuelo",
  };

  return (
    <div className="relative bg-white text-[#4A0E0E] rounded-2xl shadow-2xl overflow-hidden font-sans border border-[#4A0E0E]/10 flex flex-col h-full max-h-[85vh]">
      {/* Header: Logo / Airline style */}
      <div className="bg-[#4A0E0E] text-[#D4C483] p-5 flex justify-between items-center relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#D4C483 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
        
        <div className="flex items-center gap-3 relative z-10">
          <Plane className="w-6 h-6" />
          <span className="text-xl font-bold uppercase tracking-widest font-serif">REDESERVI</span>
        </div>
        <div className="text-[10px] tracking-[0.2em] opacity-80 uppercase font-medium relative z-10 text-right">
          <div>Boarding Pass</div>
          <div>{texts.summary}</div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {items.map((item, idx) => (
              <CarouselItem key={item.id || idx}>
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                        {item.tipo === "tour" ? "Tour" : "Traslado"} {items.length > 1 ? `(${idx + 1}/${items.length})` : ""}
                      </p>
                      <h3 className="font-bold text-[#4A0E0E] text-lg leading-tight uppercase font-serif">
                        {item.serviceSubLabel || item.tourTitle || item.tourDoc?.title || [item.originLabel || item.origen, item.destinationLabel || item.destino].filter(v => v && String(v).toLowerCase() !== "undefined").join(" → ") || (item.tipo === "tour" ? "Tour" : "Traslado")}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 font-mono">
                        <Calendar className="w-4 h-4" />
                        {item.date} {item.time}
                      </div>
                    </div>
                    <div className="bg-[#4A0E0E]/5 text-[#4A0E0E] font-bold px-3 py-1 rounded-md text-sm border border-[#4A0E0E]/20 shrink-0">
                      {fmtMoney(item.totalPrice)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#4A0E0E]/5 p-3 rounded-lg text-sm border border-[#4A0E0E]/10">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#4A0E0E]" />
                      <span className="font-medium">{item.passengers} {texts.passengers}</span>
                    </div>
                    {item.ninos > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#4A0E0E]" />
                        <span className="font-medium">{item.ninos} {texts.children}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#4A0E0E]" />
                      <span className="font-medium">{item.vehicle || "Coche"}</span>
                    </div>
                    {item.flightNumber && (
                      <div className="flex items-center gap-2">
                        <Plane className="w-4 h-4 text-[#4A0E0E]" />
                        <span className="font-medium">{item.flightNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 mt-3 text-xs">
                    <div className="flex justify-between text-muted-foreground border-b border-dashed border-[#4A0E0E]/10 pb-1">
                      <span className="uppercase">Precio base</span>
                      <span className="font-mono">{fmtMoney(Number(item.totalPrice || 0) - Number(item.nightCharge || 0) - Number(item.bulkyLuggageSurcharge || 0))}</span>
                    </div>
                    {item.nightCharge > 0 && (
                      <div className="flex justify-between text-muted-foreground border-b border-dashed border-[#4A0E0E]/10 pb-1 pt-1">
                        <span className="uppercase">Recargo nocturno</span>
                        <span className="font-mono">+{fmtMoney(item.nightCharge)}</span>
                      </div>
                    )}
                    {item.bulkyLuggageSurcharge > 0 && (
                      <div className="flex justify-between text-muted-foreground border-b border-dashed border-[#4A0E0E]/10 pb-1 pt-1">
                        <span className="uppercase">Equipaje voluminoso</span>
                        <span className="font-mono">+{fmtMoney(item.bulkyLuggageSurcharge)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4 py-2 bg-[#4A0E0E]/5 mx-6 rounded-lg mb-4">
               <CarouselPrevious className="relative inset-0 size-8 bg-white border-[#4A0E0E]/20 text-[#4A0E0E] translate-y-0 hover:bg-[#4A0E0E]/10 translate-x-0" />
               <span className="text-xs font-bold text-[#4A0E0E] uppercase tracking-widest">
                 Cotización {activeItemIndex !== undefined ? activeItemIndex + 1 : 1} de {items.length}
               </span>
               <CarouselNext className="relative inset-0 size-8 bg-white border-[#4A0E0E]/20 text-[#4A0E0E] translate-y-0 hover:bg-[#4A0E0E]/10 translate-x-0" />
            </div>
          )}
        </Carousel>
      </div>

      {/* Ticket Separator */}
      <div className="relative flex items-center justify-center h-8 bg-white shrink-0">
         <div className="absolute left-[-12px] w-6 h-6 bg-[#F5F5DC] rounded-full border-r border-[#4A0E0E]/10" />
         <div className="w-full mx-6 border-t-[3px] border-dashed border-[#4A0E0E]/20" />
         <div className="absolute right-[-12px] w-6 h-6 bg-[#F5F5DC] rounded-full border-l border-[#4A0E0E]/10" />
      </div>

      {/* Footer Total */}
      <div className="p-6 bg-[#4A0E0E]/5 space-y-4 shrink-0">
        <div className="space-y-2">
          <div className="flex justify-between items-end text-sm">
            <span className="uppercase text-muted-foreground font-bold tracking-wider">{texts.total}</span>
            <span className="text-xl font-bold font-mono">{fmtMoney(total)}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="uppercase text-[#4A0E0E] font-bold tracking-wider text-sm">{texts.deposit}</span>
            <span className="text-2xl font-bold text-[#4A0E0E] font-mono">{fmtMoney(deposit)}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t border-[#4A0E0E]/10">
            <span className="uppercase">{texts.remaining}</span>
            <span className="font-mono">{fmtMoney(total - deposit)}</span>
          </div>
        </div>
        
        {/* <div className="text-center pt-2">
           <a href="/" className="text-[10px] uppercase tracking-wider text-[#4A0E0E] hover:text-[#3A0B0B] underline font-bold">
             + Añadir otra cotización
           </a>
        </div> */}
        
        {/* Fake Barcode */}
        <div className="pt-2 flex justify-center opacity-30 mix-blend-multiply">
           <div className="h-8 w-full max-w-[200px]" style={{
             backgroundImage: 'repeating-linear-gradient(90deg, #4A0E0E, #4A0E0E 2px, transparent 2px, transparent 4px, #4A0E0E 4px, #4A0E0E 5px, transparent 5px, transparent 8px, #4A0E0E 8px, #4A0E0E 12px, transparent 12px, transparent 14px)'
           }} />
        </div>
      </div>
    </div>
  );
}
