/**
 * Cross-Platform Analytics Service
 * 
 * Aggregates and correlates data across Google Analytics and Facebook/Instagram platforms
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Cross-platform metrics combining web and social data
 */
export interface CrossPlatformMetrics {
  totalReach: number // Web users + social followers
  totalEngagement: number // Web sessions + social interactions
  totalPageViews: number
  totalSessions: number
  totalUsers: number
  socialFollowers: number
  socialEngagement: number
  socialToWebRatio: number // Social engagement / web sessions
  conversionRate: number // (Sessions / Total reach) * 100
  avgEngagementRate: number
  dateRange: {
    start: string
    end: string
  }
}

/**
 * Channel attribution data
 */
export interface ChannelAttribution {
  channel: string
  platform: 'google_analytics' | 'facebook_instagram'
  value: number
  percentage: number
  color: string
}

/**
 * Top content across platforms
 */
export interface TopContent {
  title: string
  type: 'page' | 'facebook_post' | 'instagram_post'
  platform: string
  engagement: number
  views: number
  date: string
}

/**
 * Correlation data point
 */
export interface CorrelationDataPoint {
  date: string
  webMetric: number
  socialMetric: number
}

/**
 * Get cross-platform metrics aggregating data from all sources
 */
export async function getCrossPlatformMetrics(
  startDate: string,
  endDate: string
): Promise<CrossPlatformMetrics> {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch all metrics for the date range
  const { data: metrics, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) {
    console.error('Error fetching cross-platform metrics:', error)
    throw error
  }

  if (!metrics || metrics.length === 0) {
    return {
      totalReach: 0,
      totalEngagement: 0,
      totalPageViews: 0,
      totalSessions: 0,
      totalUsers: 0,
      socialFollowers: 0,
      socialEngagement: 0,
      socialToWebRatio: 0,
      conversionRate: 0,
      avgEngagementRate: 0,
      dateRange: { start: startDate, end: endDate },
    }
  }

  // Aggregate metrics by type
  let totalPageViews = 0
  let totalSessions = 0
  let totalUsers = 0
  let socialFollowers = 0
  let facebookEngagement = 0
  let instagramEngagement = 0

  metrics.forEach((record) => {
    const value = record.metric_value || 0

    switch (record.metric_type) {
      // Google Analytics metrics
      case 'page_views':
        totalPageViews += value
        break
      case 'sessions':
        totalSessions += value
        break
      case 'users':
        totalUsers += value
        break

      // Facebook metrics
      case 'facebook_page_impressions':
      case 'facebook_page_engaged_users':
        facebookEngagement += value
        break
      case 'facebook_page_fans':
        socialFollowers = Math.max(socialFollowers, value) // Use latest value
        break

      // Instagram metrics
      case 'instagram_impressions':
      case 'instagram_reach':
      case 'instagram_profile_views':
        instagramEngagement += value
        break
      case 'instagram_follower_count':
        socialFollowers += value // Add Instagram followers
        break
    }
  })

  const totalSocialEngagement = facebookEngagement + instagramEngagement
  const totalReach = totalUsers + socialFollowers
  const totalEngagement = totalSessions + totalSocialEngagement

  // Calculate ratios
  const socialToWebRatio = totalSessions > 0 ? totalSocialEngagement / totalSessions : 0
  const conversionRate = totalReach > 0 ? (totalSessions / totalReach) * 100 : 0
  const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0

  return {
    totalReach,
    totalEngagement,
    totalPageViews,
    totalSessions,
    totalUsers,
    socialFollowers,
    socialEngagement: totalSocialEngagement,
    socialToWebRatio: Number(socialToWebRatio.toFixed(2)),
    conversionRate: Number(conversionRate.toFixed(2)),
    avgEngagementRate: Number(avgEngagementRate.toFixed(2)),
    dateRange: { start: startDate, end: endDate },
  }
}

/**
 * Get channel attribution showing contribution from each platform
 */
export async function getChannelAttribution(
  startDate: string,
  endDate: string
): Promise<ChannelAttribution[]> {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch metrics grouped by source
  const { data: metrics, error } = await supabase
    .from('metrics')
    .select('source_id, metric_type, metric_value')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) {
    console.error('Error fetching channel attribution:', error)
    throw error
  }

  if (!metrics || metrics.length === 0) {
    return []
  }

  // Get source details
  const sourceIds = [...new Set(metrics.map((m) => m.source_id))]
  const { data: sources } = await supabase
    .from('data_sources')
    .select('id, platform, name')
    .in('id', sourceIds)

  const sourceMap = new Map(sources?.map((s) => [s.id, s]) || [])

  // Aggregate by platform
  const platformMetrics = new Map<string, { platform: string; value: number; name: string }>()

  metrics.forEach((record) => {
    const source = sourceMap.get(record.source_id)
    if (!source) return

    const platform = source.platform
    const value = record.metric_value || 0

    // Count engagement metrics
    const isEngagementMetric =
      record.metric_type === 'sessions' ||
      record.metric_type === 'facebook_page_engaged_users' ||
      record.metric_type === 'instagram_reach'

    if (isEngagementMetric) {
      const existing = platformMetrics.get(platform) || {
        platform,
        value: 0,
        name: source.name,
      }
      existing.value += value
      platformMetrics.set(platform, existing)
    }
  })

  // Calculate total for percentages
  const total = Array.from(platformMetrics.values()).reduce((sum, p) => sum + p.value, 0)

  // Convert to attribution array
  const attribution: ChannelAttribution[] = Array.from(platformMetrics.entries()).map(
    ([platform, data], index) => ({
      channel: data.name,
      platform: platform as 'google_analytics' | 'facebook_instagram',
      value: data.value,
      percentage: total > 0 ? Number(((data.value / total) * 100).toFixed(2)) : 0,
      color: getChannelColor(platform, index),
    })
  )

  // Normalize percentages to ensure they sum to 100%
  const percentageSum = attribution.reduce((sum, a) => sum + a.percentage, 0)
  if (percentageSum > 0 && percentageSum !== 100) {
    const adjustment = 100 - percentageSum
    attribution[0].percentage = Number((attribution[0].percentage + adjustment).toFixed(2))
  }

  return attribution
}

/**
 * Get top content across all platforms
 */
export async function getTopContent(
  startDate: string,
  endDate: string,
  limit: number = 10
): Promise<TopContent[]> {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch page view metrics (top pages)
  const { data: pageMetrics } = await supabase
    .from('metrics')
    .select('date, metric_value, dimension_value')
    .eq('user_id', user.id)
    .eq('metric_type', 'page_views')
    .gte('date', startDate)
    .lte('date', endDate)
    .not('dimension_value', 'is', null)

  // Aggregate page views by page
  const pageMap = new Map<string, { views: number; date: string }>()

  pageMetrics?.forEach((record) => {
    const page = record.dimension_value || 'Unknown'
    const existing = pageMap.get(page) || { views: 0, date: record.date }
    existing.views += record.metric_value || 0
    pageMap.set(page, existing)
  })

  // Convert to TopContent array
  const topContent: TopContent[] = Array.from(pageMap.entries())
    .map(([title, data]) => ({
      title,
      type: 'page' as const,
      platform: 'Google Analytics',
      engagement: data.views,
      views: data.views,
      date: data.date,
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit)

  return topContent
}

/**
 * Get correlation data between web and social metrics
 */
export async function getCorrelationData(
  startDate: string,
  endDate: string
): Promise<CorrelationDataPoint[]> {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  // Fetch metrics
  const { data: metrics, error } = await supabase
    .from('metrics')
    .select('date, metric_type, metric_value')
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .in('metric_type', [
      'sessions',
      'facebook_page_engaged_users',
      'instagram_reach',
    ])

  if (error || !metrics) {
    return []
  }

  // Group by date
  const dateMap = new Map<string, { webMetric: number; socialMetric: number }>()

  metrics.forEach((record) => {
    const date = record.date
    const value = record.metric_value || 0
    const existing = dateMap.get(date) || { webMetric: 0, socialMetric: 0 }

    if (record.metric_type === 'sessions') {
      existing.webMetric += value
    } else {
      existing.socialMetric += value
    }

    dateMap.set(date, existing)
  })

  // Convert to array
  return Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      webMetric: data.webMetric,
      socialMetric: data.socialMetric,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate Pearson correlation coefficient
 */
export function calculateCorrelation(data: CorrelationDataPoint[]): number {
  if (data.length < 2) return 0

  const n = data.length
  const xValues = data.map((d) => d.webMetric)
  const yValues = data.map((d) => d.socialMetric)

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)
  const sumY2 = yValues.reduce((sum, y) => sum + y * y, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0

  return Number((numerator / denominator).toFixed(3))
}

/**
 * Get color for channel based on platform
 */
function getChannelColor(platform: string, index: number): string {
  const colors = {
    google_analytics: '#0ea5e9', // Sky blue
    facebook_instagram: '#8b5cf6', // Purple
  }

  return colors[platform as keyof typeof colors] || `hsl(${index * 60}, 70%, 50%)`
}
