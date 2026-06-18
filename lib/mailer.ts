import nodemailer, { type Transporter } from 'nodemailer'
let transporter: Transporter | null = null

function getEnv(name: string, fallback?: string) {
  const v = process.env[name]
  if (typeof v === 'string' && v.length > 0) return v
  if (fallback !== undefined) return fallback
  throw new Error(`[mailer] Falta variable de entorno: ${name}`)
}

export function getTransporter(): Transporter {
  if (transporter) return transporter
  const host = getEnv('SMTP_HOST')
  const port = Number(getEnv('SMTP_PORT', '587'))
  const user = getEnv('SMTP_USER')
  const pass = getEnv('SMTP_PASS')

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: false, // 587 STARTTLS
    auth: { user, pass },
    // En desarrollo, ignorar errores de certificado SSL
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
  })
  return transporter
}

export async function sendMail({ to, subject, html, text, from, replyTo, bcc }: {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  bcc?: string | string[]
}) {
  const tx = getTransporter()
  const smtpUser = process.env.SMTP_USER || ''
  // Usar como From visible el definido, pero el envelope.from será siempre el SMTP_USER para evitar bounces/DMARC
  const sender = from || process.env.SMTP_FROM || `Redeservi Europa <${smtpUser}>`
  // Normalizar destinatarios
  const toList = Array.isArray(to) ? to.filter(v => typeof v === 'string' && v.includes('@')) : [to].filter(v => typeof v === 'string' && (v as string).includes('@'))
  if (toList.length === 0) {
    throw new Error('No recipients defined (to)')
  }
  console.log('[mailer] sendMail attempt', { to: toList, bcc, subject, hasHtml: !!html, hasText: !!text, visibleFrom: sender, envelopeFrom: smtpUser })
  const info = await tx.sendMail({
    from: sender,
    to: toList,
    bcc,
    subject,
    html,
    text,
    replyTo: replyTo || process.env.SMTP_REPLY_TO,
    // Al definir envelope, incluir también los destinatarios para evitar EENVELOPE
    envelope: { from: smtpUser, to: toList },
  })
  console.log('[mailer] sendMail result', {
    messageId: (info as any)?.messageId,
    accepted: (info as any)?.accepted,
    rejected: (info as any)?.rejected,
    response: (info as any)?.response,
  })
  return info
}