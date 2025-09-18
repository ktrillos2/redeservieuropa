import { defineType, defineField } from 'sanity'

// Nota de migración: el tipo pasó de 'tour' (singular) a 'tours' (plural).
// Documentos existentes con _type == 'tour' no coincidirán con este schema hasta migrarlos.
// Proceso sugerido:
//  * Revisar en Vision: *[_type == "tour"]{_id,title}
//  * Aplicar patches: client.patch(id).set({_type: 'tours'}).commit()
//  * O exportar e importar ajustando el campo _type.

export const pricingItem = defineType({
  name: 'pricingItem',
  title: 'Precio por pasajeros',
  type: 'object',
  fields: [
    defineField({ name: 'pax', title: 'Pasajeros', type: 'number', validation: (r) => r.min(1).max(56) }),
    defineField({ name: 'price', title: 'Precio (€)', type: 'number', validation: (r) => r.min(0) }),
  ],
})

export default defineType({
  name: 'tours',
  title: 'Tours',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Descripción', type: 'text' }),
    defineField({ name: 'duration', title: 'Duración', type: 'string' }),
    defineField({ name: 'distance', title: 'Distancia/Área', type: 'string' }),
    defineField({ name: 'mainImage', title: 'Imagen principal', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'gallery', title: 'Galería', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'features', title: 'Características', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'included', title: 'Incluye', type: 'array', of: [{ type: 'string' }] }),
    // NUEVO: comodidades del vehículo
    defineField({ name: 'amenities', title: 'Comodidades del vehículo', type: 'array', of: [{ type: 'string' }], description: 'Ej: WiFi, Agua, Cargadores USB, Asientos confort, Climatización bizona.' }),
  defineField({ name: 'notes', title: 'Notas (bullets)', type: 'array', of: [{ type: 'string' }], description: 'Notas informativas adicionales (bullets cortos).' }),
    defineField({ name: 'basePrice', title: 'Precio base (€)', type: 'number' }),
    defineField({ name: 'basePriceDay', title: 'Precio por hora Diurno (€)', type: 'number' }),
    defineField({ name: 'basePriceNight', title: 'Precio por hora Nocturno (€)', type: 'number' }),
    defineField({ name: 'pricing', title: 'Precios por pasajeros', type: 'array', of: [{ type: pricingItem.name }] }),
    // NUEVO: opciones de tarifas personalizadas (etiqueta + horas opcional + precio)
    defineField({
      name: 'pricingOptions',
      title: 'Opciones y Tarifas',
      type: 'array',
      of: [
        defineField({
          name: 'pricingOption',
          title: 'Opción de Tarifa',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Etiqueta', type: 'string', validation: r => r.required() }),
            defineField({ name: 'hours', title: 'Horas (opcional)', type: 'number' }),
            defineField({ name: 'price', title: 'Precio (€)', type: 'number', validation: r => r.min(0) }),
            defineField({ name: 'description', title: 'Descripción breve', type: 'string' }),
          ],
        }) as any,
      ],
      description: 'Lista de opciones de tarifa (ej: Tour 2h, Tour 3h, Eiffel + Arco).',
    }),
    defineField({
      name: 'pricingP4',
      title: 'Tarifas especiales hasta 4 pax',
      type: 'object',
      fields: [
        defineField({ name: 'threeH', title: 'Paris Tour (3h)', type: 'number' }),
        defineField({ name: 'twoH', title: 'Paris Tour (2h)', type: 'number' }),
        defineField({ name: 'eiffelArco', title: 'Eiffel + Arco', type: 'number' }),
      ],
    }),
    defineField({
      name: 'pricingP5',
      title: 'Tarifas especiales hasta 5 pax',
      type: 'object',
      fields: [
        defineField({ name: 'threeH', title: 'Paris Tour (3h)', type: 'number' }),
        defineField({ name: 'twoH', title: 'Paris Tour (2h)', type: 'number' }),
        defineField({ name: 'eiffelArco', title: 'Eiffel + Arco', type: 'number' }),
      ],
    }),
    defineField({
      name: 'extraSections',
      title: 'Secciones adicionales',
      type: 'array',
      of: [
        defineField({
          name: 'section',
          type: 'object',
          title: 'Sección',
          fields: [
            defineField({ name: 'title', title: 'Título', type: 'string' }),
            defineField({ name: 'body', title: 'Contenido', type: 'array', of: [{ type: 'block' }] }),
            defineField({ name: 'included', title: 'Incluye', type: 'array', of: [{ type: 'string' }] }),
            defineField({ name: 'itinerary', title: 'Itinerario', type: 'array', of: [{ type: 'string' }] }),
          ],
        }) as any,
      ],
    }),
    defineField({
      name: 'infoLists',
      title: 'Listas Informativas',
      type: 'array',
      of: [
        defineField({
          name: 'infoList',
          type: 'object',
          title: 'Lista',
          fields: [
            defineField({ name: 'title', title: 'Título', type: 'string' }),
            defineField({ name: 'icon', title: 'Icono (opcional)', type: 'string', description: 'Nombre de icono: plane, map-pin, clock, shield, car, star, etc.' }),
            defineField({ name: 'items', title: 'Ítems', type: 'array', of: [{ type: 'string' }], validation: r => r.min(1) }),
          ],
        }) as any,
      ],
      description: 'Bloques de listas con título para nueva información sin tocar código.',
    }),
    defineField({ name: 'isActive', title: 'Activo', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: 'Orden', type: 'number' }),
  ],
  preview: { select: { title: 'title', media: 'mainImage', subtitle: 'duration' } },
})
