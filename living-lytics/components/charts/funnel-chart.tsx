'use client'

import { ChartWrapper } from './chart-wrapper'

/**
 * Funnel stage data
 */
export interface FunnelStage {
  name: string
  value: number
  color?: string
}

/**
 * Funnel chart props
 */
export interface FunnelChartProps {
  data: FunnelStage[]
  height?: number
  loading?: boolean
}

/**
 * Funnel Chart Component
 * 
 * Displays conversion funnel with drop-off rates between stages
 * 
 * @example
 * ```tsx
 * <FunnelChart
 *   data={[
 *     { name: 'Visitors', value: 10000 },
 *     { name: 'Page Views', value: 7500 },
 *     { name: 'Engaged', value: 3000 },
 *     { name: 'Conversions', value: 500 },
 *   ]}
 * />
 * ```
 */
export default function FunnelChart({ data, height = 400, loading = false }: FunnelChartProps) {
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
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No funnel data available">
        <></>
      </ChartWrapper>
    )
  }

  // Calculate percentages and drop-off rates
  const maxValue = data[0]?.value || 1
  const stages = data.map((stage, index) => {
    const percentage = (stage.value / maxValue) * 100
    const dropOff =
      index > 0 ? ((data[index - 1].value - stage.value) / data[index - 1].value) * 100 : 0

    return {
      ...stage,
      percentage,
      dropOff,
      color: stage.color || getDefaultColor(index),
    }
  })

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex flex-col justify-center h-full gap-4 py-8">
        {stages.map((stage, index) => {
          const width = stage.percentage
          const isFirst = index === 0
          const isLast = index === stages.length - 1

          return (
            <div key={index} className="space-y-2">
              {/* Stage bar */}
              <div className="flex items-center gap-4">
                {/* Bar */}
                <div className="flex-1 relative">
                  <div
                    className="h-16 rounded-lg transition-all duration-300 hover:opacity-90 relative group"
                    style={{
                      width: `${width}%`,
                      backgroundColor: stage.color,
                      marginLeft: `${(100 - width) / 2}%`,
                    }}
                  >
                    {/* Stage info */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="font-semibold text-sm">{stage.name}</div>
                        <div className="text-xs opacity-90">
                          {stage.value.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    {/* Tooltip */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap">
                        <div className="font-semibold">{stage.name}</div>
                        <div>Count: {stage.value.toLocaleString()}</div>
                        <div>Percentage: {stage.percentage.toFixed(2)}%</div>
                        {!isFirst && (
                          <div className="text-red-300">Drop-off: {stage.dropOff.toFixed(2)}%</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="w-32 text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {stage.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{stage.percentage.toFixed(1)}%</div>
                </div>
              </div>

              {/* Drop-off indicator */}
              {!isLast && (
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                    <span className="font-medium">
                      {stages[index + 1].dropOff.toFixed(1)}% drop-off
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Total Entries</p>
            <p className="text-lg font-bold text-gray-900">{data[0]?.value.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Final Conversions</p>
            <p className="text-lg font-bold text-gray-900">
              {data[data.length - 1]?.value.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Conversion Rate</p>
            <p className="text-lg font-bold text-green-600">
              {((data[data.length - 1]?.value / data[0]?.value) * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Drop-off</p>
            <p className="text-lg font-bold text-red-600">
              {(((data[0]?.value - data[data.length - 1]?.value) / data[0]?.value) * 100).toFixed(
                2
              )}
              %
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Get default color for stage
 */
function getDefaultColor(index: number): string {
  const colors = [
    '#0ea5e9', // sky-500
    '#06b6d4', // cyan-500
    '#10b981', // emerald-500
    '#84cc16', // lime-500
    '#eab308', // yellow-500
  ]

  return colors[index % colors.length]
}
