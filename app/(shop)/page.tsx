import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Flower2, Gift, MessageCircle, Palette } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { Reminders } from '@/components/reminders'
import { getSessionUser } from '@/lib/auth'
import { getRatings } from '@/lib/crm-data'
import { formatRupiah } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const user = await getSessionUser()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const list = (products ?? []) as any[]
  const ratings = await getRatings(list.map((p) => p.id))
  const featured = list.find((p: any) => p.gambar_url) ?? list[0]

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
        <div className="hero-rise">
          <h1 className="text-[2.6rem] leading-[1.02] font-extrabold md:text-6xl">
            Bunga segar untuk hari yang ingin diingat.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Pilih buket, tentukan tanggal kirim, dan tulis kartu ucapan sendiri. Butuh warna atau ukuran tertentu? Kami rangkaikan khusus untuk Anda.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/produk">
              <Button size="lg">
                Lihat katalog <ArrowRight aria-hidden />
              </Button>
            </Link>
            <Link href="/pesanan-khusus">
              <Button size="lg" variant="outline">Pesan rangkaian khusus</Button>
            </Link>
          </div>
        </div>

        <div className="hero-rise hero-rise-2 relative mx-auto w-full max-w-md md:max-w-none">
          <div className="glass relative aspect-[4/5] overflow-hidden rounded-[2.5rem] p-2">
            <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
              {featured?.gambar_url ? (
                <Image
                  src={featured.gambar_url}
                  alt={featured.nama}
                  fill
                  priority
                  sizes="(min-width: 768px) 40vw, 90vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-white/30 text-primary/50">
                  <Flower2 className="size-24" aria-hidden />
                </div>
              )}
            </div>
          </div>
          {featured && (
            <Link
              href={`/produk/${featured.id}`}
              className="glass glass-lens absolute right-3 bottom-6 left-3 flex items-center justify-between gap-3 rounded-3xl p-4 transition-transform hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none md:right-[-1.25rem] md:left-auto md:w-72"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Terbaru di toko</span>
                <span className="block truncate font-semibold">{featured.nama_produk}</span>
                <span className="block font-bold text-primary">{formatRupiah(featured.harga)}</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-primary" aria-hidden />
            </Link>
          )}
        </div>
      </section>

      {user && <Reminders userId={user.id} />}

      <section>
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Produk terbaru</h2>
          <Link href="/produk" className="text-sm font-medium text-primary hover:underline">Semua produk</Link>
        </div>
        {list.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
            Belum ada produk. Tambahkan produk dari panel admin.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  nama_produk: p.nama,
                  harga: p.harga,
                  gambar_url: p.gambar_url,
                  rating: ratings.get(p.id) ?? null,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-label="Layanan" className="grid gap-4 md:grid-cols-3">
        {[
          { href: '/pesanan-khusus', icon: Palette, title: 'Rangkaian khusus', text: 'Tentukan jenis bunga, warna, ukuran, dan unggah gambar contoh. Kami kirim penawaran harga.' },
          { href: '/loyalitas', icon: Gift, title: 'Poin dan voucher', text: 'Setiap belanja menambah poin. Tukar poin dengan voucher untuk pembelian berikutnya.' },
          { href: '/bantuan', icon: MessageCircle, title: 'Tanya atau lapor', text: 'Hubungi kami lewat WhatsApp, kirim pertanyaan, atau catat keluhan pesanan.' },
        ].map(({ href, icon: Icon, title, text }) => (
          <Link key={href} href={href} className="group rounded-3xl focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none">
            <div className="glass h-full rounded-3xl p-6 transition-transform duration-300 group-hover:-translate-y-1">
              <span className="glass-primary mb-4 grid size-11 place-items-center rounded-2xl">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
