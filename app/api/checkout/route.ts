import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

function back(request: Request, path: string, error?: string) {
  const url = new URL(path, request.url)
  if (error) url.searchParams.set('error', error)
  return NextResponse.redirect(url, 303)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return back(request, '/login')

  const formData = await request.formData()
  const alamat_kirim = String(formData.get('alamat_kirim') ?? '').trim()
  const tanggal_kirim = String(formData.get('tanggal_kirim') ?? '')
  const kartu_ucapan = String(formData.get('kartu_ucapan') ?? '')
  const userVoucherId = String(formData.get('user_voucher_id') ?? '')

  if (alamat_kirim.length < 10 || !tanggal_kirim) {
    return back(request, '/checkout', 'Alamat dan tanggal kirim wajib diisi')
  }

  const { data: items } = await supabase
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', user.id)
  const cartItems = (items ?? []) as any[]

  if (cartItems.length === 0) return back(request, '/keranjang')

  let subtotal = 0
  for (const item of cartItems) {
    const p = item.products
    if (!p) {
      return back(request, '/keranjang', 'Produk tidak ditemukan')
    }
    subtotal += Number(p.harga) * Number(item.jumlah || 1)
  }

  const admin = createAdminClient()

  // Voucher: klaim lebih dulu agar tidak bisa dipakai dua pesanan sekaligus
  let diskon = 0
  if (userVoucherId) {
    const { data: uv } = await admin
      .from('user_vouchers')
      .select('id, vouchers(potongan, min_belanja, is_active)')
      .eq('id', userVoucherId)
      .eq('user_id', user.id)
      .is('used_at', null)
      .single()
    const v = (uv as any)?.vouchers
    if (!uv || !v || !v.is_active) return back(request, '/checkout', 'Voucher tidak bisa dipakai')
    if (subtotal < Number(v.min_belanja)) {
      return back(request, '/checkout', 'Belanja belum mencapai minimum voucher')
    }
    const { data: claimed } = await admin
      .from('user_vouchers')
      .update({ used_at: new Date().toISOString() })
      .eq('id', userVoucherId)
      .is('used_at', null)
      .select('id')
    if (!claimed || claimed.length === 0) return back(request, '/checkout', 'Voucher sudah dipakai')
    diskon = Math.min(Number(v.potongan), subtotal)
  }

  const releaseVoucher = async () => {
    if (userVoucherId) {
      await admin.from('user_vouchers').update({ used_at: null, order_id: null }).eq('id', userVoucherId)
    }
  }

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user.id,
      total: subtotal - diskon,
      diskon,
      user_voucher_id: userVoucherId || null,
      alamat_kirim,
      tanggal_kirim,
      kartu_ucapan,
      status: 'Menunggu Bayar',
    })
    .select()
    .single()

  if (orderError || !order) {
    console.error(orderError)
    await releaseVoucher()
    return back(request, '/checkout', 'Pesanan belum bisa dibuat. Coba lagi.')
  }

  if (userVoucherId) {
    await admin.from('user_vouchers').update({ order_id: order.id }).eq('id', userVoucherId)
  }

  await admin.from('order_items').insert(
    cartItems.map((item) => ({
      order_id: order.id,
      produk_id: item.produk_id,
      jumlah: item.jumlah,
      harga_satuan: item.products.harga,
    }))
  )

  await admin.from('payments').insert({
    order_id: order.id,
    metode: 'Transfer Bank',
    status: 'Menunggu',
  } as any)

  // Stok tidak dikurangi untuk sistem Pre-Order (PO)

  await supabase.from('cart_items').delete().eq('user_id', user.id)

  return NextResponse.redirect(new URL(`/pesanan/${order.id}/bayar`, request.url), 303)
}
