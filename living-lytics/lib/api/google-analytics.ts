import { BetaAnalyticsDataClient, protos } from '@google-analytics/data'
import { OAuth2Client } from 'google-auth-library'

import { decrypt } from '@/lib/oauth/encryption'
import { createClient } from '@/lib/supabase/server'

type IRunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse
type IRow = protos.google.analytics.data.v1beta.IRow

// ============================================================================
// Types
// ============================================================================

export interface GACredentials {
  access_token: string
  refresh_token?: string | null
  expires_at: string
  property_id?: string
}

export interface GAMetrics {
  date: string
  pageViews: number
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
}

export interface GAReportRequest {
  propertyId: string
  startDate: string
  endDate: string
  dimensions?: string[]
  metrics?: string[]
}

export interface GAProperty {
  id: string
  name: string
}

// ============================================================================
// Google Analytics Client
// ============================================================================

export class GoogleAnalyticsClient {
  private credentials: GACredentials

  constructor(credentials: GACredentials) {
    this.credentials = credentials
  }

  /**
   * Create a GA Data client authorized with the decrypted access token.
   */
  private createAnalyticsClient(): BetaAnalyticsDataClient {
    const accessToken = decrypt(this.credentials.access_token)
    const oauthClient = new OAuth2Client()
    oauthClient.setCredentials({ access_token: accessToken })

    return new BetaAnalyticsDataClient({
      authClient: oauthClient,
    })
  }

  /**
   * Get analytics data for a date range
   */
  async getMetrics(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<GAMetrics[]> {
    const analyticsDataClient = this.createAnalyticsClient()

    try {
      // Run report
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
        orderBys: [
          {
            dimension: { dimensionName: 'date' },
            desc: false,
          },
        ],
      })

      // Transform response to our format
      return this.transformResponse(response)
    } catch (error) {
      console.error('GA API Error:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new Error(`Failed to fetch GA data: ${message}`)
    }
  }

  /**
   * Get real-time active users
   */
  async getRealtimeUsers(propertyId: string): Promise<number> {
    const analyticsDataClient = this.createAnalyticsClient()

    try {
      const [response] = await analyticsDataClient.runRealtimeReport({
        property: `properties/${propertyId}`,
        metrics: [{ name: 'activeUsers' }],
      })

      if (response.rows && response.rows.length > 0) {
        return parseInt(response.rows[0].metricValues?.[0]?.value || '0', 10)
      }

      return 0
    } catch (error) {
      console.error('GA Realtime API Error:', error)
      return 0
    }
  }

  /**
   * Get top pages for a date range
   */
  async getTopPages(
    propertyId: string,
    startDate: string,
    endDate: string,
    limit: number = 10
  ): Promise<Array<{ page: string; views: number; avgDuration: number }>> {
    const analyticsDataClient = this.createAnalyticsClient()

    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true,
          },
        ],
        limit,
      })

      if (!response.rows) {
        return []
      }

      return response.rows.map((row) => ({
        page: row.dimensionValues?.[0]?.value || '',
        views: parseInt(row.metricValues?.[0]?.value || '0', 10),
        avgDuration: parseFloat(row.metricValues?.[1]?.value || '0'),
      }))
    } catch (error) {
      console.error('GA Top Pages API Error:', error)
      throw new Error('Failed to fetch top pages')
    }
  }

  /**
   * Get traffic sources for a date range
   */
  async getTrafficSources(
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<Array<{ source: string; medium: string; sessions: number; users: number }>> {
    const analyticsDataClient = this.createAnalyticsClient()

    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [
          { name: 'sessionSource' },
          { name: 'sessionMedium' },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
        ],
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true,
          },
        ],
        limit: 20,
      })

      if (!response.rows) {
        return []
      }

      return response.rows.map((row) => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        medium: row.dimensionValues?.[1]?.value || '(none)',
        sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
        users: parseInt(row.metricValues?.[1]?.value || '0', 10),
      }))
    } catch (error) {
      console.error('GA Traffic Sources API Error:', error)
      throw new Error('Failed to fetch traffic sources')
    }
  }

  /**
   * Transform GA API response to our format
   */
  private transformResponse(response: IRunReportResponse): GAMetrics[] {
    if (!response.rows || response.rows.length === 0) {
      return []
    }

    return response.rows.map((row: IRow) => ({
      date: row.dimensionValues?.[0]?.value || '',
      pageViews: parseInt(row.metricValues?.[0]?.value || '0', 10),
      sessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
      users: parseInt(row.metricValues?.[2]?.value || '0', 10),
      bounceRate: parseFloat(row.metricValues?.[3]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0'),
    }))
  }

  /**
   * List available properties for the authenticated user
   * Note: This requires Google Analytics Admin API which needs additional setup
   */
  async listProperties(): Promise<GAProperty[]> {
    // The GA Data API doesn't include property listing
    // This would require the Google Analytics Admin API
    // For MVP, users will provide their property ID manually
    throw new Error(
      'Property listing not yet implemented. Please provide your GA4 property ID manually. ' +
      'You can find it in Google Analytics: Admin > Property > Property Details.'
    )
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create GA client for a data source
 */
export async function getGAClientForSource(sourceId: string): Promise<GoogleAnalyticsClient> {
  const supabase = await createClient()

  // Get data source with credentials
  const { data: source, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('id', sourceId)
    .eq('platform', 'google_analytics')
    .single()

  if (error || !source) {
    throw new Error('Data source not found')
  }

  if (source.connection_status !== 'connected') {
    throw new Error('Data source not connected')
  }

  if (!source.credentials) {
    throw new Error('No credentials found for data source')
  }

  // Create and return GA client
  return new GoogleAnalyticsClient(source.credentials as GACredentials)
}

/**
 * Get GA client by platform (convenience function)
 */
export async function getGAClientForUser(): Promise<{
  client: GoogleAnalyticsClient
  sourceId: string
  propertyId: string | null
} | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: source, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('user_id', user.id)
    .eq('platform', 'google_analytics')
    .eq('connection_status', 'connected')
    .single()

  if (error || !source || !source.credentials) {
    return null
  }

  const credentials = source.credentials as GACredentials

  return {
    client: new GoogleAnalyticsClient(credentials),
    sourceId: source.id,
    propertyId: credentials.property_id || null,
  }
}

/**
 * Format date for GA API (YYYY-MM-DD)
 */
export function formatDateForGA(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get date range presets
 */
export function getDateRange(preset: 'today' | 'yesterday' | '7days' | '30days' | '90days'): {
  startDate: string
  endDate: string
} {
  const now = new Date()
  const today = formatDateForGA(now)

  switch (preset) {
    case 'today':
      return { startDate: today, endDate: today }

    case 'yesterday': {
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = formatDateForGA(yesterday)
      return { startDate: yesterdayStr, endDate: yesterdayStr }
    }

    case '7days': {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return { startDate: formatDateForGA(weekAgo), endDate: today }
    }

    case '30days': {
      const monthAgo = new Date(now)
      monthAgo.setDate(monthAgo.getDate() - 30)
      return { startDate: formatDateForGA(monthAgo), endDate: today }
    }

    case '90days': {
      const quarterAgo = new Date(now)
      quarterAgo.setDate(quarterAgo.getDate() - 90)
      return { startDate: formatDateForGA(quarterAgo), endDate: today }
    }
  }
}
