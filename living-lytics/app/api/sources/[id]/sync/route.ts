import { NextRequest, NextResponse } from 'next/server'
import { subDays } from 'date-fns'

import { fetchAndStoreGAData } from '@/lib/services/ga-fetch-service'
import { fetchAndStoreFacebookData } from '@/lib/services/facebook-fetch-service'
import { createClient } from '@/lib/supabase/server'
import { refreshDataSourceToken } from '@/lib/oauth/refresh'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let sourceId: string | undefined

  try {
    const { id } = await params
    sourceId = id
    console.log(`[SYNC] Starting sync for source: ${sourceId}`)

    const supabase = await createClient()
    console.log('[SYNC] Supabase client created')

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error('[SYNC] User auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!user) {
      console.error('[SYNC] No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[SYNC] User authenticated: ${user.id}`)

    // Get data source
    const { data: source, error: fetchError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('[SYNC] Data source fetch error:', fetchError)
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
    }

    if (!source) {
      console.error('[SYNC] Data source not found')
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
    }

    console.log(`[SYNC] Source found: ${source.platform}`)

    // Route to appropriate sync handler based on platform
    if (source.platform === 'google_analytics') {
      return await syncGoogleAnalytics(sourceId, source, user.id)
    } else if (source.platform === 'facebook_instagram') {
      return await syncFacebookInstagram(sourceId, user.id)
    } else {
      return NextResponse.json(
        { error: `Unsupported platform: ${source.platform}` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[SYNC] Fatal error:', error)
    console.error('[SYNC] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Sync Google Analytics data
 */
async function syncGoogleAnalytics(
  sourceId: string,
  source: { credentials: unknown },
  userId: string
) {
  // Check if GA property ID is set
  const credentials = source.credentials as { property_id?: string } | null

  console.log('[SYNC] Credentials:', JSON.stringify(credentials, null, 2))

  if (!credentials?.property_id) {
    console.error('[SYNC] Property ID not configured')
    return NextResponse.json(
      { error: 'Google Analytics property ID not configured' },
      { status: 400 }
    )
  }

  console.log(`[SYNC] Property ID: ${credentials.property_id}`)

  // Refresh token if needed
  try {
    console.log('[SYNC] Attempting token refresh...')
    await refreshDataSourceToken(sourceId)
    console.log('[SYNC] Token refresh successful (or not needed)')
  } catch (error) {
    console.warn('[SYNC] Token refresh failed, attempting to proceed with existing token:', error)
    // We don't return error here, we try to proceed.
    // If the token is truly invalid, the GA fetch will fail and throw.
  }

  // Fetch last 30 days of data
  const endDate = new Date()
  const startDate = subDays(endDate, 30)

  console.log(`[SYNC] Fetching data from ${startDate.toISOString()} to ${endDate.toISOString()}`)

  // Fetch and store data
  const result = await fetchAndStoreGAData({
    sourceId,
    propertyId: credentials.property_id,
    startDate,
    endDate,
  })

  console.log(`[SYNC] Fetch completed successfully:`, result)

  return NextResponse.json({
    message: 'Data synced successfully',
    ...result,
  })
}

/**
 * Sync Facebook/Instagram data
 */
async function syncFacebookInstagram(sourceId: string, userId: string) {
  console.log('[SYNC] Starting Facebook/Instagram sync')

  // Fetch last 30 days of data
  const result = await fetchAndStoreFacebookData(sourceId, userId, 30)

  console.log(`[SYNC] Facebook/Instagram sync completed:`, result)

  return NextResponse.json({
    success: true,
    message: `Synced ${result.recordCount} records`,
    recordCount: result.recordCount,
    platform: 'facebook_instagram',
    dateRange: result.dateRange,
  })
}
