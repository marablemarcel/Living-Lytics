import { createClient } from '@/lib/supabase/client'

export interface DataSource {
  id: string
  user_id: string
  platform: string
  connection_status: 'connected' | 'disconnected' | 'error'
  credentials: Record<string, unknown> | null
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Get all data sources for current user
 */
export async function getUserDataSources(): Promise<DataSource[]> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching data sources:', error)
    return []
  }

  return (data as DataSource[]) || []
}

/**
 * Check if platform is connected
 */
export async function isPlatformConnected(platform: string): Promise<boolean> {
  const sources = await getUserDataSources()
  return sources.some(
    (source) => source.platform === platform && source.connection_status === 'connected'
  )
}

/**
 * Get connection by platform
 */
export async function getConnectionByPlatform(platform: string): Promise<DataSource | undefined> {
  const sources = await getUserDataSources()
  return sources.find((source) => source.platform === platform)
}

/**
 * Disconnect a data source
 */
export async function disconnectDataSource(sourceId: string): Promise<{ success: boolean }> {
  const supabase = createClient()

  const { error } = await supabase.from('data_sources').delete().eq('id', sourceId)

  if (error) {
    throw error
  }

  return { success: true }
}

/**
 * Map platform ID to database platform name
 */
export function mapPlatformId(platformId: string): string {
  const mapping: Record<string, string> = {
    'google-analytics': 'google_analytics',
    'facebook-instagram': 'facebook_instagram',
    'google-ads': 'google_ads',
    shopify: 'shopify',
    mailchimp: 'mailchimp',
    twitter: 'twitter',
  }
  return mapping[platformId] || platformId
}

/**
 * Map database platform name to platform ID
 */
export function mapPlatformName(platformName: string): string {
  const mapping: Record<string, string> = {
    google_analytics: 'google-analytics',
    facebook_instagram: 'facebook-instagram',
    google_ads: 'google-ads',
    shopify: 'shopify',
    mailchimp: 'mailchimp',
    twitter: 'twitter',
  }
  return mapping[platformName] || platformName
}

/**
 * Check if a connection needs attention (expired, error, etc.)
 */
export function getConnectionHealth(connection: {
  connection_status: 'connected' | 'disconnected' | 'error' | 'syncing'
  credentials?: { expires_at?: string | null } | null
}): {
  status: 'healthy' | 'expiring' | 'expired' | 'error'
  message?: string
} {
  if (connection.connection_status === 'error') {
    return { status: 'error', message: 'Connection error - please reconnect' }
  }

  if (!connection.credentials?.expires_at) {
    return { status: 'healthy' }
  }

  const expiresAt = new Date(connection.credentials.expires_at)
  const now = new Date()
  const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilExpiry < 0) {
    return { status: 'expired', message: 'Token expired - will refresh on next sync' }
  }

  if (hoursUntilExpiry < 24) {
    return { status: 'expiring', message: 'Token expires soon' }
  }

  return { status: 'healthy' }
}
