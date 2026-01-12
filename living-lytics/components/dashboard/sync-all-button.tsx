'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

/**
 * Sync All Button Component
 *
 * Button to trigger sync for all connected data sources.
 * Shows loading state and displays results via toast.
 */

interface SyncAllButtonProps {
  onSyncComplete?: () => void
  className?: string
}

export function SyncAllButton({ onSyncComplete, className }: SyncAllButtonProps) {
  const [syncing, setSyncing] = useState(false)

  const handleSyncAll = async () => {
    setSyncing(true)

    try {
      const response = await fetch('/api/sources/sync-all', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      // Show success message with counts
      const { successCount, failureCount, totalSources } = data

      if (failureCount === 0) {
        toast.success(`Successfully synced all ${totalSources} sources`)
      } else if (successCount > 0) {
        toast.warning(
          `Synced ${successCount} of ${totalSources} sources (${failureCount} failed)`
        )
      } else {
        toast.error(`Failed to sync all ${totalSources} sources`)
      }

      // Call completion callback
      if (onSyncComplete) {
        onSyncComplete()
      }
    } catch (error) {
      console.error('Sync all error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to sync sources')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Button onClick={handleSyncAll} disabled={syncing} className={className} variant="outline">
      <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Syncing...' : 'Sync All'}
    </Button>
  )
}
