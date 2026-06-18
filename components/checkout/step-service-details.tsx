"use client";

import { useTranslation } from "@/contexts/i18n-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, MapPin, Plane, Luggage, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface StepServiceDetailsProps {
  items: any[];
  updateItem: (id: number, fields: any) => void;
  updateAllItems?: (fields: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
  activeItemIndex?: number;
  setActiveItemIndex?: (idx: number) => void;
}

export function StepServiceDetails({ 
  items, 
  updateItem, 
  updateAllItems,
  onNext, 
  onBack, 
  errors,
  activeItemIndex = 0,
  setActiveItemIndex
}: StepServiceDetailsProps) {
  const { locale } = useTranslation();
  const [useSameInfo, setUseSameInfo] = useState(false);

  const texts = {
    es: {
      title: "Detalles del Servicio",
      subtitle: "Proporciónanos la información exacta para recogerte y dejarte",
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
      useSameInfo: "Usar la misma información para todos los tickets"
    },
    en: {
      title: "Service Details",
      subtitle: "Provide the exact information for pickup and drop-off",
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
      useSameInfo: "Use same information for all tickets"
    },
    fr: {
      title: "Détails du Service",
      subtitle: "Fournissez-nous les informations exactes pour la prise en charge et la dépose",
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
      useSameInfo: "Utiliser les mêmes informations pour tous les billets"
    }
  }[locale] || {
    title: "Detalles del Servicio",
    subtitle: "Proporciónanos la información exacta para recogerte y dejarte",
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
    useSameInfo: "Usar la misma información para todos los tickets"
  };

  const item = items[activeItemIndex] || items[0];
  const idx = activeItemIndex;
  
  const handleUpdate = (fields: any) => {
    if (useSameInfo && updateAllItems) {
      updateAllItems(fields);
    } else {
      updateItem(item.id, fields);
    }
  };

  const handleNextClick = () => {
    if (setActiveItemIndex && activeItemIndex < items.length - 1) {
      setActiveItemIndex(activeItemIndex + 1);
    } else {
      onNext();
    }
  };

  const isLastItem = activeItemIndex === items.length - 1;

  if (!item) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#4A0E0E]">{texts.title}</h2>
        <p className="text-muted-foreground">{texts.subtitle}</p>
      </div>

      {items.length > 1 && (
        <div className="flex items-center space-x-2 bg-[#4A0E0E]/5 p-4 rounded-lg border border-[#4A0E0E]/10">
          <Switch 
            id="same-info" 
            checked={useSameInfo} 
            onCheckedChange={(checked) => {
              setUseSameInfo(checked);
              // Opcional: Si se activa, copiar inmediatamente la info actual a todos.
              // if (checked && updateAllItems) {
              //   updateAllItems({ 
              //     pickupAddress: item.pickupAddress, 
              //     dropoffAddress: item.dropoffAddress,
              //     flightNumber: item.flightNumber,
              //     date: item.date,
              //     time: item.time,
              //     passengers: item.passengers,
              //     ninos: item.ninos,
              //     ninosMenores9: item.ninosMenores9
              //   });
              // }
            }} 
          />
          <Label htmlFor="same-info" className="text-sm font-bold text-[#4A0E0E] cursor-pointer">
            {texts.useSameInfo}
          </Label>
        </div>
      )}

      <div className="space-y-6">
        <Card className="border-[#4A0E0E]/10 shadow-md">
          <div className="bg-[#4A0E0E]/5 px-4 py-2 border-b border-[#4A0E0E]/10 flex justify-between items-center">
            <span className="text-sm font-bold text-[#4A0E0E] uppercase tracking-wider">
              {item.tipo === "tour" ? "Tour" : "Traslado"} {items.length > 1 ? `(${idx + 1}/${items.length})` : ""}
            </span>
            <span className="text-xs text-[#4A0E0E]/60">{item.date} {item.time}</span>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4A0E0E]" />
                  {texts.pickup} *
                </Label>
                <Input
                  placeholder="Ubicación exacta de recogida"
                  value={item.pickupAddress || ""}
                  onChange={(e) => handleUpdate({ pickupAddress: e.target.value })}
                  className={errors[`item_${idx}_pickup`] ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                />
                {errors[`item_${idx}_pickup`] && <p className="text-xs text-destructive">{errors[`item_${idx}_pickup`]}</p>}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#4A0E0E]" />
                  {texts.dropoff} *
                </Label>
                <Input
                  placeholder="Ubicación exacta de destino"
                  value={item.dropoffAddress || ""}
                  onChange={(e) => handleUpdate({ dropoffAddress: e.target.value })}
                  className={errors[`item_${idx}_dropoff`] ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                />
                {errors[`item_${idx}_dropoff`] && <p className="text-xs text-destructive">{errors[`item_${idx}_dropoff`]}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#4A0E0E]" />
                  {texts.flight} *
                </Label>
                <Input
                  placeholder="Ej: AF1234"
                  value={item.flightNumber || ""}
                  onChange={(e) => handleUpdate({ flightNumber: e.target.value })}
                  className={errors[`item_${idx}_flight`] ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                />
                <p className="text-[10px] text-muted-foreground uppercase">{texts.flightHint}</p>
                {errors[`item_${idx}_flight`] && <p className="text-xs text-destructive">{errors[`item_${idx}_flight`]}</p>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">Pasajeros</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.passengers || 1}
                    onChange={(e) => handleUpdate({ passengers: parseInt(e.target.value) || 1 })}
                    className={errors[`item_${idx}_passengers`] ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_passengers`] && <p className="text-xs text-destructive">{errors[`item_${idx}_passengers`]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">Niños</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.ninos || 0}
                    onChange={(e) => handleUpdate({ ninos: parseInt(e.target.value) || 0 })}
                    className="border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"
                  />
                </div>
              </div>
              
              {(item.ninos > 0) && (
                <div className="space-y-2 col-span-1 md:col-span-2 bg-[#4A0E0E]/5 p-3 rounded-lg border border-[#4A0E0E]/10">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">Edades de los niños *</Label>
                  <Input
                    type="text"
                    placeholder="Ej: 2 niños de 3 y 7 años"
                    value={item.ninosMenores9 || ""}
                    onChange={(e) => handleUpdate({ ninosMenores9: e.target.value })}
                    className={errors[`item_${idx}_ninosMenores9`] ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_ninosMenores9`] && <p className="text-xs text-destructive">{errors[`item_${idx}_ninosMenores9`]}</p>}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">Fecha</Label>
                  <Input
                    type="date"
                    value={item.date || ""}
                    onChange={(e) => handleUpdate({ date: e.target.value })}
                    className={errors[`item_${idx}_date`] ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_date`] && <p className="text-xs text-destructive">{errors[`item_${idx}_date`]}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-[#4A0E0E] uppercase">Hora</Label>
                  <Input
                    type="time"
                    value={item.time || ""}
                    onChange={(e) => handleUpdate({ time: e.target.value })}
                    className={errors[`item_${idx}_time`] ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
                  />
                  {errors[`item_${idx}_time`] && <p className="text-xs text-destructive">{errors[`item_${idx}_time`]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-[#4A0E0E]" />
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
                  <Label className="flex items-center gap-2">
                    <Luggage className="w-4 h-4 text-[#4A0E0E]" />
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
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
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
          </CardContent>
        </Card>
      </div>

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
