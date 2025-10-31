import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { serverClient } from '@/sanity/lib/server-client'
import { buildOrderEventPayload, createCalendarEvent } from '@/lib/google-calendar'

export async function POST(req: NextRequest) {
  try {
    const expected = process.env.MAIL_TEST_TOKEN
    if (expected) {
      const token = new URL(req.url).searchParams.get('token')
      if (token !== expected) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const { paymentId } = await req.json().catch(() => ({})) as { paymentId?: string }
    if (!paymentId) return NextResponse.json({ ok: false, error: 'Missing paymentId' }, { status: 400 })
    
    const orders = await serverClient.fetch<any[]>(
      `*[_type == "order" && payment.paymentId == $pid]{ 
        _id, 
        calendar{eventId,htmlLink}, 
        contact, 
        services[]{
          type,title,date,time,totalPrice,passengers,
          pickupAddress,dropoffAddress,
          flightNumber,flightArrivalTime,flightDepartureTime,
          luggage23kg,luggage10kg,ninos,isNightTime,
          payFullNow,depositPercent
        },
        payment{payFullNow,depositPercent}
      }`, 
      { pid: paymentId }
    )
    
    if (!orders?.length) return NextResponse.json({ ok: false, error: 'No orders found' }, { status: 404 })
    
    const createdEvents: any[] = []
    
    // Crear un evento por cada servicio de cada orden
    for (const order of orders) {
      const services = order.services || []
      
      for (let idx = 0; idx < services.length; idx++) {
        const service = services[idx]
        
        // Calcular pago según depositPercent del servicio
        const total = Number(service?.totalPrice || 0)
        const pct = service?.depositPercent || order.payment?.depositPercent || 
                   (service?.type === 'tour' ? 20 : service?.type === 'evento' ? 15 : 10)
        const paidAmount = Number((total * pct / 100).toFixed(1))
        
        const payload = buildOrderEventPayload({
          service,
          payment: { ...order.payment, paidAmount, depositPercent: pct },
          contact: order.contact,
        })
        
        try {
          const evt = await createCalendarEvent(payload, `${paymentId}:${order._id}:${idx}`)
          if (evt?.id) {
            createdEvents.push({ orderId: order._id, serviceIdx: idx, eventId: evt.id, htmlLink: evt.htmlLink })
            console.log('[calendar/create] event created', { 
              orderId: order._id, 
              serviceIdx: idx, 
              eventId: evt.id 
            })
          }
        } catch (err) {
          console.error('[calendar/create] error', { 
            orderId: order._id, 
            serviceIdx: idx, 
            error: err?.message || err 
          })
        }
      }
    }
    
    return NextResponse.json({ ok: true, events: createdEvents })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
