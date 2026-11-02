'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { flash } from '@/lib/flash'

const ticketSchema = z.object({
  tipe: z.enum(['pertanyaan', 'keluhan']),
  subjek: z.string().min(3, 'Subjek minimal 3 karakter').max(100),
  pesan: z.string().min(10, 'Pesan minimal 10 karakter').max(2000),
  order_id: z.string().uuid().optional(),
})

export async function createTicket(formData: FormData) {
  const user = await requireUser('/bantuan')
  const parsed = ticketSchema.safeParse({
    tipe: formData.get('tipe'),
    subjek: String(formData.get('subjek') ?? '').trim(),
    pesan: String(formData.get('pesan') ?? '').trim(),
    order_id: String(formData.get('order_id') ?? '') || undefined,
  })
  if (!parsed.success) flash('/bantuan', 'error', parsed.error.issues[0].message)

  const supabase = await createClient()
  const { error } = await supabase.from('support_tickets').insert({
    user_id: user.id,
    tipe: parsed.data.tipe,
    subjek: parsed.data.subjek,
    pesan: parsed.data.pesan,
    order_id: parsed.data.order_id ?? null,
  })
  if (error) flash('/bantuan', 'error', 'Pesan belum terkirim. Coba lagi.')

  revalidatePath('/bantuan')
  flash(
    '/bantuan',
    'ok',
    parsed.data.tipe === 'keluhan' ? 'Keluhan tercatat. Kami akan menghubungi Anda.' : 'Pertanyaan terkirim'
  )
}

const customSchema = z.object({
  jenis_bunga: z.string().min(2, 'Jenis bunga wajib diisi').max(80),
  warna: z.string().min(2, 'Warna wajib diisi').max(80),
  ukuran: z.string().min(2, 'Ukuran wajib diisi').max(80),
  budget: z.coerce.number().min(0).optional(),
  tanggal_dibutuhkan: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  catatan: z.string().max(1000).optional(),
})

export async function createCustomOrder(formData: FormData) {
  const user = await requireUser('/pesanan-khusus')
  const parsed = customSchema.safeParse({
    jenis_bunga: String(formData.get('jenis_bunga') ?? '').trim(),
    warna: String(formData.get('warna') ?? '').trim(),
    ukuran: String(formData.get('ukuran') ?? '').trim(),
    budget: String(formData.get('budget') ?? '') || undefined,
    tanggal_dibutuhkan: String(formData.get('tanggal_dibutuhkan') ?? '') || undefined,
    catatan: String(formData.get('catatan') ?? '').trim() || undefined,
  })
  if (!parsed.success) flash('/pesanan-khusus', 'error', parsed.error.issues[0].message)

  let referensi_url: string | null = null
  const file = formData.get('referensi')
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith('image/')) flash('/pesanan-khusus', 'error', 'Referensi harus berupa gambar')
    if (file.size > 5 * 1024 * 1024) flash('/pesanan-khusus', 'error', 'Ukuran gambar maksimal 5 MB')
    const admin = createAdminClient()
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: upError } = await admin.storage
      .from('referensi-custom')
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type })
    if (upError) flash('/pesanan-khusus', 'error', 'Gambar referensi gagal diunggah. Coba lagi.')
    referensi_url = admin.storage.from('referensi-custom').getPublicUrl(path).data.publicUrl
  }

  const supabase = await createClient()
  const { error } = await supabase.from('custom_orders').insert({
    user_id: user.id,
    ...parsed.data,
    budget: parsed.data.budget ?? null,
    tanggal_dibutuhkan: parsed.data.tanggal_dibutuhkan ?? null,
    catatan: parsed.data.catatan ?? null,
    referensi_url,
  })
  if (error) flash('/pesanan-khusus', 'error', 'Permintaan belum terkirim. Coba lagi.')

  revalidatePath('/pesanan-khusus')
  flash('/pesanan-khusus', 'ok', 'Permintaan diterima. Kami akan mengirim penawaran harga.')
}
