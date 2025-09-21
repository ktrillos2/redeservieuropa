import React, { useEffect, useRef, useState } from 'react'
import type { StringInputProps } from 'sanity'
import { set, unset } from 'sanity'
import bcrypt from 'bcryptjs'

export default function PasswordHashInput(props: StringInputProps) {
  const { value, onChange, schemaType, /* elementProps,*/ readOnly } = props
  const [plain, setPlain] = useState('')
  const [hashing, setHashing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const mounted = useRef(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  function handleHash(pwd: string) {
    if (!pwd) {
      onChange(unset())
      setStatus('idle')
      return
    }
    try {
      setHashing(true)
      // Versión síncrona para evitar promesas/timers que pueden no resolverse en el Studio
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(pwd, salt)
      if (!mounted.current) return
      onChange(set(hash))
      setPlain('')
      setStatus('ok')
    } catch (e) {
      console.error('Error generando hash bcrypt:', e)
      setStatus('error')
    } finally {
      if (mounted.current) setHashing(false)
    }
  }

  return (
    <div>
      <label className="text-sm text-gray-700">Contraseña (se guardará como hash)</label>
      <div className="flex gap-2 items-center mt-1">
        <input
          type="password"
          placeholder="Escribe nueva contraseña"
          disabled={readOnly}
          value={plain}
          onChange={(e) => { setPlain(e.target.value); if (status !== 'idle') setStatus('idle') }}
          onBlur={() => handleHash(plain)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleHash(plain) } }}
          className="sanity-input sanity-input-text"
        />
        <button type="button" disabled={readOnly || hashing} onClick={() => handleHash(plain)} className="sanity-button">
          {hashing ? 'Hasheando…' : 'Generar hash'}
        </button>
      </div>
      {status === 'ok' && (
        <div className="mt-1 text-xs text-green-700">Hash actualizado correctamente.</div>
      )}
      {status === 'error' && (
        <div className="mt-1 text-xs text-red-700">Ocurrió un error generando el hash. Revisa la consola del navegador.</div>
      )}
      <div className="mt-2 text-xs text-gray-600">El valor almacenado es un hash bcrypt. No se guarda la contraseña en texto claro.</div>
      {value && (
        <div className="mt-2">
          <div className="text-xs text-gray-600 mb-1">Hash actual:</div>
          <textarea readOnly value={String(value)} className="sanity-input sanity-input-text" rows={2} />
        </div>
      )}
    </div>
  )
}
