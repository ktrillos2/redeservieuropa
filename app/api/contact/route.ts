import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { z } from 'zod'
import { sendMail } from '@/lib/mailer'
import { renderBrandEmail } from '@/lib/email-templates'

const schema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  mensaje: z.string().min(10),
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Datos inválidos', issues: parsed.error.flatten() }, { status: 400 })
    }
    const { nombre, email, telefono, mensaje } = parsed.data

  const adminList = [process.env.CONTACT_TO, 'info@redeservieuropa.com', process.env.SMTP_USER].filter(Boolean) as string[]

    // Email al admin
    const adminSubject = `Nuevo contacto – ${nombre}`
    const adminHtml = renderBrandEmail({
      title: 'Nuevo mensaje de contacto',
      intro: 'Has recibido un nuevo mensaje desde la web de Redeservi Europa.',
      contentHtml: `
        <ul class="list">
          <li><b>Nombre:</b> ${nombre}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Teléfono:</b> ${telefono || '—'}</li>
        </ul>
        <p><b>Mensaje:</b></p>
        <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace">${mensaje}</pre>
      `,
      footerNote: 'Este email se generó automáticamente.'
    })

  // Enviar a todos los administradores (de-duplicado externo si hace falta)
  await Promise.all(adminList.map(to => sendMail({ to, subject: adminSubject, html: adminHtml, replyTo: email })))

    // Acuse de recibo al cliente
    const clientSubject = 'Hemos recibido tu mensaje'
    const clientHtml = renderBrandEmail({
      title: 'Gracias por contactarnos',
      intro: 'Hemos recibido tu mensaje y te responderemos a la brevedad.',
      contentHtml: `
        <p>Hola ${nombre},</p>
        <p>Este es el resumen de tu mensaje:</p>
        <ul class="list">
          <li><b>Nombre:</b> ${nombre}</li>
          <li><b>Email:</b> ${email}</li>
          <li><b>Teléfono:</b> ${telefono || '—'}</li>
        </ul>
        <p><b>Mensaje:</b></p>
        <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace">${mensaje}</pre>
        <p>Saludos,<br/>Equipo Redeservi Europa</p>
      `,
      footerNote: 'Si no realizaste esta acción, puedes ignorar este mensaje.'
    })
    await sendMail({ to: email, subject: clientSubject, html: clientHtml })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('[contact] error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
