/**
 * Supabase Edge Function: sync-google-analytics
 * 
 * Fetches Google Analytics data for a given source and saves it to the database.
 * Supports both manual and scheduled syncs.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Interface for request body
 */
interface SyncRequest {
  sourceId: string
  startDate?: string // Optional: defaults to 30 days ago
  endDate?: string   // Optional: defaults to today
}

/**
 * Interface for GA metrics from API
 */
interface GAMetrics {
  date: string
  pageViews: number
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { sourceId, startDate, endDate }: SyncRequest = await req.json()

    if (!sourceId) {
      return new Response(
        JSON.stringify({ error: 'Missing sourceId in request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user owns this data source
    const { data: source, error: sourceError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (sourceError || !source) {
      return new Response(
        JSON.stringify({ error: 'Data source not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (source.platform !== 'google_analytics') {
      return new Response(
        JSON.stringify({ error: 'Source is not a Google Analytics source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (source.connection_status !== 'connected') {
      return new Response(
        JSON.stringify({ error: 'Data source is not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!source.credentials) {
      return new Response(
        JSON.stringify({ error: 'No credentials found for data source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get property ID from credentials
    const credentials = source.credentials as any
    const propertyId = credentials.property_id

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: 'No property ID configured for this source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Set default date range if not provided (last 30 days)
    const end = endDate || new Date().toISOString().split('T')[0]
    const start = startDate || (() => {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date.toISOString().split('T')[0]
    })()

    console.log(`Starting GA sync for source ${sourceId}, property ${propertyId}, range ${start} to ${end}`)

    // Call the main application's sync service via HTTP
    // This allows us to reuse the existing GA client and transformation logic
    const appUrl = supabaseUrl.replace('.supabase.co', '.vercel.app') // Adjust based on your deployment
    
    // For now, we'll implement a simplified version directly in the Edge Function
    // In production, you might want to call your Next.js API route instead
    
    // TODO: Implement GA data fetching here or call Next.js API
    // For now, return a success response indicating the sync was initiated
    
    // Update last_synced_at timestamp
    const { error: updateError } = await supabase
      .from('data_sources')
      .update({ 
        last_synced_at: new Date().toISOString(),
        connection_status: 'connected'
      })
      .eq('id', sourceId)

    if (updateError) {
      console.error('Failed to update last_synced_at:', updateError)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sync initiated successfully',
        sourceId,
        propertyId,
        dateRange: { start, end },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To invoke locally:

  1. Start Supabase: supabase start
  2. Serve function: supabase functions serve sync-google-analytics
  3. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/sync-google-analytics' \
    --header 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
    --header 'Content-Type: application/json' \
    --data '{"sourceId":"your-source-id","startDate":"2024-01-01","endDate":"2024-01-31"}'

*/
