import { NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/server-client'
import { sendMail } from '@/lib/mailer'
import { renderClientThanksEmailMulti, renderAdminNewServicesEmailMulti } from '@/lib/email-templates'

// Helpers de idempotencia por pago (mailLock en Sanity)
import { serverClient as sanityClient } from '@/sanity/lib/server-client'

async function getMailLock(paymentId: string): Promise<{ _id: string; sentAt?: string | null } | null> {
  const id = `mailLock.payment_${paymentId}`
  try {
    const doc = await sanityClient.getDocument(id)
    return doc as any
  } catch {
    return null
  }
}

async function acquireMailLock(paymentId: string): Promise<boolean> {
  const _id = `mailLock.payment_${paymentId}`
  try {
    // Crear el documento con sentAt=null si no existe
    await sanityClient.createIfNotExists({
      _id,
      _type: 'mailLock',
      paymentId,
      createdAt: new Date().toISOString(),
      sentAt: null,
    } as any)
    
    // Leer el estado actual
    const existing = await sanityClient.getDocument(_id)
    
    // Si ya está marcado como enviado, retornar false
    if ((existing as any)?.sentAt) {
      console.log('[send-mail][mail-lock] El lock ya está marcado como enviado.')
      return false
    }
    
    // Si tiene un lockAt reciente (menos de 30 segundos), otra instancia lo está procesando
    const lockAt = (existing as any)?.lockAt
    if (lockAt) {
      const lockTime = new Date(lockAt).getTime()
      const now = Date.now()
      if (now - lockTime < 30000) {
        console.log('[send-mail][mail-lock] El lock está siendo procesado por otra instancia.')
        return false
      }
    }
    
    // Marcar el lock como en proceso
    await sanityClient.patch(_id).set({ 
      lockAt: new Date().toISOString(),
      lockBy: 'send-mail'
    }).commit()
    
    return true
  } catch (e) {
    console.error('[send-mail][mail-lock] acquire error', e)
    return false
  }
}

async function markMailSent(paymentId: string) {
  const _id = `mailLock.payment_${paymentId}`
  try {
    await sanityClient.patch(_id).set({ sentAt: new Date().toISOString() }).commit()
  } catch (e) {
    console.error('[send-mail][mail-lock] mark sent error', e)
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    console.log('[send-mail][DEBUG] Inicio proceso de envío de correo')
    const data = await req.json()
    console.log('[send-mail][DEBUG] Datos recibidos:', data)
    const orderId = data.orderId
    if (!orderId) {
      console.log('[send-mail][DEBUG] Falta orderId')
      return NextResponse.json({ ok: false, error: 'Falta orderId' }, { status: 400 })
    }
    // Buscar el pedido en Sanity
    const order = await serverClient.getDocument(orderId)
    console.log('[send-mail][DEBUG] Pedido encontrado:', order)
    if (!order) {
      console.log('[send-mail][DEBUG] Pedido no encontrado')
      return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 })
    }
    if (order.status !== 'paid') {
      console.log('[send-mail][DEBUG] El pedido no está pagado')
      return NextResponse.json({ ok: false, error: 'El pedido no está pagado' }, { status: 400 })
    }

    // Construir datos de servicios desde el array
    const services = (order.services || []).map((s: any) => ({
      type: s?.type,
      title: s?.title,
      date: s?.date,
      time: s?.time,
      totalPrice: s?.totalPrice,
      pickupAddress: s?.pickupAddress,
      dropoffAddress: s?.dropoffAddress,
      flightNumber: s?.flightNumber,
      flightArrivalTime: s?.flightArrivalTime,
      flightDepartureTime: s?.flightDepartureTime,
      luggage23kg: s?.luggage23kg,
      luggage10kg: s?.luggage10kg,
      ninos: s?.ninos,
      passengers: s?.passengers,
      payFullNow: s?.payFullNow,
      depositPercent: s?.depositPercent,
    }))
    console.log('[send-mail][DEBUG] Servicios:', services)
    
    // Calcular total considerando depositPercent de cada servicio
    let totalAmount = 0
    for (const s of (order.services || [])) {
      const total = Number(s?.totalPrice || 0)
      const pct = s?.depositPercent || order.payment?.depositPercent || 
                 (s?.type === 'tour' ? 20 : s?.type === 'evento' ? 15 : 10)
      totalAmount += total * pct / 100
    }
    totalAmount = Number(totalAmount.toFixed(1))
    
    console.log('[send-mail][DEBUG] Total a enviar:', totalAmount)

    // Plantillas
    const adminHtml = renderAdminNewServicesEmailMulti({
      mollieId: order.payment?.paymentId || '',
      amount: totalAmount,
      currency: order.payment?.currency || 'EUR',
      method: order.payment?.method || null,
      services
    })
    const client = order.contact
    const clientHtml = client ? renderClientThanksEmailMulti({
      mollieId: order.payment?.paymentId || '',
      amount: totalAmount,
      currency: order.payment?.currency || 'EUR',
      contact: client,
      services
    }) : null
    console.log('[send-mail][DEBUG] Plantilla admin generada:', !!adminHtml)
    console.log('[send-mail][DEBUG] Plantilla cliente generada:', !!clientHtml)

    // Validar paymentId
    let adminInfo = null
    let clientInfo = null
    const paymentId = order.payment?.paymentId
    if (!paymentId) {
      console.error('[send-mail][ERROR] No se encontró paymentId en el pedido, no se puede enviar correo.')
      return NextResponse.json({ ok: false, error: 'No se encontró paymentId en el pedido.' }, { status: 400 })
    }
    
    // Idempotencia estricta: intentar adquirir el lock
    console.log('[send-mail][mailLock] Intentando adquirir lock para paymentId:', paymentId)
    const acquired = await acquireMailLock(paymentId)
    if (!acquired) {
      console.warn('[send-mail][mailLock] No se pudo adquirir el lock, correos ya enviados o en proceso.')
      return NextResponse.json({ ok: true, skipped: true, reason: 'mailLock-already-acquired' })
    }
    console.log('[send-mail][mailLock] Lock adquirido, procediendo con envío de correos.')
    // Enviar correo ADMIN
    try {
      console.log('[send-mail][DEBUG] Enviando correo ADMIN...')
      adminInfo = await sendMail({
        to: ['redeservieuropa@gmail.com'],
        bcc: 'info@redeservieuropa.com',
        subject: `Nuevos servicios confirmados – pedido ${orderId}`,
        html: adminHtml,
        from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>'
      })
      console.log('[send-mail][DEBUG] Correo ADMIN enviado:', adminInfo)
    } catch (e: any) {
      console.error('[send-mail][admin] error', e)
      return NextResponse.json({ ok: false, error: 'Error enviando correo admin', details: e?.message || String(e) }, { status: 500 })
    }
    // Enviar correo CLIENTE
    if (client?.email && clientHtml) {
      try {
        console.log('[send-mail][DEBUG] Enviando correo CLIENTE...')
        clientInfo = await sendMail({
          to: client.email,
          subject: '¡Gracias por tu pago!',
          html: clientHtml,
          from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>'
        })
        console.log('[send-mail][DEBUG] Correo CLIENTE enviado:', clientInfo)
      } catch (e: any) {
        console.error('[send-mail][cliente] error', e)
        return NextResponse.json({ ok: false, error: 'Error enviando correo cliente', details: e?.message || String(e) }, { status: 500 })
      }
    }
    // Marcar como enviado
    await markMailSent(paymentId)

    console.log('[send-mail][DEBUG] Proceso finalizado')
    return NextResponse.json({ ok: true, adminMessageId: (adminInfo as any)?.messageId, clientMessageId: (clientInfo as any)?.messageId })
  } catch (e: any) {
    console.error('[send-mail] error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
