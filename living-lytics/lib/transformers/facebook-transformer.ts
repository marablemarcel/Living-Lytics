/**
 * Facebook/Instagram Data Transformer
 *
 * Transforms Facebook Page and Instagram insights from the Graph API
 * into the unified metrics schema used in the database.
 */

import type {
  FacebookPageInsight,
  InstagramInsight,
} from '@/lib/api/facebook-client'

/**
 * Metric record for database insertion
 */
export interface MetricRecord {
  user_id: string
  source_id: string
  platform: string
  metric_name: string
  metric_value: number
  date: string
  metadata?: Record<string, unknown>
}

/**
 * Transform Facebook Page Insights to metric records
 *
 * Converts Facebook API response format to our database schema.
 *
 * @param insights - Raw Facebook Page insights from API
 * @param userId - User ID for the metrics
 * @param sourceId - Data source ID
 * @returns Array of metric records ready for database insertion
 */
export function transformFacebookInsights(
  insights: FacebookPageInsight[],
  userId: string,
  sourceId: string
): MetricRecord[] {
  const records: MetricRecord[] = []

  for (const insight of insights) {
    const metricName = mapFacebookMetricName(insight.name)

    // Each insight has multiple daily values
    for (const value of insight.values) {
      if (value.value !== undefined && value.end_time) {
        // Convert end_time to date (YYYY-MM-DD)
        const date = value.end_time.split('T')[0]

        records.push({
          user_id: userId,
          source_id: sourceId,
          platform: 'facebook_instagram',
          metric_name: metricName,
          metric_value: value.value,
          date,
          metadata: {
            original_metric: insight.name,
            period: insight.period,
            source: 'facebook_page',
          },
        })
      }
    }
  }

  return records
}

/**
 * Transform Instagram Insights to metric records
 *
 * Converts Instagram API response format to our database schema.
 *
 * @param insights - Raw Instagram insights from API
 * @param userId - User ID for the metrics
 * @param sourceId - Data source ID
 * @param followerCount - Current follower count (separate API call)
 * @returns Array of metric records ready for database insertion
 */
export function transformInstagramInsights(
  insights: InstagramInsight[],
  userId: string,
  sourceId: string,
  followerCount?: number
): MetricRecord[] {
  const records: MetricRecord[] = []

  for (const insight of insights) {
    const metricName = mapInstagramMetricName(insight.name)

    // Each insight has multiple daily values
    for (const value of insight.values) {
      if (value.value !== undefined && value.end_time) {
        // Convert end_time to date (YYYY-MM-DD)
        const date = value.end_time.split('T')[0]

        records.push({
          user_id: userId,
          source_id: sourceId,
          platform: 'facebook_instagram',
          metric_name: metricName,
          metric_value: value.value,
          date,
          metadata: {
            original_metric: insight.name,
            period: insight.period,
            source: 'instagram',
          },
        })
      }
    }
  }

  // Add follower count as a separate metric if provided
  if (followerCount !== undefined) {
    const today = new Date().toISOString().split('T')[0]
    records.push({
      user_id: userId,
      source_id: sourceId,
      platform: 'facebook_instagram',
      metric_name: 'followers',
      metric_value: followerCount,
      date: today,
      metadata: {
        original_metric: 'follower_count',
        period: 'lifetime',
        source: 'instagram',
      },
    })
  }

  return records
}

/**
 * Map Facebook metric names to unified schema
 *
 * @param facebookMetric - Facebook metric name
 * @returns Unified metric name
 */
function mapFacebookMetricName(facebookMetric: string): string {
  const mapping: Record<string, string> = {
    page_impressions: 'impressions',
    page_impressions_unique: 'unique_impressions',
    page_engaged_users: 'engaged_users',
    page_post_engagements: 'engagements',
    page_fans: 'followers',
    page_views_total: 'page_views',
  }

  return mapping[facebookMetric] || facebookMetric
}

/**
 * Map Instagram metric names to unified schema
 *
 * @param instagramMetric - Instagram metric name
 * @returns Unified metric name
 */
function mapInstagramMetricName(instagramMetric: string): string {
  const mapping: Record<string, string> = {
    impressions: 'impressions',
    reach: 'reach',
    profile_views: 'profile_views',
    follower_count: 'followers',
  }

  return mapping[instagramMetric] || instagramMetric
}

/**
 * Combine Facebook and Instagram metrics
 *
 * Merges metrics from both sources, aggregating where appropriate.
 *
 * @param facebookRecords - Facebook metric records
 * @param instagramRecords - Instagram metric records
 * @returns Combined metric records
 */
export function combineFacebookInstagramMetrics(
  facebookRecords: MetricRecord[],
  instagramRecords: MetricRecord[]
): MetricRecord[] {
  // Simply concatenate - database will handle aggregation if needed
  return [...facebookRecords, ...instagramRecords]
}
