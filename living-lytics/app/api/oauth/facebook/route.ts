/**
 * Facebook OAuth 2.0 API Route
 *
 * Handles the complete OAuth flow for Facebook/Instagram integration:
 * 1. Initiates OAuth by redirecting to Facebook's consent screen
 * 2. Handles callback with authorization code
 * 3. Exchanges code for short-lived token
 * 4. Exchanges for long-lived token (60 days)
 * 5. Fetches user's Facebook Pages
 * 6. Saves connection to database
 *
 * Security features:
 * - State parameter for CSRF protection
 * - HttpOnly cookies for state storage
 * - Secure cookies in production
 * - Short-lived state (10 minutes)
 * - User authentication verification
 *
 * IMPORTANT: Before testing OAuth, configure redirect URLs:
 * 1. Facebook Developers Console > Your App > Facebook Login > Settings
 * 2. Add authorized redirect URIs:
 *    - http://localhost:3000/api/oauth/facebook (development)
 *    - https://yourdomain.com/api/oauth/facebook (production)
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import {
  buildFacebookAuthUrl,
  FACEBOOK_OAUTH_CONFIG,
  validateFacebookConfig,
  exchangeForLongLivedToken,
  getUserPages,
} from '@/lib/oauth/facebook'
import {
  generateState,
  exchangeCodeForTokens,
  calculateExpiresAt,
  validateState,
} from '@/lib/oauth/utils'
import { encrypt } from '@/lib/oauth/encryption'

// Cookie configuration for state parameter
const STATE_COOKIE_NAME = 'oauth_state_facebook'
const STATE_COOKIE_MAX_AGE = 600 // 10 minutes

/**
 * GET /api/oauth/facebook
 *
 * Handles both:
 * 1. Initial OAuth request (no code) - redirects to Facebook
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

  // Handle OAuth errors from Facebook
  if (error) {
    console.error('OAuth error from Facebook:', error, errorDescription)

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
 * Generates state parameter, stores in cookie, and redirects to Facebook.
 */
async function initiateOAuthFlow(
  request: NextRequest,
  baseUrl: string
): Promise<NextResponse> {
  // Validate configuration before proceeding
  const configValidation = validateFacebookConfig()
  if (!configValidation.isValid) {
    console.error('Missing OAuth configuration:', configValidation.missing)
    return NextResponse.redirect(`${baseUrl}/dashboard/sources?error=configuration_error`)
  }

  // Verify user is authenticated
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

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
  const redirectUri = `${baseUrl}/api/oauth/facebook`
  const authUrl = buildFacebookAuthUrl(redirectUri, state)

  return NextResponse.redirect(authUrl)
}

/**
 * Handle OAuth Callback
 *
 * Verifies state, exchanges code for tokens, gets long-lived token,
 * fetches pages, and saves connection.
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
    // Exchange authorization code for short-lived token
    const redirectUri = `${baseUrl}/api/oauth/facebook`
    const shortLivedTokens = await exchangeCodeForTokens(
      code,
      'facebook',
      FACEBOOK_OAUTH_CONFIG.clientId,
      FACEBOOK_OAUTH_CONFIG.clientSecret,
      redirectUri
    )

    // Exchange for long-lived token (60 days)
    const longLivedToken = await exchangeForLongLivedToken(shortLivedTokens.access_token)

    // Fetch user's Facebook Pages
    const pages = await getUserPages(longLivedToken.access_token)

    if (pages.length === 0) {
      console.error('No Facebook Pages found for user')
      return NextResponse.redirect(`${sourcesUrl}?error=no_pages_found`)
    }

    // Get current authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('User not authenticated during callback:', userError)
      return NextResponse.redirect(`${baseUrl}/auth/login?redirect=/dashboard/sources`)
    }

    // Calculate token expiration
    const expiresAt = calculateExpiresAt(longLivedToken.expires_in)

    // For simplicity, use the first page (can be enhanced to let user choose)
    const primaryPage = pages[0]

    // Check for existing connection
    const { data: existingConnection } = await supabase
      .from('data_sources')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'facebook_instagram')
      .single()

    // Prepare credentials with page info and tokens
    const credentials = {
      access_token: encrypt(longLivedToken.access_token),
      page_token: encrypt(primaryPage.access_token),
      expires_at: expiresAt.toISOString(),
      token_type: longLivedToken.token_type,
      page_id: primaryPage.id,
      page_name: primaryPage.name,
      instagram_account_id: primaryPage.instagram_business_account?.id || null,
      available_pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        has_instagram: !!p.instagram_business_account,
      })),
    }

    if (existingConnection) {
      // Update existing connection with encrypted tokens
      const { error: updateError } = await supabase
        .from('data_sources')
        .update({
          connection_status: 'connected',
          credentials,
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
      const { error: insertError } = await supabase.from('data_sources').insert({
        user_id: user.id,
        platform: 'facebook_instagram',
        connection_status: 'connected',
        credentials,
        last_synced_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('Failed to save connection:', insertError)
        throw insertError
      }
    }

    // Success - redirect back to sources page
    return NextResponse.redirect(`${sourcesUrl}?success=facebook_connected`)
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
