import { serverClient } from '@/sanity/lib/server-client'
import type { PortableTextBlock } from 'sanity'

function replaceVars(str: string, vars: Record<string, any>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k]
    return v === undefined || v === null ? '' : String(v)
  })
}

function normalizePhone(phone?: string) {
  if (!phone) return ''
  return phone.replace(/\D+/g, '')
}

function ptToWhatsapp(blocks: PortableTextBlock[], vars: Record<string, any>) {
  const lines: string[] = []
  for (const block of blocks) {
    if (block._type !== 'block') continue
    const children = (block as any).children || []
    let line = ''
    for (const span of children) {
      let text = replaceVars(String(span.text || ''), vars)
      const marks: string[] = span.marks || []
      // WhatsApp: *negrita* y _cursiva_
      if (marks.includes('strong')) text = `*${text}*`
      if (marks.includes('em')) text = `_${text}_`
      if (marks.includes('code')) text = `
${text}
`
      line += text
    }
    lines.push(line)
  }
  return lines.join('\n')
}

export async function buildWhatsappLinkFromOrder(orderId: string, templateId?: string) {
  const order = await serverClient.fetch<any>(
    `*[_type == "order" && _id == $id][0]{ _id, orderNumber, contact{name, phone, email}, service{type,title,date,time,pickupAddress,dropoffAddress}, payment{amount,currency}, whatsappTemplateKey->{ _id, body } }`,
    { id: orderId }
  )
  if (!order) throw new Error('Order not found')
  const phone = normalizePhone(order?.contact?.phone)
  let template: any = order?.whatsappTemplateKey
  if (templateId && (!template || template._id !== templateId)) {
    template = await serverClient.fetch<any>(`*[_type == "whatsappTemplate" && _id == $id][0]{ _id, body }`, { id: templateId })
  }
  const bodyBlocks: PortableTextBlock[] = (template?.body || []) as any
  const vars = {
    name: order?.contact?.name,
    phone: order?.contact?.phone,
    service: order?.service?.title || order?.service?.type,
    date: order?.service?.date,
    time: order?.service?.time,
    pickup: order?.service?.pickupAddress,
    dropoff: order?.service?.dropoffAddress,
    orderNumber: order?.orderNumber,
    amount: order?.payment?.amount,
    currency: order?.payment?.currency || 'EUR',
  }
  const text = ptToWhatsapp(bodyBlocks, vars)
  const encoded = encodeURIComponent(text)
  const link = `https://wa.me/${phone}?text=${encoded}`
  return { link, text, phone }
}
