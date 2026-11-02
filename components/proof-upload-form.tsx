'use client'

import { useEffect, useState } from 'react'
import { ImageUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MAX = 5 * 1024 * 1024

/** Form unggah bukti transfer dengan pratinjau, validasi ukuran, dan penanda sedang mengunggah. */
export function ProofUploadForm({ orderId }: { orderId: string }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setError(null)
    setPreview(null)
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar.')
      e.target.value = ''
      return
    }
    if (file.size > MAX) {
      setError('Ukuran gambar maksimal 5 MB.')
      e.target.value = ''
      return
    }
    setPreview(URL.createObjectURL(file))
  }

  return (
    <form
      action="/api/payment/upload"
      method="post"
      encType="multipart/form-data"
      onSubmit={() => setSending(true)}
      className="space-y-4"
    >
      <input type="hidden" name="order_id" value={orderId} />
      <div className="space-y-2">
        <Label htmlFor="bukti">Bukti transfer (gambar, maks. 5 MB)</Label>
        <Input id="bukti" name="bukti" type="file" accept="image/*" required onChange={onChange} aria-describedby={error ? 'bukti-error' : undefined} />
        {error && <p id="bukti-error" role="alert" className="text-sm text-destructive">{error}</p>}
      </div>

      {preview && (
        <div className="glass-soft flex items-center gap-3 rounded-2xl p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Pratinjau bukti transfer" className="size-20 rounded-xl object-cover" />
          <p className="text-sm text-muted-foreground">Pastikan nominal dan tanggal transfer terlihat jelas.</p>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={sending || !!error}>
        <ImageUp aria-hidden /> {sending ? 'Mengunggah...' : 'Unggah bukti bayar'}
      </Button>
    </form>
  )
}
