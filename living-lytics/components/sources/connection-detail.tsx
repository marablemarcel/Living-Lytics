'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RefreshCw, Unplug, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ConnectionDetailProps {
  connection: {
    id: string
    platform: string
    connection_status: string
    created_at: string
    last_synced_at?: string | null
    credentials?: Record<string, unknown> | null
  }
  onRefresh: (id: string) => void
  onDisconnect: (id: string) => void
  refreshing?: boolean
}

export function ConnectionDetail({
  connection,
  onRefresh,
  onDisconnect,
  refreshing = false,
}: ConnectionDetailProps) {
  const platformNames: Record<string, string> = {
    google_analytics: 'Google Analytics',
    facebook_instagram: 'Facebook & Instagram',
    google_ads: 'Google Ads',
    facebook: 'Facebook',
    instagram: 'Instagram',
  }

  const platformName = platformNames[connection.platform] || connection.platform

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <CardTitle>{platformName}</CardTitle>
              <CardDescription>Connected</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Connected</p>
            <p className="font-medium">
              {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
            </p>
          </div>

          {connection.last_synced_at && (
            <div>
              <p className="text-muted-foreground mb-1">Last Synced</p>
              <p className="font-medium">
                {formatDistanceToNow(new Date(connection.last_synced_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRefresh(connection.id)}
            disabled={refreshing}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync Now'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDisconnect(connection.id)}
            className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Unplug className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
