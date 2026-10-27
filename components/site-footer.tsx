import Link from 'next/link'
import { STORE_NAME } from '@/lib/config'

export function SiteFooter() {
  return (
    <footer className="container-page pb-28 md:pb-10">
      <div className="glass-soft flex flex-col items-start justify-between gap-4 rounded-3xl p-5 text-sm md:flex-row md:items-center">
        <p className="text-muted-foreground">
          <span className="font-heading font-semibold text-foreground">{STORE_NAME}</span>
          {' '}merangkai bunga segar sesuai pesanan. Dikirim pada tanggal yang Anda pilih.
        </p>
        <nav aria-label="Tautan toko" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/produk" className="hover:underline">Katalog</Link>
          <Link href="/pesanan-khusus" className="hover:underline">Pesanan khusus</Link>
          <Link href="/loyalitas" className="hover:underline">Poin &amp; voucher</Link>
          <Link href="/bantuan" className="hover:underline">Bantuan</Link>
        </nav>
      </div>
    </footer>
  )
}
