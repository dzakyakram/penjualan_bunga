import Link from 'next/link'
import { Flower2, LogOut, ShoppingBag, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getShopContext } from '@/lib/auth'
import { signOut } from '@/app/actions/auth'
import { STORE_NAME } from '@/lib/config'

const links = [
  { href: '/produk', label: 'Katalog' },
  { href: '/pesanan-khusus', label: 'Pesanan khusus' },
  { href: '/loyalitas', label: 'Poin & voucher' },
  { href: '/bantuan', label: 'Bantuan' },
]

export async function SiteHeader() {
  const { user, role, nama, cartCount } = await getShopContext()

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6 md:pt-4">
      <div className="glass glass-lens mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full py-2 pr-2 pl-5">
        <Link
          href="/"
          className="font-heading flex items-center gap-2 rounded-full text-lg font-bold tracking-tight focus-visible:ring-4 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Flower2 className="size-5 text-primary" aria-hidden />
          {STORE_NAME}
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <Button variant="ghost" size="sm">{l.label}</Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/keranjang" aria-label={`Keranjang, ${cartCount} barang`} className="hidden md:block">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag aria-hidden />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
          {user ? (
            <>
              <Link
                href={role === 'admin' ? '/admin' : '/akun'}
                aria-label={role === 'admin' ? `Dashboard admin, ${nama ?? ''}` : `Akun saya, ${nama ?? ''}`}
                title={role === 'admin' ? 'Buka dashboard admin' : (nama ?? undefined)}
              >
                <Button variant={role === 'admin' ? 'outline' : 'ghost'} size="sm" className="max-w-[9rem] sm:max-w-[13rem]">
                  <User aria-hidden />
                  <span className="truncate">{nama}</span>
                </Button>
              </Link>
              <form action={signOut}>
                <Button variant="ghost" size="icon" type="submit" aria-label="Keluar">
                  <LogOut aria-hidden />
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/register" className="hidden sm:block"><Button variant="ghost">Daftar</Button></Link>
              <Link href="/login"><Button>Masuk</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
