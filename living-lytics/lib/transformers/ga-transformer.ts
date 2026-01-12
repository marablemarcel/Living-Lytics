/**
 * Google Analytics Data Transformer
 * 
 * Transforms GA API responses to database schema format with:
 * - Date normalization (YYYY-MM-DD)
 * - Derived metrics calculation
 * - Null/undefined handling
 * - Batch transformation support
 */

import { GAMetrics } from '@/lib/api/google-analytics'

/**
 * Database metric record format
 */
export interface MetricRecord {
  user_id: string
  source_id: string
  metric_type: string
  metric_value: number
  date: string
}

/**
 * Extended metrics with derived calculations
 */
export interface TransformedMetrics extends GAMetrics {
  pagesPerSession: number
  engagementRate: number
}

/**
 * Transform a single GA metrics object to include derived metrics
 */
export function transformGAMetrics(metrics: GAMetrics): TransformedMetrics {
  // Calculate pages per session (avoid division by zero)
  const pagesPerSession = metrics.sessions > 0 
    ? metrics.pageViews / metrics.sessions 
    : 0

  // Calculate engagement rate (inverse of bounce rate as percentage)
  const engagementRate = (1 - (metrics.bounceRate / 100)) * 100

  return {
    ...metrics,
    date: normalizeDateFormat(metrics.date),
    pagesPerSession: Number(pagesPerSession.toFixed(2)),
    engagementRate: Number(engagementRate.toFixed(2)),
  }
}

/**
 * Transform GA metrics array to database metric records
 */
export function transformToMetricRecords(
  userId: string,
  sourceId: string,
  gaMetrics: GAMetrics[]
): MetricRecord[] {
  const records: MetricRecord[] = []

  for (const metrics of gaMetrics) {
    const transformed = transformGAMetrics(metrics)
    const normalizedDate = normalizeDateFormat(metrics.date)

    // Core metrics
    records.push(
      {
        user_id: userId,
        source_id: sourceId,
        metric_type: 'page_views',
        metric_value: transformed.pageViews,
        date: normalizedDate,
      },
      {
        user_id: userId,
        source_id: sourceId,
        metric_type: 'sessions',
        metric_value: transformed.sessions,
        date: normalizedDate,
      },
      {
        user_id: userId,
        source_id: sourceId,
        metric_type: 'users',
        metric_value: transformed.users,
        date: normalizedDate,
      },
      {
        user_id: userId,
        source_id: sourceId,
        metric_type: 'bounce_rate',
        metric_value: transformed.bounceRate,
        date: normalizedDate,
      },
      {
        user_id: userId,
        source_id: sourceId,
        metric_type: 'avg_session_duration',
        metric_value: transformed.avgSessionDuration,
        date: normalizedDate,
      }
    )

    // Derived metrics
    records.push(
      {
        user_id: userId,
        source_id: sourceId,
        metric_type: 'pages_per_session',
        metric_value: transformed.pagesPerSession,
        date: normalizedDate,
      },
      {
        user_id: userId,
        source_id: sourceId,
        metric_type: 'engagement_rate',
        metric_value: transformed.engagementRate,
        date: normalizedDate,
      }
    )
  }

  return records
}

/**
 * Normalize date to YYYY-MM-DD format
 * Handles various input formats from GA API
 */
export function normalizeDateFormat(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0]
  }

  // If already in YYYY-MM-DD format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }

  // Handle YYYYMMDD format (GA4 default)
  if (/^\d{8}$/.test(date)) {
    const year = date.substring(0, 4)
    const month = date.substring(4, 6)
    const day = date.substring(6, 8)
    return `${year}-${month}-${day}`
  }

  // Try to parse as Date and convert
  try {
    const parsed = new Date(date)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
  } catch (error) {
    console.error('Failed to parse date:', date, error)
  }

  // Fallback: return current date
  console.warn(`Invalid date format: ${date}, using current date`)
  return new Date().toISOString().split('T')[0]
}

/**
 * Batch transform metrics for performance
 * Processes in chunks to avoid memory issues
 */
export function batchTransformMetrics(
  userId: string,
  sourceId: string,
  gaMetrics: GAMetrics[],
  batchSize: number = 100
): MetricRecord[][] {
  const batches: MetricRecord[][] = []

  for (let i = 0; i < gaMetrics.length; i += batchSize) {
    const chunk = gaMetrics.slice(i, i + batchSize)
    const records = transformToMetricRecords(userId, sourceId, chunk)
    batches.push(records)
  }

  return batches
}

/**
 * Handle null/undefined values with safe defaults
 */
export function sanitizeMetrics(metrics: Partial<GAMetrics>): GAMetrics {
  return {
    date: metrics.date || new Date().toISOString().split('T')[0],
    pageViews: metrics.pageViews ?? 0,
    sessions: metrics.sessions ?? 0,
    users: metrics.users ?? 0,
    bounceRate: metrics.bounceRate ?? 0,
    avgSessionDuration: metrics.avgSessionDuration ?? 0,
  }
}

/**
 * Calculate aggregate metrics from a collection
 */
export function calculateAggregates(metrics: GAMetrics[]) {
  if (metrics.length === 0) {
    return {
      totalPageViews: 0,
      totalSessions: 0,
      totalUsers: 0,
      avgBounceRate: 0,
      avgSessionDuration: 0,
      avgPagesPerSession: 0,
      avgEngagementRate: 0,
    }
  }

  const totalPageViews = metrics.reduce((sum, m) => sum + m.pageViews, 0)
  const totalSessions = metrics.reduce((sum, m) => sum + m.sessions, 0)
  const totalUsers = metrics.reduce((sum, m) => sum + m.users, 0)
  const avgBounceRate = metrics.reduce((sum, m) => sum + m.bounceRate, 0) / metrics.length
  const avgSessionDuration = metrics.reduce((sum, m) => sum + m.avgSessionDuration, 0) / metrics.length
  const avgPagesPerSession = totalSessions > 0 ? totalPageViews / totalSessions : 0
  const avgEngagementRate = (1 - avgBounceRate / 100) * 100

  return {
    totalPageViews,
    totalSessions,
    totalUsers,
    avgBounceRate: Number(avgBounceRate.toFixed(2)),
    avgSessionDuration: Number(avgSessionDuration.toFixed(2)),
    avgPagesPerSession: Number(avgPagesPerSession.toFixed(2)),
    avgEngagementRate: Number(avgEngagementRate.toFixed(2)),
  }
}
