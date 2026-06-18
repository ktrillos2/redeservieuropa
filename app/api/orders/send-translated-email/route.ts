// app/api/orders/send-translated-email/route.ts
import { NextResponse } from 'next/server'
import { sendMail } from '@/lib/mailer'
import { renderClientThanksEmailMulti } from '@/lib/email-templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { paymentId, locale, contact, services } = body

    if (!contact?.email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ error: 'Servicios requeridos' }, { status: 400 })
    }

    // Calcular el monto total pagado
    const totalAmount = services.reduce((acc: number, s: any) => acc + Number(s.totalPrice || 0), 0)
    
    // Calcular el monto pagado ahora (según depositPercent de cada servicio)
    const paidAmount = services.reduce((acc: number, s: any) => {
      const total = Number(s.totalPrice || 0)
      const percent = s.depositPercent || (s.type === 'tour' ? 20 : 10)
      return acc + (total * percent / 100)
    }, 0)

    // Generar el HTML del email traducido
    const clientHtml = renderClientThanksEmailMulti({
      mollieId: paymentId || 'N/A',
      amount: paidAmount,
      currency: 'EUR',
      contact,
      services,
      locale: locale || 'es', // 👈 Usar el locale del frontend
    })

    // Enviar el email
    await sendMail({
      to: contact.email,
      subject: locale === 'en' 
        ? 'Thank you for your payment!' 
        : locale === 'fr' 
        ? 'Merci pour votre paiement !'
        : '¡Gracias por tu pago!',
      html: clientHtml,
      from: 'Reservas Redeservi Europa <reservas@redeservieuropa.com>',
    })

    console.log(`✅ Email traducido enviado a ${contact.email} en idioma: ${locale}`)

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado correctamente',
      locale,
    })
  } catch (error: any) {
    console.error('❌ Error enviando email traducido:', error)
    return NextResponse.json(
      { error: error?.message || 'Error enviando email' }, 
      { status: 500 }
    )
  }
}
