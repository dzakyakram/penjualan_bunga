import { SiteHeader } from '@/components/site-header'
import { MobileTabbar } from '@/components/mobile-tabbar'
import { getShopContext } from '@/lib/auth'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const { cartCount } = await getShopContext()

  return (
    <>
      <SiteHeader />
      <main className="container-page pt-6 pb-28 md:pt-10 md:pb-12">{children}</main>
      <MobileTabbar cartCount={cartCount} />
    </>
  )
}
