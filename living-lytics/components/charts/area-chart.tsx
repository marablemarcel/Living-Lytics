'use client'

import React, { useState } from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { Props as LegendProps } from 'recharts/types/component/DefaultLegendContent'
import { format, parseISO } from 'date-fns'
import { ChartWrapper } from './chart-wrapper'

// TypeScript Interface for Area Configuration
export interface AreaConfig {
  key: string
  name: string
  color: string
}

// TypeScript Interface for Chart Data
export interface AreaChartData {
  date: string
  [key: string]: string | number
}

type ChartTooltipEntry = {
  name?: string
  value?: string | number
  color?: string
}

type LegendEntry = {
  dataKey?: string
  value?: string
  color?: string
}

// Main Component Props
export interface AreaChartProps {
  data: AreaChartData[]
  areas: AreaConfig[]
  height?: number
  showLegend?: boolean
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
  payload?: ChartTooltipEntry[]
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
        {payload.map((entry, index: number) => (
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
 * Production-Ready Area Chart Component
 * Displays time-series data with filled areas to show volume/trends
 *
 * @example
 * ```tsx
 * <AreaChart
 *   data={[
 *     { date: '2024-01-01', pageViews: 1200, sessions: 800 },
 *     { date: '2024-01-02', pageViews: 1400, sessions: 950 },
 *   ]}
 *   areas={[
 *     { key: 'pageViews', name: 'Page Views', color: '#0ea5e9' },
 *     { key: 'sessions', name: 'Sessions', color: '#10b981' },
 *   ]}
 *   height={350}
 * />
 * ```
 */
const AreaChart = React.memo(function AreaChart({
  data,
  areas,
  height = 300,
  showLegend = true,
  loading = false,
}: AreaChartProps) {
  // State to track which areas are hidden
  const [hiddenAreas, setHiddenAreas] = useState<string[]>([])

  // Handle loading state
  if (loading) {
    return (
      <ChartWrapper isLoading={true} height={height}>
        <></>
      </ChartWrapper>
    )
  }

  // Handle empty state or missing areas
  if (!data || data.length === 0 || !areas || areas.length === 0) {
    return (
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No data available">
        <></>
      </ChartWrapper>
    )
  }

  // Handle legend click to toggle area visibility
  const handleLegendClick = (dataKey: string) => {
    setHiddenAreas((prev) => {
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
  const renderCustomLegend = (props: LegendProps) => {
    const legendPayload = ((props.payload as LegendEntry[]) ?? []).filter(
      (entry): entry is LegendEntry & { dataKey: string } =>
        typeof entry.dataKey === 'string'
    )

    return (
      <div className="flex flex-wrap items-center justify-center gap-4 pt-5">
        {legendPayload.map((entry, index: number) => {
          const isHidden = hiddenAreas.includes(entry.dataKey)

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

              {/* Area name */}
              <span className="text-sm text-gray-700">
                {entry.value ?? entry.dataKey}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {/* Gradient Definitions */}
        <defs>
          {areas.map((area) => (
            <linearGradient
              key={`gradient-${area.key}`}
              id={`gradient-${area.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor={area.color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {/* Grid Lines */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.3}
        />

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

        {/* Render Areas */}
        {areas.map((area) => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            name={area.name}
            stroke={area.color}
            strokeWidth={2}
            fill={`url(#gradient-${area.key})`}
            hide={hiddenAreas.includes(area.key)}
            animationDuration={300}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  )
})

export default AreaChart
