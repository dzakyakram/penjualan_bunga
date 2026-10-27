import Image from 'next/image'
import Link from 'next/link'
import { Flower2, ShoppingBag, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/page-title'
import { requireUser } from '@/lib/auth'
import { formatRupiah } from '@/lib/utils'

export default async function KeranjangPage() {
  const user = await requireUser('/keranjang')
  const supabase = await createClient()

  const { data } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', user.id)
  const cartItems = (data ?? []) as any[]

  const total = cartItems.reduce((sum, item) => sum + (item.products?.harga || 0) * item.jumlah, 0)

  return (
    <div>
      <PageTitle title="Keranjang" />

      {cartItems.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <ShoppingBag className="mx-auto size-10 text-primary/60" aria-hidden />
          <p className="mt-3 font-medium">Keranjang masih kosong</p>
          <p className="mt-1 text-sm text-muted-foreground">Pilih bunga dari katalog, lalu kembali ke sini untuk checkout.</p>
          <Link href="/produk" className="mt-5 inline-block"><Button>Lihat katalog</Button></Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <ul className="space-y-3">
            {cartItems.map((item) => (
              <li key={item.id} className="glass flex items-center gap-4 rounded-3xl p-3 pr-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-white/40 md:size-24">
                  {item.products?.gambar_url ? (
                    <Image src={item.products.gambar_url} alt="" fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-primary/50"><Flower2 aria-hidden /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/produk/${item.produk_id}`} className="line-clamp-2 font-semibold hover:underline">
                    {item.products?.nama_produk}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatRupiah(item.products?.harga ?? 0)} x {item.jumlah}
                  </p>
                  <p className="font-bold text-primary">{formatRupiah((item.products?.harga || 0) * item.jumlah)}</p>
                </div>
                <form action="/api/cart/remove" method="post">
                  <input type="hidden" name="id" value={item.id} />
                  <Button variant="ghost" size="icon" type="submit" aria-label={`Hapus ${item.products?.nama_produk} dari keranjang`}>
                    <Trash2 aria-hidden />
                  </Button>
                </form>
              </li>
            ))}
          </ul>

          <aside className="glass h-fit rounded-3xl p-6 lg:sticky lg:top-24">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{formatRupiah(total)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Voucher dipilih di langkah berikutnya.</p>
            <Link href="/checkout" className="mt-5 block"><Button size="lg" className="w-full">Lanjut ke checkout</Button></Link>
          </aside>
        </div>
      )}
    </div>
  )
}
