'use client'

import { useState } from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartWrapper } from './chart-wrapper'
import { CHART_COLOR_ARRAY } from '@/lib/constants/chart-colors'

// TypeScript Interface for Pie Data
export interface PieChartData {
  name: string
  value: number
  color?: string
}

// Main Component Props
export interface PieChartProps {
  data: PieChartData[]
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
 * Displays name, value, and percentage
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: PieTooltipEntry[]
}

type PieTooltipEntry = {
  payload: {
    name: string
    value: number
    percent: number
  }
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  const item = payload?.[0]?.payload
  if (!active || !item) {
    return null
  }

  const { name, value, percent } = item

  return (
    <div className="rounded-lg border bg-white p-3 shadow-lg">
      <div className="space-y-1">
        {/* Name */}
        <p className="text-sm font-semibold text-gray-900">{name}</p>

        {/* Value and Percentage */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Value:</span>
          <span className="text-xs font-semibold text-gray-900">
            {formatNumber(value)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Share:</span>
          <span className="text-xs font-semibold text-gray-900">
            {(percent * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * Combines small slices into "Other" category
 * Limits display to 6 slices maximum
 */
const processData = (data: PieChartData[]): PieChartData[] => {
  if (data.length <= 6) {
    return data
  }

  // Sort by value descending
  const sorted = [...data].sort((a, b) => b.value - a.value)

  // Take top 5 and combine rest into "Other"
  const top5 = sorted.slice(0, 5)
  const rest = sorted.slice(5)

  const otherValue = rest.reduce((sum, item) => sum + item.value, 0)

  return [
    ...top5,
    {
      name: 'Other',
      value: otherValue,
      color: '#94a3b8', // Gray color for "Other"
    },
  ]
}

/**
 * Production-Ready Pie Chart Component
 * Displays distribution/proportions with percentages
 *
 * @example
 * ```tsx
 * <PieChart
 *   data={[
 *     { name: 'Direct', value: 4000, color: '#0ea5e9' },
 *     { name: 'Social', value: 3000, color: '#10b981' },
 *     { name: 'Search', value: 2000, color: '#f59e0b' },
 *   ]}
 *   height={350}
 * />
 * ```
 */
export default function PieChart({
  data,
  height = 300,
  showLegend = true,
  loading = false,
}: PieChartProps) {
  // State to track which slices are hidden
  const [hiddenSlices, setHiddenSlices] = useState<string[]>([])

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
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No data available">
        <></>
      </ChartWrapper>
    )
  }

  // Process data (limit to 6 slices)
  const processedData = processData(data)

  // Assign colors if not provided
  const dataWithColors = processedData.map((item, index) => ({
    ...item,
    color: item.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length],
  }))

  // Filter out hidden slices
  const visibleData = dataWithColors.filter(
    (item) => !hiddenSlices.includes(item.name)
  )

  // Calculate total for percentages
  const total = visibleData.reduce((sum, item) => sum + item.value, 0)

  // Add percentage to each item
  const dataWithPercentages = visibleData.map((item) => ({
    ...item,
    percent: item.value / total,
  }))

  // Handle legend click to toggle slice visibility
  const handleLegendClick = (name: string) => {
    setHiddenSlices((prev) => {
      if (prev.includes(name)) {
        // If already hidden, show it
        return prev.filter((key) => key !== name)
      } else {
        // Don't allow hiding all slices
        if (prev.length >= dataWithColors.length - 1) {
          return prev
        }
        // If visible, hide it
        return [...prev, name]
      }
    })
  }

  // Custom legend renderer
  const renderCustomLegend = () => {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4 pt-5">
        {dataWithColors.map((entry, index) => {
          const isHidden = hiddenSlices.includes(entry.name)

          return (
            <div
              key={`legend-${index}`}
              className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
              style={{ opacity: isHidden ? 0.5 : 1 }}
              onClick={() => handleLegendClick(entry.name)}
            >
              {/* Color indicator */}
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />

              {/* Slice name and value */}
              <span className="text-sm text-gray-700">
                {entry.name}: {formatNumber(entry.value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        {/* Custom Tooltip */}
        <Tooltip content={<CustomTooltip />} />

        {/* Interactive Custom Legend */}
        {showLegend && <Legend content={renderCustomLegend} />}

        {/* Pie */}
        <Pie
          data={dataWithPercentages}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          animationDuration={300}
        >
          {dataWithPercentages.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
