/**
 * OAuth 2.0 Module
 *
 * Central export for all OAuth utilities, configurations, and types.
 *
 * Usage:
 * ```typescript
 * import { generateState, buildGoogleAuthUrl, OAuthProvider } from '@/lib/oauth'
 * ```
 */

// Types
export type {
  OAuthProvider,
  PlatformId,
  OAuthTokenResponse,
  OAuthCredentials,
  OAuthProviderConfig,
  OAuthState,
  OAuthConnectionResult,
  DataSourceRecord,
  OAuthError,
} from './types'

// Core utilities
export {
  generateState,
  buildAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  calculateExpiresAt,
  isTokenExpired,
  validateState,
} from './utils'

// Google OAuth
export {
  GOOGLE_OAUTH_CONFIG,
  buildGoogleAuthUrl,
  validateGoogleConfig,
  getGoogleUserInfo,
  revokeGoogleToken,
} from './google'
