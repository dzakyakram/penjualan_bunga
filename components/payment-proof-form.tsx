'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_MB = 5

/** Form unggah bukti transfer: cek ukuran/format sebelum kirim, ada pratinjau, dan tombol nonaktif saat mengirim. */
export function PaymentProofForm({ orderId, resubmit }: { orderId: string; resubmit?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setPreview(null)
    setError(null)
    if (!file) return
    if (!ALLOWED.includes(file.type)) {
      setError('Format harus JPG, PNG, atau WebP.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Ukuran gambar maksimal ${MAX_MB} MB.`)
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
      className="space-y-4"
      onSubmit={() => setSending(true)}
    >
      <input type="hidden" name="order_id" value={orderId} />
      <div className="space-y-2">
        <Label htmlFor="bukti">{resubmit ? 'Bukti transfer baru (gambar)' : 'Bukti transfer (gambar)'}</Label>
        <Input id="bukti" name="bukti" type="file" accept="image/jpeg,image/png,image/webp" required onChange={onChange} />
        <p className="text-xs text-muted-foreground">JPG, PNG, atau WebP, maksimal {MAX_MB} MB.</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Pratinjau bukti transfer" className="max-h-72 w-full rounded-2xl border border-white/40 bg-white/40 object-contain" />
      )}
      <Button type="submit" size="lg" className="w-full" disabled={sending || !!error || !preview}>
        {sending ? 'Mengunggah...' : resubmit ? 'Kirim ulang bukti bayar' : 'Unggah bukti bayar'}
      </Button>
    </form>
  )
}
