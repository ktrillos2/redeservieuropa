import { cookies } from 'next/headers'
import { serverClient } from '@/sanity/lib/server-client'
import SendForm from './send-form'
import LoginForm from './login-form'
import LogoutButton from './logout-button'

function isAuthed() {
  return cookies().get('mensajes_auth')?.value === '1'
}

async function getData() {
  const orders = await serverClient.fetch<any[]>(
    `*[_type == "order" && status == "paid" && defined(contact.phone)] | order(service.date desc) [0...200]{
      _id, orderNumber, contact{name, phone}, service{title, type, date, time, pickupAddress, dropoffAddress},
      whatsappTemplateKey->{ _id, title }
    }`
  )
  const templates = await serverClient.fetch<any[]>(
    `*[_type == "whatsappTemplate"] | order(title asc){ _id, title }`
  )
  return { orders, templates }
}

export default async function MensajesPage() {
  const authed = isAuthed()

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto mt-16 p-6 border rounded">
        <h1 className="text-xl font-semibold mb-4">Acceso a Mensajes</h1>
        <LoginForm />
        <p className="text-xs text-gray-500 mt-3">Usuarios en Sanity → Usuarios – Mensajes. Escribe la contraseña en “Contraseña (texto)” y al publicar se genera el hash automáticamente; luego el campo en texto se borra.</p>
      </div>
    )
  }

  const { orders, templates } = await getData()

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Mensajes de WhatsApp</h1>
        <LogoutButton />
      </div>

      <SendForm orders={orders} templates={templates} />
    </div>
  )
}

// OrderRow ahora es un Client Component separado
