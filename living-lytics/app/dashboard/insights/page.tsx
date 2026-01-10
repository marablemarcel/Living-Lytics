'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, TrendingUp, Users, DollarSign, Activity, AlertCircle, Info, CheckCircle } from 'lucide-react'
import { useDataSources } from '@/app/hooks/useDataSources'
import { generateMockInsights } from '@/lib/data/mock-data'
import { cn } from '@/lib/utils'

export default function InsightsPage() {
  const router = useRouter()
  const { hasDataSources, toggleMockData } = useDataSources()
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  // Handle connect data source action
  const handleConnectDataSource = () => {
    router.push('/dashboard/sources')
  }

  // Get mock insights
  const allInsights = generateMockInsights()
  const filteredInsights = filter === 'all'
    ? allInsights
    : allInsights.filter(insight => insight.priority === filter)

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'traffic':
        return <Users className="h-4 w-4" />
      case 'engagement':
        return <Activity className="h-4 w-4" />
      case 'conversion':
        return <TrendingUp className="h-4 w-4" />
      case 'revenue':
        return <DollarSign className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  // Get priority badge styling and icon
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          variant: 'destructive' as const,
          className: 'bg-red-500 hover:bg-red-600',
        }
      case 'medium':
        return {
          icon: <Info className="h-3 w-3" />,
          variant: 'default' as const,
          className: 'bg-blue-500 hover:bg-blue-600',
        }
      case 'low':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          variant: 'secondary' as const,
          className: 'bg-gray-500 hover:bg-gray-600',
        }
      default:
        return {
          icon: null,
          variant: 'outline' as const,
          className: '',
        }
    }
  }

  // Show empty state if no data sources are connected
  if (!hasDataSources) {
    return (
      <div className="space-y-6">
        {/* Dev-only Toggle */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-800">
                Development Mode: {hasDataSources ? 'Showing mock data' : 'Showing empty state'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleMockData}
              >
                Toggle Mock Data
              </Button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
            <p className="text-muted-foreground">
              AI insights will appear here once you connect your data sources
            </p>
          </div>
        </div>

        {/* Empty State */}
        <EmptyState
          title="No insights available"
          description="AI insights will appear here once you connect your data sources. Get personalized recommendations and actionable insights powered by AI."
          onAction={handleConnectDataSource}
          icon={<Lightbulb className="h-12 w-12 text-blue-600" strokeWidth={1.5} />}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dev-only Toggle */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-yellow-800">
              Development Mode: {hasDataSources ? 'Showing mock data' : 'Showing empty state'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMockData}
            >
              Toggle Mock Data
            </Button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          Actionable recommendations powered by AI
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Insights
        </Button>
        <Button
          variant={filter === 'high' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('high')}
          className={cn(filter === 'high' && 'bg-red-500 hover:bg-red-600')}
        >
          High Priority
        </Button>
        <Button
          variant={filter === 'medium' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('medium')}
          className={cn(filter === 'medium' && 'bg-blue-500 hover:bg-blue-600')}
        >
          Medium Priority
        </Button>
        <Button
          variant={filter === 'low' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('low')}
          className={cn(filter === 'low' && 'bg-gray-500 hover:bg-gray-600')}
        >
          Low Priority
        </Button>
      </div>

      {/* Insights Grid */}
      <div className="grid gap-4">
        {filteredInsights.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No insights match the selected filter
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInsights.map((insight) => {
            const priorityConfig = getPriorityConfig(insight.priority)
            return (
              <Card key={insight.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {getCategoryIcon(insight.category)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {insight.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={cn('shrink-0', priorityConfig.className)}>
                      <span className="flex items-center gap-1">
                        {priorityConfig.icon}
                        <span className="capitalize">{insight.priority}</span>
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="capitalize">
                        {insight.category}
                      </Badge>
                      <span className="font-semibold text-green-600">
                        {insight.impact}
                      </span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(insight.date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* AI Notice */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI-Powered Insights
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                These insights are automatically generated based on your data patterns and industry benchmarks.
                New insights are added daily as your data evolves.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
