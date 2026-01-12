import { format, addDays } from 'date-fns'

import { getGAClientForSource, type GAMetrics } from '@/lib/api/google-analytics'
import { createClient } from '@/lib/supabase/server'

interface FetchOptions {
  sourceId: string
  propertyId: string
  startDate: Date
  endDate: Date
}

/**
 * Fetch Google Analytics data and save to database
 */
export async function fetchAndStoreGAData(options: FetchOptions) {
  const { sourceId, propertyId, startDate, endDate } = options

  try {
    console.log(`Starting GA sync for source ${sourceId} range ${startDate} to ${endDate}`)
    const client = await getGAClientForSource(sourceId)

    // Fetch data in chunks (30 days at a time to avoid timeouts)
    const chunks = getDateRangeChunks(startDate, endDate, 30)
    const allData: GAMetrics[] = []

    for (const chunk of chunks) {
      console.log(`Fetching data from ${chunk.start} to ${chunk.end}...`)

      const chunkData = await fetchWithRetry(async () => {
        return await client.getMetrics(propertyId, chunk.start, chunk.end)
      })

      if (chunkData && chunkData.length > 0) {
        allData.push(...chunkData)
      }
      
      // Small delay to avoid rate limits
      await sleep(100)
    }

    console.log(`Fetched ${allData.length} total records from GA. Saving to database...`)

    // Save to database
    if (allData.length > 0) {
      await saveMetricsToDatabase(sourceId, allData)
    }

    // Update last synced timestamp
    await updateLastSynced(sourceId)

    return {
      success: true,
      dataPoints: allData.length,
      dateRange: {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd'),
      },
    }
  } catch (error) {
    console.error('FetchAndStoreGAData error:', error)
    throw error // Re-throw to be handled by the caller
  }
}

/**
 * Split date range into chunks
 */
function getDateRangeChunks(
  startDate: Date,
  endDate: Date,
  chunkDays: number = 30
): Array<{ start: string; end: string }> {
  const chunks: Array<{ start: string; end: string }> = []
  let currentStart = startDate

  while (currentStart <= endDate) {
    const currentEnd = addDays(currentStart, chunkDays - 1)
    const chunkEnd = currentEnd > endDate ? endDate : currentEnd

    chunks.push({
      start: format(currentStart, 'yyyy-MM-dd'),
      end: format(chunkEnd, 'yyyy-MM-dd'),
    })

    currentStart = addDays(chunkEnd, 1)
  }

  return chunks
}

/**
 * Retry a function with exponential backoff
 */
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      console.warn(`Attempt ${attempt + 1} failed: ${errorMessage}`)

      if (isLastAttempt) {
        console.error(`Max retries (${maxRetries}) exceeded. Last error: ${errorMessage}`)
        throw error
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`Retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }

  throw new Error('Max retries exceeded')
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Save metrics to database using transformer and validator
 */
async function saveMetricsToDatabase(sourceId: string, data: GAMetrics[]) {
  const supabase = await createClient()

  // Get user ID from source
  const { data: source, error } = await supabase
    .from('data_sources')
    .select('user_id')
    .eq('id', sourceId)
    .single()

  if (error || !source) {
    console.error(`Source not found for ID: ${sourceId}`, error)
    throw new Error('Source not found')
  }

  // Import transformer and validator
  const { transformToMetricRecords, batchTransformMetrics } = await import('@/lib/transformers/ga-transformer')
  const { filterValidRecords } = await import('@/lib/validators/metrics-validator')

  // Transform data to metric records
  console.log(`Transforming ${data.length} GA data points to metric records...`)
  const allRecords = transformToMetricRecords(source.user_id, sourceId, data)
  
  // Validate records
  console.log(`Validating ${allRecords.length} metric records...`)
  const validRecords = filterValidRecords(allRecords)
  
  if (validRecords.length === 0) {
    console.warn('No valid records to insert after validation')
    return
  }

  console.log(`${validRecords.length} valid records ready for insertion`)

  // Get unique dates from the data for deletion
  const uniqueDates = [...new Set(data.map((d) => d.date))]

  // Delete existing records for these dates to avoid duplicates
  console.log(`Deleting existing records for ${uniqueDates.length} dates...`)
  const { error: deleteError } = await supabase
    .from('metrics')
    .delete()
    .eq('user_id', source.user_id)
    .eq('source_id', sourceId)
    .in('date', uniqueDates)

  if (deleteError) {
    console.warn('Failed to delete existing records (may not exist):', deleteError)
    // Continue anyway - this is just to prevent duplicates
  }

  // Insert records in batches of 100
  const batchSize = 100
  let totalInserted = 0

  for (let i = 0; i < validRecords.length; i += batchSize) {
    const batch = validRecords.slice(i, i + batchSize)
    
    console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validRecords.length / batchSize)} (${batch.length} records)...`)
    
    const { error: insertError } = await supabase
      .from('metrics')
      .insert(batch)

    if (insertError) {
      console.error(`Batch insert error at index ${i}:`, insertError)
      throw insertError
    }

    totalInserted += batch.length
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < validRecords.length) {
      await sleep(50)
    }
  }

  console.log(`Successfully saved ${totalInserted} metric records in ${Math.ceil(validRecords.length / batchSize)} batches`)
}

/**
 * Update last synced timestamp
 */
async function updateLastSynced(sourceId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('data_sources')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('id', sourceId)

  if (error) {
    console.error('Failed to update last_synced_at:', error)
  }
}
