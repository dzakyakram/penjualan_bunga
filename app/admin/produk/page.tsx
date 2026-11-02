import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/page-title'
import { formatRupiah } from '@/lib/utils'
import { deleteProduct } from '@/app/actions/produk-admin'

export const dynamic = 'force-dynamic'

export default async function AdminProdukPage() {
  const { admin } = await requireAdmin()
  const { data } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const products = (data ?? []) as any[]

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="Produk" description="Kelola produk, foto, dan detail yang ditampilkan pembeli." />
        <Link href="/admin/produk/baru"><Button>Tambah produk</Button></Link>
      </div>

      {products.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-muted-foreground">Belum ada produk.</div>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4">
              <div>
                <p className="font-semibold">{p.nama}</p>
                <p className="text-sm text-muted-foreground">{formatRupiah(p.harga)} · {p.is_active ? 'Aktif' : 'Nonaktif'}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/produk/${p.id}`} target="_blank"><Button size="sm" variant="outline">Lihat</Button></Link>
                <Link href={`/admin/produk/${p.id}`}><Button size="sm" variant="outline">Edit</Button></Link>
                <form action={deleteProduct}>
                  <input type="hidden" name="id" value={p.id} />
                  <Button size="sm" variant="destructive" type="submit">Hapus</Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
