import { z } from 'zod'

export const contactFormSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Email inválido.'),
  telefono: z
    .string()
    .min(1, 'El teléfono es requerido.')
    .refine(v => v.replace(/\D/g, '').length >= 8, 'Teléfono inválido (mínimo 8 dígitos).'),
  mensaje: z.string().min(10, 'El mensaje debe tener mínimo 10 caracteres.'),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
