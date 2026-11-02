'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { profileSchema } from '@/lib/validations/auth'
import { flash } from '@/lib/flash'

export async function updateProfile(formData: FormData) {
  const user = await requireUser('/akun')
  const parsed = profileSchema.safeParse({
    nama: String(formData.get('nama') ?? '').trim(),
    no_hp: String(formData.get('no_hp') ?? '').trim(),
    alamat: String(formData.get('alamat') ?? '').trim(),
  })
  if (!parsed.success) flash('/akun', 'error', parsed.error.issues[0].message)

  const { nama, no_hp, alamat } = parsed.data
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ nama, no_hp: no_hp || null, alamat: alamat || null, updated_at: new Date().toISOString() })
    .eq('id', user.id)
  if (error) flash('/akun', 'error', 'Profil belum tersimpan. Coba lagi.')

  revalidatePath('/akun')
  flash('/akun', 'ok', 'Profil tersimpan')
}

const dateSchema = z.object({
  judul: z.string().min(2, 'Nama tanggal minimal 2 karakter').max(60, 'Nama tanggal maksimal 60 karakter'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal wajib diisi'),
  catatan: z.string().max(200).optional(),
})

export async function addImportantDate(formData: FormData) {
  const user = await requireUser('/akun')
  const parsed = dateSchema.safeParse({
    judul: String(formData.get('judul') ?? '').trim(),
    tanggal: String(formData.get('tanggal') ?? ''),
    catatan: String(formData.get('catatan') ?? '').trim() || undefined,
  })
  if (!parsed.success) flash('/akun', 'error', parsed.error.issues[0].message)

  const supabase = await createClient()
  const { error } = await supabase.from('important_dates').insert({
    user_id: user.id,
    judul: parsed.data.judul,
    tanggal: parsed.data.tanggal,
    catatan: parsed.data.catatan ?? null,
  })
  if (error) flash('/akun', 'error', 'Tanggal belum tersimpan. Coba lagi.')

  revalidatePath('/akun')
  revalidatePath('/')
  flash('/akun', 'ok', 'Tanggal penting ditambahkan')
}

export async function deleteImportantDate(formData: FormData) {
  const user = await requireUser('/akun')
  const id = String(formData.get('id') ?? '')
  const supabase = await createClient()
  await supabase.from('important_dates').delete().eq('id', id).eq('user_id', user.id)
  revalidatePath('/akun')
  revalidatePath('/')
  flash('/akun', 'ok', 'Tanggal penting dihapus')
}
