/**
 * Unified Multi-Source Sync Service
 *
 * Service to sync all connected data sources for a user simultaneously.
 * Handles errors per source to ensure one failure doesn't stop others.
 */

import { createClient } from '@/lib/supabase/server'
import { fetchAndStoreGAData } from './ga-fetch-service'
import { fetchAndStoreFacebookData } from './facebook-fetch-service'
import { subDays } from 'date-fns'

/**
 * Result from syncing a single source
 */
export interface SyncSourceResult {
  sourceId: string
  platform: string
  success: boolean
  recordCount?: number
  error?: string
}

/**
 * Aggregated results from syncing all sources
 */
export interface SyncAllResult {
  totalSources: number
  successCount: number
  failureCount: number
  results: SyncSourceResult[]
}

/**
 * Sync all connected sources for a user
 *
 * @param userId - User ID
 * @returns Aggregated sync results
 */
export async function syncAllSources(userId: string): Promise<SyncAllResult> {
  console.log(`[UNIFIED_SYNC] Starting sync for all sources for user: ${userId}`)

  const supabase = await createClient()

  // Fetch all connected sources for user
  const { data: sources, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('user_id', userId)
    .eq('connection_status', 'connected')

  if (error) {
    console.error('[UNIFIED_SYNC] Error fetching sources:', error)
    throw new Error('Failed to fetch data sources')
  }

  if (!sources || sources.length === 0) {
    console.log('[UNIFIED_SYNC] No connected sources found')
    return {
      totalSources: 0,
      successCount: 0,
      failureCount: 0,
      results: [],
    }
  }

  console.log(`[UNIFIED_SYNC] Found ${sources.length} connected sources`)

  // Sync all sources in parallel
  const syncPromises = sources.map((source) => syncSource(source, userId))
  const results = await Promise.all(syncPromises)

  // Aggregate results
  const successCount = results.filter((r) => r.success).length
  const failureCount = results.filter((r) => !r.success).length

  console.log(
    `[UNIFIED_SYNC] Completed: ${successCount} succeeded, ${failureCount} failed`
  )

  return {
    totalSources: sources.length,
    successCount,
    failureCount,
    results,
  }
}

/**
 * Sync a single data source
 *
 * Catches errors to prevent one failure from stopping others.
 *
 * @param source - Data source record
 * @param userId - User ID
 * @returns Sync result for this source
 */
async function syncSource(
  source: {
    id: string
    platform: string
    credentials: unknown
  },
  userId: string
): Promise<SyncSourceResult> {
  const { id: sourceId, platform } = source

  console.log(`[UNIFIED_SYNC] Syncing source ${sourceId} (${platform})`)

  try {
    let recordCount = 0

    if (platform === 'google_analytics') {
      // Sync Google Analytics
      const credentials = source.credentials as { property_id?: string } | null

      if (!credentials?.property_id) {
        throw new Error('Google Analytics property ID not configured')
      }

      const endDate = new Date()
      const startDate = subDays(endDate, 30)

      const result = await fetchAndStoreGAData({
        sourceId,
        propertyId: credentials.property_id,
        startDate,
        endDate,
      })

      recordCount = result.dataPoints || 0
    } else if (platform === 'facebook_instagram') {
      // Sync Facebook/Instagram
      const result = await fetchAndStoreFacebookData(sourceId, userId, 30)
      recordCount = result.recordCount || 0
    } else {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    console.log(`[UNIFIED_SYNC] Source ${sourceId} synced successfully: ${recordCount} records`)

    return {
      sourceId,
      platform,
      success: true,
      recordCount,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[UNIFIED_SYNC] Source ${sourceId} sync failed:`, errorMessage)

    return {
      sourceId,
      platform,
      success: false,
      error: errorMessage,
    }
  }
}
