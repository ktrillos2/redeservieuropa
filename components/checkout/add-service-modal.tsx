"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map, MapPin, Plane, Users, Calendar, Clock, Car } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { buildTransfersIndexes, getOriginLabel, getDestinationLabel, getAvailableDestinations } from "@/sanity/lib/transfers";
import type { TransferDoc, TransfersIndexes } from "@/sanity/lib/transfers";

type AddServiceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
  currentItems?: any[];
};

export function AddServiceModal({ isOpen, onClose, onAdd, currentItems = [] }: AddServiceModalProps) {
  const [step, setStep] = useState<"type" | "details">("type");
  const [serviceType, setServiceType] = useState<"tour" | "traslado" | "evento" | null>(null);
  
  const [toursList, setToursList] = useState<any[]>([]);
  const [transfersList, setTransfersList] = useState<TransferDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Transfer specific state
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [transfersIndexes, setTransfersIndexes] = useState<TransfersIndexes>({ byOrigin: {}, byPair: {}, originKeys: [] });

  // Common state
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [pasajeros, setPasajeros] = useState("1");
  const [vehiculo, setVehiculo] = useState("coche");

  // Tour specific state
  const [selectedTourSlug, setSelectedTourSlug] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep("type");
      setServiceType(null);
      setOrigen("");
      setDestino("");
      setSelectedTourSlug("");
      setFecha("");
      setHora("");
      
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const [toursRes, transfersRes] = await Promise.all([
            fetch("/api/tours").then(r => r.json()),
            fetch("/api/transfers").then(r => r.json())
          ]);
          setToursList(toursRes.tours || []);
          setTransfersList(transfersRes.transfers || []);
          setTransfersIndexes(buildTransfersIndexes(transfersRes.transfers || []));
        } catch (error) {
          console.error("Error fetching data for modal", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  }, [isOpen]);

  const handleSelectType = (type: "tour" | "traslado" | "evento") => {
    setServiceType(type);
    setStep("details");
  };

  const getVehicleCap = (v: string) => {
    if (v === "van") return 8;
    if (v === "minivan") return 6;
    return 4; // coche
  };

  const handleAdd = () => {
    let newItem: any = {
      id: Date.now(),
      fecha,
      hora,
      pasajeros: Number(pasajeros),
      vehiculo,
      ninos: 0,
      tipo: serviceType === "evento" ? "tour" : serviceType, // Assuming evento works like tour
      isEvent: serviceType === "evento",
    };

    if (serviceType === "traslado") {
      if (!origen || !destino) return;
      const transferDoc = transfersIndexes.byPair[`${origen}__${destino}`];
      newItem = {
        ...newItem,
        tipoReserva: "traslado",
        origen,
        destino,
        transferDoc,
      };
    } else {
      if (!selectedTourSlug) return;
      const tourDoc = toursList.find(t => t.slug?.current === selectedTourSlug || t.title === selectedTourSlug);
      newItem = {
        ...newItem,
        tipoReserva: "tour",
        selectedTourSlug,
        tourDoc,
      };
      if (serviceType === "evento") {
        newItem.pricePerPerson = tourDoc?.pricePerPerson || tourDoc?.booking?.startingPriceEUR || 0;
      }
    }

    onAdd(newItem);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-md border-[#4A0E0E]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-[#4A0E0E] text-center">
            {step === "type" ? "Añadir Nuevo Servicio" :
             serviceType === "traslado" ? "Detalles del Traslado" :
             serviceType === "tour" ? "Detalles del Tour" : "Detalles del Evento"}
          </DialogTitle>
          <DialogDescription className="text-center text-[#4A0E0E]/70">
            {step === "type"
              ? `Añade un nuevo servicio a tu compra${currentItems.length > 0 ? ` (ya tienes ${currentItems.length} servicio${currentItems.length > 1 ? 's' : ''})` : ""}.`
              : "Completa la información básica."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A0E0E]" />
          </div>
        ) : (
          <div className="py-4">
            {step === "type" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className="cursor-pointer hover:border-[#4A0E0E] transition-all hover:shadow-md"
                  onClick={() => handleSelectType("traslado")}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <Car className="w-10 h-10 text-[#4A0E0E]" />
                    <span className="font-bold text-[#4A0E0E]">Traslado</span>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:border-[#4A0E0E] transition-all hover:shadow-md"
                  onClick={() => handleSelectType("tour")}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <Map className="w-10 h-10 text-[#4A0E0E]" />
                    <span className="font-bold text-[#4A0E0E]">Tour</span>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:border-[#4A0E0E] transition-all hover:shadow-md"
                  onClick={() => handleSelectType("evento")}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                    <Calendar className="w-10 h-10 text-[#4A0E0E]" />
                    <span className="font-bold text-[#4A0E0E]">Evento</span>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === "details" && serviceType === "traslado" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A0E0E]">Desde (Origen)</label>
                    <Select value={origen} onValueChange={(val) => { setOrigen(val); setDestino(""); }}>
                      <SelectTrigger className="border-[#4A0E0E]/20">
                        <SelectValue placeholder="Selecciona origen" />
                      </SelectTrigger>
                      <SelectContent>
                        {transfersIndexes.originKeys.map(k => (
                          <SelectItem key={k} value={k}>{getOriginLabel(transfersIndexes, k)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#4A0E0E]">Hasta (Destino)</label>
                    <Select value={destino} onValueChange={setDestino} disabled={!origen}>
                      <SelectTrigger className="border-[#4A0E0E]/20">
                        <SelectValue placeholder="Selecciona destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {origen && getAvailableDestinations(transfersIndexes, origen).map(d => (
                           <SelectItem key={d} value={d}>{getDestinationLabel(transfersIndexes, origen, d)}</SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === "details" && (serviceType === "tour" || serviceType === "evento") && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                  {toursList
                    .filter(t => serviceType === "evento" ? t.isEvent : !t.isEvent)
                    .map(tour => (
                      <Card 
                        key={tour._id} 
                        className={`cursor-pointer transition-all ${selectedTourSlug === tour.slug?.current || selectedTourSlug === tour.title ? "border-[#4A0E0E] ring-2 ring-[#4A0E0E]/50" : "border-[#4A0E0E]/10"}`}
                        onClick={() => setSelectedTourSlug(tour.slug?.current || tour.title)}
                      >
                        <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                          <span className="font-bold text-sm text-[#4A0E0E]">{tour.title}</span>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              </div>
            )}

            {step === "details" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#4A0E0E]/10">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4A0E0E]">Fecha</label>
                  <Input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="border-[#4A0E0E]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4A0E0E]">Hora</label>
                  <Input type="time" value={hora} onChange={e => setHora(e.target.value)} className="border-[#4A0E0E]/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4A0E0E]">Pasajeros</label>
                  <Select value={pasajeros} onValueChange={setPasajeros}>
                    <SelectTrigger className="border-[#4A0E0E]/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Array.from({length: getVehicleCap(vehiculo)}, (_, i) => i+1).map(n => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4A0E0E]">Vehículo</label>
                  <Select value={vehiculo} onValueChange={(val) => { setVehiculo(val); setPasajeros("1"); }}>
                    <SelectTrigger className="border-[#4A0E0E]/20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coche">Coche</SelectItem>
                      <SelectItem value="minivan">Minivan</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          {step === "details" ? (
            <>
              <Button variant="outline" onClick={() => setStep("type")} className="border-[#4A0E0E]/20 text-[#4A0E0E]">
                Volver
              </Button>
              <Button onClick={handleAdd} className="bg-[#4A0E0E] hover:bg-[#3A0B0B] text-[#D4C483] font-bold">
                Añadir a la Reserva
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto border-[#4A0E0E]/20 text-[#4A0E0E]">
              Cancelar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
