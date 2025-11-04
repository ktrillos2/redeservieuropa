import { defineField, defineType } from 'sanity'

// Nota de migración: el tipo pasó de 'event' (singular) a 'events' (plural).
// Documentos existentes con _type == 'event' no aparecerán en este schema hasta migrarlos.
// Para migrar:
// 1. Ejecutar en la consola de Sanity (Vision o client):
//    *[_type == "event"]{_id,_type} => para listar.
// 2. Crear un script GROQ Patch: client.patch(id).set({_type: 'events'}).commit()
// 3. O reimportar contenido ajustando _type en los JSON de export.

export default defineType({
  name: 'events',
  title: 'Eventos',
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
    defineField({
      name: 'translations',
      title: 'Traducciones',
      type: 'object',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'shortInfo', title: 'Short Info', type: 'text', rows: 3 }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 6 }),
            defineField({ name: 'meetingPoint', title: 'Meeting Point', type: 'string' }),
          ],
        }),
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            defineField({ name: 'shortInfo', title: 'Info Courte', type: 'text', rows: 3 }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 6 }),
            defineField({ name: 'meetingPoint', title: 'Point de Rencontre', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'date' },
  },
})
