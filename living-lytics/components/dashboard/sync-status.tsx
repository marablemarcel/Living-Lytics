'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

/**
 * Sync Status Component
 * 
 * Displays last sync timestamp and provides manual sync button
 */

interface SyncStatusProps {
  sourceId: string
  lastSyncedAt: string | null
  onSyncComplete?: () => void
}

export function SyncStatus({ sourceId, lastSyncedAt, onSyncComplete }: SyncStatusProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  /**
   * Trigger manual sync
   */
  const handleSync = async () => {
    setIsSyncing(true)
    setSyncError(null)

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      toast.success('Data synced successfully', {
        description: `Synced ${data.dataPoints || 0} data points`,
      })

      // Call the callback to refresh data
      onSyncComplete?.()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync data'
      setSyncError(message)
      toast.error('Sync failed', {
        description: message,
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium">Syncing data...</span>
            </>
          ) : syncError ? (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">Sync failed</span>
            </>
          ) : lastSyncedAt ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Last synced</span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Never synced</span>
            </>
          )}
        </div>
        
        {lastSyncedAt && !syncError && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}
          </p>
        )}
        
        {syncError && (
          <p className="mt-1 text-xs text-red-600">{syncError}</p>
        )}
      </div>

      <Button
        onClick={handleSync}
        disabled={isSyncing}
        size="sm"
        variant="outline"
      >
        {isSyncing ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Now
          </>
        )}
      </Button>
    </div>
  )
}
