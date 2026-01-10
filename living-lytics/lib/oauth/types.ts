/**
 * OAuth 2.0 Type Definitions
 *
 * Core types for OAuth authentication flow including
 * token management, provider configuration, and API responses.
 */

// Supported OAuth providers
export type OAuthProvider = 'google' | 'facebook' | 'instagram'

// Platform identifiers used in the application
export type PlatformId = 'google_analytics' | 'facebook_instagram' | 'google_ads'

// Token response from OAuth provider
export interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope?: string
}

// Stored credentials in database
export interface OAuthCredentials {
  access_token: string
  refresh_token?: string
  expires_at: string
  token_type: string
  scope?: string
}

// OAuth provider configuration
export interface OAuthProviderConfig {
  authUrl: string
  tokenUrl: string
  scopes: string[]
  clientId: string
  clientSecret: string
}

// State parameter with metadata
export interface OAuthState {
  value: string
  provider: OAuthProvider
  timestamp: number
}

// Connection result after OAuth flow
export interface OAuthConnectionResult {
  success: boolean
  provider: OAuthProvider
  platform: PlatformId
  error?: string
}

// Data source record structure
export interface DataSourceRecord {
  id?: string
  user_id: string
  platform: PlatformId
  connection_status: 'connected' | 'disconnected' | 'error' | 'syncing'
  credentials: OAuthCredentials
  last_synced_at: string
  created_at?: string
  updated_at?: string
}

// API error response
export interface OAuthError {
  error: string
  error_description?: string
}
