'use client'

import { useState } from 'react'
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
import type { Props as LegendProps } from 'recharts/types/component/DefaultLegendContent'
import { ChartWrapper } from './chart-wrapper'

// TypeScript Interface for Bar Configuration
export interface BarConfig {
  key: string
  name: string
  color: string
}

// Main Component Props
export interface BarChartProps {
  data: Array<{
    name: string
    [key: string]: string | number
  }>
  bars: BarConfig[]
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

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      {/* Category Header */}
      <p className="mb-2 text-sm font-semibold text-gray-900">
        {label}
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
 * Production-Ready Bar Chart Component
 * Displays categorical data with vertical bars for comparison
 *
 * @example
 * ```tsx
 * <BarChart
 *   data={[
 *     { name: 'Monday', visits: 4000, conversions: 240 },
 *     { name: 'Tuesday', visits: 3000, conversions: 139 },
 *   ]}
 *   bars={[
 *     { key: 'visits', name: 'Visits', color: '#0ea5e9' },
 *     { key: 'conversions', name: 'Conversions', color: '#10b981' },
 *   ]}
 *   height={350}
 * />
 * ```
 */
export default function BarChart({
  data,
  bars,
  height = 300,
  showLegend = true,
  loading = false,
}: BarChartProps) {
  // State to track which bars are hidden
  const [hiddenBars, setHiddenBars] = useState<string[]>([])

  // Handle loading state
  if (loading) {
    return (
      <ChartWrapper isLoading={true} height={height}>
        <></>
      </ChartWrapper>
    )
  }

  // Handle empty state or missing bars
  if (!data || data.length === 0 || !bars || bars.length === 0) {
    return (
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No data available">
        <></>
      </ChartWrapper>
    )
  }

  // Handle legend click to toggle bar visibility
  const handleLegendClick = (dataKey: string) => {
    setHiddenBars((prev) => {
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
          const isHidden = hiddenBars.includes(entry.dataKey)

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

              {/* Bar name */}
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
      <RechartsBarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        {/* Grid Lines */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="hsl(var(--border))"
          opacity={0.3}
        />

        {/* X-Axis */}
        <XAxis
          dataKey="name"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
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

        {/* Render Bars */}
        {bars.map((bar) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.name}
            fill={bar.color}
            radius={[4, 4, 0, 0]}
            hide={hiddenBars.includes(bar.key)}
            animationDuration={300}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}
