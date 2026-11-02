import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { createProduct } from '@/app/actions/produk-admin'

export const dynamic = 'force-dynamic'

export default async function AdminProdukBaruPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-5">
        <Link href="/admin/produk" className="text-sm text-muted-foreground hover:underline">Kembali ke daftar produk</Link>
        <PageTitle title="Tambah produk" description="Isi detail produk agar tampil rapi di katalog." />
      </div>

      <form action={createProduct} className="glass space-y-5 rounded-3xl p-5 md:p-6" encType="multipart/form-data">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="nama">Nama produk *</Label>
            <Input id="nama" name="nama" required />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="harga">Harga (Rp) *</Label>
            <Input id="harga" name="harga" type="number" min={0} required />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="gambar">Gambar produk</Label>
            <Input id="gambar" name="gambar" type="file" accept="image/*" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="deskripsi">Deskripsi produk</Label>
            <Textarea id="deskripsi" name="deskripsi" className="min-h-24" placeholder="Deskripsi singkat produk" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="keunggulan">Keunggulan produk</Label>
            <Textarea id="keunggulan" name="keunggulan" className="min-h-24" placeholder="Tulis keunggulan produk, bisa baris per poin" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="bahan">Bahan</Label>
            <Textarea id="bahan" name="bahan" className="min-h-20" placeholder="Jenis bunga/bahan yang digunakan" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="cocok_untuk">Cocok untuk</Label>
            <Textarea id="cocok_untuk" name="cocok_untuk" className="min-h-20" placeholder="Ulang tahun, wisuda, anniversary, dll" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="perawatan">Perawatan</Label>
            <Textarea id="perawatan" name="perawatan" className="min-h-20" placeholder="Cara merawat bunga/rangkaian" />
          </div>
          <label className="flex items-center gap-2 md:col-span-2">
            <input type="checkbox" name="is_active" defaultChecked />
            <span className="text-sm">Aktif (tampil di katalog)</span>
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Simpan produk</Button>
          <Link href="/admin/produk"><Button type="button" variant="outline">Batal</Button></Link>
        </div>
      </form>
    </div>
  )
}
