import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardEnhancedProps {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  period?: string
  icon?: React.ReactNode
  loading?: boolean
  onClick?: () => void
  format?: 'number' | 'currency' | 'percentage' | 'time'
}

export function MetricCardEnhanced({
  title,
  value,
  change,
  trend = 'neutral',
  period = 'vs last month',
  icon,
  loading = false,
  onClick,
  format = 'number',
}: MetricCardEnhancedProps) {
  // Format the value based on the format type
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'time':
        // Assume value is in seconds
        const minutes = Math.floor(val / 60)
        const seconds = val % 60
        return `${minutes}m ${seconds}s`
      case 'number':
      default:
        return new Intl.NumberFormat('en-US').format(val)
    }
  }

  // Determine trend styling
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50'
      case 'down':
        return 'text-red-600 bg-red-50'
      case 'neutral':
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return ArrowUp
      case 'down':
        return ArrowDown
      case 'neutral':
      default:
        return Minus
    }
  }

  const TrendIcon = getTrendIcon()
  const trendColor = getTrendColor()

  // Loading skeleton state
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-lg",
        onClick && "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
        "relative overflow-hidden"
      )}
      onClick={onClick}
    >
      {/* Subtle gradient background accent */}
      <div className="absolute inset-0 bg-linear-to-br from-transparent to-gray-50/50 pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && (
          <div className="h-8 w-8 text-gray-400 opacity-80">
            {icon}
          </div>
        )}
      </CardHeader>

      <CardContent className="relative">
        {/* Main value */}
        <div className="text-3xl font-bold tracking-tight mb-3">
          {formatValue(value)}
        </div>

        {/* Trend indicator and period */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 font-medium",
              trendColor,
              "border-0"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            <span className="text-xs">
              {Math.abs(change).toFixed(1)}%
            </span>
          </Badge>

          {period && (
            <span className="text-xs text-gray-500 font-medium">
              {period}
            </span>
          )}
        </div>

        {/* Optional: Visual trend indicator bar */}
        <div className="mt-3 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              trend === 'up' && "bg-green-500",
              trend === 'down' && "bg-red-500",
              trend === 'neutral' && "bg-gray-400"
            )}
            style={{ width: `${Math.min(Math.abs(change) * 2, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
