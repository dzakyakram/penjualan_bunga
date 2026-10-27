import { createAdminClient } from '@/lib/supabase/admin'
import { INACTIVE_DAYS } from '@/lib/config'
import { daysSince } from '@/lib/crm'

const COUNTED = ['Diproses', 'Dikirim', 'Selesai']

type Profile = { id: string; nama: string; no_hp: string | null; role: string; created_at: string | null }

/*
  Catatan: PostgREST membatasi satu permintaan sampai 1000 baris (pengaturan Supabase).
  Untuk toko dengan ribuan pesanan, pindahkan agregasi ini ke fungsi SQL / view.
*/
export async function getAnalytics() {
  const admin = createAdminClient()

  const [{ data: orders }, { data: profiles }, { data: products }] = await Promise.all([
    admin.from('orders').select('id, user_id, total, status, created_at'),
    admin.from('profiles').select('id, nama, no_hp, role, created_at'),
    admin.from('products').select('id, nama, stok, is_active'),
  ])

  const counted = (orders ?? []).filter((o: any) => COUNTED.includes(o.status))
  const profileOf = new Map<string, Profile>((profiles ?? []).map((p: any) => [p.id, p as Profile]))
  const productName = new Map((products ?? []).map((p: any) => [p.id, (p as any).nama]))

  // Produk terlaris
  const { data: items } = counted.length
    ? await admin.from('order_items').select('order_id, produk_id, jumlah').in('order_id', counted.map((o) => o.id))
    : { data: [] as { order_id: string; produk_id: string; jumlah: number }[] }
  const sold = new Map<string, number>()
  for (const it of items ?? []) sold.set(it.produk_id, (sold.get(it.produk_id) ?? 0) + it.jumlah)
  const topProducts = [...sold.entries()]
    .map(([id, jumlah]) => ({ id, nama: productName.get(id) ?? 'Produk dihapus', jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 5)

  // Pelanggan teratas dan terakhir memesan
  const perUser = new Map<string, { total: number; pesanan: number; last: string | null }>()
  for (const o of counted) {
    const cur = perUser.get(o.user_id) ?? { total: 0, pesanan: 0, last: null }
    cur.total += Number(o.total)
    cur.pesanan += 1
    if (!cur.last || (o.created_at && o.created_at > cur.last)) cur.last = o.created_at
    perUser.set(o.user_id, cur)
  }
  const topCustomers = [...perUser.entries()]
    .map(([id, v]) => ({ id, nama: profileOf.get(id)?.nama ?? 'Pelanggan', ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Pelanggan tidak aktif
  const inactive = (profiles ?? [])
    .filter((p) => p.role !== 'admin')
    .map((p) => {
      const stat = perUser.get(p.id)
      return {
        id: p.id,
        nama: p.nama,
        no_hp: p.no_hp,
        pernahPesan: !!stat,
        hari: stat ? daysSince(stat.last) : daysSince(p.created_at),
      }
    })
    .filter((p) => p.hari >= INACTIVE_DAYS)
    .sort((a, b) => b.hari - a.hari)

  const { data: pay } = await admin
    .from('payments')
    .select('order_id, bukti_bayar_url, status_verifikasi')
    .not('bukti_bayar_url', 'is', null)
    .eq('status_verifikasi', 'Menunggu')
  const waitingIds = new Set((orders ?? []).filter((o) => o.status === 'Menunggu Bayar').map((o) => o.id))
  const needVerify = (pay ?? []).filter((p) => waitingIds.has(p.order_id)).length

  const [{ count: newCustom }, { count: newTickets }] = await Promise.all([
    admin.from('custom_orders').select('id', { count: 'exact', head: true }).eq('status', 'Diterima'),
    admin.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'Baru'),
  ])

  return {
    pelanggan: (profiles ?? []).filter((p) => p.role !== 'admin').length,
    menungguBayar: (orders ?? []).filter((o) => o.status === 'Menunggu Bayar').length,
    needVerify,
    newCustom: newCustom ?? 0,
    newTickets: newTickets ?? 0,
    revenue: (orders ?? []).filter((o) => o.status === 'Selesai').reduce((n, o) => n + Number(o.total), 0),
    lowStock: (products ?? []).filter((p: any) => p.is_active && (p.stok ?? 0) < 10).sort((a: any, b: any) => (a.stok ?? 0) - (b.stok ?? 0)),
    topProducts,
    topCustomers,
    inactive,
  }
}

/** Pelanggan yang pernah membeli, beserta kategori favorit dan hari sejak pesanan terakhir. */
export async function getRepeatCandidates(minDays = 30) {
  const admin = createAdminClient()
  const { data: orders } = await admin
    .from('orders')
    .select('id, user_id, created_at')
    .in('status', ['Diproses', 'Dikirim', 'Selesai'])
  if (!orders?.length) return []

  const { data: items } = await admin
    .from('order_items')
    .select('order_id, produk_id, jumlah')
    .in('order_id', orders.map((o) => o.id))
  const { data: products } = await admin.from('products').select('id')
  const { data: profiles } = await admin.from('profiles').select('id, nama, no_hp').in('id', [...new Set(orders.map((o) => o.user_id))])

  const userOfOrder = new Map(orders.map((o) => [o.id, o.user_id]))

  const tally = new Map<string, number>()
  for (const it of items ?? []) {
    const u = userOfOrder.get(it.order_id)
    if (!u) continue
    tally.set(u, (tally.get(u) ?? 0) + (it.jumlah ?? 1))
  }

  const last = new Map<string, string | null>()
  for (const o of orders) {
    const cur = last.get(o.user_id)
    if (!cur || (o.created_at && o.created_at > cur)) last.set(o.user_id, o.created_at)
  }

  return (profiles ?? [])
    .map((p) => {
      return {
        id: p.id,
        nama: p.nama,
        no_hp: p.no_hp,
        kategori: null,
        hari: daysSince(last.get(p.id) ?? null),
      }
    })
    .filter((p) => p.hari >= minDays)
    .sort((a, b) => a.hari - b.hari)
}
