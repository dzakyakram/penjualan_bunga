'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

/** Menampilkan ?ok= / ?error= sebagai toast lalu membersihkan alamat. */
export function Flash() {
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const ok = params.get('ok')
    const error = params.get('error')
    if (!ok && !error) return
    if (ok) toast.success(ok)
    if (error) toast.error(error)
    const next = new URLSearchParams(params.toString())
    next.delete('ok')
    next.delete('error')
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [params, pathname, router])

  return null
}
