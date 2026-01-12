/**
 * Sync All Sources API Route
 *
 * Endpoint to sync all connected data sources for the authenticated user.
 * Returns aggregated results showing success/failure for each source.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncAllSources } from '@/lib/services/unified-sync-service'

/**
 * POST /api/sources/sync-all
 *
 * Syncs all connected sources for the authenticated user.
 */
export async function POST(_request: NextRequest) {
  try {
    console.log('[SYNC_ALL] Starting sync all sources')

    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('[SYNC_ALL] User not authenticated:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[SYNC_ALL] User authenticated: ${user.id}`)

    // Sync all sources
    const result = await syncAllSources(user.id)

    console.log('[SYNC_ALL] Sync completed:', result)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('[SYNC_ALL] Fatal error:', error)
    return NextResponse.json(
      {
        error: 'Sync all failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
