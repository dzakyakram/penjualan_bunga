import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import Image from 'next/image'

export default async function HomePage() {
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(12)

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Toko Bunga</Link>
          <nav className="flex items-center gap-4">
            <Link href="/produk"><Button variant="ghost">Katalog</Button></Link>
            <Link href="/keranjang"><Button variant="ghost">Keranjang</Button></Link>
            <Link href="/login"><Button>Masuk</Button></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center py-12 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
          <h1 className="text-4xl font-bold mb-4">Toko Bunga Online</h1>
          <p className="text-lg text-muted-foreground mb-6">Pesan bunga untuk berbagai momen spesial</p>
          <Link href="/produk"><Button size="lg">Lihat Katalog</Button></Link>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Produk Terbaru</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((product: any) => (
              <Link key={product.id} href={`/produk/${product.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-square relative bg-muted">
                    if (product.gambar_url) {
                      <Image
                        src={product.gambar_url}
                        alt={product.nama_produk}
                        fill
                        className="object-cover"
                      />
                    } else {
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    }
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{product.nama}</h3>
                    <p className="font-bold text-lg">{formatRupiah(product.harga)}</p>
                    <p className="text-sm text-muted-foreground">Stok: {product.stok}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
