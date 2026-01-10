import {
  getGAClientForSource,
  getGAClientForUser,
  formatDateForGA,
  getDateRange,
  type GAMetrics,
} from './google-analytics'

// ============================================================================
// Test Result Types
// ============================================================================

export interface GATestResult {
  success: boolean
  message: string
  dataPoints?: number
  sample?: GAMetrics[]
  error?: string
  details?: Record<string, unknown>
}

// ============================================================================
// Test Functions
// ============================================================================

/**
 * Test GA API connection using source ID and property ID
 */
export async function testGAConnection(
  sourceId: string,
  propertyId: string
): Promise<GATestResult> {
  try {
    const client = await getGAClientForSource(sourceId)

    // Fetch last 7 days of data
    const { startDate, endDate } = getDateRange('7days')

    const data = await client.getMetrics(propertyId, startDate, endDate)

    return {
      success: true,
      message: `Successfully fetched ${data.length} days of data`,
      dataPoints: data.length,
      sample: data.slice(0, 3),
      details: {
        dateRange: { startDate, endDate },
        totalPageViews: data.reduce((sum, d) => sum + d.pageViews, 0),
        totalSessions: data.reduce((sum, d) => sum + d.sessions, 0),
        totalUsers: data.reduce((sum, d) => sum + d.users, 0),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      message: 'Failed to connect to Google Analytics',
      error: message,
    }
  }
}

/**
 * Test GA connection for the current user
 * Automatically finds their connected GA source
 */
export async function testGAConnectionForUser(): Promise<GATestResult> {
  try {
    const gaData = await getGAClientForUser()

    if (!gaData) {
      return {
        success: false,
        message: 'No Google Analytics connection found',
        error: 'Please connect your Google Analytics account first',
      }
    }

    const { client, sourceId, propertyId } = gaData

    if (!propertyId) {
      return {
        success: false,
        message: 'No GA4 property ID configured',
        error:
          'Please set your GA4 property ID. You can find it in Google Analytics: Admin > Property > Property Details.',
        details: { sourceId },
      }
    }

    // Fetch last 7 days of data
    const { startDate, endDate } = getDateRange('7days')

    const data = await client.getMetrics(propertyId, startDate, endDate)

    return {
      success: true,
      message: `Successfully fetched ${data.length} days of data`,
      dataPoints: data.length,
      sample: data.slice(0, 3),
      details: {
        sourceId,
        propertyId,
        dateRange: { startDate, endDate },
        totalPageViews: data.reduce((sum, d) => sum + d.pageViews, 0),
        totalSessions: data.reduce((sum, d) => sum + d.sessions, 0),
        totalUsers: data.reduce((sum, d) => sum + d.users, 0),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      message: 'Failed to connect to Google Analytics',
      error: message,
    }
  }
}

/**
 * Test realtime data
 */
export async function testRealtimeData(
  sourceId: string,
  propertyId: string
): Promise<GATestResult> {
  try {
    const client = await getGAClientForSource(sourceId)
    const activeUsers = await client.getRealtimeUsers(propertyId)

    return {
      success: true,
      message: `Currently ${activeUsers} active users on site`,
      details: { activeUsers, timestamp: new Date().toISOString() },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      message: 'Failed to fetch realtime data',
      error: message,
    }
  }
}

/**
 * Test top pages report
 */
export async function testTopPages(
  sourceId: string,
  propertyId: string
): Promise<GATestResult> {
  try {
    const client = await getGAClientForSource(sourceId)
    const { startDate, endDate } = getDateRange('7days')

    const topPages = await client.getTopPages(propertyId, startDate, endDate, 5)

    return {
      success: true,
      message: `Found ${topPages.length} top pages`,
      details: {
        dateRange: { startDate, endDate },
        topPages,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      message: 'Failed to fetch top pages',
      error: message,
    }
  }
}

/**
 * Test traffic sources report
 */
export async function testTrafficSources(
  sourceId: string,
  propertyId: string
): Promise<GATestResult> {
  try {
    const client = await getGAClientForSource(sourceId)
    const { startDate, endDate } = getDateRange('7days')

    const sources = await client.getTrafficSources(propertyId, startDate, endDate)

    return {
      success: true,
      message: `Found ${sources.length} traffic sources`,
      details: {
        dateRange: { startDate, endDate },
        trafficSources: sources.slice(0, 10),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      message: 'Failed to fetch traffic sources',
      error: message,
    }
  }
}

/**
 * Run all GA tests
 */
export async function runAllGATests(
  sourceId: string,
  propertyId: string
): Promise<{
  overall: boolean
  tests: Record<string, GATestResult>
}> {
  const tests: Record<string, GATestResult> = {}

  // Run tests sequentially to avoid rate limiting
  tests.connection = await testGAConnection(sourceId, propertyId)
  tests.realtime = await testRealtimeData(sourceId, propertyId)
  tests.topPages = await testTopPages(sourceId, propertyId)
  tests.trafficSources = await testTrafficSources(sourceId, propertyId)

  const overall = Object.values(tests).every((t) => t.success)

  return { overall, tests }
}
