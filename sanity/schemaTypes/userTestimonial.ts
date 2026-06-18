import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'userTestimonial',
  title: 'Testimonios (Envíos de Usuarios)',
  type: 'document',
  fields: [
    defineField({ 
      name: 'name', 
      title: 'Nombre del Cliente', 
      type: 'string', 
      validation: (r) => r.required() 
    }),
    defineField({ 
      name: 'location', 
      title: 'Ubicación (opcional)', 
      type: 'string' 
    }),
    defineField({ 
      name: 'rating', 
      title: 'Puntuación (1-5)', 
      type: 'number', 
      validation: (r) => r.min(1).max(5).required() 
    }),
    defineField({ 
      name: 'comment', 
      title: 'Comentario', 
      type: 'text', 
      rows: 4, 
      validation: (r) => r.required() 
    }),
    defineField({ 
      name: 'service', 
      title: 'Servicio Contratado (opcional)', 
      type: 'string' 
    }),
    defineField({ 
      name: 'isApproved', 
      title: 'Aprobado (Visible en la web)', 
      type: 'boolean', 
      description: 'Activa esta opción para que el testimonio aparezca en la página web.',
      initialValue: false 
    }),
    defineField({
      name: 'createdAt',
      title: 'Fecha de Envío',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true
    })
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'comment',
      approved: 'isApproved'
    },
    prepare(selection) {
      const { title, subtitle, approved } = selection
      return {
        title: `${title} ${approved ? '✅' : '⏳'}`,
        subtitle: subtitle
      }
    }
  }
})
