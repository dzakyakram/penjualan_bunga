'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LifeBuoy, Megaphone, Package, Palette, ShoppingBag, Star, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

const items = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pesanan', label: 'Pesanan', icon: Package },
  { href: '/admin/pesanan-khusus', label: 'Pesanan khusus', icon: Palette },
  { href: '/admin/layanan', label: 'Layanan pelanggan', icon: LifeBuoy },
  { href: '/admin/pemasaran', label: 'Pemasaran', icon: Megaphone },
  { href: '/admin/ulasan', label: 'Ulasan', icon: Star },
  { href: '/admin/produk', label: 'Produk', icon: ShoppingBag },
  { href: '/', label: 'Kembali ke toko', icon: Store, exact: true },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Menu admin" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {items.map(({ href, label, icon: Icon, exact }) => {
        let active = exact ? pathname === href : pathname.startsWith(href)
        if (href === '/admin/pesanan' && pathname.startsWith('/admin/pesanan-khusus')) {
          active = false
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none',
              active ? 'glass-primary' : 'text-foreground/75 hover:bg-white/50'
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
