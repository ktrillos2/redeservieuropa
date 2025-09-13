export interface TourInfo {
  title: string
  description: string
  basePrice?: number
  basePriceDay?: number
  basePriceNight?: number
  duration: string
  distance: string
  image: string
  gallery?: string[]
  features: string[]
  included: string[]
  pricing?: Record<number, number>
  pricingP4?: { threeH: number; twoH: number; eiffelArco: number }
  pricingP5?: { threeH: number; twoH: number; eiffelArco: number }
}

export const tourData: Record<string, TourInfo> = {
  "cdg-paris": {
    title: "Traslado CDG ↔ París",
    description:
      "Servicio premium de traslado desde/hacia el aeropuerto Charles de Gaulle al centro de París. Nuestros conductores profesionales te esperarán en la terminal con un cartel con tu nombre.",
    basePrice: 65,
    duration: "45-60 min",
    distance: "35 km",
    image: "/luxury-car-at-charles-de-gaulle-airport-paris.jpg",
    gallery: [
      "/luxury-car-at-charles-de-gaulle-airport-paris.jpg",
      "/vehicles/stepway-paris-2.jpg",
      "/vehicles/stepway-paris-3.jpg",
      "/vehicles/stepway-paris-4.jpg",
      "/vehicles/stepway-paris-5.jpg",
    ],
    features: [
      "Seguimiento de vuelo en tiempo real",
      "Conductor profesional uniformado",
      "Vehículo Mercedes-Benz o similar",
      "WiFi gratuito a bordo",
      "Agua embotellada de cortesía",
      "Asistencia con equipaje",
      "Pago con tarjeta o efectivo",
      "Cancelación gratuita hasta 24h antes",
    ],
    included: [
      "Recogida en terminal",
      "Espera gratuita 60 min",
      "Peajes incluidos",
      "Seguro completo",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo amplio",
    ],
    pricing: {
      1: 65,
      2: 65,
      3: 65,
      4: 65,
      5: 85,
      6: 103,
      7: 109,
      8: 113,
    },
  },
  "orly-paris": {
    title: "Traslado Orly ↔ París",
    description:
      "Conexión directa y cómoda entre el aeropuerto de Orly y el centro de París. Servicio puerta a puerta con la máxima comodidad.",
    basePrice: 60,
    duration: "35-45 min",
    distance: "25 km",
    image: "/elegant-transport-service-orly-airport-paris.jpg",
    gallery: [
      "/elegant-transport-service-orly-airport-paris.jpg",
      "/vehicles/stepway-paris-1.jpg",
      "/vehicles/stepway-paris-6.jpg",
      "/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg",
    ],
    features: [
      "Servicio puerta a puerta",
      "Vehículos de lujo",
      "Conductores bilingües",
      "Sistema de climatización",
      "Música ambiente",
      "Cargadores USB",
      "Servicio 24/7",
      "Confirmación inmediata",
    ],
    included: [
      "Recogida en terminal",
      "Espera gratuita 45 min",
      "Peajes incluidos",
      "Limpieza del vehículo",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
    ],
    pricing: {
      1: 60,
      2: 60,
      3: 60,
      4: 60,
      5: 80,
      6: 95,
      7: 104,
      8: 108,
    },
  },
  "paris-disneyland": {
    title: "París ↔ Disneyland",
    description:
      "Traslado mágico hacia el reino de la fantasía. Perfecto para familias, con espacio extra para equipaje y entretenimiento para los más pequeños.",
    basePrice: 70,
    duration: "45-60 min",
    distance: "40 km",
    image: "/family-transport-to-disneyland-paris-castle.jpg",
    gallery: [
      "/family-transport-to-disneyland-paris-castle.jpg",
      "/elegant-woman-smiling.png",
      "/vehicles/stepway-paris-2.jpg",
    ],
    features: [
      "Perfecto para familias",
      "Entretenimiento para niños",
      "Asientos elevadores disponibles",
      "Espacio extra para equipaje",
      "Paradas técnicas si necesario",
      "Información sobre el parque",
      "Fotos de recuerdo",
      "Horarios flexibles",
    ],
    included: [
      "Recogida en hotel",
      "Entrada directa al parque",
      "Mapa del parque",
      "Recomendaciones VIP",
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo amplio",
    ],
    pricing: {
      1: 70,
      2: 70,
      3: 70,
      4: 70,
      5: 90,
      6: 106,
      7: 118,
      8: 134,
    },
  },
  "tour-paris": {
    title: "Tour por París",
    description:
      "Descubre la Ciudad de la Luz con nuestro tour personalizado. Recorre los monumentos más emblemáticos de París con un conductor profesional que te contará la historia de cada lugar.",
    basePriceDay: 55,
    basePriceNight: 65,
    duration: "Mínimo 2 horas",
    distance: "Personalizable",
    image: "/vehicles/stepway-paris-4.jpg",
    gallery: [
      "/vehicles/stepway-paris-1.jpg",
      "/vehicles/stepway-paris-3.jpg",
      "/vehicles/stepway-paris-4.jpg",
      "/vehicles/stepway-paris-5.jpg",
      "/vehicles/stepway-paris-6.jpg",
      "/elegant-paris-skyline-with-eiffel-tower-and-luxury.jpg",
    ],
    features: [
      "Tour personalizable",
      "Paradas en monumentos principales",
      "Conductor guía profesional",
      "Vehículo cómodo y amplio",
      "Fotos en lugares emblemáticos",
      "Información histórica",
      "Flexibilidad de horarios",
      "Rutas adaptadas a tus intereses",
    ],
    included: [
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
      "Combustible incluido",
      "Estacionamiento incluido",
    ],
  },
  "paris-dl-dl": {
    title: "Disneyland ➡ Paris Tour ➡ Disneyland",
    description:
      "Disfruta un recorrido por París saliendo desde Disneyland y regresando al mismo punto. Ideal para conocer lo imprescindible en un solo trayecto con paradas para fotos.",
    basePrice: 200,
    duration: "2h · 3h o circuito Eiffel + Arco",
    distance: "Circuito en París",
    image: "/vehicles/stepway-paris-1.jpg",
    gallery: [
      "/vehicles/stepway-paris-1.jpg",
      "/vehicles/stepway-paris-2.jpg",
      "/vehicles/stepway-paris-3.jpg",
      "/vehicles/stepway-paris-4.jpg",
      "/vehicles/stepway-paris-5.jpg",
      "/vehicles/stepway-paris-6.jpg",
    ],
    features: [
      "Salida y regreso a Disneyland",
      "Paradas en puntos icónicos",
      "Conductor guía profesional",
      "Vehículo cómodo y amplio",
      "Itinerario optimizado según tráfico",
      "Flexibilidad de horarios",
      "Fotos en lugares emblemáticos",
      "Servicio privado",
    ],
    included: [
      "Conductor de habla hispana o inglesa o francés",
      "Vehículo cómodo",
      "Combustible y peajes",
      "Estacionamiento incluido",
    ],
    pricingP4: { threeH: 300, twoH: 245, eiffelArco: 200 },
    pricingP5: { threeH: 340, twoH: 315, eiffelArco: 245 },
  },
}
