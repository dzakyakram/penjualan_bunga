import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url), 303)
  }

  const formData = await request.formData()
  const produk_id = formData.get('produk_id') as string
  const jumlah = Math.max(1, parseInt((formData.get('jumlah') as string) || '1') || 1)

  // Check if exists
  const { data: existing } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('produk_id', produk_id)
    .single()

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ jumlah: (existing as any).jumlah + jumlah })
      .eq('id', (existing as any).id)
  } else {
    await supabase.from('cart_items').insert({
      user_id: user.id,
      produk_id,
      jumlah,
    } as any)
  }

  return NextResponse.redirect(new URL('/keranjang', request.url), 303)
}
