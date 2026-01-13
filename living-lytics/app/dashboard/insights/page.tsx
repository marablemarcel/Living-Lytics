'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { useDataSources } from '@/app/hooks/useDataSources'
import { cn } from '@/lib/utils'
import { InsightCard, type Insight } from '@/components/insights/insight-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function InsightsPage() {
  const router = useRouter()
  const { hasDataSources } = useDataSources()
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'viewed' | 'dismissed'>('all')
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Handle connect data source action
  const handleConnectDataSource = () => {
    router.push('/dashboard/sources')
  }

  // Handle generate insights action
  const handleGenerateInsights = async () => {
    setGenerating(true)
    try {
      // Calculate date range (last 30 days)
      const endDate = new Date()
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]
      
      // Fetch aggregated metrics from analytics API
      const metricsResponse = await fetch(`/api/metrics/aggregated?startDate=${startDateStr}&endDate=${endDateStr}`)
      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch metrics')
      }
      
      const metricsData = await metricsResponse.json()
      
      // Use totals for insight generation
      const metrics = metricsData.totals || metricsData
      
      // Call insight generation API
      const insightResponse = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metrics: metrics,
          platform: 'all',
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }),
      })
      
      if (!insightResponse.ok) {
        const errorData = await insightResponse.json()
        throw new Error(errorData.details || 'Failed to generate insight')
      }
      
      // Refresh insights list
      await fetchInsights()
    } catch (error) {
      console.error('Error generating insights:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate insights. Please ensure OpenAI API key is configured.')
    } finally {
      setGenerating(false)
    }
  }

  // Fetch insights
  const fetchInsights = async () => {
    if (!hasDataSources) {
      setInsights([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/insights/generate?limit=50')
      if (!response.ok) throw new Error('Failed to fetch insights')
      
      const data = await response.json()
      setInsights(data.insights || [])
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [hasDataSources])

  // Handle insight actions
  const handleView = async (id: string) => {
    try {
      await fetch(`/api/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'view' }),
      })
      
      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === id 
          ? { ...insight, viewed_at: new Date().toISOString() }
          : insight
      ))
    } catch (error) {
      console.error('Error marking insight as viewed:', error)
    }
  }

  const handleDismiss = async (id: string) => {
    try {
      await fetch(`/api/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      })
      
      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === id 
          ? { ...insight, dismissed: true }
          : insight
      ))
    } catch (error) {
      console.error('Error dismissing insight:', error)
    }
  }

  const handleFeedback = async (id: string, feedback: 'helpful' | 'not_helpful') => {
    try {
      await fetch(`/api/insights/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      })
      
      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === id 
          ? { ...insight, feedback, feedback_at: new Date().toISOString() }
          : insight
      ))
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  // Filter insights
  const filteredInsights = insights.filter(insight => {
    // Priority filter
    if (filter !== 'all' && insight.priority !== filter) return false
    
    // Status filter
    if (statusFilter === 'new' && (insight.viewed_at || insight.dismissed)) return false
    if (statusFilter === 'viewed' && (!insight.viewed_at || insight.dismissed)) return false
    if (statusFilter === 'dismissed' && !insight.dismissed) return false
    
    return true
  })

  // Show empty state if no data sources are connected
  if (!hasDataSources) {
    return (
      <div className="space-y-6">
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            Actionable recommendations powered by AI
          </p>
        </div>
        <Button 
          onClick={handleGenerateInsights} 
          disabled={generating}
          className="gap-2"
        >
          {generating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4" />
              Generate Insights
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="medium">Medium Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Insights Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredInsights.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {insights.length === 0 
                  ? 'No insights yet. Click "Generate Insights" to create your first AI-powered recommendation.'
                  : 'No insights match the selected filters.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onView={handleView}
              onDismiss={handleDismiss}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      )}

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
                Click "Generate Insights" to create new recommendations based on your latest data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
