'use client'

import { useState, useEffect } from 'react'

interface DataSource {
  id: string
  name: string
  type: string
  connected: boolean
}

interface UseDataSourcesReturn {
  hasDataSources: boolean
  loading: boolean
  dataSources: DataSource[]
  toggleMockData: () => void
}

const STORAGE_KEY = 'dev_show_mock_data'

/**
 * Hook to manage data source state
 *
 * In development mode, supports a localStorage flag to show/hide mock data
 * In production, will check for actual connected data sources
 */
export function useDataSources(): UseDataSourcesReturn {
  const [hasDataSources, setHasDataSources] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment && typeof window !== 'undefined') {
      // Check localStorage flag for development mock data
      const showMockData = localStorage.getItem(STORAGE_KEY) === 'true'
      setHasDataSources(showMockData)
    } else {
      // In production, check for actual data sources
      // TODO: Implement real data source check in Week 5
      setHasDataSources(false)
    }

    setLoading(false)
  }, [])

  /**
   * Toggle the mock data flag in development mode
   * This allows developers to switch between empty state and data views
   */
  const toggleMockData = () => {
    if (typeof window === 'undefined') return

    const isDevelopment = process.env.NODE_ENV === 'development'

    if (isDevelopment) {
      const currentValue = localStorage.getItem(STORAGE_KEY) === 'true'
      const newValue = !currentValue
      localStorage.setItem(STORAGE_KEY, String(newValue))
      setHasDataSources(newValue)

      // Log for developer awareness
      console.log(`[Dev Mode] Mock data ${newValue ? 'enabled' : 'disabled'}`)
    } else {
      console.warn('toggleMockData() is only available in development mode')
    }
  }

  return {
    hasDataSources,
    loading,
    dataSources: [], // Empty for now, will be populated with real sources in Week 5
    toggleMockData,
  }
}

export default useDataSources
