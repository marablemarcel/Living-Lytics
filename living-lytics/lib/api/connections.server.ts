/**
 * Server-side connection functions
 * These functions use the server-side Supabase client and can only be used in:
 * - API routes
 * - Server components
 * - Server actions
 */

import { createClient } from '@/lib/supabase/server'

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
 * Update Google Analytics property ID for a data source
 */
export async function updateGAPropertyId(
  sourceId: string,
  propertyId: string
): Promise<{ success: boolean }> {
  const supabase = await createClient()

  // First, get the existing credentials
  const { data: source, error: fetchError } = await supabase
    .from('data_sources')
    .select('credentials')
    .eq('id', sourceId)
    .single()

  if (fetchError || !source) {
    throw new Error('Data source not found')
  }

  // Merge the property_id into existing credentials
  const updatedCredentials = {
    ...(source.credentials as Record<string, unknown>),
    property_id: propertyId,
  }

  const { error: updateError } = await supabase
    .from('data_sources')
    .update({
      credentials: updatedCredentials,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sourceId)

  if (updateError) {
    throw updateError
  }

  return { success: true }
}

/**
 * Get a single data source by ID
 */
export async function getDataSourceById(sourceId: string): Promise<DataSource | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('data_sources')
    .select('*')
    .eq('id', sourceId)
    .single()

  if (error || !data) {
    return null
  }

  return data as DataSource
}

/**
 * Get all data sources for current user (server-side)
 */
export async function getUserDataSourcesServer(): Promise<DataSource[]> {
  const supabase = await createClient()

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
 * Get connection by platform (server-side)
 */
export async function getConnectionByPlatformServer(
  platform: string
): Promise<DataSource | null> {
  const sources = await getUserDataSourcesServer()
  return sources.find((source) => source.platform === platform) || null
}
