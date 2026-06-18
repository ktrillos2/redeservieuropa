import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'toursSection',
  title: 'Sección: Nuestros Tours',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Nuestros Tours' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'text', rows: 3, initialValue: 'Traslados cómodos con la máxima comodidad y puntualidad. Tarifas transparentes y servicio excepcional.' }),
    defineField({ name: 'footnote', title: 'Nota al pie', type: 'string' }),
    
    // Sección "Cotiza a tu gusto"
    defineField({
      name: 'customQuote',
      title: 'Cotiza a tu gusto',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Cotiza a tu gusto' }),
        defineField({
          name: 'transfers',
          title: 'Traslados',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Traslados punto A → punto B' }),
            defineField({ name: 'subtitle', title: 'Subtítulo', type: 'string', initialValue: 'Popular: De aeropuertos a la ciudad o Disneyland' }),
            defineField({ name: 'buttonLabel', title: 'Etiqueta del botón', type: 'string', initialValue: '¡Escríbenos!' }),
          ],
        }),
        defineField({
          name: 'tickets',
          title: 'Boletas',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Boletas Disneyland y barquito' }),
            defineField({ name: 'subtitle', title: 'Subtítulo', type: 'string', initialValue: 'Desde 85€ (Disney) y 15€ por persona (barquito)' }),
            defineField({ name: 'buttonLabel', title: 'Etiqueta del botón', type: 'string', initialValue: '¡Escríbenos!' }),
          ],
        }),
      ],
    }),

    // Sección "Cargos Adicionales"
    defineField({
      name: 'additionalCharges',
      title: 'Cargos Adicionales',
      type: 'object',
      fields: [
        defineField({ name: 'title', title: 'Título', type: 'string', initialValue: 'Cargos Adicionales' }),
        defineField({ name: 'nightCharge', title: 'Recargo nocturno', type: 'string', initialValue: 'Recargo nocturno después de las 21h: +5€' }),
        defineField({ name: 'extraPassenger', title: 'Pasajero adicional', type: 'string', initialValue: 'Pasajero adicional: +20€' }),
        defineField({ name: 'bulkyLuggage', title: 'Equipaje voluminoso', type: 'string', initialValue: 'Equipaje voluminoso (+3 maletas): +10€' }),
        defineField({ name: 'groupRates', title: 'Grupos', type: 'string', initialValue: 'Grupos de 5-8 personas: Tarifas especiales' }),
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
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Subtitle', type: 'text', rows: 3 }),
            defineField({
              name: 'customQuote',
              title: 'Custom Quote',
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({
                  name: 'transfers',
                  title: 'Transfers',
                  type: 'object',
                  fields: [
                    defineField({ name: 'title', title: 'Title', type: 'string' }),
                    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
                    defineField({ name: 'buttonLabel', title: 'Button Label', type: 'string' }),
                  ],
                }),
                defineField({
                  name: 'tickets',
                  title: 'Tickets',
                  type: 'object',
                  fields: [
                    defineField({ name: 'title', title: 'Title', type: 'string' }),
                    defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
                    defineField({ name: 'buttonLabel', title: 'Button Label', type: 'string' }),
                  ],
                }),
              ],
            }),
            defineField({
              name: 'additionalCharges',
              title: 'Additional Charges',
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Title', type: 'string' }),
                defineField({ name: 'nightCharge', title: 'Night Charge', type: 'string' }),
                defineField({ name: 'extraPassenger', title: 'Extra Passenger', type: 'string' }),
                defineField({ name: 'bulkyLuggage', title: 'Bulky Luggage', type: 'string' }),
                defineField({ name: 'groupRates', title: 'Group Rates', type: 'string' }),
              ],
            }),
          ],
        },
        // FRANCÉS
        {
          name: 'fr',
          title: 'Français',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            defineField({ name: 'subtitle', title: 'Sous-titre', type: 'text', rows: 3 }),
            defineField({
              name: 'customQuote',
              title: 'Devis personnalisé',
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Titre', type: 'string' }),
                defineField({
                  name: 'transfers',
                  title: 'Transferts',
                  type: 'object',
                  fields: [
                    defineField({ name: 'title', title: 'Titre', type: 'string' }),
                    defineField({ name: 'subtitle', title: 'Sous-titre', type: 'string' }),
                    defineField({ name: 'buttonLabel', title: 'Libellé du bouton', type: 'string' }),
                  ],
                }),
                defineField({
                  name: 'tickets',
                  title: 'Billets',
                  type: 'object',
                  fields: [
                    defineField({ name: 'title', title: 'Titre', type: 'string' }),
                    defineField({ name: 'subtitle', title: 'Sous-titre', type: 'string' }),
                    defineField({ name: 'buttonLabel', title: 'Libellé du bouton', type: 'string' }),
                  ],
                }),
              ],
            }),
            defineField({
              name: 'additionalCharges',
              title: 'Frais supplémentaires',
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Titre', type: 'string' }),
                defineField({ name: 'nightCharge', title: 'Supplément de nuit', type: 'string' }),
                defineField({ name: 'extraPassenger', title: 'Passager supplémentaire', type: 'string' }),
                defineField({ name: 'bulkyLuggage', title: 'Bagages volumineux', type: 'string' }),
                defineField({ name: 'groupRates', title: 'Tarifs de groupe', type: 'string' }),
              ],
            }),
          ],
        },
      ],
    }),
  ],
})
