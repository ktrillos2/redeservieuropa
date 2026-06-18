import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'whatsappTemplate',
  title: 'Plantilla WhatsApp',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'variables',
      title: 'Variables disponibles',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'key', title: 'Variable', type: 'string', validation: r => r.required(), description: 'Escribe sin llaves. Ej: name, phone, service, date, time, pickup, dropoff, orderNumber, amount, currency' },
          { name: 'description', title: 'Descripción', type: 'string', validation: r => r.required() },
        ],
        preview: { select: { title: 'key', subtitle: 'description' } }
      }],
      description: 'Lista de variables y su significado. Estas se usan como {variable} dentro del cuerpo.',
    }),
    defineField({
      name: 'body',
      title: 'Cuerpo (Portable Text)',
      type: 'array',
      of: [{
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'Título 1', value: 'h1' },
          { title: 'Título 2', value: 'h2' },
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
        ],
        marks: {
          decorators: [
            { title: 'Negrita', value: 'strong' },
            { title: 'Cursiva', value: 'em' },
            { title: 'Código', value: 'code' },
          ],
          annotations: [],
        },
      }],
      description: 'Usa variables entre llaves, p. ej.: {name}, {phone}, {service}, {date}, {time}, {pickup}, {dropoff}, {orderNumber}, {amount}, {currency}',
      validation: r => r.required(),
    }),
    defineField({ name: 'notes', title: 'Notas', type: 'text' }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return { title }
    }
  }
})

export const whatsappTemplateName = 'whatsappTemplate'
