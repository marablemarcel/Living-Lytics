'use client'

import { useState } from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ChartWrapper } from './chart-wrapper'

// TypeScript Interface for Line Configuration
export interface LineConfig {
  key: string
  name: string
  color: string
}

// TypeScript Interface for Chart Data
export interface LineChartData {
  date: string
  [key: string]: string | number
}

// Main Component Props
export interface LineChartProps {
  data: LineChartData[]
  lines: LineConfig[]
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  loading?: boolean
}

/**
 * Formats numbers with K/M abbreviations
 * @param value - The number to format
 * @returns Formatted string (e.g., 1.2K, 1.5M)
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
 * Custom Tooltip Component
 * Displays formatted data on hover with proper styling
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      {/* Date Header */}
      <p className="mb-2 text-sm font-semibold text-gray-900">
        {label ? format(parseISO(label), 'MMM dd, yyyy') : ''}
      </p>

      {/* Metric Values */}
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            {/* Color Indicator */}
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />

            {/* Metric Name */}
            <span className="text-xs text-gray-600">{entry.name}:</span>

            {/* Metric Value */}
            <span className="text-xs font-semibold text-gray-900">
              {typeof entry.value === 'number'
                ? formatNumber(entry.value)
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Production-Ready Line Chart Component
 * Displays time-series data with multiple lines
 *
 * @example
 * ```tsx
 * <LineChart
 *   data={[
 *     { date: '2024-01-01', pageViews: 1200, sessions: 800 },
 *     { date: '2024-01-02', pageViews: 1400, sessions: 950 },
 *   ]}
 *   lines={[
 *     { key: 'pageViews', name: 'Page Views', color: '#0ea5e9' },
 *     { key: 'sessions', name: 'Sessions', color: '#10b981' },
 *   ]}
 *   height={350}
 * />
 * ```
 */
export default function LineChart({
  data,
  lines,
  height = 300,
  showLegend = true,
  showGrid = true,
  loading = false,
}: LineChartProps) {
  // State to track which lines are hidden
  const [hiddenLines, setHiddenLines] = useState<string[]>([])

  // Handle loading state
  if (loading) {
    return (
      <ChartWrapper isLoading={true} height={height}>
        <></>
      </ChartWrapper>
    )
  }

  // Handle empty state or missing lines
  if (!data || data.length === 0 || !lines || lines.length === 0) {
    return (
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No data available">
        <></>
      </ChartWrapper>
    )
  }

  // Handle legend click to toggle line visibility
  const handleLegendClick = (dataKey: string) => {
    setHiddenLines((prev) => {
      if (prev.includes(dataKey)) {
        // If already hidden, show it
        return prev.filter((key) => key !== dataKey)
      } else {
        // If visible, hide it
        return [...prev, dataKey]
      }
    })
  }

  // Custom legend renderer for interactive legend
  const renderCustomLegend = (props: any) => {
    const { payload } = props

    return (
      <div className="flex flex-wrap items-center justify-center gap-4 pt-5">
        {payload.map((entry: any, index: number) => {
          const isHidden = hiddenLines.includes(entry.dataKey)

          return (
            <div
              key={`legend-${index}`}
              className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
              style={{ opacity: isHidden ? 0.5 : 1 }}
              onClick={() => handleLegendClick(entry.dataKey)}
            >
              {/* Color indicator */}
              <div
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />

              {/* Line name */}
              <span className="text-sm text-gray-700">
                {entry.value}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {/* Grid Lines */}
        {showGrid && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
        )}

        {/* X-Axis with Date Formatting */}
        <XAxis
          dataKey="date"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            try {
              return format(parseISO(value), 'MMM dd')
            } catch {
              return value
            }
          }}
        />

        {/* Y-Axis with Number Formatting */}
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => formatNumber(value)}
        />

        {/* Custom Tooltip */}
        <Tooltip content={<CustomTooltip />} />

        {/* Interactive Custom Legend */}
        {showLegend && <Legend content={renderCustomLegend} />}

        {/* Render Lines */}
        {lines.map((line) => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            name={line.name}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            hide={hiddenLines.includes(line.key)}
            activeDot={{
              r: 4,
              fill: line.color,
              strokeWidth: 2,
              stroke: '#fff',
            }}
            animationDuration={300}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}
