/**
 * ChartWrapper Component
 * A reusable wrapper for all chart components providing:
 * - Loading states
 * - Error handling
 * - Empty state display
 * - Responsive container
 * - Consistent styling
 */

import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface ChartWrapperProps {
  /** The chart component to render */
  children: ReactNode;
  /** Loading state - shows spinner when true */
  isLoading?: boolean;
  /** Error message to display */
  error?: string | null;
  /** Whether the data is empty */
  isEmpty?: boolean;
  /** Custom empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Height of the chart container */
  height?: number | string;
}

export function ChartWrapper({
  children,
  isLoading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'No data available',
  className = '',
  height = 300,
}: ChartWrapperProps) {
  // Error state
  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-red-800">Error loading chart</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 ${className}`}
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-500">Loading chart...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (isEmpty) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Chart content
  return (
    <div className={`rounded-lg ${className}`} style={{ height }}>
      {children}
    </div>
  );
}
