import { Flower2 } from 'lucide-react'
import { AdminNav } from '@/components/admin-nav'
import { requireAdmin } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin()

  return (
    <div className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-4 p-3 md:flex-row md:gap-6 md:p-6">
      <aside className="glass glass-lens h-fit rounded-[2rem] p-3 md:sticky md:top-6 md:w-64 md:shrink-0 md:p-4">
        <div className="mb-3 hidden px-3 pt-2 md:block">
          <p className="font-heading flex items-center gap-2 text-lg font-bold">
            <Flower2 className="size-5 text-primary" aria-hidden /> Panel admin
          </p>
          <p className="text-sm text-muted-foreground">{profile.nama}</p>
        </div>
        <AdminNav />
      </aside>
      <main className="min-w-0 flex-1 pb-10">{children}</main>
    </div>
  )
}
