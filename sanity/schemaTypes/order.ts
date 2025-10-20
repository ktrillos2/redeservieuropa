import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Pedidos',
  type: 'document',
  fields: [
    defineField({
      name: 'whatsappTemplateKey',
      title: 'Plantilla WhatsApp (opcional)',
      type: 'reference',
      to: [{ type: 'whatsappTemplate' }],
      description: 'Selecciona una plantilla para generar un enlace rápido de WhatsApp.'
    }),

    defineField({
      name: 'orderNumber',
      title: 'Número de pedido',
      type: 'string',
      description: 'Identificador legible del pedido (ej: ORD-2025-0001)'
    }),

    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Nuevo', value: 'new' },
          { title: 'Pendiente de pago', value: 'pending' },
          { title: 'Pagado', value: 'paid' },
          { title: 'En proceso', value: 'processing' },
          { title: 'Completado', value: 'completed' },
          { title: 'Cancelado', value: 'cancelled' },
          { title: 'Fallido', value: 'failed' },
        ],
        layout: 'radio'
      },
      initialValue: 'new'
    }),

    defineField({
      name: 'payment',
      title: 'Pago',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'provider', title: 'Proveedor', type: 'string' }),
        defineField({ name: 'paymentId', title: 'ID de pago', type: 'string' }),
        defineField({ name: 'status', title: 'Estado de pago', type: 'string' }),
        defineField({ name: 'amount', title: 'Importe', type: 'number' }),
        defineField({ name: 'currency', title: 'Moneda', type: 'string', initialValue: 'EUR' }),
        defineField({
          name: 'requestedMethod',
          title: 'Método solicitado (web)',
          type: 'string',
          description: 'Preferencia elegida en la web (no forzada en Mollie).'
        }),
        defineField({ name: 'method', title: 'Método', type: 'string' }),
        defineField({ name: 'createdAt', title: 'Creado en', type: 'datetime' }),
        defineField({ name: 'paidAt', title: 'Pagado en', type: 'datetime' }),

        // 👇 NUEVOS (para depósitos/pago total)
        defineField({
          name: 'payFullNow',
          title: 'Pago completo ahora',
          type: 'boolean',
          description: 'Si el cliente pagó el 100% en lugar de depósito.'
        }),
        defineField({
          name: 'depositPercent',
          title: 'Porcentaje de depósito',
          type: 'number',
          description: 'Porcentaje cobrado ahora (ej: 10 para traslado, 20 para tour).',
          validation: (r) => r.min(0).max(100)
        }),

        defineField({ name: 'raw', title: 'Datos sin procesar (JSON)', type: 'text', rows: 6 }),
      ]
    }),

    {
      name: 'calendar',
      title: 'Google Calendar',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'eventId', type: 'string', title: 'Event ID' },
        { name: 'htmlLink', type: 'url', title: 'Event Link' },
        { name: 'createdAt', type: 'datetime', title: 'Creado en' },
      ],
    },

    defineField({
      name: 'contact',
      title: 'Contacto',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'name', title: 'Nombre', type: 'string' }),
        defineField({ name: 'email', title: 'Email', type: 'string' }),
        defineField({ name: 'phone', title: 'Teléfono', type: 'string' }),
        defineField({ name: 'referralSource', title: '¿Dónde nos conociste?', type: 'string' }),
      ]
    }),

    defineField({
      name: 'service',
      title: 'Servicio',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'type', title: 'Tipo', type: 'string', description: 'traslado | tour | evento' }),
        defineField({ name: 'title', title: 'Título/Label', type: 'string' }),
        defineField({ name: 'date', title: 'Fecha', type: 'date' }),
        defineField({ name: 'time', title: 'Hora', type: 'string' }),
        defineField({ name: 'passengers', title: 'Pasajeros / Cupos', type: 'number' }),

        defineField({ name: 'pickupAddress', title: 'Dirección de recogida', type: 'string' }),
        defineField({ name: 'dropoffAddress', title: 'Dirección de destino', type: 'string' }),

        defineField({ name: 'flightNumber', title: 'Número de vuelo', type: 'string' }),
        // 👇 NUEVOS (tiempos de vuelo)
        defineField({
          name: 'flightArrivalTime',
          title: 'Hora de llegada vuelo',
          type: 'string',
          description: 'HH:mm'
        }),
        defineField({
          name: 'flightDepartureTime',
          title: 'Hora de salida vuelo',
          type: 'string',
          description: 'HH:mm'
        }),

        defineField({ name: 'luggage23kg', title: 'Maletas 23kg', type: 'number' }),
        defineField({ name: 'luggage10kg', title: 'Maletas 10kg', type: 'number' }),

        // 👇 NUEVO (niños)
        defineField({
          name: 'ninos',
          title: 'Niños (0-12)',
          type: 'number',
          validation: (r) => r.min(0)
        }),

        defineField({ name: 'isNightTime', title: 'Recargo nocturno', type: 'boolean' }),
        defineField({ name: 'extraLuggage', title: 'Equipaje extra', type: 'boolean' }),
        defineField({ name: 'totalPrice', title: 'Total calculado', type: 'number' }),

        defineField({
          name: 'selectedPricingOption',
          title: 'Opción de precio',
          type: 'object',
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: 'label', title: 'Etiqueta', type: 'string' }),
            defineField({ name: 'price', title: 'Precio', type: 'number' }),
            defineField({ name: 'hours', title: 'Horas', type: 'number' }),
          ]
        }),

        // 👇 NUEVOS (depósito/pago completo a nivel servicio)
        defineField({
          name: 'payFullNow',
          title: 'Pago completo ahora (servicio)',
          type: 'boolean',
          description: 'Si este servicio se pagó al 100% en vez de depósito.'
        }),
        defineField({
          name: 'depositPercent',
          title: 'Porcentaje de depósito (servicio)',
          type: 'number',
          description: 'Porcentaje cobrado ahora para este servicio.',
          validation: (r) => r.min(0).max(100)
        }),

        defineField({ name: 'notes', title: 'Notas del cliente', type: 'text' }),
      ]
    }),

    defineField({
      name: 'metadata',
      title: 'Metadatos',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: 'source', title: 'Fuente', type: 'string' }),
        defineField({ name: 'createdAt', title: 'Creado en', type: 'datetime' }),
        defineField({ name: 'updatedAt', title: 'Actualizado en', type: 'datetime' }),
        defineField({ name: 'clientIp', title: 'IP cliente', type: 'string' }),
        defineField({ name: 'userAgent', title: 'User Agent', type: 'string' }),
      ]
    }),
  ],

  preview: {
    select: {
      title: 'orderNumber',
      status: 'status',
      amount: 'payment.amount',
      date: 'service.date',
      name: 'contact.name',
    },
    prepare({ title, status, amount, date, name }) {
      const who = title || name || 'Cliente'
      const amt = typeof amount === 'number' && Number.isFinite(amount) ? `€${amount.toFixed(2)}` : '€0.00'
      const st = (() => {
        switch (status) {
          case 'new': return 'nuevo'
          case 'pending': return 'pendiente'
          case 'paid': return 'pagado'
          case 'processing': return 'en proceso'
          case 'completed': return 'completado'
          case 'cancelled': return 'cancelado'
          case 'failed': return 'fallido'
          default: return String(status || 'nuevo')
        }
      })()
      return {
        title: `${who} – ${amt} – ${st}`,
        subtitle: date ? new Date(date).toLocaleDateString() : undefined,
      }
    }
  }
})

export const orderName = 'order'