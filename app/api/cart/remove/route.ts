import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url), 303)

  const formData = await request.formData()
  const id = String(formData.get('id') ?? '')

  await supabase.from('cart_items').delete().eq('id', id).eq('user_id', user.id)

  return NextResponse.redirect(new URL('/keranjang', request.url), 303)
}
