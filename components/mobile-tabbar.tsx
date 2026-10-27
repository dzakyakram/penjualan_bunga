'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Flower2, House, Package, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/', label: 'Beranda', icon: House },
  { href: '/produk', label: 'Katalog', icon: Flower2 },
  { href: '/keranjang', label: 'Keranjang', icon: ShoppingBag },
  { href: '/pesanan', label: 'Pesanan', icon: Package },
  { href: '/akun', label: 'Akun', icon: User },
]

export function MobileTabbar({ cartCount }: { cartCount: number }) {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navigasi bawah"
      className="glass glass-lens fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full p-1.5 md:hidden"
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex min-w-14 flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[0.7rem] font-medium transition-colors focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none',
              active ? 'glass-primary' : 'text-foreground/70'
            )}
          >
            <Icon className="size-5" aria-hidden />
            {label}
            {href === '/keranjang' && cartCount > 0 && (
              <span className="absolute top-0.5 right-2 grid size-4 place-items-center rounded-full bg-primary text-[0.6rem] font-semibold text-primary-foreground ring-2 ring-white/80">
                {cartCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
