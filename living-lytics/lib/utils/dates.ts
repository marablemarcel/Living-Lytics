import { subDays, subMonths, format, startOfDay, endOfDay } from 'date-fns'

export interface DateRange {
  start: Date
  end: Date
}

/**
 * Get date range for the last 7 days
 */
export function getLast7Days(): DateRange {
  const end = endOfDay(new Date())
  const start = startOfDay(subDays(end, 6))
  return { start, end }
}

/**
 * Get date range for the last 30 days
 */
export function getLast30Days(): DateRange {
  const end = endOfDay(new Date())
  const start = startOfDay(subDays(end, 29))
  return { start, end }
}

/**
 * Get date range for the last 90 days
 */
export function getLast90Days(): DateRange {
  const end = endOfDay(new Date())
  const start = startOfDay(subDays(end, 89))
  return { start, end }
}

/**
 * Get date range for the last year (12 months)
 */
export function getLastYear(): DateRange {
  const end = endOfDay(new Date())
  const start = startOfDay(subMonths(end, 12))
  return { start, end }
}

/**
 * Format a date range as a readable string
 * @example "Jan 1 - Jan 7, 2026"
 */
export function formatDateRange(start: Date, end: Date): string {
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()

  if (startYear === endYear) {
    const startMonth = start.getMonth()
    const endMonth = end.getMonth()

    if (startMonth === endMonth) {
      // Same month and year: "Jan 1 - 7, 2026"
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    } else {
      // Different months, same year: "Jan 1 - Feb 7, 2026"
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
    }
  } else {
    // Different years: "Dec 1, 2025 - Jan 7, 2026"
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`
  }
}
