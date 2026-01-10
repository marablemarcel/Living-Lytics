/**
 * Google OAuth 2.0 API Route
 *
 * Handles the complete OAuth flow for Google Analytics integration:
 * 1. Initiates OAuth by redirecting to Google's consent screen
 * 2. Handles callback with authorization code
 * 3. Exchanges code for tokens
 * 4. Saves connection to database
 *
 * Security features:
 * - State parameter for CSRF protection
 * - HttpOnly cookies for state storage
 * - Secure cookies in production
 * - Short-lived state (10 minutes)
 * - User authentication verification
 *
 * IMPORTANT: Before testing OAuth, configure redirect URLs:
 * 1. Google Cloud Console > APIs & Services > Credentials
 * 2. Add authorized redirect URIs:
 *    - http://localhost:3000/api/oauth/google (development)
 *    - https://yourdomain.com/api/oauth/google (production)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { buildGoogleAuthUrl, GOOGLE_OAUTH_CONFIG, validateGoogleConfig } from '@/lib/oauth/google'
import {
  generateState,
  exchangeCodeForTokens,
  calculateExpiresAt,
  validateState,
} from '@/lib/oauth/utils'
import { encrypt } from '@/lib/oauth/encryption'

// Cookie configuration for state parameter
const STATE_COOKIE_NAME = 'oauth_state'
const STATE_COOKIE_MAX_AGE = 600 // 10 minutes

/**
 * GET /api/oauth/google
 *
 * Handles both:
 * 1. Initial OAuth request (no code) - redirects to Google
 * 2. OAuth callback (with code) - exchanges code for tokens
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Base URL for redirects
  const baseUrl = request.nextUrl.origin
  const sourcesUrl = `${baseUrl}/dashboard/sources`

  // Handle OAuth errors from Google
  if (error) {
    console.error('OAuth error from Google:', error, errorDescription)

    const errorParam = error === 'access_denied' ? 'access_denied' : 'oauth_error'
    return NextResponse.redirect(`${sourcesUrl}?error=${errorParam}`)
  }

  // If no code, initiate OAuth flow
  if (!code) {
    return initiateOAuthFlow(request, baseUrl)
  }

  // Handle OAuth callback with authorization code
  return handleOAuthCallback(request, code, returnedState, baseUrl, sourcesUrl)
}

/**
 * Initiate OAuth Flow
 *
 * Generates state parameter, stores in cookie, and redirects to Google.
 */
async function initiateOAuthFlow(
  request: NextRequest,
  baseUrl: string
): Promise<NextResponse> {
  // Validate configuration before proceeding
  const configValidation = validateGoogleConfig()
  if (!configValidation.isValid) {
    console.error('Missing OAuth configuration:', configValidation.missing)
    return NextResponse.redirect(
      `${baseUrl}/dashboard/sources?error=configuration_error`
    )
  }

  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('User not authenticated for OAuth:', authError)
    return NextResponse.redirect(`${baseUrl}/auth/login?redirect=/dashboard/sources`)
  }

  // Generate state for CSRF protection
  const state = generateState()

  // Store state in HttpOnly cookie
  const cookieStore = await cookies()
  cookieStore.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_COOKIE_MAX_AGE,
    path: '/',
  })

  // Build redirect URL
  const redirectUri = `${baseUrl}/api/oauth/google`
  const authUrl = buildGoogleAuthUrl(redirectUri, state)

  return NextResponse.redirect(authUrl)
}

/**
 * Handle OAuth Callback
 *
 * Verifies state, exchanges code for tokens, and saves connection.
 */
async function handleOAuthCallback(
  request: NextRequest,
  code: string,
  returnedState: string | null,
  baseUrl: string,
  sourcesUrl: string
): Promise<NextResponse> {
  // Retrieve stored state from cookie
  const cookieStore = await cookies()
  const storedState = cookieStore.get(STATE_COOKIE_NAME)?.value ?? null

  // Verify state parameter (CSRF protection)
  if (!validateState(returnedState, storedState)) {
    console.error('State mismatch - possible CSRF attack', {
      returned: returnedState?.substring(0, 8) + '...',
      stored: storedState ? storedState.substring(0, 8) + '...' : 'none',
    })
    return NextResponse.redirect(`${sourcesUrl}?error=invalid_state`)
  }

  // Clear state cookie immediately after validation
  cookieStore.delete(STATE_COOKIE_NAME)

  try {
    // Exchange authorization code for tokens
    const redirectUri = `${baseUrl}/api/oauth/google`
    const tokens = await exchangeCodeForTokens(
      code,
      'google',
      GOOGLE_OAUTH_CONFIG.clientId,
      GOOGLE_OAUTH_CONFIG.clientSecret,
      redirectUri
    )

    // Get current authenticated user
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User not authenticated during callback:', userError)
      return NextResponse.redirect(`${baseUrl}/auth/login?redirect=/dashboard/sources`)
    }

    // Calculate token expiration
    const expiresAt = calculateExpiresAt(tokens.expires_in)

    // Check for existing connection
    const { data: existingConnection } = await supabase
      .from('data_sources')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'google_analytics')
      .single()

    if (existingConnection) {
      // Update existing connection with encrypted tokens
      const { error: updateError } = await supabase
        .from('data_sources')
        .update({
          connection_status: 'connected',
          credentials: {
            access_token: encrypt(tokens.access_token),
            refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
            expires_at: expiresAt.toISOString(),
            token_type: tokens.token_type,
          },
          last_synced_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingConnection.id)

      if (updateError) {
        console.error('Failed to update connection:', updateError)
        throw updateError
      }
    } else {
      // Create new connection with encrypted tokens
      const { error: insertError } = await supabase
        .from('data_sources')
        .insert({
          user_id: user.id,
          platform: 'google_analytics',
          connection_status: 'connected',
          credentials: {
            access_token: encrypt(tokens.access_token),
            refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
            expires_at: expiresAt.toISOString(),
            token_type: tokens.token_type,
          },
          last_synced_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Failed to save connection:', insertError)
        throw insertError
      }
    }

    // Success - redirect back to sources page
    return NextResponse.redirect(`${sourcesUrl}?success=google_connected`)
  } catch (error) {
    console.error('OAuth callback error:', error)

    // Provide more specific error message if possible
    const errorMessage =
      error instanceof Error && error.message.includes('Token exchange')
        ? 'token_exchange_failed'
        : 'connection_failed'

    return NextResponse.redirect(`${sourcesUrl}?error=${errorMessage}`)
  }
}
