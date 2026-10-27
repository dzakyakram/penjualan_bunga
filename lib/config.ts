export const STORE_NAME = 'Toko Bunga'

/** Nomor WhatsApp toko, format internasional tanpa tanda + (contoh: 6281234567890). */
export const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? '6281234567890'

/** Setiap kelipatan nominal ini = 1 poin loyalitas. */
export const POINT_UNIT = 10_000

/** Pelanggan dianggap tidak aktif bila tidak memesan selama sekian hari. */
export const INACTIVE_DAYS = 60

/** Pengingat tanggal penting ditampilkan sekian hari sebelumnya. */
export const REMINDER_WINDOW_DAYS = 30
