import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface ChartSkeletonProps {
  height?: number
}

export function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        {/* Title skeleton */}
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        {/* Chart area skeleton */}
        <div
          className="w-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] rounded-lg animate-shimmer"
          style={{ height: `${height}px` }}
        />
      </CardContent>
    </Card>
  )
}
