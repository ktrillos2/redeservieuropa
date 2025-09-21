"use client"

import Link from 'next/link'
import { useState } from 'react'
import { generateLinkAction } from './actions'

export default function OrderRow({ order, templates }: { order: any, templates: any[] }) {
  const [templateId, setTemplateId] = useState<string | undefined>(order?.whatsappTemplateKey?._id)
  const [link, setLink] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  async function onGenerate() {
    setLoading(true)
    setError(undefined)
    const res = await generateLinkAction(order._id, templateId)
    if (res.ok) {
      setLink(res.link)
    } else {
      setError(res.error)
    }
    setLoading(false)
  }

  return (
    <tr className="border-t">
      <td className="p-2">{order.orderNumber || order._id}</td>
      <td className="p-2 whitespace-nowrap">{order.contact?.name} <span className="text-gray-500">({order.contact?.phone})</span></td>
      <td className="p-2">{order.service?.title || order.service?.type}</td>
      <td className="p-2">{order.service?.date}</td>
      <td className="p-2">{order.service?.time}</td>
      <td className="p-2">
        <select value={templateId} onChange={e => setTemplateId(e.target.value || undefined)} className="border rounded px-2 py-1">
          <option value="">(Elegir)</option>
          {templates.map(t => (
            <option key={t._id} value={t._id}>{t.title}</option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <button onClick={onGenerate} className="bg-emerald-600 text-white px-3 py-1 rounded disabled:opacity-50" disabled={loading || !templateId}>
          {loading ? 'Generando…' : 'Generar link'}
        </button>
        {link && (
          <Link href={link} target="_blank" className="ml-2 text-blue-600 underline">Abrir</Link>
        )}
        {error && <div className="text-red-600 text-xs mt-1">{error}</div>}
      </td>
    </tr>
  )
}
