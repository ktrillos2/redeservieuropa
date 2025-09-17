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
  ],
})
