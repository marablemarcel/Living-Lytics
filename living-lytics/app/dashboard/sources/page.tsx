'use client'

import { Database, Activity, Facebook, Instagram, ShoppingCart, CreditCard, Mail, Globe, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Platform interface
interface Platform {
  name: string
  description: string
  category: string
  icon: React.ReactNode
  comingSoon: boolean
}

export default function SourcesPage() {
  // Available platforms
  const platforms: Platform[] = [
    {
      name: 'Google Analytics',
      description: 'Track website traffic, user behavior, and conversions',
      category: 'Analytics',
      icon: <BarChart3 className="h-6 w-6" />,
      comingSoon: true,
    },
    {
      name: 'Facebook & Instagram',
      description: 'Monitor social media engagement, ads, and audience insights',
      category: 'Social Media',
      icon: <Facebook className="h-6 w-6" />,
      comingSoon: true,
    },
    {
      name: 'Google Ads',
      description: 'Track advertising performance, ROI, and campaign metrics',
      category: 'Advertising',
      icon: <Activity className="h-6 w-6" />,
      comingSoon: true,
    },
    {
      name: 'Shopify',
      description: 'Connect your e-commerce store for sales and inventory data',
      category: 'E-commerce',
      icon: <ShoppingCart className="h-6 w-6" />,
      comingSoon: true,
    },
    {
      name: 'Stripe',
      description: 'Sync payment data, revenue, and customer information',
      category: 'Payments',
      icon: <CreditCard className="h-6 w-6" />,
      comingSoon: true,
    },
    {
      name: 'Mailchimp',
      description: 'Track email campaigns, open rates, and subscriber growth',
      category: 'Email Marketing',
      icon: <Mail className="h-6 w-6" />,
      comingSoon: true,
    },
    {
      name: 'WordPress',
      description: 'Monitor blog performance, content analytics, and SEO metrics',
      category: 'CMS',
      icon: <Globe className="h-6 w-6" />,
      comingSoon: true,
    },
    {
      name: 'Mixpanel',
      description: 'Advanced product analytics and user behavior tracking',
      category: 'Analytics',
      icon: <Activity className="h-6 w-6" />,
      comingSoon: true,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Data Sources</h1>
        <p className="text-muted-foreground">
          Connect your marketing platforms to start tracking performance
        </p>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Data Integration Coming Soon
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Connect multiple data sources to get a unified view of your marketing performance.
                Integration capabilities will be available in Month 2 of development.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platforms Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Platforms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {platform.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {platform.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-sm">
                  {platform.description}
                </CardDescription>
                <Button
                  className="w-full"
                  disabled={platform.comingSoon}
                  variant="outline"
                >
                  {platform.comingSoon ? 'Coming Soon' : 'Connect'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Why Connect Data Sources?</CardTitle>
          <CardDescription>
            Unlock powerful insights by integrating your marketing platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <h3 className="font-semibold">Unified Dashboard</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                View all your metrics in one place, no more switching between platforms
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <h3 className="font-semibold">AI-Powered Insights</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get actionable recommendations based on data from all your sources
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <h3 className="font-semibold">Cross-Platform Analytics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Understand how different channels work together to drive results
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <h3 className="font-semibold">Automated Reporting</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Schedule reports and get alerts when important metrics change
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
