import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url), 303)
  }

  const formData = await request.formData()
  const order_id = formData.get('order_id') as string
  const file = formData.get('bukti') as File

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL(`/pesanan/${order_id}/bayar?error=${encodeURIComponent('Pilih gambar bukti transfer')}`, request.url), 303)
  }
  if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
    return NextResponse.redirect(new URL(`/pesanan/${order_id}/bayar?error=${encodeURIComponent('Bukti harus berupa gambar maksimal 5 MB')}`, request.url), 303)
  }

  // Pastikan pesanan milik pengguna ini
  const { data: owned } = await supabase.from('orders').select('id').eq('id', order_id).eq('user_id', user.id).single()
  if (!owned) return NextResponse.redirect(new URL('/pesanan', request.url), 303)

  const admin = createAdminClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${order_id}-${Date.now()}.${fileExt}`
  
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error: uploadError } = await admin.storage
    .from('bukti-bayar')
    .upload(fileName, buffer, {
      contentType: file.type,
    })

  if (uploadError) {
    console.error(uploadError)
    return NextResponse.redirect(new URL(`/pesanan/${order_id}/bayar?error=${encodeURIComponent('Unggahan gagal. Coba lagi.')}`, request.url), 303)
  }

  const { data: { publicUrl } } = admin.storage.from('bukti-bayar').getPublicUrl(fileName)

  await admin
    .from('payments')
    .update({ bukti_bayar_url: publicUrl, status: 'Menunggu' } as any)
    .eq('order_id', order_id)

  return NextResponse.redirect(new URL(`/pesanan/${order_id}?ok=${encodeURIComponent('Bukti bayar terkirim, menunggu verifikasi')}`, request.url), 303)
}
