'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { flash } from '@/lib/flash'
import { awardPoints } from '@/lib/loyalty'
import { normalizeItem } from '@/lib/order-items'

const reviewSchema = z.object({
  order_id: z.string().uuid(),
  produk_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1, 'Pilih rating 1 sampai 5').max(5, 'Pilih rating 1 sampai 5'),
  komentar: z.string().max(1000).optional(),
})

export async function submitReview(formData: FormData) {
  const user = await requireUser('/pesanan')
  const parsed = reviewSchema.safeParse({
    order_id: formData.get('order_id'),
    produk_id: formData.get('produk_id'),
    rating: formData.get('rating'),
    komentar: String(formData.get('komentar') ?? '').trim() || undefined,
  })
  const back = `/pesanan/${String(formData.get('order_id') ?? '')}`
  if (!parsed.success) flash(back, 'error', parsed.error.issues[0].message)
  const { order_id, produk_id, rating, komentar } = parsed.data

  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('id, status')
    .eq('id', order_id)
    .eq('user_id', user.id)
    .single()
  if (!order || order.status !== 'Selesai') flash(back, 'error', 'Ulasan bisa ditulis setelah pesanan selesai')

  const { data: orderItems } = await admin.from('order_items').select('*').eq('order_id', order_id)
  const inOrder = ((orderItems ?? []) as any[]).map(normalizeItem).some((it) => it.produk_id === produk_id)
  if (!inOrder) flash(back, 'error', 'Produk ini tidak ada di pesanan Anda')

  const { count: already } = await admin
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('order_id', order_id)
    .eq('produk_id', produk_id)
    .eq('user_id', user.id)
  if (already) flash(back, 'error', 'Anda sudah menulis ulasan untuk produk ini')

  const { error } = await admin.from('reviews').insert({
    user_id: user.id,
    order_id,
    produk_id,
    rating,
    komentar: komentar ?? null,
  })
  if (error) flash(back, 'error', 'Ulasan belum tersimpan. Coba lagi.')

  revalidatePath(back)
  revalidatePath(`/produk/${produk_id}`)
  flash(back, 'ok', 'Terima kasih, ulasan Anda tersimpan')
}

/** Pembeli menandai pesanan yang sedang dikirim sebagai sudah diterima. */
export async function confirmReceived(formData: FormData) {
  const user = await requireUser('/pesanan')
  const id = String(formData.get('order_id') ?? '')
  const back = `/pesanan/${id}`
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('id, user_id, total, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!order) flash('/pesanan', 'error', 'Pesanan tidak ditemukan')
  if (order!.status !== 'Dikirim') flash(back, 'error', 'Pesanan belum berstatus Dikirim')

  const { error } = await admin
    .from('orders')
    .update({ status: 'Selesai', updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) flash(back, 'error', 'Status belum tersimpan. Coba lagi.')

  await awardPoints(admin, order!)

  revalidatePath(back)
  revalidatePath('/pesanan')
  revalidatePath('/loyalitas')
  flash(back, 'ok', 'Terima kasih! Silakan beri ulasan untuk bunganya.')
}
