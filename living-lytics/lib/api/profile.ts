import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/profile'

interface ApiResponse<T> {
  data: T | null
  error: string | null
}

/**
 * Creates a new profile for a user
 */
export async function createProfile(
  userId: string,
  businessName: string,
  businessType: string
): Promise<ApiResponse<Profile>> {
  try {
    console.log('Creating profile with:', { userId, businessName, businessType })

    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        business_name: businessName,
        business_type: businessType,
        subscription_tier: 'free',
      })
      .select()
      .single()

    console.log('Supabase insert result:', { data, error })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
    }
  }
}

/**
 * Gets a profile by user ID
 */
export async function getProfile(
  userId: string
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
    }
  }
}

/**
 * Updates a profile with partial fields
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<ApiResponse<Profile>> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
    }
  }
}
