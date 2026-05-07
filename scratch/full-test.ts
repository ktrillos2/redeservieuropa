import { createClient } from 'next-sanity'
import dotenv from 'dotenv'
import { buildOrderEventPayload, createCalendarEvent } from '../lib/google-calendar'
import { sendMail } from '../lib/mailer'
import { renderClientThanksEmailMulti, renderAdminNewServicesEmailMulti } from '../lib/email-templates'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

async function test() {
  const paymentId = "tr_rAfG2Xrrraey7Hy8XZdGJ"
  console.log(`Testing with paymentId: ${paymentId}`)

  const orders = await client.fetch(`
    *[_type == "order" && payment.paymentId == $pid]{
      _id,
      contact{name,email,phone,referralSource},
      services[]{
        type,title,date,time,totalPrice,passengers,
        pickupAddress,dropoffAddress,
        flightNumber,
        luggage23kg,luggage10kg,ninos,isNightTime,
        payFullNow,depositPercent
      },
      payment{currency,method,requestedMethod,payFullNow,depositPercent},
      locale
    }
  `, { pid: paymentId })

  if (!orders || orders.length === 0) {
    console.error("No orders found for this paymentId")
    return
  }

  const order = orders[0]
  const services = order.services || []
  const locale = order.locale || 'es'

  console.log(`Found ${services.length} services. Creating calendar events...`)

  for (let idx = 0; idx < services.length; idx++) {
    const service = services[idx]
    const payload = buildOrderEventPayload({
      service,
      payment: order.payment,
      contact: order.contact
    })

    try {
      // includeAttendees: true para que llegue el correo de Google
      const evt = await createCalendarEvent(payload, `test-${paymentId}-${idx}`, true)
      console.log(`Calendar event created: ${evt.htmlLink}`)
      service.calendarLink = evt.htmlLink
    } catch (err) {
      console.error(`Error creating calendar event for service ${idx}:`, err)
    }
  }

  console.log("Sending confirmation emails...")

  const adminHtml = renderAdminNewServicesEmailMulti({
    mollieId: paymentId,
    amount: order.payment.amount || 0,
    currency: order.payment.currency || 'EUR',
    contact: order.contact,
    services,
    locale
  })

  const clientHtml = renderClientThanksEmailMulti({
    mollieId: paymentId,
    amount: order.payment.amount || 0,
    currency: order.payment.currency || 'EUR',
    contact: order.contact,
    services,
    locale
  })

  try {
    await sendMail({
      to: ['redeservieuropa@gmail.com'],
      subject: 'TEST: Nuevo agendamiento (Admin)',
      html: adminHtml
    })
    console.log("Admin email sent.")

    if (order.contact?.email) {
      await sendMail({
        to: order.contact.email,
        subject: 'TEST: Tu reserva confirmada (Cliente)',
        html: clientHtml
      })
      console.log(`Client email sent to ${order.contact.email}`)
    }
  } catch (err) {
    console.error("Error sending emails:", err)
  }
}

test()
