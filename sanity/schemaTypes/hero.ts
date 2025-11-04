import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'hero',
  title: 'Sección Principal',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'highlight', title: 'Texto destacado', type: 'string' }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Usa párrafos y estilos básicos. El contenido se renderiza justificado en el sitio.',
    }),
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
    
    // TRADUCCIONES
    defineField({
      name: 'translations',
      title: 'Traducciones',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        // INGLÉS
        {
          name: 'en',
          title: 'English',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            { name: 'title', title: 'Title', type: 'string' },
            { name: 'highlight', title: 'Highlight Text', type: 'string' },
            {
              name: 'description',
              title: 'Description',
              type: 'array',
              of: [{ type: 'block' }],
            },
            {
              name: 'primaryCta',
              title: 'Primary CTA',
              type: 'object',
              fields: [
                { name: 'label', title: 'Label', type: 'string' },
              ],
            },
            {
              name: 'secondaryCta',
              title: 'Secondary CTA',
              type: 'object',
              fields: [
                { name: 'label', title: 'Label', type: 'string' },
              ],
            },
            {
              name: 'bookingForm',
              title: 'Booking Form',
              type: 'object',
              fields: [
                { name: 'title', title: 'Form Title', type: 'string' },
                { name: 'ctaLabel', title: 'Button Label', type: 'string' },
                {
                  name: 'typePicker',
                  title: 'Type Picker',
                  type: 'object',
                  fields: [
                    { name: 'label', title: 'Label', type: 'string' },
                    { name: 'trasladoLabel', title: 'Transfer Label', type: 'string' },
                    { name: 'tourLabel', title: 'Tour Label', type: 'string' },
                  ],
                },
                { name: 'originField', title: 'Origin Field', type: 'object', fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                ]},
                { name: 'destinationField', title: 'Destination Field', type: 'object', fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                ]},
                { name: 'dateField', title: 'Date Field', type: 'object', fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                ]},
                { name: 'timeField', title: 'Time Field', type: 'object', fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                ]},
                { name: 'passengersField', title: 'Passengers Field', type: 'object', fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                  { name: 'singular', title: 'Singular', type: 'string' },
                  { name: 'plural', title: 'Plural', type: 'string' },
                ]},
                { name: 'vehicleField', title: 'Vehicle Field', type: 'object', fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                  { name: 'labelCoche', title: 'Car Label', type: 'string' },
                  { name: 'labelMinivan', title: 'Minivan Label', type: 'string' },
                  { name: 'labelVan', title: 'Van Label', type: 'string' },
                ]},
                { name: 'flightNumberField', title: 'Flight Number Field', type: 'object', fields: [
                  { name: 'label', title: 'Label', type: 'string' },
                  { name: 'placeholder', title: 'Placeholder', type: 'string' },
                ]},
                { name: 'notes', title: 'Notes', type: 'object', fields: [
                  { name: 'minivan6', title: 'Minivan 6 pax Note', type: 'string' },
                  { name: 'minivan5', title: 'Minivan 5 pax Note', type: 'string' },
                  { name: 'nightChargeNote', title: 'Night Charge Note', type: 'string' },
                  { name: 'surchargeFootnote', title: 'Surcharge Footnote', type: 'string' },
                ]},
              ],
            },
          ],
        },
        // FRANCÉS
        {
          name: 'fr',
          title: 'Français',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            { name: 'title', title: 'Titre', type: 'string' },
            { name: 'highlight', title: 'Texte en évidence', type: 'string' },
            {
              name: 'description',
              title: 'Description',
              type: 'array',
              of: [{ type: 'block' }],
            },
            {
              name: 'primaryCta',
              title: 'CTA Principal',
              type: 'object',
              fields: [
                { name: 'label', title: 'Libellé', type: 'string' },
              ],
            },
            {
              name: 'secondaryCta',
              title: 'CTA Secondaire',
              type: 'object',
              fields: [
                { name: 'label', title: 'Libellé', type: 'string' },
              ],
            },
            {
              name: 'bookingForm',
              title: 'Formulaire de Réservation',
              type: 'object',
              fields: [
                { name: 'title', title: 'Titre du Formulaire', type: 'string' },
                { name: 'ctaLabel', title: 'Libellé du Bouton', type: 'string' },
                {
                  name: 'typePicker',
                  title: 'Sélecteur de Type',
                  type: 'object',
                  fields: [
                    { name: 'label', title: 'Libellé', type: 'string' },
                    { name: 'trasladoLabel', title: 'Libellé Transfert', type: 'string' },
                    { name: 'tourLabel', title: 'Libellé Tour', type: 'string' },
                  ],
                },
                { name: 'originField', title: 'Champ Origine', type: 'object', fields: [
                  { name: 'label', title: 'Libellé', type: 'string' },
                ]},
                { name: 'destinationField', title: 'Champ Destination', type: 'object', fields: [
                  { name: 'label', title: 'Libellé', type: 'string' },
                ]},
                { name: 'dateField', title: 'Champ Date', type: 'object', fields: [
                  { name: 'label', title: 'Libellé', type: 'string' },
                ]},
                { name: 'timeField', title: 'Champ Heure', type: 'object', fields: [
                  { name: 'label', title: 'Libellé', type: 'string' },
                ]},
                { name: 'passengersField', title: 'Champ Passagers', type: 'object', fields: [
                  { name: 'label', title: 'Libellé', type: 'string' },
                  { name: 'singular', title: 'Singulier', type: 'string' },
                  { name: 'plural', title: 'Pluriel', type: 'string' },
                ]},
                { name: 'vehicleField', title: 'Champ Véhicule', type: 'object', fields: [
                  { name: 'label', title: 'Libellé', type: 'string' },
                  { name: 'labelCoche', title: 'Libellé Voiture', type: 'string' },
                  { name: 'labelMinivan', title: 'Libellé Minivan', type: 'string' },
                  { name: 'labelVan', title: 'Libellé Van', type: 'string' },
                ]},
                { name: 'flightNumberField', title: 'Champ Numéro de Vol', type: 'object', fields: [
                  { name: 'label', title: 'Libellé', type: 'string' },
                  { name: 'placeholder', title: 'Placeholder', type: 'string' },
                ]},
                { name: 'notes', title: 'Notes', type: 'object', fields: [
                  { name: 'minivan6', title: 'Note Minivan 6 pax', type: 'string' },
                  { name: 'minivan5', title: 'Note Minivan 5 pax', type: 'string' },
                  { name: 'nightChargeNote', title: 'Note Supplément de Nuit', type: 'string' },
                  { name: 'surchargeFootnote', title: 'Note de Bas de Page Supplément', type: 'string' },
                ]},
              ],
            },
          ],
        },
      ],
    }),
  ],
  preview: { select: { title: 'title', subtitle: 'highlight', media: 'backgroundImage' } },
})
