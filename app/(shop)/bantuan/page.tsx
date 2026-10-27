import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { PageTitle } from '@/components/page-title'
import { createTicket } from '@/app/actions/layanan'
import { getSessionUser } from '@/lib/auth'
import { storeWaLink, ticketStatusVariant } from '@/lib/crm'
import { formatDate } from '@/lib/utils'

export default async function BantuanPage({ searchParams }: { searchParams: Promise<{ pesanan?: string }> }) {
  const { pesanan } = await searchParams
  const user = await getSessionUser()
  const supabase = await createClient()

  let orders: { id: string; created_at: string | null }[] = []
  let tickets: any[] = []
  if (user) {
    const [{ data: o }, { data: t }] = await Promise.all([
      supabase.from('orders').select('id, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('support_tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ])
    orders = o ?? []
    tickets = t ?? []
  }

  return (
    <div>
      <PageTitle title="Bantuan" description="Tanya sebelum memesan, atau laporkan bila ada yang tidak sesuai." />

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <section className="glass rounded-3xl p-6">
            <h2 className="text-lg font-semibold">Butuh jawaban cepat?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Chat langsung dengan toko lewat WhatsApp.</p>
            <a href={storeWaLink('Halo, saya ingin bertanya.')} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block">
              <Button size="lg"><MessageCircle aria-hidden /> Buka WhatsApp</Button>
            </a>
          </section>

          {user && (
            <section aria-labelledby="tiket-saya">
              <h2 id="tiket-saya" className="mb-3 text-lg font-semibold">Pesan saya</h2>
              {tickets.length === 0 ? (
                <div className="glass rounded-3xl p-6 text-sm text-muted-foreground">Belum ada pertanyaan atau keluhan.</div>
              ) : (
                <ul className="space-y-3">
                  {tickets.map((t) => (
                    <li key={t.id} className="glass rounded-3xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{t.subjek}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.tipe === 'keluhan' ? 'Keluhan' : 'Pertanyaan'} · {t.created_at ? formatDate(t.created_at) : ''}
                          </p>
                        </div>
                        <Badge variant={ticketStatusVariant(t.status)}>{t.status}</Badge>
                      </div>
                      <p className="mt-2 text-sm whitespace-pre-wrap">{t.pesan}</p>
                      {t.balasan && (
                        <p className="glass-soft mt-3 rounded-2xl p-3 text-sm whitespace-pre-wrap">
                          <span className="font-medium">Balasan toko:</span> {t.balasan}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <section className="glass h-fit rounded-3xl p-6" aria-labelledby="kirim-pesan">
          <h2 id="kirim-pesan" className="mb-4 text-lg font-semibold">Kirim pesan</h2>
          {user ? (
            <form action={createTicket} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipe">Jenis pesan</Label>
                <NativeSelect id="tipe" name="tipe" defaultValue={pesanan ? 'keluhan' : 'pertanyaan'}>
                  <option value="pertanyaan">Pertanyaan</option>
                  <option value="keluhan">Keluhan</option>
                </NativeSelect>
              </div>
              {orders.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="order_id">Terkait pesanan (opsional)</Label>
                  <NativeSelect id="order_id" name="order_id" defaultValue={pesanan ?? ''}>
                    <option value="">Tidak terkait pesanan</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.id.slice(0, 8).toUpperCase()}{o.created_at ? ` · ${formatDate(o.created_at)}` : ''}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="subjek">Subjek</Label>
                <Input id="subjek" name="subjek" required minLength={3} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pesan">Pesan</Label>
                <Textarea id="pesan" name="pesan" required minLength={10} maxLength={2000} placeholder="Jelaskan sejelas mungkin agar kami bisa membantu lebih cepat" />
              </div>
              <Button type="submit" size="lg">Kirim</Button>
            </form>
          ) : (
            <div className="text-sm text-muted-foreground">
              Masuk untuk mengirim pertanyaan atau mencatat keluhan, dan melihat balasan toko di sini.
              <div className="mt-4 flex gap-2">
                <Link href="/login?redirectTo=/bantuan"><Button>Masuk</Button></Link>
                <Link href="/register"><Button variant="outline">Daftar</Button></Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
