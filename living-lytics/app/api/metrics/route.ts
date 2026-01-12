import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const sourceId = searchParams.get('sourceId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!sourceId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: sourceId, startDate, endDate' },
        { status: 400 }
      )
    }

    // Fetch metrics from database
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('source_id', sourceId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching metrics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch metrics' },
        { status: 500 }
      )
    }

    // Group by date
    const groupedByDate: Record<string, any> = {}
    
    data?.forEach((record) => {
      if (!groupedByDate[record.date]) {
        groupedByDate[record.date] = {
          date: record.date,
          pageViews: 0,
          sessions: 0,
          users: 0,
          bounceRate: 0,
          avgSessionDuration: 0,
        }
      }

      switch (record.metric_type) {
        case 'page_views':
          groupedByDate[record.date].pageViews = record.metric_value
          break
        case 'sessions':
          groupedByDate[record.date].sessions = record.metric_value
          break
        case 'users':
          groupedByDate[record.date].users = record.metric_value
          break
        case 'bounce_rate':
          groupedByDate[record.date].bounceRate = record.metric_value
          break
        case 'avg_session_duration':
          groupedByDate[record.date].avgSessionDuration = record.metric_value
          break
      }
    })

    const metrics = Object.values(groupedByDate).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    )

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('Error in metrics API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
