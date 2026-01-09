'use client'

import { useRef, useState } from 'react'
import { Activity, Instagram, ShoppingBag, Mail, Search, MessageCircle } from 'lucide-react'
import { SourceCard } from '@/components/sources/source-card'
import { EmptySourcesState } from '@/components/sources/empty-sources-state'

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

export default function SourcesPage() {
  const availableSourcesRef = useRef<HTMLDivElement>(null)

  // Track connected sources count
  const [platforms, setPlatforms] = useState<Platform[]>([
    // Available Now
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Track website traffic and user behavior',
      icon: <Activity className="h-6 w-6" />,
      status: 'disconnected',
    },
    {
      id: 'facebook-instagram',
      name: 'Facebook & Instagram',
      description: 'Social media engagement and ads',
      icon: <Instagram className="h-6 w-6" />,
      status: 'disconnected',
    },
    {
      id: 'google-ads',
      name: 'Google Ads',
      description: 'Advertising performance and ROI',
      icon: <Search className="h-6 w-6" />,
      status: 'disconnected',
    },
    // Coming Soon
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'E-commerce sales and products',
      icon: <ShoppingBag className="h-6 w-6" />,
      status: 'disconnected',
      comingSoon: true,
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing campaigns',
      icon: <Mail className="h-6 w-6" />,
      status: 'disconnected',
      comingSoon: true,
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Social media presence and engagement',
      icon: <MessageCircle className="h-6 w-6" />,
      status: 'disconnected',
      comingSoon: true,
    },
  ])

  const connectedCount = platforms.filter(p => p.status === 'connected').length
  const availablePlatforms = platforms.filter(p => !p.comingSoon)
  const comingSoonPlatforms = platforms.filter(p => p.comingSoon)

  const handleConnect = (platformId: string) => {
    console.log('Connecting to:', platformId)
    // Will implement OAuth flow in next steps
  }

  const handleDisconnect = (platformId: string) => {
    console.log('Disconnecting from:', platformId)
    // Will implement in next steps
  }

  const handleManage = (platformId: string) => {
    console.log('Managing:', platformId)
    // Will implement in next steps
  }

  const scrollToSources = () => {
    availableSourcesRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
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

      {/* Empty State - Show if no connections */}
      {connectedCount === 0 && (
        <EmptySourcesState onBrowseSources={scrollToSources} />
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
              onDisconnect={() => handleDisconnect(platform.id)}
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
