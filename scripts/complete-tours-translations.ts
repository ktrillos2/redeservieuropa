/**
 * Script para COMPLETAR traducciones EN/FR de TODOS los campos de los tours
 * Incluye: features, includes, visitedPlaces, amenities, notes, description, overCapacityNote
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

// Traducciones genéricas comunes a todos los tours
const commonTranslations = {
  features: {
    en: {
      'Paradas en puntos icónicos de París': 'Stops at iconic Paris landmarks',
      'Paradas en puntos icónicos (según tráfico)': 'Stops at iconic points (traffic permitting)',
      'Conductor guía profesional': 'Professional driver guide',
      'Conductor ES/EN/FR': 'Driver ES/EN/FR',
      'Vehículo cómodo y amplio': 'Comfortable and spacious vehicle',
      'Vehículo amplio y climatizado': 'Spacious and climate-controlled vehicle',
      'Itinerario optimizado según tráfico': 'Traffic-optimized itinerary',
      'Flexibilidad de horarios': 'Flexible schedules',
      'Paradas para fotos': 'Photo stops',
      'Servicio privado': 'Private service',
      'Salida y regreso a Disneyland': 'Departure and return to Disneyland',
      'Recogida puntual': 'Punctual pickup',
    },
    fr: {
      'Paradas en puntos icónicos de París': 'Arrêts aux monuments emblématiques de Paris',
      'Paradas en puntos icónicos (según tráfico)': 'Arrêts aux points emblématiques (selon le trafic)',
      'Conductor guía profesional': 'Chauffeur guide professionnel',
      'Conductor ES/EN/FR': 'Chauffeur ES/EN/FR',
      'Vehículo cómodo y amplio': 'Véhicule confortable et spacieux',
      'Vehículo amplio y climatizado': 'Véhicule spacieux et climatisé',
      'Itinerario optimizado según tráfico': 'Itinéraire optimisé selon le trafic',
      'Flexibilidad de horarios': 'Horaires flexibles',
      'Paradas para fotos': 'Arrêts photos',
      'Servicio privado': 'Service privé',
      'Salida y regreso a Disneyland': 'Départ et retour à Disneyland',
      'Recogida puntual': 'Prise en charge ponctuelle',
    }
  },
  includes: {
    en: {
      'Peajes y combustible incluidos': 'Tolls and fuel included',
      'Recogida puntual': 'Punctual pickup',
      'Seguro de pasajeros': 'Passenger insurance',
      'Conductor de habla hispana, inglesa o francesa': 'Spanish, English or French speaking driver',
      'Vehículo privado con aire acondicionado': 'Private air-conditioned vehicle',
      'Combustible, peajes y estacionamiento incluidos': 'Fuel, tolls and parking included',
      'Recogida y regreso en el hotel o punto acordado': 'Pickup and return at hotel or agreed point',
    },
    fr: {
      'Peajes y combustible incluidos': 'Péages et carburant inclus',
      'Recogida puntual': 'Prise en charge ponctuelle',
      'Seguro de pasajeros': 'Assurance passagers',
      'Conductor de habla hispana, inglesa o francesa': 'Chauffeur parlant espagnol, anglais ou français',
      'Vehículo privado con aire acondicionado': 'Véhicule privé climatisé',
      'Combustible, peajes y estacionamiento incluidos': 'Carburant, péages et stationnement inclus',
      'Recogida y regreso en el hotel o punto acordado': 'Prise en charge et retour à l\'hôtel ou au point convenu',
    }
  },
  visitedPlaces: {
    en: {
      'Centro de París': 'Paris City Center',
      'Iglesia del Sagrado corazón (Montmartre) ⛪': 'Sacré-Cœur Basilica (Montmartre) ⛪',
      'Cafetería de Ladybug 🐞': 'Ladybug Café 🐞',
      'Molino Rojo': 'Moulin Rouge',
      'Museo de Louvre 🔼': 'Louvre Museum 🔼',
      'Notre Dame de París ⛪': 'Notre-Dame de Paris ⛪',
      'Campos Elíseos y Arco del triunfo ⛩🌅': 'Champs-Élysées & Arc de Triomphe ⛩🌅',
      'Trocadero 🏛': 'Trocadero 🏛',
      'Torre Eiffel 🗼': 'Eiffel Tower 🗼',
    },
    fr: {
      'Centro de París': 'Centre de Paris',
      'Iglesia del Sagrado corazón (Montmartre) ⛪': 'Basilique du Sacré-Cœur (Montmartre) ⛪',
      'Cafetería de Ladybug 🐞': 'Café Ladybug 🐞',
      'Molino Rojo': 'Moulin Rouge',
      'Museo de Louvre 🔼': 'Musée du Louvre 🔼',
      'Notre Dame de París ⛪': 'Notre-Dame de Paris ⛪',
      'Campos Elíseos y Arco del triunfo ⛩🌅': 'Champs-Élysées et Arc de Triomphe ⛩🌅',
      'Trocadero 🏛': 'Trocadéro 🏛',
      'Torre Eiffel 🗼': 'Tour Eiffel 🗼',
    }
  },
  amenities: {
    en: {
      'WiFi gratuito': 'Free WiFi',
      'WiFi de cortesía': 'Complimentary WiFi',
      'Agua de cortesía': 'Complimentary water',
      'Agua a bordo': 'Water on board',
      'Vehículo cómodo': 'Comfortable vehicle',
      'Seguro completo': 'Full insurance',
      'Aire acondicionado': 'Air conditioning',
    },
    fr: {
      'WiFi gratuito': 'WiFi gratuit',
      'WiFi de cortesía': 'WiFi de courtoisie',
      'Agua de cortesía': 'Eau de courtoisie',
      'Agua a bordo': 'Eau à bord',
      'Vehículo cómodo': 'Véhicule confortable',
      'Seguro completo': 'Assurance complète',
      'Aire acondicionado': 'Climatisation',
    }
  },
  notes: {
    en: {
      'Paradas de 15 minutos para fotos en puntos seleccionados': '15-minute photo stops at selected points',
      'Itinerario ajustable según condiciones del tráfico': 'Itinerary adjustable according to traffic conditions',
      'Itinerario y tiempos sujetos al tráfico y a condiciones de seguridad.': 'Itinerary and times subject to traffic and safety conditions.',
      'Servicio privado puerta a puerta': 'Private door-to-door service',
      'No incluye entradas a museos ni monumentos': 'Does not include museum or monument entrance fees',
      'Precios por servicio, no por pasajero.': 'Prices per service, not per passenger.',
    },
    fr: {
      'Paradas de 15 minutos para fotos en puntos seleccionados': 'Arrêts de 15 minutes pour photos aux points sélectionnés',
      'Itinerario ajustable según condiciones del tráfico': 'Itinéraire ajustable selon les conditions de circulation',
      'Itinerario y tiempos sujetos al tráfico y a condiciones de seguridad.': 'Itinéraire et horaires soumis au trafic et aux conditions de sécurité.',
      'Servicio privado puerta a puerta': 'Service privé porte-à-porte',
      'No incluye entradas a museos ni monumentos': 'N\'inclut pas les entrées aux musées ni aux monuments',
      'Precios por servicio, no por pasajero.': 'Prix par service, pas par passager.',
    }
  },
  overCapacityNote: {
    en: {
      'Para más de 5 pasajeros, consultar por Van (8p).': 'For more than 5 passengers, inquire about Van (8p).',
      'Para más de 8 pasajeros, consultar por Van o grupo.': 'For more than 8 passengers, inquire about Van or group.',
    },
    fr: {
      'Para más de 5 pasajeros, consultar por Van (8p).': 'Pour plus de 5 passagers, se renseigner sur le Van (8p).',
      'Para más de 8 pasajeros, consultar por Van o grupo.': 'Pour plus de 8 passagers, se renseigner sur le Van ou groupe.',
    }
  }
}

function translateArray(array: string[] | undefined, locale: 'en' | 'fr'): string[] | undefined {
  if (!array) return undefined
  return array.map(item => {
    // Buscar traducción en cada categoría
    for (const category of Object.values(commonTranslations)) {
      const localeTranslations = category[locale] as Record<string, string>
      if (localeTranslations && localeTranslations[item]) {
        return localeTranslations[item]
      }
    }
    return item // Si no hay traducción, devolver original
  })
}

function translateString(text: string | undefined, locale: 'en' | 'fr'): string | undefined {
  if (!text) return undefined
  // Buscar traducción en overCapacityNote
  const localeTranslations = commonTranslations.overCapacityNote[locale] as Record<string, string>
  if (localeTranslations[text]) {
    return localeTranslations[text]
  }
  return text
}

// Traducciones de description (Portable Text) - textos genéricos comunes
const descriptionTranslations = {
  en: {
    'Disfruta un recorrido cómodo y personalizado': 'Enjoy a comfortable and personalized tour',
    'Disfruta un recorrido panorámico por París': 'Enjoy a panoramic tour of Paris',
    'Te recogemos en': 'We pick you up at',
    'y finalizamos en': 'and finish at',
    'saliendo desde Disneyland y regresando al mismo punto': 'departing from Disneyland and returning to the same point',
    'Ideal para quienes desean conocer los principales atractivos de la ciudad en poco tiempo, con total comodidad y flexibilidad.': 'Ideal for those who want to discover the main attractions of the city in a short time, with total comfort and flexibility.',
    'Hacemos paradas breves para fotos cuando es posible y adaptamos el itinerario a las condiciones de tráfico.': 'We make brief stops for photos when possible and adapt the itinerary to traffic conditions.',
    'Durante el trayecto visitarás monumentos imperdibles como la Torre Eiffel, el Arco del Triunfo, los Campos Elíseos y el Trocadero.': 'During the journey you will visit unmissable monuments such as the Eiffel Tower, the Arc de Triomphe, the Champs-Élysées and the Trocadero.',
    'El servicio es completamente privado, con un conductor profesional que adapta el itinerario según el tráfico y tus preferencias.': 'The service is completely private, with a professional driver who adapts the itinerary according to traffic and your preferences.',
    'Perfecto para familias, grupos pequeños o parejas que buscan una experiencia exclusiva sin preocuparse por el transporte ni el estacionamiento.': 'Perfect for families, small groups or couples looking for an exclusive experience without worrying about transportation or parking.',
    'Incluye: peajes, combustible y tiempo de espera razonable.': 'Includes: tolls, fuel and reasonable waiting time.',
    'Los precios son por servicio (no por persona).': 'Prices are per service (not per person).',
  },
  fr: {
    'Disfruta un recorrido cómodo y personalizado': 'Profitez d\'une visite confortable et personnalisée',
    'Disfruta un recorrido panorámico por París': 'Profitez d\'une visite panoramique de Paris',
    'Te recogemos en': 'Nous vous récupérons à',
    'y finalizamos en': 'et terminons à',
    'saliendo desde Disneyland y regresando al mismo punto': 'au départ de Disneyland et retour au même point',
    'Ideal para quienes desean conocer los principales atractivos de la ciudad en poco tiempo, con total comodidad y flexibilidad.': 'Idéal pour ceux qui souhaitent découvrir les principales attractions de la ville en peu de temps, avec un confort et une flexibilité totale.',
    'Hacemos paradas breves para fotos cuando es posible y adaptamos el itinerario a las condiciones de tráfico.': 'Nous faisons de brefs arrêts pour des photos lorsque c\'est possible et adaptons l\'itinéraire aux conditions de circulation.',
    'Durante el trayecto visitarás monumentos imperdibles como la Torre Eiffel, el Arco del Triunfo, los Campos Elíseos y el Trocadero.': 'Pendant le trajet, vous visiterez des monuments incontournables comme la Tour Eiffel, l\'Arc de Triomphe, les Champs-Élysées et le Trocadéro.',
    'El servicio es completamente privado, con un conductor profesional que adapta el itinerario según el tráfico y tus preferencias.': 'Le service est entièrement privé, avec un chauffeur professionnel qui adapte l\'itinéraire en fonction du trafic et de vos préférences.',
    'Perfecto para familias, grupos pequeños o parejas que buscan una experiencia exclusiva sin preocuparse por el transporte ni el estacionamiento.': 'Parfait pour les familles, les petits groupes ou les couples à la recherche d\'une expérience exclusive sans se soucier du transport ou du stationnement.',
    'Incluye: peajes, combustible y tiempo de espera razonable.': 'Comprend : péages, carburant et temps d\'attente raisonnable.',
    'Los precios son por servicio (no por persona).': 'Les prix sont par service (pas par personne).',
  }
}

function translatePortableText(blocks: any[] | undefined, locale: 'en' | 'fr'): any[] | undefined {
  if (!blocks) return undefined
  
  return blocks.map(block => {
    if (block._type !== 'block') return block
    
    return {
      ...block,
      children: block.children.map((child: any) => {
        if (child._type !== 'span' || !child.text) return child
        
        let translatedText = child.text
        // Aplicar traducciones de frases comunes
        for (const [spanish, translation] of Object.entries(descriptionTranslations[locale])) {
          translatedText = translatedText.replace(spanish, translation)
        }
        
        return {
          ...child,
          text: translatedText
        }
      })
    }
  })
}

async function main() {
  console.log('🚀 Completando traducciones de TODOS los campos de tours...\n')

  // Obtener todos los tours
  const tours = await client.fetch(`*[_type == "tour"]{ _id, features, includes, visitedPlaces, amenities, notes, description, overCapacityNote, translations }`)
  
  let updated = 0
  let failed = 0

  for (const tour of tours) {
    try {
      console.log(`📝 Actualizando tour: ${tour._id}`)
      
      // Preparar traducciones completas
      const translations = {
        en: {
          ...(tour.translations?.en || {}),
          features: translateArray(tour.features, 'en'),
          includes: translateArray(tour.includes, 'en'),
          visitedPlaces: translateArray(tour.visitedPlaces, 'en'),
          amenities: translateArray(tour.amenities, 'en'),
          notes: translateArray(tour.notes, 'en'),
          description: translatePortableText(tour.description, 'en'),
          overCapacityNote: translateString(tour.overCapacityNote, 'en'),
        },
        fr: {
          ...(tour.translations?.fr || {}),
          features: translateArray(tour.features, 'fr'),
          includes: translateArray(tour.includes, 'fr'),
          visitedPlaces: translateArray(tour.visitedPlaces, 'fr'),
          amenities: translateArray(tour.amenities, 'fr'),
          notes: translateArray(tour.notes, 'fr'),
          description: translatePortableText(tour.description, 'fr'),
          overCapacityNote: translateString(tour.overCapacityNote, 'fr'),
        }
      }
      
      // Actualizar solo el campo translations
      await client
        .patch(tour._id)
        .set({ translations })
        .commit()
      
      console.log(`✅ Tour ${tour._id} actualizado con TODOS los campos\n`)
      updated++
    } catch (error) {
      console.error(`❌ Error actualizando tour ${tour._id}:`, error)
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Proceso completado:`)
  console.log(`   ✅ Tours actualizados: ${updated}`)
  console.log(`   ❌ Tours con error: ${failed}`)
  console.log(`   📋 Campos traducidos: features, includes, visitedPlaces, amenities, notes, description, overCapacityNote`)
  console.log('='.repeat(50))
}

main().catch(console.error)
