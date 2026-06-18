/**
 * Script para poblar las traducciones del Hero en Sanity
 * Añade traducciones en inglés y francés al documento hero existente
 */

import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const heroTranslations = {
  en: {
    title: 'Private Transfers and Tours in Paris',
    highlight: 'With Professional Drivers',
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Experience Paris with comfort and style. We offer airport transfers, tours and private transportation services with professional drivers.',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Live Paris worry-free.',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ],
    primaryCta: {
      label: 'Book Now',
    },
    secondaryCta: {
      label: 'View Services',
    },
    bookingForm: {
      title: 'Book Your Service',
      ctaLabel: 'Get Quote',
      typePicker: {
        label: 'Service Type',
        trasladoLabel: 'Transfer',
        tourLabel: 'Tour',
      },
      originField: {
        label: 'Origin',
        placeholder: 'Select origin',
      },
      destinationField: {
        label: 'Destination',
        placeholder: 'Select destination',
        selectOriginFirst: 'Select origin first',
        noDestinations: 'No destinations available',
      },
      dateField: {
        label: 'Date',
        placeholder: 'Select date',
      },
      timeField: {
        label: 'Time',
        placeholder: 'Select time',
      },
      passengersField: {
        label: 'Passengers',
        placeholder: '1',
      },
      childrenField: {
        label: 'Children',
        placeholder: '0',
      },
      vehicleField: {
        label: 'Vehicle',
        placeholder: 'Select: Car, Minivan or Van',
        labelCoche: 'Car (1-3 pax)',
        labelMinivan: 'Minivan (4-6 pax)',
        labelVan: 'Van (7+ pax)',
      },
      tourTypeField: {
        label: 'Tour Type',
        placeholder: 'Select an option',
        cityTour: 'City Tour',
        stopoverTour: 'Stopover Tour',
        dayLabel: 'Day Tour',
        nightLabel: 'Night Tour',
      },
      tourSelectField: {
        label: 'Select Tour',
        placeholder: 'Choose a tour',
      },
      flightNumberField: {
        label: 'Flight Number',
        placeholder: 'Example: AF1234',
        optional: '(optional)',
      },
      luggageField: {
        label23kg: '23kg Luggage',
        label10kg: '10kg Luggage',
      },
      contactFields: {
        name: {
          label: 'Name',
          placeholder: 'Your name',
        },
        phone: {
          label: 'Phone',
          placeholder: '+34 600 000 000',
        },
        email: {
          label: 'Email',
          placeholder: 'your@email.com',
        },
        additionalInfo: {
          label: 'Additional Information',
          placeholder: 'Additional details about your trip...',
        },
      },
      priceDisplay: {
        estimatedPrice: 'Estimated Price',
        from: 'from',
      },
      buttons: {
        quote: 'Get Quote',
        submitting: 'Sending...',
      },
      messages: {
        success: 'Quote sent successfully',
        error: 'Error sending quote',
        fillAllFields: 'Please fill in all fields',
      },
      notes: {
        minivan6: 'Minivan for up to 6 passengers',
        minivan5: 'Minivan for up to 5 passengers with large luggage',
        nightChargeNote: 'Night service (11 PM - 6 AM) has a 30% surcharge',
        surchargeFootnote: '* Prices may vary depending on traffic and specific stops',
      },
    },
  },
  fr: {
    title: 'Transferts et Tours Privés à Paris',
    highlight: 'Avec des Chauffeurs Professionnels',
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Découvrez Paris avec confort et style. Nous proposons des transferts aéroportuaires, des tours et des services de transport privé avec des chauffeurs professionnels.',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Vivez Paris sans soucis.',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ],
    primaryCta: {
      label: 'Réserver Maintenant',
    },
    secondaryCta: {
      label: 'Voir les Services',
    },
    bookingForm: {
      title: 'Réservez Votre Service',
      ctaLabel: 'Obtenir un Devis',
      typePicker: {
        label: 'Type de Service',
        trasladoLabel: 'Transfert',
        tourLabel: 'Tour',
      },
      originField: {
        label: 'Origine',
        placeholder: 'Sélectionnez l\'origine',
      },
      destinationField: {
        label: 'Destination',
        placeholder: 'Sélectionnez la destination',
        selectOriginFirst: 'Sélectionnez d\'abord l\'origine',
        noDestinations: 'Aucune destination disponible',
      },
      dateField: {
        label: 'Date',
        placeholder: 'Sélectionnez la date',
      },
      timeField: {
        label: 'Heure',
        placeholder: 'Sélectionnez l\'heure',
      },
      passengersField: {
        label: 'Passagers',
        placeholder: '1',
      },
      childrenField: {
        label: 'Enfants',
        placeholder: '0',
      },
      vehicleField: {
        label: 'Véhicule',
        placeholder: 'Sélectionnez: Voiture, Minivan ou Van',
        labelCoche: 'Voiture (1-3 pax)',
        labelMinivan: 'Minivan (4-6 pax)',
        labelVan: 'Van (7+ pax)',
      },
      tourTypeField: {
        label: 'Type de Tour',
        placeholder: 'Sélectionnez une option',
        cityTour: 'Tour de Ville',
        stopoverTour: 'Tour d\'Escale',
        dayLabel: 'Tour de Jour',
        nightLabel: 'Tour de Nuit',
      },
      tourSelectField: {
        label: 'Sélectionner un Tour',
        placeholder: 'Choisissez un tour',
      },
      flightNumberField: {
        label: 'Numéro de Vol',
        placeholder: 'Exemple: AF1234',
        optional: '(optionnel)',
      },
      luggageField: {
        label23kg: 'Bagages 23kg',
        label10kg: 'Bagages 10kg',
      },
      contactFields: {
        name: {
          label: 'Nom',
          placeholder: 'Votre nom',
        },
        phone: {
          label: 'Téléphone',
          placeholder: '+34 600 000 000',
        },
        email: {
          label: 'Email',
          placeholder: 'votre@email.com',
        },
        additionalInfo: {
          label: 'Informations Supplémentaires',
          placeholder: 'Détails supplémentaires sur votre voyage...',
        },
      },
      priceDisplay: {
        estimatedPrice: 'Prix Estimé',
        from: 'à partir de',
      },
      buttons: {
        quote: 'Obtenir un Devis',
        submitting: 'Envoi en cours...',
      },
      messages: {
        success: 'Devis envoyé avec succès',
        error: 'Erreur lors de l\'envoi du devis',
        fillAllFields: 'Veuillez remplir tous les champs',
      },
      notes: {
        minivan6: 'Minivan jusqu\'à 6 passagers',
        minivan5: 'Minivan jusqu\'à 5 passagers avec bagages volumineux',
        nightChargeNote: 'Service de nuit (23h - 6h) a un supplément de 30%',
        surchargeFootnote: '* Les prix peuvent varier en fonction du trafic et des arrêts spécifiques',
      },
    },
  },
}

async function seedHeroTranslations() {
  try {
    console.log('🌍 Iniciando seed de traducciones del Hero...')

    // Actualizar el documento hero con las traducciones
    const result = await client
      .patch('hero') // ID del documento hero
      .set({ translations: heroTranslations })
      .commit()

    console.log('✅ Traducciones del Hero actualizadas exitosamente')
    console.log('📦 Documento actualizado:', result._id)
    console.log('🌐 Idiomas añadidos: inglés (en), francés (fr)')
  } catch (error) {
    console.error('❌ Error al actualizar las traducciones del Hero:', error)
    process.exit(1)
  }
}

// Ejecutar el seed
seedHeroTranslations()
  .then(() => {
    console.log('🎉 Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
