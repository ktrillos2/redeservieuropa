import { NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { sendMail } from '@/lib/mailer'
import { renderBrandEmail } from '@/lib/email-templates'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const to = searchParams.get('to')
    if (!token || token !== process.env.MAIL_TEST_TOKEN) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const recipient = to || process.env.CONTACT_TO || process.env.SMTP_USER
    if (!recipient) return NextResponse.json({ ok: false, error: 'Missing recipient' }, { status: 400 })

    const subject = 'Correo de prueba – Redeservi Europa'
    const html = renderBrandEmail({
      title: 'Correo de prueba',
      intro: 'Este es un correo de prueba enviado desde el endpoint /api/mail/test.',
      contentHtml: `
        <p>Si ves este mensaje, la configuración SMTP está funcionando correctamente.</p>
        <p>Puedes cambiar el destinatario con el parámetro <code>?to=correo@dominio</code>.</p>
        <a class="button" href="${process.env.NEXT_PUBLIC_SITE_URL || '/'}">Ir al sitio</a>
      `,
      footerNote: 'Prueba técnica de correo. No responder.'
    })

    const info = await sendMail({ to: recipient, subject, html })
    return NextResponse.json({ ok: true, messageId: (info as any)?.messageId })
  } catch (e: any) {
    console.error('[mail/test] error', e)
    return NextResponse.json({ ok: false, error: e?.message || 'Error' }, { status: 500 })
  }
}
