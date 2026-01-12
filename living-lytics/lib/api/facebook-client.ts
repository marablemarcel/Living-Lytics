/**
 * Facebook Graph API Client
 *
 * Client for fetching insights from Facebook Pages and Instagram Business accounts.
 * Handles API requests, error handling, and rate limiting.
 *
 * API Documentation:
 * - Facebook Page Insights: https://developers.facebook.com/docs/graph-api/reference/insights
 * - Instagram Insights: https://developers.facebook.com/docs/instagram-api/reference/ig-user/insights
 */

/**
 * Facebook API Client
 *
 * Provides methods to fetch insights from Facebook Pages and Instagram accounts.
 */
export class FacebookClient {
  private baseUrl = 'https://graph.facebook.com/v18.0'
  private accessToken: string

  /**
   * Initialize Facebook API client
   *
   * @param accessToken - Valid Facebook access token (page token for Page insights)
   */
  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * Get Facebook Page Insights
   *
   * Fetches daily insights for a Facebook Page.
   *
   * @param pageId - Facebook Page ID
   * @param metrics - Array of metric names to fetch
   * @param since - Start date (YYYY-MM-DD)
   * @param until - End date (YYYY-MM-DD)
   * @returns Page insights data
   */
  async getPageInsights(
    pageId: string,
    metrics: string[],
    since: string,
    until: string
  ): Promise<FacebookPageInsight[]> {
    const url = new URL(`${this.baseUrl}/${pageId}/insights`)
    url.searchParams.set('metric', metrics.join(','))
    url.searchParams.set('period', 'day')
    url.searchParams.set('since', since)
    url.searchParams.set('until', until)
    url.searchParams.set('access_token', this.accessToken)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          `Facebook API error: ${error.error?.message || response.statusText}`
        )
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching Facebook Page insights:', error)
      throw error
    }
  }

  /**
   * Get Instagram Business Account ID
   *
   * Retrieves the Instagram Business account linked to a Facebook Page.
   *
   * @param pageId - Facebook Page ID
   * @returns Instagram Business account ID or null if not linked
   */
  async getInstagramBusinessAccountId(pageId: string): Promise<string | null> {
    const url = new URL(`${this.baseUrl}/${pageId}`)
    url.searchParams.set('fields', 'instagram_business_account')
    url.searchParams.set('access_token', this.accessToken)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          `Facebook API error: ${error.error?.message || response.statusText}`
        )
      }

      const data = await response.json()
      return data.instagram_business_account?.id || null
    } catch (error) {
      console.error('Error fetching Instagram Business account:', error)
      return null
    }
  }

  /**
   * Get Instagram Insights
   *
   * Fetches daily insights for an Instagram Business account.
   *
   * @param igAccountId - Instagram Business account ID
   * @param metrics - Array of metric names to fetch
   * @param since - Start date (YYYY-MM-DD)
   * @param until - End date (YYYY-MM-DD)
   * @returns Instagram insights data
   */
  async getInstagramInsights(
    igAccountId: string,
    metrics: string[],
    since: string,
    until: string
  ): Promise<InstagramInsight[]> {
    const url = new URL(`${this.baseUrl}/${igAccountId}/insights`)
    url.searchParams.set('metric', metrics.join(','))
    url.searchParams.set('period', 'day')
    url.searchParams.set('since', since)
    url.searchParams.set('until', until)
    url.searchParams.set('access_token', this.accessToken)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        const error = await response.json()
        
        // Instagram insights may not be available for all accounts
        if (error.error?.code === 10 || error.error?.code === 100) {
          console.warn('Instagram insights not available:', error.error?.message)
          return []
        }

        throw new Error(
          `Instagram API error: ${error.error?.message || response.statusText}`
        )
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error('Error fetching Instagram insights:', error)
      throw error
    }
  }

  /**
   * Get Instagram follower count
   *
   * Fetches the current follower count for an Instagram Business account.
   *
   * @param igAccountId - Instagram Business account ID
   * @returns Follower count
   */
  async getInstagramFollowerCount(igAccountId: string): Promise<number> {
    const url = new URL(`${this.baseUrl}/${igAccountId}`)
    url.searchParams.set('fields', 'followers_count')
    url.searchParams.set('access_token', this.accessToken)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          `Instagram API error: ${error.error?.message || response.statusText}`
        )
      }

      const data = await response.json()
      return data.followers_count || 0
    } catch (error) {
      console.error('Error fetching Instagram follower count:', error)
      return 0
    }
  }
}

/**
 * Facebook Page Insight data structure
 */
export interface FacebookPageInsight {
  name: string
  period: string
  values: Array<{
    value: number
    end_time: string
  }>
  title: string
  description: string
  id: string
}

/**
 * Instagram Insight data structure
 */
export interface InstagramInsight {
  name: string
  period: string
  values: Array<{
    value: number
    end_time: string
  }>
  title: string
  description: string
  id: string
}

/**
 * Facebook Page Metrics
 *
 * Available metrics for Facebook Pages (day period):
 * - page_impressions: Total impressions
 * - page_impressions_unique: Unique impressions
 * - page_engaged_users: People who engaged with the page
 * - page_post_engagements: Total post engagements
 * - page_fans: Total page likes
 * - page_views_total: Total page views
 */
export const FACEBOOK_PAGE_METRICS = [
  'page_impressions',
  'page_engaged_users',
  'page_post_engagements',
  'page_fans',
]

/**
 * Instagram Metrics
 *
 * Available metrics for Instagram Business accounts (day period):
 * - impressions: Total impressions
 * - reach: Unique accounts reached
 * - profile_views: Profile views
 * - follower_count: Total followers (lifetime metric)
 */
export const INSTAGRAM_METRICS = ['impressions', 'reach', 'profile_views']
