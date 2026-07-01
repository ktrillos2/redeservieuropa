"use client";

import { useTranslation } from "@/contexts/i18n-context";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin, Users, Calendar, Clock, Car, Plane, Luggage,
  Plus, ArrowLeftRight, Trash2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface CheckoutSummaryProps {
  items: any[];
  total: number;
  deposit: number;
  activeItemIndex?: number;
  setActiveItemIndex?: (index: number) => void;
  onAddQuote?: () => void;
  onRemoveItem?: (id: number) => void;
  onAddReturn?: (sourceItem: any) => void;
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

/** Returns true if the item has enough data to be considered "complete" */
function isItemComplete(item: any): boolean {
  if (!item) return false;
  const isEvent = Boolean(item.isEvent);
  if (!isEvent) {
    if (!item.pickupAddress?.trim()) return false;
    if (!item.dropoffAddress?.trim()) return false;
  }
  if (!item.date || !item.time) return false;
  return true;
}

export function CheckoutSummary({
  items,
  total,
  deposit,
  activeItemIndex = 0,
  setActiveItemIndex,
  onAddQuote,
  onRemoveItem,
  onAddReturn,
}: CheckoutSummaryProps) {
  const { locale } = useTranslation();
  const [api, setApi] = useState<CarouselApi>();

  // Sync Carousel -> activeItemIndex
  useEffect(() => {
    if (!api || !setActiveItemIndex) return;
    const onSelect = () => setActiveItemIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => { api.off("select", onSelect); };
  }, [api, setActiveItemIndex]);

  // Sync activeItemIndex -> Carousel
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
      addService: "Añadir Servicio",
      addReturn: "Reservar Regreso",
      removeService: "Eliminar Servicio",
      complete: "Completo",
      missingInfo: "Falta Info",
      service: "Servicio",
      transfer: "Traslado",
      tour: "Tour",
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
      addService: "Add Service",
      addReturn: "Book Return",
      removeService: "Remove Service",
      complete: "Complete",
      missingInfo: "Missing Info",
      service: "Service",
      transfer: "Transfer",
      tour: "Tour",
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
      addService: "Ajouter un Service",
      addReturn: "Réserver Retour",
      removeService: "Supprimer le Service",
      complete: "Complet",
      missingInfo: "Info Manquante",
      service: "Service",
      transfer: "Transfert",
      tour: "Tour",
    },
  }[locale] || {
    summary: "Resumen de Reserva",
    total: "Total del servicio",
    deposit: "Pago hoy (Depósito)",
    remaining: "Saldo el día del servicio",
    passengers: "Pasajeros",
    children: "Niños",
    vehicle: "Vehículo",
    flight: "Vuelo",
    addService: "Añadir Servicio",
    addReturn: "Reservar Regreso",
    removeService: "Eliminar Servicio",
    complete: "Completo",
    missingInfo: "Falta Info",
    service: "Servicio",
    transfer: "Traslado",
    tour: "Tour",
  };

  const activeItem = items[activeItemIndex] ?? items[0];
  const canAddReturn = activeItem?.tipo === "traslado" && !activeItem?.isReturn;

  return (
    <div className="relative bg-white text-[#4A0E0E] rounded-2xl shadow-2xl overflow-hidden font-sans border border-[#4A0E0E]/10 flex flex-col">

      {/* Header: Boarding pass style */}
      <div className="bg-[#4A0E0E] text-[#D4C483] p-5 flex justify-between items-center relative overflow-hidden">
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

      {/* Item tabs — pill navigation */}
      {items.length > 1 && (
        <div className="flex gap-2 px-4 pt-3 pb-0 overflow-x-auto scrollbar-hide">
          {items.map((item, idx) => {
            const complete = isItemComplete(item);
            const isActive = idx === activeItemIndex;
            return (
              <button
                key={item.id || idx}
                onClick={() => setActiveItemIndex?.(idx)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-[#4A0E0E] text-white border-[#4A0E0E]"
                    : "bg-white text-[#4A0E0E]/70 border-[#4A0E0E]/20 hover:border-[#4A0E0E]/50"
                )}
              >
                {complete ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                )}
                {item.tipo === "tour" ? texts.tour : texts.transfer} {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Carousel content */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {items.map((item, idx) => (
              <CarouselItem key={item.id || idx}>
                <div className="p-6 space-y-5">
                  {/* Item header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                        {item.tipo === "tour" ? texts.tour : texts.transfer}
                        {item.isReturn && (
                          <span className="ml-1 inline-flex items-center gap-0.5 text-[#4A0E0E]">
                            <ArrowLeftRight className="w-3 h-3" /> Return
                          </span>
                        )}
                      </p>
                      <h3 className="font-bold text-[#4A0E0E] text-base leading-tight uppercase font-serif truncate">
                        {item.serviceSubLabel || item.tourTitle || item.tourDoc?.title ||
                          [item.originLabel || item.origen, item.destinationLabel || item.destino]
                            .filter(v => v && String(v).toLowerCase() !== "undefined")
                            .join(" → ") ||
                          (item.tipo === "tour" ? texts.tour : texts.transfer)}
                      </h3>
                      {(item.date || item.time) && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 font-mono">
                          <Calendar className="w-3.5 h-3.5" />
                          {item.date} {item.time}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="bg-[#4A0E0E]/5 text-[#4A0E0E] font-bold px-3 py-1 rounded-md text-sm border border-[#4A0E0E]/20">
                        {fmtMoney(item.totalPrice)}
                      </div>
                      {/* Complete badge */}
                      {isItemComplete(item) ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] font-bold">
                          ✓ {texts.complete}
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] font-bold">
                          ! {texts.missingInfo}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-2 bg-[#4A0E0E]/5 p-3 rounded-lg text-sm border border-[#4A0E0E]/10">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#4A0E0E]" />
                      <span className="font-medium text-xs">{item.passengers} {texts.passengers}</span>
                    </div>
                    {item.ninos > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-[#4A0E0E]" />
                        <span className="font-medium text-xs">{item.ninos} {texts.children}</span>
                      </div>
                    )}
                    {item.vehicle && (
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-[#4A0E0E]" />
                        <span className="font-medium text-xs">{item.vehicle}</span>
                      </div>
                    )}
                    {item.flightNumber && (
                      <div className="flex items-center gap-2">
                        <Plane className="w-3.5 h-3.5 text-[#4A0E0E]" />
                        <span className="font-medium text-xs">{item.flightNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Price breakdown */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-muted-foreground border-b border-dashed border-[#4A0E0E]/10 pb-1">
                      <span className="uppercase">Precio base</span>
                      <span className="font-mono">
                        {fmtMoney(Number(item.totalPrice || 0) - Number(item.nightCharge || 0) - Number(item.bulkyLuggageSurcharge || 0))}
                      </span>
                    </div>
                    {Number(item.nightCharge) > 0 && (
                      <div className="flex justify-between text-muted-foreground border-b border-dashed border-[#4A0E0E]/10 pb-1 pt-1">
                        <span className="uppercase">Recargo nocturno</span>
                        <span className="font-mono">+{fmtMoney(item.nightCharge)}</span>
                      </div>
                    )}
                    {Number(item.bulkyLuggageSurcharge) > 0 && (
                      <div className="flex justify-between text-muted-foreground border-b border-dashed border-[#4A0E0E]/10 pb-1 pt-1">
                        <span className="uppercase">Equipaje voluminoso</span>
                        <span className="font-mono">+{fmtMoney(item.bulkyLuggageSurcharge)}</span>
                      </div>
                    )}
                  </div>

                  {/* Remove item button (only if more than 1 item) */}
                  {items.length > 1 && onRemoveItem && (
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="flex items-center gap-1.5 text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      {texts.removeService}
                    </button>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {items.length > 1 && (
            <div className="flex items-center justify-center gap-4 py-2 bg-[#4A0E0E]/5 mx-6 rounded-lg mb-4">
              <CarouselPrevious className="relative inset-0 size-7 bg-white border-[#4A0E0E]/20 text-[#4A0E0E] translate-y-0 hover:bg-[#4A0E0E]/10 translate-x-0" />
              <span className="text-xs font-bold text-[#4A0E0E] uppercase tracking-widest">
                {activeItemIndex + 1} / {items.length}
              </span>
              <CarouselNext className="relative inset-0 size-7 bg-white border-[#4A0E0E]/20 text-[#4A0E0E] translate-y-0 hover:bg-[#4A0E0E]/10 translate-x-0" />
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
      <div className="p-5 bg-[#4A0E0E]/5 space-y-4 shrink-0">
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

        {/* Action buttons */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Add service */}
          {onAddQuote && (
            <Button
              onClick={onAddQuote}
              variant="outline"
              size="sm"
              className="w-full border-[#4A0E0E] text-[#4A0E0E] hover:bg-[#4A0E0E] hover:text-white font-bold text-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {texts.addService}
            </Button>
          )}
          {/* Add return (only for transfers) */}
          {canAddReturn && onAddReturn && (
            <Button
              onClick={() => onAddReturn(activeItem)}
              variant="outline"
              size="sm"
              className="w-full border-[#4A0E0E]/40 text-[#4A0E0E]/80 hover:bg-[#4A0E0E]/5 font-bold text-xs transition-all"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
              {texts.addReturn}
            </Button>
          )}
        </div>

        {/* Fake Barcode */}
        <div className="pt-1 flex justify-center opacity-30 mix-blend-multiply">
          <div className="h-6 w-full max-w-[200px]" style={{
            backgroundImage: 'repeating-linear-gradient(90deg, #4A0E0E, #4A0E0E 2px, transparent 2px, transparent 4px, #4A0E0E 4px, #4A0E0E 5px, transparent 5px, transparent 8px, #4A0E0E 8px, #4A0E0E 12px, transparent 12px, transparent 14px)'
          }} />
        </div>
      </div>
    </div>
  );
}
