'use client'

import type { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'

/** Tombol kirim yang nonaktif selama form diproses, supaya tidak terkirim dua kali. */
export function SubmitButton({
  children,
  pendingText = 'Menyimpan...',
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  )
}
