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
      .maybeSingle()

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
    
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    
    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...updates,
          subscription_tier: 'free',
        })
        .select()
        .maybeSingle()
      
      if (error) {
        return { data: null, error: error.message }
      }
      
      return { data, error: null }
    }
    
    // Profile exists, update it
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (error) {
      return { data: null, error: error.message }
    }
    
    if (!data) {
      return { data: null, error: 'Profile update failed - no data returned' }
    }

    return { data, error: null }
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'An unknown error occurred',
    }
  }
}
