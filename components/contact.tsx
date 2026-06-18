"use client"
import { AnimatedSection } from "@/components/animated-section"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactFormSchema, type ContactFormValues } from '@/lib/validation'
// Eliminado toast de validación por solicitud: solo errores inline
import { client } from "@/sanity/lib/client"
import { GENERAL_INFO_QUERY, CONTACT_SECTION_QUERY } from "@/sanity/lib/queries"
import { useTranslation } from "@/contexts/i18n-context"

export function Contact() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { nombre: '', email: '', telefono: '', mensaje: '' }
  })
  const [gi, setGi] = useState<any | null>(null)
  const [section, setSection] = useState<any | null>(null)
  const { locale } = useTranslation()

  // Traducciones estáticas locales (solo para elementos de UI que no vienen de Sanity)
  const staticTexts = useMemo(() => {
    const texts = {
      es: {
        phone: 'Teléfono',
        available247: '24/7 disponible',
        email: 'Email',
        quickResponse: 'Respuesta rápida',
        location: 'Ubicación',
        allRegion: 'Toda la región',
        schedule: 'Horarios',
        allDays: 'Todos los días',
        nameLabel: 'Nombre',
        namePlaceholder: 'Tu nombre completo',
        phoneLabel: 'Teléfono *',
        emailLabel: 'Email',
        emailPlaceholder: 'tu@email.com',
        messageLabel: 'Mensaje',
        messagePlaceholder: 'Cuéntanos sobre tu viaje o consulta...',
        sending: 'Enviando...',
        sendMessage: 'Enviar Mensaje',
        sentSuccessfully: 'Enviado correctamente.',
      },
      en: {
        phone: 'Phone',
        available247: '24/7 available',
        email: 'Email',
        quickResponse: 'Quick response',
        location: 'Location',
        allRegion: 'All region',
        schedule: 'Schedule',
        allDays: 'Every day',
        nameLabel: 'Name',
        namePlaceholder: 'Your full name',
        phoneLabel: 'Phone *',
        emailLabel: 'Email',
        emailPlaceholder: 'your@email.com',
        messageLabel: 'Message',
        messagePlaceholder: 'Tell us about your trip or inquiry...',
        sending: 'Sending...',
        sendMessage: 'Send Message',
        sentSuccessfully: 'Sent successfully.',
      },
      fr: {
        phone: 'Téléphone',
        available247: '24/7 disponible',
        email: 'Email',
        quickResponse: 'Réponse rapide',
        location: 'Localisation',
        allRegion: 'Toute la région',
        schedule: 'Horaires',
        allDays: 'Tous les jours',
        nameLabel: 'Nom',
        namePlaceholder: 'Votre nom complet',
        phoneLabel: 'Téléphone *',
        emailLabel: 'Email',
        emailPlaceholder: 'votre@email.com',
        messageLabel: 'Message',
        messagePlaceholder: 'Parlez-nous de votre voyage ou demande...',
        sending: 'Envoi...',
        sendMessage: 'Envoyer le Message',
        sentSuccessfully: 'Envoyé avec succès.',
      },
    }
    return texts[locale] || texts.es
  }, [locale])

  // Aplicar traducciones de Sanity según el idioma
  const translatedSection = useMemo(() => {
    if (!section) return null
    if (locale === 'es') return section
    
    const translation = locale === 'en' ? section.translations?.en : section.translations?.fr
    if (!translation) return section
    
    return {
      ...section,
      title: translation.title || section.title,
      subtitle: translation.subtitle || section.subtitle,
      formTitle: translation.formTitle || section.formTitle,
      formNote: translation.formNote || section.formNote,
    }
  }, [locale, section])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [g, s] = await Promise.all([
          client.fetch(GENERAL_INFO_QUERY),
          client.fetch(CONTACT_SECTION_QUERY),
        ])
        if (!mounted) return
        console.log("[Contact] Datos cargados desde Sanity para locale:", locale)
        console.log("[Contact] Section:", s)
        console.log("[Contact] Translations disponibles:", s?.translations)
        setGi(g)
        setSection(s)
      } catch (e) {
        console.warn('[Contact] No se pudo cargar información desde Sanity, usando fallback local.')
      }
    })()
    return () => { mounted = false }
  }, [locale])

  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const onSubmit = async (values: ContactFormValues) => {
    setErrorMsg(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || `Error ${res.status}`)
      }
      setSubmitted(true)
      form.reset()
    } catch (e: any) {
      setErrorMsg(e?.message || 'No se pudo enviar el mensaje. Inténtalo nuevamente.')
    }
  }

  return (
    <section id="contacto" className="py-24 relative overflow-hidden bg-background">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 max-w-7xl">
        <AnimatedSection animation="fade-up" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance text-primary font-display flex items-center justify-center gap-3">
            <span className="w-8 h-[1px] bg-accent"></span>
            {translatedSection?.title || 'Contáctanos'}
            <span className="w-8 h-[1px] bg-accent"></span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto text-pretty text-muted-foreground">
            {translatedSection?.subtitle || 'Estamos disponibles 24/7 para atender tus consultas y reservas.'}
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Contact Info */}
          <AnimatedSection animation="fade-up" delay={200} className="lg:col-span-2 space-y-8">
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-primary/10 to-transparent">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl" />
              <div className="relative bg-card/80 backdrop-blur-xl p-8 rounded-[15px] space-y-8 shadow-sm">
                
                <div className="flex flex-col gap-6">
                  {/* Phone */}
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">{staticTexts.phone}</h3>
                      <p className="text-primary font-display text-xl mb-1">{gi?.contact?.phone || '+33 1 23 45 67 89'}</p>
                      <p className="text-sm text-muted-foreground">{staticTexts.available247}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">{staticTexts.email}</h3>
                      <p className="text-primary font-medium text-base mb-1 break-all">{gi?.contact?.email || 'info@redeservi.paris'}</p>
                      <p className="text-sm text-muted-foreground">{staticTexts.quickResponse}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">{staticTexts.location}</h3>
                      <p className="text-primary font-medium text-base mb-1">{gi?.contact?.address || 'París, Francia'}</p>
                      <p className="text-sm text-muted-foreground">{staticTexts.allRegion}</p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-start gap-4 group">
                    <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">{staticTexts.schedule}</h3>
                      <p className="text-primary font-medium text-base mb-1">24/7</p>
                      <p className="text-sm text-muted-foreground">{staticTexts.allDays}</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </AnimatedSection>

          {/* Right Column: Form */}
          <AnimatedSection animation="fade-up" delay={400} className="lg:col-span-3">
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-accent/30 via-primary/10 to-transparent shadow-lg group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500 rounded-2xl" />
              <div className="relative bg-card/95 backdrop-blur-2xl p-8 md:p-10 rounded-[15px]">
                
                <div className="mb-8 flex items-center gap-4 border-b border-border/50 pb-6">
                  <div className="p-3 bg-accent/10 rounded-full text-accent shrink-0">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-display">
                    {translatedSection?.formTitle || 'Envíanos un Mensaje'}
                  </h3>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">{staticTexts.nameLabel}</label>
                      <Input
                        placeholder={staticTexts.namePlaceholder}
                        {...form.register('nombre')}
                        className="bg-background/50 border-border/50 focus:bg-background focus:border-accent transition-all duration-300 h-12"
                        aria-invalid={!!form.formState.errors.nombre}
                      />
                      {form.formState.errors.nombre && (
                        <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">{staticTexts.phoneLabel}</label>
                      <Input
                        placeholder="+33 1 23 45 67 89"
                        {...form.register('telefono')}
                        className="bg-background/50 border-border/50 focus:bg-background focus:border-accent transition-all duration-300 h-12"
                        aria-invalid={!!form.formState.errors.telefono}
                      />
                      {form.formState.errors.telefono && (
                        <p className="text-xs text-destructive">{form.formState.errors.telefono.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">{staticTexts.emailLabel}</label>
                    <Input
                      type="email"
                      placeholder={staticTexts.emailPlaceholder}
                      {...form.register('email')}
                      className="bg-background/50 border-border/50 focus:bg-background focus:border-accent transition-all duration-300 h-12"
                      aria-invalid={!!form.formState.errors.email}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/80 tracking-wide uppercase">{staticTexts.messageLabel}</label>
                    <Textarea
                      placeholder={staticTexts.messagePlaceholder}
                      rows={4}
                      {...form.register('mensaje')}
                      className="bg-background/50 border-border/50 focus:bg-background focus:border-accent transition-all duration-300 resize-none p-4"
                      aria-invalid={!!form.formState.errors.mensaje}
                    />
                    {form.formState.errors.mensaje && (
                      <p className="text-xs text-destructive">{form.formState.errors.mensaje.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transform hover:-translate-y-1 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:hover:translate-y-0"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting ? staticTexts.sending : staticTexts.sendMessage}
                    </Button>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm text-center font-medium">
                      {errorMsg}
                    </div>
                  )}
                  {submitted && !Object.keys(form.formState.errors).length && (
                    <div className="p-4 bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl text-sm text-center font-medium">
                      {staticTexts.sentSuccessfully}
                    </div>
                  )}

                  {section?.showWhatsAppButton && gi?.contact?.whatsapp && (
                    <>
                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground font-medium">O usa</span>
                        </div>
                      </div>
                      <a
                        className="inline-flex w-full"
                        href={`https://wa.me/${gi.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(gi.defaultWhatsAppMessage || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button type="button" variant="outline" className="w-full h-14 text-base font-medium flex items-center gap-3 border-accent/20 hover:bg-accent/5 hover:text-accent transition-all duration-300">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                          </svg>
                          WhatsApp
                        </Button>
                      </a>
                    </>
                  )}
                  
                  <p className="text-[13px] text-muted-foreground text-center mt-4 pt-4 border-t border-border/50">
                    {translatedSection?.formNote || 'Por favor, asegúrate de completar todos tus datos para que podamos contactarte.'}
                  </p>
                </form>

              </div>
            </div>
          </AnimatedSection>

        </div>
      </div>
    </section>
  )
}
