import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Flower2, MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Stars } from '@/components/stars'
import { formatDate, formatRupiah } from '@/lib/utils'
import { storeWaLink } from '@/lib/crm'

export default async function ProdukDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  if (!data) notFound()
  const product = data as any

  // Ulasan dibaca di server agar pengunjung tanpa akun tetap bisa melihatnya.
  const admin = createAdminClient()
  const { data: reviewRows } = await admin
    .from('reviews')
    .select('id, user_id, rating, komentar, created_at')
    .eq('produk_id', id)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(20)
  const reviews = reviewRows ?? []
  const userIds = [...new Set(reviews.map((r: any) => r.user_id))]
  const { data: profiles } = userIds.length
    ? await admin.from('profiles').select('id, nama').in('id', userIds)
    : { data: [] as { id: string; nama: string }[] }
  const nameOf = new Map((profiles ?? []).map((p: any) => [p.id, p.nama]))
  const avg = reviews.length ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2 md:gap-10">
        <div className="glass relative aspect-square overflow-hidden rounded-[2rem] p-2">
          <div className="relative h-full w-full overflow-hidden rounded-[1.5rem]">
            {product.gambar_url ? (
              <Image src={product.gambar_url} alt={product.nama} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-white/30 text-primary/50">
                <Flower2 className="size-20" aria-hidden />
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-[2rem] p-6 md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">{product.nama}</h1>
          {reviews.length > 0 && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Stars value={avg} /> {avg.toFixed(1)} dari {reviews.length} ulasan
            </p>
          )}
          <p className="mt-4 text-3xl font-bold text-primary">{formatRupiah(product.harga)}</p>
          {product.deskripsi && <p className="mt-5 whitespace-pre-wrap">{product.deskripsi}</p>}
          {(product.keunggulan || product.bahan || product.cocok_untuk || product.perawatan) && (
            <div className="mt-6 space-y-4">
              {product.keunggulan && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Keunggulan Produk</h2>
                  <div className="whitespace-pre-wrap text-sm text-foreground/90">{product.keunggulan}</div>
                </div>
              )}
              {product.bahan && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Bahan</h2>
                  <div className="whitespace-pre-wrap text-sm text-foreground/90">{product.bahan}</div>
                </div>
              )}
              {product.cocok_untuk && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Cocok Untuk</h2>
                  <div className="whitespace-pre-wrap text-sm text-foreground/90">{product.cocok_untuk}</div>
                </div>
              )}
              {product.perawatan && (
                <div>
                  <h2 className="mb-2 text-lg font-semibold">Perawatan</h2>
                  <div className="whitespace-pre-wrap text-sm text-foreground/90">{product.perawatan}</div>
                </div>
              )}
            </div>
          )}

          <div className="mt-7 space-y-3">
            <form action="/api/cart/add" method="post" className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="produk_id" value={product.id} />
              <div className="space-y-1.5">
                <Label htmlFor="jumlah">Jumlah</Label>
                <Input id="jumlah" name="jumlah" type="number" min={1} defaultValue={1} className="w-24" />
              </div>
              <Button type="submit" size="lg">Tambah ke keranjang</Button>
            </form>
            <a
              href={storeWaLink(`Halo, saya tertarik dengan "${product.nama}". Apakah bisa dikirim ke alamat saya?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button variant="outline">
                <MessageCircle aria-hidden /> Tanya lewat WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>

      <section aria-labelledby="ulasan">
        <h2 id="ulasan" className="mb-4 text-2xl font-bold">Ulasan pembeli</h2>
        {reviews.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-muted-foreground">
            Belum ada ulasan. Ulasan muncul setelah pembeli menerima pesanannya.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r: any) => (
              <li key={r.id} className="glass rounded-3xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{nameOf.get(r.user_id) ?? 'Pembeli'}</p>
                  <Stars value={r.rating} size={14} />
                </div>
                {r.komentar && <p className="mt-2 text-sm">{r.komentar}</p>}
                {r.created_at && <p className="mt-2 text-xs text-muted-foreground">{formatDate(r.created_at)}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
