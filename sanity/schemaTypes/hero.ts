import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Hero',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'highlight', title: 'Texto destacado', type: 'string' }),
    defineField({ name: 'description', title: 'Descripción', type: 'text' }),
    defineField({
      name: 'backgroundImage',
      title: 'Imagen de fondo',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt', type: 'string' })],
    }),
    defineField({
      name: 'primaryCta',
      title: 'CTA principal',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'url' }),
        defineField({ name: 'internalHref', title: 'Ruta interna', type: 'string' }),
        defineField({ name: 'external', title: 'Abrir en nueva pestaña', type: 'boolean', initialValue: false }),
      ],
    }),
    defineField({
      name: 'secondaryCta',
      title: 'CTA secundaria',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
        defineField({ name: 'href', title: 'URL', type: 'url' }),
        defineField({ name: 'internalHref', title: 'Ruta interna', type: 'string' }),
        defineField({ name: 'external', title: 'Abrir en nueva pestaña', type: 'boolean', initialValue: false }),
      ],
    }),
    defineField({
      name: 'bookingForm',
      title: 'Formulario de reserva (configurable)',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Título del formulario', type: 'string', initialValue: 'Reserva tu Servicio' }),
        defineField({ name: 'ctaLabel', title: 'Etiqueta del botón', type: 'string', initialValue: 'Reservar con 5€' }),
        defineField({ name: 'depositAmount', title: 'Depósito (€)', type: 'number', initialValue: 5 }),
        defineField({
          name: 'typePicker',
          title: 'Selector de tipo de reserva',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Tipo de reserva' }),
            defineField({ name: 'trasladoLabel', title: 'Traslado (label)', type: 'string', initialValue: 'Traslado' }),
            defineField({ name: 'tourLabel', title: 'Tour (label)', type: 'string', initialValue: 'Tour' }),
          ],
        }),
        defineField({ name: 'originField', title: 'Campo Origen', type: 'object', fields: [
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Origen' }),
        ]}),
        defineField({ name: 'destinationField', title: 'Campo Destino', type: 'object', fields: [
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Destino' }),
        ]}),
        defineField({ name: 'dateField', title: 'Campo Fecha', type: 'object', fields: [
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Fecha' }),
        ]}),
        defineField({ name: 'timeField', title: 'Campo Hora', type: 'object', fields: [
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Hora' }),
        ]}),
        defineField({ name: 'passengersField', title: 'Campo Pasajeros', type: 'object', fields: [
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Pasajeros' }),
          defineField({ name: 'singular', title: 'Singular', type: 'string', initialValue: 'Pasajero' }),
          defineField({ name: 'plural', title: 'Plural', type: 'string', initialValue: 'Pasajeros' }),
        ]}),
        defineField({ name: 'vehicleField', title: 'Campo Tipo de vehículo', type: 'object', fields: [
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Tipo de vehículo' }),
          defineField({ name: 'labelCoche', title: 'Etiqueta Coche', type: 'string', initialValue: 'Coche (4 personas)' }),
          defineField({ name: 'labelMinivan', title: 'Etiqueta Minivan', type: 'string', initialValue: 'Minivan (6 pasajeros)' }),
          defineField({ name: 'labelVan', title: 'Etiqueta Van', type: 'string', initialValue: 'Van (8 pasajeros)' }),
        ]}),
        defineField({ name: 'flightNumberField', title: 'Campo Número de vuelo', type: 'object', fields: [
          defineField({ name: 'label', title: 'Etiqueta', type: 'string', initialValue: 'Número de vuelo' }),
          defineField({ name: 'placeholder', title: 'Placeholder', type: 'string', initialValue: 'Ej: AF1234' }),
        ]}),
        defineField({ name: 'notes', title: 'Notas y leyendas', type: 'object', fields: [
          defineField({ name: 'minivan6', title: 'Nota Minivan 6 pax', type: 'string', initialValue: 'Equipaje: no superior a 2 maletas de 10kg + 1 mochila por pasajero.' }),
          defineField({ name: 'minivan5', title: 'Nota Minivan 5 pax', type: 'string', initialValue: 'Equipaje: no superior a 3 maletas de 23kg y 3 maletas de 10kg.' }),
          defineField({ name: 'nightChargeNote', title: 'Nota recargo nocturno', type: 'string', initialValue: '+5€ recargo nocturno después de las 21:00.' }),
          defineField({ name: 'surchargeFootnote', title: 'Pie de página de recargos', type: 'string', initialValue: '* Recargo nocturno después de las 21:00: +5€. Equipaje voluminoso (más de 3 maletas de 23Kg): +10€.' }),
        ]}),
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'highlight', media: 'backgroundImage' } },
})
