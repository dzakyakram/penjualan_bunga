import Image from 'next/image'
import { requireAdmin } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { updateCustomOrder } from '@/app/actions/admin'
import { customStatusVariant, waLink } from '@/lib/crm'
import { formatDate, formatRupiah } from '@/lib/utils'

const STATUSES = ['Diterima', 'Penawaran', 'Dikerjakan', 'Selesai', 'Batal']

export default async function AdminPesananKhususPage() {
  const { admin } = await requireAdmin()
  const { data } = await admin.from('custom_orders').select('*').order('created_at', { ascending: false }).limit(100)
  const rows = data ?? []
  const userIds = [...new Set(rows.map((r) => r.user_id))]
  const { data: profiles } = userIds.length
    ? await admin.from('profiles').select('id, nama, no_hp').in('id', userIds)
    : { data: [] as { id: string; nama: string; no_hp: string | null }[] }
  const customer = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <div>
      <PageTitle title="Pesanan khusus" description="Isi harga penawaran, ubah status, dan beri catatan. Pelanggan melihatnya di halaman mereka." />
      {rows.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-muted-foreground">Belum ada permintaan.</div>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const c = customer.get(r.user_id)
            const wa = waLink(c?.no_hp, `Halo ${c?.nama ?? ''}, soal permintaan rangkaian ${r.jenis_bunga} (${r.warna}) Anda: `)
            return (
              <li key={r.id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.jenis_bunga}, {r.warna}</p>
                    <p className="text-sm text-muted-foreground">{r.ukuran} · {r.created_at ? formatDate(r.created_at) : ''}</p>
                  </div>
                  <Badge variant={customStatusVariant(r.status)}>{r.status}</Badge>
                </div>

                <div className="mt-4 grid gap-4 text-sm md:grid-cols-[1fr_auto]">
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Pelanggan:</span> {c?.nama ?? '-'}{' '}
                      {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">(WhatsApp)</a>}
                    </p>
                    {r.budget != null && <p><span className="text-muted-foreground">Anggaran:</span> {formatRupiah(Number(r.budget))}</p>}
                    {r.tanggal_dibutuhkan && <p><span className="text-muted-foreground">Dibutuhkan:</span> {formatDate(r.tanggal_dibutuhkan)}</p>}
                    {r.catatan && <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Catatan:</span> {r.catatan}</p>}
                  </div>
                  {r.referensi_url && (
                    <a href={r.referensi_url} target="_blank" rel="noopener noreferrer" className="relative block h-28 w-28 overflow-hidden rounded-2xl" aria-label="Buka gambar referensi">
                      <Image src={r.referensi_url} alt="Gambar referensi" fill sizes="112px" className="object-cover" />
                    </a>
                  )}
                </div>

                <form action={updateCustomOrder} className="glass-soft mt-4 grid gap-3 rounded-2xl p-4 md:grid-cols-2">
                  <input type="hidden" name="id" value={r.id} />
                  <div className="space-y-1.5">
                    <Label htmlFor={`st-${r.id}`}>Status</Label>
                    <NativeSelect id={`st-${r.id}`} name="status" defaultValue={r.status}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </NativeSelect>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`hg-${r.id}`}>Harga penawaran (Rp)</Label>
                    <Input id={`hg-${r.id}`} name="harga_penawaran" type="number" min={0} step={1000} defaultValue={r.harga_penawaran ?? ''} />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor={`ct-${r.id}`}>Catatan untuk pelanggan</Label>
                    <Textarea id={`ct-${r.id}`} name="catatan_admin" defaultValue={r.catatan_admin ?? ''} className="min-h-16" />
                  </div>
                  <div className="md:col-span-2"><Button type="submit">Simpan</Button></div>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
