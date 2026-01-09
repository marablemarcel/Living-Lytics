/**
 * Test Chart Demo Component
 * Demonstrates the production-ready LineChart component with various scenarios
 */

'use client'

import LineChart from './line-chart'
import { CHART_COLORS } from '@/lib/constants/chart-colors'

// Sample data for time-series analytics
const sampleData = [
  { date: '2024-01-01', pageViews: 1200, sessions: 800, users: 650 },
  { date: '2024-01-02', pageViews: 1400, sessions: 950, users: 720 },
  { date: '2024-01-03', pageViews: 1100, sessions: 750, users: 580 },
  { date: '2024-01-04', pageViews: 1600, sessions: 1100, users: 890 },
  { date: '2024-01-05', pageViews: 1800, sessions: 1250, users: 980 },
  { date: '2024-01-06', pageViews: 2100, sessions: 1400, users: 1120 },
  { date: '2024-01-07', pageViews: 1900, sessions: 1300, users: 1050 },
]

// Large numbers test data
const largeNumbersData = [
  { date: '2024-01-01', revenue: 45000, orders: 1200 },
  { date: '2024-01-02', revenue: 52000, orders: 1400 },
  { date: '2024-01-03', revenue: 48000, orders: 1300 },
  { date: '2024-01-04', revenue: 61000, orders: 1650 },
  { date: '2024-01-05', revenue: 75000, orders: 1900 },
  { date: '2024-01-06', revenue: 1200000, orders: 2500 },
  { date: '2024-01-07', revenue: 890000, orders: 2200 },
]

export function TestChartDemo() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">LineChart Component Demo</h2>

      {/* Test 1: Multi-line Chart */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Multi-line Analytics Chart</h3>
        <LineChart
          data={sampleData}
          lines={[
            { key: 'pageViews', name: 'Page Views', color: CHART_COLORS.primary },
            { key: 'sessions', name: 'Sessions', color: CHART_COLORS.secondary },
            { key: 'users', name: 'Users', color: CHART_COLORS.tertiary },
          ]}
          height={350}
        />
      </div>

      {/* Test 2: Single Line Chart */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Single Line Chart</h3>
        <LineChart
          data={sampleData}
          lines={[
            { key: 'pageViews', name: 'Page Views', color: '#0ea5e9' },
          ]}
          height={300}
          showLegend={false}
        />
      </div>

      {/* Test 3: Large Numbers (K/M formatting) */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Large Numbers (K/M Formatting)</h3>
        <LineChart
          data={largeNumbersData}
          lines={[
            { key: 'revenue', name: 'Revenue', color: CHART_COLORS.secondary },
            { key: 'orders', name: 'Orders', color: CHART_COLORS.quaternary },
          ]}
          height={350}
        />
      </div>

      {/* Test 4: Loading State */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Loading State</h3>
        <LineChart
          data={[]}
          lines={[]}
          loading={true}
          height={300}
        />
      </div>

      {/* Test 5: Empty State */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Empty State</h3>
        <LineChart
          data={[]}
          lines={[
            { key: 'pageViews', name: 'Page Views', color: CHART_COLORS.primary },
          ]}
          height={300}
        />
      </div>

      {/* Test 6: No Grid */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Without Grid Lines</h3>
        <LineChart
          data={sampleData}
          lines={[
            { key: 'sessions', name: 'Sessions', color: CHART_COLORS.secondary },
          ]}
          height={300}
          showGrid={false}
        />
      </div>

      {/* Test 7: Responsive Height */}
      <div className="rounded-lg border bg-white p-4">
        <h3 className="mb-4 text-lg font-semibold">Tall Chart (500px)</h3>
        <LineChart
          data={sampleData}
          lines={[
            { key: 'pageViews', name: 'Page Views', color: CHART_COLORS.primary },
            { key: 'sessions', name: 'Sessions', color: CHART_COLORS.secondary },
          ]}
          height={500}
        />
      </div>
    </div>
  )
}
