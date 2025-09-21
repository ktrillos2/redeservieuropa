"use client"

import { useState } from 'react'

export default function LoginForm() {
  const [error, setError] = useState<string | undefined>(undefined)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setPending(true)
    try {
      const form = e.currentTarget
      const fd = new FormData(form)
      const res = await fetch('/api/mensajes/login', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data?.ok) {
        setError(data?.error || 'Error al iniciar sesión')
      } else {
        window.location.href = '/mensajes'
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión')
    }
    setPending(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Usuario</label>
        <input name="user" className="w-full border rounded px-3 py-2" placeholder="usuario" />
      </div>
      <div>
        <label className="block text-sm mb-1">Contraseña</label>
        <input name="pass" type="password" className="w-full border rounded px-3 py-2" />
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button className="w-full bg-black text-white rounded py-2 disabled:opacity-50" disabled={pending}>
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  )
}
