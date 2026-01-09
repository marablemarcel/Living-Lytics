/**
 * Chart color constants for data visualization
 * Used across all charts in the application for consistent theming
 */

// Color palette for charts
export const CHART_COLORS = {
  primary: '#0ea5e9',    // Blue - for main data series
  secondary: '#10b981',  // Green - for positive metrics
  tertiary: '#f59e0b',   // Orange - for warning/attention metrics
  quaternary: '#8b5cf6', // Purple - for additional data series
  neutral: '#64748b',    // Gray - for neutral/background elements
} as const;

// Array of colors for multi-series charts
export const CHART_COLOR_ARRAY = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
] as const;

/**
 * Default configuration for Recharts components
 * Provides consistent spacing and styling across all charts
 */
export const CHART_CONFIG = {
  // Margin around the chart area
  margin: {
    top: 5,
    right: 30,
    left: 20,
    bottom: 5,
  },
  // Line/stroke styling
  strokeWidth: 2,
  // Dot/point styling
  dotRadius: 4,
} as const;

// Type exports for TypeScript support
export type ChartColor = typeof CHART_COLORS[keyof typeof CHART_COLORS];
