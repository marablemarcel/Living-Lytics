import { format, addDays, startOfDay } from 'date-fns';

// ==========================================
// ENHANCED MOCK DATA GENERATOR
// ==========================================

export interface MetricDataPoint {
  date: string;
  pageViews: number;
  sessions: number;
  users: number;
  bounceRate: number;
  engagementRate: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

export interface InsightData {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'traffic' | 'engagement' | 'conversion' | 'revenue';
  date: string;
  impact: string;
}

export interface TrafficSourceData {
  source: string;
  visitors: number;
  sessions: number;
  bounceRate: number;
}

export interface DeviceData {
  device: string;
  visitors: number;
  percentage: number;
}

export interface TopPageData {
  page: string;
  pageViews: number;
  avgDuration: number;
  bounceRate: number;
}

/**
 * Generate enhanced mock metrics with realistic patterns
 * - Weekly patterns (higher traffic on weekdays)
 * - Growth trends over time
 * - Controlled variance
 */
export function generateMockMetrics(startDate: Date, endDate: Date): MetricDataPoint[] {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const data: MetricDataPoint[] = [];

  for (let i = 0; i <= days; i++) {
    const currentDate = addDays(startOfDay(startDate), i);

    // Get day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = currentDate.getDay();

    // Weekday multiplier (higher traffic on weekdays, lower on weekends)
    const weekdayMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1.0;

    // Growth trend (slight increase over time - 20% growth over the period)
    const growthMultiplier = 1 + (i / days) * 0.2;

    // Base values
    const basePageViews = 1500;
    const baseSessions = 900;
    const baseUsers = 500;

    // Add randomness (±20%)
    const randomness = 0.8 + Math.random() * 0.4;

    // Calculate final values with patterns
    const pageViews = Math.floor(basePageViews * weekdayMultiplier * growthMultiplier * randomness);
    const sessions = Math.floor(baseSessions * weekdayMultiplier * growthMultiplier * randomness);
    const users = Math.floor(baseUsers * weekdayMultiplier * growthMultiplier * randomness);

    data.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      pageViews,
      sessions,
      users,
      bounceRate: 40 + Math.random() * 20, // 40-60%
      engagementRate: 5 + Math.random() * 10, // 5-15%
    });
  }

  return data;
}

/**
 * Generate mock revenue data with realistic patterns
 * Revenue correlates with traffic patterns
 */
export function generateMockRevenue(startDate: Date, endDate: Date): RevenueDataPoint[] {
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const data: RevenueDataPoint[] = [];

  for (let i = 0; i <= days; i++) {
    const currentDate = addDays(startOfDay(startDate), i);

    // Get day of week
    const dayOfWeek = currentDate.getDay();

    // Weekend multiplier (slightly lower revenue on weekends)
    const weekdayMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.75 : 1.0;

    // Growth trend
    const growthMultiplier = 1 + (i / days) * 0.25; // 25% growth

    // Base values
    const baseRevenue = 1200;
    const baseOrders = 25;

    // Randomness
    const randomness = 0.85 + Math.random() * 0.3;

    // Calculate values
    const orders = Math.floor(baseOrders * weekdayMultiplier * growthMultiplier * randomness);
    const revenue = Math.floor(baseRevenue * weekdayMultiplier * growthMultiplier * randomness);
    const avgOrderValue = revenue / orders;

    data.push({
      date: format(currentDate, 'yyyy-MM-dd'),
      revenue,
      orders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    });
  }

  return data;
}

/**
 * Generate mock AI insights
 */
export function generateMockInsights(): InsightData[] {
  return [
    {
      id: '1',
      title: 'Traffic Peak on Tuesdays',
      description: 'Your website receives 34% more traffic on Tuesdays compared to other weekdays. Consider scheduling product launches, promotions, or important announcements on this day to maximize visibility.',
      priority: 'high',
      category: 'traffic',
      date: new Date().toISOString(),
      impact: '+34% potential reach',
    },
    {
      id: '2',
      title: 'Bounce Rate Improving',
      description: 'Your bounce rate decreased by 12% this week, indicating better content engagement and user experience. The recent homepage redesign appears to be working well.',
      priority: 'medium',
      category: 'engagement',
      date: new Date().toISOString(),
      impact: '12% improvement',
    },
    {
      id: '3',
      title: 'Mobile Traffic Growing',
      description: 'Mobile visitors increased 28% compared to last period and now represent 65% of total traffic. Ensure mobile optimization is a priority, especially for checkout and form completion.',
      priority: 'high',
      category: 'traffic',
      date: new Date().toISOString(),
      impact: '28% growth in mobile',
    },
    {
      id: '4',
      title: 'High-Value Pages Identified',
      description: 'Users who visit the "/pricing" page are 3.2x more likely to convert. Consider driving more traffic to this page through internal linking and CTAs.',
      priority: 'high',
      category: 'conversion',
      date: new Date().toISOString(),
      impact: '3.2x conversion rate',
    },
    {
      id: '5',
      title: 'Email Campaign Performance',
      description: 'Your recent email campaign generated 45% more sessions than average. The subject line testing approach is showing positive results.',
      priority: 'medium',
      category: 'traffic',
      date: new Date().toISOString(),
      impact: '45% increase',
    },
    {
      id: '6',
      title: 'Checkout Abandonment Opportunity',
      description: 'Cart abandonment rate is 68%, which is above industry average. Implementing exit-intent popups or abandoned cart emails could recover 15-20% of lost revenue.',
      priority: 'high',
      category: 'revenue',
      date: new Date().toISOString(),
      impact: 'Potential $4.5K recovery',
    },
    {
      id: '7',
      title: 'Social Media ROI Strong',
      description: 'Social media traffic has the lowest cost per acquisition at $12.50, compared to $28 average across all channels. Consider increasing social media budget allocation.',
      priority: 'medium',
      category: 'revenue',
      date: new Date().toISOString(),
      impact: '55% lower CPA',
    },
  ];
}

/**
 * Generate mock traffic source data
 */
export function generateTrafficSources(): TrafficSourceData[] {
  return [
    { source: 'Organic Search', visitors: 12847, sessions: 18392, bounceRate: 38.5 },
    { source: 'Direct', visitors: 8234, sessions: 11892, bounceRate: 42.1 },
    { source: 'Social Media', visitors: 6891, sessions: 9234, bounceRate: 51.3 },
    { source: 'Paid Search', visitors: 4532, sessions: 6789, bounceRate: 45.8 },
    { source: 'Email', visitors: 3245, sessions: 5123, bounceRate: 32.4 },
    { source: 'Referral', visitors: 2134, sessions: 3456, bounceRate: 47.2 },
  ];
}

/**
 * Generate mock device breakdown data
 */
export function generateDeviceData(): DeviceData[] {
  return [
    { device: 'Mobile', visitors: 24893, percentage: 65 },
    { device: 'Desktop', visitors: 10139, percentage: 27 },
    { device: 'Tablet', visitors: 3068, percentage: 8 },
  ];
}

/**
 * Generate mock top pages data
 */
export function generateTopPages(): TopPageData[] {
  return [
    { page: '/home', pageViews: 45293, avgDuration: 142, bounceRate: 35.2 },
    { page: '/products', pageViews: 32847, avgDuration: 215, bounceRate: 28.7 },
    { page: '/pricing', pageViews: 18234, avgDuration: 185, bounceRate: 31.5 },
    { page: '/about', pageViews: 12456, avgDuration: 95, bounceRate: 52.3 },
    { page: '/blog', pageViews: 9834, avgDuration: 245, bounceRate: 42.8 },
    { page: '/contact', pageViews: 6723, avgDuration: 68, bounceRate: 38.9 },
  ];
}
