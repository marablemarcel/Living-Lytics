'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { MetricCardEnhanced } from '@/components/dashboard/metric-card-enhanced'
import { MetricTabs } from '@/components/dashboard/metric-tabs'
import { PeriodSelector, getPeriodLabel } from '@/components/dashboard/period-selector'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { overviewMetrics } from '@/lib/data/mockMetrics'

export default function OverviewPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [hasDataSources, setHasDataSources] = useState(false) // Default to false for testing

  // Simulate data fetching with 1 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Handle connect data source action
  const handleConnectDataSource = () => {
    // For now, show a toast message
    toast.info('Data source connections coming soon in Week 5!')
    // Alternatively, navigate to settings:
    // router.push('/dashboard/settings')
  }

  // Map icon names to components for the key metrics
  const iconMap: Record<string, React.ReactNode> = {
    Users: <Users className="h-5 w-5 text-muted-foreground" />,
    TrendingUp: <TrendingUp className="h-5 w-5 text-muted-foreground" />,
    DollarSign: <DollarSign className="h-5 w-5 text-muted-foreground" />,
    Clock: <Clock className="h-5 w-5 text-muted-foreground" />,
  }

  // Show empty state if no data sources are connected
  if (!hasDataSources) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">
              Get started by connecting your first data source
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
        <EmptyState onAction={handleConnectDataSource} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header with Toggle Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Your marketing metrics at a glance • {getPeriodLabel(period)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
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
      </div>

      {/* Key Metrics Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Key Metrics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            // Show 4 loading skeleton cards
            Array.from({ length: 4 }).map((_, index) => (
              <MetricCardEnhanced
                key={`skeleton-${index}`}
                title=""
                value={0}
                change={0}
                trend="neutral"
                loading={true}
              />
            ))
          ) : (
            // Show real metric cards with enhanced styling
            overviewMetrics.map((metric) => (
              <MetricCardEnhanced
                key={metric.id}
                title={metric.name}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                period={metric.period}
                icon={metric.icon ? iconMap[metric.icon] : undefined}
                loading={false}
              />
            ))
          )}
        </div>
      </div>

      {/* Detailed Metrics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Detailed Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Explore all your metrics organized by category
          </p>
        </div>
        <MetricTabs defaultCategory="all" />
      </div>
    </div>
  )
}
