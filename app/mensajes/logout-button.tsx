"use client"

export default function LogoutButton() {
  async function onLogout() {
    try {
      await fetch('/api/mensajes/logout', { method: 'POST' })
    } catch {}
    window.location.href = '/mensajes'
  }
  return (
    <button type="button" onClick={onLogout} className="text-sm text-gray-600 underline">
      Salir
    </button>
  )
}
