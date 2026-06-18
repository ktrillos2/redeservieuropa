import React from 'react'
import type { DocumentActionComponent } from 'sanity'
import { useDocumentOperation } from 'sanity'
import bcrypt from 'bcryptjs'

// Reemplaza Publish para messageUser: hashea passwordPlain -> passwordHash, borra passwordPlain, luego publica
const hashOnPublish: DocumentActionComponent = (props) => {
  const { id, type, draft, published, onComplete } = props
  const { publish, patch } = useDocumentOperation(id, type)

  if (type !== 'messageUser') return null

  return {
    label: 'Publish',
    disabled: publish.disabled,
    onHandle: async () => {
      try {
        const doc = (draft || published) as any
        const plain = String(doc?.passwordPlain || '')
        const existingHash = String(doc?.passwordHash || '')
        if (!plain && !existingHash) {
          // Bloquea publicar si no hay ni hash ni contraseña en claro
          // eslint-disable-next-line no-alert
          alert('Debes establecer una contraseña antes de publicar este usuario.')
          return
        }
        if (plain) {
          const salt = bcrypt.genSaltSync(10)
          const hash = bcrypt.hashSync(plain, salt)
          // Aplicar patch: set hash y eliminar plain
          patch.execute([
            { set: { passwordHash: hash } },
            { unset: ['passwordPlain'] },
          ] as any)
        }
      } catch (e) {
        console.error('Error hasheando antes de publicar:', e)
      } finally {
        publish.execute()
        onComplete && onComplete()
      }
    }
  }
}

export default hashOnPublish
