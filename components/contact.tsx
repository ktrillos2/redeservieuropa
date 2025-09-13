"use client"
import { AnimatedSection } from "@/components/animated-section"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react"
import { useState } from "react"

export function Contact() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
  }

  return (
    <section id="contacto" className="py-16 bg-muted/30 relative z-0">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-balance text-primary">Contáctanos</h2>
          <p className="text-xl max-w-2xl mx-auto text-pretty text-muted-foreground">
            Estamos disponibles 24/7 para atender tus consultas y reservas.
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
              <p className="font-semibold text-foreground">+33 1 23 45 67 89</p>
              <p className="text-sm text-muted-foreground font-medium">24/7 disponible</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Email</h3>
              </div>
              <p className="font-semibold text-foreground">info@redeservi.paris</p>
              <p className="text-sm text-muted-foreground font-medium">Respuesta rápida</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-accent" />
                <h3 className="font-semibold text-foreground">Ubicación</h3>
              </div>
              <p className="font-semibold text-foreground">París, Francia</p>
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
              <CardTitle className="flex items-center gap-3 text-foreground text-center justify-center">
                <MessageCircle className="w-6 h-6 text-accent" />
                Envíanos un Mensaje
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
              </form>
            </CardContent>
          </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
