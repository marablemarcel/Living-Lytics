import { Users, TrendingUp, DollarSign, Clock } from 'lucide-react'
import { MetricCard } from '@/components/ui/metric-card'

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Your marketing metrics at a glance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Visitors"
          value="24,583"
          change={12.5}
          trend="up"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Conversion Rate"
          value="3.2%"
          change={0.8}
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Revenue"
          value="$45,293"
          change={18.3}
          trend="up"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Avg. Session"
          value="4m 32s"
          change={5.2}
          trend="down"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        />
      </div>
    </div>
  )
}
