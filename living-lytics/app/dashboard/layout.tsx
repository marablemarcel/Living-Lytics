'use client'

import { Loader2 } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - fixed position, hidden on mobile */}
      <Sidebar />

      {/* Main content area - adjust margin for sidebar on desktop */}
      <div className="flex w-full flex-col lg:ml-64">
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-24">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
