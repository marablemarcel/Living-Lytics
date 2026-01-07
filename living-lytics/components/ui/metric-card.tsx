import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export function MetricCard({ title, value, change, trend = 'neutral', icon }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  const TrendIcon = trend === 'up' ? ArrowUp : ArrowDown

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${trendColor} mt-1`}>
            <TrendIcon className="h-4 w-4 mr-1" />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
