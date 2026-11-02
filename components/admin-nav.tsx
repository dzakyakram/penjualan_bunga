'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LifeBuoy, LogOut, Megaphone, Package, Palette, ShoppingBag, Star, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from '@/app/actions/auth'

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

// Di halaman produk, sidebar hanya berisi satu tombol menuju dashboard admin.
const dashboardOnly = [{ href: '/admin', label: 'Dashboard admin', icon: LayoutDashboard, exact: true }]

export function AdminNav() {
  const pathname = usePathname()
  const visibleItems = pathname.startsWith('/admin/produk') ? dashboardOnly : items
  return (
    <nav aria-label="Menu admin" className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
      {visibleItems.map(({ href, label, icon: Icon, exact }) => {
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
      <form action={signOut} className="shrink-0 md:mt-2 md:border-t md:border-white/60 md:pt-2">
        <button
          type="submit"
          className="flex w-full shrink-0 cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
        >
          <LogOut className="size-4" aria-hidden />
          Keluar
        </button>
      </form>
    </nav>
  )
}
