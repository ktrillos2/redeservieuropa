import { z } from 'zod'

export const contactFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  telefono: z
    .string()
    .optional()
    .transform(v => (v || '').trim())
    .refine(v => !v || v.replace(/\D/g, '').length >= 6, 'Teléfono inválido (mínimo 6 dígitos).'),
  mensaje: z.string().min(10, 'El mensaje debe tener mínimo 10 caracteres.'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
