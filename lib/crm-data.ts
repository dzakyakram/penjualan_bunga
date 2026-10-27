import { createAdminClient } from '@/lib/supabase/admin'
import { REMINDER_WINDOW_DAYS } from '@/lib/config'
import { daysSince, upcomingDates } from '@/lib/crm'

export type Rating = { avg: number; count: number }

/** Rata-rata rating per produk (ulasan yang disembunyikan tidak dihitung). */
export async function getRatings(productIds: string[]) {
  const map = new Map<string, Rating>()
  if (productIds.length === 0) return map
  const admin = createAdminClient()
  const { data } = await admin
    .from('reviews')
    .select('produk_id, rating')
    .in('produk_id', productIds)
    .eq('is_hidden', false)
  const sums = new Map<string, { sum: number; count: number }>()
  for (const r of data ?? []) {
    const s = sums.get(r.produk_id) ?? { sum: 0, count: 0 }
    s.sum += r.rating
    s.count += 1
    sums.set(r.produk_id, s)
  }
  for (const [id, s] of sums) map.set(id, { avg: s.sum / s.count, count: s.count })
  return map
}

const COUNTED: ('Diproses' | 'Dikirim' | 'Selesai')[] = ['Diproses', 'Dikirim', 'Selesai']

/** Data untuk pengingat dan penawaran terarah milik satu pelanggan. */
export async function getReminderData(userId: string) {
  const admin = createAdminClient()

  const { data: dates } = await admin
    .from('important_dates')
    .select('id, judul, tanggal')
    .eq('user_id', userId)
  const upcoming = upcomingDates(dates ?? [], REMINDER_WINDOW_DAYS)

  const { data: orders } = await admin
    .from('orders')
    .select('id, created_at, status')
    .eq('user_id', userId)
    .in('status', COUNTED)
    .order('created_at', { ascending: false })

  let favoriteCategory: { id: string; nama: string } | null = null
  const lastOrderDays = orders && orders.length ? daysSince(orders[0].created_at) : null

  if (orders && orders.length) {
    const { data: items } = await admin
      .from('order_items')
      .select('produk_id, jumlah')
      .in('order_id', orders.map((o) => o.id))
    const ids = [...new Set((items ?? []).map((i) => i.produk_id))]
    if (ids.length) {
      const { data: products } = await admin.from('products').select('id, kategori_id').in('id', ids)
      const catOf = new Map((products ?? []).map((p) => [p.id, p.kategori_id]))
      const tally = new Map<string, number>()
      for (const it of items ?? []) {
        const c = catOf.get(it.produk_id)
        if (c) tally.set(c, (tally.get(c) ?? 0) + it.jumlah)
      }
      const top = [...tally.entries()].sort((a, b) => b[1] - a[1])[0]
      if (top) {
        const { data: cat } = await admin.from('categories').select('id, nama_kategori').eq('id', top[0]).single()
        if (cat) favoriteCategory = { id: cat.id, nama: cat.nama_kategori }
      }
    }
  }

  return { upcoming, favoriteCategory, lastOrderDays }
}
