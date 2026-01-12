'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, TrendingUp, Clock, RefreshCw } from 'lucide-react'
import { MetricCardEnhanced } from '@/components/dashboard/metric-card-enhanced'
import { Button } from '@/components/ui/button'
import LineChart from '@/components/charts/line-chart'
import { NoDataState } from '@/components/dashboard/no-data-state'
import { SyncStatus } from '@/components/dashboard/sync-status'
import { format } from 'date-fns'

interface MetricData {
  date: string
  pageViews: number
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
  [key: string]: string | number // Index signature for compatibility with LineChartData
}

export default function OverviewPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<MetricData[]>([])
  const [hasData, setHasData] = useState(false)

  // Fetch data source and metrics
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      // Get first GA source
      const sourceRes = await fetch('/api/sources/first-ga')
      if (sourceRes.ok) {
        const sourceData = await sourceRes.json()
        if (sourceData.source) {
          setSourceId(sourceData.source.id)
          setLastSyncedAt(sourceData.source.last_synced_at)
          
          // Fetch metrics for last 30 days
          const end = format(new Date(), 'yyyy-MM-dd')
          const start = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
          
          const metricsRes = await fetch(`/api/metrics?sourceId=${sourceData.source.id}&startDate=${start}&endDate=${end}`)
          if (metricsRes.ok) {
            const metricsData = await metricsRes.json()
            setMetrics(metricsData.metrics || [])
            setHasData(metricsData.metrics && metricsData.metrics.length > 0)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate totals
  const totals = metrics.reduce(
    (acc, m) => ({
      pageViews: acc.pageViews + m.pageViews,
      sessions: acc.sessions + m.sessions,
      users: acc.users + m.users,
      avgDuration: acc.avgDuration + m.avgSessionDuration,
    }),
    { pageViews: 0, sessions: 0, users: 0, avgDuration: 0 }
  )

  const avgDuration = metrics.length > 0 ? totals.avgDuration / metrics.length : 0

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Overview</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardEnhanced
              key={i}
              title=""
              value={0}
              change={0}
              trend="neutral"
              loading={true}
            />
          ))}
        </div>
      </div>
    )
  }

  // Show empty state if no data
  if (!hasData || !sourceId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Overview</h1>
        </div>
        <NoDataState
          title="No metrics data yet"
          description="Sync your Google Analytics data to see your metrics here."
          showConnectButton={!sourceId}
        />
        {sourceId && (
          <div className="flex justify-center">
            <Button onClick={() => router.push('/dashboard/sources')}>
              Go to Data Sources
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Your marketing metrics at a glance • Last {metrics.length} days
          </p>
        </div>
      </div>

      {/* Sync Status */}
      {sourceId && (
        <SyncStatus
          sourceId={sourceId}
          lastSyncedAt={lastSyncedAt}
          onSyncComplete={fetchData}
        />
      )}

      {/* Key Metrics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Key Metrics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCardEnhanced
            title="Total Page Views"
            value={totals.pageViews.toLocaleString()}
            change={0}
            trend="neutral"
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            loading={false}
          />
          <MetricCardEnhanced
            title="Total Sessions"
            value={totals.sessions.toLocaleString()}
            change={0}
            trend="neutral"
            icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
            loading={false}
          />
          <MetricCardEnhanced
            title="Total Users"
            value={totals.users.toLocaleString()}
            change={0}
            trend="neutral"
            icon={<Users className="h-5 w-5 text-muted-foreground" />}
            loading={false}
          />
          <MetricCardEnhanced
            title="Avg. Session Duration"
            value={`${Math.floor(avgDuration)}s`}
            change={0}
            trend="neutral"
            icon={<Clock className="h-5 w-5 text-muted-foreground" />}
            loading={false}
          />
        </div>
      </div>

      {/* Performance Over Time */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Performance Over Time</h2>
          <p className="text-sm text-muted-foreground">
            Track your page views, sessions, and users over time
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <LineChart
            data={metrics}
            lines={[
              { key: 'pageViews', name: 'Page Views', color: '#0ea5e9' },
              { key: 'sessions', name: 'Sessions', color: '#10b981' },
              { key: 'users', name: 'Users', color: '#8b5cf6' },
            ]}
            height={350}
          />
        </div>
      </div>
    </div>
  )
}
