import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { VoucherPicker } from '@/components/voucher-picker'
import { requireUser } from '@/lib/auth'
import { POINT_UNIT } from '@/lib/config'
import { todayWIB } from '@/lib/crm'
import { formatRupiah } from '@/lib/utils'

export default async function CheckoutPage() {
  const user = await requireUser('/checkout')
  const supabase = await createClient()

  const { data } = await supabase.from('cart_items').select('*, products(*)').eq('user_id', user.id)
  const cartItems = (data ?? []) as any[]
  if (cartItems.length === 0) redirect('/keranjang')

  const [{ data: profile }, { data: uv }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_vouchers').select('id, kode, vouchers(nama, potongan, min_belanja)').eq('user_id', user.id).is('used_at', null),
  ])

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products?.harga || 0) * item.jumlah, 0)
  const vouchers = ((uv ?? []) as any[])
    .filter((v) => v.vouchers)
    .map((v) => ({
      id: v.id as string,
      kode: v.kode as string,
      nama: v.vouchers.nama as string,
      potongan: Number(v.vouchers.potongan),
      min_belanja: Number(v.vouchers.min_belanja),
    }))

  const t = todayWIB()
  const minDate = `${t.y}-${String(t.m).padStart(2, '0')}-${String(t.d).padStart(2, '0')}`

  return (
    <div>
      <PageTitle title="Checkout" description="Isi alamat, tanggal kirim, dan pesan untuk kartu ucapan." />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-lg font-semibold">Pengiriman</h2>
          <form id="checkout-form" action="/api/checkout" method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alamat_kirim">Alamat pengiriman</Label>
              <Textarea id="alamat_kirim" name="alamat_kirim" defaultValue={(profile as any)?.alamat || ''} minLength={10} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal_kirim">Tanggal kirim</Label>
              <Input id="tanggal_kirim" name="tanggal_kirim" type="date" min={minDate} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kartu_ucapan">Kartu ucapan (opsional)</Label>
              <Textarea id="kartu_ucapan" name="kartu_ucapan" placeholder="Tulis pesan yang akan dibacakan penerima" maxLength={300} />
            </div>
            <Button type="submit" size="lg" className="w-full">Buat pesanan</Button>
          </form>
        </section>

        <aside className="glass h-fit space-y-4 rounded-3xl p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">Ringkasan</h2>
          <ul className="space-y-1.5 text-sm">
            {cartItems.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>{item.products?.nama_produk} x{item.jumlah}</span>
                <span className="shrink-0">{formatRupiah((item.products?.harga || 0) * item.jumlah)}</span>
              </li>
            ))}
          </ul>
          <VoucherPicker subtotal={subtotal} vouchers={vouchers} formId="checkout-form" poinPerUnit={POINT_UNIT} />
        </aside>
      </div>
    </div>
  )
}
