import Link from 'next/link'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageTitle } from '@/components/page-title'
import { OrderTracker } from '@/components/order-tracker'
import { requireUser } from '@/lib/auth'
import { orderStatusVariant } from '@/lib/crm'
import { formatDate, formatRupiah } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PesananPage() {
  const user = await requireUser('/pesanan')
  const supabase = await createClient()

  const { data } = await supabase
    .from('orders')
    .select('*, payments(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  const orders = (data ?? []) as any[]

  return (
    <div>
      <PageTitle title="Pesanan saya" description="Pantau status setiap pesanan dari diterima sampai selesai." />

      {orders.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <Package className="mx-auto size-10 text-primary/60" aria-hidden />
          <p className="mt-3 font-medium">Belum ada pesanan</p>
          <Link href="/produk" className="mt-5 inline-block"><Button>Mulai belanja</Button></Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments
            return (
              <li key={order.id} className="glass rounded-3xl p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      Dipesan {order.created_at ? formatDate(order.created_at) : ''} · Kirim {formatDate(order.tanggal_kirim)}
                    </p>
                  </div>
                  <Badge variant={orderStatusVariant(order.status)}>{order.status}</Badge>
                </div>

                <div className="my-5">
                  <OrderTracker status={order.status} />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-bold">{formatRupiah(order.total)}</p>
                  <div className="flex gap-2">
                    {order.status === 'Menunggu Bayar' && !payment?.bukti_bayar_url && (
                      <Link href={`/pesanan/${order.id}/bayar`}><Button size="sm">Bayar sekarang</Button></Link>
                    )}
                    <Link href={`/pesanan/${order.id}`}><Button size="sm" variant="outline">Detail</Button></Link>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
