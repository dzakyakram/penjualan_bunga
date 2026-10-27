'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { flash } from '@/lib/flash'
import { poinDariTotal, ORDER_STATUSES, type OrderStatus } from '@/lib/crm'

export async function updateOrderStatus(formData: FormData) {
  const { admin } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '') as OrderStatus
  const back = '/admin/pesanan'
  if (!ORDER_STATUSES.includes(status)) flash(back, 'error', 'Status tidak valid')

  const { data: order } = await admin.from('orders').select('*').eq('id', id).single()
  if (!order) flash(back, 'error', 'Pesanan tidak ditemukan')
  if (order!.status === status) flash(back, 'ok', 'Status tidak berubah')

  const { error } = await admin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) flash(back, 'error', 'Status belum tersimpan')

  // Pesanan selesai -> poin loyalitas (indeks unik mencegah poin ganda)
  if (status === 'Selesai') {
    const poin = poinDariTotal(Number(order!.total))
    if (poin > 0) {
      await admin.from('loyalty_ledger').insert({
        user_id: order!.user_id,
        order_id: id,
        poin,
        keterangan: `Belanja pesanan ${id.slice(0, 8).toUpperCase()}`,
      })
    }
  }

  // Pesanan batal -> kembalikan voucher (stok tidak digunakan untuk sistem PO)
  if (status === 'Batal' && order!.status !== 'Batal') {
    if (order!.user_voucher_id) {
      await admin.from('user_vouchers').update({ used_at: null, order_id: null }).eq('id', order!.user_voucher_id)
    }
  }

  revalidatePath('/admin/pesanan')
  revalidatePath('/admin')
  revalidatePath('/pesanan')
  revalidatePath(`/pesanan/${id}`)
  flash(back, 'ok', `Pesanan ${id.slice(0, 8).toUpperCase()} sekarang: ${status}`)
}

export async function verifyPayment(formData: FormData) {
  const { admin, user } = await requireAdmin()
  const orderId = String(formData.get('order_id') ?? '')
  const hasil = String(formData.get('hasil') ?? '')
  const back = '/admin/pesanan'
  if (hasil !== 'Valid' && hasil !== 'Ditolak') flash(back, 'error', 'Hasil verifikasi tidak valid')

  const { error } = await admin
    .from('payments')
    .update({
      status: hasil === 'Valid' ? 'Valid' : 'Ditolak',
      verifikator_id: user.id,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any)
    .eq('order_id', orderId)
  if (error) flash(back, 'error', 'Verifikasi belum tersimpan')

  if (hasil === 'Valid') {
    await admin
      .from('orders')
      .update({ status: 'Diproses', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .eq('status', 'Menunggu Bayar')
  }

  revalidatePath('/admin/pesanan')
  revalidatePath('/pesanan')
  revalidatePath(`/pesanan/${orderId}`)
  flash(back, 'ok', hasil === 'Valid' ? 'Pembayaran valid, pesanan masuk ke Diproses' : 'Bukti bayar ditolak')
}

export async function updateCustomOrder(formData: FormData) {
  const { admin } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const harga = String(formData.get('harga_penawaran') ?? '').trim()
  const catatan = String(formData.get('catatan_admin') ?? '').trim()
  const back = '/admin/pesanan-khusus'
  if (!['Diterima', 'Penawaran', 'Dikerjakan', 'Selesai', 'Batal'].includes(status)) {
    flash(back, 'error', 'Status tidak valid')
  }

  const { error } = await admin
    .from('custom_orders')
    .update({
      status: status as 'Diterima' | 'Penawaran' | 'Dikerjakan' | 'Selesai' | 'Batal',
      harga_penawaran: harga ? Number(harga) : null,
      catatan_admin: catatan || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) flash(back, 'error', 'Perubahan belum tersimpan')

  revalidatePath(back)
  revalidatePath('/pesanan-khusus')
  flash(back, 'ok', 'Pesanan khusus diperbarui')
}

export async function replyTicket(formData: FormData) {
  const { admin } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  const balasan = String(formData.get('balasan') ?? '').trim()
  const back = '/admin/layanan'
  if (!['Baru', 'Diproses', 'Selesai'].includes(status)) flash(back, 'error', 'Status tidak valid')

  const { error } = await admin
    .from('support_tickets')
    .update({
      status: status as 'Baru' | 'Diproses' | 'Selesai',
      balasan: balasan || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) flash(back, 'error', 'Balasan belum tersimpan')

  revalidatePath(back)
  revalidatePath('/bantuan')
  flash(back, 'ok', 'Tiket diperbarui')
}

export async function toggleReview(formData: FormData) {
  const { admin } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const hide = String(formData.get('hide') ?? '') === 'true'
  await admin.from('reviews').update({ is_hidden: hide }).eq('id', id)
  revalidatePath('/admin/ulasan')
  flash('/admin/ulasan', 'ok', hide ? 'Ulasan disembunyikan' : 'Ulasan ditampilkan')
}
