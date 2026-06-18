/*
  Seed para la sección "Nuestros Tours" (singleton toursSection)
  Ejecuta: pnpm run seed:sanity:tours-section
*/
import { createClient } from 'next-sanity'
import { config as dotenvConfig } from 'dotenv'
import path from 'node:path'

dotenvConfig({ path: path.join(process.cwd(), '.env.local'), override: true })
dotenvConfig({ path: path.join(process.cwd(), '.env') })

const projectId = (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '').trim()
const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || '').trim()
const apiVersion = (process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-15').trim()
const token = (process.env.SANITY_API_TOKEN || '').trim()

if (!projectId || !dataset) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SANITY_PROJECT_ID y/o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('Falta SANITY_API_TOKEN en tu entorno (.env/.env.local). Requiero un token con permisos de escritura.')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

const doc = {
  _id: 'toursSection',
  _type: 'toursSection',
  title: 'Nuestros Tours',
  subtitle: 'Traslados cómodos con la máxima comodidad y puntualidad. Tarifas transparentes y servicio excepcional.',
  customQuote: {
    title: 'Cotiza a tu gusto',
    transfers: {
      title: 'Traslados punto A → punto B',
      subtitle: 'Popular: De aeropuertos a la ciudad o Disneyland',
      buttonLabel: '¡Escríbenos!',
    },
    tickets: {
      title: 'Boletas Disneyland y barquito',
      subtitle: 'Desde 85€ (Disney) y 15€ por persona (barquito)',
      buttonLabel: '¡Escríbenos!',
    },
  },
  additionalCharges: {
    title: 'Cargos Adicionales',
    nightCharge: 'Recargo nocturno después de las 21h: +5€',
    extraPassenger: 'Pasajero adicional: +20€',
    bulkyLuggage: 'Equipaje voluminoso (+3 maletas): +10€',
    groupRates: 'Grupos de 5-8 personas: Tarifas especiales',
  },
  translations: {
    en: {
      title: 'Our Tours',
      subtitle: 'Comfortable transfers with maximum comfort and punctuality. Transparent rates and exceptional service.',
      customQuote: {
        title: 'Custom Quote',
        transfers: {
          title: 'Point A → Point B Transfers',
          subtitle: 'Popular: From airports to the city or Disneyland',
          buttonLabel: 'Contact Us!',
        },
        tickets: {
          title: 'Disneyland & Boat Tickets',
          subtitle: 'From €85 (Disney) and €15 per person (boat)',
          buttonLabel: 'Contact Us!',
        },
      },
      additionalCharges: {
        title: 'Additional Charges',
        nightCharge: 'Night surcharge after 9 PM: +€5',
        extraPassenger: 'Extra passenger: +€20',
        bulkyLuggage: 'Bulky luggage (+3 suitcases): +€10',
        groupRates: 'Groups of 5-8 people: Special rates',
      },
    },
    fr: {
      title: 'Nos Tours',
      subtitle: 'Transferts confortables avec un maximum de confort et de ponctualité. Tarifs transparents et service exceptionnel.',
      customQuote: {
        title: 'Devis Personnalisé',
        transfers: {
          title: 'Transferts Point A → Point B',
          subtitle: 'Populaire : Des aéroports à la ville ou Disneyland',
          buttonLabel: 'Contactez-nous !',
        },
        tickets: {
          title: 'Billets Disneyland et Bateau',
          subtitle: 'À partir de 85€ (Disney) et 15€ par personne (bateau)',
          buttonLabel: 'Contactez-nous !',
        },
      },
      additionalCharges: {
        title: 'Frais Supplémentaires',
        nightCharge: 'Supplément de nuit après 21h : +5€',
        extraPassenger: 'Passager supplémentaire : +20€',
        bulkyLuggage: 'Bagages volumineux (+3 valises) : +10€',
        groupRates: 'Groupes de 5-8 personnes : Tarifs spéciaux',
      },
    },
  },
}

async function run() {
  console.log('🌍 Iniciando seed de la sección de Tours...')
  const res = await client.transaction().createOrReplace(doc).commit()
  console.log('✅ Sección de Tours actualizada exitosamente')
  console.log('📦 Documentos procesados:', res?.results?.length || 0)
  console.log('🌐 Idiomas añadidos: español (es - default), inglés (en), francés (fr)')
  console.log('🎉 Proceso completado')
}

run().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
