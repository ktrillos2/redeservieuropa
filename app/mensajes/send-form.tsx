"use client"

import { useMemo, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

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

  // Helper para formatear los servicios de una orden
  const formatOrderServices = (order: any) => {
    const services = order?.services || []
    if (services.length === 0) return 'Sin servicios'
    
    return services.map((s: any) => {
      const price = s.totalPrice ? `€${s.totalPrice}` : ''
      return `${s.title || s.type || 'Servicio'}${price ? ` (${price})` : ''}`
    }).join(' + ')
  }

  return (
    <div className="border rounded-lg p-6 space-y-6 bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Seleccionar servicio/cliente</label>
          <Select value={orderId} onValueChange={setOrderId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegir orden...">
                {orderId && (() => {
                  const selectedOrder = orders.find(o => o._id === orderId)
                  if (!selectedOrder) return 'Elegir orden...'
                  const displayName = selectedOrder?.contact?.name || 'Cliente'
                  const amount = selectedOrder?.payment?.amount ? `€${selectedOrder.payment.amount}` : ''
                  return `${displayName}${amount ? ` – ${amount}` : ''}`
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {orders.map(o => {
                const displayName = o?.contact?.name || 'Cliente'
                const displayPhone = o?.contact?.phone || ''
                const orderNum = o.orderNumber || ''
                const amount = o?.payment?.amount ? `€${o.payment.amount}` : ''
                const servicesLabel = formatOrderServices(o)
                
                return (
                  <SelectItem key={o._id} value={o._id} className="data-[highlighted]:text-white">
                    <div className="flex flex-col">
                      <span className="font-medium">{displayName} {amount && `– ${amount}`}</span>
                      <span className="font-small text-xs">
                        {displayPhone && `${displayPhone} · `}{orderNum && `${orderNum} · `}{servicesLabel}
                      </span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium">Plantilla</label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Elegir plantilla..." />
            </SelectTrigger>
            <SelectContent>
              {templates.map(t => (
                <SelectItem key={t._id} value={t._id} className="data-[highlighted]:text-white">
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selected && (
        <div className="text-sm bg-muted/50 border rounded-lg p-4 space-y-2">
          <div className="font-semibold text-base mb-2">Resumen de la orden</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground font-medium">Cliente:</span>{' '}
              <span className="font-medium">{selected.contact?.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Teléfono:</span>{' '}
              {selected.contact?.phone}
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Email:</span>{' '}
              {selected.contact?.email || '—'}
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Total:</span>{' '}
              <span className="font-semibold text-primary">
                €{selected.payment?.amount || 0}
              </span>
            </div>
          </div>
          
          {/* Servicios */}
          {selected.services && selected.services.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="font-medium mb-2">Servicios ({selected.services.length}):</div>
              <div className="space-y-2">
                {selected.services.map((srv: any, idx: number) => (
                  <div key={idx} className="bg-background rounded p-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{srv.title || srv.type || 'Servicio'}</div>
                        {srv.date && (
                          <div className="text-muted-foreground">
                            📅 {srv.date}{srv.time && ` · 🕐 ${srv.time}`}
                          </div>
                        )}
                        {srv.pickupAddress && (
                          <div className="text-muted-foreground">📍 {srv.pickupAddress}</div>
                        )}
                        {srv.dropoffAddress && (
                          <div className="text-muted-foreground">🎯 {srv.dropoffAddress}</div>
                        )}
                      </div>
                      {srv.totalPrice && (
                        <div className="font-semibold text-primary ml-2">€{srv.totalPrice}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button 
          onClick={onSend}
          disabled={!orderId || !templateId || loading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? 'Generando…' : 'Enviar mensaje'}
        </Button>
        {error && <span className="text-destructive text-sm">{error}</span>}
      </div>
    </div>
  )
}
