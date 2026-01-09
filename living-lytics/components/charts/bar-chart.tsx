'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS, CHART_COLOR_ARRAY, CHART_CONFIG } from '@/lib/constants/chart-colors'

interface BarChartProps {
  data: any[]
  title: string
  dataKeys: string[]
  xAxisKey?: string
  colors?: string[]
  height?: number
  showLegend?: boolean
}

// Default color palette using standardized chart colors
const defaultColors = [
  ...CHART_COLOR_ARRAY,
  '#EF4444', // red-500 - for additional series
  '#06B6D4', // cyan-500 - for additional series
]

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">{entry.name}:</span>
            <span className="text-sm font-semibold text-foreground">
              {typeof entry.value === 'number'
                ? entry.value.toLocaleString()
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function BarChart({
  data,
  title,
  dataKeys,
  xAxisKey = 'category',
  colors = defaultColors,
  height = 300,
  showLegend = true,
}: BarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            margin={CHART_CONFIG.margin}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey={xAxisKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                // Format large numbers with K, M suffixes
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`
                }
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}K`
                }
                return value.toLocaleString()
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                }}
                iconType="rect"
                iconSize={16}
              />
            )}
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
