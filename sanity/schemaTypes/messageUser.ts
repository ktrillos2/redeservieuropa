import { defineField, defineType } from 'sanity'
import PasswordPlainInput from '../components/PasswordPlainInput'

export default defineType({
  name: 'messageUser',
  title: 'Usuario de Mensajes',
  type: 'document',
  fields: [
    defineField({ name: 'username', title: 'Usuario', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'passwordPlain',
      title: 'Contraseña (texto)',
      type: 'string',
      description: 'Escribe aquí la contraseña en texto. Al publicar, se convierte en hash bcrypt y se borra este campo.',
      components: { input: PasswordPlainInput as any },
    }),
    defineField({
      name: 'passwordHash',
      title: 'Contraseña (hash bcrypt)',
      type: 'string',
      readOnly: true,
      validation: r => r.required(),
      description: 'Se genera automáticamente al publicar desde el campo de texto de contraseña.'
    }),
    defineField({ name: 'displayName', title: 'Nombre para mostrar', type: 'string' }),
    defineField({ name: 'role', title: 'Rol', type: 'string', options: { list: [
      { title: 'Operación', value: 'ops' },
      { title: 'Admin', value: 'admin' },
    ] } }),
    defineField({ name: 'active', title: 'Activo', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'username', subtitle: 'displayName', active: 'active' },
    prepare({ title, subtitle, active }) {
      return { title, subtitle: `${subtitle || ''}${active === false ? ' (inactivo)' : ''}` }
    }
  }
})

export const messageUserName = 'messageUser'
