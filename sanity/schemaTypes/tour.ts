import { defineType, defineField } from 'sanity'

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
  name: 'tour',
  title: 'Tour',
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
    defineField({ name: 'basePrice', title: 'Precio base (€)', type: 'number' }),
    defineField({ name: 'basePriceDay', title: 'Precio por hora Diurno (€)', type: 'number' }),
    defineField({ name: 'basePriceNight', title: 'Precio por hora Nocturno (€)', type: 'number' }),
    defineField({ name: 'pricing', title: 'Precios por pasajeros', type: 'array', of: [{ type: pricingItem.name }] }),
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
    defineField({ name: 'isActive', title: 'Activo', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: 'Orden', type: 'number' }),
  ],
  preview: { select: { title: 'title', media: 'mainImage', subtitle: 'duration' } },
})
