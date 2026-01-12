import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get first GA source
    const { data: source, error } = await supabase
      .from('data_sources')
      .select('id, last_synced_at, platform, connection_status')
      .eq('user_id', user.id)
      .eq('platform', 'google_analytics')
      .eq('connection_status', 'connected')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error || !source) {
      return NextResponse.json({ source: null })
    }

    return NextResponse.json({ source })
  } catch (error) {
    console.error('Error fetching first GA source:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
