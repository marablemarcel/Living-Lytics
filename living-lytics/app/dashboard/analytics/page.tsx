'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  const [hasDataSources, setHasDataSources] = useState(false) // Default to false for testing

  // Handle connect data source action
  const handleConnectDataSource = () => {
    toast.info('Data source connections coming soon in Week 5!')
  }

  // Show empty state if no data sources are connected
  if (!hasDataSources) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Connect a data source to start seeing detailed analytics
            </p>
          </div>
          {/* Testing Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setHasDataSources(true)}
            className="text-xs"
          >
            Toggle Data Sources (Test)
          </Button>
        </div>

        {/* Empty State */}
        <EmptyState
          title="No analytics data yet"
          description="Connect a data source to start seeing detailed analytics about your traffic, conversions, and user behavior."
          onAction={handleConnectDataSource}
          icon={<BarChart3 className="h-12 w-12 text-blue-600" strokeWidth={1.5} />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analytics coming soon...
          </p>
        </div>
        {/* Testing Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setHasDataSources(false)}
          className="text-xs"
        >
          Toggle Data Sources (Test)
        </Button>
      </div>

      {/* Analytics content will go here */}
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Advanced analytics features coming soon...
      </div>
    </div>
  )
}
