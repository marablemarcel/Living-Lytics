'use client'

import { ChartWrapper } from './chart-wrapper'

/**
 * Heatmap data point
 */
export interface HeatmapDataPoint {
  day: string // Day of week (Mon, Tue, etc.)
  hour: number // Hour of day (0-23)
  value: number // Activity intensity
}

/**
 * Heatmap props
 */
export interface HeatmapProps {
  data: HeatmapDataPoint[]
  height?: number
  loading?: boolean
}

/**
 * Get color based on intensity value
 */
function getIntensityColor(value: number, maxValue: number): string {
  if (maxValue === 0) return 'rgb(241, 245, 249)' // slate-100

  const intensity = value / maxValue

  if (intensity > 0.8) return 'rgb(30, 64, 175)' // blue-800
  if (intensity > 0.6) return 'rgb(59, 130, 246)' // blue-500
  if (intensity > 0.4) return 'rgb(96, 165, 250)' // blue-400
  if (intensity > 0.2) return 'rgb(147, 197, 253)' // blue-300
  if (intensity > 0) return 'rgb(191, 219, 254)' // blue-200

  return 'rgb(241, 245, 249)' // slate-100
}

/**
 * Format hour for display
 */
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  if (hour < 12) return `${hour} AM`
  return `${hour - 12} PM`
}

/**
 * Heatmap Component
 * 
 * Displays activity heatmap showing engagement patterns by day of week and hour
 * 
 * @example
 * ```tsx
 * <Heatmap
 *   data={[
 *     { day: 'Mon', hour: 9, value: 120 },
 *     { day: 'Mon', hour: 10, value: 150 },
 *   ]}
 * />
 * ```
 */
export default function Heatmap({ data, height = 400, loading = false }: HeatmapProps) {
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
      <ChartWrapper isEmpty={true} height={height} emptyMessage="No activity data available">
        <></>
      </ChartWrapper>
    )
  }

  // Days of week
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Find max value for color scaling
  const maxValue = Math.max(...data.map((d) => d.value))

  // Create data map for quick lookup
  const dataMap = new Map<string, number>()
  data.forEach((d) => {
    const key = `${d.day}-${d.hour}`
    dataMap.set(key, d.value)
  })

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-200">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Activity Heatmap</h3>
              <p className="text-xs text-gray-500">Engagement by day and hour</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Low</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: getIntensityColor(intensity * maxValue, maxValue) }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">High</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-1">
          {/* Hour labels */}
          <div className="flex">
            <div className="w-16" /> {/* Space for day labels */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-gray-500"
                style={{ minWidth: '32px' }}
              >
                {hour % 3 === 0 ? hour : ''}
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          {days.map((day) => (
            <div key={day} className="flex items-center gap-1">
              {/* Day label */}
              <div className="w-16 text-sm font-medium text-gray-700">{day}</div>

              {/* Hour cells */}
              {hours.map((hour) => {
                const key = `${day}-${hour}`
                const value = dataMap.get(key) || 0
                const color = getIntensityColor(value, maxValue)

                return (
                  <div
                    key={hour}
                    className="flex-1 aspect-square rounded group relative cursor-pointer transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      minWidth: '32px',
                      minHeight: '32px',
                    }}
                    title={`${day} ${formatHour(hour)}: ${value.toLocaleString()}`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        <div className="font-semibold">{day} {formatHour(hour)}</div>
                        <div>{value.toLocaleString()} activities</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Hour labels bottom */}
        <div className="flex mt-2">
          <div className="w-16" />
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex-1 text-center text-xs text-gray-500"
              style={{ minWidth: '32px' }}
            >
              {hour % 6 === 0 ? formatHour(hour) : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
