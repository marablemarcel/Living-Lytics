/**
 * Metrics Data Service
 * 
 * Fetches and aggregates metrics data from the database for dashboard display
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Metric data point for charts
 */
export interface MetricDataPoint {
  date: string
  pageViews: number
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
  pagesPerSession?: number
  engagementRate?: number
}

/**
 * Aggregated metrics for metric cards
 */
export interface AggregatedMetrics {
  pageViews: number
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
  pagesPerSession: number
  engagementRate: number
}

/**
 * Fetch metrics for a date range
 */
export async function fetchMetrics(
  sourceId: string,
  startDate: string,
  endDate: string
): Promise<MetricDataPoint[]> {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch all metrics for the date range
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', user.id)
    .eq('source_id', sourceId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching metrics:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return []
  }

  // Group by date
  const groupedByDate = data.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = {
        date: record.date,
        pageViews: 0,
        sessions: 0,
        users: 0,
        bounceRate: 0,
        avgSessionDuration: 0,
        pagesPerSession: 0,
        engagementRate: 0,
      }
    }

    // Map metric_type to property
    switch (record.metric_type) {
      case 'page_views':
        acc[record.date].pageViews = record.metric_value
        break
      case 'sessions':
        acc[record.date].sessions = record.metric_value
        break
      case 'users':
        acc[record.date].users = record.metric_value
        break
      case 'bounce_rate':
        acc[record.date].bounceRate = record.metric_value
        break
      case 'avg_session_duration':
        acc[record.date].avgSessionDuration = record.metric_value
        break
      case 'pages_per_session':
        acc[record.date].pagesPerSession = record.metric_value
        break
      case 'engagement_rate':
        acc[record.date].engagementRate = record.metric_value
        break
    }

    return acc
  }, {} as Record<string, MetricDataPoint>)

  // Convert to array and sort by date
  return Object.values(groupedByDate).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Fetch aggregated metrics for a date range
 */
export async function fetchAggregatedMetrics(
  sourceId: string,
  startDate: string,
  endDate: string
): Promise<AggregatedMetrics> {
  const metrics = await fetchMetrics(sourceId, startDate, endDate)

  if (metrics.length === 0) {
    return {
      pageViews: 0,
      sessions: 0,
      users: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      pagesPerSession: 0,
      engagementRate: 0,
    }
  }

  // Calculate totals and averages
  const totalPageViews = metrics.reduce((sum, m) => sum + m.pageViews, 0)
  const totalSessions = metrics.reduce((sum, m) => sum + m.sessions, 0)
  const totalUsers = metrics.reduce((sum, m) => sum + m.users, 0)
  const avgBounceRate = metrics.reduce((sum, m) => sum + m.bounceRate, 0) / metrics.length
  const avgSessionDuration = metrics.reduce((sum, m) => sum + m.avgSessionDuration, 0) / metrics.length
  const avgPagesPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0
  const avgEngagementRate = (1 - avgBounceRate / 100) * 100

  return {
    pageViews: totalPageViews,
    sessions: totalSessions,
    users: totalUsers,
    bounceRate: Number(avgBounceRate.toFixed(2)),
    avgSessionDuration: Number(avgSessionDuration.toFixed(2)),
    pagesPerSession: Number(avgPagesPerSession.toFixed(2)),
    engagementRate: Number(avgEngagementRate.toFixed(2)),
  }
}

/**
 * Get the first connected GA data source for the user
 */
export async function getFirstGASource(): Promise<{ id: string; lastSyncedAt: string | null } | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('data_sources')
    .select('id, last_synced_at')
    .eq('user_id', user.id)
    .eq('platform', 'google_analytics')
    .eq('connection_status', 'connected')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    lastSyncedAt: data.last_synced_at,
  }
}

/**
 * Check if user has any metrics data
 */
export async function hasMetricsData(sourceId: string): Promise<boolean> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { count, error } = await supabase
    .from('metrics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('source_id', sourceId)
    .limit(1)

  if (error) {
    console.error('Error checking metrics data:', error)
    return false
  }

  return (count ?? 0) > 0
}
