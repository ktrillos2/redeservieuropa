"use client";

import { useTranslation } from "@/contexts/i18n-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowLeft, MapPin, Plane, Luggage, MessageSquare,
  CheckCircle2, AlertCircle, Trash2, Plus, ArrowLeftRight, RefreshCw,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";


interface StepServiceDetailsProps {
  items: any[];
  updateItem: (id: number, fields: any) => void;
  updateAllItems?: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
  activeItemIndex?: number;
  setActiveItemIndex?: (idx: number) => void;
  onRemoveItem?: (id: number) => void;
  onAddService?: () => void;
  onAddReturn?: (sourceItem: any) => void;
}

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

export function StepServiceDetails({
  items,
  updateItem,
  updateAllItems,
  onNext,
  onBack,
  errors,
  activeItemIndex = 0,
  setActiveItemIndex,
  onRemoveItem,
  onAddService,
  onAddReturn,
}: StepServiceDetailsProps) {
  const { locale } = useTranslation();
  const [useSameInfo, setUseSameInfo] = useState(false);

  const texts = {
    es: {
      title: "Detalles del Servicio",
      subtitle: "Completa la información exacta para cada reserva",
      pickup: "Dirección de Recogida",
      dropoff: "Dirección de Destino",
      flight: "Número de Vuelo o Tren",
      flightHint: "(Si no aplica, escribe N/A)",
      luggage23: "Maletas de 23kg",
      luggage10: "Maletas de 10kg",
      requests: "Solicitudes Especiales",
      requestsPlaceholder: "Ej: Silla de bebé, parada extra...",
      next: "Ir a pagar",
      nextItem: "Siguiente Servicio",
      back: "Volver",
      useSameInfo: "Misma información para todos los servicios",
      useSameInfoDesc: "Las direcciones, equipaje y pasajeros se aplicarán a todos los servicios.",
      addService: "Añadir Servicio",
      addReturn: "Reservar Regreso",
      removeService: "Eliminar este servicio",
      complete: "Completo",
      missingInfo: "Falta info",
      transfer: "Traslado",
      tour: "Tour",
      passengers: "Pasajeros",
      children: "Niños",
      childrenAges: "Edades de los niños",
      childrenAgesPlaceholder: "Ej: 2 niños de 3 y 7 años",
      date: "Fecha",
      time: "Hora",
      applyToAll: "Copiar esta info a todos",
    },
    en: {
      title: "Service Details",
      subtitle: "Complete the exact information for each booking",
      pickup: "Pickup Address",
      dropoff: "Drop-off Address",
      flight: "Flight or Train Number",
      flightHint: "(If not applicable, write N/A)",
      luggage23: "23kg Suitcases",
      luggage10: "10kg Suitcases",
      requests: "Special Requests",
      requestsPlaceholder: "Ex: Baby seat, extra stop...",
      next: "Go to payment",
      nextItem: "Next Service",
      back: "Back",
      useSameInfo: "Same information for all services",
      useSameInfoDesc: "Addresses, luggage and passengers will be applied to all services.",
      addService: "Add Service",
      addReturn: "Book Return",
      removeService: "Remove this service",
      complete: "Complete",
      missingInfo: "Missing info",
      transfer: "Transfer",
      tour: "Tour",
      passengers: "Passengers",
      children: "Children",
      childrenAges: "Children's ages",
      childrenAgesPlaceholder: "Ex: 2 children aged 3 and 7",
      date: "Date",
      time: "Time",
      applyToAll: "Copy this info to all",
    },
    fr: {
      title: "Détails du Service",
      subtitle: "Complétez les informations exactes pour chaque réservation",
      pickup: "Adresse de Prise en Charge",
      dropoff: "Adresse de Destination",
      flight: "Numéro de Vol ou de Train",
      flightHint: "(Si non applicable, écrivez N/A)",
      luggage23: "Valises de 23kg",
      luggage10: "Valises de 10kg",
      requests: "Demandes Spéciales",
      requestsPlaceholder: "Ex: Siège bébé, arrêt supplémentaire...",
      next: "Aller au paiement",
      nextItem: "Service Suivant",
      back: "Retour",
      useSameInfo: "Mêmes informations pour tous les services",
      useSameInfoDesc: "Les adresses, bagages et passagers seront appliqués à tous les services.",
      addService: "Ajouter un Service",
      addReturn: "Réserver Retour",
      removeService: "Supprimer ce service",
      complete: "Complet",
      missingInfo: "Info manquante",
      transfer: "Transfert",
      tour: "Tour",
      passengers: "Passagers",
      children: "Enfants",
      childrenAges: "Âges des enfants",
      childrenAgesPlaceholder: "Ex: 2 enfants de 3 et 7 ans",
      date: "Date",
      time: "Heure",
      applyToAll: "Copier cette info vers tous",
    },
  }[locale] || {
    title: "Detalles del Servicio",
    subtitle: "Completa la información exacta para cada reserva",
    pickup: "Dirección de Recogida",
    dropoff: "Dirección de Destino",
    flight: "Número de Vuelo o Tren",
    flightHint: "(Si no aplica, escribe N/A)",
    luggage23: "Maletas de 23kg",
    luggage10: "Maletas de 10kg",
    requests: "Solicitudes Especiales",
    requestsPlaceholder: "Ej: Silla de bebé, parada extra...",
    next: "Ir a pagar",
    nextItem: "Siguiente Servicio",
    back: "Volver",
    useSameInfo: "Misma información para todos los servicios",
    useSameInfoDesc: "Las direcciones, equipaje y pasajeros se aplicarán a todos los servicios.",
    addService: "Añadir Servicio",
    addReturn: "Reservar Regreso",
    removeService: "Eliminar este servicio",
    complete: "Completo",
    missingInfo: "Falta info",
    transfer: "Traslado",
    tour: "Tour",
    passengers: "Pasajeros",
    children: "Niños",
    childrenAges: "Edades de los niños",
    childrenAgesPlaceholder: "Ej: 2 niños de 3 y 7 años",
    date: "Fecha",
    time: "Hora",
    applyToAll: "Copiar esta info a todos",
  };

  const item = items[activeItemIndex] ?? items[0];
  const idx = activeItemIndex;
  const isLastItem = activeItemIndex === items.length - 1;
  const canAddReturn = item?.tipo === "traslado" && !item?.isReturn;

  const handleUpdate = (fields: any) => {
    if (useSameInfo && updateAllItems) {
      updateAllItems(fields);
    } else {
      updateItem(item.id, fields);
    }
  };

  const handleApplyToAll = () => {
    if (!updateAllItems) return;
    updateAllItems({
      pickupAddress: item.pickupAddress,
      dropoffAddress: item.dropoffAddress,
      flightNumber: item.flightNumber,
      passengers: item.passengers,
      ninos: item.ninos,
      ninosMenores9: item.ninosMenores9,
      luggage23kg: item.luggage23kg,
      luggage10kg: item.luggage10kg,
    });
  };

  const handleNextClick = () => {
    if (setActiveItemIndex && activeItemIndex < items.length - 1) {
      setActiveItemIndex(activeItemIndex + 1);
    } else {
      onNext();
    }
  };

  if (!item) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-3xl font-bold text-[#4A0E0E]">{texts.title}</h2>
        <p className="text-muted-foreground text-sm">{texts.subtitle}</p>
      </div>

      {/* ─── Service tab navigation ─── */}
      {items.length > 1 && (
        <div className="space-y-3">
          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {items.map((it, i) => {
              const complete = isItemComplete(it);
              const isActive = i === activeItemIndex;
              return (
                <button
                  key={it.id || i}
                  onClick={() => setActiveItemIndex?.(i)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border-2",
                    isActive
                      ? "bg-[#4A0E0E] text-white border-[#4A0E0E] shadow-md"
                      : "bg-white text-[#4A0E0E]/70 border-[#4A0E0E]/20 hover:border-[#4A0E0E]/50"
                  )}
                >
                  {complete ? (
                    <CheckCircle2 className={cn("w-3.5 h-3.5", isActive ? "text-emerald-300" : "text-emerald-500")} />
                  ) : (
                    <AlertCircle className={cn("w-3.5 h-3.5", isActive ? "text-amber-300" : "text-amber-500")} />
                  )}
                  {it.tipo === "tour" ? texts.tour : texts.transfer} {i + 1}
                  {it.isReturn && <ArrowLeftRight className="w-3 h-3 opacity-70" />}
                </button>
              );
            })}
            {/* Add new service button */}
            {onAddService && (
              <button
                onClick={onAddService}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border-2 border-dashed border-[#4A0E0E]/30 text-[#4A0E0E]/60 hover:border-[#4A0E0E] hover:text-[#4A0E0E] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                {texts.addService}
              </button>
            )}
          </div>

          {/* Same info toggle */}
          <div className={cn(
            "flex items-start gap-3 p-3 rounded-xl border transition-all",
            useSameInfo
              ? "bg-[#4A0E0E]/5 border-[#4A0E0E]/30"
              : "bg-gray-50 border-gray-200"
          )}>
            <Switch
              id="same-info"
              checked={useSameInfo}
              onCheckedChange={(checked) => {
                setUseSameInfo(checked);
                if (checked && updateAllItems) {
                  // Immediately apply current item's info to all
                  updateAllItems({
                    pickupAddress: item.pickupAddress,
                    dropoffAddress: item.dropoffAddress,
                    flightNumber: item.flightNumber,
                    passengers: item.passengers,
                    ninos: item.ninos,
                    ninosMenores9: item.ninosMenores9,
                    luggage23kg: item.luggage23kg,
                    luggage10kg: item.luggage10kg,
                  });
                }
              }}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <Label htmlFor="same-info" className="text-sm font-bold text-[#4A0E0E] cursor-pointer">
                {texts.useSameInfo}
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">{texts.useSameInfoDesc}</p>
            </div>
            {/* Manual "apply to all" button when toggle is off */}
            {!useSameInfo && items.length > 1 && (
              <button
                onClick={handleApplyToAll}
                title={texts.applyToAll}
                className="flex items-center gap-1 text-[10px] font-bold text-[#4A0E0E]/60 hover:text-[#4A0E0E] uppercase tracking-wide transition-colors shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                {texts.applyToAll}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Form card ─── */}
      <>
        <div
          key={`item-${item.id || idx}`}
          className="animate-in fade-in-0 duration-200"
        >
          <Card className="border-[#4A0E0E]/10 shadow-md">
            {/* Card header */}
            <div className="bg-[#4A0E0E]/5 px-4 py-3 border-b border-[#4A0E0E]/10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#4A0E0E] uppercase tracking-wider">
                  {item.tipo === "tour" ? texts.tour : texts.transfer}
                  {items.length > 1 ? ` (${idx + 1}/${items.length})` : ""}
                </span>
                {item.isReturn && (
                  <Badge className="bg-[#4A0E0E]/10 text-[#4A0E0E] border-0 text-[10px]">
                    <ArrowLeftRight className="w-2.5 h-2.5 mr-1" />
                    Return
                  </Badge>
                )}
                {useSameInfo && items.length > 1 && (
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-[10px]">
                    = Mismo para todos
                  </Badge>
                )}
              </div>
              <span className="text-xs text-[#4A0E0E]/60 font-mono">{item.date} {item.time}</span>
            </div>

            <CardContent className="p-6 space-y-6">

              {/* Addresses */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-[#4A0E0E]" />
                    {texts.pickup} *
                  </Label>
                  <Input
                    placeholder="Ubicación exacta de recogida"
                    value={item.pickupAddress || ""}
                    onChange={(e) => handleUpdate({ pickupAddress: e.target.value })}
                    className={errors[`item_${idx}_pickup`]
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_pickup`] && (
                    <p className="text-xs text-destructive">{errors[`item_${idx}_pickup`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-[#4A0E0E]" />
                    {texts.dropoff} *
                  </Label>
                  <Input
                    placeholder="Ubicación exacta de destino"
                    value={item.dropoffAddress || ""}
                    onChange={(e) => handleUpdate({ dropoffAddress: e.target.value })}
                    className={errors[`item_${idx}_dropoff`]
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_dropoff`] && (
                    <p className="text-xs text-destructive">{errors[`item_${idx}_dropoff`]}</p>
                  )}
                </div>
              </div>

              {/* Flight + Passengers */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 font-semibold">
                    <Plane className="w-4 h-4 text-[#4A0E0E]" />
                    {texts.flight} *
                  </Label>
                  <Input
                    placeholder="Ej: AF1234"
                    value={item.flightNumber || ""}
                    onChange={(e) => handleUpdate({ flightNumber: e.target.value })}
                    className={errors[`item_${idx}_flight`]
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  <p className="text-[10px] text-muted-foreground uppercase">{texts.flightHint}</p>
                  {errors[`item_${idx}_flight`] && (
                    <p className="text-xs text-destructive">{errors[`item_${idx}_flight`]}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#4A0E0E] uppercase">{texts.passengers}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.passengers || 1}
                      onChange={(e) => handleUpdate({ passengers: parseInt(e.target.value) || 1 })}
                      className={errors[`item_${idx}_passengers`]
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                    />
                    {errors[`item_${idx}_passengers`] && (
                      <p className="text-xs text-destructive">{errors[`item_${idx}_passengers`]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-[#4A0E0E] uppercase">{texts.children}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.ninos || 0}
                      onChange={(e) => handleUpdate({ ninos: parseInt(e.target.value) || 0 })}
                      className="border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"
                    />
                  </div>
                </div>
              </div>

              {/* Children ages */}
              {Number(item.ninos) > 0 && (
                <div className="space-y-2 bg-[#4A0E0E]/5 p-3 rounded-lg border border-[#4A0E0E]/10">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">
                    {texts.childrenAges} *
                  </Label>
                  <Input
                    type="text"
                    placeholder={texts.childrenAgesPlaceholder}
                    value={item.ninosMenores9 || ""}
                    onChange={(e) => handleUpdate({ ninosMenores9: e.target.value })}
                    className={errors[`item_${idx}_ninosMenores9`]
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_ninosMenores9`] && (
                    <p className="text-xs text-destructive">{errors[`item_${idx}_ninosMenores9`]}</p>
                  )}
                </div>
              )}

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">{texts.date} *</Label>
                  <Input
                    type="date"
                    value={item.date || ""}
                    onChange={(e) => handleUpdate({ date: e.target.value })}
                    className={errors[`item_${idx}_date`]
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_date`] && (
                    <p className="text-xs text-destructive">{errors[`item_${idx}_date`]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">{texts.time} *</Label>
                  <Input
                    type="time"
                    value={item.time || ""}
                    onChange={(e) => handleUpdate({ time: e.target.value })}
                    className={errors[`item_${idx}_time`]
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_time`] && (
                    <p className="text-xs text-destructive">{errors[`item_${idx}_time`]}</p>
                  )}
                </div>
              </div>

              {/* Luggage */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold text-[#4A0E0E] uppercase">
                    <Luggage className="w-3.5 h-3.5" />
                    {texts.luggage23}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.luggage23kg || 0}
                    onChange={(e) => handleUpdate({ luggage23kg: parseInt(e.target.value) || 0 })}
                    className="border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs font-bold text-[#4A0E0E] uppercase">
                    <Luggage className="w-3.5 h-3.5" />
                    {texts.luggage10}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.luggage10kg || 0}
                    onChange={(e) => handleUpdate({ luggage10kg: parseInt(e.target.value) || 0 })}
                    className="border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"
                  />
                </div>
              </div>

              {/* Special requests */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-semibold">
                  <MessageSquare className="w-4 h-4 text-[#4A0E0E]" />
                  {texts.requests}
                </Label>
                <Textarea
                  placeholder={texts.requestsPlaceholder}
                  value={item.specialRequests || ""}
                  onChange={(e) => handleUpdate({ specialRequests: e.target.value })}
                  className="border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E] min-h-[80px]"
                />
              </div>

              {/* Quick actions row */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#4A0E0E]/10">
                {/* Book return */}
                {canAddReturn && onAddReturn && (
                  <button
                    onClick={() => onAddReturn(item)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#4A0E0E]/70 hover:text-[#4A0E0E] border border-[#4A0E0E]/20 hover:border-[#4A0E0E] px-3 py-1.5 rounded-lg transition-all"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    {texts.addReturn}
                  </button>
                )}
                {/* Add new service */}
                {onAddService && (
                  <button
                    onClick={onAddService}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#4A0E0E]/70 hover:text-[#4A0E0E] border border-[#4A0E0E]/20 hover:border-[#4A0E0E] px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {texts.addService}
                  </button>
                )}
                {/* Remove */}
                {items.length > 1 && onRemoveItem && (
                  <button
                    onClick={() => {
                      onRemoveItem(item.id);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-all ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {texts.removeService}
                  </button>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </>

      {/* Navigation buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => {
            if (activeItemIndex > 0 && setActiveItemIndex) {
              setActiveItemIndex(activeItemIndex - 1);
            } else {
              onBack();
            }
          }}
          className="h-12 border-[#4A0E0E] text-[#4A0E0E] hover:bg-[#4A0E0E]/5 text-lg font-bold flex-1"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          {texts.back}
        </Button>
        <Button
          onClick={handleNextClick}
          className="h-12 bg-[#4A0E0E] hover:bg-[#3A0B0B] text-white text-lg font-bold flex-[2] group"
        >
          {isLastItem ? texts.next : texts.nextItem}
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
