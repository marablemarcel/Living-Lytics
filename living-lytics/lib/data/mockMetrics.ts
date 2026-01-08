// Type definitions for metric data
export type MetricTrend = 'up' | 'down' | 'neutral'

export interface MetricData {
  id: string
  name: string
  value: number | string
  change: number
  trend: MetricTrend
  period: string
  icon?: string
}

export interface MetricCategory {
  category: string
  displayName: string
  metrics: MetricData[]
}

// Traffic Metrics
const trafficMetrics: MetricData[] = [
  {
    id: 'total-visitors',
    name: 'Total Visitors',
    value: '24,583',
    change: 12.5,
    trend: 'up',
    period: 'vs last month',
    icon: 'Users',
  },
  {
    id: 'total-sessions',
    name: 'Total Sessions',
    value: '32,847',
    change: 8.3,
    trend: 'up',
    period: 'vs last month',
    icon: 'Activity',
  },
  {
    id: 'page-views',
    name: 'Page Views',
    value: '156,293',
    change: 15.7,
    trend: 'up',
    period: 'vs last month',
    icon: 'Eye',
  },
  {
    id: 'bounce-rate',
    name: 'Bounce Rate',
    value: '42.3%',
    change: 3.2,
    trend: 'down',
    period: 'vs last month',
    icon: 'TrendingDown',
  },
]

// Conversion Metrics
const conversionMetrics: MetricData[] = [
  {
    id: 'conversion-rate',
    name: 'Conversion Rate',
    value: '3.2%',
    change: 0.8,
    trend: 'up',
    period: 'vs last month',
    icon: 'TrendingUp',
  },
  {
    id: 'total-leads',
    name: 'Total Leads',
    value: '1,247',
    change: 18.5,
    trend: 'up',
    period: 'vs last month',
    icon: 'UserPlus',
  },
  {
    id: 'new-customers',
    name: 'New Customers',
    value: '789',
    change: 14.2,
    trend: 'up',
    period: 'vs last month',
    icon: 'Users',
  },
  {
    id: 'lead-to-customer',
    name: 'Lead to Customer Rate',
    value: '63.3%',
    change: 2.1,
    trend: 'up',
    period: 'vs last month',
    icon: 'Target',
  },
]

// Revenue Metrics
const revenueMetrics: MetricData[] = [
  {
    id: 'total-revenue',
    name: 'Total Revenue',
    value: '$45,293',
    change: 18.3,
    trend: 'up',
    period: 'vs last month',
    icon: 'DollarSign',
  },
  {
    id: 'average-order-value',
    name: 'Average Order Value',
    value: '$57.42',
    change: 5.7,
    trend: 'up',
    period: 'vs last month',
    icon: 'ShoppingCart',
  },
  {
    id: 'customer-lifetime-value',
    name: 'Customer Lifetime Value',
    value: '$324.18',
    change: 12.4,
    trend: 'up',
    period: 'vs last quarter',
    icon: 'TrendingUp',
  },
  {
    id: 'revenue-per-visitor',
    name: 'Revenue Per Visitor',
    value: '$1.84',
    change: 4.9,
    trend: 'up',
    period: 'vs last month',
    icon: 'DollarSign',
  },
]

// Engagement Metrics
const engagementMetrics: MetricData[] = [
  {
    id: 'avg-session-duration',
    name: 'Avg. Session Duration',
    value: '4m 32s',
    change: 5.2,
    trend: 'down',
    period: 'vs last month',
    icon: 'Clock',
  },
  {
    id: 'pages-per-session',
    name: 'Pages Per Session',
    value: '4.8',
    change: 2.3,
    trend: 'up',
    period: 'vs last month',
    icon: 'FileText',
  },
  {
    id: 'return-visitor-rate',
    name: 'Return Visitor Rate',
    value: '38.7%',
    change: 6.8,
    trend: 'up',
    period: 'vs last month',
    icon: 'RotateCcw',
  },
  {
    id: 'social-engagement',
    name: 'Social Engagement',
    value: '2,847',
    change: 22.4,
    trend: 'up',
    period: 'vs last month',
    icon: 'Share2',
  },
]

// All categories
const metricCategories: MetricCategory[] = [
  {
    category: 'traffic',
    displayName: 'Traffic Metrics',
    metrics: trafficMetrics,
  },
  {
    category: 'conversion',
    displayName: 'Conversion Metrics',
    metrics: conversionMetrics,
  },
  {
    category: 'revenue',
    displayName: 'Revenue Metrics',
    metrics: revenueMetrics,
  },
  {
    category: 'engagement',
    displayName: 'Engagement Metrics',
    metrics: engagementMetrics,
  },
]

// Helper function to get metrics by category
export function getMetricsByCategory(category: string): MetricData[] {
  const categoryData = metricCategories.find((cat) => cat.category === category)
  return categoryData?.metrics || []
}

// Helper function to get all categories
export function getAllCategories(): MetricCategory[] {
  return metricCategories
}

// Helper function to get a specific metric by ID
export function getMetricById(id: string): MetricData | undefined {
  for (const category of metricCategories) {
    const metric = category.metrics.find((m) => m.id === id)
    if (metric) return metric
  }
  return undefined
}

// Export all metric arrays for direct access
export { trafficMetrics, conversionMetrics, revenueMetrics, engagementMetrics }

// Export overview metrics (the main 4 shown on dashboard)
export const overviewMetrics: MetricData[] = [
  trafficMetrics[0], // Total Visitors
  conversionMetrics[0], // Conversion Rate
  revenueMetrics[0], // Total Revenue
  engagementMetrics[0], // Avg. Session Duration
]
