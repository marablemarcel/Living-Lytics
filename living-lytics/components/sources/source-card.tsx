import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ConnectionStatusBadge } from './connection-status-badge'
import { formatDistanceToNow } from 'date-fns'

interface SourceCardProps {
  name: string
  description: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onManage?: () => void
  comingSoon?: boolean
}

export function SourceCard({
  name,
  description,
  icon,
  status,
  lastSync,
  onConnect,
  onDisconnect,
  onManage,
  comingSoon = false,
}: SourceCardProps) {
  const isConnected = status === 'connected'

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return null
    try {
      const date = new Date(dateString)
      return `Last synced ${formatDistanceToNow(date, { addSuffix: true })}`
    } catch {
      return null
    }
  }

  return (
    <Card className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          {comingSoon ? (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 dark:bg-orange-950 dark:text-orange-400">
              Coming Soon
            </Badge>
          ) : (
            <ConnectionStatusBadge status={status} />
          )}
        </div>
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">
          {description}
        </CardDescription>
      </CardHeader>

      {isConnected && lastSync && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {formatLastSync(lastSync)}
          </p>
        </CardContent>
      )}

      <CardFooter className="flex gap-2">
        {comingSoon ? (
          <Button variant="outline" className="w-full" disabled>
            Coming Soon
          </Button>
        ) : isConnected ? (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={onManage}
            >
              Manage
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-destructive hover:text-destructive"
              onClick={onDisconnect}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            className="w-full"
            onClick={onConnect}
          >
            Connect
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
