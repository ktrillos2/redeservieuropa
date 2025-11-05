/*
 Seed para crear/actualizar el documento de contenido de la sección de testimonios.
 Ejecuta: npx tsx scripts/seed-testimonials-section-v2.ts
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
  console.error('[seed:testimonialsSection] Faltan NEXT_PUBLIC_SANITY_PROJECT_ID o NEXT_PUBLIC_SANITY_DATASET')
  process.exit(1)
}
if (!token) {
  console.error('[seed:testimonialsSection] Falta SANITY_API_TOKEN con permisos de escritura')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: false, token })

async function seedTestimonialsSection() {
  console.log('🌍 Iniciando seed de la sección de Testimonios...')

  const testimonialsData = {
    _type: 'testimonialsSection',
    _id: 'testimonialsSection',
    
    // Español (contenido por defecto)
    title: 'Lo que Dicen Nuestros Clientes',
    subtitle: 'Más de 1000 clientes satisfechos confían en nuestro servicio premium de transporte.',
    
    testimonials: [
      {
        _type: 'testimonialItem',
        _key: 'testimonial-1',
        name: 'María González',
        location: 'Madrid, España',
        rating: 5,
        comment: 'Servicio excepcional. El conductor fue muy puntual y el vehículo impecable. Definitivamente lo recomiendo para traslados en París.',
        service: 'CDG → París',
        translations: {
          en: {
            location: 'Madrid, Spain',
            comment: 'Exceptional service. The driver was very punctual and the vehicle was impeccable. I definitely recommend it for transfers in Paris.',
            service: 'CDG → Paris',
          },
          fr: {
            location: 'Madrid, Espagne',
            comment: 'Service exceptionnel. Le chauffeur était très ponctuel et le véhicule impeccable. Je le recommande définitivement pour les transferts à Paris.',
            service: 'CDG → Paris',
          },
        },
      },
      {
        _type: 'testimonialItem',
        _key: 'testimonial-2',
        name: 'Carlos Rodríguez',
        location: 'Bogotá, Colombia',
        rating: 5,
        comment: 'Perfecto para familias. Nos llevaron a Disneyland sin problemas, el conductor conocía muy bien la ruta y fue muy amable con los niños.',
        service: 'París → Disneyland',
        translations: {
          en: {
            location: 'Bogotá, Colombia',
            comment: 'Perfect for families. They took us to Disneyland without any problems, the driver knew the route very well and was very kind to the children.',
            service: 'Paris → Disneyland',
          },
          fr: {
            location: 'Bogotá, Colombie',
            comment: 'Parfait pour les familles. Ils nous ont emmenés à Disneyland sans problème, le chauffeur connaissait très bien l\'itinéraire et était très gentil avec les enfants.',
            service: 'Paris → Disneyland',
          },
        },
      },
      {
        _type: 'testimonialItem',
        _key: 'testimonial-3',
        name: 'Ana Martínez',
        location: 'Barcelona, España',
        rating: 5,
        comment: 'El tour nocturno por París fue increíble. Vimos todos los monumentos iluminados y el conductor nos dio excelentes recomendaciones.',
        service: 'Tour Nocturno',
        translations: {
          en: {
            location: 'Barcelona, Spain',
            comment: 'The night tour of Paris was incredible. We saw all the illuminated monuments and the driver gave us excellent recommendations.',
            service: 'Night Tour',
          },
          fr: {
            location: 'Barcelone, Espagne',
            comment: 'La visite nocturne de Paris était incroyable. Nous avons vu tous les monuments illuminés et le chauffeur nous a donné d\'excellentes recommandations.',
            service: 'Tour de Nuit',
          },
        },
      },
      {
        _type: 'testimonialItem',
        _key: 'testimonial-4',
        name: 'Luis Fernández',
        location: 'México DF, México',
        rating: 5,
        comment: 'Muy profesional y confiable. Llegué tarde por el vuelo y me esperaron sin costo adicional. Excelente servicio al cliente.',
        service: 'Orly → París',
        translations: {
          en: {
            location: 'Mexico City, Mexico',
            comment: 'Very professional and reliable. I arrived late due to the flight and they waited for me at no additional cost. Excellent customer service.',
            service: 'Orly → Paris',
          },
          fr: {
            location: 'Mexico DF, Mexique',
            comment: 'Très professionnel et fiable. Je suis arrivé en retard à cause du vol et ils m\'ont attendu sans frais supplémentaires. Excellent service client.',
            service: 'Orly → Paris',
          },
        },
      },
      {
        _type: 'testimonialItem',
        _key: 'testimonial-5',
        name: 'Isabella Silva',
        location: 'São Paulo, Brasil',
        rating: 5,
        comment: 'Comodidad y elegancia en cada detalle. El vehículo era muy limpio y cómodo. Una experiencia de lujo a precio justo.',
        service: 'Beauvais → París',
        translations: {
          en: {
            location: 'São Paulo, Brazil',
            comment: 'Comfort and elegance in every detail. The vehicle was very clean and comfortable. A luxury experience at a fair price.',
            service: 'Beauvais → Paris',
          },
          fr: {
            location: 'São Paulo, Brésil',
            comment: 'Confort et élégance dans chaque détail. Le véhicule était très propre et confortable. Une expérience de luxe à un prix juste.',
            service: 'Beauvais → Paris',
          },
        },
      },
    ],
    
    // Traducciones del título y subtítulo
    translations: {
      en: {
        title: 'What Our Customers Say',
        subtitle: 'Over 1000 satisfied customers trust our premium transportation service.',
      },
      fr: {
        title: 'Ce Que Disent Nos Clients',
        subtitle: 'Plus de 1000 clients satisfaits font confiance à notre service de transport premium.',
      },
    },
  }

  try {
    const result = await client.createOrReplace(testimonialsData)
    console.log('✅ Sección de Testimonios actualizada exitosamente')
    console.log('📦 Documento:', result._id)
    console.log('🌐 Idiomas añadidos: español (es - default), inglés (en), francés (fr)')
    console.log('👥 Testimonios cargados:', testimonialsData.testimonials.length)
    console.log('🎉 Proceso completado')
  } catch (error) {
    console.error('❌ Error al actualizar la sección de Testimonios:', error)
    throw error
  }
}

seedTestimonialsSection()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))
