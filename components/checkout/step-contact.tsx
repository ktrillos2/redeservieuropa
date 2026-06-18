"use client";

import { useTranslation } from "@/contexts/i18n-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInputIntl } from "@/components/ui/phone-input";
import { EmailAutocomplete } from "@/components/ui/email-autocomplete";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface StepContactProps {
  data: any;
  updateData: (fields: any) => void;
  onNext: () => void;
  errors: Record<string, string>;
}

export function StepContact({ data, updateData, onNext, errors }: StepContactProps) {
  const { locale } = useTranslation();

  const texts = {
    es: {
      title: "Información de Contacto",
      subtitle: "Ingresa tus datos para mantenerte informado sobre tu reserva",
      name: "Nombre Completo",
      email: "Correo Electrónico",
      phone: "Teléfono de Contacto",
      referral: "¿Cómo nos conociste?",
      next: "Continuar a detalles",
      google: "Google",
      facebook: "Facebook",
      instagram: "Instagram",
      recommendation: "Recomendación",
      other: "Otro",
    },
    en: {
      title: "Contact Information",
      subtitle: "Enter your details to stay informed about your booking",
      name: "Full Name",
      email: "Email Address",
      phone: "Contact Phone",
      referral: "How did you hear about us?",
      next: "Continue to details",
      google: "Google",
      facebook: "Facebook",
      instagram: "Instagram",
      recommendation: "Recommendation",
      other: "Other",
    },
    fr: {
      title: "Informations de Contact",
      subtitle: "Entrez vos coordonnées pour rester informé de votre réservation",
      name: "Nom Complet",
      email: "Adresse Email",
      phone: "Téléphone de Contact",
      referral: "Comment nous avez-vous connu?",
      next: "Continuer vers les détails",
      google: "Google",
      facebook: "Facebook",
      instagram: "Instagram",
      recommendation: "Recommandation",
      other: "Autre",
    }
  }[locale] || {
    title: "Información de Contacto",
    subtitle: "Ingresa tus datos para mantenerte informado sobre tu reserva",
    name: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Teléfono de Contacto",
    referral: "¿Cómo nos conociste?",
    next: "Continuar a detalles",
    google: "Google",
    facebook: "Facebook",
    instagram: "Instagram",
    recommendation: "Recomendación",
    other: "Otro",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-[#4A0E0E]">{texts.title}</h2>
        <p className="text-muted-foreground">{texts.subtitle}</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className={errors.contactName ? "text-destructive" : ""}>
            {texts.name} *
          </Label>
          <Input
            id="name"
            placeholder="Ej: Juan Pérez"
            value={data.contactName || ""}
            onChange={(e) => updateData({ contactName: e.target.value })}
            className={errors.contactName ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
          />
          {errors.contactName && <p className="text-xs text-destructive">{errors.contactName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={errors.contactEmail ? "text-destructive" : ""}>
            {texts.email} *
          </Label>
          <EmailAutocomplete
            value={data.contactEmail || ""}
            onChange={(val) => updateData({ contactEmail: val })}
            className={errors.contactEmail ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
          />
          {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={errors.contactPhone ? "text-destructive" : ""}>
            {texts.phone} *
          </Label>
          <PhoneInputIntl
            value={data.contactPhone || ""}
            onChange={(val) => updateData({ contactPhone: val })}
            className={errors.contactPhone ? "border-destructive focus-visible:ring-destructive" : "border-[#4A0E0E]/20 focus-visible:ring-[#4A0E0E]"}
          />
          {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="referral">{texts.referral}</Label>
          <Select
            value={data.referralSource || ""}
            onValueChange={(val) => updateData({ referralSource: val })}
          >
            <SelectTrigger className="border-[#4A0E0E]/20 focus:ring-[#4A0E0E]">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">{texts.google}</SelectItem>
              <SelectItem value="facebook">{texts.facebook}</SelectItem>
              <SelectItem value="instagram">{texts.instagram}</SelectItem>
              <SelectItem value="recommendation">{texts.recommendation}</SelectItem>
              <SelectItem value="other">{texts.other}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={onNext}
        className="w-full h-12 bg-[#4A0E0E] hover:bg-[#3A0B0B] text-white text-lg font-bold group"
      >
        {texts.next}
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
