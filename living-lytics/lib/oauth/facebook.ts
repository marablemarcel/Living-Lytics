/**
 * Facebook OAuth 2.0 Configuration
 *
 * Configuration and utilities for Facebook/Instagram OAuth integration.
 * Handles authorization URL building, token management, and long-lived token exchange.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Facebook Developers: https://developers.facebook.com/apps/
 * 2. Create a new app or select existing one
 * 3. Add "Facebook Login" product
 * 4. Go to Settings > Basic to get App ID and App Secret
 * 5. Go to Facebook Login > Settings
 * 6. Add authorized redirect URIs:
 *    - http://localhost:3000/api/oauth/facebook (development)
 *    - https://yourdomain.com/api/oauth/facebook (production)
 * 7. Request permissions in App Review:
 *    - pages_show_list
 *    - pages_read_engagement
 *    - instagram_basic
 *    - instagram_manage_insights
 * 8. Copy App ID and App Secret to .env.local
 */

import { OAuthProviderConfig } from './types'
import { buildAuthUrl } from './utils'

/**
 * Facebook OAuth Configuration
 *
 * Scopes requested:
 * - pages_show_list: Access user's Facebook Pages
 * - pages_read_engagement: Read Page insights and engagement metrics
 * - instagram_basic: Access Instagram account info
 * - instagram_manage_insights: Read Instagram insights
 */
export const FACEBOOK_OAUTH_CONFIG: OAuthProviderConfig = {
  authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
  tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
  scopes: [
    'pages_show_list',
    'pages_read_engagement',
    'instagram_basic',
    'instagram_manage_insights',
  ],
  clientId: process.env.FACEBOOK_APP_ID || '',
  clientSecret: process.env.FACEBOOK_APP_SECRET || '',
}

/**
 * Build Facebook OAuth Authorization URL
 *
 * Creates the complete URL to redirect users to Facebook's consent screen.
 *
 * @param redirectUri - Callback URL after authorization
 * @param state - CSRF protection state parameter
 * @returns Complete Facebook authorization URL
 */
export function buildFacebookAuthUrl(redirectUri: string, state: string): string {
  return buildAuthUrl(
    'facebook',
    FACEBOOK_OAUTH_CONFIG.clientId,
    redirectUri,
    state,
    FACEBOOK_OAUTH_CONFIG.scopes
  )
}

/**
 * Exchange short-lived token for long-lived token
 *
 * Facebook access tokens are short-lived (1 hour) by default.
 * This exchanges them for long-lived tokens (60 days).
 *
 * @param shortLivedToken - Short-lived access token from initial OAuth
 * @returns Long-lived token response with 60-day expiration
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
}> {
  const url = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
  url.searchParams.set('grant_type', 'fb_exchange_token')
  url.searchParams.set('client_id', FACEBOOK_OAUTH_CONFIG.clientId)
  url.searchParams.set('client_secret', FACEBOOK_OAUTH_CONFIG.clientSecret)
  url.searchParams.set('fb_exchange_token', shortLivedToken)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange for long-lived token: ${error}`)
  }

  return response.json()
}

/**
 * Get user's Facebook Pages
 *
 * Fetches the list of Facebook Pages the user manages.
 * Required for accessing Page insights.
 *
 * @param accessToken - Valid Facebook access token
 * @returns Array of pages with id, name, and access_token
 */
export async function getUserPages(accessToken: string): Promise<
  Array<{
    id: string
    name: string
    access_token: string
    instagram_business_account?: {
      id: string
    }
  }>
> {
  const url = new URL('https://graph.facebook.com/v18.0/me/accounts')
  url.searchParams.set('fields', 'id,name,access_token,instagram_business_account')
  url.searchParams.set('access_token', accessToken)

  const response = await fetch(url.toString())

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch user pages: ${error}`)
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Validate Facebook OAuth configuration
 *
 * Checks if required environment variables are set.
 * Should be called before initiating OAuth flow.
 *
 * @returns Object with isValid flag and any missing fields
 */
export function validateFacebookConfig(): { isValid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!FACEBOOK_OAUTH_CONFIG.clientId) {
    missing.push('FACEBOOK_APP_ID')
  }

  if (!FACEBOOK_OAUTH_CONFIG.clientSecret) {
    missing.push('FACEBOOK_APP_SECRET')
  }

  return {
    isValid: missing.length === 0,
    missing,
  }
}

/**
 * Revoke Facebook OAuth token
 *
 * Revokes the access token, effectively disconnecting the integration.
 * Should be called when user disconnects their Facebook account.
 *
 * @param token - Access token to revoke
 */
export async function revokeFacebookToken(token: string): Promise<void> {
  const url = new URL('https://graph.facebook.com/v18.0/me/permissions')
  url.searchParams.set('access_token', token)

  const response = await fetch(url.toString(), {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to revoke token: ${error}`)
  }
}
