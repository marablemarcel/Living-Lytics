'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BarChart3, Lightbulb, Database, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    name: 'Overview',
    href: '/dashboard/overview',
    icon: Home,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    name: 'Insights',
    href: '/dashboard/insights',
    icon: Lightbulb,
  },
  {
    name: 'Data Sources',
    href: '/dashboard/sources',
    icon: Database,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        {/* Logo/Brand */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard/overview" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">LL</span>
            </div>
            <span className="text-xl font-bold">Living Lytics</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-r-full before:bg-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer section (optional - for future use) */}
        <div className="border-t p-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Living Lytics
          </p>
        </div>
      </div>
    </aside>
  )
}
