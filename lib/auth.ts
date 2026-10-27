import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const getSessionUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export async function requireUser(next?: string) {
  const user = await getSessionUser()
  if (!user) redirect(next ? `/login?redirectTo=${encodeURIComponent(next)}` : '/login')
  return user
}

/** Hanya admin. Mengembalikan klien service-role karena RLS tidak berlaku untuk admin. */
export async function requireAdmin() {
  const user = await requireUser('/admin')
  const admin = createAdminClient()
  const { data } = await admin.from('profiles').select('role, nama').eq('id', user.id).single()
  const profile = data as { role: string; nama: string } | null
  if (profile?.role !== 'admin') redirect('/')
  return { user, admin, profile }
}

/** Data yang dipakai header toko: pengguna, peran, dan jumlah isi keranjang. */
export const getShopContext = cache(async () => {
  const user = await getSessionUser()
  if (!user) return { user: null, role: null as string | null, nama: null as string | null, cartCount: 0 }
  const supabase = await createClient()
  const [{ data: profile }, { data: cart }] = await Promise.all([
    supabase.from('profiles').select('role, nama').eq('id', user.id).single(),
    supabase.from('cart_items').select('jumlah').eq('user_id', user.id),
  ])
  return {
    user,
    role: (profile as { role?: string } | null)?.role ?? null,
    nama: (profile as { nama?: string } | null)?.nama ?? null,
    cartCount: (cart ?? []).reduce((n, c) => n + c.jumlah, 0),
  }
})
