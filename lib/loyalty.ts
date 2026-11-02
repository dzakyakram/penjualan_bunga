import type { SupabaseClient } from '@supabase/supabase-js'
import { poinDariTotal } from '@/lib/crm'

/** Beri poin untuk pesanan selesai. Indeks unik di database mencegah poin ganda. */
export async function awardPoints(
  admin: SupabaseClient<any, any, any>,
  order: { id: string; user_id: string; total: number | string }
) {
  const poin = poinDariTotal(Number(order.total))
  if (poin <= 0) return
  await admin.from('loyalty_ledger').insert({
    user_id: order.user_id,
    order_id: order.id,
    poin,
    keterangan: `Belanja pesanan ${order.id.slice(0, 8).toUpperCase()}`,
  })
}
