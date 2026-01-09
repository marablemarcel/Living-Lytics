# Recharts Infrastructure Setup

This document explains the chart infrastructure setup for Living Lytics.

## Overview

Recharts has been installed and configured with:
- Standardized color palette
- Reusable chart wrapper component
- Consistent configuration across all charts
- Loading, error, and empty states

## Files Created/Modified

### 1. Chart Color Constants
**File**: `lib/constants/chart-colors.ts`

Defines standardized colors and configuration:
```typescript
import { CHART_COLORS, CHART_COLOR_ARRAY, CHART_CONFIG } from '@/lib/constants/chart-colors'

// Available colors:
CHART_COLORS.primary    // #0ea5e9 (blue)
CHART_COLORS.secondary  // #10b981 (green)
CHART_COLORS.tertiary   // #f59e0b (orange)
CHART_COLORS.quaternary // #8b5cf6 (purple)
CHART_COLORS.neutral    // #64748b (gray)

// Configuration:
CHART_CONFIG.margin      // { top: 5, right: 30, left: 20, bottom: 5 }
CHART_CONFIG.strokeWidth // 2
CHART_CONFIG.dotRadius   // 4
```

### 2. ChartWrapper Component
**File**: `components/charts/chart-wrapper.tsx`

A reusable wrapper providing state management for charts:

```typescript
import { ChartWrapper } from '@/components/charts/chart-wrapper'

// Basic usage
<ChartWrapper height={300}>
  {/* Your chart component */}
</ChartWrapper>

// With loading state
<ChartWrapper isLoading={true} height={300}>
  {/* Chart won't show while loading */}
</ChartWrapper>

// With error state
<ChartWrapper error="Failed to load data" height={300}>
  {/* Shows error message */}
</ChartWrapper>

// With empty state
<ChartWrapper isEmpty={true} emptyMessage="No data available" height={300}>
  {/* Shows empty state message */}
</ChartWrapper>
```

**Props:**
- `children`: ReactNode - The chart component to render
- `isLoading`: boolean - Shows loading spinner
- `error`: string | null - Error message to display
- `isEmpty`: boolean - Whether data is empty
- `emptyMessage`: string - Custom empty state message
- `className`: string - Additional CSS classes
- `height`: number | string - Container height

### 3. Updated Chart Components

Both `line-chart.tsx` and `bar-chart.tsx` have been updated to use the new color constants and configuration.

## Usage Examples

### Using Chart Colors in a Custom Chart

```typescript
import { CHART_COLORS, CHART_CONFIG } from '@/lib/constants/chart-colors'
import { LineChart, Line } from 'recharts'

<LineChart margin={CHART_CONFIG.margin}>
  <Line
    stroke={CHART_COLORS.primary}
    strokeWidth={CHART_CONFIG.strokeWidth}
    dot={{ r: CHART_CONFIG.dotRadius }}
  />
</LineChart>
```

### Using ChartWrapper with Loading State

```typescript
'use client'

import { useState, useEffect } from 'react'
import { ChartWrapper } from '@/components/charts/chart-wrapper'
import { LineChart, Line } from 'recharts'

export function MyChart() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData().then(data => {
      setData(data)
      setIsLoading(false)
    })
  }, [])

  return (
    <ChartWrapper
      isLoading={isLoading}
      isEmpty={data.length === 0}
      height={300}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          {/* Chart configuration */}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}
```

## Testing

A test demo component is available at `components/charts/test-chart-demo.tsx` that shows:
- Normal chart with data
- Loading state
- Empty state
- Error state

Import and render it in any page to verify the setup:
```typescript
import { TestChartDemo } from '@/components/charts/test-chart-demo'

<TestChartDemo />
```

## Production-Ready LineChart Component

### Overview
**File**: `components/charts/line-chart.tsx`

A fully-featured, production-ready line chart component for displaying time-series data with multiple lines.

### Features
- ✅ Multiple lines on one chart
- ✅ Beautiful custom tooltips
- ✅ Date formatting (MMM DD format)
- ✅ Number formatting (K/M abbreviations)
- ✅ Fully responsive
- ✅ Smooth animations (300ms)
- ✅ Loading and empty states
- ✅ Interactive legend (clickable to hide/show lines)
- ✅ Hover effects with active dots
- ✅ TypeScript with proper types

### Basic Usage

```typescript
import LineChart from '@/components/charts/line-chart'

<LineChart
  data={[
    { date: '2024-01-01', pageViews: 1200, sessions: 800 },
    { date: '2024-01-02', pageViews: 1400, sessions: 950 },
    { date: '2024-01-03', pageViews: 1100, sessions: 750 },
  ]}
  lines={[
    { key: 'pageViews', name: 'Page Views', color: '#0ea5e9' },
    { key: 'sessions', name: 'Sessions', color: '#10b981' },
  ]}
  height={350}
/>
```

### Props

**LineChartProps:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `LineChartData[]` | required | Array of data points with date and numeric values |
| `lines` | `LineConfig[]` | required | Array defining which data keys to plot |
| `height` | `number` | `300` | Chart height in pixels |
| `showLegend` | `boolean` | `true` | Show/hide legend |
| `showGrid` | `boolean` | `true` | Show/hide grid lines |
| `loading` | `boolean` | `false` | Show loading state |

**LineConfig:**
```typescript
{
  key: string        // Data key to plot (e.g., 'pageViews')
  name: string       // Display name in legend (e.g., 'Page Views')
  color: string      // Line color (hex code)
}
```

**LineChartData:**
```typescript
{
  date: string       // ISO date string (e.g., '2024-01-01')
  [key: string]: string | number  // Additional data fields
}
```

### Advanced Examples

#### Single Line Chart (No Legend)
```typescript
<LineChart
  data={analyticsData}
  lines={[
    { key: 'pageViews', name: 'Page Views', color: '#0ea5e9' },
  ]}
  height={300}
  showLegend={false}
/>
```

#### Multi-Line with Chart Colors
```typescript
import { CHART_COLORS } from '@/lib/constants/chart-colors'

<LineChart
  data={metricsData}
  lines={[
    { key: 'pageViews', name: 'Page Views', color: CHART_COLORS.primary },
    { key: 'sessions', name: 'Sessions', color: CHART_COLORS.secondary },
    { key: 'users', name: 'Users', color: CHART_COLORS.tertiary },
  ]}
  height={400}
/>
```

#### With Loading State
```typescript
const [isLoading, setIsLoading] = useState(true)
const [data, setData] = useState([])

<LineChart
  data={data}
  lines={[
    { key: 'revenue', name: 'Revenue', color: CHART_COLORS.secondary },
  ]}
  loading={isLoading}
  height={350}
/>
```

#### Without Grid Lines
```typescript
<LineChart
  data={data}
  lines={lines}
  showGrid={false}
  height={300}
/>
```

### Number Formatting

The component automatically formats large numbers:
- < 1,000: `342`
- ≥ 1,000: `1.2K`
- ≥ 1,000,000: `1.5M`

### Date Formatting

Dates are formatted as:
- **X-Axis**: `MMM DD` (e.g., "Jan 15")
- **Tooltip**: `MMM dd, yyyy` (e.g., "Jan 15, 2024")

### States

**Loading:**
```typescript
<LineChart data={[]} lines={[]} loading={true} />
```

**Empty:**
```typescript
<LineChart data={[]} lines={lines} />
// Shows "No data available" message
```

**Normal:**
```typescript
<LineChart data={data} lines={lines} />
// Renders the chart
```

### Interactive Features

1. **Hover Effects**: Dots appear on lines when hovering
2. **Tooltips**: Custom-designed tooltips with formatted values
3. **Clickable Legend**: Click legend items to hide/show lines
4. **Smooth Animations**: 300ms animation duration
5. **Responsive**: Adapts to container width

### Styling

The component uses:
- Tailwind CSS for styling
- HSL CSS variables for theming
- Rounded tooltips with shadow
- Clean, professional design

## Next Steps

You can now:
1. Use the standardized colors in all new charts
2. Wrap charts with ChartWrapper for consistent states
3. Import CHART_CONFIG for consistent spacing
4. Build custom charts using the Recharts library
5. **Use the production-ready LineChart component for time-series data**

## Resources

- [Recharts Documentation](https://recharts.org/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [date-fns Documentation](https://date-fns.org/)
