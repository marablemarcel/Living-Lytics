'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { Lightbulb } from 'lucide-react'

export default function InsightsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-muted-foreground">
              AI insights will appear here once you connect your data sources
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
          title="No insights available"
          description="AI insights will appear here once you connect your data sources. Get personalized recommendations and actionable insights powered by AI."
          onAction={handleConnectDataSource}
          icon={<Lightbulb className="h-12 w-12 text-blue-600" strokeWidth={1.5} />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered insights coming soon...
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

      {/* Insights content will go here */}
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        AI-powered insights features coming soon...
      </div>
    </div>
  )
}
