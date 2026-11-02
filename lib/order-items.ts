import type { SupabaseClient } from '@supabase/supabase-js'
import { buildRow, getTableInfo } from '@/lib/db-schema'

type Admin = SupabaseClient<any, any, any>

export type OrderLine = { produk_id: string; jumlah: number; harga: number }

/** Samakan nama kolom baris order_items (jaga-jaga bila database memakai nama lain). */
export function normalizeItem(row: any) {
  return {
    ...row,
    produk_id: (row.produk_id ?? row.product_id ?? row.id_produk) as string,
    jumlah: Number(row.jumlah ?? row.quantity ?? row.qty ?? 0),
    harga_satuan: Number(row.harga_satuan ?? row.harga ?? row.price ?? row.unit_price ?? 0),
  }
}

/** Simpan isi pesanan. Coba nama kolom standar dulu; bila gagal, sesuaikan dengan struktur tabel asli. */
export async function insertOrderItems(admin: Admin, orderId: string, lines: OrderLine[]) {
  const standard = lines.map((l) => ({
    order_id: orderId,
    produk_id: l.produk_id,
    nama_produk: '',
    jumlah: l.jumlah,
    harga_satuan: l.harga,
    subtotal: l.harga * l.jumlah,
  }))
  const first = await admin.from('order_items').insert(standard as any)
  if (!first.error) return { error: null as null | { message: string } }
  console.error('[checkout] order_items gagal:', first.error.message)
  return { error: first.error }
}
