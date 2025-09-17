import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'contactSection',
  title: 'Sección: Contáctanos',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Contáctanos' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3, initialValue: 'Estamos disponibles 24/7 para atender tus consultas y reservas.' }),
    defineField({ name: 'formTitle', title: 'Título del formulario', type: 'string', initialValue: 'Envíanos un Mensaje' }),
    defineField({ name: 'formNote', title: 'Nota bajo el formulario', type: 'string' }),
    defineField({ name: 'showWhatsAppButton', title: 'Mostrar botón WhatsApp', type: 'boolean', initialValue: true }),
  ],
})
