"use client"

import { useState } from "react"
import { Star, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTranslation } from "@/contexts/i18n-context"

export function TestimonialFormModal() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  
  const { toast } = useToast()
  const { locale } = useTranslation()

  // Traducciones básicas
  const t = {
    es: {
      button: "Dejar un testimonio",
      title: "Cuéntanos tu experiencia",
      desc: "Tu opinión es muy importante para nosotros y ayuda a otros viajeros a elegir el mejor servicio.",
      name: "Nombre completo",
      location: "Ubicación (Ej: Madrid, España)",
      service: "Servicio utilizado (Ej: Traslado CDG → París)",
      rating: "Puntuación",
      comment: "Tu comentario",
      submit: "Enviar Testimonio",
      submitting: "Enviando...",
      success: "Gracias por dejarnos tu comentario",
      successDesc: "Lo hemos recibido exitosamente y aparecerá en la web pronto.",
      error: "Hubo un error",
      errorDesc: "Por favor, inténtalo de nuevo más tarde."
    },
    en: {
      button: "Leave a review",
      title: "Tell us about your experience",
      desc: "Your opinion is very important to us and helps other travelers choose the best service.",
      name: "Full name",
      location: "Location (e.g. London, UK)",
      service: "Service used (e.g. Transfer CDG → Paris)",
      rating: "Rating",
      comment: "Your comment",
      submit: "Submit Review",
      submitting: "Submitting...",
      success: "Thank you for leaving your comment",
      successDesc: "We have successfully received it and it will appear on the website soon.",
      error: "There was an error",
      errorDesc: "Please try again later."
    },
    fr: {
      button: "Laissez un avis",
      title: "Racontez-nous votre expérience",
      desc: "Votre avis est très important pour nous et aide d'autres voyageurs à choisir le meilleur service.",
      name: "Nom complet",
      location: "Emplacement (ex: Paris, France)",
      service: "Service utilisé (ex: Transfert CDG → Paris)",
      rating: "Évaluation",
      comment: "Votre commentaire",
      submit: "Envoyer l'avis",
      submitting: "Envoi en cours...",
      success: "Merci de nous avoir laissé votre commentaire",
      successDesc: "Nous l'avons bien reçu et il apparaîtra bientôt sur le site.",
      error: "Il y a eu une erreur",
      errorDesc: "Veuillez réessayer plus tard."
    }
  }

  const currentT = t[locale as keyof typeof t] || t.es

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name"),
      location: formData.get("location"),
      service: formData.get("service"),
      rating,
      comment: formData.get("comment"),
    }

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to submit')
      }

      toast({
        title: currentT.success,
        description: currentT.successDesc,
      })
      
      setOpen(false)
    } catch (error) {
      toast({
        title: currentT.error,
        description: currentT.errorDesc,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md gap-2 rounded-full px-6 transition-all hover:scale-105">
          <MessageSquare className="w-4 h-4" />
          {currentT.button}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-primary">{currentT.title}</DialogTitle>
          <DialogDescription>
            {currentT.desc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{currentT.name} <span className="text-destructive">*</span></Label>
            <Input id="name" name="name" required placeholder="Ej: Carlos Rodríguez" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">{currentT.location}</Label>
              <Input id="location" name="location" placeholder="Ej: Bogotá, Colombia" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">{currentT.service}</Label>
              <Input id="service" name="service" placeholder="Ej: Aeropuerto CDG" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{currentT.rating} <span className="text-destructive">*</span></Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating) 
                        ? "fill-accent text-accent" 
                        : "text-muted-foreground/30"
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">{currentT.comment} <span className="text-destructive">*</span></Label>
            <Textarea 
              id="comment" 
              name="comment" 
              required 
              rows={4} 
              className="resize-none"
              placeholder="¿Cómo fue tu experiencia con nuestro servicio?"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? currentT.submitting : currentT.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
