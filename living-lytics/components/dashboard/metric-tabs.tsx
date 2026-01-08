'use client'

import {
  Users,
  Activity,
  Eye,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Target,
  DollarSign,
  ShoppingCart,
  Clock,
  FileText,
  RotateCcw,
  Share2,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetricCard } from '@/components/ui/metric-card'
import {
  getAllCategories,
  overviewMetrics,
  type MetricData,
} from '@/lib/data/mockMetrics'

interface MetricTabsProps {
  defaultCategory?: string
}

// Map icon names to actual icon components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Activity,
  Eye,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Target,
  DollarSign,
  ShoppingCart,
  Clock,
  FileText,
  RotateCcw,
  Share2,
}

// Render a metric card with the appropriate icon
function renderMetricCard(metric: MetricData) {
  const IconComponent = metric.icon ? iconMap[metric.icon] : null

  return (
    <MetricCard
      key={metric.id}
      title={metric.name}
      value={metric.value}
      change={metric.change}
      trend={metric.trend}
      icon={
        IconComponent ? (
          <IconComponent className="h-4 w-4 text-muted-foreground" />
        ) : undefined
      }
    />
  )
}

export function MetricTabs({ defaultCategory = 'all' }: MetricTabsProps) {
  const categories = getAllCategories()

  return (
    <Tabs defaultValue={defaultCategory} className="w-full">
      <TabsList className="mb-6 w-full justify-start overflow-x-auto">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="traffic">Traffic</TabsTrigger>
        <TabsTrigger value="conversion">Conversions</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
      </TabsList>

      {/* All Tab - Shows key metrics from each category */}
      <TabsContent value="all" className="mt-0">
        <div className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Overview</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {overviewMetrics.map(renderMetricCard)}
            </div>
          </div>

          {categories.map((category) => (
            <div key={category.category}>
              <h3 className="mb-4 text-lg font-semibold">
                {category.displayName}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {category.metrics.slice(0, 4).map(renderMetricCard)}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {/* Individual Category Tabs */}
      {categories.map((category) => (
        <TabsContent
          key={category.category}
          value={category.category}
          className="mt-0"
        >
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              {category.displayName}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {category.metrics.map(renderMetricCard)}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
