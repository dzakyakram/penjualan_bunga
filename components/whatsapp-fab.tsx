'use client'

import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { storeWaLink } from '@/lib/crm'

const HIDDEN_ON = ['/admin', '/login', '/register']

export function WhatsAppFab() {
  const pathname = usePathname()
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null

  return (
    <a
      href={storeWaLink('Halo, saya ingin bertanya tentang bunga di toko Anda.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp dengan toko"
      className="glass glass-lens fixed right-4 bottom-24 z-40 flex h-14 items-center gap-2 rounded-full px-4 text-[oklch(0.38_0.12_160)] transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none md:right-6 md:bottom-6"
    >
      <MessageCircle className="size-6" aria-hidden />
      <span className="hidden text-sm font-semibold md:inline">Chat WhatsApp</span>
    </a>
  )
}
