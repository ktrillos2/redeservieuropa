import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'event',
  title: 'Evento',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (rule) => rule.required() }),
    defineField({ name: 'image', title: 'Imagen', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'pricePerPerson', title: 'Precio por persona (€)', type: 'number', validation: (rule) => rule.min(0) }),
    defineField({ name: 'date', title: 'Fecha', type: 'date' }),
    defineField({ name: 'time', title: 'Hora', type: 'string' }),
    defineField({ name: 'meetingPoint', title: 'Punto de encuentro', type: 'string' }),
    defineField({ name: 'shortInfo', title: 'Información breve', type: 'text', rows: 3, description: 'Texto breve que se muestra en el resumen de pago.' }),
    defineField({ name: 'description', title: 'Descripción', type: 'text', rows: 6, description: 'Descripción completa del evento.' }),
    defineField({
      name: 'gallery',
      title: 'Galería',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      options: { layout: 'grid' },
    }),
    defineField({ name: 'isActive', title: 'Activo', type: 'boolean', initialValue: true }),
    defineField({ name: 'order', title: 'Orden', type: 'number' }),
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'date' },
  },
})
