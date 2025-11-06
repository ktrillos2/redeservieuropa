/**
 * Script para COMPLETAR traducciones EN/FR de TODOS los campos de los traslados
 * Incluye: from, to, briefInfo, description
 */

import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Traducciones de ubicaciones comunes
const locationTranslations = {
  en: {
    'Aeropuerto Charles de Gaulle (CDG)': 'Charles de Gaulle Airport (CDG)',
    'Aeropuerto ORLY': 'ORLY Airport',
    'Aeropuerto Orly': 'Orly Airport',
    'Aeropuerto de Orly': 'Orly Airport',
    'Aeropuerto Beauvais (BVA)': 'Beauvais Airport (BVA)',
    'París': 'Paris',
    'Parc Disneyland París': 'Disneyland Paris',
    'Disneyland París': 'Disneyland Paris',
    'Disneyland': 'Disneyland',
    'Parc Asterix': 'Parc Asterix',
    'Castillo de Versailles': 'Palace of Versailles',
    'Versailles': 'Versailles',
    'Centro de París': 'Paris City Center',
  },
  fr: {
    'Aeropuerto Charles de Gaulle (CDG)': 'Aéroport Charles de Gaulle (CDG)',
    'Aeropuerto ORLY': 'Aéroport ORLY',
    'Aeropuerto Orly': 'Aéroport Orly',
    'Aeropuerto de Orly': 'Aéroport d\'Orly',
    'Aeropuerto Beauvais (BVA)': 'Aéroport Beauvais (BVA)',
    'París': 'Paris',
    'Parc Disneyland París': 'Disneyland Paris',
    'Disneyland París': 'Disneyland Paris',
    'Disneyland': 'Disneyland',
    'Parc Asterix': 'Parc Astérix',
    'Castillo de Versailles': 'Château de Versailles',
    'Versailles': 'Versailles',
    'Centro de París': 'Centre de Paris',
  }
}

// Traducciones de textos descriptivos comunes
const descriptionTranslations = {
  en: {
    'Servicio puerta a puerta': 'Door-to-door service',
    'Tarifa fija para el trayecto': 'Fixed rate for the journey',
    'Equipaje estándar incluido': 'Standard luggage included',
    'Seguimiento de vuelo incluido': 'Flight tracking included',
    'Traslado privado y cómodo': 'Private and comfortable transfer',
    'Servicio privado puerta a puerta': 'Private door-to-door service',
    'conductor privado': 'private driver',
    'conductor profesional': 'professional driver',
    'conductor profesional bilingüe': 'bilingual professional driver',
    'Recogida puntual': 'Punctual pickup',
    'Recogida puntual en el punto indicado': 'Punctual pickup at the specified location',
    'llegada directa al destino': 'direct arrival at destination',
    'Incluye equipaje estándar y peajes': 'Includes standard luggage and tolls',
    'Aparcamiento de corta estancia incluido cuando aplica': 'Short-term parking included when applicable',
    'Monitoreamos el estado de tu vuelo sin costo adicional': 'We monitor your flight status at no additional cost',
    'el conductor espera con cartel en llegadas': 'the driver waits with a sign at arrivals',
    'recogida con cartel personalizado': 'pickup with personalized sign',
    'asistencia con equipaje': 'luggage assistance',
    'Los precios mostrados son por servicio, no por persona': 'Prices shown are per service, not per person',
    'Incluye recogida en tu hotel o punto de encuentro': 'Includes pickup at your hotel or meeting point',
    'Traslado entre': 'Transfer between',
    'con conductor privado': 'with private driver',
    'Disfruta de un traslado cómodo y puntual': 'Enjoy a comfortable and punctual transfer',
    'desde': 'from',
    'hasta': 'to',
    'con nuestro servicio de conductor privado': 'with our private driver service',
    'el majestuoso': 'the majestic',
  },
  fr: {
    'Servicio puerta a puerta': 'Service porte-à-porte',
    'Tarifa fija para el trayecto': 'Tarif fixe pour le trajet',
    'Equipaje estándar incluido': 'Bagages standards inclus',
    'Seguimiento de vuelo incluido': 'Suivi de vol inclus',
    'Traslado privado y cómodo': 'Transfert privé et confortable',
    'Servicio privado puerta a puerta': 'Service privé porte-à-porte',
    'conductor privado': 'chauffeur privé',
    'conductor profesional': 'chauffeur professionnel',
    'conductor profesional bilingüe': 'chauffeur professionnel bilingue',
    'Recogida puntual': 'Prise en charge ponctuelle',
    'Recogida puntual en el punto indicado': 'Prise en charge ponctuelle au point indiqué',
    'llegada directa al destino': 'arrivée directe à destination',
    'Incluye equipaje estándar y peajes': 'Comprend les bagages standards et les péages',
    'Aparcamiento de corta estancia incluido cuando aplica': 'Stationnement courte durée inclus le cas échéant',
    'Monitoreamos el estado de tu vuelo sin costo adicional': 'Nous surveillons l\'état de votre vol sans frais supplémentaires',
    'el conductor espera con cartel en llegadas': 'le chauffeur attend avec une pancarte aux arrivées',
    'recogida con cartel personalizado': 'prise en charge avec pancarte personnalisée',
    'asistencia con equipaje': 'assistance avec les bagages',
    'Los precios mostrados son por servicio, no por persona': 'Les prix indiqués sont par service, pas par personne',
    'Incluye recogida en tu hotel o punto de encuentro': 'Comprend la prise en charge à votre hôtel ou point de rencontre',
    'Traslado entre': 'Transfert entre',
    'con conductor privado': 'avec chauffeur privé',
    'Disfruta de un traslado cómodo y puntual': 'Profitez d\'un transfert confortable et ponctuel',
    'desde': 'depuis',
    'hasta': 'vers',
    'con nuestro servicio de conductor privado': 'avec notre service de chauffeur privé',
    'el majestuoso': 'le majestueux',
  }
}

function translateLocation(location: string | undefined, locale: 'en' | 'fr'): string | undefined {
  if (!location) return undefined
  const translations = locationTranslations[locale] as Record<string, string>
  return translations[location] || location
}

function translateText(text: string | undefined, locale: 'en' | 'fr'): string | undefined {
  if (!text) return undefined
  
  let translatedText = text
  const translations = descriptionTranslations[locale] as Record<string, string>
  
  // Aplicar todas las traducciones de frases comunes
  for (const [spanish, translation] of Object.entries(translations)) {
    translatedText = translatedText.replace(new RegExp(spanish, 'gi'), translation)
  }
  
  // Traducir ubicaciones en el texto
  const locationTransMap = locationTranslations[locale] as Record<string, string>
  for (const [spanish, translation] of Object.entries(locationTransMap)) {
    translatedText = translatedText.replace(new RegExp(spanish, 'g'), translation)
  }
  
  return translatedText
}

async function main() {
  console.log('🚀 Completando traducciones de TODOS los traslados...\n')

  // Obtener todos los traslados
  const transfers = await client.fetch(`*[_type == "transfers"]{ _id, from, to, briefInfo, description, duration, translations }`)
  
  console.log(`📊 Total de traslados encontrados: ${transfers.length}\n`)
  
  let updated = 0
  let failed = 0

  for (const transfer of transfers) {
    try {
      console.log(`📝 Actualizando traslado: ${transfer.from} → ${transfer.to}`)
      
      // Preparar traducciones completas
      const translations = {
        en: {
          ...(transfer.translations?.en || {}),
          from: translateLocation(transfer.from, 'en'),
          to: translateLocation(transfer.to, 'en'),
          briefInfo: translateText(transfer.briefInfo, 'en'),
          description: translateText(transfer.description, 'en'),
        },
        fr: {
          ...(transfer.translations?.fr || {}),
          from: translateLocation(transfer.from, 'fr'),
          to: translateLocation(transfer.to, 'fr'),
          briefInfo: translateText(transfer.briefInfo, 'fr'),
          description: translateText(transfer.description, 'fr'),
        }
      }
      
      // Actualizar solo el campo translations
      await client
        .patch(transfer._id)
        .set({ translations })
        .commit()
      
      console.log(`✅ Traslado actualizado correctamente\n`)
      updated++
    } catch (error) {
      console.error(`❌ Error actualizando traslado ${transfer._id}:`, error)
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Proceso completado:`)
  console.log(`   ✅ Traslados actualizados: ${updated}`)
  console.log(`   ❌ Traslados con error: ${failed}`)
  console.log(`   📋 Campos traducidos: from, to, briefInfo, description`)
  console.log('='.repeat(50))
}

main().catch(console.error)
