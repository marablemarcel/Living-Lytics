/**
 * Cache Utilities
 * 
 * Provides caching functionality with TTL and stale-while-revalidate pattern
 */

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  staleWhileRevalidate?: boolean // Return stale data while fetching fresh (default: true)
}

/**
 * Default cache TTL (5 minutes)
 */
const DEFAULT_TTL = 5 * 60 * 1000

/**
 * In-memory cache store
 */
const memoryCache = new Map<string, CacheEntry<any>>()

/**
 * Check if cache entry is expired
 */
function isExpired(entry: CacheEntry<any>): boolean {
  return Date.now() - entry.timestamp > entry.ttl
}

/**
 * Get data from localStorage cache
 */
export function getFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = localStorage.getItem(key)
    if (!item) return null

    const entry: CacheEntry<T> = JSON.parse(item)

    // Check if expired
    if (isExpired(entry)) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.error('Error reading from localStorage cache:', error)
    return null
  }
}

/**
 * Set data in localStorage cache
 */
export function setInLocalStorage<T>(key: string, data: T, config: CacheConfig = {}): void {
  if (typeof window === 'undefined') return

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: config.ttl || DEFAULT_TTL,
    }

    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.error('Error writing to localStorage cache:', error)
  }
}

/**
 * Get data from memory cache
 */
export function getFromMemory<T>(key: string): T | null {
  const entry = memoryCache.get(key)
  if (!entry) return null

  // Check if expired
  if (isExpired(entry)) {
    memoryCache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Set data in memory cache
 */
export function setInMemory<T>(key: string, data: T, config: CacheConfig = {}): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
    ttl: config.ttl || DEFAULT_TTL,
  }

  memoryCache.set(key, entry)
}

/**
 * Invalidate cache entry
 */
export function invalidateCache(key: string): void {
  // Remove from memory
  memoryCache.delete(key)

  // Remove from localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error invalidating localStorage cache:', error)
    }
  }
}

/**
 * Invalidate all cache entries matching a pattern
 */
export function invalidateCachePattern(pattern: string): void {
  // Clear from memory
  const keysToDelete: string[] = []
  memoryCache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => memoryCache.delete(key))

  // Clear from localStorage
  if (typeof window !== 'undefined') {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error invalidating localStorage cache pattern:', error)
    }
  }
}

/**
 * Cached fetch with stale-while-revalidate
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
): Promise<T> {
  const { staleWhileRevalidate = true } = config

  // Try memory cache first
  const memoryData = getFromMemory<T>(key)
  if (memoryData !== null) {
    return memoryData
  }

  // Try localStorage cache
  const localData = getFromLocalStorage<T>(key)
  if (localData !== null) {
    // Also store in memory for faster access
    setInMemory(key, localData, config)

    // If stale-while-revalidate, fetch fresh data in background
    if (staleWhileRevalidate) {
      fetcher()
        .then((freshData) => {
          setInMemory(key, freshData, config)
          setInLocalStorage(key, freshData, config)
        })
        .catch((error) => {
          console.error('Background revalidation failed:', error)
        })
    }

    return localData
  }

  // No cache hit, fetch fresh data
  const freshData = await fetcher()

  // Store in both caches
  setInMemory(key, freshData, config)
  setInLocalStorage(key, freshData, config)

  return freshData
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return `${prefix}:${sortedParams}`
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  // Clear memory cache
  memoryCache.clear()

  // Clear localStorage cache
  if (typeof window !== 'undefined') {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}
