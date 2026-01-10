/**
 * Google OAuth 2.0 Configuration
 *
 * Configuration and utilities specific to Google Analytics OAuth integration.
 * Handles authorization URL building and token management for Google APIs.
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create a new project or select existing one
 * 3. Enable the Google Analytics API
 * 4. Go to APIs & Services > Credentials
 * 5. Create OAuth 2.0 Client ID (Web application type)
 * 6. Add authorized redirect URIs:
 *    - http://localhost:3000/api/oauth/google (development)
 *    - https://yourdomain.com/api/oauth/google (production)
 * 7. Copy Client ID and Client Secret to .env.local
 */

import { OAuthProviderConfig } from './types'
import { buildAuthUrl } from './utils'

/**
 * Google OAuth Configuration
 *
 * Scopes requested:
 * - analytics.readonly: Read Google Analytics data
 * - userinfo.email: Get user's email address
 * - userinfo.profile: Get user's basic profile info
 */
export const GOOGLE_OAUTH_CONFIG: OAuthProviderConfig = {
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  scopes: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
}

/**
 * Build Google Analytics OAuth Authorization URL
 *
 * Creates the complete URL to redirect users to Google's consent screen.
 * Includes offline access for refresh tokens and forces consent to ensure
 * we always get a refresh token.
 *
 * @param redirectUri - Callback URL after authorization
 * @param state - CSRF protection state parameter
 * @returns Complete Google authorization URL
 */
export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  return buildAuthUrl(
    'google',
    GOOGLE_OAUTH_CONFIG.clientId,
    redirectUri,
    state,
    GOOGLE_OAUTH_CONFIG.scopes
  )
}

/**
 * Validate Google OAuth configuration
 *
 * Checks if required environment variables are set.
 * Should be called before initiating OAuth flow.
 *
 * @returns Object with isValid flag and any missing fields
 */
export function validateGoogleConfig(): { isValid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!GOOGLE_OAUTH_CONFIG.clientId) {
    missing.push('GOOGLE_CLIENT_ID')
  }

  if (!GOOGLE_OAUTH_CONFIG.clientSecret) {
    missing.push('GOOGLE_CLIENT_SECRET')
  }

  return {
    isValid: missing.length === 0,
    missing,
  }
}

/**
 * Get Google user info from access token
 *
 * Fetches the user's Google profile information using the access token.
 * Useful for displaying which Google account is connected.
 *
 * @param accessToken - Valid Google access token
 * @returns User profile information
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string
  email: string
  name: string
  picture?: string
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Google user info')
  }

  return response.json()
}

/**
 * Revoke Google OAuth token
 *
 * Revokes the access token, effectively disconnecting the integration.
 * Should be called when user disconnects their Google account.
 *
 * @param token - Access token or refresh token to revoke
 */
export async function revokeGoogleToken(token: string): Promise<void> {
  const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to revoke token: ${error}`)
  }
}
