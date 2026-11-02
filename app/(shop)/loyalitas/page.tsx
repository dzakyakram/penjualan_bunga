import Link from 'next/link'
import { Gift, Ticket } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/page-title'
import { redeemVoucher } from '@/app/actions/loyalitas'
import { requireUser } from '@/lib/auth'
import { POINT_UNIT } from '@/lib/config'
import { formatDate, formatRupiah } from '@/lib/utils'

export default async function LoyalitasPage() {
  const user = await requireUser('/loyalitas')
  const supabase = await createClient()

  const [{ data: ledger }, { data: catalog }, { data: mine }] = await Promise.all([
    supabase.from('loyalty_ledger').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('vouchers').select('*').eq('is_active', true).order('poin_dibutuhkan'),
    supabase.from('user_vouchers').select('id, kode, used_at, vouchers(nama, potongan, min_belanja)').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])
  const saldo = (ledger ?? []).reduce((n, r) => n + r.poin, 0)
  const myVouchers = (mine ?? []) as any[]

  return (
    <div className="space-y-8">
      <PageTitle
        title="Poin dan voucher"
        description={`Setiap belanja Rp${POINT_UNIT.toLocaleString('id-ID')} memberi 1 poin setelah pesanan selesai. Tukar poin dengan voucher untuk pembelian berikutnya.`}
      />

      <section className="glass relative overflow-hidden rounded-[2rem] p-7 md:p-9" aria-label="Saldo poin">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Saldo poin Anda</p>
            <p className="font-heading text-6xl font-extrabold text-primary md:text-7xl">{saldo}</p>
          </div>
          <Gift className="size-16 text-primary/30 md:size-24" aria-hidden />
        </div>
      </section>

      <section aria-labelledby="tukar">
        <h2 id="tukar" className="mb-4 text-xl font-bold">Tukar poin</h2>
        {!catalog || catalog.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-muted-foreground">Belum ada voucher yang bisa ditukar.</div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {catalog.map((v) => {
              const cukup = saldo >= v.poin_dibutuhkan
              const kurang = v.poin_dibutuhkan - saldo
              return (
                <li key={v.id} className="glass flex flex-col justify-between gap-4 rounded-3xl p-5">
                  <div>
                    <p className="text-2xl font-bold">{formatRupiah(Number(v.potongan))}</p>
                    <p className="text-sm font-medium">{v.nama}</p>
                    {Number(v.min_belanja) > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">Min. belanja {formatRupiah(Number(v.min_belanja))}</p>
                    )}
                  </div>
                  <form action={redeemVoucher}>
                    <input type="hidden" name="voucher_id" value={v.id} />
                    <Button type="submit" className="w-full" disabled={!cukup} variant={cukup ? 'default' : 'outline'}>
                      {cukup ? `Tukar ${v.poin_dibutuhkan} poin` : `Kurang ${kurang} poin`}
                    </Button>
                  </form>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="milik">
        <h2 id="milik" className="mb-4 flex items-center gap-2 text-xl font-bold"><Ticket className="size-5 text-primary" aria-hidden /> Voucher saya</h2>
        {myVouchers.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-muted-foreground">Anda belum punya voucher. Tukar poin di atas.</div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {myVouchers.map((v) => (
              <li key={v.id} className={`glass flex items-center justify-between gap-3 rounded-3xl p-5 ${v.used_at ? 'opacity-60' : ''}`}>
                <div>
                  <p className="font-semibold">{v.vouchers?.nama}</p>
                  <p className="font-mono text-sm text-muted-foreground">{v.kode}</p>
                </div>
                {v.used_at ? (
                  <Badge variant="secondary">Terpakai</Badge>
                ) : (
                  <Link href="/produk"><Button size="sm">Belanja</Button></Link>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-sm text-muted-foreground">Voucher yang belum terpakai bisa dipilih saat checkout.</p>
      </section>

      <section aria-labelledby="riwayat-poin">
        <h2 id="riwayat-poin" className="mb-4 text-xl font-bold">Riwayat poin</h2>
        {!ledger || ledger.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-muted-foreground">Poin pertama Anda muncul setelah pesanan selesai.</div>
        ) : (
          <ul className="glass divide-y divide-white/60 rounded-3xl px-5">
            {ledger.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{r.keterangan}</p>
                  <p className="text-xs text-muted-foreground">{r.created_at ? formatDate(r.created_at) : ''}</p>
                </div>
                <span className={`font-semibold ${r.poin > 0 ? 'text-[oklch(0.4_0.1_160)]' : 'text-foreground'}`}>
                  {r.poin > 0 ? `+${r.poin}` : r.poin}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
