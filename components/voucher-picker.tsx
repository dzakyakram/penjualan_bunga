'use client'

import { useState } from 'react'
import { formatRupiah } from '@/lib/utils'
import { cn } from '@/lib/utils'

export type PickerVoucher = {
  id: string
  kode: string
  nama: string
  potongan: number
  min_belanja: number
}

/** Pilih voucher dan lihat total akhir. Input terhubung ke form checkout lewat atribut form. */
export function VoucherPicker({
  subtotal,
  vouchers,
  formId,
  poinPerUnit,
}: {
  subtotal: number
  vouchers: PickerVoucher[]
  formId: string
  poinPerUnit: number
}) {
  const [selected, setSelected] = useState('')
  const chosen = vouchers.find((v) => v.id === selected)
  const diskon = chosen ? Math.min(chosen.potongan, subtotal) : 0
  const total = subtotal - diskon
  const poin = Math.floor(total / poinPerUnit)

  return (
    <div className="space-y-4">
      {vouchers.length > 0 && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-sm font-semibold">Voucher</legend>
          <label className={cn('glass-soft flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-sm', selected === '' && 'ring-2 ring-primary/50')}>
            <input type="radio" name="user_voucher_id" value="" form={formId} checked={selected === ''} onChange={() => setSelected('')} className="accent-[oklch(0.56_0.2_5)]" />
            Tanpa voucher
          </label>
          {vouchers.map((v) => {
            const eligible = subtotal >= v.min_belanja
            return (
              <label
                key={v.id}
                className={cn(
                  'glass-soft flex items-start gap-3 rounded-2xl px-3 py-2.5 text-sm',
                  eligible ? 'cursor-pointer' : 'cursor-not-allowed opacity-55',
                  selected === v.id && 'ring-2 ring-primary/50'
                )}
              >
                <input
                  type="radio"
                  name="user_voucher_id"
                  value={v.id}
                  form={formId}
                  disabled={!eligible}
                  checked={selected === v.id}
                  onChange={() => setSelected(v.id)}
                  className="mt-0.5 accent-[oklch(0.56_0.2_5)]"
                />
                <span>
                  <span className="block font-medium">{v.nama}</span>
                  <span className="block text-xs text-muted-foreground">
                    {v.kode}
                    {!eligible && ` · min. belanja ${formatRupiah(v.min_belanja)}`}
                  </span>
                </span>
              </label>
            )
          })}
        </fieldset>
      )}

      <dl className="space-y-1.5 border-t border-white/60 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatRupiah(subtotal)}</dd>
        </div>
        {diskon > 0 && (
          <div className="flex justify-between text-[oklch(0.4_0.1_160)]">
            <dt>Voucher</dt>
            <dd>-{formatRupiah(diskon)}</dd>
          </div>
        )}
        <div className="flex justify-between pt-1 text-lg font-bold">
          <dt>Total</dt>
          <dd>{formatRupiah(total)}</dd>
        </div>
        {poin > 0 && (
          <p className="pt-1 text-xs text-muted-foreground">Pesanan ini menambah {poin} poin setelah selesai.</p>
        )}
      </dl>
    </div>
  )
}
