'use client'

import { useState, useEffect, useCallback } from 'react'
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
import AreaChart from '@/components/charts/area-chart'
import PieChart from '@/components/charts/pie-chart'
import {
  trafficOverTimeData,
  revenueOverTimeData,
  conversionByChannelData,
  generateMockChartData,
  ChartDataPoint,
} from '@/lib/data/mockChartData'
import { useDataSources } from '@/app/hooks/useDataSources'
import { CHART_COLORS } from '@/lib/constants/chart-colors'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange, getLast30Days } from '@/lib/utils/dates'

// Helper function to generate comparison text based on date range
function getComparisonText(dateRange: DateRange): string {
  const days = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (days <= 7) return 'vs previous 7 days'
  if (days <= 30) return 'vs previous 30 days'
  if (days <= 90) return 'vs previous 90 days'
  if (days <= 365) return 'vs previous 12 months'
  return 'vs previous period'
}

// Interface for calculated metrics
interface CalculatedMetrics {
  visitors: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'neutral' }
  sessions: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'neutral' }
  users: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'neutral' }
  avgDuration: { current: number; previous: number; change: number; trend: 'up' | 'down' | 'neutral' }
}

export default function OverviewPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('30d')
  const [isLoading, setIsLoading] = useState(true)
  const { hasDataSources, toggleMockData } = useDataSources()
  const [dateRange, setDateRange] = useState<DateRange>(getLast30Days())
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics | null>(null)

  // Simulate data fetching with 1 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Generate chart data when date range changes and calculate metrics
  useEffect(() => {
    const newData = generateMockChartData(dateRange.start, dateRange.end)
    setChartData(newData)

    // Calculate previous period dates
    const daysDiff = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    )

    const previousStart = new Date(dateRange.start)
    previousStart.setDate(previousStart.getDate() - daysDiff - 1)

    const previousEnd = new Date(dateRange.start)
    previousEnd.setDate(previousEnd.getDate() - 1)

    // Generate mock data for previous period
    const previousData = generateMockChartData(previousStart, previousEnd)

    // Calculate totals for current period
    const currentVisitors = newData.reduce((sum, day) => sum + day.pageViews, 0)
    const currentSessions = newData.reduce((sum, day) => sum + day.sessions, 0)
    const currentUsers = newData.reduce((sum, day) => sum + day.users, 0)
    const currentAvgDuration = newData.length > 0
      ? newData.reduce((sum, day) => sum + day.sessions, 0) / newData.length / 10
      : 0

    // Calculate totals for previous period
    const previousVisitors = previousData.reduce((sum, day) => sum + day.pageViews, 0)
    const previousSessions = previousData.reduce((sum, day) => sum + day.sessions, 0)
    const previousUsers = previousData.reduce((sum, day) => sum + day.users, 0)
    const previousAvgDuration = previousData.length > 0
      ? previousData.reduce((sum, day) => sum + day.sessions, 0) / previousData.length / 10
      : 0

    // Calculate percentage changes
    const visitorsChange = previousVisitors > 0
      ? ((currentVisitors - previousVisitors) / previousVisitors) * 100
      : 0
    const sessionsChange = previousSessions > 0
      ? ((currentSessions - previousSessions) / previousSessions) * 100
      : 0
    const usersChange = previousUsers > 0
      ? ((currentUsers - previousUsers) / previousUsers) * 100
      : 0
    const avgDurationChange = previousAvgDuration > 0
      ? ((currentAvgDuration - previousAvgDuration) / previousAvgDuration) * 100
      : 0

    // Determine trends
    const getTrend = (change: number): 'up' | 'down' | 'neutral' => {
      if (Math.abs(change) < 0.1) return 'neutral'
      return change > 0 ? 'up' : 'down'
    }

    setCalculatedMetrics({
      visitors: {
        current: currentVisitors,
        previous: previousVisitors,
        change: visitorsChange,
        trend: getTrend(visitorsChange),
      },
      sessions: {
        current: currentSessions,
        previous: previousSessions,
        change: sessionsChange,
        trend: getTrend(sessionsChange),
      },
      users: {
        current: currentUsers,
        previous: previousUsers,
        change: usersChange,
        trend: getTrend(usersChange),
      },
      avgDuration: {
        current: currentAvgDuration,
        previous: previousAvgDuration,
        change: avgDurationChange,
        trend: getTrend(avgDurationChange),
      },
    })
  }, [dateRange])

  // Handle connect data source action
  const handleConnectDataSource = () => {
    // For now, show a toast message
    toast.info('Data source connections coming soon in Week 5!')
    // Alternatively, navigate to settings:
    // router.push('/dashboard/settings')
  }

  // Handle date range change
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range)

    // Defer console logging to not block the click handler
    setTimeout(() => {
      console.log('Date range changed:', {
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      })
    }, 0)
  }, [])

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
          {isLoading || !calculatedMetrics ? (
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
            // Show real metric cards with calculated data
            <>
              <MetricCardEnhanced
                title="Total Visitors"
                value={calculatedMetrics.visitors.current.toLocaleString()}
                change={calculatedMetrics.visitors.change}
                trend={calculatedMetrics.visitors.trend}
                period={getComparisonText(dateRange)}
                icon={<Users className="h-5 w-5 text-muted-foreground" />}
                loading={false}
              />
              <MetricCardEnhanced
                title="Total Sessions"
                value={calculatedMetrics.sessions.current.toLocaleString()}
                change={calculatedMetrics.sessions.change}
                trend={calculatedMetrics.sessions.trend}
                period={getComparisonText(dateRange)}
                icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
                loading={false}
              />
              <MetricCardEnhanced
                title="Total Users"
                value={calculatedMetrics.users.current.toLocaleString()}
                change={calculatedMetrics.users.change}
                trend={calculatedMetrics.users.trend}
                period={getComparisonText(dateRange)}
                icon={<Users className="h-5 w-5 text-muted-foreground" />}
                loading={false}
              />
              <MetricCardEnhanced
                title="Avg. Session Duration"
                value={`${Math.floor(calculatedMetrics.avgDuration.current)}m ${Math.floor((calculatedMetrics.avgDuration.current % 1) * 60)}s`}
                change={calculatedMetrics.avgDuration.change}
                trend={calculatedMetrics.avgDuration.trend}
                period={getComparisonText(dateRange)}
                icon={<Clock className="h-5 w-5 text-muted-foreground" />}
                loading={false}
              />
            </>
          )}
        </div>
      </div>

      {/* Performance Over Time - New LineChart Test */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Performance Over Time</h2>
            <p className="text-sm text-muted-foreground">
              Track your page views, sessions, and users over time
            </p>
          </div>
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>
        <div className="rounded-lg border bg-card p-6">
          <LineChart
            data={chartData}
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

      {/* Chart Showcase Section */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Chart Showcase</h2>
          <p className="text-sm text-muted-foreground">
            Explore different visualization types with sample data
          </p>
        </div>

        {/* Bar Chart Example */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Bar Chart - Weekly Performance</h3>
            <p className="text-sm text-muted-foreground">
              Compare visits and conversions across the week
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <BarChart
              data={[
                { name: 'Monday', visits: 4000, conversions: 240 },
                { name: 'Tuesday', visits: 3000, conversions: 139 },
                { name: 'Wednesday', visits: 2000, conversions: 980 },
                { name: 'Thursday', visits: 2780, conversions: 390 },
                { name: 'Friday', visits: 1890, conversions: 480 },
                { name: 'Saturday', visits: 2390, conversions: 380 },
                { name: 'Sunday', visits: 3490, conversions: 430 },
              ]}
              bars={[
                { key: 'visits', name: 'Visits', color: CHART_COLORS.primary },
                { key: 'conversions', name: 'Conversions', color: CHART_COLORS.secondary },
              ]}
              height={350}
            />
          </div>
        </div>

        {/* Area Chart Example */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Area Chart - Traffic Volume</h3>
            <p className="text-sm text-muted-foreground">
              Visualize traffic volume and engagement over time
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <AreaChart
              data={[
                { date: '2024-01-01', traffic: 3400, engagement: 2400 },
                { date: '2024-01-02', traffic: 4200, engagement: 2210 },
                { date: '2024-01-03', traffic: 3800, engagement: 2290 },
                { date: '2024-01-04', traffic: 4800, engagement: 2000 },
                { date: '2024-01-05', traffic: 3900, engagement: 2181 },
                { date: '2024-01-06', traffic: 4300, engagement: 2500 },
                { date: '2024-01-07', traffic: 5100, engagement: 2700 },
              ]}
              areas={[
                { key: 'traffic', name: 'Traffic', color: CHART_COLORS.primary },
                { key: 'engagement', name: 'Engagement', color: CHART_COLORS.tertiary },
              ]}
              height={350}
            />
          </div>
        </div>

        {/* Pie Chart Example */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Pie Chart - Traffic Sources</h3>
            <p className="text-sm text-muted-foreground">
              Distribution of traffic by source channel
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <PieChart
              data={[
                { name: 'Direct', value: 4000, color: CHART_COLORS.primary },
                { name: 'Social Media', value: 3000, color: CHART_COLORS.secondary },
                { name: 'Search Engines', value: 2000, color: CHART_COLORS.tertiary },
                { name: 'Referral', value: 1000, color: CHART_COLORS.quaternary },
                { name: 'Email', value: 800, color: '#ef4444' },
                { name: 'Other', value: 500, color: CHART_COLORS.neutral },
              ]}
              height={400}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
