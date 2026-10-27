import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Flower2, LifeBuoy } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OrderTracker } from '@/components/order-tracker'
import { StarInput, Stars } from '@/components/stars'
import { submitReview } from '@/app/actions/pesanan'
import { requireUser } from '@/lib/auth'
import { orderStatusVariant, poinDariTotal } from '@/lib/crm'
import { formatDate, formatRupiah } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PesananDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await requireUser(`/pesanan/${id}`)
  const supabase = await createClient()

  const { data } = await supabase
    .from('orders')
    .select('*, payments(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
  if (!data) notFound()
  const order = data as any
  const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments

  const admin = createAdminClient()

  // Signed URL for private bucket if needed
  if (payment?.bukti_bayar_url) {
    try {
      const url = payment.bukti_bayar_url as string
      const match = url.match(/bukti-bayar\/([^?]+)/)
      if (match?.[1]) {
        const { data: signed } = await admin.storage.from('bukti-bayar').createSignedUrl(decodeURIComponent(match[1]), 3600)
        if (signed?.signedUrl) {
          payment.bukti_bayar_url = signed.signedUrl
        }
      }
    } catch {}
  }
  const [{ data: itemRows }, { data: reviewRows }] = await Promise.all([
    admin.from('order_items').select('id, produk_id, jumlah, harga_satuan, products(nama, gambar_url)').eq('order_id', id),
    admin.from('reviews').select('produk_id, rating, komentar').eq('order_id', id).eq('user_id', user.id),
  ])
  const items = (itemRows ?? []) as any[]
  const reviewOf = new Map((reviewRows ?? []).map((r: any) => [r.produk_id, r]))
  const subtotal = Number(order.total) + Number(order.diskon ?? 0)
  const shortId = order.id.slice(0, 8).toUpperCase()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/pesanan" className="text-sm text-muted-foreground hover:underline">Semua pesanan</Link>
          <h1 className="mt-1 font-mono text-3xl font-bold">{shortId}</h1>
          <p className="text-sm text-muted-foreground">Dipesan {order.created_at ? formatDate(order.created_at) : ''}</p>
        </div>
        <Badge variant={orderStatusVariant(order.status)} className="h-7 px-3 text-sm">{order.status}</Badge>
      </div>

      <section className="glass rounded-3xl p-5 md:p-6" aria-label="Status pesanan">
        <OrderTracker status={order.status} />
        {order.status === 'Menunggu Bayar' && (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            {payment?.bukti_bayar_url ? (
              <p className="text-muted-foreground">
                Bukti bayar diterima ({payment.status || payment.status_verifikasi || 'Menunggu'}). Admin akan memverifikasi sebelum pesanan dikerjakan.
              </p>
            ) : (
              <>
                <p className="text-muted-foreground">Pesanan dikerjakan setelah pembayaran terverifikasi.</p>
                <Link href={`/pesanan/${order.id}/bayar`}><Button size="sm">Bayar sekarang</Button></Link>
              </>
            )}
          </div>
        )}
        {(payment?.status === 'Ditolak' || payment?.status_verifikasi === 'Ditolak') && (
          <p className="mt-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">
            Bukti bayar ditolak{payment.catatan ? `: ${payment.catatan}` : '.'} Unggah ulang bukti yang jelas.
          </p>
        )}
        {payment?.bukti_bayar_url && order.status !== 'Menunggu Bayar' && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-muted-foreground">Bukti pembayaran</p>
            <a href={payment.bukti_bayar_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-white/40">
              <img src={payment.bukti_bayar_url} alt="Bukti pembayaran" className="max-h-96 w-full object-contain bg-white/40" />
            </a>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="glass rounded-3xl p-5 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Isi pesanan</h2>
          <ul className="space-y-5">
            {items.map((it) => {
              const review = reviewOf.get(it.produk_id)
              return (
                <li key={it.id}>
                  <div className="flex items-center gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-white/40">
                      {it.products?.gambar_url ? (
                        <Image src={it.products.gambar_url} alt="" fill sizes="64px" className="object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-primary/50"><Flower2 aria-hidden /></div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/produk/${it.produk_id}`} className="line-clamp-2 font-medium hover:underline">
                        {(it.products as any)?.nama || (it.products as any)?.nama_produk}
                      </Link>
                      <p className="text-sm text-muted-foreground">{formatRupiah(it.harga_satuan)} x {it.jumlah}</p>
                    </div>
                    <p className="font-semibold">{formatRupiah(it.harga_satuan * it.jumlah)}</p>
                  </div>

                  {order.status === 'Selesai' && (
                    <div className="glass-soft mt-3 rounded-2xl p-4">
                      {review ? (
                        <div>
                          <Stars value={review.rating} />
                          {review.komentar && <p className="mt-1.5 text-sm">{review.komentar}</p>}
                          <p className="mt-1 text-xs text-muted-foreground">Ulasan Anda</p>
                        </div>
                      ) : (
                        <form action={submitReview} className="space-y-3">
                          <input type="hidden" name="order_id" value={order.id} />
                          <input type="hidden" name="produk_id" value={it.produk_id} />
                          <p className="text-sm font-medium">Bagaimana bunganya?</p>
                          <StarInput idPrefix={`rating-${it.id}`} />
                          <Textarea name="komentar" placeholder="Ceritakan kondisi bunga saat diterima (opsional)" className="min-h-20" />
                          <Button type="submit" size="sm">Kirim ulasan</Button>
                        </form>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="space-y-4">
          <section className="glass rounded-3xl p-5">
            <h2 className="mb-3 text-lg font-semibold">Rincian</h2>
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatRupiah(subtotal)}</dd></div>
              {Number(order.diskon) > 0 && (
                <div className="flex justify-between text-[oklch(0.4_0.1_160)]"><dt>Voucher</dt><dd>-{formatRupiah(order.diskon)}</dd></div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold"><dt>Total</dt><dd>{formatRupiah(order.total)}</dd></div>
            </dl>
            {order.status !== 'Selesai' && order.status !== 'Batal' && poinDariTotal(Number(order.total)) > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">Menambah {poinDariTotal(Number(order.total))} poin setelah pesanan selesai.</p>
            )}
          </section>

          <section className="glass rounded-3xl p-5">
            <h2 className="mb-3 text-lg font-semibold">Pengiriman</h2>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-muted-foreground">Tanggal kirim</dt><dd className="font-medium">{formatDate(order.tanggal_kirim)}</dd></div>
              <div><dt className="text-muted-foreground">Alamat</dt><dd className="whitespace-pre-wrap">{order.alamat_kirim}</dd></div>
              {order.kartu_ucapan && (
                <div><dt className="text-muted-foreground">Kartu ucapan</dt><dd className="whitespace-pre-wrap">{order.kartu_ucapan}</dd></div>
              )}
            </dl>
          </section>

          <Link href={`/bantuan?pesanan=${order.id}`} className="block">
            <Button variant="outline" className="w-full"><LifeBuoy aria-hidden /> Ada masalah dengan pesanan ini</Button>
          </Link>
        </aside>
      </div>
    </div>
  )
}
