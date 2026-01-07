import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/components/ui/metric-card"
import { TrendingUp } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Living Lytics</h1>
          <p className="mt-2 text-lg text-gray-600">
            AI-Powered Marketing Intelligence Platform
          </p>
        </div>

        {/* Component Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Design System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Buttons */}
            <div className="flex gap-2">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Danger</Button>
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Page Views"
            value="12,453"
            change={24.5}
            trend="up"
            icon={<TrendingUp className="h-4 w-4 text-gray-600" />}
          />
          <MetricCard
            title="Sessions"
            value="8,234"
            change={12.3}
            trend="up"
          />
          <MetricCard
            title="Bounce Rate"
            value="45.2%"
            change={-3.2}
            trend="down"
          />
        </div>
      </div>
    </main>
  )
}