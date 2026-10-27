import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { createCustomOrder } from '@/app/actions/layanan'
import { requireUser } from '@/lib/auth'
import { customStatusVariant, storeWaLink } from '@/lib/crm'
import { formatDate, formatRupiah } from '@/lib/utils'

const statusHint: Record<string, string> = {
  Diterima: 'Permintaan masuk. Kami sedang menghitung harga.',
  Penawaran: 'Penawaran harga sudah dikirim. Hubungi kami untuk menyetujui.',
  Dikerjakan: 'Rangkaian sedang dibuat.',
  Selesai: 'Pesanan khusus selesai.',
  Batal: 'Permintaan dibatalkan.',
}

export default async function PesananKhususPage() {
  const user = await requireUser('/pesanan-khusus')
  const supabase = await createClient()
  const { data } = await supabase
    .from('custom_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const requests = data ?? []

  return (
    <div>
      <PageTitle
        title="Pesanan khusus"
        description="Ceritakan rangkaian yang Anda bayangkan. Kami kirim penawaran harga sebelum mengerjakan."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass rounded-3xl p-6" aria-labelledby="form-custom">
          <h2 id="form-custom" className="mb-4 text-lg font-semibold">Permintaan baru</h2>
          <form action={createCustomOrder} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="jenis_bunga">Jenis bunga</Label>
                <Input id="jenis_bunga" name="jenis_bunga" placeholder="Mawar, tulip, baby breath" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warna">Warna</Label>
                <Input id="warna" name="warna" placeholder="Putih dengan aksen peach" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ukuran">Ukuran</Label>
                <Input id="ukuran" name="ukuran" placeholder="Buket sedang, 30 cm" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Anggaran (Rp, opsional)</Label>
                <Input id="budget" name="budget" type="number" min={0} step={1000} inputMode="numeric" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tanggal_dibutuhkan">Dibutuhkan tanggal (opsional)</Label>
                <Input id="tanggal_dibutuhkan" name="tanggal_dibutuhkan" type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referensi">Gambar referensi (opsional, maks. 5 MB)</Label>
              <Input id="referensi" name="referensi" type="file" accept="image/*" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catatan">Catatan tambahan</Label>
              <Textarea id="catatan" name="catatan" placeholder="Untuk acara apa, pita warna apa, tulisan di kartu, dan lainnya" />
            </div>
            <Button type="submit" size="lg">Kirim permintaan</Button>
          </form>
        </section>

        <section aria-labelledby="riwayat-custom">
          <h2 id="riwayat-custom" className="mb-4 text-lg font-semibold">Permintaan saya</h2>
          {requests.length === 0 ? (
            <div className="glass rounded-3xl p-6 text-muted-foreground">Belum ada permintaan.</div>
          ) : (
            <ul className="space-y-4">
              {requests.map((r) => (
                <li key={r.id} className="glass rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{r.jenis_bunga}, {r.warna}</p>
                      <p className="text-sm text-muted-foreground">{r.ukuran} · {r.created_at ? formatDate(r.created_at) : ''}</p>
                    </div>
                    <Badge variant={customStatusVariant(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{statusHint[r.status]}</p>
                  {r.harga_penawaran != null && (
                    <p className="mt-2 text-lg font-bold text-primary">Penawaran: {formatRupiah(Number(r.harga_penawaran))}</p>
                  )}
                  {r.catatan_admin && (
                    <p className="glass-soft mt-3 rounded-2xl p-3 text-sm"><span className="font-medium">Dari toko:</span> {r.catatan_admin}</p>
                  )}
                  {r.referensi_url && (
                    <div className="relative mt-3 h-28 w-28 overflow-hidden rounded-2xl">
                      <Image src={r.referensi_url} alt="Gambar referensi" fill sizes="112px" className="object-cover" />
                    </div>
                  )}
                  {r.status === 'Penawaran' && (
                    <a
                      href={storeWaLink(`Halo, saya setuju dengan penawaran pesanan khusus ${r.jenis_bunga} (${r.id.slice(0, 8).toUpperCase()}).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block"
                    >
                      <Button size="sm">Setujui lewat WhatsApp</Button>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
