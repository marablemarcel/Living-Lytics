import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { refreshDataSourceToken } from '@/lib/oauth/refresh'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sourceId } = await params
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this data source
    const { data: source } = await supabase
      .from('data_sources')
      .select('*')
      .eq('id', sourceId)
      .maybeSingle()

    if (!source) {
      return NextResponse.json({ error: 'Data source not found' }, { status: 404 })
    }

    if (source.user_id !== user.id) {
      return NextResponse.json({ error: 'You do not own this data source' }, { status: 403 })
    }

    // Refresh token if needed
    try {
      await refreshDataSourceToken(sourceId)
    } catch {
      // Continue anyway - token might still be valid
    }

    // Update last synced time
    const lastSyncedAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('data_sources')
      .update({
        last_synced_at: lastSyncedAt,
        connection_status: 'connected',
      })
      .eq('id', sourceId)

    if (updateError) {
      throw updateError
    }

    // TODO: In Week 6, add actual data fetching logic here
    // For now, just update the sync timestamp

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      last_synced_at: lastSyncedAt,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
