import { requireAdmin } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTitle } from '@/components/page-title'
import { getRepeatCandidates } from '@/lib/analytics'
import { REMINDER_WINDOW_DAYS } from '@/lib/config'
import { daysLabel, formatDayMonth, upcomingDates, waLink } from '@/lib/crm'

export default async function AdminPemasaranPage() {
  const { admin } = await requireAdmin()
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  const { data: dateRows } = await admin.from('important_dates').select('id, user_id, judul, tanggal')
  const upcoming = upcomingDates(dateRows ?? [], REMINDER_WINDOW_DAYS)
  const userIds = [...new Set(upcoming.map((d) => d.user_id))]
  const { data: profiles } = userIds.length
    ? await admin.from('profiles').select('id, nama, no_hp').in('id', userIds)
    : { data: [] as { id: string; nama: string; no_hp: string | null }[] }
  const customer = new Map((profiles ?? []).map((p) => [p.id, p]))

  const repeat = await getRepeatCandidates(30)

  return (
    <div className="space-y-6">
      <PageTitle
        title="Pemasaran terarah"
        description="Hubungi pelanggan pada saat yang tepat. Tombol WhatsApp membuka pesan yang sudah terisi; Anda tinggal mengirimnya."
      />

      <Card>
        <CardHeader>
          <CardTitle>Tanggal penting {REMINDER_WINDOW_DAYS} hari ke depan</CardTitle>
          <CardDescription>Dari tanggal yang pelanggan simpan di akunnya.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada tanggal penting yang dekat.</p>
          ) : (
            <ul className="divide-y divide-white/60">
              {upcoming.map((d) => {
                const c = customer.get(d.user_id)
                const wa = waLink(
                  c?.no_hp,
                  `Halo ${c?.nama ?? ''}, ${d.judul} (${formatDayMonth(d.tanggal)}) tinggal ${d.days} hari lagi. Mau kami siapkan rangkaian bunga spesial? Lihat pilihannya di ${siteUrl}/produk`
                )
                return (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{c?.nama ?? '-'} · {d.judul}</p>
                      <p className="text-xs text-muted-foreground">{formatDayMonth(d.tanggal)} · {daysLabel(d.days)}</p>
                    </div>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener noreferrer"><Button size="sm">Kirim penawaran</Button></a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Nomor HP belum diisi</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pesan ulang dari riwayat pembelian</CardTitle>
          <CardDescription>Pelanggan yang terakhir memesan 30 hari lalu atau lebih, dengan kategori yang paling sering mereka beli.</CardDescription>
        </CardHeader>
        <CardContent>
          {repeat.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada pelanggan yang memenuhi syarat.</p>
          ) : (
            <ul className="divide-y divide-white/60">
              {repeat.slice(0, 20).map((c) => {
                const wa = waLink(
                  c.no_hp,
                  c.kategori
                    ? `Halo ${c.nama}, Anda pernah memesan ${c.kategori} di Toko Bunga. Ada pilihan ${c.kategori} baru minggu ini. Mau lihat? ${siteUrl}/produk`
                    : `Halo ${c.nama}, ada koleksi bunga baru di Toko Bunga. Mau lihat? ${siteUrl}/produk`
                )
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{c.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.kategori ? `Favorit: ${c.kategori} · ` : ''}Terakhir memesan {c.hari} hari lalu
                      </p>
                    </div>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">Kirim penawaran</Button></a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Nomor HP belum diisi</span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
