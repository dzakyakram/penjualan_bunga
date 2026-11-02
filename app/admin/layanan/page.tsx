import { requireAdmin } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { replyTicket } from '@/app/actions/admin'
import { ticketStatusVariant, waLink } from '@/lib/crm'
import { formatDate } from '@/lib/utils'

export default async function AdminLayananPage() {
  const { admin } = await requireAdmin()
  const { data } = await admin.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(100)
  const tickets = (data ?? []).sort((a, b) => Number(a.status === 'Selesai') - Number(b.status === 'Selesai'))
  const userIds = [...new Set(tickets.map((t) => t.user_id))]
  const { data: profiles } = userIds.length
    ? await admin.from('profiles').select('id, nama, no_hp').in('id', userIds)
    : { data: [] as { id: string; nama: string; no_hp: string | null }[] }
  const customer = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (
    <div>
      <PageTitle title="Layanan pelanggan" description="Pertanyaan dan keluhan dari pelanggan. Yang belum selesai ada di atas." />
      {tickets.length === 0 ? (
        <div className="glass rounded-3xl p-8 text-center text-muted-foreground">Belum ada pesan.</div>
      ) : (
        <ul className="space-y-4">
          {tickets.map((t) => {
            const c = customer.get(t.user_id)
            const wa = waLink(c?.no_hp, `Halo ${c?.nama ?? ''}, terkait pesan Anda "${t.subjek}": `)
            return (
              <li key={t.id} className="glass rounded-3xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{t.subjek}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.tipe === 'keluhan' ? 'Keluhan' : 'Pertanyaan'} dari {c?.nama ?? '-'} · {t.created_at ? formatDate(t.created_at) : ''}
                      {t.order_id && ` · Pesanan ${t.order_id.slice(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.tipe === 'keluhan' && <Badge variant="destructive">Keluhan</Badge>}
                    <Badge variant={ticketStatusVariant(t.status)}>{t.status}</Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap">{t.pesan}</p>
                {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-primary hover:underline">Balas lewat WhatsApp</a>}

                <form action={replyTicket} className="glass-soft mt-4 grid gap-3 rounded-2xl p-4">
                  <input type="hidden" name="id" value={t.id} />
                  <div className="space-y-1.5">
                    <Label htmlFor={`bl-${t.id}`}>Balasan (tampil di akun pelanggan)</Label>
                    <Textarea id={`bl-${t.id}`} name="balasan" defaultValue={t.balasan ?? ''} className="min-h-20" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label htmlFor={`ts-${t.id}`} className="sr-only">Status tiket</label>
                    <NativeSelect id={`ts-${t.id}`} name="status" defaultValue={t.status} className="w-auto min-w-40">
                      {['Baru', 'Diproses', 'Selesai'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </NativeSelect>
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
