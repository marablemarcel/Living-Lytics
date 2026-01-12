import { NextRequest, NextResponse } from 'next/server'
import {
  getCrossPlatformMetrics,
  getChannelAttribution,
  getTopContent,
  getCorrelationData,
} from '@/lib/services/cross-platform-analytics'

/**
 * GET /api/analytics/cross-platform
 * 
 * Fetch cross-platform analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate, endDate' },
        { status: 400 }
      )
    }

    // Fetch all cross-platform data
    const [metrics, attribution, topContent, correlationDataRaw] = await Promise.all([
      getCrossPlatformMetrics(startDate, endDate),
      getChannelAttribution(startDate, endDate),
      getTopContent(startDate, endDate, 10),
      getCorrelationData(startDate, endDate),
    ])

    // Transform correlation data for chart
    const correlationData = correlationDataRaw.map((d) => ({
      date: d.date,
      x: d.webMetric,
      y: d.socialMetric,
    }))

    return NextResponse.json({
      metrics,
      attribution,
      topContent,
      correlationData,
    })
  } catch (error) {
    console.error('Cross-platform analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cross-platform analytics' },
      { status: 500 }
    )
  }
}
