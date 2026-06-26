import dotenv from 'dotenv'
import { buildOrderEventPayload, createCalendarEvent } from '../lib/google-calendar'
import { sendMail } from '../lib/mailer'
import { renderClientThanksEmailMulti } from '../lib/email-templates'
import { sendSms } from '../lib/sendSms'

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
      phone: "+573133087069"
    },
    service: {
      type: "traslado",
      title: "Reserva de Prueba (Mañana a las 3pm)",
      date: dateStr,
      time: "15:00",
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
    
    // 3. Enviar SMS al cliente
    console.log("Intentando enviar SMS al cliente...")
    const smsMessage = `¡Hola! Tu reserva ha sido confirmada exitosamente. Cualquier duda, por favor contáctanos al número de nuestra web. ¡Te esperamos!`;
    const smsResult = await sendSms(testOrder.contact.phone, smsMessage);
    if (smsResult.success) {
      console.log(`✅ SMS enviado al cliente con éxito. SID: ${smsResult.sid}`)
    } else {
      console.error(`❌ Error al enviar SMS al cliente: ${smsResult.error}`)
    }

    // 4. Enviar SMS al Administrador
    console.log("Intentando enviar SMS al administrador...")
    const adminPhone = '+33778706325';
    const firstServiceDate = testOrder.service.date;
    const adminUrl = 'https://redeservieuropa.com/admin';
    const adminSmsMessage = `¡Nueva Reserva Confirmada! Cliente: ${testOrder.contact.name}. Fecha: ${firstServiceDate}. Revisa en: ${adminUrl}`;
    const adminSmsResult = await sendSms(adminPhone, adminSmsMessage);
    if (adminSmsResult.success) {
      console.log(`✅ SMS enviado al admin con éxito. SID: ${adminSmsResult.sid}`)
    } else {
      console.error(`❌ Error al enviar SMS al admin: ${adminSmsResult.error}`)
    }

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
