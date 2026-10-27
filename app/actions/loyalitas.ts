'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { flash } from '@/lib/flash'

export async function redeemVoucher(formData: FormData) {
  const user = await requireUser('/loyalitas')
  const voucherId = String(formData.get('voucher_id') ?? '')
  const admin = createAdminClient()

  const { data: voucher } = await admin
    .from('vouchers')
    .select('*')
    .eq('id', voucherId)
    .eq('is_active', true)
    .single()
  if (!voucher) flash('/loyalitas', 'error', 'Voucher tidak tersedia')

  const { data: ledger } = await admin.from('loyalty_ledger').select('poin').eq('user_id', user.id)
  const saldo = (ledger ?? []).reduce((sum, r) => sum + r.poin, 0)
  if (saldo < voucher!.poin_dibutuhkan) {
    flash('/loyalitas', 'error', `Poin belum cukup. Butuh ${voucher!.poin_dibutuhkan} poin, saldo Anda ${saldo}.`)
  }

  const { error: spendError } = await admin.from('loyalty_ledger').insert({
    user_id: user.id,
    poin: -voucher!.poin_dibutuhkan,
    keterangan: `Tukar voucher: ${voucher!.nama}`,
  })
  if (spendError) flash('/loyalitas', 'error', 'Penukaran gagal. Poin Anda tidak berkurang.')

  const kode = 'FLR-' + randomBytes(3).toString('hex').toUpperCase()
  const { error: voucherError } = await admin.from('user_vouchers').insert({
    user_id: user.id,
    voucher_id: voucher!.id,
    kode,
  })
  if (voucherError) {
    // kembalikan poin bila voucher gagal dibuat
    await admin.from('loyalty_ledger').insert({
      user_id: user.id,
      poin: voucher!.poin_dibutuhkan,
      keterangan: `Pengembalian poin: ${voucher!.nama}`,
    })
    flash('/loyalitas', 'error', 'Voucher gagal dibuat. Poin Anda dikembalikan.')
  }

  revalidatePath('/loyalitas')
  flash('/loyalitas', 'ok', `Voucher ${kode} siap dipakai di checkout`)
}
