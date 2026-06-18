"use server"

import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/mensajes/login`, {
    method: 'POST',
    body: formData,
    // Dejar que Next maneje cookies vía fetch interno
  })
  const data = await res.json()
  if (!res.ok || !data?.ok) return { ok: false, error: data?.error || 'Error al iniciar sesión' }
  redirect('/mensajes')
}

export async function logoutAction() {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/mensajes/logout`, { method: 'POST' })
  redirect('/mensajes')
}

export async function generateLinkAction(orderId: string, templateId?: string) {
  const fd = new FormData()
  fd.set('orderId', orderId)
  if (templateId) fd.set('templateId', templateId)
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/mensajes/generate-link`, { method: 'POST', body: fd })
  const data = await res.json()
  return data
}
