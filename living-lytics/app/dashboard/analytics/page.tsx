'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'
import LineChart from '@/components/charts/line-chart'
import BarChart from '@/components/charts/bar-chart'
import PieChart from '@/components/charts/pie-chart'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange, getLast30Days } from '@/lib/utils/dates'
import { useDataSources } from '@/app/hooks/useDataSources'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import {
  generateMockMetrics,
  generateTrafficSources,
  generateDeviceData,
  generateTopPages,
  type MetricDataPoint,
} from '@/lib/data/mock-data'

export default function AnalyticsPage() {
  const router = useRouter()
  const { hasDataSources } = useDataSources()
  const [dateRange, setDateRange] = useState<DateRange>(getLast30Days())

  // Handle connect data source action
  const handleConnectDataSource = () => {
    router.push('/dashboard/sources')
  }

  // State for chart data
  const [chartData, setChartData] = useState<MetricDataPoint[]>([])
  const [totals, setTotals] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Fetch real data when sources are connected
  useEffect(() => {
    async function fetchData() {
      // If no data sources connected, show empty state
      if (!hasDataSources) {
        setChartData([])
        return
      }

      // When we have real data sources, ALWAYS use real data (ignore dev mock flag)

      // Fetch real data
      setLoading(true)
      try {
        // Format dates as YYYY-MM-DD strings
        const formatDate = (date: Date) => {
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day}`
        }

        const queryParams = new URLSearchParams({
          startDate: formatDate(dateRange.start),
          endDate: formatDate(dateRange.end),
        })
        
        const response = await fetch(`/api/metrics/aggregated?${queryParams}`)
        if (!response.ok) throw new Error('Failed to fetch metrics')
        
        const data = await response.json()
        
        // Transform API data to chart format if needed
        // API returns MultiPlatformMetricPoint[] which matches chart expectations for keys like pageViews, sessions, users
        setChartData(data.daily || [])
        setTotals(data.totals)

        // Fetch additional analytics details (top pages, traffic sources)
        const detailsParams = new URLSearchParams({
          startDate: formatDate(dateRange.start),
          endDate: formatDate(dateRange.end),
        })
        
        const detailsResponse = await fetch(`/api/analytics/details?${detailsParams}`)
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json()
          
          // Transform traffic sources to match chart format
          const formattedTrafficSources = (detailsData.trafficSources || []).map((item: any) => ({
            name: item.source === '(direct)' ? 'Direct' : item.source,
            visitors: item.users,
            sessions: item.sessions,
            bounceRate: 0 // Not available from this API
          }))
          
          // Transform top pages to match chart format
          const formattedTopPages = (detailsData.topPages || []).map((item: any) => ({
            name: item.page,
            pageViews: item.views,
            avgDuration: Math.floor(item.avgDuration),
            bounceRate: 0 // Not available from this API
          }))
          
          setTrafficSources(formattedTrafficSources)
          setTopPages(formattedTopPages)
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
        // Fallback or empty state could go here
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hasDataSources, dateRange])

  // State for additional chart data
  const [trafficSources, setTrafficSources] = useState<any[]>([])
  const [topPages, setTopPages] = useState<any[]>([])
  const deviceData: any[] = [] // Device data not available from GA4 API yet

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
    <div className="space-y-8">

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed metrics and performance analysis
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Traffic Over Time */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Traffic Over Time</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your page views, sessions, and unique users
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <LineChart
            data={chartData}
            lines={[
              { key: 'pageViews', name: 'Page Views', color: CHART_COLORS.primary },
              { key: 'sessions', name: 'Sessions', color: CHART_COLORS.secondary },
              { key: 'users', name: 'Users', color: CHART_COLORS.tertiary },
            ]}
            height={350}
          />
        </div>
      </div>

      {/* Traffic Sources & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Traffic Sources</h2>
            <p className="text-sm text-muted-foreground">
              Where your visitors are coming from
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <BarChart
              data={trafficSources}
              bars={[
                { key: 'visitors', name: 'Visitors', color: CHART_COLORS.primary },
                { key: 'sessions', name: 'Sessions', color: CHART_COLORS.secondary },
              ]}
              height={350}
            />
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Device Breakdown</h2>
            <p className="text-sm text-muted-foreground">
              How visitors access your site
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            {deviceData.length >= 3 ? (
              <PieChart
                data={[
                  { name: 'Mobile', value: deviceData[0].visitors, color: CHART_COLORS.primary },
                  { name: 'Desktop', value: deviceData[1].visitors, color: CHART_COLORS.secondary },
                  { name: 'Tablet', value: deviceData[2].visitors, color: CHART_COLORS.tertiary },
                ]}
                height={350}
              />
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Device breakdown data not available yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages Performance */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Top Pages</h2>
          <p className="text-sm text-muted-foreground">
            Your highest performing pages
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <BarChart
            data={topPages}
            bars={[
              { key: 'pageViews', name: 'Page Views', color: CHART_COLORS.primary },
            ]}
            height={350}
          />
        </div>
      </div>

      {/* Engagement Metrics Table */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Detailed Metrics</h2>
          <p className="text-sm text-muted-foreground">
            In-depth look at page performance
          </p>
        </div>
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Page</th>
                  <th className="text-right p-4 font-semibold">Page Views</th>
                  <th className="text-right p-4 font-semibold">Avg. Duration</th>
                  <th className="text-right p-4 font-semibold">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr key={index} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-4 font-medium">{page.name}</td>
                    <td className="p-4 text-right">{page.pageViews.toLocaleString()}</td>
                    <td className="p-4 text-right">{Math.floor(page.avgDuration / 60)}m {page.avgDuration % 60}s</td>
                    <td className="p-4 text-right">{page.bounceRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
