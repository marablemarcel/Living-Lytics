/**
 * OAuth 2.0 Utility Functions
 *
 * Core utilities for OAuth authentication flow including:
 * - State generation for CSRF protection
 * - Authorization URL building
 * - Token exchange
 * - Expiration calculation
 */

import { OAuthProvider, OAuthTokenResponse } from './types'

// OAuth provider authorization endpoints
const AUTH_URLS: Record<OAuthProvider, string> = {
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
  facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
  instagram: 'https://api.instagram.com/oauth/authorize',
}

// OAuth provider token endpoints
const TOKEN_URLS: Record<OAuthProvider, string> = {
  google: 'https://oauth2.googleapis.com/token',
  facebook: 'https://graph.facebook.com/v18.0/oauth/access_token',
  instagram: 'https://api.instagram.com/oauth/access_token',
}

/**
 * Generate cryptographically secure random state parameter for CSRF protection
 * Uses Web Crypto API for secure random byte generation
 */
export function generateState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Build OAuth authorization URL with all required parameters
 *
 * @param provider - OAuth provider (google, facebook, instagram)
 * @param clientId - Application client ID from provider
 * @param redirectUri - Callback URL after authorization
 * @param state - CSRF protection state parameter
 * @param scopes - Requested permission scopes
 * @returns Complete authorization URL
 */
export function buildAuthUrl(
  provider: OAuthProvider,
  clientId: string,
  redirectUri: string,
  state: string,
  scopes: string[]
): string {
  const baseUrl = AUTH_URLS[provider]

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state: state,
    scope: scopes.join(' '),
  })

  // Google-specific parameters for refresh token
  if (provider === 'google') {
    params.set('access_type', 'offline')
    params.set('prompt', 'consent')
  }

  return `${baseUrl}?${params.toString()}`
}

/**
 * Exchange authorization code for access tokens
 *
 * Makes POST request to provider's token endpoint to exchange
 * the authorization code received after user consent.
 *
 * @param code - Authorization code from OAuth callback
 * @param provider - OAuth provider
 * @param clientId - Application client ID
 * @param clientSecret - Application client secret
 * @param redirectUri - Must match the original redirect URI
 * @returns Token response with access_token, refresh_token, and expiration
 * @throws Error if token exchange fails
 */
export async function exchangeCodeForTokens(
  code: string,
  provider: OAuthProvider,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<OAuthTokenResponse> {
  const tokenUrl = TOKEN_URLS[provider]

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage: string

    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.error_description || errorJson.error || 'Unknown error'
    } catch {
      errorMessage = errorText || `HTTP ${response.status}`
    }

    throw new Error(`Token exchange failed: ${errorMessage}`)
  }

  return response.json()
}

/**
 * Refresh an expired access token using the refresh token
 *
 * @param refreshToken - Refresh token from initial authorization
 * @param provider - OAuth provider
 * @param clientId - Application client ID
 * @param clientSecret - Application client secret
 * @returns New token response
 * @throws Error if refresh fails
 */
export async function refreshAccessToken(
  refreshToken: string,
  provider: OAuthProvider,
  clientId: string,
  clientSecret: string
): Promise<OAuthTokenResponse> {
  const tokenUrl = TOKEN_URLS[provider]

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Token refresh failed: ${errorText}`)
  }

  return response.json()
}

/**
 * Calculate token expiration timestamp
 *
 * @param expiresIn - Token lifetime in seconds
 * @returns Date when token expires
 */
export function calculateExpiresAt(expiresIn: number): Date {
  return new Date(Date.now() + expiresIn * 1000)
}

/**
 * Check if a token is expired or about to expire
 *
 * @param expiresAt - Token expiration date string
 * @param bufferMinutes - Minutes before expiration to consider expired (default: 5)
 * @returns True if token is expired or will expire within buffer period
 */
export function isTokenExpired(expiresAt: string, bufferMinutes: number = 5): boolean {
  const expirationDate = new Date(expiresAt)
  const bufferMs = bufferMinutes * 60 * 1000
  return Date.now() >= expirationDate.getTime() - bufferMs
}

/**
 * Validate state parameter matches stored value
 *
 * @param returnedState - State received in OAuth callback
 * @param storedState - State stored in session/cookie
 * @returns True if states match
 */
export function validateState(returnedState: string | null, storedState: string | null): boolean {
  if (!returnedState || !storedState) {
    return false
  }
  // Constant-time comparison to prevent timing attacks
  if (returnedState.length !== storedState.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < returnedState.length; i++) {
    result |= returnedState.charCodeAt(i) ^ storedState.charCodeAt(i)
  }
  return result === 0
}
