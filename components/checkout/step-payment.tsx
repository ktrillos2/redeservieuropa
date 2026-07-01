"use client";

import { useTranslation } from "@/contexts/i18n-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Wallet, Landmark, ShieldCheck, Lock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface StepPaymentProps {
  onBack: () => void;
  onConfirm: (method: string, payFull: boolean) => void;
  isProcessing: boolean;
  deposit: number;
  total: number;
}

export function StepPayment({ onBack, onConfirm, isProcessing, deposit, total }: StepPaymentProps) {
  const { locale } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState("mollie");
  const [payFullAmount, setPayFullAmount] = useState(false);

  const texts = {
    es: {
      title: "Método de Pago",
      subtitle: "Selecciona cómo deseas realizar el depósito para confirmar tu reserva",
      mollie: "Tarjeta de Crédito / Débito",
      paypal: "PayPal",
      cash: "Efectivo al conductor",
      cashNote: "El depósito se cobrará igualmente para confirmar.",
      secure: "Pago 100% Seguro",
      secureNote: "Tus datos están protegidos con encriptación SSL de 256 bits",
      confirm: "Confirmar Reserva",
      confirmDeposit: "Pagar Depósito: ",
      totalService: "Total del servicio: ",
      back: "Volver",
      payFullQuestion: "¿Deseas pagar todo ahora?",
      totalToPayNow: "Total a pagar ahora",
      deposit10: "depósito 10%",
      balanceOnServiceDay: "Saldo el día del servicio",
      surchargeNotes: "* Recargo nocturno (21:00 - 06:00): +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€. Se aplicarán automáticamente a tu reserva si corresponde.",
      paymentExplanation: "Puedes pagar con tarjeta o PayPal de forma segura. Si prefieres, marca \"¿Deseas pagar todo ahora?\" para abonar el 100%. En caso contrario, se cobrará el depósito del 10% y el resto se paga el día del servicio.",
      processing: "Procesando..."
    },
    en: {
      title: "Payment Method",
      subtitle: "Select how you want to make the deposit to confirm your booking",
      mollie: "Credit / Debit Card",
      paypal: "PayPal",
      cash: "Cash to driver",
      cashNote: "The deposit will still be charged to confirm.",
      secure: "100% Secure Payment",
      secureNote: "Your data is protected with 256-bit SSL encryption",
      confirm: "Confirm Booking",
      confirmDeposit: "Pay Deposit: ",
      totalService: "Total Service: ",
      back: "Back",
      payFullQuestion: "Do you want to pay in full now?",
      totalToPayNow: "Total to pay now",
      deposit10: "10% deposit",
      balanceOnServiceDay: "Balance on the day of service",
      surchargeNotes: "* Night surcharge (21:00 - 06:00): +5€. Bulky luggage (more than 3 x 23Kg suitcases): +10€. They will be automatically applied to your booking if applicable.",
      paymentExplanation: "You can pay safely with card or PayPal. If you prefer, check \"Do you want to pay in full now?\" to pay 100%. Otherwise, a 10% deposit will be charged and the rest is paid on the day of service.",
      processing: "Processing..."
    },
    fr: {
      title: "Méthode de Paiement",
      subtitle: "Sélectionnez comment vous souhaitez effectuer l'acompte pour confirmer votre réservation",
      mollie: "Carte de Crédit / Débit",
      paypal: "PayPal",
      cash: "Espèces au chauffeur",
      cashNote: "L'acompte sera toujours facturé pour confirmer.",
      secure: "Paiement 100% Sécurisé",
      secureNote: "Vos données sont protégées par un cryptage SSL 256 bits",
      confirm: "Confirmer la Réservation",
      confirmDeposit: "Payer l'Acompte : ",
      totalService: "Total du Service : ",
      back: "Retour",
      payFullQuestion: "Voulez-vous tout payer maintenant ?",
      totalToPayNow: "Total à payer maintenant",
      deposit10: "acompte de 10%",
      balanceOnServiceDay: "Solde le jour du service",
      surchargeNotes: "* Supplément nuit (21:00 - 06:00) : +5€. Bagages volumineux (plus de 3 valises de 23Kg) : +10€. Ils s'appliqueront automatiquement à votre réservation le cas échéant.",
      paymentExplanation: "Vous pouvez payer en toute sécurité par carte ou PayPal. Si vous préférez, cochez \"Voulez-vous tout payer maintenant ?\" pour régler 100%. Sinon, un acompte de 10% sera facturé et le reste sera payé le jour du service.",
      processing: "Traitement..."
    }
  }[locale] || {
    title: "Método de Pago",
    subtitle: "Selecciona cómo deseas realizar el depósito para confirmar tu reserva",
    mollie: "Tarjeta de Crédito / Débito",
    paypal: "PayPal",
    cash: "Efectivo al conductor",
    cashNote: "El depósito se cobrará igualmente para confirmar.",
    secure: "Pago 100% Seguro",
    secureNote: "Tus datos están protegidos con encriptación SSL de 256 bits",
    confirm: "Confirmar Reserva",
    confirmDeposit: "Pagar Depósito: ",
    totalService: "Total del servicio: ",
    back: "Volver",
    payFullQuestion: "¿Deseas pagar todo ahora?",
    totalToPayNow: "Total a pagar ahora",
    deposit10: "depósito 10%",
    balanceOnServiceDay: "Saldo el día del servicio",
    surchargeNotes: "* Recargo nocturno (21:00 - 06:00): +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€. Se aplicarán automáticamente a tu reserva si corresponde.",
    paymentExplanation: "Puedes pagar con tarjeta o PayPal de forma segura. Si prefieres, marca \"¿Deseas pagar todo ahora?\" para abonar el 100%. En caso contrario, se cobrará el depósito del 10% y el resto se paga el día del servicio.",
    processing: "Procesando..."
  };

  const methods = [
    { id: "mollie", name: texts.mollie, icon: CreditCard, description: "Visa, Mastercard, Amex" },
    { id: "paypal", name: texts.paypal, icon: Wallet, description: "PayPal account or card" },
    { id: "cash", name: texts.cash, icon: Landmark, description: texts.cashNote },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#4A0E0E]">{texts.title}</h2>
        <p className="text-muted-foreground">{texts.subtitle}</p>
      </div>

      <div className="grid gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;
          return (
            <Card
              key={method.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                isSelected ? "border-[#4A0E0E] bg-[#4A0E0E]/5" : "border-transparent hover:border-[#4A0E0E]/20"
              )}
              onClick={() => setSelectedMethod(method.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={cn(
                  "p-3 rounded-full",
                  isSelected ? "bg-[#4A0E0E] text-white" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <p className="font-bold">{method.name}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
                {isSelected && (
                  <Badge className="bg-[#4A0E0E]">Seleccionado</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-[#4A0E0E]/5 p-6 rounded-xl border border-[#4A0E0E]/10 space-y-4">
        <div className="flex items-center space-x-3 mb-4 bg-white p-4 rounded-lg border border-[#4A0E0E]/20">
          <input 
            type="checkbox" 
            id="payFull" 
            className="w-5 h-5 text-[#4A0E0E] rounded border-gray-300 focus:ring-[#4A0E0E]"
            checked={payFullAmount}
            onChange={(e) => setPayFullAmount(e.target.checked)}
          />
          <label htmlFor="payFull" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
            {texts.payFullQuestion}
          </label>
        </div>

        <div className="text-sm space-y-2">
           <div className="flex justify-between">
              <span>{texts.totalToPayNow} ({payFullAmount ? '100%' : texts.deposit10})</span>
              <span className="font-bold">{payFullAmount ? total : deposit}€</span>
           </div>
           {!payFullAmount && (
             <div className="flex justify-between text-muted-foreground">
                <span>{texts.balanceOnServiceDay}</span>
                <span>{total - deposit}€</span>
             </div>
           )}
        </div>

        <div className="bg-[#4A0E0E]/5 p-4 rounded-xl border border-[#4A0E0E]/10">
          <p className="text-xs text-muted-foreground">
            {texts.surchargeNotes}
          </p>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          {texts.paymentExplanation}
        </p>

        <div className="flex items-center gap-3 text-[#4A0E0E] mt-4 pt-4 border-t border-[#4A0E0E]/10">
          <ShieldCheck className="w-6 h-6" />
          <div>
            <p className="font-bold text-sm">{texts.secure}</p>
            <p className="text-[10px] uppercase opacity-70">{texts.secureNote}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          className="h-12 border-[#4A0E0E] text-[#4A0E0E] hover:bg-[#4A0E0E]/5 text-lg font-bold flex-1"
        >
          <ArrowLeft className="mr-2 w-5 h-5" />
          {texts.back}
        </Button>
        <Button
          onClick={() => onConfirm(selectedMethod, payFullAmount)}
          disabled={isProcessing}
          className="h-12 bg-[#4A0E0E] hover:bg-[#3A0B0B] text-white text-lg font-bold flex-[2] relative overflow-hidden"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {texts.processing}
            </span>
          ) : (
            <div className="flex flex-col items-center leading-tight py-1">
              <span className="text-sm">{texts.confirm} ({payFullAmount ? total : deposit}€)</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
