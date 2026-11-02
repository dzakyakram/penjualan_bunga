import type { SupabaseClient } from '@supabase/supabase-js'
import { buildRow, getTableInfo } from '@/lib/db-schema'

export type PaymentStatus = 'Menunggu' | 'Menunggu Verifikasi' | 'Valid' | 'Ditolak'

/** Status pembayaran. Kolom di database bernama `status` (kode lama memakai `status_verifikasi`). */
export function paymentStatus(payment: any): PaymentStatus {
  return (payment?.status ?? payment?.status_verifikasi ?? 'Menunggu') as PaymentStatus
}

/** Nama file di bucket `bukti-bayar` dari URL yang tersimpan, atau null bila bukan URL bucket. */
export function proofPath(url: string | null | undefined): string | null {
  const match = url?.match(/bukti-bayar\/([^?]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

/** URL bukti bayar yang bisa dibuka, baik bucket-nya publik maupun privat. */
export async function signedProofUrl(admin: SupabaseClient<any, any, any>, url: string | null | undefined) {
  if (!url) return null
  const path = proofPath(url)
  if (!path) return url
  try {
    const { data } = await admin.storage.from('bukti-bayar').createSignedUrl(path, 3600)
    return data?.signedUrl ?? url
  } catch {
    return url
  }
}

/** Ambil data pembayaran per pesanan (tanpa bergantung pada relasi tabel). Kunci: order_id. */
export async function getPaymentsByOrder(admin: SupabaseClient<any, any, any>, orderIds: string[]) {
  const map = new Map<string, any>()
  if (!orderIds.length) return map
  const { data, error } = await admin.from('payments').select('*').in('order_id', orderIds)
  if (error) console.error('Gagal membaca pembayaran:', error.message)
  const rows = ((data ?? []) as any[]).sort((a, b) => String(a.created_at ?? '').localeCompare(String(b.created_at ?? '')))
  for (const row of rows) map.set(row.order_id as string, row) // yang terbaru menimpa yang lama
  return map
}

/**
 * Simpan bukti bayar: perbarui baris pembayaran yang ada, atau buat baru.
 * Bila ada kolom yang tidak dikenal database, payload disesuaikan dengan struktur tabel asli.
 */
export async function savePayment(
  admin: SupabaseClient<any, any, any>,
  orderId: string,
  existing: any | null,
  buktiUrl: string
) {
  const now = new Date().toISOString()
  const run = (row: Record<string, unknown>) =>
    existing
      ? admin.from('payments').update(row as any).eq('id', existing.id)
      : admin.from('payments').insert({ order_id: orderId, ...row } as any)

  const attempts: Record<string, unknown>[] = [
    existing
      ? { bukti_bayar_url: buktiUrl, status: 'Menunggu Verifikasi', verifikator_id: null, verified_at: null, updated_at: now }
      : { metode: 'Transfer Bank', bukti_bayar_url: buktiUrl, status: 'Menunggu Verifikasi' },
    { bukti_bayar_url: buktiUrl, status: 'Menunggu' },
    { bukti_bayar_url: buktiUrl, status: 'Menunggu Verifikasi' },
  ]
  let lastError: { message: string } | null = null
  for (const row of attempts) {
    const { error } = await run(row)
    if (!error) return { error: null }
    lastError = error
  }

  // Cadangan terakhir: pakai nama kolom yang benar-benar ada di database
  const info = await getTableInfo('payments')
  if (info) {
    const row = buildRow(info, [
      [['bukti_bayar_url', 'bukti_url', 'bukti', 'bukti_transfer'], buktiUrl],
      [['status', 'status_verifikasi'], 'Menunggu'],
      [['metode', 'metode_bayar'], 'Transfer Bank'],
    ])
    console.error('[bukti bayar] kolom payments di database:', info.columns.join(', '), '| wajib:', info.required.join(', '))
    const { error } = await run(row)
    if (!error) return { error: null }
    lastError = error
  }
  console.error('[bukti bayar] gagal menyimpan:', lastError?.message)
  return { error: lastError }
}
