'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Activity, Instagram, ShoppingBag, Mail, Search, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { SourceCard } from '@/components/sources/source-card'
import { EmptySourcesState } from '@/components/sources/empty-sources-state'
import { ConnectionDetail } from '@/components/sources/connection-detail'
import {
  getUserDataSources,
  disconnectDataSource,
  mapPlatformName,
  type DataSource,
} from '@/lib/api/connections'

// Platform interface
interface Platform {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  lastSync?: string
  comingSoon?: boolean
}

// OAuth error messages
const ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Access was denied. Please try connecting again.',
  invalid_state: 'Invalid request. Please try again.',
  oauth_error: 'An error occurred during authentication.',
  configuration_error: 'OAuth is not configured. Please contact support.',
  token_exchange_failed: 'Failed to complete authentication. Please try again.',
  connection_failed: 'Failed to save connection. Please try again.',
}

// OAuth success messages
const SUCCESS_MESSAGES: Record<string, string> = {
  google_connected: 'Google Analytics connected successfully!',
  facebook_connected: 'Facebook & Instagram connected successfully!',
  google_ads_connected: 'Google Ads connected successfully!',
}

// Initial platform definitions (without connection status)
const PLATFORM_DEFINITIONS = [
  // Available Now
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website traffic and user behavior',
    comingSoon: false,
  },
  {
    id: 'facebook-instagram',
    name: 'Facebook & Instagram',
    description: 'Social media engagement and ads',
    comingSoon: false,
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    description: 'Advertising performance and ROI',
    comingSoon: false,
  },
  // Coming Soon
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce sales and products',
    comingSoon: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing campaigns',
    comingSoon: true,
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Social media presence and engagement',
    comingSoon: true,
  },
]

// Icon mapping for platforms
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  'google-analytics': <Activity className="h-6 w-6" />,
  'facebook-instagram': <Instagram className="h-6 w-6" />,
  'google-ads': <Search className="h-6 w-6" />,
  shopify: <ShoppingBag className="h-6 w-6" />,
  mailchimp: <Mail className="h-6 w-6" />,
  twitter: <MessageCircle className="h-6 w-6" />,
}

export default function SourcesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const availableSourcesRef = useRef<HTMLDivElement>(null)

  // Store real connections from database
  const [connections, setConnections] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState<string | null>(null)

  // Track connected sources count with computed platforms
  const [platforms, setPlatforms] = useState<Platform[]>(
    PLATFORM_DEFINITIONS.map((def) => ({
      ...def,
      icon: PLATFORM_ICONS[def.id],
      status: 'disconnected' as const,
    }))
  )

  // Load connections from database
  const loadConnections = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getUserDataSources()
      setConnections(data)

      // Update platforms with real connection status
      setPlatforms((prev) =>
        prev.map((platform) => {
          const connection = data.find(
            (conn) => mapPlatformName(conn.platform) === platform.id
          )
          if (connection && connection.connection_status === 'connected') {
            return {
              ...platform,
              status: 'connected' as const,
              lastSync: connection.last_synced_at || undefined,
            }
          }
          return {
            ...platform,
            status: 'disconnected' as const,
            lastSync: undefined,
          }
        })
      )
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load connections')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load connections on mount
  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  // Handle OAuth callback messages
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success) {
      const message = SUCCESS_MESSAGES[success] || 'Connection successful!'
      toast.success(message)

      // Reload connections to get updated status from database
      loadConnections()

      // Clear URL parameters
      router.replace('/dashboard/sources', { scroll: false })
    }

    if (error) {
      const message = ERROR_MESSAGES[error] || 'An unexpected error occurred.'
      toast.error(message)

      // Clear URL parameters
      router.replace('/dashboard/sources', { scroll: false })
    }
  }, [searchParams, router, loadConnections])

  const connectedCount = platforms.filter((p) => p.status === 'connected').length
  const availablePlatforms = platforms.filter((p) => !p.comingSoon)
  const comingSoonPlatforms = platforms.filter((p) => p.comingSoon)

  const handleConnect = (platformId: string) => {
    // Set syncing state for visual feedback
    setPlatforms((prev) =>
      prev.map((p) => (p.id === platformId ? { ...p, status: 'syncing' } : p))
    )

    // Route to appropriate OAuth flow
    switch (platformId) {
      case 'google-analytics':
        window.location.href = '/api/oauth/google'
        break
      case 'facebook-instagram':
        // Facebook OAuth - coming in future implementation
        toast.info('Facebook & Instagram connection coming soon!')
        setPlatforms((prev) =>
          prev.map((p) => (p.id === platformId ? { ...p, status: 'disconnected' } : p))
        )
        break
      case 'google-ads':
        // Google Ads OAuth - coming in future implementation
        toast.info('Google Ads connection coming soon!')
        setPlatforms((prev) =>
          prev.map((p) => (p.id === platformId ? { ...p, status: 'disconnected' } : p))
        )
        break
      default:
        toast.info(`${platformId} connection coming soon!`)
        setPlatforms((prev) =>
          prev.map((p) => (p.id === platformId ? { ...p, status: 'disconnected' } : p))
        )
    }
  }

  const handleDisconnect = async (sourceId: string, platformName: string) => {
    const platformId = mapPlatformName(platformName)
    const connection = connections.find((conn) => conn.id === sourceId)

    if (!connection) {
      toast.error('Connection not found')
      return
    }

    // Confirm disconnect
    if (
      !confirm(
        `Are you sure you want to disconnect ${platforms.find((p) => p.id === platformId)?.name}?`
      )
    ) {
      return
    }

    // Set syncing state during disconnect
    setPlatforms((prev) =>
      prev.map((p) => (p.id === platformId ? { ...p, status: 'syncing' } : p))
    )

    try {
      await disconnectDataSource(connection.id)

      // Reload connections to reflect changes
      await loadConnections()
      toast.success('Platform disconnected successfully')
    } catch (error) {
      console.error('Error disconnecting:', error)
      setPlatforms((prev) =>
        prev.map((p) => (p.id === platformId ? { ...p, status: 'connected' } : p))
      )
      toast.error('Failed to disconnect platform')
    }
  }

  const handleSync = async (sourceId: string) => {
    setRefreshing(sourceId)

    try {
      const response = await fetch(`/api/sources/${sourceId}/sync`, {
        method: 'POST',
      })

      const body = await response.json().catch(() => null) as { error?: string; message?: string } | null

      if (!response.ok) {
        console.error('Sync failed:', response.status, body)
        toast.error(body?.error ?? 'Failed to sync data')
        return
      }

      toast.success(body?.message ?? 'Data synced successfully')
      await loadConnections()
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Failed to sync data')
    } finally {
      setRefreshing(null)
    }
  }

  const handleManage = (_platformId: string) => {
    // TODO: Implement settings modal or page
    toast.info('Platform settings coming soon!')
  }

  const scrollToSources = () => {
    availableSourcesRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Data Sources</h1>
        <p className="text-muted-foreground">
          Connect your marketing platforms to start tracking metrics
        </p>
      </div>

      {/* Empty State - Show if no connections and not loading */}
      {!loading && connectedCount === 0 && <EmptySourcesState onBrowseSources={scrollToSources} />}

      {/* Connected Sources */}
      {connections.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Connected Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((connection) => (
              <ConnectionDetail
                key={connection.id}
                connection={connection}
                onRefresh={handleSync}
                onDisconnect={(id) => handleDisconnect(id, connection.platform)}
                refreshing={refreshing === connection.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available Now Section */}
      <div ref={availableSourcesRef}>
        <h2 className="text-xl font-semibold mb-4">Available Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlatforms.map((platform) => (
            <SourceCard
              key={platform.id}
              name={platform.name}
              description={platform.description}
              icon={platform.icon}
              status={platform.status}
              lastSync={platform.lastSync}
              onConnect={() => handleConnect(platform.id)}
              onDisconnect={() => {
                const connection = connections.find(
                  (conn) => mapPlatformName(conn.platform) === platform.id
                )

                if (!connection) {
                  toast.error('Connection not found')
                  return
                }

                handleDisconnect(connection.id, connection.platform)
              }}
              onManage={() => handleManage(platform.id)}
            />
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comingSoonPlatforms.map((platform) => (
            <SourceCard
              key={platform.id}
              name={platform.name}
              description={platform.description}
              icon={platform.icon}
              status={platform.status}
              comingSoon={platform.comingSoon}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
