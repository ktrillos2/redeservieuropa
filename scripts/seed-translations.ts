import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Leer el archivo JSON
const esData = JSON.parse(
  readFileSync(resolve(process.cwd(), 'locales/es.json'), 'utf-8')
)

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function seedTranslations() {
  console.log('🌍 Eliminando documentos antiguos y creando nuevos...\n')

  // Primero eliminar documentos antiguos
  try {
    console.log('🗑️  Eliminando documentos antiguos de traducciones...')
    await client.delete({ query: '*[_type == "translation"]' })
    console.log('   ✅ Documentos antiguos eliminados\n')
  } catch (error) {
    console.log('   ⚠️  No había documentos antiguos o error al eliminar:', error)
  }

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ]

  // Datos en español (base)
  const esTranslations = {
    header: {
      services: 'Servicios',
      tours: 'Tours',
      transfers: 'Traslados',
      events: 'Eventos',
      testimonials: 'Testimonios',
      contact: 'Contacto',
      cart: 'Mi Cotización',
    },
    footer: {
      about: 'Sobre nosotros',
      services: 'Servicios',
      contact: 'Contacto',
      legal: 'Legal',
      privacy: 'Política de privacidad',
      terms: 'Términos y condiciones',
      cookies: 'Política de cookies',
      copyright: '© 2025 Redeservi Europa. Todos los derechos reservados.',
    },
    home: {
      hero: {
        title: 'Descubre Europa con Comodidad',
        subtitle: 'Tours privados y transfers de alta calidad',
        cta: 'Explorar servicios',
      },
      services: {
        title: 'Nuestros Servicios',
        subtitle: 'Experiencias personalizadas para tu viaje',
      },
      testimonials: {
        title: 'Lo que dicen nuestros clientes',
        subtitle: 'Experiencias reales de viajeros satisfechos',
      },
      contact: {
        title: 'Contáctanos',
        subtitle: 'Estamos aquí para ayudarte',
        name: 'Nombre',
        email: 'Correo electrónico',
        phone: 'Teléfono',
        message: 'Mensaje',
        send: 'Enviar mensaje',
        success: 'Mensaje enviado correctamente',
        error: 'Error al enviar el mensaje',
      },
    },
    checkout: {
      title: 'Finalizar Reserva',
      summary: 'Resumen de tu reserva',
      contact: {
        title: 'Información de contacto',
        name: 'Nombre completo',
        namePlaceholder: 'Ej: Juan Pérez',
        email: 'Correo electrónico',
        emailPlaceholder: 'tu@email.com',
        phone: 'Teléfono',
        phonePlaceholder: '+34 600 000 000',
        referral: '¿Cómo nos conociste?',
      },
      service: {
        type: 'Tipo',
        date: 'Fecha',
        time: 'Hora',
        passengers: 'Pasajeros',
        children: 'Niños',
        childrenAges: 'Edades de los niños',
        pickup: 'Recogida',
        dropoff: 'Destino',
        flight: 'Número de vuelo',
        luggage23kg: 'Maletas 23kg',
        luggage10kg: 'Maletas 10kg',
        notes: 'Notas adicionales',
        total: 'Total del servicio',
        deposit: 'Pagar ahora',
        remaining: 'Saldo pendiente',
        edit: 'Editar servicio',
        remove: 'Eliminar servicio',
      },
      payment: {
        title: 'Método de pago',
        method: 'Selecciona método de pago',
        total: 'Total a pagar',
        depositInfo: 'Pagas el {{percent}}% ahora, el resto se paga en destino',
        processing: 'Procesando pago...',
        continue: 'Continuar al pago',
      },
      cart: {
        empty: 'Tu carrito está vacío',
        addService: 'Añadir servicio',
        total: 'Total',
      },
    },
    thanks: {
      title: '¡Gracias por tu reserva!',
      titlePending: 'Pago pendiente',
      description: 'Hemos recibido tu pago correctamente. En breve recibirás un correo con los detalles de tu reserva.',
      descriptionPending: 'Si cerraste el checkout o el pago aún está en proceso, te contactaremos para confirmar el estado.',
      payment: {
        title: 'Pago',
        provider: 'Proveedor',
        status: 'Estado',
        amountPaid: 'Importe pagado',
        amountTotal: 'Importe total',
        currency: 'Moneda',
        method: 'Método solicitado',
        reference: 'Referencia',
      },
      contact: {
        title: 'Contacto',
        name: 'Nombre',
        phone: 'Teléfono',
        email: 'Email',
        referral: '¿Dónde nos conociste?',
      },
      services: {
        title: 'Servicios contratados',
        type: 'Tipo',
        date: 'Fecha',
        time: 'Hora',
        passengers: 'Pasajeros',
        children: 'Niños',
        childrenAges: 'Edades de los niños',
        pickup: 'Recogida',
        dropoff: 'Destino',
        flight: 'Vuelo',
        luggage23kg: 'Maletas 23kg',
        luggage10kg: 'Maletas 10kg',
        notes: 'Notas',
        total: 'Total del servicio',
        paid: 'Pagado ahora ({{percent}}%)',
        remaining: 'Saldo pendiente',
      },
      backToHome: 'Volver al inicio',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      close: 'Cerrar',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      edit: 'Editar',
      delete: 'Eliminar',
      search: 'Buscar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      submit: 'Enviar',
      yes: 'Sí',
      no: 'No',
    },
  }

  // Datos en inglés (traducidos)
  const enTranslations = {
    header: {
      services: 'Services',
      tours: 'Tours',
      transfers: 'Transfers',
      events: 'Events',
      testimonials: 'Testimonials',
      contact: 'Contact',
      cart: 'My Quote',
    },
    footer: {
      about: 'About us',
      services: 'Services',
      contact: 'Contact',
      legal: 'Legal',
      privacy: 'Privacy policy',
      terms: 'Terms and conditions',
      cookies: 'Cookie policy',
      copyright: '© 2025 Redeservi Europa. All rights reserved.',
    },
    home: {
      hero: {
        title: 'Discover Europe in Comfort',
        subtitle: 'Private tours and high-quality transfers',
        cta: 'Explore services',
      },
      services: {
        title: 'Our Services',
        subtitle: 'Personalized experiences for your journey',
      },
      testimonials: {
        title: 'What our clients say',
        subtitle: 'Real experiences from satisfied travelers',
      },
      contact: {
        title: 'Contact Us',
        subtitle: "We're here to help you",
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        message: 'Message',
        send: 'Send message',
        success: 'Message sent successfully',
        error: 'Error sending message',
      },
    },
    checkout: {
      title: 'Complete Booking',
      summary: 'Your booking summary',
      contact: {
        title: 'Contact information',
        name: 'Full name',
        namePlaceholder: 'E.g: John Doe',
        email: 'Email',
        emailPlaceholder: 'your@email.com',
        phone: 'Phone',
        phonePlaceholder: '+34 600 000 000',
        referral: 'How did you hear about us?',
      },
      service: {
        type: 'Type',
        date: 'Date',
        time: 'Time',
        passengers: 'Passengers',
        children: 'Children',
        childrenAges: "Children's ages",
        pickup: 'Pickup',
        dropoff: 'Drop-off',
        flight: 'Flight number',
        luggage23kg: 'Luggage 23kg',
        luggage10kg: 'Luggage 10kg',
        notes: 'Additional notes',
        total: 'Service total',
        deposit: 'Pay now',
        remaining: 'Remaining balance',
        edit: 'Edit service',
        remove: 'Remove service',
      },
      payment: {
        title: 'Payment method',
        method: 'Select payment method',
        total: 'Total to pay',
        depositInfo: 'You pay {{percent}}% now, the rest is paid at destination',
        processing: 'Processing payment...',
        continue: 'Continue to payment',
      },
      cart: {
        empty: 'Your cart is empty',
        addService: 'Add service',
        total: 'Total',
      },
    },
    thanks: {
      title: 'Thank you for your booking!',
      titlePending: 'Payment pending',
      description: 'We have received your payment successfully. You will receive an email shortly with your booking details.',
      descriptionPending: 'If you closed the checkout or the payment is still processing, we will contact you to confirm the status.',
      payment: {
        title: 'Payment',
        provider: 'Provider',
        status: 'Status',
        amountPaid: 'Amount paid',
        amountTotal: 'Total amount',
        currency: 'Currency',
        method: 'Requested method',
        reference: 'Reference',
      },
      contact: {
        title: 'Contact',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        referral: 'How did you find us?',
      },
      services: {
        title: 'Booked services',
        type: 'Type',
        date: 'Date',
        time: 'Time',
        passengers: 'Passengers',
        children: 'Children',
        childrenAges: "Children's ages",
        pickup: 'Pickup',
        dropoff: 'Drop-off',
        flight: 'Flight',
        luggage23kg: 'Luggage 23kg',
        luggage10kg: 'Luggage 10kg',
        notes: 'Notes',
        total: 'Service total',
        paid: 'Paid now ({{percent}}%)',
        remaining: 'Remaining balance',
      },
      backToHome: 'Back to home',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      yes: 'Yes',
      no: 'No',
    },
  }

  // Datos en francés (traducidos)
  const frTranslations = {
    header: {
      services: 'Services',
      tours: 'Tours',
      transfers: 'Transferts',
      events: 'Événements',
      testimonials: 'Témoignages',
      contact: 'Contact',
      cart: 'Mon Devis',
    },
    footer: {
      about: 'À propos',
      services: 'Services',
      contact: 'Contact',
      legal: 'Mentions légales',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions générales',
      cookies: 'Politique des cookies',
      copyright: '© 2025 Redeservi Europa. Tous droits réservés.',
    },
    home: {
      hero: {
        title: 'Découvrez l\'Europe en Confort',
        subtitle: 'Tours privés et transferts de haute qualité',
        cta: 'Explorer les services',
      },
      services: {
        title: 'Nos Services',
        subtitle: 'Expériences personnalisées pour votre voyage',
      },
      testimonials: {
        title: 'Ce que disent nos clients',
        subtitle: 'Expériences réelles de voyageurs satisfaits',
      },
      contact: {
        title: 'Contactez-nous',
        subtitle: 'Nous sommes là pour vous aider',
        name: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        message: 'Message',
        send: 'Envoyer le message',
        success: 'Message envoyé avec succès',
        error: 'Erreur lors de l\'envoi du message',
      },
    },
    checkout: {
      title: 'Finaliser la Réservation',
      summary: 'Résumé de votre réservation',
      contact: {
        title: 'Informations de contact',
        name: 'Nom complet',
        namePlaceholder: 'Ex: Jean Dupont',
        email: 'Email',
        emailPlaceholder: 'votre@email.com',
        phone: 'Téléphone',
        phonePlaceholder: '+34 600 000 000',
        referral: 'Comment nous avez-vous connu?',
      },
      service: {
        type: 'Type',
        date: 'Date',
        time: 'Heure',
        passengers: 'Passagers',
        children: 'Enfants',
        childrenAges: 'Âges des enfants',
        pickup: 'Prise en charge',
        dropoff: 'Destination',
        flight: 'Numéro de vol',
        luggage23kg: 'Bagages 23kg',
        luggage10kg: 'Bagages 10kg',
        notes: 'Notes supplémentaires',
        total: 'Total du service',
        deposit: 'Payer maintenant',
        remaining: 'Solde restant',
        edit: 'Modifier le service',
        remove: 'Supprimer le service',
      },
      payment: {
        title: 'Méthode de paiement',
        method: 'Sélectionner la méthode de paiement',
        total: 'Total à payer',
        depositInfo: 'Vous payez {{percent}}% maintenant, le reste est payé à destination',
        processing: 'Traitement du paiement...',
        continue: 'Continuer vers le paiement',
      },
      cart: {
        empty: 'Votre panier est vide',
        addService: 'Ajouter un service',
        total: 'Total',
      },
    },
    thanks: {
      title: 'Merci pour votre réservation!',
      titlePending: 'Paiement en attente',
      description: 'Nous avons bien reçu votre paiement. Vous recevrez bientôt un email avec les détails de votre réservation.',
      descriptionPending: 'Si vous avez fermé le paiement ou si le paiement est en cours, nous vous contacterons pour confirmer le statut.',
      payment: {
        title: 'Paiement',
        provider: 'Fournisseur',
        status: 'Statut',
        amountPaid: 'Montant payé',
        amountTotal: 'Montant total',
        currency: 'Devise',
        method: 'Méthode demandée',
        reference: 'Référence',
      },
      contact: {
        title: 'Contact',
        name: 'Nom',
        phone: 'Téléphone',
        email: 'Email',
        referral: 'Comment nous avez-vous trouvé?',
      },
      services: {
        title: 'Services réservés',
        type: 'Type',
        date: 'Date',
        time: 'Heure',
        passengers: 'Passagers',
        children: 'Enfants',
        childrenAges: 'Âges des enfants',
        pickup: 'Prise en charge',
        dropoff: 'Destination',
        flight: 'Vol',
        luggage23kg: 'Bagages 23kg',
        luggage10kg: 'Bagages 10kg',
        notes: 'Notes',
        total: 'Total du service',
        paid: 'Payé maintenant ({{percent}}%)',
        remaining: 'Solde restant',
      },
      backToHome: 'Retour à l\'accueil',
    },
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      close: 'Fermer',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      edit: 'Modifier',
      delete: 'Supprimer',
      search: 'Rechercher',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      submit: 'Envoyer',
      yes: 'Oui',
      no: 'Non',
    },
  }

  // Crear documentos con las traducciones correspondientes
  const translationsData = {
    es: esTranslations,
    en: enTranslations,
    fr: frTranslations,
  }

  for (const lang of languages) {
    try {
      console.log(`${lang.flag} Creando documento para ${lang.name}...`)

      const doc = {
        _type: 'translation',
        _id: `translation-${lang.code}`,
        language: lang.code,
        ...translationsData[lang.code as keyof typeof translationsData],
      }

      await client.createOrReplace(doc)
      console.log(`   ✅ Documento ${lang.code} creado con todas las traducciones\n`)
    } catch (error) {
      console.error(`   ❌ Error creando documento ${lang.code}:`, error)
    }
  }

  console.log('✨ Importación completada!\n')
  console.log('📝 Todos los idiomas han sido creados con sus traducciones completas')
  console.log('   🇪🇸 Español - Completo')
  console.log('   🇬🇧 English - Completo')
  console.log('   🇫🇷 Français - Completo\n')
  console.log('🎯 Ahora puedes editar las traducciones en Sanity Studio si lo deseas')
  console.log('   http://localhost:3000/admin\n')
}

// Ejecutar
seedTranslations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error fatal:', err)
    process.exit(1)
  })
