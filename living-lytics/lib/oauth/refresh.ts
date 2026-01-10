import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/oauth/encryption'
import { GOOGLE_OAUTH_CONFIG } from '@/lib/oauth/google'

/**
 * Check if access token is expired or will expire soon
 */
export function isTokenExpired(expiresAt: string): boolean {
  const expirationTime = new Date(expiresAt).getTime()
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000

  // Consider expired if it expires in less than 5 minutes
  return expirationTime - now < fiveMinutes
}

/**
 * Refresh Google OAuth access token
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
  token_type: string
}> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_OAUTH_CONFIG.clientId,
      client_secret: GOOGLE_OAUTH_CONFIG.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Token refresh failed: ${error}`)
  }

  return response.json()
}

/**
 * Refresh access token for a data source if needed
 */
export async function refreshDataSourceToken(sourceId: string): Promise<void> {
  const supabase = await createClient()

  // Get the data source
  const { data: source, error: fetchError } = await supabase
    .from('data_sources')
    .select('*')
    .eq('id', sourceId)
    .single()

  if (fetchError || !source) {
    throw new Error('Data source not found')
  }

  const credentials = source.credentials as {
    access_token: string
    refresh_token?: string | null
    expires_at: string
  }

  if (!credentials?.expires_at) {
    return
  }

  // Check if token needs refresh
  if (!isTokenExpired(credentials.expires_at)) {
    return // Token is still valid
  }

  if (!credentials.refresh_token) {
    throw new Error('Refresh token missing for data source')
  }

  // Decrypt refresh token
  const decryptedRefreshToken = decrypt(credentials.refresh_token)

  // Get new access token
  const newTokens = await refreshGoogleToken(decryptedRefreshToken)

  // Calculate new expiration
  const expiresAt = new Date(Date.now() + newTokens.expires_in * 1000)

  // Update in database
  const { error: updateError } = await supabase
    .from('data_sources')
    .update({
      credentials: {
        ...credentials,
        access_token: encrypt(newTokens.access_token),
        expires_at: expiresAt.toISOString(),
      },
      connection_status: 'connected',
    })
    .eq('id', sourceId)

  if (updateError) {
    throw updateError
  }
}
