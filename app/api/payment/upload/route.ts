import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { proofPath, savePayment } from '@/lib/payment'
import { NextResponse } from 'next/server'

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url), 303)
  }

  const formData = await request.formData()
  const order_id = String(formData.get('order_id') ?? '')
  const file = formData.get('bukti')

  const fail = (message: string) =>
    NextResponse.redirect(new URL(`/pesanan/${order_id}/bayar?error=${encodeURIComponent(message)}`, request.url), 303)

  if (!order_id) return NextResponse.redirect(new URL('/pesanan', request.url), 303)

  if (!(file instanceof File) || file.size === 0) return fail('Pilih gambar bukti transfer')
  if (!EXT[file.type]) return fail('Format bukti harus JPG, PNG, atau WebP')
  if (file.size > MAX_BYTES) return fail('Ukuran bukti maksimal 5 MB')

  // Pesanan harus milik pengguna ini dan masih menunggu pembayaran
  const { data: owned } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', order_id)
    .eq('user_id', user.id)
    .single()
  if (!owned) return NextResponse.redirect(new URL('/pesanan', request.url), 303)
  if (owned.status !== 'Menunggu Bayar') return fail('Pesanan ini tidak lagi menunggu pembayaran')

  const admin = createAdminClient()
  const fileName = `${order_id}-${Date.now()}.${EXT[file.type]}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const sendFile = () => admin.storage.from('bukti-bayar').upload(fileName, buffer, { contentType: file.type })
  let { error: uploadError } = await sendFile()

  // Bucket belum ada? Buat otomatis (publik), lalu coba lagi sekali.
  if (uploadError && /not found|bucket/i.test(uploadError.message)) {
    const { error: createError } = await admin.storage.createBucket('bukti-bayar', { public: true })
    if (createError && !/already exists/i.test(createError.message)) {
      console.error('Gagal membuat bucket bukti-bayar:', createError)
    } else {
      ;({ error: uploadError } = await sendFile())
    }
  }

  if (uploadError) {
    console.error('Upload bukti bayar gagal:', uploadError)
    return fail(`Unggahan gagal: ${uploadError.message}`)
  }

  const { data: { publicUrl } } = admin.storage.from('bukti-bayar').getPublicUrl(fileName)

  // Pembayaran lama (jika ada) diperbarui; jika belum ada barisnya, dibuat.
  const { data: existingRows } = await admin.from('payments').select('*').eq('order_id', order_id)
  const existing = ((existingRows ?? []) as any[]).at(-1) ?? null

  const { error: saveError } = await savePayment(admin, order_id, existing, publicUrl)

  if (saveError) {
    await admin.storage.from('bukti-bayar').remove([fileName])
    return fail(`Bukti terunggah tetapi gagal disimpan: ${saveError.message}`)
  }

  // Hapus bukti lama agar penyimpanan tidak menumpuk
  const oldPath = proofPath(existing?.bukti_bayar_url as string | null | undefined)
  if (oldPath && oldPath !== fileName) {
    await admin.storage.from('bukti-bayar').remove([oldPath])
  }

  return NextResponse.redirect(new URL(`/pesanan/${order_id}?ok=${encodeURIComponent('Bukti bayar terkirim, menunggu verifikasi')}`, request.url), 303)
}
