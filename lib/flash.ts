import { redirect } from 'next/navigation'

/** Kembali ke halaman dengan pesan yang ditampilkan sebagai toast. */
export function flash(path: string, type: 'ok' | 'error', message: string): never {
  const sep = path.includes('?') ? '&' : '?'
  redirect(`${path}${sep}${type}=${encodeURIComponent(message)}`)
}
