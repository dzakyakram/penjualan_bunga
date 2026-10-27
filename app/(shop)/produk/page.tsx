import Link from 'next/link'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageTitle } from '@/components/page-title'
import { ProductCard } from '@/components/product-card'
import { getRatings } from '@/lib/crm-data'

export const dynamic = 'force-dynamic'

export default async function ProdukPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; kategori?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (params.q) query = query.ilike('nama', `%${params.q}%`)

  const { data: products } = await query

  const list = (products ?? []) as any[]
  const ratings = await getRatings(list.map((p) => p.id))

  return (
    <div>
      <PageTitle title="Katalog" description="Buket dan rangkaian siap pesan. Tanggal kirim dipilih saat checkout." />

      <form className="mb-6 flex gap-2" role="search">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input name="q" placeholder="Cari nama produk" defaultValue={params.q} className="pl-10" aria-label="Cari produk" />
        </div>
        <Button type="submit">Cari</Button>
      </form>

      {list.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <p className="font-medium">Tidak ada produk yang cocok</p>
          <p className="mt-1 text-sm text-muted-foreground">Coba kata kunci lain, atau minta rangkaian khusus.</p>
          <Link href="/pesanan-khusus" className="mt-4 inline-block"><Button variant="outline">Pesan rangkaian khusus</Button></Link>
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
    </div>
  )
}