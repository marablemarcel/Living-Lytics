'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'
import LineChart from '@/components/charts/line-chart'
import BarChart from '@/components/charts/bar-chart'
import {
  trafficOverTimeData,
  engagementMetricsData,
  conversionFunnelData,
  channelTrafficData,
} from '@/lib/data/mockChartData'

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
    <div className="space-y-8">
      {/* Page Header with Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Detailed performance analysis
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

      {/* Charts Grid - Responsive: 1 col mobile, 2 cols desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Trends - Line Chart */}
        <div className="lg:col-span-2">
          <LineChart
            data={trafficOverTimeData}
            title="Traffic Trends"
            dataKeys={['visitors', 'sessions']}
            xAxisKey="date"
            height={350}
          />
        </div>

        {/* Engagement Metrics - Bar Chart */}
        <BarChart
          data={engagementMetricsData}
          title="Engagement Metrics"
          dataKeys={['value']}
          xAxisKey="metric"
          colors={['#8B5CF6']}
          showLegend={false}
        />

        {/* Conversion Funnel - Bar Chart */}
        <BarChart
          data={conversionFunnelData}
          title="Conversion Funnel"
          dataKeys={['users']}
          xAxisKey="stage"
          colors={['#10B981']}
          showLegend={false}
        />

        {/* Top Channels - Bar Chart */}
        <div className="lg:col-span-2">
          <BarChart
            data={channelTrafficData}
            title="Top Channels"
            dataKeys={['visitors', 'sessions']}
            xAxisKey="channel"
            height={350}
          />
        </div>
      </div>
    </div>
  )
}
