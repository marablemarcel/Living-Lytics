'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react'
import CorrelationChart from '@/components/charts/correlation-chart'
import PieChart from '@/components/charts/pie-chart'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange, getLast30Days } from '@/lib/utils/dates'
import { useDataSources } from '@/app/hooks/useDataSources'
import type {
  CrossPlatformMetrics,
  ChannelAttribution,
  TopContent,
} from '@/lib/services/cross-platform-analytics'

/**
 * Advanced Analytics Page
 * 
 * Displays cross-platform metrics, correlation analysis, and channel attribution
 */
export default function AdvancedAnalyticsPage() {
  const router = useRouter()
  const { hasDataSources } = useDataSources()
  const [dateRange, setDateRange] = useState<DateRange>(getLast30Days())
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<CrossPlatformMetrics | null>(null)
  const [attribution, setAttribution] = useState<ChannelAttribution[]>([])
  const [topContent, setTopContent] = useState<TopContent[]>([])
  const [correlationData, setCorrelationData] = useState<Array<{ date: string; x: number; y: number }>>([])

  // Fetch cross-platform data
  useEffect(() => {
    if (!hasDataSources) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch cross-platform metrics
        const metricsRes = await fetch(
          `/api/analytics/cross-platform?startDate=${dateRange.start}&endDate=${dateRange.end}`
        )
        if (metricsRes.ok) {
          const data = await metricsRes.json()
          setMetrics(data.metrics)
          setAttribution(data.attribution)
          setTopContent(data.topContent)
          setCorrelationData(data.correlationData)
        }
      } catch (error) {
        console.error('Error fetching cross-platform data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange, hasDataSources])

  // Handle connect data source action
  const handleConnectDataSource = () => {
    router.push('/dashboard/sources')
  }

  // Show empty state if no data sources
  if (!hasDataSources) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              Connect data sources to see cross-platform insights
            </p>
          </div>
        </div>

        <EmptyState
          title="No data sources connected"
          description="Connect Google Analytics and social media accounts to see advanced cross-platform analytics and correlation insights."
          onAction={handleConnectDataSource}
          icon={<BarChart3 className="h-12 w-12 text-blue-600" strokeWidth={1.5} />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Cross-platform insights and correlation analysis
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Reach */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
              <p className="text-2xl font-bold">
                {loading ? '...' : (metrics?.totalReach || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Web + Social
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Total Engagement */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Engagement</p>
              <p className="text-2xl font-bold">
                {loading ? '...' : (metrics?.totalEngagement || 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions + Interactions
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-2xl font-bold">
                {loading ? '...' : `${metrics?.conversionRate || 0}%`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sessions / Reach
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Social to Web Ratio */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Social/Web Ratio</p>
              <p className="text-2xl font-bold">
                {loading ? '...' : metrics?.socialToWebRatio.toFixed(2) || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Social / Web Sessions
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Correlation Analysis */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Correlation Analysis</h2>
          <p className="text-sm text-muted-foreground">
            Relationship between web traffic and social engagement
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <CorrelationChart
            data={correlationData}
            xLabel="Web Sessions"
            yLabel="Social Engagement"
            height={400}
            showTrendLine={true}
            loading={loading}
          />
        </div>
      </div>

      {/* Channel Attribution & Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Attribution */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Channel Attribution</h2>
            <p className="text-sm text-muted-foreground">
              Engagement contribution by platform
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            {loading ? (
              <div className="h-87.5 flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : attribution.length > 0 ? (
              <PieChart
                data={attribution.map((a) => ({
                  name: a.channel,
                  value: a.value,
                  color: a.color,
                }))}
                height={350}
              />
            ) : (
              <div className="h-87.5 flex items-center justify-center">
                <p className="text-muted-foreground">No attribution data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Content */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Top Content</h2>
            <p className="text-sm text-muted-foreground">
              Best performing content across platforms
            </p>
          </div>
          <div className="rounded-lg border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Content</th>
                    <th className="text-left p-4 font-semibold">Platform</th>
                    <th className="text-right p-4 font-semibold">Engagement</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        Loading...
                      </td>
                    </tr>
                  ) : topContent.length > 0 ? (
                    topContent.map((content, index) => (
                      <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium max-w-50 truncate">
                          {content.title}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {content.platform}
                        </td>
                        <td className="p-4 text-right font-semibold">
                          {content.engagement.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-muted-foreground">
                        No content data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
