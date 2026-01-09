import { CheckCircle, Circle, AlertCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
}

export function ConnectionStatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    connected: {
      icon: CheckCircle,
      text: 'Connected',
      className: 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-400 border-green-200 dark:border-green-800',
    },
    disconnected: {
      icon: Circle,
      text: 'Disconnected',
      className: 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    },
    error: {
      icon: AlertCircle,
      text: 'Error',
      className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400 border-red-200 dark:border-red-800',
    },
    syncing: {
      icon: Loader2,
      text: 'Syncing',
      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1', config.className)}>
      <Icon className={cn('h-3 w-3', status === 'syncing' && 'animate-spin')} />
      {config.text}
    </Badge>
  )
}
