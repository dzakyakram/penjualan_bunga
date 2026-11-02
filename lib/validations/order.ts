import { z } from 'zod'

export const checkoutSchema = z.object({
  alamat_kirim: z.string().min(10, 'Alamat pengiriman minimal 10 karakter'),
  tanggal_kirim: z.string().min(1, 'Tanggal kirim wajib diisi'),
  kartu_ucapan: z.string().optional().or(z.literal('')),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
