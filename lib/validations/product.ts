import { z } from 'zod'

export const categorySchema = z.object({
  nama_kategori: z.string().min(2, 'Nama kategori minimal 2 karakter'),
})

export const productSchema = z.object({
  nama_produk: z.string().min(3, 'Nama produk minimal 3 karakter'),
  deskripsi: z.string().optional().or(z.literal('')),
  harga: z.coerce.number().min(0, 'Harga minimal 0'),
  stok: z.coerce.number().int().min(0, 'Stok minimal 0'),
  kategori_id: z.string().uuid('Kategori tidak valid'),
  is_active: z.boolean().default(true),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type ProductInput = z.infer<typeof productSchema>
