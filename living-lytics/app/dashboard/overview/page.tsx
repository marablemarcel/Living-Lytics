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
import LineChart from '@/components/charts/line-chart'
import BarChart from '@/components/charts/bar-chart'
import {
  trafficOverTimeData,
  revenueOverTimeData,
  conversionByChannelData,
} from '@/lib/data/mockChartData'
import { useDataSources } from '@/app/hooks/useDataSources'

export default function OverviewPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const { hasDataSources, toggleMockData } = useDataSources()

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
        {/* Dev-only Toggle */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-800">
                Development Mode: {hasDataSources ? 'Showing mock data' : 'Showing empty state'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMockData}
              >
                Toggle Mock Data
              </Button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground">
              Get started by connecting your first data source
            </p>
          </div>
        </div>

        {/* Empty State */}
        <EmptyState onAction={handleConnectDataSource} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Dev-only Toggle */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">
              Development Mode: {hasDataSources ? 'Showing mock data' : 'Showing empty state'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMockData}
            >
              Toggle Mock Data
            </Button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Your marketing metrics at a glance • {getPeriodLabel(period)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodSelector value={period} onChange={setPeriod} />
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

      {/* Performance Over Time - New LineChart Test */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Performance Over Time</h2>
          <p className="text-sm text-muted-foreground">
            Track your page views, sessions, and users over the last 7 days
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <LineChart
            data={[
              { date: '2024-01-01', pageViews: 1200, sessions: 800, users: 450 },
              { date: '2024-01-02', pageViews: 1400, sessions: 950, users: 520 },
              { date: '2024-01-03', pageViews: 1100, sessions: 750, users: 410 },
              { date: '2024-01-04', pageViews: 1600, sessions: 1100, users: 610 },
              { date: '2024-01-05', pageViews: 1800, sessions: 1200, users: 680 },
              { date: '2024-01-06', pageViews: 1500, sessions: 1000, users: 550 },
              { date: '2024-01-07', pageViews: 2100, sessions: 1400, users: 780 },
            ]}
            lines={[
              { key: 'pageViews', name: 'Page Views', color: '#0ea5e9' },
              { key: 'sessions', name: 'Sessions', color: '#10b981' },
              { key: 'users', name: 'Users', color: '#8b5cf6' },
            ]}
            height={350}
          />
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

      {/* Performance Trends Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Performance Trends</h2>
          <p className="text-sm text-muted-foreground">
            Track your key metrics over time
          </p>
        </div>

        {/* Two-column chart grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Traffic Over Time Chart */}
          <LineChart
            data={trafficOverTimeData}
            title="Traffic Over Time"
            dataKeys={['visitors', 'sessions']}
            xAxisKey="date"
            height={350}
          />

          {/* Revenue Over Time Chart */}
          <LineChart
            data={revenueOverTimeData}
            title="Revenue Over Time"
            dataKeys={['revenue', 'expenses']}
            xAxisKey="month"
            height={350}
          />
        </div>

        {/* Full-width Conversion by Channel Bar Chart */}
        <BarChart
          data={conversionByChannelData}
          title="Conversions by Channel"
          dataKeys={['conversions']}
          xAxisKey="channel"
          height={350}
        />
      </section>
    </div>
  )
}
