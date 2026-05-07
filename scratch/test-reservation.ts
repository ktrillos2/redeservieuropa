import dotenv from 'dotenv'
import { buildOrderEventPayload, createCalendarEvent } from '../lib/google-calendar'
import { sendMail } from '../lib/mailer'
import { renderClientThanksEmailMulti } from '../lib/email-templates'

dotenv.config({ path: '.env.local' })

async function test() {
  console.log("Iniciando reserva de prueba para mañana...")
  
  // Calcular fecha de mañana
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD
  
  const testOrder = {
    contact: {
      name: "Prueba de Sistema",
      email: "redeservieuropa@gmail.com", // Enviamos a la misma cuenta para validar
      phone: "+34 600 000 000"
    },
    service: {
      type: "traslado",
      title: "Reserva de Prueba (Tomorrow)",
      date: dateStr,
      time: "10:00",
      totalPrice: 50,
      passengers: 2,
      pickupAddress: "Aeropuerto de París-Orly",
      dropoffAddress: "Torre Eiffel",
      payFullNow: true
    },
    payment: {
      currency: "EUR",
      payFullNow: true,
      amount: 50,
      paymentId: "TEST-PAYMENT-" + Date.now()
    },
    locale: 'es'
  }

  console.log(`Fecha de prueba: ${dateStr}`)

  try {
    // 1. Crear Evento en Calendar
    console.log("Intentando crear evento en Google Calendar...")
    const payload = buildOrderEventPayload(testOrder)
    const evt = await createCalendarEvent(payload, "test-dedupe-" + Date.now(), true)
    console.log(`✅ Evento creado con éxito: ${evt.htmlLink}`)

    // 2. Enviar Correo
    console.log("Generando y enviando correo de confirmación...")
    const html = renderClientThanksEmailMulti({
      mollieId: testOrder.payment.paymentId,
      amount: testOrder.payment.amount,
      currency: testOrder.payment.currency,
      contact: testOrder.contact,
      services: [{ ...testOrder.service, calendarLink: evt.htmlLink }],
      locale: 'es'
    })

    await sendMail({
      to: testOrder.contact.email,
      subject: `Reserva de Prueba: ${testOrder.service.title}`,
      html: html
    })
    console.log(`✅ Correo enviado a ${testOrder.contact.email}`)
    
    console.log("\n🚀 PRUEBA FINALIZADA CON ÉXITO")
  } catch (err: any) {
    console.error("\n❌ LA PRUEBA FALLÓ")
    console.error("Error detalle:", err.message)
    
    if (err.message.includes("403") || err.message.includes("permission")) {
      console.log("\n💡 CAUSA PROBABLE: No has compartido el calendario de redeservieuropa@gmail.com con la cuenta de servicio.")
      console.log("Solución: Ve a Google Calendar -> Configuración -> Compartir -> Añade 'pagina-web@mythic-cocoa-472716-e6.iam.gserviceaccount.com' con permiso de edición.")
    } else if (err.message.includes("SMTP")) {
      console.log("\n💡 CAUSA PROBABLE: Error en las credenciales de Brevo/SMTP.")
    } else {
      console.log("\n💡 Revisa los logs de arriba para más detalles.")
    }
  }
}

test()
