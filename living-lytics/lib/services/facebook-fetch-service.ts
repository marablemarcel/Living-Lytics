/**
 * Facebook/Instagram Data Fetch Service
 *
 * Service to fetch insights from Facebook Pages and Instagram Business accounts
 * and save them to the database.
 */

import { format, subDays } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/oauth/encryption'
import {
  FacebookClient,
  FACEBOOK_PAGE_METRICS,
  INSTAGRAM_METRICS,
} from '@/lib/api/facebook-client'
import {
  transformFacebookInsights,
  transformInstagramInsights,
  combineFacebookInstagramMetrics,
  type MetricRecord,
} from '@/lib/transformers/facebook-transformer'

/**
 * Fetch Facebook/Instagram data and save to database
 *
 * @param sourceId - Data source ID
 * @param userId - User ID
 * @param days - Number of days to fetch (default: 30)
 * @returns Sync result with record count
 */
export async function fetchAndStoreFacebookData(
  sourceId: string,
  userId: string,
  days: number = 30
): Promise<{
  success: boolean
  recordCount: number
  dateRange: { start: string; end: string }
}> {
  try {
    console.log(`Starting Facebook/Instagram sync for source ${sourceId}`)

    // Get source from database
    const supabase = await createClient()
    const { data: source, error: sourceError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', userId)
      .single()

    if (sourceError || !source) {
      throw new Error('Source not found or access denied')
    }

    // Verify platform
    if (source.platform !== 'facebook_instagram') {
      throw new Error('Invalid platform for Facebook sync')
    }

    // Decrypt credentials
    const credentials = source.credentials as {
      page_token: string
      page_id: string
      instagram_account_id?: string | null
    }

    if (!credentials.page_token || !credentials.page_id) {
      throw new Error('Missing Facebook credentials')
    }

    const pageToken = decrypt(credentials.page_token)
    const pageId = credentials.page_id

    // Initialize Facebook client with page token
    const client = new FacebookClient(pageToken)

    // Calculate date range
    const endDate = new Date()
    const startDate = subDays(endDate, days)
    const since = format(startDate, 'yyyy-MM-dd')
    const until = format(endDate, 'yyyy-MM-dd')

    console.log(`Fetching data from ${since} to ${until}`)

    // Fetch Facebook Page insights
    console.log('Fetching Facebook Page insights...')
    const facebookInsights = await client.getPageInsights(
      pageId,
      FACEBOOK_PAGE_METRICS,
      since,
      until
    )

    // Transform Facebook insights
    const facebookRecords = transformFacebookInsights(facebookInsights, userId, sourceId)
    console.log(`Transformed ${facebookRecords.length} Facebook metric records`)

    let instagramRecords: MetricRecord[] = []

    // Fetch Instagram insights if account is linked
    if (credentials.instagram_account_id) {
      try {
        console.log('Fetching Instagram insights...')
        const igAccountId = credentials.instagram_account_id

        // Fetch Instagram insights
        const instagramInsights = await client.getInstagramInsights(
          igAccountId,
          INSTAGRAM_METRICS,
          since,
          until
        )

        // Fetch current follower count
        const followerCount = await client.getInstagramFollowerCount(igAccountId)

        // Transform Instagram insights
        instagramRecords = transformInstagramInsights(
          instagramInsights,
          userId,
          sourceId,
          followerCount
        )
        console.log(`Transformed ${instagramRecords.length} Instagram metric records`)
      } catch (error) {
        console.warn('Instagram insights fetch failed (skipping):', error)
        // Continue without Instagram data - it's optional
      }
    } else {
      console.log('No Instagram account linked, skipping Instagram insights')
    }

    // Combine all records
    const allRecords = combineFacebookInstagramMetrics(facebookRecords, instagramRecords)

    if (allRecords.length === 0) {
      console.warn('No records to save')
      return {
        success: true,
        recordCount: 0,
        dateRange: { start: since, end: until },
      }
    }

    // Save to database
    console.log(`Saving ${allRecords.length} total records to database...`)
    await saveMetricsToDatabase(userId, sourceId, allRecords, since, until)

    // Update last synced timestamp
    await updateLastSynced(sourceId)

    console.log('Facebook/Instagram sync completed successfully')

    return {
      success: true,
      recordCount: allRecords.length,
      dateRange: { start: since, end: until },
    }
  } catch (error) {
    console.error('Facebook/Instagram sync error:', error)
    throw error
  }
}

/**
 * Save metrics to database
 *
 * Deletes existing records for the date range and inserts new ones.
 */
async function saveMetricsToDatabase(
  userId: string,
  sourceId: string,
  records: MetricRecord[],
  startDate: string,
  endDate: string
): Promise<void> {
  const supabase = await createClient()

  // Get unique dates from the records
  const uniqueDates = [...new Set(records.map((r) => r.date))]

  // Delete existing records for these dates to avoid duplicates
  console.log(`Deleting existing records for ${uniqueDates.length} dates...`)
  const { error: deleteError } = await supabase
    .from('metrics')
    .delete()
    .eq('user_id', userId)
    .eq('source_id', sourceId)
    .in('date', uniqueDates)

  if (deleteError) {
    console.warn('Failed to delete existing records (may not exist):', deleteError)
    // Continue anyway - this is just to prevent duplicates
  }

  // Insert records in batches of 100
  const batchSize = 100
  let totalInserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)

    console.log(
      `Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)} (${batch.length} records)...`
    )

    const { error: insertError } = await supabase.from('metrics').insert(batch)

    if (insertError) {
      console.error(`Batch insert error at index ${i}:`, insertError)
      throw insertError
    }

    totalInserted += batch.length

    // Small delay between batches to avoid rate limits
    if (i + batchSize < records.length) {
      await sleep(50)
    }
  }

  console.log(
    `Successfully saved ${totalInserted} metric records in ${Math.ceil(records.length / batchSize)} batches`
  )
}

/**
 * Update last synced timestamp
 */
async function updateLastSynced(sourceId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('data_sources')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', sourceId)

  if (error) {
    console.error('Failed to update last_synced_at:', error)
  }
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
