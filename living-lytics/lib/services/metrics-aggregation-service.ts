/**
 * Metrics Aggregation Service
 *
 * Aggregates metrics from multiple platforms (Google Analytics, Facebook/Instagram)
 * for unified dashboard display.
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Multi-platform metric data point
 */
export interface MultiPlatformMetricPoint {
  date: string
  impressions: number
  engagements: number
  users: number
  sessions: number
  pageViews: number
  followers: number
  reach: number
}

/**
 * Platform-specific metrics
 */
export interface PlatformMetrics {
  platform: string
  metrics: MultiPlatformMetricPoint[]
}

/**
 * Aggregated totals across all platforms
 */
export interface AggregatedTotals {
  totalImpressions: number
  totalEngagements: number
  totalUsers: number
  totalSessions: number
  totalPageViews: number
  totalFollowers: number
  totalReach: number
  platformBreakdown: Array<{
    platform: string
    impressions: number
    percentage: number
  }>
}

/**
 * Get aggregated metrics from all platforms
 *
 * Combines data from Google Analytics, Facebook, and Instagram.
 *
 * @param userId - User ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Time series data aggregated across all platforms
 */
export async function getAggregatedMetrics(
  userId: string,
  startDate: string,
  endDate: string
): Promise<MultiPlatformMetricPoint[]> {
  const supabase = await createClient()

  // Fetch all metrics for user across all platforms
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching aggregated metrics:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return []
  }

  // Group by date and aggregate metrics
  const groupedByDate = data.reduce(
    (acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = {
          date: record.date,
          impressions: 0,
          engagements: 0,
          users: 0,
          sessions: 0,
          pageViews: 0,
          followers: 0,
          reach: 0,
        }
      }

      // Map metric names to aggregated fields
      const metricName = record.metric_name || record.metric_type
      const value = record.metric_value || 0

      switch (metricName) {
        case 'impressions':
        case 'page_impressions':
          acc[record.date].impressions += value
          break
        case 'engagements':
        case 'page_post_engagements':
        case 'engaged_users':
          acc[record.date].engagements += value
          break
        case 'users':
          acc[record.date].users += value
          break
        case 'sessions':
          acc[record.date].sessions += value
          break
        case 'page_views':
          acc[record.date].pageViews += value
          break
        case 'followers':
        case 'page_fans':
          acc[record.date].followers += value
          break
        case 'reach':
          acc[record.date].reach += value
          break
      }

      return acc
    },
    {} as Record<string, MultiPlatformMetricPoint>
  )

  // Convert to array and sort by date
  return (Object.values(groupedByDate) as MultiPlatformMetricPoint[]).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get platform-specific metrics
 *
 * Returns metrics for a specific platform.
 *
 * @param userId - User ID
 * @param platform - Platform identifier (google_analytics, facebook_instagram)
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Time series data for the specified platform
 */
export async function getPlatformMetrics(
  userId: string,
  platform: string,
  startDate: string,
  endDate: string
): Promise<MultiPlatformMetricPoint[]> {
  const supabase = await createClient()

  // Fetch metrics for specific platform
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', platform)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching platform metrics:', error)
    throw error
  }

  if (!data || data.length === 0) {
    return []
  }

  // Group by date
  const groupedByDate = data.reduce(
    (acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = {
          date: record.date,
          impressions: 0,
          engagements: 0,
          users: 0,
          sessions: 0,
          pageViews: 0,
          followers: 0,
          reach: 0,
        }
      }

      const metricName = record.metric_name || record.metric_type
      const value = record.metric_value || 0

      switch (metricName) {
        case 'impressions':
        case 'page_impressions':
          acc[record.date].impressions += value
          break
        case 'engagements':
        case 'page_post_engagements':
        case 'engaged_users':
          acc[record.date].engagements += value
          break
        case 'users':
          acc[record.date].users += value
          break
        case 'sessions':
          acc[record.date].sessions += value
          break
        case 'page_views':
          acc[record.date].pageViews += value
          break
        case 'followers':
        case 'page_fans':
          acc[record.date].followers += value
          break
        case 'reach':
          acc[record.date].reach += value
          break
      }

      return acc
    },
    {} as Record<string, MultiPlatformMetricPoint>
  )

  return (Object.values(groupedByDate) as MultiPlatformMetricPoint[]).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get aggregated totals across all platforms
 *
 * @param userId - User ID
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Aggregated totals and platform breakdown
 */
export async function getAggregatedTotals(
  userId: string,
  startDate: string,
  endDate: string
): Promise<AggregatedTotals> {
  const metrics = await getAggregatedMetrics(userId, startDate, endDate)

  if (metrics.length === 0) {
    return {
      totalImpressions: 0,
      totalEngagements: 0,
      totalUsers: 0,
      totalSessions: 0,
      totalPageViews: 0,
      totalFollowers: 0,
      totalReach: 0,
      platformBreakdown: [],
    }
  }

  // Calculate totals
  const totals = metrics.reduce(
    (acc, m) => ({
      totalImpressions: acc.totalImpressions + m.impressions,
      totalEngagements: acc.totalEngagements + m.engagements,
      totalUsers: acc.totalUsers + m.users,
      totalSessions: acc.totalSessions + m.sessions,
      totalPageViews: acc.totalPageViews + m.pageViews,
      totalFollowers: acc.totalFollowers + m.followers,
      totalReach: acc.totalReach + m.reach,
    }),
    {
      totalImpressions: 0,
      totalEngagements: 0,
      totalUsers: 0,
      totalSessions: 0,
      totalPageViews: 0,
      totalFollowers: 0,
      totalReach: 0,
    }
  )

  // Get platform breakdown
  const supabase = await createClient()
  const { data: platformData } = await supabase
    .from('metrics')
    .select('platform, metric_name, metric_value')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .in('metric_name', ['impressions', 'page_impressions'])

  const platformBreakdown: Record<string, number> = {}

  if (platformData) {
    for (const record of platformData) {
      if (!platformBreakdown[record.platform]) {
        platformBreakdown[record.platform] = 0
      }
      platformBreakdown[record.platform] += record.metric_value || 0
    }
  }

  const breakdownArray = Object.entries(platformBreakdown).map(([platform, impressions]) => ({
    platform,
    impressions,
    percentage: totals.totalImpressions > 0 ? (impressions / totals.totalImpressions) * 100 : 0,
  }))

  return {
    ...totals,
    platformBreakdown: breakdownArray,
  }
}

/**
 * Get all connected platforms for user
 *
 * @param userId - User ID
 * @returns Array of connected platform identifiers
 */
export async function getConnectedPlatforms(userId: string): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('data_sources')
    .select('platform')
    .eq('user_id', userId)
    .eq('connection_status', 'connected')

  if (error || !data) {
    return []
  }

  return data.map((d) => d.platform)
}
