import Link from 'next/link'
import { CalendarHeart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getReminderData } from '@/lib/crm-data'
import { daysLabel, formatDayMonth } from '@/lib/crm'

/** Pengingat tanggal penting dan penawaran dari riwayat pembelian (pemasaran terarah). */
export async function Reminders({ userId }: { userId: string }) {
  const { upcoming, favoriteCategory, lastOrderDays } = await getReminderData(userId)
  const showRepeat = favoriteCategory && lastOrderDays !== null && lastOrderDays >= 21
  if (upcoming.length === 0 && !showRepeat) return null

  return (
    <section aria-label="Pengingat untuk Anda" className="glass rounded-3xl p-5 md:p-6">
      <div className="grid gap-5 md:grid-cols-2">
        {upcoming.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarHeart className="size-5 text-primary" aria-hidden />
              Tanggal penting yang dekat
            </h2>
            <ul className="mt-3 space-y-2">
              {upcoming.slice(0, 3).map((d) => (
                <li key={d.id} className="glass-soft flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5">
                  <div>
                    <p className="font-medium">{d.judul}</p>
                    <p className="text-xs text-muted-foreground">{formatDayMonth(d.tanggal)}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{daysLabel(d.days)}</span>
                </li>
              ))}
            </ul>
            <Link href="/produk" className="mt-3 inline-block">
              <Button size="sm">Pilih bunga untuk hari itu</Button>
            </Link>
          </div>
        )}
        {showRepeat && favoriteCategory && (
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="size-5 text-primary" aria-hidden />
              Pilihan dari pesanan Anda
            </h2>
            <p className="mt-3 text-muted-foreground">
              Anda paling sering memesan <strong className="text-foreground">{favoriteCategory.nama}</strong>.
              Pesanan terakhir {lastOrderDays} hari lalu.
            </p>
            <Link href={`/produk?kategori=${favoriteCategory.id}`} className="mt-3 inline-block">
              <Button size="sm" variant="outline">Lihat {favoriteCategory.nama}</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
