import { Check } from 'lucide-react'
import { ORDER_STEPS, stepIndex } from '@/lib/crm'
import { cn } from '@/lib/utils'

/** Pelacak pesanan: diterima, dikerjakan, dikirim, selesai. */
export function OrderTracker({ status }: { status: string }) {
  if (status === 'Batal') {
    return (
      <div className="rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive">
        Pesanan ini dibatalkan. Stok dan voucher yang terpakai sudah dikembalikan.
      </div>
    )
  }
  const current = stepIndex(status)

  return (
    <ol className="grid grid-cols-4 gap-2 md:gap-3" aria-label="Status pesanan">
      {ORDER_STEPS.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.key} aria-current={active ? 'step' : undefined} className="min-w-0">
            <div
              className={cn(
                'h-2 rounded-full transition-colors',
                done || active ? 'glass-primary !p-0' : 'bg-white/55 shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)]'
              )}
            />
            <p className={cn('mt-2 flex items-center gap-1 text-sm', active ? 'font-bold text-primary' : done ? 'font-medium' : 'text-muted-foreground')}>
              {done && <Check className="size-3.5 shrink-0" aria-hidden />}
              <span className="truncate">{step.label}</span>
            </p>
            {active && <p className="mt-0.5 hidden text-xs text-muted-foreground md:block">{step.hint}</p>}
          </li>
        )
      })}
    </ol>
  )
}
