'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'

/**
 * Time period for comparison
 */
export type TimePeriod = 'week' | 'month' | 'quarter' | 'year'

/**
 * Metric comparison data
 */
export interface MetricComparison {
  name: string
  currentValue: number
  previousValue: number
  format?: 'number' | 'percentage' | 'currency' | 'duration'
}

/**
 * Metric comparison props
 */
export interface MetricComparisonProps {
  metrics: MetricComparison[]
  period?: TimePeriod
  onPeriodChange?: (period: TimePeriod) => void
}

/**
 * Format value based on type
 */
function formatValue(value: number, format: MetricComparison['format'] = 'number'): string {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'duration':
      const minutes = Math.floor(value / 60)
      const seconds = value % 60
      return `${minutes}m ${seconds}s`
    default:
      return value.toLocaleString()
  }
}

/**
 * Calculate change percentage
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Get trend icon and color
 */
function getTrendIndicator(change: number): {
  icon: React.ReactNode
  color: string
  bgColor: string
} {
  if (change > 0) {
    return {
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    }
  } else if (change < 0) {
    return {
      icon: <TrendingDown className="h-4 w-4" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    }
  } else {
    return {
      icon: <Minus className="h-4 w-4" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    }
  }
}

/**
 * Get period label
 */
function getPeriodLabel(period: TimePeriod): string {
  const labels: Record<TimePeriod, string> = {
    week: 'vs Last Week',
    month: 'vs Last Month',
    quarter: 'vs Last Quarter',
    year: 'vs Last Year',
  }
  return labels[period]
}

/**
 * Metric Comparison Component
 * 
 * Displays metric comparisons with change percentages and trend indicators
 * 
 * @example
 * ```tsx
 * <MetricComparison
 *   metrics={[
 *     { name: 'Page Views', currentValue: 12500, previousValue: 10000 },
 *     { name: 'Sessions', currentValue: 8200, previousValue: 8500 },
 *   ]}
 *   period="month"
 * />
 * ```
 */
export default function MetricComparison({
  metrics,
  period = 'month',
  onPeriodChange,
}: MetricComparisonProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>(period)

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setSelectedPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  const periods: TimePeriod[] = ['week', 'month', 'quarter', 'year']

  return (
    <div className="space-y-6">
      {/* Period selector */}
      {onPeriodChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Compare:</span>
          <div className="flex gap-1 rounded-lg border p-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  selectedPeriod === p
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const change = calculateChange(metric.currentValue, metric.previousValue)
          const trend = getTrendIndicator(change)

          return (
            <Card key={index} className="p-6">
              {/* Metric name */}
              <p className="text-sm font-medium text-gray-600 mb-2">{metric.name}</p>

              {/* Current value */}
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-3xl font-bold text-gray-900">
                  {formatValue(metric.currentValue, metric.format)}
                </p>
              </div>

              {/* Comparison */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded ${trend.bgColor}`}>
                    <span className={trend.color}>{trend.icon}</span>
                    <span className={`text-sm font-semibold ${trend.color}`}>
                      {Math.abs(change).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{getPeriodLabel(selectedPeriod)}</p>
              </div>

              {/* Previous value */}
              <p className="text-xs text-gray-500 mt-2">
                Previous: {formatValue(metric.previousValue, metric.format)}
              </p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
