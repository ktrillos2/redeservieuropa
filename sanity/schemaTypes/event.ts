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
    
    // ✅ TRADUCCIONES
    defineField({
      name: 'translations',
      title: 'Traducciones',
      type: 'object',
      description: 'Traducciones del evento a otros idiomas (inglés y francés)',
      options: { collapsible: true, collapsed: true },
      fields: [
        // INGLÉS
        defineField({
          name: 'en',
          title: 'English',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ 
              name: 'title', 
              title: 'Title', 
              type: 'string',
              description: 'Event title in English'
            }),
            defineField({ 
              name: 'shortInfo', 
              title: 'Short Info', 
              type: 'text', 
              rows: 3,
              description: 'Brief description shown in payment summary'
            }),
            defineField({ 
              name: 'description', 
              title: 'Description', 
              type: 'text', 
              rows: 6,
              description: 'Full event description'
            }),
            defineField({ 
              name: 'meetingPoint', 
              title: 'Meeting Point', 
              type: 'string',
              description: 'Where participants should meet'
            }),
          ],
        }),
        // FRANCÉS
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ 
              name: 'title', 
              title: 'Titre', 
              type: 'string',
              description: 'Titre de l\'événement en français'
            }),
            defineField({ 
              name: 'shortInfo', 
              title: 'Info Courte', 
              type: 'text', 
              rows: 3,
              description: 'Description brève affichée dans le résumé de paiement'
            }),
            defineField({ 
              name: 'description', 
              title: 'Description', 
              type: 'text', 
              rows: 6,
              description: 'Description complète de l\'événement'
            }),
            defineField({ 
              name: 'meetingPoint', 
              title: 'Point de Rencontre', 
              type: 'string',
              description: 'Où les participants doivent se retrouver'
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'date' },
  },
})
