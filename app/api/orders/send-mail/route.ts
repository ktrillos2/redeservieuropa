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
    await sanityClient.createIfNotExists({
      _id,
      _type: 'mailLock',
      paymentId,
      createdAt: new Date().toISOString(),
      sentAt: null,
    } as any)
    const existing = await sanityClient.getDocument(_id)
    if ((existing as any)?.sentAt) return false
    await sanityClient.patch(_id).set({ lockAt: new Date().toISOString() }).commit()
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

    // Construir datos de servicios
    const services = [{
      type: order.service?.type,
      title: order.service?.title,
      date: order.service?.date,
      time: order.service?.time,
      totalPrice: order.service?.totalPrice,
      pickupAddress: order.service?.pickupAddress,
      dropoffAddress: order.service?.dropoffAddress,
      flightNumber: order.service?.flightNumber,
      passengers: order.service?.passengers,
    }]
    console.log('[send-mail][DEBUG] Servicios:', services)
    const totalAmount = order.payment?.amount?.value ? Number(order.payment.amount.value) : (order.service?.totalPrice || 0)
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

    // Idempotencia: solo enviar correos si no se ha enviado antes
    let adminInfo = null
    let clientInfo = null
    const paymentId = order.payment?.paymentId
    let canSend = true
    if (paymentId) {
      const mailLock = await getMailLock(paymentId)
      if (mailLock?.sentAt) {
        canSend = false
        console.log('[send-mail][DEBUG] Correos ya enviados previamente, no se enviarán de nuevo.')
      }
    }
    if (canSend) {
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
    } else {
      console.log('[send-mail][DEBUG] Correos ya fueron enviados, no se repite.')
    }

    console.log('[send-mail][DEBUG] Proceso finalizado')
    return NextResponse.json({ ok: true, adminMessageId: (adminInfo as any)?.messageId, clientMessageId: (clientInfo as any)?.messageId })
  } catch (e: any) {
    console.error('[send-mail] error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
