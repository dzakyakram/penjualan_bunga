import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MobileTabbar } from '@/components/mobile-tabbar'
import { getShopContext } from '@/lib/auth'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { cartCount } = await getShopContext()

  return (
    <>
      <SiteHeader />
      <main className="container-page py-6 md:py-10">{children}</main>
      <SiteFooter />
      <MobileTabbar cartCount={cartCount} />
    </>
  )
}
