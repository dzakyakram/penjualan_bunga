import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PaymentProofForm } from '@/components/payment-proof-form'
import { PageTitle } from '@/components/page-title'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentsByOrder, paymentStatus, signedProofUrl } from '@/lib/payment'
import { orderStatusVariant } from '@/lib/crm'
import { formatRupiah } from '@/lib/utils'

export default async function BayarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/pesanan/${id}/bayar`)
  const supabase = await createClient()

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!data) redirect('/pesanan')
  const order = data as any
  const admin = createAdminClient()
  const payment = (await getPaymentsByOrder(admin, [order.id])).get(order.id)
  const canPay = order.status === 'Menunggu Bayar'
  const payStatus = paymentStatus(payment)
  const proofUrl = await signedProofUrl(admin, payment?.bukti_bayar_url)

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageTitle title="Pembayaran" />

      <section className="glass rounded-3xl p-6">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">No. pesanan</dt><dd className="font-mono font-semibold">{order.id.slice(0, 8).toUpperCase()}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Status</dt><dd><Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge></dd></div>
          {Number(order.diskon) > 0 && (
            <div className="flex justify-between"><dt className="text-muted-foreground">Potongan voucher</dt><dd>-{formatRupiah(order.diskon)}</dd></div>
          )}
          <div className="flex items-baseline justify-between border-t border-white/60 pt-3">
            <dt className="text-muted-foreground">Total yang ditransfer</dt>
            <dd className="text-2xl font-bold text-primary">{formatRupiah(order.total)}</dd>
          </div>
        </dl>
      </section>

      {canPay ? (
        <section className="glass space-y-4 rounded-3xl p-6">
          <h2 className="text-lg font-semibold">Transfer bank</h2>
          <div className="glass-soft rounded-2xl p-4">
            <p className="text-sm text-muted-foreground">Bank BCA</p>
            <p className="font-mono text-2xl font-semibold tracking-wide">1234567890</p>
            <p className="text-sm">a.n. Toko Bunga Online</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Transfer sesuai nominal di atas, lalu unggah bukti transfernya. Pesanan mulai dikerjakan setelah admin memverifikasi.
          </p>
          {proofUrl && payStatus === 'Ditolak' && (
            <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
              Bukti bayar sebelumnya ditolak{payment?.catatan ? `: ${payment.catatan}` : '.'} Unggah ulang bukti yang jelas dan sesuai nominal.
            </p>
          )}
          {proofUrl && payStatus !== 'Ditolak' && (
            <div className="space-y-2 rounded-2xl bg-white/50 p-3 text-sm">
              <p>Bukti bayar sudah diunggah dan menunggu verifikasi admin. Anda bisa menggantinya bila salah.</p>
              <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-white/40">
                <img src={proofUrl} alt="Bukti pembayaran yang sudah diunggah" className="max-h-60 w-full bg-white/40 object-contain" />
              </a>
            </div>
          )}
          <PaymentProofForm orderId={order.id} resubmit={!!proofUrl} />
        </section>
      ) : (
        <section className="glass rounded-3xl p-6 text-center text-muted-foreground">
          Pesanan ini tidak lagi menunggu pembayaran.
          <div className="mt-4"><Link href={`/pesanan/${order.id}`}><Button variant="outline">Lihat pesanan</Button></Link></div>
        </section>
      )}
    </div>
  )
}
