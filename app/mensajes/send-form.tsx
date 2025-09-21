"use client"

import { useMemo, useState } from 'react'

export default function SendForm({ orders, templates }: { orders: any[], templates: any[] }) {
  const [orderId, setOrderId] = useState<string>('')
  const [templateId, setTemplateId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const selected = useMemo(() => orders.find(o => o._id === orderId), [orders, orderId])

  async function onSend() {
    setLoading(true)
    setError(undefined)
    try {
      const fd = new FormData()
      fd.set('orderId', orderId)
      if (templateId) fd.set('templateId', templateId)
      const resp = await fetch('/api/mensajes/generate-link', { method: 'POST', body: fd })
      const res = await resp.json()
      if (!resp.ok || !res?.ok) {
        setError(res?.error || 'No se pudo generar el enlace')
      } else if (res.link) {
        window.open(res.link, '_blank', 'noopener,noreferrer')
      }
    } catch (e: any) {
      setError(e?.message || 'No se pudo generar el enlace')
    }
    setLoading(false)
  }

  return (
    <div className="border rounded p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Seleccionar servicio/usuario</label>
          <select className="w-full border rounded px-2 py-2" value={orderId} onChange={e => setOrderId(e.target.value)}>
            <option value="">(Elegir)</option>
            {orders.map(o => {
              const type = (o?.service?.type || '').toLowerCase()
              const typeLabel = type === 'tour' ? 'Tour' : type === 'evento' ? 'Evento' : type === 'traslado' ? 'Traslado' : (type ? type : 'Servicio')
              const spec = o?.service?.title || ''
              const serviceLabel = spec ? `${typeLabel}: ${spec}` : typeLabel
              const displayNumber = o.orderNumber || ''
              const displayName = o?.contact?.name || ''
              const displayPhone = o?.contact?.phone || ''
              return (
                <option key={o._id} value={o._id}>
                  {displayName}{displayPhone ? ` (${displayPhone})` : ''}{displayNumber ? ` – ${displayNumber}` : ''} – {serviceLabel}
                </option>
              )
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Plantilla</label>
          <select className="w-full border rounded px-2 py-2" value={templateId} onChange={e => setTemplateId(e.target.value)}>
            <option value="">(Elegir)</option>
            {templates.map(t => (
              <option key={t._id} value={t._id}>{t.title}</option>
            ))}
          </select>
        </div>
      </div>

      {selected && (
        <div className="text-sm bg-gray-50 border rounded p-3">
          <div className="font-medium mb-1">Resumen</div>
          <div><span className="text-gray-600">Cliente:</span> {selected.contact?.name} ({selected.contact?.phone})</div>
          <div><span className="text-gray-600">Servicio:</span> {selected.service?.title || selected.service?.type}</div>
          <div><span className="text-gray-600">Fecha:</span> {selected.service?.date} {selected.service?.time}</div>
          {selected.service?.pickupAddress && (
            <div><span className="text-gray-600">Origen:</span> {selected.service?.pickupAddress}</div>
          )}
          {selected.service?.dropoffAddress && (
            <div><span className="text-gray-600">Destino:</span> {selected.service?.dropoffAddress}</div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button className="bg-emerald-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={!orderId || !templateId || loading} onClick={onSend}>
          {loading ? 'Generando…' : 'Enviar mensaje'}
        </button>
        {error && <span className="text-red-600 text-sm">{error}</span>}
      </div>
    </div>
  )
}
