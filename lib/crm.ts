import { POINT_UNIT, WA_NUMBER } from '@/lib/config'

export type OrderStatus = 'Menunggu Bayar' | 'Diproses' | 'Dikirim' | 'Selesai' | 'Batal'

/** Tahapan yang dilihat pelanggan: diterima -> dikerjakan -> dikirim -> selesai. */
export const ORDER_STEPS: { key: OrderStatus; label: string; hint: string }[] = [
  { key: 'Menunggu Bayar', label: 'Diterima', hint: 'Pesanan masuk, menunggu pembayaran' },
  { key: 'Diproses', label: 'Dikerjakan', hint: 'Bunga sedang dirangkai' },
  { key: 'Dikirim', label: 'Dikirim', hint: 'Dalam perjalanan ke alamat tujuan' },
  { key: 'Selesai', label: 'Selesai', hint: 'Pesanan sudah diterima' },
]

export const ORDER_STATUSES: OrderStatus[] = ['Menunggu Bayar', 'Diproses', 'Dikirim', 'Selesai', 'Batal']

export function stepIndex(status: string) {
  return ORDER_STEPS.findIndex((s) => s.key === status)
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'outline'

export function orderStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Menunggu Bayar': return 'warning'
    case 'Diproses': return 'info'
    case 'Dikirim': return 'default'
    case 'Selesai': return 'success'
    case 'Batal': return 'destructive'
    default: return 'secondary'
  }
}

export function customStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Diterima': return 'warning'
    case 'Penawaran': return 'info'
    case 'Dikerjakan': return 'default'
    case 'Selesai': return 'success'
    case 'Batal': return 'destructive'
    default: return 'secondary'
  }
}

export function ticketStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Baru': return 'warning'
    case 'Diproses': return 'info'
    case 'Selesai': return 'success'
    default: return 'secondary'
  }
}

/** Tanggal hari ini di zona WIB (Asia/Jakarta). */
export function todayWIB() {
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

/** Sisa hari menuju tanggal ini berikutnya (tahun diabaikan). 0 = hari ini. */
export function daysUntilAnnual(dateStr: string) {
  const [, m, d] = dateStr.split('-').map(Number)
  const t = todayWIB()
  const today = Date.UTC(t.y, t.m - 1, t.d)
  let target = Date.UTC(t.y, m - 1, d)
  if (target < today) target = Date.UTC(t.y + 1, m - 1, d)
  return Math.round((target - today) / 86_400_000)
}

export function formatDayMonth(dateStr: string) {
  const [, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(2000, m - 1, d)).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  })
}

export function daysLabel(days: number) {
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Besok'
  return `${days} hari lagi`
}

/** Selisih hari antara sekarang dan tanggal ISO (positif = sudah lewat). */
export function daysSince(iso: string | null | undefined) {
  if (!iso) return Infinity
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
}

export function normalizePhone(phone: string | null | undefined) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  if (digits.startsWith('8')) return '62' + digits
  return digits
}

export function waLink(phone: string | null | undefined, text: string) {
  const to = normalizePhone(phone)
  if (!to) return null
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`
}

export function storeWaLink(text: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
}

export function poinDariTotal(total: number) {
  return Math.max(0, Math.floor(total / POINT_UNIT))
}

export type UpcomingDate = {
  id: string
  judul: string
  tanggal: string
  days: number
  user_id?: string
}

export function upcomingDates<T extends { id: string; judul: string; tanggal: string }>(
  rows: T[],
  withinDays: number
): (T & { days: number })[] {
  return rows
    .map((r) => ({ ...r, days: daysUntilAnnual(r.tanggal) }))
    .filter((r) => r.days <= withinDays)
    .sort((a, b) => a.days - b.days)
}
