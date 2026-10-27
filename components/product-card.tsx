import Link from 'next/link'
import Image from 'next/image'
import { Flower2 } from 'lucide-react'
import { Stars } from '@/components/stars'
import { formatRupiah } from '@/lib/utils'

export type ProductCardData = {
  id: string
  nama_produk: string
  harga: number
  gambar_url: string | null
  kategori?: string | null
  rating?: { avg: number; count: number } | null
}

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/produk/${product.id}`}
      className="group block rounded-3xl focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
    >
      <article className="glass h-full overflow-hidden rounded-3xl transition-transform duration-300 group-hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden">
          {product.gambar_url ? (
            <Image
              src={product.gambar_url}
              alt={product.nama_produk}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-white/30 text-primary/60">
              <Flower2 className="size-12" aria-hidden />
            </div>
          )}
        </div>
        <div className="space-y-1 p-4">
          {product.kategori && <p className="text-xs text-muted-foreground">{product.kategori}</p>}
          <h3 className="line-clamp-2 text-base leading-snug font-semibold">{product.nama_produk}</h3>
          {product.rating && product.rating.count > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Stars value={product.rating.avg} size={13} />
              <span>({product.rating.count})</span>
            </div>
          )}
          <p className="pt-1 text-lg font-bold text-primary">{formatRupiah(product.harga)}</p>
        </div>
      </article>
    </Link>
  )
}
