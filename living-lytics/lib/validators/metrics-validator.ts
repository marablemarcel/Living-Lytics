/**
 * Metrics Validator
 * 
 * Validates metric records before database insertion to ensure:
 * - Required fields are present
 * - Data types are correct
 * - Date formats are valid
 * - Numeric values are within acceptable ranges
 */

import { MetricRecord } from '@/lib/transformers/ga-transformer'

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string
  message: string
  value?: any
}

/**
 * Valid metric types
 */
const VALID_METRIC_TYPES = [
  'page_views',
  'sessions',
  'users',
  'bounce_rate',
  'avg_session_duration',
  'pages_per_session',
  'engagement_rate',
] as const

/**
 * Validate a single metric record
 */
export function validateMetricRecord(record: MetricRecord): ValidationResult {
  const errors: ValidationError[] = []

  // Validate user_id
  if (!record.user_id || typeof record.user_id !== 'string') {
    errors.push({
      field: 'user_id',
      message: 'user_id is required and must be a string',
      value: record.user_id,
    })
  }

  // Validate source_id
  if (!record.source_id || typeof record.source_id !== 'string') {
    errors.push({
      field: 'source_id',
      message: 'source_id is required and must be a string',
      value: record.source_id,
    })
  }

  // Validate metric_type
  if (!record.metric_type || typeof record.metric_type !== 'string') {
    errors.push({
      field: 'metric_type',
      message: 'metric_type is required and must be a string',
      value: record.metric_type,
    })
  } else if (!VALID_METRIC_TYPES.includes(record.metric_type as any)) {
    errors.push({
      field: 'metric_type',
      message: `metric_type must be one of: ${VALID_METRIC_TYPES.join(', ')}`,
      value: record.metric_type,
    })
  }

  // Validate metric_value
  if (record.metric_value === null || record.metric_value === undefined) {
    errors.push({
      field: 'metric_value',
      message: 'metric_value is required',
      value: record.metric_value,
    })
  } else if (typeof record.metric_value !== 'number') {
    errors.push({
      field: 'metric_value',
      message: 'metric_value must be a number',
      value: record.metric_value,
    })
  } else if (isNaN(record.metric_value) || !isFinite(record.metric_value)) {
    errors.push({
      field: 'metric_value',
      message: 'metric_value must be a valid finite number',
      value: record.metric_value,
    })
  } else if (record.metric_value < 0) {
    errors.push({
      field: 'metric_value',
      message: 'metric_value must be non-negative',
      value: record.metric_value,
    })
  }

  // Validate specific metric ranges
  if (record.metric_type === 'bounce_rate' && record.metric_value > 100) {
    errors.push({
      field: 'metric_value',
      message: 'bounce_rate must be between 0 and 100',
      value: record.metric_value,
    })
  }

  if (record.metric_type === 'engagement_rate' && record.metric_value > 100) {
    errors.push({
      field: 'metric_value',
      message: 'engagement_rate must be between 0 and 100',
      value: record.metric_value,
    })
  }

  // Validate date
  if (!record.date || typeof record.date !== 'string') {
    errors.push({
      field: 'date',
      message: 'date is required and must be a string',
      value: record.date,
    })
  } else if (!isValidDateFormat(record.date)) {
    errors.push({
      field: 'date',
      message: 'date must be in YYYY-MM-DD format',
      value: record.date,
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validate multiple metric records
 */
export function validateMetricRecords(records: MetricRecord[]): {
  isValid: boolean
  validRecords: MetricRecord[]
  invalidRecords: Array<{ record: MetricRecord; errors: ValidationError[] }>
  summary: {
    total: number
    valid: number
    invalid: number
  }
} {
  const validRecords: MetricRecord[] = []
  const invalidRecords: Array<{ record: MetricRecord; errors: ValidationError[] }> = []

  for (const record of records) {
    const result = validateMetricRecord(record)
    if (result.isValid) {
      validRecords.push(record)
    } else {
      invalidRecords.push({ record, errors: result.errors })
    }
  }

  return {
    isValid: invalidRecords.length === 0,
    validRecords,
    invalidRecords,
    summary: {
      total: records.length,
      valid: validRecords.length,
      invalid: invalidRecords.length,
    },
  }
}

/**
 * Check if date is in YYYY-MM-DD format
 */
export function isValidDateFormat(date: string): boolean {
  // Check format with regex
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false
  }

  // Parse and validate the date
  const [year, month, day] = date.split('-').map(Number)
  
  // Check year range (reasonable range for analytics data)
  if (year < 2000 || year > 2100) {
    return false
  }

  // Check month range
  if (month < 1 || month > 12) {
    return false
  }

  // Check day range
  if (day < 1 || day > 31) {
    return false
  }

  // Validate the date is actually valid (e.g., not Feb 30)
  const dateObj = new Date(year, month - 1, day)
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  )
}

/**
 * Sanitize and validate a record, returning a valid record or null
 */
export function sanitizeAndValidate(record: Partial<MetricRecord>): MetricRecord | null {
  // Attempt to create a complete record with defaults
  const sanitized: MetricRecord = {
    user_id: record.user_id || '',
    source_id: record.source_id || '',
    metric_type: record.metric_type || '',
    metric_value: record.metric_value ?? 0,
    date: record.date || new Date().toISOString().split('T')[0],
  }

  // Validate the sanitized record
  const result = validateMetricRecord(sanitized)
  
  if (result.isValid) {
    return sanitized
  }

  // Log validation errors
  console.error('Validation failed for record:', {
    record: sanitized,
    errors: result.errors,
  })

  return null
}

/**
 * Filter out invalid records and log warnings
 */
export function filterValidRecords(records: MetricRecord[]): MetricRecord[] {
  const validation = validateMetricRecords(records)

  if (validation.invalidRecords.length > 0) {
    console.warn(
      `Filtered out ${validation.invalidRecords.length} invalid records out of ${validation.summary.total}`
    )
    
    // Log first few invalid records for debugging
    validation.invalidRecords.slice(0, 5).forEach(({ record, errors }) => {
      console.warn('Invalid record:', record, 'Errors:', errors)
    })
  }

  return validation.validRecords
}
