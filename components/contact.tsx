"use client"
import { AnimatedSection } from "@/components/animated-section"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { client } from "@/sanity/lib/client"
import { GENERAL_INFO_QUERY, CONTACT_SECTION_QUERY } from "@/sanity/lib/queries"

export function Contact() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  })
  const [gi, setGi] = useState<any | null>(null)
  const [section, setSection] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [g, s] = await Promise.all([
          client.fetch(GENERAL_INFO_QUERY),
          client.fetch(CONTACT_SECTION_QUERY),
        ])
        if (!mounted) return
        setGi(g)
        setSection(s)
      } catch (e) {
        console.warn('[Contact] No se pudo cargar información desde Sanity, usando fallback local.')
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <section id="contacto" className="py-16 bg-muted/30 relative z-0">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-balance text-primary font-display">{section?.title || 'Contáctanos'}</h2>
          <p className="text-xl max-w-2xl mx-auto text-pretty text-muted-foreground">
            {section?.subtitle || 'Estamos disponibles 24/7 para atender tus consultas y reservas.'}
          </p>
        </AnimatedSection>

        {/* Contact Information Cards - First */}
        <AnimatedSection animation="fade-up" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <Card className="bg-card border-border transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Teléfono</h3>
              </div>
              <p className="font-semibold text-foreground">{gi?.contact?.phone || '+33 1 23 45 67 89'}</p>
              <p className="text-sm text-muted-foreground font-medium">24/7 disponible</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Email</h3>
              </div>
              <p className="font-semibold text-foreground">{gi?.contact?.email || 'info@redeservi.paris'}</p>
              <p className="text-sm text-muted-foreground font-medium">Respuesta rápida</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Ubicación</h3>
              </div>
              <p className="font-semibold text-foreground">{gi?.contact?.address || 'París, Francia'}</p>
              <p className="text-sm text-muted-foreground font-medium">Toda la región</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Horarios</h3>
              </div>
              <p className="font-semibold text-foreground">24/7</p>
              <p className="text-sm text-muted-foreground font-medium">Todos los días</p>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Contact Form - Centered Below */}
        <div className="max-w-2xl mx-auto">
          <AnimatedSection animation="fade-up">
          <Card className="bg-card border-border transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-foreground text-center justify-center font-display">
                <MessageCircle className="w-6 h-6 text-accent" />
                {section?.formTitle || 'Envíanos un Mensaje'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nombre</label>
                    <Input
                      placeholder="Tu nombre completo"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Teléfono</label>
                    <Input
                      placeholder="+33 1 23 45 67 89"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="transform focus:scale-105 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mensaje</label>
                  <Textarea
                    placeholder="Cuéntanos sobre tu viaje o consulta..."
                    rows={3}
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    required
                    className="transform focus:scale-105 transition-all duration-300"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-300"
                  size="lg"
                >
                  Enviar Mensaje
                </Button>
                {section?.showWhatsAppButton && gi?.contact?.whatsapp ? (
                  <a
                    className="mt-3 inline-flex w-full"
                    href={`https://wa.me/${gi.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(gi.defaultWhatsAppMessage || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" className="w-full flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </Button>
                  </a>
                ) : null}
                {section?.formNote ? (
                  <p className="text-xs text-muted-foreground mt-3 text-center">{section.formNote}</p>
                ) : null}
              </form>
            </CardContent>
          </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
