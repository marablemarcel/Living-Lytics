'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User, Settings, LogOut, Menu } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'
import { getProfile } from '@/lib/api/profile'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Breadcrumbs, BreadcrumbItem } from '@/components/layout/breadcrumbs'

const getPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean)
  const page = segments[segments.length - 1] || 'overview'

  // Capitalize first letter and handle special cases
  const titleMap: Record<string, string> = {
    overview: 'Overview',
    analytics: 'Analytics',
    insights: 'Insights',
    settings: 'Settings',
    sources: 'Data Sources',
    'data-sources': 'Data Sources',
  }

  return titleMap[page] || page.charAt(0).toUpperCase() + page.slice(1)
}

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean)
  const page = segments[segments.length - 1] || 'overview'

  return [
    {
      label: getPageTitle(pathname),
      href: pathname,
      isCurrentPage: true,
    },
  ]
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  const [businessName, setBusinessName] = useState<string>('Loading...')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        const { data } = await getProfile(user.id)
        if (data?.business_name) {
          setBusinessName(data.business_name)
        } else {
          setBusinessName('My Business')
        }
      }
    }

    fetchProfile()
  }, [user])

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
      setIsLoggingOut(false)
    }
  }

  const pageTitle = getPageTitle(pathname)
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <header className="fixed left-0 top-0 z-30 w-full border-b bg-background lg:left-64 lg:w-[calc(100%-16rem)]">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Breadcrumbs and mobile menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-col gap-1">
            <Breadcrumbs items={breadcrumbs} />
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* Right side - Business name and user menu */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-muted-foreground">
              {businessName}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-full"
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-5 w-5" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col space-y-1 px-2 py-1.5">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {businessName}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={isLoggingOut}
                variant="destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
