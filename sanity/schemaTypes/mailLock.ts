import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'mailLock',
  title: 'Mail Lock (Idempotencia de correos)',
  type: 'document',
  fields: [
    defineField({ name: 'paymentId', title: 'ID de pago', type: 'string' }),
    defineField({ name: 'createdAt', title: 'Creado en', type: 'datetime' }),
    defineField({ name: 'lockAt', title: 'Lock adquirido en', type: 'datetime' }),
    defineField({ name: 'sentAt', title: 'Correo enviado en', type: 'datetime' }),
  ],
})
