import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { updateProduct } from '@/app/actions/produk-admin'

export const dynamic = 'force-dynamic'

export default async function AdminEditProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { admin } = await requireAdmin()

  const { data: product } = await admin.from('products').select('*').eq('id', id).single()

  if (!product) notFound()

  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <Link href="/admin/produk" className="text-sm text-muted-foreground hover:underline">Kembali ke daftar produk</Link>
        <PageTitle title="Edit produk" description={(product as any).nama} />
      </div>

      <form action={updateProduct} className="glass space-y-5 rounded-3xl p-5 md:p-6" encType="multipart/form-data">
        <input type="hidden" name="id" value={product.id} />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="nama">Nama produk *</Label>
            <Input id="nama" name="nama" defaultValue={(product as any).nama} required />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="harga">Harga (Rp) *</Label>
            <Input id="harga" name="harga" type="number" min={0} defaultValue={(product as any).harga} required />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="gambar">Ganti gambar produk</Label>
            <Input id="gambar" name="gambar" type="file" accept="image/*" />
            {(product as any).gambar_url && <p className="text-xs text-muted-foreground">Gambar saat ini akan diganti jika upload file baru</p>}
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="deskripsi">Deskripsi produk</Label>
            <Textarea id="deskripsi" name="deskripsi" className="min-h-24" defaultValue={(product as any).deskripsi ?? ''} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="keunggulan">Keunggulan produk</Label>
            <Textarea id="keunggulan" name="keunggulan" className="min-h-24" defaultValue={(product as any).keunggulan ?? ''} placeholder="Tulis keunggulan produk, bisa baris per poin" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="bahan">Bahan</Label>
            <Textarea id="bahan" name="bahan" className="min-h-20" defaultValue={(product as any).bahan ?? ''} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="cocok_untuk">Cocok untuk</Label>
            <Textarea id="cocok_untuk" name="cocok_untuk" className="min-h-20" defaultValue={(product as any).cocok_untuk ?? ''} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="perawatan">Perawatan</Label>
            <Textarea id="perawatan" name="perawatan" className="min-h-20" defaultValue={(product as any).perawatan ?? ''} />
          </div>
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" name="is_active" defaultChecked={(product as any).is_active} />
            <span className="text-sm">Aktif (tampil di katalog)</span>
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Simpan perubahan</Button>
          <Link href="/admin/produk"><Button type="button" variant="outline">Batal</Button></Link>
        </div>
      </form>
    </div>
  )
}
