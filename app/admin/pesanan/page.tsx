import { getPaymentsByOrder, paymentStatus, signedProofUrl } from '@/lib/payment'
import { ProofViewer } from '@/components/proof-viewer'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
import { PageTitle } from '@/components/page-title'
import { updateOrderStatus, verifyPayment } from '@/app/actions/admin'
import { ORDER_STATUSES, orderStatusVariant, waLink } from '@/lib/crm'
import { formatDate, formatRupiah } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPesananPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const { admin } = await requireAdmin()

  let q = admin.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
  if (status && (ORDER_STATUSES as string[]).includes(status)) q = q.eq('status', status as any)
  const { data } = await q
  const orders = (data ?? []) as any[]

  // URL bukti bayar yang bisa dibuka (bucket publik maupun privat)
  const paymentOf = await getPaymentsByOrder(admin, orders.map((o) => o.id))
  for (const payment of paymentOf.values()) {
    if (payment?.bukti_bayar_url) payment.bukti_bayar_url = await signedProofUrl(admin, payment.bukti_bayar_url)
  }

  const userIds = [...new Set(orders.map((o) => o.user_id))]
  const { data: profiles } = userIds.length
    ? await admin.from('profiles').select('id, nama, no_hp').in('id', userIds)
    : { data: [] as { id: string; nama: string; no_hp: string | null }[] }
  const customer = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <div>
      <PageTitle title="Pesanan" description="Verifikasi pembayaran, lalu geser status: dikerjakan, dikirim, selesai. Poin diberikan saat status Selesai." />

      <div className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
        <Link href="/admin/pesanan" className="shrink-0"><Button size="sm" variant={!status ? 'default' : 'outline'}>Semua</Button></Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/pesanan?status=${encodeURIComponent(s)}`} className="shrink-0">
            <Button size="sm" variant={status === s ? 'default' : 'outline'}>{s}</Button>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-muted-foreground">Tidak ada pesanan.</div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => {
            const c = customer.get(o.user_id)
            const payment = paymentOf.get(o.id)
            const wa = waLink(c?.no_hp, `Halo ${c?.nama ?? ''}, terkait pesanan ${o.id.slice(0, 8).toUpperCase()} di Toko Bunga: `)
            return (
              <li key={o.id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono font-semibold">{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{o.created_at ? formatDate(o.created_at) : ''}</p>
                  </div>
                  <Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge>
                </div>

                <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground">Pelanggan</p>
                    <p className="font-medium">{c?.nama ?? '-'}</p>
                    {wa ? (
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{c?.no_hp} (WhatsApp)</a>
                    ) : (
                      <p className="text-muted-foreground">HP belum diisi</p>
                    )}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Kirim {formatDate(o.tanggal_kirim)}</p>
                    <p className="whitespace-pre-wrap">{o.alamat_kirim}</p>
                    {o.kartu_ucapan && <p className="mt-1 text-muted-foreground">Kartu: {o.kartu_ucapan}</p>}
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-lg font-bold">{formatRupiah(o.total)}</p>
                    {Number(o.diskon) > 0 && <p className="text-xs text-muted-foreground">Termasuk voucher -{formatRupiah(o.diskon)}</p>}
                  </div>
                </div>

                <div className="glass-soft mt-4 space-y-3 rounded-2xl p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-muted-foreground">Pembayaran: </span>
                      <span className="font-medium">{payment?.bukti_bayar_url ? paymentStatus(payment) : 'Belum ada bukti'}</span>
                    </div>
                    {payment?.bukti_bayar_url && (paymentStatus(payment) === 'Menunggu' || paymentStatus(payment) === 'Menunggu Verifikasi') && (
                      <form action={verifyPayment} className="flex gap-2">
                        <input type="hidden" name="order_id" value={o.id} />
                        <Button size="sm" type="submit" name="hasil" value="Valid">Valid</Button>
                        <Button size="sm" variant="destructive" type="submit" name="hasil" value="Ditolak">Tolak</Button>
                      </form>
                    )}
                  </div>
                  {payment?.bukti_bayar_url ? (
                    <a href={payment.bukti_bayar_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">Lihat bukti pembayaran</Button>
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Pembeli belum mengunggah bukti pembayaran.</p>
                  )}
                </div>

                <form action={updateOrderStatus} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="id" value={o.id} />
                  <label htmlFor={`status-${o.id}`} className="sr-only">Ubah status pesanan {o.id.slice(0, 8)}</label>
                  <NativeSelect id={`status-${o.id}`} name="status" defaultValue={o.status} className="w-auto min-w-44">
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </NativeSelect>
                  <Button type="submit" variant="outline">Simpan status</Button>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
