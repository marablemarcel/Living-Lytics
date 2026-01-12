'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartWrapper } from './chart-wrapper'

/**
 * Comparison data point
 */
export interface ComparisonDataPoint {
  name: string
  [key: string]: string | number
}

/**
 * Comparison metric configuration
 */
export interface ComparisonMetric {
  key: string
  name: string
  color: string
}

/**
 * Comparison chart props
 */
export interface ComparisonChartProps {
  data: ComparisonDataPoint[]
  metrics: ComparisonMetric[]
  height?: number
  showLegend?: boolean
  loading?: boolean
}

/**
 * Tooltip props
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
    dataKey: string
  }>
  label?: string
}

/**
 * Format number with K/M abbreviations
 */
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toLocaleString()
}

/**
 * Custom tooltip component
 */
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-900">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-gray-600">{entry.name}:</span>
            <span className="text-xs font-semibold text-gray-900">
              {formatNumber(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Comparison Chart Component
 * 
 * Displays side-by-side comparison of multiple metrics across categories
 * 
 * @example
 * ```tsx
 * <ComparisonChart
 *   data={[
 *     { name: 'Jan', current: 1200, previous: 1000 },
 *     { name: 'Feb', current: 1400, previous: 1100 },
 *   ]}
 *   metrics={[
 *     { key: 'current', name: 'This Period', color: '#0ea5e9' },
 *     { key: 'previous', name: 'Last Period', color: '#94a3b8' },
 *   ]}
 * />
 * ```
 */
export default function ComparisonChart({
  data,
  metrics,
  height = 350,
  showLegend = true,
  loading = false,
}: ComparisonChartProps) {
  // Handle loading state
  if (loading) {
    return (
      <ChartWrapper isLoading={true} height={height}>
        <></>
      </ChartWrapper>
    )
  }

  // Handle empty state
  if (!data || data.length === 0 || !metrics || metrics.length === 0) {
    return (
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No comparison data available">
        <></>
      </ChartWrapper>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {/* Grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />

        {/* X-Axis */}
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />

        {/* Y-Axis */}
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatNumber}
        />

        {/* Tooltip */}
        <Tooltip content={<CustomTooltip />} />

        {/* Legend */}
        {showLegend && <Legend />}

        {/* Bars */}
        {metrics.map((metric) => (
          <Bar
            key={metric.key}
            dataKey={metric.key}
            name={metric.name}
            fill={metric.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
