'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { flash } from '@/lib/flash'

async function uploadProductImage(admin: any, file: File) {
  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `produk-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const { error } = await admin.storage.from('produk').upload(fileName, buffer, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  })
  if (error) throw error
  const { data } = admin.storage.from('produk').getPublicUrl(fileName)
  return data.publicUrl
}

export async function createProduct(formData: FormData) {
  const { admin } = await requireAdmin()
  const back = '/admin/produk/baru'

  const nama = String(formData.get('nama') ?? '').trim()
  const harga = Number(formData.get('harga') ?? 0)
  const deskripsi = String(formData.get('deskripsi') ?? '').trim() || null
  const keunggulan = String(formData.get('keunggulan') ?? '').trim() || null
  const bahan = String(formData.get('bahan') ?? '').trim() || null
  const cocok_untuk = String(formData.get('cocok_untuk') ?? '').trim() || null
  const perawatan = String(formData.get('perawatan') ?? '').trim() || null
  const is_active = formData.get('is_active') === 'on'
  const file = formData.get('gambar') as File | null

  if (!nama || !harga) {
    flash(back, 'error', 'Nama dan harga wajib diisi')
  }

  let gambar_url: string | null = null
  if (file && file.size > 0) {
    try {
      gambar_url = await uploadProductImage(admin, file)
    } catch {
      flash(back, 'error', 'Gagal upload gambar')
    }
  }

  const { error } = await admin.from('products').insert({
    nama,
    harga,
    deskripsi,
    keunggulan,
    bahan,
    cocok_untuk,
    perawatan,
    gambar_url,
    is_active,
    stok: 0,
  } as any)

  if (error) {
    flash(back, 'error', 'Gagal menambah produk')
  }

  revalidatePath('/admin/produk')
  revalidatePath('/produk')
  revalidatePath('/')
  flash('/admin/produk', 'ok', 'Produk berhasil ditambahkan')
}

export async function updateProduct(formData: FormData) {
  const { admin } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const back = `/admin/produk/${id}`

  const nama = String(formData.get('nama') ?? '').trim()
  const harga = Number(formData.get('harga') ?? 0)
  const deskripsi = String(formData.get('deskripsi') ?? '').trim() || null
  const keunggulan = String(formData.get('keunggulan') ?? '').trim() || null
  const bahan = String(formData.get('bahan') ?? '').trim() || null
  const cocok_untuk = String(formData.get('cocok_untuk') ?? '').trim() || null
  const perawatan = String(formData.get('perawatan') ?? '').trim() || null
  const is_active = formData.get('is_active') === 'on'
  const file = formData.get('gambar') as File | null

  if (!nama || !harga) {
    flash(back, 'error', 'Nama dan harga wajib diisi')
  }

  let updateData: any = {
    nama,
    harga,
    deskripsi,
    keunggulan,
    bahan,
    cocok_untuk,
    perawatan,
    is_active,
    updated_at: new Date().toISOString(),
  }

  if (file && file.size > 0) {
    try {
      updateData.gambar_url = await uploadProductImage(admin, file)
    } catch {
      flash(back, 'error', 'Gagal upload gambar')
    }
  }

  const { error } = await admin.from('products').update(updateData).eq('id', id)

  if (error) {
    flash(back, 'error', 'Gagal menyimpan produk')
  }

  revalidatePath('/admin/produk')
  revalidatePath(`/produk/${id}`)
  revalidatePath('/produk')
  revalidatePath('/')
  flash('/admin/produk', 'ok', 'Produk berhasil diperbarui')
}

export async function deleteProduct(formData: FormData) {
  const { admin } = await requireAdmin()
  const id = String(formData.get('id') ?? '')
  const back = '/admin/produk'

  const { error } = await admin.from('products').delete().eq('id', id)
  if (error) {
    flash(back, 'error', 'Gagal menghapus produk')
  }

  revalidatePath('/admin/produk')
  revalidatePath('/produk')
  revalidatePath('/')
  flash(back, 'ok', 'Produk berhasil dihapus')
}
