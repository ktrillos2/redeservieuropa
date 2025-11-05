import { defineType, defineField } from 'sanity'

export const testimonialItem = defineType({
  name: 'testimonialItem',
  title: 'Testimonio',
  type: 'object',
  fields: [
    defineField({ name: 'name', title: 'Nombre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'location', title: 'Ubicación', type: 'string' }),
    defineField({ name: 'rating', title: 'Puntuación', type: 'number', validation: (r) => r.min(1).max(5), initialValue: 5 }),
    defineField({ name: 'comment', title: 'Comentario', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'service', title: 'Servicio', type: 'string' }),
    defineField({ name: 'avatar', title: 'Imagen/Avatar', type: 'image', options: { hotspot: true } }),
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
            defineField({ name: 'location', title: 'Location', type: 'string' }),
            defineField({ name: 'comment', title: 'Comment', type: 'text', rows: 4 }),
            defineField({ name: 'service', title: 'Service', type: 'string' }),
          ],
        }),
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          fields: [
            defineField({ name: 'location', title: 'Lieu', type: 'string' }),
            defineField({ name: 'comment', title: 'Commentaire', type: 'text', rows: 4 }),
            defineField({ name: 'service', title: 'Service', type: 'string' }),
          ],
        }),
      ],
    }),
  ],
})

export default defineType({
  name: 'testimonialsSection',
  title: 'Sección: Testimonios',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Lo que Dicen Nuestros Clientes' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3, initialValue: 'Más de 1000 clientes satisfechos confían en nuestro servicio premium de transporte.' }),
    defineField({ name: 'testimonials', title: 'Testimonios', type: 'array', of: [{ type: testimonialItem.name }] }),
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
            defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 3 }),
          ],
        }),
        defineField({
          name: 'fr',
          title: 'Français',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Sous-titre', type: 'text', rows: 3 }),
          ],
        }),
      ],
    }),
  ],
})
