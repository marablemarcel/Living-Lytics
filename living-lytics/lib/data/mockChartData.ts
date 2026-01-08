// TypeScript types for chart data
export interface TrafficDataPoint {
  date: string;
  visitors: number;
  sessions: number;
}

export interface ConversionByChannelDataPoint {
  channel: string;
  conversions: number;
  revenue: number;
}

export interface RevenueOverTimeDataPoint {
  month: string;
  revenue: number;
  expenses: number;
}

// Helper function to get date N days ago
const getDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

// Generate random number between min and max
const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Traffic Over Time Data (last 30 days)
export const trafficOverTimeData: TrafficDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: getDaysAgo(29 - i),
  visitors: randomBetween(800, 1200),
  sessions: randomBetween(600, 1000),
}));

// Conversion By Channel Data
export const conversionByChannelData: ConversionByChannelDataPoint[] = [
  {
    channel: 'Organic',
    conversions: 3247,
    revenue: 64940,
  },
  {
    channel: 'Social',
    conversions: 1856,
    revenue: 37120,
  },
  {
    channel: 'Email',
    conversions: 2134,
    revenue: 53350,
  },
  {
    channel: 'Direct',
    conversions: 1492,
    revenue: 29840,
  },
  {
    channel: 'Paid',
    conversions: 2891,
    revenue: 72275,
  },
];

// Revenue Over Time Data (12 months with growing trend)
export const revenueOverTimeData: RevenueOverTimeDataPoint[] = [
  {
    month: 'Jan',
    revenue: 22500,
    expenses: 15200,
  },
  {
    month: 'Feb',
    revenue: 25800,
    expenses: 16100,
  },
  {
    month: 'Mar',
    revenue: 28200,
    expenses: 17300,
  },
  {
    month: 'Apr',
    revenue: 31500,
    expenses: 18500,
  },
  {
    month: 'May',
    revenue: 33900,
    expenses: 19200,
  },
  {
    month: 'Jun',
    revenue: 36400,
    expenses: 20100,
  },
  {
    month: 'Jul',
    revenue: 39200,
    expenses: 21400,
  },
  {
    month: 'Aug',
    revenue: 42100,
    expenses: 22800,
  },
  {
    month: 'Sep',
    revenue: 44800,
    expenses: 23900,
  },
  {
    month: 'Oct',
    revenue: 47300,
    expenses: 25100,
  },
  {
    month: 'Nov',
    revenue: 49600,
    expenses: 26200,
  },
  {
    month: 'Dec',
    revenue: 52400,
    expenses: 27500,
  },
];

// Engagement Metrics Data
export interface EngagementMetricDataPoint {
  metric: string;
  value: number;
}

export const engagementMetricsData: EngagementMetricDataPoint[] = [
  {
    metric: 'Pages/Session',
    value: 4.8,
  },
  {
    metric: 'Avg Duration',
    value: 272, // in seconds (4m 32s)
  },
  {
    metric: 'Bounce Rate',
    value: 42.3,
  },
  {
    metric: 'Return Rate',
    value: 38.7,
  },
];

// Conversion Funnel Data
export interface ConversionFunnelDataPoint {
  stage: string;
  users: number;
  percentage: number;
}

export const conversionFunnelData: ConversionFunnelDataPoint[] = [
  {
    stage: 'Page Views',
    users: 24583,
    percentage: 100,
  },
  {
    stage: 'Product Views',
    users: 12847,
    percentage: 52.3,
  },
  {
    stage: 'Add to Cart',
    users: 4892,
    percentage: 19.9,
  },
  {
    stage: 'Checkout',
    users: 2145,
    percentage: 8.7,
  },
  {
    stage: 'Purchase',
    users: 789,
    percentage: 3.2,
  },
];

// Top Channels by Traffic Data
export interface ChannelTrafficDataPoint {
  channel: string;
  visitors: number;
  sessions: number;
}

export const channelTrafficData: ChannelTrafficDataPoint[] = [
  {
    channel: 'Organic Search',
    visitors: 8945,
    sessions: 12384,
  },
  {
    channel: 'Direct',
    visitors: 6234,
    sessions: 8492,
  },
  {
    channel: 'Social Media',
    visitors: 4567,
    sessions: 6128,
  },
  {
    channel: 'Email',
    visitors: 2834,
    sessions: 3947,
  },
  {
    channel: 'Paid Ads',
    visitors: 2003,
    sessions: 2896,
  },
];
