import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarList } from '@/components/bar-list'
import { PageTitle } from '@/components/page-title'
import { getAnalytics } from '@/lib/analytics'
import { INACTIVE_DAYS } from '@/lib/config'
import { waLink } from '@/lib/crm'
import { formatRupiah } from '@/lib/utils'

function Stat({ label, value, href, alert }: { label: string; value: string | number; href?: string; alert?: boolean }) {
  const body = (
    <div className="glass h-full rounded-3xl p-5 transition-transform hover:-translate-y-0.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${alert ? 'text-primary' : ''}`}>{value}</p>
    </div>
  )
  return href ? <Link href={href} className="rounded-3xl focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none">{body}</Link> : body
}

export default async function AdminDashboard() {
  const a = await getAnalytics()

  return (
    <div className="space-y-6">
      <PageTitle title="Dashboard" description="Ringkasan toko dan pelanggan." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Perlu verifikasi bayar" value={a.needVerify} href="/admin/pesanan?status=Menunggu+Bayar" alert={a.needVerify > 0} />
        <Stat label="Menunggu pembayaran" value={a.menungguBayar} href="/admin/pesanan?status=Menunggu+Bayar" />
        <Stat label="Pesanan khusus baru" value={a.newCustom} href="/admin/pesanan-khusus" alert={a.newCustom > 0} />
        <Stat label="Pesan pelanggan baru" value={a.newTickets} href="/admin/layanan" alert={a.newTickets > 0} />
        <Stat label="Pendapatan (selesai)" value={formatRupiah(a.revenue)} />
        <Stat label="Jumlah pelanggan" value={a.pelanggan} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Produk terlaris</CardTitle></CardHeader>
          <CardContent>
            <BarList
              empty="Belum ada penjualan."
              rows={a.topProducts.map((p) => ({ key: p.id, label: p.nama, value: p.jumlah, display: `${p.jumlah} terjual` }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pelanggan teratas</CardTitle></CardHeader>
          <CardContent>
            <BarList
              empty="Belum ada pelanggan yang berbelanja."
              rows={a.topCustomers.map((c) => ({
                key: c.id,
                label: c.nama,
                value: c.total,
                display: formatRupiah(c.total),
                hint: `${c.pesanan} pesanan`,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pelanggan tidak aktif</CardTitle>
          <p className="text-sm text-muted-foreground">Tidak memesan selama {INACTIVE_DAYS} hari atau lebih.</p>
        </CardHeader>
        <CardContent>
          {a.inactive.length === 0 ? (
            <p className="text-sm text-muted-foreground">Semua pelanggan masih aktif.</p>
          ) : (
            <ul className="divide-y divide-white/60">
              {a.inactive.slice(0, 8).map((c) => {
                const wa = waLink(
                  c.no_hp,
                  `Halo ${c.nama}, sudah lama kami tidak merangkaikan bunga untuk Anda. Ada koleksi baru yang mungkin cocok. Mau kami rekomendasikan?`
                )
                return (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium">{c.nama}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.pernahPesan ? `Terakhir memesan ${c.hari} hari lalu` : `Belum pernah memesan sejak mendaftar ${c.hari} hari lalu`}
                      </p>
                    </div>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline">Ajak kembali</Button></a>
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
        <CardHeader><CardTitle>Stok menipis (di bawah 10)</CardTitle></CardHeader>
        <CardContent>
          {a.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Semua stok aman.</p>
          ) : (
            <ul className="divide-y divide-white/60">
              {a.lowStock.slice(0, 8).map((p: any) => (
                <li key={p.id} className="flex justify-between py-2.5 text-sm">
                  <span>{p.nama}</span>
                  <span className={`font-semibold ${(p.stok ?? 0) === 0 ? 'text-destructive' : ''}`}>Sisa {p.stok ?? 0}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
