import { requireAdmin } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/page-title'
import { Stars } from '@/components/stars'
import { toggleReview } from '@/app/actions/admin'
import { formatDate } from '@/lib/utils'

export default async function AdminUlasanPage() {
  const { admin } = await requireAdmin()
  const { data } = await admin.from('reviews').select('*').order('created_at', { ascending: false }).limit(100)
  const reviews = data ?? []

  const [{ data: products }, { data: profiles }] = await Promise.all([
    reviews.length
      ? admin.from('products').select('id, nama').in('id', [...new Set(reviews.map((r) => r.produk_id))])
      : Promise.resolve({ data: [] as { id: string; nama: string }[] }),
    reviews.length
      ? admin.from('profiles').select('id, nama').in('id', [...new Set(reviews.map((r) => r.user_id))])
      : Promise.resolve({ data: [] as { id: string; nama: string }[] }),
  ])
  const productName = new Map((products ?? []).map((p: any) => [p.id, p.nama]))
  const userName = new Map((profiles ?? []).map((p) => [p.id, p.nama]))

  return (
    <div>
      <PageTitle title="Ulasan" description="Ulasan pembeli setelah pesanan selesai. Sembunyikan ulasan yang tidak pantas." />
      {reviews.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-muted-foreground">Belum ada ulasan.</div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className={`glass rounded-3xl p-5 ${r.is_hidden ? 'opacity-60' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{productName.get(r.produk_id) ?? 'Produk'}</p>
                  <p className="text-sm text-muted-foreground">{userName.get(r.user_id) ?? 'Pembeli'} · {r.created_at ? formatDate(r.created_at) : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  {r.is_hidden && <Badge variant="secondary">Disembunyikan</Badge>}
                </div>
              </div>
              {r.komentar && <p className="mt-2 text-sm">{r.komentar}</p>}
              <form action={toggleReview} className="mt-3">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="hide" value={String(!r.is_hidden)} />
                <Button size="sm" variant="outline" type="submit">{r.is_hidden ? 'Tampilkan' : 'Sembunyikan'}</Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
