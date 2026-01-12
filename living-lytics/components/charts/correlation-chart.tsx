'use client'

import { useMemo } from 'react'
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
  ReferenceLine,
} from 'recharts'
import { ChartWrapper } from './chart-wrapper'

/**
 * Correlation data point
 */
export interface CorrelationDataPoint {
  date: string
  x: number
  y: number
  name?: string
}

/**
 * Correlation chart props
 */
export interface CorrelationChartProps {
  data: CorrelationDataPoint[]
  xLabel: string
  yLabel: string
  height?: number
  showTrendLine?: boolean
  loading?: boolean
}

/**
 * Tooltip props
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CorrelationDataPoint
  }>
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
const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-gray-900">
        {data.name || data.date}
      </p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">X:</span>
          <span className="text-xs font-semibold text-gray-900">
            {formatNumber(data.x)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Y:</span>
          <span className="text-xs font-semibold text-gray-900">
            {formatNumber(data.y)}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate linear regression for trend line
 */
function calculateTrendLine(data: CorrelationDataPoint[]): { slope: number; intercept: number } {
  if (data.length < 2) {
    return { slope: 0, intercept: 0 }
  }

  const n = data.length
  const xValues = data.map((d) => d.x)
  const yValues = data.map((d) => d.y)

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  return { slope, intercept }
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(data: CorrelationDataPoint[]): number {
  if (data.length < 2) return 0

  const n = data.length
  const xValues = data.map((d) => d.x)
  const yValues = data.map((d) => d.y)

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)
  const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0

  return numerator / denominator
}

/**
 * Correlation Chart Component
 * 
 * Displays scatter plot showing correlation between two metrics with optional trend line
 * 
 * @example
 * ```tsx
 * <CorrelationChart
 *   data={[
 *     { date: '2024-01-01', x: 1200, y: 800 },
 *     { date: '2024-01-02', x: 1400, y: 950 },
 *   ]}
 *   xLabel="Web Sessions"
 *   yLabel="Social Engagement"
 *   showTrendLine={true}
 * />
 * ```
 */
export default function CorrelationChart({
  data,
  xLabel,
  yLabel,
  height = 400,
  showTrendLine = true,
  loading = false,
}: CorrelationChartProps) {
  // Calculate correlation coefficient
  const correlation = useMemo(() => calculateCorrelation(data), [data])

  // Calculate trend line
  const trendLine = useMemo(() => {
    if (!showTrendLine || data.length < 2) return null

    const { slope, intercept } = calculateTrendLine(data)
    const xValues = data.map((d) => d.x).sort((a, b) => a - b)
    const minX = xValues[0]
    const maxX = xValues[xValues.length - 1]

    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept },
    ]
  }, [data, showTrendLine])

  // Handle loading state
  if (loading) {
    return (
      <ChartWrapper isLoading={true} height={height}>
        <></>
      </ChartWrapper>
    )
  }

  // Handle empty state
  if (!data || data.length === 0) {
    return (
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No correlation data available">
        <></>
      </ChartWrapper>
    )
  }

  return (
    <div className="space-y-4">
      {/* Correlation coefficient display */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Correlation Coefficient</p>
          <p className="text-2xl font-bold text-gray-900">{correlation.toFixed(3)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {Math.abs(correlation) > 0.7
              ? 'Strong correlation'
              : Math.abs(correlation) > 0.4
              ? 'Moderate correlation'
              : 'Weak correlation'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsScatterChart
          margin={{
            top: 20,
            right: 30,
            bottom: 20,
            left: 20,
          }}
        >
          {/* Grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />

          {/* X-Axis */}
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatNumber}
            label={{
              value: xLabel,
              position: 'insideBottom',
              offset: -10,
              style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
            }}
          />

          {/* Y-Axis */}
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatNumber}
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: 'hsl(var(--muted-foreground))' },
            }}
          />

          {/* Tooltip */}
          <Tooltip content={<CustomTooltip />} />

          {/* Legend */}
          <Legend />

          {/* Scatter points */}
          <Scatter
            name="Data Points"
            data={data}
            fill="#0ea5e9"
            fillOpacity={0.6}
            strokeWidth={2}
            stroke="#0ea5e9"
          />

          {/* Trend line */}
          {showTrendLine && trendLine && (
            <Scatter
              name="Trend Line"
              data={trendLine}
              fill="none"
              line={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }}
              shape={() => <g />}
            />
          )}
        </RechartsScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
