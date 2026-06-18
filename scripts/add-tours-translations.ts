/**
 * Script para agregar traducciones EN/FR a todos los tours existentes
 * 
 * Uso:
 *   npx tsx scripts/add-tours-translations.ts
 */

// ⚠️ IMPORTANTE: Cargar variables de entorno ANTES de cualquier otro import
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

// Verificar que las variables estén cargadas
if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  console.error('❌ Error: NEXT_PUBLIC_SANITY_DATASET no está definido en .env.local')
  process.exit(1)
}

console.log('✅ Variables de entorno cargadas correctamente')
console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`)
console.log(`   Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}\n`)

// Crear cliente de Sanity directamente aquí
import { createClient } from 'next-sanity'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// Traducciones manuales por tour (basado en los datos actuales)
const tourTranslations: Record<string, {
  en: {
    title: string
    summary: string
    route: { origin: string; destination: string; circuitName: string }
  }
  fr: {
    title: string
    summary: string
    route: { origin: string; destination: string; circuitName: string }
  }
}> = {
  // Tour 1: Disneyland - París (Tour Eiffel y Arco del Triunfo) - Disneyland
  'Z1HNmuH9VezlITxVO02oNn': {
    en: {
      title: 'Disneyland - Paris (Eiffel Tower & Arc de Triomphe) - Disneyland',
      summary: 'Private tour: Paris (Eiffel Tower & Arc de Triomphe). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Disneyland',
        destination: 'Disneyland',
        circuitName: 'Paris (Eiffel Tower & Arc de Triomphe)'
      }
    },
    fr: {
      title: 'Disneyland - Paris (Tour Eiffel et Arc de Triomphe) - Disneyland',
      summary: 'Tour privé : Paris (Tour Eiffel et Arc de Triomphe). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Disneyland',
        destination: 'Disneyland',
        circuitName: 'Paris (Tour Eiffel et Arc de Triomphe)'
      }
    }
  },

  // Tour 2: Disneyland - París Tour (3 horas) - Aeropuerto CDG u ORLY
  '80chRJ3b7zPbeqV15nF0rS': {
    en: {
      title: 'Disneyland - Paris Tour (3 hours) - CDG or ORLY Airport',
      summary: 'Private tour: Paris Tour (3 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Disneyland',
        destination: 'CDG or ORLY Airport',
        circuitName: 'Paris Tour (3 hours)'
      }
    },
    fr: {
      title: 'Disneyland - Tour de Paris (3 heures) - Aéroport CDG ou ORLY',
      summary: 'Tour privé : Tour de Paris (3 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Disneyland',
        destination: 'Aéroport CDG ou ORLY',
        circuitName: 'Tour de Paris (3 heures)'
      }
    }
  },

  // Tour 3: Disneyland - París Tour (2 horas) - Aeropuerto CDG u ORLY
  'gxyxv316c0oeG6AdOL9UPj': {
    en: {
      title: 'Disneyland - Paris Tour (2 hours) - CDG or ORLY Airport',
      summary: 'Private tour: Paris Tour (2 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Disneyland',
        destination: 'CDG or ORLY Airport',
        circuitName: 'Paris Tour (2 hours)'
      }
    },
    fr: {
      title: 'Disneyland - Tour de Paris (2 heures) - Aéroport CDG ou ORLY',
      summary: 'Tour privé : Tour de Paris (2 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Disneyland',
        destination: 'Aéroport CDG ou ORLY',
        circuitName: 'Tour de Paris (2 heures)'
      }
    }
  },

  // Tour 4: Disneyland - París (Tour Eiffel y Arco del Triunfo) - Aeropuerto CDG u ORLY
  'Z1HNmuH9VezlITxVO02p93': {
    en: {
      title: 'Disneyland - Paris (Eiffel Tower & Arc de Triomphe) - CDG or ORLY Airport',
      summary: 'Private tour: Paris (Eiffel Tower & Arc de Triomphe). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Disneyland',
        destination: 'CDG or ORLY Airport',
        circuitName: 'Paris (Eiffel Tower & Arc de Triomphe)'
      }
    },
    fr: {
      title: 'Disneyland - Paris (Tour Eiffel et Arc de Triomphe) - Aéroport CDG ou ORLY',
      summary: 'Tour privé : Paris (Tour Eiffel et Arc de Triomphe). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Disneyland',
        destination: 'Aéroport CDG ou ORLY',
        circuitName: 'Paris (Tour Eiffel et Arc de Triomphe)'
      }
    }
  },

  // Tour 5: Aeropuerto CDG u ORLY - París Tour (3 horas) - Disneyland
  'gxyxv316c0oeG6AdOL9USY': {
    en: {
      title: 'CDG or ORLY Airport - Paris Tour (3 hours) - Disneyland',
      summary: 'Private tour: Paris Tour (3 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'CDG or ORLY Airport',
        destination: 'Disneyland',
        circuitName: 'Paris Tour (3 hours)'
      }
    },
    fr: {
      title: 'Aéroport CDG ou ORLY - Tour de Paris (3 heures) - Disneyland',
      summary: 'Tour privé : Tour de Paris (3 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Aéroport CDG ou ORLY',
        destination: 'Disneyland',
        circuitName: 'Tour de Paris (3 heures)'
      }
    }
  },

  // Tour 6: Aeropuerto CDG u ORLY - París Tour (2 horas) - Disneyland
  '80chRJ3b7zPbeqV15nF16D': {
    en: {
      title: 'CDG or ORLY Airport - Paris Tour (2 hours) - Disneyland',
      summary: 'Private tour: Paris Tour (2 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'CDG or ORLY Airport',
        destination: 'Disneyland',
        circuitName: 'Paris Tour (2 hours)'
      }
    },
    fr: {
      title: 'Aéroport CDG ou ORLY - Tour de Paris (2 heures) - Disneyland',
      summary: 'Tour privé : Tour de Paris (2 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Aéroport CDG ou ORLY',
        destination: 'Disneyland',
        circuitName: 'Tour de Paris (2 heures)'
      }
    }
  },

  // Tour 7: Aeropuerto CDG u ORLY - París (Tour Eiffel y Arco del Triunfo) - Disneyland
  '80chRJ3b7zPbeqV15nF19A': {
    en: {
      title: 'CDG or ORLY Airport - Paris (Eiffel Tower & Arc de Triomphe) - Disneyland',
      summary: 'Private tour: Paris (Eiffel Tower & Arc de Triomphe). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'CDG or ORLY Airport',
        destination: 'Disneyland',
        circuitName: 'Paris (Eiffel Tower & Arc de Triomphe)'
      }
    },
    fr: {
      title: 'Aéroport CDG ou ORLY - Paris (Tour Eiffel et Arc de Triomphe) - Disneyland',
      summary: 'Tour privé : Paris (Tour Eiffel et Arc de Triomphe). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Aéroport CDG ou ORLY',
        destination: 'Disneyland',
        circuitName: 'Paris (Tour Eiffel et Arc de Triomphe)'
      }
    }
  },

  // Tour 8: Hotel París - París Tour (3 horas) - Aeropuerto CDG u ORLY
  'Z1HNmuH9VezlITxVO02pz2': {
    en: {
      title: 'Paris Hotel - Paris Tour (3 hours) - CDG or ORLY Airport',
      summary: 'Private tour: Paris Tour (3 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Paris Hotel',
        destination: 'CDG or ORLY Airport',
        circuitName: 'Paris Tour (3 hours)'
      }
    },
    fr: {
      title: 'Hôtel Paris - Tour de Paris (3 heures) - Aéroport CDG ou ORLY',
      summary: 'Tour privé : Tour de Paris (3 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Hôtel Paris',
        destination: 'Aéroport CDG ou ORLY',
        circuitName: 'Tour de Paris (3 heures)'
      }
    }
  },

  // Tour 9: Hotel París - París Tour (2 horas) - Aeropuerto CDG u ORLY
  'Z1HNmuH9VezlITxVO02qDD': {
    en: {
      title: 'Paris Hotel - Paris Tour (2 hours) - CDG or ORLY Airport',
      summary: 'Private tour: Paris Tour (2 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Paris Hotel',
        destination: 'CDG or ORLY Airport',
        circuitName: 'Paris Tour (2 hours)'
      }
    },
    fr: {
      title: 'Hôtel Paris - Tour de Paris (2 heures) - Aéroport CDG ou ORLY',
      summary: 'Tour privé : Tour de Paris (2 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Hôtel Paris',
        destination: 'Aéroport CDG ou ORLY',
        circuitName: 'Tour de Paris (2 heures)'
      }
    }
  },

  // Tour 10: Aeropuerto CDG u ORLY - París Tour (3 horas) - Hotel París
  'gxyxv316c0oeG6AdOL9Uci': {
    en: {
      title: 'CDG or ORLY Airport - Paris Tour (3 hours) - Paris Hotel',
      summary: 'Private tour: Paris Tour (3 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'CDG or ORLY Airport',
        destination: 'Paris Hotel',
        circuitName: 'Paris Tour (3 hours)'
      }
    },
    fr: {
      title: 'Aéroport CDG ou ORLY - Tour de Paris (3 heures) - Hôtel Paris',
      summary: 'Tour privé : Tour de Paris (3 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Aéroport CDG ou ORLY',
        destination: 'Hôtel Paris',
        circuitName: 'Tour de Paris (3 heures)'
      }
    }
  },

  // Tour 11: Aeropuerto CDG u ORLY - París Tour (2 horas) - Hotel París
  'gxyxv316c0oeG6AdOL9UfX': {
    en: {
      title: 'CDG or ORLY Airport - Paris Tour (2 hours) - Paris Hotel',
      summary: 'Private tour: Paris Tour (2 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'CDG or ORLY Airport',
        destination: 'Paris Hotel',
        circuitName: 'Paris Tour (2 hours)'
      }
    },
    fr: {
      title: 'Aéroport CDG ou ORLY - Tour de Paris (2 heures) - Hôtel Paris',
      summary: 'Tour privé : Tour de Paris (2 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Aéroport CDG ou ORLY',
        destination: 'Hôtel Paris',
        circuitName: 'Tour de Paris (2 heures)'
      }
    }
  },

  // Tour 12: Hotel París - París Tour (3 horas) - Hotel París o centro de París
  'Z1HNmuH9VezlITxVO02qp1': {
    en: {
      title: 'Paris Hotel - Paris Tour (3 hours) - Paris Hotel or City Center',
      summary: 'Private tour: Paris Tour (3 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Paris Hotel',
        destination: 'Paris Hotel or City Center',
        circuitName: 'Paris Tour (3 hours)'
      }
    },
    fr: {
      title: 'Hôtel Paris - Tour de Paris (3 heures) - Hôtel Paris ou Centre-ville',
      summary: 'Tour privé : Tour de Paris (3 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Hôtel Paris',
        destination: 'Hôtel Paris ou Centre-ville',
        circuitName: 'Tour de Paris (3 heures)'
      }
    }
  },

  // Tour 13: Hotel París - París Tour (2 horas) - Hotel París o centro de París
  'gxyxv316c0oeG6AdOL9UlB': {
    en: {
      title: 'Paris Hotel - Paris Tour (2 hours) - Paris Hotel or City Center',
      summary: 'Private tour: Paris Tour (2 hours). Door-to-door service with professional driver. Includes tolls and standard luggage.',
      route: {
        origin: 'Paris Hotel',
        destination: 'Paris Hotel or City Center',
        circuitName: 'Paris Tour (2 hours)'
      }
    },
    fr: {
      title: 'Hôtel Paris - Tour de Paris (2 heures) - Hôtel Paris ou Centre-ville',
      summary: 'Tour privé : Tour de Paris (2 heures). Service porte-à-porte avec chauffeur professionnel. Péages et bagages standards inclus.',
      route: {
        origin: 'Hôtel Paris',
        destination: 'Hôtel Paris ou Centre-ville',
        circuitName: 'Tour de Paris (2 heures)'
      }
    }
  },

  // Tour 14: Disneyland - París Tour (3 horas) - Disneyland (POPULAR)
  '2a004049-ea15-4ff3-90eb-1c68e2809047': {
    en: {
      title: 'Disneyland - Paris Tour (3 hours) - Disneyland',
      summary: `3-hour tour visiting:

- Sacré-Cœur Basilica (Montmartre) ⛪
- Ladybug Café 🐞
- Moulin Rouge
- Louvre Museum 🔼
- Notre-Dame de Paris ⛪
- Champs-Élysées & Arc de Triomphe ⛩🌅
- Trocadero 🏛
- Eiffel Tower 🗼
`,
      route: {
        origin: 'Disneyland',
        destination: 'Paris',
        circuitName: 'Paris Tour (3 hours)'
      }
    },
    fr: {
      title: 'Disneyland - Tour de Paris (3 heures) - Disneyland',
      summary: `Tour de 3 heures visitant :

- Basilique du Sacré-Cœur (Montmartre) ⛪
- Café Ladybug 🐞
- Moulin Rouge
- Musée du Louvre 🔼
- Notre-Dame de Paris ⛪
- Champs-Élysées et Arc de Triomphe ⛩🌅
- Trocadéro 🏛
- Tour Eiffel 🗼
`,
      route: {
        origin: 'Disneyland',
        destination: 'Paris',
        circuitName: 'Tour de Paris (3 heures)'
      }
    }
  },

  // Tour 15: París - Dominio de Versailles (6 horas) (POPULAR)
  'tour.paris-dominio-versailles-6h': {
    en: {
      title: 'Paris - Palace of Versailles (6 hours)',
      summary: 'Discover the splendor of the Palace of Versailles and its magnificent gardens on a private 6-hour tour. Explore the Grand Apartments, the Hall of Mirrors, and the spectacular gardens designed',
      route: {
        origin: 'Paris',
        destination: 'Palace of Versailles',
        circuitName: 'Paris - Palace of Versailles (6 hours)'
      }
    },
    fr: {
      title: 'Paris - Domaine de Versailles (6 heures)',
      summary: 'Découvrez la splendeur du Château de Versailles et de ses jardins magnifiques lors d\'un tour privé de 6 heures. Parcourez les Grands Appartements, la Galerie des Glaces et les jardins spectaculaires conçus',
      route: {
        origin: 'Paris',
        destination: 'Domaine de Versailles',
        circuitName: 'Paris - Domaine de Versailles (6 heures)'
      }
    }
  },

  // Tour 16: París - Brujas, Bélgica (1 día)
  'tour.paris-brujas-belgica-1-dia': {
    en: {
      title: 'Paris - Bruges, Belgium (1 day)',
      summary: 'Full-day excursion from Paris to the charming medieval city of Bruges. Known as the "Venice of the North", this Belgian gem will captivate you with its picturesque canals, medieval architecture',
      route: {
        origin: 'Paris',
        destination: 'Bruges, Belgium',
        circuitName: 'Paris - Bruges, Belgium (1 day)'
      }
    },
    fr: {
      title: 'Paris - Bruges, Belgique (1 jour)',
      summary: 'Excursion d\'une journée complète de Paris vers la charmante ville médiévale de Bruges. Connue comme la "Venise du Nord", ce joyau belge vous captivera avec ses canaux pittoresques, son architecture médiévale',
      route: {
        origin: 'Paris',
        destination: 'Bruges, Belgique',
        circuitName: 'Paris - Bruges, Belgique (1 jour)'
      }
    }
  },

  // Tour 17: París - Brujas y Gante, Bélgica (1 día)
  'tour.paris-brujas-gante-belgica-1-dia': {
    en: {
      title: 'Paris - Bruges and Ghent, Belgium (1 day)',
      summary: 'Complete day tour visiting two of Belgium\'s most beautiful cities: Bruges and Ghent. Discover the medieval magic of Bruges with its canals and artisan chocolate shops, and continue to Ghent',
      route: {
        origin: 'Paris',
        destination: 'Bruges and Ghent, Belgium',
        circuitName: 'Paris - Bruges and Ghent, Belgium (1 day)'
      }
    },
    fr: {
      title: 'Paris - Bruges et Gand, Belgique (1 jour)',
      summary: 'Tour complet d\'une journée visitant deux des plus belles villes de Belgique : Bruges et Gand. Découvrez la magie médiévale de Bruges avec ses canaux et chocolateries artisanales, et continuez vers Gand',
      route: {
        origin: 'Paris',
        destination: 'Bruges et Gand, Belgique',
        circuitName: 'Paris - Bruges et Gand, Belgique (1 jour)'
      }
    }
  },

  // Tour 18: Disneyland - París Tour (2 horas) - Disneyland (POPULAR)
  '661161a6-b104-4da9-9842-1fcb35066909': {
    en: {
      title: 'Disneyland - Paris Tour (2 hours) - Disneyland',
      summary: `2-hour tour visiting:

• Louvre Museum 🔼
• Champs-Élysées & Arc de Triomphe ⛩️🌅
• Trocadero 🏛️
• Eiffel Tower 🗼`,
      route: {
        origin: 'Disneyland',
        destination: 'Paris',
        circuitName: 'Paris Tour (2 hours)'
      }
    },
    fr: {
      title: 'Disneyland - Tour de Paris (2 heures) - Disneyland',
      summary: `Tour de 2 heures visitant :

• Musée du Louvre 🔼
• Champs-Élysées et Arc de Triomphe ⛩️🌅
• Trocadéro 🏛️
• Tour Eiffel 🗼`,
      route: {
        origin: 'Disneyland',
        destination: 'Paris',
        circuitName: 'Tour de Paris (2 heures)'
      }
    }
  }
}

async function main() {
  console.log('🚀 Iniciando proceso de traducción de tours...\n')

  let updated = 0
  let failed = 0

  for (const [tourId, translations] of Object.entries(tourTranslations)) {
    try {
      console.log(`📝 Actualizando tour: ${tourId}`)
      
      await client
        .patch(tourId)
        .set({ translations })
        .commit()
      
      console.log(`✅ Tour ${tourId} actualizado correctamente\n`)
      updated++
    } catch (error) {
      console.error(`❌ Error actualizando tour ${tourId}:`, error)
      failed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✨ Proceso completado:`)
  console.log(`   ✅ Tours actualizados: ${updated}`)
  console.log(`   ❌ Tours con error: ${failed}`)
  console.log('='.repeat(50))
}

main().catch(console.error)
