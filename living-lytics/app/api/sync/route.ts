/**
 * API Route: /api/sync
 * 
 * Triggers Google Analytics data sync for a given source
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchAndStoreGAData } from '@/lib/services/ga-fetch-service'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { sourceId, startDate, endDate } = body

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Missing sourceId' },
        { status: 400 }
      )
    }

    // Verify user owns this source
    const { data: source, error: sourceError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (sourceError || !source) {
      return NextResponse.json(
        { error: 'Data source not found or access denied' },
        { status: 404 }
      )
    }

    if (source.platform !== 'google_analytics') {
      return NextResponse.json(
        { error: 'Source is not a Google Analytics source' },
        { status: 400 }
      )
    }

    // Get property ID from credentials
    const credentials = source.credentials as any
    const propertyId = credentials?.property_id

    if (!propertyId) {
      return NextResponse.json(
        { error: 'No property ID configured for this source' },
        { status: 400 }
      )
    }

    // Set default date range if not provided (last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : (() => {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      return date
    })()

    // Fetch and store data
    console.log(`Starting sync for source ${sourceId}, property ${propertyId}`)
    const result = await fetchAndStoreGAData({
      sourceId,
      propertyId,
      startDate: start,
      endDate: end,
    })

    return NextResponse.json({
      ...result,
    })
  } catch (error) {
    console.error('Sync API error:', error)
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
