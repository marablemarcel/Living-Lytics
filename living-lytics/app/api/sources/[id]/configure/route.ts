import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: sourceId } = await params

    // Verify user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const propertyId =
      typeof body?.propertyId === 'string' ? body.propertyId.trim() : ''

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
    }

    // Get current source
    const { data: source, error: fetchError } = await supabase
      .from('data_sources')
      .select('credentials')
      .eq('id', sourceId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const currentCredentials = source.credentials as Record<string, any> || {}

    // Update with property ID
    const { error: updateError } = await supabase
      .from('data_sources')
      .update({
        credentials: {
          ...currentCredentials,
          property_id: propertyId,
        },
      })
      .eq('id', sourceId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Update source error:', updateError)
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Configure error:', error)
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 })
  }
}
