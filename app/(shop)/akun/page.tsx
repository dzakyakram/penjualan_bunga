import Link from 'next/link'
import { CalendarHeart, Gift, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { Reminders } from '@/components/reminders'
import { addImportantDate, deleteImportantDate, updateProfile } from '@/app/actions/akun'
import { signOut } from '@/app/actions/auth'
import { requireUser } from '@/lib/auth'
import { daysLabel, daysUntilAnnual, formatDayMonth, orderStatusVariant } from '@/lib/crm'
import { formatDate, formatRupiah } from '@/lib/utils'

export default async function AkunPage() {
  const user = await requireUser('/akun')
  const supabase = await createClient()
  const admin = createAdminClient()

  const [{ data: profile }, { data: dateRows }, { data: orders }, { data: ledger }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('important_dates').select('*').eq('user_id', user.id),
    supabase.from('orders').select('id, total, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('loyalty_ledger').select('poin').eq('user_id', user.id),
  ])
  const p = profile as any
  const saldo = (ledger ?? []).reduce((n, r) => n + r.poin, 0)
  const dates = (dateRows ?? [])
    .map((d) => ({ ...d, days: daysUntilAnnual(d.tanggal) }))
    .sort((a, b) => a.days - b.days)

  // Ringkasan riwayat: total belanja & produk yang sering dibeli
  const { data: allOrders } = await admin
    .from('orders')
    .select('id, total, status')
    .eq('user_id', user.id)
    .in('status', ['Diproses', 'Dikirim', 'Selesai'])
  const totalBelanja = (allOrders ?? []).reduce((n, o) => n + Number(o.total), 0)
  let sering: { nama: string; jumlah: number; id: string }[] = []
  if (allOrders?.length) {
    const { data: items } = await admin
      .from('order_items')
      .select('produk_id, jumlah, products(nama_produk)')
      .in('order_id', allOrders.map((o) => o.id))
    const tally = new Map<string, { nama: string; jumlah: number; id: string }>()
    for (const it of (items ?? []) as any[]) {
      const cur = tally.get(it.produk_id) ?? { id: it.produk_id, nama: it.products?.nama_produk ?? 'Produk', jumlah: 0 }
      cur.jumlah += it.jumlah
      tally.set(it.produk_id, cur)
    }
    sering = [...tally.values()].sort((a, b) => b.jumlah - a.jumlah).slice(0, 3)
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title={p?.nama ? `Halo, ${p.nama.split(' ')[0]}` : 'Akun saya'}
        description={user.email ?? undefined}
        action={
          <form action={signOut}><Button variant="outline" size="sm" type="submit">Keluar</Button></form>
        }
      />

      <Reminders userId={user.id} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-3xl p-6" aria-labelledby="profil">
          <h2 id="profil" className="mb-4 text-lg font-semibold">Data pelanggan</h2>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama lengkap</Label>
              <Input id="nama" name="nama" defaultValue={p?.nama ?? ''} required minLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="no_hp">Nomor HP / WhatsApp</Label>
              <Input id="no_hp" name="no_hp" type="tel" inputMode="tel" defaultValue={p?.no_hp ?? ''} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat utama</Label>
              <Textarea id="alamat" name="alamat" defaultValue={p?.alamat ?? ''} placeholder="Dipakai otomatis saat checkout" />
            </div>
            <Button type="submit">Simpan data</Button>
          </form>
        </section>

        <section className="glass rounded-3xl p-6" aria-labelledby="tanggal">
          <h2 id="tanggal" className="mb-1 flex items-center gap-2 text-lg font-semibold">
            <CalendarHeart className="size-5 text-primary" aria-hidden /> Tanggal penting
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Ulang tahun, anniversary, atau hari lain. Kami mengingatkan Anda sebelum harinya tiba.
          </p>

          {dates.length > 0 && (
            <ul className="mb-5 space-y-2">
              {dates.map((d) => (
                <li key={d.id} className="glass-soft flex items-center gap-3 rounded-2xl py-2 pr-2 pl-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{d.judul}</p>
                    <p className="text-xs text-muted-foreground">{formatDayMonth(d.tanggal)} · {daysLabel(d.days)}</p>
                  </div>
                  <form action={deleteImportantDate}>
                    <input type="hidden" name="id" value={d.id} />
                    <Button variant="ghost" size="icon-sm" type="submit" aria-label={`Hapus ${d.judul}`}><Trash2 aria-hidden /></Button>
                  </form>
                </li>
              ))}
            </ul>
          )}

          <form action={addImportantDate} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-2">
                <Label htmlFor="judul">Nama hari</Label>
                <Input id="judul" name="judul" placeholder="Ulang tahun Ibu" required minLength={2} maxLength={60} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input id="tanggal" name="tanggal" type="date" required />
              </div>
            </div>
            <Button type="submit" variant="outline">Tambah tanggal</Button>
          </form>
        </section>
      </div>

      <section className="glass rounded-3xl p-6" aria-labelledby="riwayat">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id="riwayat" className="text-lg font-semibold">Riwayat pembelian</h2>
          <Link href="/loyalitas" className="glass-soft flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
            <Gift className="size-4 text-primary" aria-hidden /> {saldo} poin
          </Link>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="glass-soft rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">Total belanja</p>
            <p className="text-xl font-bold">{formatRupiah(totalBelanja)}</p>
          </div>
          <div className="glass-soft rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">Pesanan berjalan atau selesai</p>
            <p className="text-xl font-bold">{allOrders?.length ?? 0}</p>
          </div>
          <div className="glass-soft rounded-2xl p-4">
            <p className="text-xs text-muted-foreground">Paling sering dibeli</p>
            {sering.length ? (
              <p className="truncate font-semibold">{sering[0].nama}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada</p>
            )}
          </div>
        </div>

        {!orders || orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pesanan. <Link href="/produk" className="text-primary hover:underline">Lihat katalog</Link></p>
        ) : (
          <ul className="divide-y divide-white/60">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/pesanan/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-80">
                  <div>
                    <p className="font-mono text-sm font-semibold">{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">{o.created_at ? formatDate(o.created_at) : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatRupiah(o.total)}</span>
                    <Badge variant={orderStatusVariant(o.status)}>{o.status}</Badge>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link href="/pesanan" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">Semua pesanan</Link>
      </section>
    </div>
  )
}
